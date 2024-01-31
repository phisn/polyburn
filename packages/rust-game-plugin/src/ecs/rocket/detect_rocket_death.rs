use bevy::prelude::*;
use bevy_rapier2d::prelude::*;

use crate::constants::ROCKET_MAX_IMPULSE_MAGNITUDE;

use super::Rocket;

pub fn detect_rocket_death(
    rapier_context: Res<RapierContext>,
    mut rocket_query: Query<(Entity, &Rocket, &mut Transform, &mut Velocity)>,
) {
    let (rocket_entity, rocket, mut transform, mut velocity) = rocket_query.single_mut();

    if is_rocket_dead(rapier_context, rocket_entity, transform.up()) {
        transform.translation = rocket.spawn_point.extend(0.0);
        transform.rotation = Quat::from_rotation_z(0.0);

        velocity.linvel = Vec2::ZERO;
        velocity.angvel = 0.0;
    }
}

fn is_rocket_dead(
    rapier_context: Res<'_, RapierContext>,
    rocket_entity: Entity,
    rocket_vector: Vec3,
) -> bool {
    for contact in rapier_context.contacts_with(rocket_entity) {
        let other = if contact.collider1() == rocket_entity {
            contact.raw.collider2
        } else {
            contact.raw.collider1
        };

        if rapier_context.colliders.get(other).unwrap().is_sensor() {
            println!("SENSOR");
            continue;
        }

        if contact.raw.total_impulse_magnitude() > ROCKET_MAX_IMPULSE_MAGNITUDE {
            println!("Rocket died");
            return true;
        }

        for manifold in &contact.raw.manifolds {
            let normal_raw = if contact.collider1() == rocket_entity {
                manifold.local_n2
            } else {
                manifold.local_n1
            };

            let normal = Vec3::new(normal_raw.x, normal_raw.y, 0.0);
            let distance = (normal.normalize() - rocket_vector).length();

            if distance > 0.3 {
                println!("Rocket died, since distance is {}", distance);
                return true;
            }
        }
    }

    false
}
