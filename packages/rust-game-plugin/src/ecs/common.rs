use bevy::{ecs::schedule::SystemConfigs, prelude::*};

pub fn systems() -> SystemConfigs {
    (update_interpolation).into_configs()
}

fn update_interpolation(mut tracking: Query<(&GlobalTransform, &mut TrackingForInterpolation)>) {
    for (transform, mut tracking) in tracking.iter_mut() {
        tracking.previous_transform = tracking.transform;
        tracking.transform = transform.compute_transform();
    }
}

#[derive(Component)]
pub struct TrackingForInterpolation {
    pub transform: Transform,
    pub previous_transform: Transform,
}
