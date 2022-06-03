import { Uri, Webview} from "vscode";

export function getUri(webview: Webview, extensionUri: Uri, pathList: string[]) {
  return webview.asWebviewUri(Uri.joinPath(extensionUri, ...pathList));
}

export function removeNewlines(string:string) : string {
	return string.replace(/\r/g,'').replace(/\n/g,'');
}

export function reverseString(string: string) : string {
	return string.split("").reverse().join("");
}

export function removeAfterFirstDelimiter(string: string, type: string = 'zpl') : string {
	let outString = (type === 'zpl') ? string.replace(/["<>][\s\S]*$/g,'') : string.replace(/["'`<>\{\}\[\]\(\)\|\\\/:;,\s][\s\S]*$/g,'');

	return outString;
}