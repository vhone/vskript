
class Node {

    private readonly _key: string;
    private readonly _value: string | undefined;
    private _parent: Node | undefined;
    private _child: Node[] | undefined;

    constructor(key?: string, value?: string, parent?: Node, child?: Node[]) {
        this._key = (key) ? key : 'root';
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
        let node: Node = this;
        while (node._parent) {
            deep++;
            node = node._parent;
        }
        return deep;
    }
    
    public setParent(node: Node): Node {
        if (this._parent) {
            if (this._parent === node) return node;
            else if (this._parent._child) {
                let child = new Array<Node>();
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

    public getChild(): Node[] | undefined {
        return this._child;
    }

    public addChild(node: Node): Node {
        if (!this._child) {
            this._child = [];
        }
        if (node._parent && node._parent._child) {
            let child = new Array<Node>();
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
    public goto(goto:number): Node {
        let deep = this.deep;
        let i = deep - goto;
        if (i < 0) i = 0;
        if (i > deep) i = deep;

        let node: Node = this;
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