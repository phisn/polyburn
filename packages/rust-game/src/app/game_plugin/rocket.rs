use bevy::ecs::schedule::SystemConfigs;
use bevy::prelude::*;
use bevy_rapier2d::prelude::*;
use rapier2d::math::Point;

mod rocket_collider;
mod rotation_system;
mod thrust_system;

#[derive(Component, Default)]
pub struct Rocket;

#[derive(Bundle, Default)]
pub struct RocketBundle {
    rocket: Rocket,

    transform: TransformBundle,

    rigid_body: RigidBody,
    collider: Collider,
    colliding_entities: CollidingEntities,
    external_impulse: ExternalImpulse,
}

impl RocketBundle {
    pub fn new(position: Point<f32>) -> Self {
        RocketBundle {
            rigid_body: RigidBody::Dynamic,
            collider: rocket_collider::rocket_collider().unwrap(),
            transform: TransformBundle::from(Transform::from_xyz(position.x, position.y, 0.0)),
            ..Default::default()
        }
    }
}

pub fn systems() -> SystemConfigs {
    (
        rotation_system::rotation_system,
        thrust_system::thrust_system,
    )
        .chain()
        .into_configs()
}
