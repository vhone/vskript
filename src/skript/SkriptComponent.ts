import { MarkdownString, Position, Range, SymbolKind } from "vscode";
import { SkriptType } from "./language/SkriptType";
import { SkriptDocument, SkriptLine } from "./SkriptDocument";
import { SkriptParagraph } from "./SkriptParagraph";



export interface SkriptKeyValue<T> {
    range: Range,
    key: string,
    value: T
}



export abstract class SkriptComponent {

    private readonly _skDocument: SkriptDocument;
    private readonly _range: Range;
    private readonly _title: string;
    private _skToolTip?: SkriptToolTip;
    
    constructor (skDocument:SkriptDocument, range:Range, title:string) {
        this._skDocument = skDocument;
        this._range = range;
        this._title = title;
    }

    get document(): SkriptDocument {
        return this._skDocument;
    }
    get range(): Range {
        return this._range;
    }
    get title(): string {
        return this._title;
    }
    get tooltip(): SkriptToolTip | undefined {
        return this._skToolTip;
    }
    public setToolTip(skTooltip:SkriptToolTip) {
        this._skToolTip = skTooltip;
    }

    get isInvisible(): boolean {
        if (!this._skToolTip)
            return false;
        return this._skToolTip.option.invisible
    }


    abstract get symbolKind(): SymbolKind;


    public static create(skDocument: SkriptDocument, component:string): SkriptComponent | undefined {
        
        let range = skDocument.getRange(component);
        if (!range)
            return;

        let search
        if (search = component.match(/^(?<component>(?<head>aliases)\:(.*)(?<body>((\r\n|\r|\n)([^a-zA-Z][^\r\n]*)?)+))/i)?.groups){
            return this._createAliases(skDocument, range, search.component, search.head, search.body);

        } else if (search = component.match(/^(?<component>(?<head>options)\:(.*)(?<body>((\r\n|\r|\n)([^a-zA-Z][^\r\n]*)?)+))/i)?.groups) {
            return this._createOptions(skDocument, range, search.component, search.head, search.body);
            
        } else if (search = component.match(/^(?<component>(?<head>(on|every)\s+([^\:]+)|at\s+(\d{1,2}\:\d{1,2}|[^\:]+))\:(.*)((\r\n|\r|\n)(?<body>((\W[^\r\n]*)?(\r\n|\r|\n)?)+))?)/i)?.groups) {
            return this._createEvent(skDocument, range, search.component, search.head, search.body);
            
        } else if (search = component.match(/^(?<component>(command\s?(?<head>[^\:]*))\:?(.*)(?<body>((\r\n|\r|\n)([^a-zA-Z][^\r\n]*)?)*))/i)?.groups) {
            return this._createCommand(skDocument, range, search.component, search.head, search.body);
            
        } else if (search = component.match(/^(?<component>(?<head>function\s(?:\w+)\((?:.*)\)(?:\s\:\:\s(?:[^:]+))?)\:(.*)((\r\n|\r|\n)(?<body>((\W[^\r\n]*)?(\r\n|\r|\n)?)+))?)/i)?.groups) {
            return this._createFunction(skDocument, range, search.component, search.head, search.body);
            
        }
        
        return;

    }



