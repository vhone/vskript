import { workspace, window } from 'vscode'
import * as FileSystem from 'fs'
import * as Path from 'path'
import { SkriptDocument, SkriptPath } from './skript/SkriptDocument';



const WORKSAPCE_FATH = workspace.workspaceFolders;

export const DOCUMENTS = new Array<SkriptDocument>();



/** 스크립트 실행 */
export async function onSkriptEnable() {

	if (WORKSAPCE_FATH) {
		// let amtFunc: number = 0;
		for (const path of WORKSAPCE_FATH) {
			let rootPath = new SkriptPath(path.uri.fsPath, '');
			for (let skPath of await _getSkriptPaths(rootPath)) {
				let document = FileSystem.readFileSync(skPath.fsPath, {encoding: 'UTF-8'});
				let skDocument = new SkriptDocument(skPath, document);
				DOCUMENTS.push(skDocument);
			};
		}
		// window.showInformationMessage(`Loaded ${amtFunc} functions.`);
		// window.showInformationMessage(`Loaded ${FILE_LIST.length} skript files.`);
		window.showInformationMessage(`Loaded ${DOCUMENTS.length} skript files.`);
	}
	
}



/** 경로와 같은 SkriptFile이 있으면 반환 */
export function find(fsPath:string): SkriptDocument | undefined {
	for (const document of DOCUMENTS) if (document.skPath.fsPath === fsPath) {
		return document;
	}
	return;
}



/** 하위경로 받아오기 */
async function _getSkriptPaths(loopPath: SkriptPath): Promise<SkriptPath[]> {
	let skPathArray = new Array<SkriptPath>();
	for (const file of FileSystem.readdirSync(loopPath.fsPath, {encoding:'UTF-8', withFileTypes:true})) {
		let skPath = new SkriptPath(loopPath.root, Path.join(loopPath.name, file.name));
		if (file.name.charAt(0) === '-') {
			continue;
		}
		if (file.isDirectory()) {
			skPathArray.push(...await _getSkriptPaths(skPath))
		} else if (Path.extname(file.name) === '.sk') {
			skPathArray.push(skPath);
		}
	};
	return new Promise((resolve) => {
		resolve(skPathArray);
	})
}
