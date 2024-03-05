use core::fmt;

use bevy::{ecs::system::Resource, prelude::default};
use parry2d::{
    bounding_volume::{Aabb, BoundingVolume},
    na::Isometry2,
    shape::SharedShape,
};

#[derive(Debug, Resource, Default)]
pub struct Environment {
    tree: Node,
}

impl Environment {
    pub fn build(shapes: Vec<(parry2d::shape::SharedShape, Isometry2<f32>)>) -> Environment {
        let tree = Self::build_tree(
            shapes
                .iter()
                .map(|(shape, iso)| {
                    let aabb = shape.compute_aabb(iso);
                    Shape {
                        shape: shape.clone(),
                        aabb,
                    }
                })
                .collect(),
        );

        Environment { tree }
    }

    pub fn query<'a>(&'a self, aabb: Aabb) -> Vec<&'a parry2d::shape::SharedShape> {
        let mut result = vec![];
        self.query_recursive(&self.tree, aabb, &mut result);
        result
    }

    fn query_recursive<'a>(
        &'a self,
        node: &'a Node,
        aabb: Aabb,
        result: &mut Vec<&'a parry2d::shape::SharedShape>,
    ) {
        match node {
            Node::Leaf(shapes) => {
                for shape in shapes {
                    if shape.aabb.intersects(&aabb) {
                        result.push(&shape.shape);
                    }
                }
            }
            Node::Node(split, min, max, mid) => match split.split_type {
                SplitType::Horizontal => {
                    if aabb.mins.y < split.min {
                        self.query_recursive(min, aabb, result);
                    }

                    if aabb.maxs.y > split.max {
                        self.query_recursive(max, aabb, result);
                    }

                    self.query_recursive(mid, aabb, result);
                }
                SplitType::Vertical => {
                    if aabb.mins.x < split.min {
                        self.query_recursive(min, aabb, result);
                    }

                    if aabb.maxs.x > split.max {
                        self.query_recursive(max, aabb, result);
                    }

                    self.query_recursive(mid, aabb, result);
                }
            },
        }
    }

    fn build_tree(shapes: Vec<Shape>) -> Node {
        if shapes.len() <= 16 {
            return Node::Leaf(shapes);
        }

        let split_result_x = Self::find_split(shapes.clone(), SplitType::Vertical);
        let split_result_y = Self::find_split(shapes.clone(), SplitType::Horizontal);

        let split_result = if split_result_x.score > split_result_y.score {
            split_result_x
        } else {
            split_result_y
        };

        let recursive_min = Self::build_tree(split_result.min_shapes);
        let recursive_max = Self::build_tree(split_result.max_shapes);
        let recursive_mid = Self::build_tree(split_result.mid_shapes);

        Node::Node(
            split_result.split,
            Box::new(recursive_min),
            Box::new(recursive_max),
            Box::new(recursive_mid),
        )
    }

    fn find_split(shapes: Vec<Shape>, split_type: SplitType) -> SplitResult {
        let shapes: Vec<_> = match split_type {
            SplitType::Horizontal => shapes
                .iter()
                .map(|shape| (shape.aabb.mins.y, shape.aabb.maxs.y, shape.clone()))
                .collect(),
            SplitType::Vertical => shapes
                .iter()
                .map(|shape| (shape.aabb.mins.x, shape.aabb.maxs.x, shape.clone()))
                .collect(),
        };

        let split_point: f32 = shapes.iter().map(|(min, max, _)| (min + max) / 2.0).sum();
        let split_point = split_point / shapes.len() as f32;

        let mut min_shapes = vec![];
        let mut max_shapes = vec![];
        let mut mid_shapes = vec![];

        let mut min = f32::MAX;
        let mut max = f32::MIN;

        let mut min_score = 0;
        let mut max_score = 0;

        for (shape_min, shape_max, shape) in &shapes {
            if *shape_max < split_point {
                max = max.max(*shape_max);
                min_score += 1;
                min_shapes.push(shape.clone());

                continue;
            }

            if *shape_min > split_point {
                min = min.min(*shape_min);
                max_score += 1;
                max_shapes.push(shape.clone());

                continue;
            }

            min = min.min(*shape_min);
            max = max.max(*shape_max);
            mid_shapes.push(shape.clone());
        }

        let split = Split {
            split_type,
            min,
            max,
        };

        SplitResult {
            split,
            min_shapes,
            max_shapes,
            mid_shapes,
            score: max_score.min(min_score),
        }
    }
}

