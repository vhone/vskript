import { Range, SymbolKind } from "vscode";
import { SkriptDocument } from "./SkriptDocument";
import { SkriptLine } from "./SkriptLine";
import { SkriptToolTip } from "./SkriptToolTip";


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
}



export class SkriptParagraphBuilder {

    private _paragraph: string;

    private _skDocument: SkriptDocument;
    private _skToolTip?: SkriptToolTip;

    constructor (skDocument: SkriptDocument, paragraph:string) {
        this._skDocument = skDocument;
        this._paragraph = paragraph;
    }

    public setToolTip(skToolTip:SkriptToolTip): SkriptParagraphBuilder {
        this._skToolTip = skToolTip;
        return this;
    }
    
    public build(): SkriptParagraph | undefined {

        let range = this._skDocument.getRange(this._paragraph);
        if (!range)
            return;

        let search
        if (search = this._paragraph.match(/^(?<paragraph>(?<head>aliases)\:(.*)(?<body>((\r\n|\r|\n)([^a-zA-Z][^\r\n]*)?)+))/i)?.groups){
            return this._createAliases(range, search.paragraph, search.head, search.body);

        } else if (search = this._paragraph.match(/^(?<paragraph>(?<head>options)\:(.*)(?<body>((\r\n|\r|\n)([^a-zA-Z][^\r\n]*)?)+))/i)?.groups) {
            return this._createOptions(range, search.paragraph, search.head, search.body);
            
        } else if (search = this._paragraph.match(/^(?<paragraph>(?<head>on\s([^\:]+))\:(.*)(?<body>((\r\n|\r|\n)([^a-zA-Z][^\r\n]*)?)+))/i)?.groups) {
            return this._createEvent(range, search.paragraph, search.head, search.body);
            
        } else if (search = this._paragraph.match(/^(?<paragraph>(?<head>command\s([^\:]*))\:(.*)(?<body>((\r\n|\r|\n)([^a-zA-Z][^\r\n]*)?)+))/i)?.groups) {
            return this._createCommand(range, search.paragraph, search.head, search.body);
            
        } else if (search = this._paragraph.match(/^(?<paragraph>(?<head>function\s(?:\w+)\((?:.*)\)(?:\s\:\:\s(?:[^:]+))?)\:(.*)(?<body>(?:(?:\r\n|\r|\n)(?:[^a-zA-Z][^\r\n]*)?)+))/i)?.groups) {
            return this._createFunction(range, search.paragraph, search.head, search.body);
            
        }
        
        return;

    }

