use bevy::prelude::*;
use bevy_kira_audio::prelude::*;

mod osu_loader;
mod systems;
mod components;
mod resources;
mod ui;

use crate::ui::menu::{spawn_main_menu, handle_button_interaction, handle_button_clicks, handle_menu_shortcuts, cleanup_main_menu};
use crate::ui::components::UITheme;
use crate::ui::song_selection::{spawn_song_select_ui, song_select_esc_handler, carousel_keyboard_nav, carousel_activate, update_song_preview, update_carousel_visuals, init_carousel_state, update_speed_display, speed_button_interaction};
use crate::systems::{setup_camera, cleanup_menu_ui, gameplay_esc_handler, result_esc_handler};
use crate::resources::{SongLibrary, GameplaySettings};

#[derive(Debug, Clone, Copy, Default, Eq, PartialEq, Hash, States)]
pub enum GameState {
    #[default]
    Menu,
    SongSelect,
    Playing,
    Result,
}

fn main() {
    App::new()
        .add_plugins(DefaultPlugins.set(ImagePlugin::default_nearest()))
        .insert_resource(ClearColor(Color::srgb(0.04, 0.04, 0.06)))
        .add_plugins(AudioPlugin)
        .init_state::<GameState>()
        .init_resource::<SongLibrary>()
        .init_resource::<GameplaySettings>()
        .init_resource::<UITheme>()
        .add_systems(Startup, setup_camera)
        // Menu state systems - Basic Bevy UI
        .add_systems(OnEnter(GameState::Menu), spawn_main_menu)
        .add_systems(
            Update,
            (handle_button_interaction, handle_button_clicks, handle_menu_shortcuts).run_if(in_state(GameState::Menu))
        )
        .add_systems(OnExit(GameState::Menu), cleanup_main_menu)
    // Song selection state systems
    .add_systems(OnEnter(GameState::SongSelect), (spawn_song_select_ui, init_carousel_state))

        .add_systems(
            Update,
            (
                carousel_keyboard_nav,
                carousel_activate,
                update_song_preview,
                update_carousel_visuals,
                update_speed_display,
                speed_button_interaction,
                song_select_esc_handler,
            ).run_if(in_state(GameState::SongSelect))
        )
        // Playing state systems
        .add_systems(OnEnter(GameState::Playing), cleanup_menu_ui)
        .add_systems(
            Update,
            (
                gameplay_esc_handler,
            ).run_if(in_state(GameState::Playing))
        )
        // Result state systems
        .add_systems(
            Update,
            (
                result_esc_handler,
            ).run_if(in_state(GameState::Result))
        )
        .run();
}
