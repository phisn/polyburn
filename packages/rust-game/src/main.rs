use base64::*;
use bevy::prelude::*;
use bevy_rapier2d::prelude::*;
use i_float::{
    fix_float::{FixConvert, FixMath},
    fix_vec::FixVec,
};
use i_overlay::bool::fill_rule::FillRule;
use i_shape::fix_shape::FixShape;
use i_triangle::{
    delaunay::triangulate::ShapeTriangulate, triangulation::triangulate::Triangulate,
};
use player_plugin::InputTracker;
use rust_game_plugin::{ecs::rocket::Rocket, GamePlugin, MapTemplate, ShapeVertex};

mod player_plugin;

fn input_catpure_system(
    input_tracker: Res<InputTracker>,
    keyboard: Res<Input<KeyCode>>,
    rocket_query: Query<(&Rocket, &Transform)>,
) {
    if keyboard.just_pressed(KeyCode::L) && keyboard.pressed(KeyCode::ControlLeft) {
        println!(
            "Inputs({:?}), \n\n\n\n\n\n\n\n\n\n\n\n State({:?})",
            base64::engine::general_purpose::STANDARD
                .encode(bincode::serialize(&input_tracker.into_inner()).unwrap()),
            rocket_query.single().1.translation
        );
    }
}
pub fn main() {
    let mut app = App::new();

    let map = "CscCCgZOb3JtYWwSvAIKCg2F65XBFTXTGkISKA2kcLrBFZfjFkIlAAAAwi1SuIlCNa5H+UE9H4X/QUUAAABATQAAAEASKA1SuMFBFZmRGkIlhetRQS3NzFJCNSlcp0I9zcxEQUUAAABATQAAAEASKA0AgEVCFfIboEElAAAoQi0K189BNaRw4UI9rkdZwUUAAABATQAAAEASKA171MBCFcubHcElmpm5Qi0K189BNY/CI0M9rkdZwUUAAABATQAAAEASLQ1syOFCFToytkEdVGuzOiWamblCLSlcZUI1XI8jQz3NzIhBRQAAAEBNAAAAQBItDR/lAUMVk9VNQh2fUDa1JaRw9UItexRsQjWF60FDPQAAlEFFAAAAQE0AAABAEigNw1UzQxVpqkFCJdejJEMtBW94QjXXo0JDPQVvAEJFAAAAQE0AAABACu4KCg1Ob3JtYWwgU2hhcGVzEtwKGt8GCtwGP4UAws3MNEGgEEAAZjYAAP///wB1PAAU////AF5PABT///8AyUtPxP///wAzSg3L////AMBJAcj///8AE0Umzf///wCMVAo5////AJNRpDr///8AVE0WVP///wD0vlZLAAD/AEPI7Bn///8AhcPlOAAA/wAFQZrF////ADS9F8f///8AJMIuwf///wC5xvvF////AOrJ1rf///8Ac8ikQP///wBAxfRF////AGkxi0n///8Aj0LxQgAA/wB1xWY9////AJ/HZAlQUP4AzcUBvQAA/wDwQFzE////ADDGR73///8As8eZPoiI8QBxxWQ3rKz/AFw3LMQAAP8AwkNRtP///wC2RKO4////AEhBe8EAAP8AS0WPPP///wAdSaSx////AMw/Ucj///8A7MBNxv///wDmxnG9////AELCFLr///8Aw8UOof///wAKxCg4AAD/ALg8OMDZ2fsA4j9NwP///wCkxB+/AADwAHGwrr54ePgAVERcwv///wAPwXbA////APW0H0EAAPgASLtnv////wALM67DJSX/AFJApL////8AZj4uwP///wBcu+HATU3/AIU7+8H///8AXMK8Lf///wB7wjM/AAD4AHDCx8D///8AFEH7wP///wAAvnvE////AOTGChL///8A6bncRP///wCAQddAAAD4AB/AxLH///8AIL9RPQAA+ACZwqvG////AOLCLkQAAPgAIcTrwP///wDtwQPH////AOLJbqz///8ALsR6QwAA+AD+x8zA////APtF90kyMv8AH7mZQCcn/wCNxHo8tbX/AIDAiETKyv8AXEAgSgAA+AClyAqS////AH9EG0n///8AS0ypRP///wAxSIK7MDToANjBdUf///8A58yjxP///wCByD1EMDToAIzCYMv///8AnMq3MzA06AC+QenF////ANzGT0T///8AtMFSR////wBzRb85lpj/AFJALEQwNOgAqMIpPjA06AAgyiCF////AAPEE77///8AzT4FSnN1/wAzxWFCMDToAA23PcKXl/8AGcLmQDA06ADMPUnJu77/AFrGxsL///8A1TRGSjA06ACKwik8MDToAE3Apcn///8Ar8SawP///wBsygqP////ABHI8z0wNOgAAABTzv///wAa9wMK9APNzJNCj8JlQP///wBmtly8////ABa2jsg2Nv8AO0SENwAA+ACkvrtEvLz/AG0uOEX///8A4UaHPv///wA+QlXFAAD4AApB2L4AAPgAeDLVRP///wATSHHAAAD4ADhA3EP///8As0MKvAAA8ADOPxM4AAD4AEjBTUD///8Arj5TP3B0+ACyKw9DaGz4ALm6eDz///8AKT4MSP///wDhPy5CAAD/APS/XEL///8A+EV6PwAA/wAdsXtBp6f/AGzEpEEAAP8AisfEuf///wDXwVJI////AJpEaUf///8AhUfxQP///wB7RA3FAAD/ANdBTzUAAP8AC8C9Rv///wBGQoVE////APRMpDz///8A7kS3yAAA/wDLR9HB////AFLHNscAAP8AR0HNwf///wDsvtLGAAD/AABE5kD///8AD0JIRv///wD0RNJA////AEVFqcD///8A3ESpwwAA/wAuwgtJ////AARBqEj///8ALUdbSf///wA01Hks////AHjCAL3///8AF8s5x////wC4vlPP////AME1O8f///8AhsIAPgAA+ABcxZXC7e3/AIrEpUMAAPgAjcbDxcvL/wBdQFzF////AEjI+8EAAOAAQ0GZvf///wAGN77AFRX/APlFXDz///8AikEzwkhI+ADcQmoy////AArNAgoHUmV2ZXJzZRLBAgoPDRydLkMVk5lFQh2z7Zk2EigNpHC6wRWX4xZCJQAAAMItAABMQjUAAEDBPR+F/0FFAAAAQE0AAABAEigNUrjBQRWZkRpCJR+FAMItZuaJQjUAAPpBPQAAAEJFAAAAQE0AAABAEigNAIBFQhXyG6BBJQAAUEEthetRQjWkcKdCPVK4TkFFAAAAQE0AAABAEigNe9TAQhXLmx3BJTQzKEItCtfPQTUeBeJCPa5HWcFFAAAAQE0AAABAEi0NbMjhQhU6MrZBHVRrszolmpm5Qi1SuNRBNVyPI0M9ZmZawUUAAABATQAAAEASLQ0f5QFDFZPVTUIdn1A2tSWk8LlCLXsUZUI1hSskQz0AAIZBRQAAAEBNAAAAQBIoDcNVM0MVaapBQiUAgPVCLQAAbEI1AABCQz0AAJRBRQAAAEBNAAAAQBIhCgZOb3JtYWwSFwoNTm9ybWFsIFNoYXBlcwoGTm9ybWFsEiMKB1JldmVyc2USGAoNTm9ybWFsIFNoYXBlcwoHUmV2ZXJzZQ==";
    let map_template = MapTemplate::new(map, "Normal");

    app.add_plugins(DefaultPlugins)
        .add_plugins(RapierDebugRenderPlugin::default());

    app.insert_resource(map_template)
        .add_plugins(GamePlugin::default())
        .add_plugins(player_plugin::PlayerPlugin::default());

    app.add_systems(PostUpdate, input_catpure_system);

    app.run();
}

