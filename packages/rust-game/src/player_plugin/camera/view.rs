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

use super::{CameraConfig, CustomCamera, CustomCameraAnimation};

pub fn update() -> SystemConfigs {
    (
        track_level_capture,
        track_rocket,
        track_window_size,
        animate,
    )
        .chain()
}

pub fn startup() -> SystemConfigs {
    (prepare_inital_view).into_configs()
}

fn animate(
    camera_config: Res<CameraConfig>,
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

    let (mut camera_transform, mut camera, mut native_camera) = camera_query.single_mut();

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

fn track_window_size(
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

fn track_level_capture(
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

fn track_rocket(
    rocket_query: Query<&Transform, With<Rocket>>,
    mut camera_query: Query<(&mut Transform, &mut CustomCamera, &mut Camera), Without<Rocket>>,
) {
    let rocket_transform = rocket_query.single();
    let (mut camera_transform, mut camera, mut native_camera) = camera_query.single_mut();

    update_camera_transform(
        &mut camera,
        &mut camera_transform,
        rocket_transform.translation.truncate(),
    );
}

fn prepare_inital_view(
    map: ResMut<MapTemplate>,
    camera_config: Res<CameraConfig>,
    window_query: Query<&Window>,
    mut camera_query: Query<(
        &mut Camera,
        &mut CustomCamera,
        &mut Transform,
        &mut OrthographicProjection,
    )>,
) {
    let rocket_position = Vec2::from(map.rocket.position);
    let inital_level = map.levels.get(map.initial_level_index).unwrap();

    let (mut native_camera, mut custom_camera, mut transform, mut projection) =
        camera_query.single_mut();

    let window = window_query.single();
    let window_size = Vec2::new(window.width(), window.height());

    custom_camera.level_constraint_size = inital_level.camera.size();
    custom_camera.level_constraint_translation = inital_level.camera.min;
    custom_camera.physical_size = window_size;
    custom_camera.size = window_size * camera_config.zoom;

    update_camera_size(&mut native_camera, &mut custom_camera, &mut projection);
    update_camera_transform(&mut custom_camera, &mut transform, rocket_position);
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
