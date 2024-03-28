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

use crate::player_plugin::camera::{TransitionAnimation, CAMERA_SCALE_MAX, CAMERA_SCALE_MIN};

use super::{CameraAnimation, CameraConfig, CameraStartAnimation, CustomCamera, StartAnimation};

pub fn update() -> SystemConfigs {
    (
        track_level_capture,
        track_rocket,
        track_window_size,
        animate,
        // progress_start_animation,
    )
        .chain()
}

pub fn startup() -> SystemConfigs {
    (prepare_inital_view).into_configs()
}

fn animate(
    mut camera_config: ResMut<CameraConfig>,
    mut camera_query: Query<
        (
            &mut Transform,
            &mut CustomCamera,
            &mut Camera,
            &mut OrthographicProjection,
        ),
        Without<Rocket>,
    >,
    query_rocket: Query<&Transform, With<Rocket>>,
    time: Res<Time>,
) {
    fn ease_out_fast(x: f32) -> f32 {
        1.0 - (1.0 - x).powi(5)
    }

    fn ease_out_slow(x: f32) -> f32 {
        1.0 - (1.0 - x).powi(3)
    }

    fn lerp_uvec2_with_ease(a: UVec2, b: UVec2, t: f32) -> UVec2 {
        let t = ease_out_fast(t);
        UVec2::new(
            (a.x as f32 + (b.x as f32 - a.x as f32) * t).round() as u32,
            (a.y as f32 + (b.y as f32 - a.y as f32) * t).round() as u32,
        )
    }

    let (mut camera_transform, mut custom_camera, mut camera, mut projection) =
        camera_query.single_mut();

    match custom_camera.animation {
        CameraAnimation::Transition(ref mut camera_animation) => {
            let source_translation = camera_animation.source_translation;
            let target_translation = camera_animation.target_translation;

            camera_animation.progress += time.delta_seconds() * camera_config.animation_speed;
            camera_animation.progress = camera_animation.progress.min(1.0);

            let camera_animation_progress_bounded = camera_animation.progress.max(0.0);

            camera_transform.translation = source_translation
                .lerp(
                    target_translation,
                    ease_out_fast(camera_animation_progress_bounded),
                )
                .extend(15.0);

            let source_viewport = &camera_animation.source_viewport;
            let target_viewport = &camera_animation.target_viewport;

            camera.viewport = Some(Viewport {
                physical_size: lerp_uvec2_with_ease(
                    source_viewport.physical_size,
                    target_viewport.physical_size,
                    camera_animation_progress_bounded,
                ),
                physical_position: lerp_uvec2_with_ease(
                    source_viewport.physical_position,
                    target_viewport.physical_position,
                    camera_animation_progress_bounded,
                ),
                depth: 0.0..1.0,
            });

            if camera_animation_progress_bounded >= 1.0 {
                custom_camera.animation = CameraAnimation::None;
            }
        }
        CameraAnimation::Start(ref mut camera_animation) => {
            camera_animation.progress += time.delta_seconds() * camera_config.animation_speed;
            camera_animation.progress = camera_animation.progress.min(1.0);

            let camera_animation_progress_bounded = camera_animation.progress.max(0.0);

            projection.scale = f32::lerp(
                camera_animation.start_scale,
                camera_animation.target_scale,
                ease_out_slow(camera_animation_progress_bounded),
            );

            if camera_animation_progress_bounded >= 1.0 {
                custom_camera.animation = CameraAnimation::None;
            }
        }
        CameraAnimation::Zoom(ref mut zoom_animation) => {
            zoom_animation.progress += time.delta_seconds() * camera_config.animation_speed;
            zoom_animation.progress = zoom_animation.progress.min(1.0);

            camera_config.zoom = f32::lerp(
                zoom_animation.source_zoom,
                zoom_animation.target_zoom,
                ease_out_slow(zoom_animation.progress),
            );

            if zoom_animation.progress >= 1.0 {
                custom_camera.animation = CameraAnimation::None;
            }

            custom_camera.size = custom_camera.physical_size * camera_config.zoom;
            let rocket_transform = query_rocket.single();

            update_camera_size(&mut camera, &mut custom_camera, &mut projection);
            update_camera_transform(
                &mut custom_camera,
                &mut camera_transform,
                rocket_transform.translation.truncate(),
            );
        }
        _ => {}
    }
}

