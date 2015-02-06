Planit.js
================

Planit is a javascript library, built on top of jQuery, that makes it nice and
simple add interactive hotspots (markers) to a blank container or an image.

Installation
----------------

### Scripts

Make sure you load jQuery, then you're ready to add Planit.js. Best practice is
to add your scripts to the bottom of your `<body>`.

```html
    <!-- ... -->

    <script src="https://code.jquery.com/jquery-1.11.2.min.js"></script>
    <script src="https://raw.githubusercontent.com/planitjs/planit/master/dist/planit.min.js"></script>
    <!-- The rest of your app's scripts -->
  </body>
</html>
```

*Note: If you're adding these files manually, it's not a bad idea to take
advantage of a JavaScript module loader to ensure they are loaded in the
correct order. Checkout [RequireJS](http://requirejs.org/) for more
information.*

### Styles

Don't forget the styles! Styles should be loaded in the head of your markup.

```html
<html>
  <head>
    <!-- ... -->
    <link rel="stylesheet" href="https://raw.githubusercontent.com/planitjs/planit/master/dist/planit.min.css">

    <!-- ... -->
```

### Downloads

You can download both of these items using the links below. v1.0 will come with
hosted releases of the distribution.

* [planit.min.js](https://raw.githubusercontent.com/planitjs/planit/master/dist
  /pla nit.min.js)
* [planit.min.css](https://raw.githubusercontent.com/planitjs/planit/master/dis
  t/planit.min.css)


Usage
----------------

The `Planit` class is loaded into a global `planit` variable. Without options,
this is simply:

```js
planit.new()
```

When you have no options, Planit looks for a container with an id of `planit`.

```html
<div id="planit"></div>
```

See below for options.

Options
----------------

### container

**Type:** _String_

```js
container: 'my-container'
```

The `id` of the container in which you want to load Planit.

### backgroundImage

**Type:** _String_

```js
backgroundImage: 'http://media.giphy.com/media/cw8Nr4u28tVKw/giphy.gif'
```

A URL or local (web-accessible) path to the image you'd like to set as the
background image. This image is set at 100% width of the container, and the
height of the container is adjusted automatically.

### markers

See below:

Markers
----------------

You can pass markers to your instantiation and it will add them automatically
when the page is ready. They are to be in JSON format, with the following
options.

### coords

**Type:** _Array_

```js
coords: ['12', '45']
```

The **percentage** values of `x` and `y` positions, relative to the dimensions
of the container, *after* accounting for the dimensions of a background image.

### draggable

**Type:** _Boolean_

```js
draggable: true
```

Makes the markers draggable *within the bounds of the container*.

### infobox

**Type:** _String_ of _HTML_

```js
infobox: "<h2>Dingle</h2><p>It's the dinkus.</p>"
```

The markup you'd like to include in the infobox, which appears on hover of the
marker.

Example
----------------

```html
<div id="my-container"></div>

<script>
  planit.new({
    container: 'my-container',
    backgroundImage: 'http://media.giphy.com/media/cw8Nr4u28tVKw/giphy.gif',
    markers: [
      {
        coords: ['12','45'],
        draggable: true,
        infobox: "<h2>Dingle</h2><p>It's the dinkus.</p>"
      },
      {
        coords: ['45','62'],
        draggable: true,
        infobox: "<h2>Dangle</h2><p>It's the other dinkus.</p>"
      }
    ]
  });
</script>
```

Contributing
----------------

To get set up locally, you'll need [`npm`](https://www.npmjs.com/) and
[`gulp`](http://gulpjs.com/) installed.

```text
$ git clone https://github.com/planitjs/planit.git
$ cd planit
$ npm install
$ gulp
```

`gulp` will watch for changes, but will stop compiling CoffeeScript files after
finding an error. Keep that log accessible or you may get tripped up.

Then, follow the typical GitHub workflow:

1. Fork it ( https://github.com/[my-github-username]/githole/fork )
2. Create your feature branch (`git checkout -b my-new-feature`)
3. Commit your changes (`git commit -am 'Add some feature'`)
4. Push to the branch (`git push origin my-new-feature`)
5. Create a new Pull Request
