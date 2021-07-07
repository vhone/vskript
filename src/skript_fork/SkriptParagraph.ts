import { Range, SymbolKind } from "vscode";
import { SkriptDocument } from "./SkriptDocument";
import { SkriptLine } from "./SkriptLine";
import { SkriptPhrases } from "./SkriptPhrase";
import { SkriptToolTip } from "./SkriptToolTip";

export interface SkriptKeyValue<T> {
    range: Range,
    key: string,
    value: T
}

export abstract class SkriptParagraph {

    private readonly _skDocument: SkriptDocument;
    private readonly _range: Range;
    private readonly _title: string;
    private _skToolTip?: SkriptToolTip;
    
    constructor (skDocument:SkriptDocument, range:Range, title:string) {
        this._skDocument = skDocument;
        this._range = range;
        this._title = title;
    }

    public get document(): SkriptDocument {
        return this._skDocument;
    }
    public get range(): Range {
        return this._range;
    }
    public get title(): string {
        return this._title;
    }
    public get tooltip(): SkriptToolTip | undefined {
        return this._skToolTip;
    }
    public setToolTip(skTooltip:SkriptToolTip) {
        this._skToolTip = skTooltip;
    }
    abstract get symbolKind(): SymbolKind;


    public static create(skDocument: SkriptDocument, paragraph:string): SkriptParagraph | undefined {
        
        let range = skDocument.getRange(paragraph);
        if (!range)
            return;

        let search
        if (search = paragraph.match(/^(?<paragraph>(?<head>aliases)\:(.*)(?<body>((\r\n|\r|\n)([^a-zA-Z][^\r\n]*)?)+))/i)?.groups){
            return this._createAliases(skDocument, range, search.paragraph, search.head, search.body);

        } else if (search = paragraph.match(/^(?<paragraph>(?<head>options)\:(.*)(?<body>((\r\n|\r|\n)([^a-zA-Z][^\r\n]*)?)+))/i)?.groups) {
            return this._createOptions(skDocument, range, search.paragraph, search.head, search.body);
            
        } else if (search = paragraph.match(/^(?<paragraph>(?<head>on\s([^\:]+))\:(.*)(?<body>((\r\n|\r|\n)([^a-zA-Z][^\r\n]*)?)+))/i)?.groups) {
            return this._createEvent(skDocument, range, search.paragraph, search.head, search.body);
            
        } else if (search = paragraph.match(/^(?<paragraph>(?<head>command\s([^\:]*))\:(.*)(?<body>((\r\n|\r|\n)([^a-zA-Z][^\r\n]*)?)+))/i)?.groups) {
            return this._createCommand(skDocument, range, search.paragraph, search.head, search.body);
            
        } else if (search = paragraph.match(/^(?<paragraph>(?<head>function\s(?:\w+)\((?:.*)\)(?:\s\:\:\s(?:[^:]+))?)\:(.*)(?<body>(?:(?:\r\n|\r|\n)(?:[^a-zA-Z][^\r\n]*)?)+))/i)?.groups) {
            return this._createFunction(skDocument, range, search.paragraph, search.head, search.body);
            
        }
        
        return;

    }

