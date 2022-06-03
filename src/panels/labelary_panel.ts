import * as vscode from "vscode";
import axios from 'axios';
import { getUri, removeAfterFirstDelimiter, removeNewlines, reverseString } from "../utilities/functions";
import { Base64Utils } from '../utilities/base64utils';
import { Localizer } from '../utilities/localizer';
import { View } from '../utilities/view';
const xss = require('xss');
//import { xss } from "xss";

export class LabelaryPanel {
  // PROPERTIES
  public static currentPanel: LabelaryPanel | undefined;
  //private _panel: vscode.WebviewPanel;
  private _labelString: string = '';
  private _disposables: vscode.Disposable[] = [];
  private _type: string = 'base64';
  private _labelSize: string;

  // constructor
  private constructor(extensionUri: vscode.Uri, context: vscode.ExtensionContext, type:string, labelSize:string) {
    // set type
    this._type = type;
    this._labelSize = labelSize;

    // retrieve intended label string
    this._labelString = this._getIntendedLabelString();

    // if ZPL: render zpl webview
    if (this._isZPL(this._labelString) || this._isBase64ZPL(this._labelString) ) {
      let panel = vscode.window.createWebviewPanel("labelary-panel", "Display Labelary", vscode.ViewColumn.Two, { enableScripts: true });
      this._getZplWebviewContent(panel.webview, extensionUri).then(html => panel.webview.html = html);
    } 
    // else: render pdf view
    else {
      this._decodeAndDisplay(vscode.Uri.file(context.extensionPath), xss(this._labelString));
    }
  }

  // METHODS
  public static render(extensionUri: vscode.Uri, context: vscode.ExtensionContext, type:string, labelSize:string="4x8") {
      LabelaryPanel.currentPanel = new LabelaryPanel(extensionUri, context, type, labelSize);
  }

  // private _updateWebview(extensionUri: vscode.Uri) {
  //   this._getZplWebviewContent(this._panel.webview, extensionUri).then(html => this._panel.webview.html = html);
  // }


  private _getIntendedLabelString(): string {
    const editor = vscode.window.activeTextEditor;
    let intendedLabelString : string = '';

    if (editor) {
      const document = editor.document;
      const selection = editor.selection;

      // if anything selected: return selected string
      if (document.getText(selection) !== '') {
        intendedLabelString = document.getText(selection);
      }

      // else: retrieve from cursor context
      // get from both sides of the cursor all text between any kind of quote character, or if not present, from start/till end of the document
      else {
        let cursorLineNumber:       number = selection.active.line;
        let cursorCharNumber:       number = selection.active.character;
        let lastLine:               number = document.lineCount -1;
        let lastLineLastCharacter:  number = document.lineAt(lastLine).text.length;
  
        let textBeforeRaw = document.getText(new vscode.Range(new vscode.Position(0,0), new vscode.Position(cursorLineNumber, cursorCharNumber)));
        let labelStringBefore = reverseString(removeAfterFirstDelimiter(reverseString(removeNewlines(textBeforeRaw)),this._type));

        let textAfterRaw =  document.getText(new vscode.Range(new vscode.Position(cursorLineNumber,cursorCharNumber), new vscode.Position(lastLine, lastLineLastCharacter)));
        let labelStringAfter = removeAfterFirstDelimiter(removeNewlines(textAfterRaw),this._type);

        intendedLabelString = labelStringBefore + labelStringAfter;
      }
    }

    return intendedLabelString;
  }

  private async _getZplWebviewContent(webview: vscode.Webview, extensionUri: vscode.Uri): Promise<string> {
    // const mainUri = getUri(webview, extensionUri, ["panels", "helloworld","main.js"]);
    const styleUri = getUri(webview, extensionUri, ["panels", "labelary", "style.css"]);

    let html: string = ``;

    if (this._labelString === '' || this._labelString === undefined || this._labelString === null) {
      this._labelString = '^XA^CFA,20^FO100,100^FDBefore starting the extension:^FS^FO100,120^FDPlease select the text to convert with labelary.^FS^XZ';
    }

    // if ZPL: get html data
    let zplDataArray = await this._getZPLLabel();
    let labelData = zplDataArray[0];
    let selectorDots = zplDataArray[1];

    // construct your HTML code
    html +=  /*html*/
      `<!DOCTYPE html>
        <html>
          <head>
            <meta name="viewport">
            <link href="${styleUri}" rel="stylesheet" />  
          <body>
            <!-- Slideshow container -->
            <div class="slideshow-container">
    
              <!-- Full-width images with number and caption text -->
              ${labelData}
    
              <!-- Next and previous buttons -->
              <a class="prev" onclick="plusSlides(-1)">&#10094;</a>
              <a class="next" onclick="plusSlides(1)">&#10095;</a>

              <!-- The dots/circles -->
              <div class="dots" style="text-align:center">
                ${selectorDots}
              </div>
            </div>
            <br>
    
            <script>
              let slideIndex = 1;
              showSlides(slideIndex);
              
              function plusSlides(n) {
              showSlides(slideIndex += n);
              }
              
              function currentSlide(n) {
              showSlides(slideIndex = n);
              }
              
              function showSlides(n) {
                let i;
                let slides = document.getElementsByClassName("mySlides");
                let dots = document.getElementsByClassName("dot");
                if (n > slides.length) {slideIndex = 1}    
                if (n < 1) {slideIndex = slides.length}
                for (i = 0; i < slides.length; i++) {
                  slides[i].style.display = "none";  
                }
                for (i = 0; i < dots.length; i++) {
                  dots[i].className = dots[i].className.replace(" active", "");
                }
                slides[slideIndex-1].style.display = "block";  
                dots[slideIndex-1].className += " active";
              }
            </script>
          </body>
        </html>`;
    // -----------------------
    return html;
  }

