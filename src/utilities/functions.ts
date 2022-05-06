import { Uri, Webview, workspace , ExtensionContext, window, Terminal} from "vscode";
import * as path from "path";

export function getUri(webview: Webview, extensionUri: Uri, pathList: string[]) {
  return webview.asWebviewUri(Uri.joinPath(extensionUri, ...pathList));
}

export async function getWorkspaceFile(matchString: string): Promise<string> {
	// get path to file in workspace
	let functionsFiles = await workspace.findFiles(matchString);
	const outFile = functionsFiles[0].fsPath.replace(/\\/g, '/');
	return outFile;
}

export function getExtensionFile(context: ExtensionContext, folder: string, file: string): string {
	// get path to file in extension folder
	let fileRawPath = Uri.file(
		path.join(context.extensionPath, folder, file)
	);

	let filePathEscaped : string = fileRawPath.toString();

	let filePath = Uri.parse(filePathEscaped).fsPath;

	return filePath;
}

export function startScript (fileName ?: string , filePath ?: string , command ?: string) : Terminal {
	let terminal = window.createTerminal('bram');
	terminal.show();
	//terminal.sendText('Get-Location');
	if (filePath && filePath !== '') {
		terminal.sendText(`cd ${filePath}`);
	};
	
	if (fileName && fileName !== '') {
		terminal.sendText(`./${fileName}`);
	};

	if (command && command !== '') {
		terminal.sendText(command);
	};
	
	return terminal;
}

export function cleanPath (path: string) : string {
	return path.replace(/\\/g, '/');
}

export function parentPath (path: string) : string {
	return path.replace(/\/[^\/]+$/,'');
}

export function nth(num:number): string {
	let after:string = '';
	switch (num) {
		case 1 :
		after = 'st';
		break;
		case 2 :
		after = 'nd';
		break;
		case 3 :
		after = 'rd';
		break;
		default:
		after = 'th';
		break;
	}
	return after;
}

export function dropdownOptions(options:(string|number)[]) : string {
	let optionsString : string = '';
	for (const option of options) {
		optionsString += '\n    <vscode-option>' + option + '</vscode-option>';
	}

	return optionsString;
}

export function arrayFrom0(max:number) : number[] {
	// from https://stackoverflow.com/a/33352604/1716283
	return [...Array(max).keys()];
}

export function arrayFrom1(max:number) : number[] {
	return arrayFrom0(max).map(x => ++x);
}

export function toBoolean(string:string) : boolean {
	let outString : boolean = false;
	if (string.toLowerCase() === 'true') {
		outString = true;
	}

	return outString;
}

export function isEmptyStringArray(array: String[]) : boolean {
	let isEmpty: boolean = true;

	for (let index = 0; index < array.length; index++) {
        let current = array[index];
		if (current !== undefined && ("" + current) !== "") {
			isEmpty = false;
			break;
		}
	}
	return isEmpty;
}
