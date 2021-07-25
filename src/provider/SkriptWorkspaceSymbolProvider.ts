import { CancellationToken, DocumentSymbol, Location, Position, Range, SymbolInformation, SymbolKind, Uri, WorkspaceSymbolProvider } from 'vscode';
import * as Skript from '../Skript';

/**
 * ```Ctrl + T``` 단축키로 바로 갈 수 있는 기능
 */
export class SkriptWorkspaceSymbolProvider implements WorkspaceSymbolProvider {
    provideWorkspaceSymbols(query: string, _token: CancellationToken) {

        let results = new Array<SymbolInformation>();

        Skript.DOCUMENTS.forEach(skDocument => {
            for (const component of skDocument.components) if (!component.isInvisible && component.title.includes(query)) {
                let uri = Uri.file(skDocument.skPath.fsPath);
                let location = new Location(uri, component.range);
                results.push(new SymbolInformation(component.title, component.symbolKind, skDocument.skPath.name, location));
            }
        })
        
        return results;
    }
}