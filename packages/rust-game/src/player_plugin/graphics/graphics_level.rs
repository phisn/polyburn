use bevy::prelude::*;

use bevy_svg::prelude::*;
use rust_game_plugin::ecs::level::{Level, LevelCapturedEvent};

use super::SVG_SCALE_FACTOR;

pub fn update(
    mut commands: Commands,
    mut level_captured: EventReader<LevelCapturedEvent>,
    asset_server: Res<AssetServer>,
    level_query: Query<&Children, With<Level>>,
    level_child_query: Query<Entity, With<Handle<Svg>>>,
) {
    for entity in level_captured
        .read()
        .map(|event| level_query.get(event.level).unwrap())
        .map(|children| {
            children
                .iter()
                .find(|child| level_child_query.contains(**child))
                .unwrap()
        })
    {
        println!("Level captured! 21222");

        let level_green: Handle<Svg> = asset_server.load("flag-green.svg");

        commands.entity(*entity).insert(Svg2dBundle {
            svg: level_green.clone(),
            transform: Transform::from_scale(Vec3::splat(SVG_SCALE_FACTOR)),
            ..Default::default()
        });
    }
}

pub fn startup(
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
