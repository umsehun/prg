use std::fs::{File, create_dir_all, copy};
use zip::ZipArchive;
use std::path::Path;
use std::process::Command;
use crate::resources::SongInfo;

#[derive(Default, Debug)]
struct DifficultyInfo {
    overall_difficulty: Option<f32>,
    circle_size: Option<f32>,
    approach_rate: Option<f32>,
    hp_drain_rate: Option<f32>,
    stars: Option<f32>,
}

#[derive(Default, Debug)]
struct SongMetadata {
    title: Option<String>,
    artist: Option<String>,
}

pub fn parse_osu_hit_times(path: &str) -> Result<Vec<u32>, Box<dyn std::error::Error>> {
    let s = std::fs::read_to_string(path)?;
    let mut in_hit = false;
    let mut times = Vec::new();
    for line in s.lines() {
        let line = line.trim();
        if line == "[HitObjects]" {
            in_hit = true;
            continue;
        }
        if in_hit {
            if line.is_empty() {
                break;
            }
            let parts: Vec<&str> = line.split(',').collect();
            if parts.len() >= 3 {
                if let Ok(t) = parts[2].parse::<u32>() {
                    times.push(t);
                }
            }
        }
    }
    Ok(times)
}

pub fn extract_osz(path: &str, out_dir: &str) -> Result<(), Box<dyn std::error::Error>> {
    let f = File::open(path)?;
    let mut archive = ZipArchive::new(f)?;
    archive.extract(out_dir)?;
    Ok(())
}

pub fn get_charts_dir() -> String {
    // Get the project root directory (where Cargo.toml is located)
    if let Ok(manifest_dir) = std::env::var("CARGO_MANIFEST_DIR") {
        format!("{}/public/assets", manifest_dir)
    } else {
        // Fallback: try to find project root from current executable
        if let Ok(exe_path) = std::env::current_exe() {
            if let Some(exe_dir) = exe_path.parent() {
                // Go up directories to find the project root
                let mut current = exe_dir;
                for _ in 0..5 { // Search up to 5 levels up
                    let assets_path = current.join("public").join("assets");
                    if assets_path.exists() {
                        return assets_path.to_string_lossy().to_string();
                    }
                    if let Some(parent) = current.parent() {
                        current = parent;
                    } else {
                        break;
                    }
                }
            }
        }
        // Final fallback: relative path from current working directory
        "./public/assets".to_string()
    }
}

fn convert_with_ffmpeg(input: &Path, output: &Path) -> Result<(), Box<dyn std::error::Error>> {
    // Skip if input and output are the same
    if input == output {
        return Ok(());
    }

    // Skip if output already exists
    if output.exists() {
        return Ok(());
    }

    let status = Command::new("ffmpeg")
        .arg("-i")
        .arg(input)
        .arg("-y") // overwrite
        .arg(output)
        .status()?;
    if status.success() {
        Ok(())
    } else {
        Err("ffmpeg conversion failed".into())
    }
}

fn find_osz_files(dir: &Path, files: &mut Vec<std::path::PathBuf>) {
    if let Ok(entries) = std::fs::read_dir(dir) {
        for entry in entries.flatten() {
            let path = entry.path();
            if path.is_dir() {
                find_osz_files(&path, files);
            } else if path.extension().and_then(|s| s.to_str()) == Some("osz") {
                files.push(path);
            }
        }
    }
}

