use bevy::{ecs::schedule::SystemConfigs, prelude::*};
use rust_game_plugin::FrameInput;

mod input_state;
mod input_tracker;

pub use input_state::*;
pub use input_tracker::*;

pub fn fixed_update() -> SystemConfigs {
    (input_generator).chain().into_configs()
}

fn input_generator(
    mut state: Local<InputState>,
    mut event_writer: EventWriter<FrameInput>,
    mut input_tracker: ResMut<InputTracker>,
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

            let input = FrameInput {
                rotation,
                thrust: keyboard.pressed(KeyCode::Up),
            };

            event_writer.send(input);
            input_tracker.push(input);
        }
    }
}
