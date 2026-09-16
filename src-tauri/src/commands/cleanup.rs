use serde::{Deserialize, Serialize};
use std::path::PathBuf;
use walkdir::WalkDir;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct CleanupCategory {
    pub id: String,
    pub name: String,
    pub description: String,
    pub file_count: usize,
    pub size_bytes: u64,
    pub safe: bool,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct CleanupResult {
    pub deleted_files: usize,
    pub freed_bytes: u64,
    pub failed_files: usize,
    pub errors: Vec<String>,
}

struct CategoryDef {
    id: &'static str,
    name: &'static str,
    description: &'static str,
    paths: Vec<PathBuf>,
    safe: bool,
}

fn get_category_defs() -> Vec<CategoryDef> {
    let mut list = Vec::new();

    // 1. User Temp
    if let Ok(temp) = std::env::var("TEMP") {
        list.push(CategoryDef {
            id: "user_temp",
            name: "User Temporary Files",
            description: "Temporary files created by active and closed applications in %TEMP%",
            paths: vec![PathBuf::from(temp)],
            safe: true,
        });
    }

    // 2. Windows Temp
    list.push(CategoryDef {
        id: "win_temp",
        name: "Windows System Temp",
        description: "Operating system temporary cache and installer remnants in C:\\Windows\\Temp",
        paths: vec![PathBuf::from("C:\\Windows\\Temp")],
        safe: true,
    });

    // 3. Crash Dumps
    if let Ok(local_app_data) = std::env::var("LOCALAPPDATA") {
        let p1 = PathBuf::from(&local_app_data).join("CrashDumps");
        let p2 = PathBuf::from(&local_app_data).join("Microsoft\\Windows\\WER\\ReportArchive");
        let p3 = PathBuf::from(&local_app_data).join("Microsoft\\Windows\\WER\\ReportQueue");
        list.push(CategoryDef {
            id: "crash_dumps",
            name: "Crash Dumps & Error Reports",
            description: "Memory dumps and diagnostic logs created during application crashes",
            paths: vec![p1, p2, p3],
            safe: true,
        });

        // 4. Thumbnail Caches
        let thumb = PathBuf::from(&local_app_data).join("Microsoft\\Windows\\Explorer");
        list.push(CategoryDef {
            id: "thumbnails",
            name: "Windows Thumbnail Cache",
            description: "Cached previews for photos, videos, and documents in File Explorer",
            paths: vec![thumb],
            safe: true,
        });

        // 5. Browser Caches
        let chrome = PathBuf::from(&local_app_data).join("Google\\Chrome\\User Data\\Default\\Cache");
        let edge = PathBuf::from(&local_app_data).join("Microsoft\\Edge\\User Data\\Default\\Cache");
        let brave = PathBuf::from(&local_app_data).join("BraveSoftware\\Brave-Browser\\User Data\\Default\\Cache");
        list.push(CategoryDef {
            id: "browser_cache",
            name: "Web Browser Caches",
            description: "Cached web resources and images from Chrome, Edge, and Brave browsers",
            paths: vec![chrome, edge, brave],
            safe: true,
        });
    }

    // 6. Windows Update Delivery Cache
    list.push(CategoryDef {
        id: "win_update",
        name: "Windows Update Download Cache",
        description: "Downloaded installer packages for completed Windows updates",
        paths: vec![PathBuf::from("C:\\Windows\\SoftwareDistribution\\Download")],
        safe: true,
    });

    // 7. Windows Logs
    list.push(CategoryDef {
        id: "win_logs",
        name: "Windows System Logs",
        description: "Old CBS and component-based servicing log records",
        paths: vec![PathBuf::from("C:\\Windows\\Logs\\CBS"), PathBuf::from("C:\\Windows\\Logs\\DISM")],
        safe: true,
    });

    list
}

#[tauri::command]
pub fn scan_cleanup_categories() -> Vec<CleanupCategory> {
    let defs = get_category_defs();
    let mut results = Vec::new();

    for def in defs {
        let mut count = 0;
        let mut size = 0u64;

        for path in &def.paths {
            if path.exists() {
                for entry in WalkDir::new(path).into_iter().filter_map(|e| e.ok()) {
                    if entry.file_type().is_file() {
                        count += 1;
                        if let Ok(meta) = entry.metadata() {
                            size += meta.len();
                        }
                    }
                }
            }
        }

        results.push(CleanupCategory {
            id: def.id.to_string(),
            name: def.name.to_string(),
            description: def.description.to_string(),
            file_count: count,
            size_bytes: size,
            safe: def.safe,
        });
    }

    results
}

#[tauri::command]
pub fn clean_categories(category_ids: Vec<String>) -> CleanupResult {
    let defs = get_category_defs();
    let mut deleted_files = 0;
    let mut freed_bytes = 0u64;
    let mut failed_files = 0;
    let mut errors = Vec::new();

    for def in defs {
        if !category_ids.contains(&def.id.to_string()) {
            continue;
        }

        for path in &def.paths {
            if !path.exists() {
                continue;
            }

            for entry in WalkDir::new(path).min_depth(1).into_iter().filter_map(|e| e.ok()) {
                let p = entry.path();
                if p.is_file() {
                    let len = entry.metadata().map(|m| m.len()).unwrap_or(0);
                    match std::fs::remove_file(p) {
                        Ok(_) => {
                            deleted_files += 1;
                            freed_bytes += len;
                        }
                        Err(e) => {
                            failed_files += 1;
                            if errors.len() < 10 {
                                errors.push(format!("{}: {}", p.display(), e));
                            }
                        }
                    }
                }
            }
        }
    }

    CleanupResult {
        deleted_files,
        freed_bytes,
        failed_files,
        errors,
    }
}