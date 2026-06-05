# Project Cooker — Developer Workspace Manager

## 1. Overview

**Project Cooker** is a fast, lightweight developer workspace manager built to bring all project tools into one clean desktop app.

Instead of opening many terminal windows, browser tabs, code editors, AI tools, Docker dashboards, Git tools, and project folders separately, Project Cooker gives the developer one place to manage everything.

The main idea is simple:

> Open Project Cooker, choose a project, and everything needed to work on that project is already there.

Project Cooker does not need to replace existing tools like Zed, VS Code, Codex, OpenCode, Docker, Git, or the browser. Instead, it connects and manages them from one simple interface.

It should feel like a **developer cockpit** or **project control room**.

---

## 2. Main Goal

The goal of Project Cooker is to make development faster, cleaner, and less stressful by giving developers:

- One app for all projects.
- One place for terminals.
- One place for project commands.
- One place for AI coding tools.
- One place for Git status.
- One place for logs.
- One place for local previews.
- One place for project notes.
- One place for running and managing services.
- One place for opening editors and external tools.

The user should not need to constantly switch between many windows and tabs.

---

## 3. Short Product Description

**Project Cooker is a fast developer workspace manager that brings your projects, terminals, commands, editors, AI tools, Git, ports, logs, and previews into one clean app.**

Another shorter version:

> One desktop app to open, run, manage, and cook all your projects.

---

## 4. Core Concept

Project Cooker works around the idea of **workspaces** and **projects**.

A **workspace** is a folder that contains many projects.

Example:

```txt
/home/user/projects
  ├── hubfly-space
  ├── api-server
  ├── landing-page
  ├── mobile-app
  └── test-playground
```

Each folder inside the workspace can be detected as a project.

Project Cooker scans those folders, detects the project type, shows them as cards, and gives fast access to everything needed for that project.

---

## 5. First-Time User Flow

When the app is opened for the first time, it should ask the user to select a workspace folder.

Example screen:

```txt
Welcome to Project Cooker

Choose your workspace folder:

[ /home/user/projects ]

Options:
[ ] Add another workspace
[ ] Watch this folder for new projects
[ ] Ignore hidden folders
[ ] Ignore common dependency folders
[ ] Open last project automatically next time

[Continue]
```

After selecting a workspace, Project Cooker saves it locally.

If the user adds only one workspace, the app opens directly to that workspace next time.

If the user adds multiple workspaces, the app shows a workspace switcher.

---

## 6. Workspace Management

A user should be able to add multiple workspaces.

Examples:

```txt
/home/user/projects
/home/user/work
/home/user/experiments
/mnt/storage/client-projects
```

Each workspace should have:

- Name.
- Folder path.
- Last opened time.
- Number of projects.
- Favorite projects.
- Ignored folders.
- Workspace-specific settings.

Example workspace card:

```txt
┌─────────────────────────────┐
│ Personal Projects            │
│ /home/user/projects          │
│ 24 projects                  │
│ Last opened: Today           │
│                              │
│ [Open] [Settings]            │
└─────────────────────────────┘
```

---

## 7. Workspace Dashboard

After opening a workspace, the user sees all projects as cards.

Each project card should show useful information quickly.

Example:

```txt
┌─────────────────────────────┐
│  🟦 hubfly-space             │
│  Go / React / Docker         │
│  Git: main • 3 changes       │
│  Last opened: 2 hours ago    │
│  Ports: 3000, 8080           │
│                              │
│  [Open] [Terminal] [Run]     │
└─────────────────────────────┘
```

The dashboard should include:

- Project cards.
- Search bar.
- Language/framework filters.
- Recent projects.
- Favorite projects.
- Running projects.
- Git status indicators.
- Project health indicators.
- Quick action buttons.

---

## 8. Project Search

Search should be instant while typing.

The user can search by:

- Project name.
- Framework.
- Language.
- Folder path.
- Git branch.
- Tags.
- Recent activity.
- Running status.

Example:

```txt
Search: "next"

Results:
- landing-next
- admin-nextjs
- client-dashboard
```

Search should be fast even with many projects.

---

## 9. Project Detection

Project Cooker should detect the type of each project by scanning common files.

Examples:

