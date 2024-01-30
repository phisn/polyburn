use serde::Serialize;

#[derive(Serialize)]
pub enum InputState {
    Keyboard { rotation: f32 },
}

impl Default for InputState {
    fn default() -> Self {
        InputState::Keyboard { rotation: 0.0 }
    }
}
