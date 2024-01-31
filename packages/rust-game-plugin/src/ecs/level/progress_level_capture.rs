use bevy::prelude::*;

use super::*;

pub fn progress_level_capture(
    mut commands: Commands,
    mut level_query: Query<(Entity, &mut LevelInCapture)>,
    mut level_captured_events: EventWriter<LevelCapturedEvent>,
) {
    for (level_entity, mut level_in_capture) in level_query.iter_mut() {
        level_in_capture.progress -= 1;

        if level_in_capture.progress <= 0 {
            commands
                .entity(level_entity)
                .insert(LevelCaptured)
                .remove::<LevelInCapture>();

            level_captured_events.send(LevelCapturedEvent {
                level: level_entity,
            });

            println!("Level captured!");
        } else {
            println!(
                "Progressing level capture ... {}",
                level_in_capture.progress
            );
        }
    }
}
