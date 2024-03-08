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

#[derive(Component, Default)]
pub struct CustomCamera {
    pub level_constraint_size: Vec2,
    pub level_constraint_translation: Vec2,

    pub physical_size: Vec2,

    pub size: Vec2,
    pub size_after_constraint: Vec2,
}

#[derive(Resource)]
pub struct CameraConfig {
    pub zoom: f32,
}

impl Default for CameraConfig {
    fn default() -> Self {
        Self { zoom: 10.0 }
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

    camera.level_constraint_size = level.camera.size();
    camera.level_constraint_translation = level.camera.min;

    update_camera_size(&mut native_camera, &mut camera, &mut projection);
    update_camera_transform(&camera, &mut transform, &rocket_transform);
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
    update_camera_transform(&camera, &mut transform, &rocket_transform);
}

fn update_camera_size(
    native_camera: &mut Camera,
    camera: &mut CustomCamera,
    camera_projection: &mut OrthographicProjection,
) {
    let constraint_comparison = (
        camera.size.x.total_cmp(&camera.level_constraint_size.x),
        camera.size.y.total_cmp(&camera.level_constraint_size.y),
    );

    let camera_size_after_constraint: Vec2 = match constraint_comparison {
        (Ordering::Less, Ordering::Less) => camera.size,
        (Ordering::Less, _) => Vec2::new(camera.size.x, camera.level_constraint_size.y),
        (_, Ordering::Less) => Vec2::new(camera.level_constraint_size.x, camera.size.y),
        (_, _) => camera.level_constraint_size,
    };

    camera.size_after_constraint = camera_size_after_constraint;

    let view_port_size = {
        let factor_x = camera.size.x / camera.level_constraint_size.x;
        let factor_y = camera.size.y / camera.level_constraint_size.y;

        if factor_x > factor_y {
            Vec2::new(
                camera.level_constraint_size.x * factor_y / camera.size.x,
                1.0,
            )
        } else {
            Vec2::new(
                1.0,
                camera.level_constraint_size.y * factor_x / camera.size.y,
            )
        }
    };

    camera_projection.scaling_mode = ScalingMode::Fixed {
        width: camera_size_after_constraint.x,
        height: camera_size_after_constraint.y,
    };

    native_camera.viewport = Some(Viewport {
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
    });
}

fn update_camera_transform(
    camera: &CustomCamera,
    camera_transform: &mut Transform,
    rocket_transform: &Transform,
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
        rocket_transform.translation.truncate() - camera.level_constraint_translation;

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

    camera_transform.translation = camera_translation;
}

fn camera_movement(
    rocket_query: Query<&Transform, With<Rocket>>,
    mut camera_query: Query<(&mut Transform, &CustomCamera), Without<Rocket>>,
) {
    let rocket_transform = rocket_query.single();
    let (mut camera_transform, camera) = camera_query.single_mut();

    update_camera_transform(&camera, &mut camera_transform, &rocket_transform);
}

fn spawn_camera(mut commands: Commands, map: ResMut<MapTemplate>) {
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

    commands
        .spawn(Camera2dBundle {
            projection: OrthographicProjection {
                far: 1000.,
                near: -1000.,
                scale: 1.0,
                ..Default::default()
            },
            camera: Camera {
                clear_color: ClearColorConfig::Custom(Color::rgb(0.0, 0.0, 0.0)),
                order: -10,
                ..Default::default()
            },
            transform: Transform::from_xyz(map.rocket.position.x, map.rocket.position.y, 1.0),
            ..Default::default()
        })
        .insert(CustomCamera {
            level_constraint_size: start.camera.size(),
            level_constraint_translation: start.camera.min,
            ..default()
        });
}
