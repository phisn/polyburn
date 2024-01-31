use bevy::{ecs::schedule::SystemConfigs, prelude::*};
use bevy_rapier2d::prelude::*;

use crate::{LevelTemplate, MapTemplate};

mod handle_level_capture;
mod progress_level_capture;

#[derive(Component)]
pub struct Level {
    camera: Rect,
    hideFlag: bool,
}

#[derive(Component)]
pub struct LevelInCapture {
    pub progress: i32,
}

#[derive(Component)]
pub struct LevelCaptured;

#[derive(Component)]
pub struct CaptureCollider;

#[derive(Event)]
pub struct LevelCapturedEvent {
    pub level: Entity,
}

#[derive(Bundle)]
pub struct LevelBundle {
    level: Level,
    transform: TransformBundle,
}

impl LevelBundle {
    pub fn new(template: &LevelTemplate) -> Self {
        LevelBundle {
            level: Level {
                camera: template.camera,
                hideFlag: false,
            },
            transform: TransformBundle::from(Transform {
                translation: template.position.extend(0.0),
                rotation: Quat::from_rotation_z(template.rotation),
                ..Default::default()
            }),
        }
    }
}

pub fn systems() -> SystemConfigs {
    (
        progress_level_capture::progress_level_capture,
        handle_level_capture::handle_level_capture(),
    )
        .chain()
        .into_configs()
}

pub fn startup(mut commands: Commands, map: Res<MapTemplate>) {
    for level in map.levels.iter() {
        commands
            .spawn(LevelBundle::new(level))
            .with_children(|parent| {
                parent
                    .spawn(CaptureCollider)
                    .insert(Collider::cuboid(
                        level.capture_area_left + level.capture_area_right,
                        0.5,
                    ))
                    .insert(TransformBundle::from(Transform::from_translation(
                        Vec3::new(0.0, 0.5 + -2.616, 0.0),
                    )))
                    .insert(Sensor);
            });
    }
}
