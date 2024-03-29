use bevy::render::deterministic::DeterministicRenderingConfig;

use bevy::prelude::*;
use bevy_svg::SvgPlugin;

use rust_game_plugin::{GamePluginSchedule, GamePluginSet};

mod camera;
mod device_info;
mod graphics;
mod input;
mod interpolation;

pub use input::*;

use crate::particle_plugin::ParticlePlugin;
use crate::player_plugin::camera::CameraConfig;
use crate::player_plugin::device_info::DeviceInfo;
use crate::player_plugin::graphics::GameAssets;

#[derive(Default)]
pub struct PlayerPlugin;

impl Plugin for PlayerPlugin {
    fn build(&self, app: &mut App) {
        app.init_resource::<input::InputTracker>()
            .add_plugins(ParticlePlugin)
            .add_plugins(SvgPlugin)
            .add_systems(
                FixedUpdate,
                (input::fixed_update()).chain().in_set(GamePluginSet),
            )
            .add_systems(
                PostUpdate,
                (
                    interpolation::update(),
                    graphics::update(),
                    camera::update(),
                )
                    .chain()
                    .after(GamePluginSet),
            )
            .add_systems(
                PostStartup,
                (graphics::startup(), camera::startup())
                    .chain()
                    .after(GamePluginSet),
            )
            .insert_resource(DeterministicRenderingConfig {
                stable_sort_z_fighting: true,
            })
            .init_resource::<CameraConfig>()
            .init_resource::<GameAssets>()
            .init_resource::<DeviceInfo>();

        error!("User agent: ");

        use bevy::diagnostic::FrameTimeDiagnosticsPlugin;
        app.add_plugins(FrameTimeDiagnosticsPlugin::default());
    }
}
