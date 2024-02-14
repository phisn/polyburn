use bevy::prelude::*;
use rand::prelude::*;
use std::ops::Range;

use super::{gradient::Gradient, ParticleSpawnEvent};

pub struct ParticleTemplate {
    pub amount: i32,
    pub velocity: Range<f32>,
    pub size: Range<f32>,
    pub angle: Range<f32>,
    pub lifetime: Range<f32>,
    pub gradient: &'static Gradient,
}

pub fn spawn_particle(
    transform: &Transform,
    template: &ParticleTemplate,
) -> Vec<ParticleSpawnEvent> {
    let mut particles = vec![];

    for _ in 0..template.amount {
        let velocity = sample_range(&template.velocity);
        let size = sample_range(&template.size);
        let angle = sample_range(&template.angle);
        let lifetime = sample_range(&template.lifetime);

        let velocity = Vec2::new(
            velocity * (angle + transform.rotation.z).sin(),
            velocity * (angle + transform.rotation.z).cos() * -1.0,
        );

        particles.push(ParticleSpawnEvent {
            position: transform.translation.truncate(),
            velocity,
            size,
            gradient: &template.gradient,
            lifetime,
        });
    }

    particles
}

fn sample_range(range: &Range<f32>) -> f32 {
    if range.is_empty() {
        range.start
    } else {
        rand::thread_rng().gen_range(range.start..range.end)
    }
}
