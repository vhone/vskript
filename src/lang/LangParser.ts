import { ParameterInformation, TextDocument } from "vscode";


export class LangParser {

    public static parse(document: TextDocument): Lang {
        return new Lang(document);
    }

}

class Lang {

    private readonly _document: TextDocument;
    private readonly _root: LangNode;

    constructor(document: TextDocument) {
        this._document = document;

        let root = new LangNode(document.fileName);
        this._root = root;
        for (var i=0; i<this._document.lineCount; i++) {
            let line = this._document.lineAt(i)

            let data = /^(?<space>\t*)((?<key>[^:#]+):(?<value>[^\#]*)?)?(?<command>\#.*)?$/i
            let groups = line.text.match(data)?.groups
            if (groups) {
                let i = 0;
                if (groups.key) i += 1;
                if (groups.value) i += 2;
                if (groups.command) i += 4;

                let node;
                if (i === 1 || i === 5) {
                    node = new LangNode(groups.key.trim());
                } else if (i === 3 || i ===7) {
                    node = new LangNode(groups.key.trim(), groups.value.trim());
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

    public get document(): TextDocument {
        return this._document;
    }
    public getNode(dir?:string): LangNode {
        if (!dir || dir === '')
            return this._root;
        let keys = dir.split('.');
        let node = this._root;
        let i = 0;
        let childs
        while (childs = node.getChild()) {
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


export class LangNode {

    private readonly _key: string;
    private readonly _value: string | undefined;
    private _parent: LangNode | undefined;
    private _child: LangNode[] | undefined;

    constructor(key: string, value?: string, parent?: LangNode, child?: LangNode[]) {
        this._key = key;
        this._value = value;
        this._child = child;
        this._parent = parent;
    }
    public get key(): string  {
        return this._key
    }
    public get value(): string | undefined  {
        return this._value;
    }
    public get deep(): number {
        let deep = 0;
        let node: LangNode = this;
        while (node._parent) {
            deep++;
            node = node._parent;
        }
        return deep;
    }
    
    public setParent(node: LangNode): LangNode {
        if (this._parent) {
            if (this._parent === node) return node;
            else if (this._parent._child) {
                let child = new Array<LangNode>();
                for (const ch of this._parent._child) {
                    if (ch !== node) {
                        child.push(ch);
                    }
                }
                this._parent._child = child;
            }
        }
        this._parent = node;
        return node;
    }

    public getChild(): LangNode[] | undefined {
        return this._child;
    }

    public addChild(node: LangNode): LangNode {
        if (!this._child) {
            this._child = [];
        }
        if (node._parent && node._parent._child) {
            let child = new Array<LangNode>();
            for (const ch of node._parent._child) {
                if (ch !== node) {
                    child.push(ch);
                }
            }
            node._parent._child = child;
        }
        this._child.push(node);
        return node;
    }
    public goto(goto:number): LangNode {
        let deep = this.deep;
        let i = deep - goto;
        if (i < 0) i = 0;
        if (i > deep) i = deep;

        let node: LangNode = this;
        for (var j=0; j<i; j++) {
            let parent = node._parent;
            if (parent) {
                node = parent;
            } else {
                return node;
            }
        }
        return node;
    }

}