use bevy::prelude::*;

use super::collider_capture_detector::*;
use crate::{constants::LEVEL_TICKS_TO_CAPTURE, ecs::level::LevelCaptureProgress};

pub fn level_toggle_capture(
    mut commands: Commands,
    mut level_capture_state_reader: EventReader<LevelCaptureStateEvent>,
) {
    for event in level_capture_state_reader.read() {
        match event.state {
            CaptureState::Started => {
                commands.entity(event.level).insert(LevelCaptureProgress {
                    progress: LEVEL_TICKS_TO_CAPTURE,
                });

                println!("Level capture started! ... {:?}", LEVEL_TICKS_TO_CAPTURE);
            }
            CaptureState::Stopped => {
                commands
                    .entity(event.level)
                    .remove::<LevelCaptureProgress>();

                println!("Level capture stopped!");
            }
        }
    }
}
