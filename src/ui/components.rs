use bevy::prelude::*;

/// DJMAX-inspired theme colors
#[derive(Resource)]
pub struct UITheme {
    pub background: Color,
    pub primary: Color,    // Cyan
    pub secondary: Color,  // Magenta  
    pub accent: Color,     // Neon Green
    pub text: Color,
    pub button_normal: Color,
    pub button_hovered: Color,
    pub button_pressed: Color,
}

impl Default for UITheme {
    fn default() -> Self {
        Self {
            // Rich dark gradient background - using solid colors for visibility
            background: Color::srgb(0.1, 0.1, 0.2),           // Dark blue (visible)
            primary: Color::srgb(0.0, 1.0, 1.0),              // Bright cyan
            secondary: Color::srgb(1.0, 0.0, 1.0),            // Bright magenta
            accent: Color::srgb(0.0, 1.0, 0.5),               // Neon green
            text: Color::srgb(1.0, 1.0, 1.0),                 // Pure white
            // Enhanced button colors - solid for debugging, transparency later
            button_normal: Color::srgb(0.2, 0.8, 1.0),        // Solid cyan
            button_hovered: Color::srgb(0.4, 0.9, 1.0),       // Brighter cyan
            button_pressed: Color::srgb(0.6, 1.0, 1.0),       // Full bright cyan
        }
    }
}

/// Button component marker
#[derive(Component)]
pub struct MenuButton {
    pub action: ButtonAction,
}

/// Button actions
#[derive(Debug, Clone, Copy)]
pub enum ButtonAction {
    Play,
    Settings,
    Quit,
}

/// Create a styled menu button with DJMAX-style effects
pub fn create_menu_button(
    commands: &mut Commands,
    text: &str,
    action: ButtonAction,
    theme: &UITheme,
) -> Entity {
    commands
        .spawn((
            Button,
            Node {
                width: Val::Px(250.0),        // Wider buttons
                height: Val::Px(70.0),        // Taller buttons
                margin: UiRect::all(Val::Px(15.0)),
                justify_content: JustifyContent::Center,
                align_items: AlignItems::Center,
                border: UiRect::all(Val::Px(3.0)),  // Thicker border
                ..default()
            },
            BackgroundColor(theme.button_normal.into()),
            BorderColor(theme.primary.into()),
            // Add debug outline to make buttons visible
            Outline {
                width: Val::Px(2.0),
                offset: Val::Px(2.0),
                color: theme.accent,
            },
            MenuButton { action },
        ))
        .with_children(|parent| {
            parent.spawn((
                Text::new(text),
                TextLayout::new_with_justify(JustifyText::Center),
                TextFont {
                    font_size: 28.0,          // Larger font
                    ..default()
                },
                TextColor(theme.text),
            ));
        })
        .id()
}

/// Create the main background container
pub fn create_background_container(
    commands: &mut Commands,
    theme: &UITheme,
) -> Entity {
    commands
        .spawn((
            Node {
                width: Val::Percent(100.0),
                height: Val::Percent(100.0),
                justify_content: JustifyContent::Center,
                align_items: AlignItems::Center,
                flex_direction: FlexDirection::Column,
                ..default()
            },
            BackgroundColor(theme.background.into()),
            // Add debug outline to confirm container is rendering
            Outline {
                width: Val::Px(5.0),
                offset: Val::Px(0.0),
                color: theme.secondary,
            },
        ))
        .id()
}

/// Create the menu container and buttons
pub fn create_menu_container(
    commands: &mut Commands,
    parent: Entity,
    theme: &UITheme,
) {
    // Create menu container with enhanced styling
    let menu_container = commands
        .spawn((
            Node {
                flex_direction: FlexDirection::Column,
                align_items: AlignItems::Center,
                justify_content: JustifyContent::Center,
                padding: UiRect::all(Val::Px(60.0)),  // More padding
                border: UiRect::all(Val::Px(4.0)),    // Thicker border
                ..default()
            },
            // Semi-transparent dark background with subtle gradient feel
            BackgroundColor(Color::srgb(0.15, 0.15, 0.25)),  // Solid for debugging
            BorderColor(theme.primary.into()),
        ))
        .id();

    // Add menu container to parent
    commands.entity(parent).add_child(menu_container);

    // Create title with enhanced styling
    let title = commands
        .spawn((
            Text::new("PIN RHYTHM GAME"),
            TextLayout::new_with_justify(JustifyText::Center),
            TextFont {
                font_size: 56.0,              // Larger title
                ..default()
            },
            TextColor(theme.primary),
            Node {
                margin: UiRect::bottom(Val::Px(50.0)),  // More spacing
                ..default()
            },
        ))
        .id();
    
    // Create subtitle
    let subtitle = commands
        .spawn((
            Text::new("DJMAX Style OSU Inspired"),
            TextLayout::new_with_justify(JustifyText::Center),
            TextFont {
                font_size: 20.0,
                ..default()
            },
            TextColor(theme.secondary),      // Use magenta for subtitle
            Node {
                margin: UiRect::bottom(Val::Px(40.0)),
                ..default()
            },
        ))
        .id();

    commands.entity(menu_container).add_child(title);
    commands.entity(menu_container).add_child(subtitle);

    // Create menu buttons
    let play_button = create_menu_button(commands, "PLAY", ButtonAction::Play, theme);
    let settings_button = create_menu_button(commands, "SETTINGS", ButtonAction::Settings, theme);
    let quit_button = create_menu_button(commands, "QUIT", ButtonAction::Quit, theme);

    commands.entity(menu_container).add_child(play_button);
    commands.entity(menu_container).add_child(settings_button);
    commands.entity(menu_container).add_child(quit_button);

    // Add keyboard shortcuts info
    let shortcuts_info = commands
        .spawn((
            Text::new("Keyboard Shortcuts: [P] Play • [S] Settings • [E] Exit"),
            TextLayout::new_with_justify(JustifyText::Center),
            TextFont {
                font_size: 16.0,
                ..default()
            },
            TextColor(theme.accent.with_alpha(0.8)),
            Node {
                margin: UiRect::top(Val::Px(30.0)),
                ..default()
            },
        ))
        .id();
    
    commands.entity(menu_container).add_child(shortcuts_info);
}