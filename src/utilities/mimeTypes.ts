export class MimeTypes {
	public mimeTypes: Map<string, string>;
	public types: Array<string>;

	constructor() {
		this.mimeTypes = new Map<string, string>();
		this.mimeTypes.set('avi', 'video/x-msvideo');
		this.mimeTypes.set('bmp', 'image/bmp');
		this.mimeTypes.set('doc', 'application/msword');
		this.mimeTypes.set('docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
		this.mimeTypes.set('exe', 'application/vnd.microsoft.portable-executable');
		this.mimeTypes.set('gif', 'image/gif');
		this.mimeTypes.set('ico', 'image/x-icon');
		this.mimeTypes.set('jpeg', 'image/jpeg');
		this.mimeTypes.set('jpg', 'image/jpeg');
		this.mimeTypes.set('mp3', 'audio/mpeg');
		this.mimeTypes.set('mp4', 'video/mpeg');
		this.mimeTypes.set('mpeg', 'video/mpeg');
		this.mimeTypes.set('ogg', 'audio/ogg');
		this.mimeTypes.set('ogg', 'video/ogg');
		this.mimeTypes.set('png', 'image/png');
		this.mimeTypes.set('pdf', 'application/pdf');
		this.mimeTypes.set('ppt', 'application/vnd.ms-powerpoint');
		this.mimeTypes.set('pptx', 'application/vnd.openxmlformats-officedocument.presentationml.presentation');
		this.mimeTypes.set('rar', 'application/');
		this.mimeTypes.set('svg', 'image/svg+xml');
		this.mimeTypes.set('tif', 'image/tiff');
		this.mimeTypes.set('tiff', 'image/tiff');
		this.mimeTypes.set('txt', 'text/plain');
		this.mimeTypes.set('wav', 'audio/x-wav');
		this.mimeTypes.set('webm', 'video/webm');
		this.mimeTypes.set('xls', 'application/vnd.ms-excel');
		this.mimeTypes.set('xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
		this.mimeTypes.set('zip', 'application/zip');

		this.types = [
			'avi',
			'bmp',
			'doc',
			'docx',
			'exe',
			'gif',
			'ico',
			'jpeg',
			'jpg',
			'mp3',
			'mp4',
			'mpeg',
			'ogg (audio)',
			'ogg (video)',
			'png',
			'pdf',
			'ppt',
			'pptx',
			'rar',
			'svg',
			'tif',
			'tiff',
			'txt',
			'wav',
			'webm',
			'xls',
			'xslx',
			'zip',
		];
	}
}