```txt
package.json        → Node.js project
go.mod              → Go project
Cargo.toml          → Rust project
composer.json       → PHP project
requirements.txt    → Python project
pyproject.toml      → Python project
pom.xml             → Java Maven project
build.gradle        → Java/Kotlin Gradle project
Dockerfile          → Docker project
docker-compose.yml  → Docker Compose project
Makefile            → Make-based project
```

For JavaScript/TypeScript projects, it should detect frameworks from `package.json`.

Examples:

```txt
next        → Next.js
vite        → Vite
react       → React
vue         → Vue
svelte      → Svelte
express     → Express
nestjs      → NestJS
```

For Go projects, it should detect:

```txt
go.mod
main.go
cmd/
internal/
```

For PHP projects, it should detect:

```txt
composer.json
artisan       → Laravel
index.php
```

For Python projects, it should detect:

```txt
requirements.txt
pyproject.toml
manage.py      → Django
app.py         → Flask/FastAPI style
```

---

## 10. Project Icons

Each project card should show an icon based on the detected stack.

Examples:

```txt
Go project          → Go icon
React project       → React icon
Next.js project     → Next.js icon
Python project      → Python icon
Docker project      → Docker icon
PHP project         → PHP icon
Database project    → Database icon
Unknown project     → Folder icon
```

If multiple stacks are detected, the card can show multiple small badges.

Example:

```txt
hubfly-space
[Go] [React] [Docker]
```

---

## 11. Project Page / Project Canvas

When the user opens a project, they enter the **Project Canvas**.

This is the main control room for that project.

Suggested layout:

```txt
┌─────────────────────────────────────────────────────────────┐
│ Project: hubfly-space       Branch: main       Status: ●    │
├───────────────┬───────────────────────────────┬─────────────┤
│ Files         │ Main Canvas                    │ Tools       │
│               │                               │             │
│ src/          │ Terminal / Logs / Preview      │ Zed         │
│ package.json  │ Commands / Git / AI Sessions   │ VS Code     │
│ go.mod        │ Services / Health              │ Codex       │
│ .env          │                               │ OpenCode    │
│ Dockerfile    │                               │ Docker      │
└───────────────┴───────────────────────────────┴─────────────┘
```

The page should feel simple, not overloaded.

The most important areas are:

- File tree.
- Main canvas.
- Tool launcher.
- Terminal tabs.
- Project actions.
- Status bar.

---

## 12. File Tree

The file tree should show project files on the side.

It should support:

- Opening folders.
- Searching files.
- Copying file path.
- Opening file in external editor.
- Showing hidden files optionally.
- Ignoring heavy folders like `node_modules`, `.git`, `vendor`, `dist`, `build`.

The file tree is not meant to replace a full code editor. It is mainly for project awareness and quick access.

Useful actions:

```txt
Right-click file:
- Open in editor
- Copy path
- Reveal in file manager
- Open terminal here
```

---

## 13. Built-In Terminal Manager

The terminal manager is one of the most important features.

Instead of opening external terminals, the user can open terminals directly inside Project Cooker.

Each project can have its own terminal sessions.

Example:

```txt
Project: hubfly-space

Terminals:
- Dev Server
- API Server
- Docker
- Git
- AI Agent
```

Terminal features:

- Create new terminal.
- Rename terminal.
- Close terminal.
- Restart terminal.
- Split terminal view.
- Open terminal in specific folder.
- Save command history per project.
- Run commands directly from buttons.
- Keep terminal sessions connected to the project.
- Show running/stopped status.
- Kill a process safely.
- Copy last command output.
- Copy last error.
- Search terminal output.

Example terminal UI:

```txt
┌──────────────────────────────────────────────┐
│ Terminal: Dev Server                         │
├──────────────────────────────────────────────┤
│ $ bun dev                                    │
│ Server running on http://localhost:3000      │
└──────────────────────────────────────────────┘
```

---

## 14. Terminal Sessions Per Project

Project Cooker should remember terminal sessions per project.

Example:

```txt
Project A:
- Terminal 1: bun dev
- Terminal 2: docker compose up
- Terminal 3: codex

Project B:
- Terminal 1: go run .
- Terminal 2: go test ./...
```