#[derive(Clone)]
struct Shape {
    pub shape: parry2d::shape::SharedShape,
    pub aabb: Aabb,
}

impl fmt::Debug for Shape {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{:?}", self.aabb)
    }
}

#[derive(Debug)]
enum SplitType {
    Horizontal,
    Vertical,
}

#[derive(Debug)]
struct Split {
    pub split_type: SplitType,

    pub min: f32,
    pub max: f32,
}

#[derive(Debug)]
enum Node {
    Leaf(Vec<Shape>),
    Node(Split, Box<Node>, Box<Node>, Box<Node>),
}

impl Default for Node {
    fn default() -> Self {
        Node::Leaf(vec![])
    }
}

struct SplitResult {
    pub split: Split,
    pub min_shapes: Vec<Shape>,
    pub max_shapes: Vec<Shape>,
    pub mid_shapes: Vec<Shape>,
    pub score: i32,
}

#[cfg(test)]
mod tests {
    use parry2d::na::Isometry2;

    use super::*;

    fn create_shape(x: f32, y: f32, w: f32, h: f32) -> (SharedShape, Isometry2<f32>) {
        let shape = SharedShape::cuboid(w / 2.0, h / 2.0);
        let iso = Isometry2::new([x, y].into(), 0.0);
        (shape, iso)
    }

    #[test]
    fn test_build_tree() {
        let test_shape_1 = create_shape(0.0, 1.5, 4.0, 1.0);
        let test_shape_2 = create_shape(5.0, 5.0, 4.0, 4.0);
        let test_shape_3 = create_shape(0.5, 0.5, 1.0, 1.0);
        let test_shape_4 = create_shape(-4.5, 0.5, 1.0, 1.0);

        let shapes = vec![
            create_shape(0.0, 0.0, 4.0, 1.0),
            create_shape(5.0, 0.0, 4.0, 1.0),
            create_shape(10.0, 0.0, 4.0, 1.0),
            create_shape(15.0, 0.0, 4.0, 1.0),
            create_shape(20.0, 0.0, 4.0, 1.0),
            create_shape(0.0, 3.0, 1.0, 1.0),
            create_shape(2.0, 3.0, 1.0, 1.0),
            create_shape(4.0, 3.0, 1.0, 1.0),
            create_shape(6.0, 3.0, 1.0, 1.0),
            create_shape(8.0, 3.0, 1.0, 1.0),
        ];

        let environment = Environment::build(shapes);

        assert_eq!(
            environment
                .query(test_shape_1.0.compute_aabb(&test_shape_1.1))
                .len(),
            0
        );
        assert_eq!(
            environment
                .query(test_shape_2.0.compute_aabb(&test_shape_2.1))
                .len(),
            2
        );
        assert_eq!(
            environment
                .query(test_shape_3.0.compute_aabb(&test_shape_3.1))
                .len(),
            1
        );
        assert_eq!(
            environment
                .query(test_shape_4.0.compute_aabb(&test_shape_4.1))
                .len(),
            0
        );
    }
}

/*
Node(Split {
    split_type: Horizontal,
    min: 2.5,
    max: 0.5
},
    Leaf([
        Aabb { mins: [-2.0, -0.5], maxs: [2.0, 0.5] },
        Aabb { mins: [3.0, -0.5], maxs: [7.0, 0.5] }
    ]),
    Leaf([
        Aabb { mins: [-0.5, 2.5], maxs: [0.5, 3.5] },
        Aabb { mins: [1.5, 2.5], maxs: [2.5, 3.5] },
        Aabb { mins: [3.5, 2.5], maxs: [4.5, 3.5] },
        Aabb { mins: [5.5, 2.5], maxs: [6.5, 3.5] }
    ]),
    []
)
 */
