import { stringify } from "node:querystring";



interface SkriptPatternInfo {
    index: number
    text: string
}

export abstract class SkriptPattern {

    protected _index = 0;

    abstract search(text:string, position?:number): SkriptPatternInfo | undefined;

    /**
     * set search index to 0
     */
    public reset() {
        this._index = 0;
    }

    public static create(regexp:RegExp): SkriptPattern;
    public static create(opener:string, closer:string): SkriptPattern;
    public static create(a:any, b?:any): SkriptPattern | undefined {
        if (a instanceof RegExp) {
            return new SkriptRegexpPattern(a);
        } else if (b && typeof a === 'string' && typeof b === 'string') {
            return new SkriptBracketPattern(a, b);
        }
        return;
    }

}

class SkriptRegexpPattern extends SkriptPattern {

	private readonly _regexp: RegExp;

	constructor(regexp:RegExp) {
        super();
		this._regexp = regexp;
	}

    public search(text: string, position?: number): SkriptPatternInfo | undefined {

        if (!position)
            position = this._index;

        let search = text.substring(position).match(this._regexp);
        if (search) {
            let index = search.index!;
            if(index > -1) {
                this._index = position + index + search[0].length;
                return {
                    index: position + index,
                    text: search[0]
                }
            }
        }

        return;

    }
    
    

}

class SkriptBracketPattern extends SkriptPattern {

	private readonly _opener: string;
	private readonly _closer: string;

	constructor(opener:string,closer:string) {
        super();
		this._opener = opener;
		this._closer = closer;
	}

    /**
     * @param text 찾을 글자 
     * @param position 찾을 위치
     * @returns ```SkriptPatternInfo```
     */
	public search(text:string, position?:number): SkriptPatternInfo | undefined {

        if (!position)
            position = this._index;
        
        // opener - fix
        let start = text.indexOf(this._opener, position);
        if (start < 0)
            return

        // closer - extend
        let end = text.indexOf(this._closer, position);
        if (end < 0)
            return

        // sub string - move
        let subStart = start + 1;
        let subText = text.substring(subStart, end);
        let index = subText.indexOf(this._opener,0);
        while (index >= 0) {

            //move
            subStart += index + 1;

            // extend
            end = text.indexOf(this._closer, end + 1);
            if (end < 0) {
                end = text.length - 1;
                break;
            }

            subText = text.substring(subStart , end);
            index = subText.indexOf(this._opener,0);

        }

        this._index = end + 1;
		return {
            index: start,
            text: text.substring(start,end + 1)
        }
	}

}