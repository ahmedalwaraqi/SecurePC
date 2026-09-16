use serde::{Deserialize, Serialize};
use winreg::enums::*;
use winreg::RegKey;
use std::path::PathBuf;
use crate::utils::{AppError, AppResult};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct StartupItem {
    pub name: String,
    pub command: String,
    pub location: String,
    pub registry_path: String,
    pub enabled: bool,
    pub file_exists: bool,
}

#[tauri::command]
pub fn get_startup_items() -> Vec<StartupItem> {
    let mut items = Vec::new();

    // 1. Current User Run
    if let Ok(hkcu) = RegKey::predef(HKEY_CURRENT_USER).open_subkey("Software\\Microsoft\\Windows\\CurrentVersion\\Run") {
        for val in hkcu.enum_values().flatten() {
            let (name, value) = val;
            let command = value.to_string();
            let file_exists = check_exe_exists(&command);
            items.push(StartupItem {
                name: name.clone(),
                command,
                location: "Current User Registry".to_string(),
                registry_path: "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run".to_string(),
                enabled: true,
                file_exists,
            });
        }
    }

    // 2. Local Machine Run
    if let Ok(hklm) = RegKey::predef(HKEY_LOCAL_MACHINE).open_subkey("Software\\Microsoft\\Windows\\CurrentVersion\\Run") {
        for val in hklm.enum_values().flatten() {
            let (name, value) = val;
            let command = value.to_string();
            let file_exists = check_exe_exists(&command);
            items.push(StartupItem {
                name: name.clone(),
                command,
                location: "All Users Registry".to_string(),
                registry_path: "HKLM\\Software\\Microsoft\\Windows\\CurrentVersion\\Run".to_string(),
                enabled: true,
                file_exists,
            });
        }
    }

    // 3. WOW6432Node Local Machine Run
    if let Ok(hklm_wow) = RegKey::predef(HKEY_LOCAL_MACHINE).open_subkey("Software\\WOW6432Node\\Microsoft\\Windows\\CurrentVersion\\Run") {
        for val in hklm_wow.enum_values().flatten() {
            let (name, value) = val;
            let command = value.to_string();
            let file_exists = check_exe_exists(&command);
            items.push(StartupItem {
                name: name.clone(),
                command,
                location: "All Users (32-bit) Registry".to_string(),
                registry_path: "HKLM\\Software\\WOW6432Node\\Microsoft\\Windows\\CurrentVersion\\Run".to_string(),
                enabled: true,
                file_exists,
            });
        }
    }

    // 4. Startup Folder
    if let Ok(appdata) = std::env::var("APPDATA") {
        let startup_dir = PathBuf::from(appdata).join("Microsoft\\Windows\\Start Menu\\Programs\\Startup");
        if let Ok(entries) = std::fs::read_dir(startup_dir) {
            for entry in entries.flatten() {
                let path = entry.path();
                if path.is_file() {
                    let file_name = path.file_name().unwrap_or_default().to_string_lossy().to_string();
                    if file_name.to_lowercase() != "desktop.ini" {
                        items.push(StartupItem {
                            name: file_name,
                            command: path.to_string_lossy().to_string(),
                            location: "User Startup Folder".to_string(),
                            registry_path: path.to_string_lossy().to_string(),
                            enabled: true,
                            file_exists: true,
                        });
                    }
                }
            }
        }
    }

    items
}

#[tauri::command]
pub fn delete_startup_item(name: String, registry_path: String) -> AppResult<bool> {
    if registry_path.starts_with("HKCU\\") {
        let subkey_path = registry_path.trim_start_matches("HKCU\\");
        let hkcu = RegKey::predef(HKEY_CURRENT_USER);
        let key = hkcu.open_subkey_with_flags(subkey_path, KEY_WRITE)
            .map_err(|e| AppError::from(format!("Failed to open registry key: {}", e)))?;
        key.delete_value(&name)
            .map_err(|e| AppError::from(format!("Failed to delete value {}: {}", name, e)))?;
        Ok(true)
    } else if registry_path.starts_with("HKLM\\") {
        let subkey_path = registry_path.trim_start_matches("HKLM\\");
        let hklm = RegKey::predef(HKEY_LOCAL_MACHINE);
        let key = hklm.open_subkey_with_flags(subkey_path, KEY_WRITE)
            .map_err(|e| AppError::from(format!("Failed to open HKLM registry (requires Administrator): {}", e)))?;
        key.delete_value(&name)
            .map_err(|e| AppError::from(format!("Failed to delete value {}: {}", name, e)))?;
        Ok(true)
    } else if std::path::Path::new(&registry_path).exists() {
        std::fs::remove_file(&registry_path)
            .map_err(|e| AppError::from(format!("Failed to remove startup file: {}", e)))?;
        Ok(true)
    } else {
        Err(AppError::from("Invalid startup location"))
    }
}

fn check_exe_exists(command: &str) -> bool {
    let clean = command.trim().trim_matches('"');
    let mut parts = clean.split(".exe");
    if let Some(first) = parts.next() {
        let mut path_str = format!("{}.exe", first);
        if path_str.starts_with('"') {
            path_str = path_str.trim_matches('"').to_string();
        }
        std::path::Path::new(&path_str).exists()
    } else {
        std::path::Path::new(clean).exists()
    }
}