/*
use std::borrow::Borrow;

use base64::Engine;
use bevy::{prelude::*, window::PrimaryWindow};
use bevy_prototype_lyon::{
    entity::Path, geometry::GeometryBuilder, prelude::tess::path::PathEvent, shapes,
};
use bevy_rapier2d::prelude::*;
use prost::Message;
use rapier2d::math::Isometry;
use rust_proto::RocketModel;

mod app;

struct FrameInput {
    pub rotation: f32,
    pub thrust: bool,
}

#[derive(Resource)]
struct FrameInputTrackingResource<'a> {
    pub inputs: &'a mut Vec<FrameInput>,
}

fn main() {
    app::run();

    let mut app = App::new();

    app.add_plugins(DefaultPlugins)
        .add_plugins(RapierPhysicsPlugin::<NoUserData>::pixels_per_meter(1.0).in_fixed_schedule())
        .add_plugins(RapierDebugRenderPlugin::default())
        .add_plugins(GamePlugin)
        .insert_resource(Time::from_hz(60.0));

    app.run();

    for input in app
        .world
        .get_resource::<FrameInputTrackingResource>()
        .unwrap()
        .inputs
        .iter()
    {
        println!("Rotation: {}, Thrust: {}", input.rotation, input.thrust);
    }
}

#[derive(Resource)]
struct MapResource {}

pub struct GamePlugin;

impl Plugin for GamePlugin {
    fn build(&self, app: &mut App) {
        app.insert_resource(MapResource {})
            .insert_resource(RapierConfiguration {
                physics_pipeline_active: true,
                timestep_mode: TimestepMode::Fixed {
                    dt: 1.0 / 60.0,
                    substeps: 1,
                },
                gravity: Vec2::new(0.0, -20.0),
                ..Default::default()
            })
            .add_systems(Startup, init_game_system)
            .add_systems(FixedUpdate, rocket_input.pipe(rocket_input_handler));
    }
}

#[derive(Component, Default)]
struct Rocket {}

#[derive(Bundle, Default)]
struct RocketBundle {
    rocket: Rocket,

    rigid_body: RigidBody,
    collider: Collider,
    colliding_entities: CollidingEntities,

    transform: TransformBundle,
    transform_interpolation: TransformInterpolation,
    external_impulse: ExternalImpulse,
}

#[derive(Component)]
struct Shape {}

#[derive(Bundle)]
struct ShapeBundle {
    rigid_body: RigidBody,
    collider: Collider,
    transform: TransformBundle,
}

fn rocket_collider() -> Option<Collider> {
    let rocket_colliders_vertices = vec![
        vec![
            (-0.894, -1.212),
            (-0.882, -0.33),
            (-0.87, -0.144),
            (-0.834, 0.096),
            (-0.708, 0.588),
            (-0.456, 1.152),
            (-0.198, 1.548),
            (0.00, 1.8),
            (0.198, 1.548),
            (0.456, 1.152),
            (0.708, 0.588),
            (0.834, 0.096),
            (0.87, -0.144),
            (0.882, -0.33),
            (0.894, -1.212),
        ],
        vec![(0.9, -1.8), (0.24, -1.212), (0.894, -1.212)],
        vec![(-0.9, -1.8), (-0.894, -1.212), (-0.24, -1.212)],
    ];

    let rocket_colliders = rocket_colliders_vertices
        .into_iter()
        .map(|points| {
            Collider::convex_hull(
                // floatsarray to vec2 array
                &points
                    .into_iter()
                    .map(|(x, y)| Vec2::new(x, y))
                    .collect::<Vec<Vec2>>(),
            )
        })
        .collect::<Option<Vec<Collider>>>()?;

    let compound = Collider::compound(
        rocket_colliders
            .iter()
            .map(|collider| (Vec2::ZERO, 0.0, collider.clone()))
            .collect(),
    );

    Some(compound)
}

fn init_game_system(mut commands: Commands) {
    let world_str = "CscCCgZOb3JtYWwSvAIKCg2F65XBFTXTGkISKA2kcLrBFZfjFkIlAAAAwi1SuIlCNa5H+UE9H4X/QUUAAABATQAAAEASKA1SuMFBFZmRGkIlhetRQS3NzFJCNSlcp0I9zcxEQUUAAABATQAAAEASKA0AgEVCFfIboEElAAAoQi0K189BNaRw4UI9rkdZwUUAAABATQAAAEASKA171MBCFcubHcElmpm5Qi0K189BNY/CI0M9rkdZwUUAAABATQAAAEASLQ1syOFCFToytkEdVGuzOiWamblCLSlcZUI1XI8jQz3NzIhBRQAAAEBNAAAAQBItDR/lAUMVk9VNQh2fUDa1JaRw9UItexRsQjWF60FDPQAAlEFFAAAAQE0AAABAEigNw1UzQxVpqkFCJdejJEMtBW94QjXXo0JDPQVvAEJFAAAAQE0AAABACu4KCg1Ob3JtYWwgU2hhcGVzEtwKGt8GCtwGP4UAws3MNEGgEEAAZjYAAP///wB1PAAU////AF5PABT///8AyUtPxP///wAzSg3L////AMBJAcj///8AE0Umzf///wCMVAo5////AJNRpDr///8AVE0WVP///wD0vlZLAAD/AEPI7Bn///8AhcPlOAAA/wAFQZrF////ADS9F8f///8AJMIuwf///wC5xvvF////AOrJ1rf///8Ac8ikQP///wBAxfRF////AGkxi0n///8Aj0LxQgAA/wB1xWY9////AJ/HZAlQUP4AzcUBvQAA/wDwQFzE////ADDGR73///8As8eZPoiI8QBxxWQ3rKz/AFw3LMQAAP8AwkNRtP///wC2RKO4////AEhBe8EAAP8AS0WPPP///wAdSaSx////AMw/Ucj///8A7MBNxv///wDmxnG9////AELCFLr///8Aw8UOof///wAKxCg4AAD/ALg8OMDZ2fsA4j9NwP///wCkxB+/AADwAHGwrr54ePgAVERcwv///wAPwXbA////APW0H0EAAPgASLtnv////wALM67DJSX/AFJApL////8AZj4uwP///wBcu+HATU3/AIU7+8H///8AXMK8Lf///wB7wjM/AAD4AHDCx8D///8AFEH7wP///wAAvnvE////AOTGChL///8A6bncRP///wCAQddAAAD4AB/AxLH///8AIL9RPQAA+ACZwqvG////AOLCLkQAAPgAIcTrwP///wDtwQPH////AOLJbqz///8ALsR6QwAA+AD+x8zA////APtF90kyMv8AH7mZQCcn/wCNxHo8tbX/AIDAiETKyv8AXEAgSgAA+AClyAqS////AH9EG0n///8AS0ypRP///wAxSIK7MDToANjBdUf///8A58yjxP///wCByD1EMDToAIzCYMv///8AnMq3MzA06AC+QenF////ANzGT0T///8AtMFSR////wBzRb85lpj/AFJALEQwNOgAqMIpPjA06AAgyiCF////AAPEE77///8AzT4FSnN1/wAzxWFCMDToAA23PcKXl/8AGcLmQDA06ADMPUnJu77/AFrGxsL///8A1TRGSjA06ACKwik8MDToAE3Apcn///8Ar8SawP///wBsygqP////ABHI8z0wNOgAAABTzv///wAa9wMK9APNzJNCj8JlQP///wBmtly8////ABa2jsg2Nv8AO0SENwAA+ACkvrtEvLz/AG0uOEX///8A4UaHPv///wA+QlXFAAD4AApB2L4AAPgAeDLVRP///wATSHHAAAD4ADhA3EP///8As0MKvAAA8ADOPxM4AAD4AEjBTUD///8Arj5TP3B0+ACyKw9DaGz4ALm6eDz///8AKT4MSP///wDhPy5CAAD/APS/XEL///8A+EV6PwAA/wAdsXtBp6f/AGzEpEEAAP8AisfEuf///wDXwVJI////AJpEaUf///8AhUfxQP///wB7RA3FAAD/ANdBTzUAAP8AC8C9Rv///wBGQoVE////APRMpDz///8A7kS3yAAA/wDLR9HB////AFLHNscAAP8AR0HNwf///wDsvtLGAAD/AABE5kD///8AD0JIRv///wD0RNJA////AEVFqcD///8A3ESpwwAA/wAuwgtJ////AARBqEj///8ALUdbSf///wA01Hks////AHjCAL3///8AF8s5x////wC4vlPP////AME1O8f///8AhsIAPgAA+ABcxZXC7e3/AIrEpUMAAPgAjcbDxcvL/wBdQFzF////AEjI+8EAAOAAQ0GZvf///wAGN77AFRX/APlFXDz///8AikEzwkhI+ADcQmoy////AArNAgoHUmV2ZXJzZRLBAgoPDRydLkMVk5lFQh2z7Zk2EigNpHC6wRWX4xZCJQAAAMItAABMQjUAAEDBPR+F/0FFAAAAQE0AAABAEigNUrjBQRWZkRpCJR+FAMItZuaJQjUAAPpBPQAAAEJFAAAAQE0AAABAEigNAIBFQhXyG6BBJQAAUEEthetRQjWkcKdCPVK4TkFFAAAAQE0AAABAEigNe9TAQhXLmx3BJTQzKEItCtfPQTUeBeJCPa5HWcFFAAAAQE0AAABAEi0NbMjhQhU6MrZBHVRrszolmpm5Qi1SuNRBNVyPI0M9ZmZawUUAAABATQAAAEASLQ0f5QFDFZPVTUIdn1A2tSWk8LlCLXsUZUI1hSskQz0AAIZBRQAAAEBNAAAAQBIoDcNVM0MVaapBQiUAgPVCLQAAbEI1AABCQz0AAJRBRQAAAEBNAAAAQBIhCgZOb3JtYWwSFwoNTm9ybWFsIFNoYXBlcwoGTm9ybWFsEiMKB1JldmVyc2USGAoNTm9ybWFsIFNoYXBlcwoHUmV2ZXJzZQ==";

    let world_bin = base64::engine::general_purpose::STANDARD
        .decode(world_str)
        .unwrap();

    let world = rust_proto::WorldModel::decode(world_bin.as_slice()).unwrap();

    println!("Groups: {:?}", world.groups.keys());

    let RocketModel {
        position_x,
        position_y,
        ..
    } = world.groups["Normal"].rockets.first().unwrap();

    let rocket_path = GeometryBuilder::build_as(&shapes::SvgPathShape {
        svg_path_string: "M 1 502 L 3 355 C 4 344 4 334 5 324 C 7 310 9 297 11 284 C 15 256 23 229 32 202 C 43 169 57 138 74 108 C 87 85 100 62 117 42 L 150 0 L 183 42 C 200 62 213 85 226 108 C 243 138 257 169 268 202 C 277 229 285 256 289 284 C 291 297 293 310 295 324 C 296 334 296 344 297 355 L 299 502 L 300 600 L 190 502 L 110 502 L 0 600 z".to_owned(),
        svg_doc_size_in_px: Vec2::new(300.0, 600.0),
    });

    commands.spawn(Camera2dBundle {
        projection: OrthographicProjection {
            far: 1000.,
            near: -1000.,
            scale: 0.10,
            ..Default::default()
        },
        transform: Transform::from_xyz(*position_x, *position_y, 1.0),
        ..Default::default()
    });

    commands.init_resource::<GameConfig>();

    commands
        .spawn(RocketBundle {
            rigid_body: RigidBody::Dynamic,
            collider: rocket_collider().unwrap(),
            transform: TransformBundle::from(Transform::from_xyz(*position_x, *position_y, 0.0)),
            ..Default::default()
        })
        .insert(ActiveEvents::COLLISION_EVENTS)
        .insert(ColliderMassProperties::Mass(20.0))
        .insert(Damping {
            linear_damping: 0.0,
            angular_damping: 0.5,
        })
        .insert(Ccd::enabled());

    for shape in world.groups["Normal Shapes"].shapes.iter() {
        let mut vertices = Vec::new();

        let mut x: f32 = f32::from_ne_bytes(shape.vertices[0..4].try_into().unwrap());
        let mut y: f32 = f32::from_ne_bytes(shape.vertices[4..8].try_into().unwrap());

        vertices.push(Vec2::new(x, y));

        let mut byteCount = 12;

        while byteCount < shape.vertices.len() {
            x += half::f16::from_ne_bytes([
                shape.vertices[byteCount],
                shape.vertices[byteCount + 1],
            ])
            .to_f32();
            y += half::f16::from_ne_bytes([
                shape.vertices[byteCount + 2],
                shape.vertices[byteCount + 3],
            ])
            .to_f32();

            vertices.push(Vec2::new(x, y));

            byteCount += 8;
        }

        let min_x = vertices.iter().fold(f32::INFINITY, |acc, v| acc.min(v.x));
        let min_y = vertices.iter().fold(f32::INFINITY, |acc, v| acc.min(v.y));

        let indices: Vec<_> = (0..(vertices.len() as u32))
            .map(|x| [x, (x + 1) % vertices.len() as u32] as [u32; 2])
            .collect();

        commands.spawn(ShapeBundle {
            rigid_body: RigidBody::Fixed,
            collider: Collider::convex_decomposition(vertices, None),
            transform: TransformBundle::from(Transform::from_xyz(0.0, 0.0, 0.0)),
        });
    }

    // rectangle of height 3.6
    commands.spawn(ShapeBundle {
        rigid_body: RigidBody::Fixed,
        collider: Collider::cuboid(5.0, 1.8),
        transform: TransformBundle::from(Transform::from_xyz(8.0, -15.0, 0.0)),
    });
}

#[derive(Resource)]
struct GameConfig {
    thrust_distance: f32,
    thrust_value: f32,
    thrust_ground_multiplier: f32,
    explosion_angle: f32,
}

impl Default for GameConfig {
    fn default() -> Self {
        GameConfig {
            thrust_distance: 1.0,
            thrust_value: 7.3,
            thrust_ground_multiplier: 1.3,
            explosion_angle: 0.3,
        }
    }
}

enum InputState {
    Keyboard { rotation: f32 },
}

impl Default for InputState {
    fn default() -> Self {
        InputState::Keyboard { rotation: 0.0 }
    }
}

fn rocket_input(
    mut state: Local<InputState>,
    time: Res<Time>,
    windows: Query<&Window, With<PrimaryWindow>>,
    keyboard: Res<Input<KeyCode>>,
) -> FrameInput {
    match *state {
        InputState::Keyboard { mut rotation } => {
            if keyboard.pressed(KeyCode::Left) {
                rotation += 1.0 * time.delta_seconds();
            }

            if keyboard.pressed(KeyCode::Right) {
                rotation -= 1.0 * time.delta_seconds();
            }

            *state = InputState::Keyboard { rotation };

            FrameInput {
                rotation,
                thrust: keyboard.pressed(KeyCode::Up),
            }
        }
    }
}

struct Times {
    start: std::time::Instant,
    count: usize,
}

impl Default for Times {
    fn default() -> Self {
        Times {
            start: std::time::Instant::now(),
            count: 0,
        }
    }
}

#[derive(Default)]
struct InputHandlerState {
    offset: f32,
}

fn rocket_input_handler(
    In(input): In<FrameInput>,
    mut state: Local<InputHandlerState>,
    mut time: Local<Times>,
    mut rocket_query: Query<
        (
            Entity,
            &CollidingEntities,
            &mut Transform,
            &mut ExternalImpulse,
        ),
        With<Rocket>,
    >,
    game_config: Res<GameConfig>,
    rapier_context: Res<RapierContext>,
) {
    time.count += 1;

    println!(
        "FPS: {}",
        time.count as f32 / time.start.elapsed().as_secs_f32()
    );

    let (entity, colliding_entities, mut rocket_transform, mut rocket_impulse) =
        rocket_query.single_mut();

    if colliding_entities.len() == 0 {
        rocket_transform.rotation = Quat::from_rotation_z(input.rotation + state.offset);
    } else {
        state.offset = rocket_transform.rotation.to_euler(EulerRot::YXZ).2 - input.rotation;
        println!("Rotation: {}", state.offset);
    }

    // a = b + x

    if input.thrust {
        let mut force = Vec2::new(0.0, game_config.thrust_value);

        // shoot a ray of length thrustDistance in the direction downwards from the rocket
        let ray_origin = rocket_transform.translation.truncate();
        let ray_dir = rocket_transform
            .rotation
            .mul_vec3(Vec3::new(0.0, -1.0, 0.0))
            .truncate();

        let max_toi = game_config.thrust_distance * 3.6 + 3.6 * 0.5;

        println!("Ray origin: {:?}, dir: {:?}", ray_origin, ray_dir);

        if let Some(_) = rapier_context.cast_ray(
            ray_origin,
            ray_dir,
            max_toi,
            false,
            QueryFilter::default().exclude_rigid_body(entity),
        ) {
            println!("Hit ground!");
            force *= game_config.thrust_ground_multiplier;
        }

        let rotated_force = rocket_transform.rotation * force.extend(0.0);
        // println!("Force: {:?}", rotated_force);
        rocket_impulse.impulse = rotated_force.truncate()
    }
}
*/
