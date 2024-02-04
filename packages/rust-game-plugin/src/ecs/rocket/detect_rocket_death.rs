use bevy::prelude::*;
use bevy_rapier2d::prelude::*;

use crate::{constants::ROCKET_MAX_IMPULSE_MAGNITUDE, FrameInput};

use super::Rocket;

pub fn detect_rocket_death(
    input: Res<FrameInput>,
    rapier_context: Res<RapierContext>,
    mut rocket_query: Query<(Entity, &mut Rocket, &mut Transform, &mut Velocity)>,
) {
    let (rocket_entity, mut rocket, mut transform, mut velocity) = rocket_query.single_mut();

    if is_rocket_dead(rapier_context, rocket_entity, transform.up()) {
        velocity.linvel = Vec2::ZERO;
        velocity.angvel = 0.0;

        transform.translation = rocket.spawn_point.extend(0.0);
        transform.rotation = Quat::from_rotation_z(0.0);

        rocket.reset_rotation(&transform, input.rotation);
    }
}

fn is_rocket_dead(
    rapier_context: Res<'_, RapierContext>,
    rocket_entity: Entity,
    rocket_vector: Vec3,
) -> bool {
    for contact in rapier_context
        .contacts_with(rocket_entity)
        .filter(|contact| contact.has_any_active_contacts())
    {
        if contact.raw.total_impulse_magnitude() > ROCKET_MAX_IMPULSE_MAGNITUDE {
            return true;
        }

        for manifold in &contact.raw.manifolds {
            // this is a bug fix from the original code. it is only needed, if the rocket has a children
            // component and I have no idea (not even close) why it is triggered. original comment:

            // sometimes some of the normals are zero (same as numcontacts === 0) but no idea why. if one is zero then the
            // other is is some random vector that causes the rocket to die. therefore we just ignore the contact in this case
            if manifold.points.len() == 0 {
                continue;
            }

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
