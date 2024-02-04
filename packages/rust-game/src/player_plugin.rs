use bevy::prelude::*;
use bevy_svg::SvgPlugin;
use rust_game_plugin::GamePluginSet;

mod camera;
mod graphics;
mod input;

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
                (camera::camera_movement, graphics::to_update())
                    .chain()
                    .in_set(GamePluginSet),
            )
            .add_systems(
                PostStartup,
                (graphics::to_startup(), camera::startup)
                    .chain()
                    .after(GamePluginSet),
            );
    }
}
