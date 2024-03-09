


use std::{ops::Range, sync::Arc};

use super::gradient::Gradient;

#[derive(Clone, Default)]
pub struct ParticleTemplate {
    pub velocity: Range<f32>,
    pub size: Range<f32>,
    pub angle: Range<f32>,
    pub lifetime: Range<f32>,
    pub gradient: Arc<Gradient>,
}

/*
pub fn spawn_particle(
    amount: i32,
    source_position: Vec2,
    source_rotation: f32,
    source_velocity: Vec2,
    template: &ParticleTemplate,
) -> Vec<ParticleSpawnEvent> {
    let mut particles = vec![];

    for i in 0..amount {
        let velocity = sample_range(&template.velocity);
        let size = sample_range(&template.size);
        let angle = sample_range(&template.angle);
        let lifetime = sample_range(&template.lifetime);

        let velocity = Vec2::new(
            velocity * (angle + source_rotation).sin() + source_velocity.x * 0.5,
            velocity * (angle + source_rotation).cos() * -1.0,
        );

        let offset = Vec2::new(
            velocity.x * (i as f32 / amount as f32) * 0.017,
            velocity.y * (i as f32 / amount as f32) * 0.017,
        );

        particles.push(ParticleSpawnEvent {
            position: source_position + offset,
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
 */
