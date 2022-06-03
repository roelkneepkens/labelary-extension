# Change Log

All notable changes to the "Labelary" extension will be documented in this file.

## 1.0.6
- Added support for different label sizes
  - A default 4x8 inch portait label
  - A custom list of additional label formats: 8x4 landscape, A4 portrait
  - A list of additional formats that can be defined in the extension settings (<kbd>Ctrl</kbd> + <kbd>,</kbd>)
- Removed the buttons for base64 and raw ZPL.
- When not selecting a specific string to format into a label, the extension will find the string based on existing cursor until it hits one of the following delimiters: "<>
- 
## 1.0.5
- added two separate buttons:
  - View raw ZPL label -> for viewing raw ZPLs, delimited by "<>
  - View Base64 label -> for base64 strings, delimited by "'`<>{}[]()|\/:;, and spaces, newlines, carriage returns

## 1.0.4
- Changed logo

## 1.0.3
- Incorporated the decoding part of [Jason Mejane](https://marketplace.visualstudio.com/publishers/JasonMejane)'s [Base64Viewer](https://marketplace.visualstudio.com/items?itemName=JasonMejane.base64viewer) (v1.2.1)
- Added cursor context logic
- Added right-mouse-click option

## 0.0.2
- 26-Apr-2022 Initial release with viewer for base64 and plain zpl

## 0.0.1 (Unreleased)
- Visual studio theme
- Error handling if invalid ZPL