import React, { useState, useEffect } from 'react';
import { SelectDirectory, SaveConfig, GetConfigPath, ReadConfigFile, WriteConfigFile, OpenInEditor } from '../../wailsjs/go/main/App';
import { backend } from '../../wailsjs/go/models';
import { CloseIcon, SettingsIcon, FolderIcon, TrashIcon, CodeIcon } from './Icons';
import { CustomSelect } from './CustomSelect';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: backend.Config;
  onConfigChange: () => void;
  activeWorkspace: string;
  setActiveWorkspace: (path: string) => void;
}

type TabType = 'general' | 'appearance' | 'workspaces' | 'developer';

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  config,
  onConfigChange,
  activeWorkspace,
  setActiveWorkspace,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('general');
  
  // General settings state
  const [defaultEditor, setDefaultEditor] = useState<string>('zed');
  const [defaultShell, setDefaultShell] = useState<string>('bash');
  const [safeMode, setSafeMode] = useState<boolean>(true);
  const [openLastOnStartup, setOpenLastOnStartup] = useState<boolean>(false);

  // Appearance theme state
  const [accentColor, setAccentColor] = useState<string>('#81c784');
  const [bgTheme, setBgTheme] = useState<string>('zinc');

  // Add workspace flow state
  const [addFlowActive, setAddFlowActive] = useState<boolean>(false);
  const [newFolderPath, setNewFolderPath] = useState<string>('');
  const [newWorkspaceName, setNewWorkspaceName] = useState<string>('');

  // Developer tab state
  const [configFilePath, setConfigFilePath] = useState<string>('');
  const [rawConfigText, setRawConfigText] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Load configuration and localStorage settings on open
  useEffect(() => {
    if (isOpen && config) {
      setDefaultEditor(config.defaultEditor || 'zed');
      setDefaultShell(config.defaultTerminalShell || 'bash');
      setSafeMode(config.safeMode);
      setOpenLastOnStartup(config.openLastProjectOnStartup);

      // Load appearance settings from localStorage
      const savedAccent = localStorage.getItem('forgehub-accent') || '#81c784';
      const savedBg = localStorage.getItem('forgehub-bg-theme') || 'zinc';
      setAccentColor(savedAccent);
      setBgTheme(savedBg);

      setAddFlowActive(false);
      setNewFolderPath('');
      setNewWorkspaceName('');
      setError(null);

      // Load Developer tab settings config file path and content
      const loadDevConfig = async () => {
        try {
          const path = await GetConfigPath();
          setConfigFilePath(path);
          const raw = await ReadConfigFile();
          setRawConfigText(raw);
        } catch (err) {
          console.error('Failed to load developer config file info', err);
        }
      };
      loadDevConfig();
    }
  }, [isOpen, config]);

  if (!isOpen) return null;

  // Apply Theme Colors helper
  const applyThemeColors = (accent: string, bg: string) => {
    const bgPresets: Record<string, { primary: string; secondary: string; tertiary: string }> = {
      zinc: { primary: '#121214', secondary: '#1a1a1e', tertiary: '#232328' },
      charcoal: { primary: '#18181b', secondary: '#27272a', tertiary: '#3f3f46' },
      navy: { primary: '#0b0f19', secondary: '#111827', tertiary: '#1f2937' },
      black: { primary: '#000000', secondary: '#0c0c0e', tertiary: '#18181b' },
    };

    const colors = bgPresets[bg] || bgPresets.zinc;
    const root = document.documentElement;
    
    root.style.setProperty('--accent-blue', accent);
    root.style.setProperty('--border-focus', accent);
    root.style.setProperty('--bg-primary', colors.primary);
    root.style.setProperty('--bg-secondary', colors.secondary);
    root.style.setProperty('--bg-tertiary', colors.tertiary);
    root.style.setProperty('--bg-glass', `${colors.secondary}bf`);

    localStorage.setItem('forgehub-accent', accent);
    localStorage.setItem('forgehub-bg-theme', bg);
  };

  const handleAccentChange = (color: string) => {
    setAccentColor(color);
    applyThemeColors(color, bgTheme);
  };

  const handleBgThemeChange = (themeName: string) => {
    setBgTheme(themeName);
    applyThemeColors(accentColor, themeName);
  };

  // Save general settings
  const handleSaveGeneral = async () => {
    setSaving(true);
    setError(null);
    try {
      const updatedConfig = new backend.Config({
        workspaces: config.workspaces,
        defaultEditor: defaultEditor,
        defaultTerminalShell: defaultShell,
        theme: bgTheme, // Save theme to backend config as well
        safeMode: safeMode,
        openLastProjectOnStartup: openLastOnStartup,
      });

      await SaveConfig(updatedConfig);
      onConfigChange();
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleCopyPath = () => {
    navigator.clipboard.writeText(configFilePath);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenConfigInEditor = async () => {
    try {
      setError(null);
      await OpenInEditor(defaultEditor, configFilePath);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to open config in editor');
    }
  };

  const handleSaveRawConfig = async () => {
    setSaving(true);
    setError(null);
    try {
      // Validate JSON structure
      JSON.parse(rawConfigText);

      await WriteConfigFile(rawConfigText);
      onConfigChange();
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Invalid JSON format. Please verify configuration format.');
    } finally {
      setSaving(false);
    }
  };

  // Pick folder for new workspace
  const handlePickNewWorkspaceFolder = async () => {
    try {
      setError(null);
      const path = await SelectDirectory();
      if (path) {
        if (config.workspaces.includes(path)) {
          setError('Workspace directory already exists in settings.');
          return;
        }
        setNewFolderPath(path);
        
        // Auto-fill workspace name based on folder name
        const parts = path.split(/[/\\]/);
        const folderName = parts.pop() || parts.pop() || 'Workspace';
        setNewWorkspaceName(folderName);
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to select directory');
    }
  };

  // Confirm adding workspace
  const handleAddWorkspaceConfirm = async () => {
    if (!newFolderPath) return;
    setSaving(true);
    setError(null);

    try {
      const updatedWorkspaces = [...config.workspaces, newFolderPath];
      const updatedConfig = new backend.Config({
        workspaces: updatedWorkspaces,
        defaultEditor: defaultEditor,
        defaultTerminalShell: defaultShell,
        theme: bgTheme,
        safeMode: safeMode,
        openLastProjectOnStartup: openLastOnStartup,
      });

      await SaveConfig(updatedConfig);
      
      // Auto-select and go to it
      setActiveWorkspace(newFolderPath);
      
      onConfigChange();
      setAddFlowActive(false);
      setNewFolderPath('');
      setNewWorkspaceName('');
      
      // Close settings modal on success
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to add workspace');
    } finally {
      setSaving(false);
    }
  };

  // Remove workspace
  const handleRemoveWorkspace = async (pathToRemove: string) => {
    setError(null);
    try {
      const updatedWorkspaces = config.workspaces.filter((w) => w !== pathToRemove);
      const updatedConfig = new backend.Config({
        workspaces: updatedWorkspaces,
        defaultEditor: defaultEditor,
        defaultTerminalShell: defaultShell,
        theme: bgTheme,
        safeMode: safeMode,
        openLastProjectOnStartup: openLastOnStartup,
      });

      await SaveConfig(updatedConfig);
      if (activeWorkspace === pathToRemove) {
        setActiveWorkspace(updatedWorkspaces[0] || '');
      }
      onConfigChange();
    } catch (err: any) {
      setError(err?.message || 'Failed to remove workspace');
    }
  };

  const accentPresets = [
    { name: 'Sage Green', color: '#81c784' },
    { name: 'Lavender', color: '#a78bfa' },
    { name: 'Ocean Blue', color: '#38bdf8' },
    { name: 'Emerald', color: '#34d399' },
    { name: 'Amber', color: '#fbbf24' },
    { name: 'Crimson Rose', color: '#fb7185' },
  ];

  return (
    <div
      onClick={onClose}
      className="modal-overlay"
      style={{
        zIndex: 2000,
        background: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="modal-content"
        style={{
          width: '680px',
          maxWidth: '90vw',
          height: '480px',
          display: 'flex',
          flexDirection: 'column',
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 24px',
            borderBottom: '1px solid var(--border-color)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <SettingsIcon size={18} style={{ color: 'var(--accent-blue)' }} />
            <span style={{ fontWeight: 600, fontSize: '1.1rem', color: 'var(--text-primary)' }}>ForgeHub Settings</span>
          </div>
          <button
            onClick={onClose}
            className="btn-text"
            style={{ padding: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', border: 'none', cursor: 'pointer' }}
          >
            <CloseIcon size={16} />
          </button>
        </div>

        {/* Error notification */}
        {error && (
          <div style={{ background: 'rgba(244, 63, 94, 0.1)', borderBottom: '1px solid rgba(244, 63, 94, 0.2)', color: 'var(--accent-rose)', padding: '10px 24px', fontSize: '0.85rem' }}>
            {error}
          </div>
        )}

        {/* Body Container */}
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          {/* Modal Sidebar Tab Headers */}
          <div
            style={{
              width: '180px',
              borderRight: '1px solid var(--border-color)',
              background: 'var(--bg-tertiary)',
              padding: '16px 8px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
            }}
          >
            <button
              onClick={() => { setActiveTab('general'); setAddFlowActive(false); }}
              style={{
                textAlign: 'left',
                padding: '8px 12px',
                borderRadius: '6px',
                border: 'none',
                background: activeTab === 'general' ? 'rgba(255, 255, 255, 0.04)' : 'transparent',
                color: activeTab === 'general' ? 'var(--accent-blue)' : 'var(--text-secondary)',
                fontWeight: activeTab === 'general' ? 600 : 400,
                fontSize: '0.85rem',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
              }}
            >
              General Settings
            </button>
            <button
              onClick={() => { setActiveTab('appearance'); setAddFlowActive(false); }}
              style={{
                textAlign: 'left',
                padding: '8px 12px',
                borderRadius: '6px',
                border: 'none',
                background: activeTab === 'appearance' ? 'rgba(255, 255, 255, 0.04)' : 'transparent',
                color: activeTab === 'appearance' ? 'var(--accent-blue)' : 'var(--text-secondary)',
                fontWeight: activeTab === 'appearance' ? 600 : 400,
                fontSize: '0.85rem',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
              }}
            >
              Color Themes
            </button>
            <button
              onClick={() => { setActiveTab('workspaces'); setAddFlowActive(false); }}
              style={{
                textAlign: 'left',
                padding: '8px 12px',
                borderRadius: '6px',
                border: 'none',
                background: activeTab === 'workspaces' ? 'rgba(255, 255, 255, 0.04)' : 'transparent',
                color: activeTab === 'workspaces' ? 'var(--accent-blue)' : 'var(--text-secondary)',
                fontWeight: activeTab === 'workspaces' ? 600 : 400,
                fontSize: '0.85rem',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
              }}
            >
              Workspaces ({config.workspaces.length})
            </button>
            <button
              onClick={() => { setActiveTab('developer'); setAddFlowActive(false); }}
              style={{
                textAlign: 'left',
                padding: '8px 12px',
                borderRadius: '6px',
                border: 'none',
                background: activeTab === 'developer' ? 'rgba(255, 255, 255, 0.04)' : 'transparent',
                color: activeTab === 'developer' ? 'var(--accent-blue)' : 'var(--text-secondary)',
                fontWeight: activeTab === 'developer' ? 600 : 400,
                fontSize: '0.85rem',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
              }}
            >
              Developer Options
            </button>
          </div>

          {/* Modal Sidebar Tab Content */}
          <div style={{ flex: 1, padding: '24px', overflowY: 'auto', textAlign: 'left' }}>
            {/* GENERAL TAB */}
            {activeTab === 'general' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Default Editor Selection */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
                    Default Code Editor
                  </label>
                  <CustomSelect
                    value={defaultEditor}
                    onChange={setDefaultEditor}
                    options={[
                      { value: 'zed', label: 'Zed Editor' },
                      { value: 'code', label: 'VS Code' },
                    ]}
                  />
                </div>

                {/* Default Terminal Shell Selection */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
                    Default Shell
                  </label>
                  <CustomSelect
                    value={defaultShell}
                    onChange={setDefaultShell}
                    options={[
                      { value: 'bash', label: 'bash' },
                      { value: 'zsh', label: 'zsh' },
                      { value: 'fish', label: 'fish' },
                      { value: 'sh', label: 'sh' },
                    ]}
                  />
                </div>

                {/* Safe Mode Checkbox */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 0' }}>
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-primary)' }}>Safe Mode Execution</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Prompts for confirmation before executing any scripts</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={safeMode}
                    onChange={(e) => setSafeMode(e.target.checked)}
                    style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--accent-blue)' }}
                  />
                </div>

                {/* Open Last Workspace Startup Checkbox */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 0' }}>
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-primary)' }}>Restore Session</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Automatically open last active workspace on launch</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={openLastOnStartup}
                    onChange={(e) => setOpenLastOnStartup(e.target.checked)}
                    style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--accent-blue)' }}
                  />
                </div>
              </div>
            )}

            {/* APPEARANCE TAB */}
            {activeTab === 'appearance' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Background Theme Presets */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
                    Background Preset
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                    {[
                      { id: 'zinc', name: 'Zinc Dark', color: '#121214' },
                      { id: 'charcoal', name: 'Charcoal', color: '#18181b' },
                      { id: 'navy', name: 'Nordic Navy', color: '#0b0f19' },
                      { id: 'black', name: 'Absolute Pitch', color: '#000000' },
                    ].map((theme) => {
                      const isActive = bgTheme === theme.id;
                      return (
                        <button
                          key={theme.id}
                          onClick={() => handleBgThemeChange(theme.id)}
                          style={{
                            padding: '12px',
                            background: theme.color,
                            border: isActive ? '2px solid var(--accent-blue)' : '1px solid var(--border-color)',
                            borderRadius: '8px',
                            color: '#ffffff',
                            fontWeight: isActive ? 600 : 400,
                            fontSize: '0.85rem',
                            cursor: 'pointer',
                            textAlign: 'left',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                          }}
                        >
                          <span>{theme.name}</span>
                          {isActive && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-blue)' }} />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Accent Color Customizers */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
                    Accent Theme Color
                  </label>
                  
                  {/* Preset Colors */}
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '14px' }}>
                    {accentPresets.map((preset) => {
                      const isActive = accentColor.toLowerCase() === preset.color.toLowerCase();
                      return (
                        <button
                          key={preset.color}
                          onClick={() => handleAccentChange(preset.color)}
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            background: preset.color,
                            border: isActive ? '3px solid #ffffff' : '1px solid rgba(0,0,0,0.2)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: isActive ? '0 0 8px rgba(255,255,255,0.4)' : 'none',
                          }}
                          title={preset.name}
                        />
                      );
                    })}
                  </div>

                  {/* Custom Accent Color Input */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div
                      style={{
                        position: 'relative',
                        width: '36px',
                        height: '36px',
                        borderRadius: '6px',
                        overflow: 'hidden',
                        border: '1px solid var(--border-color)',
                        cursor: 'pointer',
                      }}
                    >
                      <input
                        type="color"
                        value={accentColor}
                        onChange={(e) => handleAccentChange(e.target.value)}
                        style={{
                          position: 'absolute',
                          top: '-8px',
                          left: '-8px',
                          width: '56px',
                          height: '56px',
                          border: 'none',
                          cursor: 'pointer',
                        }}
                      />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-primary)' }}>Custom Accent Color</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{accentColor.toUpperCase()}</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* WORKSPACES TAB */}
            {activeTab === 'workspaces' && (
              <div>
                {!addFlowActive ? (
                  // Workspace Manager View
                  <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Manage Active Folders
                      </span>
                      <button
                        onClick={() => { setAddFlowActive(true); setError(null); }}
                        className="btn btn-primary"
                        style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                      >
                        + Add Workspace
                      </button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {config.workspaces.map((path) => {
                        const isCurrent = activeWorkspace === path;
                        return (
                          <div
                            key={path}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '10px 14px',
                              background: 'var(--bg-primary)',
                              border: isCurrent ? '1px solid rgba(129, 199, 132, 0.3)' : '1px solid var(--border-color)',
                              borderRadius: '8px',
                            }}
                          >
                            <div style={{ overflow: 'hidden', marginRight: '16px' }}>
                              <div style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span>{path.split('/').pop() || path}</span>
                                {isCurrent && (
                                  <span style={{ fontSize: '0.7rem', padding: '1px 5px', borderRadius: '3px', background: 'rgba(129,199,132,0.1)', color: 'var(--accent-blue)', fontWeight: 600 }}>
                                    Active
                                  </span>
                                )}
                              </div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                                {path}
                              </div>
                            </div>
                            <button
                              onClick={() => handleRemoveWorkspace(path)}
                              style={{
                                background: 'transparent',
                                border: 'none',
                                cursor: 'pointer',
                                padding: '6px',
                                borderRadius: '4px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'var(--text-muted)',
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent-rose)'}
                              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                              title="Delete Workspace Link"
                            >
                              <TrashIcon size={14} />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  // Add Workspace Sub-Section (similar to Onboarding card section)
                  <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>Add New Workspace Folder</span>
                      <button
                        onClick={() => { setAddFlowActive(false); setNewFolderPath(''); }}
                        className="btn-text"
                        style={{ fontSize: '0.8rem', padding: '4px 8px' }}
                      >
                        Back to List
                      </button>
                    </div>

                    {/* Step 1 Selector or Step 2 Confirmation */}
                    {!newFolderPath ? (
                      <button
                        onClick={handlePickNewWorkspaceFolder}
                        style={{
                          width: '100%',
                          padding: '32px 20px',
                          background: 'rgba(255, 255, 255, 0.01)',
                          border: '1px dashed var(--border-color)',
                          borderRadius: '12px',
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '12px',
                          transition: 'all 0.2s ease',
                          outline: 'none',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = 'var(--accent-blue)';
                          e.currentTarget.style.background = 'rgba(129, 199, 132, 0.03)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = 'var(--border-color)';
                          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.01)';
                        }}
                      >
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255, 255, 255, 0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
                          <FolderIcon size={18} />
                        </div>
                        <div>
                          <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                            Choose Folder Directory
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            Select your developer workspace directory
                          </div>
                        </div>
                      </button>
                    ) : (
                      <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        <div>
                          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
                            Selected Folder Path
                          </div>
                          <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', padding: '10px 14px', borderRadius: '8px', color: 'var(--text-secondary)', fontSize: '0.8rem', wordBreak: 'break-all' }}>
                            {newFolderPath}
                          </div>
                        </div>

                        <div>
                          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
                            Workspace Name (Derived)
                          </div>
                          <input
                            type="text"
                            value={newWorkspaceName}
                            onChange={(e) => setNewWorkspaceName(e.target.value)}
                            style={{
                              width: '100%',
                              padding: '8px 12px',
                              borderRadius: '6px',
                              border: '1px solid var(--border-color)',
                              background: 'var(--bg-primary)',
                              color: 'var(--text-primary)',
                              fontSize: '0.85rem',
                              outline: 'none',
                            }}
                          />
                        </div>

                        <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                          <button
                            onClick={() => setNewFolderPath('')}
                            className="btn btn-secondary"
                            style={{ flex: 1, padding: '8px' }}
                          >
                            Change Folder
                          </button>
                          <button
                            onClick={handleAddWorkspaceConfirm}
                            className="btn btn-primary"
                            style={{ flex: 1, padding: '8px' }}
                            disabled={saving}
                          >
                            {saving ? 'Adding...' : 'Add & Activate Workspace'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* DEVELOPER TAB */}
            {activeTab === 'developer' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', height: '100%' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
                    Configuration File Location
                  </label>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <div style={{ flex: 1, background: 'var(--bg-primary)', border: '1px solid var(--border-color)', padding: '8px 12px', borderRadius: '6px', fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {configFilePath}
                    </div>
                    <button
                      onClick={handleCopyPath}
                      className="btn btn-secondary"
                      style={{ padding: '8px 12px', fontSize: '0.8rem', whiteSpace: 'nowrap' }}
                    >
                      {copied ? 'Copied!' : 'Copy Path'}
                    </button>
                    <button
                      onClick={handleOpenConfigInEditor}
                      className="btn btn-secondary"
                      style={{ padding: '8px 12px', fontSize: '0.8rem', whiteSpace: 'nowrap' }}
                    >
                      Open in {defaultEditor === 'zed' ? 'Zed' : 'VS Code'}
                    </button>
                  </div>
                </div>

                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
                    Raw config.json
                  </label>
                  <textarea
                    value={rawConfigText}
                    onChange={(e) => setRawConfigText(e.target.value)}
                    style={{
                      flex: 1,
                      width: '100%',
                      minHeight: '180px',
                      background: 'var(--bg-primary)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '6px',
                      padding: '12px',
                      color: 'var(--text-primary)',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.8rem',
                      outline: 'none',
                      resize: 'none',
                    }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                  <button
                    onClick={handleSaveRawConfig}
                    className="btn btn-primary"
                    style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                    disabled={saving}
                  >
                    {saving ? 'Saving...' : 'Save Configuration JSON'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        {(activeTab === 'general' || activeTab === 'appearance') && (
          <div
            className="modal-footer"
            style={{
              padding: '16px 24px',
              borderTop: '1px solid var(--border-color)',
              background: 'var(--bg-primary)',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '12px',
            }}
          >
            <button onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button onClick={handleSaveGeneral} className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
