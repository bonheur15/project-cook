package backend

import (
	"encoding/json"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
)

type AutoCookTask struct {
	Name      string `json:"name"`
	Command   string `json:"command"`
	RunOnOpen bool   `json:"runOnOpen"`
	Safe      bool   `json:"safe"`
}

type AutoCookTool struct {
	Name    string `json:"name"`
	Command string `json:"command"`
	Icon    string `json:"icon"`
}

type AutoCookPort struct {
	Name     string `json:"name"`
	Port     int    `json:"port"`
	OpenPath string `json:"openPath"`
}

type AutoCookConfig struct {
	Name        string         `json:"name"`
	Version     int            `json:"version"`
	Description string         `json:"description"`
	Tasks       []AutoCookTask `json:"tasks"`
	Tools       []AutoCookTool `json:"tools"`
	Ports       []AutoCookPort `json:"ports"`
}

type Project struct {
	Name         string            `json:"name"`
	Path         string            `json:"path"`
	LangStack    []string          `json:"langStack"`
	Frameworks   []string          `json:"frameworks"`
	GitBranch    string            `json:"gitBranch"`
	GitChanges   int               `json:"gitChanges"`
	LastOpened   int64             `json:"lastOpened"`
	Scripts      map[string]string `json:"scripts"`
	HasAutoCook  bool              `json:"hasAutoCook"`
	AutoCookData *AutoCookConfig   `json:"autoCookData"`
}

type WorkspaceScanner struct{}

func NewWorkspaceScanner() *WorkspaceScanner {
	return &WorkspaceScanner{}
}

func (s *WorkspaceScanner) Scan(workspacePath string) ([]Project, error) {
	entries, err := os.ReadDir(workspacePath)
	if err != nil {
		return nil, err
	}

	var projects []Project

	for _, entry := range entries {
		if !entry.IsDir() {
			continue
		}

		name := entry.Name()
		// Skip hidden folders
		if strings.HasPrefix(name, ".") {
			continue
		}

		// Skip common dependency / build folders
		ignored := map[string]bool{
			"node_modules": true,
			"vendor":       true,
			"dist":         true,
			"build":        true,
			"target":       true,
			"venv":         true,
			".venv":        true,
		}
		if ignored[name] {
			continue
		}

		projPath := filepath.Join(workspacePath, name)
		proj, ok := s.detectProject(projPath)
		if ok {
			projects = append(projects, proj)
		}
	}

	return projects, nil
}

func (s *WorkspaceScanner) detectProject(path string) (Project, bool) {
	proj := Project{
		Name:       filepath.Base(path),
		Path:       path,
		LangStack:  []string{},
		Frameworks: []string{},
		Scripts:    make(map[string]string),
	}

	// 1. Detect Stack files
	files, err := os.ReadDir(path)
	if err != nil {
		return proj, false
	}

	hasPackageJson := false
	hasGoMod := false
	hasCargoToml := false
	hasComposerJson := false
	hasRequirementsTxt := false
	hasPyProjectToml := false
	hasDockerfile := false
	hasDockerCompose := false
	hasMakefile := false

	for _, f := range files {
		if f.IsDir() {
			continue
		}
		fname := f.Name()
		switch fname {
		case "package.json":
			hasPackageJson = true
		case "go.mod":
			hasGoMod = true
		case "Cargo.toml":
			hasCargoToml = true
		case "composer.json":
			hasComposerJson = true
		case "requirements.txt":
			hasRequirementsTxt = true
		case "pyproject.toml":
			hasPyProjectToml = true
		case "Dockerfile":
			hasDockerfile = true
		case "docker-compose.yml", "docker-compose.yaml":
			hasDockerCompose = true
		case "Makefile":
			hasMakefile = true
		case "auto-cook.json":
			proj.HasAutoCook = true
		}
	}

	// Read auto-cook.json if exists
	if proj.HasAutoCook {
		cookData, err := os.ReadFile(filepath.Join(path, "auto-cook.json"))
		if err == nil {
			var config AutoCookConfig
			if err := json.Unmarshal(cookData, &config); err == nil {
				proj.AutoCookData = &config
				if config.Name != "" {
					proj.Name = config.Name
				}
			}
		}
	}

	// 2. Language & Framework Detection
	if hasPackageJson {
		proj.LangStack = append(proj.LangStack, "Node.js")
		s.parsePackageJson(path, &proj)
	}
	if hasGoMod {
		proj.LangStack = append(proj.LangStack, "Go")
		proj.Scripts["go run"] = "go run ."
		proj.Scripts["go test"] = "go test ./..."
		proj.Scripts["go build"] = "go build ."
	}
	if hasCargoToml {
		proj.LangStack = append(proj.LangStack, "Rust")
		proj.Scripts["cargo run"] = "cargo run"
		proj.Scripts["cargo test"] = "cargo test"
		proj.Scripts["cargo build"] = "cargo build"
	}
	if hasComposerJson {
		proj.LangStack = append(proj.LangStack, "PHP")
	}
	if hasRequirementsTxt || hasPyProjectToml {
		proj.LangStack = append(proj.LangStack, "Python")
	}
	if hasDockerfile || hasDockerCompose {
		proj.LangStack = append(proj.LangStack, "Docker")
		if hasDockerCompose {
			proj.Scripts["docker up"] = "docker compose up -d"
			proj.Scripts["docker down"] = "docker compose down"
		}
	}
	if hasMakefile {
		s.parseMakefile(path, &proj)
	}

	// Default to Folder icon / Unknown stack if empty
	if len(proj.LangStack) == 0 {
		proj.LangStack = append(proj.LangStack, "Folder")
	}

	// 3. Git integration
	if _, err := os.Stat(filepath.Join(path, ".git")); err == nil {
		s.fillGitInfo(&proj)
	}

	// Get last opened time (from folder modification time for now)
	if info, err := os.Stat(path); err == nil {
		proj.LastOpened = info.ModTime().Unix()
	}

	return proj, true
}