When the user leaves Project A and opens Project B, Project A's terminal list should still be remembered.

If the actual terminal process cannot stay alive after closing the project view, Project Cooker should at least remember:

- Terminal name.
- Last command.
- Last working directory.
- Last status.
- Logs.

---

## 15. Command Center

Each project should have a command center.

The command center detects useful commands from project files.

For `package.json`, it can read scripts:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "test": "vitest"
  }
}
```

Then show:

```txt
Node Commands:
[ dev ] [ build ] [ test ]
```

For Go:

```txt
Go Commands:
[ go run . ] [ go test ./... ] [ go build ]
```

For Docker Compose:

```txt
Docker Commands:
[ docker compose up ] [ docker compose down ] [ docker compose logs ]
```

For Makefile:

```txt
Make Commands:
[ make dev ] [ make build ] [ make test ]
```

Users should also be able to pin custom commands.

Example:

```txt
Pinned Commands:
[ Start App ] [ Run Tests ] [ Open DB ] [ Deploy ]
```

---

## 16. Tool Launcher

Project Cooker should have a tool launcher for opening external tools in the current project.

Examples of supported tools:

- Zed.
- VS Code.
- Codex.
- OpenCode.
- Docker.
- Git UI.
- Browser.
- Database client.
- API testing tool.
- Custom shell commands.

Example tool button:

```txt
[Open in Zed]
[Open in VS Code]
[Start Codex]
[Start OpenCode]
[Open Browser]
[Open Docker]
```

Tools should be configurable.

Example tool config:

```json
{
  "tools": {
    "zed": {
      "label": "Open in Zed",
      "command": "zed .",
      "icon": "zed"
    },
    "vscode": {
      "label": "Open in VS Code",
      "command": "code .",
      "icon": "vscode"
    },
    "codex": {
      "label": "Start Codex",
      "command": "codex",
      "icon": "ai"
    },
    "opencode": {
      "label": "Start OpenCode",
      "command": "opencode",
      "icon": "ai"
    }
  }
}
```

The user should be able to add their own tools from settings.

---

## 17. AI Tool Manager

Project Cooker should support AI coding tools without being locked to one.

Examples:

- Codex.
- OpenCode.
- Custom local AI commands.
- Any CLI-based AI coding assistant.

The user should be able to start AI tools inside the project terminal.

Example:

```txt
AI Tools:
[Start Codex]
[Start OpenCode]
[Start Planning Session]
[Start Code Review Session]
```

Possible AI session features:

- Save AI session name.
- Show which terminal belongs to which AI tool.
- Store simple session notes.
- Start in safe planning mode.
- Start in build/edit mode.
- Warn before running AI tools that can modify files.
- Show changed files after AI tool runs.
- Allow project-specific AI tool settings.

Example AI session list:

```txt
AI Sessions:
- Codex: Fix login bug
- OpenCode: Plan database refactor
- Codex: Add tests for API
```

---

## 18. `auto-cook.json`

`auto-cook.json` is a project config file that tells Project Cooker what commands, tools, services, and ports are useful for that project.

Example:

```json
{
  "name": "Hubfly Space",
  "version": 1,
  "tasks": [
    {
      "name": "Install dependencies",
      "command": "bun install",
      "runOnOpen": false
    },
    {
      "name": "Start dev server",
      "command": "bun dev",
      "runOnOpen": true,
      "safe": true
    },
    {
      "name": "Start database",
      "command": "docker compose up -d mysql",
      "runOnOpen": false
    }
  ],
  "tools": [
    {
      "name": "Open in Zed",
      "command": "zed ."
    },
    {
      "name": "Start Codex",
      "command": "codex"
    }
  ],
  "ports": [
    {
      "name": "Web App",
      "port": 3000,
      "openPath": "/"
    },
    {
      "name": "API",
      "port": 4000,
      "openPath": "/health"
    }
  ]
}
```

This file makes projects smarter.

When the user opens a project, Project Cooker can detect this file and ask what to do.

---

## 19. Safe Mode for `auto-cook.json`

Project Cooker should never blindly run commands from `auto-cook.json` the first time.

When it detects commands, it should show a review screen.

Example:

```txt
This project wants to run these commands:

