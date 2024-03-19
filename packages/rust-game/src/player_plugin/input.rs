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

pub use input_tracker::*;

use super::device_info::DeviceInfo;

pub fn fixed_update() -> SystemConfigs {
    (input_generator).chain().into_configs()
}

#[derive(Component)]
pub struct RocketParticleSystem;

#[derive(Default)]
pub struct InputState {
    total_rotation: f32,
    mouse: Option<MouseState>,
}

#[derive(Default)]
struct MouseState {
    holding_from: Vec2,
    holding_from_rotation: f32,
}

fn input_generator(
    mut state: Local<InputState>,
    mut writer_event: EventWriter<FrameInput>,
    mut writer_particle_spawn: EventWriter<ParticleSpawnEvent>,
    mut input_tracker: ResMut<InputTracker>,
    time: Res<Time>,
    device_info: Res<DeviceInfo>,
    keyboard: Res<ButtonInput<KeyCode>>,
    mouse: Res<ButtonInput<MouseButton>>,
    query_rocket_particle_system: Query<Entity, With<RocketParticleSystem>>,
    mut query_windows: Query<&mut Window, With<PrimaryWindow>>,
    mut reader_mousemotion: EventReader<MouseMotion>,
) {
    let mut window = query_windows.single_mut();

    if let Some(cursor_position) = window.cursor_position() {
        if let Some(mouse_state) = &state.mouse {
            if mouse.pressed(MouseButton::Left) {
                for motion in reader_mousemotion.read() {
                    state.total_rotation -= (motion.delta.x / 4.0) * time.delta_seconds();
                }
            } else {
                state.mouse = None;

                if !device_info.is_safari {
                    window.cursor.grab_mode = CursorGrabMode::None;

                    window.cursor.visible = true;
                }
            }
        } else {
            if mouse.pressed(MouseButton::Left) {
                state.mouse = Some(MouseState {
                    holding_from: cursor_position,
                    holding_from_rotation: state.total_rotation,
                });

                if !device_info.is_safari {
                    window.cursor.grab_mode = CursorGrabMode::Locked;

                    window.cursor.visible = false;
                }
            }
        }
    }

    if keyboard.pressed(KeyCode::ArrowLeft) {
        state.total_rotation += 1.0 * time.delta_seconds();
    }

    if keyboard.pressed(KeyCode::ArrowRight) {
        state.total_rotation -= 1.0 * time.delta_seconds();
    }

    if keyboard.pressed(KeyCode::KeyA) {
        state.total_rotation += 1.0 * time.delta_seconds();
    }

    if keyboard.pressed(KeyCode::KeyD) {
        state.total_rotation -= 1.0 * time.delta_seconds();
    }

    let input = FrameInput {
        rotation: state.total_rotation,
        thrust: keyboard.pressed(KeyCode::ArrowUp)
            || keyboard.pressed(KeyCode::KeyW)
            || keyboard.pressed(KeyCode::Space),
    };

    let rocket_particle_system = query_rocket_particle_system.single();

    if input.thrust {
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

    writer_event.send(input);
    input_tracker.push(input);
}
