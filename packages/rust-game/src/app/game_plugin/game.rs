use bevy::{ecs::schedule::SystemConfigs, prelude::*};

mod game_config;
mod initialize;
mod level;
mod replay;
mod rocket;
mod shape;

pub fn systems_in_startup() -> SystemConfigs {
    (initialize::initialize).chain().into_configs()
}

pub fn systems() -> SystemConfigs {
    (rocket::systems()).chain().into_configs()
}
