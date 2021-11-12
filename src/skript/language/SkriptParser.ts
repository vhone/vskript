import { SkriptExpression } from "../element/SkriptExpressions";
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
    expr: SkriptExpression[]
    // nextWords?: string[]
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
    
            // console.log(`invaild - [${index}]`)
            break;
            
        }
    }

    public exec(line:string) {
        
        let expr: SkriptExpression[] = [];
        let index = 0;
        for (const word of this._words) {
            // console.log(`[${word.text}] ${word.text}`);

            if (word instanceof SkriptParserNormal) {
                if (line.indexOf(word.text, index) === index) {
                    index = this._jumpIndex(line, index + word.text.length);
                } else {
                    // console.log(`Invailed Normal Word - index: ${index}, word: ${word.text}`)
                    break;
                }

            } else if (word instanceof SkriptParserOption) {
                if (line.indexOf(word.text, index) === index) {
                    index = this._jumpIndex(line, index + word.text.length);
                } else {
                    continue;
                }

            } else if (word instanceof SkriptParserType) {
                let type = word.type
                let isList = type.isList;
                let langType = type.langType;

                let search
                // console.log(`langType = ${langType.name}`)

                // 타입인 경우
                let pattern
                if (pattern = SkriptPattern.find(langType)) {
                    pattern.setLastIndex(index);
                    search = pattern.exec(line);
                    // console.log('일반패턴', search)

                // 변수인 경우
                } else if (pattern = SkriptPattern.find('variable')) {
                    pattern.setLastIndex(index);
                    search = pattern.exec(line);
                    // console.log('변수', search)
                
                /*// 함수인 경우
                } else if () {

                */

                // 정의되지 않은 타입
                } else {
                    // console.log(`정의되지 않은 타입 - ${langType.name}`)
                }

                if (search && search.index === index) {
                    // expr.push(SkriptExpression.create(type, search.text))
                    SkriptExpression.create(langType, search.text)
                    index = this._jumpIndex(line, index + search.text.length);
                } else {
                    // console.log(`Invailed Normal Word - word: ${word.text}, char: ${index}`)
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

	private readonly _text: string;

	constructor(word:string) {
		this._text = word;
	}

	public get text(): string {
		return this._text;
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

	private readonly _type: SkriptType;

	constructor(word:string) {
		super(word);
		this._type = SkriptType.value(word);
	}

	public get type(): SkriptType {
		return this._type;
	}

}