Planit.js
==========

Planit is a javascript library, built on top of jQuery, that makes it nice and
simple add interactive hotspots (markers) to a blank container or an image.

Documentation
----------

The basics are documented here, but you can find API documentation and some
examples at [planit.seancdavis.me](http://planit.seancdavis.me).


Installation
----------

Make sure you load jQuery, then you're ready to add Planit.js. Best practice is
to add your scripts to the bottom of your `<body>`. And don't forget the
styles.

*If you take this approach you'll need to ensure the script for your page is
loaded after the Planit library is loaded. It's not a bad idea to take
advantage of a JavaScript module loader to ensure they are loaded in the
correct order. Checkout [RequireJS](http://requirejs.org/) for more
information.*

```html
<link rel="stylesheet" href="//cdn.jsdelivr.net/jquery.planit/1.0.1/planit.min.css">

<script src="//cdn.jsdelivr.net/jquery/1.11.2/jquery.min.js"></script>
<script src="//cdn.jsdelivr.net/jquery.planit/1.0.1/planit.min.js"></script>
```

### Downloads

You can download both of these items using the links below. v1.0 will come with
hosted releases of the distribution.

* [planit.min.js](http://cdn.jsdelivr.net/jquery.planit/1.0.1/planit.min.js)
* [planit.min.css](http://cdn.jsdelivr.net/jquery.planit/1.0.1/planit.min.css)

There's also a [zip](http://cdn.jsdelivr.net/jquery.planit/1.0.1/jquery.planit.zip) of the two files together.

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

See [the doc site](http://planit.seancdavis.me) for options and examples.

Questions, Bugs & Ideas
----------

Please log all communication as an issue in [this repo's issue
tracker](https://github.com/seancdavis/planit/issues/new)

Contributing
----------

To get set up locally, you'll need [`npm`](https://www.npmjs.com/) and
[`gulp`](http://gulpjs.com/) installed.

```text
$ git clone https://github.com/seancdavis/planit.git
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
