import { SkriptComponent } from "./SkriptComponent";
import { Range } from "vscode";
import { SkriptVariable } from "./language/SkriptExpressions";
import { SkriptDocument } from "./SkriptDocument";

export class SkriptParagraph {

    private readonly _skDocument: SkriptDocument;
    private readonly _skComponent: SkriptComponent;
    private readonly _range: Range;
    private readonly _paragraph: string;

    private readonly _variables: SkriptVariable[] = [];

    constructor(skComponent:SkriptComponent, range:Range, paragraph:string) {
        this._skComponent = skComponent;
        this._skDocument = skComponent.document;
        this._range = range;
        this._paragraph = paragraph;

        this._setVariables();
    }

    public get range(): Range {
        return this._range;
    }
    public get variables(): SkriptVariable[] {
        return this._variables;
    }
    public get legacy(): string {
        return this._paragraph;
    }

    // 글자 = "%익스프레션%, %변수%, %함수%"
    // 변수 = {%익스프레션%::%변수%}
    // 함수 = func( 익스프레션, 변수, 함수 )
    // 익스프레션 = 패턴 + 익스프레션, 변수, 함수

    private _setVariables() {

        let local_index = this._skDocument.offsetAt(this._range.start);

        let position = 0;
        let index;
        do {
            index = this._paragraph.indexOf('{', position);
            if (index > 0) {
                let variable = this._findVariable(this._paragraph, index, local_index);
                if (!variable)
                    break;
                this._variables.push(variable);
    
                position = index + variable.expr.length + 1;
            }
        }
        while (index > 0);
    }

    private _findVariable(paragraph:string, index:number, local_index:number): SkriptVariable | undefined {
        if (index > 0) {
            paragraph = paragraph.substr(index);
        }
    
        let opener = '{',
            closer = '}',
            nest = '%',
            stack = 0,
            start = -1,
            isNested = false,
            regexp = new RegExp(`${opener}|${nest}|${closer}`, 'g'),
            child: SkriptVariable[] = [];
    
        let search;
        while (search = regexp.exec(paragraph)) {
            if (search[0] === opener) {
                if (start < 0)
                    start = search.index;
                stack ++;

            } else if (search[0] === nest) {
                if (start < 0) {
                    return;
                }
                if (isNested) {
                    isNested = false;
                } else {
                    isNested = true;
                    let v = this._findVariable(paragraph, search.index + 1, local_index + index);
                    if (v) {
                        regexp.lastIndex = search.index + v.expr.length + 1;
                        child.push(v);
                    }
                }
            
            } else if (start < 0) {
                continue;
    
            } else if (search[0] === closer) {
                stack--;
                if (stack === 0) {
                    let expr = paragraph.substring(start, search.index + 1);
                    let ragne = new Range(this._skDocument.positionAt(local_index + index + start)!, this._skDocument.positionAt(local_index + index + start + expr.length)!);
                    let variable = new SkriptVariable(ragne, expr, expr);
                    variable.child.push(...child);
                    return variable;
                }
            }
        }

    
        return;
    }

}       
    