1. bun install
2. bun dev
3. docker compose up -d mysql

Review before running.

[Allow once]
[Always allow for this project]
[Edit commands]
[Deny]
```

Safe mode should protect the user from dangerous commands.

Commands can be classified:

```txt
Safe:
- npm run dev
- bun dev
- go test ./...
- go run .

Medium:
- docker compose up
- npm install
- bun install
- database migrations

Dangerous:
- rm -rf
- sudo
- chmod -R
- curl | bash
- wget | sh
- deleting home folders
- reading private SSH keys
- changing global system config
```

If a command looks dangerous, Project Cooker should show a stronger warning.

Example:

```txt
Warning: This command may modify or delete important files.

Command:
rm -rf ~

[Block]
[Run anyway]
```

By default, dangerous commands should be blocked or require explicit manual approval.

---

## 20. Project Health Scanner

When a project opens, Project Cooker should scan it and show useful project health information.

Example:

```txt
Project Health

Framework: Next.js
Language: TypeScript
Package manager: Bun
Git branch: main
Git status: 3 changed files
Docker: docker-compose.yml found
Env file: .env found
Env example: missing
Ports: 3000, 4000
Build command: bun run build
Test command: bun test
Last command status: dev server running
```

Scanner checks can include:

- Stack detection.
- Framework detection.
- Package manager detection.
- Git status.
- Missing dependencies.
- Missing `.env.example`.
- Docker file detection.
- Compose service detection.
- Running port detection.
- README detection.
- Test command detection.
- Build command detection.
- Suspicious command detection.
- Large folder detection.
- Ignored folder detection.

---

## 21. Built-In Preview / Browser Panel

Project Cooker should detect local ports and allow previewing apps inside the project canvas.

Example:

```txt
Detected Ports:
3000 → Frontend
4000 → API
5173 → Vite
8080 → Admin Panel
```

Actions:

```txt
[Open inside Project Cooker]
[Open in external browser]
[Copy URL]
[Refresh]
```

If a project has `auto-cook.json`, it can define ports manually.

Example:

```json
{
  "ports": [
    {
      "name": "Frontend",
      "port": 3000,
      "openPath": "/"
    },
    {
      "name": "API Health",
      "port": 4000,
      "openPath": "/health"
    }
  ]
}
```

The preview panel should be useful for local development, especially frontend apps.

---

## 22. Port Manager

The port manager helps the user understand what is running.

It should show:

```txt
Ports

3000  Frontend     running
4000  API          running
3306  MySQL        running
6379  Redis        stopped
```

Useful actions:

```txt
[Open]
[Copy URL]
[Show process]
[Kill process]
[Change port]
```

If a port is already in use, Project Cooker should show a friendly message:

```txt
Port 3000 is already in use.

Used by:
node /home/user/projects/old-app

Actions:
[Show process]
[Kill process]
[Use another port]
```

---

## 23. Logs Panel

Every command that runs inside Project Cooker should have logs.

Logs should be attached to the project.

Example:

```txt
Logs:
- dev-server.log
- build.log
- test.log
- docker.log
- codex-session.log
```

Log features:

- Search logs.
- Copy error.
- Download log.
- Clear logs.
- Auto-scroll.
- Pause output.
- Highlight errors and warnings.
- Group logs by command.
- Show command exit code.
- Show command duration.

Example:

```txt
Command: bun run build
Status: Failed
Duration: 8 seconds
Exit code: 1

[Copy error]
[Open full log]
[Run again]
```

---

## 24. Error Detector

Project Cooker should detect common development errors and show simple help.

Examples:

### Port already used

```txt
Error: Port 3000 is already in use.

Actions:
[Show process]
[Kill process]
[Use another port]
```

### Missing dependency

```txt
Error: node_modules not found.

Actions:
[Run bun install]
[Run npm install]
[Ignore]
```

### Missing environment variable

```txt
Error: DATABASE_URL is missing.

Actions:
[Open .env]
[Create from .env.example]
[Ignore]
```

### Docker not running

```txt
Error: Docker daemon is not running.

Actions:
[Retry]
[Open Docker]
[View help]
```

### Build failed

```txt
Build failed.

