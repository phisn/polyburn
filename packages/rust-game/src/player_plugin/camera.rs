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

fn camera_size_from_zoom(zoom: f32, physical_size: Vec2) -> Vec2 {
    let max = physical_size.x.max(physical_size.y);

    Vec2 {
        x: zoom * physical_size.x / max,
        y: zoom * physical_size.y / max,
    }
}

#[derive(Resource)]
pub struct CameraConfig {
    pub zoom: f32,
    pub animation_speed: f32,
}

impl Default for CameraConfig {
    fn default() -> Self {
        Self {
            zoom: 1920.0 * 0.02,
            animation_speed: 1.0,
        }
    }
}

#[derive(Component, Default)]
struct CustomCamera {
    animation: CameraAnimation,

    level_constraint_size: Vec2,
    level_constraint_translation: Vec2,

    physical_size: Vec2,

    size: Vec2,
    size_after_constraint: Vec2,
}

#[derive(Default)]
struct StartAnimation {
    progress: f32,

    start_scale: f32,
    target_scale: f32,
}

#[derive(Default)]
enum CameraAnimation {
    #[default]
    None,
    Start(StartAnimation),
    Transition(TransitionAnimation),
    Zoom(ZoomAnimation),
}

#[derive(Default)]
struct TransitionAnimation {
    target_viewport: Viewport,
    source_viewport: Viewport,

    target_translation: Vec2,
    source_translation: Vec2,

    progress: f32,
}

#[derive(Default)]
struct ZoomAnimation {
    source_zoom: f32,
    target_zoom: f32,

    progress: f32,
}

pub fn update() -> SystemConfigs {
    (view::update(), zoom::update()).chain().into_configs()
}

pub fn startup() -> SystemConfigs {
    (spawn_camera, view::startup(), zoom::startup())
        .chain()
        .into_configs()
}

#[derive(Component, Default)]
struct CameraStartAnimation {
    pub progress: f32,
}

const CAMERA_SCALE_MIN: f32 = 0.00001;
const CAMERA_SCALE_MAX: f32 = 1.0;

fn spawn_camera(mut commands: Commands) {
    commands.spawn((
        Camera2dBundle {
            projection: OrthographicProjection {
                far: 1000.,
                near: -1000.,
                scale: CAMERA_SCALE_MIN,
                ..default()
            },
            camera: Camera {
                clear_color: ClearColorConfig::Custom(Color::rgb(0.0, 0.0, 0.0)),
                ..default()
            },
            ..default()
        },
        CustomCamera::default(),
    ));
}
