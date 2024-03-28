use std::f32::consts::PI;

use burn::tensor::{backend::Backend, Distribution, Tensor};

// Returns an action sampled from the distribution, and the logprob of this action being chosen
// for the provided mean (mu) and learnable stdev parameter
pub fn sample<B: Backend>(mu: Tensor<B, 2>, stdev: Tensor<B, 2>) -> (Tensor<B, 2>, Tensor<B, 2>) {
    // Use Box Muller transform to get gaussian distribution from pairs of uniformly distributed random numbers
    // This is to get a multivariate gauss distribution using tensors of means and stddevs
    // Otherwise, we would need to create N Distribution::Normal(mu,std) for each element

    let uniform1 = Distribution::Uniform(1e-8, 1.0);
    let uniform2 = Distribution::Uniform(0.0, 1.0);

    let r1 = Tensor::random(mu.shape(), uniform1, &mu.device()).detach();
    let r2 = Tensor::random(mu.shape(), uniform2, &mu.device())
        .mul_scalar(PI * 2.0)
        .detach();

    let mag = stdev.clone().mul(r1.log().mul_scalar(-2.0)).sqrt();
    let sample = (mag * r2.cos()) + mu.clone().detach();

    let logprob = logprob(sample.clone(), mu, stdev);

    (sample, logprob)
}

fn logprob<B: Backend>(a: Tensor<B, 2>, mu: Tensor<B, 2>, std: Tensor<B, 2>) -> Tensor<B, 2> {
    let std2 = std.powf_scalar(2.0);

    let l = (a - mu).powf_scalar(2.0).div(std2.clone() + 1e-6);
    let r = (std2.mul_scalar(2.0 * PI)).log();

    (l + r).mul_scalar(-0.5)
}
