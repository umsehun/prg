use bevy::prelude::*;
use crate::osu_loader::parse_all_osz;
use crate::resources::{Song, Config, SongLibrary, GameScore};
use crate::components::{Note, Pin, SongButton, MenuUIMarker, HudMarker, ScoreText, ComboText, HealthBar, FadeIn, FadeOut, TransitionTimer, ResultUIMarker, BackToMenuButton};
use crate::GameState;
use std::time::Instant;

pub fn setup_camera(mut commands: Commands) {
    // Basic camera setup for standard Bevy UI
    commands.spawn(Camera2d);
}

pub fn setup(mut commands: Commands) {
    // Spawn UI camera
    commands.spawn(Camera2d);
    
    // Parse all .osz files
    let songs = parse_all_osz("public/assets").unwrap_or_default();

    commands.insert_resource(SongLibrary { songs: songs.clone() });

    // For now, use first song
    if let Some(first_song) = songs.first() {
        commands.insert_resource(Song {
            start_instant: Instant::now(),
            note_times: first_song.note_times.clone(),
            next_index: 0,
        });
    } else {
        commands.insert_resource(Song {
            start_instant: Instant::now(),
            note_times: Vec::new(),
            next_index: 0,
        });
    }

    commands.insert_resource(Config {
        approach_ms: 1200,
        perfect_ms: 30,
        good_ms: 80,
        rotation_speed: 90.0, // degrees per second
    });

    commands.insert_resource(GameScore::default());

    // Spawn central circle using basic Bevy sprite
    commands.spawn((
        Sprite {
            color: Color::srgb(0.2, 0.2, 0.2),
            custom_size: Some(Vec2::new(150.0, 150.0)),
            ..default()
        },
        Transform::from_xyz(0.0, 0.0, 0.0),
    ));

    println!("Setup completed. Songs loaded: {}", songs.len());
    // Create UI after resources are set up
    // song_selection_ui(commands, SongLibrary { songs: songs }); // Moved to OnEnter(GameState::Menu)
}

pub fn song_selection_ui(
    mut commands: Commands,
    song_library: Res<SongLibrary>,
    existing_ui: Query<Entity, With<MenuUIMarker>>,
) {
    println!("song_selection_ui called! Songs: {}", song_library.songs.len());
    
    // Only create UI if it doesn't exist
    if existing_ui.is_empty() {
        println!("Creating new menu UI...");
        // Root UI node
        commands.spawn((
            Node {
                width: Val::Percent(100.0),
                height: Val::Percent(100.0),
                flex_direction: FlexDirection::Column,
                align_items: AlignItems::Center,
                justify_content: JustifyContent::Center,
                ..default()
            },
            BackgroundColor(Color::srgba(0.1, 0.1, 0.1, 0.9)),
            MenuUIMarker,
        )).with_children(|parent| {
            // Title
            parent.spawn((
                Text::new("Select a Song"),
                TextFont {
                    font_size: 48.0,
                    ..default()
                },
                TextColor(Color::WHITE),
                Node {
                    margin: UiRect::bottom(Val::Px(40.0)),
                    ..default()
                },
            ));

            // Song buttons container
            parent.spawn((
                Node {
                    flex_direction: FlexDirection::Column,
                    align_items: AlignItems::Center,
                    row_gap: Val::Px(10.0),
                    ..default()
                },
            )).with_children(|parent| {
                for (index, song) in song_library.songs.iter().enumerate() {
                    parent.spawn((
                        Button,
                        Node {
                            width: Val::Px(300.0),
                            height: Val::Px(50.0),
                            border: UiRect::all(Val::Px(2.0)),
                            justify_content: JustifyContent::Center,
                            align_items: AlignItems::Center,
                            ..default()
                        },
                        BorderColor(Color::WHITE),
                        BackgroundColor(Color::srgba(0.2, 0.2, 0.2, 1.0)),
                        SongButton { song_index: index },
                    )).with_children(|parent| {
                        parent.spawn((
                            Text::new(&song.name),
                            TextFont {
                                font_size: 24.0,
                                ..default()
                            },
                            TextColor(Color::WHITE),
                        ));
                    });
                }
            });
        });
    } // End of if block
} // End of function

