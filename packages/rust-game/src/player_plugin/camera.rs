use bevy::prelude::*;
use rust_game_plugin::{ecs::rocket::Rocket, MapTemplate};

#[derive(Component)]
pub struct Camera;

pub fn camera_movement(
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

pub fn startup(mut commands: Commands, map: ResMut<MapTemplate>) {
    commands
        .spawn(Camera2dBundle {
            projection: OrthographicProjection {
                far: 1000.,
                near: -1000.,
                scale: 0.070,
                ..Default::default()
            },
            transform: Transform::from_xyz(map.rocket.position.x, map.rocket.position.y, 1.0),
            ..Default::default()
        })
        .insert(Camera);
}
