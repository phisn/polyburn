use bevy::prelude::*;
use bevy_rapier2d::{
    dynamics::{Ccd, Damping},
    geometry::{ActiveEvents, ColliderMassProperties},
};

use crate::app::core_plugin::map_template::MapTemplate;

use super::{rocket::RocketBundle, shape::ShapeBundle};

pub fn initialize(mut commands: Commands, map: Res<MapTemplate>) {
    commands
        .spawn(RocketBundle::new(map.rocket.position))
        .insert(ActiveEvents::COLLISION_EVENTS)
        .insert(ColliderMassProperties::Mass(20.0))
        .insert(Damping {
            linear_damping: 0.0,
            angular_damping: 0.5,
        })
        .insert(Ccd::enabled());

    for shape in map.shapes.iter() {
        commands.spawn(ShapeBundle::new(shape));
    }
}
