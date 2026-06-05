package backend

import (
	"encoding/json"
	"os"
	"path/filepath"
	"testing"
)

func TestConfigManager_LoadAndSave(t *testing.T) {
	tempDir, err := os.MkdirTemp("", "cooker-config-test")
	if err != nil {
		t.Fatalf("failed to create temp dir: %v", err)
	}
	defer os.RemoveAll(tempDir)

	filePath := filepath.Join(tempDir, "config.json")
	cm := &ConfigManager{
		filePath: filePath,
	}

	// 1. Should load default config if file doesn't exist
	cfg, err := cm.Load()
	if err != nil {
		t.Fatalf("failed to load default config: %v", err)
	}
	if cfg.Theme != "dark" || cfg.SafeMode != true {
		t.Errorf("expected default theme dark and safe mode true, got theme=%s, safeMode=%v", cfg.Theme, cfg.SafeMode)
	}

	// 2. Modify and Save
	cfg.Theme = "light"
	cfg.Workspaces = []string{"/home/user/projects"}
	err = cm.Save(cfg)
	if err != nil {
		t.Fatalf("failed to save config: %v", err)
	}

	// 3. Load again to verify
	cfg2, err := cm.Load()
	if err != nil {
		t.Fatalf("failed to reload config: %v", err)
	}
	if cfg2.Theme != "light" || len(cfg2.Workspaces) != 1 || cfg2.Workspaces[0] != "/home/user/projects" {
		t.Errorf("loaded config does not match saved config, got: %+v", cfg2)
	}
}

func TestWorkspaceScanner_Scan(t *testing.T) {
	tempDir, err := os.MkdirTemp("", "cooker-scanner-test")
	if err != nil {
		t.Fatalf("failed to create temp dir: %v", err)
	}
	defer os.RemoveAll(tempDir)

	// Create a mock NextJS project
	nextDir := filepath.Join(tempDir, "my-next-app")
	if err := os.MkdirAll(nextDir, 0755); err != nil {
		t.Fatalf("failed to create next app dir: %v", err)
	}
	pkgData := map[string]interface{}{
		"name": "my-cool-next-app",
		"dependencies": map[string]string{
			"next":  "^14.0.0",
			"react": "^18.2.0",
		},
		"scripts": map[string]string{
			"dev": "next dev",
		},
	}
	pkgBytes, _ := json.Marshal(pkgData)
	if err := os.WriteFile(filepath.Join(nextDir, "package.json"), pkgBytes, 0644); err != nil {
		t.Fatalf("failed to write package.json: %v", err)
	}

	// Create a mock Go project
	goDir := filepath.Join(tempDir, "my-go-app")
	if err := os.MkdirAll(goDir, 0755); err != nil {
		t.Fatalf("failed to create go app dir: %v", err)
	}
	if err := os.WriteFile(filepath.Join(goDir, "go.mod"), []byte("module my-go-app\n\ngo 1.21"), 0644); err != nil {
		t.Fatalf("failed to write go.mod: %v", err)
	}

	// Scan workspace
	scanner := NewWorkspaceScanner()
	projects, err := scanner.Scan(tempDir)
	if err != nil {
		t.Fatalf("failed to scan workspace: %v", err)
	}

	if len(projects) != 2 {
		t.Fatalf("expected 2 projects, got %d", len(projects))
	}

	var foundNext, foundGo bool
	for _, p := range projects {
		if p.Name == "my-cool-next-app" {
			foundNext = true
			if len(p.LangStack) == 0 || p.LangStack[0] != "Node.js" {
				t.Errorf("expected Next app lang stack to be Node.js, got %v", p.LangStack)
			}
			if len(p.Frameworks) == 0 || p.Frameworks[0] != "Next.js" {
				t.Errorf("expected Next app framework to be Next.js, got %v", p.Frameworks)
			}
			if cmd, exists := p.Scripts["dev"]; !exists || cmd != "next dev" {
				t.Errorf("expected Next app to have script dev: 'next dev', got %v", p.Scripts)
			}
		} else if p.Name == "my-go-app" {
			foundGo = true
			if len(p.LangStack) == 0 || p.LangStack[0] != "Go" {
				t.Errorf("expected Go app lang stack to be Go, got %v", p.LangStack)
			}
		}
	}

	if !foundNext {
		t.Errorf("failed to scan and detect Next.js project")
	}
	if !foundGo {
		t.Errorf("failed to scan and detect Go project")
	}
}
