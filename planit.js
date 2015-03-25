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
  var animateBackground, animateMarkers, containerHeight, containerWidth, draggingMarker, getEventPosition, imgHeight, imgHeightClickIncrement, imgOffsetLeft, imgOffsetTop, imgWidth, imgWidthClickIncrement, initCanvasMarkers, initContainer, initEvents, initImage, initMarkers, initMethods, initOptions, initZoomControls, initZoomable, mousemove, mouseup, positionInfoboxes, resize, setBackground, setMarkers, zDblClick, zEventPosition, zMouseDown, zMouseMove, zMouseUp;

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
    $(document).on('mouseup', (function(_this) {
      return function(e) {
        return mouseup.call(_this, e);
      };
    })(this));
    return $(window).resize((function(_this) {
      return function(e) {
        return resize.call(_this, e);
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
    setBackground.call(this);
    return true;
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
    animateBackground.call(this);
    return true;
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
      animateBackground.call(this);
      return true;
    } else {
      return false;
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
      if (this.options.markerDragEnd) {
        this.options.markerDragEnd(e, m);
      }
      m.savePosition();
      m.positionInfobox();
      draggingMarker.call(this).removeClass(Planit.draggingClass);
    }
    if ($(e.target).hasClass(Planit.markerContainerClass)) {
      if (this.options.canvasClick) {
        this.options.canvasClick(e, getEventPosition.call(this, e));
      }
    }
    if ($(e.target).hasClass(Planit.markerClass) || $(e.target).parents("." + Planit.markerClass).length > 0) {
      if ($(e.target).hasClass(Planit.markerClass)) {
        marker = $(e.target);
      } else {
        marker = $(e.target).parents("." + Planit.markerClass).first();
      }
      m = new Planit.Marker(this.container, marker.attr('data-marker'));
      if (this.options.markerClick) {
        this.options.markerClick(e, m);
      }
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

  resize = function(e) {
    var j, len, m, marker, ref, results;
    if (this.image) {
      this.resetImage();
      this.container.height(this.image.height());
    }
    ref = this.markersContainer.find('.planit-marker');
    results = [];
    for (j = 0, len = ref.length; j < len; j++) {
      marker = ref[j];
      m = new Planit.Marker(this.container, $(marker).attr('data-marker'));
      results.push(m.set());
    }
    return results;
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
    this.animateInfobox = bind(this.animateInfobox, this);
    this.positionInfobox = bind(this.positionInfobox, this);
    this.infoboxCoords = bind(this.infoboxCoords, this);
    this.unhideInfobox = bind(this.unhideInfobox, this);
    this.showInfobox = bind(this.showInfobox, this);
    this.hideInfobox = bind(this.hideInfobox, this);
    this.infoboxVisible = bind(this.infoboxVisible, this);
    this.infoboxHTML = bind(this.infoboxHTML, this);
    this.infobox = bind(this.infobox, this);
    this.isDraggable = bind(this.isDraggable, this);
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

  Marker.prototype.isDraggable = function() {
    return this.marker.hasClass('draggable');
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
      this.infobox().addClass('hidden');
      return true;
    } else {
      return false;
    }
  };

  Marker.prototype.showInfobox = function() {
    if (this.infobox() && !this.infoboxVisible()) {
      this.infobox().addClass('active');
      this.unhideInfobox();
      return true;
    } else {
      return false;
    }
  };

  Marker.prototype.unhideInfobox = function() {
    if (this.infoboxVisible()) {
      this.infobox().removeClass('hidden');
      return true;
    } else {
      return false;
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

  Marker.prototype.set = function() {
    var left, top;
    if (this.image) {
      left = (this.image.width() * (this.marker.attr('data-xPc') / 100)) + parseFloat(this.image.css('left')) - (this.marker.outerWidth() / 2);
      top = (this.image.height() * (this.marker.attr('data-yPc') / 100)) + parseFloat(this.image.css('top')) - (this.marker.outerHeight() / 2);
    } else {
      left = (this.container.width() * (this.marker.attr('data-xPc') / 100)) - (this.marker.outerWidth() / 2);
      top = (this.container.height() * (this.marker.attr('data-yPc') / 100)) - (this.marker.outerHeight() / 2);
    }
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
    this.marker.attr({
      'data-xPc': coords[0],
      'data-yPc': coords[1]
    });
    return coords;
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
      this.marker.css({
        left: left + "px",
        top: top + "px"
      });
    }
    return true;
  };

  Marker.prototype.remove = function() {
    if (this.infobox()) {
      this.infobox().remove();
    }
    this.marker.remove();
    return true;
  };

  return Marker;

})();

window.planit = new Planit;

//# sourceMappingURL=data:application/json;base64,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LENBQVUsQ0FBQyxNQUFYLENBQUEsQ0FBQSxDQUFBO0tBQUE7QUFBQSxJQUNBLElBQUMsQ0FBQSxNQUFNLENBQUMsTUFBUixDQUFBLENBREEsQ0FBQTtXQUVBLEtBSE07RUFBQSxDQWhVUixDQUFBOztnQkFBQTs7SUFqbEJGLENBQUE7O0FBQUEsTUF1NUJNLENBQUMsTUFBUCxHQUFnQixHQUFBLENBQUEsTUF2NUJoQixDQUFBIiwiZmlsZSI6InBsYW5pdC10bXAuanMiLCJzb3VyY2VSb290IjoiL3NvdXJjZS8iLCJzb3VyY2VzQ29udGVudCI6WyJjbGFzcyBQbGFuaXRcblxuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBET00gUmVmZXJlbmNlc1xuXG4gIEBjb250YWluZXJDbGFzczogICAgICAgICdwbGFuaXQtY29udGFpbmVyJ1xuICBAZHJhZ2dpbmdDbGFzczogICAgICAgICAnaXMtZHJhZ2dpbmcnXG4gIEBpbWFnZUNvbnRhaW5lcjogICAgICAgICdwbGFuaXQtaW1hZ2UtY29udGFpbmVyJ1xuICBAaW5mb2JveENsYXNzOiAgICAgICAgICAncGxhbml0LWluZm9ib3gnXG4gIEBpbmZvYm94Q29udGFpbmVyQ2xhc3M6ICdwbGFuaXQtaW5mb2JveC1jb250YWluZXInXG4gIEBtYXJrZXJDbGFzczogICAgICAgICAgICdwbGFuaXQtbWFya2VyJ1xuICBAbWFya2VyQ29udGFpbmVyQ2xhc3M6ICAncGxhbml0LW1hcmtlcnMtY29udGFpbmVyJ1xuICBAbWFya2VyQ29udGVudENsYXNzOiAgICAncGxhbml0LW1hcmtlci1jb250ZW50J1xuXG4gICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIEluc3RhbnRpYXRpb25cblxuICBuZXc6IChAb3B0aW9ucyA9IHt9KSAtPlxuICAgIHJldHVybiBuZXcgUGxhbml0LlBsYW4oQG9wdGlvbnMpXG5cbiAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gR2xvYmFsIEhlbHBlcnNcblxuICBAcmFuZG9tU3RyaW5nOiAobGVuZ3RoID0gMTYpIC0+XG4gICAgc3RyID0gTWF0aC5yYW5kb20oKS50b1N0cmluZygzNikuc2xpY2UoMilcbiAgICBzdHIgPSBzdHIgKyBNYXRoLnJhbmRvbSgpLnRvU3RyaW5nKDM2KS5zbGljZSgyKVxuICAgIHN0ci5zdWJzdHJpbmcoMCwgbGVuZ3RoIC0gMSlcblxuY2xhc3MgUGxhbml0LlBsYW5cblxuICAjIFRoaXMgY2FsbHMgbWV0aG9kcyB0byBpbnN0YW50aWF0ZSBhIG5ldyBwbGFuLiBGb3VuZCBpblxuICAjIHBsYW4vaW5pdC5jb2ZmZWVcbiAgI1xuICBjb25zdHJ1Y3RvcjogKEBvcHRpb25zID0ge30pIC0+XG4gICAgbWV0aG9kLmNhbGwoQCkgZm9yIG1ldGhvZCBpbiBpbml0TWV0aG9kcygpXG5cbiAgIyAocHJpdmF0ZSkgTWV0aG9kcyAoaW4gb3JkZXIpIG5lZWRlZCB0byBpbnN0YW50aWF0ZSB0aGlzXG4gICMgb2JqZWN0XG4gICNcbiAgaW5pdE1ldGhvZHMgPSAtPlxuICAgIFtpbml0T3B0aW9ucywgaW5pdENvbnRhaW5lciwgaW5pdEltYWdlLCBpbml0Q2FudmFzTWFya2VycywgaW5pdEV2ZW50c11cblxuXG4gICMgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0gT3B0aW9uc1xuXG4gICMgKHByaXZhdGUpIEFkZCBkZWZhdWx0IG9wdGlvbnMgaWYgdGhlIG5lY2Vzc2FyeSBvcHRpb25zXG4gICMgYXJlIG1pc3NpbmdcbiAgI1xuICBpbml0T3B0aW9ucyA9IC0+XG4gICAgaWYgQG9wdGlvbnMuY29udGFpbmVyXG4gICAgICBAb3B0aW9ucy5jb250YWluZXIgPSAkKFwiIyN7QG9wdGlvbnMuY29udGFpbmVyfVwiKVxuICAgIGVsc2VcbiAgICAgIEBvcHRpb25zLmNvbnRhaW5lciA9ICQoJyNwbGFuaXQnKVxuICAgICMgZGlyZWN0IGFjY2VzcyB0byBwbGFuaXQgY29udGFpbmVyXG4gICAgQGNvbnRhaW5lciA9IEBvcHRpb25zLmNvbnRhaW5lclxuXG4gICMgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0gQ29udGFpbmVyXG5cbiAgIyAocHJpdmF0ZSkgRHJhdyB0aGUgY29udGFpbmVyIGFuZCB0aGUgc3ViY29udGFpbmVyc1xuICAjXG4gIGluaXRDb250YWluZXIgPSAtPlxuICAgIEBjb250YWluZXIuYWRkQ2xhc3MoUGxhbml0LmNvbnRhaW5lckNsYXNzKVxuICAgIEBjb250YWluZXIuYXBwZW5kIFwiXCJcIlxuICAgICAgPGRpdiBjbGFzcz1cIiN7UGxhbml0LmluZm9ib3hDb250YWluZXJDbGFzc31cIj48L2Rpdj5cbiAgICAgIDxkaXYgY2xhc3M9XCIje1BsYW5pdC5tYXJrZXJDb250YWluZXJDbGFzc31cIj48L2Rpdj5cbiAgICAgICAgXCJcIlwiXG4gICAgQG1hcmtlcnNDb250YWluZXIgPSBAY29udGFpbmVyLmZpbmQoXCIuI3tQbGFuaXQubWFya2VyQ29udGFpbmVyQ2xhc3N9XCIpXG4gICAgICAuZmlyc3QoKSAjIGRpcmVjdCBhY2Nlc3MgdG8gbWFya2VycyBjb250YWluZXJcblxuICAjID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09IEJhY2tncm91bmQgSW1hZ2VcblxuICAjIChwcml2YXRlKSBDcmVhdGUgaW1hZ2UgY29udGFpbmVyIGFuZCBhZGQgaW1hZ2UgaWZcbiAgIyBuZWNlc3NhcnlcbiAgI1xuICBpbml0SW1hZ2UgPSAtPlxuICAgIGlmIEBvcHRpb25zLmltYWdlICYmIEBvcHRpb25zLmltYWdlLnVybFxuICAgICAgQGNvbnRhaW5lci5wcmVwZW5kIFwiXCJcIlxuICAgICAgICA8ZGl2IGNsYXNzPVwiI3tQbGFuaXQuaW1hZ2VDb250YWluZXJ9XCI+XG4gICAgICAgICAgPGltZyBzcmM9XCIje0BvcHRpb25zLmltYWdlLnVybH1cIj5cbiAgICAgICAgPC9kaXY+XG4gICAgICBcIlwiXCJcbiAgICAgIEBpbWFnZSA9IEBjb250YWluZXIuZmluZCgnaW1nJykuZmlyc3QoKVxuICAgICAgQGltYWdlLmxvYWQgKCkgPT5cbiAgICAgICAgQGNvbnRhaW5lci5jc3MoaGVpZ2h0OiBAaW1hZ2UuaGVpZ2h0KCkpXG4gICAgICAgIGluaXRab29tYWJsZS5jYWxsKEApXG4gICAgICAgIGluaXRNYXJrZXJzLmNhbGwoQClcblxuICAjID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09IFpvb21pbmdcblxuICAjIChwcml2YXRlKSBTZXRzIG91ciByZWZlcmVuY2VzIGZvciB3b3JraW5nIHdpdGggem9vbSwgYW5kXG4gICMgY29udHJvbHMgd2hldGhlciBvciBub3QgdG8gYWRkIGNvbnRyb2xzXG4gICNcbiAgaW5pdFpvb21hYmxlID0gLT5cbiAgICAjIGFkZCB6b29tIElEIHRvIG1hcmtlcnMgY29udGFpbmVyXG4gICAgQHpvb21JZCA9IFBsYW5pdC5yYW5kb21TdHJpbmcoKVxuICAgIEBtYXJrZXJzQ29udGFpbmVyLmF0dHIoJ2RhdGEtem9vbS1pZCcsIEB6b29tSWQpXG4gICAgIyBzZXQgaW5pdGlhbCBiYWNrZ3JvdW5kIGNvb3JkaW5hdGVzXG4gICAgQHJlc2V0SW1hZ2UoKVxuICAgICMgYWRkIHpvb20gY29udHJvbHMgaWYgbmVjZXNzYXJ5XG4gICAgaW5pdFpvb21Db250cm9scy5jYWxsKEApIGlmIEBvcHRpb25zLmltYWdlLnpvb21cblxuICAjIChwcml2YXRlKSBSZW5kZXIgdGhlIHpvb20gY29udHJvbHMgYW5kIGJpbmRzIG5lY2Vzc2FyeVxuICAjIGV2ZW50c1xuICAjXG4gIGluaXRab29tQ29udHJvbHMgPSAtPlxuICAgICMgZHJhdyB0aGUgY29udHJvbHMgZGlua3VzXG4gICAgQGNvbnRhaW5lci5wcmVwZW5kIFwiXCJcIlxuICAgICAgPGRpdiBjbGFzcz1cInBsYW5pdC1jb250cm9sc1wiPlxuICAgICAgICA8YSBocmVmPVwiI1wiIGNsYXNzPVwiem9vbVwiIGRhdGEtYWN0aW9uPVwiaW5cIj4rPC9hPlxuICAgICAgICA8YSBocmVmPVwiI1wiIGNsYXNzPVwiem9vbVwiIGRhdGEtYWN0aW9uPVwib3V0XCI+LTwvYT5cbiAgICAgIDwvZGl2PlxuICAgIFwiXCJcIlxuICAgIEBjb250YWluZXIuZmluZChcIi56b29tW2RhdGEtYWN0aW9uPSdpbiddXCIpLmNsaWNrIChlKSA9PlxuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICBAem9vbUluKClcbiAgICBAY29udGFpbmVyLmZpbmQoXCIuem9vbVtkYXRhLWFjdGlvbj0nb3V0J11cIikuY2xpY2sgKGUpID0+XG4gICAgICBlLnByZXZlbnREZWZhdWx0KClcbiAgICAgIEB6b29tT3V0KClcbiAgICAjIGJpbmQgZHJhZ2dhYmxlIGV2ZW50c1xuICAgIEBjb250YWluZXIub24gICAnZGJsY2xpY2snLCAoZSkgPT5cbiAgICAgIHpEYmxDbGljay5jYWxsKEAsIGUpXG4gICAgQGNvbnRhaW5lci5vbiAgICdtb3VzZWRvd24nLCAoZSkgPT5cbiAgICAgIHpNb3VzZURvd24uY2FsbChALCBlKVxuICAgICQoZG9jdW1lbnQpLm9uICAnbW91c2Vtb3ZlJywgKGUpID0+XG4gICAgICB6TW91c2VNb3ZlLmNhbGwoQCwgZSlcbiAgICAkKGRvY3VtZW50KS5vbiAgJ21vdXNldXAnLCAoZSkgPT5cbiAgICAgIHpNb3VzZVVwLmNhbGwoQCwgZSlcblxuICAjID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09IE1hcmtlcnNcblxuICAjIChwcml2YXRlKSBXaWxsIGNhbGwgaW5pdE1hcmtlcnMgaWYgdGhlcmUgaXMgbm8gaW1hZ2UsXG4gICMgb3RoZXJ3aXNlIGl0J3MgY2FsbGVkIGZyb20gaW5pdEltYWdlLCB3aGljaCB3YWl0cyBmb3JcbiAgIyB0aGUgaW1hZ2UgdG8gYmUgbG9hZGVkLlxuICAjXG4gIGluaXRDYW52YXNNYXJrZXJzID0gLT5cbiAgICBpbml0TWFya2Vycy5jYWxsKEApIHVubGVzcyBAb3B0aW9ucy5pbWFnZSAmJiBAb3B0aW9ucy5pbWFnZS51cmxcblxuICAjIEludGVydmFsIG1ldGhvZCB0aGF0IGNvbnRpbnVlcyB0byBjaGVjayBmb3IgaW1hZ2UgYmVpbmdcbiAgIyBsb2FkZWQgYmVmb3JlIGFkZGluZyBtYXJrZXJzIHRvIHRoZSBwbGFuXG4gICNcbiAgaW5pdE1hcmtlcnMgPSAtPlxuICAgIGlmIEBvcHRpb25zLm1hcmtlcnMgJiYgQG9wdGlvbnMubWFya2Vycy5sZW5ndGggPiAwXG4gICAgICBmb3IgbWFya2VyIGluIEBvcHRpb25zLm1hcmtlcnNcbiAgICAgICAgbWFya2VyLmNvbnRhaW5lciA9IEBjb250YWluZXJcbiAgICAgICAgUGxhbml0Lk1hcmtlci5jcmVhdGUobWFya2VyKVxuXG4gICMgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0gUGxhbiBFdmVudHNcblxuICAjIChwcml2YXRlKSBCaW5kIGV2ZW50cyB0byB0aGUgcGxhbi4gVGhlc2UgZXZlbnRzIGRlYWxcbiAgIyBtb3N0bHkgd2l0aCBtYXJrZXJzLCBzaW5jZSBzb21lIGV2ZW50IHNob3VsZCBiZSBhdHRhY2hlZFxuICAjIHRvIHRoZSBwbGFuIGFuZCBsYXRlciBmaW5kIHRoZSBhcHByb3ByaWF0ZSBtYXJrZXJcbiAgI1xuICBpbml0RXZlbnRzID0gLT5cbiAgICBpZiBAY29udGFpbmVyLmZpbmQoXCIuI3tQbGFuaXQuaW1hZ2VDb250YWluZXJ9ID4gaW1nXCIpLmxlbmd0aCA+IDBcbiAgICAgIEBpbWFnZSA9IEBjb250YWluZXIuZmluZChcIi4je1BsYW5pdC5pbWFnZUNvbnRhaW5lcn0gPiBpbWdcIikuZmlyc3QoKVxuICAgICQoZG9jdW1lbnQpLm9uICdtb3VzZW1vdmUnLCAoZSkgPT5cbiAgICAgIG1vdXNlbW92ZS5jYWxsKEAsIGUpXG4gICAgJChkb2N1bWVudCkub24gJ21vdXNldXAnLCAoZSkgPT5cbiAgICAgIG1vdXNldXAuY2FsbChALCBlKVxuICAgICQod2luZG93KS5yZXNpemUgKGUpID0+XG4gICAgICByZXNpemUuY2FsbChALCBlKVxuXG5cbiAgIyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PSBTZXR0aW5nIEltYWdlXG5cbiAgIyBab29tIHRoZSBpbWFnZSBvdXQgYWxsIHRoZSB3YXkgYW5kIHNldHMgdGhlIG1hcmtlcnNcbiAgIyBhcHByb3ByaWF0ZWx5XG4gICNcbiAgcmVzZXRJbWFnZTogPT5cbiAgICBAaW1hZ2VQb3NpdGlvbiA9XG4gICAgICBsZWZ0UHg6ICAgICAgICAgMFxuICAgICAgdG9wUHg6ICAgICAgICAgIDBcbiAgICAgIHdpZHRoOiAgICAgICAgICBAaW1hZ2Uud2lkdGgoKVxuICAgICAgaGVpZ2h0OiAgICAgICAgIEBpbWFnZS5oZWlnaHQoKVxuICAgICAgc2NhbGU6ICAgICAgICAgIDFcbiAgICAgIGluY3JlbWVudDogICAgICAwLjVcbiAgICBzZXRCYWNrZ3JvdW5kLmNhbGwoQClcbiAgICB0cnVlXG5cbiAgIyAocHJpdmF0ZSkgTW92ZXMgdGhlIGJhY2tncm91bmQgYW5kIG1hcmtlcnMgd2l0aG91dFxuICAjIGFuaW1hdGlvbiB0byB0aGUgbG9jYXRpb24gc2V0IGJ5IHRoZSBpbWFnZVBvc2l0aW9uXG4gICMgcHJvcGVydHlcbiAgI1xuICBzZXRCYWNrZ3JvdW5kID0gLT5cbiAgICBAaW1hZ2UuY3NzXG4gICAgICBsZWZ0OiBcIiN7QGltYWdlUG9zaXRpb24ubGVmdFB4fXB4XCJcbiAgICAgIHRvcDogXCIje0BpbWFnZVBvc2l0aW9uLnRvcFB4fXB4XCJcbiAgICAgIHdpZHRoOiBcIiN7QGltYWdlUG9zaXRpb24uc2NhbGUgKiAxMDAuMH0lXCJcbiAgICAgIGhlaWdodDogJ2F1dG8nXG4gICAgc2V0TWFya2Vycy5jYWxsKEApXG5cbiAgIyAocHJpdmF0ZSkgRXF1aXZhbGVudCB0byBzZXRCYWNrZ3JvdW5kLCBidXQgd2l0aFxuICAjIGFuaW1hdGlvblxuICAjXG4gIGFuaW1hdGVCYWNrZ3JvdW5kID0gLT5cbiAgICBAaW1hZ2UuYW5pbWF0ZVxuICAgICAgbGVmdDogXCIje0BpbWFnZVBvc2l0aW9uLmxlZnRQeH1weFwiXG4gICAgICB0b3A6IFwiI3tAaW1hZ2VQb3NpdGlvbi50b3BQeH1weFwiXG4gICAgICB3aWR0aDogXCIje0BpbWFnZVBvc2l0aW9uLnNjYWxlICogMTAwLjB9JVwiXG4gICAgICBoZWlnaHQ6ICdhdXRvJ1xuICAgICwgMjUwXG4gICAgYW5pbWF0ZU1hcmtlcnMuY2FsbChAKVxuXG4gICMgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0gU2V0dGluZyBNYXJrZXJzXG5cbiAgIyAocHJpdmF0ZSkgU2V0cyBtYXJrZXJzIGluIGNvcnJlY3QgbG9jYXRpb24sIGJhc2VkIG9uXG4gICMgaW1hZ2UgcG9zaXRpb25cbiAgI1xuICBzZXRNYXJrZXJzID0gLT5cbiAgICBtYXJrZXJzID0gQGNvbnRhaW5lci5maW5kKFwiLiN7UGxhbml0Lm1hcmtlckNsYXNzfVwiKVxuICAgIGlmIG1hcmtlcnMubGVuZ3RoID4gMFxuICAgICAgZm9yIG1hcmtlciBpbiBtYXJrZXJzXG4gICAgICAgIGxlZnQgPSAoQGNhbGMoaW1nV2lkdGgpICogKCQobWFya2VyKS5hdHRyKCdkYXRhLXhQYycpIC8gMTAwKSkgK1xuICAgICAgICAgIEBpbWFnZVBvc2l0aW9uLmxlZnRQeCAtICgkKG1hcmtlcikub3V0ZXJXaWR0aCgpIC8gMilcbiAgICAgICAgdG9wID0gKEBjYWxjKGltZ0hlaWdodCkgKiAoJChtYXJrZXIpLmF0dHIoJ2RhdGEteVBjJykgLyAxMDApKSArXG4gICAgICAgICAgQGltYWdlUG9zaXRpb24udG9wUHggLSAoJChtYXJrZXIpLm91dGVySGVpZ2h0KCkgLyAyKVxuICAgICAgICAkKG1hcmtlcikuY3NzXG4gICAgICAgICAgbGVmdDogXCIje2xlZnR9cHhcIlxuICAgICAgICAgIHRvcDogXCIje3RvcH1weFwiXG4gICAgICBwb3NpdGlvbkluZm9ib3hlcy5jYWxsKEApXG5cbiAgIyAocHJpdmF0ZSkgRXF1aXZhbGVudCB0byBzZXRNYXJrZXJzLCBidXQgd2l0aCBhbmltYXRpb25cbiAgI1xuICBhbmltYXRlTWFya2VycyA9IC0+XG4gICAgbWFya2VycyA9IEBjb250YWluZXIuZmluZChcIi4je1BsYW5pdC5tYXJrZXJDbGFzc31cIilcbiAgICBpZiBtYXJrZXJzLmxlbmd0aCA+IDBcbiAgICAgIGZvciBtYXJrZXIgaW4gbWFya2Vyc1xuICAgICAgICBtID0gbmV3IFBsYW5pdC5NYXJrZXIoQGNvbnRhaW5lciwgJChtYXJrZXIpLmF0dHIoJ2RhdGEtbWFya2VyJykpXG4gICAgICAgIG0uaGlkZUluZm9ib3goKVxuICAgICAgICBsZWZ0ID0gKEBjYWxjKGltZ1dpZHRoKSAqICgkKG1hcmtlcikuYXR0cignZGF0YS14UGMnKSAvIDEwMCkpICtcbiAgICAgICAgICBAaW1hZ2VQb3NpdGlvbi5sZWZ0UHggLSAoJChtYXJrZXIpLm91dGVyV2lkdGgoKSAvIDIpXG4gICAgICAgIHRvcCA9IChAY2FsYyhpbWdIZWlnaHQpICogKCQobWFya2VyKS5hdHRyKCdkYXRhLXlQYycpIC8gMTAwKSkgK1xuICAgICAgICAgIEBpbWFnZVBvc2l0aW9uLnRvcFB4IC0gKCQobWFya2VyKS5vdXRlckhlaWdodCgpIC8gMilcbiAgICAgICAgZG8gKG0pIC0+XG4gICAgICAgICAgJChtYXJrZXIpLmFuaW1hdGVcbiAgICAgICAgICAgIGxlZnQ6IFwiI3tsZWZ0fXB4XCJcbiAgICAgICAgICAgIHRvcDogXCIje3RvcH1weFwiXG4gICAgICAgICAgLCAyNTAsICgpID0+XG4gICAgICAgICAgICBtLnBvc2l0aW9uSW5mb2JveCgpXG4gICAgICAgICAgICBtLnVuaGlkZUluZm9ib3goKVxuXG4gICMgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0gU2V0dGluZyBJbmZvYm94ZXNcblxuICAjIChwcml2YXRlKSBBcHByb3ByaWF0ZWx5IHBvc2l0aW9uIHRoZSBpbmZvYm94IG9uIGV2ZXJ5XG4gICMgbWFya2VyLCB0aGUgbG9naWMgZm9yIHdoaWNoIGlzIGluIHRoZSBNYXJrZXIgY2xhc3NcbiAgI1xuICBwb3NpdGlvbkluZm9ib3hlcyA9IC0+XG4gICAgZm9yIG1hcmtlciBpbiBAY29udGFpbmVyLmZpbmQoXCIuI3tQbGFuaXQubWFya2VyQ2xhc3N9XCIpXG4gICAgICBtID0gbmV3IFBsYW5pdC5NYXJrZXIoQGNvbnRhaW5lciwgJChtYXJrZXIpLmF0dHIoJ2RhdGEtbWFya2VyJykpXG4gICAgICBtLnBvc2l0aW9uSW5mb2JveCgpXG4gICAgdHJ1ZVxuXG4gICMgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0gTW92ZSBBY3Rpb25zXG5cbiAgIyBXaWxsIGNlbnRlciB0aGUgaW1hZ2Ugb24gdGhlIGdpdmVuIGNvb3JkaW5hdGVzIGFzIFt4LHldXG4gICMgaW4gZmxvYXRlZCBwZXJjZW50YWdlcy4gRW5zdXJlcyB0aGVyZSBpcyBlbm91Z2ggaW1hZ2Ugb25cbiAgIyBlYWNoIHNpZGUgYnkgem9vbWluZyBpbiBpZiBuZWNlc3NhcnkuXG4gICNcbiAgY2VudGVyT246IChjb29yZHMpID0+XG4gICAgaWYgY29vcmRzWzBdID49IDUwIHRoZW4geCA9IDEwMCAtIGNvb3Jkc1swXSBlbHNlIHggPSBjb29yZHNbMF1cbiAgICBpZiBjb29yZHNbMV0gPj0gNTAgdGhlbiB5ID0gMTAwIC0gY29vcmRzWzFdIGVsc2UgeSA9IGNvb3Jkc1sxXVxuICAgIHdNaW4gPSA1MCAqIChAY2FsYyhjb250YWluZXJXaWR0aCkgLyB4KVxuICAgIGhNaW4gPSA1MCAqIChAY2FsYyhjb250YWluZXJIZWlnaHQpIC8geSlcbiAgICAjIGhpZGVzIG90aGVyIGFjdGl2ZSBpbmZvYm94ZXMsIGJ1dCB3aWxsIHN0aWxsIHNob3dcbiAgICAjIHRoaXMgaW5mb2JveFxuICAgIEBjb250YWluZXIuZmluZChcIi4je1BsYW5pdC5pbmZvYm94Q2xhc3N9XCIpLnJlbW92ZUNsYXNzKCdhY3RpdmUnKVxuICAgICMgR2V0IG91ciBpbml0aWFsIHBvc2l0aW9uXG4gICAgQGltYWdlUG9zaXRpb24ubGVmdFB4ID0gLSAoXG4gICAgICAoQGNhbGMoaW1nV2lkdGgpICogKGNvb3Jkc1swXSAvIDEwMCkpIC0gKEBjYWxjKGNvbnRhaW5lcldpZHRoKSAvIDIpXG4gICAgKVxuICAgIEBpbWFnZVBvc2l0aW9uLnRvcFB4ID0gLSAoXG4gICAgICAoQGNhbGMoaW1nSGVpZ2h0KSAqIChjb29yZHNbMV0gLyAxMDApKSAtIChAY2FsYyhjb250YWluZXJIZWlnaHQpIC8gMilcbiAgICApXG4gICAgIyBrZWVwIHRoZW9yZXRpY2FsbHkgbWFraW5nIHRoZSBpbWFnZSBiaWdnZXIgdW50aWwgaXQgaXNcbiAgICAjIGxhcmdlIGVub3VnaCB0byBjZW50ZXIgb24gb3VyIHBvaW50XG4gICAgd2hpbGUgKEBjYWxjKGltZ1dpZHRoKSA8IHdNaW4pIHx8IChAY2FsYyhpbWdIZWlnaHQpIDwgaE1pbilcbiAgICAgIEBpbWFnZVBvc2l0aW9uLnNjYWxlICA9IEBpbWFnZVBvc2l0aW9uLnNjYWxlICsgQGltYWdlUG9zaXRpb24uaW5jcmVtZW50XG4gICAgICBAaW1hZ2VQb3NpdGlvbi5sZWZ0UHggPSAtIChcbiAgICAgICAgKEBjYWxjKGltZ1dpZHRoKSAqIChjb29yZHNbMF0gLyAxMDApKSAtIChAY2FsYyhjb250YWluZXJXaWR0aCkgLyAyKVxuICAgICAgKVxuICAgICAgQGltYWdlUG9zaXRpb24udG9wUHggPSAtIChcbiAgICAgICAgKEBjYWxjKGltZ0hlaWdodCkgKiAoY29vcmRzWzFdIC8gMTAwKSkgLSAoQGNhbGMoY29udGFpbmVySGVpZ2h0KSAvIDIpXG4gICAgICApXG4gICAgYW5pbWF0ZUJhY2tncm91bmQuY2FsbChAKVxuICAgIGNvb3Jkc1xuXG4gICMgWm9vbXMgdGhlIGltYWdlIHRvIGEgc3BlY2lmaWMgXCJsZXZlbFwiIHdoaWNoIGlzIGFuXG4gICMgaW5jcmVtZW50ZWQgaW50ZWdlciBzdGFydGluZyBhdCB6ZXJvXG4gICNcbiAgem9vbVRvOiAobGV2ZWwpID0+XG4gICAgaSA9IEBpbWFnZVBvc2l0aW9uLmluY3JlbWVudFxuICAgIHVubGVzcyAoKGxldmVsICogaSkgKyAxKSA9PSBAaW1hZ2VQb3NpdGlvbi5zY2FsZVxuICAgICAgQGltYWdlUG9zaXRpb24uc2NhbGUgPSAobGV2ZWwgKiBpKSArIDEgKyBpXG4gICAgICBAem9vbU91dCgpXG4gICAgbGV2ZWxcblxuICAjID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09IENhbGN1bGF0aW9uc1xuXG4gICMgTWV0aG9kIGZvciBhY2Nlc3NpbmcgdGhlIHByaXZhdGUgY2FsY3VsYXRpb24gbWV0aG9kc1xuICAjXG4gIGNhbGM6IChtZXRob2QpID0+XG4gICAgbWV0aG9kLmNhbGwoQClcblxuICAjIChwcml2YXRlKSBXaWR0aCBvZiB0aGUgaW1hZ2VcbiAgI1xuICBpbWdXaWR0aCA9IC0+XG4gICAgcGFyc2VGbG9hdChAaW1hZ2VQb3NpdGlvbi53aWR0aCAqIEBpbWFnZVBvc2l0aW9uLnNjYWxlKVxuXG4gICMgKHByaXZhdGUpIFRoZSBudW1iZXIgb2YgcGl4ZWxzIGFkZGVkIHdpdGggZWFjaCB6b29tIGxldmVsXG4gICNcbiAgaW1nV2lkdGhDbGlja0luY3JlbWVudCA9IC0+XG4gICAgcGFyc2VGbG9hdChAaW1hZ2VQb3NpdGlvbi53aWR0aCAqIEBpbWFnZVBvc2l0aW9uLmluY3JlbWVudClcblxuICAjIChwcml2YXRlKSBUaGUgd2lkdGggb2YgdGhlIGNvbnRhaW5lclxuICAjXG4gIGNvbnRhaW5lcldpZHRoID0gLT5cbiAgICBwYXJzZUZsb2F0KEBtYXJrZXJzQ29udGFpbmVyLndpZHRoKCkpXG5cbiAgIyAocHJpdmF0ZSkgTnVtYmVyIG9mIHBpeGVscyBsZWZ0IHNpZGUgb2YgaW1hZ2UgaXMgZnJvbVxuICAjIGxlZnQgc2lkZSBvZiB0aGUgY29udGFpbmVyXG4gICNcbiAgaW1nT2Zmc2V0TGVmdCA9IC0+XG4gICAgTWF0aC5hYnMocGFyc2VGbG9hdChAaW1hZ2UuY3NzKCdsZWZ0JykpKVxuXG4gICMgKHByaXZhdGUpIEhlaWdodCBvZiB0aGUgaW1hZ2VcbiAgI1xuICBpbWdIZWlnaHQgPSAtPlxuICAgIHBhcnNlRmxvYXQoQGltYWdlUG9zaXRpb24uaGVpZ2h0ICogQGltYWdlUG9zaXRpb24uc2NhbGUpXG5cbiAgIyAocHJpdmF0ZSkgVGhlIG51bWJlciBvZiBwaXhlbHMgYWRkZWQgb3IgcmVtb3ZlZCB3aXRoXG4gICMgZWFjaCB6b29tIGxldmVsXG4gICNcbiAgaW1nSGVpZ2h0Q2xpY2tJbmNyZW1lbnQgPSAtPlxuICAgIHBhcnNlRmxvYXQoQGltYWdlUG9zaXRpb24uaGVpZ2h0ICogQGltYWdlUG9zaXRpb24uaW5jcmVtZW50KVxuXG4gICMgKHByaXZhdGUpIFRoZSBoZWlnaHQgb2YgdGhlIGNvbnRhaW5lciAocGl4ZWxzKVxuICAjXG4gIGNvbnRhaW5lckhlaWdodCA9IC0+XG4gICAgcGFyc2VGbG9hdChAbWFya2Vyc0NvbnRhaW5lci5oZWlnaHQoKSlcblxuICAjIChwcml2YXRlKSBUaGUgbnVtYmVyIG9mIHBpeGVscyB0aGUgdG9wIG9mIHRoZSBpbWFnZSBpc1xuICAjIGZyb20gdGhlIHRvcCBvZiB0aGUgY29udGFpbmVyXG4gICNcbiAgaW1nT2Zmc2V0VG9wID0gLT5cbiAgICBNYXRoLmFicyhwYXJzZUZsb2F0KEBpbWFnZS5jc3MoJ3RvcCcpKSlcblxuICAjIChwcml2YXRlKSBDb29yZGluYXRlcyBvZiBhbiBldmVudCBhcyBhIHBlcmNlbnRhZ2Ugb2YgdGhlXG4gICMgZGltZW5zaW9ucyBvZiB0aGUgY29udGFpbmVyLCByZWxhdGl2ZSB0byB0aGUgdG9wIGxlZnRcbiAgIyBjb3JuZXIgb2YgdGhlIGNvbnRhaW5lclxuICAjXG4gIHpFdmVudFBvc2l0aW9uID0gKGUpIC0+XG4gICAgbGVmdDogKGUucGFnZVggLSBAY29udGFpbmVyLm9mZnNldCgpLmxlZnQpIC8gQGNhbGMoY29udGFpbmVyV2lkdGgpXG4gICAgdG9wOiAgKGUucGFnZVkgLSBAY29udGFpbmVyLm9mZnNldCgpLnRvcCkgLyBAY2FsYyhjb250YWluZXJIZWlnaHQpXG5cbiAgIyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PSBFdmVudHNcblxuICAjIChwcml2YXRlKSBMaXN0ZW5lciBmb3IgZG91YmxlLWNsaWNraW5nIG9uIHRoZSBwbGFuXG4gICNcbiAgekRibENsaWNrID0gKGUpIC0+XG4gICAgaWYgJChlLnRhcmdldCkuYXR0cignZGF0YS16b29tLWlkJykgPT0gQHpvb21JZFxuICAgICAgY2xpY2sgPSB6RXZlbnRQb3NpdGlvbi5jYWxsKEAsIGUpXG4gICAgICBAem9vbUluKCdjbGljaycsIGNsaWNrLmxlZnQsIGNsaWNrLnRvcClcblxuICAjIChwcml2YXRlKSBMaXN0ZW5lciBmb3IgdGhlIHN0YXJ0IG9mIGEgY2xpY2sgb24gdGhlIHBsYW5cbiAgI1xuICB6TW91c2VEb3duID0gKGUpIC0+XG4gICAgaWYgJChlLnRhcmdldCkuYXR0cignZGF0YS16b29tLWlkJykgPT0gQHpvb21JZCAmJiBlLndoaWNoID09IDFcbiAgICAgIEBpc0RyYWdnaW5nID0gdHJ1ZVxuICAgICAgY29vcmRzID0gekV2ZW50UG9zaXRpb24uY2FsbChALCBlKVxuICAgICAgQGRyYWdDb29yZHMgPVxuICAgICAgICBwb2ludFJlZjogY29vcmRzXG4gICAgICAgIGltZ1JlZjpcbiAgICAgICAgICBsZWZ0OiAwIC0gQGNhbGMoaW1nT2Zmc2V0TGVmdClcbiAgICAgICAgICB0b3A6IDAgLSBAY2FsYyhpbWdPZmZzZXRUb3ApXG4gICAgICAgIG1heDpcbiAgICAgICAgICByaWdodDogKGNvb3Jkcy5sZWZ0ICogQGNhbGMoY29udGFpbmVyV2lkdGgpKSArIEBjYWxjKGltZ09mZnNldExlZnQpXG4gICAgICAgICAgbGVmdDogKGNvb3Jkcy5sZWZ0ICogQGNhbGMoY29udGFpbmVyV2lkdGgpKSAtIChAY2FsYyhpbWdXaWR0aCkgLVxuICAgICAgICAgICAgICAgICAgICAgIChAY2FsYyhjb250YWluZXJXaWR0aCkgKyBAY2FsYyhpbWdPZmZzZXRMZWZ0KSkpXG4gICAgICAgICAgYm90dG9tOiAoY29vcmRzLnRvcCAqIEBjYWxjKGNvbnRhaW5lckhlaWdodCkpICsgQGNhbGMoaW1nT2Zmc2V0VG9wKVxuICAgICAgICAgIHRvcDogKGNvb3Jkcy50b3AgKiBAY2FsYyhjb250YWluZXJIZWlnaHQpKSAtIChAY2FsYyhpbWdIZWlnaHQpIC1cbiAgICAgICAgICAgICAgICAgICAgICAoQGNhbGMoY29udGFpbmVySGVpZ2h0KSArIEBjYWxjKGltZ09mZnNldFRvcCkpKVxuICAgIHRydWVcblxuICAjIChwcml2YXRlKSBMaXN0ZW5lciBmb3Igd2hlbiB0aGUgbW91c2UgbW92ZXMgYW55d2hlcmUgb25cbiAgIyB0aGUgZG9jdW1lbnRcbiAgI1xuICB6TW91c2VNb3ZlID0gKGUpIC0+XG4gICAgaWYgQGlzRHJhZ2dpbmdcbiAgICAgIGNvb3JkcyA9IHpFdmVudFBvc2l0aW9uLmNhbGwoQCwgZSlcbiAgICAgIGRyYWdMZWZ0ID0gY29vcmRzLmxlZnQgKiBAY2FsYyhjb250YWluZXJXaWR0aClcbiAgICAgIGRyYWdUb3AgPSBjb29yZHMudG9wICogQGNhbGMoY29udGFpbmVySGVpZ2h0KVxuICAgICAgaWYgZHJhZ0xlZnQgPj0gQGRyYWdDb29yZHMubWF4LmxlZnQgJiYgZHJhZ0xlZnQgPD0gQGRyYWdDb29yZHMubWF4LnJpZ2h0XG4gICAgICAgIGxlZnQgPSAoY29vcmRzLmxlZnQgLSBAZHJhZ0Nvb3Jkcy5wb2ludFJlZi5sZWZ0KSAqIEBjYWxjKGNvbnRhaW5lcldpZHRoKVxuICAgICAgICBAaW1hZ2VQb3NpdGlvbi5sZWZ0UHggPSBAZHJhZ0Nvb3Jkcy5pbWdSZWYubGVmdCArIGxlZnRcbiAgICAgIGVsc2UgaWYgZHJhZ0xlZnQgPCBAZHJhZ0Nvb3Jkcy5tYXgubGVmdFxuICAgICAgICBAaW1hZ2VQb3NpdGlvbi5sZWZ0UHggPSBAY2FsYyhjb250YWluZXJXaWR0aCkgLSBAY2FsYyhpbWdXaWR0aClcbiAgICAgIGVsc2UgaWYgZHJhZ0xlZnQgPiBAZHJhZ0Nvb3Jkcy5tYXgucmlnaHRcbiAgICAgICAgQGltYWdlUG9zaXRpb24ubGVmdFB4ID0gMFxuICAgICAgaWYgZHJhZ1RvcCA+PSBAZHJhZ0Nvb3Jkcy5tYXgudG9wICYmIGRyYWdUb3AgPD0gQGRyYWdDb29yZHMubWF4LmJvdHRvbVxuICAgICAgICB0b3AgPSAoY29vcmRzLnRvcCAtIEBkcmFnQ29vcmRzLnBvaW50UmVmLnRvcCkgKiBAY2FsYyhjb250YWluZXJIZWlnaHQpXG4gICAgICAgIEBpbWFnZVBvc2l0aW9uLnRvcFB4ID0gQGRyYWdDb29yZHMuaW1nUmVmLnRvcCArIHRvcFxuICAgICAgZWxzZSBpZiBkcmFnVG9wIDwgQGRyYWdDb29yZHMubWF4LnRvcFxuICAgICAgICBAaW1hZ2VQb3NpdGlvbi50b3BQeCA9IEBjYWxjKGNvbnRhaW5lckhlaWdodCkgLSBAY2FsYyhpbWdIZWlnaHQpXG4gICAgICBlbHNlIGlmIGRyYWdUb3AgPiBAZHJhZ0Nvb3Jkcy5tYXguYm90dG9tXG4gICAgICAgIEBpbWFnZVBvc2l0aW9uLnRvcFB4ID0gMFxuICAgICAgc2V0QmFja2dyb3VuZC5jYWxsKEApXG4gICAgdHJ1ZVxuXG4gICMgKHByaXZhdGUpIExpc3RlbmVyIGZvciB0aGUgZW5kIG9mIGEgY2xpY2sgYW55d2hlcmUgb25cbiAgIyB0aGUgZG9jdW1lbnRcbiAgI1xuICB6TW91c2VVcCA9IChlKSAtPlxuICAgIEBpc0RyYWdnaW5nID0gZmFsc2VcbiAgICBwb3NpdGlvbkluZm9ib3hlcy5jYWxsKEApXG4gICAgdHJ1ZVxuXG4gICMgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0gWm9vbWluZ1xuXG4gICMgVGFrZXMgY3VycmVudCB6b29tIHBvc2l0aW9uIGFuZCB6b29tcyBpbiB0byB0aGUgY2VudGVyXG4gICMgb25lIGxldmVsIGRlZXBlclxuICAjXG4gIHpvb21JbjogPT5cbiAgICBAaW1hZ2VQb3NpdGlvbi5zY2FsZSAgPSBAaW1hZ2VQb3NpdGlvbi5zY2FsZSArIEBpbWFnZVBvc2l0aW9uLmluY3JlbWVudFxuICAgIEBpbWFnZVBvc2l0aW9uLmxlZnRQeCA9IC0gQGNhbGMoaW1nT2Zmc2V0TGVmdCkgLVxuICAgICAgKEBjYWxjKGltZ1dpZHRoQ2xpY2tJbmNyZW1lbnQpIC8gMilcbiAgICBAaW1hZ2VQb3NpdGlvbi50b3BQeCAgPSAtIEBjYWxjKGltZ09mZnNldFRvcCkgLVxuICAgICAgKEBjYWxjKGltZ0hlaWdodENsaWNrSW5jcmVtZW50KSAvIDIpXG4gICAgYW5pbWF0ZUJhY2tncm91bmQuY2FsbChAKVxuICAgIHRydWVcblxuICAjIFpvb21zIG91dCBvbmUgbGV2ZWwuIEF0dGVtcHRzIHRvIHpvb20gb3V0IGZyb20gdGhlXG4gICMgY2VudGVyLCBidXQgd2lsbCBhZGp1c3QgYmFzZWQgb24gYXZhaWxhYmxlIGltYWdlIHNwYWNlLlxuICAjXG4gIHpvb21PdXQ6ICgpID0+XG4gICAgaWYgQGltYWdlUG9zaXRpb24uc2NhbGUgPiAxXG4gICAgICBAaW1hZ2VQb3NpdGlvbi5zY2FsZSAgPSBAaW1hZ2VQb3NpdGlvbi5zY2FsZSAtIEBpbWFnZVBvc2l0aW9uLmluY3JlbWVudFxuICAgICAgbGVmdFB4ID0gLSBAY2FsYyhpbWdPZmZzZXRMZWZ0KSArIChAY2FsYyhpbWdXaWR0aENsaWNrSW5jcmVtZW50KSAvIDIpXG4gICAgICB0b3BQeCAgPSAtIEBjYWxjKGltZ09mZnNldFRvcCkgKyAoQGNhbGMoaW1nSGVpZ2h0Q2xpY2tJbmNyZW1lbnQpIC8gMilcbiAgICAgIGlmIGxlZnRQeCA+IDBcbiAgICAgICAgQGltYWdlUG9zaXRpb24ubGVmdFB4ID0gMFxuICAgICAgZWxzZSBpZiBsZWZ0UHggPCBAY2FsYyhjb250YWluZXJXaWR0aCkgLSBAY2FsYyhpbWdXaWR0aClcbiAgICAgICAgQGltYWdlUG9zaXRpb24ubGVmdFB4ID0gQGNhbGMoY29udGFpbmVyV2lkdGgpIC0gQGNhbGMoaW1nV2lkdGgpXG4gICAgICBlbHNlXG4gICAgICAgIEBpbWFnZVBvc2l0aW9uLmxlZnRQeCA9IGxlZnRQeFxuICAgICAgaWYgdG9wUHggPiAwXG4gICAgICAgIEBpbWFnZVBvc2l0aW9uLnRvcFB4ID0gMFxuICAgICAgZWxzZSBpZiB0b3BQeCA8IEBjYWxjKGNvbnRhaW5lckhlaWdodCkgLSBAY2FsYyhpbWdIZWlnaHQpXG4gICAgICAgIEBpbWFnZVBvc2l0aW9uLnRvcFB4ID0gQGNhbGMoY29udGFpbmVySGVpZ2h0KSAtIEBjYWxjKGltZ0hlaWdodClcbiAgICAgIGVsc2VcbiAgICAgICAgQGltYWdlUG9zaXRpb24udG9wUHggPSB0b3BQeFxuICAgICAgYW5pbWF0ZUJhY2tncm91bmQuY2FsbChAKVxuICAgICAgdHJ1ZVxuICAgIGVsc2VcbiAgICAgIGZhbHNlXG5cblxuICAjID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09IE1hcmtlciBSZWZlcmVuY2VzXG5cbiAgIyAocHJpdmF0ZSkgVGhlIG1hcmtlcihzKSB0aGF0IGFyZSBiZWluZyBkcmFnZ2VkLCBmb3VuZCBieVxuICAjIFBsYW5pdCdzIGRyYWdnaW5nIGNsYXNzLlxuICAjXG4gIGRyYWdnaW5nTWFya2VyID0gLT5cbiAgICBAbWFya2Vyc0NvbnRhaW5lci5maW5kKFwiLiN7UGxhbml0Lm1hcmtlckNsYXNzfS4je1BsYW5pdC5kcmFnZ2luZ0NsYXNzfVwiKVxuXG4gICMgKHByaXZhdGUpIENvb3JkaW5hdGVzIG9mIGFuIGV2ZW50IGFzIGEgcGVyY2VudGFnZSBvZiB0aGVcbiAgIyBkaW1lbnNpb25zIG9mIHRoZSBjb250YWluZXIsIHJlbGF0aXZlIHRvIHRoZSB0b3AgbGVmdFxuICAjIGNvcm5lciBvZiB0aGUgaW1hZ2VcbiAgI1xuICBnZXRFdmVudFBvc2l0aW9uID0gKGUpIC0+XG4gICAgaWYgQGltYWdlXG4gICAgICAjIGlmIHRoZXJlIGlzIGFuIGltYWdlLCB3ZSBuZWVkIHRvIGNhbGN1bGF0ZSB3aXRoIGltYWdlIGluIG1pbmRcbiAgICAgIHhQeCA9IGUucGFnZVggLSBAY29udGFpbmVyLm9mZnNldCgpLmxlZnRcbiAgICAgIHlQeCA9IGUucGFnZVkgLSBAY29udGFpbmVyLm9mZnNldCgpLnRvcFxuICAgICAgd0ltZyA9IEBpbWFnZS53aWR0aCgpXG4gICAgICBoSW1nID0gQGltYWdlLmhlaWdodCgpXG4gICAgICB4SW1nID0gcGFyc2VJbnQoQGltYWdlLmNzcygnbGVmdCcpKVxuICAgICAgeUltZyA9IHBhcnNlSW50KEBpbWFnZS5jc3MoJ3RvcCcpKVxuICAgICAgeFBjID0gKCh4UHggKyBNYXRoLmFicyh4SW1nKSkgLyB3SW1nKSAqIDEwMFxuICAgICAgeVBjID0gKCh5UHggKyBNYXRoLmFicyh5SW1nKSkgLyBoSW1nKSAqIDEwMFxuICAgIGVsc2VcbiAgICAgICMgb3Igd2UgY2FuIGp1c3QgbG9vayBhdCB0aGUgY29udGFpbmVyXG4gICAgICB4UGMgPSAoZS5wYWdlWCAtIEBjb250YWluZXIub2Zmc2V0KCkubGVmdCkgLyBAY2FsYyhjb250YWluZXJXaWR0aClcbiAgICAgIHlQYyA9ICAoZS5wYWdlWSAtIEBjb250YWluZXIub2Zmc2V0KCkudG9wKSAvIEBjYWxjKGNvbnRhaW5lckhlaWdodClcbiAgICBbeFBjLCB5UGNdXG5cbiAgIyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PSBFdmVudHNcblxuICAjIChwcml2YXRlKSBDYWxsZWQgYXQgdGhlIGVuZCBvZiBhIGNsaWNrLCB3aGVuIGl0IG9jY3Vyc1xuICAjIG9uIHRvcCBvZiB0aGUgcGxhbi5cbiAgI1xuICBtb3VzZXVwID0gKGUpIC0+XG4gICAgIyBkZWFsaW5nIHdpdGggbWFya2VycywgZXNwLiBkcmFnZ2luZyBtYXJrZXJzXG4gICAgbWFya2VyID0gQG1hcmtlcnNDb250YWluZXIuZmluZChcIi4je1BsYW5pdC5kcmFnZ2luZ0NsYXNzfVwiKS5maXJzdCgpXG4gICAgaWYgZHJhZ2dpbmdNYXJrZXIuY2FsbChAKS5sZW5ndGggPiAwXG4gICAgICBtID0gbmV3IFBsYW5pdC5NYXJrZXIoQGNvbnRhaW5lciwgbWFya2VyLmF0dHIoJ2RhdGEtbWFya2VyJykpXG4gICAgICBpZiBAb3B0aW9ucy5tYXJrZXJEcmFnRW5kXG4gICAgICAgIEBvcHRpb25zLm1hcmtlckRyYWdFbmQoZSwgbSlcbiAgICAgIG0uc2F2ZVBvc2l0aW9uKClcbiAgICAgIG0ucG9zaXRpb25JbmZvYm94KClcbiAgICAgIGRyYWdnaW5nTWFya2VyLmNhbGwoQCkucmVtb3ZlQ2xhc3MoUGxhbml0LmRyYWdnaW5nQ2xhc3MpXG4gICAgIyBpZiBjbGljayBpcyBvbiB0aGUgY29udGFpbmVyXG4gICAgaWYgJChlLnRhcmdldCkuaGFzQ2xhc3MoUGxhbml0Lm1hcmtlckNvbnRhaW5lckNsYXNzKVxuICAgICAgaWYgQG9wdGlvbnMuY2FudmFzQ2xpY2tcbiAgICAgICAgQG9wdGlvbnMuY2FudmFzQ2xpY2soZSwgZ2V0RXZlbnRQb3NpdGlvbi5jYWxsKEAsIGUpKVxuICAgICMgaWYgY2xpY2sgaXMgb24gdGhlIG1hcmtlcnNcbiAgICBpZihcbiAgICAgICQoZS50YXJnZXQpLmhhc0NsYXNzKFBsYW5pdC5tYXJrZXJDbGFzcykgfHxcbiAgICAgICQoZS50YXJnZXQpLnBhcmVudHMoXCIuI3tQbGFuaXQubWFya2VyQ2xhc3N9XCIpLmxlbmd0aCA+IDBcbiAgICApXG4gICAgICBpZiAkKGUudGFyZ2V0KS5oYXNDbGFzcyhQbGFuaXQubWFya2VyQ2xhc3MpXG4gICAgICAgIG1hcmtlciA9ICQoZS50YXJnZXQpXG4gICAgICBlbHNlXG4gICAgICAgIG1hcmtlciA9ICQoZS50YXJnZXQpLnBhcmVudHMoXCIuI3tQbGFuaXQubWFya2VyQ2xhc3N9XCIpLmZpcnN0KClcbiAgICAgIG0gPSBuZXcgUGxhbml0Lk1hcmtlcihAY29udGFpbmVyLCBtYXJrZXIuYXR0cignZGF0YS1tYXJrZXInKSlcbiAgICAgIGlmIEBvcHRpb25zLm1hcmtlckNsaWNrXG4gICAgICAgIEBvcHRpb25zLm1hcmtlckNsaWNrKGUsIG0pXG4gICAgdHJ1ZVxuXG4gICMgKHByaXZhdGUpIENhbGxlZCB3aGVuZXZlciB0aGUgbW91c2UgbW92ZXMgb3ZlciB0aGUgcGxhbi5cbiAgI1xuICBtb3VzZW1vdmUgPSAoZSkgLT5cbiAgICBtYXJrZXJzID0gQG1hcmtlcnNDb250YWluZXIuZmluZChcIi4je1BsYW5pdC5tYXJrZXJDbGFzc30uI3tQbGFuaXQuZHJhZ2dpbmdDbGFzc31cIilcblxuICAgIGlmIG1hcmtlcnMubGVuZ3RoID4gMFxuXG4gICAgICAjIG9ubHkgdXNlIGZpcnN0IG1hcmtlciBpbiBjYXNlIHRoZXJlIGFyZSBtb3JlIHRoYW5cbiAgICAgICMgb25lIGRyYWdnaW5nXG4gICAgICAjXG4gICAgICBtYXJrZXIgPSBtYXJrZXJzLmZpcnN0KClcblxuICAgICAgIyB3ZSBoaWRlIHRoZSBpbmZvYm94IHdoaWxlIGRyYWdnaW5nXG4gICAgICAjXG4gICAgICBpZihcbiAgICAgICAgTWF0aC5hYnMoZS5wYWdlWCAtIG1hcmtlci5hdHRyKCdkYXRhLWRyYWctc3RhcnQteCcpKSA+IDAgfHxcbiAgICAgICAgTWF0aC5hYnMoZS5wYWdlWSAtIG1hcmtlci5hdHRyKCdkYXRhLWRyYWctc3RhcnQteScpKSA+IDBcbiAgICAgIClcbiAgICAgICAgQGNvbnRhaW5lci5maW5kKFwiIyN7bWFya2VyLmF0dHIoJ2RhdGEtaW5mb2JveCcpfVwiKS5yZW1vdmVDbGFzcygnYWN0aXZlJylcblxuICAgICAgIyBjYWxjdWxhdGUgcG9zaXRpb25zXG4gICAgICAjXG4gICAgICBtb3VzZUxlZnQgICAgID0gZS5wYWdlWCAtIEBjb250YWluZXIub2Zmc2V0KCkubGVmdFxuICAgICAgbW91c2VUb3AgICAgICA9IGUucGFnZVkgLSBAY29udGFpbmVyLm9mZnNldCgpLnRvcFxuICAgICAgcGxhblJpZ2h0ICAgICA9IEBjb250YWluZXIud2lkdGgoKVxuICAgICAgcGxhbkJvdHRvbSAgICA9IEBjb250YWluZXIuaGVpZ2h0KClcbiAgICAgIG1hcmtlckxlZnQgICAgPSBtb3VzZUxlZnQgLSAobWFya2VyLm91dGVyV2lkdGgoKSAvIDIpXG4gICAgICBtYXJrZXJUb3AgICAgID0gbW91c2VUb3AgLSAobWFya2VyLm91dGVySGVpZ2h0KCkgLyAyKVxuICAgICAgbWFya2VyUmlnaHQgICA9IG1vdXNlTGVmdCArIChtYXJrZXIub3V0ZXJXaWR0aCgpIC8gMilcbiAgICAgIG1hcmtlckJvdHRvbSAgPSBtb3VzZVRvcCArIChtYXJrZXIub3V0ZXJIZWlnaHQoKSAvIDIpXG4gICAgICBtYXJrZXJXaWR0aCAgID0gbWFya2VyLm91dGVyV2lkdGgoKVxuICAgICAgbWFya2VySGVpZ2h0ICA9IG1hcmtlci5vdXRlckhlaWdodCgpXG5cbiAgICAgICMgZmluZCB0aGUgbGVmdCBwb3NpdGlvbiBvZiB0aGUgbWFya2VyIGJhc2VkIG9uXG4gICAgICAjIHBvc2l0aW9uIG9mIHRoZSBtb3VzZSByZWxhdGl2ZSB0byB0aGUgcGxhblxuICAgICAgI1xuICAgICAgaWYgbWFya2VyTGVmdCA8PSAwXG4gICAgICAgIG1hcmtlclggPSAwXG4gICAgICBlbHNlIGlmIG1hcmtlclJpZ2h0IDwgcGxhblJpZ2h0XG4gICAgICAgIG1hcmtlclggPSBtYXJrZXJMZWZ0XG4gICAgICBlbHNlXG4gICAgICAgIG1hcmtlclggPSBwbGFuUmlnaHQgLSBtYXJrZXJXaWR0aFxuXG4gICAgICAjIGZpbmQgdGhlIGxlZnQgcG9zaXRpb24gb2YgdGhlIG1hcmtlciBiYXNlZCBvblxuICAgICAgIyBwb3NpdGlvbiBvZiB0aGUgbW91c2UgcmVsYXRpdmUgdG8gdGhlIHBsYW5cbiAgICAgICNcbiAgICAgIGlmIG1hcmtlclRvcCA8PSAwXG4gICAgICAgIG1hcmtlclkgPSAwXG4gICAgICBlbHNlIGlmIG1hcmtlckJvdHRvbSA8IHBsYW5Cb3R0b21cbiAgICAgICAgbWFya2VyWSA9IG1hcmtlclRvcFxuICAgICAgZWxzZVxuICAgICAgICBtYXJrZXJZID0gcGxhbkJvdHRvbSAtIG1hcmtlckhlaWdodFxuXG4gICAgICAjIHNldCB0aGUgcG9zaXRpb24gb2YgdGhlIG1hcmtlclxuICAgICAgI1xuICAgICAgbWFya2VyLmNzc1xuICAgICAgICBsZWZ0OiBtYXJrZXJYXG4gICAgICAgIHRvcDogbWFya2VyWVxuXG4gIHJlc2l6ZSA9IChlKSAtPlxuICAgIGlmIEBpbWFnZVxuICAgICAgQHJlc2V0SW1hZ2UoKVxuICAgICAgQGNvbnRhaW5lci5oZWlnaHQoQGltYWdlLmhlaWdodCgpKVxuICAgIGZvciBtYXJrZXIgaW4gQG1hcmtlcnNDb250YWluZXIuZmluZCgnLnBsYW5pdC1tYXJrZXInKVxuICAgICAgbSA9IG5ldyBQbGFuaXQuTWFya2VyKEBjb250YWluZXIsICQobWFya2VyKS5hdHRyKCdkYXRhLW1hcmtlcicpKVxuICAgICAgbS5zZXQoKVxuXG5jbGFzcyBQbGFuaXQuTWFya2VyXG5cbiAgIyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PSBTZXR1cFxuXG4gICMgV2hlbiB0aGUgTWFya2VyIGNsYXNzIGlzIGluc3RhbnRpYXRlZCwgd2UgcmV0dXJuIHRoZVxuICAjIG9iamVjdCwgYnV0IGFsbCB3ZSBuZWVkIHRvIGRvIGlzIHNldCByZWZlcmVuY2VzIGFuZCBmaW5kXG4gICMgdGhlIGFwcHJvcHJpYXRlIGpRdWVyeSBvYmplY3QuXG4gICNcbiAgIyBJdCdzIGZvciB0aGlzIHJlYXNvbiB0aGF0IHRoZSBjcmVhdGUgYWN0aW9uIGlzIGEgY2xhc3NcbiAgIyBtZXRob2QgKHRoZSBtYXJrZXIgZG9lc24ndCBwaHlzaWNhbGx5IGV4aXN0IHlldClcbiAgI1xuICBjb25zdHJ1Y3RvcjogKEBjb250YWluZXIsIGlkKSAtPlxuICAgICMgU2V0IE9wdGlvbnNcbiAgICBAbWFya2Vyc0NvbnRhaW5lciA9IEBjb250YWluZXIuZmluZChcIi4je1BsYW5pdC5tYXJrZXJDb250YWluZXJDbGFzc31cIilcbiAgICBpZiBAY29udGFpbmVyLmZpbmQoXCIuI3tQbGFuaXQuaW1hZ2VDb250YWluZXJ9ID4gaW1nXCIpLmxlbmd0aCA+IDBcbiAgICAgIEBpbWFnZSA9IEBjb250YWluZXIuZmluZChcIi4je1BsYW5pdC5pbWFnZUNvbnRhaW5lcn0gPiBpbWdcIikuZmlyc3QoKVxuXG4gICAgIyBGaW5kIE1hcmtlclxuICAgIEBtYXJrZXIgPSBAbWFya2Vyc0NvbnRhaW5lci5maW5kKFxuICAgICAgXCIuI3tQbGFuaXQubWFya2VyQ2xhc3N9W2RhdGEtbWFya2VyPScje2lkfSddXCJcbiAgICApLmZpcnN0KClcblxuICAgICMgUmV0dXJuIHRoaXNcbiAgICBAXG5cbiAgIyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PSBDcmVhdGUgTmV3IE1hcmtlclxuXG4gICMgKGNsYXNzIG1ldGhvZCkgQ3JlYXRlcyBhIG5ldyBtYXJrZXJcbiAgI1xuICBAY3JlYXRlOiAob3B0aW9ucykgLT5cbiAgICAjIGxvY2FsIHJlZmVyZW5jZXNcbiAgICBjb250YWluZXIgPSBvcHRpb25zLmNvbnRhaW5lclxuICAgIG1hcmtlcnNDb250YWluZXIgPSBjb250YWluZXIuZmluZChcIi4je1BsYW5pdC5tYXJrZXJDb250YWluZXJDbGFzc31cIikuZmlyc3QoKVxuICAgICMgc2V0IG9wdGlvbnNcbiAgICBvcHRpb25zLnBsYW5pdElEID0gUGxhbml0LnJhbmRvbVN0cmluZygyMCkgdW5sZXNzIG9wdGlvbnMucGxhbml0SURcbiAgICBpZiBvcHRpb25zLmNvbG9yIHRoZW4gY29sb3IgPSBvcHRpb25zLmNvbG9yIGVsc2UgY29sb3IgPSAnI0ZDNUIzRidcbiAgICAjIGZpbmQgcG9zaXRpb25cbiAgICBsZWZ0ID0gKChwYXJzZUZsb2F0KG9wdGlvbnMuY29vcmRzWzBdKSAvIDEwMCkgKiBjb250YWluZXIud2lkdGgoKSkgLSAxNVxuICAgIHRvcCA9ICgocGFyc2VGbG9hdChvcHRpb25zLmNvb3Jkc1sxXSkgLyAxMDApICogY29udGFpbmVyLmhlaWdodCgpKSAtIDE1XG4gICAgIyBjcmVhdGUgdGhlIG1hcmtlclxuICAgIG1hcmtlcnNDb250YWluZXIuYXBwZW5kKFxuICAgICAgJCgnPGRpdj48L2Rpdj4nKVxuICAgICAgICAuYWRkQ2xhc3MoUGxhbml0Lm1hcmtlckNsYXNzKVxuICAgICAgICAuYXR0clxuICAgICAgICAgICdkYXRhLW1hcmtlcic6IG9wdGlvbnMucGxhbml0SURcbiAgICAgICAgICAnZGF0YS14UGMnOiBvcHRpb25zLmNvb3Jkc1swXVxuICAgICAgICAgICdkYXRhLXlQYyc6IG9wdGlvbnMuY29vcmRzWzFdXG4gICAgICAgIC5jc3NcbiAgICAgICAgICBsZWZ0OiBcIiN7bGVmdH1weFwiXG4gICAgICAgICAgdG9wOiBcIiN7dG9wfXB4XCJcbiAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6IGNvbG9yXG4gICAgKVxuICAgICMgZmluZCB0aGUgbWFya2VyXG4gICAgbWFya2VyID0gbWFya2Vyc0NvbnRhaW5lci5maW5kKFwiLiN7UGxhbml0Lm1hcmtlckNsYXNzfVwiKS5sYXN0KClcbiAgICAjIGFkZCBjb250ZW50IGFuZCBzdHlsZXMgaWYgcGFzc2VkIGFzIG9wdGlvbnNcbiAgICBpZiBvcHRpb25zLmlkXG4gICAgICBtYXJrZXIuYXR0cignZGF0YS1pZCc6IG9wdGlvbnMuaWQpXG4gICAgaWYgb3B0aW9ucy5jbGFzc1xuICAgICAgbWFya2VyLmFkZENsYXNzKG9wdGlvbnMuY2xhc3MpXG4gICAgaWYgb3B0aW9ucy5odG1sXG4gICAgICBtYXJrZXIuaHRtbChvcHRpb25zLmh0bWwpXG4gICAgaWYgb3B0aW9ucy5zaXplXG4gICAgICBtYXJrZXIuY3NzXG4gICAgICAgIHdpZHRoOiBcIiN7b3B0aW9ucy5zaXplfXB4XCJcbiAgICAgICAgaGVpZ2h0OiBcIiN7b3B0aW9ucy5zaXplfXB4XCJcbiAgICAjIHNldHVwIGRyYWdnYWJsZSBpZiBuZWNlc3NhcnlcbiAgICBpZiBvcHRpb25zLmRyYWdnYWJsZVxuICAgICAgbWFya2VyLmFkZENsYXNzKCdkcmFnZ2FibGUnKVxuICAgICAgbWFya2VyLm9uICdtb3VzZWRvd24nLCAoZSkgPT5cbiAgICAgICAgaWYgZS53aGljaCA9PSAxXG4gICAgICAgICAgbWFya2VyID0gJChlLnRhcmdldCkuY2xvc2VzdChcIi4je1BsYW5pdC5tYXJrZXJDbGFzc31cIilcbiAgICAgICAgICBtYXJrZXIuYWRkQ2xhc3MoUGxhbml0LmRyYWdnaW5nQ2xhc3MpXG4gICAgICAgICAgbWFya2VyLmF0dHJcbiAgICAgICAgICAgICdkYXRhLWRyYWctc3RhcnQteCc6IGUucGFnZVhcbiAgICAgICAgICAgICdkYXRhLWRyYWctc3RhcnQteSc6IGUucGFnZVlcbiAgICAjIHNldHVwIGluZm9ib3ggaWYgbmVjZXNzYXJ5XG4gICAgaWYgb3B0aW9ucy5pbmZvYm94XG4gICAgICBpZCA9IFBsYW5pdC5yYW5kb21TdHJpbmcoMTYpXG4gICAgICAjIHNldCBzdHlsZSBvcHRpb25zIG9uIGluZm9ib3hcbiAgICAgIGluZm9ib3ggPSBvcHRpb25zLmluZm9ib3hcbiAgICAgIGlmIGluZm9ib3gucG9zaXRpb24gdGhlbiBwb3NpdGlvbiA9IGluZm9ib3gucG9zaXRpb24gZWxzZSBwb3NpdGlvbiA9ICd0b3AnXG4gICAgICBpZiBpbmZvYm94LmFycm93IHRoZW4gYXJyb3cgPSB0cnVlIGVsc2UgYXJyb3cgPSBmYWxzZVxuICAgICAgaWYgYXJyb3cgPT0gdHJ1ZSB0aGVuIGFycm93Q2xhc3MgPSAnYXJyb3cnIGVsc2UgYXJyb3dDbGFzcyA9ICcnXG4gICAgICBjbGFzc2VzID0gXCIje1BsYW5pdC5pbmZvYm94Q2xhc3N9ICN7cG9zaXRpb259ICN7YXJyb3dDbGFzc31cIlxuICAgICAgIyBhZGQgaW5mb2JveFxuICAgICAgY29udGFpbmVyLmZpbmQoXCIuI3tQbGFuaXQuaW5mb2JveENvbnRhaW5lckNsYXNzfVwiKS5hcHBlbmQgXCJcIlwiXG4gICAgICAgIDxkaXYgY2xhc3M9XCIje2NsYXNzZXN9XCIgaWQ9XCJpbmZvLSN7aWR9XCJcbiAgICAgICAgICBkYXRhLXBvc2l0aW9uPVwiI3twb3NpdGlvbn1cIj5cbiAgICAgICAgICAgICN7aW5mb2JveC5odG1sfVxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgICBcIlwiXCJcbiAgICAgICMgYWRkIHBvc3Qtb3B0aW9ucyBpZiBuZWNlc3NhcnlcbiAgICAgIGlmIGluZm9ib3gub2Zmc2V0WFxuICAgICAgICBjb250YWluZXIuZmluZChcIi4je1BsYW5pdC5pbmZvYm94Q2xhc3N9XCIpLmxhc3QoKS5hdHRyXG4gICAgICAgICAgJ2RhdGEtb2Zmc2V0LXgnOiBpbmZvYm94Lm9mZnNldFhcbiAgICAgIGlmIGluZm9ib3gub2Zmc2V0WVxuICAgICAgICBjb250YWluZXIuZmluZChcIi4je1BsYW5pdC5pbmZvYm94Q2xhc3N9XCIpLmxhc3QoKS5hdHRyXG4gICAgICAgICAgJ2RhdGEtb2Zmc2V0LXknOiBpbmZvYm94Lm9mZnNldFlcbiAgICAgIG1hcmtlci5hdHRyKCdkYXRhLWluZm9ib3gnLCBcImluZm8tI3tpZH1cIilcbiAgICAgIG0gPSBuZXcgUGxhbml0Lk1hcmtlcihjb250YWluZXIsIG9wdGlvbnMucGxhbml0SUQpXG4gICAgICBtLnBvc2l0aW9uSW5mb2JveCgpXG4gICAgICBtXG5cbiAgIyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PSBDYWxjdWxhdGlvbnNcblxuICAjIEdldCB0aGUgcG9zaXRpb24gb2YgdGhlIG1hcmtlciBhcyBhIHBlcmNlbnRhZ2Ugb2YgMTAwLFxuICAjIHJlbGF0aXZlIHRvIHRoZSB0b3AgbGVmdCBvZiB0aGUgaW1hZ2UgKGlmIHRoZXJlIGlzIGFuIGltYWdlKS5cbiAgI1xuICBwb3NpdGlvbjogPT5cbiAgICB4UHggPSBAbWFya2VyLnBvc2l0aW9uKCkubGVmdCArIChAbWFya2VyLm91dGVyV2lkdGgoKSAvIDIpXG4gICAgeVB4ID0gQG1hcmtlci5wb3NpdGlvbigpLnRvcCArIChAbWFya2VyLm91dGVySGVpZ2h0KCkgLyAyKVxuICAgIGlmIEBpbWFnZVxuICAgICAgd0ltZyA9IEBpbWFnZS53aWR0aCgpXG4gICAgICBoSW1nID0gQGltYWdlLmhlaWdodCgpXG4gICAgICB4SW1nID0gcGFyc2VJbnQoQGltYWdlLmNzcygnbGVmdCcpKVxuICAgICAgeUltZyA9IHBhcnNlSW50KEBpbWFnZS5jc3MoJ3RvcCcpKVxuICAgICAgeFBjID0gKCh4UHggKyBNYXRoLmFicyh4SW1nKSkgLyB3SW1nKSAqIDEwMFxuICAgICAgeVBjID0gKCh5UHggKyBNYXRoLmFicyh5SW1nKSkgLyBoSW1nKSAqIDEwMFxuICAgIGVsc2VcbiAgICAgIHhQYyA9ICh4UHggLyBAY29udGFpbmVyLndpZHRoKCkpICogMTAwXG4gICAgICB5UGMgPSAoeVB4IC8gQGNvbnRhaW5lci5oZWlnaHQoKSkgKiAxMDBcbiAgICBbeFBjLCB5UGNdXG5cbiAgIyBHZXQgdGhlIHBvc2l0aW9uIG9mIHRoZSBtYXJrZXIgYXMgYSBwZXJjZW50YWdlIG9mIDEwMCxcbiAgIyByZWxhdGl2ZSB0byB0aGUgdG9wIGxlZnQgb2YgdGhlIGNvbnRhaW5lci5cbiAgI1xuICByZWxhdGl2ZVBvc2l0aW9uOiA9PlxuICAgIHhQeCA9IEBtYXJrZXIucG9zaXRpb24oKS5sZWZ0ICsgKEBtYXJrZXIub3V0ZXJXaWR0aCgpIC8gMilcbiAgICB5UHggPSBAbWFya2VyLnBvc2l0aW9uKCkudG9wICsgKEBtYXJrZXIub3V0ZXJIZWlnaHQoKSAvIDIpXG4gICAgeFBjID0gKHhQeCAvIEBjb250YWluZXIud2lkdGgoKSkgKiAxMDBcbiAgICB5UGMgPSAoeVB4IC8gQGNvbnRhaW5lci5oZWlnaHQoKSkgKiAxMDBcbiAgICBbeFBjLCB5UGNdXG5cbiAgIyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PSBBdHRyaWJ1dGVzXG5cbiAgIyBUaGUgYmFja2dyb3VuZCBjb2xvciBvZiB0aGUgbWFya2VyXG4gICNcbiAgY29sb3I6ID0+XG4gICAgQG1hcmtlci5jc3MoJ2JhY2tncm91bmRDb2xvcicpXG5cbiAgIyBSYW5kb21seS1nZW5lcmF0ZWQgSUQgZ2l2ZW4gYnkgcGxhbml0IHdoZW4gdGhlIG1hcmtlciBpc1xuICAjIGFkZGVkIHRvIHRoZSBwbGFuLlxuICAjXG4gIHBsYW5pdElEOiA9PlxuICAgIEBtYXJrZXIuYXR0cignZGF0YS1tYXJrZXInKVxuXG4gICMgVGhlIElEIG9mIHRoZSBtYXJrZXIsIHdoaWNoIHdvdWxkIGhhdmUgYmVlbiBhIG1hbnVhbFxuICAjIG9wdGlvblxuICAjXG4gIGlkOiA9PlxuICAgIEBtYXJrZXIuYXR0cignZGF0YS1pZCcpXG5cbiAgIyBXaGV0aGVyIG9yIG5vdCB0aGUgbWFya2VyIGlzIGFsbG93ZWQgdG8gYmUgZHJhZ2dlZFxuICAjXG4gIGlzRHJhZ2dhYmxlOiA9PlxuICAgIEBtYXJrZXIuaGFzQ2xhc3MoJ2RyYWdnYWJsZScpXG5cbiAgIyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PSBJbmZvYm94XG5cbiAgIyBUaGUgalF1ZXJ5IG9iamVjdCB0aGF0IGlzIHRoZSBtYXJrZXJzIGluZm9ib3ggKGlmIHRoZVxuICAjIG1hcmtlciBoYXMgYW4gaW5mb2JveClcbiAgI1xuICBpbmZvYm94OiA9PlxuICAgIGluZm9ib3ggPSBAY29udGFpbmVyLmZpbmQoXCIjI3tAbWFya2VyLmF0dHIoJ2RhdGEtaW5mb2JveCcpfVwiKVxuICAgIGlmIGluZm9ib3gubGVuZ3RoID4gMCB0aGVuIGluZm9ib3ggZWxzZSBudWxsXG5cbiAgIyBUaGUgbWFya3VwIHdpdGhpbiB0aGUgaW5mb2JveCwgaWYgdGhlIG1hcmtlciBoYXMgYW5cbiAgIyBpbmZvYm94XG4gICNcbiAgaW5mb2JveEhUTUw6ID0+XG4gICAgaWYgQGluZm9ib3goKSAmJiBAaW5mb2JveCgpLmxlbmd0aCA+IDAgdGhlbiBAaW5mb2JveCgpLmh0bWwoKSBlbHNlIG51bGxcblxuICAjIFdoZXRoZXIgdGhlIGluZm9ib3ggaXMgYmVpbmcgZGlzcGxheWVkLlxuICAjXG4gIGluZm9ib3hWaXNpYmxlOiA9PlxuICAgIEBpbmZvYm94KCkgJiYgQGluZm9ib3goKS5oYXNDbGFzcygnYWN0aXZlJylcblxuICAjIEhpZGVzIHRoZSBpbmZvYm94IGlmIGl0IGlzIHZpc2libGUuXG4gICNcbiAgaGlkZUluZm9ib3g6ID0+XG4gICAgaWYgQGluZm9ib3hWaXNpYmxlKClcbiAgICAgIEBpbmZvYm94KCkuYWRkQ2xhc3MoJ2hpZGRlbicpXG4gICAgICB0cnVlXG4gICAgZWxzZVxuICAgICAgZmFsc2VcblxuICAjIFNob3dzIHRoZSBpbmZvYm94IGlmIGl0IGlzIGhpZGRlbi5cbiAgI1xuICBzaG93SW5mb2JveDogPT5cbiAgICBpZiBAaW5mb2JveCgpICYmICFAaW5mb2JveFZpc2libGUoKVxuICAgICAgQGluZm9ib3goKS5hZGRDbGFzcygnYWN0aXZlJylcbiAgICAgIEB1bmhpZGVJbmZvYm94KClcbiAgICAgIHRydWVcbiAgICBlbHNlXG4gICAgICBmYWxzZVxuXG4gICMgU2ltaWxhciB0byBzaG93SW5mb2JveCwgYnV0IGxlc3MgYWdyZXNzaXZlLiBJdCB0YWtlc1xuICAjIGF3YXkgaXRzIGhpZGRlbiBjbGFzcywgaW5zdGVhZCBvZiBhZGRpbmcgYW4gYWN0aXZlXG4gICMgY2xhc3MuXG4gICNcbiAgdW5oaWRlSW5mb2JveDogPT5cbiAgICBpZiBAaW5mb2JveFZpc2libGUoKVxuICAgICAgQGluZm9ib3goKS5yZW1vdmVDbGFzcygnaGlkZGVuJylcbiAgICAgIHRydWVcbiAgICBlbHNlXG4gICAgICBmYWxzZVxuXG4gICMgRmluZCB0aGUgYXBwcm9wcmlhdGUgY29vcmRpbmF0ZXMgYXQgd2hpY2ggdG8gZGlzcGxheSB0aGVcbiAgIyBpbmZvYm94LCBiYXNlZCBvbiBvcHRpb25zLlxuICAjXG4gIGluZm9ib3hDb29yZHM6ID0+XG4gICAgaW5mb2JveCA9IEBjb250YWluZXIuZmluZChcIiMje0BtYXJrZXIuYXR0cignZGF0YS1pbmZvYm94Jyl9XCIpXG4gICAgbWFya2VyQ2VudGVyWCA9IChwYXJzZUZsb2F0KEByZWxhdGl2ZVBvc2l0aW9uKClbMF0gLyAxMDApICogQGNvbnRhaW5lci53aWR0aCgpKVxuICAgIG1hcmtlckNlbnRlclkgPSAocGFyc2VGbG9hdChAcmVsYXRpdmVQb3NpdGlvbigpWzFdIC8gMTAwKSAqIEBjb250YWluZXIuaGVpZ2h0KCkpXG4gICAgaVdpZHRoID0gaW5mb2JveC5vdXRlcldpZHRoKClcbiAgICBpSGFsZldpZHRoID0gaVdpZHRoIC8gMlxuICAgIGlIZWlnaHQgPSBpbmZvYm94Lm91dGVySGVpZ2h0KClcbiAgICBpSGFsZkhlaWdodCA9IGlIZWlnaHQgLyAyXG4gICAgY1dpZHRoID0gQGNvbnRhaW5lci53aWR0aCgpXG4gICAgY0hlaWdodCA9IEBjb250YWluZXIuaGVpZ2h0KClcbiAgICBtV2lkdGggPSBAbWFya2VyLm91dGVyV2lkdGgoKVxuICAgIG1IYWxmV2lkdGggPSBtV2lkdGggLyAyXG4gICAgbUhlaWdodCA9IEBtYXJrZXIub3V0ZXJIZWlnaHQoKVxuICAgIG1IYWxmSGVpZ2h0ID0gbUhlaWdodCAvIDJcbiAgICBidWZmZXIgPSA1XG4gICAgb2Zmc2V0WCA9IHBhcnNlSW50KGluZm9ib3guYXR0cignZGF0YS1vZmZzZXQteCcpKVxuICAgIG9mZnNldFggPSAwIHVubGVzcyBvZmZzZXRYXG4gICAgb2Zmc2V0WSA9IHBhcnNlSW50KGluZm9ib3guYXR0cignZGF0YS1vZmZzZXQteScpKVxuICAgIG9mZnNldFkgPSAwIHVubGVzcyBvZmZzZXRZXG4gICAgc3dpdGNoIGluZm9ib3guYXR0cignZGF0YS1wb3NpdGlvbicpXG4gICAgICB3aGVuICd0b3AnXG4gICAgICAgIGluZm9MZWZ0ID0gbWFya2VyQ2VudGVyWCAtIGlIYWxmV2lkdGhcbiAgICAgICAgaW5mb1RvcCA9IG1hcmtlckNlbnRlclkgLSBpSGVpZ2h0IC0gbUhhbGZIZWlnaHQgLSBidWZmZXJcbiAgICAgIHdoZW4gJ3JpZ2h0J1xuICAgICAgICBpbmZvTGVmdCA9IG1hcmtlckNlbnRlclggKyBtSGFsZldpZHRoICsgYnVmZmVyXG4gICAgICAgIGluZm9Ub3AgPSBtYXJrZXJDZW50ZXJZIC0gaUhhbGZIZWlnaHRcbiAgICAgIHdoZW4gJ2JvdHRvbSdcbiAgICAgICAgaW5mb0xlZnQgPSBtYXJrZXJDZW50ZXJYIC0gaUhhbGZXaWR0aFxuICAgICAgICBpbmZvVG9wID0gbWFya2VyQ2VudGVyWSArIG1IYWxmSGVpZ2h0ICsgYnVmZmVyXG4gICAgICB3aGVuICdsZWZ0J1xuICAgICAgICBpbmZvTGVmdCA9IG1hcmtlckNlbnRlclggLSBpV2lkdGggLSBtSGFsZldpZHRoIC0gYnVmZmVyXG4gICAgICAgIGluZm9Ub3AgPSBtYXJrZXJDZW50ZXJZIC0gaUhhbGZIZWlnaHRcbiAgICAgIHdoZW4gJ3RvcC1sZWZ0J1xuICAgICAgICBpbmZvTGVmdCA9IG1hcmtlckNlbnRlclggLSBpV2lkdGggLSBtSGFsZldpZHRoICsgYnVmZmVyXG4gICAgICAgIGluZm9Ub3AgPSBtYXJrZXJDZW50ZXJZIC0gaUhlaWdodCAtIG1IYWxmSGVpZ2h0ICsgYnVmZmVyXG4gICAgICB3aGVuICd0b3AtcmlnaHQnXG4gICAgICAgIGluZm9MZWZ0ID0gbWFya2VyQ2VudGVyWCArIG1IYWxmV2lkdGggLSBidWZmZXJcbiAgICAgICAgaW5mb1RvcCA9IG1hcmtlckNlbnRlclkgLSBpSGVpZ2h0IC0gbUhhbGZIZWlnaHQgKyBidWZmZXJcbiAgICAgIHdoZW4gJ2JvdHRvbS1sZWZ0J1xuICAgICAgICBpbmZvTGVmdCA9IG1hcmtlckNlbnRlclggLSBpV2lkdGggLSBtSGFsZldpZHRoICsgYnVmZmVyXG4gICAgICAgIGluZm9Ub3AgPSBtYXJrZXJDZW50ZXJZICsgbUhhbGZIZWlnaHQgLSBidWZmZXJcbiAgICAgIHdoZW4gJ2JvdHRvbS1yaWdodCdcbiAgICAgICAgaW5mb0xlZnQgPSBtYXJrZXJDZW50ZXJYICsgbUhhbGZXaWR0aCAtIGJ1ZmZlclxuICAgICAgICBpbmZvVG9wID0gbWFya2VyQ2VudGVyWSArIG1IYWxmSGVpZ2h0IC0gYnVmZmVyXG4gICAgbGVmdDogaW5mb0xlZnQgKyBvZmZzZXRYXG4gICAgdG9wOiBpbmZvVG9wICsgb2Zmc2V0WVxuXG4gICMgUGxhY2VzIHRoZSBpbmZvYm94IGluIHRoZSBjb3JyZWN0IHBvc2l0aW9uLlxuICAjXG4gIHBvc2l0aW9uSW5mb2JveDogPT5cbiAgICBjb29yZHMgPSBAaW5mb2JveENvb3JkcygpXG4gICAgQGNvbnRhaW5lci5maW5kKFwiIyN7QG1hcmtlci5hdHRyKCdkYXRhLWluZm9ib3gnKX1cIikuY3NzXG4gICAgICBsZWZ0OiBcIiN7Y29vcmRzLmxlZnR9cHhcIlxuICAgICAgdG9wOiBcIiN7Y29vcmRzLnRvcH1weFwiXG4gICAgQHBvc2l0aW9uKClcblxuICAjIEFuaW1hdGVzIHRoZSBpbmZvYm94IGZyb20gaXRzIGN1cnJlbnQgcG9zaXRpb24gdG8gaXRzXG4gICMgbmV3IHBvc2l0aW9uLlxuICAjXG4gIGFuaW1hdGVJbmZvYm94OiA9PlxuICAgIGNvb3JkcyA9IEBpbmZvYm94Q29vcmRzKClcbiAgICBAY29udGFpbmVyLmZpbmQoXCIjI3tAbWFya2VyLmF0dHIoJ2RhdGEtaW5mb2JveCcpfVwiKS5hbmltYXRlXG4gICAgICBsZWZ0OiBcIiN7Y29vcmRzLmxlZnR9cHhcIlxuICAgICAgdG9wOiBcIiN7Y29vcmRzLnRvcH1weFwiXG4gICAgLCAyNTAsICgpID0+XG4gICAgICByZXR1cm4gQHBvc2l0aW9uKClcblxuICAjID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09IEFjdGlvbnNcblxuICAjIHBvc2l0aW9ucyB0aGUgbWFya2VyIGFuZCBpbmZvYm94IGJhc2VkIG9uIGl0cyBkYXRhXG4gICMgYXR0cmlidXRlc1xuICAjXG4gIHNldDogPT5cbiAgICBpZiBAaW1hZ2VcbiAgICAgIGxlZnQgPSAoQGltYWdlLndpZHRoKCkgKiAoQG1hcmtlci5hdHRyKCdkYXRhLXhQYycpIC8gMTAwKSkgK1xuICAgICAgICBwYXJzZUZsb2F0KEBpbWFnZS5jc3MoJ2xlZnQnKSkgLSAoQG1hcmtlci5vdXRlcldpZHRoKCkgLyAyKVxuICAgICAgdG9wID0gKEBpbWFnZS5oZWlnaHQoKSAqIChAbWFya2VyLmF0dHIoJ2RhdGEteVBjJykgLyAxMDApKSArXG4gICAgICAgIHBhcnNlRmxvYXQoQGltYWdlLmNzcygndG9wJykpIC0gKEBtYXJrZXIub3V0ZXJIZWlnaHQoKSAvIDIpXG4gICAgZWxzZVxuICAgICAgbGVmdCA9IChAY29udGFpbmVyLndpZHRoKCkgKiAoQG1hcmtlci5hdHRyKCdkYXRhLXhQYycpIC8gMTAwKSkgLVxuICAgICAgICAoQG1hcmtlci5vdXRlcldpZHRoKCkgLyAyKVxuICAgICAgdG9wID0gKEBjb250YWluZXIuaGVpZ2h0KCkgKiAoQG1hcmtlci5hdHRyKCdkYXRhLXlQYycpIC8gMTAwKSkgLSBcbiAgICAgICAgKEBtYXJrZXIub3V0ZXJIZWlnaHQoKSAvIDIpXG4gICAgQG1hcmtlci5jc3NcbiAgICAgIGxlZnQ6IFwiI3tsZWZ0fXB4XCJcbiAgICAgIHRvcDogXCIje3RvcH1weFwiXG4gICAgQHBvc2l0aW9uSW5mb2JveCgpXG4gICAgW2xlZnQsIHRvcF1cblxuICAjIFVwZGF0ZXMgdGhlIG1hcmtlcidzIGRhdGEgYXR0cmlidXRlcyB3aXRoIGl0cyBuZXdcbiAgIyBwb3NpdGlvbi5cbiAgI1xuICBzYXZlUG9zaXRpb246ID0+XG4gICAgY29vcmRzID0gQHBvc2l0aW9uKClcbiAgICBAbWFya2VyLmF0dHJcbiAgICAgICdkYXRhLXhQYyc6IGNvb3Jkc1swXVxuICAgICAgJ2RhdGEteVBjJzogY29vcmRzWzFdXG4gICAgY29vcmRzXG5cbiAgIyBBbGxvd3MgeW91IHRvIGNoYW5nZSB0aGUgYXR0cmlidXRlcyBvZiB0aGUgbWFya2VyIG9uIHRoZVxuICAjIGZseS5cbiAgI1xuICB1cGRhdGU6IChvcHRpb25zKSA9PlxuICAgIGlmIG9wdGlvbnMuY29sb3JcbiAgICAgIEBtYXJrZXIuY3NzKGJhY2tncm91bmRDb2xvcjogb3B0aW9ucy5jb2xvcilcbiAgICBpZiBvcHRpb25zLmluZm9ib3hcbiAgICAgIEBtYXJrZXIuZmluZChcIi4je1BsYW5pdC5pbmZvYm94Q2xhc3N9XCIpLmh0bWwob3B0aW9ucy5pbmZvYm94KVxuICAgICAgQHBvc2l0aW9uSW5mb2JveCgpXG4gICAgaWYgb3B0aW9ucy5kcmFnZ2FibGVcbiAgICAgIEBtYXJrZXIucmVtb3ZlQ2xhc3MoJ2RyYWdnYWJsZScpXG4gICAgICBAbWFya2VyLmFkZENsYXNzKCdkcmFnZ2FibGUnKSBpZiBvcHRpb25zLmRyYWdnYWJsZSA9PSB0cnVlXG4gICAgaWYgb3B0aW9ucy5jb29yZHNcbiAgICAgIGxlZnQgPSAoKHBhcnNlRmxvYXQob3B0aW9ucy5jb29yZHNbMF0pIC8gMTAwKSAqIEBjb250YWluZXIud2lkdGgoKSkgLSAxNVxuICAgICAgdG9wID0gKChwYXJzZUZsb2F0KG9wdGlvbnMuY29vcmRzWzFdKSAvIDEwMCkgKiBAY29udGFpbmVyLmhlaWdodCgpKSAtIDE1XG4gICAgICBAbWFya2VyLmNzc1xuICAgICAgICBsZWZ0OiBcIiN7bGVmdH1weFwiXG4gICAgICAgIHRvcDogXCIje3RvcH1weFwiXG4gICAgdHJ1ZVxuXG4gICMgUmVtb3ZlcyB0aGUgbWFya2VyIGZyb20gdGhlIHBsYW4uXG4gICNcbiAgcmVtb3ZlOiA9PlxuICAgIEBpbmZvYm94KCkucmVtb3ZlKCkgaWYgQGluZm9ib3goKVxuICAgIEBtYXJrZXIucmVtb3ZlKClcbiAgICB0cnVlXG5cbiMgYXR0YWNoZXMgdGhlIFBsYW5pdCBjbGFzcyB0byBhIGdsb2JhbCBwbGFuaXQgdmFyaWFibGVcbndpbmRvdy5wbGFuaXQgPSBuZXcgUGxhbml0XG4iXX0=