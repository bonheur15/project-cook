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
