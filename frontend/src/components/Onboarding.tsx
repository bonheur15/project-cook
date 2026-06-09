import React, { useState } from 'react';
import { SelectDirectory, SaveConfig } from '../../wailsjs/go/main/App';
import { backend } from '../../wailsjs/go/models';
import { FolderIcon, CodeIcon, SettingsIcon, ShieldIcon, ArrowLeftIcon, ChevronRightIcon } from './Icons';

interface OnboardingProps {
  onComplete: (firstWorkspace: string) => void;
}

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [folderPath, setFolderPath] = useState<string>('');
  const [workspaceName, setWorkspaceName] = useState<string>('');
  
  // Settings
  const [defaultEditor, setDefaultEditor] = useState<string>('zed');
  const [defaultShell, setDefaultShell] = useState<string>('bash');
  const [safeMode, setSafeMode] = useState<boolean>(true);
  const [openLastOnStartup, setOpenLastOnStartup] = useState<boolean>(false);
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handlePickFolder = async () => {
    try {
      setError(null);
      const path = await SelectDirectory();
      if (path) {
        setFolderPath(path);
        
        // Auto-fill workspace name based on folder name
        const parts = path.split(/[/\\]/);
        const folderName = parts.pop() || parts.pop() || 'My Workspace';
        setWorkspaceName(folderName);
        
        // Advance to step 2 with a brief timeout for animation smoothness
        setTimeout(() => {
          setStep(2);
        }, 150);
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to open directory dialog');
    }
  };

  const handleFinish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!folderPath) return;

    setLoading(true);
    setError(null);

    try {
      // Save workspace configuration
      const newConfig = new backend.Config({
        workspaces: [folderPath],
        defaultEditor: defaultEditor,
        defaultTerminalShell: defaultShell,
        theme: 'dark',
        safeMode: safeMode,
        openLastProjectOnStartup: openLastOnStartup,
      });

      await SaveConfig(newConfig);
      
      // Notify parent component that setup is complete
      onComplete(folderPath);
    } catch (err: any) {
      setError(err?.message || 'Failed to save configuration. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100%',
        background: 'var(--bg-primary)',
        color: 'var(--text-primary)',
        padding: '40px 20px',
        overflowY: 'auto',
        position: 'relative',
      }}
    >

      {/* Main card */}
      <div
        className="animate-slide"
        style={{
          width: '560px',
          maxWidth: '100%',
          background: 'rgba(19, 25, 36, 0.6)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '16px',
          boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
          padding: '40px',
          textAlign: 'center',
          position: 'relative',
          zIndex: 1,
          transition: 'all 0.3s ease',
        }}
      >
        {/* Branding header */}
        <div style={{ marginBottom: '24px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '48px',
              height: '48px',
              borderRadius: '10px',
              background: 'rgba(56, 189, 248, 0.08)',
              border: '1px solid rgba(56, 189, 248, 0.15)',
              color: 'var(--accent-blue)',
              marginBottom: '16px',
            }}
          >
            <CodeIcon size={22} />
          </div>
          <h1
            style={{
              fontSize: '1.8rem',
              fontWeight: 800,
              letterSpacing: '-0.02em',
              color: 'var(--text-primary)',
              marginBottom: '8px',
            }}
          >
            ForgeHub
          </h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', maxWidth: '360px', margin: '0 auto' }}>
            Let's configure your developer control room.
          </p>
        </div>

        {error && (
          <div
            style={{
              padding: '12px 16px',
              background: 'rgba(248, 113, 113, 0.08)',
              border: '1px solid rgba(248, 113, 113, 0.2)',
              borderRadius: '8px',
              color: 'var(--accent-rose)',
              fontSize: '0.85rem',
              marginBottom: '24px',
              textAlign: 'left',
            }}
          >
            {error}
          </div>
        )}

        {/* Step 1: Folder Selection */}
        {step === 1 && (
          <div className="animate-fade">
            <button
              onClick={handlePickFolder}
              style={{
                width: '100%',
                padding: '36px 24px',
                background: 'rgba(255, 255, 255, 0.01)',
                border: '1px dashed rgba(255, 255, 255, 0.15)',
                borderRadius: '12px',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                transition: 'all 0.2s ease',
                outline: 'none',
                marginTop: '12px',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.border = '1px dashed var(--accent-blue)';
                e.currentTarget.style.background = 'rgba(56, 189, 248, 0.03)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.border = '1px dashed rgba(255, 255, 255, 0.15)';
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.01)';
              }}
            >
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.03)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--text-secondary)',
                }}
              >
                <FolderIcon size={20} />
              </div>
              <div>
                <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                  Choose Workspace Directory
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Click to choose a folder on your computer
                </div>
              </div>
            </button>

            <div style={{ marginTop: '20px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Example: <code>~/projects</code> or <code>~/development</code>
            </div>
          </div>
        )}

        {/* Step 2: Configuration */}
        {step === 2 && (
          <form onSubmit={handleFinish} className="animate-fade" style={{ textAlign: 'left' }}>
            <div style={{ marginBottom: '24px' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  color: 'var(--text-secondary)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  marginBottom: '8px',
                }}
              >
                Selected Directory
              </label>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 14px',
                  background: 'var(--bg-primary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  color: 'var(--text-secondary)',
                  fontSize: '0.85rem',
                  wordBreak: 'break-all',
                }}
              >
                <FolderIcon size={16} style={{ color: 'var(--accent-blue)', flexShrink: 0 }} />
                <span>{folderPath}</span>
              </div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label
                htmlFor="workspace-name"
                style={{
                  display: 'block',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  color: 'var(--text-secondary)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  marginBottom: '8px',
                }}
              >
                Workspace Name
              </label>
              <input
                id="workspace-name"
                type="text"
                value={workspaceName}
                onChange={(e) => setWorkspaceName(e.target.value)}
                placeholder="e.g. Personal Projects"
                required
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  color: 'var(--text-primary)',
                  fontSize: '0.9rem',
                  outline: 'none',
                  transition: 'border-color 0.2s ease',
                }}
                onFocus={(e) => (e.target.style.borderColor = 'var(--accent-blue)')}
                onBlur={(e) => (e.target.style.borderColor = 'var(--border-color)')}
              />
            </div>

            {/* Advanced Settings Toggle */}
            <div style={{ marginBottom: '24px' }}>
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--accent-blue)',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: 0,
                  outline: 'none',
                }}
              >
                <SettingsIcon size={14} />
                <span>{showAdvanced ? 'Hide preferences' : 'Configure preferences (optional)'}</span>
              </button>

              {showAdvanced && (
                <div
                  className="animate-slide"
                  style={{
                    marginTop: '16px',
                    padding: '16px',
                    background: 'rgba(11, 15, 23, 0.4)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px',
                  }}
                >
                  {/* Default Editor */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                      Default Editor
                    </label>
                    <select
                      value={defaultEditor}
                      onChange={(e) => setDefaultEditor(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        background: 'var(--bg-primary)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '6px',
                        color: 'var(--text-primary)',
                        fontSize: '0.85rem',
                        outline: 'none',
                      }}
                    >
                      <option value="code">VS Code</option>
                      <option value="zed">Zed</option>
                    </select>
                  </div>

                  {/* Terminal Shell */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                      Default Shell
                    </label>
                    <select
                      value={defaultShell}
                      onChange={(e) => setDefaultShell(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        background: 'var(--bg-primary)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '6px',
                        color: 'var(--text-primary)',
                        fontSize: '0.85rem',
                        outline: 'none',
                      }}
                    >
                      <option value="bash">bash</option>
                      <option value="zsh">zsh</option>
                      <option value="fish">fish</option>
                      <option value="sh">sh</option>
                    </select>
                  </div>

                  {/* Safe Mode Toggle */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                    <input
                      type="checkbox"
                      id="safe-mode"
                      checked={safeMode}
                      onChange={(e) => setSafeMode(e.target.checked)}
                      style={{ marginTop: '3px', cursor: 'pointer' }}
                    />
                    <label htmlFor="safe-mode" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', cursor: 'pointer', userSelect: 'none' }}>
                      <span style={{ color: 'var(--text-primary)', fontWeight: 500, marginBottom: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <ShieldIcon size={12} style={{ color: 'var(--accent-green)' }} /> Safe Mode
                      </span>
                      Review project commands (like auto-cook scripts) before running.
                    </label>
                  </div>

                  {/* Auto-Open Last Project Toggle */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                    <input
                      type="checkbox"
                      id="auto-open"
                      checked={openLastOnStartup}
                      onChange={(e) => setOpenLastOnStartup(e.target.checked)}
                      style={{ marginTop: '3px', cursor: 'pointer' }}
                    />
                    <label htmlFor="auto-open" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', cursor: 'pointer', userSelect: 'none' }}>
                      <span style={{ display: 'block', color: 'var(--text-primary)', fontWeight: 500, marginBottom: '2px' }}>
                        Open last project automatically
                      </span>
                      Directly open your last cooking session on startup.
                    </label>
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="btn btn-secondary"
                style={{ flex: 1, padding: '12px' }}
                disabled={loading}
              >
                <ArrowLeftIcon size={16} />
                <span>Back</span>
              </button>

              <button
                type="submit"
                className="btn btn-primary"
                style={{
                  flex: 2,
                  padding: '12px',
                }}
                disabled={loading}
              >
                {loading ? 'Initializing...' : 'Launch ForgeHub'}
                {!loading && <ChevronRightIcon size={16} />}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
