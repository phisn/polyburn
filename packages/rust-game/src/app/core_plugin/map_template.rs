use base64::*;
use bevy::ecs::system::Resource;
use bevy_rapier2d::geometry::VHACDParameters;
use prost::Message;
use rapier2d::{math::Point, parry::transformation::vhacd::VHACD};
use rust_proto::WorldModel;

use self::shape_template::ShapeTemplate;

pub mod shape_template;

#[derive(Resource)]
pub struct MapTemplate {
    shapes: Vec<shape_template::ShapeTemplate>,
}

impl MapTemplate {
    pub fn from_str(map: &str, gamemode: &str) -> Self {
        let map = base64::engine::general_purpose::STANDARD
            .decode(map)
            .unwrap();

        let map = rust_proto::WorldModel::decode(map.as_slice()).unwrap();

        Self::from_model(map, gamemode)
    }

    fn from_model(map: WorldModel, gamemode: &str) -> Self {
        let groups = &map.gamemodes[gamemode].groups;

        let shapes: Vec<_> = groups
            .iter()
            .flat_map(|group| map.groups[group].shapes.iter())
            .map(|shape| ShapeTemplate::from_model(shape))
            .collect();

        Self { shapes }
    }
}
