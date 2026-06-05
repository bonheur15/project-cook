package backend

import (
	"bufio"
	"context"
	"fmt"
	"io"
	"os/exec"
	"sync"
	"syscall"

	"github.com/wailsapp/wails/v2/pkg/runtime"
)

type ProcessInfo struct {
	Command   string   `json:"command"`
	Directory string   `json:"directory"`
	Running   bool     `json:"running"`
	Logs      []string `json:"logs"`
}

type ProcessManager struct {
	mu        sync.Mutex
	processes map[string]*exec.Cmd
	info      map[string]*ProcessInfo
	logsMu    sync.RWMutex
}

func NewProcessManager() *ProcessManager {
	return &ProcessManager{
		processes: make(map[string]*exec.Cmd),
		info:      make(map[string]*ProcessInfo),
	}
}

func (pm *ProcessManager) GetProcessKey(projectId, terminalId string) string {
	return fmt.Sprintf("%s::%s", projectId, terminalId)
}

func (pm *ProcessManager) GetProcessInfo(projectId, terminalId string) *ProcessInfo {
	pm.logsMu.RLock()
	defer pm.logsMu.RUnlock()
	key := pm.GetProcessKey(projectId, terminalId)
	if info, ok := pm.info[key]; ok {
		return info
	}
	return &ProcessInfo{Running: false, Logs: []string{}}
}

func (pm *ProcessManager) Start(ctx context.Context, shell, cmdStr, dir, projectId, terminalId string) error {
	pm.mu.Lock()
	key := pm.GetProcessKey(projectId, terminalId)

	// Check if already running
	if cmd, ok := pm.processes[key]; ok && cmd.Process != nil {
		// Try to see if it's already finished
		if err := cmd.Process.Signal(syscall.Signal(0)); err == nil {
			pm.mu.Unlock()
			return fmt.Errorf("process is already running")
		}
	}

	// Create command
	var cmd *exec.Cmd
	if shell == "" {
		shell = "bash"
	}
	cmd = exec.Command(shell, "-c", cmdStr)
	cmd.Dir = dir

	// Set process group so we can kill child processes too
	cmd.SysProcAttr = &syscall.SysProcAttr{Setpgid: true}

	stdoutPipe, err := cmd.StdoutPipe()
	if err != nil {
		pm.mu.Unlock()
		return err
	}
	stderrPipe, err := cmd.StderrPipe()
	if err != nil {
		pm.mu.Unlock()
		return err
	}

	if err := cmd.Start(); err != nil {
		pm.mu.Unlock()
		return err
	}

	// Save process info
	pm.processes[key] = cmd
	pm.logsMu.Lock()
	pm.info[key] = &ProcessInfo{
		Command:   cmdStr,
		Directory: dir,
		Running:   true,
		Logs:      []string{},
	}
	pm.logsMu.Unlock()
	pm.mu.Unlock()

	// Notify start
	runtime.EventsEmit(ctx, "process-started", map[string]interface{}{
		"projectId":  projectId,
		"terminalId": terminalId,
	})

	// Stream stdout & stderr
	var wg sync.WaitGroup
	wg.Add(2)

	streamOutput := func(r io.Reader, isStderr bool) {
		defer wg.Done()
		scanner := bufio.NewScanner(r)
		for scanner.Scan() {
			text := scanner.Text()
			pm.appendLog(key, text)

			// Emit event to frontend
			runtime.EventsEmit(ctx, "process-output", map[string]interface{}{
				"projectId":  projectId,
				"terminalId": terminalId,
				"text":       text,
				"isStderr":   isStderr,
			})
		}
	}

	go streamOutput(stdoutPipe, false)
	go streamOutput(stderrPipe, true)

	// Wait for process to exit in a goroutine
	go func() {
		wg.Wait()
		exitCode := 0
		err := cmd.Wait()
		if err != nil {
			if exitError, ok := err.(*exec.ExitError); ok {
				ws := exitError.Sys().(syscall.WaitStatus)
				exitCode = ws.ExitStatus()
			} else {
				exitCode = -1
			}
		}

		pm.mu.Lock()
		delete(pm.processes, key)
		pm.logsMu.Lock()
		if info, ok := pm.info[key]; ok {
			info.Running = false
		}
		pm.logsMu.Unlock()
		pm.mu.Unlock()

		runtime.EventsEmit(ctx, "process-exited", map[string]interface{}{
			"projectId":  projectId,
			"terminalId": terminalId,
			"exitCode":   exitCode,
		})
	}()

	return nil
}

func (pm *ProcessManager) Kill(projectId, terminalId string) error {
	pm.mu.Lock()
	defer pm.mu.Unlock()

	key := pm.GetProcessKey(projectId, terminalId)
	cmd, ok := pm.processes[key]
	if !ok || cmd.Process == nil {
		return fmt.Errorf("no process running for %s", key)
	}

	// Kill process group (negative PID kills the group)
	pgid, err := syscall.Getpgid(cmd.Process.Pid)
	if err == nil {
		err = syscall.Kill(-pgid, syscall.SIGKILL)
	} else {
		err = cmd.Process.Kill()
	}

	return err
}

func (pm *ProcessManager) appendLog(key string, text string) {
	pm.logsMu.Lock()
	defer pm.logsMu.Unlock()
	if info, ok := pm.info[key]; ok {
		info.Logs = append(info.Logs, text)
		// Cap logs at 1000 lines
		if len(info.Logs) > 1000 {
			info.Logs = info.Logs[len(info.Logs)-1000:]
		}
	}
}
