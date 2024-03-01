use bevy::{ecs::schedule::SystemConfigs, prelude::*};
use rust_game_plugin::FrameInput;

mod input_state;
mod input_tracker;

pub use input_state::*;
pub use input_tracker::*;

use crate::particle_plugin::{ParticleSpawnEvent, ParticleSpawnType};

pub fn fixed_update() -> SystemConfigs {
    (input_generator).chain().into_configs()
}

#[derive(Component)]
pub struct RocketParticleSystem;

fn input_generator(
    mut state: Local<InputState>,
    mut event_writer: EventWriter<FrameInput>,
    mut input_tracker: ResMut<InputTracker>,
    time: Res<Time>,
    keyboard: Res<Input<KeyCode>>,
    mut rocket_particle_system_query: Query<Entity, With<RocketParticleSystem>>,
    mut particle_spawn_writer: EventWriter<ParticleSpawnEvent>,
) {
    match *state {
        InputState::Keyboard { mut rotation } => {
            if keyboard.pressed(KeyCode::Left) {
                rotation += 1.0 * time.delta_seconds();
            }

            if keyboard.pressed(KeyCode::Right) {
                rotation -= 1.0 * time.delta_seconds();
            }

            *state = InputState::Keyboard { rotation };

            let input = FrameInput {
                rotation,
                thrust: keyboard.pressed(KeyCode::Up),
            };

            let rocket_particle_system = rocket_particle_system_query.single();

            if input.thrust {
                particle_spawn_writer.send(ParticleSpawnEvent {
                    system_entity: rocket_particle_system,
                    spawn_type: ParticleSpawnType::Infinite,
                });
            } else {
                particle_spawn_writer.send(ParticleSpawnEvent {
                    system_entity: rocket_particle_system,
                    spawn_type: ParticleSpawnType::Stop,
                });
            }

            event_writer.send(input);
            input_tracker.push(input);
        }
    }
}
