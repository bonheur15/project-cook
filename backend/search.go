package backend

import (
	"bufio"
	"bytes"
	"io"
	"os"
	"path/filepath"
	"strings"
)

type SearchResult struct {
	Type       string   `json:"type"`       // "project", "file", "content"
	Name       string   `json:"name"`       // Name of the project or file
	Path       string   `json:"path"`       // Absolute path
	RelPath    string   `json:"relPath"`    // Path relative to workspace root
	LineNumber int      `json:"lineNumber"` // Line number of match (for content mode)
	LineText   string   `json:"lineText"`   // Matching text line (for content mode)
	LangStack  []string `json:"langStack"`  // Stack badges (for project mode)
}

type SearchEngine struct {
	scanner *WorkspaceScanner
}

func NewSearchEngine() *SearchEngine {
	return &SearchEngine{
		scanner: NewWorkspaceScanner(),
	}
}

// Search coordinates the multi-mode search
func (e *SearchEngine) Search(workspacePath string, query string, searchType string) ([]SearchResult, error) {
	query = strings.ToLower(strings.TrimSpace(query))
	results := []SearchResult{}

	// Skip searching if query is empty (except for projects where we can list all)
	if query == "" && searchType != "projects" {
		return results, nil
	}

	// Exclusion directories list
	ignoredDirs := map[string]bool{
		"node_modules": true,
		"vendor":       true,
		"dist":         true,
		"build":        true,
		"target":       true,
		"venv":         true,
		".venv":        true,
		".git":         true,
		".idea":        true,
		".vscode":      true,
		"__pycache__":  true,
		".wails":       true,
	}

	switch searchType {
	case "projects":
		// Scan projects in workspace
		projects, err := e.scanner.Scan(workspacePath)
		if err != nil {
			return nil, err
		}

		for _, p := range projects {
			// If query is empty, list all. Otherwise, match name or path.
			if query == "" || strings.Contains(strings.ToLower(p.Name), query) || strings.Contains(strings.ToLower(p.Path), query) {
				results = append(results, SearchResult{
					Type:      "project",
					Name:      p.Name,
					Path:      p.Path,
					RelPath:   p.Name, // RelPath is just the folder name for projects
					LangStack: p.LangStack,
				})
			}
		}

	case "files":
		// Recursively find matching files
		err := filepath.Walk(workspacePath, func(path string, info os.FileInfo, err error) error {
			if err != nil {
				return nil // Skip error files
			}

			// Skip ignored folders
			if info.IsDir() {
				if ignoredDirs[info.Name()] {
					return filepath.SkipDir
				}
				return nil
			}

			// Match query against filename
			filename := info.Name()
			if strings.Contains(strings.ToLower(filename), query) {
				relPath, _ := filepath.Rel(workspacePath, path)
				results = append(results, SearchResult{
					Type:    "file",
					Name:    filename,
					Path:    path,
					RelPath: relPath,
				})
			}

			// Cap results at 100 for safety and speed
			if len(results) >= 100 {
				return io.EOF // Stop walk
			}

			return nil
		})

		if err != nil && err != io.EOF {
			return nil, err
		}

	case "content":
		// Scan text contents inside files recursively
		err := filepath.Walk(workspacePath, func(path string, info os.FileInfo, err error) error {
			if err != nil {
				return nil
			}

			// Skip ignored folders
			if info.IsDir() {
				if ignoredDirs[info.Name()] {
					return filepath.SkipDir
				}
				return nil
			}

			// Skip files that are too large (> 5MB)
			if info.Size() > 5*1024*1024 {
				return nil
			}

			// Open file
			file, err := os.Open(path)
			if err != nil {
				return nil
			}
			defer file.Close()

			// Check if binary file (look for null byte in first 512 bytes)
			buffer := make([]byte, 512)
			n, _ := file.Read(buffer)
			if n > 0 && bytes.Contains(buffer[:n], []byte{0}) {
				return nil // Skip binary file
			}

			// Reset reader position to beginning
			_, err = file.Seek(0, 0)
			if err != nil {
				return nil
			}

			// Scan line by line
			scanner := bufio.NewScanner(file)
			lineNum := 1
			for scanner.Scan() {
				lineText := scanner.Text()
				if strings.Contains(strings.ToLower(lineText), query) {
					relPath, _ := filepath.Rel(workspacePath, path)
					results = append(results, SearchResult{
						Type:       "content",
						Name:       info.Name(),
						Path:       path,
						RelPath:    relPath,
						LineNumber: lineNum,
						LineText:   strings.TrimSpace(lineText),
					})
				}

				if len(results) >= 100 {
					return io.EOF // Stop walk
				}
				lineNum++
			}

			return nil
		})

		if err != nil && err != io.EOF {
			return nil, err
		}
	}

	return results, nil
}
