import { Range } from "vscode";
import { SkriptContext } from "./SkriptContext";



export class SkriptExpression extends SkriptContext {

    private _parent: SkriptExpression | undefined;
    private readonly _children = new Set<SkriptExpression>();

    constructor(
        range: Range,
        private readonly _code: string
    ) {
        super(range);
    }

    public get code() {
        return this._code;
    }
    public getParent() {
        return this._parent;
    }
    public setParent(parent:SkriptExpression) {
        this._parent = parent;
    }
    public addChildren(child:SkriptExpression) {
        this._children.add(child);
    }
    public getChildren(): Set<SkriptExpression> {
        return Object.assign(this._children, {});
    }

}



export class SkriptExprNull extends SkriptExpression {

}

export class SkriptExprVariable extends SkriptExpression {

    // constructor(range:Range, code:string) {
    //     super(range, code);
    // }

}



export class SkriptExprFunction extends SkriptExpression {
    
    constructor(range: Range, code: string, 
        private readonly _name: string
    ) {
        super(range, code);
    }

    public get name(): string {
        return this._name;
    }

}



// 글자 안에 있는 익스프레션
// "text %{_value}%"
// "text %function( "값 %{_value}%") %"
export class SkriptExprText extends SkriptExpression {

    // constructor (range: Range, code: string) {
    //     super(range, code);
    // }

}