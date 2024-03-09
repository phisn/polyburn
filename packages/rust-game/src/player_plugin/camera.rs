use std::cmp::Ordering;

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

#[derive(Resource)]
pub struct CameraConfig {
    pub zoom: f32,
    pub animation_speed: f32,
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

impl Default for CameraConfig {
    fn default() -> Self {
        Self {
            zoom: 0.05,
            animation_speed: 1.0,
        }
    }
}

pub fn update() -> SystemConfigs {
    (
        camera_movement,
        camera_track_window_size,
        camera_track_level_event,
    )
        .chain()
        .into_configs()
}

pub fn startup() -> SystemConfigs {
    (spawn_camera).chain().into_configs()
}

fn camera_track_level_event(
    mut level_captured_events: EventReader<LevelCapturedEvent>,
    level_query: Query<&Level>,
    mut camera_query: Query<
        (
            &mut Camera,
            &mut CustomCamera,
            &mut Transform,
            &mut OrthographicProjection,
        ),
        Without<Rocket>,
    >,
    rocket_query: Query<&Transform, With<Rocket>>,
) {
    let Some(level_captured_event) = level_captured_events.read().last() else {
        return;
    };

    let Ok(level) = level_query.get(level_captured_event.level) else {
        error!("Level not found");
        return;
    };

    let (mut native_camera, mut camera, mut transform, mut projection) = camera_query.single_mut();
    let rocket_transform = rocket_query.single();

    camera.animation = Some(CustomCameraAnimation {
        source_translation: transform.translation.truncate(),
        ..default()
    });

    camera.level_constraint_size = level.camera.size();
    camera.level_constraint_translation = level.camera.min;

    update_camera_size(&mut native_camera, &mut camera, &mut projection);
    update_camera_transform(
        &mut camera,
        &mut transform,
        rocket_transform.translation.truncate(),
    );
}

fn camera_track_window_size(
    mut window_resized_events: EventReader<WindowResized>,
    camer_config: Res<CameraConfig>,
    mut camera_query: Query<
        (
            &mut Camera,
            &mut CustomCamera,
            &mut Transform,
            &mut OrthographicProjection,
        ),
        Without<Rocket>,
    >,
    rocket_query: Query<&Transform, With<Rocket>>,
) {
    let Some(resize_event) = window_resized_events.read().last() else {
        return;
    };

    let physical_camera_size = Vec2::new(resize_event.width, resize_event.height);
    let camera_size = physical_camera_size * camer_config.zoom;

    let (mut native_camera, mut camera, mut transform, mut projection) = camera_query.single_mut();
    let rocket_transform = rocket_query.single();

    camera.physical_size = physical_camera_size;
    camera.size = camera_size;

    update_camera_size(&mut native_camera, &mut camera, &mut projection);
    update_camera_transform(
        &mut camera,
        &mut transform,
        rocket_transform.translation.truncate(),
    );
}

fn update_camera_size(
    native_camera: &mut Camera,
    camera: &mut CustomCamera,
    camera_projection: &mut OrthographicProjection,
) {
    camera.size_after_constraint = camera.size.min(camera.level_constraint_size);

    let view_port_size = Vec2::new(
        camera.size_after_constraint.x / camera.size.x,
        camera.size_after_constraint.y / camera.size.y,
    );

    let view_port_size = Vec2::new(
        view_port_size.x / view_port_size.max_element(),
        view_port_size.y / view_port_size.max_element(),
    );

    camera_projection.scaling_mode = ScalingMode::Fixed {
        width: camera.size_after_constraint.x,
        height: camera.size_after_constraint.y,
    };

    let viewport = Viewport {
        physical_size: Vec2::new(
            (2.0 * camera.physical_size.x * view_port_size.x).round(),
            (2.0 * camera.physical_size.y * view_port_size.y).round(),
        )
        .as_uvec2(),
        physical_position: Vec2::new(
            (camera.physical_size.x * (1.0 - view_port_size.x)).round(),
            (camera.physical_size.y * (1.0 - view_port_size.y)).round(),
        )
        .as_uvec2(),
        depth: 0.0..1.0,
    };

    match camera.animation {
        Some(ref mut animation) => {
            animation.source_viewport = native_camera.viewport.clone().unwrap_or(viewport.clone());
            animation.target_viewport = viewport;
        }
        None => {
            native_camera.viewport = Some(viewport);
        }
    }
}

fn update_camera_transform(
    camera: &mut CustomCamera,
    camera_transform: &mut Transform,
    rocket_translation: Vec2,
) {
    fn constrain_translation_axis(
        camera_size: f32,
        constraint_size: f32,
        rocket_translation: f32,
    ) -> f32 {
        if camera_size >= constraint_size {
            constraint_size / 2.0
        } else {
            let camera_size_offset = camera_size / 2.0;
            rocket_translation.clamp(camera_size_offset, constraint_size - camera_size_offset)
        }
    }

    let rocket_translation_in_view = rocket_translation - camera.level_constraint_translation;

    let camera_translation = camera.level_constraint_translation.extend(0.0)
        + Vec3::new(
            constrain_translation_axis(
                camera.size_after_constraint.x,
                camera.level_constraint_size.x,
                rocket_translation_in_view.x,
            ),
            constrain_translation_axis(
                camera.size_after_constraint.y,
                camera.level_constraint_size.y,
                rocket_translation_in_view.y,
            ),
            15.0,
        );

    match camera.animation {
        Some(ref mut animation) => {
            animation.target_translation = camera_translation.truncate();
        }
        None => {
            camera_transform.translation = camera_translation;
        }
    }
}

fn camera_movement(
    camera_config: Res<CameraConfig>,
    rocket_query: Query<&Transform, With<Rocket>>,
    mut camera_query: Query<(&mut Transform, &mut CustomCamera, &mut Camera), Without<Rocket>>,
    time: Res<Time>,
) {
    fn ease_out_quint(x: f32) -> f32 {
        1.0 - (1.0 - x).powi(5)
    }

    fn lerp_uvec2_with_ease(a: UVec2, b: UVec2, t: f32) -> UVec2 {
        let t = ease_out_quint(t);
        UVec2::new(
            (a.x as f32 + (b.x as f32 - a.x as f32) * t).round() as u32,
            (a.y as f32 + (b.y as f32 - a.y as f32) * t).round() as u32,
        )
    }

    let rocket_transform = rocket_query.single();
    let (mut camera_transform, mut camera, mut native_camera) = camera_query.single_mut();

    update_camera_transform(
        &mut camera,
        &mut camera_transform,
        rocket_transform.translation.truncate(),
    );

    if let Some(camera_animation) = &mut camera.animation {
        let source_translation = camera_animation.source_translation;
        let target_translation = camera_animation.target_translation;

        camera_animation.progress += time.delta_seconds() * camera_config.animation_speed;
        camera_animation.progress = camera_animation.progress.min(1.0);

        camera_transform.translation = source_translation
            .lerp(
                target_translation,
                ease_out_quint(camera_animation.progress),
            )
            .extend(15.0);

        let source_viewport = &camera_animation.source_viewport;
        let target_viewport = &camera_animation.target_viewport;

        native_camera.viewport = Some(Viewport {
            physical_size: lerp_uvec2_with_ease(
                source_viewport.physical_size,
                target_viewport.physical_size,
                camera_animation.progress,
            ),
            physical_position: lerp_uvec2_with_ease(
                source_viewport.physical_position,
                target_viewport.physical_position,
                camera_animation.progress,
            ),
            depth: 0.0..1.0,
        });

        if camera_animation.progress >= 1.0 {
            camera.animation = None;
        }
    }
}

fn spawn_camera(
    mut commands: Commands,
    map: ResMut<MapTemplate>,
    camera_config: Res<CameraConfig>,
    window_query: Query<&Window>,
) {
    let rocket_position = Vec2::from(map.rocket.position);

    let Some(start) = map.levels.iter().reduce(|min, level| {
        if level.position.distance(rocket_position) < min.position.distance(rocket_position) {
            level
        } else {
            min
        }
    }) else {
        error!("No levels found");
        return;
    };

    let window = window_query.single();
    let window_size = Vec2::new(window.width(), window.height());

    let mut projection = OrthographicProjection {
        far: 1000.,
        near: -1000.,
        scale: 1.0,
        ..Default::default()
    };

    let mut camera = Camera {
        clear_color: ClearColorConfig::Custom(Color::rgb(0.0, 0.0, 0.0)),
        ..Default::default()
    };

    let mut custom_camera = CustomCamera {
        level_constraint_size: start.camera.size(),
        level_constraint_translation: start.camera.min,
        physical_size: window_size,
        size: window_size * camera_config.zoom,
        ..default()
    };

    let mut transform = Transform::from_xyz(map.rocket.position.x, map.rocket.position.y, 1.0);

    update_camera_size(&mut camera, &mut custom_camera, &mut projection);
    update_camera_transform(&mut custom_camera, &mut transform, rocket_position);

    commands
        .spawn(Camera2dBundle {
            projection,
            camera,
            transform,
            ..Default::default()
        })
        .insert(custom_camera);
}
