import { MarkdownString, Position, Range, SymbolKind } from "vscode";
import SkriptFile from "../SkriptFile";
import { SkriptComponent, SkriptComponentBuilder } from "./SkriptComponent";

/**
 * SkriptFile 생성시 검색된 함수를 객체로 생성함.
 *  - name = 펑션 이름
 *  - parameters = 인수들
 *    - 변수명
 *    - 타입
 *  - type = 반환 타입
 * 
 *  - discription = 설명
 *    - 함수 설명
 *    - 파라메터 설명
 */
 export class SkriptFunction extends SkriptComponent {

	constructor(_skFile:SkriptFile, _range: Range, _docs: string[], _name: string,
		protected readonly _parameters: SkriptFunctionParameter[],
		protected readonly _type: string,
		protected readonly _body: string
	) {
		super(_skFile, _range, _docs, _name);
	}

	public get parameters(): SkriptFunctionParameter[] {
		return Object.assign(this._parameters, {});
	}
	public get type(): string {
		return this._type;
	}
	public get body(): string {
		return this._body;
	}
    public get symbol(): SymbolKind {
        return SymbolKind.Function;
    }
	public get markdown(): MarkdownString {
		if (!this._markdown) {
			let docs = new Array<string>();
			let regex_parm = /(\@parm)\s(\w*)\s(.*)/g;
			let regex_return = /(\@return)\s(.*)/g;
			for (const str of this._docs)
				docs.push(str
					.replace(regex_parm, '_$1_ ```$2``` ─ $3')
					.replace(regex_return, '_$1_ ─ $2')
				);
			this._markdown = new MarkdownString('', true)
				.appendCodeblock('function ' + this.toDeclaration(), 'vskript')
			
			if (docs.length > 0) {
				docs.unshift('***');
				docs.push('');
				this._markdown.appendMarkdown(docs.join('  \r\n'));
			}
			
			this._markdown.appendMarkdown(['***', 'from ```' + this._skFile.skName + '```'].join('  \r\n'))
		}
		return this._markdown;
	}
    public contextOf(_position: Position): string {
        return 'function'
    }

	/** 함수 선언부 */
	public toDeclaration(): string {
		let parms = this._parameters.join();
		if (!this._type)
			return `${this._name}(${parms}):`;
		else
			return `${this._name}(${parms}) :: ${this._type}:`;
	}

}

export class SkriptFunctionBuilder extends SkriptComponentBuilder<SkriptFunction> {
	public regExp(): RegExp {
		return /^(?<head>function\s(?:\w+)\((?:.*)\)(?:\s\:\:\s(?:[^:]+))?\:)(.*)(?<body>(?:(?:\r\n|\r|\n)(?:[^a-zA-Z][^\r\n]*)?)+)/i
	}
	public build(): SkriptFunction | undefined {
		let headGroup = this._head.match(/^function\s(?<name>\w+)\((?<parameter>.*)\)(?:\s\:\:\s(?<type>[^:]+))?\:/i)?.groups;
		if (headGroup) {
			
			let parameters = new Array<SkriptFunctionParameter>();
			let parmMatch = headGroup.parameter.match(/\b([^,:]+)\:([^,]+)\b/ig);
			if (parmMatch) for (const parm of parmMatch) {

				let parmGroup = parm.match(/(?<name>[^\:]*)\:(?<type>[^\,\=]*)(?:\=(?<default>[^\,]*))?/i)?.groups;
				if (parmGroup) {  
					if (!parmGroup.default)
						parameters.push(new SkriptFunctionParameter(parmGroup.name.trim(),parmGroup.type.trim()))
					else
						parameters.push(new SkriptFunctionParameter(parmGroup.name.trim(),parmGroup.type.trim(),parmGroup.default.trim()))
				}

			}

			return new SkriptFunction(this._skFile, this._range, this._docs, headGroup.name, parameters, headGroup.type, this._body);
		}
		return undefined;
	}
	
}

class SkriptFunctionParameter {

	private readonly _name: string;
	private readonly _type: string;
	private readonly _default: string | undefined;

	constructor(_name:string,type:string,_default?:string) {
		this._name = _name;
		this._type = type;
		this._default = _default;
	}

	public get name() {
		return this._name;
	}
	public get type() {
		return this._type;
	}
	public toString(): string {
		if (this._default === undefined) {
			return `${this._name}:${this._type}`;
		} else {
			return `${this._name}:${this._type}=${this._default}`;
		}
	}
    
}