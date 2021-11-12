import { workspace, window, ExtensionContext, TextDocument } from 'vscode'
import * as FileSystem from 'fs'
import * as Path from 'path'
import { SkriptDocument, SkriptPath } from './skript/SkriptDocument';
import { LangFile } from './resource/LangFile';

export class SkriptManager {

	public static WORKSAPCE_FATH = workspace.workspaceFolders;
	public static DOCUMENTS = new Array<SkriptDocument>();
	public static LANGFILE: LangFile;

	public static TEXTDOCUMENTS = new Array<TextDocument>();

	public static async onSkriptEnable(context:ExtensionContext) {
		// console.log(`[onSkriptEnable]`)

		/** 리소스 읽기 */
		// SkriptManager.LANGFILE = new LangFile(context.asAbsolutePath('./resource/english.lang'));

	
		if (SkriptManager.WORKSAPCE_FATH) {
			// let amtFunc: number = 0;
			for (const path of SkriptManager.WORKSAPCE_FATH) {
				let rootPath = new SkriptPath(path.uri.fsPath, '');
				for (let skPath of await SkriptManager._getSkriptPaths(rootPath)) {
					// let document = FileSystem.readFileSync(skPath.fsPath, {encoding: 'UTF-8'});
					// let skDocument = new SkriptDocument(skPath, document);
					// SkriptManager.DOCUMENTS.push(skDocument);
					let textDocument = await workspace.openTextDocument(skPath.fsPath)
					console.log(textDocument)
					// SkriptManager.TEXTDOCUMENTS.push()

				};
			}
			// window.showInformationMessage(`Loaded ${amtFunc} functions.`);
			// window.showInformationMessage(`Loaded ${FILE_LIST.length} skript files.`);
			window.showInformationMessage(`Loaded ${SkriptManager.DOCUMENTS.length} skript files.`);
		}
		
	}

	/** 하위경로 받아오기 */
	private static async _getSkriptPaths(loopPath: SkriptPath): Promise<SkriptPath[]> {
		let skPathArray = new Array<SkriptPath>();
		for (const file of FileSystem.readdirSync(loopPath.fsPath, {encoding:'UTF-8', withFileTypes:true})) {
			let skPath = new SkriptPath(loopPath.root, Path.join(loopPath.name, file.name));
			if (file.name.charAt(0) === '-') {
				continue;
			}
			if (file.isDirectory()) {
				skPathArray.push(...await this._getSkriptPaths(skPath))
			} else if (Path.extname(file.name) === '.sk') {
				skPathArray.push(skPath);
			}
		};
		return new Promise((resolve) => {
			resolve(skPathArray);
		})
	}
	
	/** 경로와 같은 SkriptFile이 있으면 반환 */
	public static find(fsPath:string): SkriptDocument | undefined {
		for (const document of SkriptManager.DOCUMENTS) if (document.skPath.fsPath === fsPath) {
			return document;
		}
		return;
	}

}