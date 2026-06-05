import React from 'react';
import { WarningIcon, ShieldIcon } from './Icons';

interface SafeModeModalProps {
  isOpen: boolean;
  command: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const SafeModeModal: React.FC<SafeModeModalProps> = ({
  isOpen,
  command,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  const isDangerous = (cmd: string) => {
    const dangerousKeywords = [
      'rm -rf',
      'sudo',
      'chmod -R',
      'chown -R',
      'curl',
      'wget',
      'dd if',
      'mkfs',
      'ssh-key',
      'id_rsa',
    ];
    return dangerousKeywords.some((keyword) => cmd.includes(keyword));
  };

  const danger = isDangerous(command);

  return (
    <div className="modal-overlay">
      <div className="modal-content animate-slide" style={{ borderTop: danger ? '4px solid var(--accent-rose)' : '4px solid var(--accent-amber)' }}>
        <div className="modal-header">
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {danger ? (
              <>
                <WarningIcon size={20} style={{ color: 'var(--accent-rose)' }} />
                Dangerous Command Warning
              </>
            ) : (
              <>
                <ShieldIcon size={20} style={{ color: 'var(--accent-amber)' }} />
                Review Command Before Run
              </>
            )}
          </h3>
          <button className="btn-text" onClick={onCancel} style={{ fontSize: '1.2rem' }}>×</button>
        </div>
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <p style={{ color: 'var(--text-secondary)', lineHeight: '1.5' }}>
            {danger
              ? 'Warning: This command contains patterns that might delete or modify important files. Please verify carefully.'
              : 'Safe Mode is enabled. Please confirm you want to run this command in your project workspace.'}
          </p>
          <div
            style={{
              background: 'var(--bg-primary)',
              padding: '16px',
              borderRadius: '8px',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.9rem',
              color: danger ? 'var(--accent-rose)' : 'var(--accent-blue)',
              wordBreak: 'break-all',
              border: danger ? '1px solid rgba(248, 113, 113, 0.2)' : '1px solid rgba(56, 189, 248, 0.1)',
            }}
          >
            $ {command}
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onCancel}>
            Cancel / Block
          </button>
          <button
            className={`btn ${danger ? 'btn-danger' : 'btn-primary'}`}
            onClick={onConfirm}
          >
            {danger ? 'Run Anyway' : 'Allow Execution'}
          </button>
        </div>
      </div>
    </div>
  );
};
