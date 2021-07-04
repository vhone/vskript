import * as Path from 'path';

export class SkriptPath {

	public readonly fsPath: string;

	constructor(
		public readonly root: string,
		public readonly name: string
	) {
		this.fsPath = Path.join(root, name);
	}
}