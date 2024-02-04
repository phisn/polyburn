use bevy::{ecs::schedule::SystemConfigs, prelude::*, sprite::MaterialMesh2dBundle};
use bevy_rapier2d::prelude::*;
use bevy_svg::prelude::*;
use rust_game_plugin::{
    constants::ENTITY_ROCKET_ENTRY,
    ecs::{
        level::{Level, LevelCapturedEvent},
        rocket::Rocket,
    },
    MapTemplate,
};

use super::SVG_SCALE_FACTOR;

pub fn startup(
    mut commands: Commands,
    mut rocket_query: Query<(Entity, &Rocket)>,
    asset_server: Res<AssetServer>,
) {
    let (rocket_entity, rocket) = rocket_query.single_mut();
    let rocket_svg: Handle<Svg> = asset_server.load("rocket.svg");

    commands.entity(rocket_entity).with_children(|parent| {
        parent.spawn(Svg2dBundle {
            svg: rocket_svg.clone(),
            transform: Transform {
                translation: Vec3::new(
                    -ENTITY_ROCKET_ENTRY.width / 2.0,
                    ENTITY_ROCKET_ENTRY.height / 2.0,
                    0.0,
                ),
                scale: Vec3::splat(SVG_SCALE_FACTOR),
                ..Default::default()
            },
            ..Default::default()
        });
    });
}
