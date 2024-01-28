use bevy::prelude::*;

use crate::app::game_plugin::rocket::Rocket;

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
