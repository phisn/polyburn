//! Collects pairs of potentially colliding entities into [`BroadCollisionPairs`] using
//! [AABB](ColliderAabb) intersection checks.
//!
//! See [`BroadPhasePlugin`].

use std::collections::HashMap;

use bevy::prelude::*;
use bevy_xpbd_2d::{math::Vector, prelude::*, PhysicsSchedule, PhysicsStepSet};
use parry2d::math::Isometry;

/// Collects pairs of potentially colliding entities into [`BroadCollisionPairs`] using
/// [AABB](ColliderAabb) intersection checks. This speeds up narrow phase collision detection,
/// as the number of precise collision checks required is greatly reduced.
///
/// Currently, the broad phase uses the [sweep and prune](https://en.wikipedia.org/wiki/Sweep_and_prune) algorithm.
///
/// The broad phase systems run in [`PhysicsStepSet::BroadPhase`].
pub struct CustomBroadPhasePlugin;

impl Plugin for CustomBroadPhasePlugin {
    fn build(&self, app: &mut App) {
        app.init_resource::<AabbIntervalMaps>();

        let physics_schedule = app
            .get_schedule_mut(PhysicsSchedule)
            .expect("add PhysicsSchedule first");

        physics_schedule.add_systems(
            (
                update_aabb,
                update_aabb_intervals,
                add_new_aabb_intervals,
                collect_collision_pairs,
            )
                .chain()
                .in_set(PhysicsStepSet::BroadPhase),
        );
    }
}

type AABBChanged = Or<(
    Changed<Position>,
    Changed<Rotation>,
    Changed<LinearVelocity>,
    Changed<AngularVelocity>,
    Changed<Collider>,
)>;

/// Updates the Axis-Aligned Bounding Boxes of all colliders. A safety margin will be added to account for sudden accelerations.
#[allow(clippy::type_complexity)]
fn update_aabb(
    mut colliders: Query<
        (
            &Collider,
            &mut ColliderAabb,
            &Position,
            &Rotation,
            Option<&ColliderParent>,
            Option<&LinearVelocity>,
            Option<&AngularVelocity>,
        ),
        AABBChanged,
    >,
    parent_velocity: Query<
        (&Position, Option<&LinearVelocity>, Option<&AngularVelocity>),
        With<Children>,
    >,
    dt: Res<Time>,
    narrow_phase_config: Option<Res<NarrowPhaseConfig>>,
) {
    // Safety margin multiplier bigger than DELTA_TIME to account for sudden accelerations
    let safety_margin_factor = 2.0 * dt.delta_seconds();

    for (collider, mut aabb, pos, rot, collider_parent, lin_vel, ang_vel) in &mut colliders {
        let (lin_vel, ang_vel) = if let (Some(lin_vel), Some(ang_vel)) = (lin_vel, ang_vel) {
            (*lin_vel, *ang_vel)
        } else if let Some(Ok((parent_pos, Some(lin_vel), Some(ang_vel)))) =
            collider_parent.map(|p| parent_velocity.get(p.get()))
        {
            // If the rigid body is rotating, off-center colliders will orbit around it,
            // which affects their linear velocities. We need to compute the linear velocity
            // at the offset position.
            // TODO: This assumes that the colliders would continue moving in the same direction,
            //       but because they are orbiting, the direction will change. We should take
            //       into account the uniform circular motion.
            let offset = pos.0 - parent_pos.0;
            let vel_at_offset =
                lin_vel.0 + Vector::new(-ang_vel.0 * offset.y, ang_vel.0 * offset.x) * 1.0;
            (LinearVelocity(vel_at_offset), *ang_vel)
        } else {
            (LinearVelocity::ZERO, AngularVelocity::ZERO)
        };

        // Compute current isometry and predicted isometry for next feame
        let start_iso = make_isometry(*pos, *rot);
        let end_iso = {
            make_isometry(
                pos.0 + lin_vel.0 * safety_margin_factor,
                *rot + Rotation::from_radians(safety_margin_factor * ang_vel.0),
            )
        };

        // Compute swept AABB, the space that the body would occupy if it was integrated for one frame
        aabb.0 = collider
            .shape_scaled()
            .compute_swept_aabb(&start_iso, &end_iso);

        // Add narrow phase prediction distance to AABBs to avoid missed collisions
        let prediction_distance = if let Some(ref config) = narrow_phase_config {
            config.prediction_distance
        } else {
            1.0
        };

        aabb.maxs.x += prediction_distance;
        aabb.mins.x -= prediction_distance;
        aabb.maxs.y += prediction_distance;
        aabb.mins.y -= prediction_distance;
    }
}

/// True if the rigid body hasn't moved.
type IsBodyInactive = bool;

struct AabbInterval {
    entity: Entity,
    aabb: ColliderAabb,
    is_inactive: IsBodyInactive,
}

/// Entities with [`ColliderAabb`]s sorted along an axis by their extents.
#[derive(Resource, Default)]
struct AabbIntervalMaps {
    intervals: HashMap<u64, Vec<AabbInterval>>,
}

/// Updates [`AabbIntervals`] to keep them in sync with the [`ColliderAabb`]s.
fn update_aabb_intervals(
    aabbs: Query<(
        &ColliderAabb,
        Option<&CollisionLayers>,
        Ref<Position>,
        Ref<Rotation>,
    )>,
    mut interval_maps: ResMut<AabbIntervalMaps>,
) {
    for intervals in interval_maps.intervals.values_mut() {
        intervals.retain_mut(|interval| {
            if let Ok((new_aabb, _, position, rotation)) = aabbs.get(interval.entity) {
                interval.aabb = *new_aabb;
                interval.is_inactive = !position.is_changed() && !rotation.is_changed();

                true
            } else {
                false
            }
        });
    }
}

