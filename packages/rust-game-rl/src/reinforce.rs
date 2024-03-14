#[derive(Clone)]
pub struct Experience {
    pub observation: Vec<f32>,
    pub action: Vec<f32>,
    pub next_observation: Vec<f32>,

    pub reward: f32,
    pub done: f32,
}

// needs send and sync to be used in bevy as resource
pub trait Agent: Send + Sync {
    // action is always capped between -1 and 1
    fn act(&self, observation: &Vec<f32>) -> Vec<f32>;
}

// needs send and sync to be used in bevy as resource
pub trait AgentTrainer: Send + Sync {
    fn observe(&mut self, experience: Experience);
}
