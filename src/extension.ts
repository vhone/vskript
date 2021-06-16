import { CancellationToken, EvaluatableExpression, ExtensionContext, IndentAction, languages, Position, Range, SemanticTokensLegend, TextDocument, workspace } from 'vscode';
import { onSkriptEnable } from './Skript';
import * as Provider from './provider';
import TextDocumentChangeEvent from './event/TextDocumentChangeEvent';


const tokenTypes = ['class', 'interface', 'enum', 'function', 'variable'];
const tokenModifiers = ['declaration', 'documentation'];
const legend = new SemanticTokensLegend(tokenTypes, tokenModifiers);


// Options
languages.setLanguageConfiguration('vskript', {
	onEnterRules: [{
		action: {indentAction: IndentAction.Indent},
		beforeText: /\:((\s\t)*?\#.*?)?$/i
	}],
	brackets: [['(', ')'], ['[', ']'], ['{', '}'], ['"', '"'], ['%', '%']],
	comments: {lineComment: '#'},
});

export function activate(context:ExtensionContext) {

	onSkriptEnable();

	context.subscriptions.push(

		// Provider
		languages.registerCompletionItemProvider('vskript', new Provider.SkriptCompletionItemProvider()),
		languages.registerColorProvider('vskript', new Provider.SkriptDocumentColorProvider()),
		languages.registerDocumentSymbolProvider('vskript', new Provider.SkriptDocumentSymbolProvider()),
		languages.registerWorkspaceSymbolProvider(new Provider.SkriptWorkspaceSymbolProvider()),
		languages.registerHoverProvider('vskript', new Provider.SkriptHoverProvider()),
		languages.registerDefinitionProvider('vskript', new Provider.SkriptDefinitionProvider()),
		languages.registerDocumentSemanticTokensProvider('vskript', new Provider.SkriptDocumentSemanticTokensProvider(), legend),

		// Event;
		workspace.onDidChangeTextDocument(TextDocumentChangeEvent),

		languages.registerEvaluatableExpressionProvider('vskript', {
			provideEvaluatableExpression(_document: TextDocument, _position: Position, _token: CancellationToken): EvaluatableExpression {
				console.log('registerEvaluatableExpressionProvider');
				return new EvaluatableExpression(new Range(new Position(1,0), new Position(1,10)));
			}
		})

		
	);


}

export function deactivate() {}
