use bevy::prelude::*;
use std::time::Instant;

#[derive(Resource)]
pub struct Song {
    pub start_instant: Instant,
    pub note_times: Vec<u32>,
    pub next_index: usize,
}

#[derive(Resource)]
pub struct Config {
    pub approach_ms: u32,
    pub perfect_ms: u32,
    pub good_ms: u32,
    pub rotation_speed: f32,
}

#[derive(Resource, Clone)]
pub struct GameplaySettings {
    pub speed_multiplier: f32,
    pub available_speeds: Vec<f32>,
}

impl Default for GameplaySettings {
    fn default() -> Self {
        Self {
            speed_multiplier: 1.0,
            available_speeds: vec![0.5, 0.75, 1.0, 1.25, 1.5, 2.0],
        }
    }
}

#[derive(Resource)]
pub struct SongLibrary {
    pub songs: Vec<SongInfo>,
}

impl Default for SongLibrary {
    fn default() -> Self {
        info!("DEBUG: SongLibrary::default() - starting with empty library");
        Self { songs: Vec::new() }
    }
}

impl SongLibrary {
    pub fn reload_osu_data(&mut self) -> bool {
        info!("Attempting to reload OSU chart data with .osz processing...");
        match crate::osu_loader::load_songs_with_osz_extraction() {
            Ok(songs) if !songs.is_empty() => {
                info!("Successfully reloaded {} songs from OSU charts", songs.len());
                self.songs = songs;
                true
            },
            Ok(_) => {
                warn!("No .osz files or charts found in charts directory");
                false
            },
            Err(e) => {
                error!("Failed to reload OSU charts: {}", e);
                false
            }
        }
    }


}

#[derive(Resource, Default)]
pub struct GameScore {
    pub score: u32,
    pub combo: u32,
    pub max_combo: u32,
    pub health: f32, // 0.0 to 1.0
}

#[derive(Clone, Debug)]
#[allow(dead_code)]
pub struct SongInfo {
    pub name: String,
    pub artist: Option<String>,
    pub audio_path: Option<String>,
    pub video_path: Option<String>,
    pub banner_path: Option<String>,
    pub note_times: Vec<u32>,
    // OSU difficulty settings
    pub overall_difficulty: Option<f32>,
    pub circle_size: Option<f32>,
    pub approach_rate: Option<f32>,
    pub hp_drain_rate: Option<f32>,
    pub stars: Option<f32>,
}