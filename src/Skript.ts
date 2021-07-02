import { workspace, window, EndOfLine, TextEditorDecorationType, DocumentSymbol, Range, Uri, CommentThreadCollapsibleState } from 'vscode'
import { readdirSync, readFileSync } from 'fs'
import { extname, join } from 'path'
import SkriptFile from "./skript/SkriptFile";
import { SkriptFunction } from './skript/Component';

export * as Component from './skript/Component';



const FILE_LIST = new Array<SkriptFile>();



/** 스크립트 실행 */
export function onSkriptEnable() {
	let amtFunc: number = 0;
	let folders = workspace.workspaceFolders;
	if (folders) {
		for (const iter of folders) {
			let skPath = iter.uri.fsPath;
			for (let fsPath of _getSkriptPathArray(skPath)) {
				let skName = fsPath.replace(skPath+'\\', '');
				let skFile = new SkriptFile(readFileSync(fsPath,'UTF-8'), skPath, skName, EndOfLine.CRLF);
				let uri = Uri.parse(fsPath);
				console.log(uri);
				FILE_LIST.push(skFile);
				amtFunc += skFile.components.filter(comp => comp instanceof SkriptFunction).length;
			}
		}
	}
	if (amtFunc > 0) window.showInformationMessage(`Loaded ${amtFunc} functions.`);
	if (FILE_LIST.length > 0) window.showInformationMessage(`Loaded ${FILE_LIST.length} skript files.`);
	
}



/** 모든 SkriptFile 반환 */
export function getFileList(): Array<SkriptFile> {
	return FILE_LIST;
}

/** 경로와 같은 SkriptFile이 있으면 반환 */
export function findFile(fsPath:string): SkriptFile | undefined {
	for (const file of FILE_LIST)
		if (file.fsPath === fsPath) return file;
	return;
}




/** path의 하위경로를 포함한 모든 skript path 받아오기 */
function _getSkriptPathArray(path:string): Array<string> {
	let skPathArray:Array<string> = new Array<string>();
	readdirSync(path,{withFileTypes:true}).forEach((file) => {
		if (file.name.charAt(0) == '-')
			return
		let dir = join(path,file.name);
		if (file.isDirectory()) {
			skPathArray.push(..._getSkriptPathArray(dir));
		} else if (extname(file.name) == '.sk') {
			skPathArray.push(dir);
		}
	});
	return skPathArray;
}


