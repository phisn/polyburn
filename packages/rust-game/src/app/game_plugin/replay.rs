use bevy::ecs::{event::Event, system::Resource};

pub struct Replay;

#[derive(Resource, Event, Clone, Copy)]
pub struct FrameInput {
    pub rotation: f32,
    pub thrust: bool,
}
