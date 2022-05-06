import * as vscode from 'vscode';
import { MimeTypes } from './mimeTypes';

export class Base64Utils {
	constructor() {}

	public getFileSize(base64String: string): string {
		let size = '';
		let byteSize = base64String.length * (3 / 4);

		if (byteSize > 1000000000) {
			size = byteSize / 1000000000 + ' GB';
		} else if (byteSize > 1000000) {
			size = byteSize / 1000000 + ' MB';
		} else if (byteSize > 1000) {
			size = byteSize / 1000 + ' KB';
		} else {
			size = byteSize + ' B';
		}

		return size;
	}

	public async getMimeType(base64String: any): Promise<string> {
		return new Promise<string>((resolve) => {
			let mT = new MimeTypes();
			let mime = base64String.match(/data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+).*,.*/);
			if (mime && mime.length) {
				resolve(mime[1]);
			} else {
				let byteNumber = null;
				let decodedString = Buffer.from("'" + base64String + "'", 'base64');
				let hex = '';

				for (let i = 0; i < 4; i++) {
					byteNumber = decodedString.readUInt8(i);
					hex = hex + byteNumber.toString(16).toUpperCase();
				}
				let guessedMimeType = this.getMimeTypeFromBinary(hex);

				if (guessedMimeType === 'Unknown filetype') {
					vscode.window.showQuickPick(mT.types, { placeHolder: 'Choose the format of the document...' }).then(
						(selectedType) => {
							selectedType ? resolve(mT.mimeTypes.get(selectedType)) : resolve('');
						},
						(reason) => {
							console.log('Error: ' + reason);
							resolve('');
						},
					);
				} else {
					resolve(guessedMimeType);
				}
			}
		});
	}

	private getMimeTypeFromBinary(hex: string) {
		if (hex.includes('424D')) {
			return 'image/bmp';
		} else if (hex.includes('504B')) {
			return 'application/zip';
		} else if (hex.includes('5A4D')) {
			return 'application/vnd.microsoft.portable-executable';
		} else if (hex.includes('FFFB') || hex.includes('FFF3') || hex.includes('FFF2') || hex.includes('494433')) {
			return 'audio/mpeg';
		} else {
			switch (hex) {
				case '61686766':
					return 'text/plain';
				case '00000100':
					return 'image/x-icon';
				case '89504E47':
					return 'image/png';
				case '47494638':
					return 'image/gif';
				case '25504446':
					return 'application/pdf';
				case 'FFD8FFDB':
				case 'FFD8FFE0':
					return 'image/jpeg';
				case '52617221':
					return 'application/x-rar-compressed';
				case '52494646':
					return 'audio/x-wav';
				case '4F676753':
					return 'audio/ogg';
				case '1A45DFA3':
					return 'video/webm';
				case '49492A00':
				case '4D4D002A':
					return 'image/tiff';
				case 'D0CF11E0':
					return 'application/ms -word OR -presentation OR -excel';
				case '66747970':
				case '00000020':
					return 'video/mpeg';
				default:
					return 'Unknown filetype';
			}
		}
	}

	public prepareForDecoding(base64String: any): string {
		if (base64String.toString().includes('base64,')) {
			base64String = base64String.toString().split('base64,');
			base64String = base64String[1];
		}

		return base64String;
	}
}
