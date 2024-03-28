use bevy::{input::touch::TouchPhase, prelude::*};
use rust_game_plugin::FrameInput;

#[derive(Default)]
pub struct TouchState {
    total_rotation: f32,
    thrust_index: Option<u64>,
    control_index: Option<TouchStateControl>,
}

struct TouchStateControl {
    index: u64,
    start_position: f32,
    start_total_rotation: f32,
}

pub fn touch_input(
    mut frame_input: ResMut<FrameInput>,
    mut state: Local<TouchState>,
    mut touch_reader: EventReader<TouchInput>,
    query_window: Query<&Window>,
) {
    let window = query_window.single();

    for touch in touch_reader.read() {
        error!("Touch phase: {:?}", touch.phase);
        match touch.phase {
            TouchPhase::Started => {
                error!(
                    "posx: {}, window phtysical width: {}",
                    touch.position.x,
                    window.resolution.physical_width() as f32 * 0.5 * 0.5
                );

                if touch.position.x > window.resolution.physical_width() as f32 * 0.5 * 0.5
                    && state.thrust_index.is_none()
                {
                    state.thrust_index = Some(touch.id);
                    error!("Thrust started");
                }

                if touch.position.x < window.resolution.physical_width() as f32 * 0.5 * 0.5
                    && state.control_index.is_none()
                {
                    error!("Control started");
                    state.control_index = Some(TouchStateControl {
                        index: touch.id,
                        start_position: touch.position.x,
                        start_total_rotation: state.total_rotation,
                    });
                }
            }
            TouchPhase::Moved => {
                if let Some(control) = state.control_index.as_mut() {
                    if control.index == touch.id {
                        error!("Touch moved");
                        let delta = control.start_position - touch.position.x;
                        state.total_rotation = control.start_total_rotation + delta / 100.0;
                    }
                }
            }
            TouchPhase::Ended => {
                if state.thrust_index.map(|x| x == touch.id).unwrap_or(false) {
                    state.thrust_index = None;
                    error!("Thrust ended");
                }

                if state
                    .control_index
                    .as_ref()
                    .map(|x| x.index == touch.id)
                    .unwrap_or(false)
                {
                    state.control_index = None;
                }
            }
            _ => {}
        }
    }

    frame_input.thrust = state.thrust_index.is_some();
    frame_input.rotation += state.total_rotation;
}
