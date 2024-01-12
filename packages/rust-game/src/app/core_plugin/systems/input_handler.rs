use bevy::prelude::*;
use bevy_rapier2d::prelude::*;

use crate::app::core_plugin::{
    game_config::GameConfig,
    replay::{CurrentFrameInput, FrameInput},
    rocket::Rocket,
};

#[derive(Default)]
pub struct InputHandlerState {
    offset: f32,
}

pub fn input_handler(
    mut current_input: Res<CurrentFrameInput>,
    mut state: Local<InputHandlerState>,
    mut rocket_query: Query<
        (
            Entity,
            &CollidingEntities,
            &mut Transform,
            &mut ExternalImpulse,
        ),
        With<Rocket>,
    >,
    game_config: Res<GameConfig>,
    rapier_context: Res<RapierContext>,
) {
    let (entity, colliding_entities, mut rocket_transform, mut rocket_impulse) =
        rocket_query.single_mut();

    let input = current_input.0;

    if colliding_entities.len() == 0 {
        update_rotation(&mut rocket_transform, &input, &state);
    } else {
        reset_rotation(&mut state, &rocket_transform, &input);
    }

    if input.thrust {
        let mut force = Vec2::new(0.0, game_config.thrust_value);

        // shoot a ray of length thrustDistance in the direction downwards from the rocket
        let ray_origin = rocket_transform.translation.truncate();
        let ray_dir = rocket_transform
            .rotation
            .mul_vec3(Vec3::new(0.0, -1.0, 0.0))
            .truncate();

        let max_toi = game_config.thrust_distance * 3.6 + 3.6 * 0.5;

        println!("Ray origin: {:?}, dir: {:?}", ray_origin, ray_dir);

        if let Some(_) = rapier_context.cast_ray(
            ray_origin,
            ray_dir,
            max_toi,
            false,
            QueryFilter::default().exclude_rigid_body(entity),
        ) {
            println!("Hit ground!");
            force *= game_config.thrust_ground_multiplier;
        }

        let rotated_force = rocket_transform.rotation * force.extend(0.0);
        // println!("Force: {:?}", rotated_force);
        rocket_impulse.impulse = rotated_force.truncate()
    }
}

fn reset_rotation(
    state: &mut Local<InputHandlerState>,
    rocket_transform: &Mut<Transform>,
    input: &FrameInput,
) {
    state.offset = rocket_transform.rotation.to_euler(EulerRot::YXZ).2 - input.rotation;
}

fn update_rotation(
    rocket_transform: &mut Mut<Transform>,
    input: &FrameInput,
    state: &Local<InputHandlerState>,
) {
    rocket_transform.rotation = Quat::from_rotation_z(input.rotation + state.offset);
}