fn collision_layers_to_u64(layers: CollisionLayers) -> u64 {
    layers.groups_bits() as u64 | (layers.masks_bits() as u64) << 32
}

fn collision_layers_from_u64(layers: u64) -> CollisionLayers {
    CollisionLayers::from_bits(
        (layers & 0xFFFF_FFFF) as u32,
        ((layers >> 32) & 0xFFFF_FFFF) as u32,
    )
}

/// Adds new [`ColliderAabb`]s to [`AabbIntervals`].
fn add_new_aabb_intervals(
    aabbs: Query<
        (
            Entity,
            &ColliderAabb,
            Option<&RigidBody>,
            Option<&CollisionLayers>,
        ),
        Added<ColliderAabb>,
    >,
    mut intervals: ResMut<AabbIntervalMaps>,
) {
    let aabbs = aabbs.iter().map(|(ent, aabb, rb, layers)| {
        (
            layers.map_or(CollisionLayers::default(), |l| *l),
            AabbInterval {
                entity: ent,
                aabb: *aabb,
                is_inactive: rb.map_or(false, |rb| rb.is_static()),
            },
        )
    });

    for (layer, layer_intervals) in aabbs {
        match intervals.intervals.get_mut(&collision_layers_to_u64(layer)) {
            Some(intervals) => {
                intervals.push(layer_intervals);
            }
            None => {
                intervals
                    .intervals
                    .insert(collision_layers_to_u64(layer), vec![layer_intervals]);
            }
        }
    }
}

/// Collects bodies that are potentially colliding.
fn collect_collision_pairs(
    mut interval_maps: ResMut<AabbIntervalMaps>,
    mut broad_collision_pairs: ResMut<BroadCollisionPairs>,
) {
    broad_collision_pairs.0.clear();

    for (layers, intervals) in interval_maps.intervals.iter_mut() {
        insertion_sort(intervals, |a, b| a.aabb.mins.x < b.aabb.mins.x);

        let layers_instance = collision_layers_from_u64(*layers);

        if layers_instance.interacts_with(layers_instance) {
            sweep_and_prune_self(intervals, &mut broad_collision_pairs.0);
        }
    }

    for (i, (layer_0, intervals_0)) in interval_maps.intervals.iter().enumerate() {
        for (layer_1, intervals_1) in interval_maps.intervals.iter().skip(i + 1) {
            let layer_0_instance = collision_layers_from_u64(*layer_0);
            let layer_1_instance = collision_layers_from_u64(*layer_1);

            if layer_0_instance.interacts_with(layer_1_instance) {
                sweep_and_prune_others(intervals_0, intervals_1, &mut broad_collision_pairs.0);
            }
        }
    }
}

fn sweep_and_prune_others(
    intervals_0: &Vec<AabbInterval>,
    intervals_1: &Vec<AabbInterval>,
    broad_collision_pairs: &mut Vec<(Entity, Entity)>,
) {
    let mut iter_1 = 0;

    for interval_0 in intervals_0.iter() {
        for interval_1 in intervals_1.iter().skip(iter_1) {
            if interval_1.aabb.mins.x > interval_0.aabb.maxs.x {
                break;
            }

            if interval_1.aabb.maxs.x < interval_0.aabb.mins.x {
                iter_1 += 1;
                continue;
            }

            if interval_0.aabb.mins.y > interval_1.aabb.maxs.y
                || interval_0.aabb.maxs.y < interval_1.aabb.mins.y
            {
                continue;
            }

            broad_collision_pairs.push((interval_0.entity, interval_1.entity));
        }
    }
}

fn sweep_and_prune_self(
    intervals: &Vec<AabbInterval>,
    broad_collision_pairs: &mut Vec<(Entity, Entity)>,
) {
    // Clear broad phase collisions from previous iteration.
    broad_collision_pairs.clear();

    // Find potential collisions by checking for AABB intersections along all axes.
    for (i, interval_1) in intervals.iter().enumerate() {
        for interval_2 in intervals.iter().skip(i + 1) {
            // x doesn't intersect; check this first so we can discard as soon as possible
            if interval_2.aabb.mins.x > interval_1.aabb.maxs.x {
                break;
            }

            // No collisions between bodies that haven't moved or colliders with incompatible layers or colliders with the same parent
            if interval_1.is_inactive && interval_2.is_inactive {
                continue;
            }

            // y doesn't intersect
            if interval_1.aabb.mins.y > interval_2.aabb.maxs.y
                || interval_1.aabb.maxs.y < interval_2.aabb.mins.y
            {
                continue;
            }

            broad_collision_pairs.push((interval_1.entity, interval_2.entity));
        }
    }
}

fn insertion_sort<T>(items: &mut Vec<T>, comparison: fn(&T, &T) -> bool) {
    for i in 1..items.len() {
        let mut j = i;
        while j > 0 && comparison(&items[j - 1], &items[j]) {
            items.swap(j - 1, j);
            j -= 1;
        }
    }
}

fn make_isometry(position: impl Into<Position>, rotation: impl Into<Rotation>) -> Isometry<f32> {
    let position: Position = position.into();
    let rotation: Rotation = rotation.into();
    Isometry::<f32>::new(position.0.into(), rotation.into())
}
