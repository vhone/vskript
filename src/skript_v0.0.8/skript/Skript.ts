
import { TextDocument, Uri, workspace, WorkspaceFolder } from 'vscode'
import * as FileSystem from 'fs'
import * as Path from 'path'
import { Class } from '../../Java';
import { SkriptEvent, Trigger, UnloadedTrigger } from './parser/lang';
import * as FileUtils from '../util/FileUtils'
import { FileParser, FileSection, VoidElement } from './parser/File';
import { ScriptLoader, SyntaxParser } from './parser/Parsing';
import { SkriptAddon } from './parser/Registration';



class SkriptDocument {

	private readonly _textDocument: TextDocument;

	constructor(textDocument: TextDocument) {
		this._textDocument = textDocument;
		
		ScriptLoader.loadScript(this._textDocument.uri, false);
		
	}

	public get textDocument(): TextDocument {
		return this._textDocument;
	}

}



class SkriptProject {

	public static create(workspaceUri: Uri, scriptsUri: Uri): SkriptProject | undefined {
		return new SkriptProject(workspaceUri, scriptsUri);
	}

	private readonly _workspaceUri: Uri;
	private readonly _scriptsUri: Uri;
	private _skDocument: SkriptDocument[] | undefined;

	private constructor(workspaceUri: Uri, scriptsUri: Uri) {
		this._workspaceUri = workspaceUri;
			this._scriptsUri = scriptsUri;

		this._findSkriptDocuments(this._scriptsUri.fsPath)
			.then(skDocumnets => {
				if (skDocumnets) {
					this._skDocument = skDocumnets;
				}
			}
		);
	}

	public get relativePath(): string {
		return Path.relative(this._workspaceUri.fsPath, this._scriptsUri.fsPath);
	}


	/**
	 * Find the 'scripts' folder in the workspace.
	 * @param uri WorkSpaceFolder Uri
	 * @returns array of found 'scripts' folders
	 */
	private async _findSkriptDocuments(fsPath: string): Promise<SkriptDocument[]> {
		let result: SkriptDocument[] = [];
		for (const dirent of FileSystem.readdirSync(fsPath, {withFileTypes: true})) {
			let name = dirent.name;
			if (name.charAt(0).match(/[-\.]/))
				continue;
			if (dirent.isDirectory()) {
				this._findSkriptDocuments(Path.join(fsPath, dirent.name));
			} else if (dirent.isFile()) {
				if (Path.extname(name) !== '.sk')
					continue;
				let textDocument = await workspace.openTextDocument(Uri.file(Path.join(fsPath, dirent.name)));
				let skDocument = new SkriptDocument(textDocument);
				result.push(skDocument);
			}
		}
		return result;
	}


}



export class VisualSkript {

	public static PROJECTS: SkriptProject[] = [];

	public static onEnable() {

		if (!workspace.workspaceFolders)
			return;

		for (let workspaceFolder of workspace.workspaceFolders) {
			let uri = workspaceFolder.uri;
			VisualSkript._findScriptsFolderUri(uri).forEach((u) => {
				let skProject = SkriptProject.create(uri, u);
				if (skProject) {
					VisualSkript.PROJECTS.push(skProject);
				}
			});
		}
		
	// let lines = FileUtils.readAllLines(`${context.extensionUri.fsPath}/src/resource/lang/default.lang`)

	}


	/**
	 * Find the 'scripts' folder in the workspace.
	 * @param uri WorkSpaceFolder Uri
	 * @returns array of found 'scripts' folders
	 */
	private static _findScriptsFolderUri(uri: Uri): Uri[] {
		let fsPath = uri.fsPath;
		let result: Uri[] = [];
		if (Path.basename(fsPath) === 'scripts') {
			result.push(uri);
		} else {
			try {
				let dirs = FileSystem.readdirSync(fsPath);
				for (let dir of dirs) {
					let u = VisualSkript._findScriptsFolderUri(Uri.file(Path.join(fsPath, dir)));
					result.push(...u);
				}
			} catch (error) {}
		}
		return result
	}

}







export class Skript extends SkriptAddon {

	private readonly _mainArgs: string[];

	private readonly _mainTriggers = new Array<Trigger>();
	private readonly _priodicalTriggers = new Array<Trigger>();
	private readonly _whenTriggers = new Array<Trigger>();
	private readonly _atTimeTriggers = new Array<Trigger>();

	constructor(mainArgs: string[]) {
		super();
		this._mainArgs = mainArgs;
	}

	public handleTrigger(trigger: Trigger): void {
		let event = trigger.event;

		if (!this.canHandleEvent(event)){
			return;
		}

		//if (event instanceof EvtSkriptLoad) {
			
		//}
	}
	
}