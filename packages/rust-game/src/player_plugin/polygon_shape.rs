use bevy::{
    prelude::*,
    render::{mesh::Indices, render_resource::PrimitiveTopology},
    sprite::MaterialMesh2dBundle,
};
use bevy_rapier2d::prelude::*;
use i_triangle::triangulation::triangulate;
use rust_game_plugin::ShapeVertex;

pub struct PolygonShape {
    pub vertices: Vec<ShapeVertex>,
}

impl From<PolygonShape> for Mesh {
    fn from(polygon: PolygonShape) -> Self {
        let PolygonShape { vertices } = polygon;

        let positions: Vec<_> = vertices
            .iter()
            .map(|v| [v.point.x, v.point.y, 0.0] as [f32; 3])
            .collect();

        let positions_2 = vertices
            .iter()
            .flat_map(|v| vec![v.point.x, v.point.y])
            .collect::<Vec<_>>();

        let indices: Vec<_> = earcutr::earcut(&positions_2, &vec![], 2)
            .unwrap()
            .into_iter()
            .map(|i| i as u32)
            .collect();

        let colors: Vec<_> = vertices
            .iter()
            .map(|v| {
                let color = Color::rgb_u8(
                    ((v.color >> 16) & 0xff) as u8,
                    ((v.color >> 8) & 0xff) as u8,
                    (v.color & 0xff) as u8,
                )
                .as_rgba_linear();

                [color.r(), color.g(), color.b(), 1.0] as [f32; 4]
            })
            .collect();

        Mesh::new(PrimitiveTopology::TriangleList)
            .with_inserted_attribute(Mesh::ATTRIBUTE_POSITION, positions)
            .with_inserted_attribute(Mesh::ATTRIBUTE_COLOR, colors)
            .with_indices(Some(Indices::U32(indices)))
    }
}
