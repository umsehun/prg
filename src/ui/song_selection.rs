use bevy::prelude::*;
use bevy_kira_audio::prelude::*;
use bevy_kira_audio::AudioSource as KiraAudioSource;
use crate::resources::{SongLibrary, GameplaySettings};
use crate::components::{DifficultyDisplay, DifficultyStars, DifficultyValue};

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
pub struct BannerVideo;

#[derive(Component)]
pub struct PreviewAudio;

#[derive(Component)]
pub struct SpeedDisplay;

#[derive(Component)]
pub struct SpeedButton {
    pub speed: f32,
}#[derive(Resource)]
pub struct CarouselState { 
    pub selected: usize,
    pub last_selected: Option<usize>,
}

#[derive(Resource)]
pub struct PreloadedAudio {
    pub handles: Vec<Option<Handle<KiraAudioSource>>>,
}

fn spawn_song_selection_ui(
    mut commands: Commands,
    mut song_library: ResMut<SongLibrary>,
    asset_server: Res<AssetServer>,
    gameplay_settings: Res<GameplaySettings>,
) {
    // Auto-load .osz files if no songs are available
    if song_library.songs.is_empty() {
        info!("🚀 Auto-loading .osz files on song select screen...");
        if song_library.reload_osu_data() {
            info!("✅ Auto-loaded {} songs from .osz files", song_library.songs.len());
        } else {
            warn!("❌ Failed to auto-load songs from .osz files");
        }
    }
    
    // Preload all audio files for instant playback
    let mut preloaded_handles = Vec::new();
    for song in &song_library.songs {
        if let Some(ref audio_path) = song.audio_path {
            let handle: Handle<KiraAudioSource> = asset_server.load(audio_path);
            preloaded_handles.push(Some(handle));
            println!("Preloading audio: {}", audio_path);
        } else {
            preloaded_handles.push(None);
        }
    }
    
    commands.insert_resource(PreloadedAudio {
        handles: preloaded_handles,
    });
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
                    height: Val::Px(100.0), // Increased height for difficulty display
                    display: Display::Flex,
                    flex_direction: FlexDirection::Row,
                    align_items: AlignItems::Center,
                    justify_content: JustifyContent::SpaceBetween,
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

        // Left side - Song info container
        let song_info_container = commands
            .spawn((
                Node {
                    width: Val::Percent(70.0),
                    height: Val::Percent(100.0),
                    display: Display::Flex,
                    flex_direction: FlexDirection::Column,
                    align_items: AlignItems::Start,
                    justify_content: JustifyContent::Center,
                    ..default()
                },
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

        // Artist text (if available)
        let artist_text = commands
            .spawn((
                Text::new(song.artist.as_deref().unwrap_or("Unknown Artist")),
                TextFont {
                    font_size: 16.0,
                    ..default()
                },
                TextColor(Color::srgb(0.7, 0.7, 0.8)),
            ))
            .id();

        // Right side - Difficulty display
        let difficulty_container = commands
            .spawn((
                DifficultyDisplay,
                Node {
                    width: Val::Percent(30.0),
                    height: Val::Percent(100.0),
                    display: Display::Flex,
                    flex_direction: FlexDirection::Column,
                    align_items: AlignItems::End,
                    justify_content: JustifyContent::Center,
                    ..default()
                },
            ))
            .id();

        // Difficulty stars display
        let stars_rating = song.stars.unwrap_or(0.0);
        let stars_count = (stars_rating.round() as usize).min(10);
        let stars_text = "★".repeat(stars_count) + &"☆".repeat(10 - stars_count);
        
        let difficulty_stars = commands
            .spawn((
                DifficultyStars,
                Text::new(&stars_text),
                TextFont {
                    font_size: 16.0,
                    ..default()
                },
                TextColor(Color::srgb(1.0, 0.8, 0.0)), // Gold color for stars
            ))
            .id();

        // Difficulty value display
        let difficulty_text = if let Some(overall_diff) = song.overall_difficulty {
            format!("OD: {:.1}", overall_diff)
        } else {
            "N/A".to_string()
        };

        let difficulty_value = commands
            .spawn((
                DifficultyValue,
                Text::new(&difficulty_text),
                TextFont {
                    font_size: 14.0,
                    ..default()
                },
                TextColor(Color::srgb(0.0, 1.0, 0.8)), // Cyan color for difficulty value
            ))
            .id();

        // Build hierarchy
        commands.entity(song_info_container).add_child(song_text);
        commands.entity(song_info_container).add_child(artist_text);
        commands.entity(difficulty_container).add_child(difficulty_stars);
        commands.entity(difficulty_container).add_child(difficulty_value);
        commands.entity(song_item).add_child(song_info_container);
        commands.entity(song_item).add_child(difficulty_container);
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

    // Banner video placeholder - will show webm info
    let banner_video = commands
        .spawn((
            BannerVideo,
            Text::new("🎵 Select a song"),
            TextFont {
                font_size: 18.0,  // Reduced from 24.0 to fit better
                ..default()
            },
            TextColor(Color::srgb(0.6, 0.6, 0.7)),
            Node {
                width: Val::Percent(90.0),  // Limit width to prevent overflow
                max_width: Val::Px(400.0),   // Set max width
                ..default()
            },
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
                justify_content: JustifyContent::SpaceEvenly,
                padding: UiRect::all(Val::Px(20.0)),
                ..default()
            },
            BackgroundColor(Color::srgb(0.1, 0.1, 0.2)),
        ))
        .id();

    // Speed Settings Section
    let speed_section = commands
        .spawn((
            Node {
                width: Val::Percent(100.0),
                height: Val::Auto,
                display: Display::Flex,
                flex_direction: FlexDirection::Column,
                align_items: AlignItems::Center,
                justify_content: JustifyContent::Center,
                margin: UiRect::bottom(Val::Px(15.0)),
                ..default()
            },
        ))
        .id();

    // Speed label
    let speed_label = commands
        .spawn((
            Text::new("SPEED"),
            TextFont {
                font_size: 18.0,
                ..default()
            },
            TextColor(Color::srgb(0.0, 1.0, 0.8)), // Cyan color like DJMAX
        ))
        .id();

    // Speed display
    let speed_display = commands
        .spawn((
            SpeedDisplay,
            Text::new(&format!("{:.2}x", gameplay_settings.speed_multiplier)),
            TextFont {
                font_size: 24.0,
                ..default()
            },
            TextColor(Color::srgb(1.0, 0.0, 1.0)), // Magenta color for current speed
        ))
        .id();

    // Speed buttons container
    let speed_buttons_container = commands
        .spawn((
            Node {
                width: Val::Percent(100.0),
                height: Val::Auto,
                display: Display::Flex,
                flex_direction: FlexDirection::Row,
                align_items: AlignItems::Center,
                justify_content: JustifyContent::SpaceEvenly,
                margin: UiRect::top(Val::Px(10.0)),
                ..default()
            },
        ))
        .id();

    // Create speed buttons
    for &speed in &gameplay_settings.available_speeds {
        let is_current = (speed - gameplay_settings.speed_multiplier).abs() < 0.01;
        let speed_button = commands
            .spawn((
                SpeedButton { speed },
                Node {
                    width: Val::Px(40.0),
                    height: Val::Px(30.0),
                    display: Display::Flex,
                    align_items: AlignItems::Center,
                    justify_content: JustifyContent::Center,
                    border: UiRect::all(Val::Px(1.0)),
                    ..default()
                },
                BackgroundColor(if is_current {
                    Color::srgb(1.0, 0.0, 1.0) // Magenta for selected
                } else {
                    Color::srgb(0.2, 0.2, 0.3) // Dark for unselected
                }),
                BorderColor(Color::srgb(0.0, 1.0, 0.8)), // Cyan border
                Interaction::default(),
            ))
            .id();

        let button_text = commands
            .spawn((
                Text::new(&if speed == 1.0 { "1x".to_string() } else { format!("{:.1}x", speed) }),
                TextFont {
                    font_size: 12.0,
                    ..default()
                },
                TextColor(if is_current {
                    Color::srgb(0.0, 0.0, 0.0) // Black text for selected
                } else {
                    Color::srgb(0.9, 0.9, 1.0) // White text for unselected
                }),
            ))
            .id();

        commands.entity(speed_button).add_child(button_text);
        commands.entity(speed_buttons_container).add_child(speed_button);
    }

    // Controls text
    let controls_text = commands
        .spawn((
            Text::new("↑↓: Navigate\nEnter: Play\nEsc: Back\n←→: Speed"),
            TextFont {
                font_size: 16.0,
                ..default()
            },
            TextColor(Color::srgb(0.8, 0.8, 0.9)),
        ))
        .id();

    // Build speed section hierarchy
    commands.entity(speed_section).add_child(speed_label);
    commands.entity(speed_section).add_child(speed_display);
    commands.entity(speed_section).add_child(speed_buttons_container);

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
    commands.entity(banner_panel).add_child(banner_video);
    commands.entity(controls_panel).add_child(speed_section);
    commands.entity(controls_panel).add_child(controls_text);
    commands.entity(right_panel).add_child(banner_panel);
    commands.entity(right_panel).add_child(controls_panel);
    commands.entity(root).add_child(left_panel);
    commands.entity(root).add_child(right_panel);
}

pub fn spawn_song_select_ui(
    mut commands: Commands,
    mut song_library: ResMut<SongLibrary>,
    asset_server: Res<AssetServer>,
    gameplay_settings: Res<GameplaySettings>,
) {
    spawn_song_selection_ui(commands, song_library, asset_server, gameplay_settings);
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
    mut gameplay_settings: ResMut<GameplaySettings>,
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
        
        // Horizontal navigation: Left/Right = change speed
        if keys.just_pressed(KeyCode::ArrowLeft) {
            let current_index = gameplay_settings.available_speeds.iter()
                .position(|&speed| (speed - gameplay_settings.speed_multiplier).abs() < 0.01)
                .unwrap_or(2); // Default to 1.0x if not found
            let new_index = if current_index > 0 { current_index - 1 } else { gameplay_settings.available_speeds.len() - 1 };
            gameplay_settings.speed_multiplier = gameplay_settings.available_speeds[new_index];
            info!("Speed changed to: {:.2}x", gameplay_settings.speed_multiplier);
        }
        if keys.just_pressed(KeyCode::ArrowRight) {
            let current_index = gameplay_settings.available_speeds.iter()
                .position(|&speed| (speed - gameplay_settings.speed_multiplier).abs() < 0.01)
                .unwrap_or(2); // Default to 1.0x if not found
            let new_index = (current_index + 1) % gameplay_settings.available_speeds.len();
            gameplay_settings.speed_multiplier = gameplay_settings.available_speeds[new_index];
            info!("Speed changed to: {:.2}x", gameplay_settings.speed_multiplier);
        }
    }
}

