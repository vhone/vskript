

// https://github.com/SkriptLang/skript-parser/tree/master/src/main/java/io/github/syst3ms/skriptparser/file

import { Console } from "node:console";
import { StringBuilder } from "../../../Java";
import * as FileUtils from "../../util/FileUtils";


export class FileElement {

	private readonly _fileName: string;
	private	readonly _line: number;
	private readonly _content: string;
	private readonly _indentation: number;

	constructor(fileName: string, line: number, content: string, indentation: number) {
		this._fileName = fileName;
		this._line = line;
		this._content = content;
		this._indentation = indentation;
	}

	public get fileName(): string {
		return this._fileName;
	}
	public get line(): number {
		return this._line;
	}
	public get content(): string {
		return this._content;
	}
	public get indentation(): number {
		return this._indentation
	}

	public toString(): string {
		return '	'.repeat(this._indentation) + this._content;
	}

}



export class FileSection extends FileElement {
	recentEvent(recentEvent: any) {
		throw new Error("Method not implemented.");
	}

	private readonly _elements: FileElement[];
	private _length = -1;

	constructor(fileName: string, line: number, content: string, elements: FileElement[], indentation: number) {
		super(fileName, line, content, indentation);
		this._elements = elements;
	}

	
	public get elements(): FileElement[] {
		return this._elements;
	}

	public get length(): number {
		if (this._length > 0)
			return this._length;
		this._length = 0;
		for (const e of this._elements) {
			if (e instanceof FileSection) {
				this._length += e.length + 1;
			} else {
				this._length++;
			}
		}
		return this.length;
	}

	public toString(): string {
		return super.toString() + ':';
	}
	
}



export class VoidElement extends FileElement {
	constructor(fileName: string, line: number, indentation: number){
		super(fileName, line, '', indentation);
	}
}



export class FileParser {

	public static readonly LINE_PATTERN = /^((?:[^\#]|\#\#)*)(\s*\#(?!\#).*)$/;

	public static parseFileLines(fileName: string, lines: string[], exepectedIndentation: number, lastLine: number): FileElement[] {
		let elements = new Array<FileElement>();
		for (let i = 0; i < lines.length; i++) {
			let line = lines[i];
			let content = this.removeComments(line);

			if (content === undefined) {
				content = line.replace('##', '#').trim();
			} else if (content.length === 0) {
				elements.push(new VoidElement(fileName, lastLine + i, exepectedIndentation));
				continue;
			}

			let lineIndentation = FileUtils.getIndentationLevel(line, false);
			if (lineIndentation > exepectedIndentation) {
				console.log(
					"The line is indented too much (line " + (lastLine + i) + ": \"" + content + "\")",
					// ErrorType.STRUCTURE_ERROR,
					"You only need to indent once (using tabs) after each section (a line that ends with a ':'). Try to omit some tabs so the line suffices this rule"
				);
				continue;
			} else if (lineIndentation < exepectedIndentation) {
				return elements;
			}

			if (content.endsWith(':')) {
				if (i + 1 === lines.length) {
					elements.push(new FileSection(fileName, lastLine + i, content.substring(0, content.length - 1),
						new Array<FileElement>(), exepectedIndentation)
					);
				} else {
					let subLines = new Array<string>();
					lines.forEach((line, index) => {
						if (index > i)
							subLines.push(line);
					});
					let sectionElements = this.parseFileLines(fileName, subLines, exepectedIndentation + 1, lastLine + i + 1);
					if (sectionElements) {
						elements.push(new FileSection(fileName, lastLine + i, content.substring(0, content.length - 1),
							sectionElements, exepectedIndentation)
						);
						i += this._count(sectionElements);
					}
				}
			} else {
				elements.push(new FileElement(fileName, lastLine + i, content, exepectedIndentation));
			}
		}
		return elements;
	}

	private static _count(elements: FileElement[]): number {
		let count = 0;
		for (const element of elements) {
			if (element instanceof FileSection) {
				count += this._count(element.elements) + 1;
			} else {
				count++;
			}
		}
		return count;
	}

	public static removeComments(string: string): string | undefined {
		if (string === '' || string.match(/^[\s\t]*\#[^#]+/) || string.startsWith('#')) {
			return '';
		}

		let builder = new StringBuilder();

		outer:
		for (let i = 0; i < string.length; i++) {
			let ch = string.charAt(i);

			if (ch === '#') {
				if (string.charAt(i + 1) === '#') {
					builder.append(ch).append(string.charAt(++i));
				} else {
					let checked = string.substring(i + 1);
					for (let j of [3, 6, 8]) {
						if (checked.length >= j && checked.match(/([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})/)) {
							builder.append(ch).append(checked, 0, j)
							i += j;
							continue outer;
						}
					}

					return builder.toString().trim();
				}
			} else {
				builder.append(ch);
			}
		}
		if (builder.toString() === string)
			return;
		return builder.toString().trim();
	}

}