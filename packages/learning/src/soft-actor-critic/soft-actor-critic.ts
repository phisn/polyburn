import * as tf from "@tensorflow/tfjs"
import { Environment } from "../ppo/ppo"
import { actor } from "./actor"
import { critic } from "./critic"
import { MlpSpecification } from "./mlp"
import { Experience, ExperienceTensor, ReplayBuffer } from "./replay-buffer"

export interface Config {
    mlpSpec: MlpSpecification

    actionSize: number
    observationSize: number

    maxEpisodeLength: number
    bufferSize: number
    batchSize: number
    updateAfter: number
    updateEvery: number

    learningRate: number
    alpha: number
    gamma: number
    polyak: number
}

/*
class ReplayBuffer:
    """
    A simple FIFO experience replay buffer for SAC agents.
    """

    def __init__(self, obs_dim, act_dim, size):
        self.obs_buf = np.zeros(core.combined_shape(size, obs_dim), dtype=np.float32)
        self.obs2_buf = np.zeros(core.combined_shape(size, obs_dim), dtype=np.float32)
        self.act_buf = np.zeros(core.combined_shape(size, act_dim), dtype=np.float32)
        self.rew_buf = np.zeros(size, dtype=np.float32)
        self.done_buf = np.zeros(size, dtype=np.float32)
        self.ptr, self.size, self.max_size = 0, 0, size

    def store(self, obs, act, rew, next_obs, done):
        self.obs_buf[self.ptr] = obs
        self.obs2_buf[self.ptr] = next_obs
        self.act_buf[self.ptr] = act
        self.rew_buf[self.ptr] = rew
        self.done_buf[self.ptr] = done
        self.ptr = (self.ptr+1) % self.max_size
        self.size = min(self.size+1, self.max_size)

    def sample_batch(self, batch_size=32):
        idxs = np.random.randint(0, self.size, size=batch_size)
        batch = dict(obs=self.obs_buf[idxs],
                     obs2=self.obs2_buf[idxs],
                     act=self.act_buf[idxs],
                     rew=self.rew_buf[idxs],
                     done=self.done_buf[idxs])
        
        batches.append(
            dict(
                observation=self.obs_buf[idxs],
                nextObservation=self.obs2_buf[idxs],
                action=self.act_buf[idxs],
                reward=self.rew_buf[idxs],
                done=self.done_buf[idxs]
            )
        )

        return {k: torch.as_tensor(v, dtype=torch.float32) for k,v in batch.items()}
*/

export interface LearningProgress {
    episodeReturn: number
    episodeLength: number

    maxEpisodeReturn: number
    maxEpisodeLength: number

    lossQ: number
    lossPolicy: number
}

export interface SacLearningConfig {
    startAfter: number
    renderEvery: number

    onStart?: () => void
    onStep?: () => void
    onUpdate?: () => void
    onEnd?: () => void
    onEpisodeEnd?: () => void
}

export class SoftActorCritic {
    private replayBuffer: ReplayBuffer

    private policy: tf.LayersModel
    private policyOptimizer: tf.Optimizer

    private q1: tf.LayersModel
    private q2: tf.LayersModel
    private targetQ1: tf.LayersModel
    private targetQ2: tf.LayersModel
    private qOptimizer: tf.Optimizer

    private episodeReturn: number
    private episodeLength: number

    private t: number

    constructor(private config: Config) {
        this.replayBuffer = new ReplayBuffer(config.bufferSize, config.batchSize)

        this.policy = actor(config.observationSize, config.actionSize, config.mlpSpec)
        this.q1 = critic(config.observationSize, config.actionSize, config.mlpSpec)
        this.q2 = critic(config.observationSize, config.actionSize, config.mlpSpec)

        this.targetQ1 = critic(config.observationSize, config.actionSize, config.mlpSpec)
        this.targetQ2 = critic(config.observationSize, config.actionSize, config.mlpSpec)

        this.episodeReturn = 0
        this.episodeLength = 0
        this.t = 0

        this.policyOptimizer = tf.train.adam(config.learningRate)
        this.qOptimizer = tf.train.adam(config.learningRate)
    }

    async learn(env: Environment, sacConfig: SacLearningConfig) {
        const buffer = new ReplayBuffer(this.config.bufferSize, this.config.batchSize)

        let observation = env.reset()
        let episodeLength = 0
        let episodeReturn = 0

        let maxEpisodeReturn = 0
        let maxEpisodeLength = 0

        for (let t = 0; ; ++t) {
            let action: number[]

            if (t > startFrom) {
                action = this.act(observation, false)
            } else {
                action = [Math.random() * 2 - 1]
            }

            const [nextObservation, reward, done] = env.step(action)
            episodeLength += 1

            buffer.store({
                observation,
                action,
                reward,
                nextObservation,
                done: episodeLength === this.config.maxEpisodeLength ? false : done,
            })

            observation = nextObservation

            if (done || episodeLength === this.config.maxEpisodeLength) {
                observation = env.reset()
                episodeLength = 0
            }

            if (t >= this.config.updateAfter && t % this.config.updateEvery === 0) {
                for (let i = 0; i < this.config.updateEvery; i++) {
                    const batch = buffer.sample()
                    this.update(batch, false)

                    tf.dispose(batch.observation)
                    tf.dispose(batch.action)
                    tf.dispose(batch.reward)
                    tf.dispose(batch.nextObservation)
                    tf.dispose(batch.done)
                }
            }

            if (renderEvery > 0 && t % renderEvery === 0) {
                await tf.nextFrame()
            }
        }
    }

