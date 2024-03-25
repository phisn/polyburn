use std::{
    ops::Range,
    sync::Arc,
    time::{Duration, Instant},
};

use bevy::{
    app::PluginsState,
    input::keyboard::KeyboardInput,
    prelude::*,
    sprite::{Material2d, MaterialMesh2dBundle, Mesh2dHandle},
    tasks::tick_global_task_pools_on_main_thread,
    time::TimeUpdateStrategy,
};
use bevy_rapier2d::prelude::*;
use rand::{thread_rng, Rng};

use crate::reinforce::{Agent, Experience};

use super::Control;

#[derive(Resource, Clone)]
pub struct FlappyBirdConfig {
    pub with_graphics: bool,

    pub gravity: f32,
    pub horizontal_velocity: f32,
    pub player_strength: f32,

    pub game_height: f32,
    pub game_width: f32,

    pub obstacle_inside_space: Range<f32>,
    pub obstacle_bot_min: f32,
    pub obstacle_top_max: f32,
    pub obstacle_width: f32,

    pub obstacle_frequency: f32,
}

pub struct FlappyBirdPlugin {
    config: FlappyBirdConfig,
}

impl FlappyBirdPlugin {
    pub fn new(config: FlappyBirdConfig) -> FlappyBirdPlugin {
        FlappyBirdPlugin { config }
    }
}

impl Plugin for FlappyBirdPlugin {
    fn build(&self, app: &mut App) {
        app.add_plugins((RapierPhysicsPlugin::<NoUserData>::pixels_per_meter(1.0),))
            .insert_resource(RapierConfiguration {
                gravity: Vec2::new(0.0, -20.0),
                ..Default::default()
            });

        app.insert_resource(self.config.clone())
            .init_resource::<CurrentReward>()
            .init_resource::<PreviousObservation>()
            .add_systems(Startup, game_startup)
            .add_systems(
                Update,
                (update_control, obstacle_update, player_update).chain(),
            );

        if self.config.with_graphics {
            app.add_plugins(RapierDebugRenderPlugin::default())
                .add_systems(PreUpdate, insert_graphics);
        }
    }
}

#[derive(Component)]
struct Player;

#[derive(Component, Clone)]
struct Obstacle {
    pub bottom_height: f32,
    pub top_height: f32,
    pub space: f32,
}

impl Obstacle {
    pub fn new(config: &FlappyBirdConfig) -> Obstacle {
        let space = thread_rng().gen_range(config.obstacle_inside_space.clone());

        let height_without_bounds =
            config.game_height - config.obstacle_bot_min - config.obstacle_top_max;

        let bottom_range = 0.0..(height_without_bounds - space);

        let bottom_height = thread_rng().gen_range(bottom_range) + config.obstacle_bot_min;
        let top_height = height_without_bounds - bottom_height - space + config.obstacle_top_max;

        Obstacle {
            bottom_height,
            top_height,
            space,
        }
    }
}

#[derive(Component)]
struct ObstacleElement {
    pub height: f32,
}

fn insert_graphics(
    mut commands: Commands,
    config: Res<FlappyBirdConfig>,
    mut meshes: ResMut<Assets<Mesh>>,
    mut materials: ResMut<Assets<ColorMaterial>>,
    obstacle_spawned: Query<(Entity, &ObstacleElement), Added<ObstacleElement>>,
    player_spawned: Query<Entity, Added<Player>>,
) {
    for (obstacle_entity, obstacle) in obstacle_spawned.iter() {
        commands.entity(obstacle_entity).insert((
            Mesh2dHandle(meshes.add(Mesh::from(shape::Quad {
                size: Vec2::new(config.obstacle_width, obstacle.height),
                flip: false,
            }))),
            materials.add(Color::rgb(1.0, 1.0, 1.0).into()),
        ));
    }

    for player_entity in player_spawned.iter() {
        commands.entity(player_entity).insert((
            Mesh2dHandle(meshes.add(Mesh::from(shape::Quad {
                size: Vec2::new(2.0 * 25.0, 2.0 * 25.0),
                flip: false,
            }))),
            materials.add(Color::rgb(1.0, 0.0, 0.0).into()),
        ));
    }
}

