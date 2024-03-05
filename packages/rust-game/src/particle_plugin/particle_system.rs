use bevy::{
    prelude::*,
    render::{batching::NoAutomaticBatching, view::NoFrustumCulling},
    sprite::Mesh2dHandle,
};
use bevy_rapier2d::dynamics::Velocity;
use parry2d::shape::SharedShape;
use rand::prelude::*;
use rust_game_plugin::GamePluginSchedule;
use std::ops::Range;
use std::time::Duration;

mod gradient;
mod particle_template;

pub use gradient::*;
pub use particle_template::*;

use super::{
    instancing_plugin::{InstancingChild, InstancingHost},
    particle::Particle,
};

#[derive(Event, Debug)]
pub struct ParticleSpawnEvent {
    pub system_entity: Entity,
    pub spawn_type: ParticleSpawnType,
}

#[derive(Debug)]
pub enum ParticleSpawnType {
    Stop,
    Finite(i32),
    Infinite,
}

pub enum ParticleSpawnLocation {
    Location(Vec3),
    Entity(Entity, Vec3),
}

impl Default for ParticleSpawnLocation {
    fn default() -> Self {
        Self::Location(Vec3::ZERO)
    }
}

#[derive(Default)]
pub enum ParticleAmount {
    Finite(i32),

    #[default]
    Infinite,
}

#[derive(Component, Default)]
pub struct ParticleSystem {
    pub spawn_every_duration: Duration,
    pub location: ParticleSpawnLocation,
    pub amount: ParticleAmount,
    pub template: particle_template::ParticleTemplate,
}

#[derive(Bundle)]
pub struct ParticleSystemBundle {
    pub particle_system: ParticleSystem,
    pub mesh: Mesh2dHandle,

    pub instancing_host: InstancingHost,
    pub spatial_bundle: SpatialBundle,

    pub no_frustum_culling: NoFrustumCulling,
    pub no_automatic_batching: NoAutomaticBatching,
}

impl Default for ParticleSystemBundle {
    fn default() -> Self {
        Self {
            particle_system: Default::default(),
            mesh: Default::default(),
            instancing_host: Default::default(),
            spatial_bundle: Default::default(),
            no_frustum_culling: Default::default(),
            no_automatic_batching: NoAutomaticBatching,
        }
    }
}

pub fn particle_system_event_receiver(
    mut commands: Commands,
    mut events: EventReader<ParticleSpawnEvent>,
    mut particle_systems: Query<&mut ParticleSystem>,
) {
    for event in events.read() {
        if let Ok(mut particle_system) = particle_systems.get_mut(event.system_entity) {
            let new_particle_amount = match event.spawn_type {
                ParticleSpawnType::Stop => ParticleAmount::Finite(0),
                ParticleSpawnType::Finite(amount) => ParticleAmount::Finite(amount),
                ParticleSpawnType::Infinite => ParticleAmount::Infinite,
            };

            particle_system.amount = new_particle_amount;
        } else {
            error!("No particle system found for event: {:?}", event);
        }
    }
}

#[derive(Default)]
pub struct SpawnerState {
    pub time_since_last_spawn: Duration,
}

pub fn particle_system_spawner(
    mut commands: Commands,
    mut state: Local<SpawnerState>,
    time: Res<Time>,
    mut particle_systems: Query<(Entity, &mut ParticleSystem)>,
    particle_location_entity: Query<(Entity, &GlobalTransform, Option<&Velocity>)>,
) {
    for (entity, mut particle_system) in particle_systems.iter_mut() {
        if let ParticleAmount::Finite(0) = particle_system.amount {
            continue;
        }

        state.time_since_last_spawn += time.delta();

        if state.time_since_last_spawn >= particle_system.spawn_every_duration {
            let mut count = (state.time_since_last_spawn.as_secs_f64()
                / particle_system.spawn_every_duration.as_secs_f64())
                as u32;

            state.time_since_last_spawn -= particle_system.spawn_every_duration * count;

            let single_factor = particle_system.spawn_every_duration.as_secs_f32()
                / state.time_since_last_spawn.as_secs_f32();

            if let ParticleAmount::Finite(max_amount) = particle_system.amount {
                if count > max_amount as u32 {
                    count = max_amount as u32;
                    particle_system.amount = ParticleAmount::Finite(0);
                } else {
                    particle_system.amount = ParticleAmount::Finite(max_amount - count as i32);
                }
            }

            let (source_position, source_rotation, source_velocity) = match particle_system.location
            {
                ParticleSpawnLocation::Location(position) => (position, 0.0, Vec2::ZERO),
                ParticleSpawnLocation::Entity(entity, offset) => {
                    if let Ok((_, transform, velocity)) = particle_location_entity.get(entity) {
                        let transform = transform.compute_transform();

                        (
                            transform.translation + transform.rotation.mul_vec3(offset),
                            transform.rotation.to_euler(EulerRot::XYZ).2,
                            velocity.map_or(Vec2::ZERO, |v| v.linvel),
                        )
                    } else {
                        error!("No location found for entity: {:?}", entity);
                        continue;
                    }
                }
            };

            for i in 0..count {
                let velocity_without_source = sample_range(&particle_system.template.velocity);
                let size = sample_range(&particle_system.template.size);
                let angle = sample_range(&particle_system.template.angle);
                let lifetime = sample_range(&particle_system.template.lifetime);

                let velocity_without_source = Vec2::new(
                    velocity_without_source * (angle + source_rotation).sin(),
                    velocity_without_source * (angle + source_rotation).cos() * -1.0,
                );

                let offset = Vec2::new(
                    velocity_without_source.x * (i as f32) * 0.02,
                    velocity_without_source.y * (i as f32) * 0.02,
                );

                let velocity = velocity_without_source + source_velocity;

                commands.entity(entity).with_children(|parent| {
                    parent.spawn((
                        Particle {
                            vx: velocity.x,
                            vy: velocity.y,
                            friction: 0.8,
                            restitution: 0.1,
                            shape: SharedShape::ball(size),
                            gradient: particle_system.template.gradient.clone(),
                            age: Duration::ZERO,
                            lifetime: Duration::from_secs_f32(lifetime),
                        },
                        InstancingChild {
                            color: particle_system
                                .template
                                .gradient
                                .pick_color(0.0)
                                .as_linear_rgba_f32(),
                            scale: size,
                        },
                        TransformBundle::from_transform(Transform::from_translation(Vec3::new(
                            source_position.x + offset.x,
                            source_position.y + offset.y,
                            0.5,
                        ))),
                    ));
                });
            }
        }
    }
}

pub fn particle_system_aging<'a>(
    mut commands: Commands,
    time: Res<Time>,
    mut particles: Query<(Entity, &mut Particle, &mut InstancingChild)>,
) {
    for (entity, mut particle, mut instancing_child) in particles.iter_mut() {
        particle.age += time.delta();

        if particle.age >= particle.lifetime {
            commands.entity(entity).remove_parent();
            commands.entity(entity).despawn();
        } else {
            instancing_child.color = particle
                .gradient
                .pick_color(particle.age.as_secs_f32() / particle.lifetime.as_secs_f32())
                .as_linear_rgba_f32();
        }
    }
}

fn sample_range(range: &Range<f32>) -> f32 {
    if range.is_empty() {
        range.start
    } else {
        rand::thread_rng().gen_range(range.start..range.end)
    }
}
