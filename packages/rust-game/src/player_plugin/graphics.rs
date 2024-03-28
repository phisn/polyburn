use std::sync::Arc;

use bevy::{
    asset::{LoadedFolder, StrongHandle},
    ecs::schedule::SystemConfigs,
    prelude::*,
};
use bevy_svg::prelude::Svg;
use parry2d::na::Isometry2;
use rust_game_plugin::MapTemplate;

use crate::particle_plugin::Environment;

mod graphics_level;
mod graphics_rocket;
mod graphics_shape;

const SVG_SCALE_FACTOR: f32 = 0.15 / 25.0;

#[derive(Resource, Default)]
pub struct GameAssets {
    pub rocket: Handle<Svg>,
    pub flag_green: Handle<Svg>,
    pub flag_red: Handle<Svg>,
}

pub fn update() -> SystemConfigs {
    (graphics_level::update()).chain().into_configs()
}

pub fn startup() -> SystemConfigs {
    (
        game_assets_setup,
        particle_environment_setup,
        graphics_rocket::startup(),
        graphics_shape::startup(),
        graphics_level::startup(),
    )
        .chain()
        .into_configs()
}

fn game_assets_setup(asset_server: Res<AssetServer>, mut game_assets: ResMut<GameAssets>) {
    game_assets.flag_green = asset_server.load("flag-green.svg");
    game_assets.flag_red = asset_server.load("flag-red.svg");
    game_assets.rocket = asset_server.load("rocket.svg");
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
