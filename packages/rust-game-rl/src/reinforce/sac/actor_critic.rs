use std::f32::consts::LOG2_E;

use bevy::core_pipeline::core_2d::graph::input;
use burn::{
    backend::{Autodiff},
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

use super::{
    base_network::{BaseNetwork, BaseNetworkConfig},
    normal,
};

#[derive(Module, Debug)]
pub struct ActorCritic<B: Backend> {
    pub critic1: ActionValueFunction<B>,
    pub critic2: ActionValueFunction<B>,
    pub actor: Actor<B>,
}

impl<B: Backend> ActorCritic<B> {
    pub fn act(&self, observation: Tensor<B, 1>, deterministic: bool) -> Tensor<B, 1> {
        let (pi, _) = self
            .actor
            .forward(observation.unsqueeze(), deterministic, false);

        println!("{:?}", pi.shape());

        pi.squeeze(0)
    }
}

#[derive(Config, Debug)]
pub struct ActorCriticConfig {
    observation_dim: usize,

    action_dim: usize,
    action_limit: f32,

    hidden_size: usize,
}

impl ActorCriticConfig {
    pub fn init<B: Backend>(&self, device: &B::Device) -> ActorCritic<B> {
        let construct_critic = || ActionValueFunction {
            base: BaseNetworkConfig::new(
                self.observation_dim + self.action_dim,
                self.hidden_size,
                false,
            )
            .init(device),
            linear_bundle: LinearConfig::new(self.hidden_size, 1).init(device),
        };

        let actor = Actor {
            base: BaseNetworkConfig::new(self.observation_dim, self.hidden_size, true).init(device),
            mu_layer: LinearConfig::new(self.hidden_size, self.action_dim).init(device),
            log_std_layer: LinearConfig::new(self.hidden_size, self.action_dim).init(device),
            action_limit: self.action_limit,
        };

        ActorCritic {
            critic1: construct_critic(),
            critic2: construct_critic(),
            actor,
        }
    }
}

#[derive(Module, Debug)]
pub struct ActionValueFunction<B: Backend> {
    base: BaseNetwork<B>,
    linear_bundle: Linear<B>,
}

impl<B: Backend> ActionValueFunction<B> {
    pub fn forward(&self, observation: Tensor<B, 2>, action: Tensor<B, 2>) -> Tensor<B, 1> {
        let x = Tensor::cat(vec![observation, action], 1);
        let x = self.base.forward(x);
        let x = self.linear_bundle.forward(x);
        let x = x.squeeze(1);

        x
    }
}

#[derive(Module, Debug)]
pub struct Actor<B: Backend> {
    base: BaseNetwork<B>,
    mu_layer: Linear<B>,
    log_std_layer: Linear<B>,
    action_limit: f32,
}

const LOG_STD_MIN: f32 = -20.0;
const LOG_STD_MAX: f32 = 2.0;

impl<B: Backend> Actor<B> {
    pub fn forward(
        &self,
        observation: Tensor<B, 2>,
        deterministic: bool,
        with_logprob: bool,
    ) -> (Tensor<B, 2>, Option<Tensor<B, 1>>) {
        let x = self.base.forward(observation);
        let mu = self.mu_layer.forward(x.clone());
        let log_std = self.log_std_layer.forward(x.clone());
        let log_std = log_std.clamp(LOG_STD_MIN, LOG_STD_MAX);
        let std = log_std.exp();

        let (mut pi_action, pi_log_prob) = normal::sample(mu.clone(), std);

        if deterministic {
            pi_action = mu;
        }

        let logp_pi = if with_logprob {
            /*
                Compute logprob from Gaussian, and then apply correction for Tanh squashing.
                NOTE: The correction formula is a little bit magic. To get an understanding
                of where it comes from, check out the original SAC paper (arXiv 1801.01290)
                and look in appendix C. This is a more numerically-stable equivalent to Eq 21.
            */

            // logp_pi = pi_distribution.log_prob(pi_action).sum(axis=-1)
            let logp_pi = pi_log_prob.sum_dim(1).squeeze::<1>(1);

            // logp_pi -= (2*(np.log(2) - pi_action - F.softplus(-2*pi_action))).sum(axis=1)
            let minus_term = pi_action.clone() - softplus(pi_action.clone().mul_scalar(-2.0), 1.0);
            let minus_term = minus_term.neg().add_scalar(LOG2_E).mul_scalar(2.0);
            let minus_term = minus_term.sum_dim(1).squeeze::<1>(1);

            let logp_pi = logp_pi.sub(minus_term);

            Some(logp_pi)
        } else {
            None
        };

        let pi_action = tanh(pi_action);
        let pi_action = pi_action.mul_scalar(self.action_limit);

        (pi_action, logp_pi)
    }
}
