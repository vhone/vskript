

export type Class<T> = { new (...args: any[]): T };



/**
 * equals가 없는게 말이 되냐!
 */
 export class JavaObject {

	public equals(obj: any): boolean {
		if (this === obj) {
			return true;
		}
		if (Object.keys(this).length !== Object.keys(obj).length) {
			return false;
		}
		for (let field in this) {
			if (!obj[field]) {
				return false
			} else if (this[field] !== obj[field]) {
				return false;
			}
		}
		return true;
	}

	public toString() {
		let array: string[] = [];
		for (const field in this) {
			let value = typeof this[field] === 'string' ? `"${this[field]}"` : this[field]
			array.push(`${field}=${value}`);
		}
		return `${this.constructor.name}[${array.join(', ')}]`;
	}

};


export class StringBuilder {

	private readonly _chars = new Array<string>();

	constructor()
	constructor(string?: string) {
		if (string)
			this.append(string);
	}

	public get length(): number {
		return this._chars.length;
	}

	public append(string: string): StringBuilder
	public append(string: string, start: number, length: number): StringBuilder
	public append(string: string, start?: number, length?: number): StringBuilder {
		if (start && length)
			string = string.substr(start, length);
		this._chars.push(...string.split(''))
		return this;
	}

	public setLength(length: number) {
		this._chars.length = length;
	}

	public toString(): string {
		return this._chars.join('');
	}

}


export interface Comparator<T> {
	compare(o1: T, o2: T): number;
}