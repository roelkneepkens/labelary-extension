import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';
import { Base64Utils } from './base64utils';
import { Localizer } from './localizer';
import { MimeTypes } from './mimeTypes';

export class View {
	private messages: any;
	private style = `
    body {
        background-color: #1e1e1e;
        margin: 0;
        padding: 0 8px;
        width: 99%;
    }
    
    code {
        max-width: 100%;
        word-wrap: break-word;
    }
    
    h1 {
        background-color: #004c8c;
        border-top-left-radius: 4px;
        border-top-right-radius: 4px;
        color: #ffffff;
        padding-bottom: 8px;
        padding-top: 8px;
        text-align: center;
        width: 100%;
    }
    
    h2, h3 {
        text-align: center;
        vertical-align: middle;
        width: 100%;
    }
    
    .action-button {
        background-color: #303030;
        border: #dddddd solid 1px;
        color: #dddddd;
        font-size: 1.1em;
        margin: 8px 12px;
        max-width: fit-content;
        padding: 8px;
    }

    .button-bar {
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .centered-column {
        display: flex;
        justify-content: center;
    }
    
    .content {
        border-top: #909090 solid 1px;
        display: flex;
        justify-content: center;
        margin: 4px;
        padding: 4px 0;
    }
    
    .encoded-content {
        align-items: center;
        display: flex;
        flex-direction: column;
        justify-content: center;
    }
    
    .page-content {
        margin: 0;
        padding: 0;
        width: 100%;
    }
    
    .page-nav {
        display: flex;
        justify-content: space-around;
        align-items: center;
    }
    
    .pdf-content {
        border-top: #909090 solid 1px;
        margin-top: 4px;
        padding: 0;
    }
    
    .pdf-navbar {
        background-color: #454545;
        display: flex;
        font-size: 1.1em;
        justify-content: space-between;
        padding: 8px;
    }
    
    .pdf-navbar button {
        background-color: #303030;
        border: #dddddd solid 1px;
        color: #dddddd;
        font-weight: bold;
        padding: 6px 10px;
        margin: 0 16px;
    }
    
    .spacer {
        width: 48px;
    }
    
    .title-bar {
        margin: 0;
        padding: 0;
        width: 100%;
    }
    
    .two-col {
        display: flex;
        justify-content: space-around;
    }
    
    .two-col > * {
        padding: 0 8px;
    }
    
    .two-col > :first-child {
        flex-grow: 2;
    }
    
    .two-col > :last-child {
        flex-grow: 1;
    }
    `;

	constructor() {
		let localizer = new Localizer();
		this.messages = localizer.getLocalizedMessages();
	}

	public createView(
		extensionRoot: vscode.Uri,
		target: string,
		mimeType: string,
		viewType: string,
		filePath?: string,
	) {
		// Create and show panel
		var webviewPanel = vscode.window.createWebviewPanel(
			'base64viewer',
			this.messages.general.title,
			vscode.ViewColumn.Two,
			{},
		);
		webviewPanel.webview.options = {
			enableScripts: true,
		};

		// Clean resources
		webviewPanel.onDidDispose(() => {
			webviewPanel.dispose();
		});

		// Handle messages from the webview
		webviewPanel.webview.onDidReceiveMessage((message) => {
			if (message.command === 'copy') {
				this.copyToClipboard(message.text);
				return;
			} else if (message.command === 'save') {
				this.saveDecodedFile(message.mimeType, message.text);
				return;
			}
		});

		if (viewType === 'decoding') {
			webviewPanel.webview.html = this.initWebviewDecodingContent(
				extensionRoot,
				webviewPanel.webview,
				target,
				mimeType,
			);
		} else if (viewType === 'encoding') {
			webviewPanel.webview.html = this.initWebviewEncodingContent(
				extensionRoot,
				webviewPanel.webview,
				target,
				mimeType,
				filePath || '',
			);
		}
	}

	private copyToClipboard(text: string) {
		vscode.env.clipboard.writeText(text).then(() => {
			this.showInformationPopup(this.messages.general.copiedToClipboard);
		});
	}

	private getNonce() {
		let text = '';
		const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
		for (let i = 0; i < 32; i++) {
			text += possible.charAt(Math.floor(Math.random() * possible.length));
		}
		return text;
	}

