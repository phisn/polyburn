use bevy::prelude::*;

use super::*;
use crate::{constants::ROCKET_MAX_VELOCITY_CAPTURE, ecs::rocket::Rocket};

pub fn progress_level_capture(
    mut commands: Commands,
    rocket_query: Query<&Velocity, With<Rocket>>,
    mut level_query: Query<(Entity, &mut LevelInCapture, &Parent)>,
    mut level_captured_events: EventWriter<LevelCapturedEvent>,
) {
    let velocity = rocket_query.single();

    for (level_entity, mut level_in_capture, parent) in level_query.iter_mut() {
        level_in_capture.progress -= 1;

        let velocity_in_bounds = velocity.linvel.x.abs() < ROCKET_MAX_VELOCITY_CAPTURE
            && velocity.linvel.y.abs() < ROCKET_MAX_VELOCITY_CAPTURE
            && velocity.angvel.abs() < ROCKET_MAX_VELOCITY_CAPTURE;

        if level_in_capture.progress <= 0 && velocity_in_bounds {
            commands
                .entity(level_entity)
                .insert(LevelCaptured)
                .remove::<LevelInCapture>();

            level_captured_events.send(LevelCapturedEvent {
                level: parent.get(),
            });

            println!("Level captured!");
        } else {
            println!(
                "Progressing level capture ... {}",
                level_in_capture.progress
            );
        }
    }
}
