import * as vscode from 'vscode';  //see https://bobbyhadz.com/blog/typescript-http-request
import { LabelaryPanel } from './panels/labelary_panel';


export function activate(context: vscode.ExtensionContext) {
	// Command for raw ZPL label
	const rawZplPanelCommand = vscode.commands.registerCommand('labelary.view-zpl-label', () => {
		LabelaryPanel.render(context.extensionUri, context, 'zpl');
	});
	
	context.subscriptions.push(rawZplPanelCommand);

	// Command for raw ZPL label
	const Base64PanelCommand = vscode.commands.registerCommand('labelary.view-base64-label', () => {
		LabelaryPanel.render(context.extensionUri, context, 'base64');
	});
	
	context.subscriptions.push(Base64PanelCommand);	
}