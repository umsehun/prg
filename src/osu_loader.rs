use std::fs::{File, create_dir_all, copy};
use zip::ZipArchive;
use std::path::Path;
use std::process::Command;
use crate::resources::SongInfo;

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
    #[cfg(target_os = "macos")]
    {
        let home = std::env::var("HOME").unwrap_or_default();
        format!("{}/Library/Application Support/pgr/charts", home)
    }
    #[cfg(target_os = "windows")]
    {
        let appdata = std::env::var("APPDATA").unwrap_or_default();
        format!("{}/pgr/charts", appdata)
    }
    #[cfg(not(any(target_os = "macos", target_os = "windows")))]
    {
        // Linux or other
        let home = std::env::var("HOME").unwrap_or_default();
        format!("{}/.local/share/pgr/charts", home)
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
            audio_path,
            video_path,
            banner_path,
            note_times,
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
    
    // Find .osu file for metadata
    let mut osu_file_path = None;
    let mut audio_file = None;
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
                        if audio_file.is_none() {
                            audio_file = Some(format!("charts/{}/{}", folder_name, file_name));
                        }
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
    
    // Parse .osu file for metadata and note times
    let (song_name, note_times) = if let Some(ref osu_path) = osu_file_path {
        let name = extract_song_title_from_osu(osu_path).unwrap_or_else(|_| folder_name.to_string());
        let times = parse_osu_hit_times(osu_path.to_str().unwrap()).unwrap_or_default();
        (name, times)
    } else {
        (folder_name.to_string(), vec![1000, 2000, 3000, 4000])
    };
    
    let song_info = SongInfo {
        name: song_name,
        audio_path: audio_file,
        video_path: video_file,
        banner_path: banner_file,
        note_times,
    };
    
    println!("Parsed song: {} (audio: {:?}, video: {:?}, banner: {:?})", 
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