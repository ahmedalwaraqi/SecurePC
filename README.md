# ⚡ SecurePC — Windows Performance & Optimization Suite

[![Rust](https://img.shields.io/badge/Rust-1.80%2B-orange?logo=rust&logoColor=white)](https://www.rust-lang.org/)
[![Tauri 2](https://img.shields.io/badge/Tauri-v2-24C8D8?logo=tauri&logoColor=white)](https://tauri.app/)
[![React 19](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind-v4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

**SecurePC** is an ultra-fast, modern, open-source Windows PC performance toolkit and system optimization suite built in **Rust** and **Tauri 2**. Designed for software engineers, power users, and system administrators who demand deep hardware visibility, low-overhead system metrics, instant startup optimization, process inspection, and intelligent junk cleanup without telemetry or bloatware.

---

## ✨ Features

- 📊 **Live System Dashboard**: Real-time multi-core CPU activity, RAM breakdown (active, cached, commit limit), NVMe/SSD drive telemetry, and GPU usage metrics.
- ⚡ **Process Inspector & Manager**: High-precision process tree inspection, per-process CPU & memory metrics, executable path detection, and instant responsive process termination.
- 🚀 **Startup Program Optimizer**: Audit and toggle startup items across Windows Registry Run keys (HKCU & HKLM) and Startup directories to reduce boot times.
- 🧹 **Deep Disk & Cache Cleaner**: Safe scans for Windows temporary cache, system error dumps, browser junk, thumbnail caches, and recycle bin size with 1-click cleanup.
- 💻 **Hardware & System Specs**: Detailed hardware summary including processor architecture, motherboard BIOS/vendor info, network adapter IPs, and Windows build details.
- 📈 **Real-Time Performance Graphs**: Lightweight, high-frequency canvas-rendered historical charts for CPU, Memory, Disk I/O, and Network traffic.

---

## 🛠️ Tech Stack & Architecture

- **Core Backend**: [Rust](https://www.rust-lang.org/) with sysinfo, windows-rs, 	okio, and winreg for direct, high-performance Win32 API interop.
- **Desktop Framework**: [Tauri 2](https://tauri.app/) for minimal binary footprint (~15MB), zero-overhead WebView2 rendering, and memory safety.
- **Frontend Architecture**: [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [Vite](https://vitejs.dev/), [Tailwind CSS v4](https://tailwindcss.com/), and [Lucide Icons](https://lucide.dev/).
- **Design Language**: Glassmorphism dark theme, dynamic color-coded utilization indicators, and fluid transitions.

---

## 🚀 Getting Started

### Prerequisites

- [Rust toolchain](https://rustup.rs/) (v1.78+)
- [Node.js](https://nodejs.org/) (v20+) & npm
- Windows 10 / 11 (64-bit)

### Installation & Development

`ash
# Clone the repository
git clone https://github.com/ahmedalwaraqi/SecurePC.git
cd SecurePC

# Install frontend dependencies
cd ui
npm install

# Run the development environment with hot reloading
npm run dev
# or from root:
npm run dev
`

### Production Build

`ash
# Build standalone Windows installer & executable
npm run build
`

---

## 👤 Author

**Ahmed Alwaraqi**
- **GitHub**: [@ahmedalwaraqi](https://github.com/ahmedalwaraqi)
- **Portfolio**: [ahmedalwarqi.lovable.app](https://ahmedalwarqi.lovable.app)

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
