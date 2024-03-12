use bevy::{
    ecs::schedule::SystemConfigs,
    prelude::*,
    render::camera::{ScalingMode, Viewport},
    window::WindowResized,
};
use rust_game_plugin::{
    ecs::{
        level::{Level, LevelCapturedEvent},
        rocket::Rocket,
    },
    MapTemplate,
};

mod view;
mod zoom;

#[derive(Resource)]
pub struct CameraConfig {
    pub zoom: f32,
    pub animation_speed: f32,
}

impl Default for CameraConfig {
    fn default() -> Self {
        Self {
            zoom: 0.05,
            animation_speed: 1.0,
        }
    }
}

#[derive(Component, Default)]
struct CustomCamera {
    animation: Option<CustomCameraAnimation>,

    level_constraint_size: Vec2,
    level_constraint_translation: Vec2,

    physical_size: Vec2,

    size: Vec2,
    size_after_constraint: Vec2,
}

#[derive(Default)]
struct CustomCameraAnimation {
    target_viewport: Viewport,
    source_viewport: Viewport,

    target_translation: Vec2,
    source_translation: Vec2,

    progress: f32,
}

pub fn update() -> SystemConfigs {
    (view::update()).chain().into_configs()
}

pub fn startup() -> SystemConfigs {
    (spawn_camera, view::startup()).chain().into_configs()
}

fn spawn_camera(mut commands: Commands) {
    commands.spawn((
        Camera2dBundle {
            projection: OrthographicProjection {
                far: 1000.,
                near: -1000.,
                scale: 1.0,
                ..Default::default()
            },
            camera: Camera {
                clear_color: ClearColorConfig::Custom(Color::rgb(0.0, 0.0, 0.0)),
                ..Default::default()
            },
            ..default()
        },
        CustomCamera::default(),
    ));
}
