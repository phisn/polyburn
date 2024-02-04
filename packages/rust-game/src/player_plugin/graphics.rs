use bevy::{ecs::schedule::SystemConfigs, prelude::*};

mod graphics_level;
mod graphics_rocket;
mod graphics_shape;

const SVG_SCALE_FACTOR: f32 = 0.15 / 25.0;

pub fn to_update() -> SystemConfigs {
    (graphics_level::update).chain().into_configs()
}

pub fn to_startup() -> SystemConfigs {
    (
        graphics_rocket::startup,
        graphics_shape::startup,
        graphics_level::startup,
    )
        .chain()
        .into_configs()
}
