use bevy::prelude::*;
use rust_game_plugin::GamePluginSet;

mod camera;
mod init;
mod input;

pub use input::*;

#[derive(Default)]
pub struct PlayerPlugin;

impl Plugin for PlayerPlugin {
    fn build(&self, app: &mut App) {
        app.init_resource::<input::InputTracker>()
            .add_systems(
                FixedUpdate,
                (input::input_generator).chain().in_set(GamePluginSet),
            )
            .add_systems(
                PostUpdate,
                (camera::camera_movement).chain().in_set(GamePluginSet),
            )
            .add_systems(Startup, init::init_system);
    }
}
