import { CancellationToken, DocumentSymbol, Location, Position, Range, SymbolInformation, SymbolKind, Uri, WorkspaceSymbolProvider } from 'vscode';
import * as Skript from '../Skript';
import { SkriptFunction } from '../skript/Component';

/**
 * ```Ctrl + T``` 단축키로 바로 갈 수 있는 기능
 */
export class SkriptWorkspaceSymbolProvider implements WorkspaceSymbolProvider {
    provideWorkspaceSymbols(query: string, _token: CancellationToken) {
        let results = new Array<SymbolInformation>();
        for (const skDocument of Skript.DOCUMENTS) {
            for (const paragraph of skDocument.compnents) if (paragraph.title.includes(query)) {
                let uri = Uri.file(skDocument.skPath.fsPath);
                let location = new Location(uri, paragraph.range);
                results.push(new SymbolInformation(paragraph.title, paragraph.symbolKind, skDocument.skPath.name, location));
            }
        }
        console.log(results);
        return results;
    }
}