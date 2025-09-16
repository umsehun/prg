use bevy::prelude::*;
use bevy_kira_audio::prelude::*;
use bevy_kira_audio::AudioSource as KiraAudioSource;
use crate::resources::SongLibrary;

#[derive(Component)]
pub struct CarouselRoot;

#[derive(Component)]
pub struct CarouselItem { 
    pub index: usize 
}

#[derive(Component)]
pub struct SongSelectRoot;

#[derive(Component)]
pub struct BannerImage;

#[derive(Component)]  
pub struct PreviewAudio;

#[derive(Resource)]
pub struct CarouselState { 
    pub selected: usize,
    pub last_selected: Option<usize>,
}

fn spawn_song_selection_ui(
    mut commands: Commands,
    song_library: Res<SongLibrary>,
    asset_server: Res<AssetServer>,
) {
    let root = commands
        .spawn((
            SongSelectRoot,
            Node {
                width: Val::Percent(100.0),
                height: Val::Percent(100.0),
                display: Display::Flex,
                flex_direction: FlexDirection::Row,
                align_items: AlignItems::Stretch,
                justify_content: JustifyContent::Center,
                ..default()
            },
            BackgroundColor(Color::srgb(0.05, 0.05, 0.15)), // Dark blue background
        ))
        .id();

    // Left panel - Song list (60% width)
    let left_panel = commands
        .spawn((
            Node {
                width: Val::Percent(60.0),
                height: Val::Percent(100.0),
                display: Display::Flex,
                flex_direction: FlexDirection::Column,
                align_items: AlignItems::Stretch,
                justify_content: JustifyContent::Start,
                padding: UiRect::all(Val::Px(20.0)),
                ..default()
            },
            BackgroundColor(Color::srgb(0.1, 0.1, 0.2)), // Slightly lighter dark blue
        ))
        .id();

    // Song items
    for (i, song) in song_library.songs.iter().enumerate() {
        let is_selected = i == 0; // First song selected by default
        let song_item = commands
            .spawn((
                CarouselItem { index: i },
                Node {
                    width: Val::Percent(100.0),
                    height: Val::Px(80.0),
                    display: Display::Flex,
                    align_items: AlignItems::Center,
                    justify_content: JustifyContent::Start,
                    padding: UiRect::all(Val::Px(15.0)),
                    margin: UiRect::bottom(Val::Px(8.0)),
                    border: UiRect::all(Val::Px(2.0)),
                    ..default()
                },
                BackgroundColor(if is_selected {
                    Color::srgb(0.3, 0.4, 0.8) // Selected: bright blue
                } else {
                    Color::srgb(0.15, 0.15, 0.25) // Unselected: dark
                }),
                BorderColor(if is_selected {
                    Color::srgb(0.5, 0.6, 1.0) // Selected: bright blue border
                } else {
                    Color::srgb(0.2, 0.2, 0.3) // Unselected: subtle border
                }),
                Interaction::default(),
            ))
            .id();

        // Song title text
        let song_text = commands
            .spawn((
                Text::new(&song.name),
                TextFont {
                    font_size: 24.0,
                    ..default()
                },
                TextColor(Color::srgb(0.9, 0.9, 1.0)),
            ))
            .id();

        commands.entity(song_item).add_child(song_text);
        commands.entity(left_panel).add_child(song_item);
    }

    // Right panel container (40% width)
    let right_panel = commands
        .spawn((
            Node {
                width: Val::Percent(40.0),
                height: Val::Percent(100.0),
                display: Display::Flex,
                flex_direction: FlexDirection::Column,
                align_items: AlignItems::Stretch,
                justify_content: JustifyContent::Start,
                ..default()
            },
            BackgroundColor(Color::srgb(0.08, 0.08, 0.18)),
        ))
        .id();

    // Right top panel - Banner/Image (50% of right panel)
    let banner_panel = commands
        .spawn((
            BannerImage,
            Node {
                width: Val::Percent(100.0),
                height: Val::Percent(50.0),
                display: Display::Flex,
                align_items: AlignItems::Center,
                justify_content: JustifyContent::Center,
                ..default()
            },
            BackgroundColor(Color::srgb(0.12, 0.12, 0.22)),
        ))
        .id();

    // Banner text placeholder
    let banner_text = commands
        .spawn((
            Text::new("Song Banner"),
            TextFont {
                font_size: 32.0,
                ..default()
            },
            TextColor(Color::srgb(0.7, 0.7, 0.8)),
        ))
        .id();

    // Right bottom panel - Controls (50% of right panel)
    let controls_panel = commands
        .spawn((
            Node {
                width: Val::Percent(100.0),
                height: Val::Percent(50.0),
                display: Display::Flex,
                flex_direction: FlexDirection::Column,
                align_items: AlignItems::Center,
                justify_content: JustifyContent::Center,
                padding: UiRect::all(Val::Px(20.0)),
                ..default()
            },
            BackgroundColor(Color::srgb(0.1, 0.1, 0.2)),
        ))
        .id();

    // Controls text
    let controls_text = commands
        .spawn((
            Text::new("↑↓: Navigate\nEnter: Play\nEsc: Back"),
            TextFont {
                font_size: 20.0,
                ..default()
            },
            TextColor(Color::srgb(0.8, 0.8, 0.9)),
        ))
        .id();

    // Audio preview component for the first song
    if !song_library.songs.is_empty() {
        if let Some(ref audio_path) = song_library.songs[0].audio_path {
            let audio_handle: Handle<KiraAudioSource> = asset_server.load(audio_path);
            
            let preview_audio = commands
                .spawn(PreviewAudio)
                .id();
            
            commands.entity(root).add_child(preview_audio);
        }
    }

    // Build hierarchy
    commands.entity(banner_panel).add_child(banner_text);
    commands.entity(controls_panel).add_child(controls_text);
    commands.entity(right_panel).add_child(banner_panel);
    commands.entity(right_panel).add_child(controls_panel);
    commands.entity(root).add_child(left_panel);
    commands.entity(root).add_child(right_panel);
}

