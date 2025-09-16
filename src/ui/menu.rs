use bevy::prelude::*;
use crate::GameState;
use crate::ui::components::*;

/// Main menu UI marker
#[derive(Component)]
pub struct MainMenu;

/// Spawn the main menu UI
pub fn spawn_main_menu(
    mut commands: Commands,
    theme: Res<UITheme>,
) {
    info!("Creating main menu UI...");

    // Create the main background container
    let background = create_background_container(&mut commands, &theme);
    
    // Add main menu marker
    commands.entity(background).insert(MainMenu);

    // Create menu container with all the buttons
    create_menu_container(&mut commands, background, &theme);

    info!("Main menu UI created successfully!");
}

/// Handle button interactions (hover effects)
pub fn handle_button_interaction(
    mut query: Query<
        (&Interaction, &mut BackgroundColor, &MenuButton),
        (Changed<Interaction>, With<Button>),
    >,
    theme: Res<UITheme>,
) {
    for (interaction, mut color, _button) in &mut query {
        match *interaction {
            Interaction::Pressed => {
                *color = BackgroundColor(theme.button_pressed.into());
            }
            Interaction::Hovered => {
                *color = BackgroundColor(theme.button_hovered.into());
            }
            Interaction::None => {
                *color = BackgroundColor(theme.button_normal.into());
            }
        }
    }
}

/// Handle button clicks (actual actions)
pub fn handle_button_clicks(
    query: Query<(&Interaction, &MenuButton), (Changed<Interaction>, With<Button>)>,
    mut next_state: ResMut<NextState<GameState>>,
    mut exit: EventWriter<AppExit>,
) {
    for (interaction, button) in &query {
        if *interaction == Interaction::Pressed {
            match button.action {
                ButtonAction::Play => {
                    info!("Play button clicked - transitioning to SongSelect");
                    next_state.set(GameState::SongSelect);
                }
                ButtonAction::Settings => {
                    info!("Settings button clicked");
                    // TODO: Implement settings menu
                }
                ButtonAction::Quit => {
                    info!("Quit button clicked - exiting game");
                    exit.send(AppExit::Success);
                }
            }
        }
    }
}

/// Handle keyboard shortcuts in main menu
pub fn handle_menu_shortcuts(
    keys: Res<ButtonInput<KeyCode>>,
    mut next_state: ResMut<NextState<GameState>>,
    mut exit: EventWriter<AppExit>,
) {
    if keys.just_pressed(KeyCode::KeyP) {
        info!("P key pressed - transitioning to SongSelect");
        next_state.set(GameState::SongSelect);
    }
    
    if keys.just_pressed(KeyCode::KeyE) || keys.just_pressed(KeyCode::Escape) {
        info!("E/Escape key pressed - exiting game");
        exit.send(AppExit::Success);
    }
    
    if keys.just_pressed(KeyCode::KeyS) {
        info!("S key pressed - opening settings (TODO)");
        // TODO: Implement settings menu
    }
}

/// Cleanup main menu
pub fn cleanup_main_menu(
    mut commands: Commands,
    query: Query<Entity, With<MainMenu>>,
) {
    for entity in query.iter() {
        commands.entity(entity).despawn();
    }
    info!("Main menu cleaned up");
}