pub fn parse_all_osz(assets_dir: &str) -> Result<Vec<SongInfo>, Box<dyn std::error::Error>> {
    let charts_dir = get_charts_dir();
    std::fs::create_dir_all(&charts_dir)?;

    let mut songs = Vec::new();

    let mut osz_files = Vec::new();
    find_osz_files(Path::new(assets_dir), &mut osz_files);

    for osz_path in osz_files {
        let file_stem = osz_path.file_stem().unwrap_or_default().to_string_lossy();
        let extract_dir = format!("{}/{}", charts_dir, file_stem);

        // Extract
        extract_osz(osz_path.to_str().unwrap(), &extract_dir)?;

        let mut audio_path = None;
        let mut video_path = None;
        let mut banner_path = None;

        // Convert non-standard extensions and find audio/video
        if let Ok(entries) = std::fs::read_dir(&extract_dir) {
            for entry in entries.flatten() {
                let path = entry.path();
                if let Some(ext) = path.extension().and_then(|s| s.to_str()) {
                    let is_video = matches!(ext, "avi" | "mp4" | "mkv" | "flv" | "wmv" | "mov" | "mpg" | "mpeg" | "3gp" | "asf" | "rm" | "rmvb" | "webm");
                    let is_audio = matches!(ext, "wav" | "ogg" | "flac" | "aac" | "wma" | "m4a" | "whem" | "mp3");
                    let is_image = matches!(ext, "png" | "jpg" | "jpeg" | "webp");
                    
                    if is_image {
                        if banner_path.is_none() {
                            // Copy banner into Bevy assets/banners so AssetServer can load it
                            let filename = path.file_name().and_then(|s| s.to_str()).unwrap_or("banner");
                            let dest_dir = Path::new("assets").join("banners");
                            let _ = create_dir_all(&dest_dir);
                            let dest_filename = format!("{}-{}", file_stem, filename);
                            let dest_path = dest_dir.join(&dest_filename);
                            // Ignore copy errors silently
                            let _ = copy(&path, &dest_path);
                            banner_path = Some(format!("banners/{}", dest_filename));
                        }
                    } else if is_video || is_audio {
                        let new_ext = if is_video { "webm" } else { "mp3" };
                        
                        // Skip if already the target format
                        if ext == new_ext {
                            let rel_path = path.strip_prefix(&charts_dir).unwrap_or(&path).to_string_lossy().to_string();
                            if is_video {
                                video_path = Some(rel_path);
                            } else {
                                audio_path = Some(rel_path);
                            }
                            continue;
                        }
                        
                        let mut new_path = path.clone();
                        new_path.set_extension(new_ext);
                        
                        if let Err(e) = convert_with_ffmpeg(&path, &new_path) {
                            eprintln!("Failed to convert {}: {}", path.display(), e);
                        } else {
                            // Remove original only if conversion succeeded and paths are different
                            if path != new_path {
                                let _ = std::fs::remove_file(&path);
                            }
                            
                            let rel_path = new_path.strip_prefix(&charts_dir).unwrap_or(&new_path).to_string_lossy().to_string();
                            if is_video {
                                video_path = Some(rel_path);
                            } else {
                                audio_path = Some(rel_path);
                            }
                        }
                    }
                }
            }
        }

        // Find .osu file
        let osu_path = format!("{}/{}.osu", extract_dir, file_stem);
        let note_times = if Path::new(&osu_path).exists() {
            parse_osu_hit_times(&osu_path).unwrap_or_default()
        } else {
            Vec::new()
        };

        songs.push(SongInfo {
            name: file_stem.to_string(),
            artist: None,
            audio_path,
            video_path,
            banner_path,
            note_times,
            overall_difficulty: None,
            circle_size: None,
            approach_rate: None,
            hp_drain_rate: None,
            stars: None,
        });
    }

    Ok(songs)
}

/// Scan charts directory for extracted beatmap folders
pub fn scan_charts_directories() -> Result<Vec<String>, Box<dyn std::error::Error>> {
    let charts_dir = get_charts_dir();
    let mut chart_folders = Vec::new();
    
    // Check if charts directory exists
    if !Path::new(&charts_dir).exists() {
        println!("Charts directory not found: {}", charts_dir);
        return Ok(chart_folders);
    }
    
    // Read all entries in charts directory
    if let Ok(entries) = std::fs::read_dir(&charts_dir) {
        for entry in entries.flatten() {
            let path = entry.path();
            if path.is_dir() {
                if let Some(folder_name) = path.file_name().and_then(|n| n.to_str()) {
                    chart_folders.push(folder_name.to_string());
                    println!("Found chart folder: {}", folder_name);
                }
            }
        }
    }
    
    println!("Found {} chart folders in total", chart_folders.len());
    Ok(chart_folders)
}

