import { SkriptComponent, SkriptKeyValue, SkriptOptions } from "./SkriptComponent";
import { Position, Range } from "vscode";
import { SkriptVariable } from "./SkriptExpression";
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

    // private _setVariables() {

    //     let list = new Array<{index:number,value:boolean}>();
    //     let regex_start = new RegExp(/\{/, 'g');
    //     let regex_end = new RegExp(/\}/, 'g');

    //     // 괄호 위치 탐색
    //     let search
    //     while (search = regex_start.exec(this._paragraph)) {
    //         list.push({index: search.index, value: true});
    //     }
    //     while (search = regex_end.exec(this._paragraph)) {
    //         list.push({index: search.index, value: false});
    //     }
        
    //     let document = this._skComponent.document;
    //     let offset = document.offsetAt(this._range.start);

    //     let bracket = 0
    //     let position = {start:-1, end:-1};
    //     for (const v of list.sort((a,b)=>{ return a.index - b.index})) {
    
    //         if (v.value) {
    //             if (bracket === 0) position.start = v.index;
    //             bracket++;
    //         } else {
    //             bracket--;
    //             if (bracket === 0) position.end = v.index + 1;
    //         }
    
    //         if (position.start > -1 && position.end > -1) {
    //             let range = new Range(document.positionAt(offset + position.start)!, document.positionAt(offset + position.end)!)
    //             let variable = this._paragraph.substring(position.start, position.end);
    //             let raw_variable = variable.replace(/\%[^%]+%/, '*').replace(/\:\:\d+\}/, '::*}')
    //             for (const options of document.getComponents(SkriptOptions)) {
    //                 for (const option of options.options) {
    //                     raw_variable = raw_variable.replace(`{@${option.key}}`, option.value);
    //                 }
    //             }
    //             this._variables.push(new SkriptVariable(range, variable, raw_variable));
    //             position = {start:-1, end:-1};
    //         }
    
    //     }

    //     // console.log(this._variables);
    // }

    // 글자 = "%익스프레션%, %변수%, %함수%"
    // 변수 = {%익스프레션%::%변수%}
    // 함수 = func( 익스프레션, 변수, 함수 )
    // 익스프레션 = 패턴 + 익스프레션, 변수, 함수

    private _setVariables() {

        let local_index = this._skDocument.offsetAt(this._range.start);
        let paragraph = this._paragraph;

        let position = 0;
        let index;
        do {
            index = paragraph.indexOf('{', position);
            if (index > 0) {
                let variable = this._findVariable(paragraph, index, local_index);
                if (!variable)
                    continue;
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
            escape = '%',
            stack = 0,
            start = -1,
            isNested = false,
            regexp = new RegExp(`${opener}|${escape}|${closer}`, 'g'),
            child: SkriptVariable[] = [];
    
        let search;
        while (search = regexp.exec(paragraph)) {
            if (search[0] === opener) {
                if (start < 0)
                    start = search.index;
                stack ++;
            
            } else if (start < 0) {
                continue;
    
            } else if (search[0] === escape) {
                if (isNested) {
                    isNested = false;
                } else {
                    isNested = true;
                    let v = this._findVariable(paragraph.substr(search.index + 1), index + search.index + 1, local_index);
                    if (v) {
                        regexp.lastIndex = search.index + v.expr.length + 1;
                        child.push(v);
                    }
                }
    
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
    


