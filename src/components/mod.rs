use bevy::prelude::*;

#[derive(Component)]
pub struct Note {
    pub time_ms: u32,
    pub hit: bool,
}

#[derive(Component)]
#[allow(dead_code)]
pub struct Pin {
    pub angle: f32,
    pub radius: f32,
}

#[derive(Component)]
#[allow(dead_code)]
pub struct SongButton {
    pub song_index: usize,
}

#[derive(Component)]
pub struct MenuUIMarker;

#[derive(Component)]
#[allow(dead_code)]
pub struct HudMarker;

#[derive(Component)]
pub struct ScoreText;

#[derive(Component)]
pub struct ComboText;

#[derive(Component)]
pub struct HealthBar;

#[derive(Component)]
pub struct FadeIn {
    pub timer: Timer,
    pub start_alpha: f32,
    pub end_alpha: f32,
}

#[derive(Component)]
pub struct FadeOut {
    pub timer: Timer,
    pub start_alpha: f32,
    pub end_alpha: f32,
}

#[derive(Component)]
pub struct TransitionTimer {
    pub timer: Timer,
}

#[derive(Component)]
pub struct ResultUIMarker;

#[derive(Component)]
pub struct BackToMenuButton;

#[derive(Component)]
pub struct DifficultyDisplay;

#[derive(Component)]
pub struct DifficultyStars;

#[derive(Component)]
pub struct DifficultyValue;