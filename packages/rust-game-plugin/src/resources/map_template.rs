use base64::*;
use bevy::{ecs::system::Resource, math::Vec2};
use prost::Message;
use rust_proto::WorldModel;

mod level_template;
mod rocket_template;
mod shape_template;

pub use level_template::*;
pub use rocket_template::*;
pub use shape_template::*;

#[derive(Resource, Clone)]
pub struct MapTemplate {
    pub shapes: Vec<shape_template::ShapeTemplate>,
    pub rocket: RocketTemplate,
    pub levels: Vec<LevelTemplate>,

    pub initial_level_index: usize,
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

        let rocket_position: Vec2 = rocket.position.into();

        let Some((initial_level_index, _)) =
            levels
                .iter()
                .enumerate()
                .reduce(|(min_index, min), (level_index, level)| {
                    if level.position.distance(rocket_position)
                        < min.position.distance(rocket_position)
                    {
                        (level_index, level)
                    } else {
                        (min_index, min)
                    }
                })
        else {
            panic!("No levels found");
        };

        Self {
            shapes,
            rocket,
            levels,
            initial_level_index,
        }
    }
}
