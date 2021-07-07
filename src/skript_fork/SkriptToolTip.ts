import { MarkdownString } from "vscode";
import { SkriptLine } from "./SkriptLine";
import { SkriptParagraph } from "./SkriptParagraph";


export class SkriptToolTip {
    

	private readonly _skParagraph: SkriptParagraph;
    private readonly _tooltip: string[];
    private _markdown: MarkdownString | undefined;
    


    constructor(skParagraph:SkriptParagraph, tooltip:string[]) {
		this._skParagraph = skParagraph;
        this._tooltip = tooltip;
    }


    
	public get markdown(): MarkdownString {
		if (!this._markdown) {
			let docs = new Array<string>();
			let regex_parm = /(\@parm)\s(\w*)\s(.*)/g;
			let regex_return = /(\@return)\s(.*)/g;
			for (const line of this._tooltip) {
				docs.push(line
					.replace(regex_parm, '_$1_ ```$2``` ─ $3')
					.replace(regex_return, '_$1_ ─ $2')
				);
			}
			this._markdown = new MarkdownString()
				.appendCodeblock(this._skParagraph.title);
			
			if (docs.length > 0) {
				docs.unshift('***');
				docs.push('');
				this._markdown.appendMarkdown(docs.join('  \r\n'));
			}
			this._markdown.appendMarkdown(['***', 'from ```' + this._skParagraph.document.skPath.name + '```'].join('  \r\n'))
		}
		return this._markdown;
	}
}