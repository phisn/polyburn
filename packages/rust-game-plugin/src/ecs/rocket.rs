use bevy::{ecs::schedule::SystemConfigs, prelude::*};
use bevy_rapier2d::prelude::*;
use rapier2d::math::Point;

use crate::MapTemplate;

mod apply_rotation;
mod apply_thrust;
mod create_rocket_collider;
mod detect_rocket_death;

#[derive(Component, Default)]
pub struct Rocket {
    pub spawn_point: Vec2,
}

#[derive(Bundle, Default)]
pub struct RocketBundle {
    rocket: Rocket,

    transform: TransformBundle,
    velocity: Velocity,

    rigid_body: RigidBody,
    collider: Collider,
    colliding_entities: CollidingEntities,
    external_impulse: ExternalImpulse,
}

impl RocketBundle {
    pub fn new(position: Point<f32>) -> Self {
        RocketBundle {
            rocket: Rocket {
                spawn_point: Vec2::new(position.x, position.y),
            },

            transform: TransformBundle::from(Transform::from_xyz(position.x, position.y, 0.0)),
            velocity: Velocity::default(),

            rigid_body: RigidBody::Dynamic,
            collider: create_rocket_collider::rocket_collider().unwrap(),
            colliding_entities: CollidingEntities::default(),
            external_impulse: ExternalImpulse::default(),
        }
    }
}

pub fn systems() -> SystemConfigs {
    (
        apply_rotation::apply_rotation,
        apply_thrust::apply_thrust,
        detect_rocket_death::detect_rocket_death,
    )
        .chain()
        .into_configs()
}

pub fn startup(mut commands: Commands, map: Res<MapTemplate>) {
    commands
        .spawn(RocketBundle::new(map.rocket.position))
        .insert(ActiveEvents::COLLISION_EVENTS)
        .insert(ColliderMassProperties::Mass(20.0))
        .insert(Damping {
            linear_damping: 0.0,
            angular_damping: 0.5,
        })
        .insert(Ccd::enabled());
}
