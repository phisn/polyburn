use bevy::prelude::*;

#[derive(Resource)]
pub struct GameConfig {
    pub thrust_distance: f32,
    pub thrust_value: f32,
    pub thrust_ground_multiplier: f32,
    pub explosion_angle: f32,
}

impl Default for GameConfig {
    fn default() -> Self {
        GameConfig {
            thrust_distance: 1.0,
            thrust_value: 7.3,
            thrust_ground_multiplier: 1.3,
            explosion_angle: 0.3,
        }
    }
}
