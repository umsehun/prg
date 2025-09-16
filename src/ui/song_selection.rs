use bevy::prelude::*;
use crate::components::MenuUIMarker;
use crate::resources::SongLibrary;

#[derive(Component)]
pub struct CarouselRoot;
#[derive(Component)]
pub struct CarouselItem { pub index: usize }
#[derive(Resource, Default)]
pub struct CarouselState { pub selected: usize }

pub fn spawn_song_selection_ui(
    mut commands: Commands,
    lib: Res<SongLibrary>,
    asset_server: Res<AssetServer>,
) {
    info!("spawn_song_selection_ui: carousel phase 1");
    commands.insert_resource(CarouselState::default());

    commands
        .spawn((
            Node {
                width: Val::Percent(100.0),
                height: Val::Percent(100.0),
                justify_content: JustifyContent::Center,
                align_items: AlignItems::Center,
                ..default()
            },
            BackgroundColor(Color::srgba(0.02, 0.02, 0.04, 1.0)),
            MenuUIMarker,
            CarouselRoot,
            Name::new("SongCarouselRoot"),
        ))
        .with_children(|parent| {
            parent
                .spawn((
                    Node {
                        flex_direction: FlexDirection::Row,
                        align_items: AlignItems::Center,
                        column_gap: Val::Px(16.0),
                        ..default()
                    },
                    Name::new("CarouselRow"),
                ))
                .with_children(|row| {
                    for (i, song) in lib.songs.iter().enumerate() {
                        row.spawn((
                            Node {
                                width: Val::Px(220.0),
                                height: Val::Px(124.0),
                                justify_content: JustifyContent::Center,
                                align_items: AlignItems::End,
                                border: UiRect::all(Val::Px(2.0)),
                                ..default()
                            },
                            BackgroundColor(Color::srgba(0.1, 0.1, 0.14, 1.0)),
                            BorderColor(Color::srgba(0.4, 0.7, 1.0, 0.6)),
                            CarouselItem { index: i },
                            Name::new(format!("Item-{}", song.name)),
                        ))
                        .with_children(|card| {
                            // Banner image (if available), else fallback text
                            if let Some(banner_rel) = &song.banner_path {
                                let handle: Handle<Image> = asset_server.load(banner_rel);
                                card.spawn((
                                    Node {
                                        position_type: PositionType::Absolute,
                                        left: Val::Px(0.0),
                                        right: Val::Px(0.0),
                                        top: Val::Px(0.0),
                                        bottom: Val::Px(0.0),
                                        ..default()
                                    },
                                )).with_children(|img_wrap|{
                                    img_wrap.spawn((
                                        ImageNode::new(handle.clone()),
                                        Node {
                                            width: Val::Percent(100.0),
                                            height: Val::Percent(100.0),
                                            ..default()
                                        },
                                    ));
                                });
                            }

                            card.spawn((
                                Text::new(song.name.clone()),
                                TextFont { font_size: 18.0, ..default() },
                                TextColor(Color::WHITE),
                                Node { margin: UiRect::all(Val::Px(8.0)), ..default() },
                            ));
                        });
                    }
                });
        });
}

pub fn spawn_song_select_ui(
    mut commands: Commands,
    song_library: Res<SongLibrary>,
    asset_server: Res<AssetServer>,
) {
    spawn_song_selection_ui(commands, song_library, asset_server);
}

pub fn carousel_keyboard_nav(
    keys: Res<ButtonInput<KeyCode>>,
    state: Option<ResMut<CarouselState>>,
    items: Query<&CarouselItem>,
) {
    let count = items.iter().count();
    if count == 0 { return; }
    if let Some(mut s) = state {
        if keys.just_pressed(KeyCode::ArrowRight) { s.selected = (s.selected + 1) % count; }
        if keys.just_pressed(KeyCode::ArrowLeft) { s.selected = (s.selected + count - 1) % count; }
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
 
