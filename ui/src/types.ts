export interface DiskInfo {
  name: string;
  mount_point: string;
  total_bytes: number;
  available_bytes: number;
  used_bytes: number;
  usage_percent: number;
  file_system: string;
  is_removable: boolean;
}

export interface DashboardData {
  cpu_usage: number;
  cpu_cores: number[];
  cpu_brand: string;
  cpu_count: number;
  cpu_frequency_mhz: number;
  ram_used_bytes: number;
  ram_total_bytes: number;
  ram_usage_percent: number;
  swap_used_bytes: number;
  swap_total_bytes: number;
  swap_usage_percent: number;
  disks: DiskInfo[];
  uptime_seconds: number;
  process_count: number;
  os_name: string;
  os_version: string;
  hostname: string;
}

export interface ProcessItem {
  pid: number;
  parent_pid?: number | null;
  name: string;
  cpu_usage: number;
  memory_bytes: number;
  virtual_memory_bytes: number;
  disk_read_bytes: number;
  disk_written_bytes: number;
  exe_path: string;
  status: string;
  start_time: number;
}

export interface ProcessDetails {
  pid: number;
  name: string;
  cmd: string[];
  exe_path: string;
  cwd: string;
  memory_bytes: number;
  cpu_usage: number;
  user_id?: string | null;
  start_time: number;
}

export interface StartupItem {
  name: string;
  command: string;
  location: string;
  registry_path: string;
  enabled: boolean;
  file_exists: boolean;
}

export interface CleanupCategory {
  id: string;
  name: string;
  description: string;
  file_count: number;
  size_bytes: number;
  safe: boolean;
}

export interface CleanupResult {
  deleted_files: number;
  freed_bytes: number;
  failed_files: number;
  errors: string[];
}

export interface CpuSpec {
  brand: string;
  vendor_id: string;
  core_count: number;
  physical_core_count?: number | null;
  frequency_mhz: number;
}

export interface NetworkSpec {
  name: string;
  mac_address: string;
  ip_addresses: string[];
  total_received_bytes: number;
  total_transmitted_bytes: number;
}

export interface SystemSpecReport {
  os_name: string;
  os_version: string;
  kernel_version: string;
  hostname: string;
  cpu: CpuSpec;
  total_memory_bytes: number;
  total_swap_bytes: number;
  bios_vendor: string;
  bios_version: string;
  bios_release_date: string;
  motherboard_product: string;
  motherboard_manufacturer: string;
  gpus: string[];
  networks: NetworkSpec[];
}

export interface LiveTelemetry {
  timestamp_ms: number;
  cpu_usage: number;
  ram_used_bytes: number;
  ram_total_bytes: number;
  ram_usage_percent: number;
  network_rx_bytes_sec: number;
  network_tx_bytes_sec: number;
}

export type TabId = 'dashboard' | 'processes' | 'startup' | 'cleanup' | 'sysinfo' | 'monitor';