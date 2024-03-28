use std::{f32::consts, sync::Arc, time::Duration};

use bevy::{
    ecs::schedule::SystemConfigs, prelude::*, render::view::NoFrustumCulling, sprite::Mesh2dHandle,
};

use bevy_svg::prelude::*;

use rust_game_plugin::{constants::ENTITY_ROCKET_ENTRY, ecs::rocket::Rocket, MapTemplate};

use crate::{
    particle_plugin::{
        self, Gradient, GradientEntry, InstancingHost, ParticleSystem, ParticleSystemBundle,
        ParticleTemplate,
    },
    player_plugin::RocketParticleSystem,
};

use super::SVG_SCALE_FACTOR;

pub fn startup() -> SystemConfigs {
    (insert_initial_rocket, rocket_particle_setup)
        .chain()
        .into_configs()
}

fn insert_initial_rocket(
    mut commands: Commands,
    mut rocket_query: Query<(Entity, &Rocket)>,
    asset_server: Res<AssetServer>,
) {
    let (rocket_entity, _rocket) = rocket_query.single_mut();
    let rocket_svg: Handle<Svg> = asset_server.load("rocket.svg");

    commands.entity(rocket_entity).with_children(|parent| {
        parent.spawn(Svg2dBundle {
            svg: rocket_svg.clone(),
            transform: Transform {
                translation: Vec3::new(
                    -ENTITY_ROCKET_ENTRY.width / 2.0,
                    ENTITY_ROCKET_ENTRY.height / 2.0,
                    0.0,
                ),
                scale: Vec3::splat(SVG_SCALE_FACTOR),
                ..Default::default()
            },
            ..Default::default()
        });
    });
}

fn rocket_particle_setup(
    mut commands: Commands,
    mut meshes: ResMut<Assets<Mesh>>,
    rocket_query: Query<Entity, With<Rocket>>,
    _map_template: Res<MapTemplate>,
) {
    let mesh = Mesh::from(Circle::new(0.8));
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
            instancing_host: InstancingHost::default(),
        })
        .insert((RocketParticleSystem, NoFrustumCulling));
}

fn thrust_particle_template() -> ParticleTemplate {
    ParticleTemplate {
        velocity: 15.0..15.0,
        size: 0.3..0.7,
        angle: (-consts::PI / 16.0)..(consts::PI / 16.0),
        lifetime: 0.360..0.630,
        gradient: Arc::new(Gradient::new(vec![
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
        ])),
    }
}
