import { CompletionItemProvider, CompletionItem, TextDocument, CompletionItemKind, SnippetString, CancellationToken, CompletionContext, Position } from 'vscode'
import * as Skript from '../Skript'
import { SkriptCommand } from '../skript_fork/SkriptComponent';
import { Materials as SkriptMaterials } from '../skript_fork/language/Materials';

const ITEMS_MAP = new Map<string,CompletionItem[]>();

const kaywords = [ 'aliases', 'options', 'on', 'command', 'function' ];

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

        // 메터리얼 입력
        let matrial_range = document.getWordRangeAtPosition(position, /minecraft:\w*/i);
        let matrial_word: string | undefined = (matrial_range) ? document.getText(matrial_range) : undefined;
        if (matrial_word) {
            for (const mat of SkriptMaterials) {
                result.push(new CompletionItem(mat.toLowerCase(), CompletionItemKind.Enum));
            }
        }

        // 첫 입력 (keyword)
        if (line.text === '' || line.text.indexOf(word!) === 0) {
            for (const keyword of kaywords) {
                let item = new CompletionItem(keyword, CompletionItemKind.Keyword);
                result.push(item);
            }
            let as = new CompletionItem('aliases', CompletionItemKind.Snippet);
            as.insertText = new SnippetString('aliases:\r\n\t')
            let opt = new CompletionItem('options', CompletionItemKind.Snippet);
            opt.insertText = new SnippetString('options:\r\n\t')
            let cmd = new CompletionItem('command', CompletionItemKind.Snippet);
            cmd.insertText = new SnippetString('command /${1:label} ${2:arguments}:\r\n\ttrigger:\r\n\t\t')
            let func_void = new CompletionItem('void function', CompletionItemKind.Snippet);
            func_void.insertText = new SnippetString('function ${1:name}(${2:parameters}):\r\n\t')
            let func = new CompletionItem('function', CompletionItemKind.Snippet);
            func.insertText = new SnippetString('function ${1:name}(${2:parameters}) :: ${3:return type}:\r\n\t')
            result.push(as, opt, cmd, func_void, func);

            return result;
        }

        // Command Option 입력
        let subText = line.text.substring(0, position.character);
        let skDocument = Skript.find(document.uri.fsPath);
        if (skDocument) {

            // let skComponent = skDocument.componentOf(position);
            let skComponent = skDocument.lastComponentOf(position);
            // console.log(skComponent)
            // console.log([subText]);
            if (skComponent) {
                if (skComponent instanceof SkriptCommand) {
                    if (subText.match(/^(\t|\s{4})($|[^\t\s\:]*$)/)) {

                        let as = new CompletionItem('aliases', CompletionItemKind.Property);
                        as.insertText = new SnippetString('aliases: ')

                        let desc = new CompletionItem('description', CompletionItemKind.Property);
                        desc.insertText = new SnippetString('description: ')
                        // desc.documentation = 'A description of what this command does.';

                        let usage = new CompletionItem('usage', CompletionItemKind.Property);
                        usage.insertText = new SnippetString('usage: ')
                        // usage.documentation = 'How to use the command.   \r\ne.g. /commandname <arguments>';

                        let perm = new CompletionItem('permission', CompletionItemKind.Property);
                        perm.insertText = new SnippetString('permission: ')

                        let perm_msg = new CompletionItem('permission message', CompletionItemKind.Property);
                        perm_msg.insertText = new SnippetString('permission message: ')

                        let exec = new CompletionItem('executable by', CompletionItemKind.Property);
                        exec.insertText = new SnippetString('executable by: ${1|players,console,players and console|}')

                        let cool = new CompletionItem('cooldown', CompletionItemKind.Property);
                        cool.insertText = new SnippetString('cooldown: ')

                        let cool_msg = new CompletionItem('cooldown message', CompletionItemKind.Property);
                        cool_msg.insertText = new SnippetString('cooldown message: ')

                        let cool_byp = new CompletionItem('cooldown bypass', CompletionItemKind.Property);
                        cool_byp.insertText = new SnippetString('cooldown bypass: ')

                        let cool_str = new CompletionItem('cooldown storage', CompletionItemKind.Property);
                        cool_str.insertText = new SnippetString('cooldown storage: ')
                        
                        let trg = new CompletionItem('trigger', CompletionItemKind.Property);
                        trg.insertText = new SnippetString('trigger:\r\n\t\t')
                        
                        let items = [ as, desc, usage, perm, perm_msg, exec, cool, cool_msg, cool_byp, cool_str, trg ];

                        if (skComponent.options) for (const option of skComponent.options) {
                            items = items.filter(v => v.label !== option.key);  
                        }
                        result.push(...items);
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



    