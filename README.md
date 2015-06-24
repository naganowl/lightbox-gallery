lightbox-gallery
===

A basic image gallery that pulls images from Reddit and displays them in a simple grid with a
lightbox implementation when images are clicked on.

## Notes

- The page filters for only Imgur photos as you can derive the full URL from the API fields.
- Images and thumbnails can be navigated with the keyboard.
  - Tab to cycle through the thumbnails and enter to bring up the lightbox.
  - Tab/Enter to use the links or use the arrows to switch between images.
  - Escape dismisses the lightbox and refocuses on the associated thumbnail.

## TODO

- Add interface to pull in new images.
- Allow input to specify another subreddit.
- Break file into separate modules.
