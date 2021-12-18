import { StringBuilder } from '../../../Java';
import { StringUtils } from '../../util/StringUtils';
import { MatchContext } from './Parsing';

class PatternParser {

	private static readonly PARSE_MARK_PATTERN = /(([A-Za-z0-9]+)?):(.*)/;

	public static parsePattern(pattern: string): PatternElement | undefined
	public static parsePattern(pattern: string, marked: boolean): PatternElement | undefined
	public static parsePattern(pattern: string, marked?: boolean): PatternElement | undefined{
		if (!marked)
			marked = false;

		pattern = pattern.trim().replace(/\s+/, ' ');
		console.log('>', pattern)

		if (pattern === '')
			return new TextElement('');
		
		let elements = new Array<PatternElement>();
		let textBuilder = new StringBuilder();

		let chars = pattern.split('')
		for (let i = 0; i < chars.length; i++) {
			let ch = chars[i];
			let initialPos = i;

			// 이건 뭔지 모르겠네
			if (ch === ':') {
				let next = chars[i + 1];
				if (next !== '(' && next !== '[') {
					console.log("No group found after leading mark sign (index " + initialPos + "): '" + pattern.substring(initialPos) + "'. Escape the character to prevent ambiguity")
					textBuilder.append(ch);
					continue;
				}

				if (textBuilder.length > 0) {
					elements.push(new TextElement(textBuilder.toString()))
					textBuilder.setLength(0);
				}

				marked = true;

			// Optional 패턴
			} else if (ch === '[') {
				let enclosedText = StringUtils.getEnclosedText(pattern, '[', ']', i);
				console.log('[Optional]', enclosedText)

				if (!enclosedText) {
					console.log("Unmatched square bracket (index " + initialPos + "): '" + pattern.substring(initialPos) + "'")
					return;
				} else if (enclosedText === '' ) {
					console.log("There is an empty optional group. Place a backslash before a square bracket for it to be interpreted literally : [" + enclosedText + "]")
				}

				if (textBuilder.length > 0) {
					elements.push(new TextElement(textBuilder.toString()))
					textBuilder.setLength(0);
				}

				i += enclosedText.length + 1;

				let optionalGroup: OptionalGroup | undefined;
				let matcher = this.PARSE_MARK_PATTERN.exec(enclosedText);
				let vertParts = StringUtils.splitVerticalBars(pattern);

				if (!vertParts) {
					return;
				}
				if (matcher && vertParts.length === 1) {
					let mark = matcher[1];
					let element = PatternParser.parsePattern(matcher[3])
					if (element) {
						let choice = new ChoiceElement(element);
						optionalGroup = new OptionalGroup(new ChoiceGroup(choice));
					}
				} else {
					let finalMarked = marked;
					let element = PatternParser.parsePattern(enclosedText, finalMarked)
					if (element) {
						optionalGroup = new OptionalGroup(element);
					}
					marked = false;
				}
				if (!optionalGroup) {
					return;
				} else {
					elements.push(optionalGroup)
				}

			// Choice 패턴
			} else if (ch === '(') {
				let enclosedText = StringUtils.getEnclosedText(pattern, '(', ')', i);
				console.log('[Choice]', enclosedText)

				if (!enclosedText) {
					console.log("Unmatched parenthesis (index " + initialPos + ") : '" + pattern.substring(initialPos) + "'")
					return;
				}

				if (textBuilder.length > 0) {
					elements.push(new TextElement(textBuilder.toString()))
					textBuilder.setLength(0);
				}

				i += enclosedText.length + 1;

				let choises = StringUtils.splitVerticalBars(enclosedText);
				if (!choises) {
					return;
				}

				let choiseElements = new Array<ChoiceElement>();
				for (const choice of choises) {
					let choiseElement: ChoiceElement | undefined;
					let matcher = this.PARSE_MARK_PATTERN.exec(choice);
					if (matcher || marked) {
						let mark = matcher ? matcher[1] : '';
						let rest = matcher ? matcher[3] : choice;
						let element = this.parsePattern(rest);
						if (element) {
							choiseElement = new ChoiceElement(element, mark);
						}
					} else {
						let element = this.parsePattern(choice);
						if (element) {
							choiseElement = new ChoiceElement(element);
						}
					}
					if (!choiseElement) {
						return;
					} else {
						choiseElements.push(choiseElement)
					}
				}

				elements.push(new ChoiceGroup(...choiseElements));
				marked = false;
			
			// 정규식 패턴
			} else if (ch === '<') {
				let enclosedText = StringUtils.getEnclosedText(pattern, '<', '>', i);
				console.log('[RegExp]', enclosedText);

				if (!enclosedText) {
					console.log("Unmatched angle bracket (index " + initialPos + ") : '" + pattern.substring(initialPos) + "'");
					return;
				}

				if (textBuilder.length > 0) {
					elements.push(new TextElement(textBuilder.toString()))
					textBuilder.setLength(0);
				}

				i += enclosedText.length + 1;

				let regexp: RegExp;
				try {
					regexp = new RegExp(enclosedText);
				} catch (e) {
					console.log("Invalid regex pattern (index " + initialPos + ") : '" + enclosedText + "'")
					return;
				}

				elements.push(new RegExpGroup(regexp))

			// 이스케이프 패턴
			} else if (ch === '\\') {
				if (i === pattern.length - 1) {
					console.log("Invalid backslash at the end of the string");
					return;
				} else {
					textBuilder.append(chars[++i]);
				}
			
			// 잘못된 괄호
			} else if (ch === '}' || ch === ']' || ch === ')' || ch === '>') {
				console.log("Unmatched closing bracket (index " + initialPos + ") : '" + pattern.substring(0, initialPos + 1) + "'");
				return;

			// 기타
			} else {
				textBuilder.append(ch);
			}
		}
	
		if (textBuilder.length > 0) {
			elements.push(new TextElement(textBuilder.toString()))
			textBuilder.setLength(0);
		}
	
		if (elements.length === 1) {
			return elements[0];
		} else {
			return new CompoundElement(elements);
		}

	}
}



