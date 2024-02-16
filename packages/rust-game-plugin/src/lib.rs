use bevy::{
    app::PluginsState, ecs::schedule::ScheduleLabel, prelude::*,
    tasks::tick_global_task_pools_on_main_thread, utils::intern::Interned,
};
use bevy_rapier2d::prelude::*;

pub mod constants;
pub mod ecs;
mod resources;

use ecs::level::{LevelCaptureStateEvent, LevelCapturedEvent};
pub use resources::*;

pub struct GamePlugin {
    runner_schedule: Interned<dyn ScheduleLabel>,
}

#[derive(SystemSet, Clone, Debug, Eq, Hash, PartialEq)]
pub struct GamePluginSet;

#[derive(ScheduleLabel, Clone, Debug, Eq, Hash, PartialEq)]
pub struct GamePluginSchedule;

impl Default for GamePlugin {
    fn default() -> Self {
        GamePlugin {
            runner_schedule: FixedUpdate.intern(),
        }
    }
}

impl Plugin for GamePlugin {
    fn build(&self, app: &mut App) {
        app.insert_resource(RapierConfiguration {
            timestep_mode: TimestepMode::Fixed {
                dt: 1.0 / 60.0,
                substeps: 1,
            },
            gravity: Vec2::new(0.0, -20.0),
            ..Default::default()
        })
        .insert_resource(Time::from_hz(60.0));

        app.add_event::<FrameInput>()
            .add_event::<LevelCapturedEvent>()
            .add_event::<LevelCaptureStateEvent>()
            .init_resource::<GameConfig>()
            .add_plugins(
                RapierPhysicsPlugin::<NoUserData>::pixels_per_meter(1.0)
                    .in_schedule(GamePluginSchedule),
            )
            .add_systems(
                GamePluginSchedule,
                ecs::systems().before(PhysicsSet::SyncBackend),
            )
            .add_systems(Startup, ecs::startup().in_set(GamePluginSet))
            .add_systems(self.runner_schedule, core_runner.in_set(GamePluginSet));

        app.world.init_resource::<FrameInput>();
    }
}

impl GamePlugin {
    pub fn in_schedule(mut self, schedule: impl ScheduleLabel) -> Self {
        self.runner_schedule = schedule.intern();
        self
    }
}

pub fn core_runner(world: &mut World) {
    world.resource_scope(
        |world: &mut World, mut input_events: Mut<Events<FrameInput>>| {
            let mut reader = input_events.get_reader();

            if reader.is_empty(&input_events) {
                return;
            }

            world.schedule_scope(GamePluginSchedule, |world, schedule| {
                for event in reader.read(&input_events) {
                    world.insert_resource(event.clone());
                    schedule.run(world);
                }
            });

            input_events.clear();
        },
    );
}

pub fn validate(map_template: MapTemplate, inputs: &Vec<FrameInput>) {
    let mut app = App::new();

    app.add_plugins(MinimalPlugins);

    app.set_runner(move |mut app: App| {
        while app.plugins_state() == PluginsState::Adding {
            #[cfg(not(target_arch = "wasm32"))]
            tick_global_task_pools_on_main_thread();
        }

        app.finish();
        app.cleanup();

        app.update();
    });

    app.insert_resource(map_template)
        .add_plugins(GamePlugin::default().in_schedule(Update));

    app.world
        .resource_scope(|_: &mut World, mut input_events: Mut<Events<FrameInput>>| {
            for input in inputs {
                input_events.send(input.clone());
            }
        });

    while app.plugins_state() == PluginsState::Adding {
        #[cfg(not(target_arch = "wasm32"))]
        tick_global_task_pools_on_main_thread();
    }

    app.finish();
    app.cleanup();
    app.update();
}
