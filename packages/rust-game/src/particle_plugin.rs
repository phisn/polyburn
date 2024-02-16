use std::time::Duration;

use bevy::prelude::*;
use bevy_rapier2d::plugin::RapierContext;
use rapier2d::{geometry::BroadPhase, parry::partitioning::Qbvh};

mod custom_broad_phase_plugin;
mod gradient;
mod particle_template;

#[derive(Default)]
pub struct ParticlePlugin;

impl Plugin for ParticlePlugin {
    fn build(&self, app: &mut App) {}
}

#[derive(Event, Debug)]
pub struct ParticleSpawnEvent {
    pub entity: Entity,
    pub spawn_type: ParticleSpawnType,
}

#[derive(Debug)]
pub enum ParticleSpawnType {
    Set(i32),
    Infinite,
}

pub enum ParticleAmount {
    Finite(i32),
    Infinite,
}

#[derive(Component)]
pub struct ParticleSystem {
    spawn_every_duration: Duration,
    amount: ParticleAmount,
    template: particle_template::ParticleTemplate,
}

#[derive(Component)]
struct ParticleSystemIdle;

#[derive(Component)]
pub struct Particle;

pub fn particle_system_event_receiver(
    mut commands: Commands,
    mut events: EventReader<ParticleSpawnEvent>,
    mut particle_systems: Query<&mut ParticleSystem>,
) {
    for event in events.read() {
        if let Ok(mut particle_system) = particle_systems.get_mut(event.entity) {
            let new_particle_amount = match event.spawn_type {
                ParticleSpawnType::Set(amount) => ParticleAmount::Finite(amount),
                ParticleSpawnType::Infinite => ParticleAmount::Infinite,
            };

            particle_system.amount = new_particle_amount;

            commands.entity(event.entity).remove::<ParticleSystemIdle>();
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
    mut state: Local<SpawnerState>,
    time: Res<Time>,
    particle_systems: Query<&ParticleSystem>,
) {
    for particle_system in particle_systems.iter() {
        if let ParticleAmount::Finite(0) = particle_system.amount {
            continue;
        }

        state.time_since_last_spawn += time.delta();

        if state.time_since_last_spawn >= particle_system.spawn_every_duration {
            let count = (state.time_since_last_spawn.as_secs_f64()
                / particle_system.spawn_every_duration.as_secs_f64())
                as u32;

            state.time_since_last_spawn -= particle_system.spawn_every_duration * count;
        }
    }
}

pub fn particle_system_aging() {}
