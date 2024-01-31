use bevy::math::{Rect, Vec2};
use rust_proto::LevelModel;

pub struct LevelTemplate {
    pub position: Vec2,
    pub rotation: f32,

    pub camera: Rect,

    pub capture_area_left: f32,
    pub capture_area_right: f32,
}

impl LevelTemplate {
    pub fn new(level: &LevelModel) -> Self {
        Self {
            position: Vec2::new(level.position_x, level.position_y),
            rotation: level.rotation,

            camera: Rect {
                min: Vec2::new(level.camera_top_left_x, level.camera_top_left_y),
                max: Vec2::new(level.camera_bottom_right_x, level.camera_bottom_right_y),
            },

            capture_area_left: level.capture_area_left,
            capture_area_right: level.capture_area_right,
        }
    }
}
