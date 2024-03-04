use bevy::prelude::*;
use bevy_rapier2d::prelude::*;

use crate::{MapTemplate, ShapeTemplate};

#[derive(Component)]
pub struct Shape;

#[derive(Bundle)]
pub struct ShapeBundle {
    shape: Shape,

    rigid_body: RigidBody,
    collider: Collider,
    transform: TransformBundle,
}

impl ShapeBundle {
    pub fn new(template: &ShapeTemplate) -> Self {
        ShapeBundle {
            shape: Shape,
            rigid_body: RigidBody::Fixed,
            collider: template.create_rapier_collider(),
            transform: TransformBundle::IDENTITY,
        }
    }
}

pub fn startup(mut commands: Commands, map: Res<MapTemplate>) {
    for shape in map.shapes.iter() {
        commands.spawn(ShapeBundle::new(shape));
    }
}