    private static _createAliases(_skDocument:SkriptDocument, _range:Range, _component:string, _head:string, _body:string): SkriptAliases {

        let phrases = new Array<SkriptKeyValue<string[]>>();
        for (const line of SkriptLine.split(_component, _skDocument.offsetAt(_range.start))) {
            let groups = line.text.match(/(?:\t|\s{4})(?<aliase>(?<key>[^\=]+)\=(?<values>[^#]*))/)?.groups;
            if (!groups)
                continue;
            let aliase = groups.aliase.trim();
            let start = line.offset + line.text.indexOf(aliase);
            let phrase: SkriptKeyValue<string[]> = {
                range: (() => {
                    return new Range(_skDocument.positionAt(start)!, _skDocument.positionAt(start + aliase.length)!)
                })(),
                key: groups.key.trim(),
                value : groups.values.split(',').map(value => value.trim())
            }
            phrases.push(phrase);
        }
        return new SkriptAliases(_skDocument, _range, phrases);
        
    }



    private static _createOptions(_skDocument:SkriptDocument, _range:Range, _component:string, _head:string, _body:string): SkriptOptions {

        let phrases = new Array<SkriptKeyValue<string>>();
        for (const line of SkriptLine.split(_component, _skDocument.offsetAt(_range.start))) {
            let groups = line.text.match(/(?:\t|\s{4})(?<option>(?<key>[^\:]+)\:(?<value>(\<\#\#\w*\>|[^#])*))/)?.groups;
            if (!groups)
                continue;
            let option = groups.option.trim();
            let start = line.offset + line.text.indexOf(option);
            let phrase: SkriptKeyValue<string> = {
                range: (() => {
                    return new Range(_skDocument.positionAt(start)!, _skDocument.positionAt(start + option.length)!)
                })(),
                key: groups.key.trim(),
                value : groups.value.trim()
            }
            phrases.push(phrase);
        }
        return new SkriptOptions(_skDocument, _range, phrases);
    }



    private static _createEvent(_skDocument:SkriptDocument, _range:Range, _component:string, _head:string, _body:string): SkriptEvent {

        let skEvent = new SkriptEvent(_skDocument, _range, _head);
        let offset = _skDocument.offsetAt(_range.start) + _component.indexOf(_body);
        let range = new Range(_skDocument.positionAt(offset)!, _skDocument.positionAt(offset + _body.length)!);
        let skParagraph = new SkriptParagraph(skEvent, range, _body);

        skEvent.paragraph = skParagraph;

        return skEvent;
        
    }



    private static _createCommand(_skDocument:SkriptDocument, _range:Range, _component:string, _head?:string, _body?:string): SkriptCommand {

        let offset = _skDocument.offsetAt(_range.start);

        let info: SkriptCommandInfomation = {};

        let search = _head?.match(/\/?(?<label>[^\s]*)(?:\s(?<arguments>[^:]*))?/)?.groups;
        if (search) {
            info.label = search.label;
            info.arguments = search.arguments
        };

        let paragraph: {range:Range, text:string} | undefined;
        let options = new Array<SkriptKeyValue<string>>();
        let match =_component.match(/(?!\r\n|\r|\n)(\t|\s{4})([^:]*)\:(.*)((\r\n|\r|\n)((\t|\s)*\#.*|(\t|\s{4}){2}.*))*/ig);
        if (match) for (const m of match) {
            let groups = m.match(/(\t|\s{4})*(?<option>(?<key>[^\t\s][^:]*)\:(?<value>.*)((\r\n|\r|\n)(?<paragraph>((\W[^\r\n]*)?(\r\n|\r|\n)?)+))?)/)?.groups;
            if (groups) {
                let index = offset + _component.indexOf(groups.option);
                let start = _skDocument.positionAt(index);
                let end = _skDocument.positionAt(index + groups.option.length);
                if (!start || !end) continue;

                let key = groups.key.trim().toLowerCase();
                if (key !== 'trigger') {
                        options.push({key: key, value: groups.value.trim(), range: new Range(start, end)});

                } else {
                    options.push({key: key, value: '', range: new Range(new Position(start.line, 0), end)});
                    paragraph = {text: groups.paragraph, range: new Range(new Position(start.line + 1, 0), end)};
                }
            }
        }
        if (options.length > 0 ) info.options = options;

        let skCommand = new SkriptCommand(_skDocument, _range, info);

        if (paragraph) {
            skCommand.paragraph = new SkriptParagraph(skCommand, paragraph.range, paragraph.text);
        }

        return skCommand;

    }



    private static _createFunction(_skDocument:SkriptDocument, _range:Range, _component:string, _head:string, _body:string): SkriptFunction | undefined {

        let skFunction: SkriptFunction | undefined;

        let headGroup = _head.match(/^function\s(?<name>\w+)\((?<parameter>.*)\)(?:\s\:\:\s(?<type>[^:]+))?/i)?.groups;
        if (headGroup) {
            let parameters: SkriptFunctionParameter[] = [];
            let parameter = headGroup.parameter;
            let search
            while (search = parameter.match(/(?<parameter>(?<name>[^\,\:]*)\:(?<type>[^\,\=]*)(?:\=(?<default>[^\,]*))?\,?)/)?.groups) {
                parameters.push({
                    name: search.name.trim(),
                    type: SkriptType.create(search.type.trim()),
                    default: (search.default) ? search.default.trim() : undefined
                })
                parameter = parameter.replace(search.parameter, '');
            }
    
            let info: SkriptFunctionInfomation = {
                name: headGroup.name.trim(),
                parameters: parameters,
                type: (headGroup.type) ? SkriptType.create(headGroup.type.trim()) : undefined
            };

            skFunction =  new SkriptFunction(_skDocument, _range, info);
            
            let offset = _skDocument.offsetAt(_range.start) + _component.indexOf(_body);
            let range = new Range(_skDocument.positionAt(offset)!, _skDocument.positionAt(offset + _body.length)!);
            let skParagraph = new SkriptParagraph(skFunction, range, _body);

            skFunction.paragraph = skParagraph;
        }

        return skFunction;

    }
}


/**
 * Key-Value를 가지는 컴포넌트   
 * SkriptAliases, SkriptOptions
 */
export abstract class SkriptMapComponent extends SkriptComponent {

}


/**
 * 로직을 가지는 컴포넌트
 * SkriptEvent, SkriptCommand, SkriptFunction
 */
 export abstract class SkriptParagraphComponent extends SkriptComponent {

    protected _skParagraph!: SkriptParagraph;

    get paragraph(): SkriptParagraph {
        return this._skParagraph;
    }
    set paragraph(skParagraph: SkriptParagraph) {
        this._skParagraph = skParagraph;
    }

}



export class SkriptAliases extends SkriptMapComponent {

    private readonly _aliases = new Array<SkriptKeyValue<string[]>>();

    constructor(skDocument:SkriptDocument, range:Range, aliases:SkriptKeyValue<string[]> []) {
        super(skDocument, range, 'alaises')
        this._aliases.push(...aliases);
    }

    /** ```
     * SymbolKind.Constant
     * ``` */
    get symbolKind(): SymbolKind {
        return SymbolKind.Constant;
    }

    public get aliases(){
        return this._aliases
    }
    
}



export class SkriptOptions extends SkriptMapComponent {

    private readonly _options = new Array<SkriptKeyValue<string>>();

    constructor(skDocument:SkriptDocument, range:Range, options:SkriptKeyValue<string>[]) {
        super(skDocument, range, 'options')
        this._options.push(...options);
    }

    /** ```
     * SymbolKind.Constant
     * ``` */
    get symbolKind(): SymbolKind {
        return SymbolKind.Constant;
    }

    public get options(){
        return this._options
    }

}



export class SkriptEvent extends SkriptParagraphComponent {

    constructor(skDocument:SkriptDocument, range:Range, title:string) {
        super(skDocument, range, title);
    }

    /** ```
     * SymbolKind.Event
     * ``` */
    get symbolKind(): SymbolKind {
        return SymbolKind.Event;
    }
    
}




export interface SkriptCommandInfomation {
    label?: string;
    arguments?: string;
    options?: SkriptKeyValue<string>[];
}

export class SkriptCommand extends SkriptParagraphComponent {

    private readonly _info?: SkriptCommandInfomation;

    constructor(skDocument:SkriptDocument, range:Range, info?:SkriptCommandInfomation) {
        let title = 'command'
        if (info) {
            if (info.label) title +=  ` /${info.label}`;
            if (info.arguments) title += ` ${info.arguments}`;
        }
        super(skDocument, range, title);
        this._info = info;
    }

    get label() {
        return this._info?.label
    }

    get arguments() {
        return this._info?.arguments
    }

    get options() {
        return this._info?.options
    }

    /** ```
     * SymbolKind.Class
     * ``` */
    get symbolKind(): SymbolKind {
        return SymbolKind.Class;
    }

}




export interface SkriptFunctionInfomation {
    name: string,
    parameters: SkriptFunctionParameter[] | undefined,
    type: SkriptType | undefined
}

export interface SkriptFunctionParameter {
    name: string,
    type: SkriptType,
    default: string | undefined
}

export class SkriptFunction extends SkriptParagraphComponent {

    private readonly _info: SkriptFunctionInfomation;

    constructor(skDocument:SkriptDocument, range:Range, info:SkriptFunctionInfomation) {
        let parameters = new Array<string>();
        for (const parameter of info.parameters!) {
            let text = `${parameter.name}:${parameter.type.text}`;
            if (parameter.default)
                text += `=${parameter.default}`
            parameters.push(text);
        }
        let title = `${info.name}(${parameters.join(', ')})${(info.type) ? ` :: ${info.type.text}:` : `:`}`;
        super(skDocument, range, title);
        this._info = info;

    }

    get name(): string {
        return this._info.name;
    }

    get parameters(): SkriptFunctionParameter[] | undefined {
        return this._info.parameters;
    }

    get returnType(): SkriptType | undefined {
        return this._info.type;
    }

    /** ```
     * SymbolKind.Function
     * ``` */
    get symbolKind(): SymbolKind {
        return SymbolKind.Function;
    }
    
}



interface SkriptComponentOption {
    invisible: boolean;
}

export class SkriptToolTip {
    

	private readonly _skParagraph: SkriptComponent;
    private readonly _tooltip: string[];
    private _markdown: MarkdownString | undefined;
    private readonly _skCompOption: SkriptComponentOption;


    constructor(skParagraph:SkriptComponent, tooltip:string[]) {
		this._skParagraph = skParagraph;
        this._tooltip = tooltip;
        this._skCompOption = {invisible: false}
        tooltip.forEach(line => {
            if (line.match(/\@invisible/i)) this._skCompOption.invisible = true;
        })
    }

    get option(): SkriptComponentOption {
        return this._skCompOption;
    }
    
	get markdown(): MarkdownString {
		if (!this._markdown) {
			let docs = new Array<string>();
			let regex_parm = /(\@param)\s(\w*)\s(.*)/g;
			let regex_return = /(\@return)\s(.*)/g;
			for (const line of this._tooltip) {
				docs.push(line
					.replace(regex_parm, '_$1_ ```$2``` ─ $3')
					.replace(regex_return, '_$1_ ─ $2')
				);
			}
			this._markdown = new MarkdownString()
				.appendCodeblock('function ' + this._skParagraph.title);
			
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