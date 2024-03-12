use serde::{Deserialize, Serialize};

pub trait Agent<Action, State> {
    fn train(&mut self, env: &mut dyn Environment<Action, State>, num_episodes: u32);
    fn act(&self, state: State) -> Action;
}

pub enum EnvironmentState<State> {
    Terminal,
    Ongoing(State),
}

pub trait Environment<Action, State> {
    fn reset(&mut self);
    fn observe(&self) -> EnvironmentState<State>;
    fn step(&mut self, action: Action) -> f32;
}

pub trait AgentTrainer {}
