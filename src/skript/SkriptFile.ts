import { join as joinPath } from 'path';
import { EndOfLine, Position, Range, window } from 'vscode';
import {
	SkriptAliasesBuilder,
	SkriptCommandBuilder,
	SkriptComponent,
	SkriptComponentBuilder,
	SkriptEventBuilder,
	SkriptFunctionBuilder,
	SkriptOptionsBuilder
} from './Component';
import * as Skript from '../Skript';

/**
 * 작업영역으로부터 포함된 sk파일을 모두 읽어서 객체를 생성함
 */
export default class SkriptFile {

    private readonly _fsPath: string;
	private readonly _eol: string;

	private readonly _lineIndexs:Array<number> = [];
	private readonly _components = new Array<SkriptComponent>();

	public constructor(
		private _document:string,
		private _skDir:string,
		private _skName:string,
		eol:EndOfLine
	) {
        this._fsPath = joinPath(this._skDir, this._skName);
		this._eol = (eol === EndOfLine.LF) ? '\n' : '\r\n';
		
		this._updateLineIndexArray();
		this.update(this._document);
	}



    public get fsPath(): string {
        return this._fsPath;
    }
    public get skDir(): string {
        return this._skDir;
    }
    public get skName(): string {
        return this._skName;
    }

    public get eol(): string {
        return this._eol;
    }

    public get document(): string {
        return this._document;
    }

	public get components(): readonly SkriptComponent[] {
		return this._components;
	}

	public update(document:string) {
		this._document = document;
		this._updateLineIndexArray();

		this._components.length = 0;

		let elements = this._document.match(/^[a-zA-Z].*((\r\n|\r|\n)([^a-zA-Z][^\r\n]*)?)+/igm);
		if (elements) for (let element of elements) {

			element = this._trim(element);
			if (this._registerComponent(element, new SkriptOptionsBuilder(this))) continue;
			if (this._registerComponent(element, new SkriptAliasesBuilder(this))) continue;
			if (this._registerComponent(element, new SkriptCommandBuilder(this))) continue;
			if (this._registerComponent(element, new SkriptEventBuilder(this))) continue;
			if (this._registerComponent(element, new SkriptFunctionBuilder(this))) continue;

		}
	}

	/** Range에 해당하는 문자열 반환 */
	public getText(range?:Range): string {
		if (!range) {
			return this._document;
		} else {
			return this._document.substring(this.offsetAt(range.start), this.offsetAt(range.end));
		}
	}

	/** 글자에 해당하는 첫번째 범위 반환 */
	public getRange(element:string): Range {
		let index = this._document.indexOf(element);
		let start = this.positionAt(index);
		let end = this.positionAt(index + element.length);
		return new Range(start, end);
	}

	/** 글자에 해당하는 모든 범위 반환 */
	public getRanges(text:string): Range[] {
		let rages = new Array<Range>();
		let position = 0;
		do {
			let index = this._document.indexOf(text, position);
			let start = this.positionAt(index);
			let end = this.positionAt(index + text.length);
			rages.push( new Range(start, end) );
			position = index + 1;
		} while (position > 0);

		return rages;
	}

	// /** 위치에 해당하는 패턴 타입 반환 */
	// public getPatternType(pos:Position): PatternType {

	// }

	/** Position을 Offset으로 반환 */
	public offsetAt(position:Position): number {
		return this._lineIndexs[position.line] + position.character;
	}

	/** offset 값으로 Position을 반환 */
	public positionAt(offset:number): Position {
		let size = this._lineIndexs.length;
		let length = this._lineIndexs[size-1];
		let line = 0;
		offset = (offset < 0) ? 0 : (offset > length) ? length : offset;
		for (let i=0; i<size; i++) if (offset < this._lineIndexs[i]) {
			line = i - 1;
			break;
		}
		return new Position(line, offset - this._lineIndexs[line]);
	}
    
	/** Positon에 맞는 요소를 반환 */
	public componentOf(pos:Position): SkriptComponent | undefined {
		for (let i=0; i < this._components.length; i++) {
			let comp = this._components[i];
			if (comp.range.contains(pos)) {
				return comp;
			} else if (pos.isBeforeOrEqual(comp.range.start)){
				return;
			}
		}
		return;
	}

	/** 좌, 우 여백 제거 */
	private _trim(element: string): string {
		let split = element.split(/\r\n|\r|\n/i);
		for (let i=split.length - 1; i>=0; i--) {
			if (split[i].match(/^((\t|\s)*(\#.*)?)?$/i))
				split.splice(i,1);
			else
				break;
		}
		return split.join('\r\n');
	}

	/** 글줄 위치값을 세팅 */
	private _updateLineIndexArray() {
		this._lineIndexs.length = 0;
		this._lineIndexs.push(0);
		let index=0;
		for (let line of this._document.split(this._eol)) {
			index += line.length + this.eol.length;
			this._lineIndexs.push(index)
		}
	}

	/** 컴포넌트 생성 */
	private _registerComponent(element:string, builder:SkriptComponentBuilder<SkriptComponent>): boolean {
		let groups = element.match(builder.regExp())?.groups;
		if (!groups)
			return false;

		let range = this.getRange(element);
		let docs: string = (this._components.length === 0)
			? this.getText(new Range(this.positionAt(0), range.start)).trim()
			: this.getText(new Range(this._components[this._components.length - 1].range.end, range.start)).trim();

		let skComp = builder.setRange(range).setDocs(docs).setHead(groups.head).setBody(groups.body).build();
		if (skComp!){
			this._components.push(skComp);
		}
		
		return true;
	}


}

