import { CancellationToken, DocumentSymbol, Location, Position, Range, SymbolInformation, SymbolKind, Uri, WorkspaceSymbolProvider } from 'vscode';
import * as Skript from '../Skript';
import { SkriptFunction } from '../skript/Component';

/**
 * ```Ctrl + T``` 단축키로 바로 갈 수 있는 기능
 */
export class SkriptWorkspaceSymbolProvider implements WorkspaceSymbolProvider {
    provideWorkspaceSymbols(query: string, _token: CancellationToken) {
        let results = new Array<SymbolInformation>();
        for (const skFile of Skript.getFileList()) {
            for (const comp of skFile.components) if (comp.name.includes(query)) {
                let uri = Uri.file(skFile.fsPath);
                let location = new Location(uri, comp.range);
                results.push(new SymbolInformation(comp.name, comp.symbol, skFile.skName, location));
            }
        }
        console.log(results);
        return results;
    }
}