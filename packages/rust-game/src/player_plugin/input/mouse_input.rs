use bevy::{
    input::mouse::MouseMotion,
    prelude::*,
    window::{CursorGrabMode, PrimaryWindow},
};
use rust_game_plugin::FrameInput;

use crate::player_plugin::device_info::DeviceInfo;

#[derive(Default)]
pub struct MouseState {
    total_rotation: f32,
}

pub fn mouse_input(
    mut frame_input: ResMut<FrameInput>,
    mut state: Local<MouseState>,
    mut query_window: Query<&mut Window, With<PrimaryWindow>>,
    device_info: Res<DeviceInfo>,
    time: Res<Time>,
    mouse: Res<ButtonInput<MouseButton>>,
    mut reader_mousemotion: EventReader<MouseMotion>,
) {
    let mut window = query_window.single_mut();

    if mouse.just_pressed(MouseButton::Left) {
        if !device_info.is_safari {
            window.cursor.grab_mode = CursorGrabMode::Locked;
            window.cursor.visible = false;
        }
    }

    if mouse.pressed(MouseButton::Left) {
        for motion in reader_mousemotion.read() {
            state.total_rotation -= (motion.delta.x / 4.0) * time.delta_seconds();
        }

        frame_input.rotation += state.total_rotation;
    } else {
        if !device_info.is_safari {
            window.cursor.grab_mode = CursorGrabMode::None;
            window.cursor.visible = true;
        }
    }
}
