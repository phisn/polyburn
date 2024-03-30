use bevy::{ecs::schedule::SystemConfigs, prelude::*};

pub fn systems() -> SystemConfigs {
    (update_interpolation).into_configs()
}

fn update_interpolation(mut tracking: Query<(&Transform, &mut TrackingForInterpolation)>) {
    for (transform, mut tracking) in tracking.iter_mut() {
        tracking.previous_transform = tracking.transform;
        tracking.transform = transform.clone();
    }
}

#[derive(Component)]
pub struct TrackingForInterpolation {
    pub transform: Transform,
    pub previous_transform: Transform,
}
