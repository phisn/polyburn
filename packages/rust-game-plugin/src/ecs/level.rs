use bevy::{ecs::schedule::SystemConfigs, prelude::*};
use bevy_rapier2d::prelude::*;

use crate::{constants::*, LevelTemplate, MapTemplate};

mod collider_capture_detector;
mod level_progress_capture;
mod level_toggle_capture;

pub use collider_capture_detector::CaptureState;
pub use collider_capture_detector::LevelCaptureStateEvent;
pub use level_progress_capture::LevelCapturedEvent;

#[derive(Component)]
pub struct Level {
    pub camera: Rect,
    pub hide_flag: bool,
}

#[derive(Component)]
pub struct LevelCaptureProgress {
    pub progress: i32,
}

#[derive(Component)]
pub struct LevelCaptured;

#[derive(Component)]
pub struct CaptureCollider;

#[derive(Bundle)]
pub struct LevelBundle {
    level: Level,
    transform: TransformBundle,
}

impl LevelBundle {
    pub fn new(template: &LevelTemplate, hide_flag: bool) -> Self {
        LevelBundle {
            level: Level {
                camera: template.camera,
                hide_flag,
            },
            transform: TransformBundle::from(Transform {
                translation: template.position.extend(0.0),
                rotation: Quat::from_rotation_z(template.rotation),
                ..Default::default()
            }),
        }
    }
}

#[derive(Bundle)]
pub struct CaptureColliderBundle {
    capture_collider: CaptureCollider,
    collider: Collider,
    transform: TransformBundle,
    sensor: Sensor,
}

impl CaptureColliderBundle {
    pub fn new(level: &LevelTemplate) -> Self {
        CaptureColliderBundle {
            capture_collider: CaptureCollider,
            collider: Collider::cuboid(
                level.capture_area_left + level.capture_area_right,
                LEVEL_CAPTURE_HEIGHT,
            ),
            transform: TransformBundle::from(Transform::from_translation(Vec3::new(
                0.0,
                LEVEL_CAPTURE_HEIGHT - ENTITY_LEVEL_ENTRY.height,
                0.0,
            ))),
            sensor: Sensor,
        }
    }
}

pub fn systems() -> SystemConfigs {
    (
        level_progress_capture::level_progress_capture,
        collider_capture_detector::collider_capture_detector(),
        level_toggle_capture::level_toggle_capture,
    )
        .chain()
        .into_configs()
}

pub fn startup(mut commands: Commands, map: Res<MapTemplate>) {
    for (level_index, level) in map.levels.iter().enumerate() {
        if level_index == map.initial_level_index {
            commands
                .spawn(LevelBundle::new(level, true))
                .insert(LevelCaptured);

            continue;
        }

        commands
            .spawn(LevelBundle::new(level, false))
            .with_children(|parent| {
                parent.spawn(CaptureColliderBundle::new(level));
            });
    }
}
