var Planit,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

Planit = (function() {
  function Planit() {}

  Planit.containerClass = 'planit-container';

  Planit.draggingClass = 'is-dragging';

  Planit.imageContainer = 'planit-image-container';

  Planit.infoboxClass = 'planit-infobox';

  Planit.infoboxContainerClass = 'planit-infobox-container';

  Planit.markerClass = 'planit-marker';

  Planit.markerContainerClass = 'planit-markers-container';

  Planit.markerContentClass = 'planit-marker-content';

  Planit.prototype["new"] = function(options1) {
    this.options = options1 != null ? options1 : {};
    return new Planit.Plan(this.options);
  };

  Planit.randomString = function(length) {
    var str;
    if (length == null) {
      length = 16;
    }
    str = Math.random().toString(36).slice(2);
    str = str + Math.random().toString(36).slice(2);
    return str.substring(0, length - 1);
  };

  return Planit;

})();

Planit.Plan = (function() {
  var animateBackground, animateMarkers, containerHeight, containerWidth, draggingMarker, getEventPosition, imgHeight, imgHeightClickIncrement, imgOffsetLeft, imgOffsetTop, imgWidth, imgWidthClickIncrement, initCanvasMarkers, initContainer, initEvents, initImage, initMarkers, initMethods, initOptions, initZoomControls, initZoomable, mousemove, mouseup, positionInfoboxes, setBackground, setMarkers, zDblClick, zEventPosition, zMouseDown, zMouseMove, zMouseUp;

  function Plan(options1) {
    var j, len, method, ref;
    this.options = options1 != null ? options1 : {};
    this.zoomOut = bind(this.zoomOut, this);
    this.zoomIn = bind(this.zoomIn, this);
    this.calc = bind(this.calc, this);
    this.zoomTo = bind(this.zoomTo, this);
    this.centerOn = bind(this.centerOn, this);
    this.resetImage = bind(this.resetImage, this);
    ref = initMethods();
    for (j = 0, len = ref.length; j < len; j++) {
      method = ref[j];
      method.call(this);
    }
  }

  initMethods = function() {
    return [initOptions, initContainer, initImage, initCanvasMarkers, initEvents];
  };

  initOptions = function() {
    if (this.options.container) {
      this.options.container = $("#" + this.options.container);
    } else {
      this.options.container = $('#planit');
    }
    return this.container = this.options.container;
  };

  initContainer = function() {
    this.container.addClass(Planit.containerClass);
    this.container.append("<div class=\"" + Planit.infoboxContainerClass + "\"></div>\n<div class=\"" + Planit.markerContainerClass + "\"></div>");
    return this.markersContainer = this.container.find("." + Planit.markerContainerClass).first();
  };

  initImage = function() {
    if (this.options.image && this.options.image.url) {
      this.container.prepend("<div class=\"" + Planit.imageContainer + "\">\n  <img src=\"" + this.options.image.url + "\">\n</div>");
      this.image = this.container.find('img').first();
      return this.image.load((function(_this) {
        return function() {
          _this.container.css({
            height: _this.image.height()
          });
          initZoomable.call(_this);
          return initMarkers.call(_this);
        };
      })(this));
    }
  };

  initZoomable = function() {
    this.zoomId = Planit.randomString();
    this.markersContainer.attr('data-zoom-id', this.zoomId);
    this.resetImage();
    if (this.options.image.zoom) {
      return initZoomControls.call(this);
    }
  };

  initZoomControls = function() {
    this.container.prepend("<div class=\"planit-controls\">\n  <a href=\"#\" class=\"zoom\" data-action=\"in\">+</a>\n  <a href=\"#\" class=\"zoom\" data-action=\"out\">-</a>\n</div>");
    this.container.find(".zoom[data-action='in']").click((function(_this) {
      return function(e) {
        e.preventDefault();
        return _this.zoomIn();
      };
    })(this));
    this.container.find(".zoom[data-action='out']").click((function(_this) {
      return function(e) {
        e.preventDefault();
        return _this.zoomOut();
      };
    })(this));
    this.container.on('dblclick', (function(_this) {
      return function(e) {
        return zDblClick.call(_this, e);
      };
    })(this));
    this.container.on('mousedown', (function(_this) {
      return function(e) {
        return zMouseDown.call(_this, e);
      };
    })(this));
    $(document).on('mousemove', (function(_this) {
      return function(e) {
        return zMouseMove.call(_this, e);
      };
    })(this));
    return $(document).on('mouseup', (function(_this) {
      return function(e) {
        return zMouseUp.call(_this, e);
      };
    })(this));
  };

  initCanvasMarkers = function() {
    if (!(this.options.image && this.options.image.url)) {
      return initMarkers.call(this);
    }
  };

  initMarkers = function() {
    var j, len, marker, ref, results;
    if (this.options.markers && this.options.markers.length > 0) {
      ref = this.options.markers;
      results = [];
      for (j = 0, len = ref.length; j < len; j++) {
        marker = ref[j];
        marker.container = this.container;
        results.push(Planit.Marker.create(marker));
      }
      return results;
    }
  };

  initEvents = function() {
    if (this.container.find("." + Planit.imageContainer + " > img").length > 0) {
      this.image = this.container.find("." + Planit.imageContainer + " > img").first();
    }
    $(document).on('mousemove', (function(_this) {
      return function(e) {
        return mousemove.call(_this, e);
      };
    })(this));
    return $(document).on('mouseup', (function(_this) {
      return function(e) {
        return mouseup.call(_this, e);
      };
    })(this));
  };

  Plan.prototype.resetImage = function() {
    this.imagePosition = {
      leftPx: 0,
      topPx: 0,
      width: this.image.width(),
      height: this.image.height(),
      scale: 1,
      increment: 0.5
    };
    return setBackground.call(this);
  };

  setBackground = function() {
    this.image.css({
      left: this.imagePosition.leftPx + "px",
      top: this.imagePosition.topPx + "px",
      width: (this.imagePosition.scale * 100.0) + "%",
      height: 'auto'
    });
    return setMarkers.call(this);
  };

  animateBackground = function() {
    this.image.animate({
      left: this.imagePosition.leftPx + "px",
      top: this.imagePosition.topPx + "px",
      width: (this.imagePosition.scale * 100.0) + "%",
      height: 'auto'
    }, 250);
    return animateMarkers.call(this);
  };

  setMarkers = function() {
    var j, left, len, marker, markers, top;
    markers = this.container.find("." + Planit.markerClass);
    if (markers.length > 0) {
      for (j = 0, len = markers.length; j < len; j++) {
        marker = markers[j];
        left = (this.calc(imgWidth) * ($(marker).attr('data-xPc') / 100)) + this.imagePosition.leftPx - ($(marker).outerWidth() / 2);
        top = (this.calc(imgHeight) * ($(marker).attr('data-yPc') / 100)) + this.imagePosition.topPx - ($(marker).outerHeight() / 2);
        $(marker).css({
          left: left + "px",
          top: top + "px"
        });
      }
      return positionInfoboxes.call(this);
    }
  };

  animateMarkers = function() {
    var j, left, len, m, marker, markers, results, top;
    markers = this.container.find("." + Planit.markerClass);
    if (markers.length > 0) {
      results = [];
      for (j = 0, len = markers.length; j < len; j++) {
        marker = markers[j];
        m = new Planit.Marker(this.container, $(marker).attr('data-marker'));
        m.hideInfobox();
        left = (this.calc(imgWidth) * ($(marker).attr('data-xPc') / 100)) + this.imagePosition.leftPx - ($(marker).outerWidth() / 2);
        top = (this.calc(imgHeight) * ($(marker).attr('data-yPc') / 100)) + this.imagePosition.topPx - ($(marker).outerHeight() / 2);
        results.push((function(m) {
          return $(marker).animate({
            left: left + "px",
            top: top + "px"
          }, 250, (function(_this) {
            return function() {
              m.positionInfobox();
              return m.unhideInfobox();
            };
          })(this));
        })(m));
      }
      return results;
    }
  };

  positionInfoboxes = function() {
    var j, len, m, marker, ref;
    ref = this.container.find("." + Planit.markerClass);
    for (j = 0, len = ref.length; j < len; j++) {
      marker = ref[j];
      m = new Planit.Marker(this.container, $(marker).attr('data-marker'));
      m.positionInfobox();
    }
    return true;
  };

  Plan.prototype.centerOn = function(coords) {
    var hMin, wMin, x, y;
    if (coords[0] >= 50) {
      x = 100 - coords[0];
    } else {
      x = coords[0];
    }
    if (coords[1] >= 50) {
      y = 100 - coords[1];
    } else {
      y = coords[1];
    }
    wMin = 50 * (this.calc(containerWidth) / x);
    hMin = 50 * (this.calc(containerHeight) / y);
    this.container.find("." + Planit.infoboxClass).removeClass('active');
    this.imagePosition.leftPx = -((this.calc(imgWidth) * (coords[0] / 100)) - (this.calc(containerWidth) / 2));
    this.imagePosition.topPx = -((this.calc(imgHeight) * (coords[1] / 100)) - (this.calc(containerHeight) / 2));
    while ((this.calc(imgWidth) < wMin) || (this.calc(imgHeight) < hMin)) {
      this.imagePosition.scale = this.imagePosition.scale + this.imagePosition.increment;
      this.imagePosition.leftPx = -((this.calc(imgWidth) * (coords[0] / 100)) - (this.calc(containerWidth) / 2));
      this.imagePosition.topPx = -((this.calc(imgHeight) * (coords[1] / 100)) - (this.calc(containerHeight) / 2));
    }
    animateBackground.call(this);
    return coords;
  };

  Plan.prototype.zoomTo = function(level) {
    var i;
    i = this.imagePosition.increment;
    if (((level * i) + 1) !== this.imagePosition.scale) {
      this.imagePosition.scale = (level * i) + 1 + i;
      this.zoomOut();
    }
    return level;
  };

  Plan.prototype.calc = function(method) {
    return method.call(this);
  };

  imgWidth = function() {
    return parseFloat(this.imagePosition.width * this.imagePosition.scale);
  };

  imgWidthClickIncrement = function() {
    return parseFloat(this.imagePosition.width * this.imagePosition.increment);
  };

  containerWidth = function() {
    return parseFloat(this.markersContainer.width());
  };

  imgOffsetLeft = function() {
    return Math.abs(parseFloat(this.image.css('left')));
  };

  imgHeight = function() {
    return parseFloat(this.imagePosition.height * this.imagePosition.scale);
  };

  imgHeightClickIncrement = function() {
    return parseFloat(this.imagePosition.height * this.imagePosition.increment);
  };

  containerHeight = function() {
    return parseFloat(this.markersContainer.height());
  };

  imgOffsetTop = function() {
    return Math.abs(parseFloat(this.image.css('top')));
  };

  zEventPosition = function(e) {
    return {
      left: (e.pageX - this.container.offset().left) / this.calc(containerWidth),
      top: (e.pageY - this.container.offset().top) / this.calc(containerHeight)
    };
  };

  zDblClick = function(e) {
    var click;
    if ($(e.target).attr('data-zoom-id') === this.zoomId) {
      click = zEventPosition.call(this, e);
      return this.zoomIn('click', click.left, click.top);
    }
  };

  zMouseDown = function(e) {
    var coords;
    if ($(e.target).attr('data-zoom-id') === this.zoomId && e.which === 1) {
      this.isDragging = true;
      coords = zEventPosition.call(this, e);
      this.dragCoords = {
        pointRef: coords,
        imgRef: {
          left: 0 - this.calc(imgOffsetLeft),
          top: 0 - this.calc(imgOffsetTop)
        },
        max: {
          right: (coords.left * this.calc(containerWidth)) + this.calc(imgOffsetLeft),
          left: (coords.left * this.calc(containerWidth)) - (this.calc(imgWidth) - (this.calc(containerWidth) + this.calc(imgOffsetLeft))),
          bottom: (coords.top * this.calc(containerHeight)) + this.calc(imgOffsetTop),
          top: (coords.top * this.calc(containerHeight)) - (this.calc(imgHeight) - (this.calc(containerHeight) + this.calc(imgOffsetTop)))
        }
      };
    }
    return true;
  };

  zMouseMove = function(e) {
    var coords, dragLeft, dragTop, left, top;
    if (this.isDragging) {
      coords = zEventPosition.call(this, e);
      dragLeft = coords.left * this.calc(containerWidth);
      dragTop = coords.top * this.calc(containerHeight);
      if (dragLeft >= this.dragCoords.max.left && dragLeft <= this.dragCoords.max.right) {
        left = (coords.left - this.dragCoords.pointRef.left) * this.calc(containerWidth);
        this.imagePosition.leftPx = this.dragCoords.imgRef.left + left;
      } else if (dragLeft < this.dragCoords.max.left) {
        this.imagePosition.leftPx = this.calc(containerWidth) - this.calc(imgWidth);
      } else if (dragLeft > this.dragCoords.max.right) {
        this.imagePosition.leftPx = 0;
      }
      if (dragTop >= this.dragCoords.max.top && dragTop <= this.dragCoords.max.bottom) {
        top = (coords.top - this.dragCoords.pointRef.top) * this.calc(containerHeight);
        this.imagePosition.topPx = this.dragCoords.imgRef.top + top;
      } else if (dragTop < this.dragCoords.max.top) {
        this.imagePosition.topPx = this.calc(containerHeight) - this.calc(imgHeight);
      } else if (dragTop > this.dragCoords.max.bottom) {
        this.imagePosition.topPx = 0;
      }
      setBackground.call(this);
    }
    return true;
  };

  zMouseUp = function(e) {
    this.isDragging = false;
    positionInfoboxes.call(this);
    return true;
  };

  Plan.prototype.zoomIn = function() {
    this.imagePosition.scale = this.imagePosition.scale + this.imagePosition.increment;
    this.imagePosition.leftPx = -this.calc(imgOffsetLeft) - (this.calc(imgWidthClickIncrement) / 2);
    this.imagePosition.topPx = -this.calc(imgOffsetTop) - (this.calc(imgHeightClickIncrement) / 2);
    return animateBackground.call(this);
  };

  Plan.prototype.zoomOut = function() {
    var leftPx, topPx;
    if (this.imagePosition.scale > 1) {
      this.imagePosition.scale = this.imagePosition.scale - this.imagePosition.increment;
      leftPx = -this.calc(imgOffsetLeft) + (this.calc(imgWidthClickIncrement) / 2);
      topPx = -this.calc(imgOffsetTop) + (this.calc(imgHeightClickIncrement) / 2);
      if (leftPx > 0) {
        this.imagePosition.leftPx = 0;
      } else if (leftPx < this.calc(containerWidth) - this.calc(imgWidth)) {
        this.imagePosition.leftPx = this.calc(containerWidth) - this.calc(imgWidth);
      } else {
        this.imagePosition.leftPx = leftPx;
      }
      if (topPx > 0) {
        this.imagePosition.topPx = 0;
      } else if (topPx < this.calc(containerHeight) - this.calc(imgHeight)) {
        this.imagePosition.topPx = this.calc(containerHeight) - this.calc(imgHeight);
      } else {
        this.imagePosition.topPx = topPx;
      }
      return animateBackground.call(this);
    }
  };

  draggingMarker = function() {
    return this.markersContainer.find("." + Planit.markerClass + "." + Planit.draggingClass);
  };

  getEventPosition = function(e) {
    var hImg, wImg, xImg, xPc, xPx, yImg, yPc, yPx;
    if (this.image) {
      xPx = e.pageX - this.container.offset().left;
      yPx = e.pageY - this.container.offset().top;
      wImg = this.image.width();
      hImg = this.image.height();
      xImg = parseInt(this.image.css('left'));
      yImg = parseInt(this.image.css('top'));
      xPc = ((xPx + Math.abs(xImg)) / wImg) * 100;
      yPc = ((yPx + Math.abs(yImg)) / hImg) * 100;
    } else {
      xPc = (e.pageX - this.container.offset().left) / this.calc(containerWidth);
      yPc = (e.pageY - this.container.offset().top) / this.calc(containerHeight);
    }
    return [xPc, yPc];
  };

  mouseup = function(e) {
    var m, marker;
    marker = this.markersContainer.find("." + Planit.draggingClass).first();
    if (draggingMarker.call(this).length > 0) {
      m = new Planit.Marker(this.container, marker.attr('data-marker'));
      this.options.markerDragEnd(e, m);
      m.savePosition();
      m.positionInfobox();
      draggingMarker.call(this).removeClass(Planit.draggingClass);
    }
    if ($(e.target).hasClass(Planit.markerContainerClass)) {
      this.options.canvasClick(e, getEventPosition.call(this, e));
    }
    if ($(e.target).hasClass(Planit.markerClass) || $(e.target).parents("." + Planit.markerClass).length > 0) {
      if ($(e.target).hasClass(Planit.markerClass)) {
        marker = $(e.target);
      } else {
        marker = $(e.target).parents("." + Planit.markerClass).first();
      }
      m = new Planit.Marker(this.container, marker.attr('data-marker'));
      this.options.markerClick(e, m);
    }
    return true;
  };

  mousemove = function(e) {
    var marker, markerBottom, markerHeight, markerLeft, markerRight, markerTop, markerWidth, markerX, markerY, markers, mouseLeft, mouseTop, planBottom, planRight;
    markers = this.markersContainer.find("." + Planit.markerClass + "." + Planit.draggingClass);
    if (markers.length > 0) {
      marker = markers.first();
      if (Math.abs(e.pageX - marker.attr('data-drag-start-x')) > 0 || Math.abs(e.pageY - marker.attr('data-drag-start-y')) > 0) {
        this.container.find("#" + (marker.attr('data-infobox'))).removeClass('active');
      }
      mouseLeft = e.pageX - this.container.offset().left;
      mouseTop = e.pageY - this.container.offset().top;
      planRight = this.container.width();
      planBottom = this.container.height();
      markerLeft = mouseLeft - (marker.outerWidth() / 2);
      markerTop = mouseTop - (marker.outerHeight() / 2);
      markerRight = mouseLeft + (marker.outerWidth() / 2);
      markerBottom = mouseTop + (marker.outerHeight() / 2);
      markerWidth = marker.outerWidth();
      markerHeight = marker.outerHeight();
      if (markerLeft <= 0) {
        markerX = 0;
      } else if (markerRight < planRight) {
        markerX = markerLeft;
      } else {
        markerX = planRight - markerWidth;
      }
      if (markerTop <= 0) {
        markerY = 0;
      } else if (markerBottom < planBottom) {
        markerY = markerTop;
      } else {
        markerY = planBottom - markerHeight;
      }
      return marker.css({
        left: markerX,
        top: markerY
      });
    }
  };

  return Plan;

})();

Planit.Marker = (function() {
  function Marker(container1, id) {
    this.container = container1;
    this.remove = bind(this.remove, this);
    this.update = bind(this.update, this);
    this.savePosition = bind(this.savePosition, this);
    this.set = bind(this.set, this);
    this.isDraggable = bind(this.isDraggable, this);
    this.animateInfobox = bind(this.animateInfobox, this);
    this.positionInfobox = bind(this.positionInfobox, this);
    this.infoboxCoords = bind(this.infoboxCoords, this);
    this.unhideInfobox = bind(this.unhideInfobox, this);
    this.showInfobox = bind(this.showInfobox, this);
    this.hideInfobox = bind(this.hideInfobox, this);
    this.infoboxVisible = bind(this.infoboxVisible, this);
    this.infoboxHTML = bind(this.infoboxHTML, this);
    this.infobox = bind(this.infobox, this);
    this.id = bind(this.id, this);
    this.planitID = bind(this.planitID, this);
    this.color = bind(this.color, this);
    this.relativePosition = bind(this.relativePosition, this);
    this.position = bind(this.position, this);
    this.markersContainer = this.container.find("." + Planit.markerContainerClass);
    if (this.container.find("." + Planit.imageContainer + " > img").length > 0) {
      this.image = this.container.find("." + Planit.imageContainer + " > img").first();
    }
    this.marker = this.markersContainer.find("." + Planit.markerClass + "[data-marker='" + id + "']").first();
    this;
  }

  Marker.create = function(options) {
    var arrow, arrowClass, classes, color, container, id, infobox, left, m, marker, markersContainer, position, top;
    container = options.container;
    markersContainer = container.find("." + Planit.markerContainerClass).first();
    if (!options.planitID) {
      options.planitID = Planit.randomString(20);
    }
    if (options.color) {
      color = options.color;
    } else {
      color = '#FC5B3F';
    }
    left = ((parseFloat(options.coords[0]) / 100) * container.width()) - 15;
    top = ((parseFloat(options.coords[1]) / 100) * container.height()) - 15;
    markersContainer.append($('<div></div>').addClass(Planit.markerClass).attr({
      'data-marker': options.planitID,
      'data-xPc': options.coords[0],
      'data-yPc': options.coords[1]
    }).css({
      left: left + "px",
      top: top + "px",
      backgroundColor: color
    }));
    marker = markersContainer.find("." + Planit.markerClass).last();
    if (options.id) {
      marker.attr({
        'data-id': options.id
      });
    }
    if (options["class"]) {
      marker.addClass(options["class"]);
    }
    if (options.html) {
      marker.html(options.html);
    }
    if (options.size) {
      marker.css({
        width: options.size + "px",
        height: options.size + "px"
      });
    }
    if (options.draggable) {
      marker.addClass('draggable');
      marker.on('mousedown', (function(_this) {
        return function(e) {
          if (e.which === 1) {
            marker = $(e.target).closest("." + Planit.markerClass);
            marker.addClass(Planit.draggingClass);
            return marker.attr({
              'data-drag-start-x': e.pageX,
              'data-drag-start-y': e.pageY
            });
          }
        };
      })(this));
    }
    if (options.infobox) {
      id = Planit.randomString(16);
      infobox = options.infobox;
      if (infobox.position) {
        position = infobox.position;
      } else {
        position = 'top';
      }
      if (infobox.arrow) {
        arrow = true;
      } else {
        arrow = false;
      }
      if (arrow === true) {
        arrowClass = 'arrow';
      } else {
        arrowClass = '';
      }
      classes = Planit.infoboxClass + " " + position + " " + arrowClass;
      container.find("." + Planit.infoboxContainerClass).append("<div class=\"" + classes + "\" id=\"info-" + id + "\"\n  data-position=\"" + position + "\">\n    " + infobox.html + "\n</div>");
      if (infobox.offsetX) {
        container.find("." + Planit.infoboxClass).last().attr({
          'data-offset-x': infobox.offsetX
        });
      }
      if (infobox.offsetY) {
        container.find("." + Planit.infoboxClass).last().attr({
          'data-offset-y': infobox.offsetY
        });
      }
      marker.attr('data-infobox', "info-" + id);
      m = new Planit.Marker(container, options.planitID);
      m.positionInfobox();
      return m;
    }
  };

  Marker.prototype.position = function() {
    var hImg, wImg, xImg, xPc, xPx, yImg, yPc, yPx;
    xPx = this.marker.position().left + (this.marker.outerWidth() / 2);
    yPx = this.marker.position().top + (this.marker.outerHeight() / 2);
    if (this.image) {
      wImg = this.image.width();
      hImg = this.image.height();
      xImg = parseInt(this.image.css('left'));
      yImg = parseInt(this.image.css('top'));
      xPc = ((xPx + Math.abs(xImg)) / wImg) * 100;
      yPc = ((yPx + Math.abs(yImg)) / hImg) * 100;
    } else {
      xPc = (xPx / this.container.width()) * 100;
      yPc = (yPx / this.container.height()) * 100;
    }
    return [xPc, yPc];
  };

  Marker.prototype.relativePosition = function() {
    var xPc, xPx, yPc, yPx;
    xPx = this.marker.position().left + (this.marker.outerWidth() / 2);
    yPx = this.marker.position().top + (this.marker.outerHeight() / 2);
    xPc = (xPx / this.container.width()) * 100;
    yPc = (yPx / this.container.height()) * 100;
    return [xPc, yPc];
  };

  Marker.prototype.color = function() {
    return this.marker.css('backgroundColor');
  };

  Marker.prototype.planitID = function() {
    return this.marker.attr('data-marker');
  };

  Marker.prototype.id = function() {
    return this.marker.attr('data-id');
  };

  Marker.prototype.infobox = function() {
    var infobox;
    infobox = this.container.find("#" + (this.marker.attr('data-infobox')));
    if (infobox.length > 0) {
      return infobox;
    } else {
      return null;
    }
  };

  Marker.prototype.infoboxHTML = function() {
    if (this.infobox() && this.infobox().length > 0) {
      return this.infobox().html();
    } else {
      return null;
    }
  };

  Marker.prototype.infoboxVisible = function() {
    return this.infobox() && this.infobox().hasClass('active');
  };

  Marker.prototype.hideInfobox = function() {
    if (this.infoboxVisible()) {
      return this.infobox().addClass('hidden');
    }
  };

  Marker.prototype.showInfobox = function() {
    if (this.infobox() && !this.infoboxVisible()) {
      this.infobox().addClass('active');
    }
    return this.unhideInfobox();
  };

  Marker.prototype.unhideInfobox = function() {
    if (this.infoboxVisible()) {
      return this.infobox().removeClass('hidden');
    }
  };

  Marker.prototype.infoboxCoords = function() {
    var buffer, cHeight, cWidth, iHalfHeight, iHalfWidth, iHeight, iWidth, infoLeft, infoTop, infobox, mHalfHeight, mHalfWidth, mHeight, mWidth, markerCenterX, markerCenterY, offsetX, offsetY;
    infobox = this.container.find("#" + (this.marker.attr('data-infobox')));
    markerCenterX = parseFloat(this.relativePosition()[0] / 100) * this.container.width();
    markerCenterY = parseFloat(this.relativePosition()[1] / 100) * this.container.height();
    iWidth = infobox.outerWidth();
    iHalfWidth = iWidth / 2;
    iHeight = infobox.outerHeight();
    iHalfHeight = iHeight / 2;
    cWidth = this.container.width();
    cHeight = this.container.height();
    mWidth = this.marker.outerWidth();
    mHalfWidth = mWidth / 2;
    mHeight = this.marker.outerHeight();
    mHalfHeight = mHeight / 2;
    buffer = 5;
    offsetX = parseInt(infobox.attr('data-offset-x'));
    if (!offsetX) {
      offsetX = 0;
    }
    offsetY = parseInt(infobox.attr('data-offset-y'));
    if (!offsetY) {
      offsetY = 0;
    }
    switch (infobox.attr('data-position')) {
      case 'top':
        infoLeft = markerCenterX - iHalfWidth;
        infoTop = markerCenterY - iHeight - mHalfHeight - buffer;
        break;
      case 'right':
        infoLeft = markerCenterX + mHalfWidth + buffer;
        infoTop = markerCenterY - iHalfHeight;
        break;
      case 'bottom':
        infoLeft = markerCenterX - iHalfWidth;
        infoTop = markerCenterY + mHalfHeight + buffer;
        break;
      case 'left':
        infoLeft = markerCenterX - iWidth - mHalfWidth - buffer;
        infoTop = markerCenterY - iHalfHeight;
        break;
      case 'top-left':
        infoLeft = markerCenterX - iWidth - mHalfWidth + buffer;
        infoTop = markerCenterY - iHeight - mHalfHeight + buffer;
        break;
      case 'top-right':
        infoLeft = markerCenterX + mHalfWidth - buffer;
        infoTop = markerCenterY - iHeight - mHalfHeight + buffer;
        break;
      case 'bottom-left':
        infoLeft = markerCenterX - iWidth - mHalfWidth + buffer;
        infoTop = markerCenterY + mHalfHeight - buffer;
        break;
      case 'bottom-right':
        infoLeft = markerCenterX + mHalfWidth - buffer;
        infoTop = markerCenterY + mHalfHeight - buffer;
    }
    return {
      left: infoLeft + offsetX,
      top: infoTop + offsetY
    };
  };

  Marker.prototype.positionInfobox = function() {
    var coords;
    coords = this.infoboxCoords();
    this.container.find("#" + (this.marker.attr('data-infobox'))).css({
      left: coords.left + "px",
      top: coords.top + "px"
    });
    return this.position();
  };

  Marker.prototype.animateInfobox = function() {
    var coords;
    coords = this.infoboxCoords();
    return this.container.find("#" + (this.marker.attr('data-infobox'))).animate({
      left: coords.left + "px",
      top: coords.top + "px"
    }, 250, (function(_this) {
      return function() {
        return _this.position();
      };
    })(this));
  };

  Marker.prototype.isDraggable = function() {
    return this.marker.hasClass('draggable');
  };

  Marker.prototype.set = function() {
    var left, top;
    left = (this.image.width() * (this.marker.attr('data-xPc') / 100)) + parseFloat(this.image.css('left')) - (this.marker.outerWidth() / 2);
    top = (this.image.height() * (this.marker.attr('data-yPc') / 100)) + parseFloat(this.image.css('top')) - (this.marker.outerHeight() / 2);
    this.marker.css({
      left: left + "px",
      top: top + "px"
    });
    this.positionInfobox();
    return [left, top];
  };

  Marker.prototype.savePosition = function() {
    var coords;
    coords = this.position();
    return this.marker.attr({
      'data-xPc': coords[0],
      'data-yPc': coords[1]
    });
  };

  Marker.prototype.update = function(options) {
    var left, top;
    if (options.color) {
      this.marker.css({
        backgroundColor: options.color
      });
    }
    if (options.infobox) {
      this.marker.find("." + Planit.infoboxClass).html(options.infobox);
      this.positionInfobox();
    }
    if (options.draggable) {
      this.marker.removeClass('draggable');
      if (options.draggable === true) {
        this.marker.addClass('draggable');
      }
    }
    if (options.coords) {
      left = ((parseFloat(options.coords[0]) / 100) * this.container.width()) - 15;
      top = ((parseFloat(options.coords[1]) / 100) * this.container.height()) - 15;
      return this.marker.css({
        left: left + "px",
        top: top + "px"
      });
    }
  };

  Marker.prototype.remove = function() {
    if (this.infobox()) {
      this.infobox().remove();
    }
    return this.marker.remove();
  };

  return Marker;

})();

