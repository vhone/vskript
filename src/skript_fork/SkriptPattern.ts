


interface SkriptPatternInfo {
    index: number
    text: string
}

export abstract class SkriptPattern {

    protected constructor() {
    }
}

export class SkriptRegexPattern extends SkriptPattern {

	private readonly _regexp: RegExp;

	constructor(regexp:RegExp) {
        super();
		this._regexp = regexp;
	}

}

export class SkriptBracketPattern extends SkriptPattern {

	private readonly _opener: string;
	private readonly _closer: string;
    private _index = 0;

	constructor(opener:string,closer:string) {
        super();
		this._opener = opener;
		this._closer = closer;
	}

    /**
     * set search index to 0
     */
    public reset() {
        this._index = 0;
    }

    /**
     * @param text 찾을 글자 
     * @param position 찾을 위치
     * @returns ```SkriptPatternInfo```
     */
	public search(text:string, position?:number): SkriptPatternInfo | undefined {

        if (!position)
            position = this._index;
        
        // opener
        let start = text.indexOf(this._opener, position);
        if (start < 0)
            return

        // closer
        let end = text.indexOf(this._closer, position);
        if (end < 0)
            return

        // sub string
        let subStr = text.substring(start + 1,end);
        let index = subStr.indexOf(this._opener,0);
        while (index >= 0) {
            index = subStr.indexOf(this._opener,index + 1);

            // extend
            end = text.indexOf(this._closer, end + 1);
            if (end < 0) {
                end = text.length - 1;
                break;
            }

        }

        this._index = end + 1;
		return {
            index: start,
            text: text.substring(start,end + 1)
        }
	}

}