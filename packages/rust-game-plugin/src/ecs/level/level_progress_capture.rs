use bevy::prelude::*;

use super::*;
use crate::{constants::ROCKET_MAX_VELOCITY_CAPTURE, ecs::rocket::Rocket};

#[derive(Event)]
pub struct LevelCapturedEvent {
    pub level: Entity,
}

pub fn level_progress_capture(
    mut commands: Commands,
    rocket_query: Query<&Velocity, With<Rocket>>,
    collider_query: Query<(), With<CaptureCollider>>,
    mut level_query: Query<(Entity, &mut LevelCaptureProgress, &Children)>,
    mut level_captured_writer: EventWriter<LevelCapturedEvent>,
) {
    for (level_entity, mut level_in_capture, children) in level_query.iter_mut() {
        let velocity: &Velocity = rocket_query.single();

        level_in_capture.progress -= 1;

        let velocity_in_bounds = velocity.linvel.x.abs() < ROCKET_MAX_VELOCITY_CAPTURE
            && velocity.linvel.y.abs() < ROCKET_MAX_VELOCITY_CAPTURE
            && velocity.angvel.abs() < ROCKET_MAX_VELOCITY_CAPTURE;

        if (level_in_capture.progress % 10) == 0 {
            println!(
                "Progressing level capture ... {}",
                level_in_capture.progress
            );
        }

        if level_in_capture.progress <= 0 && velocity_in_bounds {
            let capture_collider = children
                .iter()
                .find(|child| collider_query.contains(**child))
                .unwrap();

            commands
                .entity(*capture_collider)
                .remove::<CaptureCollider>();

            commands
                .entity(level_entity)
                .insert(LevelCaptured)
                .remove::<LevelCaptureProgress>();

            level_captured_writer.send(LevelCapturedEvent {
                level: level_entity,
            });

            println!("Level captured!");
        }
    }
}
