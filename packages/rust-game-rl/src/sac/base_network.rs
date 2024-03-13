use std::f32::consts::LOG2_E;

use bevy::core_pipeline::core_2d::graph::input;
use burn::{
    backend::{wgpu::AutoGraphicsApi, Autodiff, Wgpu},
    config::Config,
    module::Module,
    nn::{Linear, LinearConfig, ReLU},
    tensor::{
        activation::{softplus, tanh},
        backend::Backend,
        Distribution, DistributionSampler, DistributionSamplerKind, Tensor,
    },
};
use rand::rngs::ThreadRng;

#[derive(Module, Debug)]
pub struct BaseNetwork<B: Backend> {
    linear1: Linear<B>,
    linear2: Linear<B>,
    activation: ReLU,
    activation_at_output: bool,
}

impl<B: Backend> BaseNetwork<B> {
    pub fn forward(&self, x: Tensor<B, 2>) -> Tensor<B, 2> {
        let x = self.linear1.forward(x);
        let x = self.activation.forward(x);
        let x = self.linear2.forward(x);

        if self.activation_at_output {
            return x;
        } else {
            self.activation.forward(x)
        }
    }
}

#[derive(Config, Debug)]
pub struct BaseNetworkConfig {
    input_size: usize,
    hidden_size: usize,
    activation_at_output: bool,
}

impl BaseNetworkConfig {
    pub fn init<B: Backend>(&self, device: &B::Device) -> BaseNetwork<B> {
        let linear_config: LinearConfig = LinearConfig::new(self.hidden_size, self.hidden_size);

        BaseNetwork {
            linear1: LinearConfig::new(self.input_size, self.hidden_size).init(device),
            linear2: linear_config.init(device),
            activation: ReLU::new(),
            activation_at_output: self.activation_at_output,
        }
    }
}
