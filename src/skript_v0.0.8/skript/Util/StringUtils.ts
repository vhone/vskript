import { StringBuilder } from "../../../Java";

export function getEnclosedText(pattern: string, opening: string, closing: string, start: number): string | undefined {
	let closingBracket = findClosingIndex(pattern, opening, closing, start);
	if (closingBracket === -1)
		return;
	else
		return pattern.substring(start + 1, closingBracket);
}

export function findClosingIndex(pattern: string, opening: string, closing: string, start: number): number {
	let deep = 0;
	for (let i = start; i < pattern.length; i++) {
		let ch = pattern.charAt(i);
		if (ch === '\\') {
			i++;
		} else if (ch === opening) {
			deep++;
		} else if (ch === closing) {
			deep--;
			if (deep === 0) {
				return i;
			}
		}
	}
	return -1;
}

export function splitVerticalBars(pattern: string): string[] | undefined {
	let split = new Array<string>();
	let textBuilder = new StringBuilder();
	let chars = pattern.split('');
	for (let i = 0; i < chars.length; i++) {
		let ch = chars[i];
		if (ch === '\\') {
			textBuilder.append(ch);
			if (i + 1 < pattern.length) {
				textBuilder.append(chars[++i]);
			}
		} else if (ch === '(' || ch === '[') {
			let closing = ch === '(' ? ')' : ']';
			let text = getEnclosedText(pattern, ch, closing, i);
			if (text) {
				textBuilder.append(ch + text + closing);
				i += text.length + 1;
			} else {
				console.log("Unmatched bracket : '" + pattern.substring(i) + "'")
				return;
			}
		} else if (ch === '|') {
			split.push(textBuilder.toString());
			textBuilder.setLength(0);
		} else {
			textBuilder.append(ch);
		}
	}
	split.push(textBuilder.toString());
	return split;
}



export function count(s: string, ...toFind: string[]): number {
	let count = 0;
	for (const sequence of toFind) {
		let occurrence = s.length - s.replace(new RegExp(sequence, 'g'), '').length;
		count += occurrence / sequence.length;
	}
	return count;
}


export function withIndefiniteArticle(noun: string, plural: boolean) {
	noun = noun.trim();
	if (noun === '') {
		return "";
	} else if (plural) {
		return noun;
	}
	var first = noun.charAt(0).toLowerCase();
	switch (first) {
		case 'a':
		case 'e':
		case 'i':
		case 'o':
		case 'u':
		case 'y':
			return 'an ' + noun;
		default:
			return 'a ' + noun;
	}
}


/**
 * Returns an array of two elements, containing the plural and singular forms of the
 * given pluralizable expression. Does not support escaping.
 */
export function getForms(pluralizable: string): string[] {
	var words = new Array<string>();
	for (const s of pluralizable.split(/\s+/)) {
		var split = s.split("@");
		switch (split.length) {
			case 1:
				words.push(s, s);
				break;
			case 2:
				words.push(split[0], split[0] + split[1]);
				break;
			case 3:
				words.push(split[0] + split[1], split[0] + split[2]);
				break;
			default:
				throw new Error('Invalid pluralized word : ' + s);
		}
	}
	var pluralized = ['', ''];
	for (var word of words) {
		pluralized[0] += word[0] + ' ';
		pluralized[1] += word[1] + ' ';
	}
	return _stringAll(pluralized);
}


/**
 * Trims all strings in the array
 * @param strings the strings
 * @return the array with all of its contents trimmed
 */
function _stringAll(strings: string[]): string[] {
	for (var i = 0; i < String.length; i++) {
		strings[i] = strings[i].trim();
	}
	return strings;
}
