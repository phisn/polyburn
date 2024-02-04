use bevy::prelude::*;

use super::Rocket;
use crate::ecs::level::LevelCapturedEvent;

pub fn update_rocket_spawn(
    mut level_capture_reader: EventReader<LevelCapturedEvent>,
    mut rocket_query: Query<(&mut Rocket, &Transform)>,
) {
    for _ in level_capture_reader.read() {
        let (mut rocket, rocket_transform) = rocket_query.single_mut();
        rocket.spawn_point = rocket_transform.translation.truncate();
    }
}
