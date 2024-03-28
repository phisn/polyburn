use std::f32::consts::LOG2_E;

use bevy::core_pipeline::core_2d::graph::input;
use burn::{
    config::Config,
    module::{AutodiffModule, Module},
    nn::{loss, Linear, LinearConfig, ReLU},
    optim::{AdamConfig, GradientsParams, Optimizer},
    tensor::{
        activation::{softplus, tanh},
        backend::{AutodiffBackend, Backend},
        Distribution, DistributionSampler, DistributionSamplerKind, Tensor,
    },
};
use rand::rngs::ThreadRng;

use crate::reinforce::{Agent, AgentTrainer, AgentWithTrainer};

use super::{
    actor_critic::{ActionValueFunction, Actor, ActorCritic, ActorCriticConfig},
    replay_buffer::{ExperienceBatch, ReplayBuffer},
    SacConfig,
};

impl SacConfig {
    pub fn init<B: AutodiffBackend>(
        self,
        device: B::Device,
    ) -> SacAlgorithm<B, impl Optimizer<ActionValueFunction<B>, B>, impl Optimizer<Actor<B>, B>>
    {
        let actor_critic_config =
            ActorCriticConfig::new(self.observation_dim, self.action_dim, 1.0, 512);

        let actor_critic = actor_critic_config.init::<B>(&device);
        let actor_critic_target = actor_critic_config.init::<B>(&device).no_grad();

        let pi_optimizer = self.adam_config.init();
        let q_optimizer = self.adam_config.init();

        let replay_buffer: ReplayBuffer<B> = ReplayBuffer::new(self.replay_size);

        SacAlgorithm {
            device: device.clone(),
            config: self,
            actor_critic,
            actor_critic_target,
            replay_buffer,
            pi_optimizer,
            q_optimizer,
            t: 0,
            episode_length: 0,
            episode_reward: 0.0,
        }
    }
}

pub struct SacAlgorithm<B: AutodiffBackend, OptPi, OptQ>
where
    OptPi: Optimizer<ActionValueFunction<B>, B>,
    OptQ: Optimizer<Actor<B>, B>,
{
    device: B::Device,
    config: SacConfig,

    actor_critic: ActorCritic<B>,
    actor_critic_target: ActorCritic<B>,

    replay_buffer: ReplayBuffer<B>,

    pi_optimizer: OptPi,
    q_optimizer: OptQ,

    t: usize,

    episode_length: usize,
    episode_reward: f32,
}

impl<B: AutodiffBackend, OptPi, OptQ> SacAlgorithm<B, OptPi, OptQ>
where
    OptPi: Optimizer<ActionValueFunction<B>, B>,
    OptQ: Optimizer<Actor<B>, B>,
{
    fn update(&mut self, batch: &ExperienceBatch<B>) {
        let loss_q = self.compute_loss_q(batch);
        panic!("Loss Q: {:?}", loss_q);
    }

    fn compute_loss_q(&self, batch: &ExperienceBatch<B>) -> Tensor<B, 1> {
        let backup = self.backup(batch);

        let q1 = self
            .actor_critic
            .critic1
            .forward(batch.observation.clone(), batch.action.clone());
        let q2 = self
            .actor_critic
            .critic2
            .forward(batch.observation.clone(), batch.action.clone());

        let loss_q1 = q1.sub(backup.clone()).powf_scalar(2.0).mean();
        let loss_q2 = q2.sub(backup).powf_scalar(2.0).mean();

        loss_q1 + loss_q2
    }

    fn backup(&self, batch: &ExperienceBatch<B>) -> Tensor<B, 1> {
        let (a2, Some(logp_a2)) =
            self.actor_critic
                .actor
                .forward(batch.next_observation.clone(), false, true)
        else {
            panic!("logp_a2 is None")
        };

        let q1_pi_targ = self
            .actor_critic_target
            .critic1
            .forward(batch.next_observation.clone(), a2.clone());
        let q2_pi_targ = self
            .actor_critic_target
            .critic2
            .forward(batch.next_observation.clone(), a2.clone());

        let q_pi_targ = Tensor::stack(vec![q1_pi_targ, q2_pi_targ], 1).min_dim(1);

        let backup_f1 = batch.done.clone().mul_scalar(-1.0).add_scalar(1.0);
        let backup_f2 = q_pi_targ.sub(logp_a2.mul_scalar(self.config.alpha));

        batch.reward.clone() - backup_f1.mul(backup_f2).mul_scalar(self.config.gamma)
    }
}

impl<B: AutodiffBackend, OptPi, OptQ> Agent for SacAlgorithm<B, OptPi, OptQ>
where
    OptPi: Optimizer<ActionValueFunction<B>, B>,
    OptQ: Optimizer<Actor<B>, B>,
{
    fn act(&self, observation: &Vec<f32>) -> Vec<f32> {
        let observation_tensor = Tensor::from_floats(observation.as_slice(), &self.device);

        let action_tensor = if self.t > self.config.start_steps {
            self.actor_critic.act(observation_tensor, true)
        } else {
            Tensor::random(
                [self.config.action_dim],
                burn::tensor::Distribution::Uniform(-1.0, 1.0),
                &self.device,
            )
        };

        action_tensor.into_data().convert().value
    }
}

impl<B: AutodiffBackend, OptPi, OptQ> AgentTrainer for SacAlgorithm<B, OptPi, OptQ>
where
    OptPi: Optimizer<ActionValueFunction<B>, B>,
    OptQ: Optimizer<Actor<B>, B>,
{
    fn observe(&mut self, experience: crate::reinforce::Experience) {
        self.t += 1;
        self.episode_length += 1;
        self.episode_reward += experience.reward;

        if experience.done > 0.0 || self.episode_length > self.config.max_ep_len {
            self.episode_length = 0;
            self.episode_reward = 0.0;
        }

        self.replay_buffer.store(experience);

        if self.t >= self.config.update_after && self.t % self.config.update_every == 0 {
            for _ in 0..self.config.update_every {
                self.update(
                    &self
                        .replay_buffer
                        .sample_batch(self.config.batch_size, &self.device),
                );
            }
        }
    }
}


impl<B: AutodiffBackend, OptPi, OptQ> AgentWithTrainer for SacAlgorithm<B, OptPi, OptQ>
where
    OptPi: Optimizer<ActionValueFunction<B>, B>,
    OptQ: Optimizer<Actor<B>, B>,
{
}