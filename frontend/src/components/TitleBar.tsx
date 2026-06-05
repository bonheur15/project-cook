import React from 'react';
import { WindowMinimise, WindowToggleMaximise, Quit } from '../../wailsjs/runtime/runtime';
import { MinimizeIcon, MaximizeIcon, CloseIcon, CodeIcon } from './Icons';

export const TitleBar: React.FC = () => {
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
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '38px',
        background: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border-color)',
        padding: '0 12px',
        userSelect: 'none',
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
        <span style={{ color: 'var(--text-primary)', letterSpacing: '0.02em' }}>PROJECT COOKER</span>
      </div>

      {/* Center spacer - acts as drag handle */}
      <div style={{ flex: 1, height: '100%' }} />

      {/* Right controls */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '2px',
          // @ts-ignore
          '--wails-draggable': 'no-drag',
        } as React.CSSProperties}
      >
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
  );
};
