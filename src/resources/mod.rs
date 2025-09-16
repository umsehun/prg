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

#[derive(Resource)]
pub struct SongLibrary {
    pub songs: Vec<SongInfo>,
}

impl Default for SongLibrary {
    fn default() -> Self {
        info!("DEBUG: SongLibrary::default() - attempting to load real OSU data");
        
        // Try to load real OSU data first
        match crate::osu_loader::load_songs_from_charts() {
            Ok(songs) if !songs.is_empty() => {
                info!("Successfully loaded {} songs from OSU charts", songs.len());
                Self { songs }
            },
            Ok(_) => {
                info!("No OSU charts found, falling back to dummy data");
                Self::create_dummy_data()
            },
            Err(e) => {
                warn!("Failed to load OSU charts ({}), falling back to dummy data", e);
                Self::create_dummy_data()
            }
        }
    }
}

impl SongLibrary {
    fn create_dummy_data() -> Self {
        info!("DEBUG: Creating dummy data for testing");
        let songs = vec![
            SongInfo {
                name: "Test Song 1".to_string(),
                audio_path: Some("audio/test1.mp3".to_string()),
                video_path: None,
                banner_path: None,
                note_times: vec![1000, 2000, 3000, 4000],
            },
            SongInfo {
                name: "Test Song 2".to_string(),
                audio_path: Some("audio/test2.mp3".to_string()),
                video_path: None,
                banner_path: None,
                note_times: vec![500, 1500, 2500, 3500],
            },
            SongInfo {
                name: "Test Song 3".to_string(),
                audio_path: Some("audio/test3.mp3".to_string()),
                video_path: None,
                banner_path: None,
                note_times: vec![800, 1600, 2400, 3200],
            },
        ];
        info!("DEBUG: Created {} dummy songs", songs.len());
        Self { songs }
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
    pub audio_path: Option<String>,
    pub video_path: Option<String>,
    pub banner_path: Option<String>,
    pub note_times: Vec<u32>,
}