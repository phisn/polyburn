use bevy::{
    ecs::schedule::{ScheduleLabel, SystemConfigs},
    prelude::*,
};

use super::replay::{CurrentFrameInput, FrameInput};

mod input_handler;

#[derive(ScheduleLabel, Clone, Copy, Debug, Eq, Hash, PartialEq)]
pub struct CoreInternalSchedule;

pub fn core_runner(world: &mut World) {
    world.resource_scope(|world: &mut World, input_events: Mut<Events<FrameInput>>| {
        let mut reader = input_events.get_reader();

        world.schedule_scope(CoreInternalSchedule, |world, schedule| {
            for event in reader.read(&input_events) {
                let mut current_input = world.get_resource_mut::<CurrentFrameInput>().unwrap();
                current_input.0 = event.clone();

                schedule.run(world);
            }
        });
    });
}

pub fn systems() -> SystemConfigs {
    (input_handler::input_handler).chain().into_configs()
}
