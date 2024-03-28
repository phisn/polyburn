use bevy::ecs::prelude::*;
use rust_game_plugin::FrameInput;
use serde::{Deserialize, Serialize};

#[derive(Default, Resource, Serialize, Deserialize)]
pub struct InputTracker {
    inputs: Vec<FrameInput>,
}

impl InputTracker {
    pub fn push(&mut self, input: FrameInput) {
        self.inputs.push(input);
    }

    pub fn inputs(&self) -> &[FrameInput] {
        &self.inputs
    }
}
