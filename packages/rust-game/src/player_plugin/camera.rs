use bevy::{ecs::schedule::SystemConfigs, prelude::*};
use rust_game_plugin::{ecs::rocket::Rocket, MapTemplate};

#[derive(Component)]
pub struct Camera;

pub fn update() -> SystemConfigs {
    (camera_movement).chain().into_configs()
}

pub fn startup() -> SystemConfigs {
    (spawn_camera).chain().into_configs()
}

fn camera_movement(
    rocket_query: Query<&Transform, With<Rocket>>,
    mut camera_query: Query<&mut Transform, (With<Camera>, Without<Rocket>)>,
) {
    let rocket_transform = rocket_query.single();
    let mut camera_transform = camera_query.single_mut();

    camera_transform.translation = Vec3::new(
        rocket_transform.translation.x,
        rocket_transform.translation.y,
        1.0,
    );
}

fn spawn_camera(mut commands: Commands, map: ResMut<MapTemplate>) {
    commands
        .spawn(Camera2dBundle {
            projection: OrthographicProjection {
                far: 1000.,
                near: -1000.,
                scale: 0.040,
                ..Default::default()
            },
            transform: Transform::from_xyz(map.rocket.position.x, map.rocket.position.y, 1.0),
            ..Default::default()
        })
        .insert(Camera);
}