/// Parse a single chart folder and extract song information
pub fn parse_chart_folder(folder_name: &str) -> Result<Option<SongInfo>, Box<dyn std::error::Error>> {
    let charts_dir = get_charts_dir();
    let folder_path = format!("{}/{}", charts_dir, folder_name);
    
    println!("Parsing chart folder: {}", folder_path);
    
    // Find .osu file for metadata first
    let mut osu_file_path = None;
    let mut available_audio_files = Vec::new();
    let mut video_file = None;
    let mut banner_file = None;
    
    if let Ok(entries) = std::fs::read_dir(&folder_path) {
        for entry in entries.flatten() {
            let path = entry.path();
            if let Some(ext) = path.extension().and_then(|s| s.to_str()) {
                let file_name = path.file_name().unwrap().to_str().unwrap();
                
                match ext.to_lowercase().as_str() {
                    "osu" => {
                        if osu_file_path.is_none() {
                            osu_file_path = Some(path.clone());
                        }
                    },
                    "mp3" | "wav" | "ogg" => {
                        available_audio_files.push((file_name.to_string(), path.metadata().ok().map(|m| m.len()).unwrap_or(0)));
                    },
                    "webm" | "mp4" | "avi" | "mov" => {
                        if video_file.is_none() {
                            video_file = Some(format!("charts/{}/{}", folder_name, file_name));
                        }
                    },
                    "jpg" | "jpeg" | "png" | "bmp" => {
                        if banner_file.is_none() {
                            banner_file = Some(format!("charts/{}/{}", folder_name, file_name));
                        }
                    },
                    _ => {}
                }
            }
        }
    }
    
    // Smart audio file selection
    let audio_file = if let Some(ref osu_path) = osu_file_path {
        // Priority 1: AudioFilename specified in .osu file
        if let Ok(Some(specified_filename)) = extract_audio_filename_from_osu(osu_path) {
            if available_audio_files.iter().any(|(name, _)| name == &specified_filename) {
                Some(format!("charts/{}/{}", folder_name, specified_filename))
            } else {
                println!("AudioFilename '{}' specified in .osu but file not found", specified_filename);
                None
            }
        } else {
            None
        }
    } else {
        None
    }.or_else(|| {
        // Priority 2: Look for common main audio filenames
        let preferred_names = ["audio.mp3", "song.mp3", "music.mp3"];
        for preferred in &preferred_names {
            if available_audio_files.iter().any(|(name, _)| name == preferred) {
                return Some(format!("charts/{}/{}", folder_name, preferred));
            }
        }
        
        // Priority 3: Largest audio file (likely main song, not effect sound)
        if let Some((largest_file, _)) = available_audio_files.iter()
            .filter(|(_, size)| *size > 100_000) // Filter out small effect sounds (< 100KB)
            .max_by_key(|(_, size)| *size) {
            Some(format!("charts/{}/{}", folder_name, largest_file))
        } else {
            // Fallback: any audio file
            available_audio_files.first().map(|(name, _)| format!("charts/{}/{}", folder_name, name))
        }
    });
    
    // Parse .osu file for metadata, note times, and difficulty
    let (song_name, artist_name, note_times, difficulty_info) = if let Some(ref osu_path) = osu_file_path {
        let metadata = parse_metadata_from_osu(osu_path).unwrap_or_default();
        let name = metadata.title.unwrap_or_else(|| extract_song_title_from_osu(osu_path).unwrap_or_else(|_| folder_name.to_string()));
        let artist = metadata.artist;
        let times = parse_osu_hit_times(osu_path.to_str().unwrap()).unwrap_or_default();
        let diff = parse_difficulty_from_osu(osu_path).unwrap_or_default();
        (name, artist, times, diff)
    } else {
        (folder_name.to_string(), None, vec![1000, 2000, 3000, 4000], DifficultyInfo::default())
    };

    let song_info = SongInfo {
        name: song_name,
        artist: artist_name,
        audio_path: audio_file,
        video_path: video_file,
        banner_path: banner_file,
        note_times,
        overall_difficulty: difficulty_info.overall_difficulty,
        circle_size: difficulty_info.circle_size,
        approach_rate: difficulty_info.approach_rate,
        hp_drain_rate: difficulty_info.hp_drain_rate,
        stars: difficulty_info.stars,
    };    println!("Parsed song: {} (audio: {:?}, video: {:?}, banner: {:?})", 
             song_info.name, song_info.audio_path, song_info.video_path, song_info.banner_path);
    
    Ok(Some(song_info))
}

