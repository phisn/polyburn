use bevy::ecs::{event::Event, system::Resource};

pub struct Replay;

#[derive(Event, Clone, Copy)]
pub struct FrameInput {
    pub rotation: f32,
    pub thrust: bool,
}

#[derive(Resource)]
pub struct CurrentFrameInput(pub FrameInput);
