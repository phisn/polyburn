use bevy::prelude::*;
use bevy_rapier2d::prelude::*;

pub fn rocket_collider() -> Option<Collider> {
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
        .map(|points: Vec<(f32, f32)>| {
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
