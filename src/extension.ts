import * as vscode from 'vscode';  //see https://bobbyhadz.com/blog/typescript-http-request
import { LabelaryPanel } from './panels/labelary_panel';


export function activate(context: vscode.ExtensionContext) {
	// Command for raw ZPL label
	const rawZplPanelCommand = vscode.commands.registerCommand('labelary.view-zpl-label', () => {
		LabelaryPanel.render(context.extensionUri, context, 'zpl');
	});
	
	context.subscriptions.push(rawZplPanelCommand);

	// Command for raw ZPL label
	const base64PanelCommand = vscode.commands.registerCommand('labelary.view-base64-label', () => {
		LabelaryPanel.render(context.extensionUri, context, 'base64');
	});
	
	context.subscriptions.push(base64PanelCommand);	

	// Command for raw ZPL label
	const base64PanelCommandA4 = vscode.commands.registerCommand('labelary.view-zpl-labelA4', () => {
		LabelaryPanel.render(context.extensionUri, context, 'base64',"8.25x11.75");
	});
	
	context.subscriptions.push(base64PanelCommandA4);	

	// Command for raw ZPL label
	const base64PanelCommand4x8 = vscode.commands.registerCommand('labelary.view-zpl-label4x8', () => {
		LabelaryPanel.render(context.extensionUri, context, 'base64',"4x8");
	});
	
	context.subscriptions.push(base64PanelCommand4x8);
}