# Theme Picking

## Overall Solution

![Sequence Diagram - available in plain .plantuml under ./docs/theme-picking.plantuml](http://www.plantuml.com/plantuml/proxy?cache=no&src=https://raw.githubusercontent.com/MattTennison/homepage/main/docs/theme-picking.plantuml)

## Considerations/Future Enhancements

### Avoid storing entire images in memory on image-api

Google's Vision API recommends you download the asset and convert it to Base64, then send it to them to avoid issues accessing the image. The initial solution will do just that, but there's a risk in keeping images in-memory whilst they're being analysed. Images can get very large (>5MB) and with a sizeable set of results you'd be storing hundreds of MB in memory whilst they're being analysed.

This limitation will prevent increasing the number of results from 15 (Pexel's supports up to 80).

Potential Solutions:

- Storing the assets on disk whilst they're being analysed
- Storing the assets temporarily in S3
- Sending the image URL to Google Vision instead of Base64 (although this is advised against)
