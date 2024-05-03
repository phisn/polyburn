import * as tf from "@tensorflow/tfjs"
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
        this.replayBuffer = new ReplayBuffer(
            config.bufferSize,
            config.batchSize,
            config.observationSize,
            config.actionSize,
        )

        this.policy = actor(config.observationSize, config.actionSize, config.mlpSpec)
        this.q1 = critic(config.observationSize, config.actionSize, config.mlpSpec)
        this.q2 = critic(config.observationSize, config.actionSize, config.mlpSpec)

        this.targetQ1 = critic(config.observationSize, config.actionSize, config.mlpSpec)
        this.targetQ2 = critic(config.observationSize, config.actionSize, config.mlpSpec)

        this.episodeReturn = 0
        this.episodeLength = 0
        this.t = 0

        this.observationBuffer = tf.buffer([1, config.observationSize], "float32")

        this.policyOptimizer = tf.train.adam(config.learningRate)
        this.qOptimizer = tf.train.adam(config.learningRate)

        for (let i = 0; i < this.targetQ1.trainableWeights.length; i++) {
            const targetWeight = this.targetQ1.trainableWeights[i]
            const weight = this.q1.trainableWeights[i]

            targetWeight.write(weight.read())
        }

        for (let i = 0; i < this.targetQ2.trainableWeights.length; i++) {
            const targetWeight = this.targetQ2.trainableWeights[i]
            const weight = this.q2.trainableWeights[i]

            targetWeight.write(weight.read())
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

        this.replayBuffer.push({
            ...experience,
            done,
        })

        if (done || this.episodeLength === this.config.maxEpisodeLength) {
            this.episodeReturn = 0
            this.episodeLength = 0
        }

        if (this.t > this.config.updateAfter && this.t % this.config.updateEvery === 0) {
            console.log("update")
            for (let i = 0; i < this.config.updateEvery; i++) {
                tf.tidy(() => {
                    this.update(this.replayBuffer.sample())
                })
            }
        }
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

    test() {
        this.deterministic = true

        this.q1.weights.forEach(w => w.write(tf.ones(w.shape).mul(0.2)))
        this.q2.weights.forEach(w => w.write(tf.ones(w.shape).mul(0.2)))
        this.policy.weights.forEach(w => w.write(tf.ones(w.shape).mul(0.2)))
        this.targetQ1.weights.forEach(w => w.write(tf.ones(w.shape).mul(0.2)))
        this.targetQ2.weights.forEach(w => w.write(tf.ones(w.shape).mul(0.2)))

        let seedi = 9

        function randomNumber(seed: number, min: number, max: number) {
            const a = 1103515245
            const c = 721847

            seed = (a * seed + c) % 2 ** 31
            return min + (seed % (max - min))
        }

        /*
        seedi = 9

        for i in range(10):
            seedi += 4
            observation = torch.tensor([[
                randomNumber(seedi, -10, 10), 
                randomNumber(seedi + 1, -10, 10), 
                randomNumber(seedi + 2, -10, 10), 
                randomNumber(seedi + 3, -10, 10)]
            ])

            print("R", i, ": ", ac.pi(observation, True))
        */

        /*
        seedi = 9

        for (let i = 0; i < 10; i++) {
            seedi += 4
            const observation = tf.tensor2d([
                [
                    randomNumber(seedi, -10, 10),
                    randomNumber(seedi + 1, -10, 10),
                    randomNumber(seedi + 2, -10, 10),
                    randomNumber(seedi + 3, -10, 10),
                ],
            ])

            console.log(observation.dataSync())
            const [a, b] = this.policy.apply(observation, {
                deterministic: true,
            })
            console.log("R", i, ": ", a.dataSync(), b.dataSync())
        }
        */
        function randomData() {
            /*
            def randomNumber(seed, min, max):
                a = 1103515245
                c = 721847

                seed = (a * seed + c) % 2**31
                return (float) (min + (seed % (max - min)))

            seedi = 9

            def randomData():
                global seedi
                
                seedi += 5
                data = {
                    'obs': torch.tensor([[randomNumber(seedi, -10, 10), randomNumber(2, -10, 10), randomNumber(3, -10, 10), randomNumber(4, -10, 10)]]),
                    'act': torch.tensor([[randomNumber(seedi + 1, -1, 1)]]),
                    'rew': torch.tensor([[randomNumber(seedi + 2, -100, 100)]]),
                    'obs2': torch.tensor([[randomNumber(seedi + 3, -10, 10), randomNumber(8, -10, 10), randomNumber(9, -10, 10), randomNumber(10, -10, 10)]]),
                    'done': torch.tensor([[randomNumber(seedi + 4, 0, 1)]])
                }

                return data
            */

            seedi += 5

            return {
                observation: tf.tensor2d([
                    [
                        randomNumber(seedi, -10, 10),
                        randomNumber(2, -10, 10),
                        randomNumber(3, -10, 10),
                        randomNumber(4, -10, 10),
                    ],
                ]),
                action: tf.tensor2d([[randomNumber(seedi + 1, -1, 1)]]),
                reward: tf.tensor1d([randomNumber(seedi + 2, -100, 100)]),
                nextObservation: tf.tensor2d([
                    [
                        randomNumber(seedi + 3, -10, 10),
                        randomNumber(8, -10, 10),
                        randomNumber(9, -10, 10),
                        randomNumber(10, -10, 10),
                    ],
                ]),
                done: tf.tensor1d([randomNumber(seedi + 4, 0, 1)]),
            }
        }

        let data = randomData()
        for (let i = 0; i < 1000; i++) {
            console.log("Action: ", this.act(data.observation.arraySync()[0], true)[0])
            this.update(data)
            data = randomData()
        }

        this.q1.trainableWeights.forEach(w => {
            console.log(w.read().dataSync())
        })

        console.log("Verify: ", randomNumber(seedi, 0, 1000))
    }

    private deterministic = false

    private update(batch: ExperienceTensor) {
        tf.tidy(() => {
            const lossQ = () => {
                const q1 = this.predictQ1(batch.observation, batch.action)
                const q2 = this.predictQ2(batch.observation, batch.action)

                const backup = tf.tensor1d(this.computeBackup(batch).arraySync())

                const errorQ1 = tf.mean(tf.square(tf.sub(q1, backup))) as tf.Scalar
                const errorQ2 = tf.mean(tf.square(tf.sub(q2, backup))) as tf.Scalar

                return tf.add(errorQ1, errorQ2) as tf.Scalar
            }

            console.log("lossQ: ", lossQ().arraySync())

            const gradsQ = tf.variableGrads(lossQ)
            this.qOptimizer.applyGradients(gradsQ.grads)

            const lossPolicy = () => {
                const [pi, logpPi] = this.policy.apply(batch.observation, {
                    deterministic: this.deterministic,
                }) as tf.Tensor<tf.Rank.R2>[]

                const piQ1 = this.predictQ1(batch.observation, pi)
                const piQ2 = this.predictQ2(batch.observation, pi)

                const minPiQ = tf.minimum(piQ1, piQ2)

                return tf.mean(logpPi.mul(this.config.alpha).sub(minPiQ)) as tf.Scalar
            }

            console.log("lossPolicy: ", lossPolicy().arraySync())

            const gradsPolicy = tf.variableGrads(lossPolicy, this.policy.getWeights())
            this.policyOptimizer.applyGradients(gradsPolicy.grads)

            for (let i = 0; i < this.targetQ1.trainableWeights.length; i++) {
                const targetWeight = this.targetQ1.trainableWeights[i]
                const weight = this.q1.trainableWeights[i]

                targetWeight.write(
                    tf.add(
                        tf.mul(this.config.polyak, targetWeight.read()),
                        tf.mul(1 - this.config.polyak, weight.read()),
                    ),
                )
            }

            for (let i = 0; i < this.targetQ2.trainableWeights.length; i++) {
                const targetWeight = this.targetQ2.trainableWeights[i]
                const weight = this.q2.trainableWeights[i]

                targetWeight.write(
                    tf.add(
                        tf.mul(this.config.polyak, targetWeight.read()),
                        tf.mul(1 - this.config.polyak, weight.read()),
                    ),
                )
            }
        })
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
