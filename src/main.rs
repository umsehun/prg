use bevy::prelude::*;
use bevy_kira_audio::prelude::*;

mod osu_loader;
mod systems;
mod components;
mod resources;

use crate::resources::SongLibrary;

#[derive(Clone, Copy, Default, Eq, PartialEq, Debug, Hash, States)]
enum GameState {
    #[default]
    Menu,
    Playing,
    Result,
}

use systems::{setup, spawn_approach_system, move_approach_system, input_system, song_selection_ui, song_button_system, gameplay_hud_ui, update_score_text_system, update_combo_text_system, update_health_bar_system, fade_in_system, fade_out_system, transition_system, result_screen_ui, back_to_menu_system};

fn main() {
    App::new()
        .add_plugins(DefaultPlugins.set(WindowPlugin {
            primary_window: Some(Window {
                title: "PinGame".into(),
                resolution: (800., 600.).into(),
                ..default()
            }),
            ..default()
        }))
        .add_plugins(AudioPlugin)
        .init_state::<GameState>()
        .add_systems(Startup, setup)
        .add_systems(Update, song_selection_ui.run_if(in_state(GameState::Menu).and(resource_exists::<SongLibrary>)))
        .add_systems(Update, song_button_system.run_if(in_state(GameState::Menu)))
        .add_systems(Update, transition_system.run_if(in_state(GameState::Menu)))
        .add_systems(Update, fade_in_system)
        .add_systems(Update, fade_out_system)
        .add_systems(OnEnter(GameState::Playing), gameplay_hud_ui)
        .add_systems(Update, update_score_text_system.run_if(in_state(GameState::Playing)))
        .add_systems(Update, update_combo_text_system.run_if(in_state(GameState::Playing)))
        .add_systems(Update, update_health_bar_system.run_if(in_state(GameState::Playing)))
        .add_systems(Update, spawn_approach_system.run_if(in_state(GameState::Playing)))
        .add_systems(Update, move_approach_system.run_if(in_state(GameState::Playing)))
        .add_systems(Update, input_system.run_if(in_state(GameState::Playing)))
        .add_systems(OnEnter(GameState::Result), result_screen_ui)
        .add_systems(Update, back_to_menu_system.run_if(in_state(GameState::Result)))
        .run();
}
