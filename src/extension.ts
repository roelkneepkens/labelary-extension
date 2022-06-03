import * as vscode from 'vscode';  //see https://bobbyhadz.com/blog/typescript-http-request
import { LabelaryPanel } from './panels/labelary_panel';

export function activate(context: vscode.ExtensionContext) {
	const labelSizeSetting: string = vscode.workspace.getConfiguration().get<string>('labelary.labelsize') ?? '';
	let labelSizesRaw: string[] = labelSizeSetting?.split(',').map(x=> x.trim());

	// sizes: strip any possibly defined names in ()
	let labelSizes: string[] = labelSizesRaw.map( x => x.replace(/\([\s\S]*$/g,'').trim() );

	// Names: if a name is defined in between (), take the name, else take the value
	let labelSizeNames : string[] = labelSizesRaw.map(x => x.replace(/^[\s\S]*\(([^\)]*)[\s\S]*$/g,'$1').trim() );	

	// Command for default label
	const label = vscode.commands.registerCommand('labelary.view-labeldefault', () => {
		LabelaryPanel.render(context.extensionUri, context);
	});	
	context.subscriptions.push(label);

	// Command for A4 label
	const labelA4 = vscode.commands.registerCommand('labelary.view-labelA4', () => {
		LabelaryPanel.render(context.extensionUri, context, "8.25x11.75");
	});	
	context.subscriptions.push(labelA4);	

	// Command for 4x8 label
	const label4x8 = vscode.commands.registerCommand('labelary.view-label4x8', () => {
		LabelaryPanel.render(context.extensionUri, context, "4x8");
	});	
	context.subscriptions.push(label4x8);

	// Command for 8x4 label
	const label8x4 = vscode.commands.registerCommand('labelary.view-label8x4', () => {
		LabelaryPanel.render(context.extensionUri, context, "8x4");
	});	
	context.subscriptions.push(label8x4);

	// Command for default label
	const labelcustom = vscode.commands.registerCommand('labelary.view-labelcustom', () => {


		vscode.window.showQuickPick(labelSizeNames, { placeHolder: 'Choose the label size...' }).then(
			(selectedSize) => {
				LabelaryPanel.render(context.extensionUri, context, labelSizes[labelSizeNames.indexOf(selectedSize ?? '')]);
			}
		);
		
	});	
	context.subscriptions.push(labelcustom);
}