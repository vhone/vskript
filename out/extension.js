"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const vscode_1 = require("vscode");
const Skript_1 = require("./Skript");
const Provider = require("./provider");
const TextDocumentChangeEvent_1 = require("./event/TextDocumentChangeEvent");
const SkriptDocumentSemanticTokensProvider_1 = require("./provider/SkriptDocumentSemanticTokensProvider");
// Options
vscode_1.languages.setLanguageConfiguration('vskript', {
    onEnterRules: [{
            action: { indentAction: vscode_1.IndentAction.Indent },
            beforeText: /\:((\s\t)*?\#.*?)?$/i
        }],
    brackets: [['(', ')'], ['[', ']'], ['{', '}']],
    comments: { lineComment: '#' }
});
function activate(_context) {
    Skript_1.onSkriptEnable();
    // Provider
    vscode_1.languages.registerDocumentSymbolProvider('vskript', new Provider.SkriptDocumentSymbolProvider());
    vscode_1.languages.registerWorkspaceSymbolProvider(new Provider.SkriptWorkspaceSymbolProvider());
    vscode_1.languages.registerHoverProvider('vskript', new Provider.SkriptHoverProvider());
    vscode_1.languages.registerDefinitionProvider('vskript', new Provider.SkriptDefinitionProvider());
    vscode_1.languages.registerCompletionItemProvider('vskript', new Provider.SkriptCompletionItemProvider());
    vscode_1.languages.registerDocumentSemanticTokensProvider('vskript', new Provider.SkriptDocumentSemanticTokensProvider(), SkriptDocumentSemanticTokensProvider_1.LEGEND);
    vscode_1.languages.registerColorProvider('vskript', new Provider.SkriptDocumentColorProvider());
    // Event;
    vscode_1.workspace.onDidChangeTextDocument(TextDocumentChangeEvent_1.default);
}
exports.activate = activate;
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map