    private _createAliases(range:Range, paragraph:string, head:string, body:string): SkriptAliases {

        let offset = this._skDocument.offsetAt(range.start);

        let phrases = new Array<SkriptKeyValue<string[]>>();

        for (const line of SkriptLine.split(paragraph)) {
            let groups = line.text.match(/(?:\t|\s{4})(?<aliase>(?<key>[^\=]+)\=(?<values>[^#]*))/)?.groups;
            if (!groups)
                continue;
            let aliase = groups.aliase.trim();
            let start = offset + line.offset + line.text.indexOf(aliase);
            let phrase: SkriptKeyValue<string[]> = {
                range: (() => {
                    return new Range(this._skDocument.positionAt(start)!, this._skDocument.positionAt(start + aliase.length)!)
                })(),
                key: groups.key.trim(),
                value : groups.values.split(',').map(value => value.trim())
            }
            phrases.push(phrase);
        }
        return new SkriptAliases(this._skDocument, range, head, phrases, this._skToolTip);
        
    }

    private _createOptions(range:Range, paragraph:string, head:string, body:string): SkriptOptions {

        let offset = this._skDocument.offsetAt(range.start);

        let phrases = new Array<SkriptKeyValue<string>>();
        for (const line of SkriptLine.split(paragraph)) {
            let groups = line.text.match(/(?:\t|\s{4})(?<option>(?<key>[^\:]+)\:(?<value>[^#]*))/)?.groups;
            if (!groups)
                continue;
            let option = groups.option.trim();
            let start = offset + line.offset + line.text.indexOf(option);
            let phrase: SkriptKeyValue<string> = {
                range: (() => {
                    return new Range(this._skDocument.positionAt(start)!, this._skDocument.positionAt(start + option.length)!)
                })(),
                key: groups.key.trim(),
                value : groups.value.trim()
            }
            phrases.push(phrase);
        }
        return new SkriptOptions(this._skDocument, range, head, phrases, this._skToolTip);
    }

    private _createEvent(range:Range, paragraph:string, head:string, body:string): SkriptEvent {
        return new SkriptEvent(this._skDocument, range, head);
    }

    private _createCommand(range:Range, paragraph:string, head:string, body:string): SkriptCommand {

        let offset = this._skDocument.offsetAt(range.start);
        let lines = SkriptLine.split(paragraph);

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
            if (groups = line.text.match(/(?:\t|\s{4})(?<option>(?<key>[^\:]+)\:(?<value>[^#]*))/)?.groups) {
                let option = groups.option.trim();
                let start = offset + line.offset + line.text.indexOf(option);
                let key = groups.key.trim();
                if (key === 'trigger') {
                    trigger = true;
                } else {
                    options.push({
                        range: (() => {
                            return new Range(this._skDocument.positionAt(start)!, this._skDocument.positionAt(start + option.length)!)
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

        return new SkriptCommand(this._skDocument, range, info, this._skToolTip);
    }

    private _createFunction(range:Range, paragraph:string, head:string, body:string): SkriptFunction | undefined {

        let offset = this._skDocument.offsetAt(range.start);
        
        let headGroup = head.match(/^function\s(?<name>\w+)\((?<parameter>.*)\)(?:\s\:\:\s(?<type>[^:]+))?/i)?.groups;
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

            return new SkriptFunction(this._skDocument, range, info, this._skToolTip);
        }

        return;

    }

}



interface SkriptKeyValue<T> {
    range: Range,
    key: string,
    value: T
}

export class SkriptAliases extends SkriptParagraph {

    private readonly _phrases = new Array<SkriptKeyValue<string[]>>();

    constructor(skDocument:SkriptDocument, range:Range, title:string, phrases:SkriptKeyValue<string[]> [], skToolTip?:SkriptToolTip) {
        super(skDocument, range, title, skToolTip)
        this._phrases.push(...phrases);
    }

    /** ```
     * SymbolKind.Constant
     * ``` */
    get symbolKind(): SymbolKind {
        return SymbolKind.Constant;
    }

    public get phrases(){
        return this._phrases
    }
    
}



export class SkriptOptions extends SkriptParagraph {

    private readonly _phrases = new Array<SkriptKeyValue<string>>();

    constructor(skDocument:SkriptDocument, range:Range, title:string, phrases:SkriptKeyValue<string>[], skToolTip?:SkriptToolTip) {
        super(skDocument, range, title, skToolTip)
        this._phrases.push(...phrases);
    }

    /** ```
     * SymbolKind.Constant
     * ``` */
    get symbolKind(): SymbolKind {
        return SymbolKind.Constant;
    }

    public get phrases(){
        return this._phrases
    }

}



export class SkriptEvent extends SkriptParagraph {

    /** ```
     * SymbolKind.Event
     * ``` */
    get symbolKind(): SymbolKind {
        return SymbolKind.Event;
    }
    
}



interface SkriptCommandInfomation {
    label: string;
    arguments?: string;
    options?: SkriptKeyValue<string>[];
}

export class SkriptCommand extends SkriptParagraph {

    private readonly _info: SkriptCommandInfomation;

    constructor(skDocument:SkriptDocument, range:Range, info:SkriptCommandInfomation, skToolTip?:SkriptToolTip) {
        let title = `/${info.label}`;
        if (info.arguments) title += ` ${info.arguments}`;
        super(skDocument, range, title, skToolTip);
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



interface SkriptFunctionInfomation {
    name: string,
    parameters: SkriptFunctionParameter[] | undefined,
    type: string | undefined
}

interface SkriptFunctionParameter {
    name: string,
    type: string,
    default: string | undefined
}

export class SkriptFunction extends SkriptParagraph {

    private readonly _info: SkriptFunctionInfomation;

    constructor(skDocument:SkriptDocument, range:Range, info:SkriptFunctionInfomation, skToolTip?:SkriptToolTip) {
        let parameters = new Array<string>();
        for (const parameter of info.parameters!) {
            let text = `${parameter.name}:${parameter.type}`;
            if (parameter.default)
                text += `=${parameter.default}`
            parameters.push(text);
        }
        let title = `${info.name}(${parameters.join(', ')})${(info.type) ? ` :: ${info.type}` : `:`}`
        super(skDocument, range, title, skToolTip)
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