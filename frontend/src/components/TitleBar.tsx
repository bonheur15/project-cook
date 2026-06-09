import React, { useState } from 'react';
import { WindowMinimise, WindowToggleMaximise, Quit } from '../../wailsjs/runtime/runtime';
import { MinimizeIcon, MaximizeIcon, CloseIcon, CodeIcon, SettingsIcon } from './Icons';

export const TitleBar: React.FC = () => {
  const [expanded, setExpanded] = useState<boolean>(false);

  const handleMinimize = () => {
    WindowMinimise();
  };

  const handleMaximize = () => {
    WindowToggleMaximise();
  };

  const handleClose = () => {
    Quit();
  };

  return (
    <>
      {/* Invisible hover trigger zone for TitleBar at the top edge */}
      <div
        onMouseEnter={() => setExpanded(true)}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: '12px',
          zIndex: 499,
          background: 'transparent',
        }}
      />

      {/* Floating TitleBar */}
      <div
        onMouseEnter={() => setExpanded(true)}
        onMouseLeave={() => setExpanded(false)}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '38px',
          background: 'var(--bg-secondary)',
          borderBottom: '1px solid var(--border-color)',
          padding: '0 12px',
          userSelect: 'none',
          zIndex: 500,
          transform: expanded ? 'translateY(0)' : 'translateY(-38px)',
          transition: 'transform var(--transition-normal)',
          boxShadow: expanded ? '0 10px 30px rgba(0,0,0,0.5)' : 'none',
          // Make this element draggable in Wails frameless window
          // @ts-ignore
          '--wails-draggable': 'drag',
        } as React.CSSProperties}
      >
        {/* Left logo & title */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: 'var(--accent-blue)',
            fontWeight: 600,
            fontSize: '0.85rem',
          }}
        >
          <CodeIcon size={16} />
          <span style={{ color: 'var(--text-primary)', letterSpacing: '0.02em' }}>FORGEHUB</span>
        </div>

        {/* Center spacer - acts as drag handle */}
        <div style={{ flex: 1, height: '100%' }} />

        {/* Settings gear & window controls */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            // @ts-ignore
            '--wails-draggable': 'no-drag',
          } as React.CSSProperties}
        >
          {/* Settings button widget (Card-style button) */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              marginRight: '12px',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid var(--border-color)',
              borderRadius: '6px',
              padding: '2px',
            }}
          >
            <button
              onClick={() => window.dispatchEvent(new Event('open-settings'))}
              title="Open Settings"
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                padding: '4px 8px',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                outline: 'none',
                transition: 'color var(--transition-fast)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'var(--accent-blue)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--text-muted)';
              }}
            >
              <SettingsIcon size={14} />
            </button>
          </div>

          {/* Window control buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
            <button
              onClick={handleMinimize}
              title="Minimize"
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                padding: '6px 10px',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                outline: 'none',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                e.currentTarget.style.color = 'var(--text-primary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = 'var(--text-muted)';
              }}
            >
              <MinimizeIcon size={12} />
            </button>

            <button
              onClick={handleMaximize}
              title="Maximize"
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                padding: '6px 10px',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                outline: 'none',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                e.currentTarget.style.color = 'var(--text-primary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = 'var(--text-muted)';
              }}
            >
              <MaximizeIcon size={12} />
            </button>

            <button
              onClick={handleClose}
              title="Close"
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                padding: '6px 10px',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                outline: 'none',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)';
                e.currentTarget.style.color = 'var(--accent-rose)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = 'var(--text-muted)';
              }}
            >
              <CloseIcon size={12} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
