import { useState } from 'react';
import { WorkspaceDashboard } from './components/WorkspaceDashboard';
import { ProjectCanvas } from './components/ProjectCanvas';
import { backend } from '../wailsjs/go/models';
import './App.css';

function App() {
  const [currentProject, setCurrentProject] = useState<backend.Project | null>(null);

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
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
  );
}

export default App;
