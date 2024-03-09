use bevy::{ecs::schedule::SystemConfigs, prelude::*};

use bevy_svg::prelude::*;
use rust_game_plugin::ecs::level::{
    CaptureState, Level, LevelCaptureStateEvent, LevelCapturedEvent,
};

use super::SVG_SCALE_FACTOR;

pub fn update() -> SystemConfigs {
    (level_flag_tracker).chain().into_configs()
}

pub fn startup() -> SystemConfigs {
    (insert_initial_flag).chain().into_configs()
}

fn level_flag_tracker(
    mut commands: Commands,
    asset_server: Res<AssetServer>,
    mut level_capture_state_reader: EventReader<LevelCaptureStateEvent>,
    level_children_query: Query<&Children, ()>,
    flag_child_query: Query<Entity, With<Handle<Svg>>>,
) {
    for level_capture_state in level_capture_state_reader.read() {
        let level_children = level_children_query
            .get(level_capture_state.level)
            .expect("Level children not found!");

        let flag_child = level_children
            .iter()
            .find(|child| flag_child_query.contains(**child))
            .expect("Flag child not found!");

        let flag_asset: Handle<Svg> = match level_capture_state.state {
            CaptureState::Started => asset_server.load("flag-green.svg"),
            CaptureState::Stopped => asset_server.load("flag-red.svg"),
        };

        commands.entity(*flag_child).insert(flag_asset);
    }
}

fn insert_initial_flag(
    mut commands: Commands,
    level_query: Query<Entity, With<Level>>,
    asset_server: Res<AssetServer>,
) {
    let level_red: Handle<Svg> = asset_server.load("flag-red.svg");

    for level_entity in level_query.iter() {
        commands.entity(level_entity).with_children(|parent| {
            parent.spawn(Svg2dBundle {
                svg: level_red.clone(),
                transform: Transform::from_scale(Vec3::splat(SVG_SCALE_FACTOR)),
                ..Default::default()
            });
        });
    }
}