//https://github.com/SkriptLang/skript-parser/blob/master/src/main/java/io/github/syst3ms/skriptparser/pattern/PatternElement.java
/**
 * The superclass of all elements of a pattern.
 */
export abstract class PatternElement {
	
	/**
     * Attempts to match the {@link PatternElement} to a string at a specified index.
     * About the index, make sure to never increment the index by some arbitrary value when returning
     *
     * @param s the string to match this PatternElement against
     * @param index the index of the string at which this PatternElement should be matched
     * @return the index at which the matching should continue afterwards if successful. Otherwise, {@literal -1}
     */
	public abstract match(s: string, index: number, context: MatchContext): number;

	static flatten(element: PatternElement): PatternElement[] {
		if (element instanceof CompoundElement) {
			return element.elements;
		} else {
			return [element];
		}
	}

	/**
     * This method should return all text components that will always be present,
     * no matter how the pattern is used.
     * @param element the element
     * @return the always-present text elements of this pattern
     */
	public static getKeywords(element: PatternElement): string[] {
		let result: string[] = [];
		for (const e of this.flatten(element)) {
			if (e instanceof TextElement) {
				result.push(e.text.trim().toLowerCase())
			}
		}
		return result;
	}

	public static getPossibleInputs(elements: PatternElement[]): PatternElement[] {
		let optionalPossibilities: PatternElement[] = [];
		let possiblilities: PatternElement[] = [];
		for (const element of elements) {
			if (element instanceof TextElement || element instanceof RegExpGroup) {
				if (element instanceof TextElement) {
					let text = element.text;
					if (text.length === 0 || text === '' || text.match(/\s*/) && elements.length === 1) {
						return possiblilities;
					} else if (text === '' || text.match(/\s*/)) {
						continue;
					}
				}
				possiblilities.push(element, ...optionalPossibilities);
				return possiblilities;
			} else if (element instanceof ChoiceGroup) {
				for (const choice of element.choices) {
					let possibleInputs = this.getPossibleInputs(this.flatten(choice.element));
					possiblilities.push(...possibleInputs);
				}
				possiblilities.push(...optionalPossibilities);
				return possiblilities;
			} else if (element instanceof ExpressionElement) {
				possiblilities.push(element, ...optionalPossibilities);
				return possiblilities;
			} else if (element instanceof OptionalGroup) {
				optionalPossibilities.push(...this.getPossibleInputs(this.flatten(element.element)));
			}
		}
		// new TextElement('\0') = EOL still goes at the very end
		possiblilities.push(...optionalPossibilities, new TextElement('\0'));
		return possiblilities;
	}

}

/** 한개의 단어 */
class TextElement implements PatternElement {

	private readonly _text: string ;

	constructor(text: string) {
		this._text = text;
	}

	public get text(): string {
		return this._text;
	}

	public match(s: string, index: number, context: MatchContext): number {
		throw new Error('Method not implemented.');
	}
	
}

/** 선택지를 가진 패턴 */
class ChoiceElement implements PatternElement {

	private readonly _element: PatternElement ;
	private readonly _mark: string | undefined;

	constructor(element: PatternElement)
	constructor(element: PatternElement, mark: string)
	constructor(element: PatternElement, mark?: string) {
		this._element = element;
		this._mark = mark;
	}

	public get element(): PatternElement {
		return this._element
	}
	public get mark(): string | undefined {
		return this._mark;
	}
	
	public match(): number {
		throw new Error('Method not implemented.');
	}

}

/** 한가지 선택해야하는 패턴 */
class ChoiceGroup implements PatternElement {
	
	private readonly _choices: ChoiceElement[];

	constructor(...choices: ChoiceElement[]){
		this._choices = choices;
	}

	public get choices() : ChoiceElement[] {
		return this._choices
	}
	
	public match(): number {
		throw new Error('Method not implemented.');
	}

}

/** 생략가능한 패턴 */
class OptionalGroup implements PatternElement {

	private readonly _element: PatternElement;

	constructor(element: PatternElement) {
		this._element = element;
	}

	public get element() : PatternElement {
		return this._element;
	}
	
	public match(): number {
		throw new Error('Method not implemented.');
	}

}

/** 정규식 패턴 */
class RegExpGroup implements PatternElement{
	
	private readonly _regexp: RegExp;

	constructor(regexp: RegExp) {
		this._regexp = regexp;
	}

	public get regexp() : RegExp {
		return this._regexp;
	}
	
	public match(): number {
		throw new Error('Method not implemented.');
	}

}

/** 패턴 묶음 */
class CompoundElement implements PatternElement {

	private readonly _elements: PatternElement[];

	constructor(elements: PatternElement[]) {
		this._elements = elements;
	}

	public get elements() : PatternElement[] {
		return this._elements;
	}
	
	public match(): number {
		throw new Error('Method not implemented.');
	}
	
}