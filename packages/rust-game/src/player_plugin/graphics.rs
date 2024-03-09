use bevy::{asset::LoadedFolder, ecs::schedule::SystemConfigs, prelude::*};
use parry2d::na::Isometry2;
use rust_game_plugin::MapTemplate;

use crate::particle_plugin::Environment;

mod graphics_level;
mod graphics_rocket;
mod graphics_shape;

const SVG_SCALE_FACTOR: f32 = 0.15 / 25.0;

#[derive(Resource, Default)]
pub struct GameAssets(Option<Handle<LoadedFolder>>);

pub fn update() -> SystemConfigs {
    (graphics_level::update(), particle_environment_setup)
        .chain()
        .into_configs()
}

pub fn startup() -> SystemConfigs {
    (
        game_assets_setup,
        graphics_rocket::startup(),
        graphics_shape::startup(),
        graphics_level::startup(),
    )
        .chain()
        .into_configs()
}

fn game_assets_setup(asset_server: Res<AssetServer>, mut game_assets: ResMut<GameAssets>) {
    let folder = asset_server.load_folder("./");
    game_assets.0 = Some(folder);
}

fn particle_environment_setup(mut commands: Commands, map_template: Res<MapTemplate>) {
    let colliders: Vec<_> = map_template
        .shapes
        .iter()
        .flat_map(|shape| shape.parry_shapes())
        .map(|collider| (collider, Isometry2::<f32>::identity()))
        .collect();

    let env = Environment::build(colliders);

    commands.insert_resource(env);
}