Actions:
[Copy error]
[Open file in editor]
[Ask AI tool]
[Run again]
```

---

## 25. Git Panel

Project Cooker should include a simple Git panel.

It should not try to replace advanced Git tools, but it should show the most useful information.

Example:

```txt
Git

Branch: main
Status: 3 changed files
Remote: github.com/user/project

Changed files:
- src/App.tsx
- package.json
- README.md

Actions:
[Pull]
[Commit]
[Push]
[Create branch]
[Switch branch]
[Open remote]
```

Git features:

- Show current branch.
- Show changed files.
- Show untracked files.
- Show last commit.
- Show remote URL.
- Pull.
- Push.
- Commit.
- Create branch.
- Switch branch.
- Open repository in browser.
- Copy repository URL.

---

## 26. Project Notes

Each project should have local notes.

Example:

```txt
Project Notes

- Local admin: /admin
- Test account: demo@example.com
- Deploy command: hubfly deploy
- Database runs on port 3306
- Remember to start Redis before worker
```

These notes should be stored locally by Project Cooker.

The user can choose whether notes are:

- Private to Project Cooker.
- Saved into the project as a markdown file.
- Shared with the team through `auto-cook.json` or another project file.

Private notes are useful for personal reminders.

---

## 27. Environment File Helper

Project Cooker can detect environment files.

Examples:

```txt
.env
.env.local
.env.example
.env.production
```

It should never reveal secret values by default.

Instead, it can show keys only:

```txt
Environment Keys

DATABASE_URL=******
JWT_SECRET=******
API_KEY=******
REDIS_URL=******
```

Useful actions:

```txt
[Open .env in editor]
[Create .env from .env.example]
[Compare .env with .env.example]
[Show missing keys]
```

If `.env.example` is missing, it can show:

```txt
No .env.example found.

Actions:
[Generate from current .env keys]
[Ignore]
```

Important rule:

> Secret values should be hidden by default.

---

## 28. Service Manager

Many projects have multiple services.

Example:

```txt
Services

Frontend     running   port 3000
API          running   port 4000
MySQL        running   port 3306
Redis        stopped   port 6379
Worker       running
```

Actions:

```txt
[Start all]
[Stop all]
[Restart failed]
[View logs]
[Open service]
```

Services can come from:

- `auto-cook.json`.
- Docker Compose.
- Package scripts.
- User configuration.
- Plugin detection.

Example service config:

```json
{
  "services": [
    {
      "name": "Frontend",
      "command": "bun dev",
      "port": 3000
    },
    {
      "name": "API",
      "command": "go run .",
      "port": 4000
    },
    {
      "name": "Database",
      "command": "docker compose up -d mysql",
      "port": 3306
    }
  ]
}
```

---

## 29. Docker / Compose Panel

For projects with Docker or Docker Compose, Project Cooker should show a Docker panel.

Features:

- Detect `Dockerfile`.
- Detect `docker-compose.yml`.
- Show services.
- Start Compose.
- Stop Compose.
- Restart service.
- View logs.
- Show ports.
- Show volumes.
- Show container status.
- Open shell inside container.

Example:

```txt
Docker Compose

Services:
- app       running   3000:3000
- mysql     running   3306:3306
- redis     stopped   6379:6379

Actions:
[Up]
[Down]
[Restart app]
[View logs]
[Open shell]
```

---

## 30. Local Database Helper

This can be a future advanced feature.

Project Cooker can detect database connection strings from environment variables.

Examples:

```txt
DATABASE_URL
MYSQL_URL
POSTGRES_URL
MONGO_URL
REDIS_URL
```

Then it can show:

```txt
Database detected

Type: MySQL
Host: localhost
Port: 3306
Database: app_db

Actions:
[Connect]
[Open tables]
[Run query]
```

Possible supported databases:

- MySQL.
- PostgreSQL.
- SQLite.
- MongoDB.
- Redis.

This feature should be handled carefully because database credentials are sensitive.

---

## 31. API Tester

Project Cooker can include a simple API tester for local development.

It does not need to replace Postman or Bruno at first.

Basic features:

- Send GET request.
- Send POST request.
- Add headers.
- Add JSON body.
- Save request.
- Group requests by project.
- Use local ports automatically.
- Show response status.
- Show response time.
- Show response body.

Example:

```txt
GET http://localhost:4000/api/health

