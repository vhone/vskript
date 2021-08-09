const REPOSITORY = new Map<string,SkriptPattern>();

export class SkriptPattern implements ISkriptPattern{

    public static getPattern(name:string): SkriptPattern | undefined {
        return REPOSITORY.get(name);
    }

    private readonly _name: string;
    private readonly _pattern: ISkriptPattern;

    private readonly _include = new Set<string>();

    constructor(name:string, opener:string, closer:string)
    constructor(name:string, regexp:RegExp)
    constructor(name:string, arg1:any, arg2?:any) {
        if (arg1 instanceof RegExp) {
            this._pattern = new SkriptPatternRegexp(arg1);
        } else if (typeof arg1 === 'string' && typeof arg2 === 'string') {
            this._pattern = new SkriptPatternBracket(arg1, arg2);
        } else {
            throw new Error("invalid Arguments.")
        }
        this._name = name;
        REPOSITORY.set(name, this);
    }

    get name(): string {
        return this._name;
    }

    public addInclude(...names:string[]) {
        for(const name of names) {
            this._include.add(name);
        }
    }

    public exec(text:string): SkriptPatternResult | undefined {
        return this._pattern.exec(text);
    }

}

interface ISkriptPattern {
    exec(text:string): SkriptPatternResult | undefined
}

interface SkriptPatternResult {
    index: number,
    search: string
}

class SkriptPatternRegexp implements ISkriptPattern {
    
    private readonly _regexp;

    constructor(regexp:RegExp) {
        this._regexp = regexp;
    }
    
    public exec(text: string): SkriptPatternResult | undefined {
        console.log('[SkPatternRegexp]')
        let match = this._regexp.exec(text);
        return ( match ) ? { index: match.index, search: match[0] } : undefined;
    }

}

class SkriptPatternBracket implements ISkriptPattern {

    private readonly _opener:string;
    private readonly _closer:string;

    private _index: number = 0;

    constructor(opener:string, closer:string) {
        this._opener = opener;
        this._closer = closer;
    }

    public exec(text: string): SkriptPatternResult | undefined {
        console.log('[SkPatternBracket]')
        
        let start = text.indexOf(this._opener, this._index);
        if (start < 0)
            return

        let end = text.indexOf(this._closer, this._index);
        if (end < 0) {
            this._index = text.length;
        } else {
            this._index = start + end + 1;
        }

        return { index: start, search: text.substring(start, this._index) };

    }

}