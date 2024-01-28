use bevy::{ecs::schedule::SystemConfigs, prelude::*};

mod camera_movement;
mod initialize;
mod input_generator;

pub fn systems() -> SystemConfigs {
    (input_generator::input_generator).chain().into_configs()
}

pub fn systems_in_post_update() -> SystemConfigs {
    (camera_movement::camera_movement).chain().into_configs()
}

pub fn systems_in_startup() -> SystemConfigs {
    (initialize::initialize).chain().into_configs()
}
