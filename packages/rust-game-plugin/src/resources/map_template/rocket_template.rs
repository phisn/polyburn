use rapier2d::prelude::*;
use rust_proto::RocketModel;

#[derive(Clone)]
pub struct RocketTemplate {
    pub position: Point<f32>,
    pub rotation: f32,
}

impl RocketTemplate {
    pub fn new(rocket: &RocketModel) -> Self {
        Self {
            position: Point::new(rocket.position_x, rocket.position_y),
            rotation: rocket.rotation,
        }
    }
}
