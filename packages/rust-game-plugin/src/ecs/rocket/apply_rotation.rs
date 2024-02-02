use bevy::prelude::*;
use bevy_rapier2d::prelude::*;

use super::Rocket;
use crate::FrameInput;

pub fn apply_rotation(
    input: Res<FrameInput>,
    mut rocket_query: Query<(&mut Rocket, &CollidingEntities, &mut Transform)>,
    sensor_query: Query<(), With<Sensor>>,
) {
    let (mut rocket, colliding_entities, mut rocket_transform) = rocket_query.single_mut();

    let contains_non_sensor_collider = colliding_entities
        .iter()
        .any(|entity| !sensor_query.contains(entity));

    if contains_non_sensor_collider {
        rocket.reset_rotation(&rocket_transform, input.rotation);
    } else {
        rocket_transform.rotation = Quat::from_rotation_z(input.rotation + rocket.input_offset);
    }
}