pub fn song_button_system(
    mut interaction_query: Query<
        (&Interaction, &SongButton),
        (Changed<Interaction>, With<Button>),
    >,
    mut commands: Commands,
    song_library: Res<SongLibrary>,
    mut next_state: ResMut<NextState<GameState>>,
    mut game_score: ResMut<GameScore>,
) {
    for (interaction, song_button) in &mut interaction_query {
        if *interaction == Interaction::Pressed {
            if let Some(song) = song_library.songs.get(song_button.song_index) {
                // Reset score for new game
                *game_score = GameScore::default();
                
                // Start the selected song
                commands.insert_resource(Song {
                    start_instant: Instant::now(),
                    note_times: song.note_times.clone(),
                    next_index: 0,
                });

                // Add fade out to menu UI
                commands.spawn((
                    FadeOut {
                        timer: Timer::from_seconds(0.5, TimerMode::Once),
                        start_alpha: 0.9,
                        end_alpha: 0.0,
                    },
                    MenuUIMarker,
                ));

                // Transition to gameplay state after a short delay
                commands.spawn((
                    TransitionTimer {
                        timer: Timer::from_seconds(0.5, TimerMode::Once),
                    },
                ));
            }
        }
    }
}

pub fn gameplay_hud_ui(
    mut commands: Commands,
    game_score: Res<GameScore>,
    existing_hud: Query<Entity, With<HudMarker>>,
) {
    // Only create HUD if it doesn't exist
    if existing_hud.is_empty() {
        // Root HUD node
        commands.spawn((
            Node {
                width: Val::Percent(100.0),
                height: Val::Percent(100.0),
                ..default()
            },
            HudMarker,
        )).with_children(|parent| {
            // Left side - Score and Combo
            parent.spawn((
                Node {
                    position_type: PositionType::Absolute,
                    left: Val::Px(50.0),
                    top: Val::Px(50.0),
                    flex_direction: FlexDirection::Column,
                    align_items: AlignItems::Start,
                    ..default()
                },
                FadeIn {
                    timer: Timer::from_seconds(0.5, TimerMode::Once),
                    start_alpha: 0.0,
                    end_alpha: 1.0,
                },
            )).with_children(|parent| {
                // Score
                parent.spawn((
                    Text::new("Score: 0"),
                    TextFont {
                        font_size: 36.0,
                        ..default()
                    },
                    TextColor(Color::WHITE),
                    ScoreText,
                ));

                // Combo
                parent.spawn((
                    Text::new("Combo: 0"),
                    TextFont {
                        font_size: 28.0,
                        ..default()
                    },
                    TextColor(Color::srgb(1.0, 1.0, 0.0)),
                    ComboText,
                    Node {
                        margin: UiRect::top(Val::Px(10.0)),
                        ..default()
                    },
                ));

                // Health bar background
                parent.spawn((
                    Node {
                        width: Val::Px(200.0),
                        height: Val::Px(20.0),
                        border: UiRect::all(Val::Px(2.0)),
                        margin: UiRect::top(Val::Px(20.0)),
                        ..default()
                    },
                    BorderColor(Color::WHITE),
                    BackgroundColor(Color::srgba(0.2, 0.2, 0.2, 1.0)),
                )).with_children(|parent| {
                    // Health bar fill
                    parent.spawn((
                        Node {
                            width: Val::Percent(100.0),
                            height: Val::Percent(100.0),
                            ..default()
                        },
                        BackgroundColor(Color::srgb(0.0, 1.0, 0.0)),
                        HealthBar,
                    ));
                });
            });

            // Right side - Song info
            parent.spawn((
                Node {
                    position_type: PositionType::Absolute,
                    right: Val::Px(50.0),
                    top: Val::Px(50.0),
                    flex_direction: FlexDirection::Column,
                    align_items: AlignItems::End,
                    ..default()
                },
                FadeIn {
                    timer: Timer::from_seconds(0.5, TimerMode::Once),
                    start_alpha: 0.0,
                    end_alpha: 1.0,
                },
            )).with_children(|parent| {
                parent.spawn((
                    Text::new("Playing"),
                    TextFont {
                        font_size: 24.0,
                        ..default()
                    },
                    TextColor(Color::WHITE),
                ));
            });
        });
    }
}

