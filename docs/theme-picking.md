# Theme Picking

## Overall Solution

![Sequence Diagram - available in plain .plantuml under ./docs/theme-picking.plantuml](http://www.plantuml.com/plantuml/proxy?cache=no&src=https://raw.githubusercontent.com/MattTennison/homepage/main/docs/theme-picking.plantuml)

## Considerations/Future Enhancements

### Serve suitably sized images to client

At the moment we send "large" image URLs to the client - they're compressed and have a height of 650px. That won't look good when stretched to 100% of users screens - a user with a 2560x1440px screen will be doubling the height of the image at least (worse for portrait photos, which'll be blown up further to fill 100% width).

Options:

1. Send the 'original' photo URL from Pexels - easy to do, but those photos often exceed 10MB.
2. Crop the 'original' photo URL to a suitable size, temporarily store in Cloud Storage and send the URL to that asset to the client. Harder to do, and would incur additional bandwidth costs, but could be a neat solution
3. See if Pexels can dynamically size images
