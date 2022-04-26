import * as vscode from 'vscode';
 //see https://bobbyhadz.com/blog/typescript-http-request
 import axios from 'axios';
import { stringify } from 'querystring';


export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(
	  vscode.commands.registerCommand('mypanel.start', () => {
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
			const selection = editor.selection;

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
	html += `<!DOCTYPE html>
			<html>
			<head>
			<meta name="viewport" content="width=device-width, initial-scale=1">
			<style>
			* {box-sizing: border-box}
			body {font-family: Verdana, sans-serif; margin:0}
			.mySlides {display: none}
			img {vertical-align: middle;}
			
			/* Slideshow container */
			.slideshow-container {
			max-width: 1000px;
			position: relative;
			margin: auto;
			}
			
			/* Next & previous buttons */
			.prev, .next {
			cursor: pointer;
			position: absolute;
			top: 50%;
			width: auto;
			padding: 16px;
			margin-top: -22px;
			color: white;
			font-weight: bold;
			font-size: 18px;
			transition: 0.6s ease;
			border-radius: 0 3px 3px 0;
			user-select: none;
			}
			
			/* Position the "next button" to the right */
			.next {
			right: 0;
			border-radius: 3px 0 0 3px;
			}
			
			/* On hover, add a black background color with a little bit see-through */
			.prev:hover, .next:hover {
			background-color: rgba(0,0,0,0.8);
			}
			
			/* Caption text */
			.text {
			color: #f2f2f2;
			font-size: 15px;
			padding: 8px 12px;
			position: absolute;
			bottom: 8px;
			width: 100%;
			text-align: center;
			}
			
			/* Number text (1/3 etc) */
			.numbertext {
			color: #f2f2f2;
			font-size: 12px;
			padding: 8px 12px;
			position: absolute;
			top: 0;
			}
			
			/* The dots/bullets/indicators */
			.dot {
			cursor: pointer;
			height: 15px;
			width: 15px;
			margin: 0 2px;
			background-color: #bbb;
			border-radius: 50%;
			display: inline-block;
			transition: background-color 0.6s ease;
			}
			
			.active, .dot:hover {
			background-color: #717171;
			}
			
			/* Fading animation */
			.fade {
			animation-name: fade;
			animation-duration: 1.5s;
			}
			
			@keyframes fade {
			from {opacity: .4} 
			to {opacity: 1}
			}
			
			/* On smaller screens, decrease text size */
			@media only screen and (max-width: 300px) {
			.prev, .next,.text {font-size: 11px}
			}
			</style>
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
	let resultArray:string[];
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




