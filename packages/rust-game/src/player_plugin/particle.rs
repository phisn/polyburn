use bevy::{
    app::AppLabel,
    ecs::schedule::SystemConfigs,
    prelude::*,
    render::RenderSet,
    sprite::{MaterialMesh2dBundle, Mesh2dHandle},
};
use bevy_xpbd_2d::{prelude::*, PhysicsSchedule, PhysicsStepSet};
use rapier2d::parry::bounding_volume::BoundingVolume;

use self::gradient::Gradient;

mod gradient;
mod particle_spawner;
mod thrust;

#[derive(Event)]
pub struct ParticleSpawnEvent {
    pub position: Vec2,
    pub velocity: Vec2,
    pub size: f32,
    pub gradient: &'static Gradient,
    pub lifetime: f32,
}

#[derive(Component)]
pub struct Particle {
    pub lifetime: i64,
    pub age: i64,
    pub gradient: &'static Gradient,
}

#[derive(AppLabel, Debug, Hash, PartialEq, Eq, Clone)]
pub struct ParticleSubApp;

pub fn update() -> SystemConfigs {
    (particle_spawner, particle_lifetime, thrust::update())
        .chain()
        .into_configs()
}

#[derive(Default)]
struct Counter {
    count: i32,
}

struct ParticleSpawnerState {
    pub material: Handle<ColorMaterial>,
    pub mesh: Mesh2dHandle,
}

fn particle_spawner(
    mut test_state: Local<Option<ParticleSpawnerState>>,
    mut state: Local<Counter>,
    mut commands: Commands,
    mut particle_reader: EventReader<ParticleSpawnEvent>,
    mut meshes: ResMut<Assets<Mesh>>,
    mut materials: ResMut<Assets<ColorMaterial>>,
) {
    if test_state.is_none() {
        *test_state = Some(ParticleSpawnerState {
            material: materials.add(ColorMaterial::from(Color::LIME_GREEN)),
            mesh: meshes
                .add(shape::Quad::new(Vec2::new(0.5, 0.5)).into())
                .into(),
        });
    }

    for event in particle_reader.read() {
        state.count += 1;
        println!("Particle count: {}", state.count);

        commands.spawn((
            Particle {
                lifetime: event.lifetime as i64,
                age: 0,
                gradient: event.gradient,
            },
            RigidBody::Kinematic,
            Collider::ball(event.size),
            LockedAxes::ROTATION_LOCKED,
            LinearVelocity(event.velocity),
            GravityScale(0.0),
            MaterialMesh2dBundle {
                transform: Transform::from_translation(event.position.extend(-1.0)),
                mesh: test_state.as_ref().unwrap().mesh.clone(),
                material: test_state.as_ref().unwrap().material.clone(),
                ..Default::default()
            },
            CollisionLayers::none(),
        ));
    }
}

fn particle_lifetime(
    mut commands: Commands,
    time: Res<Time>,
    mut query: Query<(Entity, &mut Particle, &mut Handle<ColorMaterial>)>,
    mut materials: ResMut<Assets<ColorMaterial>>,
) {
    for (entity, mut particle, material) in query.iter_mut() {
        if let Some(material) = materials.get_mut(material.id()) {
            let age_ratio = particle.age as f32 / particle.lifetime as f32;
            material.color = particle.gradient.pick_color(age_ratio);
        }

        particle.age += 0 * time.delta().as_millis() as i64;

        if particle.age >= particle.lifetime {
            commands.entity(entity).despawn();
        }
    }
}

// Collects pairs of potentially colliding entities into the BroadCollisionPairs resource provided by the physics engine.
// A brute force algorithm is used for simplicity.
pub struct BruteForceBroadPhasePlugin;

impl Plugin for BruteForceBroadPhasePlugin {
    fn build(&self, app: &mut App) {
        // Make sure the PhysicsSchedule is available
        let physics_schedule = app
            .get_schedule_mut(PhysicsSchedule)
            .expect("add PhysicsSchedule first");
    }
}
