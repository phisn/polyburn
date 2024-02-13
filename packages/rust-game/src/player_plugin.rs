use std::f32::consts::PI;

use bevy::{app::SubApp, prelude::*};
use bevy_svg::SvgPlugin;
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

/*
    const rocketEntry = entityRegistry[EntityType.ROCKET]

    const rigidBody = rocket.components.rigidBody
    const rocketRotation = rigidBody.rotation()

    const spawnPosition = changeAnchor(
        rigidBody.translation(),
        rocketRotation,
        rocketEntry,
        { x: 0.5, y: 0.5 },
        { x: 0.5, y: 0.3 },
    )

    const randomAngle = randomValueBetween(minAngle, maxAngle)

    const spawnVelocity = {
        x: velocity * Math.sin(rocketRotation + randomAngle),
        y: velocity * Math.cos(rocketRotation + randomAngle) * -1,
    }

    return {
        spawnPosition,

        spawnVelocity,
        additionalVelocity: rigidBody.linvel(),

        size: randomValueBetween(minSize, maxSize),
        lifeTime: Math.round(randomValueBetween(minLifetime, maxLifetime)),

        gradientOverTime: mixed,
    }
*/

fn test_system(
    mut input_reader: EventReader<FrameInput>,
    mut writer: EventWriter<ParticleSpawnEvent>,
    mut rocket_query: Query<&Transform, With<Rocket>>,
) {
    for input in input_reader.read() {
        for _ in 1..3 {
            let rocket_transform = rocket_query.single();
            let size = rand::random::<f32>() * 0.4 + 0.3;

            let base_velocity = 15.0;

            let min_angle = -PI / 16.0;
            let max_angle = PI / 16.0;

            let min_lifetime = 24.0 * 0.9;
            let max_lifetime = 42.0 * 0.9;

            let lifetime = rand::random::<f32>() * (max_lifetime - min_lifetime) + min_lifetime;

            let random_angle_offset = rand::random::<f32>() * (max_angle - min_angle) + min_angle;
            let angle = rocket_transform.rotation.z;

            let spawn_velocity = Vec2::new(
                base_velocity * (angle + random_angle_offset).sin(),
                base_velocity * (angle + random_angle_offset).cos() * -1.0,
            );

            if input.thrust {
                writer.send(ParticleSpawnEvent {
                    position: rocket_transform.translation.truncate(),
                    velocity: spawn_velocity,
                    size: size,
                    color: Color::RED,
                    lifetime: lifetime * 1000.0 / 60.0,
                });
            }
        }
    }
}

impl Plugin for PlayerPlugin {
    fn build(&self, app: &mut App) {
        app.init_resource::<input::InputTracker>()
            .add_plugins(SvgPlugin)
            .add_plugins(
                PhysicsPlugins::default()
                    .build()
                    .disable::<BroadPhasePlugin>()
                    .add(particle::BruteForceBroadPhasePlugin),
            )
            .add_systems(
                FixedUpdate,
                (input::fixed_update()).chain().in_set(GamePluginSet),
            )
            .add_systems(
                PostUpdate,
                (
                    camera::update(),
                    graphics::update(),
                    particle::update(),
                    test_system,
                )
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
    }
}
