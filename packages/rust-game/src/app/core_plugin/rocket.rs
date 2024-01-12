use bevy::{
    ecs::{bundle::Bundle, component::Component},
    transform::TransformBundle,
};
use bevy_rapier2d::{
    dynamics::{ExternalImpulse, RigidBody},
    geometry::{Collider, CollidingEntities},
};

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
