use std::time::Duration;

use bevy::prelude::*;
use parry2d::shape::SharedShape;

use super::{environment, instancing_plugin, particle_system::Gradient};

#[derive(Bundle)]
struct ParticleBundle {
    particle: Particle,
    transform: TransformBundle,

    instancing_child: instancing_plugin::InstancingChild,
}

#[derive(Component)]
pub struct Particle {
    pub shape: SharedShape,
    pub vx: f32,
    pub vy: f32,
    pub mass: f32,

    pub gradient: Gradient,
    pub age: Duration,
    pub lifetime: Duration,
}

pub fn simulation_step(
    env: Res<environment::Environment>,
    mut particles: Query<(&Particle, &mut Transform)>,
    mut time: Res<Time>,
) {
    for (particle, mut particle_transform) in &mut particles {
        let tx = particle_transform.translation.x + particle.vx * time.delta_seconds();
        let ty = particle_transform.translation.y + particle.vy * time.delta_seconds();

        particle_transform.translation.x = tx;
        particle_transform.translation.y = ty;
    }
}