Status: 200 OK
Time: 18ms

{
  "status": "ok"
}
```

This helps developers test local APIs without leaving the app.

---

## 32. Recipes

Recipes are reusable project workflows.

Example recipe:

```txt
Recipe: Next.js App

1. Install dependencies
2. Start dev server
3. Open browser preview
4. Start Codex
```

Another example:

```txt
Recipe: Go API + MySQL

1. Start MySQL with Docker Compose
2. Run migrations
3. Start Go API
4. Open health endpoint
```

Recipes can be global or project-specific.

Useful actions:

```txt
[Create recipe]
[Run recipe]
[Edit recipe]
[Duplicate recipe]
[Share recipe]
```

Recipes can make repeated development workflows very fast.

---

## 33. Plugin System

A plugin system will let Project Cooker grow without becoming messy.

Plugins can add support for languages, tools, panels, commands, and scanners.

Example plugins:

```txt
Node.js plugin
Go plugin
Python plugin
PHP plugin
Docker plugin
Git plugin
AI tools plugin
Database plugin
Hubfly plugin
```

A plugin can provide:

- Project detection rules.
- Icons.
- Commands.
- Health checks.
- Panels.
- Tool buttons.
- Error detection rules.

Example plugin config:

```json
{
  "id": "node",
  "name": "Node.js",
  "detect": ["package.json"],
  "commands": [
    {
      "name": "Install",
      "command": "bun install"
    },
    {
      "name": "Dev",
      "command": "bun dev"
    },
    {
      "name": "Build",
      "command": "bun run build"
    }
  ]
}
```

Plugin system benefits:

- Easier to add features.
- Easier to disable features.
- Easier to support more stacks.
- Keeps the core app lightweight.
- Allows community plugins in the future.

---

## 34. Hubfly Plugin Idea

Since Project Cooker is useful for developers, it could have a Hubfly plugin later.

Possible Hubfly plugin features:

- Detect Hubfly project config.
- Run `hubfly deploy`.
- Show deployment status.
- Show app URL.
- Show project services.
- Show logs from Hubfly.
- Open Hubfly dashboard.
- Create deployment from local project.
- Connect project to Hubfly Space.

Example:

```txt
Hubfly

Project: hubfly-space
Status: deployed
Last deploy: 20 minutes ago
URL: https://example.hubfly.space

Actions:
[Deploy]
[Open dashboard]
[View logs]
[Open public URL]
```

This can connect local development with deployment.

---

## 35. Settings

Project Cooker should have simple but powerful settings.

Settings can include:

```txt
General:
- Theme: system / light / dark
- Default workspace
- Open last project on startup
- Auto-scan workspaces
- Ignore folders

Tools:
- Default editor
- Terminal shell
- AI tool commands
- Browser
- Docker command

Security:
- Safe mode
- Require approval for auto-cook commands
- Block dangerous commands
- Hide secret values
- Ask before running install commands

UI:
- Compact cards
- Large cards
- Show framework badges
- Show Git status
- Show running ports
```

Example config:

```json
{
  "workspaces": [
    "/home/user/projects",
    "/home/user/work"
  ],
  "defaultEditor": "zed",
  "defaultTerminalShell": "bash",
  "theme": "system",
  "safeMode": true,
  "openLastProjectOnStartup": true
}
```

---

## 36. Local App Data Structure

Project Cooker can store its data locally.

Example:

```txt
~/.project-cooker/
  config.json
  workspaces.json
  projects/
    project-id.json
  plugins/
  logs/
  sessions/
  recipes/
  notes/
```

Possible file purposes:

```txt
config.json       → global app settings
workspaces.json   → saved workspaces
projects/         → project metadata and preferences
plugins/          → installed or custom plugins
logs/             → saved command logs
sessions/         → terminal/session history
recipes/          → reusable workflows
notes/            → project notes
```

---

## 37. Suggested Technical Architecture

Project Cooker can be built with Go as the main backend.

Suggested architecture:

```txt
Go Backend
- Workspace scanner
- Project detector
- File watcher
- Terminal/session manager
- Process manager
- Command runner
- Plugin engine
- Git integration
- Port scanner
- Config storage
- Local API for GUI

