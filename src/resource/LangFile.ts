import { workspace } from "vscode";

export class LangFile {

    private readonly _root: Node;

    constructor(dir: string) {
        let document = workspace.openTextDocument(dir).then((document) => {
			return document.getText();
		})
        if (!document) {
            throw new Error(`failed read lang file - ${dir}`);
            
        }

        let root = new Node();
        let lines = document.split(/\r\n|\r|\n/);
        this._root = root;
        for (var i=0; i<lines.length; i++) {
            let line = lines[i]

            let data = /^(?<space>\t*)((?<key>[^:#]+):(?<value>[^\#]*)?)?(?<command>\#.*)?$/i
            let groups = line.match(data)?.groups
            if (groups) {
                let i = 0;
                if (groups.key) i += 1;
                if (groups.value) i += 2;
                if (groups.command) i += 4;

                let node;
                if (i === 1 || i === 5) {
                    node = new Node(groups.key.trim());
                } else if (i === 3 || i ===7) {
                    node = new Node(groups.key.trim(), groups.value.trim());
                }
                
                if (node) {
                    let space = groups.space.length;
                    let deep = root.deep;
                    if (space < deep)
                        root = root.goto(space);
                    root.addChild(node);
                    node.setParent(root);
                    root = node;
                }
            }
        }
        root.goto(0);
    }

    public getNode(key?:string): Node {
        this._root.goto(0);
        if (!key || key === '')
            return this._root;
        let keys = key.split('.');
        console.log(`keys=${keys}`)
        let node = this._root;
        let i = 0;
        let childs
        while (keys[i] && (childs = node.getChild())) {
            for (const child of childs) {
                if (child.key === keys[i]) {
                    i++;
                    node = child;
                    break;
                }
            }
        }
        return node;
    }
    
}
