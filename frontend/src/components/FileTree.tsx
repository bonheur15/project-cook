import React, { useState, useEffect } from 'react';
import { ReadDir, OpenInEditor } from '../../wailsjs/go/main/App';
import { backend } from '../../wailsjs/go/models';

interface FileTreeProps {
  rootPath: string;
  defaultEditor: string;
}

export const FileTree: React.FC<FileTreeProps> = ({ rootPath, defaultEditor }) => {
  const [items, setItems] = useState<backend.FileItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRoot = async () => {
      try {
        setLoading(true);
        const data = await ReadDir(rootPath);
        setItems(data);
        setError(null);
      } catch (err: any) {
        setError(err?.message || 'Failed to read directory');
      } finally {
        setLoading(false);
      }
    };
    fetchRoot();
  }, [rootPath]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        textAlign: 'left',
        background: 'var(--bg-secondary)',
        borderRight: '1px solid var(--border-color)',
        overflowY: 'auto',
      }}
    >
      <div
        style={{
          padding: '12px 16px',
          borderBottom: '1px solid var(--border-color)',
          fontSize: '0.85rem',
          fontWeight: 600,
          color: 'var(--text-secondary)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <span>PROJECT FILES</span>
      </div>

      {loading && <div style={{ padding: '16px', color: 'var(--text-muted)' }}>Loading file tree...</div>}
      {error && <div style={{ padding: '16px', color: 'var(--accent-rose)' }}>{error}</div>}

      {!loading && !error && (
        <div style={{ padding: '8px 0' }}>
          {items.map((item) => (
            <FileTreeNode key={item.path} item={item} depth={0} defaultEditor={defaultEditor} />
          ))}
        </div>
      )}
    </div>
  );
};

interface FileTreeNodeProps {
  item: backend.FileItem;
  depth: number;
  defaultEditor: string;
}

const FileTreeNode: React.FC<FileTreeNodeProps> = ({ item, depth, defaultEditor }) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [children, setChildren] = useState<backend.FileItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [hovered, setHovered] = useState<boolean>(false);

  const handleToggle = async () => {
    if (!item.isDir) return;

    const nextState = !isExpanded;
    setIsExpanded(nextState);

    if (nextState && children.length === 0) {
      try {
        setLoading(true);
        const data = await ReadDir(item.path);
        setChildren(data);
      } catch (err) {
        console.error('Failed to load subfolder content', err);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleOpenEditor = async (editor: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await OpenInEditor(editor, item.path);
    } catch (err) {
      alert(`Error opening in ${editor}: ${err}`);
    }
  };

  return (
    <div>
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={handleToggle}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '6px 16px 6px ' + (16 + depth * 12) + 'px',
          cursor: 'pointer',
          borderRadius: '4px',
          background: hovered ? 'rgba(255,255,255,0.03)' : 'transparent',
          userSelect: 'none',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
          <span style={{ fontSize: '1rem', width: '16px', display: 'inline-block' }}>
            {item.isDir ? (isExpanded ? '📂' : '📁') : '📄'}
          </span>
          <span
            style={{
              fontSize: '0.9rem',
              color: item.isDir ? 'var(--text-primary)' : 'var(--text-secondary)',
              textOverflow: 'ellipsis',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
            }}
          >
            {item.name}
          </span>
        </div>

        {/* Action icons shown on hover */}
        {hovered && (
          <div style={{ display: 'flex', gap: '4px' }}>
            <button
              onClick={(e) => handleOpenEditor('code', e)}
              title="Open in VS Code"
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                fontSize: '0.8rem',
                padding: '2px 4px',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent-blue)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
            >
              VS
            </button>
            <button
              onClick={(e) => handleOpenEditor('zed', e)}
              title="Open in Zed"
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                fontSize: '0.8rem',
                padding: '2px 4px',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent-teal)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
            >
              ZD
            </button>
          </div>
        )}
      </div>

      {item.isDir && isExpanded && (
        <div>
          {loading && (
            <div style={{ paddingLeft: (36 + depth * 12) + 'px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
              Loading...
            </div>
          )}
          {!loading &&
            children.map((child) => (
              <FileTreeNode key={child.path} item={child} depth={depth + 1} defaultEditor={defaultEditor} />
            ))}
        </div>
      )}
    </div>
  );
};
