import React, { useState, useEffect } from 'react';
import { FileTree } from './FileTree';
import { TerminalView } from './TerminalView';
import { SafeModeModal } from './SafeModeModal';
import { GetConfig, OpenInEditor, StartProcess } from '../../wailsjs/go/main/App';
import { backend } from '../../wailsjs/go/models';
import { CodeIcon, GitBranchIcon, ArrowLeftIcon, PlayIcon, CloseIcon } from './Icons';

interface ProjectCanvasProps {
  project: backend.Project;
  onBack: () => void;
}

interface TerminalTab {
  id: string; // e.g. "Dev Server"
  command: string;
  isRunning: boolean;
}

export const ProjectCanvas: React.FC<ProjectCanvasProps> = ({ project, onBack }) => {
  const [config, setConfig] = useState<backend.Config | null>(null);
  const [terminalTabs, setTerminalTabs] = useState<TerminalTab[]>([
    { id: 'General', command: 'echo "Ready to cook!"', isRunning: false },
  ]);
  const [activeTabId, setActiveTabId] = useState<string>('General');
  
  // Safe mode modal state
  const [safeModalOpen, setSafeModalOpen] = useState<boolean>(false);
  const [pendingCommand, setPendingCommand] = useState<{ name: string; cmd: string } | null>(null);

  // Load configuration details on mount
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const cfg = await GetConfig();
        setConfig(cfg);
      } catch (err) {
        console.error('Failed to load config', err);
      }
    };
    fetchConfig();
  }, []);

  const handleOpenEditor = async (editor: string) => {
    try {
      await OpenInEditor(editor, project.path);
    } catch (err) {
      alert(`Failed to open in ${editor}: ${err}`);
    }
  };

  const executeCommand = async (name: string, cmd: string) => {
    // Add tab if it doesn't exist
    setTerminalTabs((prev) => {
      const exists = prev.some((t) => t.id === name);
      if (exists) return prev;
      return [...prev, { id: name, command: cmd, isRunning: false }];
    });
    setActiveTabId(name);

    // If safeMode is enabled, show confirmation modal first
    if (config?.safeMode) {
      setPendingCommand({ name, cmd });
      setSafeModalOpen(true);
    } else {
      // Execute immediately
      await runCommandBackend(name, cmd);
    }
  };

  const runCommandBackend = async (name: string, cmd: string) => {
    try {
      await StartProcess(cmd, project.path, project.path, name);
    } catch (err) {
      console.error('Failed to start process', err);
    }
  };

  const handleConfirmSafeMode = async () => {
    if (pendingCommand) {
      setSafeModalOpen(false);
      await runCommandBackend(pendingCommand.name, pendingCommand.cmd);
      setPendingCommand(null);
    }
  };

  const handleCancelSafeMode = () => {
    setSafeModalOpen(false);
    setPendingCommand(null);
  };

  const handleCloseTab = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (id === 'General') return;

    setTerminalTabs((prev) => prev.filter((t) => t.id !== id));
    if (activeTabId === id) {
      setActiveTabId('General');
    }
  };

  const updateTabRunningState = (id: string, running: boolean) => {
    setTerminalTabs((prev) =>
      prev.map((t) => (t.id === id ? { ...t, isRunning: running } : t))
    );
  };

  // Combine auto-cook tasks and package scripts
  const detectedScripts = { ...(project.scripts || {}) };
  const autoCookTasks = project.autoCookData?.tasks || [];

  return (
    <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Top Controls Header */}
      <div
        style={{
          padding: '16px 24px',
          background: 'var(--bg-secondary)',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', overflow: 'hidden' }}>
          <button className="btn btn-secondary" onClick={onBack} style={{ padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <ArrowLeftIcon size={14} /> Back
          </button>
          <div style={{ textAlign: 'left', overflow: 'hidden' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CodeIcon size={18} style={{ color: 'var(--accent-blue)' }} /> {project.name}
              {project.gitBranch && (
                <span style={{ fontSize: '0.8rem', fontWeight: 500, padding: '2px 8px', borderRadius: '12px', background: 'rgba(56, 189, 248, 0.12)', color: 'var(--accent-blue)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <GitBranchIcon size={12} /> {project.gitBranch}
                </span>
              )}
            </h2>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
              {project.path}
            </p>
          </div>
        </div>

        {/* Launch Editor Shortcuts */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn btn-secondary" onClick={() => handleOpenEditor('code')}>
            Open VS Code
          </button>
          <button className="btn btn-secondary" onClick={() => handleOpenEditor('zed')}>
            Open Zed
          </button>
        </div>
      </div>

      {/* Main Splits Area */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Left File Tree Sidebar */}
        <div style={{ width: '250px', flexShrink: 0 }}>
          <FileTree rootPath={project.path} defaultEditor={config?.defaultEditor || 'code'} />
        </div>

        {/* Right Dashboard Area */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '24px', overflowY: 'auto', gap: '24px' }}>
          
          {/* Section: Project Cookbook Commands */}
          <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '20px', textAlign: 'left' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '16px', color: 'var(--text-primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CodeIcon size={16} style={{ color: 'var(--accent-blue)' }} /> Project Commands
            </h3>

            {/* Render auto-cook.json tasks if any */}
            {autoCookTasks.length > 0 && (
              <div style={{ marginBottom: '16px' }}>
                <h4 style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--accent-amber)', marginBottom: '8px' }}>
                  Auto-Cook Tasks
                </h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {autoCookTasks.map((task) => (
                    <button
                      key={task.name}
                      className="btn btn-primary"
                      onClick={() => executeCommand(task.name, task.command)}
                      style={{ fontSize: '0.8rem', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      <PlayIcon size={12} /> {task.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Render scripts detected from files */}
            <div>
              {autoCookTasks.length > 0 && (
                <h4 style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>
                  Detected Scripts
                </h4>
              )}
              {Object.keys(detectedScripts).length === 0 ? (
                <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  No commands or scripts detected in project files.
                </div>
              ) : (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {Object.entries(detectedScripts).map(([name, cmd]) => (
                    <button
                      key={name}
                      className="btn btn-secondary"
                      onClick={() => executeCommand(name, cmd)}
                      style={{ fontSize: '0.8rem', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '4px' }}
                      title={cmd}
                    >
                      <PlayIcon size={12} /> {name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Section: Built-In Terminals Logger */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: '300px' }}>
            {/* Tab Bar */}
            <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', background: 'var(--bg-secondary)', borderTopLeftRadius: '8px', borderTopRightRadius: '8px', overflowX: 'auto' }}>
              {terminalTabs.map((tab) => {
                const isActive = activeTabId === tab.id;
                return (
                  <div
                    key={tab.id}
                    onClick={() => setActiveTabId(tab.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '10px 16px',
                      cursor: 'pointer',
                      background: isActive ? '#040711' : 'transparent',
                      borderRight: '1px solid var(--border-color)',
                      borderTop: isActive ? '2px solid var(--accent-blue)' : '2px solid transparent',
                      color: isActive ? 'var(--accent-blue)' : 'var(--text-secondary)',
                      fontSize: '0.85rem',
                      fontWeight: isActive ? 600 : 400,
                      userSelect: 'none',
                    }}
                  >
                    {tab.isRunning && (
                      <span
                        style={{
                          width: '6px',
                          height: '6px',
                          borderRadius: '50%',
                          backgroundColor: 'var(--accent-green)',
                          boxShadow: '0 0 6px var(--accent-green)',
                        }}
                      />
                    )}
                    <span>{tab.id}</span>
                    {tab.id !== 'General' && (
                      <button
                        onClick={(e) => handleCloseTab(tab.id, e)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: 'var(--text-muted)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          marginLeft: '4px',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent-rose)')}
                        onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
                      >
                        <CloseIcon size={12} />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Active Terminal Container */}
            <div style={{ flex: 1 }}>
              {terminalTabs.map((tab) => (
                <div key={tab.id} style={{ display: activeTabId === tab.id ? 'block' : 'none', height: '100%' }}>
                  <TerminalView
                    projectId={project.path}
                    terminalId={tab.id}
                    command={tab.command}
                    dir={project.path}
                    onStateChange={(running) => updateTabRunningState(tab.id, running)}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Safe Mode Warning Dialog Overlay */}
      <SafeModeModal
        isOpen={safeModalOpen}
        command={pendingCommand?.cmd || ''}
        onConfirm={handleConfirmSafeMode}
        onCancel={handleCancelSafeMode}
      />
    </div>
  );
};
