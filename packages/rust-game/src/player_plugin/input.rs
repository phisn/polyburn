use std::slice::Windows;

use crate::particle_plugin::{ParticleSpawnEvent, ParticleSpawnType};
use bevy::{
    ecs::schedule::SystemConfigs,
    input::mouse::MouseMotion,
    prelude::*,
    window::{CursorGrabMode, PrimaryWindow},
};
use rust_game_plugin::FrameInput;

mod input_tracker;
mod keyboard_input;
mod mouse_input;
mod touch_input;

pub use input_tracker::*;

use super::device_info::DeviceInfo;

#[derive(Component)]
pub struct RocketParticleSystem;

pub fn fixed_update() -> SystemConfigs {
    (
        reset_frame_input,
        keyboard_input::keyboard_input,
        mouse_input::mouse_input,
        touch_input::touch_input,
        input_consumer,
    )
        .chain()
        .into_configs()
}

fn reset_frame_input(mut frame_input: ResMut<FrameInput>) {
    *frame_input = FrameInput::default();
}

fn input_consumer(
    mut frame_input: ResMut<FrameInput>,
    mut input_tracker: ResMut<InputTracker>,
    mut writer_frame_input: EventWriter<FrameInput>,
    mut writer_particle_spawn: EventWriter<ParticleSpawnEvent>,
    query_rocket_particle_system: Query<Entity, With<RocketParticleSystem>>,
) {
    let rocket_particle_system = query_rocket_particle_system.single();

    if frame_input.thrust {
        writer_particle_spawn.send(ParticleSpawnEvent {
            system_entity: rocket_particle_system,
            spawn_type: ParticleSpawnType::Infinite,
        });
    } else {
        writer_particle_spawn.send(ParticleSpawnEvent {
            system_entity: rocket_particle_system,
            spawn_type: ParticleSpawnType::Stop,
        });
    }

    writer_frame_input.send(*frame_input);
    input_tracker.push(*frame_input);
}
