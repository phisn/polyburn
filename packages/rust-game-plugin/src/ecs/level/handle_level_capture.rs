use bevy::prelude::*;
use bevy_rapier2d::prelude::*;

use super::*;
use crate::{constants::LEVEL_TICKS_TO_CAPTURE, ecs::rocket::Rocket};

pub fn handle_level_capture() -> SystemConfigs {
    (stop_level_capture, start_level_capture)
        .chain()
        .into_configs()
}

fn stop_level_capture(
    mut commands: Commands,
    mut rocket_query: Query<&CollidingEntities, With<Rocket>>,
    mut level_query: Query<
        Entity,
        (
            With<CaptureCollider>,
            With<LevelInCapture>,
            Without<LevelCaptured>,
        ),
    >,
) {
    let colliding_entities = rocket_query.single_mut();

    for level_entity in level_query.iter_mut() {
        if !colliding_entities.contains(level_entity) {
            commands.entity(level_entity).remove::<LevelInCapture>();
            println!("Stopped capturing level");
        }
    }
}

fn start_level_capture(
    mut commands: Commands,
    mut rocket_query: Query<&CollidingEntities, With<Rocket>>,
    level_query: Query<
        Entity,
        (
            With<CaptureCollider>,
            Without<LevelInCapture>,
            Without<LevelCaptured>,
        ),
    >,
) {
    let colliding_entities = rocket_query.single_mut();

    let levels = colliding_entities
        .iter()
        .map(|entity| level_query.get(entity))
        .flatten();

    for level_entity in levels {
        commands.entity(level_entity).insert(LevelInCapture {
            progress: LEVEL_TICKS_TO_CAPTURE,
        });

        println!("Capturing level ...");
    }
}
