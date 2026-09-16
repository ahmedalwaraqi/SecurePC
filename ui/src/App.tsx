import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { DashboardTab } from './tabs/Dashboard';
import { ProcessesTab } from './tabs/Processes';
import { StartupTab } from './tabs/Startup';
import { CleanupTab } from './tabs/Cleanup';
import { SystemInfoTab } from './tabs/SystemInfo';
import { MonitorTab } from './tabs/Monitor';
import { invokeCommand } from './tauri';
import type { DashboardData, ProcessItem, TabId } from './types';
import { RefreshCw } from 'lucide-react';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [processes, setProcesses] = useState<ProcessItem[]>([]);
  const [loadingDashboard, setLoadingDashboard] = useState(true);
  const [loadingProcesses, setLoadingProcesses] = useState(false);

  const fetchDashboard = async () => {
    try {
      const data = await invokeCommand<DashboardData>('get_dashboard_data');
      setDashboardData(data);
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
    } finally {
      setLoadingDashboard(false);
    }
  };

  const fetchProcesses = async () => {
    setLoadingProcesses(true);
    try {
      const data = await invokeCommand<ProcessItem[]>('get_processes');
      setProcesses(data);
    } catch (err) {
      console.error('Failed to fetch processes:', err);
    } finally {
      setLoadingProcesses(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
    const interval = setInterval(fetchDashboard, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (activeTab === 'processes') {
      fetchProcesses();
    }
  }, [activeTab]);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#070b14] text-slate-100 select-none">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        cpuUsage={dashboardData?.cpu_usage || 0}
        ramUsage={dashboardData?.ram_usage_percent || 0}
      />

      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-10 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

        <header className="h-14 px-8 border-b border-slate-800/80 flex items-center justify-between shrink-0 bg-[#090e1a]/70 backdrop-blur-md z-10">
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono uppercase tracking-widest text-slate-400">
              SECUREPC // <span className="text-cyan-400 font-bold">{activeTab.toUpperCase()}</span>
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-3 text-xs font-mono bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-800">
              <span className="text-slate-400">HOST:</span>
              <span className="text-white font-semibold">{dashboardData?.hostname || 'LOCAL-PC'}</span>
              <span className="text-slate-600">|</span>
              <span className="text-slate-400">UPTIME:</span>
              <span className="text-cyan-400 font-semibold">
                {dashboardData ? `${Math.floor(dashboardData.uptime_seconds / 3600)}h` : '--'}
              </span>
            </div>

            <button
              onClick={() => {
                fetchDashboard();
                if (activeTab === 'processes') fetchProcesses();
              }}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-all"
              title="Refresh Current View"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-hidden relative">
          {activeTab === 'dashboard' && (
            <DashboardTab
              data={dashboardData}
              loading={loadingDashboard}
              onNavigate={(tab) => setActiveTab(tab)}
            />
          )}

          {activeTab === 'processes' && (
            <ProcessesTab
              processes={processes}
              loading={loadingProcesses}
              onRefresh={fetchProcesses}
            />
          )}

          {activeTab === 'startup' && <StartupTab />}

          {activeTab === 'cleanup' && <CleanupTab />}

          {activeTab === 'monitor' && <MonitorTab />}

          {activeTab === 'sysinfo' && <SystemInfoTab />}
        </main>
      </div>
    </div>
  );
};