use bevy::prelude::*;
use rust_game_plugin::MapTemplate;

use crate::player_plugin::camera::Camera;

pub fn init_system(mut commands: Commands, map: ResMut<MapTemplate>) {
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
