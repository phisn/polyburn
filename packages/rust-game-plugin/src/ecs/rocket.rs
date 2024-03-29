use bevy::{ecs::schedule::SystemConfigs, prelude::*};
use bevy_rapier2d::prelude::*;
use rapier2d::math::Point;

use crate::{
    constants::{ENTITY_ROCKET_ENTRY, ROCKET_Z_POSITION},
    MapTemplate,
};

use super::common::TrackingForInterpolation;

mod apply_rotation;
mod apply_thrust;
mod create_rocket_collider;
mod detect_rocket_death;
mod update_rocket_spawn;

#[derive(Component, Default)]
pub struct Rocket {
    pub spawn_point: Vec3,
    pub input_offset: f32,
}

impl Rocket {
    pub fn reset_rotation(&mut self, transform: &Transform, input_rotation: f32) {
        self.input_offset = transform.rotation.to_euler(EulerRot::YXZ).2 - input_rotation;
    }
}

#[derive(Bundle)]
pub struct RocketBundle {
    rocket: Rocket,

    transform: TransformBundle,
    velocity: Velocity,

    rigid_body: RigidBody,
    collider: Collider,
    colliding_entities: CollidingEntities,
    external_impulse: ExternalImpulse,

    interpolated: TrackingForInterpolation,
}

impl RocketBundle {
    pub fn new(position: Point<f32>, rotation: f32) -> Self {
        let initial_position = Vec3::new(position.x, position.y, ROCKET_Z_POSITION);
        let rotation = Quat::from_euler(EulerRot::XYZ, 0.0, 0.0, rotation);

        let inverse = rotation.mul_vec3(Vec3::new(0.0, -0.5, 0.0));
        let initial_position = initial_position + inverse * ENTITY_ROCKET_ENTRY.height;

        let transform = Transform {
            translation: initial_position,
            rotation,
            ..Default::default()
        };

        RocketBundle {
            rocket: Rocket {
                spawn_point: initial_position,
                input_offset: 0.0,
            },

            transform: TransformBundle::from_transform(transform),
            velocity: Velocity::default(),

            rigid_body: RigidBody::Dynamic,
            collider: create_rocket_collider::rocket_collider().unwrap(),
            colliding_entities: CollidingEntities::default(),
            external_impulse: ExternalImpulse::default(),

            interpolated: TrackingForInterpolation {
                transform,
                previous_transform: transform,
            },
        }
    }
}

pub fn systems() -> SystemConfigs {
    (
        apply_rotation::apply_rotation,
        apply_thrust::apply_thrust,
        update_rocket_spawn::update_rocket_spawn,
        detect_rocket_death::detect_rocket_death,
    )
        .chain()
        .into_configs()
}

pub fn startup(mut commands: Commands, map: Res<MapTemplate>) {
    commands
        .spawn(RocketBundle::new(map.rocket.position, map.rocket.rotation))
        .insert(ActiveEvents::COLLISION_EVENTS)
        .insert(ColliderMassProperties::Mass(20.0))
        .insert(Damping {
            linear_damping: 0.0,
            angular_damping: 0.5,
        })
        .insert(Ccd::enabled());

    println!("Rocket spawned: {:?}", map.rocket.position);
}