GUI Layer
- Workspace dashboard
- Project canvas
- Terminal UI
- File tree
- Tools panel
- Settings
- Logs panel
- Preview panel
```

The app should be designed to feel fast.

Important architecture goals:

- Lightweight startup.
- Fast project scanning.
- Lazy-load heavy details only when needed.
- Avoid scanning huge folders unnecessarily.
- Ignore dependency folders.
- Cache project metadata.
- Watch folders for changes.
- Keep UI responsive.
- Run commands in controlled project contexts.

---

## 38. GUI Technology Options

Since the app is written in Go, possible GUI options include:

### Option 1: Wails

Good if you want a modern UI using web frontend technologies with a Go backend.

Pros:

- Modern interface.
- Can use React, Vue, Svelte, or plain frontend.
- Good for desktop apps.
- Easier to make beautiful UI.
- Go backend stays powerful.

Cons:

- Uses webview.
- Slightly more frontend setup.

### Option 2: Fyne

Good if you want a Go-native GUI.

Pros:

- Pure Go.
- Native-style widgets.
- Cross-platform.
- Simple for smaller apps.

Cons:

- Harder to make very custom modern UI.
- Complex layouts may take more work.

### Recommendation

For Project Cooker, **Wails + Go + React** is likely a strong choice because the UI needs to be modern, flexible, and rich.

---

## 39. Security Principles

Project Cooker must be safe because it runs project commands.

Main security principles:

1. Never run project-defined commands without review the first time.
2. Hide secret values by default.
3. Warn about dangerous commands.
4. Let users approve commands per project.
5. Store trust decisions locally.
6. Never upload project files without user action.
7. Do not auto-install unknown tools.
8. Keep project permissions clear.
9. Log what commands were run.
10. Allow users to revoke trust for a project.

---

## 40. Dangerous Command Detection

Project Cooker should detect dangerous command patterns.

Examples:

```txt
rm -rf
sudo
chmod -R
chown -R
curl ... | bash
wget ... | sh
dd if=
mkfs
ssh-key
id_rsa
~/.ssh
~/.aws
~/.config
```

If a command contains suspicious patterns, show a warning.

Example:

```txt
Dangerous command detected

Command:
curl https://example.com/install.sh | bash

This command downloads and runs a script.

Actions:
[Block]
[Allow once]
[Edit command]
```

The app should not block everything forever, but it should make the danger clear.

---

## 41. Performance Requirements

Project Cooker should be fast and not heavy.

Performance goals:

- Open quickly.
- Show cached projects immediately.
- Scan in the background.
- Avoid scanning ignored folders.
- Avoid loading all file contents.
- Use file watchers carefully.
- Cache project metadata.
- Lazy-load Git status.
- Lazy-load Docker status.
- Lazy-load dependency analysis.
- Keep terminal output efficient.
- Do not freeze UI when scanning.

Common ignored folders:

```txt
node_modules
.git
vendor
dist
build
.next
.nuxt
target
coverage
.cache
tmp
```

---

## 42. UI Style

The UI should be modern, clean, and not confusing.

Suggested style:

- Simple dashboard.
- Big project cards.
- Clear icons.
- Fast search.
- Good spacing.
- Dark/light mode.
- Compact mode for power users.
- Minimal animations.
- Clear status indicators.
- Big buttons for common actions.
- No clutter.

The design should feel like:

```txt
Fast
Clean
Developer-focused
Calm
Useful
Not heavy
Not overloaded
```

---

## 43. Example Main Navigation

Possible navigation:

```txt
Project Cooker

