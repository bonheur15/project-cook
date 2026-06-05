import React, { useEffect, useState, useRef } from 'react';
import { GetProcessLogs, GetProcessRunning, KillProcess, StartProcess } from '../../wailsjs/go/main/App';
import { EventsOn, EventsOff } from '../../wailsjs/runtime/runtime';

interface TerminalViewProps {
  projectId: string;
  terminalId: string;
  command: string;
  dir: string;
  onStateChange?: (running: boolean) => void;
}

export const TerminalView: React.FC<TerminalViewProps> = ({
  projectId,
  terminalId,
  command,
  dir,
  onStateChange,
}) => {
  const [logs, setLogs] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const logEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState<boolean>(true);

  // Load existing logs and check status
  useEffect(() => {
    let active = true;

    const init = async () => {
      try {
        const running = await GetProcessRunning(projectId, terminalId);
        if (active) {
          setIsRunning(running);
          if (onStateChange) onStateChange(running);
        }

        const initialLogs = await GetProcessLogs(projectId, terminalId);
        if (active) {
          setLogs(initialLogs);
        }
      } catch (err) {
        console.error('Failed to init terminal status', err);
      }
    };

    init();

    // Listen to real-time events
    const onOutput = (data: any) => {
      if (data.projectId === projectId && data.terminalId === terminalId) {
        setLogs((prev) => [...prev, data.text]);
      }
    };

    const onStarted = (data: any) => {
      if (data.projectId === projectId && data.terminalId === terminalId) {
        setIsRunning(true);
        if (onStateChange) onStateChange(true);
        setLogs((prev) => [...prev, `[System] Process started: ${command}`]);
      }
    };

    const onExited = (data: any) => {
      if (data.projectId === projectId && data.terminalId === terminalId) {
        setIsRunning(false);
        if (onStateChange) onStateChange(false);
        setLogs((prev) => [...prev, `[System] Process exited with code: ${data.exitCode}`]);
      }
    };

    EventsOn('process-output', onOutput);
    EventsOn('process-started', onStarted);
    EventsOn('process-exited', onExited);

    return () => {
      active = false;
      EventsOff('process-output');
      EventsOff('process-started');
      EventsOff('process-exited');
    };
  }, [projectId, terminalId, command]);

  // Handle scroll behavior
  useEffect(() => {
    if (autoScroll && logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, autoScroll]);

  const handleScroll = () => {
    if (!containerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    // If user scrolled up, disable autoscroll. If scrolled to bottom, enable.
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 30;
    setAutoScroll(isAtBottom);
  };

  const handleStop = async () => {
    try {
      await KillProcess(projectId, terminalId);
    } catch (err) {
      console.error('Failed to stop process', err);
      setLogs((prev) => [...prev, `[System] Error stopping process: ${err}`]);
    }
  };

  const handleRestart = async () => {
    try {
      setLogs([]);
      await KillProcess(projectId, terminalId).catch(() => {}); // ignore error if not running
      await StartProcess(command, dir, projectId, terminalId);
    } catch (err) {
      console.error('Failed to restart process', err);
      setLogs((prev) => [...prev, `[System] Error starting process: ${err}`]);
    }
  };

  const handleClear = () => {
    setLogs([]);
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        background: '#040711',
        borderRadius: '8px',
        border: '1px solid var(--border-color)',
        overflow: 'hidden',
      }}
    >
      {/* Header Panel */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 16px',
          background: 'var(--bg-secondary)',
          borderBottom: '1px solid var(--border-color)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: isRunning ? 'var(--accent-green)' : 'var(--text-muted)',
              boxShadow: isRunning ? '0 0 8px var(--accent-green)' : 'none',
            }}
          />
          <span style={{ fontFamily: 'var(--font-sans)', fontWeight: 500, fontSize: '0.9rem' }}>
            Terminal: {terminalId}
          </span>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontFamily: 'var(--font-mono)' }}>
            ({command})
          </span>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {isRunning ? (
            <button className="btn btn-secondary" onClick={handleStop} style={{ padding: '4px 10px', fontSize: '0.8rem', color: 'var(--accent-rose)' }}>
              Stop
            </button>
          ) : (
            <button className="btn btn-primary" onClick={handleRestart} style={{ padding: '4px 10px', fontSize: '0.8rem' }}>
              Run
            </button>
          )}
          <button className="btn btn-secondary" onClick={handleClear} style={{ padding: '4px 10px', fontSize: '0.8rem' }}>
            Clear
          </button>
        </div>
      </div>

      {/* Terminal Output */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        style={{
          flex: 1,
          padding: '16px',
          overflowY: 'auto',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.85rem',
          lineHeight: '1.6',
          textAlign: 'left',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-all',
        }}
      >
        {logs.length === 0 && (
          <div style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>
            No output logs. Click Run to start this command.
          </div>
        )}
        {logs.map((log, index) => {
          let color = 'var(--text-primary)';
          if (log.startsWith('[System]')) {
            color = 'var(--accent-blue)';
          } else if (log.includes('error') || log.includes('Error') || log.includes('Exception') || log.includes('failed')) {
            color = 'var(--accent-rose)';
          } else if (log.includes('warn') || log.includes('Warn') || log.includes('Warning')) {
            color = 'var(--accent-amber)';
          } else if (log.includes('success') || log.includes('Success') || log.includes('successfully')) {
            color = 'var(--accent-green)';
          }
          return (
            <div key={index} style={{ color }}>
              {log}
            </div>
          );
        })}
        <div ref={logEndRef} />
      </div>
    </div>
  );
};
