use serde::Serialize;
use sysinfo::{Pid, ProcessRefreshKind, System};
use std::sync::Mutex;
use tauri::State;
use crate::utils::{AppError, AppResult};

#[derive(Debug, Serialize, Clone)]
pub struct ProcessItem {
    pub pid: u32,
    pub parent_pid: Option<u32>,
    pub name: String,
    pub cpu_usage: f32,
    pub memory_bytes: u64,
    pub virtual_memory_bytes: u64,
    pub disk_read_bytes: u64,
    pub disk_written_bytes: u64,
    pub exe_path: String,
    pub status: String,
    pub start_time: u64,
}

#[derive(Debug, Serialize, Clone)]
pub struct ProcessDetails {
    pub pid: u32,
    pub name: String,
    pub cmd: Vec<String>,
    pub exe_path: String,
    pub cwd: String,
    pub memory_bytes: u64,
    pub cpu_usage: f32,
    pub user_id: Option<String>,
    pub start_time: u64,
}

pub struct ProcessState {
    pub sys: Mutex<System>,
}

#[tauri::command]
pub fn get_processes(state: State<'_, ProcessState>) -> Vec<ProcessItem> {
    let mut sys = state.sys.lock().unwrap();
    sys.refresh_processes_specifics(
        sysinfo::ProcessesToUpdate::All,
        true,
        ProcessRefreshKind::everything(),
    );

    let mut list = Vec::new();
    for (pid, p) in sys.processes() {
        let parent = p.parent().map(|p| p.as_u32());
        let disk_usage = p.disk_usage();
        
        list.push(ProcessItem {
            pid: pid.as_u32(),
            parent_pid: parent,
            name: p.name().to_string_lossy().to_string(),
            cpu_usage: p.cpu_usage(),
            memory_bytes: p.memory(),
            virtual_memory_bytes: p.virtual_memory(),
            disk_read_bytes: disk_usage.read_bytes,
            disk_written_bytes: disk_usage.written_bytes,
            exe_path: p.exe().map(|p| p.to_string_lossy().to_string()).unwrap_or_default(),
            status: format!("{:?}", p.status()),
            start_time: p.start_time(),
        });
    }

    list.sort_by(|a, b| b.cpu_usage.partial_cmp(&a.cpu_usage).unwrap_or(std::cmp::Ordering::Equal));
    list
}

#[tauri::command]
pub fn kill_process(pid: u32) -> AppResult<bool> {
    let mut sys = System::new();
    let sys_pid = Pid::from_u32(pid);
    sys.refresh_processes_specifics(
        sysinfo::ProcessesToUpdate::Some(&[sys_pid]),
        true,
        ProcessRefreshKind::nothing(),
    );

    if let Some(process) = sys.process(sys_pid) {
        if process.kill() {
            Ok(true)
        } else {
            Err(AppError::from(format!("Failed to kill process with PID {}", pid)))
        }
    } else {
        Err(AppError::from(format!("Process with PID {} not found", pid)))
    }
}

#[tauri::command]
pub fn get_process_details(pid: u32) -> AppResult<ProcessDetails> {
    let mut sys = System::new();
    let sys_pid = Pid::from_u32(pid);
    sys.refresh_processes_specifics(
        sysinfo::ProcessesToUpdate::Some(&[sys_pid]),
        true,
        ProcessRefreshKind::everything(),
    );

    if let Some(p) = sys.process(sys_pid) {
        Ok(ProcessDetails {
            pid,
            name: p.name().to_string_lossy().to_string(),
            cmd: p.cmd().iter().map(|s| s.to_string_lossy().to_string()).collect(),
            exe_path: p.exe().map(|s| s.to_string_lossy().to_string()).unwrap_or_default(),
            cwd: p.cwd().map(|s| s.to_string_lossy().to_string()).unwrap_or_default(),
            memory_bytes: p.memory(),
            cpu_usage: p.cpu_usage(),
            user_id: p.user_id().map(|u| u.to_string()),
            start_time: p.start_time(),
        })
    } else {
        Err(AppError::from(format!("Process {} not found", pid)))
    }
}