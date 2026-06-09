import { useState, useEffect } from 'react';
import { WorkspaceDashboard } from './components/WorkspaceDashboard';
import { ProjectCanvas } from './components/ProjectCanvas';
import { TitleBar } from './components/TitleBar';
import { Onboarding } from './components/Onboarding';
import { GetConfig } from '../wailsjs/go/main/App';
import { backend } from '../wailsjs/go/models';
import './App.css';

function App() {
  const [currentProject, setCurrentProject] = useState<backend.Project | null>(null);
  const [config, setConfig] = useState<backend.Config | null>(null);
  const [loadingConfig, setLoadingConfig] = useState<boolean>(true);

  const loadConfig = async () => {
    try {
      setLoadingConfig(true);
      const cfg = await GetConfig();
      setConfig(cfg);
    } catch (err) {
      console.error('Failed to load config', err);
    } finally {
      setLoadingConfig(false);
    }
  };

  useEffect(() => {
    // Load custom theme settings on mount
    const savedAccent = localStorage.getItem('forgehub-accent') || '#81c784';
    const savedBg = localStorage.getItem('forgehub-bg-theme') || 'zinc';
    
    const applyThemeColors = (accentColor: string, bgThemeName: string) => {
      const bgPresets: Record<string, { primary: string; secondary: string; tertiary: string }> = {
        zinc: { primary: '#121214', secondary: '#1a1a1e', tertiary: '#232328' },
        charcoal: { primary: '#18181b', secondary: '#27272a', tertiary: '#3f3f46' },
        navy: { primary: '#0b0f19', secondary: '#111827', tertiary: '#1f2937' },
        black: { primary: '#000000', secondary: '#0c0c0e', tertiary: '#18181b' },
      };

      const colors = bgPresets[bgThemeName] || bgPresets.zinc;
      const root = document.documentElement;
      
      root.style.setProperty('--accent-blue', accentColor);
      root.style.setProperty('--border-focus', accentColor);
      root.style.setProperty('--bg-primary', colors.primary);
      root.style.setProperty('--bg-secondary', colors.secondary);
      root.style.setProperty('--bg-tertiary', colors.tertiary);
      root.style.setProperty('--bg-glass', `${colors.secondary}bf`);
    };

    applyThemeColors(savedAccent, savedBg);
    loadConfig();
  }, []);

  const handleOnboardingComplete = () => {
    loadConfig();
  };

  if (loadingConfig) {
    return (
      <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <TitleBar />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-primary)' }}>
          <div style={{ color: 'var(--text-muted)' }}>Loading...</div>
        </div>
      </div>
    );
  }

  const hasWorkspaces = config && config.workspaces && config.workspaces.length > 0;

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Custom Title Bar for frameless layout */}
      <TitleBar />

      {/* Main viewport */}
      <div style={{ flex: 1, overflow: 'hidden' }}>
        {!hasWorkspaces ? (
          <Onboarding onComplete={handleOnboardingComplete} />
        ) : currentProject ? (
          <ProjectCanvas
            project={currentProject}
            onBack={() => setCurrentProject(null)}
          />
        ) : (
          <WorkspaceDashboard
            onOpenProject={(proj) => setCurrentProject(proj)}
            onConfigChange={loadConfig}
          />
        )}
      </div>
    </div>
  );
}

export default App;
