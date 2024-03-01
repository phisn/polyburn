use std::f32::consts::{self, PI};
use std::time::Duration;

use bevy::core::update_frame_count;
use bevy::render::view::NoFrustumCulling;
use bevy::sprite::Mesh2dHandle;
use bevy::{app::SubApp, prelude::*};
use bevy_svg::SvgPlugin;
use bevy_xpbd_2d::plugins::setup::Physics;
use bevy_xpbd_2d::plugins::{BroadPhasePlugin, PhysicsPlugins};
use rand::prelude::*;
use rust_game_plugin::constants::ENTITY_ROCKET_ENTRY;
use rust_game_plugin::GamePluginSchedule;
use rust_game_plugin::{ecs::rocket::Rocket, FrameInput, GamePluginSet, MapTemplate};

mod camera;
mod graphics;
mod input;
mod particle;

pub use input::*;

use crate::particle_plugin::{
    self, Gradient, GradientEntry, ParticleSystem, ParticleSystemBundle, ParticleTemplate,
};

use self::particle::{ParticleSpawnEvent, ParticleSubApp};

#[derive(Default)]
pub struct PlayerPlugin;

impl Plugin for PlayerPlugin {
    fn build(&self, app: &mut App) {
        app.init_resource::<input::InputTracker>()
            .add_plugins(SvgPlugin)
            .add_plugins(
                PhysicsPlugins::new(GamePluginSchedule)
                    .build()
                    .disable::<BroadPhasePlugin>()
                    .add(super::particle_plugin::base_broad_phase::BroadPhasePlugin),
            )
            .add_plugins(particle_plugin::ParticlePlugin)
            .insert_resource(Time::new_with(Physics::fixed_hz(60.0)))
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
                (
                    graphics::startup(),
                    camera::startup(),
                    rocket_particle_setup,
                )
                    .chain()
                    .after(GamePluginSet),
            )
            .add_event::<ParticleSpawnEvent>();

        use bevy::diagnostic::FrameTimeDiagnosticsPlugin;
        app.add_plugins(FrameTimeDiagnosticsPlugin::default());
    }
}

fn rocket_particle_setup(
    mut commands: Commands,
    mut meshes: ResMut<Assets<Mesh>>,
    rocket_query: Query<Entity, With<Rocket>>,
) {
    let mesh = Mesh::from(shape::Quad::new(Vec2::splat(1.0)));
    let mesh_handle = meshes.add(mesh);

    commands
        .spawn(ParticleSystemBundle {
            particle_system: ParticleSystem {
                spawn_every_duration: Duration::from_secs_f32(1.0 / 60.0 / 3.0),
                location: particle_plugin::ParticleSpawnLocation::Entity(
                    rocket_query.single(),
                    Vec3::new(0.0, -ENTITY_ROCKET_ENTRY.height * 0.2, 0.0),
                ),
                amount: particle_plugin::ParticleAmount::Finite(0),
                template: thrust_particle_template(),
            },
            mesh: Mesh2dHandle(mesh_handle.clone()),
            spatial_bundle: SpatialBundle::from_transform(Transform::from_xyz(0.0, 0.0, 0.0)),
            ..Default::default()
        })
        .insert(RocketParticleSystem);
}

fn thrust_particle_template() -> ParticleTemplate {
    ParticleTemplate {
        velocity: 15.0..15.0,
        size: 0.3..0.7,
        angle: (-consts::PI / 16.0)..(consts::PI / 16.0),
        lifetime: 0.360..0.630,
        gradient: Gradient::new(vec![
            GradientEntry {
                time: 0.0,
                color: Color::rgb(1.0, 0.726, 0.0),
            },
            GradientEntry {
                time: 0.2,
                color: Color::rgb(1.0, 0.618, 0.318),
            },
            GradientEntry {
                time: 0.4,
                color: Color::rgb(1.0, 0.0, 0.0),
            },
            GradientEntry {
                time: 0.65,
                color: Color::rgb(0.65, 0.65, 0.65),
            },
            GradientEntry {
                time: 1.0,
                color: Color::rgb(0.311, 0.311, 0.311),
            },
        ]),
    }
}
