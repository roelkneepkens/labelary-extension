# Labelary and PDF viewer

[![](https://vsmarketplacebadge.apphb.com/version-short/RoelKneepkens-ShipitSmarter.labelary.svg)](https://marketplace.visualstudio.com/items?itemName=RoelKneepkens-ShipitSmarter.labelary)
[![](https://vsmarketplacebadge.apphb.com/installs-short/RoelKneepkens-ShipitSmarter.labelary.svg)](https://marketplace.visualstudio.com/items?itemName=RoelKneepkens-ShipitSmarter.labelary)
[![](https://vsmarketplacebadge.apphb.com/rating-short/RoelKneepkens-ShipitSmarter.labelary.svg)](https://marketplace.visualstudio.com/items?itemName=RoelKneepkens-ShipitSmarter.labelary)

![Labelary and PDF viewer](https://raw.githubusercontent.com/roelkneepkens/labelary-extension/main/img/labelary-use-gif.gif)

View Labelary (ZPL), PDF and other base64-encoded formats in separate panel on right-mouse-button click.

Use as follows:
- Right-click somewhere in the Labelary or Base64 string in the Editor
- Select:
  - `View label`: Default view for ZPL (Raw or base64) or base64 PDF/pictures
  - `View label: choose size`: 
    - List of defaulted sizes
    - `custom...`: this will open a quickpick to select custom formats that can be defined in the extension settings 
      - Access via: <kbd>Ctrl</kbd> + <kbd>,</kbd> --> <kbd>Labelary</kbd>
      - ![labelary settings](https://raw.githubusercontent.com/roelkneepkens/labelary-extension/main/img/labelary-setting.png)
- In case the selection does not work: *select string*, right click and again select the option applicable.

## Supports
- Labelary (ZPL)
  - multiple labels in one ZPL string
  - Base64 string or ZPL string

- Base64
  - PDF
  - Images

For extensive Base64 support details, see [Base64Viewer](https://marketplace.visualstudio.com/items?itemName=JasonMejane.base64viewer) documentation.

## Change Log
See Change Log [here](CHANGELOG.md)

## Issues
Submit the [issues](https://github.com/roelkneepkens/labelary-extension/issues) if you find any bug or have any suggestion.

## Contribution
Fork the [repo](https://github.com/roelkneepkens/labelary-extension/) and submit pull requests.

## Acknowledgements
- Incorporated the decoding part of [Jason Mejane](https://marketplace.visualstudio.com/publishers/JasonMejane)'s [Base64Viewer](https://marketplace.visualstudio.com/items?itemName=JasonMejane.base64viewer) (v1.2.1)


