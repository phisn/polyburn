use bevy::{ecs::schedule::ScheduleLabel, prelude::*};
use bevy_rapier2d::prelude::*;

#[derive(Default)]
pub struct GamePlugin;

#[derive(SystemSet, Clone, Debug, Eq, Hash, PartialEq)]
pub struct GamePluginSet;

#[derive(ScheduleLabel, Clone, Debug, Eq, Hash, PartialEq)]
pub struct GamePluginSchedule;

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
            .init_resource::<GameConfig>()
            .add_plugins(
                RapierPhysicsPlugin::<NoUserData>::pixels_per_meter(1.0)
                    .in_schedule(CoreInternalSchedule),
            )
            .add_systems(
                CoreInternalSchedule,
                runner::systems().before(PhysicsSet::SyncBackend),
            )
            .add_systems(FixedUpdate, core_runner.in_set(GamePluginSet))
            .add_systems(Startup, runner::systems_in_startup());
    }
}

pub fn core_runner(world: &mut World) {
    world.resource_scope(
        |world: &mut World, mut input_events: Mut<Events<FrameInput>>| {
            let mut reader = input_events.get_reader();

            if reader.is_empty(&input_events) {
                return;
            }

            world.schedule_scope(CoreInternalSchedule, |world, schedule| {
                for event in reader.read(&input_events) {
                    world.insert_resource(event.clone());
                    schedule.run(world);
                }
            });

            input_events.clear();
        },
    );
}
