import { Uri } from "vscode";

// phrase 구절 : 두개 단어 이상으로 문장의 역할을 하는 것
// sentence 문장

class SkriptLine {
    constructor(
        private readonly line: number,
        private readonly code: string
    ) {}
}

export class SkriptDocument {

    private _lineIndexs: SkriptLine[] = [];

    constructor (
        private readonly _uri: Uri,
        private readonly _document: string
    ) {
        this._updateLineIndexArray();
    }
    /*
    lineAt(line: number): TextLine;
    lineAt(position: Position): TextLine;
    lineAt(position: any): import("vscode").TextLine {
        throw new Error("Method not implemented.");
    }
    offsetAt(position: Position): number {
        throw new Error("Method not implemented.");
    }
    positionAt(offset: number): Position {
        throw new Error("Method not implemented.");
    }
    getText(range?: Range): string {
        throw new Error("Method not implemented.");
    }
    getWordRangeAtPosition(position: Position, regex?: RegExp): Range | undefined {
        throw new Error("Method not implemented.");
    }
    validateRange(range: Range): Range {
        throw new Error("Method not implemented.");
    }
    validatePosition(position: Position): Position {
        throw new Error("Method not implemented.");
    }
    */



    
	/** 글줄 위치값을 세팅 */
	private _updateLineIndexArray() {
		this._lineIndexs.length = 0;
		let index=0;
        let code;
		while (code = this._document.match(/(^?)(.*)(\r\n|\r|\n|$)/)) {
            console.log(code);
			// index += line.length + this.eol.length;
			// this._lineIndexs.push(index)
		}
	}

    

    
}