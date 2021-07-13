import { SkriptComponent, SkriptKeyValue, SkriptOptions } from "./SkriptComponent";
import { Position, Range } from "vscode";
import { SkriptVariable } from "./SkriptExpression";

export class SkriptParagraph {

    private readonly _skComponent: SkriptComponent;
    private readonly _range: Range;
    private readonly _paragraph: string;

    private readonly _variables: SkriptVariable[] = [];

    constructor(skComponent:SkriptComponent, range:Range, paragraph:string) {
        this._skComponent = skComponent;
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

    private _setVariables() {

        let list = new Array<{index:number,value:boolean}>();
        let regex_start = new RegExp(/\{/, 'g');
        let regex_end = new RegExp(/\}/, 'g');

        // 괄호 위치 탐색
        let search
        while (search = regex_start.exec(this._paragraph)) {
            list.push({index: search.index, value: true});
        }
        while (search = regex_end.exec(this._paragraph)) {
            list.push({index: search.index, value: false});
        }
        
        let document = this._skComponent.document;
        let offset = document.offsetAt(this._range.start);

        let bracket = 0
        let position = {start:-1, end:-1};
        for (const v of list.sort((a,b)=>{ return a.index - b.index})) {
    
            if (v.value) {
                if (bracket === 0) position.start = v.index;
                bracket++;
            } else {
                bracket--;
                if (bracket === 0) position.end = v.index + 1;
            }
    
            if (position.start > -1 && position.end > -1) {
                let range = new Range(document.positionAt(offset + position.start)!, document.positionAt(offset + position.end)!)
                let variable = this._paragraph.substring(position.start, position.end);
                let raw_variable = variable.replace(/\%[^%]+%/, '*').replace(/\:\:\d+\}/, '::*}')
                for (const options of document.getParagraphs(SkriptOptions)) {
                    for (const option of options.options) {
                        raw_variable = raw_variable.replace(`{@${option.key}}`, option.value);
                    }
                }
                this._variables.push(new SkriptVariable(range, variable, raw_variable));
                position = {start:-1, end:-1};
            }
    
        }

        // console.log(this._variables);
    }

    // 글자 = "%익스프레션%, %변수%, %함수%"
    // 변수 = {%익스프레션%::%변수%}
    // 함수 = func( 익스프레션, 변수, 함수 )
    // 익스프레션 = 패턴 + 익스프레션, 변수, 함수

}       
    


