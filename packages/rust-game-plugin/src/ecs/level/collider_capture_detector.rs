use bevy::prelude::*;
use bevy_rapier2d::prelude::*;

use super::*;
use crate::{constants::LEVEL_TICKS_TO_CAPTURE, ecs::rocket::Rocket};

pub enum CaptureState {
    Stopped,
    Started,
}

#[derive(Event)]
pub struct LevelCaptureStateEvent {
    pub level: Entity,
    pub state: CaptureState,
}

#[derive(Component)]
struct InCapture;

#[derive(Component)]
struct Captured;

pub fn collider_capture_detector() -> SystemConfigs {
    (stop_level_capture, start_level_capture)
        .chain()
        .into_configs()
}

fn stop_level_capture(
    mut commands: Commands,
    mut rocket_query: Query<&CollidingEntities, With<Rocket>>,
    mut collider_query: Query<(Entity, &Parent), (With<CaptureCollider>, With<InCapture>)>,
    mut captured_writer: EventWriter<LevelCaptureStateEvent>,
) {
    let colliding_entities = rocket_query.single_mut();

    for (collider_entity, collider_parent) in collider_query.iter_mut() {
        if !colliding_entities.contains(collider_entity) {
            captured_writer.send(LevelCaptureStateEvent {
                level: collider_parent.get(),
                state: CaptureState::Stopped,
            });

            commands.entity(collider_entity).remove::<InCapture>();
        }
    }
}

fn start_level_capture(
    mut commands: Commands,
    mut rocket_query: Query<&CollidingEntities, With<Rocket>>,
    level_collider_query: Query<(Entity, &Parent), (With<CaptureCollider>, Without<InCapture>)>,
    mut captured_writer: EventWriter<LevelCaptureStateEvent>,
) {
    let colliding_entities = rocket_query.single_mut();

    let levels = colliding_entities
        .iter()
        .map(|entity| level_collider_query.get(entity))
        .flatten();

    for (collider_entity, collider_parent) in levels {
        captured_writer.send(LevelCaptureStateEvent {
            level: collider_parent.get(),
            state: CaptureState::Started,
        });

        commands.entity(collider_entity).insert(InCapture);
    }
}
