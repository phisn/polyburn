use std::f32::consts::LOG2_E;

use bevy::core_pipeline::core_2d::graph::input;
use burn::{
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

use self::{
    actor_critic::{ActionValueFunction, Actor},
    algorithm::SacAlgorithm,
    replay_buffer::ReplayBuffer,
};

mod actor_critic;
mod algorithm;
mod base_network;
mod normal;
mod replay_buffer;

#[derive(Config)]
pub struct SacConfig {
    adam_config: AdamConfig,
    seed: Option<u64>,

    action_dim: usize,
    observation_dim: usize,

    #[config(default = 4000)]
    steps_per_epoch: usize,
    #[config(default = 100)]
    epochs: usize,
    #[config(default = 1_000_000)]
    replay_size: usize,
    #[config(default = 0.99)]
    gamma: f32,
    #[config(default = 0.995)]
    polyak: f32,
    #[config(default = 0.001)]
    lr: f32,
    #[config(default = 0.2)]
    alpha: f32,
    #[config(default = 100)]
    batch_size: usize,
    #[config(default = 100)]
    start_steps: usize,
    #[config(default = 1000)]
    update_after: usize,
    #[config(default = 50)]
    update_every: usize,
    #[config(default = 1000)]
    max_ep_len: usize,
}

