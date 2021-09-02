import { SkriptType } from "../element/SkriptType";
import { SkriptPattern } from "./SkriptPattern";

const option = SkriptPattern.create('parser.option', '\\[', '\\]').addInclude('parser.option')
const type = SkriptPattern.create('parser.type', '\\%', '\\%')
const normal = SkriptPattern.create('parser.normal', '[^\\s]+')
SkriptPattern.register(option, type, normal);

/**
 * 파싱 결과
 *  - 완전한 문장인가.
 *  - 완전하다면 각 요소들을 객체화
 *  - 완전하지 않다면 정지 위치로부터 필요 요소가 무엇인지 판단
 *  - 필요 요소에 따른 추천 단어
 */
interface SkriptParserResult {
    nextWords?: string[]
}

export class SkriptParser {
    
    private readonly _name: string;
    private readonly _words: SkriptParserWord[] = [];

    constructor(name: string, pattern:string) {
        this._name = name;
    
        let index = 0;
        let result;
        while (index < pattern.length) {
    
            option.setLastIndex(index);
            if (result = option.exec(pattern)) {
                if (result.index === index) {
                    this._words.push(new SkriptParserOption(result.text.substring(1, result.text.length - 1).trim()));
                    index = this._jumpIndex(pattern, option.getLastIndex());
                    continue;
                }
            }
    
            type.setLastIndex(index);
            if (result = type.exec(pattern)) {
                if (result.index === index) {
                    this._words.push(new SkriptParserType(result.text.substring(1, result.text.length - 1).trim()));
                    index = this._jumpIndex(pattern, type.getLastIndex());
                    continue;
                }
            }
    
            normal.setLastIndex(index);
            if (result = normal.exec(pattern)) {
                if (result.index === index) {
                    this._words.push(new SkriptParserNormal(result.text));
                    index = this._jumpIndex(pattern, normal.getLastIndex());
                    continue;
                }
            }
    
            console.log(`invaild - [${index}]`)
            break;
            
        }
    }

    public exec(line:string) {
        
        let line_index = 0;
        for (const skWord of this._words) {
            console.log(`[${skWord.word}] ${skWord.isNormal} ${skWord.isOption} ${skWord.isType}`);

            if (skWord.isNormal) {
                if (line.indexOf(skWord.word, line_index) === line_index) {
                    line_index += skWord.word.length;
                    while (line_index === line.indexOf( ' ', line_index)) {
                        line_index++;
                    }
                } else {
                    console.log(`Invailed Normal Word - word: ${skWord.word}, char: ${line_index}`)
                    break;
                }

            } else if (skWord.isOption) {
                if (line.indexOf(skWord.word, line_index) === line_index) {
                    line_index += skWord.word.length;
                    while (line_index === line.indexOf( ' ', line_index)) {
                        line_index++;
                    }
                } else {
                    continue;
                }

            } else if (skWord.isType && skWord instanceof SkriptParserType) {
                let skLangType = skWord.skType.type;
                let search

                if (skLangType.name === 'text') {
                    let text = SkriptPattern.find('text');
                    if (text) {
                        text.setLastIndex(line_index)
                        search = text.exec(line);
                    }

                } else if (skLangType.name === 'player') {
                    console.log( `익스프레션 처리 - player`)
                    search = {index: line.indexOf('player'), text: 'player'}
                }

                if (search && search.index === line_index) {
                    line_index += search.text.length;
                    while (line_index === line.indexOf( ' ', line_index)) {
                        line_index++;
                    }

                } else {
                    console.log(`Invailed Normal Word - word: ${skWord.word}, char: ${line_index}`)
                    break;
                }
            }
        }

    }

    private _jumpIndex(text:string, index:number): number {
        while (index === text.indexOf( ' ', index)) {
            index++;
        }
        return index;
    }

}


abstract class SkriptParserWord {

	private readonly _word: string;

	constructor(word:string) {
		this._word = word;
	}

	public get word(): string {
		return this._word;
	}

	public get isNormal(): boolean {
		return this instanceof SkriptParserNormal
	}
	public get isOption(): boolean {
		return this instanceof SkriptParserOption
	}
	public get isType(): boolean {
		return this instanceof SkriptParserType
	}
	
}

class SkriptParserNormal extends SkriptParserWord {
	constructor(word:string) {
		super(word);

	}
}

class SkriptParserOption extends SkriptParserWord {

	constructor(word:string) {
		super(word);

	}

}

class SkriptParserType extends SkriptParserWord {

	private readonly _skType: SkriptType;

	constructor(word:string) {
		super(word);
		this._skType = SkriptType.value(word);
	}

	public get skType(): SkriptType {
		return this._skType;
	}

}