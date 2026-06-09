package backend

import (
	"encoding/json"
	"os"
	"path/filepath"
	"sync"
)

type Config struct {
	Workspaces               []string `json:"workspaces"`
	DefaultEditor            string   `json:"defaultEditor"`
	DefaultTerminalShell     string   `json:"defaultTerminalShell"`
	Theme                    string   `json:"theme"`
	SafeMode                 bool     `json:"safeMode"`
	OpenLastProjectOnStartup bool     `json:"openLastProjectOnStartup"`
}

type ConfigManager struct {
	mu       sync.Mutex
	filePath string
}

func NewConfigManager() *ConfigManager {
	home, err := os.UserHomeDir()
	var configDir string
	if err != nil {
		configDir = ".project-cooker"
	} else {
		configDir = filepath.Join(home, ".project-cooker")
	}
	return &ConfigManager{
		filePath: filepath.Join(configDir, "config.json"),
	}
}

func (m *ConfigManager) GetDefaultConfig() *Config {
	return &Config{
		Workspaces:               []string{},
		DefaultEditor:            "zed", // zed or code
		DefaultTerminalShell:     "bash",
		Theme:                    "dark",
		SafeMode:                 true,
		OpenLastProjectOnStartup: false,
	}
}

func (m *ConfigManager) Load() (*Config, error) {
	m.mu.Lock()
	defer m.mu.Unlock()

	if _, err := os.Stat(m.filePath); os.IsNotExist(err) {
		defaultConfig := m.GetDefaultConfig()
		// Save it so the file is created
		m.mu.Unlock()
		err := m.Save(defaultConfig)
		m.mu.Lock()
		return defaultConfig, err
	}

	data, err := os.ReadFile(m.filePath)
	if err != nil {
		return nil, err
	}

	var cfg Config
	if err := json.Unmarshal(data, &cfg); err != nil {
		return nil, err
	}

	return &cfg, nil
}

func (m *ConfigManager) Save(cfg *Config) error {
	m.mu.Lock()
	defer m.mu.Unlock()

	dir := filepath.Dir(m.filePath)
	if err := os.MkdirAll(dir, 0755); err != nil {
		return err
	}

	data, err := json.MarshalIndent(cfg, "", "  ")
	if err != nil {
		return err
	}

	return os.WriteFile(m.filePath, data, 0644)
}