/// Extract song title from .osu file metadata
fn extract_song_title_from_osu(osu_path: &Path) -> Result<String, Box<dyn std::error::Error>> {
    let content = std::fs::read_to_string(osu_path)?;
    
    for line in content.lines() {
        if line.starts_with("Title:") {
            let title = line.trim_start_matches("Title:").trim();
            if !title.is_empty() {
                return Ok(title.to_string());
            }
        }
    }
    
    // Fallback to filename if no title found
    if let Some(file_name) = osu_path.file_stem().and_then(|s| s.to_str()) {
        Ok(file_name.to_string())
    } else {
        Ok("Unknown Song".to_string())
    }
}

/// Extract AudioFilename from .osu file
fn extract_audio_filename_from_osu(osu_path: &Path) -> Result<Option<String>, Box<dyn std::error::Error>> {
    let content = std::fs::read_to_string(osu_path)?;
    
    for line in content.lines() {
        if line.starts_with("AudioFilename:") {
            let filename = line.trim_start_matches("AudioFilename:").trim();
            if !filename.is_empty() && filename != "None" {
                return Ok(Some(filename.to_string()));
            }
        }
    }
    
    Ok(None)
}

/// Parse song metadata from .osu file
fn parse_metadata_from_osu(osu_path: &Path) -> Result<SongMetadata, Box<dyn std::error::Error>> {
    let content = std::fs::read_to_string(osu_path)?;
    let mut metadata = SongMetadata::default();
    let mut in_general_section = false;
    
    for line in content.lines() {
        let line = line.trim();
        
        if line == "[General]" {
            in_general_section = true;
            continue;
        }
        
        // Stop when we hit another section
        if line.starts_with('[') && line != "[General]" {
            in_general_section = false;
        }
        
        if in_general_section && line.contains(':') {
            let parts: Vec<&str> = line.splitn(2, ':').collect();
            if parts.len() == 2 {
                let key = parts[0].trim();
                let value = parts[1].trim();
                
                match key {
                    "Title" => {
                        metadata.title = Some(value.to_string());
                    },
                    "Artist" => {
                        metadata.artist = Some(value.to_string());
                    },
                    _ => {}
                }
            }
        }
    }
    
    Ok(metadata)
}

/// Parse difficulty information from .osu file
fn parse_difficulty_from_osu(osu_path: &Path) -> Result<DifficultyInfo, Box<dyn std::error::Error>> {
    let content = std::fs::read_to_string(osu_path)?;
    let mut difficulty_info = DifficultyInfo::default();
    let mut in_difficulty_section = false;
    
    for line in content.lines() {
        let line = line.trim();
        
        if line == "[Difficulty]" {
            in_difficulty_section = true;
            continue;
        }
        
        // Stop when we hit another section
        if line.starts_with('[') && line != "[Difficulty]" {
            in_difficulty_section = false;
        }
        
        if in_difficulty_section && line.contains(':') {
            let parts: Vec<&str> = line.splitn(2, ':').collect();
            if parts.len() == 2 {
                let key = parts[0].trim();
                let value = parts[1].trim();
                
                match key {
                    "OverallDifficulty" => {
                        if let Ok(val) = value.parse::<f32>() {
                            difficulty_info.overall_difficulty = Some(val);
                        }
                    },
                    "CircleSize" => {
                        if let Ok(val) = value.parse::<f32>() {
                            difficulty_info.circle_size = Some(val);
                        }
                    },
                    "ApproachRate" => {
                        if let Ok(val) = value.parse::<f32>() {
                            difficulty_info.approach_rate = Some(val);
                        }
                    },
                    "HPDrainRate" => {
                        if let Ok(val) = value.parse::<f32>() {
                            difficulty_info.hp_drain_rate = Some(val);
                        }
                    },
                    _ => {}
                }
            }
        }
    }
    
    // Calculate approximate star rating based on difficulty values
    if difficulty_info.overall_difficulty.is_some() && difficulty_info.approach_rate.is_some() {
        let od = difficulty_info.overall_difficulty.unwrap_or(5.0);
        let ar = difficulty_info.approach_rate.unwrap_or(5.0);
        let cs = difficulty_info.circle_size.unwrap_or(4.0);
        
        // Simplified star calculation (real osu! star calculation is much more complex)
        let star_estimate = ((od + ar + (10.0 - cs)) / 3.0) * 0.8;
        difficulty_info.stars = Some(star_estimate.clamp(0.0, 10.0));
    }
    
    Ok(difficulty_info)
}

