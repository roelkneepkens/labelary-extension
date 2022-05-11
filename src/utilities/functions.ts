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

export function removeAfterFirstDelimiter(string: string) : string {
	return string.replace(/["<>][\s\S]*$/g,'');
}