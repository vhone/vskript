import { Position } from "vscode";

const REPOSITORY = new Map<string,SkriptPattern>();

export class SkriptPattern implements ISkriptPattern{

    public static getPattern(name:string): SkriptPattern | undefined {
        return REPOSITORY.get(name);
    }

    private readonly _name: string;
    private readonly _pattern: ISkriptPattern;

    constructor(name:string, opener:string, closer:string, escape?:string[])
    constructor(name:string, regexp:RegExp)
    constructor(name:string, arg1:any, arg2?:any, arg3?:any) {
        if (arg1 instanceof RegExp) {
            this._pattern = new SkriptPatternRegexp(arg1);
        } else if (typeof arg1 === 'string' && typeof arg2 === 'string') {
            this._pattern = new SkriptPatternBracket(arg1, arg2, arg3);
        } else {
            throw new Error("invalid Arguments.")
        }
        this._name = name;
        REPOSITORY.set(name, this);
        console.log(REPOSITORY)
    }

    get name(): string {
        return this._name;
    }

    public addInclude(...names:string[]) {
        this._pattern.addInclude(...names)
    }

    public exec(text:string): SkriptPatternResult | undefined {
        return this._pattern.exec(text);
    }
    
    public isBracket(): boolean {
        return this._pattern instanceof SkriptPatternBracket
    }
    public isRegexp(): boolean {
        return this._pattern instanceof SkriptPatternRegexp
    }

    public getPattern(): ISkriptPattern {
        return this._pattern;
    }

}

interface ISkriptPattern {
    exec(text:string): SkriptPatternResult | undefined
    addInclude(...names:string[]): void
}

interface SkriptPatternResult {
    index: number,
    search: string
}



abstract class SkriptPatternAbstract implements ISkriptPattern {

    protected readonly _include = new Set<string>();

    public addInclude(...names: string[]) {
        for(const name of names) {
            this._include.add(name);
        }
    }

    abstract exec(text: string): SkriptPatternResult | undefined

}

class SkriptPatternRegexp extends SkriptPatternAbstract {
    
    private readonly _regexp;

    constructor(regexp:RegExp) {
        super()
        this._regexp = regexp;
    }
    
    public exec(text: string): SkriptPatternResult | undefined {
        console.log('[SkPatternRegexp]')
        let match = this._regexp.exec(text);
        return ( match ) ? { index: match.index, search: match[0] } : undefined;
    }

}

class SkriptPatternBracket extends SkriptPatternAbstract {

    private readonly _opener: RegExp;
    private readonly _closer: RegExp;
    private readonly _escape: RegExp[] | undefined;

    private _searchString: string = '';
    private _lastIndex: number = 0;

    constructor(opener:string, closer:string, escape?:string[]) {
        super()
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

    public exec(text: string, index?:number): SkriptPatternResult | undefined {
        console.log(`[SkriptPatternBracket] (${this._opener}, ${this._closer})`)
        
        let start = (index) ? index : this.lastIndex;
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
        let subStart = start;
        let subEnd = end;
        let existEscape = true
        let existInclude = true;
        sub: while (existEscape || existInclude) {
            
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
                let pattern = REPOSITORY.get(name);
                if (!pattern) continue
    
                let include = pattern.getPattern();
    
                if (include instanceof SkriptPatternBracket) {
    
                    // Include Opener
                    include._opener.lastIndex = subStart;
                    let matchIncludeOpener
                    while (matchIncludeOpener = include._opener.exec(text)) {

                        if (matchIncludeOpener.index >= this._closer.lastIndex) {
                            break;
                        }

                        include.lastIndex = matchIncludeOpener.index;
                        let search = include.exec(text);
                        subStart = include.lastIndex;
                        console.log(search)

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

            console.log(existEscape, existInclude, `subStart=${subStart}, end=${end}`)

        }

        this._lastIndex = end;
        return { index: start, search: text.substring(start, end) };

    }

    public get lastIndex(): number {
        return this._lastIndex;
    }
    public set lastIndex(i:number) {
        this._lastIndex = i;
    }


}