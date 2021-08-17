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

    private readonly _opener: string;
    private readonly _closer: string;
    private readonly _escape: string[] | undefined;

    private _index = 0;

    private readonly _isDouble;

    constructor(opener:string, closer:string, escape?:string[]) {
        super()
        this._opener = opener;
        this._closer = closer;
        this._escape = escape;
        this._isDouble = opener === closer;
    }

    public exec(text: string, index?: number): SkriptPatternResult | undefined {
        console.log('[SkPatternBracket]')

        if (!index) index = this._index;
        
        let start = text.indexOf(this._opener, index);
        if (start < 0) {
            return
        } else {
            index = start + 1;
        }

        let end = text.indexOf(this._closer, index);
        console.log(`this._opener=[${this._opener}], start=[${start}], index=[${index}], end=[${end}]`);

        if (this._escape) for (const escape of this._escape) {
            let pos = text.indexOf(escape, index);
            console.log(`escape=[${escape}], pos=[${pos}], end=[${end}]`)
            if (0 <= pos && pos <= end) {
                index = pos + escape.length + 1;
                end = text.indexOf(this._closer, index);
            }
        }

        for (const name of this._include) {
            let pattern = REPOSITORY.get(name);
            if (pattern) {
                console.log(`inner pattern=[${pattern.name}]`)
                let raw_pattern = pattern.getPattern();
                if (raw_pattern instanceof SkriptPatternBracket) {
                    while (text.substring(index, end).indexOf(raw_pattern._opener) >= 0) {
                        console.log(`inner string=[${text.substring(index, end)}], index=[${index}]`)
                        let result = raw_pattern.exec(text, index);
                        if (!result) break;
                        index = result.index + result.search.length;
                        end = text.indexOf(this._closer, index );
                        console.log(`end=[${end}], index=${index}`)
                    }
                }

            }
        }

        console.log(`this._closer=[${this._closer}], end=[${end}], index=[${index}]`);
        if (end < 0) {
            index = text.length;
        } else {
            index = end + 1;
        }

        this._index = index;

        console.log(`   > ${text.substring(start, index)}`)
        return { index: start, search: text.substring(start, index) };

    }


}