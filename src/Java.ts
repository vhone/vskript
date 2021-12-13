export interface JavaObject {
	toString(): string;
	equals(obj: any): boolean;
};



export type Class<T> = { new (...args: any[]): T };



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