// Removed duplicate carousel_apply_selection function - using update_carousel_visuals instead

pub fn carousel_activate(
    keys: Res<ButtonInput<KeyCode>>,
    state: Option<Res<CarouselState>>,
    mut lib: ResMut<SongLibrary>,
    mut commands: Commands,
    mut next: ResMut<NextState<crate::GameState>>,
) {
    if keys.just_pressed(KeyCode::Enter) {
        info!("🔥 ENTER KEY PRESSED! Processing...");
        // First, try to load .osz files if no songs are available
        if lib.songs.is_empty() {
            info!("🎵 No songs available, attempting to load .osz files...");
            if lib.reload_osu_data() {
                info!("✅ Successfully loaded {} songs from .osz files", lib.songs.len());
            } else {
                warn!("❌ Failed to load any songs from .osz files. Please check your charts directory.");
                return;
            }
        }
        
        let selected = state.as_ref().map(|s| s.selected).unwrap_or(0);
        if selected < lib.songs.len() {
            // Set the selected song as the current song
            let selected_song = &lib.songs[selected];
            info!("Starting game with song: {}", selected_song.name);
            
            commands.insert_resource(crate::resources::Song {
                start_instant: std::time::Instant::now(),
                note_times: selected_song.note_times.clone(),
                next_index: 0,
            });
            
            // Reset game score
            commands.insert_resource(crate::resources::GameScore::default());
            
            next.set(crate::GameState::Playing);
        } else {
            warn!("Selected song index {} is out of range (total songs: {})", selected, lib.songs.len());
        }
    }
}

