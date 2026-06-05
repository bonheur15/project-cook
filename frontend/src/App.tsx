import { useState } from 'react';
import { WorkspaceDashboard } from './components/WorkspaceDashboard';
import { ProjectCanvas } from './components/ProjectCanvas';
import { TitleBar } from './components/TitleBar';
import { backend } from '../wailsjs/go/models';
import './App.css';

function App() {
  const [currentProject, setCurrentProject] = useState<backend.Project | null>(null);

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Custom Title Bar for frameless layout */}
      <TitleBar />

      {/* Main viewport */}
      <div style={{ flex: 1, overflow: 'hidden' }}>
        {currentProject ? (
          <ProjectCanvas
            project={currentProject}
            onBack={() => setCurrentProject(null)}
          />
        ) : (
          <WorkspaceDashboard
            onOpenProject={(proj) => setCurrentProject(proj)}
          />
        )}
      </div>
    </div>
  );
}

export default App;