func (s *WorkspaceScanner) parsePackageJson(projPath string, proj *Project) {
	pkgPath := filepath.Join(projPath, "package.json")
	data, err := os.ReadFile(pkgPath)
	if err != nil {
		return
	}

	var pkg struct {
		Name            string            `json:"name"`
		Scripts         map[string]string `json:"scripts"`
		Dependencies    map[string]string `json:"dependencies"`
		DevDependencies map[string]string `json:"devDependencies"`
	}

	if err := json.Unmarshal(data, &pkg); err != nil {
		return
	}

	if pkg.Name != "" && proj.Name == filepath.Base(projPath) {
		proj.Name = pkg.Name
	}

	// Add package scripts
	for name, cmd := range pkg.Scripts {
		proj.Scripts[name] = cmd
	}

	// Detect frameworks
	frameworks := []string{}
	allDeps := make(map[string]bool)
	for dep := range pkg.Dependencies {
		allDeps[dep] = true
	}
	for dep := range pkg.DevDependencies {
		allDeps[dep] = true
	}

	frameworkMap := map[string]string{
		"next":    "Next.js",
		"react":   "React",
		"vue":     "Vue",
		"svelte":  "Svelte",
		"express": "Express",
		"nest":    "NestJS",
		"vite":    "Vite",
	}

	for dep := range allDeps {
		for key, label := range frameworkMap {
			if strings.Contains(strings.ToLower(dep), key) {
				// Avoid duplicate React / Next.js
				alreadyHas := false
				for _, fw := range frameworks {
					if fw == label {
						alreadyHas = true
						break
					}
				}
				if !alreadyHas {
					frameworks = append(frameworks, label)
				}
			}
		}
	}

	proj.Frameworks = frameworks
}

func (s *WorkspaceScanner) parseMakefile(projPath string, proj *Project) {
	makePath := filepath.Join(projPath, "Makefile")
	data, err := os.ReadFile(makePath)
	if err != nil {
		return
	}

	lines := strings.Split(string(data), "\n")
	for _, line := range lines {
		line = strings.TrimSpace(line)
		if strings.HasSuffix(line, ":") && !strings.HasPrefix(line, ".") && !strings.Contains(line, "=") {
			target := strings.TrimSuffix(line, ":")
			if target != "" && target != "all" {
				proj.Scripts["make "+target] = "make " + target
			}
		}
	}
}

func (s *WorkspaceScanner) fillGitInfo(proj *Project) {
	// 1. Get branch name
	cmdBranch := exec.Command("git", "rev-parse", "--abbrev-ref", "HEAD")
	cmdBranch.Dir = proj.Path
	if out, err := cmdBranch.Output(); err == nil {
		proj.GitBranch = strings.TrimSpace(string(out))
	}

	// 2. Get uncommitted change count
	cmdStatus := exec.Command("git", "status", "--porcelain")
	cmdStatus.Dir = proj.Path
	if out, err := cmdStatus.Output(); err == nil {
		lines := strings.Split(strings.TrimSpace(string(out)), "\n")
		count := 0
		for _, line := range lines {
			if strings.TrimSpace(line) != "" {
				count++
			}
		}
		proj.GitChanges = count
	}
}
