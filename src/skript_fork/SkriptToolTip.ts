import { MarkdownString } from "vscode";


export class SkriptToolTip {
    


    private readonly _comment: string;
    private _markdown: MarkdownString | undefined;
    


    constructor(comment:string) {
        this._comment = comment;
    }


    
	// public get markdown(): MarkdownString {
	// 	if (!this._markdown) {
	// 		let docs = new Array<string>();
	// 		let regex_parm = /(\@parm)\s(\w*)\s(.*)/g;
	// 		let regex_return = /(\@return)\s(.*)/g;
	// 		for (const str of this._command)
	// 			docs.push(str
	// 				.replace(regex_parm, '_$1_ ```$2``` ─ $3')
	// 				.replace(regex_return, '_$1_ ─ $2')
	// 			);
	// 		this._markdown = new MarkdownString('', true)
	// 			.appendCodeblock('function ' + this.toDeclaration(), 'vskript')
			
	// 		if (docs.length > 0) {
	// 			docs.unshift('***');
	// 			docs.push('');
	// 			this._markdown.appendMarkdown(docs.join('  \r\n'));
	// 		}
			
	// 		this._markdown.appendMarkdown(['***', 'from ```' + this._skFile.skName + '```'].join('  \r\n'))
	// 	}
	// 	return this._markdown;
	// }
}