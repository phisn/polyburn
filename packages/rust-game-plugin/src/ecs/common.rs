use bevy::{ecs::schedule::SystemConfigs, prelude::*};
use rapier2d::na::Isometry2;

pub fn after_write_back() -> SystemConfigs {
    (update_interpolation).into_configs()
}

fn update_interpolation(mut tracking: Query<(&GlobalTransform, &mut TrackingForInterpolation)>) {
    for (transform, mut tracking) in tracking.iter_mut() {
        let transform = transform.compute_transform();

        tracking.previous = tracking.current;
        tracking.current = Isometry2::new(
            transform.translation.truncate().into(),
            transform.rotation.to_euler(EulerRot::XYZ).2,
        );
    }
}

#[derive(Component)]
pub struct TrackingForInterpolation {
    pub current: Isometry2<f32>,
    pub previous: Isometry2<f32>,
}
