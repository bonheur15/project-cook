import React, { useState, useEffect } from 'react';
import { GetConfig, SaveConfig, ScanWorkspace, OpenInEditor } from '../../wailsjs/go/main/App';
import { backend } from '../../wailsjs/go/models';
import { CodeIcon, SearchIcon, GitBranchIcon, CloseIcon } from './Icons';

interface WorkspaceDashboardProps {
  onOpenProject: (project: backend.Project) => void;
  onConfigChange?: () => void;
}

export const WorkspaceDashboard: React.FC<WorkspaceDashboardProps> = ({ onOpenProject, onConfigChange }) => {
  const [config, setConfig] = useState<backend.Config | null>(null);
  const [activeWorkspace, setActiveWorkspace] = useState<string>('');
  const [newWorkspaceInput, setNewWorkspaceInput] = useState<string>('');
  const [projects, setProjects] = useState<backend.Project[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedLanguageFilter, setSelectedLanguageFilter] = useState<string>('All');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Load config on mount
  useEffect(() => {
    const loadAppConfig = async () => {
      try {
        const cfg = await GetConfig();
        setConfig(cfg);
        if (cfg.workspaces && cfg.workspaces.length > 0) {
          setActiveWorkspace(cfg.workspaces[0]);
        }
      } catch (err) {
        console.error('Failed to load config', err);
      }
    };
    loadAppConfig();
  }, []);

  // Scan workspace when active workspace changes
  useEffect(() => {
    if (!activeWorkspace) {
      setProjects([]);
      return;
    }

    const scanActive = async () => {
      try {
        setLoading(true);
        setError(null);
        const list = await ScanWorkspace(activeWorkspace);
        setProjects(list || []);
      } catch (err: any) {
        setError(err?.message || `Failed to scan workspace: ${activeWorkspace}`);
        setProjects([]);
      } finally {
        setLoading(false);
      }
    };

    scanActive();
  }, [activeWorkspace]);

  const handleAddWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWorkspaceInput.trim() || !config) return;

    const path = newWorkspaceInput.trim();
    if (config.workspaces.includes(path)) {
      alert('Workspace already exists');
      return;
    }

    const updatedWorkspaces = [...config.workspaces, path];
    const updatedConfig = { ...config, workspaces: updatedWorkspaces };

    try {
      await SaveConfig(updatedConfig);
      setConfig(updatedConfig);
      setActiveWorkspace(path);
      setNewWorkspaceInput('');
      if (onConfigChange) onConfigChange();
    } catch (err) {
      alert(`Error saving workspace: ${err}`);
    }
  };

  const handleRemoveWorkspace = async (path: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!config) return;

    const updatedWorkspaces = config.workspaces.filter((w) => w !== path);
    const updatedConfig = { ...config, workspaces: updatedWorkspaces };

    try {
      await SaveConfig(updatedConfig);
      setConfig(updatedConfig);
      if (activeWorkspace === path) {
        setActiveWorkspace(updatedWorkspaces[0] || '');
      }
      if (onConfigChange) onConfigChange();
    } catch (err) {
      alert(`Error removing workspace: ${err}`);
    }
  };

  const handleOpenEditor = async (editor: string, projPath: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await OpenInEditor(editor, projPath);
    } catch (err) {
      alert(`Failed to open in ${editor}: ${err}`);
    }
  };

  // Filter projects based on search query and stack type
  const filteredProjects = projects.filter((proj) => {
    const matchesSearch =
      proj.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      proj.path.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (proj.gitBranch && proj.gitBranch.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesLang =
      selectedLanguageFilter === 'All' ||
      (proj.langStack || []).some((lang) => lang.toLowerCase() === selectedLanguageFilter.toLowerCase());

    return matchesSearch && matchesLang;
  });

  // Extract unique languages for filter tabs
  const allLanguages = ['All'];
  projects.forEach((p) => {
    (p.langStack || []).forEach((l) => {
      if (!allLanguages.includes(l)) allLanguages.push(l);
    });
  });

  return (
    <div className="animate-fade" style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
      {/* Workspaces Sidebar */}
      <div
        style={{
          width: '260px',
          background: 'var(--bg-secondary)',
          borderRight: '1px solid var(--border-color)',
          display: 'flex',
          flexDirection: 'column',
          textAlign: 'left',
        }}
      >
        <div style={{ padding: '24px 20px', borderBottom: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
            <CodeIcon size={20} style={{ color: 'var(--accent-blue)' }} /> ForgeHub
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Developer workspace cockpit</p>
        </div>

        {/* Workspace List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 12px' }}>
          <h4 style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.05em', paddingLeft: '8px', marginBottom: '8px' }}>
            WORKSPACES
          </h4>
          {config?.workspaces.length === 0 ? (
            <div style={{ padding: '8px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>No workspaces added yet.</div>
          ) : (
            config?.workspaces.map((path) => {
              const isActive = activeWorkspace === path;
              return (
                <div
                  key={path}
                  onClick={() => setActiveWorkspace(path)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 12px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    background: isActive ? 'rgba(56, 189, 248, 0.08)' : 'transparent',
                    border: isActive ? '1px solid rgba(56, 189, 248, 0.2)' : '1px solid transparent',
                    marginBottom: '6px',
                    transition: 'all var(--transition-fast)',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <div style={{ overflow: 'hidden', marginRight: '8px' }}>
                    <div style={{ fontSize: '0.9rem', color: isActive ? 'var(--accent-blue)' : 'var(--text-primary)', fontWeight: isActive ? 600 : 400, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                      {path.split('/').pop() || path}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                      {path}
                    </div>
                  </div>
                  <button
                    className="btn-text"
                    onClick={(e) => handleRemoveWorkspace(path, e)}
                    style={{ padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                    title="Remove workspace"
                  >
                    <CloseIcon size={12} />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Add Workspace Form */}
        <form onSubmit={handleAddWorkspace} style={{ padding: '16px', borderTop: '1px solid var(--border-color)', background: 'var(--bg-tertiary)' }}>
          <input
            type="text"
            placeholder="Add workspace path..."
            value={newWorkspaceInput}
            onChange={(e) => setNewWorkspaceInput(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 10px',
              borderRadius: '6px',
              border: '1px solid var(--border-color)',
              background: 'var(--bg-primary)',
              color: 'var(--text-primary)',
              fontSize: '0.85rem',
              outline: 'none',
              marginBottom: '8px',
            }}
          />
          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '6px' }}>
            + Add Workspace
          </button>
        </form>
      </div>

      {/* Main Grid Panel */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Top Header Filter Bar */}
        <div
          style={{
            padding: '20px 32px',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
          }}
        >
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '6px 12px' }}>
            <SearchIcon size={16} style={{ marginRight: '8px', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search projects by name, branch, stack..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-primary)',
                width: '100%',
                fontSize: '0.9rem',
                outline: 'none',
              }}
            />
          </div>

          {/* Language filters */}
          <div style={{ display: 'flex', gap: '6px' }}>
            {allLanguages.map((lang) => (
              <button
                key={lang}
                onClick={() => setSelectedLanguageFilter(lang)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '16px',
                  fontSize: '0.8rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                  border: '1px solid',
                  borderColor: selectedLanguageFilter === lang ? 'var(--accent-blue)' : 'var(--border-color)',
                  background: selectedLanguageFilter === lang ? 'rgba(56, 189, 248, 0.15)' : 'var(--bg-secondary)',
                  color: selectedLanguageFilter === lang ? 'var(--accent-blue)' : 'var(--text-secondary)',
                  transition: 'all var(--transition-fast)',
                }}
              >
                {lang}
              </button>
            ))}
          </div>
        </div>

        {/* Project Card Grid */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '32px' }}>
          {error && (
            <div style={{ padding: '24px', background: 'rgba(248, 113, 113, 0.1)', border: '1px solid rgba(248, 113, 113, 0.2)', borderRadius: '8px', color: 'var(--accent-rose)', textAlign: 'center' }}>
              {error}
            </div>
          )}

          {loading && (
            <div style={{ textAlign: 'center', padding: '64px', color: 'var(--text-muted)' }}>
              <CodeIcon size={32} style={{ marginBottom: '12px', color: 'var(--text-muted)' }} className="animate-fade" />
              <div>Scanning workspace directories...</div>
            </div>
          )}

          {!loading && !error && filteredProjects.length === 0 && (
            <div style={{ textAlign: 'center', padding: '64px', color: 'var(--text-muted)' }}>
              No projects found in this workspace folder.
            </div>
          )}

          {!loading && !error && filteredProjects.length > 0 && (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '20px',
              }}
            >
              {filteredProjects.map((proj) => (
                <div
                  key={proj.path}
                  onClick={() => onOpenProject(proj)}
                  style={{
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '10px',
                    padding: '20px',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all var(--transition-normal)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    minHeight: '180px',
                    boxShadow: 'var(--shadow-sm)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(56, 189, 248, 0.3)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-color)';
                    e.currentTarget.style.transform = 'none';
                    e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                  }}
                >
                  <div>
                    {/* Top Row: Name and Git branch */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', wordBreak: 'break-word', marginRight: '8px' }}>
                        {proj.name}
                      </h3>
                      {proj.gitBranch && (
                        <div
                          style={{
                            fontSize: '0.75rem',
                            padding: '3px 8px',
                            borderRadius: '12px',
                            background: proj.gitChanges > 0 ? 'rgba(251, 191, 36, 0.15)' : 'rgba(52, 211, 153, 0.15)',
                            color: proj.gitChanges > 0 ? 'var(--accent-amber)' : 'var(--accent-green)',
                            border: '1px solid',
                            borderColor: proj.gitChanges > 0 ? 'rgba(251, 191, 36, 0.2)' : 'rgba(52, 211, 153, 0.2)',
                            whiteSpace: 'nowrap',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                          title={`${proj.gitChanges} uncommitted changes`}
                        >
                          <GitBranchIcon size={12} />
                          <span>{proj.gitBranch} {proj.gitChanges > 0 && `• ${proj.gitChanges}`}</span>
                        </div>
                      )}
                    </div>

                    {/* Path */}
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', wordBreak: 'break-all', marginBottom: '16px' }}>
                      {proj.path}
                    </div>

                    {/* Stack / Framework tags */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
                      {(proj.langStack || []).map((lang) => (
                        <span
                          key={lang}
                          style={{
                            fontSize: '0.7rem',
                            fontWeight: 600,
                            padding: '2px 8px',
                            borderRadius: '4px',
                            background: 'var(--bg-tertiary)',
                            color: lang === 'Go' ? 'var(--accent-teal)' : lang === 'Node.js' ? 'var(--accent-blue)' : 'var(--text-primary)',
                          }}
                        >
                          {lang}
                        </span>
                      ))}
                      {(proj.frameworks || []).map((fw) => (
                        <span
                          key={fw}
                          style={{
                            fontSize: '0.7rem',
                            fontWeight: 600,
                            padding: '2px 8px',
                            borderRadius: '4px',
                            background: 'rgba(192, 132, 252, 0.15)',
                            color: 'var(--accent-purple)',
                          }}
                        >
                          {fw}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Quick Editor Launchers */}
                  <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
                    <button
                      className="btn btn-secondary"
                      onClick={(e) => handleOpenEditor('code', proj.path, e)}
                      style={{ flex: 1, padding: '5px 8px', fontSize: '0.75rem' }}
                    >
                      VS Code
                    </button>
                    <button
                      className="btn btn-secondary"
                      onClick={(e) => handleOpenEditor('zed', proj.path, e)}
                      style={{ flex: 1, padding: '5px 8px', fontSize: '0.75rem' }}
                    >
                      Zed
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
