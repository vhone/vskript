import { ParameterInformation } from "vscode";
import { SkriptType } from "../element/SkriptType";


interface SkriptPatternResult {
    index: number,
    text: string
}

class SkriptPatternRepository {



}

export abstract class SkriptPattern {

    protected readonly _name: string;
    protected readonly _include = new Set<string>();

    protected constructor(name:string) {
        this._name = name;
    }

    get name(): string {
        return this._name;
    }

    public addInclude(...names: string[]): SkriptPattern {
        for(const name of names) {
            this._include.add(name);
        }
        return this;
    }

    abstract exec(text: string): SkriptPatternResult | undefined
    abstract getLastIndex(): number;
    abstract setLastIndex(i: number): void;



    private static readonly _repository = new Map<string,SkriptPattern>();
    
    public static create(name:string, opener:string, closer:string, escape?:string[]): SkriptPattern;
    public static create(name:string, rexexp:string): SkriptPattern;
    public static create(name:string, arg1:string, arg2?:string, arg3?:string[]): SkriptPattern {
        if (!arg2) {
            return new SkriptPatternRegexp(name, arg1);
        } else {
            return new SkriptPatternBracket(name, arg1, arg2, arg3);
        }
    }

    public static register(...patterns:SkriptPattern[]) {
        for (const pattern of patterns) {
            SkriptPattern._repository.set(pattern.name, pattern);
        }
    }

    public static find(name:string): SkriptPattern | undefined {
        return this._repository.get(name);
    }

}

class SkriptPatternRegexp extends SkriptPattern {
    
    private readonly _regexp;

    constructor(name: string, regexp: string) {
        super(name)
        this._regexp = new RegExp(regexp, 'g');
    }
    
    public getLastIndex(): number {
        return this._regexp.lastIndex;
    }
    public setLastIndex(i: number) {
        this._regexp.lastIndex = i;
    }
    
    public exec(text: string): SkriptPatternResult | undefined {
        let match = this._regexp.exec(text);
        return ( match ) ? { index: match.index, text: match[0] } : undefined;
    }

}

class SkriptPatternBracket extends SkriptPattern {

    private readonly _opener: RegExp;
    private readonly _closer: RegExp;
    private readonly _escape: RegExp[] | undefined;

    private _lastIndex: number = 0;

    constructor(name: string, opener:string, closer:string, escape?:string[]) {
        super(name)
        this._opener = new RegExp(opener, 'g');
        this._closer = new RegExp(closer, 'g');
        if (escape) {
            let array = new Array<RegExp>();
            for (const e of escape) {
                array.push(new RegExp(e, 'g'))
            }
            if (array.length > 0) {
                this._escape = array;
            }
        }
    }

    public getLastIndex(): number {
        return this._lastIndex;
    }
    public setLastIndex(i:number) {
        this._lastIndex = i;
    }

    public exec(text: string, index?:number): SkriptPatternResult | undefined {
        let start = (index) ? index : this._lastIndex;
        let end = start;

        // Opener
        this._opener.lastIndex = start;
        let matchOpener = this._opener.exec(text);
        if (!matchOpener) {
            return
        } else {
            start = matchOpener.index;
            end = this._opener.lastIndex;
        }

        // Closer
        this._closer.lastIndex = end;
        let matchCloser = this._closer.exec(text);
        if (!matchCloser) {
            return
        } else {
            end = this._closer.lastIndex;
        }
        
        /** 보조 시작 위치 */
        let subStart = start + 1;
        let existEscape = true
        let existInclude = true;
        while (existEscape || existInclude) {
            
            // Escape
            existEscape = false;
            if (this._escape) for (const escape of this._escape) {
                escape.lastIndex = subStart;
                let matchEscape
                while(matchEscape = escape.exec(text)) {

                    if (matchEscape.index >= this._closer.lastIndex) {
                        break;
                    }

                    subStart = escape.lastIndex;
                    
                    this._closer.lastIndex = subStart;
                    let matchCloser = this._closer.exec(text);
                    if (!matchCloser) {
                        return;
                    } else {
                        end = this._closer.lastIndex;
                        existEscape = true;
                    }
                }
            }
    
            // Include
            existInclude = false;
            for (const name of this._include) {
                let include = SkriptPattern.find(name);
                if (!include) continue
                
                if (include instanceof SkriptPatternRegexp) {
                    include.setLastIndex(subStart);

                } else if (include instanceof SkriptPatternBracket) {
    
                    // Include Opener
                    include._opener.lastIndex = subStart;
                    let matchIncludeOpener
                    while (matchIncludeOpener = include._opener.exec(text)) {

                        if (matchIncludeOpener.index >= this._closer.lastIndex) {
                            break;
                        }

                        include._lastIndex = matchIncludeOpener.index;
                        let search = include.exec(text);
                        subStart = include._lastIndex;

                        // This Closer
                        this._closer.lastIndex = subStart;
                        let matchCloser = this._closer.exec(text);
                        if (!matchCloser) {
                            return;
                        } else {
                            end = this._closer.lastIndex;
                            existInclude = true;
                        }
                        
                        // Include Opener
                        include._opener.lastIndex = subStart;
    
                    } 
                }
            }
        }

        this._lastIndex = end;
        return { index: start, text: text.substring(start, end) };

    }


}


const text = SkriptPattern.create('text', '"', '"', ['""', '%%'])
    .addInclude('nested_expression');

const variable = SkriptPattern.create('normal_variable', '{', '}')
    .addInclude('nested_expression');

const nested = SkriptPattern.create('nested_expression', '%', '%')
    .addInclude('text')
    .addInclude('normal_variable');

SkriptPattern.register(text, variable, nested);
