use bevy::{
    app::{AppLabel, SubApp},
    ecs::schedule::SystemConfigs,
    prelude::*,
};
use bevy_rapier2d::prelude::*;
use rust_game_plugin::MapTemplate;

#[derive(AppLabel, Debug, Hash, PartialEq, Eq, Clone)]
pub struct ParticleSubApp;

#[derive(Resource)]
pub struct ParticleController {
    physics: RapierContext,
}

impl ParticleController {
    pub fn new() -> Self {
        ParticleController {
            physics: RapierContext::default(),
        }
    }
}

pub fn init_particle_app(app: &mut App) {
    let mut particle_app = App::new();

    let hz = 30.0;

    particle_app
        .insert_resource(RapierConfiguration {
            timestep_mode: TimestepMode::Interpolated {
                dt: 1.0 / hz,
                substeps: 1,
                time_scale: 1.0,
            },
            gravity: Vec2::new(0.0, -20.0),
            ..Default::default()
        })
        .insert_resource(Time::from_hz(hz as f64));

    particle_app
        .insert_resource(app.world.resource::<MapTemplate>().clone())
        .add_systems(
            Startup,
            (rust_game_plugin::ecs::shape::startup)
                .chain()
                .into_configs(),
        );

    app.insert_sub_app(
        ParticleSubApp,
        SubApp::new(particle_app, |mut world, mut app| {}),
    );
}
