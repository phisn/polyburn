use std::f32::consts::{self, PI};
use std::sync::Arc;
use std::time::Duration;

use bevy::asset::LoadedFolder;
use bevy::render::deterministic::DeterministicRenderingConfig;
use bevy::render::view::NoFrustumCulling;
use bevy::sprite::Mesh2dHandle;
use bevy::{app::SubApp, prelude::*};
use bevy_svg::SvgPlugin;
use bevy_xpbd_2d::components::RigidBody;
use bevy_xpbd_2d::plugins::setup::Physics;
use bevy_xpbd_2d::plugins::{BroadPhasePlugin, PhysicsDebugPlugin, PhysicsPlugins};
use parry2d::na::Isometry2;
use rand::prelude::*;
use rust_game_plugin::constants::ENTITY_ROCKET_ENTRY;
use rust_game_plugin::GamePluginSchedule;
use rust_game_plugin::{ecs::rocket::Rocket, FrameInput, GamePluginSet, MapTemplate};

mod camera;
mod graphics;
mod input;

pub use input::*;

use crate::particle_plugin::{
    self, Environment, Gradient, GradientEntry, ParticlePlugin, ParticleSystem,
    ParticleSystemBundle, ParticleTemplate,
};
use crate::player_plugin::camera::CameraConfig;
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
                (camera::update(), graphics::update())
                    .chain()
                    .in_set(GamePluginSet),
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
            .init_resource::<GameAssets>();

        use bevy::diagnostic::FrameTimeDiagnosticsPlugin;
        app.add_plugins(FrameTimeDiagnosticsPlugin::default());
    }
}
