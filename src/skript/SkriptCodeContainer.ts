export interface SkriptCodeBlock {
    readonly _code:string;
    readonly _lines:string;
}

export class SkriptCodeContainer {

    private readonly _lines: string[];

    constructor(
        private readonly _code: string
    ) {
        this._lines = new Array<string>(...this._code.split(/\r\n|\r|\n/i));

    }

    
    public get code() : string {
        return this._code;
    }
    public get lines() : string[] {
        return this._lines;
    }
    
}