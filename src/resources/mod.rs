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

#[derive(Resource, Default)]
pub struct SongLibrary {
    pub songs: Vec<SongInfo>,
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
    pub audio_path: Option<String>,
    pub video_path: Option<String>,
    pub banner_path: Option<String>,
    pub note_times: Vec<u32>,
}