pub fn spawn_song_select_ui(
    mut commands: Commands,
    song_library: Res<SongLibrary>,
    asset_server: Res<AssetServer>,
) {
    spawn_song_selection_ui(commands, song_library, asset_server);
}

pub fn init_carousel_state(mut commands: Commands) {
    commands.insert_resource(CarouselState {
        selected: 0,
        last_selected: None,
    });
}

pub fn carousel_keyboard_nav(
    keys: Res<ButtonInput<KeyCode>>,
    state: Option<ResMut<CarouselState>>,
    items: Query<&CarouselItem>,
) {
    let count = items.iter().count();
    if count == 0 { return; }
    if let Some(mut s) = state {
        // Vertical navigation: Down = next song, Up = previous song
        if keys.just_pressed(KeyCode::ArrowDown) { 
            let new_selected = (s.selected + 1) % count;
            info!("DEBUG: Navigation Down: {} -> {}", s.selected, new_selected);
            s.selected = new_selected;
        }
        if keys.just_pressed(KeyCode::ArrowUp) { 
            let new_selected = (s.selected + count - 1) % count;
            info!("DEBUG: Navigation Up: {} -> {}", s.selected, new_selected);
            s.selected = new_selected;
        }
    }
}

pub fn carousel_apply_selection(
    state: Option<Res<CarouselState>>,
    mut q: Query<(&CarouselItem, &mut BackgroundColor, &mut BorderColor)>,
) {
    let selected = state.as_ref().map(|s| s.selected).unwrap_or(0);
    for (item, mut bg, mut border) in &mut q {
        if item.index == selected {
            *bg = BackgroundColor(Color::srgba(0.15, 0.15, 0.22, 1.0));
            *border = BorderColor(Color::srgba(0.5, 0.9, 1.0, 1.0));
        } else {
            *bg = BackgroundColor(Color::srgba(0.10, 0.10, 0.14, 1.0));
            *border = BorderColor(Color::srgba(0.4, 0.7, 1.0, 0.6));
        }
    }
}

pub fn carousel_activate(
    keys: Res<ButtonInput<KeyCode>>,
    state: Option<Res<CarouselState>>,
    lib: Res<SongLibrary>,
    mut commands: Commands,
    mut next: ResMut<NextState<crate::GameState>>,
) {
    if keys.just_pressed(KeyCode::Enter) {
        let selected = state.as_ref().map(|s| s.selected).unwrap_or(0);
        if selected < lib.songs.len() {
            // Set the selected song as the current song
            let selected_song = &lib.songs[selected];
            commands.insert_resource(crate::resources::Song {
                start_instant: std::time::Instant::now(),
                note_times: selected_song.note_times.clone(),
                next_index: 0,
            });
            
            // Reset game score
            commands.insert_resource(crate::resources::GameScore::default());
            
            next.set(crate::GameState::Playing);
        }
    }
}

pub fn song_select_esc_handler(
    keys: Res<ButtonInput<KeyCode>>,
    mut next: ResMut<NextState<crate::GameState>>,
) {
    if keys.just_pressed(KeyCode::Escape) {
        next.set(crate::GameState::Menu);
    }
}

pub fn update_carousel_visuals(
    state: Res<CarouselState>,
    mut items: Query<(&CarouselItem, &mut BackgroundColor, &mut BorderColor)>,
) {
    for (item, mut bg_color, mut border_color) in items.iter_mut() {
        let is_selected = item.index == state.selected;
        
        *bg_color = if is_selected {
            BackgroundColor(Color::srgb(0.3, 0.4, 0.8)) // Selected: bright blue
        } else {
            BackgroundColor(Color::srgb(0.15, 0.15, 0.25)) // Unselected: dark
        };
        
        *border_color = if is_selected {
            BorderColor(Color::srgb(0.5, 0.6, 1.0)) // Selected: bright blue border
        } else {
            BorderColor(Color::srgb(0.2, 0.2, 0.3)) // Unselected: subtle border
        };
    }
}

pub fn update_song_preview(
    mut state: ResMut<CarouselState>,
    song_library: Res<SongLibrary>,
    asset_server: Res<AssetServer>,
    audio: Res<Audio>,
    mut commands: Commands,
    mut preview_query: Query<Entity, With<PreviewAudio>>,
) {
    // Check if selection changed
    let selection_changed = state.last_selected != Some(state.selected);
    
    if selection_changed {
        println!("Selection changed to song {}", state.selected);
        
        // Stop current preview audio
        for entity in preview_query.iter_mut() {
            commands.entity(entity).despawn();
        }
        
        // Start new preview audio if song exists
        if state.selected < song_library.songs.len() {
            let selected_song = &song_library.songs[state.selected];
            
            // Check if audio file exists
            if let Some(ref audio_path) = selected_song.audio_path {
                let audio_handle: Handle<KiraAudioSource> = asset_server.load(audio_path);
                
                // Play with looped audio and volume control
                // Note: Audio will only play if file exists, otherwise it will be silent
                audio.play(audio_handle.clone()).looped().with_volume(0.3);
                
                // Spawn new preview audio entity
                commands.spawn(PreviewAudio);
                
                println!("Started preview for: {}", audio_path);
            } else {
                println!("No audio path for song: {}", selected_song.name);
            }
        }
        
        // Update last_selected to current selection
        state.last_selected = Some(state.selected);
    }
}