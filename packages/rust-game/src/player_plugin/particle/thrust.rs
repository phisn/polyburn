use bevy::{ecs::schedule::SystemConfigs, prelude::*};
use bevy_rapier2d::dynamics::Velocity;
use rand::{distributions::uniform::SampleRange, prelude::*};
use rust_game_plugin::{constants::ENTITY_ROCKET_ENTRY, ecs::rocket::Rocket, FrameInput};
use std::{f32::consts, ops::Range};

use super::{
    gradient::{Gradient, GradientEntry},
    particle_spawner::{spawn_particle, ParticleTemplate},
    ParticleSpawnEvent,
};

pub fn update() -> SystemConfigs {
    (spawn_thrust_particles).chain().into_configs()
}

pub const TEMPLATE: ParticleTemplate = ParticleTemplate {
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

#[derive(Default)]
struct State {
    pub timer: f32,
}

fn spawn_thrust_particles(
    mut state: Local<State>,
    time: Res<Time>,
    input: Res<FrameInput>,
    mut writer: EventWriter<ParticleSpawnEvent>,
    rocket_query: Query<(&Transform, &Velocity), With<Rocket>>,
) {
    const FREQUENCY: f32 = 1.0 / (60.0 * 30.0);

    if input.thrust {
        state.timer += time.delta_seconds();

        if state.timer >= FREQUENCY {
            let amount = (state.timer / FREQUENCY) as i32;

            let (transform, velocity) = rocket_query.single();

            let position = transform.translation
                + transform.rotation * Vec3::new(0.0, -0.2 * ENTITY_ROCKET_ENTRY.height, 0.0);
            let position = position.truncate();

            let particles = spawn_particle(
                amount,
                position,
                transform.rotation.z,
                velocity.linvel,
                &TEMPLATE,
            );
            writer.send_batch(particles);

            state.timer -= FREQUENCY * amount as f32;
        }
    } else {
        state.timer = 0.0;
    }
}