pub fn update_score_text_system(
    game_score: Res<GameScore>,
    mut query: Query<&mut Text, With<ScoreText>>,
) {
    for mut text in query.iter_mut() {
        *text = Text::new(format!("Score: {}", game_score.score));
    }
}

pub fn update_combo_text_system(
    game_score: Res<GameScore>,
    mut query: Query<&mut Text, With<ComboText>>,
) {
    for mut text in query.iter_mut() {
        *text = Text::new(format!("Combo: {}", game_score.combo));
    }
}

pub fn update_health_bar_system(
    game_score: Res<GameScore>,
    mut query: Query<&mut Node, With<HealthBar>>,
) {
    for mut node in query.iter_mut() {
        node.width = Val::Percent(game_score.health * 100.0);
    }
}

pub fn fade_in_system(
    time: Res<Time>,
    mut query: Query<(Entity, &mut FadeIn, &mut BackgroundColor)>,
    mut commands: Commands,
) {
    for (entity, mut fade, mut bg_color) in query.iter_mut() {
        fade.timer.tick(time.delta());
        let progress = fade.timer.fraction();
        let current_alpha = fade.start_alpha + (fade.end_alpha - fade.start_alpha) * progress;
        bg_color.0 = bg_color.0.with_alpha(current_alpha);

        if fade.timer.finished() {
            bg_color.0 = bg_color.0.with_alpha(fade.end_alpha);
            commands.entity(entity).remove::<FadeIn>();
        }
    }
}

pub fn fade_out_system(
    time: Res<Time>,
    mut query: Query<(Entity, &mut FadeOut, &mut BackgroundColor)>,
    mut commands: Commands,
) {
    for (entity, mut fade, mut bg_color) in query.iter_mut() {
        fade.timer.tick(time.delta());
        let progress = fade.timer.fraction();
        let current_alpha = fade.start_alpha + (fade.end_alpha - fade.start_alpha) * progress;
        bg_color.0 = bg_color.0.with_alpha(current_alpha);

        if fade.timer.finished() {
            bg_color.0 = bg_color.0.with_alpha(fade.end_alpha);
            commands.entity(entity).remove::<FadeOut>();
        }
    }
}

pub fn transition_system(
    time: Res<Time>,
    mut query: Query<(Entity, &mut TransitionTimer)>,
    mut commands: Commands,
    mut next_state: ResMut<NextState<GameState>>,
) {
    for (entity, mut timer) in query.iter_mut() {
        timer.timer.tick(time.delta());
        if timer.timer.finished() {
            next_state.set(GameState::Playing);
            commands.entity(entity).despawn();
        }
    }
}

