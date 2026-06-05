package backend

import (
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"sort"
	"strings"
)

type FileItem struct {
	Name  string `json:"name"`
	Path  string `json:"path"`
	IsDir bool   `json:"isDir"`
	Size  int64  `json:"size"`
}

type Launcher struct{}

func NewLauncher() *Launcher {
	return &Launcher{}
}

func (l *Launcher) OpenInEditor(editor string, path string) error {
	var cmd *exec.Cmd
	switch strings.ToLower(editor) {
	case "zed":
		cmd = exec.Command("zed", path)
	case "code", "vscode":
		cmd = exec.Command("code", path)
	default:
		return fmt.Errorf("unsupported editor: %s", editor)
	}

	return cmd.Start()
}

func (l *Launcher) ReadDir(path string) ([]FileItem, error) {
	entries, err := os.ReadDir(path)
	if err != nil {
		return nil, err
	}

	var items []FileItem
	ignored := map[string]bool{
		"node_modules": true,
		"vendor":       true,
		".git":         true,
		"dist":         true,
		"build":        true,
		".next":        true,
		".cache":       true,
	}

	for _, entry := range entries {
		name := entry.Name()
		if ignored[name] {
			continue
		}

		fullPath := filepath.Join(path, name)
		info, err := entry.Info()
		size := int64(0)
		if err == nil {
			size = info.Size()
		}

		items = append(items, FileItem{
			Name:  name,
			Path:  fullPath,
			IsDir: entry.IsDir(),
			Size:  size,
		})
	}

	// Sort: Directories first, then files, both alphabetically
	sort.Slice(items, func(i, j int) bool {
		if items[i].IsDir && !items[j].IsDir {
			return true
		}
		if !items[i].IsDir && items[j].IsDir {
			return false
		}
		return strings.ToLower(items[i].Name) < strings.ToLower(items[j].Name)
	})

	return items, nil
}
