import { CompletionItemProvider, CompletionItem, TextDocument, CompletionItemKind, SnippetString, CancellationToken, CompletionContext, Position, IndentAction } from 'vscode'
import * as Skript from '../Skript'
import { SkriptCommand, SkriptFunction, SkriptParagraphComponent } from '../skript/SkriptComponent';
import { Materials as SkriptMaterials } from '../skript/language/Materials';
import { resourceLimits } from 'node:worker_threads';

const ITEMS_MAP = new Map<string,CompletionItem[]>();


const Components = (() => {
    let list = new Array<CompletionItem>();
    [   {isKeyword: true, name:'aliases', snippet:'aliases:\r\n\t'},
        {isKeyword: true, name:'options', snippet:'options:\r\n\t'},
        {isKeyword: true, name:'command', snippet:'command /${1:label} ${2:arguments}:\r\n\ttrigger:\r\n\t\t'},
        {isKeyword: true, name:'function', snippet:'function ${1:name}(${2:parameters}) :: ${3:return type}:\r\n\t'},
        {isKeyword: false, name:'function void', snippet:'function ${1:name}(${2:parameters}):\r\n\t'}
    ].forEach(value => {
        if (value.isKeyword)
            list.push(new CompletionItem(value.name, CompletionItemKind.Keyword));
        let snippet = new CompletionItem(value.name, CompletionItemKind.Snippet);
        snippet.insertText = new SnippetString(value.snippet);
        list.push(snippet);
    });
    return list;
})();

const CMD_Options = (() =>{
    let list = new Array<CompletionItem>();
    [   {name:'aliases', snippet:'aliases: '},
        {name:'description', snippet:'description: '},
        {name:'usage', snippet:'usage: '},
        {name:'permission', snippet:'permission: '},
        {name:'permission message', snippet:'permission message: '},
        {name:'executable by', snippet:'executable by: '},
        {name:'cooldown', snippet:'cooldown: '},
        {name:'cooldown message', snippet:'cooldown message: '},
        {name:'cooldown bypass', snippet:'cooldown bypass: '},
        {name:'cooldown storage', snippet:'cooldown storage: '},
        {name:'trigger', snippet:'trigger: '}
    ].forEach(value => {
        let snippet = new CompletionItem(value.name, CompletionItemKind.Property);
        snippet.insertText = new SnippetString(value.snippet);
        list.push(snippet);
    })
    return list;
})() ;



/**
 * ```Ctrl + space``` 단축키로 completion을 연다.
 * ***
 * completion을 열 때 동작한다.  
 * resolveCompletionItem는 목록을 스크롤할 때 동작한다.  
 */
export class SkriptCompletionItemProvider implements CompletionItemProvider<CompletionItem> {
    provideCompletionItems(document: TextDocument, position: Position, _token: CancellationToken, _context: CompletionContext ): CompletionItem[] | undefined {

        let result = new Array<CompletionItem>();

        let line = document.lineAt(position.line);
        let range = document.getWordRangeAtPosition(position);
        let word: string | undefined = (range) ? document.getText(range) : undefined;

        let skDocument = Skript.find(document.uri.fsPath)!;

        // 첫 입력 (keyword)
        if (!skDocument.componentOf(position) && (line.text === '' || line.text.indexOf(word!) === 0)) {
            return Components;
        }

        // 메터리얼 입력
        let matrial_range = document.getWordRangeAtPosition(position, /minecraft:\w*/i);
        let matrial_word: string | undefined = (matrial_range) ? document.getText(matrial_range) : undefined;
        if (matrial_word) {
            for (const mat of SkriptMaterials) {
                result.push(new CompletionItem(mat.toLowerCase(), CompletionItemKind.Enum));
            }
        }

        // Component
        let subText = line.text.substring(0, position.character);
        let skComponent = skDocument.componentOf(position, {isBefore:true});
        if (skComponent) {

            // Command Options
            if (skComponent instanceof SkriptCommand
                && subText.match(/^(\t|\s{4})($|[^\t\s\:]*$)/)) {
                    
                    let items = Object.assign(CMD_Options, {});
                    if (skComponent.options) for (const option of skComponent.options) {
                        items = items.filter(v => v.label !== option.key);  
                    }
                    result.push(...items);
                    // return items;
            }

            // Grobal Functions
            if (skComponent instanceof SkriptParagraphComponent && skComponent.paragraph.range.contains(position)) {
                for (const skDocs of Skript.DOCUMENTS) {
                    let isThis = skDocs === skDocument;
                    for (const skFunc of skDocs.getComponents(SkriptFunction)) if (!skFunc.isInvisible || isThis) {
                        let item = new CompletionItem(skFunc.name, CompletionItemKind.Function);
                        item.detail = skDocs.skPath.name;
                        if (skFunc.tooltip) item.documentation = skFunc.tooltip.markdown;

                        let parameters: string[] = [];
                        if (skFunc.parameters) for (const skParam of skFunc.parameters) {
                            let i = parameters.length + 1;
                            if (skParam.type.isList) {
                                parameters.push(`\${${i}:{_${skParam.name}::*\\\}}`)
                            } else {
                                parameters.push(`\${${i}:{_${skParam.name}\\\}}`)
                            }
                        }
                        item.insertText = new SnippetString(`${skFunc.name}( ${parameters.join(', ')} )`)
                        result.push(item);
                    }
                }
            }


        }

        return result;
    }/*,

    resolveCompletionItem(item: CompletionItem, token: CancellationToken): CompletionItem {
        return item;
    }*/

    // private _updateFunctionCompletionItem(skFile:SkriptFile): CompletionItem[] {
    //     let items = this._createCompletionItemsInFile(skFile);
    //     ITEMS_MAP.set(skFile.fsPath, items);
    //     return items;
    // }

    // private _createCompletionItemsInFile(skFile:SkriptFile): CompletionItem[] {
    //     let items = new Array<CompletionItem>();
    //     for (let comp of skFile.components) if (comp instanceof SkriptFunction) {
    //         // item
    //         let item = new CompletionItem(comp.name, CompletionItemKind.Function);
    //         item.detail = skFile.skName;

    //         // insert
    //         let paramList = new Array<string>();
    //         let i = 1;
    //         for (const p of comp.parameters) {
    //             let param = '${' + i++ + '|\{_' + p.name + '\}|}';
    //             paramList.push(param);
    //         }
    //         item.insertText = new SnippetString(comp.name + '( ' + paramList.join(', ') + ' )');

    //         // docs
    //         // let docs = new Array<string>();
    //         // if (comp.docs) {
    //         //     for (const info of comp.docs!)
    //         //         docs.push(info.replace(/(^|\b)(\@\w*)($|\b)/i, '_$2_'));
    //         //     docs.push('***');
    //         // }
    //         // docs.push(skFile.skName!);
    //         // item.documentation = new MarkdownString(docs.join('  \r\n'));
    //         item.documentation = comp.markdown;

    //         items.push(item);
    //     }
    //     return items;
    // }
}



    