use bevy::prelude::*;

use self::particle_system::ParticleSpawnEvent;

mod environment;
mod instancing_plugin;
mod particle;
mod particle_system;

pub struct ParticlePlugin;

impl Plugin for ParticlePlugin {
    fn build(&self, app: &mut App) {
        app.add_event::<ParticleSpawnEvent>()
            .add_systems(
                PostUpdate,
                (
                    particle::simulation_step,
                    particle_system::particle_system_event_receiver,
                    particle_system::particle_system_spawner,
                    particle_system::particle_system_aging,
                ),
            )
            .add_plugins(instancing_plugin::InstancingPlugin);
    }
}
