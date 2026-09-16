import { invoke as tauriInvoke } from '@tauri-apps/api/core';
import type {
  DashboardData,
  ProcessItem,
  ProcessDetails,
  StartupItem,
  CleanupCategory,
  CleanupResult,
  SystemSpecReport,
  LiveTelemetry,
} from './types';

// Check if running in Tauri context
export const isTauri = (): boolean => {
  return typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
};

// Safe invoke wrapper with mock fallbacks for standalone browser preview
export async function invokeCommand<T>(cmd: string, args?: Record<string, unknown>): Promise<T> {
  if (isTauri()) {
    try {
      return await tauriInvoke<T>(cmd, args);
    } catch (err) {
      console.error(`Tauri invoke error [${cmd}]:`, err);
      throw err;
    }
  }

  // Fallback mock implementations for browser development
  return getMockData<T>(cmd, args);
}

function getMockData<T>(cmd: string, args?: Record<string, unknown>): T {
  switch (cmd) {
    case 'get_dashboard_data': {
      const mock: DashboardData = {
        cpu_usage: 24.5 + Math.random() * 15,
        cpu_cores: [22, 35, 18, 42, 15, 30, 28, 19, 50, 12, 16, 24],
        cpu_brand: 'AMD Ryzen 9 7900X 12-Core Processor',
        cpu_count: 12,
        cpu_frequency_mhz: 4700,
        ram_used_bytes: 14.2 * 1024 * 1024 * 1024,
        ram_total_bytes: 32 * 1024 * 1024 * 1024,
        ram_usage_percent: 44.375,
        swap_used_bytes: 2.1 * 1024 * 1024 * 1024,
        swap_total_bytes: 8 * 1024 * 1024 * 1024,
        swap_usage_percent: 26.25,
        disks: [
          {
            name: 'Samsung 990 PRO 2TB',
            mount_point: 'C:',
            total_bytes: 1024 * 1024 * 1024 * 1024 * 2,
            available_bytes: 1180 * 1024 * 1024 * 1024,
            used_bytes: 868 * 1024 * 1024 * 1024,
            usage_percent: 42.4,
            file_system: 'NTFS',
            is_removable: false,
          },
          {
            name: 'Crucial T700 1TB',
            mount_point: 'D:',
            total_bytes: 1024 * 1024 * 1024 * 1024,
            available_bytes: 420 * 1024 * 1024 * 1024,
            used_bytes: 604 * 1024 * 1024 * 1024,
            usage_percent: 58.9,
            file_system: 'NTFS',
            is_removable: false,
          },
        ],
        uptime_seconds: 142850,
        process_count: 184,
        os_name: 'Windows 11 Pro',
        os_version: '23H2 (Build 22631.3880)',
        hostname: 'SECURE-DEV-PC',
      };
      return mock as unknown as T;
    }

    case 'get_processes': {
      const mock: ProcessItem[] = [
        { pid: 4820, name: 'chrome.exe', cpu_usage: 12.4, memory_bytes: 840 * 1024 * 1024, virtual_memory_bytes: 1200 * 1024 * 1024, disk_read_bytes: 1024 * 50, disk_written_bytes: 1024 * 20, exe_path: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', status: 'Run', start_time: Date.now() - 3600000 },
        { pid: 1048, name: 'Code.exe', cpu_usage: 6.8, memory_bytes: 620 * 1024 * 1024, virtual_memory_bytes: 980 * 1024 * 1024, disk_read_bytes: 1024 * 12, disk_written_bytes: 1024 * 8, exe_path: 'C:\\Users\\ahmed\\AppData\\Local\\Programs\\Microsoft VS Code\\Code.exe', status: 'Run', start_time: Date.now() - 7200000 },
        { pid: 2840, name: 'rust-analyzer.exe', cpu_usage: 4.2, memory_bytes: 450 * 1024 * 1024, virtual_memory_bytes: 600 * 1024 * 1024, disk_read_bytes: 1024 * 80, disk_written_bytes: 1024 * 5, exe_path: 'C:\\Users\\ahmed\\.cargo\\bin\\rust-analyzer.exe', status: 'Run', start_time: Date.now() - 3600000 },
        { pid: 3192, name: 'discord.exe', cpu_usage: 2.1, memory_bytes: 380 * 1024 * 1024, virtual_memory_bytes: 520 * 1024 * 1024, disk_read_bytes: 1024 * 5, disk_written_bytes: 1024 * 2, exe_path: 'C:\\Users\\ahmed\\AppData\\Local\\Discord\\app-1.0.9015\\Discord.exe', status: 'Run', start_time: Date.now() - 10800000 },
        { pid: 1540, name: 'explorer.exe', cpu_usage: 1.5, memory_bytes: 210 * 1024 * 1024, virtual_memory_bytes: 400 * 1024 * 1024, disk_read_bytes: 1024 * 30, disk_written_bytes: 1024 * 40, exe_path: 'C:\\Windows\\explorer.exe', status: 'Run', start_time: Date.now() - 142850000 },
        { pid: 9120, name: 'Spotify.exe', cpu_usage: 1.1, memory_bytes: 180 * 1024 * 1024, virtual_memory_bytes: 320 * 1024 * 1024, disk_read_bytes: 1024 * 100, disk_written_bytes: 1024 * 1, exe_path: 'C:\\Users\\ahmed\\AppData\\Roaming\\Spotify\\Spotify.exe', status: 'Run', start_time: Date.now() - 1800000 },
      ];
      return mock as unknown as T;
    }

    case 'kill_process': {
      return true as unknown as T;
    }

    case 'get_process_details': {
      const pid = (args?.pid as number) || 4820;
      const mock: ProcessDetails = {
        pid,
        name: 'chrome.exe',
        cmd: ['C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', '--type=renderer', '--enable-features=WebAssembly'],
        exe_path: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        cwd: 'C:\\Program Files\\Google\\Chrome\\Application',
        memory_bytes: 840 * 1024 * 1024,
        cpu_usage: 12.4,
        user_id: 'ahmed-pc\\ahmed',
        start_time: Date.now() - 3600000,
      };
      return mock as unknown as T;
    }

    case 'get_startup_items': {
      const mock: StartupItem[] = [
        { name: 'Discord', command: 'C:\\Users\\ahmed\\AppData\\Local\\Discord\\Update.exe --processStart Discord.exe', location: 'Current User Registry', registry_path: 'HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run', enabled: true, file_exists: true },
        { name: 'Spotify', command: 'C:\\Users\\ahmed\\AppData\\Roaming\\Spotify\\Spotify.exe --autostart', location: 'Current User Registry', registry_path: 'HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run', enabled: true, file_exists: true },
        { name: 'Steam', command: 'C:\\Program Files (x86)\\Steam\\steam.exe -silent', location: 'Current User Registry', registry_path: 'HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run', enabled: true, file_exists: true },
        { name: 'SecurityHealth', command: '%windir%\\system32\\SecurityHealthSystray.exe', location: 'All Users Registry', registry_path: 'HKLM\\Software\\Microsoft\\Windows\\CurrentVersion\\Run', enabled: true, file_exists: true },
        { name: 'NVIDIA Backend', command: 'C:\\Program Files\\NVIDIA Corporation\\Update Core\\NvBackend.exe', location: 'All Users Registry', registry_path: 'HKLM\\Software\\Microsoft\\Windows\\CurrentVersion\\Run', enabled: true, file_exists: true },
      ];
      return mock as unknown as T;
    }

    case 'delete_startup_item': {
      return true as unknown as T;
    }

    case 'scan_cleanup_categories': {
      const mock: CleanupCategory[] = [
        { id: 'user_temp', name: 'User Temporary Files', description: 'Temporary files created by active and closed applications in %TEMP%', file_count: 1420, size_bytes: 3840 * 1024 * 1024, safe: true },
        { id: 'win_temp', name: 'Windows System Temp', description: 'Operating system temporary cache and installer remnants in C:\\Windows\\Temp', file_count: 512, size_bytes: 1250 * 1024 * 1024, safe: true },
        { id: 'crash_dumps', name: 'Crash Dumps & Error Reports', description: 'Memory dumps and diagnostic logs created during application crashes', file_count: 24, size_bytes: 840 * 1024 * 1024, safe: true },
        { id: 'thumbnails', name: 'Windows Thumbnail Cache', description: 'Cached previews for photos, videos, and documents in File Explorer', file_count: 18, size_bytes: 420 * 1024 * 1024, safe: true },
        { id: 'browser_cache', name: 'Web Browser Caches', description: 'Cached web resources and images from Chrome, Edge, and Brave browsers', file_count: 8540, size_bytes: 2650 * 1024 * 1024, safe: true },
        { id: 'win_update', name: 'Windows Update Download Cache', description: 'Downloaded installer packages for completed Windows updates', file_count: 45, size_bytes: 4120 * 1024 * 1024, safe: true },
        { id: 'win_logs', name: 'Windows System Logs', description: 'Old CBS and component-based servicing log records', file_count: 88, size_bytes: 310 * 1024 * 1024, safe: true },
      ];
      return mock as unknown as T;
    }

    case 'clean_categories': {
      const mock: CleanupResult = {
        deleted_files: 10450,
        freed_bytes: 12.8 * 1024 * 1024 * 1024,
        failed_files: 8,
        errors: ['C:\\Windows\\Temp\\locked_file.tmp: Permission denied (in-use)'],
      };
      return mock as unknown as T;
    }

    case 'get_system_specs': {
      const mock: SystemSpecReport = {
        os_name: 'Microsoft Windows 11 Pro (64-bit)',
        os_version: '10.0.22631 Build 22631',
        kernel_version: '10.0.22631.3880',
        hostname: 'SECURE-DEV-PC',
        cpu: {
          brand: 'AMD Ryzen 9 7900X 12-Core Processor',
          vendor_id: 'AuthenticAMD',
          core_count: 24,
          physical_core_count: 12,
          frequency_mhz: 4700,
        },
        total_memory_bytes: 32 * 1024 * 1024 * 1024,
        total_swap_bytes: 8 * 1024 * 1024 * 1024,
        bios_vendor: 'American Megatrends Inc.',
        bios_version: '2204',
        bios_release_date: '04/12/2024',
        motherboard_product: 'ROG STRIX X670E-E GAMING WIFI',
        motherboard_manufacturer: 'ASUSTeK COMPUTER INC.',
        gpus: ['NVIDIA GeForce RTX 4080 (16384 MB VRAM)'],
        networks: [
          {
            name: 'Intel(R) Ethernet Controller I225-V',
            mac_address: '00:D8:61:55:A2:3F',
            ip_addresses: ['192.168.1.140', 'fe80::9a11:7b1e:4d0a:5c28'],
            total_received_bytes: 14500000000,
            total_transmitted_bytes: 4200000000,
          },
          {
            name: 'Intel(R) Wi-Fi 6E AX210 160MHz',
            mac_address: 'E8:48:B8:2C:91:04',
            ip_addresses: [],
            total_received_bytes: 0,
            total_transmitted_bytes: 0,
          },
        ],
      };
      return mock as unknown as T;
    }

    case 'get_live_telemetry': {
      const mock: LiveTelemetry = {
        timestamp_ms: Date.now(),
        cpu_usage: 18.0 + Math.sin(Date.now() / 1000) * 12 + Math.random() * 8,
        ram_used_bytes: 14.2 * 1024 * 1024 * 1024,
        ram_total_bytes: 32 * 1024 * 1024 * 1024,
        ram_usage_percent: 44.375 + Math.random() * 0.5,
        network_rx_bytes_sec: Math.floor(Math.random() * 1024 * 1024 * 5),
        network_tx_bytes_sec: Math.floor(Math.random() * 1024 * 500),
      };
      return mock as unknown as T;
    }

    default:
      throw new Error(`Unhandled mock command: ${cmd}`);
  }
}