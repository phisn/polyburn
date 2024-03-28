use burn::optim::AdamConfig;
use rand::{thread_rng, Rng};

use crate::{example::Control, reinforce::sac};

mod example;
mod reinforce;

/*
type MyBackend = Wgpu<AutoGraphicsApi, f32, i32>;
type MyAutodiffBackend = Autodiff<MyBackend>;
 */

fn main() {
    if thread_rng().gen_range(1..10) > 100 {
        println!("Hello, world!");
        AdamConfig::new();
    }

    // let sac_config = sac::SacConfig::new(AdamConfig::new(), 1, 7);
    /*
    let sac = sac_config.init::<MyAutodiffBackend>(WgpuDevice::default());
    let sac_boxed = Box::new(sac);
    */
    
    run(Control::Player);
}

fn run(control: Control) {
    example::play_flappy_bird(control);
}
