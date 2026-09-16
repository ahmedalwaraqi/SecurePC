use serde::Serialize;
use ::sysinfo::{Networks, System};
use winreg::enums::*;
use winreg::RegKey;

#[derive(Debug, Serialize, Clone)]
pub struct CpuSpec {
    pub brand: String,
    pub vendor_id: String,
    pub core_count: usize,
    pub physical_core_count: Option<usize>,
    pub frequency_mhz: u64,
}

#[derive(Debug, Serialize, Clone)]
pub struct NetworkSpec {
    pub name: String,
    pub mac_address: String,
    pub ip_addresses: Vec<String>,
    pub total_received_bytes: u64,
    pub total_transmitted_bytes: u64,
}

#[derive(Debug, Serialize, Clone)]
pub struct SystemSpecReport {
    pub os_name: String,
    pub os_version: String,
    pub kernel_version: String,
    pub hostname: String,
    pub cpu: CpuSpec,
    pub total_memory_bytes: u64,
    pub total_swap_bytes: u64,
    pub bios_vendor: String,
    pub bios_version: String,
    pub bios_release_date: String,
    pub motherboard_product: String,
    pub motherboard_manufacturer: String,
    pub gpus: Vec<String>,
    pub networks: Vec<NetworkSpec>,
}

#[tauri::command]
pub fn get_system_specs() -> SystemSpecReport {
    let mut sys = System::new_all();
    sys.refresh_all();

    let cpu = CpuSpec {
        brand: sys.cpus().first().map(|c| c.brand().to_string()).unwrap_or_else(|| "Unknown CPU".to_string()),
        vendor_id: sys.cpus().first().map(|c| c.vendor_id().to_string()).unwrap_or_default(),
        core_count: sys.cpus().len(),
        physical_core_count: sys.physical_core_count(),
        frequency_mhz: sys.cpus().first().map(|c| c.frequency()).unwrap_or(0),
    };

    let (mut bios_vendor, mut bios_version, mut bios_release_date) = (
        "Unknown".to_string(),
        "Unknown".to_string(),
        "Unknown".to_string(),
    );
    let (mut motherboard_product, mut motherboard_manufacturer) = (
        "Unknown".to_string(),
        "Unknown".to_string(),
    );

    let hklm = RegKey::predef(HKEY_LOCAL_MACHINE);
    if let Ok(bios_key) = hklm.open_subkey("HARDWARE\\DESCRIPTION\\System\\BIOS") {
        if let Ok(v) = bios_key.get_value::<String, _>("BIOSVendor") {
            bios_vendor = v;
        }
        if let Ok(v) = bios_key.get_value::<String, _>("BIOSVersion") {
            bios_version = v;
        }
        if let Ok(v) = bios_key.get_value::<String, _>("BIOSReleaseDate") {
            bios_release_date = v;
        }
        if let Ok(v) = bios_key.get_value::<String, _>("BaseBoardProduct") {
            motherboard_product = v;
        }
        if let Ok(v) = bios_key.get_value::<String, _>("BaseBoardManufacturer") {
            motherboard_manufacturer = v;
        }
    }

    let mut gpus = Vec::new();
    if let Ok(video_class) = hklm.open_subkey("SYSTEM\\CurrentControlSet\\Control\\Class\\{4d36e968-e325-11ce-bfc1-08002be10318}") {
        for subkey_name in video_class.enum_keys().flatten() {
            if subkey_name.starts_with("000") {
                if let Ok(sub) = video_class.open_subkey(&subkey_name) {
                    if let Ok(driver_desc) = sub.get_value::<String, _>("DriverDesc") {
                        if !gpus.contains(&driver_desc) {
                            gpus.push(driver_desc);
                        }
                    }
                }
            }
        }
    }

    let networks_obj = Networks::new_with_refreshed_list();
    let mut networks = Vec::new();
    for (name, net) in &networks_obj {
        let ips = net.ip_networks().iter().map(|ip| ip.addr.to_string()).collect();
        networks.push(NetworkSpec {
            name: name.clone(),
            mac_address: net.mac_address().to_string(),
            ip_addresses: ips,
            total_received_bytes: net.total_received(),
            total_transmitted_bytes: net.total_transmitted(),
        });
    }

    SystemSpecReport {
        os_name: System::name().unwrap_or_else(|| "Windows".to_string()),
        os_version: System::os_version().unwrap_or_else(|| "Unknown".to_string()),
        kernel_version: System::kernel_version().unwrap_or_default(),
        hostname: System::host_name().unwrap_or_else(|| "localhost".to_string()),
        cpu,
        total_memory_bytes: sys.total_memory(),
        total_swap_bytes: sys.total_swap(),
        bios_vendor,
        bios_version,
        bios_release_date,
        motherboard_product,
        motherboard_manufacturer,
        gpus,
        networks,
    }
}