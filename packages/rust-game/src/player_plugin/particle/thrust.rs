use bevy::{ecs::schedule::SystemConfigs, prelude::*};
use rand::{distributions::uniform::SampleRange, prelude::*};
use rust_game_plugin::{ecs::rocket::Rocket, FrameInput};
use std::{f32::consts, ops::Range};

use super::{
    gradient::{Gradient, GradientEntry},
    particle_spawner::{spawn_particle, ParticleTemplate},
    ParticleSpawnEvent,
};

pub fn update() -> SystemConfigs {
    (spawn_thrust_particles).chain().into_configs()
}

const TEMPLATE: ParticleTemplate = ParticleTemplate {
    amount: 3,
    velocity: 15.0..15.0,
    size: 0.3..0.7,
    angle: (-consts::PI / 16.0)..consts::PI / 16.0,
    lifetime: 360.0..630.0,
    gradient: &Gradient::new(&[
        GradientEntry {
            time: 0.0,
            color: Color::rgb(1.0, 0.726, 0.0),
        },
        GradientEntry {
            time: 0.2,
            color: Color::rgb(1.0, 0.618, 0.318),
        },
        GradientEntry {
            time: 0.4,
            color: Color::rgb(1.0, 0.0, 0.0),
        },
        GradientEntry {
            time: 0.65,
            color: Color::rgb(0.65, 0.65, 0.65),
        },
        GradientEntry {
            time: 1.0,
            color: Color::rgb(0.311, 0.311, 0.311),
        },
    ]),
};

fn spawn_thrust_particles(
    mut input_reader: EventReader<FrameInput>,
    mut writer: EventWriter<ParticleSpawnEvent>,
    rocket_query: Query<&Transform, With<Rocket>>,
) {
    for input in input_reader.read() {
        if input.thrust {
            let particles = spawn_particle(rocket_query.single(), &TEMPLATE);
            writer.send_batch(particles);
        }
    }
}