    act(observation: number[], deterministic: boolean) {
        return tf.tidy(() => {
            const [action] = this.policy.apply(tf.tensor2d([observation]), {
                deterministic,
            }) as tf.Tensor<tf.Rank.R2>[]

            return action.squeeze([1]).arraySync() as number[]
        })
    }

    observe(experience: Experience) {
        this.episodeReturn += experience.reward
        this.episodeLength += 1
        this.t += 1

        const done = this.episodeLength < this.config.maxEpisodeLength && experience.done

        this.replayBuffer.store({
            ...experience,
        })

        if (done || this.episodeLength === this.config.maxEpisodeLength) {
            this.episodeReturn = 0
            this.episodeLength = 0
        }

        if (this.t > this.config.updateAfter && this.t % this.config.updateEvery === 0) {
            for (let i = 0; i < this.config.updateEvery; i++) {
                tf.tidy(() => {
                    this.update(this.replayBuffer.sample(), i === this.config.updateEvery - 1)
                })
            }

            return true
        }

        return false
    }

    predictQ1(observation: tf.Tensor2D, action: tf.Tensor2D) {
        return tf.squeeze(
            this.q1.apply(tf.concat([observation, action], 1)) as tf.Tensor<tf.Rank.R2>,
            [-1],
        ) as tf.Tensor<tf.Rank.R1>
    }

    predictQ2(observation: tf.Tensor2D, action: tf.Tensor2D) {
        return tf.squeeze(
            this.q2.apply(tf.concat([observation, action], 1)) as tf.Tensor<tf.Rank.R2>,
            [-1],
        ) as tf.Tensor<tf.Rank.R1>
    }

    private deterministic = false

    update(batch: ExperienceTensor, last: boolean = false) {
        const lossQ = () => {
            const q1 = this.predictQ1(batch.observation, batch.action)
            const q2 = this.predictQ2(batch.observation, batch.action)

            const backup = tf.tensor1d(this.computeBackup(batch).arraySync())

            const errorQ1 = tf.mean(tf.square(tf.sub(q1, backup))) as tf.Scalar
            const errorQ2 = tf.mean(tf.square(tf.sub(q2, backup))) as tf.Scalar

            return tf.add(errorQ1, errorQ2) as tf.Scalar
        }

        const gradsQ = tf.variableGrads(lossQ, this.q1.getWeights().concat(this.q2.getWeights()))
        this.qOptimizer.applyGradients(gradsQ.grads)
        tf.dispose(gradsQ)

        const lossPolicy = () => {
            const [pi, logpPi] = this.policy.apply(batch.observation, {
                deterministic: this.deterministic,
            }) as tf.Tensor<tf.Rank.R2>[]

            const piQ1 = this.predictQ1(batch.observation, pi)
            const piQ2 = this.predictQ2(batch.observation, pi)

            const minPiQ = tf.minimum(piQ1, piQ2)

            return tf.mean(logpPi.mul(this.config.alpha).sub(minPiQ)) as tf.Scalar
        }

        const gradsPolicy = tf.variableGrads(lossPolicy, this.policy.getWeights())
        this.policyOptimizer.applyGradients(gradsPolicy.grads)
        tf.dispose(gradsPolicy)

        // do polyak averaging
        const tau = tf.scalar(this.config.polyak)
        const oneMinusTau = tf.scalar(1).sub(tau)

        const updateTargetQ1 = this.targetQ1
            .getWeights()
            .map((w, i) => w.mul(tau).add(this.q1.getWeights()[i].mul(oneMinusTau)))

        const updateTargetQ2 = this.targetQ2
            .getWeights()
            .map((w, i) => w.mul(tau).add(this.q2.getWeights()[i].mul(oneMinusTau)))

        this.targetQ1.setWeights(updateTargetQ1)
        this.targetQ2.setWeights(updateTargetQ2)
    }

    private computeBackup(batch: ExperienceTensor) {
        const [action, logpPi] = this.policy.apply(batch.nextObservation, {
            deterministic: this.deterministic,
        }) as tf.Tensor<tf.Rank.R2>[]

        const targetQ1 = tf.squeeze(
            this.targetQ1.apply(tf.concat([batch.nextObservation, action], 1)),
            [-1],
        ) as tf.Tensor<tf.Rank.R1>

        const targetQ2 = tf.squeeze(
            this.targetQ2.apply(tf.concat([batch.nextObservation, action], 1)),
            [-1],
        ) as tf.Tensor<tf.Rank.R1>

        const minTargetQ = tf.minimum(targetQ1, targetQ2)
        const softQTarget = tf.sub(minTargetQ, tf.mul(this.config.alpha, logpPi))

        const backup = tf.add(
            batch.reward,
            tf.mul(this.config.gamma, tf.mul(tf.scalar(1).sub(batch.done), softQTarget)),
        ) as tf.Tensor<tf.Rank.R1>

        return backup
    }
}