pub fn result_screen_ui(
    mut commands: Commands,
    game_score: Res<GameScore>,
    existing_result: Query<Entity, With<ResultUIMarker>>,
) {
    // Only create result screen if it doesn't exist
    if existing_result.is_empty() {
        // Calculate rank based on score (simple implementation)
        let rank = if game_score.score >= 5000 {
            "S"
        } else if game_score.score >= 4000 {
            "A"
        } else if game_score.score >= 3000 {
            "B"
        } else if game_score.score >= 2000 {
            "C"
        } else {
            "D"
        };

        // Root result screen node
        commands.spawn((
            Node {
                width: Val::Percent(100.0),
                height: Val::Percent(100.0),
                flex_direction: FlexDirection::Column,
                align_items: AlignItems::Center,
                justify_content: JustifyContent::Center,
                ..default()
            },
            BackgroundColor(Color::srgba(0.0, 0.0, 0.0, 0.8)),
            ResultUIMarker,
        )).with_children(|parent| {
            // Title
            parent.spawn((
                Text::new("Result"),
                TextFont {
                    font_size: 72.0,
                    ..default()
                },
                TextColor(Color::WHITE),
                Node {
                    margin: UiRect::bottom(Val::Px(50.0)),
                    ..default()
                },
            ));

            // Stats container
            parent.spawn((
                Node {
                    flex_direction: FlexDirection::Column,
                    align_items: AlignItems::Center,
                    row_gap: Val::Px(20.0),
                    ..default()
                },
            )).with_children(|parent| {
                // Rank
                parent.spawn((
                    Text::new(format!("Rank: {}", rank)),
                    TextFont {
                        font_size: 48.0,
                        ..default()
                    },
                    TextColor(Color::srgb(1.0, 1.0, 0.0)),
                ));

                // Final Score
                parent.spawn((
                    Text::new(format!("Score: {}", game_score.score)),
                    TextFont {
                        font_size: 36.0,
                        ..default()
                    },
                    TextColor(Color::WHITE),
                ));

                // Max Combo
                parent.spawn((
                    Text::new(format!("Max Combo: {}", game_score.max_combo)),
                    TextFont {
                        font_size: 28.0,
                        ..default()
                    },
                    TextColor(Color::WHITE),
                ));

                // Health
                parent.spawn((
                    Text::new(format!("Health: {:.1}%", game_score.health * 100.0)),
                    TextFont {
                        font_size: 28.0,
                        ..default()
                    },
                    TextColor(Color::srgb(0.0, 1.0, 0.0)),
                ));

                // Back to menu button
                parent.spawn((
                    Button,
                    Node {
                        width: Val::Px(200.0),
                        height: Val::Px(50.0),
                        border: UiRect::all(Val::Px(2.0)),
                        justify_content: JustifyContent::Center,
                        align_items: AlignItems::Center,
                        margin: UiRect::top(Val::Px(50.0)),
                        ..default()
                    },
                    BorderColor(Color::WHITE),
                    BackgroundColor(Color::srgba(0.2, 0.2, 0.2, 1.0)),
                    BackToMenuButton,
                )).with_children(|parent| {
                    parent.spawn((
                        Text::new("Back to Menu"),
                        TextFont {
                            font_size: 24.0,
                            ..default()
                        },
                        TextColor(Color::WHITE),
                    ));
                });
            });
        });
    }
}

pub fn back_to_menu_system(
    mut interaction_query: Query<
        &Interaction,
        (Changed<Interaction>, With<Button>, With<BackToMenuButton>),
    >,
    mut next_state: ResMut<NextState<GameState>>,
) {
    for interaction in &mut interaction_query {
        if *interaction == Interaction::Pressed {
            next_state.set(GameState::Menu);
        }
    }
}

pub fn result_esc_handler(
    keys: Res<ButtonInput<KeyCode>>,
    mut next_state: ResMut<NextState<GameState>>,
) {
    if keys.just_pressed(KeyCode::Escape) {
        next_state.set(GameState::Menu);
    }
}

pub fn cleanup_menu_ui(
    mut commands: Commands,
    menu_ui_query: Query<Entity, With<MenuUIMarker>>,
) {
    // Despawn all menu UI entities when entering Playing state
    for entity in menu_ui_query.iter() {
        commands.entity(entity).despawn_recursive();
    }
}

pub fn spawn_song_select_ui(
    mut commands: Commands,
    song_library: Res<SongLibrary>,
    asset_server: Res<AssetServer>,
) {
    crate::ui::song_selection::spawn_song_select_ui(commands, song_library, asset_server);
}

pub fn song_select_esc_handler(
    keys: Res<ButtonInput<KeyCode>>,
    mut next_state: ResMut<NextState<GameState>>,
) {
    crate::ui::song_selection::song_select_esc_handler(keys, next_state);
}

