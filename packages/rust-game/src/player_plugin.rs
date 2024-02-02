use bevy::prelude::*;
use bevy_svg::SvgPlugin;
use rust_game_plugin::GamePluginSet;

mod camera;
mod init;
mod input;
mod polygon_shape;
mod shape_graphic;

pub use input::*;

#[derive(Default)]
pub struct PlayerPlugin;

impl Plugin for PlayerPlugin {
    fn build(&self, app: &mut App) {
        app.init_resource::<input::InputTracker>()
            .add_plugins(SvgPlugin)
            .add_systems(
                FixedUpdate,
                (input::input_generator).chain().in_set(GamePluginSet),
            )
            .add_systems(
                PostUpdate,
                (camera::camera_movement).chain().in_set(GamePluginSet),
            )
            .add_systems(PostStartup, init::init_system.after(GamePluginSet));
    }
}
