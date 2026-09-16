use serde::Serialize;
use sysinfo::{CpuRefreshKind, MemoryRefreshKind, Networks, RefreshKind, System};
use std::sync::Mutex;
use tauri::State;
use std::time::{SystemTime, UNIX_EPOCH};

#[derive(Debug, Serialize, Clone)]
pub struct LiveTelemetry {
    pub timestamp_ms: u64,
    pub cpu_usage: f32,
    pub ram_used_bytes: u64,
    pub ram_total_bytes: u64,
    pub ram_usage_percent: f32,
    pub network_rx_bytes_sec: u64,
    pub network_tx_bytes_sec: u64,
}

pub struct MonitorState {
    pub sys: Mutex<System>,
    pub networks: Mutex<Networks>,
    pub last_poll_time: Mutex<std::time::Instant>,
}

#[tauri::command]
pub fn get_live_telemetry(state: State<'_, MonitorState>) -> LiveTelemetry {
    let mut sys = state.sys.lock().unwrap();
    let mut networks = state.networks.lock().unwrap();
    let mut last_poll = state.last_poll_time.lock().unwrap();

    let now_instant = std::time::Instant::now();
    let elapsed_sec = now_instant.duration_since(*last_poll).as_secs_f32().max(0.1);
    *last_poll = now_instant;

    sys.refresh_specifics(
        RefreshKind::nothing()
            .with_cpu(CpuRefreshKind::everything())
            .with_memory(MemoryRefreshKind::everything()),
    );

    networks.refresh(true);

    let mut rx_bytes_total = 0u64;
    let mut tx_bytes_total = 0u64;

    for (_name, data) in networks.iter() {
        rx_bytes_total += data.received();
        tx_bytes_total += data.transmitted();
    }

    let rx_rate = (rx_bytes_total as f32 / elapsed_sec) as u64;
    let tx_rate = (tx_bytes_total as f32 / elapsed_sec) as u64;

    let ram_used = sys.used_memory();
    let ram_total = sys.total_memory();
    let ram_percent = if ram_total > 0 {
        (ram_used as f32 / ram_total as f32) * 100.0
    } else {
        0.0
    };

    let now_ms = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap_or_default()
        .as_millis() as u64;

    LiveTelemetry {
        timestamp_ms: now_ms,
        cpu_usage: sys.global_cpu_usage(),
        ram_used_bytes: ram_used,
        ram_total_bytes: ram_total,
        ram_usage_percent: ram_percent,
        network_rx_bytes_sec: rx_rate,
        network_tx_bytes_sec: tx_rate,
    }
}