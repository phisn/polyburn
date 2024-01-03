use bevy::{
    app::*,
    ecs::schedule::{IntoSystemConfigs, SystemSet},
    math::Vec2,
};
use bevy_rapier2d::plugin::*;

pub mod map_template;
pub mod rocket;
mod shape;

#[derive(Default)]
pub struct CorePlugin;

#[derive(SystemSet, Hash, Debug, Clone, Eq, PartialEq)]
pub struct CorePluginSet;

fn test() {}

impl Plugin for CorePlugin {
    fn build(&self, app: &mut App) {
        let systems = (test).chain().into_configs();

        app.insert_resource(RapierConfiguration {
            timestep_mode: TimestepMode::Fixed {
                dt: 1.0 / 60.0,
                substeps: 1,
            },
            gravity: Vec2::new(0.0, -20.0),
            ..Default::default()
        })
        .add_systems(
            FixedUpdate,
            systems
                .in_set(CorePluginSet)
                .before(PhysicsSet::SyncBackend),
        );
    }
}
