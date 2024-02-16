use std::f32::consts::PI;

use bevy::core::update_frame_count;
use bevy::{app::SubApp, prelude::*};
use bevy_svg::SvgPlugin;
use bevy_xpbd_2d::plugins::setup::Physics;
use bevy_xpbd_2d::plugins::{BroadPhasePlugin, PhysicsPlugins};
use rand::prelude::*;
use rust_game_plugin::{ecs::rocket::Rocket, FrameInput, GamePluginSet, MapTemplate};

mod camera;
mod graphics;
mod input;
mod particle;

pub use input::*;

use self::particle::{ParticleSpawnEvent, ParticleSubApp};

#[derive(Default)]
pub struct PlayerPlugin;

impl Plugin for PlayerPlugin {
    fn build(&self, app: &mut App) {
        app.init_resource::<input::InputTracker>()
            .add_plugins(SvgPlugin)
            .add_plugins(
                PhysicsPlugins::new(FixedUpdate)
                    .build()
                    .disable::<BroadPhasePlugin>()
                    .add(particle::BruteForceBroadPhasePlugin),
            )
            .insert_resource(Time::new_with(Physics::fixed_hz(120.0)))
            .add_systems(
                FixedUpdate,
                (input::fixed_update()).chain().in_set(GamePluginSet),
            )
            .add_systems(
                PostUpdate,
                (camera::update(), graphics::update(), particle::update())
                    .chain()
                    .in_set(GamePluginSet),
            )
            .add_systems(
                PostStartup,
                (graphics::startup(), camera::startup())
                    .chain()
                    .after(GamePluginSet),
            )
            .add_event::<ParticleSpawnEvent>();

        use bevy::diagnostic::FrameTimeDiagnosticsPlugin;
        app.add_plugins(FrameTimeDiagnosticsPlugin::default());
    }
}