Sidebar:
- Workspaces
- Recent
- Favorites
- Running
- Recipes
- Settings
```

Inside a project:

```txt
Project:
- Overview
- Terminal
- Commands
- Preview
- Git
- Logs
- Services
- AI
- Notes
- Settings
```

---

## 44. MVP Roadmap

Do not build everything at once.

Start with a strong MVP.

### MVP 1 — Core Workspace Manager

Features:

```txt
- Add workspace folder
- Save workspace
- Show project cards
- Detect project language/framework
- Search projects
- Open project page
- Show file tree
- Open project in Zed
- Open project in VS Code
- Built-in terminal
- Detect package.json scripts
- Run scripts as buttons
- Basic auto-cook.json detection
- Review commands before running
```

This version already gives real value.

---

### MVP 2 — Project Control Room

Features:

```txt
- Multiple terminals per project
- Terminal session memory
- Git status panel
- Port detection
- Internal browser preview
- Project notes
- Logs panel
- Tool configuration UI
- Better project scanner
- Pinned commands
```

This version makes the app feel like a real control room.

---

### MVP 3 — Advanced Tools

Features:

```txt
- Plugin system
- AI session manager
- Docker/Compose panel
- Service manager
- Error detector
- Recipes
- Environment helper
- API tester
```

This version makes the app much bigger and more powerful.

---

### MVP 4 — Pro Developer Platform

Features:

```txt
- Database viewer
- Hubfly plugin
- Team-shared project recipes
- Remote development support
- Advanced logs search
- Project templates
- Command marketplace
- Plugin marketplace
```

This version can become a serious developer product.

---

## 45. Possible Future Features

Future ideas:

- Team workspace sharing.
- Project templates.
- Project backup.
- Project status dashboard.
- Remote SSH projects.
- Container-based development environments.
- Built-in task board.
- Built-in documentation viewer.
- Markdown notes per project.
- Time tracking per project.
- Local notification system.
- Command scheduling.
- One-click project setup.
- One-click cleanup.
- Dependency update checker.
- Security scanner.
- Local package script analytics.
- AI-generated project summary.
- AI-generated onboarding guide.
- AI-generated README improvement.
- AI-generated command suggestions.
- Project import/export.
- Workspace sync across machines.

---

## 46. Example `auto-cook.json` Full Version

```json
{
  "name": "Example Project",
  "version": 1,
  "description": "Local development setup for Example Project",
  "tasks": [
    {
      "name": "Install dependencies",
      "command": "bun install",
      "category": "setup",
      "runOnOpen": false
    },
    {
      "name": "Start frontend",
      "command": "bun dev",
      "category": "development",
      "runOnOpen": true,
      "safe": true,
      "port": 3000
    },
    {
      "name": "Run tests",
      "command": "bun test",
      "category": "testing",
      "runOnOpen": false
    }
  ],
  "services": [
    {
      "name": "Frontend",
      "command": "bun dev",
      "port": 3000,
      "healthUrl": "http://localhost:3000"
    },
    {
      "name": "API",
      "command": "go run .",
      "port": 4000,
      "healthUrl": "http://localhost:4000/health"
    }
  ],
  "tools": [
    {
      "name": "Open in Zed",
      "command": "zed .",
      "icon": "zed"
    },
    {
      "name": "Open in VS Code",
      "command": "code .",
      "icon": "vscode"
    },
    {
      "name": "Start Codex",
      "command": "codex",
      "icon": "ai"
    }
  ],
  "ports": [
    {
      "name": "Frontend",
      "port": 3000,
      "openPath": "/"
    },
    {
      "name": "API Health",
      "port": 4000,
      "openPath": "/health"
    }
  ],
  "notes": [
    "Run database before API",
    "Use bun instead of npm"
  ]
}
```

---

## 47. Main Differentiation

Project Cooker is different because it does not try to be only one thing.

It is not just:

- A terminal.
- A code editor.
- A Git GUI.
- A Docker GUI.
- An AI coding tool.
- A file explorer.
- A browser preview tool.

It is the layer above them.

It connects everything into one project-focused workspace.

The core value is:

> Every project gets its own control room.

---

## 48. Final Vision

Project Cooker should become the app a developer opens first every day.

Instead of thinking:

```txt
Where is my project?
Which terminal was running?
What command starts this app?
Which port is it using?
Where is the API?
Did I open Codex already?
What branch am I on?
Where are the logs?
```

The developer opens Project Cooker and sees everything.

Project Cooker should make projects feel organized, fast, and ready to work on.

The long-term vision:

> Project Cooker becomes the fastest way to open, understand, run, manage, automate, and ship any developer project from one clean desktop app.
