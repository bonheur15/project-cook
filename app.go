package main

import (
	"context"
	"os"
	"project-cook/backend"
	"time"

	"github.com/wailsapp/wails/v2/pkg/runtime"
)

type App struct {
	ctx            context.Context
	configManager  *backend.ConfigManager
	scanner        *backend.WorkspaceScanner
	processManager *backend.ProcessManager
	launcher       *backend.Launcher
	searchEngine   *backend.SearchEngine
}

func NewApp() *App {
	return &App{
		configManager:  backend.NewConfigManager(),
		scanner:        backend.NewWorkspaceScanner(),
		processManager: backend.NewProcessManager(),
		launcher:       backend.NewLauncher(),
		searchEngine:   backend.NewSearchEngine(),
	}
}

func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
	
	// Dynamically size window to 85% of primary screen size
	screens, err := runtime.ScreenGetAll(ctx)
	if err == nil && len(screens) > 0 {
		var primaryScreen runtime.Screen
		for _, s := range screens {
			if s.IsPrimary {
				primaryScreen = s
				break
			}
		}
		if primaryScreen.Width == 0 {
			primaryScreen = screens[0]
		}
		
		// Set width/height to 97% of the monitor dimensions
		w := int(float64(primaryScreen.Width) * 0.97)
		h := int(float64(primaryScreen.Height) * 0.97)
		runtime.WindowSetSize(ctx, w, h)
	}
	
	go func() {
		time.Sleep(100 * time.Millisecond)
		runtime.WindowCenter(ctx)
	}()
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

func (a *App) SelectDirectory() (string, error) {
	return runtime.OpenDirectoryDialog(a.ctx, runtime.OpenDialogOptions{
		Title: "Select Workspace Folder",
	})
}

func (a *App) SearchWorkspace(workspacePath string, query string, searchType string) ([]backend.SearchResult, error) {
	return a.searchEngine.Search(workspacePath, query, searchType)
}

func (a *App) GetConfigPath() string {
	return a.configManager.GetFilePath()
}

func (a *App) ReadConfigFile() (string, error) {
	path := a.configManager.GetFilePath()
	data, err := os.ReadFile(path)
	if err != nil {
		return "", err
	}
	return string(data), nil
}

func (a *App) WriteConfigFile(content string) error {
	path := a.configManager.GetFilePath()
	return os.WriteFile(path, []byte(content), 0644)
}

