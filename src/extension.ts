import * as vscode from 'vscode';  //see https://bobbyhadz.com/blog/typescript-http-request
import axios from 'axios';
import { stringify } from 'querystring';


export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(
	  vscode.commands.registerCommand('decode.labelary', () => {
		// Create and show panel
		const panel = vscode.window.createWebviewPanel(
		  'mypanel',  // <--- identifier
		  'Display Labelary', // <--- title
		  vscode.ViewColumn.One,
		  {
			// Enable scripts in the webview
			enableScripts: true}
		);
  
		// And set its HTML content
		getMyWebviewContent(panel.webview, context).then(html =>panel.webview.html = html);   // <--- HTML
	  })	
	);
}

  async function getMyWebviewContent(webview: vscode.Webview, context: any) : Promise<string> { 
	let html: string = ``;
	let foldersHtml: string = ``;
	
	const myStyle = webview.asWebviewUri(vscode.Uri.joinPath(
		  context.extensionUri, 'media', 'style.css'));   // <--- 'media' is the folder where the .css file is stored
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

	let labelArray:string[] = getLabelArray(zpl);
	let labelCount = labelArray.length;
	let selectorDots:string = '';
	labelArray.forEach((value, index) => {
		selectorDots +='<span class="dot" onclick="currentSlide(' + (index + 1) + ')"></span>';
	});


	let labelaryData = await getLabelaryData(labelArray);
	// construct your HTML code
	html +=  /*html*/
	`<!DOCTYPE html>
			<html>
			<head>
			<meta name="viewport" content="width=device-width, initial-scale=1">
			<link href="${myStyle}" rel="stylesheet" />  
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

  function getLabelArray(inZPL:string):string[] {
	let labelArray:string[];
	let txtZPL:string;
	txtZPL = inZPL;

	//See if it can be decoded from base64 encoded string
	if (!isZPL(txtZPL)){
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

  function isZPL(inZPL:string):boolean{
	  let zplEndFound:boolean;
	  zplEndFound = false;
	if (inZPL.toUpperCase().indexOf('^XZ') > -1){
		zplEndFound = true;
	} 

	return zplEndFound;
  }
  let labelImages:string[];

  async function getLabelaryData(labelArray:string[]):Promise<string>{
	let resultString:string;
	resultString = '';
	await Promise.all(labelArray.map(async(zpl, index)=>{
		const labelaryResult = await getPNGFromLabelary(zpl);
		resultString += `<div class="mySlides fade">
							<div class="numbertext">${index +1} / ${labelArray.length}</div>
							<img src="data:image/png;base64,${labelaryResult}" style="width:50%;"/>
							<div class="text">Labelary label</div>
						</div>`;
	}));

	return resultString;
  };
 

  async function getPNGFromLabelary(zpl:string):Promise<string> {
	
	
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




