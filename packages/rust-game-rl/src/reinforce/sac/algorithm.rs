use std::f32::consts::LOG2_E;

use bevy::core_pipeline::core_2d::graph::input;
use burn::{
    backend::{wgpu::AutoGraphicsApi, Autodiff, Wgpu},
    config::Config,
    module::{AutodiffModule, Module},
    nn::{Linear, LinearConfig, ReLU},
    optim::{AdamConfig, GradientsParams, Optimizer},
    tensor::{
        activation::{softplus, tanh},
        backend::{AutodiffBackend, Backend},
        Distribution, DistributionSampler, DistributionSamplerKind, Tensor,
    },
};
use rand::rngs::ThreadRng;

use crate::{
    abstraction::{Environment, Experience}, sac::actor_critic::{ActorCritic, ActorCriticConfig}
};

use super::{
    actor_critic::{ActionValueFunction, Actor},
    replay_buffer::{ReplayBuffer},
    SacConfig,
};

impl SacConfig {
    pub fn init<B: AutodiffBackend>(
        self,
        device: &B::Device,
        env: &dyn Environment,
    ) -> SacAlgorithm<B, impl Optimizer<ActionValueFunction<B>, B>, impl Optimizer<Actor<B>, B>>
    {
        let observation_dim = env.observation_dim();
        let action_dim = env.action_dim();

        let actor_critic_config = ActorCriticConfig::new(observation_dim, action_dim, 1.0, 512);

        let actor_critic = actor_critic_config.init::<B>(device);
        let actor_critic_target = actor_critic_config.init::<B>(device).no_grad();

        let pi_optimizer = self.adam_config.init();
        let q_optimizer = self.adam_config.init();

        let replay_buffer: ReplayBuffer<B> = ReplayBuffer::new(self.replay_size);

        SacAlgorithm {
            config: self,
            observation_dim,
            action_dim,
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
    config: SacConfig,

    observation_dim: usize,
    action_dim: usize,

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
    pub fn train(&mut self, device: &B::Device, env: &dyn Environment) {
        for _ in 0..(self.config.steps_per_epoch * self.config.epochs) {
            //            self.step(device, env,);
        }
    }

    fn step(&mut self, device: &B::Device, env: &dyn Environment) {
        let (observation, _) = env.observe();
        let observation_tensor = Tensor::from_floats(observation.as_slice(), device);

        let action_tensor = self.sample_action(observation_tensor, device);
        let action = action_tensor.into_data().convert().value;

        let reward = env.step(&action);
        let (next_observation, done) = env.observe();

        let experience = Experience {
            observation,
            action,
            reward,
            next_observation,
            done: done as i32 as f32,
        };

        self.replay_buffer.store(experience);

        self.t += 1;
        self.episode_length += 1;
        self.episode_reward += reward;

        if done || self.episode_length > self.config.max_ep_len {
            self.episode_length = 0;
            self.episode_reward = 0.0;

            env.reset();
        }

        if self.t >= self.config.update_after && self.t % self.config.update_every == 0 {
            for _ in 0..self.config.update_every {}
        }
    }

    fn sample_action(
        &mut self,
        observation_tensor: Tensor<B, 1>,
        device: &B::Device,
    ) -> Tensor<B, 1> {
        let action = if self.t > self.config.start_steps {
            self.actor_critic.act(observation_tensor, true)
        } else {
            Tensor::random(
                [self.action_dim],
                burn::tensor::Distribution::Uniform(-1.0, 1.0),
                device,
            )
        };
        action
    }
}
