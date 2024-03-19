use std::{sync::Arc, time::Duration};

use bevy::prelude::*;
use parry2d::{na::Isometry2, shape::SharedShape};

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

    pub friction: f32,
    pub restitution: f32,

    pub gradient: Arc<Gradient>,
    pub age: Duration,
    pub lifetime: Duration,
}

#[derive(Component)]
pub struct ParticleCollidable;

pub fn simulation_step(
    env: Res<environment::Environment>,
    mut particles: Query<(&mut Particle, &mut Transform, Option<&ParticleCollidable>)>,
    time: Res<Time>,
) {
    let substeps = 4;
    let mut broad_phase_r = 0;

    for (mut particle, mut particle_transform, collidable) in &mut particles {
        for _ in 0..substeps {
            let dx = particle.vx * time.delta_seconds() / substeps as f32;
            let dy = particle.vy * time.delta_seconds() / substeps as f32;

            let tx: f32 = particle_transform.translation.x + dx;
            let ty = particle_transform.translation.y + dy;

            if collidable.is_some() || true {
                let aabb = particle.shape.compute_aabb(&Isometry2::translation(tx, ty));

                let mut acc_normal = Vec2::ZERO;
                let mut acc_normal_count = 0;

                let mut acc_velocity = Vec2::ZERO;
                let possible_contacts = env.query(aabb);

                broad_phase_r = broad_phase_r.max(possible_contacts.len());

                for possible_contact in possible_contacts {
                    let contact = parry2d::query::contact(
                        &Isometry2::translation(tx, ty),
                        particle.shape.as_ref(),
                        &Isometry2::identity(),
                        possible_contact.as_ref(),
                        0.0,
                    );

                    if let Ok(Some(contact)) = contact {
                        acc_normal.x += contact.normal1.x;
                        acc_normal.y += contact.normal1.y;

                        acc_normal_count += 1;
                    }
                }

                if acc_normal_count > 0 {
                    let acc_normal = acc_normal / acc_normal_count as f32;
                    let velocity: Vec2 = Vec2::new(particle.vx, particle.vy);
                    let dot_product = (1.0 + particle.restitution) * velocity.dot(acc_normal);

                    if (velocity.normalize() - acc_normal).length() < 1.4 {
                        let acc_velocity_candidate = velocity - acc_normal * dot_product;
                        let acc_velocity_candidate = acc_velocity_candidate * particle.friction;

                        if acc_velocity_candidate.length() > acc_velocity.length() {
                            acc_velocity = acc_velocity_candidate;
                        }

                        particle.vx = acc_velocity.x;
                        particle.vy = acc_velocity.y;
                    }
                }
            }

            particle_transform.translation.x = tx;
            particle_transform.translation.y = ty;
        }
    }

    // println!("broad_phase_r: {}", broad_phase_r);
}
