use bevy::prelude::*;

use crate::app::game_plugin::replay::FrameInput;

pub enum InputState {
    Keyboard { rotation: f32 },
}

impl Default for InputState {
    fn default() -> Self {
        InputState::Keyboard { rotation: 0.0 }
    }
}

pub fn input_generator(
    mut state: Local<InputState>,
    mut event_writer: EventWriter<FrameInput>,
    time: Res<Time>,
    keyboard: Res<Input<KeyCode>>,
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

            event_writer.send(FrameInput {
                rotation,
                thrust: keyboard.pressed(KeyCode::Up),
            });
        }
    }
}
