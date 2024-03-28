use bevy::{ecs::schedule::SystemConfigs, prelude::*};
use bevy_rapier2d::prelude::*;

use super::{CameraAnimation, CameraConfig, CustomCamera, ZoomAnimation};

pub fn startup() -> SystemConfigs {
    (setup_zoom_buttons).chain()
}

pub fn update() -> SystemConfigs {
    (handle_zoom_buttons).chain()
}

const NORMAL_BUTTON: Color = Color::rgba(1.0, 1.0, 1.0, 0.0);
const HOVERED_BUTTON: Color = Color::rgba(1.0, 1.0, 1.0, 0.2);
const PRESSED_BUTTON: Color = Color::rgba(1.0, 1.0, 1.0, 0.4);

#[derive(Component)]
enum ZoomButton {
    ZoomIn,
    ZoomOut,
}

fn setup_zoom_buttons(mut commands: Commands, asset_server: Res<AssetServer>) {
    commands
        .spawn(NodeBundle {
            style: Style {
                width: Val::Percent(100.0),
                height: Val::Percent(100.0),
                align_items: AlignItems::FlexEnd,
                justify_content: JustifyContent::Center,
                ..default()
            },
            ..default()
        })
        .with_children(|parent| {
            parent
                .spawn(NodeBundle {
                    style: Style {
                        width: Val::Auto,
                        height: Val::Auto,
                        padding: UiRect::all(Val::Px(0.0)),
                        margin: UiRect::all(Val::Px(10.0)),
                        justify_items: JustifyItems::Center,
                        align_items: AlignItems::FlexEnd,
                        justify_content: JustifyContent::Center,
                        ..default()
                    },
                    background_color: BackgroundColor(Color::rgba(0.0, 0.0, 0.0, 0.7)),
                    ..default()
                })
                .with_children(|parent| {
                    parent
                        .spawn(ButtonBundle {
                            style: Style {
                                width: Val::Px(40.0),
                                height: Val::Px(40.0),
                                justify_content: JustifyContent::Center,
                                align_items: AlignItems::Center,
                                ..default()
                            },
                            background_color: BackgroundColor(Color::rgba(0.0, 0.0, 0.0, 0.0)),
                            ..default()
                        })
                        .insert(ZoomButton::ZoomIn)
                        .with_children(|parent| {
                            parent.spawn(TextBundle::from_section(
                                "+",
                                TextStyle {
                                    font: Default::default(),
                                    font_size: 40.0,
                                    color: Color::WHITE,
                                },
                            ));
                        });

                    parent
                        .spawn(ButtonBundle {
                            style: Style {
                                width: Val::Px(40.0),
                                height: Val::Px(40.0),
                                justify_content: JustifyContent::Center,
                                align_items: AlignItems::Center,
                                ..default()
                            },
                            background_color: BackgroundColor(Color::rgba(0.0, 0.0, 0.0, 0.0)),
                            ..default()
                        })
                        .insert(ZoomButton::ZoomOut)
                        .with_children(|parent| {
                            parent.spawn(TextBundle::from_section(
                                "-",
                                TextStyle {
                                    font: Default::default(),
                                    font_size: 40.0,
                                    color: Color::WHITE,
                                },
                            ));
                        });
                });
        });
}

fn handle_zoom_buttons(
    mut camera_config: ResMut<CameraConfig>,
    mut camera_query: Query<&mut CustomCamera, With<Camera>>,
    mut interaction_query: Query<
        (
            &Interaction,
            &mut BackgroundColor,
            &mut BorderColor,
            &Children,
            &ZoomButton,
        ),
        (Changed<Interaction>, With<Button>),
    >,
    mut text_query: Query<&mut Text>,
) {
    for (interaction, mut color, mut border_color, children, zoom_type) in &mut interaction_query {
        let mut text = text_query.get_mut(children[0]).unwrap();

        match *interaction {
            Interaction::Pressed => {
                error!("zoom: {:?}", camera_config.zoom_index);

                if match *zoom_type {
                    ZoomButton::ZoomIn => camera_config.zoom_in(),
                    ZoomButton::ZoomOut => camera_config.zoom_out(),
                } {
                    camera_query.single_mut().animation = CameraAnimation::Zoom(ZoomAnimation {
                        source_zoom: camera_config.zoom,
                        target_zoom: camera_config.target_zoom(),
                        progress: 0.0,
                    });

                    color.0 = PRESSED_BUTTON;
                }
            }
            Interaction::Hovered => {
                color.0 = HOVERED_BUTTON;
            }
            Interaction::None => {
                color.0 = NORMAL_BUTTON;
            }
        }
    }
}
