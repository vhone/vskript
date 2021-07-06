import { Position, Range } from "vscode";
import { SkriptLine } from "./SkriptLine";
import { SkriptParagraph, SkriptParagraphBuilder } from "./SkriptParagraph";
import { SkriptPath } from "./SkriptPath";
import { SkriptToolTip } from "./SkriptToolTip";

// phrase 구절 : 두개 단어 이상으로 문장의 역할을 하는 것
// sentence 문장

export class SkriptDocument {



    private _skPath: SkriptPath;
    private _document: string;

    private _skLines: SkriptLine[] = [];
    private _paragraphs: SkriptParagraph[] = [];



    constructor (skPath: SkriptPath, document: string) {
        this._skPath = skPath;
        this._document = document;
        this._update();
    }
    
    public get paragraphs() {
        return this._paragraphs;
    }

    public get skPath() {
        return this._skPath;
    }

    public lineAt(line: number): SkriptLine {
        return this._skLines[line];
    }

    public offsetAt(position: Position): number {
        return this._skLines[position.line].offset + position.character;
    }

    public positionAt(offset: number): Position | undefined {
        for (let i=this._skLines.length-1; i>-1; i--) {
            let skLine = this._skLines[i];
            if (skLine.offset <= offset) {
                return new Position(i, offset - skLine.offset);
            }
        }
        return;
    }

    public getText(range?: Range): string {
        if (!range) {
            return this._document;
        } else {
            let start = this.offsetAt(range.start);
            let end = this.offsetAt(range.end);
            return this._document.substring(start, end);
        }
    }

    public getRange(text: string): Range | undefined {
        let index = this._document.indexOf(text);
        if (index < 0)
            return
        
        let start = this.positionAt(index);
        let end = this.positionAt(index + text.length);
        if (start && end)
            return new Range(start, end);
        else
            return;
    }

	/** Positon에 맞는 요소를 반환 */
	public paragraphOf(position:Position): SkriptParagraph | undefined {
		for (let i=0; i < this._paragraphs.length; i++) {
			let comp = this._paragraphs[i];
			if (comp.range.contains(position)) {
				return comp;
			} else if (position.isBeforeOrEqual(comp.range.start)){
				return;
			}
		}
		return;
	}
    
    /*
    public getWordRangeAtPosition(position: Position, regex?: RegExp): Range | undefined {
        throw new Error("Method not implemented.");
    }
    public validateRange(range: Range): Range {
        throw new Error("Method not implemented.");
    }
    public validatePosition(position: Position): Position {
        throw new Error("Method not implemented.");
    }
    */

    public update(document:string) {
		this._document = document;
        this._update();
    }

    private _update() {
        this._updateSkriptLine();
        this._updateSkriptParagraph();
    }

    private _updateSkriptLine() {
		this._skLines.length = 0;
		
        let document = this._document;
        let offset = 0;
        let match;
        while(match = document.match(/\r\n|\r|\n|$/)) {

            let code = document.substr(0, match.index!);
            this._skLines.push(new SkriptLine(offset, code, match[0]));

            offset += code.length + match[0].length;
            document = document.substring(match.index! + match[0].length);

            if (document.length <= 0) break;
        }
    }

    private _updateSkriptParagraph() {
        this._paragraphs.length = 0;
        
        let document = this._document;
        let search
        while (search = document.match(/(?<=^|\r\n|\r|\n)(?<comment>(\t|\s)*\#.*((\r\n|\r|\n)([^a-zA-Z].*)?)+)?(?<paragraph>[a-zA-Z].*((\r\n|\r|\n)([^a-zA-Z].*)?)+)/)) {

            let groups = search.groups;
            if (groups) {

                // 빌더
                let paragraph = this._trimParagraph(groups.paragraph);
                let skParagraphBuilder = new SkriptParagraphBuilder(this, paragraph);

                // 생성
                let skParagraph = skParagraphBuilder.build()!;
                this._paragraphs.push(skParagraph);

                // docs 주석
                if (groups.comment) {
                    let tooltip = this._trimToolTip(groups.comment);
                    if (tooltip)
                        skParagraph.setToolTip(new SkriptToolTip(skParagraph, tooltip));
                }
                
                console.log(skParagraph);

                document = document.substring(document.indexOf(paragraph) + paragraph.length);

            } else {
                break;
            }
        }
    }

    private _trimToolTip(comment: string): string[] | undefined {
        let lines = SkriptLine.split(comment);
        let tooltip = new Array<string>();
        for (let i=0; i<lines.length; i++) {
            let line = lines[i];
            let search
            if (search = line.text.match(/^(?:\t|\s)*(?:\#\>\s?(.*))$/)) {
                tooltip.push(search[1].trim());
            } else {
                continue;
            }
        }
        if (tooltip.length <= 0) {
            return
        } else {
            let start = tooltip[0];
            let end = tooltip[tooltip.length - 1];
            return tooltip;
        }
    }

    private _trimParagraph(paragraph: string): string {
        let lines = SkriptLine.split(paragraph);
        for (let i=lines.length - 1; i>=0; i--) {
            if (lines[i].text.match(/^((\t|\s)*(\#.*)?)?$/)) {
                lines.splice(i,1);
            }
            else {
                break;
            }
        }
        let start = lines[0];
        let end = lines[lines.length - 1];
        return paragraph.substring(start.offset, end.offset + end.text.length);
    }

}