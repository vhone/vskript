import { CompletionItemProvider, CompletionItem, TextDocument, CompletionItemKind, MarkdownString, SnippetString } from 'vscode'
import * as Skript from '../Skript'
import { SkriptFunction } from '../skript/Component';
import SkriptFile from '../skript/SkriptFile';


const ITEMS_MAP = new Map<string,CompletionItem[]>();

/**
 * ```Ctrl + space``` 단축키로 completion을 연다.
 * ***
 * completion을 열 때 동작한다.  
 * resolveCompletionItem는 목록을 스크롤할 때 동작한다.  
 */
export class SkriptCompletionItemProvider implements CompletionItemProvider<CompletionItem> {
    provideCompletionItems(document: TextDocument /*position: Position, token: CancellationToken, context: CompletionContext*/ ) {
        let fsPath = document.uri.fsPath;
        if (ITEMS_MAP.size === 0){
            for (let skFile of Skript.getSkriptDocuments()){
                this.updateFunctionCompletionItem(skFile);
            }
        } else if (!ITEMS_MAP.has(fsPath) || document.isDirty) {
            this.updateFunctionCompletionItem(Skript.findDocument(fsPath)!);
        }

        let response = new Array<CompletionItem>();
        for (let key of ITEMS_MAP.keys()) {
            for (let items of ITEMS_MAP.get(key)!) {
                response.push(items);
            }
        }
        return response;
    }

    private updateFunctionCompletionItem(skFile:SkriptFile): CompletionItem[] {
        let items = this.createCompletionItemsInFile(skFile);
        ITEMS_MAP.set(skFile.fsPath, items);
        return items;
    }

    private createCompletionItemsInFile(skFile:SkriptFile): CompletionItem[] {
        let items = new Array<CompletionItem>();
        for (let comp of skFile.components) if (comp instanceof SkriptFunction) {
            // item
            let item = new CompletionItem(comp.name, CompletionItemKind.Function);
            item.detail = skFile.skName;

            // insert
            let paramList = new Array<string>();
            let i = 1;
            for (const p of comp.parameters) {
                let param = '${' + i++ + '|\{_' + p.name + '\}|}';
                paramList.push(param);
            }
            item.insertText = new SnippetString(comp.name + '( ' + paramList.join(', ') + ' )');

            // docs
            // let docs = new Array<string>();
            // if (comp.docs) {
            //     for (const info of comp.docs!)
            //         docs.push(info.replace(/(^|\b)(\@\w*)($|\b)/i, '_$2_'));
            //     docs.push('***');
            // }
            // docs.push(skFile.skName!);
            // item.documentation = new MarkdownString(docs.join('  \r\n'));
            item.documentation = comp.markdown;

            items.push(item);
        }
        return items;
    }
}



    