fn game_startup(mut commands: Commands, config: Res<FlappyBirdConfig>) {
    commands.spawn(Camera2dBundle {
        transform: Transform::from_translation(Vec3::new(
            config.game_width / 2.0,
            config.game_height / 2.0 - config.obstacle_bot_min * 0.5,
            1.0,
        )),
        projection: OrthographicProjection {
            scale: 0.75,
            ..default()
        },
        ..default()
    });

    commands.spawn((
        RigidBody::Fixed,
        Collider::cuboid(config.game_width / 2.0, config.obstacle_bot_min / 2.0),
        TransformBundle::from_transform(Transform::from_translation(Vec3::new(
            config.game_width / 2.0,
            config.obstacle_bot_min / 2.0 - config.obstacle_bot_min / 2.0,
            0.0,
        ))),
    ));

    commands.spawn((
        RigidBody::Fixed,
        Collider::cuboid(config.game_width / 2.0, config.obstacle_top_max / 2.0),
        TransformBundle::from_transform(Transform::from_translation(Vec3::new(
            config.game_width / 2.0,
            config.game_height - config.obstacle_top_max / 2.0 - config.obstacle_top_max * 0.5,
            0.0,
        ))),
    ));

    // spawn player left in middle with collider and mesh
    commands.spawn((
        Player,
        RigidBody::Dynamic,
        Collider::cuboid(25.0, 25.0),
        SpatialBundle::from_transform(Transform::from_translation(Vec3::new(
            config.game_width / 4.0,
            config.game_height / 2.0,
            0.0,
        ))),
        Velocity::zero(),
        LockedAxes::ROTATION_LOCKED_Z,
        CollidingEntities::default(),
        ActiveEvents::COLLISION_EVENTS
    ));
}

#[derive(Resource, Default)]
struct PreviousObservation {
    action_and_observation: Option<(Vec<f32>, Vec<f32>)>,
}

#[derive(Resource, Default)]
struct CurrentReward {
    reward: f32,
    done: f32
}

fn observe_world(world: &mut World) -> Vec<f32> {
    let player_position_y = world
        .query::<(&Transform, &Player)>()
        .single(world)
        .0
        .translation
        .y;

    let mut obstacle_observations = {
        let mut obstacles = world
            .query::<(&Transform, &Obstacle)>()
            .iter(world)
            .collect::<Vec<_>>();

        obstacles.sort_by(|x, y| x.0.translation.x.total_cmp(&y.0.translation.x));

        obstacles
            .iter()
            .take(2)
            .map(|(transform, obstacle)| {
                let obstacle_position_x = transform.translation.x;

                let obstacle_bottom_height = obstacle.bottom_height;
                let obstacle_top_height = obstacle.top_height;

                vec![
                    obstacle_position_x,
                    (obstacle_bottom_height + obstacle_top_height) * 0.5,
                    obstacle.space,
                ]
            })
            .collect::<Vec<_>>()
    };

    for _ in 0..(2 - obstacle_observations.len()) {
        obstacle_observations.push(vec![10000.0, 0.0, 0.0]);
    }

    let mut observations = vec![player_position_y];

    observations.extend(obstacle_observations.iter().flatten());

    observations
}

