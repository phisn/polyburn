use bevy::ecs::component::Component;
use bevy::math::Vec2;
use bevy_rapier2d::geometry::{Collider, VHACDParameters};
use bevy_rapier2d::math::Rot;
use rapier2d::geometry::SharedShape;
use rapier2d::math::Point;
use rapier2d::parry::transformation::vhacd::VHACD;

pub struct ShapeTemplate {
    parts: Vec<Vec<Point<f32>>>,
}

impl ShapeTemplate {
    pub fn from_model(shape: &rust_proto::ShapeModel) -> Self {
        let mut vertices = Vec::new();

        let mut x: f32 = f32::from_ne_bytes(shape.vertices[0..4].try_into().unwrap());
        let mut y: f32 = f32::from_ne_bytes(shape.vertices[4..8].try_into().unwrap());

        vertices.push(Point::new(x, y));

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

            vertices.push(Point::new(x, y));

            byte_count += 8;
        }

        let vertices_count = vertices.len() as u32;

        let indices: Vec<_> = (0..vertices_count)
            .map(|x| [x, (x + 1) % vertices_count])
            .collect();

        let params = VHACDParameters::default();
        let parts = VHACD::decompose(&params, &vertices, &indices, true)
            .compute_exact_convex_hulls(&vertices, &indices);

        Self { parts }
    }

    pub fn create_collider(&self) -> Collider {
        let colliders: Vec<SharedShape> = self
            .parts
            .iter()
            .map(|part| {
                SharedShape::convex_polyline(part.clone())
                    .expect("Failed to create collider in shape from part")
            })
            .collect();

        let shapes: Vec<(Vec2, f32, Collider)> = colliders
            .iter()
            .map(|collider| (Vec2::ZERO, 0.0, collider.clone().into()))
            .collect();

        Collider::compound(shapes)
    }
}
