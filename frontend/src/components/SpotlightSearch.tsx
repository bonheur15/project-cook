import React, { useState, useEffect, useRef } from 'react';
import { SearchWorkspace, OpenInEditor } from '../../wailsjs/go/main/App';
import { backend } from '../../wailsjs/go/models';
import { SearchIcon, FolderIcon, FileIcon, CodeIcon } from './Icons';

interface SpotlightSearchProps {
  isOpen: boolean;
  onClose: () => void;
  activeWorkspace: string;
  projects: backend.Project[];
  onOpenProject: (project: backend.Project) => void;
  defaultEditor: string;
  initialQuery?: string;
}

type SearchMode = 'projects' | 'files' | 'content';

export const SpotlightSearch: React.FC<SpotlightSearchProps> = ({
  isOpen,
  onClose,
  activeWorkspace,
  projects,
  onOpenProject,
  defaultEditor,
  initialQuery = '',
}) => {
  const [query, setQuery] = useState<string>('');
  const [mode, setMode] = useState<SearchMode>('projects');
  const [results, setResults] = useState<backend.SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const resultsContainerRef = useRef<HTMLDivElement>(null);

  // Reset search when opening
  useEffect(() => {
    if (isOpen) {
      const initQ = initialQuery || '';
      setQuery(initQ);
      setResults([]);
      setSelectedIndex(0);
      setMode('projects');
      
      // Auto-focus search input
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          // Move cursor to end of text
          inputRef.current.setSelectionRange(initQ.length, initQ.length);
        }
      }, 50);

      // Perform initial search
      handleSearch(initQ, 'projects');
    }
  }, [isOpen, initialQuery]);

  // Handle keydown events on window
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (results.length > 0 ? (prev + 1) % results.length : 0));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (results.length > 0 ? (prev - 1 + results.length) % results.length : 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (results.length > 0) {
          handleSelectResult(results[selectedIndex]);
        }
      } else if (e.key === 'Tab') {
        e.preventDefault();
        // Cycle modes
        const modes: SearchMode[] = ['projects', 'files', 'content'];
        const nextIdx = (modes.indexOf(mode) + (e.shiftKey ? -1 : 1) + modes.length) % modes.length;
        const nextMode = modes[nextIdx];
        setMode(nextMode);
        setSelectedIndex(0);
        handleSearch(query, nextMode);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, results, selectedIndex, mode, query]);

  // Adjust scroll position of selected item
  useEffect(() => {
    const selectedElement = resultsContainerRef.current?.children[selectedIndex] as HTMLElement;
    if (selectedElement && resultsContainerRef.current) {
      const container = resultsContainerRef.current;
      const elementTop = selectedElement.offsetTop;
      const elementHeight = selectedElement.offsetHeight;
      const containerScrollTop = container.scrollTop;
      const containerHeight = container.clientHeight;

      if (elementTop < containerScrollTop) {
        container.scrollTop = elementTop;
      } else if (elementTop + elementHeight > containerScrollTop + containerHeight) {
        container.scrollTop = elementTop + elementHeight - containerHeight;
      }
    }
  }, [selectedIndex]);

  // Debounced search trigger
  const searchTimeoutRef = useRef<any>(null);
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setSelectedIndex(0);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Faster search triggers for instant feel
    searchTimeoutRef.current = setTimeout(() => {
      handleSearch(value, mode);
    }, 80);
  };

  const handleSearch = async (val: string, currentMode: SearchMode) => {
    if (!activeWorkspace) return;
    
    // Quick search logic
    setLoading(true);
    try {
      const list = await SearchWorkspace(activeWorkspace, val, currentMode);
      setResults(list || []);
    } catch (err) {
      console.error('Failed to search workspace:', err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectResult = async (res: backend.SearchResult) => {
    if (res.type === 'project') {
      // Find the project object in workspace list to launch
      const found = projects.find((p) => p.path === res.path);
      if (found) {
        onOpenProject(found);
      }
      onClose();
    } else if (res.type === 'file' || res.type === 'content') {
      try {
        // Open file in Editor. If content search match, open at line
        const targetPath = res.type === 'content' ? `${res.path}:${res.lineNumber}` : res.path;
        await OpenInEditor(defaultEditor, targetPath);
        onClose();
      } catch (err) {
        alert(`Failed to open in editor: ${err}`);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.4)',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: '120px',
        zIndex: 1000,
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        animation: 'fadeIn 0.15s ease-out',
      }}
    >
      {/* Spotlight search container */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '660px',
          maxWidth: '90vw',
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          borderRadius: '12px',
          boxShadow: 'var(--shadow-lg), 0 25px 50px -12px rgba(0,0,0,0.5)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          animation: 'slideInUp 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Search Input Box */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '16px 20px',
            borderBottom: '1px solid var(--border-color)',
          }}
        >
          <SearchIcon size={20} style={{ color: 'var(--text-muted)', marginRight: '12px' }} />
          <input
            ref={inputRef}
            type="text"
            placeholder={
              mode === 'projects'
                ? 'Search projects in this workspace...'
                : mode === 'files'
                ? 'Search files and folders...'
                : 'Search text inside files (content search)...'
            }
            value={query}
            onChange={handleInputChange}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'var(--text-primary)',
              fontSize: '1.05rem',
              fontWeight: 400,
            }}
          />
          {loading && (
            <div
              style={{
                width: '16px',
                height: '16px',
                border: '2px solid rgba(255,255,255,0.1)',
                borderTop: '2px solid var(--accent-blue)',
                borderRadius: '50%',
                animation: 'spin 0.8s linear infinite',
              }}
            />
          )}
        </div>

        {/* Search Modes Tabs */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 16px',
            background: 'var(--bg-tertiary)',
            borderBottom: '1px solid var(--border-color)',
          }}
        >
          {(['projects', 'files', 'content'] as SearchMode[]).map((m) => {
            const isActive = mode === m;
            return (
              <button
                key={m}
                type="button"
                onClick={() => {
                  setMode(m);
                  setSelectedIndex(0);
                  handleSearch(query, m);
                  inputRef.current?.focus();
                }}
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '0.8rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                  border: '1px solid',
                  borderColor: isActive ? 'var(--accent-blue)' : 'transparent',
                  background: isActive ? 'rgba(129, 199, 132, 0.08)' : 'transparent',
                  color: isActive ? 'var(--accent-blue)' : 'var(--text-secondary)',
                  transition: 'all var(--transition-fast)',
                  outline: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                {m === 'projects' && 'Projects'}
                {m === 'files' && 'Files & Folders'}
                {m === 'content' && 'File Content'}
              </button>
            );
          })}
        </div>

        {/* Results Box */}
        <div
          ref={resultsContainerRef}
          style={{
            maxHeight: '380px',
            overflowY: 'auto',
            padding: '8px',
            background: 'var(--bg-secondary)',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {results.length === 0 && !loading && (
            <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              No results found
            </div>
          )}

          {results.map((res, idx) => {
            const isSelected = selectedIndex === idx;
            return (
              <div
                key={res.path + (res.lineNumber ? `:${res.lineNumber}` : '')}
                onClick={() => handleSelectResult(res)}
                onMouseEnter={() => setSelectedIndex(idx)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  padding: '10px 14px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  background: isSelected ? 'rgba(255, 255, 255, 0.03)' : 'transparent',
                  border: isSelected ? '1px solid rgba(255, 255, 255, 0.05)' : '1px solid transparent',
                  marginBottom: '2px',
                  textAlign: 'left',
                  transition: 'background 0.1s ease',
                }}
              >
                {/* Upper row: Name & Path */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                    <div style={{ color: isSelected ? 'var(--accent-blue)' : 'var(--text-secondary)', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                      {res.type === 'project' && <CodeIcon size={16} />}
                      {res.type === 'file' && <FileIcon size={16} />}
                      {res.type === 'content' && <FileIcon size={16} />}
                    </div>
                    <span style={{ fontWeight: 500, fontSize: '0.9rem', color: 'var(--text-primary)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                      {res.name}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                      {res.relPath}
                    </span>
                  </div>

                  {/* Badges / Editor Tag */}
                  <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                    {res.type === 'project' && res.langStack && res.langStack.slice(0, 2).map((lang) => (
                      <span
                        key={lang}
                        style={{
                          fontSize: '0.65rem',
                          fontWeight: 600,
                          padding: '1px 6px',
                          borderRadius: '3px',
                          background: 'var(--bg-tertiary)',
                          color: 'var(--text-secondary)',
                        }}
                      >
                        {lang}
                      </span>
                    ))}
                    {(res.type === 'file' || res.type === 'content') && (
                      <span
                        style={{
                          fontSize: '0.65rem',
                          fontWeight: 600,
                          padding: '1px 6px',
                          borderRadius: '3px',
                          background: 'rgba(255, 255, 255, 0.04)',
                          color: 'var(--text-muted)',
                        }}
                      >
                        open in {defaultEditor}
                      </span>
                    )}
                  </div>
                </div>

                {/* Content Match Snippet row (for content search) */}
                {res.type === 'content' && (
                  <div
                    style={{
                      marginTop: '6px',
                      padding: '4px 8px',
                      background: 'rgba(0, 0, 0, 0.2)',
                      borderRadius: '4px',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.75rem',
                      color: 'var(--text-secondary)',
                      whiteSpace: 'nowrap',
                      textOverflow: 'ellipsis',
                      overflow: 'hidden',
                      borderLeft: '2px solid var(--accent-blue)',
                    }}
                  >
                    <span style={{ color: 'var(--accent-purple)', marginRight: '6px', fontWeight: 600 }}>L{res.lineNumber}:</span>
                    {res.lineText}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer shortcuts info */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '8px 16px',
            background: 'var(--bg-tertiary)',
            borderTop: '1px solid var(--border-color)',
            color: 'var(--text-muted)',
            fontSize: '0.75rem',
          }}
        >
          <div style={{ display: 'flex', gap: '12px' }}>
            <span><kbd style={{ background: 'rgba(255,255,255,0.05)', padding: '1px 4px', borderRadius: '3px', border: '1px solid rgba(255,255,255,0.08)' }}>Tab</kbd> Cycle Mode</span>
            <span><kbd style={{ background: 'rgba(255,255,255,0.05)', padding: '1px 4px', borderRadius: '3px', border: '1px solid rgba(255,255,255,0.08)' }}>↑↓</kbd> Navigate</span>
            <span><kbd style={{ background: 'rgba(255,255,255,0.05)', padding: '1px 4px', borderRadius: '3px', border: '1px solid rgba(255,255,255,0.08)' }}>Enter</kbd> Open</span>
            <span><kbd style={{ background: 'rgba(255,255,255,0.05)', padding: '1px 4px', borderRadius: '3px', border: '1px solid rgba(255,255,255,0.08)' }}>Esc</kbd> Close</span>
          </div>
          <div>{results.length} results</div>
        </div>
      </div>
    </div>
  );
};
