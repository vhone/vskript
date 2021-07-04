import { CancellationToken, Definition, DefinitionProvider, Location, Position, TextDocument, Uri } from "vscode";
import * as Skript from "../Skript";
import { SkriptFunction } from "../skript/Component";

/** 바로가기 */
export class SkriptDefinitionProvider implements DefinitionProvider {
	provideDefinition(document: TextDocument, position: Position, _token: CancellationToken) {
		// console.log('SkriptDefinitionProvider');
        let range = document.getWordRangeAtPosition(position);
        if (range) {
            let funcName = document.getText(range);
            for(const skFile of Skript.getSkriptDocuments()) {
                for (const comp of skFile.components) if (comp instanceof SkriptFunction && comp.name === funcName) {
					let uri = Uri.file(skFile.fsPath);
					let location = new Location(uri, comp.range);
                    return location;
                }
            }
        }
		return [];
	}
}