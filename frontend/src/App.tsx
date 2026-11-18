import { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardPage } from './pages/DashboardPage';
import { DevicesPage } from './pages/DevicesPage';
import { DeviceDetailPage } from './pages/DeviceDetailPage';
import { FirmwarePage } from './pages/FirmwarePage';
import { CreateDeploymentPage } from './pages/CreateDeploymentPage';
import { AdaptiveEnginePage } from './pages/AdaptiveEnginePage';
import { TransferMonitorPage } from './pages/TransferMonitorPage';
import { RecoveryCenterPage } from './pages/RecoveryCenterPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { ArchitecturePage } from './pages/ArchitecturePage';
import { SettingsPage } from './pages/SettingsPage';
import { LandingPage } from './pages/LandingPage';
import { SocketProvider } from './context/SocketContext';
import { AuthProvider } from './context/AuthContext';

export function AppContent() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
  const [showLanding, setShowLanding] = useState(false);

  const handleSelectDevice = (deviceId: string) => {
    setSelectedDeviceId(deviceId);
    setActiveTab('device_detail');
  };

  if (showLanding) {
    return <LandingPage onOpenDashboard={() => setShowLanding(false)} />;
  }

  return (
    <div className="flex min-h-screen bg-[#080c14] text-slate-100 selection:bg-cyan-500 selection:text-slate-950 font-sans">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header onLandingPageClick={() => setShowLanding(true)} />
        <main className="flex-1 p-6 overflow-y-auto">
          {activeTab === 'dashboard' && (
            <DashboardPage
              onNavigate={(tab) => setActiveTab(tab)}
              onSelectDevice={handleSelectDevice}
            />
          )}
          {activeTab === 'devices' && <DevicesPage onSelectDevice={handleSelectDevice} />}
          {activeTab === 'device_detail' && (
            <DeviceDetailPage
              deviceId={selectedDeviceId || 'ESP32-001'}
              onBack={() => setActiveTab('devices')}
            />
          )}
          {activeTab === 'firmware' && <FirmwarePage />}
          {activeTab === 'deployments' && (
            <CreateDeploymentPage onSuccess={() => setActiveTab('transfers')} />
          )}
          {activeTab === 'adaptive' && <AdaptiveEnginePage />}
          {activeTab === 'transfers' && <TransferMonitorPage />}
          {activeTab === 'recovery' && <RecoveryCenterPage />}
          {activeTab === 'analytics' && <AnalyticsPage />}
          {activeTab === 'architecture' && <ArchitecturePage />}
          {activeTab === 'settings' && <SettingsPage />}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <AppContent />
      </SocketProvider>
    </AuthProvider>
  );
}