/// Load all songs from charts directory  
pub fn load_songs_from_charts() -> Result<Vec<SongInfo>, Box<dyn std::error::Error>> {
    let chart_folders = scan_charts_directories()?;
    let mut songs = Vec::new();
    
    for folder_name in chart_folders {
        match parse_chart_folder(&folder_name) {
            Ok(Some(song_info)) => songs.push(song_info),
            Ok(None) => println!("Skipped folder: {}", folder_name),
            Err(e) => println!("Error parsing folder {}: {}", folder_name, e),
        }
    }
    
    println!("Successfully loaded {} songs from charts", songs.len());
    Ok(songs)
}

/// NEW: Load songs with automatic .osz file extraction
pub fn load_songs_with_osz_extraction() -> Result<Vec<SongInfo>, Box<dyn std::error::Error>> {
    let charts_dir = get_charts_dir();
    println!("🔍 Processing charts directory: {}", charts_dir);
    
    // Create charts directory if it doesn't exist
    create_dir_all(&charts_dir)?;
    
    // Step 1: Find and extract all .osz files
    println!("📦 Step 1: Extracting .osz files...");
    extract_all_osz_files(&charts_dir)?;
    
    // Step 2: Load songs from extracted folders
    println!("📂 Step 2: Scanning for chart folders...");
    let chart_folders = scan_charts_directories()?;
    println!("📊 Found {} chart folders", chart_folders.len());
    
    let mut songs = Vec::new();
    
    for folder_name in chart_folders {
        println!("🎵 Processing folder: {}", folder_name);
        match parse_chart_folder(&folder_name) {
            Ok(Some(song_info)) => {
                println!("✅ Successfully parsed: {}", song_info.name);
                songs.push(song_info);
            },
            Ok(None) => println!("⏭️ Skipped folder: {}", folder_name),
            Err(e) => println!("❌ Error parsing folder {}: {}", folder_name, e),
        }
    }
    
    println!("🎉 Successfully loaded {} songs from charts with .osz extraction", songs.len());
    Ok(songs)
}

/// Find and extract all .osz files in the charts directory
fn extract_all_osz_files(charts_dir: &str) -> Result<(), Box<dyn std::error::Error>> {
    println!("🔍 Searching for .osz files in: {}", charts_dir);
    
    if !Path::new(charts_dir).exists() {
        println!("❗ Charts directory doesn't exist, creating: {}", charts_dir);
        create_dir_all(charts_dir)?;
        return Ok(());
    }
    
    let mut osz_files = Vec::new();
    find_osz_files(Path::new(charts_dir), &mut osz_files);
    
    println!("📈 Found {} .osz files", osz_files.len());
    
    if osz_files.is_empty() {
        println!("⚠️ No .osz files found in directory: {}", charts_dir);
        return Ok(());
    }
    
    for osz_path in osz_files {
        println!("📦 Processing .osz file: {}", osz_path.display());
        if let Some(file_name) = osz_path.file_stem().and_then(|n| n.to_str()) {
            let extract_dir = format!("{}/{}", charts_dir, file_name);
            
            // Skip if already extracted
            if Path::new(&extract_dir).exists() {
                println!("🔄 Already extracted: {}", file_name);
                continue;
            }
            
            println!("📂 Extracting: {} -> {}", osz_path.display(), extract_dir);
            
            match extract_osz(osz_path.to_str().unwrap(), &extract_dir) {
                Ok(_) => println!("✅ Successfully extracted: {}", file_name),
                Err(e) => println!("❌ Failed to extract {}: {}", file_name, e),
            }
        }
    }
    
    Ok(())
}