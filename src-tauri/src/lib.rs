pub mod commands;
pub mod utils;

use commands::dashboard::{self, DashboardState};
use commands::processes::{self, ProcessState};
use commands::startup;
use commands::cleanup;
use commands::sysinfo;
use commands::monitor::{self, MonitorState};

use std::sync::Mutex;
use ::sysinfo::{Networks, System};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_dialog::init())
        .manage(DashboardState {
            sys: Mutex::new(System::new_all()),
        })
        .manage(ProcessState {
            sys: Mutex::new(System::new_all()),
        })
        .manage(MonitorState {
            sys: Mutex::new(System::new_all()),
            networks: Mutex::new(Networks::new_with_refreshed_list()),
            last_poll_time: Mutex::new(std::time::Instant::now()),
        })
        .invoke_handler(tauri::generate_handler![
            dashboard::get_dashboard_data,
            processes::get_processes,
            processes::kill_process,
            processes::get_process_details,
            startup::get_startup_items,
            startup::delete_startup_item,
            cleanup::scan_cleanup_categories,
            cleanup::clean_categories,
            sysinfo::get_system_specs,
            monitor::get_live_telemetry,
        ])
        .run(tauri::generate_context!())
        .expect("error while running SecurePC tauri application");
}