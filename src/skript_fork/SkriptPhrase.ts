import { SkriptLine } from "./SkriptLine";
import { SkriptParagraph } from "./SkriptParagraph";

interface SkriptPhrase{

}

export class SkriptPhrases {

    private readonly _skParagraph;
    private readonly _skPhrase;

    constructor(skParagraph:SkriptParagraph, skPhrase:SkriptPhrase[]) {
        this._skParagraph = skParagraph;
        this._skPhrase = skPhrase;
    }
    
    public static create(skParagraph:SkriptParagraph, skLines:SkriptLine[]): SkriptPhrases {

        console.log(skLines);
        let phrases = new Array<SkriptPhrase>();

        return new SkriptPhrases(skParagraph, phrases);
    }

}       
    


