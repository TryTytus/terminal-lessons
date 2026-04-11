export namespace checks {
	
	export class Result {
	    type: string;
	    path?: string;
	    passed: boolean;
	    message: string;
	
	    static createFrom(source: any = {}) {
	        return new Result(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.type = source["type"];
	        this.path = source["path"];
	        this.passed = source["passed"];
	        this.message = source["message"];
	    }
	}

}

export namespace lessons {
	
	export class Check {
	    type: string;
	    path?: string;
	    expected?: string;
	    pattern?: string;
	    trim?: boolean;
	
	    static createFrom(source: any = {}) {
	        return new Check(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.type = source["type"];
	        this.path = source["path"];
	        this.expected = source["expected"];
	        this.pattern = source["pattern"];
	        this.trim = source["trim"];
	    }
	}
	export class Solution {
	    commands: string[];
	    explanation: string;
	
	    static createFrom(source: any = {}) {
	        return new Solution(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.commands = source["commands"];
	        this.explanation = source["explanation"];
	    }
	}
	export class WorkspaceFile {
	    path: string;
	    content: string;
	
	    static createFrom(source: any = {}) {
	        return new WorkspaceFile(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.path = source["path"];
	        this.content = source["content"];
	    }
	}
	export class Workspace {
	    files: WorkspaceFile[];
	
	    static createFrom(source: any = {}) {
	        return new Workspace(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.files = this.convertValues(source["files"], WorkspaceFile);
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
	export class Lesson {
	    version: number;
	    id: string;
	    title: string;
	    commands: string[];
	    difficulty: string;
	    intro: string;
	    workspace: Workspace;
	    hints: string[];
	    solution: Solution;
	    checks: Check[];
	
	    static createFrom(source: any = {}) {
	        return new Lesson(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.version = source["version"];
	        this.id = source["id"];
	        this.title = source["title"];
	        this.commands = source["commands"];
	        this.difficulty = source["difficulty"];
	        this.intro = source["intro"];
	        this.workspace = this.convertValues(source["workspace"], Workspace);
	        this.hints = source["hints"];
	        this.solution = this.convertValues(source["solution"], Solution);
	        this.checks = this.convertValues(source["checks"], Check);
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
	
	export class Summary {
	    id: string;
	    title: string;
	    commands: string[];
	    difficulty: string;
	    intro: string;
	    checkCount: number;
	    hintCount: number;
	
	    static createFrom(source: any = {}) {
	        return new Summary(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.title = source["title"];
	        this.commands = source["commands"];
	        this.difficulty = source["difficulty"];
	        this.intro = source["intro"];
	        this.checkCount = source["checkCount"];
	        this.hintCount = source["hintCount"];
	    }
	}
	

}

export namespace main {
	
	export class LessonSessionState {
	    sessionID: string;
	    lessonID: string;
	    workspaceDir: string;
	    lesson?: lessons.Lesson;
	
	    static createFrom(source: any = {}) {
	        return new LessonSessionState(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.sessionID = source["sessionID"];
	        this.lessonID = source["lessonID"];
	        this.workspaceDir = source["workspaceDir"];
	        this.lesson = this.convertValues(source["lesson"], lessons.Lesson);
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

}

