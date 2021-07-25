import { CancellationToken, Definition, DefinitionProvider, Location, Position, TextDocument, Uri } from "vscode";
import * as Skript from "../Skript";
import { SkriptFunction } from "../skript/SkriptComponent";

/** 바로가기 */
export class SkriptDefinitionProvider implements DefinitionProvider {
	provideDefinition(document: TextDocument, position: Position, _token: CancellationToken) {
        let range = document.getWordRangeAtPosition(position);
        if (range) {
            let funcName = document.getText(range);
            for(const skDocument of Skript.DOCUMENTS) {
                for (const comp of skDocument.components) if (comp instanceof SkriptFunction && comp.name === funcName) {
					let uri = Uri.file(skDocument.skPath.fsPath);
					let location = new Location(uri, comp.range);
                    return location;
                }
            }
        }
		return [];
	}
}