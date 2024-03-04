use bevy::math::Vec2;
use i_float::fix_float::{FixConvert, FixMath};
use i_float::fix_vec::FixVec;
use i_overlay::bool::fill_rule::FillRule;
use i_shape::fix_shape::FixShape;
use i_triangle::triangulation::triangulate::Triangulate;
use rapier2d::geometry::SharedShape;
use rapier2d::math::Point;
use rapier2d::parry::transformation::convex_hull;

#[derive(Debug, Clone)]
pub struct ShapeTemplate {
    parts: Vec<Vec<Point<f32>>>,
    vertices: Vec<ShapeVertex>,
}

#[derive(Debug, Clone)]
pub struct ShapeVertex {
    pub point: Vec2,
    pub color: i32,
}

impl ShapeTemplate {
    pub fn new(shape: &rust_proto::ShapeModel) -> Self {
        let mut vertices: Vec<ShapeVertex> = Vec::new();

        let mut x: f32 = f32::from_ne_bytes(shape.vertices[0..4].try_into().unwrap());
        let mut y: f32 = f32::from_ne_bytes(shape.vertices[4..8].try_into().unwrap());

        vertices.push(ShapeVertex {
            point: Vec2::new(x, y),
            color: i32::from_ne_bytes(shape.vertices[8..12].try_into().unwrap()),
        });

        let mut byte_count = 12;

        while byte_count < shape.vertices.len() {
            x += half::f16::from_ne_bytes([
                shape.vertices[byte_count],
                shape.vertices[byte_count + 1],
            ])
            .to_f32();
            y += half::f16::from_ne_bytes([
                shape.vertices[byte_count + 2],
                shape.vertices[byte_count + 3],
            ])
            .to_f32();

            vertices.push(ShapeVertex {
                point: Vec2::new(x, y),
                color: i32::from_ne_bytes(
                    shape.vertices[byte_count + 4..byte_count + 8]
                        .try_into()
                        .unwrap(),
                ),
            });

            byte_count += 8;
        }

        let shape = FixShape::new_with_contour(
            vertices
                .iter()
                .map(|v| FixVec::new(v.point.x.fix(), v.point.y.fix()))
                .collect::<Vec<_>>(),
        );

        let parts = shape
            .to_convex_polygons(Some(FillRule::EvenOdd))
            .iter()
            .map(|part| {
                let part = part
                    .iter()
                    .map(|point| Point::new(point.x.f32(), point.y.f32()))
                    .collect::<Vec<_>>();

                convex_hull(&part)
            })
            .collect();

        Self { parts, vertices }
    }

    pub fn vertices(&self) -> &Vec<ShapeVertex> {
        &self.vertices
    }

    pub fn parry_shapes(&self) -> Vec<SharedShape> {
        self.parts
            .iter()
            .map(|part| {
                part.iter()
                    .map(|point| Point::new(point.x, point.y))
                    .collect::<Vec<_>>()
            })
            .map(|part| {
                SharedShape::convex_polyline(part)
                    .expect("Failed to create collider in shape from part")
            })
            .collect()
    }

    pub fn create_rapier_collider(&self) -> bevy_rapier2d::geometry::Collider {
        let shapes: Vec<(Vec2, f32, bevy_rapier2d::geometry::Collider)> = self
            .parry_shapes()
            .iter()
            .map(|collider| (Vec2::ZERO, 0.0, collider.clone().into()))
            .collect();

        bevy_rapier2d::geometry::Collider::compound(shapes)
    }
}