window.planit = new Planit;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInBsYW5pdC10bXAuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLElBQUEsTUFBQTtFQUFBLGdGQUFBOztBQUFBO3NCQUlFOztBQUFBLEVBQUEsTUFBQyxDQUFBLGNBQUQsR0FBd0Isa0JBQXhCLENBQUE7O0FBQUEsRUFDQSxNQUFDLENBQUEsYUFBRCxHQUF3QixhQUR4QixDQUFBOztBQUFBLEVBRUEsTUFBQyxDQUFBLGNBQUQsR0FBd0Isd0JBRnhCLENBQUE7O0FBQUEsRUFHQSxNQUFDLENBQUEsWUFBRCxHQUF3QixnQkFIeEIsQ0FBQTs7QUFBQSxFQUlBLE1BQUMsQ0FBQSxxQkFBRCxHQUF3QiwwQkFKeEIsQ0FBQTs7QUFBQSxFQUtBLE1BQUMsQ0FBQSxXQUFELEdBQXdCLGVBTHhCLENBQUE7O0FBQUEsRUFNQSxNQUFDLENBQUEsb0JBQUQsR0FBd0IsMEJBTnhCLENBQUE7O0FBQUEsRUFPQSxNQUFDLENBQUEsa0JBQUQsR0FBd0IsdUJBUHhCLENBQUE7O0FBQUEsbUJBV0EsTUFBQSxHQUFLLFNBQUMsUUFBRCxHQUFBO0FBQ0gsSUFESSxJQUFDLENBQUEsNkJBQUQsV0FBVyxFQUNmLENBQUE7QUFBQSxXQUFXLElBQUEsTUFBTSxDQUFDLElBQVAsQ0FBWSxJQUFDLENBQUEsT0FBYixDQUFYLENBREc7RUFBQSxDQVhMLENBQUE7O0FBQUEsRUFnQkEsTUFBQyxDQUFBLFlBQUQsR0FBZSxTQUFDLE1BQUQsR0FBQTtBQUNiLFFBQUEsR0FBQTs7TUFEYyxTQUFTO0tBQ3ZCO0FBQUEsSUFBQSxHQUFBLEdBQU0sSUFBSSxDQUFDLE1BQUwsQ0FBQSxDQUFhLENBQUMsUUFBZCxDQUF1QixFQUF2QixDQUEwQixDQUFDLEtBQTNCLENBQWlDLENBQWpDLENBQU4sQ0FBQTtBQUFBLElBQ0EsR0FBQSxHQUFNLEdBQUEsR0FBTSxJQUFJLENBQUMsTUFBTCxDQUFBLENBQWEsQ0FBQyxRQUFkLENBQXVCLEVBQXZCLENBQTBCLENBQUMsS0FBM0IsQ0FBaUMsQ0FBakMsQ0FEWixDQUFBO1dBRUEsR0FBRyxDQUFDLFNBQUosQ0FBYyxDQUFkLEVBQWlCLE1BQUEsR0FBUyxDQUExQixFQUhhO0VBQUEsQ0FoQmYsQ0FBQTs7Z0JBQUE7O0lBSkYsQ0FBQTs7QUFBQSxNQXlCWSxDQUFDO0FBS1gsTUFBQSxzY0FBQTs7QUFBYSxFQUFBLGNBQUMsUUFBRCxHQUFBO0FBQ1gsUUFBQSxtQkFBQTtBQUFBLElBRFksSUFBQyxDQUFBLDZCQUFELFdBQVcsRUFDdkIsQ0FBQTtBQUFBLDJDQUFBLENBQUE7QUFBQSx5Q0FBQSxDQUFBO0FBQUEscUNBQUEsQ0FBQTtBQUFBLHlDQUFBLENBQUE7QUFBQSw2Q0FBQSxDQUFBO0FBQUEsaURBQUEsQ0FBQTtBQUFBO0FBQUEsU0FBQSxxQ0FBQTtzQkFBQTtBQUFBLE1BQUEsTUFBTSxDQUFDLElBQVAsQ0FBWSxJQUFaLENBQUEsQ0FBQTtBQUFBLEtBRFc7RUFBQSxDQUFiOztBQUFBLEVBTUEsV0FBQSxHQUFjLFNBQUEsR0FBQTtXQUNaLENBQUMsV0FBRCxFQUFjLGFBQWQsRUFBNkIsU0FBN0IsRUFBd0MsaUJBQXhDLEVBQTJELFVBQTNELEVBRFk7RUFBQSxDQU5kLENBQUE7O0FBQUEsRUFlQSxXQUFBLEdBQWMsU0FBQSxHQUFBO0FBQ1osSUFBQSxJQUFHLElBQUMsQ0FBQSxPQUFPLENBQUMsU0FBWjtBQUNFLE1BQUEsSUFBQyxDQUFBLE9BQU8sQ0FBQyxTQUFULEdBQXFCLENBQUEsQ0FBRSxHQUFBLEdBQUksSUFBQyxDQUFBLE9BQU8sQ0FBQyxTQUFmLENBQXJCLENBREY7S0FBQSxNQUFBO0FBR0UsTUFBQSxJQUFDLENBQUEsT0FBTyxDQUFDLFNBQVQsR0FBcUIsQ0FBQSxDQUFFLFNBQUYsQ0FBckIsQ0FIRjtLQUFBO1dBS0EsSUFBQyxDQUFBLFNBQUQsR0FBYSxJQUFDLENBQUEsT0FBTyxDQUFDLFVBTlY7RUFBQSxDQWZkLENBQUE7O0FBQUEsRUEyQkEsYUFBQSxHQUFnQixTQUFBLEdBQUE7QUFDZCxJQUFBLElBQUMsQ0FBQSxTQUFTLENBQUMsUUFBWCxDQUFvQixNQUFNLENBQUMsY0FBM0IsQ0FBQSxDQUFBO0FBQUEsSUFDQSxJQUFDLENBQUEsU0FBUyxDQUFDLE1BQVgsQ0FBa0IsZUFBQSxHQUNGLE1BQU0sQ0FBQyxxQkFETCxHQUMyQiwwQkFEM0IsR0FFRixNQUFNLENBQUMsb0JBRkwsR0FFMEIsV0FGNUMsQ0FEQSxDQUFBO1dBS0EsSUFBQyxDQUFBLGdCQUFELEdBQW9CLElBQUMsQ0FBQSxTQUFTLENBQUMsSUFBWCxDQUFnQixHQUFBLEdBQUksTUFBTSxDQUFDLG9CQUEzQixDQUNsQixDQUFDLEtBRGlCLENBQUEsRUFOTjtFQUFBLENBM0JoQixDQUFBOztBQUFBLEVBeUNBLFNBQUEsR0FBWSxTQUFBLEdBQUE7QUFDVixJQUFBLElBQUcsSUFBQyxDQUFBLE9BQU8sQ0FBQyxLQUFULElBQWtCLElBQUMsQ0FBQSxPQUFPLENBQUMsS0FBSyxDQUFDLEdBQXBDO0FBQ0UsTUFBQSxJQUFDLENBQUEsU0FBUyxDQUFDLE9BQVgsQ0FBbUIsZUFBQSxHQUNILE1BQU0sQ0FBQyxjQURKLEdBQ21CLG9CQURuQixHQUVILElBQUMsQ0FBQSxPQUFPLENBQUMsS0FBSyxDQUFDLEdBRlosR0FFZ0IsYUFGbkMsQ0FBQSxDQUFBO0FBQUEsTUFLQSxJQUFDLENBQUEsS0FBRCxHQUFTLElBQUMsQ0FBQSxTQUFTLENBQUMsSUFBWCxDQUFnQixLQUFoQixDQUFzQixDQUFDLEtBQXZCLENBQUEsQ0FMVCxDQUFBO2FBTUEsSUFBQyxDQUFBLEtBQUssQ0FBQyxJQUFQLENBQVksQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUEsR0FBQTtBQUNWLFVBQUEsS0FBQyxDQUFBLFNBQVMsQ0FBQyxHQUFYLENBQWU7QUFBQSxZQUFBLE1BQUEsRUFBUSxLQUFDLENBQUEsS0FBSyxDQUFDLE1BQVAsQ0FBQSxDQUFSO1dBQWYsQ0FBQSxDQUFBO0FBQUEsVUFDQSxZQUFZLENBQUMsSUFBYixDQUFrQixLQUFsQixDQURBLENBQUE7aUJBRUEsV0FBVyxDQUFDLElBQVosQ0FBaUIsS0FBakIsRUFIVTtRQUFBLEVBQUE7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQVosRUFQRjtLQURVO0VBQUEsQ0F6Q1osQ0FBQTs7QUFBQSxFQTJEQSxZQUFBLEdBQWUsU0FBQSxHQUFBO0FBRWIsSUFBQSxJQUFDLENBQUEsTUFBRCxHQUFVLE1BQU0sQ0FBQyxZQUFQLENBQUEsQ0FBVixDQUFBO0FBQUEsSUFDQSxJQUFDLENBQUEsZ0JBQWdCLENBQUMsSUFBbEIsQ0FBdUIsY0FBdkIsRUFBdUMsSUFBQyxDQUFBLE1BQXhDLENBREEsQ0FBQTtBQUFBLElBR0EsSUFBQyxDQUFBLFVBQUQsQ0FBQSxDQUhBLENBQUE7QUFLQSxJQUFBLElBQTRCLElBQUMsQ0FBQSxPQUFPLENBQUMsS0FBSyxDQUFDLElBQTNDO2FBQUEsZ0JBQWdCLENBQUMsSUFBakIsQ0FBc0IsSUFBdEIsRUFBQTtLQVBhO0VBQUEsQ0EzRGYsQ0FBQTs7QUFBQSxFQXVFQSxnQkFBQSxHQUFtQixTQUFBLEdBQUE7QUFFakIsSUFBQSxJQUFDLENBQUEsU0FBUyxDQUFDLE9BQVgsQ0FBbUIsNEpBQW5CLENBQUEsQ0FBQTtBQUFBLElBTUEsSUFBQyxDQUFBLFNBQVMsQ0FBQyxJQUFYLENBQWdCLHlCQUFoQixDQUEwQyxDQUFDLEtBQTNDLENBQWlELENBQUEsU0FBQSxLQUFBLEdBQUE7YUFBQSxTQUFDLENBQUQsR0FBQTtBQUMvQyxRQUFBLENBQUMsQ0FBQyxjQUFGLENBQUEsQ0FBQSxDQUFBO2VBQ0EsS0FBQyxDQUFBLE1BQUQsQ0FBQSxFQUYrQztNQUFBLEVBQUE7SUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQWpELENBTkEsQ0FBQTtBQUFBLElBU0EsSUFBQyxDQUFBLFNBQVMsQ0FBQyxJQUFYLENBQWdCLDBCQUFoQixDQUEyQyxDQUFDLEtBQTVDLENBQWtELENBQUEsU0FBQSxLQUFBLEdBQUE7YUFBQSxTQUFDLENBQUQsR0FBQTtBQUNoRCxRQUFBLENBQUMsQ0FBQyxjQUFGLENBQUEsQ0FBQSxDQUFBO2VBQ0EsS0FBQyxDQUFBLE9BQUQsQ0FBQSxFQUZnRDtNQUFBLEVBQUE7SUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQWxELENBVEEsQ0FBQTtBQUFBLElBYUEsSUFBQyxDQUFBLFNBQVMsQ0FBQyxFQUFYLENBQWdCLFVBQWhCLEVBQTRCLENBQUEsU0FBQSxLQUFBLEdBQUE7YUFBQSxTQUFDLENBQUQsR0FBQTtlQUMxQixTQUFTLENBQUMsSUFBVixDQUFlLEtBQWYsRUFBa0IsQ0FBbEIsRUFEMEI7TUFBQSxFQUFBO0lBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUE1QixDQWJBLENBQUE7QUFBQSxJQWVBLElBQUMsQ0FBQSxTQUFTLENBQUMsRUFBWCxDQUFnQixXQUFoQixFQUE2QixDQUFBLFNBQUEsS0FBQSxHQUFBO2FBQUEsU0FBQyxDQUFELEdBQUE7ZUFDM0IsVUFBVSxDQUFDLElBQVgsQ0FBZ0IsS0FBaEIsRUFBbUIsQ0FBbkIsRUFEMkI7TUFBQSxFQUFBO0lBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUE3QixDQWZBLENBQUE7QUFBQSxJQWlCQSxDQUFBLENBQUUsUUFBRixDQUFXLENBQUMsRUFBWixDQUFnQixXQUFoQixFQUE2QixDQUFBLFNBQUEsS0FBQSxHQUFBO2FBQUEsU0FBQyxDQUFELEdBQUE7ZUFDM0IsVUFBVSxDQUFDLElBQVgsQ0FBZ0IsS0FBaEIsRUFBbUIsQ0FBbkIsRUFEMkI7TUFBQSxFQUFBO0lBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUE3QixDQWpCQSxDQUFBO1dBbUJBLENBQUEsQ0FBRSxRQUFGLENBQVcsQ0FBQyxFQUFaLENBQWdCLFNBQWhCLEVBQTJCLENBQUEsU0FBQSxLQUFBLEdBQUE7YUFBQSxTQUFDLENBQUQsR0FBQTtlQUN6QixRQUFRLENBQUMsSUFBVCxDQUFjLEtBQWQsRUFBaUIsQ0FBakIsRUFEeUI7TUFBQSxFQUFBO0lBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUEzQixFQXJCaUI7RUFBQSxDQXZFbkIsQ0FBQTs7QUFBQSxFQXFHQSxpQkFBQSxHQUFvQixTQUFBLEdBQUE7QUFDbEIsSUFBQSxJQUFBLENBQUEsQ0FBMkIsSUFBQyxDQUFBLE9BQU8sQ0FBQyxLQUFULElBQWtCLElBQUMsQ0FBQSxPQUFPLENBQUMsS0FBSyxDQUFDLEdBQTVELENBQUE7YUFBQSxXQUFXLENBQUMsSUFBWixDQUFpQixJQUFqQixFQUFBO0tBRGtCO0VBQUEsQ0FyR3BCLENBQUE7O0FBQUEsRUEyR0EsV0FBQSxHQUFjLFNBQUEsR0FBQTtBQUNaLFFBQUEsNEJBQUE7QUFBQSxJQUFBLElBQUcsSUFBQyxDQUFBLE9BQU8sQ0FBQyxPQUFULElBQW9CLElBQUMsQ0FBQSxPQUFPLENBQUMsT0FBTyxDQUFDLE1BQWpCLEdBQTBCLENBQWpEO0FBQ0U7QUFBQTtXQUFBLHFDQUFBO3dCQUFBO0FBQ0UsUUFBQSxNQUFNLENBQUMsU0FBUCxHQUFtQixJQUFDLENBQUEsU0FBcEIsQ0FBQTtBQUFBLHFCQUNBLE1BQU0sQ0FBQyxNQUFNLENBQUMsTUFBZCxDQUFxQixNQUFyQixFQURBLENBREY7QUFBQTtxQkFERjtLQURZO0VBQUEsQ0EzR2QsQ0FBQTs7QUFBQSxFQXVIQSxVQUFBLEdBQWEsU0FBQSxHQUFBO0FBQ1gsSUFBQSxJQUFHLElBQUMsQ0FBQSxTQUFTLENBQUMsSUFBWCxDQUFnQixHQUFBLEdBQUksTUFBTSxDQUFDLGNBQVgsR0FBMEIsUUFBMUMsQ0FBa0QsQ0FBQyxNQUFuRCxHQUE0RCxDQUEvRDtBQUNFLE1BQUEsSUFBQyxDQUFBLEtBQUQsR0FBUyxJQUFDLENBQUEsU0FBUyxDQUFDLElBQVgsQ0FBZ0IsR0FBQSxHQUFJLE1BQU0sQ0FBQyxjQUFYLEdBQTBCLFFBQTFDLENBQWtELENBQUMsS0FBbkQsQ0FBQSxDQUFULENBREY7S0FBQTtBQUFBLElBRUEsQ0FBQSxDQUFFLFFBQUYsQ0FBVyxDQUFDLEVBQVosQ0FBZSxXQUFmLEVBQTRCLENBQUEsU0FBQSxLQUFBLEdBQUE7YUFBQSxTQUFDLENBQUQsR0FBQTtlQUMxQixTQUFTLENBQUMsSUFBVixDQUFlLEtBQWYsRUFBa0IsQ0FBbEIsRUFEMEI7TUFBQSxFQUFBO0lBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUE1QixDQUZBLENBQUE7V0FJQSxDQUFBLENBQUUsUUFBRixDQUFXLENBQUMsRUFBWixDQUFlLFNBQWYsRUFBMEIsQ0FBQSxTQUFBLEtBQUEsR0FBQTthQUFBLFNBQUMsQ0FBRCxHQUFBO2VBQ3hCLE9BQU8sQ0FBQyxJQUFSLENBQWEsS0FBYixFQUFnQixDQUFoQixFQUR3QjtNQUFBLEVBQUE7SUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQTFCLEVBTFc7RUFBQSxDQXZIYixDQUFBOztBQUFBLGlCQXFJQSxVQUFBLEdBQVksU0FBQSxHQUFBO0FBQ1YsSUFBQSxJQUFDLENBQUEsYUFBRCxHQUNFO0FBQUEsTUFBQSxNQUFBLEVBQWdCLENBQWhCO0FBQUEsTUFDQSxLQUFBLEVBQWdCLENBRGhCO0FBQUEsTUFFQSxLQUFBLEVBQWdCLElBQUMsQ0FBQSxLQUFLLENBQUMsS0FBUCxDQUFBLENBRmhCO0FBQUEsTUFHQSxNQUFBLEVBQWdCLElBQUMsQ0FBQSxLQUFLLENBQUMsTUFBUCxDQUFBLENBSGhCO0FBQUEsTUFJQSxLQUFBLEVBQWdCLENBSmhCO0FBQUEsTUFLQSxTQUFBLEVBQWdCLEdBTGhCO0tBREYsQ0FBQTtXQU9BLGFBQWEsQ0FBQyxJQUFkLENBQW1CLElBQW5CLEVBUlU7RUFBQSxDQXJJWixDQUFBOztBQUFBLEVBbUpBLGFBQUEsR0FBZ0IsU0FBQSxHQUFBO0FBQ2QsSUFBQSxJQUFDLENBQUEsS0FBSyxDQUFDLEdBQVAsQ0FDRTtBQUFBLE1BQUEsSUFBQSxFQUFTLElBQUMsQ0FBQSxhQUFhLENBQUMsTUFBaEIsR0FBdUIsSUFBL0I7QUFBQSxNQUNBLEdBQUEsRUFBUSxJQUFDLENBQUEsYUFBYSxDQUFDLEtBQWhCLEdBQXNCLElBRDdCO0FBQUEsTUFFQSxLQUFBLEVBQVMsQ0FBQyxJQUFDLENBQUEsYUFBYSxDQUFDLEtBQWYsR0FBdUIsS0FBeEIsQ0FBQSxHQUE4QixHQUZ2QztBQUFBLE1BR0EsTUFBQSxFQUFRLE1BSFI7S0FERixDQUFBLENBQUE7V0FLQSxVQUFVLENBQUMsSUFBWCxDQUFnQixJQUFoQixFQU5jO0VBQUEsQ0FuSmhCLENBQUE7O0FBQUEsRUE4SkEsaUJBQUEsR0FBb0IsU0FBQSxHQUFBO0FBQ2xCLElBQUEsSUFBQyxDQUFBLEtBQUssQ0FBQyxPQUFQLENBQ0U7QUFBQSxNQUFBLElBQUEsRUFBUyxJQUFDLENBQUEsYUFBYSxDQUFDLE1BQWhCLEdBQXVCLElBQS9CO0FBQUEsTUFDQSxHQUFBLEVBQVEsSUFBQyxDQUFBLGFBQWEsQ0FBQyxLQUFoQixHQUFzQixJQUQ3QjtBQUFBLE1BRUEsS0FBQSxFQUFTLENBQUMsSUFBQyxDQUFBLGFBQWEsQ0FBQyxLQUFmLEdBQXVCLEtBQXhCLENBQUEsR0FBOEIsR0FGdkM7QUFBQSxNQUdBLE1BQUEsRUFBUSxNQUhSO0tBREYsRUFLRSxHQUxGLENBQUEsQ0FBQTtXQU1BLGNBQWMsQ0FBQyxJQUFmLENBQW9CLElBQXBCLEVBUGtCO0VBQUEsQ0E5SnBCLENBQUE7O0FBQUEsRUE0S0EsVUFBQSxHQUFhLFNBQUEsR0FBQTtBQUNYLFFBQUEsa0NBQUE7QUFBQSxJQUFBLE9BQUEsR0FBVSxJQUFDLENBQUEsU0FBUyxDQUFDLElBQVgsQ0FBZ0IsR0FBQSxHQUFJLE1BQU0sQ0FBQyxXQUEzQixDQUFWLENBQUE7QUFDQSxJQUFBLElBQUcsT0FBTyxDQUFDLE1BQVIsR0FBaUIsQ0FBcEI7QUFDRSxXQUFBLHlDQUFBOzRCQUFBO0FBQ0UsUUFBQSxJQUFBLEdBQU8sQ0FBQyxJQUFDLENBQUEsSUFBRCxDQUFNLFFBQU4sQ0FBQSxHQUFrQixDQUFDLENBQUEsQ0FBRSxNQUFGLENBQVMsQ0FBQyxJQUFWLENBQWUsVUFBZixDQUFBLEdBQTZCLEdBQTlCLENBQW5CLENBQUEsR0FDTCxJQUFDLENBQUEsYUFBYSxDQUFDLE1BRFYsR0FDbUIsQ0FBQyxDQUFBLENBQUUsTUFBRixDQUFTLENBQUMsVUFBVixDQUFBLENBQUEsR0FBeUIsQ0FBMUIsQ0FEMUIsQ0FBQTtBQUFBLFFBRUEsR0FBQSxHQUFNLENBQUMsSUFBQyxDQUFBLElBQUQsQ0FBTSxTQUFOLENBQUEsR0FBbUIsQ0FBQyxDQUFBLENBQUUsTUFBRixDQUFTLENBQUMsSUFBVixDQUFlLFVBQWYsQ0FBQSxHQUE2QixHQUE5QixDQUFwQixDQUFBLEdBQ0osSUFBQyxDQUFBLGFBQWEsQ0FBQyxLQURYLEdBQ21CLENBQUMsQ0FBQSxDQUFFLE1BQUYsQ0FBUyxDQUFDLFdBQVYsQ0FBQSxDQUFBLEdBQTBCLENBQTNCLENBSHpCLENBQUE7QUFBQSxRQUlBLENBQUEsQ0FBRSxNQUFGLENBQVMsQ0FBQyxHQUFWLENBQ0U7QUFBQSxVQUFBLElBQUEsRUFBUyxJQUFELEdBQU0sSUFBZDtBQUFBLFVBQ0EsR0FBQSxFQUFRLEdBQUQsR0FBSyxJQURaO1NBREYsQ0FKQSxDQURGO0FBQUEsT0FBQTthQVFBLGlCQUFpQixDQUFDLElBQWxCLENBQXVCLElBQXZCLEVBVEY7S0FGVztFQUFBLENBNUtiLENBQUE7O0FBQUEsRUEyTEEsY0FBQSxHQUFpQixTQUFBLEdBQUE7QUFDZixRQUFBLDhDQUFBO0FBQUEsSUFBQSxPQUFBLEdBQVUsSUFBQyxDQUFBLFNBQVMsQ0FBQyxJQUFYLENBQWdCLEdBQUEsR0FBSSxNQUFNLENBQUMsV0FBM0IsQ0FBVixDQUFBO0FBQ0EsSUFBQSxJQUFHLE9BQU8sQ0FBQyxNQUFSLEdBQWlCLENBQXBCO0FBQ0U7V0FBQSx5Q0FBQTs0QkFBQTtBQUNFLFFBQUEsQ0FBQSxHQUFRLElBQUEsTUFBTSxDQUFDLE1BQVAsQ0FBYyxJQUFDLENBQUEsU0FBZixFQUEwQixDQUFBLENBQUUsTUFBRixDQUFTLENBQUMsSUFBVixDQUFlLGFBQWYsQ0FBMUIsQ0FBUixDQUFBO0FBQUEsUUFDQSxDQUFDLENBQUMsV0FBRixDQUFBLENBREEsQ0FBQTtBQUFBLFFBRUEsSUFBQSxHQUFPLENBQUMsSUFBQyxDQUFBLElBQUQsQ0FBTSxRQUFOLENBQUEsR0FBa0IsQ0FBQyxDQUFBLENBQUUsTUFBRixDQUFTLENBQUMsSUFBVixDQUFlLFVBQWYsQ0FBQSxHQUE2QixHQUE5QixDQUFuQixDQUFBLEdBQ0wsSUFBQyxDQUFBLGFBQWEsQ0FBQyxNQURWLEdBQ21CLENBQUMsQ0FBQSxDQUFFLE1BQUYsQ0FBUyxDQUFDLFVBQVYsQ0FBQSxDQUFBLEdBQXlCLENBQTFCLENBSDFCLENBQUE7QUFBQSxRQUlBLEdBQUEsR0FBTSxDQUFDLElBQUMsQ0FBQSxJQUFELENBQU0sU0FBTixDQUFBLEdBQW1CLENBQUMsQ0FBQSxDQUFFLE1BQUYsQ0FBUyxDQUFDLElBQVYsQ0FBZSxVQUFmLENBQUEsR0FBNkIsR0FBOUIsQ0FBcEIsQ0FBQSxHQUNKLElBQUMsQ0FBQSxhQUFhLENBQUMsS0FEWCxHQUNtQixDQUFDLENBQUEsQ0FBRSxNQUFGLENBQVMsQ0FBQyxXQUFWLENBQUEsQ0FBQSxHQUEwQixDQUEzQixDQUx6QixDQUFBO0FBQUEscUJBTUcsQ0FBQSxTQUFDLENBQUQsR0FBQTtpQkFDRCxDQUFBLENBQUUsTUFBRixDQUFTLENBQUMsT0FBVixDQUNFO0FBQUEsWUFBQSxJQUFBLEVBQVMsSUFBRCxHQUFNLElBQWQ7QUFBQSxZQUNBLEdBQUEsRUFBUSxHQUFELEdBQUssSUFEWjtXQURGLEVBR0UsR0FIRixFQUdPLENBQUEsU0FBQSxLQUFBLEdBQUE7bUJBQUEsU0FBQSxHQUFBO0FBQ0wsY0FBQSxDQUFDLENBQUMsZUFBRixDQUFBLENBQUEsQ0FBQTtxQkFDQSxDQUFDLENBQUMsYUFBRixDQUFBLEVBRks7WUFBQSxFQUFBO1VBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUhQLEVBREM7UUFBQSxDQUFBLENBQUgsQ0FBSSxDQUFKLEVBTkEsQ0FERjtBQUFBO3FCQURGO0tBRmU7RUFBQSxDQTNMakIsQ0FBQTs7QUFBQSxFQWtOQSxpQkFBQSxHQUFvQixTQUFBLEdBQUE7QUFDbEIsUUFBQSxzQkFBQTtBQUFBO0FBQUEsU0FBQSxxQ0FBQTtzQkFBQTtBQUNFLE1BQUEsQ0FBQSxHQUFRLElBQUEsTUFBTSxDQUFDLE1BQVAsQ0FBYyxJQUFDLENBQUEsU0FBZixFQUEwQixDQUFBLENBQUUsTUFBRixDQUFTLENBQUMsSUFBVixDQUFlLGFBQWYsQ0FBMUIsQ0FBUixDQUFBO0FBQUEsTUFDQSxDQUFDLENBQUMsZUFBRixDQUFBLENBREEsQ0FERjtBQUFBLEtBQUE7V0FHQSxLQUprQjtFQUFBLENBbE5wQixDQUFBOztBQUFBLGlCQThOQSxRQUFBLEdBQVUsU0FBQyxNQUFELEdBQUE7QUFDUixRQUFBLGdCQUFBO0FBQUEsSUFBQSxJQUFHLE1BQU8sQ0FBQSxDQUFBLENBQVAsSUFBYSxFQUFoQjtBQUF3QixNQUFBLENBQUEsR0FBSSxHQUFBLEdBQU0sTUFBTyxDQUFBLENBQUEsQ0FBakIsQ0FBeEI7S0FBQSxNQUFBO0FBQWlELE1BQUEsQ0FBQSxHQUFJLE1BQU8sQ0FBQSxDQUFBLENBQVgsQ0FBakQ7S0FBQTtBQUNBLElBQUEsSUFBRyxNQUFPLENBQUEsQ0FBQSxDQUFQLElBQWEsRUFBaEI7QUFBd0IsTUFBQSxDQUFBLEdBQUksR0FBQSxHQUFNLE1BQU8sQ0FBQSxDQUFBLENBQWpCLENBQXhCO0tBQUEsTUFBQTtBQUFpRCxNQUFBLENBQUEsR0FBSSxNQUFPLENBQUEsQ0FBQSxDQUFYLENBQWpEO0tBREE7QUFBQSxJQUVBLElBQUEsR0FBTyxFQUFBLEdBQUssQ0FBQyxJQUFDLENBQUEsSUFBRCxDQUFNLGNBQU4sQ0FBQSxHQUF3QixDQUF6QixDQUZaLENBQUE7QUFBQSxJQUdBLElBQUEsR0FBTyxFQUFBLEdBQUssQ0FBQyxJQUFDLENBQUEsSUFBRCxDQUFNLGVBQU4sQ0FBQSxHQUF5QixDQUExQixDQUhaLENBQUE7QUFBQSxJQU1BLElBQUMsQ0FBQSxTQUFTLENBQUMsSUFBWCxDQUFnQixHQUFBLEdBQUksTUFBTSxDQUFDLFlBQTNCLENBQTBDLENBQUMsV0FBM0MsQ0FBdUQsUUFBdkQsQ0FOQSxDQUFBO0FBQUEsSUFRQSxJQUFDLENBQUEsYUFBYSxDQUFDLE1BQWYsR0FBd0IsQ0FBQSxDQUN0QixDQUFDLElBQUMsQ0FBQSxJQUFELENBQU0sUUFBTixDQUFBLEdBQWtCLENBQUMsTUFBTyxDQUFBLENBQUEsQ0FBUCxHQUFZLEdBQWIsQ0FBbkIsQ0FBQSxHQUF3QyxDQUFDLElBQUMsQ0FBQSxJQUFELENBQU0sY0FBTixDQUFBLEdBQXdCLENBQXpCLENBRGhCLENBUjFCLENBQUE7QUFBQSxJQVdBLElBQUMsQ0FBQSxhQUFhLENBQUMsS0FBZixHQUF1QixDQUFBLENBQ3JCLENBQUMsSUFBQyxDQUFBLElBQUQsQ0FBTSxTQUFOLENBQUEsR0FBbUIsQ0FBQyxNQUFPLENBQUEsQ0FBQSxDQUFQLEdBQVksR0FBYixDQUFwQixDQUFBLEdBQXlDLENBQUMsSUFBQyxDQUFBLElBQUQsQ0FBTSxlQUFOLENBQUEsR0FBeUIsQ0FBMUIsQ0FEbEIsQ0FYekIsQ0FBQTtBQWdCQSxXQUFNLENBQUMsSUFBQyxDQUFBLElBQUQsQ0FBTSxRQUFOLENBQUEsR0FBa0IsSUFBbkIsQ0FBQSxJQUE0QixDQUFDLElBQUMsQ0FBQSxJQUFELENBQU0sU0FBTixDQUFBLEdBQW1CLElBQXBCLENBQWxDLEdBQUE7QUFDRSxNQUFBLElBQUMsQ0FBQSxhQUFhLENBQUMsS0FBZixHQUF3QixJQUFDLENBQUEsYUFBYSxDQUFDLEtBQWYsR0FBdUIsSUFBQyxDQUFBLGFBQWEsQ0FBQyxTQUE5RCxDQUFBO0FBQUEsTUFDQSxJQUFDLENBQUEsYUFBYSxDQUFDLE1BQWYsR0FBd0IsQ0FBQSxDQUN0QixDQUFDLElBQUMsQ0FBQSxJQUFELENBQU0sUUFBTixDQUFBLEdBQWtCLENBQUMsTUFBTyxDQUFBLENBQUEsQ0FBUCxHQUFZLEdBQWIsQ0FBbkIsQ0FBQSxHQUF3QyxDQUFDLElBQUMsQ0FBQSxJQUFELENBQU0sY0FBTixDQUFBLEdBQXdCLENBQXpCLENBRGhCLENBRDFCLENBQUE7QUFBQSxNQUlBLElBQUMsQ0FBQSxhQUFhLENBQUMsS0FBZixHQUF1QixDQUFBLENBQ3JCLENBQUMsSUFBQyxDQUFBLElBQUQsQ0FBTSxTQUFOLENBQUEsR0FBbUIsQ0FBQyxNQUFPLENBQUEsQ0FBQSxDQUFQLEdBQVksR0FBYixDQUFwQixDQUFBLEdBQXlDLENBQUMsSUFBQyxDQUFBLElBQUQsQ0FBTSxlQUFOLENBQUEsR0FBeUIsQ0FBMUIsQ0FEbEIsQ0FKekIsQ0FERjtJQUFBLENBaEJBO0FBQUEsSUF3QkEsaUJBQWlCLENBQUMsSUFBbEIsQ0FBdUIsSUFBdkIsQ0F4QkEsQ0FBQTtXQXlCQSxPQTFCUTtFQUFBLENBOU5WLENBQUE7O0FBQUEsaUJBNlBBLE1BQUEsR0FBUSxTQUFDLEtBQUQsR0FBQTtBQUNOLFFBQUEsQ0FBQTtBQUFBLElBQUEsQ0FBQSxHQUFJLElBQUMsQ0FBQSxhQUFhLENBQUMsU0FBbkIsQ0FBQTtBQUNBLElBQUEsSUFBTyxDQUFDLENBQUMsS0FBQSxHQUFRLENBQVQsQ0FBQSxHQUFjLENBQWYsQ0FBQSxLQUFxQixJQUFDLENBQUEsYUFBYSxDQUFDLEtBQTNDO0FBQ0UsTUFBQSxJQUFDLENBQUEsYUFBYSxDQUFDLEtBQWYsR0FBdUIsQ0FBQyxLQUFBLEdBQVEsQ0FBVCxDQUFBLEdBQWMsQ0FBZCxHQUFrQixDQUF6QyxDQUFBO0FBQUEsTUFDQSxJQUFDLENBQUEsT0FBRCxDQUFBLENBREEsQ0FERjtLQURBO1dBSUEsTUFMTTtFQUFBLENBN1BSLENBQUE7O0FBQUEsaUJBd1FBLElBQUEsR0FBTSxTQUFDLE1BQUQsR0FBQTtXQUNKLE1BQU0sQ0FBQyxJQUFQLENBQVksSUFBWixFQURJO0VBQUEsQ0F4UU4sQ0FBQTs7QUFBQSxFQTZRQSxRQUFBLEdBQVcsU0FBQSxHQUFBO1dBQ1QsVUFBQSxDQUFXLElBQUMsQ0FBQSxhQUFhLENBQUMsS0FBZixHQUF1QixJQUFDLENBQUEsYUFBYSxDQUFDLEtBQWpELEVBRFM7RUFBQSxDQTdRWCxDQUFBOztBQUFBLEVBa1JBLHNCQUFBLEdBQXlCLFNBQUEsR0FBQTtXQUN2QixVQUFBLENBQVcsSUFBQyxDQUFBLGFBQWEsQ0FBQyxLQUFmLEdBQXVCLElBQUMsQ0FBQSxhQUFhLENBQUMsU0FBakQsRUFEdUI7RUFBQSxDQWxSekIsQ0FBQTs7QUFBQSxFQXVSQSxjQUFBLEdBQWlCLFNBQUEsR0FBQTtXQUNmLFVBQUEsQ0FBVyxJQUFDLENBQUEsZ0JBQWdCLENBQUMsS0FBbEIsQ0FBQSxDQUFYLEVBRGU7RUFBQSxDQXZSakIsQ0FBQTs7QUFBQSxFQTZSQSxhQUFBLEdBQWdCLFNBQUEsR0FBQTtXQUNkLElBQUksQ0FBQyxHQUFMLENBQVMsVUFBQSxDQUFXLElBQUMsQ0FBQSxLQUFLLENBQUMsR0FBUCxDQUFXLE1BQVgsQ0FBWCxDQUFULEVBRGM7RUFBQSxDQTdSaEIsQ0FBQTs7QUFBQSxFQWtTQSxTQUFBLEdBQVksU0FBQSxHQUFBO1dBQ1YsVUFBQSxDQUFXLElBQUMsQ0FBQSxhQUFhLENBQUMsTUFBZixHQUF3QixJQUFDLENBQUEsYUFBYSxDQUFDLEtBQWxELEVBRFU7RUFBQSxDQWxTWixDQUFBOztBQUFBLEVBd1NBLHVCQUFBLEdBQTBCLFNBQUEsR0FBQTtXQUN4QixVQUFBLENBQVcsSUFBQyxDQUFBLGFBQWEsQ0FBQyxNQUFmLEdBQXdCLElBQUMsQ0FBQSxhQUFhLENBQUMsU0FBbEQsRUFEd0I7RUFBQSxDQXhTMUIsQ0FBQTs7QUFBQSxFQTZTQSxlQUFBLEdBQWtCLFNBQUEsR0FBQTtXQUNoQixVQUFBLENBQVcsSUFBQyxDQUFBLGdCQUFnQixDQUFDLE1BQWxCLENBQUEsQ0FBWCxFQURnQjtFQUFBLENBN1NsQixDQUFBOztBQUFBLEVBbVRBLFlBQUEsR0FBZSxTQUFBLEdBQUE7V0FDYixJQUFJLENBQUMsR0FBTCxDQUFTLFVBQUEsQ0FBVyxJQUFDLENBQUEsS0FBSyxDQUFDLEdBQVAsQ0FBVyxLQUFYLENBQVgsQ0FBVCxFQURhO0VBQUEsQ0FuVGYsQ0FBQTs7QUFBQSxFQTBUQSxjQUFBLEdBQWlCLFNBQUMsQ0FBRCxHQUFBO1dBQ2Y7QUFBQSxNQUFBLElBQUEsRUFBTSxDQUFDLENBQUMsQ0FBQyxLQUFGLEdBQVUsSUFBQyxDQUFBLFNBQVMsQ0FBQyxNQUFYLENBQUEsQ0FBbUIsQ0FBQyxJQUEvQixDQUFBLEdBQXVDLElBQUMsQ0FBQSxJQUFELENBQU0sY0FBTixDQUE3QztBQUFBLE1BQ0EsR0FBQSxFQUFNLENBQUMsQ0FBQyxDQUFDLEtBQUYsR0FBVSxJQUFDLENBQUEsU0FBUyxDQUFDLE1BQVgsQ0FBQSxDQUFtQixDQUFDLEdBQS9CLENBQUEsR0FBc0MsSUFBQyxDQUFBLElBQUQsQ0FBTSxlQUFOLENBRDVDO01BRGU7RUFBQSxDQTFUakIsQ0FBQTs7QUFBQSxFQWtVQSxTQUFBLEdBQVksU0FBQyxDQUFELEdBQUE7QUFDVixRQUFBLEtBQUE7QUFBQSxJQUFBLElBQUcsQ0FBQSxDQUFFLENBQUMsQ0FBQyxNQUFKLENBQVcsQ0FBQyxJQUFaLENBQWlCLGNBQWpCLENBQUEsS0FBb0MsSUFBQyxDQUFBLE1BQXhDO0FBQ0UsTUFBQSxLQUFBLEdBQVEsY0FBYyxDQUFDLElBQWYsQ0FBb0IsSUFBcEIsRUFBdUIsQ0FBdkIsQ0FBUixDQUFBO2FBQ0EsSUFBQyxDQUFBLE1BQUQsQ0FBUSxPQUFSLEVBQWlCLEtBQUssQ0FBQyxJQUF2QixFQUE2QixLQUFLLENBQUMsR0FBbkMsRUFGRjtLQURVO0VBQUEsQ0FsVVosQ0FBQTs7QUFBQSxFQXlVQSxVQUFBLEdBQWEsU0FBQyxDQUFELEdBQUE7QUFDWCxRQUFBLE1BQUE7QUFBQSxJQUFBLElBQUcsQ0FBQSxDQUFFLENBQUMsQ0FBQyxNQUFKLENBQVcsQ0FBQyxJQUFaLENBQWlCLGNBQWpCLENBQUEsS0FBb0MsSUFBQyxDQUFBLE1BQXJDLElBQStDLENBQUMsQ0FBQyxLQUFGLEtBQVcsQ0FBN0Q7QUFDRSxNQUFBLElBQUMsQ0FBQSxVQUFELEdBQWMsSUFBZCxDQUFBO0FBQUEsTUFDQSxNQUFBLEdBQVMsY0FBYyxDQUFDLElBQWYsQ0FBb0IsSUFBcEIsRUFBdUIsQ0FBdkIsQ0FEVCxDQUFBO0FBQUEsTUFFQSxJQUFDLENBQUEsVUFBRCxHQUNFO0FBQUEsUUFBQSxRQUFBLEVBQVUsTUFBVjtBQUFBLFFBQ0EsTUFBQSxFQUNFO0FBQUEsVUFBQSxJQUFBLEVBQU0sQ0FBQSxHQUFJLElBQUMsQ0FBQSxJQUFELENBQU0sYUFBTixDQUFWO0FBQUEsVUFDQSxHQUFBLEVBQUssQ0FBQSxHQUFJLElBQUMsQ0FBQSxJQUFELENBQU0sWUFBTixDQURUO1NBRkY7QUFBQSxRQUlBLEdBQUEsRUFDRTtBQUFBLFVBQUEsS0FBQSxFQUFPLENBQUMsTUFBTSxDQUFDLElBQVAsR0FBYyxJQUFDLENBQUEsSUFBRCxDQUFNLGNBQU4sQ0FBZixDQUFBLEdBQXdDLElBQUMsQ0FBQSxJQUFELENBQU0sYUFBTixDQUEvQztBQUFBLFVBQ0EsSUFBQSxFQUFNLENBQUMsTUFBTSxDQUFDLElBQVAsR0FBYyxJQUFDLENBQUEsSUFBRCxDQUFNLGNBQU4sQ0FBZixDQUFBLEdBQXdDLENBQUMsSUFBQyxDQUFBLElBQUQsQ0FBTSxRQUFOLENBQUEsR0FDbkMsQ0FBQyxJQUFDLENBQUEsSUFBRCxDQUFNLGNBQU4sQ0FBQSxHQUF3QixJQUFDLENBQUEsSUFBRCxDQUFNLGFBQU4sQ0FBekIsQ0FEa0MsQ0FEOUM7QUFBQSxVQUdBLE1BQUEsRUFBUSxDQUFDLE1BQU0sQ0FBQyxHQUFQLEdBQWEsSUFBQyxDQUFBLElBQUQsQ0FBTSxlQUFOLENBQWQsQ0FBQSxHQUF3QyxJQUFDLENBQUEsSUFBRCxDQUFNLFlBQU4sQ0FIaEQ7QUFBQSxVQUlBLEdBQUEsRUFBSyxDQUFDLE1BQU0sQ0FBQyxHQUFQLEdBQWEsSUFBQyxDQUFBLElBQUQsQ0FBTSxlQUFOLENBQWQsQ0FBQSxHQUF3QyxDQUFDLElBQUMsQ0FBQSxJQUFELENBQU0sU0FBTixDQUFBLEdBQ2xDLENBQUMsSUFBQyxDQUFBLElBQUQsQ0FBTSxlQUFOLENBQUEsR0FBeUIsSUFBQyxDQUFBLElBQUQsQ0FBTSxZQUFOLENBQTFCLENBRGlDLENBSjdDO1NBTEY7T0FIRixDQURGO0tBQUE7V0FlQSxLQWhCVztFQUFBLENBelViLENBQUE7O0FBQUEsRUE4VkEsVUFBQSxHQUFhLFNBQUMsQ0FBRCxHQUFBO0FBQ1gsUUFBQSxvQ0FBQTtBQUFBLElBQUEsSUFBRyxJQUFDLENBQUEsVUFBSjtBQUNFLE1BQUEsTUFBQSxHQUFTLGNBQWMsQ0FBQyxJQUFmLENBQW9CLElBQXBCLEVBQXVCLENBQXZCLENBQVQsQ0FBQTtBQUFBLE1BQ0EsUUFBQSxHQUFXLE1BQU0sQ0FBQyxJQUFQLEdBQWMsSUFBQyxDQUFBLElBQUQsQ0FBTSxjQUFOLENBRHpCLENBQUE7QUFBQSxNQUVBLE9BQUEsR0FBVSxNQUFNLENBQUMsR0FBUCxHQUFhLElBQUMsQ0FBQSxJQUFELENBQU0sZUFBTixDQUZ2QixDQUFBO0FBR0EsTUFBQSxJQUFHLFFBQUEsSUFBWSxJQUFDLENBQUEsVUFBVSxDQUFDLEdBQUcsQ0FBQyxJQUE1QixJQUFvQyxRQUFBLElBQVksSUFBQyxDQUFBLFVBQVUsQ0FBQyxHQUFHLENBQUMsS0FBbkU7QUFDRSxRQUFBLElBQUEsR0FBTyxDQUFDLE1BQU0sQ0FBQyxJQUFQLEdBQWMsSUFBQyxDQUFBLFVBQVUsQ0FBQyxRQUFRLENBQUMsSUFBcEMsQ0FBQSxHQUE0QyxJQUFDLENBQUEsSUFBRCxDQUFNLGNBQU4sQ0FBbkQsQ0FBQTtBQUFBLFFBQ0EsSUFBQyxDQUFBLGFBQWEsQ0FBQyxNQUFmLEdBQXdCLElBQUMsQ0FBQSxVQUFVLENBQUMsTUFBTSxDQUFDLElBQW5CLEdBQTBCLElBRGxELENBREY7T0FBQSxNQUdLLElBQUcsUUFBQSxHQUFXLElBQUMsQ0FBQSxVQUFVLENBQUMsR0FBRyxDQUFDLElBQTlCO0FBQ0gsUUFBQSxJQUFDLENBQUEsYUFBYSxDQUFDLE1BQWYsR0FBd0IsSUFBQyxDQUFBLElBQUQsQ0FBTSxjQUFOLENBQUEsR0FBd0IsSUFBQyxDQUFBLElBQUQsQ0FBTSxRQUFOLENBQWhELENBREc7T0FBQSxNQUVBLElBQUcsUUFBQSxHQUFXLElBQUMsQ0FBQSxVQUFVLENBQUMsR0FBRyxDQUFDLEtBQTlCO0FBQ0gsUUFBQSxJQUFDLENBQUEsYUFBYSxDQUFDLE1BQWYsR0FBd0IsQ0FBeEIsQ0FERztPQVJMO0FBVUEsTUFBQSxJQUFHLE9BQUEsSUFBVyxJQUFDLENBQUEsVUFBVSxDQUFDLEdBQUcsQ0FBQyxHQUEzQixJQUFrQyxPQUFBLElBQVcsSUFBQyxDQUFBLFVBQVUsQ0FBQyxHQUFHLENBQUMsTUFBaEU7QUFDRSxRQUFBLEdBQUEsR0FBTSxDQUFDLE1BQU0sQ0FBQyxHQUFQLEdBQWEsSUFBQyxDQUFBLFVBQVUsQ0FBQyxRQUFRLENBQUMsR0FBbkMsQ0FBQSxHQUEwQyxJQUFDLENBQUEsSUFBRCxDQUFNLGVBQU4sQ0FBaEQsQ0FBQTtBQUFBLFFBQ0EsSUFBQyxDQUFBLGFBQWEsQ0FBQyxLQUFmLEdBQXVCLElBQUMsQ0FBQSxVQUFVLENBQUMsTUFBTSxDQUFDLEdBQW5CLEdBQXlCLEdBRGhELENBREY7T0FBQSxNQUdLLElBQUcsT0FBQSxHQUFVLElBQUMsQ0FBQSxVQUFVLENBQUMsR0FBRyxDQUFDLEdBQTdCO0FBQ0gsUUFBQSxJQUFDLENBQUEsYUFBYSxDQUFDLEtBQWYsR0FBdUIsSUFBQyxDQUFBLElBQUQsQ0FBTSxlQUFOLENBQUEsR0FBeUIsSUFBQyxDQUFBLElBQUQsQ0FBTSxTQUFOLENBQWhELENBREc7T0FBQSxNQUVBLElBQUcsT0FBQSxHQUFVLElBQUMsQ0FBQSxVQUFVLENBQUMsR0FBRyxDQUFDLE1BQTdCO0FBQ0gsUUFBQSxJQUFDLENBQUEsYUFBYSxDQUFDLEtBQWYsR0FBdUIsQ0FBdkIsQ0FERztPQWZMO0FBQUEsTUFpQkEsYUFBYSxDQUFDLElBQWQsQ0FBbUIsSUFBbkIsQ0FqQkEsQ0FERjtLQUFBO1dBbUJBLEtBcEJXO0VBQUEsQ0E5VmIsQ0FBQTs7QUFBQSxFQXVYQSxRQUFBLEdBQVcsU0FBQyxDQUFELEdBQUE7QUFDVCxJQUFBLElBQUMsQ0FBQSxVQUFELEdBQWMsS0FBZCxDQUFBO0FBQUEsSUFDQSxpQkFBaUIsQ0FBQyxJQUFsQixDQUF1QixJQUF2QixDQURBLENBQUE7V0FFQSxLQUhTO0VBQUEsQ0F2WFgsQ0FBQTs7QUFBQSxpQkFpWUEsTUFBQSxHQUFRLFNBQUEsR0FBQTtBQUNOLElBQUEsSUFBQyxDQUFBLGFBQWEsQ0FBQyxLQUFmLEdBQXdCLElBQUMsQ0FBQSxhQUFhLENBQUMsS0FBZixHQUF1QixJQUFDLENBQUEsYUFBYSxDQUFDLFNBQTlELENBQUE7QUFBQSxJQUNBLElBQUMsQ0FBQSxhQUFhLENBQUMsTUFBZixHQUF3QixDQUFBLElBQUcsQ0FBQSxJQUFELENBQU0sYUFBTixDQUFGLEdBQ3RCLENBQUMsSUFBQyxDQUFBLElBQUQsQ0FBTSxzQkFBTixDQUFBLEdBQWdDLENBQWpDLENBRkYsQ0FBQTtBQUFBLElBR0EsSUFBQyxDQUFBLGFBQWEsQ0FBQyxLQUFmLEdBQXdCLENBQUEsSUFBRyxDQUFBLElBQUQsQ0FBTSxZQUFOLENBQUYsR0FDdEIsQ0FBQyxJQUFDLENBQUEsSUFBRCxDQUFNLHVCQUFOLENBQUEsR0FBaUMsQ0FBbEMsQ0FKRixDQUFBO1dBS0EsaUJBQWlCLENBQUMsSUFBbEIsQ0FBdUIsSUFBdkIsRUFOTTtFQUFBLENBallSLENBQUE7O0FBQUEsaUJBNFlBLE9BQUEsR0FBUyxTQUFBLEdBQUE7QUFDUCxRQUFBLGFBQUE7QUFBQSxJQUFBLElBQUcsSUFBQyxDQUFBLGFBQWEsQ0FBQyxLQUFmLEdBQXVCLENBQTFCO0FBQ0UsTUFBQSxJQUFDLENBQUEsYUFBYSxDQUFDLEtBQWYsR0FBd0IsSUFBQyxDQUFBLGFBQWEsQ0FBQyxLQUFmLEdBQXVCLElBQUMsQ0FBQSxhQUFhLENBQUMsU0FBOUQsQ0FBQTtBQUFBLE1BQ0EsTUFBQSxHQUFTLENBQUEsSUFBRyxDQUFBLElBQUQsQ0FBTSxhQUFOLENBQUYsR0FBeUIsQ0FBQyxJQUFDLENBQUEsSUFBRCxDQUFNLHNCQUFOLENBQUEsR0FBZ0MsQ0FBakMsQ0FEbEMsQ0FBQTtBQUFBLE1BRUEsS0FBQSxHQUFTLENBQUEsSUFBRyxDQUFBLElBQUQsQ0FBTSxZQUFOLENBQUYsR0FBd0IsQ0FBQyxJQUFDLENBQUEsSUFBRCxDQUFNLHVCQUFOLENBQUEsR0FBaUMsQ0FBbEMsQ0FGakMsQ0FBQTtBQUdBLE1BQUEsSUFBRyxNQUFBLEdBQVMsQ0FBWjtBQUNFLFFBQUEsSUFBQyxDQUFBLGFBQWEsQ0FBQyxNQUFmLEdBQXdCLENBQXhCLENBREY7T0FBQSxNQUVLLElBQUcsTUFBQSxHQUFTLElBQUMsQ0FBQSxJQUFELENBQU0sY0FBTixDQUFBLEdBQXdCLElBQUMsQ0FBQSxJQUFELENBQU0sUUFBTixDQUFwQztBQUNILFFBQUEsSUFBQyxDQUFBLGFBQWEsQ0FBQyxNQUFmLEdBQXdCLElBQUMsQ0FBQSxJQUFELENBQU0sY0FBTixDQUFBLEdBQXdCLElBQUMsQ0FBQSxJQUFELENBQU0sUUFBTixDQUFoRCxDQURHO09BQUEsTUFBQTtBQUdILFFBQUEsSUFBQyxDQUFBLGFBQWEsQ0FBQyxNQUFmLEdBQXdCLE1BQXhCLENBSEc7T0FMTDtBQVNBLE1BQUEsSUFBRyxLQUFBLEdBQVEsQ0FBWDtBQUNFLFFBQUEsSUFBQyxDQUFBLGFBQWEsQ0FBQyxLQUFmLEdBQXVCLENBQXZCLENBREY7T0FBQSxNQUVLLElBQUcsS0FBQSxHQUFRLElBQUMsQ0FBQSxJQUFELENBQU0sZUFBTixDQUFBLEdBQXlCLElBQUMsQ0FBQSxJQUFELENBQU0sU0FBTixDQUFwQztBQUNILFFBQUEsSUFBQyxDQUFBLGFBQWEsQ0FBQyxLQUFmLEdBQXVCLElBQUMsQ0FBQSxJQUFELENBQU0sZUFBTixDQUFBLEdBQXlCLElBQUMsQ0FBQSxJQUFELENBQU0sU0FBTixDQUFoRCxDQURHO09BQUEsTUFBQTtBQUdILFFBQUEsSUFBQyxDQUFBLGFBQWEsQ0FBQyxLQUFmLEdBQXVCLEtBQXZCLENBSEc7T0FYTDthQWVBLGlCQUFpQixDQUFDLElBQWxCLENBQXVCLElBQXZCLEVBaEJGO0tBRE87RUFBQSxDQTVZVCxDQUFBOztBQUFBLEVBcWFBLGNBQUEsR0FBaUIsU0FBQSxHQUFBO1dBQ2YsSUFBQyxDQUFBLGdCQUFnQixDQUFDLElBQWxCLENBQXVCLEdBQUEsR0FBSSxNQUFNLENBQUMsV0FBWCxHQUF1QixHQUF2QixHQUEwQixNQUFNLENBQUMsYUFBeEQsRUFEZTtFQUFBLENBcmFqQixDQUFBOztBQUFBLEVBNGFBLGdCQUFBLEdBQW1CLFNBQUMsQ0FBRCxHQUFBO0FBQ2pCLFFBQUEsMENBQUE7QUFBQSxJQUFBLElBQUcsSUFBQyxDQUFBLEtBQUo7QUFFRSxNQUFBLEdBQUEsR0FBTSxDQUFDLENBQUMsS0FBRixHQUFVLElBQUMsQ0FBQSxTQUFTLENBQUMsTUFBWCxDQUFBLENBQW1CLENBQUMsSUFBcEMsQ0FBQTtBQUFBLE1BQ0EsR0FBQSxHQUFNLENBQUMsQ0FBQyxLQUFGLEdBQVUsSUFBQyxDQUFBLFNBQVMsQ0FBQyxNQUFYLENBQUEsQ0FBbUIsQ0FBQyxHQURwQyxDQUFBO0FBQUEsTUFFQSxJQUFBLEdBQU8sSUFBQyxDQUFBLEtBQUssQ0FBQyxLQUFQLENBQUEsQ0FGUCxDQUFBO0FBQUEsTUFHQSxJQUFBLEdBQU8sSUFBQyxDQUFBLEtBQUssQ0FBQyxNQUFQLENBQUEsQ0FIUCxDQUFBO0FBQUEsTUFJQSxJQUFBLEdBQU8sUUFBQSxDQUFTLElBQUMsQ0FBQSxLQUFLLENBQUMsR0FBUCxDQUFXLE1BQVgsQ0FBVCxDQUpQLENBQUE7QUFBQSxNQUtBLElBQUEsR0FBTyxRQUFBLENBQVMsSUFBQyxDQUFBLEtBQUssQ0FBQyxHQUFQLENBQVcsS0FBWCxDQUFULENBTFAsQ0FBQTtBQUFBLE1BTUEsR0FBQSxHQUFNLENBQUMsQ0FBQyxHQUFBLEdBQU0sSUFBSSxDQUFDLEdBQUwsQ0FBUyxJQUFULENBQVAsQ0FBQSxHQUF5QixJQUExQixDQUFBLEdBQWtDLEdBTnhDLENBQUE7QUFBQSxNQU9BLEdBQUEsR0FBTSxDQUFDLENBQUMsR0FBQSxHQUFNLElBQUksQ0FBQyxHQUFMLENBQVMsSUFBVCxDQUFQLENBQUEsR0FBeUIsSUFBMUIsQ0FBQSxHQUFrQyxHQVB4QyxDQUZGO0tBQUEsTUFBQTtBQVlFLE1BQUEsR0FBQSxHQUFNLENBQUMsQ0FBQyxDQUFDLEtBQUYsR0FBVSxJQUFDLENBQUEsU0FBUyxDQUFDLE1BQVgsQ0FBQSxDQUFtQixDQUFDLElBQS9CLENBQUEsR0FBdUMsSUFBQyxDQUFBLElBQUQsQ0FBTSxjQUFOLENBQTdDLENBQUE7QUFBQSxNQUNBLEdBQUEsR0FBTyxDQUFDLENBQUMsQ0FBQyxLQUFGLEdBQVUsSUFBQyxDQUFBLFNBQVMsQ0FBQyxNQUFYLENBQUEsQ0FBbUIsQ0FBQyxHQUEvQixDQUFBLEdBQXNDLElBQUMsQ0FBQSxJQUFELENBQU0sZUFBTixDQUQ3QyxDQVpGO0tBQUE7V0FjQSxDQUFDLEdBQUQsRUFBTSxHQUFOLEVBZmlCO0VBQUEsQ0E1YW5CLENBQUE7O0FBQUEsRUFrY0EsT0FBQSxHQUFVLFNBQUMsQ0FBRCxHQUFBO0FBRVIsUUFBQSxTQUFBO0FBQUEsSUFBQSxNQUFBLEdBQVMsSUFBQyxDQUFBLGdCQUFnQixDQUFDLElBQWxCLENBQXVCLEdBQUEsR0FBSSxNQUFNLENBQUMsYUFBbEMsQ0FBa0QsQ0FBQyxLQUFuRCxDQUFBLENBQVQsQ0FBQTtBQUNBLElBQUEsSUFBRyxjQUFjLENBQUMsSUFBZixDQUFvQixJQUFwQixDQUFzQixDQUFDLE1BQXZCLEdBQWdDLENBQW5DO0FBQ0UsTUFBQSxDQUFBLEdBQVEsSUFBQSxNQUFNLENBQUMsTUFBUCxDQUFjLElBQUMsQ0FBQSxTQUFmLEVBQTBCLE1BQU0sQ0FBQyxJQUFQLENBQVksYUFBWixDQUExQixDQUFSLENBQUE7QUFBQSxNQUNBLElBQUMsQ0FBQSxPQUFPLENBQUMsYUFBVCxDQUF1QixDQUF2QixFQUEwQixDQUExQixDQURBLENBQUE7QUFBQSxNQUVBLENBQUMsQ0FBQyxZQUFGLENBQUEsQ0FGQSxDQUFBO0FBQUEsTUFHQSxDQUFDLENBQUMsZUFBRixDQUFBLENBSEEsQ0FBQTtBQUFBLE1BSUEsY0FBYyxDQUFDLElBQWYsQ0FBb0IsSUFBcEIsQ0FBc0IsQ0FBQyxXQUF2QixDQUFtQyxNQUFNLENBQUMsYUFBMUMsQ0FKQSxDQURGO0tBREE7QUFRQSxJQUFBLElBQUcsQ0FBQSxDQUFFLENBQUMsQ0FBQyxNQUFKLENBQVcsQ0FBQyxRQUFaLENBQXFCLE1BQU0sQ0FBQyxvQkFBNUIsQ0FBSDtBQUNFLE1BQUEsSUFBQyxDQUFBLE9BQU8sQ0FBQyxXQUFULENBQXFCLENBQXJCLEVBQXdCLGdCQUFnQixDQUFDLElBQWpCLENBQXNCLElBQXRCLEVBQXlCLENBQXpCLENBQXhCLENBQUEsQ0FERjtLQVJBO0FBV0EsSUFBQSxJQUNFLENBQUEsQ0FBRSxDQUFDLENBQUMsTUFBSixDQUFXLENBQUMsUUFBWixDQUFxQixNQUFNLENBQUMsV0FBNUIsQ0FBQSxJQUNBLENBQUEsQ0FBRSxDQUFDLENBQUMsTUFBSixDQUFXLENBQUMsT0FBWixDQUFvQixHQUFBLEdBQUksTUFBTSxDQUFDLFdBQS9CLENBQTZDLENBQUMsTUFBOUMsR0FBdUQsQ0FGekQ7QUFJRSxNQUFBLElBQUcsQ0FBQSxDQUFFLENBQUMsQ0FBQyxNQUFKLENBQVcsQ0FBQyxRQUFaLENBQXFCLE1BQU0sQ0FBQyxXQUE1QixDQUFIO0FBQ0UsUUFBQSxNQUFBLEdBQVMsQ0FBQSxDQUFFLENBQUMsQ0FBQyxNQUFKLENBQVQsQ0FERjtPQUFBLE1BQUE7QUFHRSxRQUFBLE1BQUEsR0FBUyxDQUFBLENBQUUsQ0FBQyxDQUFDLE1BQUosQ0FBVyxDQUFDLE9BQVosQ0FBb0IsR0FBQSxHQUFJLE1BQU0sQ0FBQyxXQUEvQixDQUE2QyxDQUFDLEtBQTlDLENBQUEsQ0FBVCxDQUhGO09BQUE7QUFBQSxNQUlBLENBQUEsR0FBUSxJQUFBLE1BQU0sQ0FBQyxNQUFQLENBQWMsSUFBQyxDQUFBLFNBQWYsRUFBMEIsTUFBTSxDQUFDLElBQVAsQ0FBWSxhQUFaLENBQTFCLENBSlIsQ0FBQTtBQUFBLE1BS0EsSUFBQyxDQUFBLE9BQU8sQ0FBQyxXQUFULENBQXFCLENBQXJCLEVBQXdCLENBQXhCLENBTEEsQ0FKRjtLQVhBO1dBcUJBLEtBdkJRO0VBQUEsQ0FsY1YsQ0FBQTs7QUFBQSxFQTZkQSxTQUFBLEdBQVksU0FBQyxDQUFELEdBQUE7QUFDVixRQUFBLDBKQUFBO0FBQUEsSUFBQSxPQUFBLEdBQVUsSUFBQyxDQUFBLGdCQUFnQixDQUFDLElBQWxCLENBQXVCLEdBQUEsR0FBSSxNQUFNLENBQUMsV0FBWCxHQUF1QixHQUF2QixHQUEwQixNQUFNLENBQUMsYUFBeEQsQ0FBVixDQUFBO0FBRUEsSUFBQSxJQUFHLE9BQU8sQ0FBQyxNQUFSLEdBQWlCLENBQXBCO0FBS0UsTUFBQSxNQUFBLEdBQVMsT0FBTyxDQUFDLEtBQVIsQ0FBQSxDQUFULENBQUE7QUFJQSxNQUFBLElBQ0UsSUFBSSxDQUFDLEdBQUwsQ0FBUyxDQUFDLENBQUMsS0FBRixHQUFVLE1BQU0sQ0FBQyxJQUFQLENBQVksbUJBQVosQ0FBbkIsQ0FBQSxHQUF1RCxDQUF2RCxJQUNBLElBQUksQ0FBQyxHQUFMLENBQVMsQ0FBQyxDQUFDLEtBQUYsR0FBVSxNQUFNLENBQUMsSUFBUCxDQUFZLG1CQUFaLENBQW5CLENBQUEsR0FBdUQsQ0FGekQ7QUFJRSxRQUFBLElBQUMsQ0FBQSxTQUFTLENBQUMsSUFBWCxDQUFnQixHQUFBLEdBQUcsQ0FBQyxNQUFNLENBQUMsSUFBUCxDQUFZLGNBQVosQ0FBRCxDQUFuQixDQUFrRCxDQUFDLFdBQW5ELENBQStELFFBQS9ELENBQUEsQ0FKRjtPQUpBO0FBQUEsTUFZQSxTQUFBLEdBQWdCLENBQUMsQ0FBQyxLQUFGLEdBQVUsSUFBQyxDQUFBLFNBQVMsQ0FBQyxNQUFYLENBQUEsQ0FBbUIsQ0FBQyxJQVo5QyxDQUFBO0FBQUEsTUFhQSxRQUFBLEdBQWdCLENBQUMsQ0FBQyxLQUFGLEdBQVUsSUFBQyxDQUFBLFNBQVMsQ0FBQyxNQUFYLENBQUEsQ0FBbUIsQ0FBQyxHQWI5QyxDQUFBO0FBQUEsTUFjQSxTQUFBLEdBQWdCLElBQUMsQ0FBQSxTQUFTLENBQUMsS0FBWCxDQUFBLENBZGhCLENBQUE7QUFBQSxNQWVBLFVBQUEsR0FBZ0IsSUFBQyxDQUFBLFNBQVMsQ0FBQyxNQUFYLENBQUEsQ0FmaEIsQ0FBQTtBQUFBLE1BZ0JBLFVBQUEsR0FBZ0IsU0FBQSxHQUFZLENBQUMsTUFBTSxDQUFDLFVBQVAsQ0FBQSxDQUFBLEdBQXNCLENBQXZCLENBaEI1QixDQUFBO0FBQUEsTUFpQkEsU0FBQSxHQUFnQixRQUFBLEdBQVcsQ0FBQyxNQUFNLENBQUMsV0FBUCxDQUFBLENBQUEsR0FBdUIsQ0FBeEIsQ0FqQjNCLENBQUE7QUFBQSxNQWtCQSxXQUFBLEdBQWdCLFNBQUEsR0FBWSxDQUFDLE1BQU0sQ0FBQyxVQUFQLENBQUEsQ0FBQSxHQUFzQixDQUF2QixDQWxCNUIsQ0FBQTtBQUFBLE1BbUJBLFlBQUEsR0FBZ0IsUUFBQSxHQUFXLENBQUMsTUFBTSxDQUFDLFdBQVAsQ0FBQSxDQUFBLEdBQXVCLENBQXhCLENBbkIzQixDQUFBO0FBQUEsTUFvQkEsV0FBQSxHQUFnQixNQUFNLENBQUMsVUFBUCxDQUFBLENBcEJoQixDQUFBO0FBQUEsTUFxQkEsWUFBQSxHQUFnQixNQUFNLENBQUMsV0FBUCxDQUFBLENBckJoQixDQUFBO0FBMEJBLE1BQUEsSUFBRyxVQUFBLElBQWMsQ0FBakI7QUFDRSxRQUFBLE9BQUEsR0FBVSxDQUFWLENBREY7T0FBQSxNQUVLLElBQUcsV0FBQSxHQUFjLFNBQWpCO0FBQ0gsUUFBQSxPQUFBLEdBQVUsVUFBVixDQURHO09BQUEsTUFBQTtBQUdILFFBQUEsT0FBQSxHQUFVLFNBQUEsR0FBWSxXQUF0QixDQUhHO09BNUJMO0FBb0NBLE1BQUEsSUFBRyxTQUFBLElBQWEsQ0FBaEI7QUFDRSxRQUFBLE9BQUEsR0FBVSxDQUFWLENBREY7T0FBQSxNQUVLLElBQUcsWUFBQSxHQUFlLFVBQWxCO0FBQ0gsUUFBQSxPQUFBLEdBQVUsU0FBVixDQURHO09BQUEsTUFBQTtBQUdILFFBQUEsT0FBQSxHQUFVLFVBQUEsR0FBYSxZQUF2QixDQUhHO09BdENMO2FBNkNBLE1BQU0sQ0FBQyxHQUFQLENBQ0U7QUFBQSxRQUFBLElBQUEsRUFBTSxPQUFOO0FBQUEsUUFDQSxHQUFBLEVBQUssT0FETDtPQURGLEVBbERGO0tBSFU7RUFBQSxDQTdkWixDQUFBOztjQUFBOztJQTlCRixDQUFBOztBQUFBLE1Bb2pCWSxDQUFDO0FBRUUsRUFBQSxnQkFBQyxVQUFELEVBQWEsRUFBYixHQUFBO0FBR1gsSUFIWSxJQUFDLENBQUEsWUFBRCxVQUdaLENBQUE7QUFBQSx5Q0FBQSxDQUFBO0FBQUEseUNBQUEsQ0FBQTtBQUFBLHFEQUFBLENBQUE7QUFBQSxtQ0FBQSxDQUFBO0FBQUEsbURBQUEsQ0FBQTtBQUFBLHlEQUFBLENBQUE7QUFBQSwyREFBQSxDQUFBO0FBQUEsdURBQUEsQ0FBQTtBQUFBLHVEQUFBLENBQUE7QUFBQSxtREFBQSxDQUFBO0FBQUEsbURBQUEsQ0FBQTtBQUFBLHlEQUFBLENBQUE7QUFBQSxtREFBQSxDQUFBO0FBQUEsMkNBQUEsQ0FBQTtBQUFBLGlDQUFBLENBQUE7QUFBQSw2Q0FBQSxDQUFBO0FBQUEsdUNBQUEsQ0FBQTtBQUFBLDZEQUFBLENBQUE7QUFBQSw2Q0FBQSxDQUFBO0FBQUEsSUFBQSxJQUFDLENBQUEsZ0JBQUQsR0FBb0IsSUFBQyxDQUFBLFNBQVMsQ0FBQyxJQUFYLENBQWdCLEdBQUEsR0FBSSxNQUFNLENBQUMsb0JBQTNCLENBQXBCLENBQUE7QUFDQSxJQUFBLElBQUcsSUFBQyxDQUFBLFNBQVMsQ0FBQyxJQUFYLENBQWdCLEdBQUEsR0FBSSxNQUFNLENBQUMsY0FBWCxHQUEwQixRQUExQyxDQUFrRCxDQUFDLE1BQW5ELEdBQTRELENBQS9EO0FBQ0UsTUFBQSxJQUFDLENBQUEsS0FBRCxHQUFTLElBQUMsQ0FBQSxTQUFTLENBQUMsSUFBWCxDQUFnQixHQUFBLEdBQUksTUFBTSxDQUFDLGNBQVgsR0FBMEIsUUFBMUMsQ0FBa0QsQ0FBQyxLQUFuRCxDQUFBLENBQVQsQ0FERjtLQURBO0FBQUEsSUFLQSxJQUFDLENBQUEsTUFBRCxHQUFVLElBQUMsQ0FBQSxnQkFBZ0IsQ0FBQyxJQUFsQixDQUNSLEdBQUEsR0FBSSxNQUFNLENBQUMsV0FBWCxHQUF1QixnQkFBdkIsR0FBdUMsRUFBdkMsR0FBMEMsSUFEbEMsQ0FFVCxDQUFDLEtBRlEsQ0FBQSxDQUxWLENBQUE7QUFBQSxJQVVBLElBVkEsQ0FIVztFQUFBLENBQWI7O0FBQUEsRUFpQkEsTUFBQyxDQUFBLE1BQUQsR0FBUyxTQUFDLE9BQUQsR0FBQTtBQUVQLFFBQUEsMkdBQUE7QUFBQSxJQUFBLFNBQUEsR0FBWSxPQUFPLENBQUMsU0FBcEIsQ0FBQTtBQUFBLElBQ0EsZ0JBQUEsR0FBbUIsU0FBUyxDQUFDLElBQVYsQ0FBZSxHQUFBLEdBQUksTUFBTSxDQUFDLG9CQUExQixDQUFpRCxDQUFDLEtBQWxELENBQUEsQ0FEbkIsQ0FBQTtBQUdBLElBQUEsSUFBQSxDQUFBLE9BQXlELENBQUMsUUFBMUQ7QUFBQSxNQUFBLE9BQU8sQ0FBQyxRQUFSLEdBQW1CLE1BQU0sQ0FBQyxZQUFQLENBQW9CLEVBQXBCLENBQW5CLENBQUE7S0FIQTtBQUlBLElBQUEsSUFBRyxPQUFPLENBQUMsS0FBWDtBQUFzQixNQUFBLEtBQUEsR0FBUSxPQUFPLENBQUMsS0FBaEIsQ0FBdEI7S0FBQSxNQUFBO0FBQWlELE1BQUEsS0FBQSxHQUFRLFNBQVIsQ0FBakQ7S0FKQTtBQUFBLElBTUEsSUFBQSxHQUFPLENBQUMsQ0FBQyxVQUFBLENBQVcsT0FBTyxDQUFDLE1BQU8sQ0FBQSxDQUFBLENBQTFCLENBQUEsR0FBZ0MsR0FBakMsQ0FBQSxHQUF3QyxTQUFTLENBQUMsS0FBVixDQUFBLENBQXpDLENBQUEsR0FBOEQsRUFOckUsQ0FBQTtBQUFBLElBT0EsR0FBQSxHQUFNLENBQUMsQ0FBQyxVQUFBLENBQVcsT0FBTyxDQUFDLE1BQU8sQ0FBQSxDQUFBLENBQTFCLENBQUEsR0FBZ0MsR0FBakMsQ0FBQSxHQUF3QyxTQUFTLENBQUMsTUFBVixDQUFBLENBQXpDLENBQUEsR0FBK0QsRUFQckUsQ0FBQTtBQUFBLElBU0EsZ0JBQWdCLENBQUMsTUFBakIsQ0FDRSxDQUFBLENBQUUsYUFBRixDQUNFLENBQUMsUUFESCxDQUNZLE1BQU0sQ0FBQyxXQURuQixDQUVFLENBQUMsSUFGSCxDQUdJO0FBQUEsTUFBQSxhQUFBLEVBQWUsT0FBTyxDQUFDLFFBQXZCO0FBQUEsTUFDQSxVQUFBLEVBQVksT0FBTyxDQUFDLE1BQU8sQ0FBQSxDQUFBLENBRDNCO0FBQUEsTUFFQSxVQUFBLEVBQVksT0FBTyxDQUFDLE1BQU8sQ0FBQSxDQUFBLENBRjNCO0tBSEosQ0FNRSxDQUFDLEdBTkgsQ0FPSTtBQUFBLE1BQUEsSUFBQSxFQUFTLElBQUQsR0FBTSxJQUFkO0FBQUEsTUFDQSxHQUFBLEVBQVEsR0FBRCxHQUFLLElBRFo7QUFBQSxNQUVBLGVBQUEsRUFBaUIsS0FGakI7S0FQSixDQURGLENBVEEsQ0FBQTtBQUFBLElBc0JBLE1BQUEsR0FBUyxnQkFBZ0IsQ0FBQyxJQUFqQixDQUFzQixHQUFBLEdBQUksTUFBTSxDQUFDLFdBQWpDLENBQStDLENBQUMsSUFBaEQsQ0FBQSxDQXRCVCxDQUFBO0FBd0JBLElBQUEsSUFBRyxPQUFPLENBQUMsRUFBWDtBQUNFLE1BQUEsTUFBTSxDQUFDLElBQVAsQ0FBWTtBQUFBLFFBQUEsU0FBQSxFQUFXLE9BQU8sQ0FBQyxFQUFuQjtPQUFaLENBQUEsQ0FERjtLQXhCQTtBQTBCQSxJQUFBLElBQUcsT0FBTyxDQUFDLE9BQUQsQ0FBVjtBQUNFLE1BQUEsTUFBTSxDQUFDLFFBQVAsQ0FBZ0IsT0FBTyxDQUFDLE9BQUQsQ0FBdkIsQ0FBQSxDQURGO0tBMUJBO0FBNEJBLElBQUEsSUFBRyxPQUFPLENBQUMsSUFBWDtBQUNFLE1BQUEsTUFBTSxDQUFDLElBQVAsQ0FBWSxPQUFPLENBQUMsSUFBcEIsQ0FBQSxDQURGO0tBNUJBO0FBOEJBLElBQUEsSUFBRyxPQUFPLENBQUMsSUFBWDtBQUNFLE1BQUEsTUFBTSxDQUFDLEdBQVAsQ0FDRTtBQUFBLFFBQUEsS0FBQSxFQUFVLE9BQU8sQ0FBQyxJQUFULEdBQWMsSUFBdkI7QUFBQSxRQUNBLE1BQUEsRUFBVyxPQUFPLENBQUMsSUFBVCxHQUFjLElBRHhCO09BREYsQ0FBQSxDQURGO0tBOUJBO0FBbUNBLElBQUEsSUFBRyxPQUFPLENBQUMsU0FBWDtBQUNFLE1BQUEsTUFBTSxDQUFDLFFBQVAsQ0FBZ0IsV0FBaEIsQ0FBQSxDQUFBO0FBQUEsTUFDQSxNQUFNLENBQUMsRUFBUCxDQUFVLFdBQVYsRUFBdUIsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUMsQ0FBRCxHQUFBO0FBQ3JCLFVBQUEsSUFBRyxDQUFDLENBQUMsS0FBRixLQUFXLENBQWQ7QUFDRSxZQUFBLE1BQUEsR0FBUyxDQUFBLENBQUUsQ0FBQyxDQUFDLE1BQUosQ0FBVyxDQUFDLE9BQVosQ0FBb0IsR0FBQSxHQUFJLE1BQU0sQ0FBQyxXQUEvQixDQUFULENBQUE7QUFBQSxZQUNBLE1BQU0sQ0FBQyxRQUFQLENBQWdCLE1BQU0sQ0FBQyxhQUF2QixDQURBLENBQUE7bUJBRUEsTUFBTSxDQUFDLElBQVAsQ0FDRTtBQUFBLGNBQUEsbUJBQUEsRUFBcUIsQ0FBQyxDQUFDLEtBQXZCO0FBQUEsY0FDQSxtQkFBQSxFQUFxQixDQUFDLENBQUMsS0FEdkI7YUFERixFQUhGO1dBRHFCO1FBQUEsRUFBQTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBdkIsQ0FEQSxDQURGO0tBbkNBO0FBNkNBLElBQUEsSUFBRyxPQUFPLENBQUMsT0FBWDtBQUNFLE1BQUEsRUFBQSxHQUFLLE1BQU0sQ0FBQyxZQUFQLENBQW9CLEVBQXBCLENBQUwsQ0FBQTtBQUFBLE1BRUEsT0FBQSxHQUFVLE9BQU8sQ0FBQyxPQUZsQixDQUFBO0FBR0EsTUFBQSxJQUFHLE9BQU8sQ0FBQyxRQUFYO0FBQXlCLFFBQUEsUUFBQSxHQUFXLE9BQU8sQ0FBQyxRQUFuQixDQUF6QjtPQUFBLE1BQUE7QUFBMEQsUUFBQSxRQUFBLEdBQVcsS0FBWCxDQUExRDtPQUhBO0FBSUEsTUFBQSxJQUFHLE9BQU8sQ0FBQyxLQUFYO0FBQXNCLFFBQUEsS0FBQSxHQUFRLElBQVIsQ0FBdEI7T0FBQSxNQUFBO0FBQXdDLFFBQUEsS0FBQSxHQUFRLEtBQVIsQ0FBeEM7T0FKQTtBQUtBLE1BQUEsSUFBRyxLQUFBLEtBQVMsSUFBWjtBQUFzQixRQUFBLFVBQUEsR0FBYSxPQUFiLENBQXRCO09BQUEsTUFBQTtBQUFnRCxRQUFBLFVBQUEsR0FBYSxFQUFiLENBQWhEO09BTEE7QUFBQSxNQU1BLE9BQUEsR0FBYSxNQUFNLENBQUMsWUFBUixHQUFxQixHQUFyQixHQUF3QixRQUF4QixHQUFpQyxHQUFqQyxHQUFvQyxVQU5oRCxDQUFBO0FBQUEsTUFRQSxTQUFTLENBQUMsSUFBVixDQUFlLEdBQUEsR0FBSSxNQUFNLENBQUMscUJBQTFCLENBQWtELENBQUMsTUFBbkQsQ0FBMEQsZUFBQSxHQUMxQyxPQUQwQyxHQUNsQyxlQURrQyxHQUNyQixFQURxQixHQUNsQix3QkFEa0IsR0FFckMsUUFGcUMsR0FFNUIsV0FGNEIsR0FHbEQsT0FBTyxDQUFDLElBSDBDLEdBR3JDLFVBSHJCLENBUkEsQ0FBQTtBQWVBLE1BQUEsSUFBRyxPQUFPLENBQUMsT0FBWDtBQUNFLFFBQUEsU0FBUyxDQUFDLElBQVYsQ0FBZSxHQUFBLEdBQUksTUFBTSxDQUFDLFlBQTFCLENBQXlDLENBQUMsSUFBMUMsQ0FBQSxDQUFnRCxDQUFDLElBQWpELENBQ0U7QUFBQSxVQUFBLGVBQUEsRUFBaUIsT0FBTyxDQUFDLE9BQXpCO1NBREYsQ0FBQSxDQURGO09BZkE7QUFrQkEsTUFBQSxJQUFHLE9BQU8sQ0FBQyxPQUFYO0FBQ0UsUUFBQSxTQUFTLENBQUMsSUFBVixDQUFlLEdBQUEsR0FBSSxNQUFNLENBQUMsWUFBMUIsQ0FBeUMsQ0FBQyxJQUExQyxDQUFBLENBQWdELENBQUMsSUFBakQsQ0FDRTtBQUFBLFVBQUEsZUFBQSxFQUFpQixPQUFPLENBQUMsT0FBekI7U0FERixDQUFBLENBREY7T0FsQkE7QUFBQSxNQXFCQSxNQUFNLENBQUMsSUFBUCxDQUFZLGNBQVosRUFBNEIsT0FBQSxHQUFRLEVBQXBDLENBckJBLENBQUE7QUFBQSxNQXNCQSxDQUFBLEdBQVEsSUFBQSxNQUFNLENBQUMsTUFBUCxDQUFjLFNBQWQsRUFBeUIsT0FBTyxDQUFDLFFBQWpDLENBdEJSLENBQUE7QUFBQSxNQXVCQSxDQUFDLENBQUMsZUFBRixDQUFBLENBdkJBLENBQUE7YUF3QkEsRUF6QkY7S0EvQ087RUFBQSxDQWpCVCxDQUFBOztBQUFBLG1CQTZGQSxRQUFBLEdBQVUsU0FBQSxHQUFBO0FBQ1IsUUFBQSwwQ0FBQTtBQUFBLElBQUEsR0FBQSxHQUFNLElBQUMsQ0FBQSxNQUFNLENBQUMsUUFBUixDQUFBLENBQWtCLENBQUMsSUFBbkIsR0FBMEIsQ0FBQyxJQUFDLENBQUEsTUFBTSxDQUFDLFVBQVIsQ0FBQSxDQUFBLEdBQXVCLENBQXhCLENBQWhDLENBQUE7QUFBQSxJQUNBLEdBQUEsR0FBTSxJQUFDLENBQUEsTUFBTSxDQUFDLFFBQVIsQ0FBQSxDQUFrQixDQUFDLEdBQW5CLEdBQXlCLENBQUMsSUFBQyxDQUFBLE1BQU0sQ0FBQyxXQUFSLENBQUEsQ0FBQSxHQUF3QixDQUF6QixDQUQvQixDQUFBO0FBRUEsSUFBQSxJQUFHLElBQUMsQ0FBQSxLQUFKO0FBQ0UsTUFBQSxJQUFBLEdBQU8sSUFBQyxDQUFBLEtBQUssQ0FBQyxLQUFQLENBQUEsQ0FBUCxDQUFBO0FBQUEsTUFDQSxJQUFBLEdBQU8sSUFBQyxDQUFBLEtBQUssQ0FBQyxNQUFQLENBQUEsQ0FEUCxDQUFBO0FBQUEsTUFFQSxJQUFBLEdBQU8sUUFBQSxDQUFTLElBQUMsQ0FBQSxLQUFLLENBQUMsR0FBUCxDQUFXLE1BQVgsQ0FBVCxDQUZQLENBQUE7QUFBQSxNQUdBLElBQUEsR0FBTyxRQUFBLENBQVMsSUFBQyxDQUFBLEtBQUssQ0FBQyxHQUFQLENBQVcsS0FBWCxDQUFULENBSFAsQ0FBQTtBQUFBLE1BSUEsR0FBQSxHQUFNLENBQUMsQ0FBQyxHQUFBLEdBQU0sSUFBSSxDQUFDLEdBQUwsQ0FBUyxJQUFULENBQVAsQ0FBQSxHQUF5QixJQUExQixDQUFBLEdBQWtDLEdBSnhDLENBQUE7QUFBQSxNQUtBLEdBQUEsR0FBTSxDQUFDLENBQUMsR0FBQSxHQUFNLElBQUksQ0FBQyxHQUFMLENBQVMsSUFBVCxDQUFQLENBQUEsR0FBeUIsSUFBMUIsQ0FBQSxHQUFrQyxHQUx4QyxDQURGO0tBQUEsTUFBQTtBQVFFLE1BQUEsR0FBQSxHQUFNLENBQUMsR0FBQSxHQUFNLElBQUMsQ0FBQSxTQUFTLENBQUMsS0FBWCxDQUFBLENBQVAsQ0FBQSxHQUE2QixHQUFuQyxDQUFBO0FBQUEsTUFDQSxHQUFBLEdBQU0sQ0FBQyxHQUFBLEdBQU0sSUFBQyxDQUFBLFNBQVMsQ0FBQyxNQUFYLENBQUEsQ0FBUCxDQUFBLEdBQThCLEdBRHBDLENBUkY7S0FGQTtXQVlBLENBQUMsR0FBRCxFQUFNLEdBQU4sRUFiUTtFQUFBLENBN0ZWLENBQUE7O0FBQUEsbUJBNEdBLGdCQUFBLEdBQWtCLFNBQUEsR0FBQTtBQUNoQixRQUFBLGtCQUFBO0FBQUEsSUFBQSxHQUFBLEdBQU0sSUFBQyxDQUFBLE1BQU0sQ0FBQyxRQUFSLENBQUEsQ0FBa0IsQ0FBQyxJQUFuQixHQUEwQixDQUFDLElBQUMsQ0FBQSxNQUFNLENBQUMsVUFBUixDQUFBLENBQUEsR0FBdUIsQ0FBeEIsQ0FBaEMsQ0FBQTtBQUFBLElBQ0EsR0FBQSxHQUFNLElBQUMsQ0FBQSxNQUFNLENBQUMsUUFBUixDQUFBLENBQWtCLENBQUMsR0FBbkIsR0FBeUIsQ0FBQyxJQUFDLENBQUEsTUFBTSxDQUFDLFdBQVIsQ0FBQSxDQUFBLEdBQXdCLENBQXpCLENBRC9CLENBQUE7QUFBQSxJQUVBLEdBQUEsR0FBTSxDQUFDLEdBQUEsR0FBTSxJQUFDLENBQUEsU0FBUyxDQUFDLEtBQVgsQ0FBQSxDQUFQLENBQUEsR0FBNkIsR0FGbkMsQ0FBQTtBQUFBLElBR0EsR0FBQSxHQUFNLENBQUMsR0FBQSxHQUFNLElBQUMsQ0FBQSxTQUFTLENBQUMsTUFBWCxDQUFBLENBQVAsQ0FBQSxHQUE4QixHQUhwQyxDQUFBO1dBSUEsQ0FBQyxHQUFELEVBQU0sR0FBTixFQUxnQjtFQUFBLENBNUdsQixDQUFBOztBQUFBLG1CQXFIQSxLQUFBLEdBQU8sU0FBQSxHQUFBO1dBQ0wsSUFBQyxDQUFBLE1BQU0sQ0FBQyxHQUFSLENBQVksaUJBQVosRUFESztFQUFBLENBckhQLENBQUE7O0FBQUEsbUJBd0hBLFFBQUEsR0FBVSxTQUFBLEdBQUE7V0FDUixJQUFDLENBQUEsTUFBTSxDQUFDLElBQVIsQ0FBYSxhQUFiLEVBRFE7RUFBQSxDQXhIVixDQUFBOztBQUFBLG1CQTJIQSxFQUFBLEdBQUksU0FBQSxHQUFBO1dBQ0YsSUFBQyxDQUFBLE1BQU0sQ0FBQyxJQUFSLENBQWEsU0FBYixFQURFO0VBQUEsQ0EzSEosQ0FBQTs7QUFBQSxtQkFnSUEsT0FBQSxHQUFTLFNBQUEsR0FBQTtBQUNQLFFBQUEsT0FBQTtBQUFBLElBQUEsT0FBQSxHQUFVLElBQUMsQ0FBQSxTQUFTLENBQUMsSUFBWCxDQUFnQixHQUFBLEdBQUcsQ0FBQyxJQUFDLENBQUEsTUFBTSxDQUFDLElBQVIsQ0FBYSxjQUFiLENBQUQsQ0FBbkIsQ0FBVixDQUFBO0FBQ0EsSUFBQSxJQUFHLE9BQU8sQ0FBQyxNQUFSLEdBQWlCLENBQXBCO2FBQTJCLFFBQTNCO0tBQUEsTUFBQTthQUF3QyxLQUF4QztLQUZPO0VBQUEsQ0FoSVQsQ0FBQTs7QUFBQSxtQkFvSUEsV0FBQSxHQUFhLFNBQUEsR0FBQTtBQUNYLElBQUEsSUFBRyxJQUFDLENBQUEsT0FBRCxDQUFBLENBQUEsSUFBYyxJQUFDLENBQUEsT0FBRCxDQUFBLENBQVUsQ0FBQyxNQUFYLEdBQW9CLENBQXJDO2FBQTRDLElBQUMsQ0FBQSxPQUFELENBQUEsQ0FBVSxDQUFDLElBQVgsQ0FBQSxFQUE1QztLQUFBLE1BQUE7YUFBbUUsS0FBbkU7S0FEVztFQUFBLENBcEliLENBQUE7O0FBQUEsbUJBdUlBLGNBQUEsR0FBZ0IsU0FBQSxHQUFBO1dBQ2QsSUFBQyxDQUFBLE9BQUQsQ0FBQSxDQUFBLElBQWMsSUFBQyxDQUFBLE9BQUQsQ0FBQSxDQUFVLENBQUMsUUFBWCxDQUFvQixRQUFwQixFQURBO0VBQUEsQ0F2SWhCLENBQUE7O0FBQUEsbUJBMElBLFdBQUEsR0FBYSxTQUFBLEdBQUE7QUFDWCxJQUFBLElBQWlDLElBQUMsQ0FBQSxjQUFELENBQUEsQ0FBakM7YUFBQSxJQUFDLENBQUEsT0FBRCxDQUFBLENBQVUsQ0FBQyxRQUFYLENBQW9CLFFBQXBCLEVBQUE7S0FEVztFQUFBLENBMUliLENBQUE7O0FBQUEsbUJBNklBLFdBQUEsR0FBYSxTQUFBLEdBQUE7QUFDWCxJQUFBLElBQWlDLElBQUMsQ0FBQSxPQUFELENBQUEsQ0FBQSxJQUFjLENBQUEsSUFBRSxDQUFBLGNBQUQsQ0FBQSxDQUFoRDtBQUFBLE1BQUEsSUFBQyxDQUFBLE9BQUQsQ0FBQSxDQUFVLENBQUMsUUFBWCxDQUFvQixRQUFwQixDQUFBLENBQUE7S0FBQTtXQUNBLElBQUMsQ0FBQSxhQUFELENBQUEsRUFGVztFQUFBLENBN0liLENBQUE7O0FBQUEsbUJBaUpBLGFBQUEsR0FBZSxTQUFBLEdBQUE7QUFDYixJQUFBLElBQW9DLElBQUMsQ0FBQSxjQUFELENBQUEsQ0FBcEM7YUFBQSxJQUFDLENBQUEsT0FBRCxDQUFBLENBQVUsQ0FBQyxXQUFYLENBQXVCLFFBQXZCLEVBQUE7S0FEYTtFQUFBLENBakpmLENBQUE7O0FBQUEsbUJBb0pBLGFBQUEsR0FBZSxTQUFBLEdBQUE7QUFDYixRQUFBLHVMQUFBO0FBQUEsSUFBQSxPQUFBLEdBQVUsSUFBQyxDQUFBLFNBQVMsQ0FBQyxJQUFYLENBQWdCLEdBQUEsR0FBRyxDQUFDLElBQUMsQ0FBQSxNQUFNLENBQUMsSUFBUixDQUFhLGNBQWIsQ0FBRCxDQUFuQixDQUFWLENBQUE7QUFBQSxJQUNBLGFBQUEsR0FBaUIsVUFBQSxDQUFXLElBQUMsQ0FBQSxnQkFBRCxDQUFBLENBQW9CLENBQUEsQ0FBQSxDQUFwQixHQUF5QixHQUFwQyxDQUFBLEdBQTJDLElBQUMsQ0FBQSxTQUFTLENBQUMsS0FBWCxDQUFBLENBRDVELENBQUE7QUFBQSxJQUVBLGFBQUEsR0FBaUIsVUFBQSxDQUFXLElBQUMsQ0FBQSxnQkFBRCxDQUFBLENBQW9CLENBQUEsQ0FBQSxDQUFwQixHQUF5QixHQUFwQyxDQUFBLEdBQTJDLElBQUMsQ0FBQSxTQUFTLENBQUMsTUFBWCxDQUFBLENBRjVELENBQUE7QUFBQSxJQUdBLE1BQUEsR0FBUyxPQUFPLENBQUMsVUFBUixDQUFBLENBSFQsQ0FBQTtBQUFBLElBSUEsVUFBQSxHQUFhLE1BQUEsR0FBUyxDQUp0QixDQUFBO0FBQUEsSUFLQSxPQUFBLEdBQVUsT0FBTyxDQUFDLFdBQVIsQ0FBQSxDQUxWLENBQUE7QUFBQSxJQU1BLFdBQUEsR0FBYyxPQUFBLEdBQVUsQ0FOeEIsQ0FBQTtBQUFBLElBT0EsTUFBQSxHQUFTLElBQUMsQ0FBQSxTQUFTLENBQUMsS0FBWCxDQUFBLENBUFQsQ0FBQTtBQUFBLElBUUEsT0FBQSxHQUFVLElBQUMsQ0FBQSxTQUFTLENBQUMsTUFBWCxDQUFBLENBUlYsQ0FBQTtBQUFBLElBU0EsTUFBQSxHQUFTLElBQUMsQ0FBQSxNQUFNLENBQUMsVUFBUixDQUFBLENBVFQsQ0FBQTtBQUFBLElBVUEsVUFBQSxHQUFhLE1BQUEsR0FBUyxDQVZ0QixDQUFBO0FBQUEsSUFXQSxPQUFBLEdBQVUsSUFBQyxDQUFBLE1BQU0sQ0FBQyxXQUFSLENBQUEsQ0FYVixDQUFBO0FBQUEsSUFZQSxXQUFBLEdBQWMsT0FBQSxHQUFVLENBWnhCLENBQUE7QUFBQSxJQWFBLE1BQUEsR0FBUyxDQWJULENBQUE7QUFBQSxJQWNBLE9BQUEsR0FBVSxRQUFBLENBQVMsT0FBTyxDQUFDLElBQVIsQ0FBYSxlQUFiLENBQVQsQ0FkVixDQUFBO0FBZUEsSUFBQSxJQUFBLENBQUEsT0FBQTtBQUFBLE1BQUEsT0FBQSxHQUFVLENBQVYsQ0FBQTtLQWZBO0FBQUEsSUFnQkEsT0FBQSxHQUFVLFFBQUEsQ0FBUyxPQUFPLENBQUMsSUFBUixDQUFhLGVBQWIsQ0FBVCxDQWhCVixDQUFBO0FBaUJBLElBQUEsSUFBQSxDQUFBLE9BQUE7QUFBQSxNQUFBLE9BQUEsR0FBVSxDQUFWLENBQUE7S0FqQkE7QUFrQkEsWUFBTyxPQUFPLENBQUMsSUFBUixDQUFhLGVBQWIsQ0FBUDtBQUFBLFdBQ08sS0FEUDtBQUVJLFFBQUEsUUFBQSxHQUFXLGFBQUEsR0FBZ0IsVUFBM0IsQ0FBQTtBQUFBLFFBQ0EsT0FBQSxHQUFVLGFBQUEsR0FBZ0IsT0FBaEIsR0FBMEIsV0FBMUIsR0FBd0MsTUFEbEQsQ0FGSjtBQUNPO0FBRFAsV0FJTyxPQUpQO0FBS0ksUUFBQSxRQUFBLEdBQVcsYUFBQSxHQUFnQixVQUFoQixHQUE2QixNQUF4QyxDQUFBO0FBQUEsUUFDQSxPQUFBLEdBQVUsYUFBQSxHQUFnQixXQUQxQixDQUxKO0FBSU87QUFKUCxXQU9PLFFBUFA7QUFRSSxRQUFBLFFBQUEsR0FBVyxhQUFBLEdBQWdCLFVBQTNCLENBQUE7QUFBQSxRQUNBLE9BQUEsR0FBVSxhQUFBLEdBQWdCLFdBQWhCLEdBQThCLE1BRHhDLENBUko7QUFPTztBQVBQLFdBVU8sTUFWUDtBQVdJLFFBQUEsUUFBQSxHQUFXLGFBQUEsR0FBZ0IsTUFBaEIsR0FBeUIsVUFBekIsR0FBc0MsTUFBakQsQ0FBQTtBQUFBLFFBQ0EsT0FBQSxHQUFVLGFBQUEsR0FBZ0IsV0FEMUIsQ0FYSjtBQVVPO0FBVlAsV0FhTyxVQWJQO0FBY0ksUUFBQSxRQUFBLEdBQVcsYUFBQSxHQUFnQixNQUFoQixHQUF5QixVQUF6QixHQUFzQyxNQUFqRCxDQUFBO0FBQUEsUUFDQSxPQUFBLEdBQVUsYUFBQSxHQUFnQixPQUFoQixHQUEwQixXQUExQixHQUF3QyxNQURsRCxDQWRKO0FBYU87QUFiUCxXQWdCTyxXQWhCUDtBQWlCSSxRQUFBLFFBQUEsR0FBVyxhQUFBLEdBQWdCLFVBQWhCLEdBQTZCLE1BQXhDLENBQUE7QUFBQSxRQUNBLE9BQUEsR0FBVSxhQUFBLEdBQWdCLE9BQWhCLEdBQTBCLFdBQTFCLEdBQXdDLE1BRGxELENBakJKO0FBZ0JPO0FBaEJQLFdBbUJPLGFBbkJQO0FBb0JJLFFBQUEsUUFBQSxHQUFXLGFBQUEsR0FBZ0IsTUFBaEIsR0FBeUIsVUFBekIsR0FBc0MsTUFBakQsQ0FBQTtBQUFBLFFBQ0EsT0FBQSxHQUFVLGFBQUEsR0FBZ0IsV0FBaEIsR0FBOEIsTUFEeEMsQ0FwQko7QUFtQk87QUFuQlAsV0FzQk8sY0F0QlA7QUF1QkksUUFBQSxRQUFBLEdBQVcsYUFBQSxHQUFnQixVQUFoQixHQUE2QixNQUF4QyxDQUFBO0FBQUEsUUFDQSxPQUFBLEdBQVUsYUFBQSxHQUFnQixXQUFoQixHQUE4QixNQUR4QyxDQXZCSjtBQUFBLEtBbEJBO1dBMkNBO0FBQUEsTUFBQSxJQUFBLEVBQU0sUUFBQSxHQUFXLE9BQWpCO0FBQUEsTUFDQSxHQUFBLEVBQUssT0FBQSxHQUFVLE9BRGY7TUE1Q2E7RUFBQSxDQXBKZixDQUFBOztBQUFBLG1CQW1NQSxlQUFBLEdBQWlCLFNBQUEsR0FBQTtBQUNmLFFBQUEsTUFBQTtBQUFBLElBQUEsTUFBQSxHQUFTLElBQUMsQ0FBQSxhQUFELENBQUEsQ0FBVCxDQUFBO0FBQUEsSUFDQSxJQUFDLENBQUEsU0FBUyxDQUFDLElBQVgsQ0FBZ0IsR0FBQSxHQUFHLENBQUMsSUFBQyxDQUFBLE1BQU0sQ0FBQyxJQUFSLENBQWEsY0FBYixDQUFELENBQW5CLENBQW1ELENBQUMsR0FBcEQsQ0FDRTtBQUFBLE1BQUEsSUFBQSxFQUFTLE1BQU0sQ0FBQyxJQUFSLEdBQWEsSUFBckI7QUFBQSxNQUNBLEdBQUEsRUFBUSxNQUFNLENBQUMsR0FBUixHQUFZLElBRG5CO0tBREYsQ0FEQSxDQUFBO1dBSUEsSUFBQyxDQUFBLFFBQUQsQ0FBQSxFQUxlO0VBQUEsQ0FuTWpCLENBQUE7O0FBQUEsbUJBME1BLGNBQUEsR0FBZ0IsU0FBQSxHQUFBO0FBQ2QsUUFBQSxNQUFBO0FBQUEsSUFBQSxNQUFBLEdBQVMsSUFBQyxDQUFBLGFBQUQsQ0FBQSxDQUFULENBQUE7V0FDQSxJQUFDLENBQUEsU0FBUyxDQUFDLElBQVgsQ0FBZ0IsR0FBQSxHQUFHLENBQUMsSUFBQyxDQUFBLE1BQU0sQ0FBQyxJQUFSLENBQWEsY0FBYixDQUFELENBQW5CLENBQW1ELENBQUMsT0FBcEQsQ0FDRTtBQUFBLE1BQUEsSUFBQSxFQUFTLE1BQU0sQ0FBQyxJQUFSLEdBQWEsSUFBckI7QUFBQSxNQUNBLEdBQUEsRUFBUSxNQUFNLENBQUMsR0FBUixHQUFZLElBRG5CO0tBREYsRUFHRSxHQUhGLEVBR08sQ0FBQSxTQUFBLEtBQUEsR0FBQTthQUFBLFNBQUEsR0FBQTtBQUNMLGVBQU8sS0FBQyxDQUFBLFFBQUQsQ0FBQSxDQUFQLENBREs7TUFBQSxFQUFBO0lBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUhQLEVBRmM7RUFBQSxDQTFNaEIsQ0FBQTs7QUFBQSxtQkFvTkEsV0FBQSxHQUFhLFNBQUEsR0FBQTtXQUNYLElBQUMsQ0FBQSxNQUFNLENBQUMsUUFBUixDQUFpQixXQUFqQixFQURXO0VBQUEsQ0FwTmIsQ0FBQTs7QUFBQSxtQkF5TkEsR0FBQSxHQUFLLFNBQUEsR0FBQTtBQUNILFFBQUEsU0FBQTtBQUFBLElBQUEsSUFBQSxHQUFPLENBQUMsSUFBQyxDQUFBLEtBQUssQ0FBQyxLQUFQLENBQUEsQ0FBQSxHQUFpQixDQUFDLElBQUMsQ0FBQSxNQUFNLENBQUMsSUFBUixDQUFhLFVBQWIsQ0FBQSxHQUEyQixHQUE1QixDQUFsQixDQUFBLEdBQ0wsVUFBQSxDQUFXLElBQUMsQ0FBQSxLQUFLLENBQUMsR0FBUCxDQUFXLE1BQVgsQ0FBWCxDQURLLEdBQzRCLENBQUMsSUFBQyxDQUFBLE1BQU0sQ0FBQyxVQUFSLENBQUEsQ0FBQSxHQUF1QixDQUF4QixDQURuQyxDQUFBO0FBQUEsSUFFQSxHQUFBLEdBQU0sQ0FBQyxJQUFDLENBQUEsS0FBSyxDQUFDLE1BQVAsQ0FBQSxDQUFBLEdBQWtCLENBQUMsSUFBQyxDQUFBLE1BQU0sQ0FBQyxJQUFSLENBQWEsVUFBYixDQUFBLEdBQTJCLEdBQTVCLENBQW5CLENBQUEsR0FDSixVQUFBLENBQVcsSUFBQyxDQUFBLEtBQUssQ0FBQyxHQUFQLENBQVcsS0FBWCxDQUFYLENBREksR0FDNEIsQ0FBQyxJQUFDLENBQUEsTUFBTSxDQUFDLFdBQVIsQ0FBQSxDQUFBLEdBQXdCLENBQXpCLENBSGxDLENBQUE7QUFBQSxJQUlBLElBQUMsQ0FBQSxNQUFNLENBQUMsR0FBUixDQUNFO0FBQUEsTUFBQSxJQUFBLEVBQVMsSUFBRCxHQUFNLElBQWQ7QUFBQSxNQUNBLEdBQUEsRUFBUSxHQUFELEdBQUssSUFEWjtLQURGLENBSkEsQ0FBQTtBQUFBLElBT0EsSUFBQyxDQUFBLGVBQUQsQ0FBQSxDQVBBLENBQUE7V0FRQSxDQUFDLElBQUQsRUFBTyxHQUFQLEVBVEc7RUFBQSxDQXpOTCxDQUFBOztBQUFBLG1CQW9PQSxZQUFBLEdBQWMsU0FBQSxHQUFBO0FBQ1osUUFBQSxNQUFBO0FBQUEsSUFBQSxNQUFBLEdBQVMsSUFBQyxDQUFBLFFBQUQsQ0FBQSxDQUFULENBQUE7V0FDQSxJQUFDLENBQUEsTUFBTSxDQUFDLElBQVIsQ0FDRTtBQUFBLE1BQUEsVUFBQSxFQUFZLE1BQU8sQ0FBQSxDQUFBLENBQW5CO0FBQUEsTUFDQSxVQUFBLEVBQVksTUFBTyxDQUFBLENBQUEsQ0FEbkI7S0FERixFQUZZO0VBQUEsQ0FwT2QsQ0FBQTs7QUFBQSxtQkEwT0EsTUFBQSxHQUFRLFNBQUMsT0FBRCxHQUFBO0FBQ04sUUFBQSxTQUFBO0FBQUEsSUFBQSxJQUFHLE9BQU8sQ0FBQyxLQUFYO0FBQ0UsTUFBQSxJQUFDLENBQUEsTUFBTSxDQUFDLEdBQVIsQ0FBWTtBQUFBLFFBQUEsZUFBQSxFQUFpQixPQUFPLENBQUMsS0FBekI7T0FBWixDQUFBLENBREY7S0FBQTtBQUVBLElBQUEsSUFBRyxPQUFPLENBQUMsT0FBWDtBQUNFLE1BQUEsSUFBQyxDQUFBLE1BQU0sQ0FBQyxJQUFSLENBQWEsR0FBQSxHQUFJLE1BQU0sQ0FBQyxZQUF4QixDQUF1QyxDQUFDLElBQXhDLENBQTZDLE9BQU8sQ0FBQyxPQUFyRCxDQUFBLENBQUE7QUFBQSxNQUNBLElBQUMsQ0FBQSxlQUFELENBQUEsQ0FEQSxDQURGO0tBRkE7QUFLQSxJQUFBLElBQUcsT0FBTyxDQUFDLFNBQVg7QUFDRSxNQUFBLElBQUMsQ0FBQSxNQUFNLENBQUMsV0FBUixDQUFvQixXQUFwQixDQUFBLENBQUE7QUFDQSxNQUFBLElBQWlDLE9BQU8sQ0FBQyxTQUFSLEtBQXFCLElBQXREO0FBQUEsUUFBQSxJQUFDLENBQUEsTUFBTSxDQUFDLFFBQVIsQ0FBaUIsV0FBakIsQ0FBQSxDQUFBO09BRkY7S0FMQTtBQVFBLElBQUEsSUFBRyxPQUFPLENBQUMsTUFBWDtBQUNFLE1BQUEsSUFBQSxHQUFPLENBQUMsQ0FBQyxVQUFBLENBQVcsT0FBTyxDQUFDLE1BQU8sQ0FBQSxDQUFBLENBQTFCLENBQUEsR0FBZ0MsR0FBakMsQ0FBQSxHQUF3QyxJQUFDLENBQUEsU0FBUyxDQUFDLEtBQVgsQ0FBQSxDQUF6QyxDQUFBLEdBQStELEVBQXRFLENBQUE7QUFBQSxNQUNBLEdBQUEsR0FBTSxDQUFDLENBQUMsVUFBQSxDQUFXLE9BQU8sQ0FBQyxNQUFPLENBQUEsQ0FBQSxDQUExQixDQUFBLEdBQWdDLEdBQWpDLENBQUEsR0FBd0MsSUFBQyxDQUFBLFNBQVMsQ0FBQyxNQUFYLENBQUEsQ0FBekMsQ0FBQSxHQUFnRSxFQUR0RSxDQUFBO2FBRUEsSUFBQyxDQUFBLE1BQU0sQ0FBQyxHQUFSLENBQ0U7QUFBQSxRQUFBLElBQUEsRUFBUyxJQUFELEdBQU0sSUFBZDtBQUFBLFFBQ0EsR0FBQSxFQUFRLEdBQUQsR0FBSyxJQURaO09BREYsRUFIRjtLQVRNO0VBQUEsQ0ExT1IsQ0FBQTs7QUFBQSxtQkEwUEEsTUFBQSxHQUFRLFNBQUEsR0FBQTtBQUNOLElBQUEsSUFBdUIsSUFBQyxDQUFBLE9BQUQsQ0FBQSxDQUF2QjtBQUFBLE1BQUEsSUFBQyxDQUFBLE9BQUQsQ0FBQSxDQUFVLENBQUMsTUFBWCxDQUFBLENBQUEsQ0FBQTtLQUFBO1dBQ0EsSUFBQyxDQUFBLE1BQU0sQ0FBQyxNQUFSLENBQUEsRUFGTTtFQUFBLENBMVBSLENBQUE7O2dCQUFBOztJQXRqQkYsQ0FBQTs7QUFBQSxNQXF6Qk0sQ0FBQyxNQUFQLEdBQWdCLEdBQUEsQ0FBQSxNQXJ6QmhCLENBQUEiLCJmaWxlIjoicGxhbml0LXRtcC5qcyIsInNvdXJjZVJvb3QiOiIvc291cmNlLyIsInNvdXJjZXNDb250ZW50IjpbImNsYXNzIFBsYW5pdFxuXG4gICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIERPTSBSZWZlcmVuY2VzXG5cbiAgQGNvbnRhaW5lckNsYXNzOiAgICAgICAgJ3BsYW5pdC1jb250YWluZXInXG4gIEBkcmFnZ2luZ0NsYXNzOiAgICAgICAgICdpcy1kcmFnZ2luZydcbiAgQGltYWdlQ29udGFpbmVyOiAgICAgICAgJ3BsYW5pdC1pbWFnZS1jb250YWluZXInXG4gIEBpbmZvYm94Q2xhc3M6ICAgICAgICAgICdwbGFuaXQtaW5mb2JveCdcbiAgQGluZm9ib3hDb250YWluZXJDbGFzczogJ3BsYW5pdC1pbmZvYm94LWNvbnRhaW5lcidcbiAgQG1hcmtlckNsYXNzOiAgICAgICAgICAgJ3BsYW5pdC1tYXJrZXInXG4gIEBtYXJrZXJDb250YWluZXJDbGFzczogICdwbGFuaXQtbWFya2Vycy1jb250YWluZXInXG4gIEBtYXJrZXJDb250ZW50Q2xhc3M6ICAgICdwbGFuaXQtbWFya2VyLWNvbnRlbnQnXG5cbiAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gSW5zdGFudGlhdGlvblxuXG4gIG5ldzogKEBvcHRpb25zID0ge30pIC0+XG4gICAgcmV0dXJuIG5ldyBQbGFuaXQuUGxhbihAb3B0aW9ucylcblxuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBHbG9iYWwgSGVscGVyc1xuXG4gIEByYW5kb21TdHJpbmc6IChsZW5ndGggPSAxNikgLT5cbiAgICBzdHIgPSBNYXRoLnJhbmRvbSgpLnRvU3RyaW5nKDM2KS5zbGljZSgyKVxuICAgIHN0ciA9IHN0ciArIE1hdGgucmFuZG9tKCkudG9TdHJpbmcoMzYpLnNsaWNlKDIpXG4gICAgc3RyLnN1YnN0cmluZygwLCBsZW5ndGggLSAxKVxuXG5jbGFzcyBQbGFuaXQuUGxhblxuXG4gICMgVGhpcyBjYWxscyBtZXRob2RzIHRvIGluc3RhbnRpYXRlIGEgbmV3IHBsYW4uIEZvdW5kIGluXG4gICMgcGxhbi9pbml0LmNvZmZlZVxuICAjXG4gIGNvbnN0cnVjdG9yOiAoQG9wdGlvbnMgPSB7fSkgLT5cbiAgICBtZXRob2QuY2FsbChAKSBmb3IgbWV0aG9kIGluIGluaXRNZXRob2RzKClcblxuICAjIChwcml2YXRlKSBNZXRob2RzIChpbiBvcmRlcikgbmVlZGVkIHRvIGluc3RhbnRpYXRlIHRoaXNcbiAgIyBvYmplY3RcbiAgI1xuICBpbml0TWV0aG9kcyA9IC0+XG4gICAgW2luaXRPcHRpb25zLCBpbml0Q29udGFpbmVyLCBpbml0SW1hZ2UsIGluaXRDYW52YXNNYXJrZXJzLCBpbml0RXZlbnRzXVxuXG5cbiAgIyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PSBPcHRpb25zXG5cbiAgIyAocHJpdmF0ZSkgQWRkIGRlZmF1bHQgb3B0aW9ucyBpZiB0aGUgbmVjZXNzYXJ5IG9wdGlvbnNcbiAgIyBhcmUgbWlzc2luZ1xuICAjXG4gIGluaXRPcHRpb25zID0gLT5cbiAgICBpZiBAb3B0aW9ucy5jb250YWluZXJcbiAgICAgIEBvcHRpb25zLmNvbnRhaW5lciA9ICQoXCIjI3tAb3B0aW9ucy5jb250YWluZXJ9XCIpXG4gICAgZWxzZVxuICAgICAgQG9wdGlvbnMuY29udGFpbmVyID0gJCgnI3BsYW5pdCcpXG4gICAgIyBkaXJlY3QgYWNjZXNzIHRvIHBsYW5pdCBjb250YWluZXJcbiAgICBAY29udGFpbmVyID0gQG9wdGlvbnMuY29udGFpbmVyXG5cbiAgIyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PSBDb250YWluZXJcblxuICAjIChwcml2YXRlKSBEcmF3IHRoZSBjb250YWluZXIgYW5kIHRoZSBzdWJjb250YWluZXJzXG4gICNcbiAgaW5pdENvbnRhaW5lciA9IC0+XG4gICAgQGNvbnRhaW5lci5hZGRDbGFzcyhQbGFuaXQuY29udGFpbmVyQ2xhc3MpXG4gICAgQGNvbnRhaW5lci5hcHBlbmQgXCJcIlwiXG4gICAgICA8ZGl2IGNsYXNzPVwiI3tQbGFuaXQuaW5mb2JveENvbnRhaW5lckNsYXNzfVwiPjwvZGl2PlxuICAgICAgPGRpdiBjbGFzcz1cIiN7UGxhbml0Lm1hcmtlckNvbnRhaW5lckNsYXNzfVwiPjwvZGl2PlxuICAgICAgICBcIlwiXCJcbiAgICBAbWFya2Vyc0NvbnRhaW5lciA9IEBjb250YWluZXIuZmluZChcIi4je1BsYW5pdC5tYXJrZXJDb250YWluZXJDbGFzc31cIilcbiAgICAgIC5maXJzdCgpICMgZGlyZWN0IGFjY2VzcyB0byBtYXJrZXJzIGNvbnRhaW5lclxuXG4gICMgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0gQmFja2dyb3VuZCBJbWFnZVxuXG4gICMgKHByaXZhdGUpIENyZWF0ZSBpbWFnZSBjb250YWluZXIgYW5kIGFkZCBpbWFnZSBpZlxuICAjIG5lY2Vzc2FyeVxuICAjXG4gIGluaXRJbWFnZSA9IC0+XG4gICAgaWYgQG9wdGlvbnMuaW1hZ2UgJiYgQG9wdGlvbnMuaW1hZ2UudXJsXG4gICAgICBAY29udGFpbmVyLnByZXBlbmQgXCJcIlwiXG4gICAgICAgIDxkaXYgY2xhc3M9XCIje1BsYW5pdC5pbWFnZUNvbnRhaW5lcn1cIj5cbiAgICAgICAgICA8aW1nIHNyYz1cIiN7QG9wdGlvbnMuaW1hZ2UudXJsfVwiPlxuICAgICAgICA8L2Rpdj5cbiAgICAgIFwiXCJcIlxuICAgICAgQGltYWdlID0gQGNvbnRhaW5lci5maW5kKCdpbWcnKS5maXJzdCgpXG4gICAgICBAaW1hZ2UubG9hZCAoKSA9PlxuICAgICAgICBAY29udGFpbmVyLmNzcyhoZWlnaHQ6IEBpbWFnZS5oZWlnaHQoKSlcbiAgICAgICAgaW5pdFpvb21hYmxlLmNhbGwoQClcbiAgICAgICAgaW5pdE1hcmtlcnMuY2FsbChAKVxuXG4gICMgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0gWm9vbWluZ1xuXG4gICMgKHByaXZhdGUpIFNldHMgb3VyIHJlZmVyZW5jZXMgZm9yIHdvcmtpbmcgd2l0aCB6b29tLCBhbmRcbiAgIyBjb250cm9scyB3aGV0aGVyIG9yIG5vdCB0byBhZGQgY29udHJvbHNcbiAgI1xuICBpbml0Wm9vbWFibGUgPSAtPlxuICAgICMgYWRkIHpvb20gSUQgdG8gbWFya2VycyBjb250YWluZXJcbiAgICBAem9vbUlkID0gUGxhbml0LnJhbmRvbVN0cmluZygpXG4gICAgQG1hcmtlcnNDb250YWluZXIuYXR0cignZGF0YS16b29tLWlkJywgQHpvb21JZClcbiAgICAjIHNldCBpbml0aWFsIGJhY2tncm91bmQgY29vcmRpbmF0ZXNcbiAgICBAcmVzZXRJbWFnZSgpXG4gICAgIyBhZGQgem9vbSBjb250cm9scyBpZiBuZWNlc3NhcnlcbiAgICBpbml0Wm9vbUNvbnRyb2xzLmNhbGwoQCkgaWYgQG9wdGlvbnMuaW1hZ2Uuem9vbVxuXG4gICMgKHByaXZhdGUpIFJlbmRlciB0aGUgem9vbSBjb250cm9scyBhbmQgYmluZHMgbmVjZXNzYXJ5XG4gICMgZXZlbnRzXG4gICNcbiAgaW5pdFpvb21Db250cm9scyA9IC0+XG4gICAgIyBkcmF3IHRoZSBjb250cm9scyBkaW5rdXNcbiAgICBAY29udGFpbmVyLnByZXBlbmQgXCJcIlwiXG4gICAgICA8ZGl2IGNsYXNzPVwicGxhbml0LWNvbnRyb2xzXCI+XG4gICAgICAgIDxhIGhyZWY9XCIjXCIgY2xhc3M9XCJ6b29tXCIgZGF0YS1hY3Rpb249XCJpblwiPis8L2E+XG4gICAgICAgIDxhIGhyZWY9XCIjXCIgY2xhc3M9XCJ6b29tXCIgZGF0YS1hY3Rpb249XCJvdXRcIj4tPC9hPlxuICAgICAgPC9kaXY+XG4gICAgXCJcIlwiXG4gICAgQGNvbnRhaW5lci5maW5kKFwiLnpvb21bZGF0YS1hY3Rpb249J2luJ11cIikuY2xpY2sgKGUpID0+XG4gICAgICBlLnByZXZlbnREZWZhdWx0KClcbiAgICAgIEB6b29tSW4oKVxuICAgIEBjb250YWluZXIuZmluZChcIi56b29tW2RhdGEtYWN0aW9uPSdvdXQnXVwiKS5jbGljayAoZSkgPT5cbiAgICAgIGUucHJldmVudERlZmF1bHQoKVxuICAgICAgQHpvb21PdXQoKVxuICAgICMgYmluZCBkcmFnZ2FibGUgZXZlbnRzXG4gICAgQGNvbnRhaW5lci5vbiAgICdkYmxjbGljaycsIChlKSA9PlxuICAgICAgekRibENsaWNrLmNhbGwoQCwgZSlcbiAgICBAY29udGFpbmVyLm9uICAgJ21vdXNlZG93bicsIChlKSA9PlxuICAgICAgek1vdXNlRG93bi5jYWxsKEAsIGUpXG4gICAgJChkb2N1bWVudCkub24gICdtb3VzZW1vdmUnLCAoZSkgPT5cbiAgICAgIHpNb3VzZU1vdmUuY2FsbChALCBlKVxuICAgICQoZG9jdW1lbnQpLm9uICAnbW91c2V1cCcsIChlKSA9PlxuICAgICAgek1vdXNlVXAuY2FsbChALCBlKVxuXG4gICMgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0gTWFya2Vyc1xuXG4gICMgKHByaXZhdGUpIFdpbGwgY2FsbCBpbml0TWFya2VycyBpZiB0aGVyZSBpcyBubyBpbWFnZSxcbiAgIyBvdGhlcndpc2UgaXQncyBjYWxsZWQgZnJvbSBpbml0SW1hZ2UsIHdoaWNoIHdhaXRzIGZvclxuICAjIHRoZSBpbWFnZSB0byBiZSBsb2FkZWQuXG4gICNcbiAgaW5pdENhbnZhc01hcmtlcnMgPSAtPlxuICAgIGluaXRNYXJrZXJzLmNhbGwoQCkgdW5sZXNzIEBvcHRpb25zLmltYWdlICYmIEBvcHRpb25zLmltYWdlLnVybFxuXG4gICMgSW50ZXJ2YWwgbWV0aG9kIHRoYXQgY29udGludWVzIHRvIGNoZWNrIGZvciBpbWFnZSBiZWluZ1xuICAjIGxvYWRlZCBiZWZvcmUgYWRkaW5nIG1hcmtlcnMgdG8gdGhlIHBsYW5cbiAgI1xuICBpbml0TWFya2VycyA9IC0+XG4gICAgaWYgQG9wdGlvbnMubWFya2VycyAmJiBAb3B0aW9ucy5tYXJrZXJzLmxlbmd0aCA+IDBcbiAgICAgIGZvciBtYXJrZXIgaW4gQG9wdGlvbnMubWFya2Vyc1xuICAgICAgICBtYXJrZXIuY29udGFpbmVyID0gQGNvbnRhaW5lclxuICAgICAgICBQbGFuaXQuTWFya2VyLmNyZWF0ZShtYXJrZXIpXG5cbiAgIyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PSBQbGFuIEV2ZW50c1xuXG4gICMgKHByaXZhdGUpIEJpbmQgZXZlbnRzIHRvIHRoZSBwbGFuLiBUaGVzZSBldmVudHMgZGVhbFxuICAjIG1vc3RseSB3aXRoIG1hcmtlcnMsIHNpbmNlIHNvbWUgZXZlbnQgc2hvdWxkIGJlIGF0dGFjaGVkXG4gICMgdG8gdGhlIHBsYW4gYW5kIGxhdGVyIGZpbmQgdGhlIGFwcHJvcHJpYXRlIG1hcmtlclxuICAjXG4gIGluaXRFdmVudHMgPSAtPlxuICAgIGlmIEBjb250YWluZXIuZmluZChcIi4je1BsYW5pdC5pbWFnZUNvbnRhaW5lcn0gPiBpbWdcIikubGVuZ3RoID4gMFxuICAgICAgQGltYWdlID0gQGNvbnRhaW5lci5maW5kKFwiLiN7UGxhbml0LmltYWdlQ29udGFpbmVyfSA+IGltZ1wiKS5maXJzdCgpXG4gICAgJChkb2N1bWVudCkub24gJ21vdXNlbW92ZScsIChlKSA9PlxuICAgICAgbW91c2Vtb3ZlLmNhbGwoQCwgZSlcbiAgICAkKGRvY3VtZW50KS5vbiAnbW91c2V1cCcsIChlKSA9PlxuICAgICAgbW91c2V1cC5jYWxsKEAsIGUpXG5cblxuICAjID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09IFNldHRpbmcgSW1hZ2VcblxuICAjIFpvb21hIHRoZSBpbWFnZSBvdXQgYWxsIHRoZSB3YXkgYW5kIHNldHMgdGhlIG1hcmtlcnNcbiAgIyBhcHByb3ByaWF0ZWx5XG4gICNcbiAgcmVzZXRJbWFnZTogPT5cbiAgICBAaW1hZ2VQb3NpdGlvbiA9XG4gICAgICBsZWZ0UHg6ICAgICAgICAgMFxuICAgICAgdG9wUHg6ICAgICAgICAgIDBcbiAgICAgIHdpZHRoOiAgICAgICAgICBAaW1hZ2Uud2lkdGgoKVxuICAgICAgaGVpZ2h0OiAgICAgICAgIEBpbWFnZS5oZWlnaHQoKVxuICAgICAgc2NhbGU6ICAgICAgICAgIDFcbiAgICAgIGluY3JlbWVudDogICAgICAwLjVcbiAgICBzZXRCYWNrZ3JvdW5kLmNhbGwoQClcblxuICAjIChwcml2YXRlKSBNb3ZlcyB0aGUgYmFja2dyb3VuZCBhbmQgbWFya2VycyB3aXRob3V0XG4gICMgYW5pbWF0aW9uIHRvIHRoZSBsb2NhdGlvbiBzZXQgYnkgdGhlIGltYWdlUG9zaXRpb25cbiAgIyBwcm9wZXJ0eVxuICAjXG4gIHNldEJhY2tncm91bmQgPSAtPlxuICAgIEBpbWFnZS5jc3NcbiAgICAgIGxlZnQ6IFwiI3tAaW1hZ2VQb3NpdGlvbi5sZWZ0UHh9cHhcIlxuICAgICAgdG9wOiBcIiN7QGltYWdlUG9zaXRpb24udG9wUHh9cHhcIlxuICAgICAgd2lkdGg6IFwiI3tAaW1hZ2VQb3NpdGlvbi5zY2FsZSAqIDEwMC4wfSVcIlxuICAgICAgaGVpZ2h0OiAnYXV0bydcbiAgICBzZXRNYXJrZXJzLmNhbGwoQClcblxuICAjIChwcml2YXRlKSBFcXVpdmFsZW50IHRvIHNldEJhY2tncm91bmQsIGJ1dCB3aXRoXG4gICMgYW5pbWF0aW9uXG4gICNcbiAgYW5pbWF0ZUJhY2tncm91bmQgPSAtPlxuICAgIEBpbWFnZS5hbmltYXRlXG4gICAgICBsZWZ0OiBcIiN7QGltYWdlUG9zaXRpb24ubGVmdFB4fXB4XCJcbiAgICAgIHRvcDogXCIje0BpbWFnZVBvc2l0aW9uLnRvcFB4fXB4XCJcbiAgICAgIHdpZHRoOiBcIiN7QGltYWdlUG9zaXRpb24uc2NhbGUgKiAxMDAuMH0lXCJcbiAgICAgIGhlaWdodDogJ2F1dG8nXG4gICAgLCAyNTBcbiAgICBhbmltYXRlTWFya2Vycy5jYWxsKEApXG5cbiAgIyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PSBTZXR0aW5nIE1hcmtlcnNcblxuICAjIChwcml2YXRlKSBTZXRzIG1hcmtlcnMgaW4gY29ycmVjdCBsb2NhdGlvbiwgYmFzZWQgb25cbiAgIyBpbWFnZSBwb3NpdGlvblxuICAjXG4gIHNldE1hcmtlcnMgPSAtPlxuICAgIG1hcmtlcnMgPSBAY29udGFpbmVyLmZpbmQoXCIuI3tQbGFuaXQubWFya2VyQ2xhc3N9XCIpXG4gICAgaWYgbWFya2Vycy5sZW5ndGggPiAwXG4gICAgICBmb3IgbWFya2VyIGluIG1hcmtlcnNcbiAgICAgICAgbGVmdCA9IChAY2FsYyhpbWdXaWR0aCkgKiAoJChtYXJrZXIpLmF0dHIoJ2RhdGEteFBjJykgLyAxMDApKSArXG4gICAgICAgICAgQGltYWdlUG9zaXRpb24ubGVmdFB4IC0gKCQobWFya2VyKS5vdXRlcldpZHRoKCkgLyAyKVxuICAgICAgICB0b3AgPSAoQGNhbGMoaW1nSGVpZ2h0KSAqICgkKG1hcmtlcikuYXR0cignZGF0YS15UGMnKSAvIDEwMCkpICtcbiAgICAgICAgICBAaW1hZ2VQb3NpdGlvbi50b3BQeCAtICgkKG1hcmtlcikub3V0ZXJIZWlnaHQoKSAvIDIpXG4gICAgICAgICQobWFya2VyKS5jc3NcbiAgICAgICAgICBsZWZ0OiBcIiN7bGVmdH1weFwiXG4gICAgICAgICAgdG9wOiBcIiN7dG9wfXB4XCJcbiAgICAgIHBvc2l0aW9uSW5mb2JveGVzLmNhbGwoQClcblxuICAjIChwcml2YXRlKSBFcXVpdmFsZW50IHRvIHNldE1hcmtlcnMsIGJ1dCB3aXRoIGFuaW1hdGlvblxuICAjXG4gIGFuaW1hdGVNYXJrZXJzID0gLT5cbiAgICBtYXJrZXJzID0gQGNvbnRhaW5lci5maW5kKFwiLiN7UGxhbml0Lm1hcmtlckNsYXNzfVwiKVxuICAgIGlmIG1hcmtlcnMubGVuZ3RoID4gMFxuICAgICAgZm9yIG1hcmtlciBpbiBtYXJrZXJzXG4gICAgICAgIG0gPSBuZXcgUGxhbml0Lk1hcmtlcihAY29udGFpbmVyLCAkKG1hcmtlcikuYXR0cignZGF0YS1tYXJrZXInKSlcbiAgICAgICAgbS5oaWRlSW5mb2JveCgpXG4gICAgICAgIGxlZnQgPSAoQGNhbGMoaW1nV2lkdGgpICogKCQobWFya2VyKS5hdHRyKCdkYXRhLXhQYycpIC8gMTAwKSkgK1xuICAgICAgICAgIEBpbWFnZVBvc2l0aW9uLmxlZnRQeCAtICgkKG1hcmtlcikub3V0ZXJXaWR0aCgpIC8gMilcbiAgICAgICAgdG9wID0gKEBjYWxjKGltZ0hlaWdodCkgKiAoJChtYXJrZXIpLmF0dHIoJ2RhdGEteVBjJykgLyAxMDApKSArXG4gICAgICAgICAgQGltYWdlUG9zaXRpb24udG9wUHggLSAoJChtYXJrZXIpLm91dGVySGVpZ2h0KCkgLyAyKVxuICAgICAgICBkbyAobSkgLT5cbiAgICAgICAgICAkKG1hcmtlcikuYW5pbWF0ZVxuICAgICAgICAgICAgbGVmdDogXCIje2xlZnR9cHhcIlxuICAgICAgICAgICAgdG9wOiBcIiN7dG9wfXB4XCJcbiAgICAgICAgICAsIDI1MCwgKCkgPT5cbiAgICAgICAgICAgIG0ucG9zaXRpb25JbmZvYm94KClcbiAgICAgICAgICAgIG0udW5oaWRlSW5mb2JveCgpXG5cbiAgIyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PSBTZXR0aW5nIEluZm9ib3hlc1xuXG4gICMgKHByaXZhdGUpIEFwcHJvcHJpYXRlbHkgcG9zaXRpb24gdGhlIGluZm9ib3ggb24gZXZlcnlcbiAgIyBtYXJrZXIsIHRoZSBsb2dpYyBmb3Igd2hpY2ggaXMgaW4gdGhlIE1hcmtlciBjbGFzc1xuICAjXG4gIHBvc2l0aW9uSW5mb2JveGVzID0gLT5cbiAgICBmb3IgbWFya2VyIGluIEBjb250YWluZXIuZmluZChcIi4je1BsYW5pdC5tYXJrZXJDbGFzc31cIilcbiAgICAgIG0gPSBuZXcgUGxhbml0Lk1hcmtlcihAY29udGFpbmVyLCAkKG1hcmtlcikuYXR0cignZGF0YS1tYXJrZXInKSlcbiAgICAgIG0ucG9zaXRpb25JbmZvYm94KClcbiAgICB0cnVlXG5cbiAgIyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PSBNb3ZlIEFjdGlvbnNcblxuICAjIFdpbGwgY2VudGVyIHRoZSBpbWFnZSBvbiB0aGUgZ2l2ZW4gY29vcmRpbmF0ZXMgYXMgW3gseV1cbiAgIyBpbiBmbG9hdGVkIHBlcmNlbnRhZ2VzLiBFbnN1cmVzIHRoZXJlIGlzIGVub3VnaCBpbWFnZSBvblxuICAjIGVhY2ggc2lkZSBieSB6b29taW5nIGluIGlmIG5lY2Vzc2FyeS5cbiAgI1xuICBjZW50ZXJPbjogKGNvb3JkcykgPT5cbiAgICBpZiBjb29yZHNbMF0gPj0gNTAgdGhlbiB4ID0gMTAwIC0gY29vcmRzWzBdIGVsc2UgeCA9IGNvb3Jkc1swXVxuICAgIGlmIGNvb3Jkc1sxXSA+PSA1MCB0aGVuIHkgPSAxMDAgLSBjb29yZHNbMV0gZWxzZSB5ID0gY29vcmRzWzFdXG4gICAgd01pbiA9IDUwICogKEBjYWxjKGNvbnRhaW5lcldpZHRoKSAvIHgpXG4gICAgaE1pbiA9IDUwICogKEBjYWxjKGNvbnRhaW5lckhlaWdodCkgLyB5KVxuICAgICMgaGlkZXMgb3RoZXIgYWN0aXZlIGluZm9ib3hlcywgYnV0IHdpbGwgc3RpbGwgc2hvd1xuICAgICMgdGhpcyBpbmZvYm94XG4gICAgQGNvbnRhaW5lci5maW5kKFwiLiN7UGxhbml0LmluZm9ib3hDbGFzc31cIikucmVtb3ZlQ2xhc3MoJ2FjdGl2ZScpXG4gICAgIyBHZXQgb3VyIGluaXRpYWwgcG9zaXRpb25cbiAgICBAaW1hZ2VQb3NpdGlvbi5sZWZ0UHggPSAtIChcbiAgICAgIChAY2FsYyhpbWdXaWR0aCkgKiAoY29vcmRzWzBdIC8gMTAwKSkgLSAoQGNhbGMoY29udGFpbmVyV2lkdGgpIC8gMilcbiAgICApXG4gICAgQGltYWdlUG9zaXRpb24udG9wUHggPSAtIChcbiAgICAgIChAY2FsYyhpbWdIZWlnaHQpICogKGNvb3Jkc1sxXSAvIDEwMCkpIC0gKEBjYWxjKGNvbnRhaW5lckhlaWdodCkgLyAyKVxuICAgIClcbiAgICAjIGtlZXAgdGhlb3JldGljYWxseSBtYWtpbmcgdGhlIGltYWdlIGJpZ2dlciB1bnRpbCBpdCBpc1xuICAgICMgbGFyZ2UgZW5vdWdoIHRvIGNlbnRlciBvbiBvdXIgcG9pbnRcbiAgICB3aGlsZSAoQGNhbGMoaW1nV2lkdGgpIDwgd01pbikgfHwgKEBjYWxjKGltZ0hlaWdodCkgPCBoTWluKVxuICAgICAgQGltYWdlUG9zaXRpb24uc2NhbGUgID0gQGltYWdlUG9zaXRpb24uc2NhbGUgKyBAaW1hZ2VQb3NpdGlvbi5pbmNyZW1lbnRcbiAgICAgIEBpbWFnZVBvc2l0aW9uLmxlZnRQeCA9IC0gKFxuICAgICAgICAoQGNhbGMoaW1nV2lkdGgpICogKGNvb3Jkc1swXSAvIDEwMCkpIC0gKEBjYWxjKGNvbnRhaW5lcldpZHRoKSAvIDIpXG4gICAgICApXG4gICAgICBAaW1hZ2VQb3NpdGlvbi50b3BQeCA9IC0gKFxuICAgICAgICAoQGNhbGMoaW1nSGVpZ2h0KSAqIChjb29yZHNbMV0gLyAxMDApKSAtIChAY2FsYyhjb250YWluZXJIZWlnaHQpIC8gMilcbiAgICAgIClcbiAgICBhbmltYXRlQmFja2dyb3VuZC5jYWxsKEApXG4gICAgY29vcmRzXG5cbiAgIyBab29tcyB0aGUgaW1hZ2UgdG8gYSBzcGVjaWZpYyBcImxldmVsXCIgd2hpY2ggaXMgYW5cbiAgIyBpbmNyZW1lbnRlZCBpbnRlZ2VyIHN0YXJ0aW5nIGF0IHplcm9cbiAgI1xuICB6b29tVG86IChsZXZlbCkgPT5cbiAgICBpID0gQGltYWdlUG9zaXRpb24uaW5jcmVtZW50XG4gICAgdW5sZXNzICgobGV2ZWwgKiBpKSArIDEpID09IEBpbWFnZVBvc2l0aW9uLnNjYWxlXG4gICAgICBAaW1hZ2VQb3NpdGlvbi5zY2FsZSA9IChsZXZlbCAqIGkpICsgMSArIGlcbiAgICAgIEB6b29tT3V0KClcbiAgICBsZXZlbFxuXG4gICMgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0gQ2FsY3VsYXRpb25zXG5cbiAgIyBNZXRob2QgZm9yIGFjY2Vzc2luZyB0aGUgcHJpdmF0ZSBjYWxjdWxhdGlvbiBtZXRob2RzXG4gICNcbiAgY2FsYzogKG1ldGhvZCkgPT5cbiAgICBtZXRob2QuY2FsbChAKVxuXG4gICMgKHByaXZhdGUpIFdpZHRoIG9mIHRoZSBpbWFnZVxuICAjXG4gIGltZ1dpZHRoID0gLT5cbiAgICBwYXJzZUZsb2F0KEBpbWFnZVBvc2l0aW9uLndpZHRoICogQGltYWdlUG9zaXRpb24uc2NhbGUpXG5cbiAgIyAocHJpdmF0ZSkgVGhlIG51bWJlciBvZiBwaXhlbHMgYWRkZWQgd2l0aCBlYWNoIHpvb20gbGV2ZWxcbiAgI1xuICBpbWdXaWR0aENsaWNrSW5jcmVtZW50ID0gLT5cbiAgICBwYXJzZUZsb2F0KEBpbWFnZVBvc2l0aW9uLndpZHRoICogQGltYWdlUG9zaXRpb24uaW5jcmVtZW50KVxuXG4gICMgKHByaXZhdGUpIFRoZSB3aWR0aCBvZiB0aGUgY29udGFpbmVyXG4gICNcbiAgY29udGFpbmVyV2lkdGggPSAtPlxuICAgIHBhcnNlRmxvYXQoQG1hcmtlcnNDb250YWluZXIud2lkdGgoKSlcblxuICAjIChwcml2YXRlKSBOdW1iZXIgb2YgcGl4ZWxzIGxlZnQgc2lkZSBvZiBpbWFnZSBpcyBmcm9tXG4gICMgbGVmdCBzaWRlIG9mIHRoZSBjb250YWluZXJcbiAgI1xuICBpbWdPZmZzZXRMZWZ0ID0gLT5cbiAgICBNYXRoLmFicyhwYXJzZUZsb2F0KEBpbWFnZS5jc3MoJ2xlZnQnKSkpXG5cbiAgIyAocHJpdmF0ZSkgSGVpZ2h0IG9mIHRoZSBpbWFnZVxuICAjXG4gIGltZ0hlaWdodCA9IC0+XG4gICAgcGFyc2VGbG9hdChAaW1hZ2VQb3NpdGlvbi5oZWlnaHQgKiBAaW1hZ2VQb3NpdGlvbi5zY2FsZSlcblxuICAjIChwcml2YXRlKSBUaGUgbnVtYmVyIG9mIHBpeGVscyBhZGRlZCBvciByZW1vdmVkIHdpdGhcbiAgIyBlYWNoIHpvb20gbGV2ZWxcbiAgI1xuICBpbWdIZWlnaHRDbGlja0luY3JlbWVudCA9IC0+XG4gICAgcGFyc2VGbG9hdChAaW1hZ2VQb3NpdGlvbi5oZWlnaHQgKiBAaW1hZ2VQb3NpdGlvbi5pbmNyZW1lbnQpXG5cbiAgIyAocHJpdmF0ZSkgVGhlIGhlaWdodCBvZiB0aGUgY29udGFpbmVyIChwaXhlbHMpXG4gICNcbiAgY29udGFpbmVySGVpZ2h0ID0gLT5cbiAgICBwYXJzZUZsb2F0KEBtYXJrZXJzQ29udGFpbmVyLmhlaWdodCgpKVxuXG4gICMgKHByaXZhdGUpIFRoZSBudW1iZXIgb2YgcGl4ZWxzIHRoZSB0b3Agb2YgdGhlIGltYWdlIGlzXG4gICMgZnJvbSB0aGUgdG9wIG9mIHRoZSBjb250YWluZXJcbiAgI1xuICBpbWdPZmZzZXRUb3AgPSAtPlxuICAgIE1hdGguYWJzKHBhcnNlRmxvYXQoQGltYWdlLmNzcygndG9wJykpKVxuXG4gICMgKHByaXZhdGUpIENvb3JkaW5hdGVzIG9mIGFuIGV2ZW50IGFzIGEgcGVyY2VudGFnZSBvZiB0aGVcbiAgIyBkaW1lbnNpb25zIG9mIHRoZSBjb250YWluZXIsIHJlbGF0aXZlIHRvIHRoZSB0b3AgbGVmdFxuICAjIGNvcm5lciBvZiB0aGUgY29udGFpbmVyXG4gICNcbiAgekV2ZW50UG9zaXRpb24gPSAoZSkgLT5cbiAgICBsZWZ0OiAoZS5wYWdlWCAtIEBjb250YWluZXIub2Zmc2V0KCkubGVmdCkgLyBAY2FsYyhjb250YWluZXJXaWR0aClcbiAgICB0b3A6ICAoZS5wYWdlWSAtIEBjb250YWluZXIub2Zmc2V0KCkudG9wKSAvIEBjYWxjKGNvbnRhaW5lckhlaWdodClcblxuICAjID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09IEV2ZW50c1xuXG4gICMgKHByaXZhdGUpIExpc3RlbmVyIGZvciBkb3VibGUtY2xpY2tpbmcgb24gdGhlIHBsYW5cbiAgI1xuICB6RGJsQ2xpY2sgPSAoZSkgLT5cbiAgICBpZiAkKGUudGFyZ2V0KS5hdHRyKCdkYXRhLXpvb20taWQnKSA9PSBAem9vbUlkXG4gICAgICBjbGljayA9IHpFdmVudFBvc2l0aW9uLmNhbGwoQCwgZSlcbiAgICAgIEB6b29tSW4oJ2NsaWNrJywgY2xpY2subGVmdCwgY2xpY2sudG9wKVxuXG4gICMgKHByaXZhdGUpIExpc3RlbmVyIGZvciB0aGUgc3RhcnQgb2YgYSBjbGljayBvbiB0aGUgcGxhblxuICAjXG4gIHpNb3VzZURvd24gPSAoZSkgLT5cbiAgICBpZiAkKGUudGFyZ2V0KS5hdHRyKCdkYXRhLXpvb20taWQnKSA9PSBAem9vbUlkICYmIGUud2hpY2ggPT0gMVxuICAgICAgQGlzRHJhZ2dpbmcgPSB0cnVlXG4gICAgICBjb29yZHMgPSB6RXZlbnRQb3NpdGlvbi5jYWxsKEAsIGUpXG4gICAgICBAZHJhZ0Nvb3JkcyA9XG4gICAgICAgIHBvaW50UmVmOiBjb29yZHNcbiAgICAgICAgaW1nUmVmOlxuICAgICAgICAgIGxlZnQ6IDAgLSBAY2FsYyhpbWdPZmZzZXRMZWZ0KVxuICAgICAgICAgIHRvcDogMCAtIEBjYWxjKGltZ09mZnNldFRvcClcbiAgICAgICAgbWF4OlxuICAgICAgICAgIHJpZ2h0OiAoY29vcmRzLmxlZnQgKiBAY2FsYyhjb250YWluZXJXaWR0aCkpICsgQGNhbGMoaW1nT2Zmc2V0TGVmdClcbiAgICAgICAgICBsZWZ0OiAoY29vcmRzLmxlZnQgKiBAY2FsYyhjb250YWluZXJXaWR0aCkpIC0gKEBjYWxjKGltZ1dpZHRoKSAtXG4gICAgICAgICAgICAgICAgICAgICAgKEBjYWxjKGNvbnRhaW5lcldpZHRoKSArIEBjYWxjKGltZ09mZnNldExlZnQpKSlcbiAgICAgICAgICBib3R0b206IChjb29yZHMudG9wICogQGNhbGMoY29udGFpbmVySGVpZ2h0KSkgKyBAY2FsYyhpbWdPZmZzZXRUb3ApXG4gICAgICAgICAgdG9wOiAoY29vcmRzLnRvcCAqIEBjYWxjKGNvbnRhaW5lckhlaWdodCkpIC0gKEBjYWxjKGltZ0hlaWdodCkgLVxuICAgICAgICAgICAgICAgICAgICAgIChAY2FsYyhjb250YWluZXJIZWlnaHQpICsgQGNhbGMoaW1nT2Zmc2V0VG9wKSkpXG4gICAgdHJ1ZVxuXG4gICMgKHByaXZhdGUpIExpc3RlbmVyIGZvciB3aGVuIHRoZSBtb3VzZSBtb3ZlcyBhbnl3aGVyZSBvblxuICAjIHRoZSBkb2N1bWVudFxuICAjXG4gIHpNb3VzZU1vdmUgPSAoZSkgLT5cbiAgICBpZiBAaXNEcmFnZ2luZ1xuICAgICAgY29vcmRzID0gekV2ZW50UG9zaXRpb24uY2FsbChALCBlKVxuICAgICAgZHJhZ0xlZnQgPSBjb29yZHMubGVmdCAqIEBjYWxjKGNvbnRhaW5lcldpZHRoKVxuICAgICAgZHJhZ1RvcCA9IGNvb3Jkcy50b3AgKiBAY2FsYyhjb250YWluZXJIZWlnaHQpXG4gICAgICBpZiBkcmFnTGVmdCA+PSBAZHJhZ0Nvb3Jkcy5tYXgubGVmdCAmJiBkcmFnTGVmdCA8PSBAZHJhZ0Nvb3Jkcy5tYXgucmlnaHRcbiAgICAgICAgbGVmdCA9IChjb29yZHMubGVmdCAtIEBkcmFnQ29vcmRzLnBvaW50UmVmLmxlZnQpICogQGNhbGMoY29udGFpbmVyV2lkdGgpXG4gICAgICAgIEBpbWFnZVBvc2l0aW9uLmxlZnRQeCA9IEBkcmFnQ29vcmRzLmltZ1JlZi5sZWZ0ICsgbGVmdFxuICAgICAgZWxzZSBpZiBkcmFnTGVmdCA8IEBkcmFnQ29vcmRzLm1heC5sZWZ0XG4gICAgICAgIEBpbWFnZVBvc2l0aW9uLmxlZnRQeCA9IEBjYWxjKGNvbnRhaW5lcldpZHRoKSAtIEBjYWxjKGltZ1dpZHRoKVxuICAgICAgZWxzZSBpZiBkcmFnTGVmdCA+IEBkcmFnQ29vcmRzLm1heC5yaWdodFxuICAgICAgICBAaW1hZ2VQb3NpdGlvbi5sZWZ0UHggPSAwXG4gICAgICBpZiBkcmFnVG9wID49IEBkcmFnQ29vcmRzLm1heC50b3AgJiYgZHJhZ1RvcCA8PSBAZHJhZ0Nvb3Jkcy5tYXguYm90dG9tXG4gICAgICAgIHRvcCA9IChjb29yZHMudG9wIC0gQGRyYWdDb29yZHMucG9pbnRSZWYudG9wKSAqIEBjYWxjKGNvbnRhaW5lckhlaWdodClcbiAgICAgICAgQGltYWdlUG9zaXRpb24udG9wUHggPSBAZHJhZ0Nvb3Jkcy5pbWdSZWYudG9wICsgdG9wXG4gICAgICBlbHNlIGlmIGRyYWdUb3AgPCBAZHJhZ0Nvb3Jkcy5tYXgudG9wXG4gICAgICAgIEBpbWFnZVBvc2l0aW9uLnRvcFB4ID0gQGNhbGMoY29udGFpbmVySGVpZ2h0KSAtIEBjYWxjKGltZ0hlaWdodClcbiAgICAgIGVsc2UgaWYgZHJhZ1RvcCA+IEBkcmFnQ29vcmRzLm1heC5ib3R0b21cbiAgICAgICAgQGltYWdlUG9zaXRpb24udG9wUHggPSAwXG4gICAgICBzZXRCYWNrZ3JvdW5kLmNhbGwoQClcbiAgICB0cnVlXG5cbiAgIyAocHJpdmF0ZSkgTGlzdGVuZXIgZm9yIHRoZSBlbmQgb2YgYSBjbGljayBhbnl3aGVyZSBvblxuICAjIHRoZSBkb2N1bWVudFxuICAjXG4gIHpNb3VzZVVwID0gKGUpIC0+XG4gICAgQGlzRHJhZ2dpbmcgPSBmYWxzZVxuICAgIHBvc2l0aW9uSW5mb2JveGVzLmNhbGwoQClcbiAgICB0cnVlXG5cbiAgIyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PSBab29taW5nXG5cbiAgIyBUYWtlcyBjdXJyZW50IHpvb20gcG9zaXRpb24gYW5kIHpvb21zIGluIHRvIHRoZSBjZW50ZXJcbiAgIyBvbmUgbGV2ZWwgZGVlcGVyXG4gICNcbiAgem9vbUluOiA9PlxuICAgIEBpbWFnZVBvc2l0aW9uLnNjYWxlICA9IEBpbWFnZVBvc2l0aW9uLnNjYWxlICsgQGltYWdlUG9zaXRpb24uaW5jcmVtZW50XG4gICAgQGltYWdlUG9zaXRpb24ubGVmdFB4ID0gLSBAY2FsYyhpbWdPZmZzZXRMZWZ0KSAtXG4gICAgICAoQGNhbGMoaW1nV2lkdGhDbGlja0luY3JlbWVudCkgLyAyKVxuICAgIEBpbWFnZVBvc2l0aW9uLnRvcFB4ICA9IC0gQGNhbGMoaW1nT2Zmc2V0VG9wKSAtXG4gICAgICAoQGNhbGMoaW1nSGVpZ2h0Q2xpY2tJbmNyZW1lbnQpIC8gMilcbiAgICBhbmltYXRlQmFja2dyb3VuZC5jYWxsKEApXG5cbiAgIyBab29tcyBvdXQgb25lIGxldmVsLiBBdHRlbXB0cyB0byB6b29tIG91dCBmcm9tIHRoZVxuICAjIGNlbnRlciwgYnV0IHdpbGwgYWRqdXN0IGJhc2VkIG9uIGF2YWlsYWJsZSBpbWFnZSBzcGFjZS5cbiAgI1xuICB6b29tT3V0OiAoKSA9PlxuICAgIGlmIEBpbWFnZVBvc2l0aW9uLnNjYWxlID4gMVxuICAgICAgQGltYWdlUG9zaXRpb24uc2NhbGUgID0gQGltYWdlUG9zaXRpb24uc2NhbGUgLSBAaW1hZ2VQb3NpdGlvbi5pbmNyZW1lbnRcbiAgICAgIGxlZnRQeCA9IC0gQGNhbGMoaW1nT2Zmc2V0TGVmdCkgKyAoQGNhbGMoaW1nV2lkdGhDbGlja0luY3JlbWVudCkgLyAyKVxuICAgICAgdG9wUHggID0gLSBAY2FsYyhpbWdPZmZzZXRUb3ApICsgKEBjYWxjKGltZ0hlaWdodENsaWNrSW5jcmVtZW50KSAvIDIpXG4gICAgICBpZiBsZWZ0UHggPiAwXG4gICAgICAgIEBpbWFnZVBvc2l0aW9uLmxlZnRQeCA9IDBcbiAgICAgIGVsc2UgaWYgbGVmdFB4IDwgQGNhbGMoY29udGFpbmVyV2lkdGgpIC0gQGNhbGMoaW1nV2lkdGgpXG4gICAgICAgIEBpbWFnZVBvc2l0aW9uLmxlZnRQeCA9IEBjYWxjKGNvbnRhaW5lcldpZHRoKSAtIEBjYWxjKGltZ1dpZHRoKVxuICAgICAgZWxzZVxuICAgICAgICBAaW1hZ2VQb3NpdGlvbi5sZWZ0UHggPSBsZWZ0UHhcbiAgICAgIGlmIHRvcFB4ID4gMFxuICAgICAgICBAaW1hZ2VQb3NpdGlvbi50b3BQeCA9IDBcbiAgICAgIGVsc2UgaWYgdG9wUHggPCBAY2FsYyhjb250YWluZXJIZWlnaHQpIC0gQGNhbGMoaW1nSGVpZ2h0KVxuICAgICAgICBAaW1hZ2VQb3NpdGlvbi50b3BQeCA9IEBjYWxjKGNvbnRhaW5lckhlaWdodCkgLSBAY2FsYyhpbWdIZWlnaHQpXG4gICAgICBlbHNlXG4gICAgICAgIEBpbWFnZVBvc2l0aW9uLnRvcFB4ID0gdG9wUHhcbiAgICAgIGFuaW1hdGVCYWNrZ3JvdW5kLmNhbGwoQClcblxuXG4gICMgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0gTWFya2VyIFJlZmVyZW5jZXNcblxuICAjIChwcml2YXRlKSBUaGUgbWFya2VyKHMpIHRoYXQgYXJlIGJlaW5nIGRyYWdnZWQsIGZvdW5kIGJ5XG4gICMgUGxhbml0J3MgZHJhZ2dpbmcgY2xhc3MuXG4gICNcbiAgZHJhZ2dpbmdNYXJrZXIgPSAtPlxuICAgIEBtYXJrZXJzQ29udGFpbmVyLmZpbmQoXCIuI3tQbGFuaXQubWFya2VyQ2xhc3N9LiN7UGxhbml0LmRyYWdnaW5nQ2xhc3N9XCIpXG5cbiAgIyAocHJpdmF0ZSkgQ29vcmRpbmF0ZXMgb2YgYW4gZXZlbnQgYXMgYSBwZXJjZW50YWdlIG9mIHRoZVxuICAjIGRpbWVuc2lvbnMgb2YgdGhlIGNvbnRhaW5lciwgcmVsYXRpdmUgdG8gdGhlIHRvcCBsZWZ0XG4gICMgY29ybmVyIG9mIHRoZSBpbWFnZVxuICAjXG4gIGdldEV2ZW50UG9zaXRpb24gPSAoZSkgLT5cbiAgICBpZiBAaW1hZ2VcbiAgICAgICMgaWYgdGhlcmUgaXMgYW4gaW1hZ2UsIHdlIG5lZWQgdG8gY2FsY3VsYXRlIHdpdGggaW1hZ2UgaW4gbWluZFxuICAgICAgeFB4ID0gZS5wYWdlWCAtIEBjb250YWluZXIub2Zmc2V0KCkubGVmdFxuICAgICAgeVB4ID0gZS5wYWdlWSAtIEBjb250YWluZXIub2Zmc2V0KCkudG9wXG4gICAgICB3SW1nID0gQGltYWdlLndpZHRoKClcbiAgICAgIGhJbWcgPSBAaW1hZ2UuaGVpZ2h0KClcbiAgICAgIHhJbWcgPSBwYXJzZUludChAaW1hZ2UuY3NzKCdsZWZ0JykpXG4gICAgICB5SW1nID0gcGFyc2VJbnQoQGltYWdlLmNzcygndG9wJykpXG4gICAgICB4UGMgPSAoKHhQeCArIE1hdGguYWJzKHhJbWcpKSAvIHdJbWcpICogMTAwXG4gICAgICB5UGMgPSAoKHlQeCArIE1hdGguYWJzKHlJbWcpKSAvIGhJbWcpICogMTAwXG4gICAgZWxzZVxuICAgICAgIyBvciB3ZSBjYW4ganVzdCBsb29rIGF0IHRoZSBjb250YWluZXJcbiAgICAgIHhQYyA9IChlLnBhZ2VYIC0gQGNvbnRhaW5lci5vZmZzZXQoKS5sZWZ0KSAvIEBjYWxjKGNvbnRhaW5lcldpZHRoKVxuICAgICAgeVBjID0gIChlLnBhZ2VZIC0gQGNvbnRhaW5lci5vZmZzZXQoKS50b3ApIC8gQGNhbGMoY29udGFpbmVySGVpZ2h0KVxuICAgIFt4UGMsIHlQY11cblxuICAjID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09IEV2ZW50c1xuXG4gICMgKHByaXZhdGUpIENhbGxlZCBhdCB0aGUgZW5kIG9mIGEgY2xpY2ssIHdoZW4gaXQgb2NjdXJzXG4gICMgb24gdG9wIG9mIHRoZSBwbGFuLlxuICAjXG4gIG1vdXNldXAgPSAoZSkgLT5cbiAgICAjIGRlYWxpbmcgd2l0aCBtYXJrZXJzLCBlc3AuIGRyYWdnaW5nIG1hcmtlcnNcbiAgICBtYXJrZXIgPSBAbWFya2Vyc0NvbnRhaW5lci5maW5kKFwiLiN7UGxhbml0LmRyYWdnaW5nQ2xhc3N9XCIpLmZpcnN0KClcbiAgICBpZiBkcmFnZ2luZ01hcmtlci5jYWxsKEApLmxlbmd0aCA+IDBcbiAgICAgIG0gPSBuZXcgUGxhbml0Lk1hcmtlcihAY29udGFpbmVyLCBtYXJrZXIuYXR0cignZGF0YS1tYXJrZXInKSlcbiAgICAgIEBvcHRpb25zLm1hcmtlckRyYWdFbmQoZSwgbSlcbiAgICAgIG0uc2F2ZVBvc2l0aW9uKClcbiAgICAgIG0ucG9zaXRpb25JbmZvYm94KClcbiAgICAgIGRyYWdnaW5nTWFya2VyLmNhbGwoQCkucmVtb3ZlQ2xhc3MoUGxhbml0LmRyYWdnaW5nQ2xhc3MpXG4gICAgIyBpZiBjbGljayBpcyBvbiB0aGUgY29udGFpbmVyXG4gICAgaWYgJChlLnRhcmdldCkuaGFzQ2xhc3MoUGxhbml0Lm1hcmtlckNvbnRhaW5lckNsYXNzKVxuICAgICAgQG9wdGlvbnMuY2FudmFzQ2xpY2soZSwgZ2V0RXZlbnRQb3NpdGlvbi5jYWxsKEAsIGUpKVxuICAgICMgaWYgY2xpY2sgaXMgb24gdGhlIG1hcmtlcnNcbiAgICBpZihcbiAgICAgICQoZS50YXJnZXQpLmhhc0NsYXNzKFBsYW5pdC5tYXJrZXJDbGFzcykgfHxcbiAgICAgICQoZS50YXJnZXQpLnBhcmVudHMoXCIuI3tQbGFuaXQubWFya2VyQ2xhc3N9XCIpLmxlbmd0aCA+IDBcbiAgICApXG4gICAgICBpZiAkKGUudGFyZ2V0KS5oYXNDbGFzcyhQbGFuaXQubWFya2VyQ2xhc3MpXG4gICAgICAgIG1hcmtlciA9ICQoZS50YXJnZXQpXG4gICAgICBlbHNlXG4gICAgICAgIG1hcmtlciA9ICQoZS50YXJnZXQpLnBhcmVudHMoXCIuI3tQbGFuaXQubWFya2VyQ2xhc3N9XCIpLmZpcnN0KClcbiAgICAgIG0gPSBuZXcgUGxhbml0Lk1hcmtlcihAY29udGFpbmVyLCBtYXJrZXIuYXR0cignZGF0YS1tYXJrZXInKSlcbiAgICAgIEBvcHRpb25zLm1hcmtlckNsaWNrKGUsIG0pXG4gICAgdHJ1ZVxuXG4gICMgKHByaXZhdGUpIENhbGxlZCB3aGVuZXZlciB0aGUgbW91c2UgbW92ZXMgb3ZlciB0aGUgcGxhbi5cbiAgI1xuICBtb3VzZW1vdmUgPSAoZSkgLT5cbiAgICBtYXJrZXJzID0gQG1hcmtlcnNDb250YWluZXIuZmluZChcIi4je1BsYW5pdC5tYXJrZXJDbGFzc30uI3tQbGFuaXQuZHJhZ2dpbmdDbGFzc31cIilcblxuICAgIGlmIG1hcmtlcnMubGVuZ3RoID4gMFxuXG4gICAgICAjIG9ubHkgdXNlIGZpcnN0IG1hcmtlciBpbiBjYXNlIHRoZXJlIGFyZSBtb3JlIHRoYW5cbiAgICAgICMgb25lIGRyYWdnaW5nXG4gICAgICAjXG4gICAgICBtYXJrZXIgPSBtYXJrZXJzLmZpcnN0KClcblxuICAgICAgIyB3ZSBoaWRlIHRoZSBpbmZvYm94IHdoaWxlIGRyYWdnaW5nXG4gICAgICAjXG4gICAgICBpZihcbiAgICAgICAgTWF0aC5hYnMoZS5wYWdlWCAtIG1hcmtlci5hdHRyKCdkYXRhLWRyYWctc3RhcnQteCcpKSA+IDAgfHxcbiAgICAgICAgTWF0aC5hYnMoZS5wYWdlWSAtIG1hcmtlci5hdHRyKCdkYXRhLWRyYWctc3RhcnQteScpKSA+IDBcbiAgICAgIClcbiAgICAgICAgQGNvbnRhaW5lci5maW5kKFwiIyN7bWFya2VyLmF0dHIoJ2RhdGEtaW5mb2JveCcpfVwiKS5yZW1vdmVDbGFzcygnYWN0aXZlJylcblxuICAgICAgIyBjYWxjdWxhdGUgcG9zaXRpb25zXG4gICAgICAjXG4gICAgICBtb3VzZUxlZnQgICAgID0gZS5wYWdlWCAtIEBjb250YWluZXIub2Zmc2V0KCkubGVmdFxuICAgICAgbW91c2VUb3AgICAgICA9IGUucGFnZVkgLSBAY29udGFpbmVyLm9mZnNldCgpLnRvcFxuICAgICAgcGxhblJpZ2h0ICAgICA9IEBjb250YWluZXIud2lkdGgoKVxuICAgICAgcGxhbkJvdHRvbSAgICA9IEBjb250YWluZXIuaGVpZ2h0KClcbiAgICAgIG1hcmtlckxlZnQgICAgPSBtb3VzZUxlZnQgLSAobWFya2VyLm91dGVyV2lkdGgoKSAvIDIpXG4gICAgICBtYXJrZXJUb3AgICAgID0gbW91c2VUb3AgLSAobWFya2VyLm91dGVySGVpZ2h0KCkgLyAyKVxuICAgICAgbWFya2VyUmlnaHQgICA9IG1vdXNlTGVmdCArIChtYXJrZXIub3V0ZXJXaWR0aCgpIC8gMilcbiAgICAgIG1hcmtlckJvdHRvbSAgPSBtb3VzZVRvcCArIChtYXJrZXIub3V0ZXJIZWlnaHQoKSAvIDIpXG4gICAgICBtYXJrZXJXaWR0aCAgID0gbWFya2VyLm91dGVyV2lkdGgoKVxuICAgICAgbWFya2VySGVpZ2h0ICA9IG1hcmtlci5vdXRlckhlaWdodCgpXG5cbiAgICAgICMgZmluZCB0aGUgbGVmdCBwb3NpdGlvbiBvZiB0aGUgbWFya2VyIGJhc2VkIG9uXG4gICAgICAjIHBvc2l0aW9uIG9mIHRoZSBtb3VzZSByZWxhdGl2ZSB0byB0aGUgcGxhblxuICAgICAgI1xuICAgICAgaWYgbWFya2VyTGVmdCA8PSAwXG4gICAgICAgIG1hcmtlclggPSAwXG4gICAgICBlbHNlIGlmIG1hcmtlclJpZ2h0IDwgcGxhblJpZ2h0XG4gICAgICAgIG1hcmtlclggPSBtYXJrZXJMZWZ0XG4gICAgICBlbHNlXG4gICAgICAgIG1hcmtlclggPSBwbGFuUmlnaHQgLSBtYXJrZXJXaWR0aFxuXG4gICAgICAjIGZpbmQgdGhlIGxlZnQgcG9zaXRpb24gb2YgdGhlIG1hcmtlciBiYXNlZCBvblxuICAgICAgIyBwb3NpdGlvbiBvZiB0aGUgbW91c2UgcmVsYXRpdmUgdG8gdGhlIHBsYW5cbiAgICAgICNcbiAgICAgIGlmIG1hcmtlclRvcCA8PSAwXG4gICAgICAgIG1hcmtlclkgPSAwXG4gICAgICBlbHNlIGlmIG1hcmtlckJvdHRvbSA8IHBsYW5Cb3R0b21cbiAgICAgICAgbWFya2VyWSA9IG1hcmtlclRvcFxuICAgICAgZWxzZVxuICAgICAgICBtYXJrZXJZID0gcGxhbkJvdHRvbSAtIG1hcmtlckhlaWdodFxuXG4gICAgICAjIHNldCB0aGUgcG9zaXRpb24gb2YgdGhlIG1hcmtlclxuICAgICAgI1xuICAgICAgbWFya2VyLmNzc1xuICAgICAgICBsZWZ0OiBtYXJrZXJYXG4gICAgICAgIHRvcDogbWFya2VyWVxuXG5jbGFzcyBQbGFuaXQuTWFya2VyXG5cbiAgY29uc3RydWN0b3I6IChAY29udGFpbmVyLCBpZCkgLT5cblxuICAgICMgU2V0IE9wdGlvbnNcbiAgICBAbWFya2Vyc0NvbnRhaW5lciA9IEBjb250YWluZXIuZmluZChcIi4je1BsYW5pdC5tYXJrZXJDb250YWluZXJDbGFzc31cIilcbiAgICBpZiBAY29udGFpbmVyLmZpbmQoXCIuI3tQbGFuaXQuaW1hZ2VDb250YWluZXJ9ID4gaW1nXCIpLmxlbmd0aCA+IDBcbiAgICAgIEBpbWFnZSA9IEBjb250YWluZXIuZmluZChcIi4je1BsYW5pdC5pbWFnZUNvbnRhaW5lcn0gPiBpbWdcIikuZmlyc3QoKVxuXG4gICAgIyBGaW5kIE1hcmtlclxuICAgIEBtYXJrZXIgPSBAbWFya2Vyc0NvbnRhaW5lci5maW5kKFxuICAgICAgXCIuI3tQbGFuaXQubWFya2VyQ2xhc3N9W2RhdGEtbWFya2VyPScje2lkfSddXCJcbiAgICApLmZpcnN0KClcblxuICAgICMgUmV0dXJuIHRoaXNcbiAgICBAXG5cbiAgIyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PSBDcmVhdGUgTmV3IE1hcmtlclxuXG4gIEBjcmVhdGU6IChvcHRpb25zKSAtPlxuICAgICMgbG9jYWwgcmVmZXJlbmNlc1xuICAgIGNvbnRhaW5lciA9IG9wdGlvbnMuY29udGFpbmVyXG4gICAgbWFya2Vyc0NvbnRhaW5lciA9IGNvbnRhaW5lci5maW5kKFwiLiN7UGxhbml0Lm1hcmtlckNvbnRhaW5lckNsYXNzfVwiKS5maXJzdCgpXG4gICAgIyBzZXQgb3B0aW9uc1xuICAgIG9wdGlvbnMucGxhbml0SUQgPSBQbGFuaXQucmFuZG9tU3RyaW5nKDIwKSB1bmxlc3Mgb3B0aW9ucy5wbGFuaXRJRFxuICAgIGlmIG9wdGlvbnMuY29sb3IgdGhlbiBjb2xvciA9IG9wdGlvbnMuY29sb3IgZWxzZSBjb2xvciA9ICcjRkM1QjNGJ1xuICAgICMgZmluZCBwb3NpdGlvblxuICAgIGxlZnQgPSAoKHBhcnNlRmxvYXQob3B0aW9ucy5jb29yZHNbMF0pIC8gMTAwKSAqIGNvbnRhaW5lci53aWR0aCgpKSAtIDE1XG4gICAgdG9wID0gKChwYXJzZUZsb2F0KG9wdGlvbnMuY29vcmRzWzFdKSAvIDEwMCkgKiBjb250YWluZXIuaGVpZ2h0KCkpIC0gMTVcbiAgICAjIGNyZWF0ZSB0aGUgbWFya2VyXG4gICAgbWFya2Vyc0NvbnRhaW5lci5hcHBlbmQoXG4gICAgICAkKCc8ZGl2PjwvZGl2PicpXG4gICAgICAgIC5hZGRDbGFzcyhQbGFuaXQubWFya2VyQ2xhc3MpXG4gICAgICAgIC5hdHRyXG4gICAgICAgICAgJ2RhdGEtbWFya2VyJzogb3B0aW9ucy5wbGFuaXRJRFxuICAgICAgICAgICdkYXRhLXhQYyc6IG9wdGlvbnMuY29vcmRzWzBdXG4gICAgICAgICAgJ2RhdGEteVBjJzogb3B0aW9ucy5jb29yZHNbMV1cbiAgICAgICAgLmNzc1xuICAgICAgICAgIGxlZnQ6IFwiI3tsZWZ0fXB4XCJcbiAgICAgICAgICB0b3A6IFwiI3t0b3B9cHhcIlxuICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogY29sb3JcbiAgICApXG4gICAgIyBmaW5kIHRoZSBtYXJrZXJcbiAgICBtYXJrZXIgPSBtYXJrZXJzQ29udGFpbmVyLmZpbmQoXCIuI3tQbGFuaXQubWFya2VyQ2xhc3N9XCIpLmxhc3QoKVxuICAgICMgYWRkIGNvbnRlbnQgYW5kIHN0eWxlcyBpZiBwYXNzZWQgYXMgb3B0aW9uc1xuICAgIGlmIG9wdGlvbnMuaWRcbiAgICAgIG1hcmtlci5hdHRyKCdkYXRhLWlkJzogb3B0aW9ucy5pZClcbiAgICBpZiBvcHRpb25zLmNsYXNzXG4gICAgICBtYXJrZXIuYWRkQ2xhc3Mob3B0aW9ucy5jbGFzcylcbiAgICBpZiBvcHRpb25zLmh0bWxcbiAgICAgIG1hcmtlci5odG1sKG9wdGlvbnMuaHRtbClcbiAgICBpZiBvcHRpb25zLnNpemVcbiAgICAgIG1hcmtlci5jc3NcbiAgICAgICAgd2lkdGg6IFwiI3tvcHRpb25zLnNpemV9cHhcIlxuICAgICAgICBoZWlnaHQ6IFwiI3tvcHRpb25zLnNpemV9cHhcIlxuICAgICMgc2V0dXAgZHJhZ2dhYmxlIGlmIG5lY2Vzc2FyeVxuICAgIGlmIG9wdGlvbnMuZHJhZ2dhYmxlXG4gICAgICBtYXJrZXIuYWRkQ2xhc3MoJ2RyYWdnYWJsZScpXG4gICAgICBtYXJrZXIub24gJ21vdXNlZG93bicsIChlKSA9PlxuICAgICAgICBpZiBlLndoaWNoID09IDFcbiAgICAgICAgICBtYXJrZXIgPSAkKGUudGFyZ2V0KS5jbG9zZXN0KFwiLiN7UGxhbml0Lm1hcmtlckNsYXNzfVwiKVxuICAgICAgICAgIG1hcmtlci5hZGRDbGFzcyhQbGFuaXQuZHJhZ2dpbmdDbGFzcylcbiAgICAgICAgICBtYXJrZXIuYXR0clxuICAgICAgICAgICAgJ2RhdGEtZHJhZy1zdGFydC14JzogZS5wYWdlWFxuICAgICAgICAgICAgJ2RhdGEtZHJhZy1zdGFydC15JzogZS5wYWdlWVxuICAgICMgc2V0dXAgaW5mb2JveCBpZiBuZWNlc3NhcnlcbiAgICBpZiBvcHRpb25zLmluZm9ib3hcbiAgICAgIGlkID0gUGxhbml0LnJhbmRvbVN0cmluZygxNilcbiAgICAgICMgc2V0IHN0eWxlIG9wdGlvbnMgb24gaW5mb2JveFxuICAgICAgaW5mb2JveCA9IG9wdGlvbnMuaW5mb2JveFxuICAgICAgaWYgaW5mb2JveC5wb3NpdGlvbiB0aGVuIHBvc2l0aW9uID0gaW5mb2JveC5wb3NpdGlvbiBlbHNlIHBvc2l0aW9uID0gJ3RvcCdcbiAgICAgIGlmIGluZm9ib3guYXJyb3cgdGhlbiBhcnJvdyA9IHRydWUgZWxzZSBhcnJvdyA9IGZhbHNlXG4gICAgICBpZiBhcnJvdyA9PSB0cnVlIHRoZW4gYXJyb3dDbGFzcyA9ICdhcnJvdycgZWxzZSBhcnJvd0NsYXNzID0gJydcbiAgICAgIGNsYXNzZXMgPSBcIiN7UGxhbml0LmluZm9ib3hDbGFzc30gI3twb3NpdGlvbn0gI3thcnJvd0NsYXNzfVwiXG4gICAgICAjIGFkZCBpbmZvYm94XG4gICAgICBjb250YWluZXIuZmluZChcIi4je1BsYW5pdC5pbmZvYm94Q29udGFpbmVyQ2xhc3N9XCIpLmFwcGVuZCBcIlwiXCJcbiAgICAgICAgPGRpdiBjbGFzcz1cIiN7Y2xhc3Nlc31cIiBpZD1cImluZm8tI3tpZH1cIlxuICAgICAgICAgIGRhdGEtcG9zaXRpb249XCIje3Bvc2l0aW9ufVwiPlxuICAgICAgICAgICAgI3tpbmZvYm94Lmh0bWx9XG4gICAgICAgIDwvZGl2PlxuICAgICAgICAgIFwiXCJcIlxuICAgICAgIyBhZGQgcG9zdC1vcHRpb25zIGlmIG5lY2Vzc2FyeVxuICAgICAgaWYgaW5mb2JveC5vZmZzZXRYXG4gICAgICAgIGNvbnRhaW5lci5maW5kKFwiLiN7UGxhbml0LmluZm9ib3hDbGFzc31cIikubGFzdCgpLmF0dHJcbiAgICAgICAgICAnZGF0YS1vZmZzZXQteCc6IGluZm9ib3gub2Zmc2V0WFxuICAgICAgaWYgaW5mb2JveC5vZmZzZXRZXG4gICAgICAgIGNvbnRhaW5lci5maW5kKFwiLiN7UGxhbml0LmluZm9ib3hDbGFzc31cIikubGFzdCgpLmF0dHJcbiAgICAgICAgICAnZGF0YS1vZmZzZXQteSc6IGluZm9ib3gub2Zmc2V0WVxuICAgICAgbWFya2VyLmF0dHIoJ2RhdGEtaW5mb2JveCcsIFwiaW5mby0je2lkfVwiKVxuICAgICAgbSA9IG5ldyBQbGFuaXQuTWFya2VyKGNvbnRhaW5lciwgb3B0aW9ucy5wbGFuaXRJRClcbiAgICAgIG0ucG9zaXRpb25JbmZvYm94KClcbiAgICAgIG1cblxuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBDYWxjdWxhdGlvbnNcblxuICBwb3NpdGlvbjogPT5cbiAgICB4UHggPSBAbWFya2VyLnBvc2l0aW9uKCkubGVmdCArIChAbWFya2VyLm91dGVyV2lkdGgoKSAvIDIpXG4gICAgeVB4ID0gQG1hcmtlci5wb3NpdGlvbigpLnRvcCArIChAbWFya2VyLm91dGVySGVpZ2h0KCkgLyAyKVxuICAgIGlmIEBpbWFnZVxuICAgICAgd0ltZyA9IEBpbWFnZS53aWR0aCgpXG4gICAgICBoSW1nID0gQGltYWdlLmhlaWdodCgpXG4gICAgICB4SW1nID0gcGFyc2VJbnQoQGltYWdlLmNzcygnbGVmdCcpKVxuICAgICAgeUltZyA9IHBhcnNlSW50KEBpbWFnZS5jc3MoJ3RvcCcpKVxuICAgICAgeFBjID0gKCh4UHggKyBNYXRoLmFicyh4SW1nKSkgLyB3SW1nKSAqIDEwMFxuICAgICAgeVBjID0gKCh5UHggKyBNYXRoLmFicyh5SW1nKSkgLyBoSW1nKSAqIDEwMFxuICAgIGVsc2VcbiAgICAgIHhQYyA9ICh4UHggLyBAY29udGFpbmVyLndpZHRoKCkpICogMTAwXG4gICAgICB5UGMgPSAoeVB4IC8gQGNvbnRhaW5lci5oZWlnaHQoKSkgKiAxMDBcbiAgICBbeFBjLCB5UGNdXG5cbiAgcmVsYXRpdmVQb3NpdGlvbjogPT5cbiAgICB4UHggPSBAbWFya2VyLnBvc2l0aW9uKCkubGVmdCArIChAbWFya2VyLm91dGVyV2lkdGgoKSAvIDIpXG4gICAgeVB4ID0gQG1hcmtlci5wb3NpdGlvbigpLnRvcCArIChAbWFya2VyLm91dGVySGVpZ2h0KCkgLyAyKVxuICAgIHhQYyA9ICh4UHggLyBAY29udGFpbmVyLndpZHRoKCkpICogMTAwXG4gICAgeVBjID0gKHlQeCAvIEBjb250YWluZXIuaGVpZ2h0KCkpICogMTAwXG4gICAgW3hQYywgeVBjXVxuXG4gICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIEF0dHJpYnV0ZXNcblxuICBjb2xvcjogPT5cbiAgICBAbWFya2VyLmNzcygnYmFja2dyb3VuZENvbG9yJylcblxuICBwbGFuaXRJRDogPT5cbiAgICBAbWFya2VyLmF0dHIoJ2RhdGEtbWFya2VyJylcblxuICBpZDogPT5cbiAgICBAbWFya2VyLmF0dHIoJ2RhdGEtaWQnKVxuXG4gICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIEluZm9ib3hcblxuICBpbmZvYm94OiA9PlxuICAgIGluZm9ib3ggPSBAY29udGFpbmVyLmZpbmQoXCIjI3tAbWFya2VyLmF0dHIoJ2RhdGEtaW5mb2JveCcpfVwiKVxuICAgIGlmIGluZm9ib3gubGVuZ3RoID4gMCB0aGVuIGluZm9ib3ggZWxzZSBudWxsXG5cbiAgaW5mb2JveEhUTUw6ID0+XG4gICAgaWYgQGluZm9ib3goKSAmJiBAaW5mb2JveCgpLmxlbmd0aCA+IDAgdGhlbiBAaW5mb2JveCgpLmh0bWwoKSBlbHNlIG51bGxcblxuICBpbmZvYm94VmlzaWJsZTogPT5cbiAgICBAaW5mb2JveCgpICYmIEBpbmZvYm94KCkuaGFzQ2xhc3MoJ2FjdGl2ZScpXG5cbiAgaGlkZUluZm9ib3g6ID0+XG4gICAgQGluZm9ib3goKS5hZGRDbGFzcygnaGlkZGVuJykgaWYgQGluZm9ib3hWaXNpYmxlKClcblxuICBzaG93SW5mb2JveDogPT5cbiAgICBAaW5mb2JveCgpLmFkZENsYXNzKCdhY3RpdmUnKSBpZiBAaW5mb2JveCgpICYmICFAaW5mb2JveFZpc2libGUoKVxuICAgIEB1bmhpZGVJbmZvYm94KClcblxuICB1bmhpZGVJbmZvYm94OiA9PlxuICAgIEBpbmZvYm94KCkucmVtb3ZlQ2xhc3MoJ2hpZGRlbicpIGlmIEBpbmZvYm94VmlzaWJsZSgpXG5cbiAgaW5mb2JveENvb3JkczogPT5cbiAgICBpbmZvYm94ID0gQGNvbnRhaW5lci5maW5kKFwiIyN7QG1hcmtlci5hdHRyKCdkYXRhLWluZm9ib3gnKX1cIilcbiAgICBtYXJrZXJDZW50ZXJYID0gKHBhcnNlRmxvYXQoQHJlbGF0aXZlUG9zaXRpb24oKVswXSAvIDEwMCkgKiBAY29udGFpbmVyLndpZHRoKCkpXG4gICAgbWFya2VyQ2VudGVyWSA9IChwYXJzZUZsb2F0KEByZWxhdGl2ZVBvc2l0aW9uKClbMV0gLyAxMDApICogQGNvbnRhaW5lci5oZWlnaHQoKSlcbiAgICBpV2lkdGggPSBpbmZvYm94Lm91dGVyV2lkdGgoKVxuICAgIGlIYWxmV2lkdGggPSBpV2lkdGggLyAyXG4gICAgaUhlaWdodCA9IGluZm9ib3gub3V0ZXJIZWlnaHQoKVxuICAgIGlIYWxmSGVpZ2h0ID0gaUhlaWdodCAvIDJcbiAgICBjV2lkdGggPSBAY29udGFpbmVyLndpZHRoKClcbiAgICBjSGVpZ2h0ID0gQGNvbnRhaW5lci5oZWlnaHQoKVxuICAgIG1XaWR0aCA9IEBtYXJrZXIub3V0ZXJXaWR0aCgpXG4gICAgbUhhbGZXaWR0aCA9IG1XaWR0aCAvIDJcbiAgICBtSGVpZ2h0ID0gQG1hcmtlci5vdXRlckhlaWdodCgpXG4gICAgbUhhbGZIZWlnaHQgPSBtSGVpZ2h0IC8gMlxuICAgIGJ1ZmZlciA9IDVcbiAgICBvZmZzZXRYID0gcGFyc2VJbnQoaW5mb2JveC5hdHRyKCdkYXRhLW9mZnNldC14JykpXG4gICAgb2Zmc2V0WCA9IDAgdW5sZXNzIG9mZnNldFhcbiAgICBvZmZzZXRZID0gcGFyc2VJbnQoaW5mb2JveC5hdHRyKCdkYXRhLW9mZnNldC15JykpXG4gICAgb2Zmc2V0WSA9IDAgdW5sZXNzIG9mZnNldFlcbiAgICBzd2l0Y2ggaW5mb2JveC5hdHRyKCdkYXRhLXBvc2l0aW9uJylcbiAgICAgIHdoZW4gJ3RvcCdcbiAgICAgICAgaW5mb0xlZnQgPSBtYXJrZXJDZW50ZXJYIC0gaUhhbGZXaWR0aFxuICAgICAgICBpbmZvVG9wID0gbWFya2VyQ2VudGVyWSAtIGlIZWlnaHQgLSBtSGFsZkhlaWdodCAtIGJ1ZmZlclxuICAgICAgd2hlbiAncmlnaHQnXG4gICAgICAgIGluZm9MZWZ0ID0gbWFya2VyQ2VudGVyWCArIG1IYWxmV2lkdGggKyBidWZmZXJcbiAgICAgICAgaW5mb1RvcCA9IG1hcmtlckNlbnRlclkgLSBpSGFsZkhlaWdodFxuICAgICAgd2hlbiAnYm90dG9tJ1xuICAgICAgICBpbmZvTGVmdCA9IG1hcmtlckNlbnRlclggLSBpSGFsZldpZHRoXG4gICAgICAgIGluZm9Ub3AgPSBtYXJrZXJDZW50ZXJZICsgbUhhbGZIZWlnaHQgKyBidWZmZXJcbiAgICAgIHdoZW4gJ2xlZnQnXG4gICAgICAgIGluZm9MZWZ0ID0gbWFya2VyQ2VudGVyWCAtIGlXaWR0aCAtIG1IYWxmV2lkdGggLSBidWZmZXJcbiAgICAgICAgaW5mb1RvcCA9IG1hcmtlckNlbnRlclkgLSBpSGFsZkhlaWdodFxuICAgICAgd2hlbiAndG9wLWxlZnQnXG4gICAgICAgIGluZm9MZWZ0ID0gbWFya2VyQ2VudGVyWCAtIGlXaWR0aCAtIG1IYWxmV2lkdGggKyBidWZmZXJcbiAgICAgICAgaW5mb1RvcCA9IG1hcmtlckNlbnRlclkgLSBpSGVpZ2h0IC0gbUhhbGZIZWlnaHQgKyBidWZmZXJcbiAgICAgIHdoZW4gJ3RvcC1yaWdodCdcbiAgICAgICAgaW5mb0xlZnQgPSBtYXJrZXJDZW50ZXJYICsgbUhhbGZXaWR0aCAtIGJ1ZmZlclxuICAgICAgICBpbmZvVG9wID0gbWFya2VyQ2VudGVyWSAtIGlIZWlnaHQgLSBtSGFsZkhlaWdodCArIGJ1ZmZlclxuICAgICAgd2hlbiAnYm90dG9tLWxlZnQnXG4gICAgICAgIGluZm9MZWZ0ID0gbWFya2VyQ2VudGVyWCAtIGlXaWR0aCAtIG1IYWxmV2lkdGggKyBidWZmZXJcbiAgICAgICAgaW5mb1RvcCA9IG1hcmtlckNlbnRlclkgKyBtSGFsZkhlaWdodCAtIGJ1ZmZlclxuICAgICAgd2hlbiAnYm90dG9tLXJpZ2h0J1xuICAgICAgICBpbmZvTGVmdCA9IG1hcmtlckNlbnRlclggKyBtSGFsZldpZHRoIC0gYnVmZmVyXG4gICAgICAgIGluZm9Ub3AgPSBtYXJrZXJDZW50ZXJZICsgbUhhbGZIZWlnaHQgLSBidWZmZXJcbiAgICBsZWZ0OiBpbmZvTGVmdCArIG9mZnNldFhcbiAgICB0b3A6IGluZm9Ub3AgKyBvZmZzZXRZXG5cbiAgcG9zaXRpb25JbmZvYm94OiA9PlxuICAgIGNvb3JkcyA9IEBpbmZvYm94Q29vcmRzKClcbiAgICBAY29udGFpbmVyLmZpbmQoXCIjI3tAbWFya2VyLmF0dHIoJ2RhdGEtaW5mb2JveCcpfVwiKS5jc3NcbiAgICAgIGxlZnQ6IFwiI3tjb29yZHMubGVmdH1weFwiXG4gICAgICB0b3A6IFwiI3tjb29yZHMudG9wfXB4XCJcbiAgICBAcG9zaXRpb24oKVxuXG4gIGFuaW1hdGVJbmZvYm94OiA9PlxuICAgIGNvb3JkcyA9IEBpbmZvYm94Q29vcmRzKClcbiAgICBAY29udGFpbmVyLmZpbmQoXCIjI3tAbWFya2VyLmF0dHIoJ2RhdGEtaW5mb2JveCcpfVwiKS5hbmltYXRlXG4gICAgICBsZWZ0OiBcIiN7Y29vcmRzLmxlZnR9cHhcIlxuICAgICAgdG9wOiBcIiN7Y29vcmRzLnRvcH1weFwiXG4gICAgLCAyNTAsICgpID0+XG4gICAgICByZXR1cm4gQHBvc2l0aW9uKClcblxuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBEcmFnZ2luZ1xuXG4gIGlzRHJhZ2dhYmxlOiA9PlxuICAgIEBtYXJrZXIuaGFzQ2xhc3MoJ2RyYWdnYWJsZScpXG5cbiAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gQWN0aW9uc1xuXG4gIHNldDogPT5cbiAgICBsZWZ0ID0gKEBpbWFnZS53aWR0aCgpICogKEBtYXJrZXIuYXR0cignZGF0YS14UGMnKSAvIDEwMCkpICtcbiAgICAgIHBhcnNlRmxvYXQoQGltYWdlLmNzcygnbGVmdCcpKSAtIChAbWFya2VyLm91dGVyV2lkdGgoKSAvIDIpXG4gICAgdG9wID0gKEBpbWFnZS5oZWlnaHQoKSAqIChAbWFya2VyLmF0dHIoJ2RhdGEteVBjJykgLyAxMDApKSArXG4gICAgICBwYXJzZUZsb2F0KEBpbWFnZS5jc3MoJ3RvcCcpKSAtIChAbWFya2VyLm91dGVySGVpZ2h0KCkgLyAyKVxuICAgIEBtYXJrZXIuY3NzXG4gICAgICBsZWZ0OiBcIiN7bGVmdH1weFwiXG4gICAgICB0b3A6IFwiI3t0b3B9cHhcIlxuICAgIEBwb3NpdGlvbkluZm9ib3goKVxuICAgIFtsZWZ0LCB0b3BdXG5cbiAgc2F2ZVBvc2l0aW9uOiA9PlxuICAgIGNvb3JkcyA9IEBwb3NpdGlvbigpXG4gICAgQG1hcmtlci5hdHRyXG4gICAgICAnZGF0YS14UGMnOiBjb29yZHNbMF1cbiAgICAgICdkYXRhLXlQYyc6IGNvb3Jkc1sxXVxuXG4gIHVwZGF0ZTogKG9wdGlvbnMpID0+XG4gICAgaWYgb3B0aW9ucy5jb2xvclxuICAgICAgQG1hcmtlci5jc3MoYmFja2dyb3VuZENvbG9yOiBvcHRpb25zLmNvbG9yKVxuICAgIGlmIG9wdGlvbnMuaW5mb2JveFxuICAgICAgQG1hcmtlci5maW5kKFwiLiN7UGxhbml0LmluZm9ib3hDbGFzc31cIikuaHRtbChvcHRpb25zLmluZm9ib3gpXG4gICAgICBAcG9zaXRpb25JbmZvYm94KClcbiAgICBpZiBvcHRpb25zLmRyYWdnYWJsZVxuICAgICAgQG1hcmtlci5yZW1vdmVDbGFzcygnZHJhZ2dhYmxlJylcbiAgICAgIEBtYXJrZXIuYWRkQ2xhc3MoJ2RyYWdnYWJsZScpIGlmIG9wdGlvbnMuZHJhZ2dhYmxlID09IHRydWVcbiAgICBpZiBvcHRpb25zLmNvb3Jkc1xuICAgICAgbGVmdCA9ICgocGFyc2VGbG9hdChvcHRpb25zLmNvb3Jkc1swXSkgLyAxMDApICogQGNvbnRhaW5lci53aWR0aCgpKSAtIDE1XG4gICAgICB0b3AgPSAoKHBhcnNlRmxvYXQob3B0aW9ucy5jb29yZHNbMV0pIC8gMTAwKSAqIEBjb250YWluZXIuaGVpZ2h0KCkpIC0gMTVcbiAgICAgIEBtYXJrZXIuY3NzXG4gICAgICAgIGxlZnQ6IFwiI3tsZWZ0fXB4XCJcbiAgICAgICAgdG9wOiBcIiN7dG9wfXB4XCJcblxuICByZW1vdmU6ID0+XG4gICAgQGluZm9ib3goKS5yZW1vdmUoKSBpZiBAaW5mb2JveCgpXG4gICAgQG1hcmtlci5yZW1vdmUoKVxuXG4jIGF0dGFjaGVzIHRoZSBQbGFuaXQgY2xhc3MgdG8gYSBnbG9iYWwgcGxhbml0IHZhcmlhYmxlXG53aW5kb3cucGxhbml0ID0gbmV3IFBsYW5pdFxuIl19