pub fn update_speed_display(
    gameplay_settings: Res<GameplaySettings>,
    mut speed_display_query: Query<&mut Text, With<SpeedDisplay>>,
    mut speed_button_query: Query<(&SpeedButton, &mut BackgroundColor, &Children)>,
    mut button_text_query: Query<&mut TextColor>,
) {
    if gameplay_settings.is_changed() {
        // Update speed display text
        for mut text in speed_display_query.iter_mut() {
            text.0 = format!("{:.2}x", gameplay_settings.speed_multiplier);
        }
        
        // Update speed button colors
        for (speed_button, mut bg_color, children) in speed_button_query.iter_mut() {
            let is_current = (speed_button.speed - gameplay_settings.speed_multiplier).abs() < 0.01;
            *bg_color = if is_current {
                Color::srgb(1.0, 0.0, 1.0).into() // Magenta for selected
            } else {
                Color::srgb(0.2, 0.2, 0.3).into() // Dark for unselected
            };
            
            // Update button text color
            for child in children.iter() {
                if let Ok(mut text_color) = button_text_query.get_mut(child) {
                    *text_color = if is_current {
                        TextColor(Color::srgb(0.0, 0.0, 0.0)) // Black text for selected
                    } else {
                        TextColor(Color::srgb(0.9, 0.9, 1.0)) // White text for unselected
                    };
                }
            }
        }
    }
}

