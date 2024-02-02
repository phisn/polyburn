use std::path::PathBuf;

use bevy::{
    prelude::*,
    sprite::{MaterialMesh2dBundle, Mesh2dHandle},
};
use bevy_svg::prelude::{Origin, Svg, Svg2dBundle};
use rust_game_plugin::{ecs::rocket::Rocket, MapTemplate};

use crate::player_plugin::camera::Camera;

use super::polygon_shape;

pub fn init_system(
    mut commands: Commands,
    mut rocket_query: Query<(Entity, &Rocket)>,
    map: ResMut<MapTemplate>,
    mut svgs: ResMut<Assets<Svg>>,
    mut meshes: ResMut<Assets<Mesh>>,
    mut materials: ResMut<Assets<ColorMaterial>>,
) {
    commands
        .spawn(Camera2dBundle {
            projection: OrthographicProjection {
                far: 1000.,
                near: -1000.,
                scale: 0.070,
                ..Default::default()
            },
            transform: Transform::from_xyz(map.rocket.position.x, map.rocket.position.y, 1.0),
            ..Default::default()
        })
        .insert(Camera);

    for shape in map.shapes.iter() {
        commands.spawn(MaterialMesh2dBundle {
            mesh: meshes
                .add(
                    (polygon_shape::PolygonShape {
                        vertices: shape.vertices().clone(),
                    })
                    .into(),
                )
                .into(),
            material: materials.add(ColorMaterial::from(Color::WHITE)),
            transform: Transform::from_translation(Vec3::new(0., 0., 0.)),
            ..default()
        });
    }

    println!("This is the time in time");

    let (rocket_entity, rocket) = rocket_query.single_mut();
    let font: Option<PathBuf> = None;
    let rocket_svg = Svg::from_bytes(r##"<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 600" height="600" width="300"><path fill="#000" opacity="1" d="M 1 502 L 3 355 C 4 344 4 334 5 324 C 7 310 9 297 11 284 C 15 256 23 229 32 202 C 43 169 57 138 74 108 C 87 85 100 62 117 42 L 150 0 L 183 42 C 200 62 213 85 226 108 C 243 138 257 169 268 202 C 277 229 285 256 289 284 C 291 297 293 310 295 324 C 296 334 296 344 297 355 L 299 502 L 300 600 L 190 502 L 110 502 L 0 600 z"/></svg>"##.as_bytes(), PathBuf::new(), font).unwrap();
    let rocket_svg = rocket_svg
        .commands
        .entity(rocket_entity)
        .insert(svgs.add(rocket_svg))
        .insert(Mesh2dHandle::default())
        .insert(Origin::Center);
}