  private async _getZPLLabel() : Promise<string[]> {
    let labelArray: string[] = this._getLabelArray(this._labelString);
    let labelCount = labelArray.length;
    let selectorDots: string = '';
    labelArray.forEach((value, index) => {
      selectorDots += '<span class="dot" onclick="currentSlide(' + (index + 1) + ')"></span>';
    });

    let labelData = await this._getLabelaryData(labelArray);

    return [labelData, selectorDots];
  }

  private _getLabelArray(inZPL: string): string[] {
    let labelArray: string[];
    let txtZPL: string;
    txtZPL = inZPL;

    //See if it can be decoded from base64 encoded string
    if (!this._isZPL(txtZPL)) {
      txtZPL = Buffer.from(txtZPL, 'base64').toString('binary');
    }
    txtZPL = txtZPL.replaceAll('\n', '');
    txtZPL = txtZPL.replaceAll('\r', '');
    txtZPL = txtZPL.replaceAll('^xz', '^XZ');
    labelArray = txtZPL.split("^XZ");
    labelArray.forEach( (zpl, index) => {
      if (zpl.length > 0) {
        zpl = zpl + '^XZ';
        labelArray[index] = zpl;
      }
      else {
        delete labelArray[index];
      }
    });
    return labelArray;
  }

  private _isZPL(inZPL: string): boolean {
    let zplEndFound: boolean;
    zplEndFound = false;
    if (inZPL.toUpperCase().indexOf('^XZ') > -1) {
      zplEndFound = true;
    }

    return zplEndFound;
  }

  private _isBase64ZPL(base64String: string): boolean {
    let checkString = Buffer.from(base64String, 'base64').toString('binary');
    return this._isZPL(checkString);
  }

  private async _getLabelaryData(labelArray: string[]): Promise<string> {
    let resultString: string;
    resultString = '';
    await Promise.all(labelArray.map(async (zpl, index) => {
      const labelaryResult = await this._getPNGFromLabelary(zpl);
      resultString += `<div class="mySlides fade">
                  <img src="data:image/png;base64,${labelaryResult}"/>
                </div>`;
    }));

    return resultString;
  };

  private async _getPNGFromLabelary(zpl: string): Promise<string> {

    const response = await axios({
      method: "POST",
      data: zpl,
      url: `http://api.labelary.com/v1/printers/8dpmm/labels/${this._labelSize}/0`,
      responseType: 'arraybuffer',
      responseEncoding: "binary",
      headers: {
        'Content-type': 'application/x-www-form-urlencoded',
        'Accept': 'image/png'
      }
    });

    //https://stackoverflow.com/questions/42785229/axios-serving-png-image-is-giving-broken-image
    const result = Buffer.from(response.data).toString('base64');

    return result;

  };

  private _decodeAndDisplay(extensionRoot: vscode.Uri, base64String: any) {
    let localizer = new Localizer();
    const messages = localizer.getLocalizedMessages();
  
    if (base64String !== undefined) {
      let b64u = new Base64Utils();
      let v = new View();
  
      let decodedString = b64u.prepareForDecoding(base64String);
      b64u.getMimeType(base64String).then((mimeType: string) => {
        v.createView(extensionRoot, decodedString, mimeType, 'decoding');
      });
    } else {
      this._showErrorPopup(messages.general.operationCancelled);
    }
  }
  
  private _showErrorPopup(message: string) {
    vscode.window.showErrorMessage(message);
  }

  // dispose
  public dispose() {
    LabelaryPanel.currentPanel = undefined;

    //this._panel.dispose();

    while (this._disposables.length) {
      const disposable = this._disposables.pop();
      if (disposable) {
        disposable.dispose();
      }
    }
  }
}