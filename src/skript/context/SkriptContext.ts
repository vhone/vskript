import { Range } from "vscode";

export class SkriptContext {

    constructor (
        private readonly _range: Range
    ) {}

    public get range() {
        return this._range;
    }

}









export class SkriptCondition extends SkriptContext {

}

export class SkriptCondComparison {
    constructor(
        private readonly _type: SkriptCondComparisonType,
        private readonly _a: string,
        private readonly _b: string
    ) {}
}

export enum SkriptCondComparisonType {
    BIGGER,
    BIGGER_OR_EQUAL,
    EQUAL,
    SMALLER,
    SMALLER_OR_EQUAL
}