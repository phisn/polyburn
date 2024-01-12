use bevy::prelude::*;
use bevy_rapier2d::prelude::*;

use self::systems::{core_runner, CoreInternalSchedule};

pub mod game_config;
pub mod map_template;
pub mod replay;
pub mod rocket;
mod shape;
mod systems;

#[derive(Default)]
pub struct CorePlugin;

#[derive(SystemSet, Hash, Debug, Clone, Eq, PartialEq)]
pub struct CorePluginSet;

impl Plugin for CorePlugin {
    fn build(&self, app: &mut App) {
        app.insert_resource(RapierConfiguration {
            timestep_mode: TimestepMode::Fixed {
                dt: 1.0 / 60.0,
                substeps: 1,
            },
            gravity: Vec2::new(0.0, -20.0),
            ..Default::default()
        })
        .add_plugins(
            RapierPhysicsPlugin::<NoUserData>::pixels_per_meter(1.0)
                .in_schedule(CoreInternalSchedule),
        )
        .add_systems(
            CoreInternalSchedule,
            systems::systems().before(PhysicsSet::SyncBackend),
        )
        .add_systems(FixedUpdate, core_runner.in_set(CorePluginSet));
    }
}
