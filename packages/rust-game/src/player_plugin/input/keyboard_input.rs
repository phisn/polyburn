use bevy::prelude::*;
use rust_game_plugin::FrameInput;

#[derive(Default)]
pub struct KeyboardState {
    total_rotation: f32,
}

pub fn keyboard_input(
    mut frame_input: ResMut<FrameInput>,
    mut state: Local<KeyboardState>,
    keyboard: Res<ButtonInput<KeyCode>>,
    time: Res<Time>,
) {
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

    frame_input.rotation += state.total_rotation;
    frame_input.thrust = frame_input.thrust
        || keyboard.pressed(KeyCode::ArrowUp)
        || keyboard.pressed(KeyCode::KeyW)
        || keyboard.pressed(KeyCode::Space);
}
