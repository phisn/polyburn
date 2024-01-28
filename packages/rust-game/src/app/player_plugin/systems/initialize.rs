use bevy::prelude::*;

use crate::app::{game_plugin::map_template::MapTemplate, player_plugin::camera::Camera};

pub fn initialize(mut commands: Commands, map: ResMut<MapTemplate>) {
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
