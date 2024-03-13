use bevy::{ecs::schedule::ScheduleLabel, prelude::*};

use super::Environment;

pub struct CartPolePlugin;

#[derive(ScheduleLabel, Hash, Debug, Eq, PartialEq, Clone)]
struct EnvironmentSchedule;

impl Plugin for CartPolePlugin {
    fn build(&self, app: &mut App) {
    }
}

pub fn environment(app: &App) { // -> &dyn Environment {
}
