use bevy::{ecs::schedule::SystemConfigs, prelude::*};
use bevy_rapier2d::dynamics::Velocity;
use rust_game_plugin::ecs::common::TrackingForInterpolation;

#[derive(Component)]
pub struct RocketInterpolated;

#[derive(Component)]
pub struct InterpolationCopy {
    pub copy: Entity,
}

pub fn update() -> SystemConfigs {
    (update_interpolation_copy).into_configs()
}

fn update_interpolation_copy(
    time: Res<Time<Fixed>>,
    mut interpolated: Query<
        (
            &InterpolationCopy,
            &TrackingForInterpolation,
            Option<&Velocity>,
        ),
        With<InterpolationCopy>,
    >,
    mut target: Query<(&mut Transform, Option<&mut Velocity>), Without<InterpolationCopy>>,
) {
    let alpha = time.overstep_fraction();

    for (mut interpolation_copy, tracking, velocity) in interpolated.iter_mut() {
        if let Ok((mut target_transform, target_velocity)) = target.get_mut(interpolation_copy.copy)
        {
            target_transform.translation = tracking
                .previous_transform
                .translation
                .lerp(tracking.transform.translation, alpha);

            target_transform.rotation = tracking
                .previous_transform
                .rotation
                .lerp(tracking.transform.rotation, alpha);

            if let (Some(mut target_velocity), Some(velocity)) = (target_velocity, velocity) {
                target_velocity.linvel = velocity.linvel;
                target_velocity.angvel = velocity.angvel;
            }
        }
    }
}
