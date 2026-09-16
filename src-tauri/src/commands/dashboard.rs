use serde::Serialize;
use sysinfo::{CpuRefreshKind, Disks, MemoryRefreshKind, RefreshKind, System};
use std::sync::Mutex;
use tauri::State;

#[derive(Debug, Serialize, Clone)]
pub struct DiskInfo {
    pub name: String,
    pub mount_point: String,
    pub total_bytes: u64,
    pub available_bytes: u64,
    pub used_bytes: u64,
    pub usage_percent: f32,
    pub file_system: String,
    pub is_removable: bool,
}

#[derive(Debug, Serialize, Clone)]
pub struct DashboardData {
    pub cpu_usage: f32,
    pub cpu_cores: Vec<f32>,
    pub cpu_brand: String,
    pub cpu_count: usize,
    pub cpu_frequency_mhz: u64,
    pub ram_used_bytes: u64,
    pub ram_total_bytes: u64,
    pub ram_usage_percent: f32,
    pub swap_used_bytes: u64,
    pub swap_total_bytes: u64,
    pub swap_usage_percent: f32,
    pub disks: Vec<DiskInfo>,
    pub uptime_seconds: u64,
    pub process_count: usize,
    pub os_name: String,
    pub os_version: String,
    pub hostname: String,
}

pub struct DashboardState {
    pub sys: Mutex<System>,
}

#[tauri::command]
pub fn get_dashboard_data(state: State<'_, DashboardState>) -> DashboardData {
    let mut sys = state.sys.lock().unwrap();
    
    sys.refresh_specifics(
        RefreshKind::nothing()
            .with_cpu(CpuRefreshKind::everything())
            .with_memory(MemoryRefreshKind::everything())
            .with_processes(sysinfo::ProcessRefreshKind::nothing()),
    );

    let cpu_cores: Vec<f32> = sys.cpus().iter().map(|c| c.cpu_usage()).collect();
    let cpu_usage = sys.global_cpu_usage();
    let cpu_brand = sys.cpus().first().map(|c| c.brand().to_string()).unwrap_or_else(|| "Unknown CPU".to_string());
    let cpu_count = sys.cpus().len();
    let cpu_frequency_mhz = sys.cpus().first().map(|c| c.frequency()).unwrap_or(0);

    let ram_used_bytes = sys.used_memory();
    let ram_total_bytes = sys.total_memory();
    let ram_usage_percent = if ram_total_bytes > 0 {
        (ram_used_bytes as f32 / ram_total_bytes as f32) * 100.0
    } else {
        0.0
    };

    let swap_used_bytes = sys.used_swap();
    let swap_total_bytes = sys.total_swap();
    let swap_usage_percent = if swap_total_bytes > 0 {
        (swap_used_bytes as f32 / swap_total_bytes as f32) * 100.0
    } else {
        0.0
    };

    let disks_obj = Disks::new_with_refreshed_list();
    let mut disks = Vec::new();
    for disk in disks_obj.list() {
        let total = disk.total_space();
        let available = disk.available_space();
        let used = total.saturating_sub(available);
        let usage_percent = if total > 0 {
            (used as f32 / total as f32) * 100.0
        } else {
            0.0
        };

        disks.push(DiskInfo {
            name: disk.name().to_string_lossy().to_string(),
            mount_point: disk.mount_point().to_string_lossy().to_string(),
            total_bytes: total,
            available_bytes: available,
            used_bytes: used,
            usage_percent,
            file_system: disk.file_system().to_string_lossy().to_string(),
            is_removable: disk.is_removable(),
        });
    }

    let uptime_seconds = System::uptime();
    let process_count = sys.processes().len();
    let os_name = System::name().unwrap_or_else(|| "Windows".to_string());
    let os_version = System::os_version().unwrap_or_else(|| "Unknown".to_string());
    let hostname = System::host_name().unwrap_or_else(|| "localhost".to_string());

    DashboardData {
        cpu_usage,
        cpu_cores,
        cpu_brand,
        cpu_count,
        cpu_frequency_mhz,
        ram_used_bytes,
        ram_total_bytes,
        ram_usage_percent,
        swap_used_bytes,
        swap_total_bytes,
        swap_usage_percent,
        disks,
        uptime_seconds,
        process_count,
        os_name,
        os_version,
        hostname,
    }
}