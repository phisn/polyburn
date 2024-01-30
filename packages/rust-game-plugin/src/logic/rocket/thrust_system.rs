use bevy::prelude::*;
use bevy_rapier2d::prelude::*;

use crate::{FrameInput, GameConfig};

use super::Rocket;

pub fn thrust_system(
    input: Res<FrameInput>,
    mut rocket_query: Query<(Entity, &mut Transform, &mut ExternalImpulse), With<Rocket>>,
    game_config: Res<GameConfig>,
    rapier_context: Res<RapierContext>,
) {
    let (entity, mut rocket_transform, mut rocket_impulse) = rocket_query.single_mut();

    if input.thrust {
        let mut force = Vec2::new(0.0, game_config.thrust_value);

        // shoot a ray of length thrustDistance in the direction downwards from the rocket
        let ray_origin = rocket_transform.translation.truncate();
        let ray_dir = rocket_transform
            .rotation
            .mul_vec3(Vec3::new(0.0, -1.0, 0.0))
            .truncate();

        let max_toi = game_config.thrust_distance * 3.6 + 3.6 * 0.5;

        if let Some(_) = rapier_context.cast_ray(
            ray_origin,
            ray_dir,
            max_toi,
            false,
            QueryFilter::default().exclude_rigid_body(entity),
        ) {
            force *= game_config.thrust_ground_multiplier;
        }

        let rotated_force = rocket_transform.rotation * force.extend(0.0);
        // println!("Force: {:?}", rotated_force);
        rocket_impulse.impulse = rotated_force.truncate()
    }
}