pub fn spawn_approach_system(
    mut commands: Commands,
    mut song: ResMut<Song>,
    config: Res<Config>,
) {
    let now_ms = song.start_instant.elapsed().as_millis() as u32;

    while song.next_index < song.note_times.len() {
        let nt = song.note_times[song.next_index];
        if now_ms >= nt.saturating_sub(config.approach_ms) {
            // Spawn approach indicator
            commands.spawn((
                Note { time_ms: nt, hit: false },
                Sprite {
                    color: Color::srgb(1.0, 1.0, 0.0),
                    custom_size: Some(Vec2::new(20.0, 20.0)),
                    ..default()
                },
                Transform::from_xyz(0.0, 350.0, 1.0),
            ));
            song.next_index += 1;
        } else {
            break;
        }
    }
}

pub fn move_approach_system(
    mut query: Query<&mut Transform, With<Note>>,
    time: Res<Time>,
) {
    for mut transform in query.iter_mut() {
        transform.translation.y -= 300.0 * time.delta_secs();
    }
}

pub fn input_system(
    keyboard: Res<ButtonInput<KeyCode>>,
    song: Res<Song>,
    config: Res<Config>,
    mut commands: Commands,
    mut query_notes: Query<(Entity, &mut Note)>,
    time: Res<Time>,
    mut game_score: ResMut<GameScore>,
    mut next_state: ResMut<NextState<GameState>>,
) {
    if keyboard.just_pressed(KeyCode::KeyS) {
        let now_ms = song.start_instant.elapsed().as_millis() as i64;

        // Find closest unhit note
        let mut closest_note: Option<(Entity, Mut<Note>)> = None;
        let mut min_dt = i64::MAX;
        for (_entity, note) in query_notes.iter_mut() {
            if !note.hit {
                let dt = (note.time_ms as i64 - now_ms).abs();
                if dt < min_dt {
                    min_dt = dt;
                    closest_note = Some((_entity, note));
                }
            }
        }

        if let Some((_entity, mut note)) = closest_note {
            if min_dt <= config.good_ms as i64 {
                let dt = (now_ms - note.time_ms as i64).abs() as u32;
                let judgment = if dt <= config.perfect_ms {
                    "PERFECT"
                } else if dt <= config.good_ms {
                    "GOOD"
                } else {
                    "MISS"
                };
                println!("{}! dt={}ms", judgment, dt);

                // Update score and combo
                match judgment {
                    "PERFECT" => {
                        game_score.score += 300;
                        game_score.combo += 1;
                        game_score.health = (game_score.health + 0.1).min(1.0);
                    }
                    "GOOD" => {
                        game_score.score += 100;
                        game_score.combo += 1;
                        game_score.health = (game_score.health + 0.05).min(1.0);
                    }
                    "MISS" => {
                        game_score.combo = 0;
                        game_score.health = (game_score.health - 0.2).max(0.0);
                    }
                    _ => {}
                }
                game_score.max_combo = game_score.max_combo.max(game_score.combo);

                // Mark as hit
                note.hit = true;

                // Spawn pin at current rotation angle
                let elapsed_secs = time.elapsed_secs();
                let angle = (config.rotation_speed * elapsed_secs).rem_euclid(360.0).to_radians();
                let radius = 150.0;
                let x = radius * angle.cos();
                let y = radius * angle.sin();

                println!("Pin spawned at angle: {:.2}, radius: {:.2}", angle.to_degrees(), radius);

                commands.spawn((
                    Pin { angle, radius },
                    Sprite {
                        color: Color::srgb(1.0, 0.0, 0.0),
                        custom_size: Some(Vec2::new(10.0, 10.0)),
                        ..default()
                    },
                    Transform::from_xyz(x, y, 2.0),
                ));
            } else {
                println!("MISS (no nearby note)");
            }
        } else {
            println!("MISS (no unhit notes)");
        }
    }

    // Check if song is finished (no more notes to spawn and no unhit notes)
    let all_notes_hit = query_notes.iter().all(|(_, note)| note.hit);
    if song.next_index >= song.note_times.len() && all_notes_hit {
        // Song finished, transition to result screen
        next_state.set(GameState::Result);
    }
}

pub fn gameplay_esc_handler(
    keys: Res<ButtonInput<KeyCode>>,
    mut next_state: ResMut<NextState<GameState>>,
) {
    if keys.just_pressed(KeyCode::Escape) {
        next_state.set(GameState::Menu);
    }
}