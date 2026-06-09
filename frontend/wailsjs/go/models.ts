export namespace backend {
	
	export class AutoCookPort {
	    name: string;
	    port: number;
	    openPath: string;
	
	    static createFrom(source: any = {}) {
	        return new AutoCookPort(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.name = source["name"];
	        this.port = source["port"];
	        this.openPath = source["openPath"];
	    }
	}
	export class AutoCookTool {
	    name: string;
	    command: string;
	    icon: string;
	
	    static createFrom(source: any = {}) {
	        return new AutoCookTool(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.name = source["name"];
	        this.command = source["command"];
	        this.icon = source["icon"];
	    }
	}
	export class AutoCookTask {
	    name: string;
	    command: string;
	    runOnOpen: boolean;
	    safe: boolean;
	
	    static createFrom(source: any = {}) {
	        return new AutoCookTask(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.name = source["name"];
	        this.command = source["command"];
	        this.runOnOpen = source["runOnOpen"];
	        this.safe = source["safe"];
	    }
	}
	export class AutoCookConfig {
	    name: string;
	    version: number;
	    description: string;
	    tasks: AutoCookTask[];
	    tools: AutoCookTool[];
	    ports: AutoCookPort[];
	
	    static createFrom(source: any = {}) {
	        return new AutoCookConfig(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.name = source["name"];
	        this.version = source["version"];
	        this.description = source["description"];
	        this.tasks = this.convertValues(source["tasks"], AutoCookTask);
	        this.tools = this.convertValues(source["tools"], AutoCookTool);
	        this.ports = this.convertValues(source["ports"], AutoCookPort);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	
	
	
	export class Config {
	    workspaces: string[];
	    defaultEditor: string;
	    defaultTerminalShell: string;
	    theme: string;
	    safeMode: boolean;
	    openLastProjectOnStartup: boolean;
	
	    static createFrom(source: any = {}) {
	        return new Config(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.workspaces = source["workspaces"];
	        this.defaultEditor = source["defaultEditor"];
	        this.defaultTerminalShell = source["defaultTerminalShell"];
	        this.theme = source["theme"];
	        this.safeMode = source["safeMode"];
	        this.openLastProjectOnStartup = source["openLastProjectOnStartup"];
	    }
	}
	export class FileItem {
	    name: string;
	    path: string;
	    isDir: boolean;
	    size: number;
	
	    static createFrom(source: any = {}) {
	        return new FileItem(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.name = source["name"];
	        this.path = source["path"];
	        this.isDir = source["isDir"];
	        this.size = source["size"];
	    }
	}
	export class Project {
	    name: string;
	    path: string;
	    langStack: string[];
	    frameworks: string[];
	    gitBranch: string;
	    gitChanges: number;
	    lastOpened: number;
	    scripts: Record<string, string>;
	    hasAutoCook: boolean;
	    autoCookData?: AutoCookConfig;
	
	    static createFrom(source: any = {}) {
	        return new Project(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.name = source["name"];
	        this.path = source["path"];
	        this.langStack = source["langStack"];
	        this.frameworks = source["frameworks"];
	        this.gitBranch = source["gitBranch"];
	        this.gitChanges = source["gitChanges"];
	        this.lastOpened = source["lastOpened"];
	        this.scripts = source["scripts"];
	        this.hasAutoCook = source["hasAutoCook"];
	        this.autoCookData = this.convertValues(source["autoCookData"], AutoCookConfig);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class SearchResult {
	    type: string;
	    name: string;
	    path: string;
	    relPath: string;
	    lineNumber: number;
	    lineText: string;
	    langStack: string[];
	
	    static createFrom(source: any = {}) {
	        return new SearchResult(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.type = source["type"];
	        this.name = source["name"];
	        this.path = source["path"];
	        this.relPath = source["relPath"];
	        this.lineNumber = source["lineNumber"];
	        this.lineText = source["lineText"];
	        this.langStack = source["langStack"];
	    }
	}

}

