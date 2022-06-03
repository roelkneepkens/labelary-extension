import * as vscode from 'vscode';  //see https://bobbyhadz.com/blog/typescript-http-request
import { LabelaryPanel } from './panels/labelary_panel';


export function activate(context: vscode.ExtensionContext) {
	let labelsizes = ["8.25x11.75", "4x8", "8x4"];

	labelsizes.forEach((value, index) => {
		const commandbutton: string = `labelary.view-label${value}`;
		const label = vscode.commands.registerCommand(commandbutton, () => {
			LabelaryPanel.render(context.extensionUri, context, value);
		});
		
		context.subscriptions.push(label);
	  });

	// // Command for default label
	// const label = vscode.commands.registerCommand('labelary.view-label', () => {
	// 	LabelaryPanel.render(context.extensionUri, context);
	// });
	
	// context.subscriptions.push(label);


	// // Command for raw ZPL label
	// const labelA4 = vscode.commands.registerCommand('labelary.view-labelA4', () => {
	// 	LabelaryPanel.render(context.extensionUri, context, "8.25x11.75");
	// });
	
	// context.subscriptions.push(labelA4);	

	// // Command for raw ZPL label
	// const label4x8 = vscode.commands.registerCommand('labelary.view-label4x8', () => {
	// 	LabelaryPanel.render(context.extensionUri, context, "4x8");
	// });
	
	// context.subscriptions.push(label4x8);
}