    private static _createAliases(_skDocument:SkriptDocument, _range:Range, _paragraph:string, _head:string, _body:string): SkriptAliases {

        let phrases = new Array<SkriptKeyValue<string[]>>();
        for (const line of SkriptLine.split(_paragraph, _skDocument.offsetAt(_range.start))) {
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

    private static _createOptions(_skDocument:SkriptDocument, _range:Range, _paragraph:string, _head:string, _body:string): SkriptOptions {

        let phrases = new Array<SkriptKeyValue<string>>();
        for (const line of SkriptLine.split(_paragraph, _skDocument.offsetAt(_range.start))) {
            let groups = line.text.match(/(?:\t|\s{4})(?<option>(?<key>[^\:]+)\:(?<value>[^#]*))/)?.groups;
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

    private static _createEvent(_skDocument:SkriptDocument, _range:Range, _paragraph:string, _head:string, _body:string): SkriptEvent {

        console.log(_head);
        let skPhrases = SkriptPhrases.create();
        for (const line of SkriptLine.split(_paragraph, _skDocument.offsetAt(_range.start))) {
            console.log(line);
        }

        return new SkriptEvent(_skDocument, _range, _head, skPhrases);
    }

    private static _createCommand(_skDocument:SkriptDocument, _range:Range, _paragraph:string, _head:string, _body:string): SkriptCommand {

        let lines = SkriptLine.split(_paragraph, _skDocument.offsetAt(_range.start));

        let info: SkriptCommandInfomation = { label: 'label' };

        let search = lines[0].text.match(/\/(?<label>[^\s]+)(?:\s(?<arguments>[^:]*))?\:/)?.groups;
        if (search) {
            info.label = search.label;
            info.arguments = search.arguments
        }

        let options = new Array<SkriptKeyValue<string>>();
        let trigger = false;
        for (let i=0; i<lines.length; i++ ) {
            let line = lines[i];
            let groups
            if (groups = line.text.match(/(?:\t|\s{4})(?<option>(?<key>[^\t\s\:]+)\:(?<value>[^#]*))/)?.groups) {
                let option = groups.option.trim();
                let start = line.offset + line.text.indexOf(option);
                let key = groups.key.trim();
                if (key === 'trigger') {
                    trigger = true;
                } else {
                    options.push({
                        range: (() => {
                            return new Range(_skDocument.positionAt(start)!, _skDocument.positionAt(start + option.length)!)
                        })(),
                        key: key,
                        value: groups.value?.trim()
                    })
                }
            } else if (trigger) {
                if (groups = line.text.match(/(?:\t|\s{4}){2}(?<code>.*)/)?.groups) {
                } else {
                    trigger = false;
                }
            }
        }
        if (options.length > 0 ) {
            info.options = options
        }

        return new SkriptCommand(_skDocument, _range, info);
    }

    private static _createFunction(_skDocument:SkriptDocument, _range:Range, _paragraph:string, _head:string, _body:string): SkriptFunction | undefined {

        let offset = _skDocument.offsetAt(_range.start);
        
        let headGroup = _head.match(/^function\s(?<name>\w+)\((?<parameter>.*)\)(?:\s\:\:\s(?<type>[^:]+))?/i)?.groups;
        if (headGroup) {
            let parameters: SkriptFunctionParameter[] = [];
            let parameter = headGroup.parameter;
            let search
            while (search = parameter.match(/(?<parameter>(?<name>[^\,\:]*)\:(?<type>[^\,\=]*)(?:\=(?<default>[^\,]*))?\,?)/)?.groups) {
                parameters.push({
                    name: search.name.trim(),
                    type: search.type.trim(),
                    default: search.default?.trim()
                })
                parameter = parameter.replace(search.parameter, '');
            }
    
            let info: SkriptFunctionInfomation = {
                name: headGroup.name.trim(),
                parameters: parameters,
                type: headGroup.type?.trim()
            };

            return new SkriptFunction(_skDocument, _range, info);
        }

        return;

    }
}



export class SkriptAliases extends SkriptParagraph {

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



export class SkriptOptions extends SkriptParagraph {

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



export class SkriptEvent extends SkriptParagraph {

    private readonly _skPhrases: SkriptPhrase[];

    constructor(skDocument:SkriptDocument, range:Range, title:string) {
        super(skDocument, range, title);
    }


    /** ```
     * SymbolKind.Event
     * ``` */
    get symbolKind(): SymbolKind {
        return SymbolKind.Event;
    }

    get phrase(): SkriptPhrases {
        return this._skPhrases;
    }

    public setPhrases(...skPhrases:SkriptPhrase[]) {
        
    }
    
}




export interface SkriptCommandInfomation {
    label: string;
    arguments?: string;
    options?: SkriptKeyValue<string>[];
}

export class SkriptCommand extends SkriptParagraph {

    private readonly _info: SkriptCommandInfomation;

    constructor(skDocument:SkriptDocument, range:Range, info:SkriptCommandInfomation) {
        let title = `/${info.label}`;
        if (info.arguments) title += ` ${info.arguments}`;
        super(skDocument, range, title);
        this._info = info;
    }

    get label() {
        return this._info.label
    }

    get arguments() {
        return this._info.arguments
    }

    get options() {
        return this._info.options
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
    type: string | undefined
}

export interface SkriptFunctionParameter {
    name: string,
    type: string,
    default: string | undefined
}

export class SkriptFunction extends SkriptParagraph {

    private readonly _info: SkriptFunctionInfomation;

    constructor(skDocument:SkriptDocument, range:Range, info:SkriptFunctionInfomation) {
        let parameters = new Array<string>();
        for (const parameter of info.parameters!) {
            let text = `${parameter.name}:${parameter.type}`;
            if (parameter.default)
                text += `=${parameter.default}`
            parameters.push(text);
        }
        let title = `${info.name}(${parameters.join(', ')})${(info.type) ? ` :: ${info.type}` : `:`}`
        super(skDocument, range, title);
        this._info = info;

    }

    get name(): string {
        return this._info.name;
    }

    get parameters(): SkriptFunctionParameter[] | undefined {
        return this._info.parameters;
    }

    get returnType(): string | undefined {
        return this._info.type;
    }
    /** ```
     * SymbolKind.Function
     * ``` */
    get symbolKind(): SymbolKind {
        return SymbolKind.Function;
    }
    
}