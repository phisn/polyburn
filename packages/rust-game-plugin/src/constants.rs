pub const LEVEL_TICKS_TO_CAPTURE: i32 = 60;
pub const LEVEL_CAPTURE_HEIGHT: f32 = 0.5;
pub const ROCKET_MAX_IMPULSE_MAGNITUDE: f32 = 300.0;
pub const ROCKET_MAX_VELOCITY_CAPTURE: f32 = 0.001;

pub struct EntityEntry {
    pub width: f32,
    pub height: f32,
}

pub const ENTITY_ROCKET_ENTRY: EntityEntry = EntityEntry {
    width: 1.8,
    height: 3.6,
};

pub const ENTITY_LEVEL_ENTRY: EntityEntry = EntityEntry {
    width: 1.65,
    height: 2.616,
};