pub fn speed_button_interaction(
    mut interaction_query: Query<(&Interaction, &SpeedButton, &mut BackgroundColor), Changed<Interaction>>,
    mut gameplay_settings: ResMut<GameplaySettings>,
) {
    for (interaction, speed_button, mut color) in interaction_query.iter_mut() {
        match *interaction {
            Interaction::Pressed => {
                gameplay_settings.speed_multiplier = speed_button.speed;
                info!("Speed button clicked: {:.2}x", speed_button.speed);
            }
            Interaction::Hovered => {
                let is_current = (speed_button.speed - gameplay_settings.speed_multiplier).abs() < 0.01;
                if !is_current {
                    *color = Color::srgb(0.3, 0.3, 0.4).into(); // Lighter on hover
                }
            }
            Interaction::None => {
                let is_current = (speed_button.speed - gameplay_settings.speed_multiplier).abs() < 0.01;
                *color = if is_current {
                    Color::srgb(1.0, 0.0, 1.0).into() // Magenta for selected
                } else {
                    Color::srgb(0.2, 0.2, 0.3).into() // Dark for unselected
                };
            }
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
    // Only update if state changed
    if state.is_changed() {
        println!("Updating carousel visuals for selection: {}", state.selected);
        
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
}

pub fn update_song_preview(
    mut state: ResMut<CarouselState>,
    song_library: Res<SongLibrary>,
    preloaded_audio: Res<PreloadedAudio>,
    audio: Res<Audio>,
    mut commands: Commands,
    mut preview_query: Query<Entity, With<PreviewAudio>>,
    mut banner_query: Query<&mut Text, With<BannerVideo>>,
) {
    // Check if selection changed
    let selection_changed = state.last_selected != Some(state.selected);
    
    if selection_changed {
        println!("Selection changed to song {}", state.selected);
        
        // Stop ALL currently playing audio first
        audio.stop();
        
        // Despawn preview audio entities
        for entity in preview_query.iter_mut() {
            commands.entity(entity).despawn();
        }
        
        // Start new preview audio if song exists
        if song_library.songs.is_empty() {
            // Update banner with help message when no songs are available
            if let Ok(mut banner_text) = banner_query.single_mut() {
                **banner_text = "🎵 No songs found!\nPress Enter to load .osz files".to_string();
                println!("Updated banner: No songs available, showing help message");
            }
        } else if state.selected < song_library.songs.len() {
            let selected_song = &song_library.songs[state.selected];
            
            // Update banner video info with detailed information
            if let Ok(mut banner_text) = banner_query.single_mut() {
                let new_text = if let Some(ref video_path) = selected_song.video_path {
                    let video_name = video_path.split('/').last().unwrap_or("Video");
                    let extension = video_path.split('.').last().unwrap_or("").to_uppercase();
                    format!("🎥 {} ({})", video_name, extension)
                } else {
                    format!("🎵 {} (No Video)", selected_song.name)
                };
                
                // Force text update by setting new string
                **banner_text = new_text.clone();
                println!("Updated banner for: {} -> '{}'", selected_song.name, new_text);
            }
            
            // Use preloaded audio for instant playback
            if state.selected < preloaded_audio.handles.len() {
                if let Some(ref audio_handle) = preloaded_audio.handles[state.selected] {
                    // Play with looped audio and volume control - instant playback!
                    audio.play(audio_handle.clone()).looped().with_volume(0.3);
                    
                    // Spawn new preview audio entity
                    commands.spawn(PreviewAudio);
                    
                    println!("Started INSTANT preview for song {}: {}", state.selected, selected_song.name);
                } else {
                    println!("No preloaded audio for song: {}", selected_song.name);
                }
            } else {
                println!("No audio path for song: {}", selected_song.name);
            }
        }
        
        // Update last_selected to current selection
        state.last_selected = Some(state.selected);
    }
}