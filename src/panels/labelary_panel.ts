import * as vscode from "vscode";
import axios from 'axios';
import { getUri } from "../utilities/functions";

export class LabelaryPanel {
  // PROPERTIES
  public static currentPanel: LabelaryPanel | undefined;
  private _panel: vscode.WebviewPanel;
  private _disposables: vscode.Disposable[] = [];

  // constructor
  private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri, context: vscode.ExtensionContext) {
    this._panel = panel;

   this._getWebviewContent(this._panel.webview, extensionUri).then(html =>  this._panel.webview.html = html);

   // set ondidchangeviewstate
  //  this._panel.onDidChangeViewState(e => {
  //     const panel = e.webviewPanel;
  //     let isVisible = panel.visible;

  //     if (isVisible) {
  //       this._updateWebview(extensionUri);
  //     }
  //   },
  //     null,
  //     context.subscriptions
  //   );

    // on dispose
    this._panel.onDidDispose(this.dispose, null, this._disposables);
  }

  // METHODS
  public static render(extensionUri: vscode.Uri, context: vscode.ExtensionContext) {
    if (LabelaryPanel.currentPanel) {
      LabelaryPanel.currentPanel._panel.reveal(vscode.ViewColumn.Two);
    } else {
      const panel = vscode.window.createWebviewPanel("labelary-panel", "Display Labelary", vscode.ViewColumn.Two, {
        enableScripts: true
      });

      LabelaryPanel.currentPanel = new LabelaryPanel(panel, extensionUri, context);
    }
  }

  private _updateWebview(extensionUri: vscode.Uri) {
    this._getWebviewContent(this._panel.webview, extensionUri).then(html => this._panel.webview.html = html);
  }

  private async _getWebviewContent(webview: vscode.Webview, extensionUri: vscode.Uri) : Promise<string> { 
    // const toolkitUri = getUri(webview, extensionUri, ["node_modules","@vscode", "webview-ui-toolkit", "dist", "toolkit.js", ]);
    // const mainUri = getUri(webview, extensionUri, ["panels", "helloworld","main.js"]);
    const styleUri = getUri(webview, extensionUri, ["panels", "labelary", "style.css"]);

    let html: string = ``;
    let foldersHtml: string = ``;
    
    let zpl:string = '^xa^cfa,50^fo100,100^fdHello World label1^fs^xz^xa';
    const editor = vscode.window.activeTextEditor;
  
      if (editor) {
        const document = editor.document;
        //let selectionString:string = '';
        const selection = editor.selection;
        // .forEach(selected =>{
        // 	selectionString += selected;
  
        // });
  
        // Get the word within the selection
        zpl = document.getText(selection);
        
      }
    if (zpl === ''){
      zpl = '^XA^CFA,20^FO100,100^FDBefore starting the extension:^FS^FO100,120^FDPlease select the text to convert with labelary.^FS^XZ';
    }
  
    let labelArray:string[] = this._getLabelArray(zpl);
    let labelCount = labelArray.length;
    let selectorDots:string = '';
    labelArray.forEach((value, index) => {
      selectorDots +='<span class="dot" onclick="currentSlide(' + (index + 1) + ')"></span>';
    });
  
  
    let labelaryData = await this._getLabelaryData(labelArray);
    // construct your HTML code
    html +=  /*html*/
    `<!DOCTYPE html>
        <html>
        <head>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <link href="${styleUri}" rel="stylesheet" />  
          <body>
          <!-- Slideshow container -->
          <div class="slideshow-container">
  
            <!-- Full-width images with number and caption text -->
            ${labelaryData}
            <!-- 
            <div class="mySlides fade">
              <div class="numbertext">1 / ${labelCount}</div>
              <img src="img1.jpg" style="width:100%">
              <div class="text">Caption Text</div>
            </div>
            -->
  
          <!-- Next and previous buttons -->
            <a class="prev" onclick="plusSlides(-1)">&#10094;</a>
            <a class="next" onclick="plusSlides(1)">&#10095;</a>
          </div>
          <br>
  
          <!-- The dots/circles -->
          <div style="text-align:center">
            ${selectorDots}
          </div>
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
         </html>
    `;
    // -----------------------
    return html;
    }


    private _getLabelArray(inZPL:string):string[] {
      let labelArray:string[];
      let txtZPL:string;
      txtZPL = inZPL;
    
      //See if it can be decoded from base64 encoded string
      if (!this._isZPL(txtZPL)){
        txtZPL = Buffer.from(txtZPL, 'base64').toString('binary');
      }
      txtZPL = txtZPL.replaceAll('\n','');
      txtZPL = txtZPL.replaceAll('\r','');
      txtZPL = txtZPL.replaceAll('^xz','^XZ');
      labelArray = txtZPL.split("^XZ");
      labelArray.forEach(async function(zpl, index){
        if(zpl.length > 0){
        zpl = zpl + '^XZ';
        labelArray[index] = zpl;
        }
        else{
          delete labelArray[index];
        }
        });
      return labelArray;
      }
    
      private _isZPL(inZPL:string):boolean{
        let zplEndFound:boolean;
        zplEndFound = false;
      if (inZPL.toUpperCase().indexOf('^XZ') > -1){
        zplEndFound = true;
      } 
    
      return zplEndFound;
      }
      
    
      private async _getLabelaryData(labelArray:string[]):Promise<string>{
      let resultString:string;
      resultString = '';
      await Promise.all(labelArray.map(async(zpl, index)=>{
        const labelaryResult = await this._getPNGFromLabelary(zpl);
        resultString += `<div class="mySlides fade">
                  <div class="numbertext">${index +1} / ${labelArray.length}</div>
                  <img src="data:image/png;base64,${labelaryResult}" style="width:50%;"/>
                  <div class="text">Labelary label</div>
                </div>`;
      }));
    
      return resultString;
      };
     
    
      private async  _getPNGFromLabelary(zpl:string):Promise<string> {
      
      
        const response = await axios({
          method: "POST",
          data: zpl,
          url: 'http://api.labelary.com/v1/printers/8dpmm/labels/4x8/0',
            responseType:'arraybuffer',
            responseEncoding: "binary",
            headers:{
              'Content-type': 'application/x-www-form-urlencoded',
              'Accept': 'image/png'
            }
          });
        
          //https://stackoverflow.com/questions/42785229/axios-serving-png-image-is-giving-broken-image
          const result = Buffer.from(response.data).toString('base64');
    
      return result;
    
    };
    
  // dispose
  public dispose() {
    LabelaryPanel.currentPanel = undefined;

    this._panel.dispose();

    while (this._disposables.length) {
      const disposable = this._disposables.pop();
      if (disposable) {
        disposable.dispose();
      }
    }
  }
}