use bevy::prelude::*;
use bevy_rapier2d::prelude::*;

use super::Rocket;
use crate::FrameInput;

#[derive(Default)]
pub struct InputHandlerState {
    offset: f32,
}

pub fn apply_rotation(
    mut state: Local<InputHandlerState>,
    input: Res<FrameInput>,
    mut rocket_query: Query<(&CollidingEntities, &mut Transform), With<Rocket>>,
) {
    let (colliding_entities, mut rocket_transform) = rocket_query.single_mut();

    if colliding_entities.len() == 0 {
        update_rotation(&mut rocket_transform, &input, &state);
    } else {
        reset_rotation(&mut state, &rocket_transform, &input);
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