fn track_window_size(
    mut window_resized_events: EventReader<WindowResized>,
    camera_config: Res<CameraConfig>,
    window_query: Query<&Window>,
    mut query_camera: Query<
        (
            &mut Camera,
            &mut CustomCamera,
            &mut Transform,
            &mut OrthographicProjection,
        ),
        Without<Rocket>,
    >,
    query_rocket: Query<&Transform, With<Rocket>>,
) {
    let Some(_) = window_resized_events.read().last() else {
        return;
    };

    let (mut camera, mut custom_camera, mut transform, mut projection) = query_camera.single_mut();

    let window = window_query.single();

    let physical_camera_size = Vec2::new(
        window.resolution.physical_width() as f32,
        window.resolution.physical_height() as f32,
    );

    custom_camera.physical_size = physical_camera_size;

    let camera_size = physical_camera_size * camera_config.zoom;
    custom_camera.size = camera_size;

    let rocket_transform = query_rocket.single();

    update_camera_size(&mut camera, &mut custom_camera, &mut projection);
    update_camera_transform(
        &mut custom_camera,
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

    camera.animation = CameraAnimation::Transition(TransitionAnimation {
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
    let (mut camera_transform, mut camera, native_camera) = camera_query.single_mut();

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

    let window_size = Vec2::new(
        window.resolution.physical_width() as f32,
        window.resolution.physical_height() as f32,
    );

    custom_camera.level_constraint_size = inital_level.camera.size();
    custom_camera.level_constraint_translation = inital_level.camera.min;
    custom_camera.physical_size = window_size;
    custom_camera.size = window_size * camera_config.zoom;

    update_camera_size(&mut native_camera, &mut custom_camera, &mut projection);
    update_camera_transform(&mut custom_camera, &mut transform, rocket_position);

    custom_camera.animation = CameraAnimation::Start(StartAnimation {
        progress: -0.2,

        start_scale: CAMERA_SCALE_MIN,
        target_scale: CAMERA_SCALE_MAX,
    });
}

fn update_camera_size(
    camera: &mut Camera,
    custom_camera: &mut CustomCamera,
    camera_projection: &mut OrthographicProjection,
) {
    custom_camera.size_after_constraint =
        custom_camera.size.min(custom_camera.level_constraint_size);

    let view_port_size = Vec2::new(
        custom_camera.size_after_constraint.x / custom_camera.size.x,
        custom_camera.size_after_constraint.y / custom_camera.size.y,
    );

    let view_port_size = Vec2::new(
        view_port_size.x / view_port_size.max_element(),
        view_port_size.y / view_port_size.max_element(),
    );

    camera_projection.scaling_mode = ScalingMode::Fixed {
        width: custom_camera.size_after_constraint.x,
        height: custom_camera.size_after_constraint.y,
    };

    let viewport = Viewport {
        physical_size: Vec2::new(
            (custom_camera.physical_size.x * view_port_size.x).round(),
            (custom_camera.physical_size.y * view_port_size.y).round(),
        )
        .as_uvec2(),
        physical_position: Vec2::new(
            (0.5 * custom_camera.physical_size.x * (1.0 - view_port_size.x)).round(),
            (0.5 * custom_camera.physical_size.y * (1.0 - view_port_size.y)).round(),
        )
        .as_uvec2(),
        depth: 0.0..1.0,
    };

    match custom_camera.animation {
        CameraAnimation::Transition(ref mut animation) => {
            animation.source_viewport = camera.viewport.clone().unwrap_or(viewport.clone());
            animation.target_viewport = viewport;
        }
        _ => {
            camera.viewport = Some(viewport);
        }
    }
}

fn update_camera_transform(
    custom_camera: &mut CustomCamera,
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

    let rocket_translation_in_view =
        rocket_translation - custom_camera.level_constraint_translation;

    let camera_translation = custom_camera.level_constraint_translation.extend(0.0)
        + Vec3::new(
            constrain_translation_axis(
                custom_camera.size_after_constraint.x,
                custom_camera.level_constraint_size.x,
                rocket_translation_in_view.x,
            ),
            constrain_translation_axis(
                custom_camera.size_after_constraint.y,
                custom_camera.level_constraint_size.y,
                rocket_translation_in_view.y,
            ),
            15.0,
        );

    match custom_camera.animation {
        CameraAnimation::Transition(ref mut animation) => {
            animation.target_translation = camera_translation.truncate();
        }
        _ => {
            camera_transform.translation = camera_translation;
        }
    }
}
