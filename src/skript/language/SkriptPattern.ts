export class SkriptPattern implements ISkriptPattern{

    public static getPattern(name:string): SkriptPattern | undefined {
        return REPOSITORY.get(name);
    }



    private readonly _name: string;
    private readonly _pattern: ISkriptPattern;
    
    private _lastIndex: number = 0;

    constructor(name:string, opener:string, closer:string, escape?:string[])
    constructor(name:string, regexp:string)
    constructor(name:string, arg1:any, arg2?:any, arg3?:any) {
        if (!arg2) {
            this._pattern = new SkriptPatternRegexp(new RegExp(arg1, 'g'));
        } else if (typeof arg1 === 'string' && typeof arg2 === 'string') {
            this._pattern = new SkriptPatternBracket(new RegExp(arg1, 'g'), new RegExp(arg2, 'g'), arg3);
        } else {
            throw new Error("invalid Arguments.")
        }
        this._name = name;
    }

    get name(): string {
        return this._name;
    }
    public getLastIndex(): number {
        return this._pattern.getLastIndex();
    }
    public setLastIndex(i: number) {
        this._pattern.setLastIndex(i) ;
    }

    public addInclude(...names:string[]) {
        this._pattern.addInclude(...names)
    }

    public exec(text:string): SkriptPatternResult | undefined {
        let result = this._pattern.exec(text, this._lastIndex);
        return result;
    }
    
    public get isBracket(): boolean {
        return this._pattern instanceof SkriptPatternBracket
    }
    public get isRegexp(): boolean {
        return this._pattern instanceof SkriptPatternRegexp;
    }

    public getPattern(): ISkriptPattern {
        return this._pattern;
    }

}

interface ISkriptPattern {
    exec(text:string, index?:number): SkriptPatternResult | undefined;
    addInclude(...names:string[]): void;
    getLastIndex(): number;
    setLastIndex(i:number): void;
}

interface SkriptPatternResult {
    index: number,
    text: string
}



abstract class SkriptPatternAbstract implements ISkriptPattern {

    protected readonly _include = new Set<string>();

    public addInclude(...names: string[]) {
        for(const name of names) {
            this._include.add(name);
        }
    }

    abstract exec(text: string): SkriptPatternResult | undefined
    abstract getLastIndex(): number;
    abstract setLastIndex(i: number): void;

}

class SkriptPatternRegexp extends SkriptPatternAbstract {
    
    private readonly _regexp;

    constructor(regexp:RegExp) {
        super()
        this._regexp = regexp;
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

class SkriptPatternBracket extends SkriptPatternAbstract {

    private readonly _opener: RegExp;
    private readonly _closer: RegExp;
    private readonly _escape: RegExp[] | undefined;

    private _searchString: string = '';
    private _lastIndex: number = 0;

    constructor(opener:RegExp, closer:RegExp, escape?:string[]) {
        super()
        this._opener = opener;
        this._closer = closer;
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



const REPOSITORY = (() => {

    let repository = new Map<string,SkriptPattern>();
    
	let text = new SkriptPattern('text', '"', '"', ['""', '%%']);
	text.addInclude('nested_expr');
	repository.set(text.name, text);

	let variable = new SkriptPattern('variable', '{', '}');
	variable.addInclude('nested_expr');
	repository.set(variable.name, variable);

	let nested = new SkriptPattern('nested_expr', '%', '%');
	nested.addInclude('text');
	nested.addInclude('variable');
	repository.set(nested.name, nested);

    return repository

})()