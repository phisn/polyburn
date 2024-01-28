use base64::*;
use bevy::ecs::system::Resource;
use bevy_rapier2d::geometry::VHACDParameters;
use prost::Message;
use rapier2d::{math::Point, parry::transformation::vhacd::VHACD};
use rust_proto::WorldModel;

use self::{
    level_template::LevelTemplate, rocket_template::RocketTemplate, shape_template::ShapeTemplate,
};

mod level_template;
mod rocket_template;
mod shape_template;

#[derive(Resource)]
pub struct MapTemplate {
    pub shapes: Vec<shape_template::ShapeTemplate>,
    pub rocket: RocketTemplate,
    pub levels: Vec<LevelTemplate>,
}

impl MapTemplate {
    pub fn new(map: &str, gamemode: &str) -> Self {
        let map = base64::engine::general_purpose::STANDARD
            .decode(map)
            .unwrap();

        let map = rust_proto::WorldModel::decode(map.as_slice()).unwrap();

        Self::new_from_model(map, gamemode)
    }

    fn new_from_model(map: WorldModel, gamemode: &str) -> Self {
        let groups: Vec<_> = map.gamemodes[gamemode]
            .groups
            .iter()
            .map(|group| &map.groups[group])
            .collect();

        let shapes: Vec<_> = groups
            .iter()
            .flat_map(|group| group.shapes.iter())
            .map(ShapeTemplate::new)
            .collect();

        let rocket = groups
            .iter()
            .flat_map(|group| group.rockets.iter())
            .map(RocketTemplate::new)
            .next()
            .unwrap();

        let levels = groups
            .iter()
            .flat_map(|group| group.levels.iter())
            .map(LevelTemplate::new)
            .collect::<Vec<_>>();

        Self {
            shapes,
            rocket,
            levels,
        }
    }
}