	private initWebviewDecodingContent(
		extensionRoot: vscode.Uri,
		webview: vscode.Webview,
		base64String: string,
		mimeType: string,
	): string {
		const b64u = new Base64Utils();
		const nonce = this.getNonce();
		const spacer = '  |  ';
		const resolveAsUri = (...p: string[]): vscode.Uri => {
			const uri = vscode.Uri.file(path.join(extensionRoot.path, ...p));
			return webview.asWebviewUri(uri);
		};
		const fileSize = b64u.getFileSize(base64String);

		let head = ``;
		let body = ``;

		if (mimeType === 'application/pdf') {
			head = `
                <!DOCTYPE html>
                <html dir="ltr" mozdisallowselectionprint>
                    <head>
                        <meta charset="utf-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
                        <meta name="google" content="notranslate">
                        <meta http-equiv="X-UA-Compatible" content="IE=edge">
                        <title>${this.messages.general.title}</title>
                        <script nonce="${nonce}" src="${resolveAsUri('lib', 'pdfjs-dist', 'pdf.js')}"></script>
                        <style>${this.style}</style>
                    </head>`;
			body = `
                <body>            
                    <div class="page-content two-col">
                        <div>
                            <h3>${mimeType}  (${fileSize})</h3>
                            <div class="pdf-content">
                                <div class="button-bar">
                                    <button class="action-button" onclick="postMessage('save', '${mimeType}', '${base64String}')">
                                        ${this.messages.general.saveButton}
                                    </button>
                                </div>
                                <div class="pdf-navbar">
                                    <div class="spacer"></div>
            
                                    <div class="page-nav">
                                        <button onclick="changePage(loadedPdf, currentPage, 'prev')"><</button>
                                        <span>
                                            ${
												this.messages.pdf.page
											} : <span id="currentPage"></span> / <span id="totalPage"></span>
                                        </span>
                                        <button onclick="changePage(loadedPdf, currentPage, 'next')">></button>
                                    </div>
            
                                    <div class="spacer"></div>
                                </div>
            
                                <canvas id="pdfCanvas"></canvas>
                            </div>
                        </div>
            
                        <div>
                            <div>
                                <h3>${this.messages.pdf.orderedElements.text.title}</h3>
                                <div class="content">
                                    <code id="pdfTextElementsList"></code>
                                </div>
                            </div>
                            <div>
                                <h3>${this.messages.pdf.orderedElements.images.title}</h3>
                                <div class="content" id="pdfImagesList"></div>
                            </div>
                        </div>
                    </div>
            
                    <script nonce="${nonce}">
                        const vscode = acquireVsCodeApi();

                        function postMessage(command, mimeType, text) {
                            var message = {
                                command: command,
                                mimeType: mimeType,
                                text: text,
                            };
                            vscode.postMessage(message);
                        }
                    </script>
            
                    <script nonce="${nonce}">
                        var pdfData = atob('${base64String}');
                        var pdfjsLib = window['pdfjs-dist/build/pdf'];
                        pdfjsLib.GlobalWorkerOptions.workerSrc = '${resolveAsUri(
							'lib',
							'pdfjs-dist',
							'pdf.worker.js',
						)}';
            
                        var loadingTask = pdfjsLib.getDocument({data: pdfData});

                        var loadedPdf;
                        var currentPage;
            
                        loadingTask.promise.then(function(pdf) {
                            loadedPdf = pdf;

                            // Init page navbar
                            var currentPageElement = document.getElementById('currentPage');
                            currentPageElement.innerText = 1;
                            currentPage = 1;
                            var totalPageElement = document.getElementById('totalPage');
                            totalPageElement.innerText = pdf.numPages;
                        
                            // Fetch the first page
                            var pageNumber = 1;
                            renderPage(pdf, pageNumber);
                        
                            // Parsing the pdf page by page
                            parsePdf(pdf);
                        }, function (reason) {
                            // PDF loading error
                            console.error("Error: " + reason);
                        });

                        function changePage(pdf, current, change) {
                            var pageNumber = (change === "prev") ? current - 1 : current + 1;
                        
                            if (pageNumber < 1) {
                                pageNumber = 1;
                            } else if (pageNumber > pdf.numPages) {
                                pageNumber = pdf.numPages;
                            }
                        
                            renderPage(pdf, pageNumber);
                        }
                        
                        function extractImagesInPage(page) {
                            const scale = 1.5;
                            const viewport = page.getViewport({scale: scale});

                            page.getOperatorList().then(function(opList) {
                                var svgGfx = new pdfjsLib.SVGGraphics(page.commonObjs, page.objs);
                                return svgGfx.getSVG(opList, viewport);
                            }).then(function(svg) {
                                var pageSvgString = new XMLSerializer().serializeToString(svg);
                                var cutSvg = pageSvgString.split('<svg:image ');
                                for (var i=0; i < cutSvg.length; i++) {
                                    var recut = cutSvg[i+1].split('/>');
                                    var blob = recut[0].split('href="');
                                    blob = blob[1].split('"');
                                    var svgSrc = blob[0];
                                    
                                    var img = document.createElement("IMG");
                                    img.setAttribute('src', svgSrc)
                                    img.setAttribute('width', '80%');

                                    document.getElementById('pdfImagesList').appendChild(img);
                                }
                            });	
                        }
                        
                        function extractTextInPage(page, htmlList) {
                            page.getTextContent().then(function(tokenizedText) {
                                var textElementsList = "";
                                var pageContent = tokenizedText.items.map(token => token.str);
                            
                                pageContent.forEach(function(textElement) {
                                    textElement = textElement.trim();
                                
                                    if (textElement !== '') {
                                        textElementsList = textElementsList + textElement + '${spacer}';
                                    }
                                });

                                htmlList.innerText = htmlList.innerText + textElementsList;
                            });
                        }
                        
                        function parsePdf(pdf) {
                            var pdfTextElementsList = document.getElementById('pdfTextElementsList');
                            for (let i = 0; i < pdf.numPages; i++) {                            
                                pdf.getPage(i + 1).then(function(page) {
                                    extractTextInPage(page, pdfTextElementsList);
                                    extractImagesInPage(page);
                                });				
                            }
                        }
                        
                        function renderPage(pdf, pageNum) {
                            var currentPageElement = document.getElementById('currentPage');
                        
                            pdf.getPage(pageNum).then(function(page) {
                                var scale = 1.5;
                                var viewport = page.getViewport({scale: scale});
                          
                                // Prepare canvas using PDF page dimensions
                                var canvas = document.getElementById('pdfCanvas');
                                var context = canvas.getContext('2d');
                                canvas.height = viewport.height;
                                canvas.width = viewport.width;
                          
                                // Render PDF page into canvas context
                                var renderContext = {
                                    canvasContext: context,
                                    viewport: viewport
                                };
                                var renderTask = page.render(renderContext);
                                renderTask.promise.then(function () {
                                    currentPageElement.innerText = pageNum;
                                    currentPage = pageNum;
                                });
                            });
                        }
                    </script>
                </body>
            </html>`;
		} else if (mimeType.includes('image')) {
			head = `
                <!DOCTYPE html>
                <html dir="ltr" mozdisallowselectionprint>
                    <head>
                        <meta charset="utf-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
                        <meta name="google" content="notranslate">
                        <meta http-equiv="X-UA-Compatible" content="IE=edge">
                        <title>${this.messages.general.title}</title>
                        <style>${this.style}</style>
                    </head>`;
			body = `
                <body>
            
                    <div class="page-content">
                        <h3>${mimeType}  (${fileSize})</h3>
                        <div class="content">
                            <div class="button-bar">
                                <button class="action-button" onclick="postMessage('save', '${mimeType}', '${base64String}')">
                                    ${this.messages.general.saveButton}
                                </button>
                            </div>
                            <img src="data:${mimeType};base64,${base64String}"/>
                        </div>
                    </div>
            
                    <script nonce="${nonce}">
                        const vscode = acquireVsCodeApi();

                        function postMessage(command, mimeType, text) {
                            var message = {
                                command: command,
                                mimeType: mimeType,
                                text: text,
                            };
                            vscode.postMessage(message);
                        }
                    </script>
                </body>
            </html>`;
		} else if (mimeType.includes('text')) {
			head = `
                <!DOCTYPE html>
                <html dir="ltr" mozdisallowselectionprint>
                    <head>
                        <meta charset="utf-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
                        <meta name="google" content="notranslate">
                        <meta http-equiv="X-UA-Compatible" content="IE=edge">
                        <title>${this.messages.general.title}</title>
                        <style>${this.style}</style>
                    </head>`;
			body = `
                <body>
            
                    <div class="page-content">
                        <h3>${mimeType}  (${fileSize})</h3>
                        <div class="content">
                            <div class="button-bar">
                                <button class="action-button" onclick="postMessage('save', '${mimeType}', '${base64String}')">
                                    ${this.messages.general.saveButton}
                                </button>
                            </div>
                            <code id="code-tag"></code>
                        </div>
                    </div>
            
                    <script nonce="${nonce}">
                        const vscode = acquireVsCodeApi();

                        function postMessage(command, mimeType, text) {
                            var message = {
                                command: command,
                                mimeType: mimeType,
                                text: text,
                            };
                            vscode.postMessage(message);
                        }
                    </script>
                        
                    <script nonce="${nonce}">
                        var text = atob('${base64String}');
                        var codeTag = document.getElementById('code-tag');
                        codeTag.innerText = text;
                    </script>
                </body>
            </html>`;
		} else {
			head = `
                <!DOCTYPE html>
                <html dir="ltr" mozdisallowselectionprint>
                    <head>
                        <meta charset="utf-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
                        <meta name="google" content="notranslate">
                        <meta http-equiv="X-UA-Compatible" content="IE=edge">
                        <title>${this.messages.general.title}</title>
                        <style>${this.style}</style>
                    </head>`;
			body = `
                <body>
            
                    <div class="page-content">
                        <h3>${mimeType}  (${fileSize})</h3>
                        <div class="content">
                            <div class="button-bar">
                                <button class="action-button" onclick="postMessage('save', '${mimeType}', '${base64String}')">
                                    ${this.messages.general.saveButton}
                                </button>
                            </div>
                            <h2>${this.messages.general.cantDisplayContent}</h2>
                        </div>
                    </div>
            
                    <script nonce="${nonce}">
                        const vscode = acquireVsCodeApi();

                        function postMessage(command, mimeType, text) {
                            var message = {
                                command: command,
                                mimeType: mimeType,
                                text: text,
                            };
                            vscode.postMessage(message);
                        }
                    </script>
                </body>
            </html>`;
		}

		return head + body;
	}

