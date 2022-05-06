import * as vscode from 'vscode';  //see https://bobbyhadz.com/blog/typescript-http-request
import { LabelaryPanel } from './panels/labelary_panel';


export function activate(context: vscode.ExtensionContext) {
	// Create Integration panel
	const labelaryPanelCommand = vscode.commands.registerCommand('labelary-panel.labelary', () => {
		LabelaryPanel.render(context.extensionUri, context);
	});
	
	context.subscriptions.push(labelaryPanelCommand);	
}