fn update_control(world: &mut World) {
    let observation = observe_world(world);

    world.resource_scope(|world, mut control: Mut<Control>| {
        let config = world.resource::<FlappyBirdConfig>();

        // get last action and observation
        let experience = if let Some((last_action, last_observation)) = &world.resource::<PreviousObservation>().action_and_observation {   
            Some(Experience {
                observation: last_observation.clone(),
                action: last_action.clone(),
                next_observation: observation.clone(),
                reward: world.resource::<CurrentReward>().reward,
                done: world.resource::<CurrentReward>().done,
            })
        }
        else {
            None
        };

        let action = match control.as_mut() {
            Control::Player | Control::PlayerWithTrainer(_) => {
                let input = world.resource::<Input<KeyCode>>();

                if input.pressed(KeyCode::Space) {
                    config.player_strength
                } else {
                    config.gravity
                }
            }
            Control::PlayerWithTrainer(agent) => {
                let input = world.resource::<Input<KeyCode>>();
                
                if let Some(experience) = experience {
                    agent.observe(experience);
                }

                if input.pressed(KeyCode::Space) {
                    config.player_strength
                } else {
                    config.gravity
                }
            }
            Control::AgentWithTrainer(agent) => {
                let action = agent.act(&observation);
                let action = action[0];

                if let Some(experience) = experience {
                    agent.observe(experience);
                }

                if action > 0.0 {
                    action * config.player_strength
                } else {
                    config.gravity
                }
            }
            Control::Agent(agent)=> {
                let action = agent.act(&observation);
                let action = action[0];

                if action > 0.0 {
                    config.player_strength
                } else {
                    config.gravity
                }
            }
        };

        let (mut player_velocity, _) = world.query::<(&mut Velocity, &Player)>().single_mut(world);
        player_velocity.linvel.y = action;

        world.insert_resource(PreviousObservation { action_and_observation: Some((vec![action], observation)) });
    });
}

#[derive(Default)]
struct UpdateState {
    time_to_next_obstacle: f32,
}

fn obstacle_update(
    mut commands: Commands,
    mut state: Local<UpdateState>,
    time: Res<Time>,
    config: Res<FlappyBirdConfig>,
    mut obstacle_query: Query<(Entity, &Obstacle, &mut Transform)>,
) {
    state.time_to_next_obstacle -= time.delta_seconds();

    while state.time_to_next_obstacle < 0.0 {
        state.time_to_next_obstacle += config.obstacle_frequency;

        let obstacle = Obstacle::new(config.as_ref());

        commands
            .spawn((
                obstacle.clone(),
                TransformBundle::from_transform(Transform::from_translation(Vec3::new(
                    config.game_width + config.obstacle_width,
                    0.0,
                    0.0,
                ))),
            ))
            .with_children(|parent| {
                parent.spawn((
                    RigidBody::Fixed,
                    Collider::cuboid(config.obstacle_width / 2.0, obstacle.bottom_height / 2.0),
                    SpatialBundle::from_transform(Transform::from_translation(Vec3::new(
                        0.0,
                        obstacle.bottom_height / 2.0,
                        0.0,
                    ))),
                    ObstacleElement {
                        height: obstacle.bottom_height,
                    },
                ));

                parent.spawn((
                    RigidBody::Fixed,
                    Collider::cuboid(config.obstacle_width / 2.0, obstacle.top_height / 2.0),
                    SpatialBundle::from_transform(Transform::from_translation(Vec3::new(
                        0.0,
                        obstacle.bottom_height + obstacle.space + obstacle.top_height / 2.0,
                        0.0,
                    ))),
                    ObstacleElement {
                        height: obstacle.top_height,
                    },
                ));
            });
    }

    for (obstacle_entity, _, mut transform) in obstacle_query.iter_mut() {
        transform.translation.x -= config.horizontal_velocity * time.delta_seconds();

        if transform.translation.x < -config.obstacle_width {
            commands.entity(obstacle_entity).despawn_recursive()
        }
    }
}

fn player_update(
    mut commands: Commands,
    config: Res<FlappyBirdConfig>,
    mut current_reward: ResMut<CurrentReward>,
    mut player_query: Query<(&mut Transform, &CollidingEntities), With<Player>>,
    obstacle_query: Query<Entity, With<Obstacle>>,
) {
    let (mut player_transform, colliding_entities) = player_query.single_mut();

    if player_transform.translation.x < 0.0 {
        player_transform.translation.x = config.game_width / 4.0;

        for obstacle_entity in obstacle_query.iter() {
            commands.entity(obstacle_entity).despawn_recursive();
        }

        current_reward.reward = -100.0;
        current_reward.done = 1.0;
    }
    else {
        if colliding_entities.len() > 0 {
            current_reward.reward = -1.0;
        }
        else {
            current_reward.reward = 1.0;
        }

        current_reward.done = 0.0;
    }
}