	private initWebviewEncodingContent(
		extensionRoot: vscode.Uri,
		webview: vscode.Webview,
		content: string,
		mimeType: string,
		filePath: string,
	): string {
		const nonce = this.getNonce();
		const spacer = '  |  ';
		const resolveAsUri = (...p: string[]): vscode.Uri => {
			const uri = vscode.Uri.file(path.join(extensionRoot.path, ...p));
			return webview.asWebviewUri(uri);
		};

		let head = ``;
		let body = ``;

		if (mimeType === 'application/pdf') {
			head = `
                <!DOCTYPE html>
                <html dir="ltr" mozdisallowselectionprint>
                    <head>
                        <meta charset="utf-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
                        <meta name="google" content="notranslate">
                        <meta http-equiv="X-UA-Compatible" content="IE=edge">
                        <title>${this.messages.general.title}</title>
                        <style>${this.style}</style>
                        <script nonce="${nonce}" src="${resolveAsUri('lib', 'pdfjs-dist', 'pdf.js')}"></script>
                    </head>`;
			body = `
                <body>
                    <div class="title-bar">
                        <h1>${this.messages.general.title}</h1>
                    </div>
            
                    <div class="page-content">
                        <h3>${filePath}<br/><br/>${mimeType}</h3>
                        <div class="content encoded-content">
                            <div class="button-bar">
                                <button id="switchButton" class="action-button" onclick="switchContent()">${
									this.messages.pdf.orderedElements.text.button
								}</button>
                                <button class="action-button" onclick="postMessage('copy', '${mimeType}', '${content}')">${
				this.messages.general.copyButton
			}</button>
                            </div>
                            <code id="code-tag">${content}</code>
                            <br/>
                            <details id="pdfImagesList">
                                <summary>${this.messages.pdf.orderedElements.images.title}</summary>
                            </details>
                        </div>
                    </div>
            
                    <script nonce="${nonce}">
                        const vscode = acquireVsCodeApi();

                        function postMessage(command, mimeType, text) {
                            var message = {
                                command: command,
                                mimeType: mimeType,
                                text: text,
                            };
                            vscode.postMessage(message);
                        }
                    </script>

                    <script nonce="${nonce}">
                        var displayed = "content";
                        var textElementsList = "";

                        var pdfData = atob('${content}');
                        var pdfjsLib = window['pdfjs-dist/build/pdf'];
                        pdfjsLib.GlobalWorkerOptions.workerSrc = '${resolveAsUri(
							'lib',
							'pdfjs-dist',
							'pdf.worker.js',
						)}';
            
                        var loadingTask = pdfjsLib.getDocument({data: pdfData});
            
                        loadingTask.promise.then(function(pdf) {
                            parsePdf(pdf);                            
                        }, function (reason) {
                            // PDF loading error
                            console.error("Error: " + reason);
                        });
                        
                        function extractImagesInPage(page) {
                            const scale = 1.5;
                            const viewport = page.getViewport({scale: scale});

                            page.getOperatorList().then(function(opList) {
                                var svgGfx = new pdfjsLib.SVGGraphics(page.commonObjs, page.objs);
                                return svgGfx.getSVG(opList, viewport);
                            }).then(function(svg) {
                                var pageSvgString = new XMLSerializer().serializeToString(svg);
                                var cutSvg = pageSvgString.split('<svg:image ');
                                for (var i=0; i < cutSvg.length; i++) {
                                    var recut = cutSvg[i+1].split('/>');
                                    var blob = recut[0].split('href="');
                                    blob = blob[1].split('"');
                                    var svgSrc = blob[0];

                                    var img = document.createElement("IMG");
                                    img.setAttribute('src', svgSrc)
                                    img.setAttribute('width', '80%');

                                    document.getElementById('pdfImagesList').appendChild(img);
                                }
                            });	
                        }
                        
                        function extractTextInPage(page, htmlList) {
                            page.getTextContent().then(function(tokenizedText) {
                                var pageContent = tokenizedText.items.map(token => token.str);
                            
                                pageContent.forEach(function(textElement) {
                                    textElement = textElement.trim();
                                
                                    if (textElement !== '') {
                                        textElementsList = textElementsList + textElement + '${spacer}';
                                    }
                                });
                            });
                        }
                        
                        function parsePdf(pdf) {
                            var pdfTextElementsList = document.getElementById('pdfTextElementsList');
                            for (let i = 0; i < pdf.numPages; i++) {                            
                                pdf.getPage(i + 1).then(function(page) {
                                    extractTextInPage(page, pdfTextElementsList);
                                    extractImagesInPage(page);
                                });				
                            }
                        }

                        function switchContent() {
                            var codeTag = document.getElementById('code-tag');
                            var switchButton = document.getElementById('switchButton');

                            if (displayed === "content") {
                                codeTag.innerText = textElementsList;
                                displayed = "textElementsList";
                                switchButton.innerText = "${this.messages.pdf.encodedString.button}";
                            } else {
                                codeTag.innerText = '${content}';
                                displayed = "content";
                                switchButton.innerText = "${this.messages.pdf.orderedElements.text.button}";
                            }
                        }
                    </script>
                </body>
            </html>`;
		} else {
			head = `
                <!DOCTYPE html>
                <html dir="ltr" mozdisallowselectionprint>
                    <head>
                        <meta charset="utf-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
                        <meta name="google" content="notranslate">
                        <meta http-equiv="X-UA-Compatible" content="IE=edge">
                        <title>${this.messages.general.title}</title>
                        <style>${this.style}</style>
                    </head>`;
			body = `
                <body>
                    <div class="title-bar">
                        <h1>${this.messages.general.title}</h1>
                    </div>
            
                    <div class="page-content">
                        <h3>${filePath}<br/><br/>${mimeType}</h3>
                        <div class="content encoded-content">
                            <div class="button-bar">
                                <button class="action-button" onclick="postMessage('copy', '${mimeType}', '${content}')">${this.messages.general.copyButton}</button>
                            </div>
                            <code id="code-tag">${content}</code>
                        </div>
                    </div>
            
                    <script nonce="${nonce}">
                        const vscode = acquireVsCodeApi();

                        function postMessage(command, mimeType, text) {
                            var message = {
                                command: command,
                                mimeType: mimeType,
                                text: text,
                            };
                            vscode.postMessage(message);
                        }
                    </script>
                </body>
            </html>`;
		}

		return head + body;
	}

	private saveDecodedFile(mimeType: string, base64String: string) {
		const mT = new MimeTypes();
		const xss = require('xss');

		let mTKeys = [...mT.mimeTypes.entries()].filter(({ 1: v }) => v === mimeType).map(([k]) => k);
		let fileExtension = mTKeys[0];

		vscode.window
			.showInputBox({
				prompt: this.messages.general.prompt.save,
			})
			.then(
				(name) => {
					let fileName = '';

					if (name !== undefined) {
						fileName = xss(name);
					} else {
						fileName = new Date().toISOString();
					}

					fileName = fileName + '.' + fileExtension;

					let buf = Buffer.from("'" + base64String + "'", 'base64');

					fs.writeFile(fileName, buf, (err) => {
						if (err) {
							this.showErrorPopup(this.messages.general.fileSave.error + ' : ' + err);
						} else {
							this.showInformationPopup(this.messages.general.fileSave.success + ' : ' + fileName);
						}
					});
				},
				(reason) => this.showErrorPopup(reason),
			);
	}

	private showErrorPopup(message: string) {
		vscode.window.showErrorMessage(message);
	}

	private showInformationPopup(message: string) {
		vscode.window.showInformationMessage(message);
	}
}
