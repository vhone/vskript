import { SkriptLine } from "./SkriptLine";
import { SkriptParagraph } from "./SkriptParagraph";

export class SkriptPhrase {

    private readonly _skParagraph: SkriptParagraph;
    private readonly _skLine: SkriptLine;

    constructor(skParagraph:SkriptParagraph, skLine:SkriptLine) {
        this._skParagraph = skParagraph;
        this._skLine = skLine;
        // console.log(skLine.text)
    }

    // 글자 = "%익스프레션%, %변수%, %함수%"
    // 변수 = {%익스프레션%::%변수%}
    // 함수 = func( 익스프레션, 변수, 함수 )
    // 익스프레션 = 패턴 + 익스프레션, 변수, 함수

}       
    


