use bevy::{ecs::schedule::SystemConfigs, prelude::*};

pub mod init;
pub mod level;
pub mod rocket;
pub mod shape;

pub fn systems_in_startup() -> SystemConfigs {
    (init::init_system).chain().into_configs()
}

pub fn systems() -> SystemConfigs {
    (rocket::systems()).chain().into_configs()
}
