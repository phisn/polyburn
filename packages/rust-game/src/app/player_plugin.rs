use bevy::prelude::*;

use super::game_plugin::GamePluginSet;

mod camera;
mod systems;

#[derive(Default)]
pub struct PlayerPlugin;

impl Plugin for PlayerPlugin {
    fn build(&self, app: &mut App) {
        app.add_systems(FixedUpdate, systems::systems().before(GamePluginSet));
        app.add_systems(PostUpdate, systems::systems_in_post_update());
        app.add_systems(Startup, systems::systems_in_startup());
    }
}
