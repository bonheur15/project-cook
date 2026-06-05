package main

import (
	"context"
	"project-cook/backend"
)

type App struct {
	ctx            context.Context
	configManager  *backend.ConfigManager
	scanner        *backend.WorkspaceScanner
	processManager *backend.ProcessManager
	launcher       *backend.Launcher
}

func NewApp() *App {
	return &App{
		configManager:  backend.NewConfigManager(),
		scanner:        backend.NewWorkspaceScanner(),
		processManager: backend.NewProcessManager(),
		launcher:       backend.NewLauncher(),
	}
}

func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
}

func (a *App) GetConfig() (*backend.Config, error) {
	return a.configManager.Load()
}

func (a *App) SaveConfig(cfg *backend.Config) error {
	return a.configManager.Save(cfg)
}

func (a *App) ScanWorkspace(path string) ([]backend.Project, error) {
	return a.scanner.Scan(path)
}

func (a *App) StartProcess(cmdStr string, dir string, projectId string, terminalId string) error {
	cfg, err := a.configManager.Load()
	shell := "bash"
	if err == nil && cfg.DefaultTerminalShell != "" {
		shell = cfg.DefaultTerminalShell
	}
	return a.processManager.Start(a.ctx, shell, cmdStr, dir, projectId, terminalId)
}

func (a *App) KillProcess(projectId string, terminalId string) error {
	return a.processManager.Kill(projectId, terminalId)
}

func (a *App) GetProcessLogs(projectId string, terminalId string) []string {
	info := a.processManager.GetProcessInfo(projectId, terminalId)
	return info.Logs
}

func (a *App) GetProcessRunning(projectId string, terminalId string) bool {
	info := a.processManager.GetProcessInfo(projectId, terminalId)
	return info.Running
}

func (a *App) OpenInEditor(editor string, path string) error {
	return a.launcher.OpenInEditor(editor, path)
}

func (a *App) ReadDir(path string) ([]backend.FileItem, error) {
	return a.launcher.ReadDir(path)
}
