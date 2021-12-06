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
	let textBuilder = new TextBuilder();
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
			split.push(textBuilder.build());
			textBuilder.setLength(0);
		} else {
			textBuilder.append(ch);
		}
	}
	split.push(textBuilder.build());
	return split;
}



export function count(s: string, ...toFind: string[]): number {
	let count = 0;
	for (const sequence of toFind) {
		let occurrence = s.length - s.replace(sequence, '').length;
		count += occurrence / sequence.length;
	}
	return count;
}


export class TextBuilder {

	private readonly _chars = new Array<string>();

	constructor()
	constructor(string?: string) {
		if (string)
			this.append(string);
	}

	public get length(): number {
		return this._chars.length;
	}

	public append(string: string): TextBuilder
	public append(string: string, start: number, length: number): TextBuilder
	public append(string: string, start?: number, length?: number): TextBuilder {
		if (start && length)
			string = string.substr(start, length);
		this._chars.push(...string.split(''))
		return this;
	}

	public build(): string {
		return this._chars.join('');
	}

	public setLength(length: number) {
		this._chars.length = length;
	}

	public toString(): string {
		return this._chars.join('')
	}

}

export function getForms(string: string): string[] {
	
}
