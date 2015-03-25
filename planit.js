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
    this.addMarker = bind(this.addMarker, this);
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

  Plan.prototype.addMarker = function(options) {
    var marker;
    if (options == null) {
      options = {};
    }
    options.container = this.container;
    marker = Planit.Marker.create(options);
    return marker;
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
    var arrow, arrowClass, classes, color, container, id, infobox, left, marker, markerObj, markersContainer, position, top;
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
    markerObj = new Planit.Marker(container, options.planitID);
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
      markerObj.positionInfobox();
    }
    return markerObj;
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

//# sourceMappingURL=data:application/json;base64,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Q0FBQSxNQUFNLENBQUMsR0FBUixDQUNFO0FBQUEsUUFBQSxJQUFBLEVBQVMsSUFBRCxHQUFNLElBQWQ7QUFBQSxRQUNBLEdBQUEsRUFBUSxHQUFELEdBQUssSUFEWjtPQURGLENBRkEsQ0FERjtLQVJBO1dBY0EsS0FmTTtFQUFBLENBN1NSLENBQUE7O0FBQUEsbUJBZ1VBLE1BQUEsR0FBUSxTQUFBLEdBQUE7QUFDTixJQUFBLElBQXVCLElBQUMsQ0FBQSxPQUFELENBQUEsQ0FBdkI7QUFBQSxNQUFBLElBQUMsQ0FBQSxPQUFELENBQUEsQ0FBVSxDQUFDLE1BQVgsQ0FBQSxDQUFBLENBQUE7S0FBQTtBQUFBLElBQ0EsSUFBQyxDQUFBLE1BQU0sQ0FBQyxNQUFSLENBQUEsQ0FEQSxDQUFBO1dBRUEsS0FITTtFQUFBLENBaFVSLENBQUE7O2dCQUFBOztJQTNsQkYsQ0FBQTs7QUFBQSxNQWk2Qk0sQ0FBQyxNQUFQLEdBQWdCLEdBQUEsQ0FBQSxNQWo2QmhCLENBQUEiLCJmaWxlIjoicGxhbml0LXRtcC5qcyIsInNvdXJjZVJvb3QiOiIvc291cmNlLyIsInNvdXJjZXNDb250ZW50IjpbImNsYXNzIFBsYW5pdFxuXG4gICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIERPTSBSZWZlcmVuY2VzXG5cbiAgQGNvbnRhaW5lckNsYXNzOiAgICAgICAgJ3BsYW5pdC1jb250YWluZXInXG4gIEBkcmFnZ2luZ0NsYXNzOiAgICAgICAgICdpcy1kcmFnZ2luZydcbiAgQGltYWdlQ29udGFpbmVyOiAgICAgICAgJ3BsYW5pdC1pbWFnZS1jb250YWluZXInXG4gIEBpbmZvYm94Q2xhc3M6ICAgICAgICAgICdwbGFuaXQtaW5mb2JveCdcbiAgQGluZm9ib3hDb250YWluZXJDbGFzczogJ3BsYW5pdC1pbmZvYm94LWNvbnRhaW5lcidcbiAgQG1hcmtlckNsYXNzOiAgICAgICAgICAgJ3BsYW5pdC1tYXJrZXInXG4gIEBtYXJrZXJDb250YWluZXJDbGFzczogICdwbGFuaXQtbWFya2Vycy1jb250YWluZXInXG4gIEBtYXJrZXJDb250ZW50Q2xhc3M6ICAgICdwbGFuaXQtbWFya2VyLWNvbnRlbnQnXG5cbiAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gSW5zdGFudGlhdGlvblxuXG4gIG5ldzogKEBvcHRpb25zID0ge30pIC0+XG4gICAgcmV0dXJuIG5ldyBQbGFuaXQuUGxhbihAb3B0aW9ucylcblxuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBHbG9iYWwgSGVscGVyc1xuXG4gIEByYW5kb21TdHJpbmc6IChsZW5ndGggPSAxNikgLT5cbiAgICBzdHIgPSBNYXRoLnJhbmRvbSgpLnRvU3RyaW5nKDM2KS5zbGljZSgyKVxuICAgIHN0ciA9IHN0ciArIE1hdGgucmFuZG9tKCkudG9TdHJpbmcoMzYpLnNsaWNlKDIpXG4gICAgc3RyLnN1YnN0cmluZygwLCBsZW5ndGggLSAxKVxuXG5jbGFzcyBQbGFuaXQuUGxhblxuXG4gICMgVGhpcyBjYWxscyBtZXRob2RzIHRvIGluc3RhbnRpYXRlIGEgbmV3IHBsYW4uIEZvdW5kIGluXG4gICMgcGxhbi9pbml0LmNvZmZlZVxuICAjXG4gIGNvbnN0cnVjdG9yOiAoQG9wdGlvbnMgPSB7fSkgLT5cbiAgICBtZXRob2QuY2FsbChAKSBmb3IgbWV0aG9kIGluIGluaXRNZXRob2RzKClcblxuICAjIChwcml2YXRlKSBNZXRob2RzIChpbiBvcmRlcikgbmVlZGVkIHRvIGluc3RhbnRpYXRlIHRoaXNcbiAgIyBvYmplY3RcbiAgI1xuICBpbml0TWV0aG9kcyA9IC0+XG4gICAgW2luaXRPcHRpb25zLCBpbml0Q29udGFpbmVyLCBpbml0SW1hZ2UsIGluaXRDYW52YXNNYXJrZXJzLCBpbml0RXZlbnRzXVxuXG5cbiAgIyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PSBPcHRpb25zXG5cbiAgIyAocHJpdmF0ZSkgQWRkIGRlZmF1bHQgb3B0aW9ucyBpZiB0aGUgbmVjZXNzYXJ5IG9wdGlvbnNcbiAgIyBhcmUgbWlzc2luZ1xuICAjXG4gIGluaXRPcHRpb25zID0gLT5cbiAgICBpZiBAb3B0aW9ucy5jb250YWluZXJcbiAgICAgIEBvcHRpb25zLmNvbnRhaW5lciA9ICQoXCIjI3tAb3B0aW9ucy5jb250YWluZXJ9XCIpXG4gICAgZWxzZVxuICAgICAgQG9wdGlvbnMuY29udGFpbmVyID0gJCgnI3BsYW5pdCcpXG4gICAgIyBkaXJlY3QgYWNjZXNzIHRvIHBsYW5pdCBjb250YWluZXJcbiAgICBAY29udGFpbmVyID0gQG9wdGlvbnMuY29udGFpbmVyXG5cbiAgIyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PSBDb250YWluZXJcblxuICAjIChwcml2YXRlKSBEcmF3IHRoZSBjb250YWluZXIgYW5kIHRoZSBzdWJjb250YWluZXJzXG4gICNcbiAgaW5pdENvbnRhaW5lciA9IC0+XG4gICAgQGNvbnRhaW5lci5hZGRDbGFzcyhQbGFuaXQuY29udGFpbmVyQ2xhc3MpXG4gICAgQGNvbnRhaW5lci5hcHBlbmQgXCJcIlwiXG4gICAgICA8ZGl2IGNsYXNzPVwiI3tQbGFuaXQuaW5mb2JveENvbnRhaW5lckNsYXNzfVwiPjwvZGl2PlxuICAgICAgPGRpdiBjbGFzcz1cIiN7UGxhbml0Lm1hcmtlckNvbnRhaW5lckNsYXNzfVwiPjwvZGl2PlxuICAgICAgICBcIlwiXCJcbiAgICBAbWFya2Vyc0NvbnRhaW5lciA9IEBjb250YWluZXIuZmluZChcIi4je1BsYW5pdC5tYXJrZXJDb250YWluZXJDbGFzc31cIilcbiAgICAgIC5maXJzdCgpICMgZGlyZWN0IGFjY2VzcyB0byBtYXJrZXJzIGNvbnRhaW5lclxuXG4gICMgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0gQmFja2dyb3VuZCBJbWFnZVxuXG4gICMgKHByaXZhdGUpIENyZWF0ZSBpbWFnZSBjb250YWluZXIgYW5kIGFkZCBpbWFnZSBpZlxuICAjIG5lY2Vzc2FyeVxuICAjXG4gIGluaXRJbWFnZSA9IC0+XG4gICAgaWYgQG9wdGlvbnMuaW1hZ2UgJiYgQG9wdGlvbnMuaW1hZ2UudXJsXG4gICAgICBAY29udGFpbmVyLnByZXBlbmQgXCJcIlwiXG4gICAgICAgIDxkaXYgY2xhc3M9XCIje1BsYW5pdC5pbWFnZUNvbnRhaW5lcn1cIj5cbiAgICAgICAgICA8aW1nIHNyYz1cIiN7QG9wdGlvbnMuaW1hZ2UudXJsfVwiPlxuICAgICAgICA8L2Rpdj5cbiAgICAgIFwiXCJcIlxuICAgICAgQGltYWdlID0gQGNvbnRhaW5lci5maW5kKCdpbWcnKS5maXJzdCgpXG4gICAgICBAaW1hZ2UubG9hZCAoKSA9PlxuICAgICAgICBAY29udGFpbmVyLmNzcyhoZWlnaHQ6IEBpbWFnZS5oZWlnaHQoKSlcbiAgICAgICAgaW5pdFpvb21hYmxlLmNhbGwoQClcbiAgICAgICAgaW5pdE1hcmtlcnMuY2FsbChAKVxuXG4gICMgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0gWm9vbWluZ1xuXG4gICMgKHByaXZhdGUpIFNldHMgb3VyIHJlZmVyZW5jZXMgZm9yIHdvcmtpbmcgd2l0aCB6b29tLCBhbmRcbiAgIyBjb250cm9scyB3aGV0aGVyIG9yIG5vdCB0byBhZGQgY29udHJvbHNcbiAgI1xuICBpbml0Wm9vbWFibGUgPSAtPlxuICAgICMgYWRkIHpvb20gSUQgdG8gbWFya2VycyBjb250YWluZXJcbiAgICBAem9vbUlkID0gUGxhbml0LnJhbmRvbVN0cmluZygpXG4gICAgQG1hcmtlcnNDb250YWluZXIuYXR0cignZGF0YS16b29tLWlkJywgQHpvb21JZClcbiAgICAjIHNldCBpbml0aWFsIGJhY2tncm91bmQgY29vcmRpbmF0ZXNcbiAgICBAcmVzZXRJbWFnZSgpXG4gICAgIyBhZGQgem9vbSBjb250cm9scyBpZiBuZWNlc3NhcnlcbiAgICBpbml0Wm9vbUNvbnRyb2xzLmNhbGwoQCkgaWYgQG9wdGlvbnMuaW1hZ2Uuem9vbVxuXG4gICMgKHByaXZhdGUpIFJlbmRlciB0aGUgem9vbSBjb250cm9scyBhbmQgYmluZHMgbmVjZXNzYXJ5XG4gICMgZXZlbnRzXG4gICNcbiAgaW5pdFpvb21Db250cm9scyA9IC0+XG4gICAgIyBkcmF3IHRoZSBjb250cm9scyBkaW5rdXNcbiAgICBAY29udGFpbmVyLnByZXBlbmQgXCJcIlwiXG4gICAgICA8ZGl2IGNsYXNzPVwicGxhbml0LWNvbnRyb2xzXCI+XG4gICAgICAgIDxhIGhyZWY9XCIjXCIgY2xhc3M9XCJ6b29tXCIgZGF0YS1hY3Rpb249XCJpblwiPis8L2E+XG4gICAgICAgIDxhIGhyZWY9XCIjXCIgY2xhc3M9XCJ6b29tXCIgZGF0YS1hY3Rpb249XCJvdXRcIj4tPC9hPlxuICAgICAgPC9kaXY+XG4gICAgXCJcIlwiXG4gICAgQGNvbnRhaW5lci5maW5kKFwiLnpvb21bZGF0YS1hY3Rpb249J2luJ11cIikuY2xpY2sgKGUpID0+XG4gICAgICBlLnByZXZlbnREZWZhdWx0KClcbiAgICAgIEB6b29tSW4oKVxuICAgIEBjb250YWluZXIuZmluZChcIi56b29tW2RhdGEtYWN0aW9uPSdvdXQnXVwiKS5jbGljayAoZSkgPT5cbiAgICAgIGUucHJldmVudERlZmF1bHQoKVxuICAgICAgQHpvb21PdXQoKVxuICAgICMgYmluZCBkcmFnZ2FibGUgZXZlbnRzXG4gICAgQGNvbnRhaW5lci5vbiAgICdkYmxjbGljaycsIChlKSA9PlxuICAgICAgekRibENsaWNrLmNhbGwoQCwgZSlcbiAgICBAY29udGFpbmVyLm9uICAgJ21vdXNlZG93bicsIChlKSA9PlxuICAgICAgek1vdXNlRG93bi5jYWxsKEAsIGUpXG4gICAgJChkb2N1bWVudCkub24gICdtb3VzZW1vdmUnLCAoZSkgPT5cbiAgICAgIHpNb3VzZU1vdmUuY2FsbChALCBlKVxuICAgICQoZG9jdW1lbnQpLm9uICAnbW91c2V1cCcsIChlKSA9PlxuICAgICAgek1vdXNlVXAuY2FsbChALCBlKVxuXG4gICMgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0gTWFya2Vyc1xuXG4gICMgKHByaXZhdGUpIFdpbGwgY2FsbCBpbml0TWFya2VycyBpZiB0aGVyZSBpcyBubyBpbWFnZSxcbiAgIyBvdGhlcndpc2UgaXQncyBjYWxsZWQgZnJvbSBpbml0SW1hZ2UsIHdoaWNoIHdhaXRzIGZvclxuICAjIHRoZSBpbWFnZSB0byBiZSBsb2FkZWQuXG4gICNcbiAgaW5pdENhbnZhc01hcmtlcnMgPSAtPlxuICAgIGluaXRNYXJrZXJzLmNhbGwoQCkgdW5sZXNzIEBvcHRpb25zLmltYWdlICYmIEBvcHRpb25zLmltYWdlLnVybFxuXG4gICMgSW50ZXJ2YWwgbWV0aG9kIHRoYXQgY29udGludWVzIHRvIGNoZWNrIGZvciBpbWFnZSBiZWluZ1xuICAjIGxvYWRlZCBiZWZvcmUgYWRkaW5nIG1hcmtlcnMgdG8gdGhlIHBsYW5cbiAgI1xuICBpbml0TWFya2VycyA9IC0+XG4gICAgaWYgQG9wdGlvbnMubWFya2VycyAmJiBAb3B0aW9ucy5tYXJrZXJzLmxlbmd0aCA+IDBcbiAgICAgIGZvciBtYXJrZXIgaW4gQG9wdGlvbnMubWFya2Vyc1xuICAgICAgICBtYXJrZXIuY29udGFpbmVyID0gQGNvbnRhaW5lclxuICAgICAgICBQbGFuaXQuTWFya2VyLmNyZWF0ZShtYXJrZXIpXG5cbiAgIyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PSBQbGFuIEV2ZW50c1xuXG4gICMgKHByaXZhdGUpIEJpbmQgZXZlbnRzIHRvIHRoZSBwbGFuLiBUaGVzZSBldmVudHMgZGVhbFxuICAjIG1vc3RseSB3aXRoIG1hcmtlcnMsIHNpbmNlIHNvbWUgZXZlbnQgc2hvdWxkIGJlIGF0dGFjaGVkXG4gICMgdG8gdGhlIHBsYW4gYW5kIGxhdGVyIGZpbmQgdGhlIGFwcHJvcHJpYXRlIG1hcmtlclxuICAjXG4gIGluaXRFdmVudHMgPSAtPlxuICAgIGlmIEBjb250YWluZXIuZmluZChcIi4je1BsYW5pdC5pbWFnZUNvbnRhaW5lcn0gPiBpbWdcIikubGVuZ3RoID4gMFxuICAgICAgQGltYWdlID0gQGNvbnRhaW5lci5maW5kKFwiLiN7UGxhbml0LmltYWdlQ29udGFpbmVyfSA+IGltZ1wiKS5maXJzdCgpXG4gICAgJChkb2N1bWVudCkub24gJ21vdXNlbW92ZScsIChlKSA9PlxuICAgICAgbW91c2Vtb3ZlLmNhbGwoQCwgZSlcbiAgICAkKGRvY3VtZW50KS5vbiAnbW91c2V1cCcsIChlKSA9PlxuICAgICAgbW91c2V1cC5jYWxsKEAsIGUpXG4gICAgJCh3aW5kb3cpLnJlc2l6ZSAoZSkgPT5cbiAgICAgIHJlc2l6ZS5jYWxsKEAsIGUpXG5cblxuICAjID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09IFNldHRpbmcgSW1hZ2VcblxuICAjIFpvb20gdGhlIGltYWdlIG91dCBhbGwgdGhlIHdheSBhbmQgc2V0cyB0aGUgbWFya2Vyc1xuICAjIGFwcHJvcHJpYXRlbHlcbiAgI1xuICByZXNldEltYWdlOiA9PlxuICAgIEBpbWFnZVBvc2l0aW9uID1cbiAgICAgIGxlZnRQeDogICAgICAgICAwXG4gICAgICB0b3BQeDogICAgICAgICAgMFxuICAgICAgd2lkdGg6ICAgICAgICAgIEBpbWFnZS53aWR0aCgpXG4gICAgICBoZWlnaHQ6ICAgICAgICAgQGltYWdlLmhlaWdodCgpXG4gICAgICBzY2FsZTogICAgICAgICAgMVxuICAgICAgaW5jcmVtZW50OiAgICAgIDAuNVxuICAgIHNldEJhY2tncm91bmQuY2FsbChAKVxuICAgIHRydWVcblxuICAjIChwcml2YXRlKSBNb3ZlcyB0aGUgYmFja2dyb3VuZCBhbmQgbWFya2VycyB3aXRob3V0XG4gICMgYW5pbWF0aW9uIHRvIHRoZSBsb2NhdGlvbiBzZXQgYnkgdGhlIGltYWdlUG9zaXRpb25cbiAgIyBwcm9wZXJ0eVxuICAjXG4gIHNldEJhY2tncm91bmQgPSAtPlxuICAgIEBpbWFnZS5jc3NcbiAgICAgIGxlZnQ6IFwiI3tAaW1hZ2VQb3NpdGlvbi5sZWZ0UHh9cHhcIlxuICAgICAgdG9wOiBcIiN7QGltYWdlUG9zaXRpb24udG9wUHh9cHhcIlxuICAgICAgd2lkdGg6IFwiI3tAaW1hZ2VQb3NpdGlvbi5zY2FsZSAqIDEwMC4wfSVcIlxuICAgICAgaGVpZ2h0OiAnYXV0bydcbiAgICBzZXRNYXJrZXJzLmNhbGwoQClcblxuICAjIChwcml2YXRlKSBFcXVpdmFsZW50IHRvIHNldEJhY2tncm91bmQsIGJ1dCB3aXRoXG4gICMgYW5pbWF0aW9uXG4gICNcbiAgYW5pbWF0ZUJhY2tncm91bmQgPSAtPlxuICAgIEBpbWFnZS5hbmltYXRlXG4gICAgICBsZWZ0OiBcIiN7QGltYWdlUG9zaXRpb24ubGVmdFB4fXB4XCJcbiAgICAgIHRvcDogXCIje0BpbWFnZVBvc2l0aW9uLnRvcFB4fXB4XCJcbiAgICAgIHdpZHRoOiBcIiN7QGltYWdlUG9zaXRpb24uc2NhbGUgKiAxMDAuMH0lXCJcbiAgICAgIGhlaWdodDogJ2F1dG8nXG4gICAgLCAyNTBcbiAgICBhbmltYXRlTWFya2Vycy5jYWxsKEApXG5cbiAgIyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PSBTZXR0aW5nIE1hcmtlcnNcblxuICAjIChwcml2YXRlKSBTZXRzIG1hcmtlcnMgaW4gY29ycmVjdCBsb2NhdGlvbiwgYmFzZWQgb25cbiAgIyBpbWFnZSBwb3NpdGlvblxuICAjXG4gIHNldE1hcmtlcnMgPSAtPlxuICAgIG1hcmtlcnMgPSBAY29udGFpbmVyLmZpbmQoXCIuI3tQbGFuaXQubWFya2VyQ2xhc3N9XCIpXG4gICAgaWYgbWFya2Vycy5sZW5ndGggPiAwXG4gICAgICBmb3IgbWFya2VyIGluIG1hcmtlcnNcbiAgICAgICAgbGVmdCA9IChAY2FsYyhpbWdXaWR0aCkgKiAoJChtYXJrZXIpLmF0dHIoJ2RhdGEteFBjJykgLyAxMDApKSArXG4gICAgICAgICAgQGltYWdlUG9zaXRpb24ubGVmdFB4IC0gKCQobWFya2VyKS5vdXRlcldpZHRoKCkgLyAyKVxuICAgICAgICB0b3AgPSAoQGNhbGMoaW1nSGVpZ2h0KSAqICgkKG1hcmtlcikuYXR0cignZGF0YS15UGMnKSAvIDEwMCkpICtcbiAgICAgICAgICBAaW1hZ2VQb3NpdGlvbi50b3BQeCAtICgkKG1hcmtlcikub3V0ZXJIZWlnaHQoKSAvIDIpXG4gICAgICAgICQobWFya2VyKS5jc3NcbiAgICAgICAgICBsZWZ0OiBcIiN7bGVmdH1weFwiXG4gICAgICAgICAgdG9wOiBcIiN7dG9wfXB4XCJcbiAgICAgIHBvc2l0aW9uSW5mb2JveGVzLmNhbGwoQClcblxuICAjIChwcml2YXRlKSBFcXVpdmFsZW50IHRvIHNldE1hcmtlcnMsIGJ1dCB3aXRoIGFuaW1hdGlvblxuICAjXG4gIGFuaW1hdGVNYXJrZXJzID0gLT5cbiAgICBtYXJrZXJzID0gQGNvbnRhaW5lci5maW5kKFwiLiN7UGxhbml0Lm1hcmtlckNsYXNzfVwiKVxuICAgIGlmIG1hcmtlcnMubGVuZ3RoID4gMFxuICAgICAgZm9yIG1hcmtlciBpbiBtYXJrZXJzXG4gICAgICAgIG0gPSBuZXcgUGxhbml0Lk1hcmtlcihAY29udGFpbmVyLCAkKG1hcmtlcikuYXR0cignZGF0YS1tYXJrZXInKSlcbiAgICAgICAgbS5oaWRlSW5mb2JveCgpXG4gICAgICAgIGxlZnQgPSAoQGNhbGMoaW1nV2lkdGgpICogKCQobWFya2VyKS5hdHRyKCdkYXRhLXhQYycpIC8gMTAwKSkgK1xuICAgICAgICAgIEBpbWFnZVBvc2l0aW9uLmxlZnRQeCAtICgkKG1hcmtlcikub3V0ZXJXaWR0aCgpIC8gMilcbiAgICAgICAgdG9wID0gKEBjYWxjKGltZ0hlaWdodCkgKiAoJChtYXJrZXIpLmF0dHIoJ2RhdGEteVBjJykgLyAxMDApKSArXG4gICAgICAgICAgQGltYWdlUG9zaXRpb24udG9wUHggLSAoJChtYXJrZXIpLm91dGVySGVpZ2h0KCkgLyAyKVxuICAgICAgICBkbyAobSkgLT5cbiAgICAgICAgICAkKG1hcmtlcikuYW5pbWF0ZVxuICAgICAgICAgICAgbGVmdDogXCIje2xlZnR9cHhcIlxuICAgICAgICAgICAgdG9wOiBcIiN7dG9wfXB4XCJcbiAgICAgICAgICAsIDI1MCwgKCkgPT5cbiAgICAgICAgICAgIG0ucG9zaXRpb25JbmZvYm94KClcbiAgICAgICAgICAgIG0udW5oaWRlSW5mb2JveCgpXG5cbiAgIyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PSBTZXR0aW5nIEluZm9ib3hlc1xuXG4gICMgKHByaXZhdGUpIEFwcHJvcHJpYXRlbHkgcG9zaXRpb24gdGhlIGluZm9ib3ggb24gZXZlcnlcbiAgIyBtYXJrZXIsIHRoZSBsb2dpYyBmb3Igd2hpY2ggaXMgaW4gdGhlIE1hcmtlciBjbGFzc1xuICAjXG4gIHBvc2l0aW9uSW5mb2JveGVzID0gLT5cbiAgICBmb3IgbWFya2VyIGluIEBjb250YWluZXIuZmluZChcIi4je1BsYW5pdC5tYXJrZXJDbGFzc31cIilcbiAgICAgIG0gPSBuZXcgUGxhbml0Lk1hcmtlcihAY29udGFpbmVyLCAkKG1hcmtlcikuYXR0cignZGF0YS1tYXJrZXInKSlcbiAgICAgIG0ucG9zaXRpb25JbmZvYm94KClcbiAgICB0cnVlXG5cbiAgIyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PSBNb3ZlIEFjdGlvbnNcblxuICAjIFdpbGwgY2VudGVyIHRoZSBpbWFnZSBvbiB0aGUgZ2l2ZW4gY29vcmRpbmF0ZXMgYXMgW3gseV1cbiAgIyBpbiBmbG9hdGVkIHBlcmNlbnRhZ2VzLiBFbnN1cmVzIHRoZXJlIGlzIGVub3VnaCBpbWFnZSBvblxuICAjIGVhY2ggc2lkZSBieSB6b29taW5nIGluIGlmIG5lY2Vzc2FyeS5cbiAgI1xuICBjZW50ZXJPbjogKGNvb3JkcykgPT5cbiAgICBpZiBjb29yZHNbMF0gPj0gNTAgdGhlbiB4ID0gMTAwIC0gY29vcmRzWzBdIGVsc2UgeCA9IGNvb3Jkc1swXVxuICAgIGlmIGNvb3Jkc1sxXSA+PSA1MCB0aGVuIHkgPSAxMDAgLSBjb29yZHNbMV0gZWxzZSB5ID0gY29vcmRzWzFdXG4gICAgd01pbiA9IDUwICogKEBjYWxjKGNvbnRhaW5lcldpZHRoKSAvIHgpXG4gICAgaE1pbiA9IDUwICogKEBjYWxjKGNvbnRhaW5lckhlaWdodCkgLyB5KVxuICAgICMgaGlkZXMgb3RoZXIgYWN0aXZlIGluZm9ib3hlcywgYnV0IHdpbGwgc3RpbGwgc2hvd1xuICAgICMgdGhpcyBpbmZvYm94XG4gICAgQGNvbnRhaW5lci5maW5kKFwiLiN7UGxhbml0LmluZm9ib3hDbGFzc31cIikucmVtb3ZlQ2xhc3MoJ2FjdGl2ZScpXG4gICAgIyBHZXQgb3VyIGluaXRpYWwgcG9zaXRpb25cbiAgICBAaW1hZ2VQb3NpdGlvbi5sZWZ0UHggPSAtIChcbiAgICAgIChAY2FsYyhpbWdXaWR0aCkgKiAoY29vcmRzWzBdIC8gMTAwKSkgLSAoQGNhbGMoY29udGFpbmVyV2lkdGgpIC8gMilcbiAgICApXG4gICAgQGltYWdlUG9zaXRpb24udG9wUHggPSAtIChcbiAgICAgIChAY2FsYyhpbWdIZWlnaHQpICogKGNvb3Jkc1sxXSAvIDEwMCkpIC0gKEBjYWxjKGNvbnRhaW5lckhlaWdodCkgLyAyKVxuICAgIClcbiAgICAjIGtlZXAgdGhlb3JldGljYWxseSBtYWtpbmcgdGhlIGltYWdlIGJpZ2dlciB1bnRpbCBpdCBpc1xuICAgICMgbGFyZ2UgZW5vdWdoIHRvIGNlbnRlciBvbiBvdXIgcG9pbnRcbiAgICB3aGlsZSAoQGNhbGMoaW1nV2lkdGgpIDwgd01pbikgfHwgKEBjYWxjKGltZ0hlaWdodCkgPCBoTWluKVxuICAgICAgQGltYWdlUG9zaXRpb24uc2NhbGUgID0gQGltYWdlUG9zaXRpb24uc2NhbGUgKyBAaW1hZ2VQb3NpdGlvbi5pbmNyZW1lbnRcbiAgICAgIEBpbWFnZVBvc2l0aW9uLmxlZnRQeCA9IC0gKFxuICAgICAgICAoQGNhbGMoaW1nV2lkdGgpICogKGNvb3Jkc1swXSAvIDEwMCkpIC0gKEBjYWxjKGNvbnRhaW5lcldpZHRoKSAvIDIpXG4gICAgICApXG4gICAgICBAaW1hZ2VQb3NpdGlvbi50b3BQeCA9IC0gKFxuICAgICAgICAoQGNhbGMoaW1nSGVpZ2h0KSAqIChjb29yZHNbMV0gLyAxMDApKSAtIChAY2FsYyhjb250YWluZXJIZWlnaHQpIC8gMilcbiAgICAgIClcbiAgICBhbmltYXRlQmFja2dyb3VuZC5jYWxsKEApXG4gICAgY29vcmRzXG5cbiAgIyBab29tcyB0aGUgaW1hZ2UgdG8gYSBzcGVjaWZpYyBcImxldmVsXCIgd2hpY2ggaXMgYW5cbiAgIyBpbmNyZW1lbnRlZCBpbnRlZ2VyIHN0YXJ0aW5nIGF0IHplcm9cbiAgI1xuICB6b29tVG86IChsZXZlbCkgPT5cbiAgICBpID0gQGltYWdlUG9zaXRpb24uaW5jcmVtZW50XG4gICAgdW5sZXNzICgobGV2ZWwgKiBpKSArIDEpID09IEBpbWFnZVBvc2l0aW9uLnNjYWxlXG4gICAgICBAaW1hZ2VQb3NpdGlvbi5zY2FsZSA9IChsZXZlbCAqIGkpICsgMSArIGlcbiAgICAgIEB6b29tT3V0KClcbiAgICBsZXZlbFxuXG4gICMgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0gQ2FsY3VsYXRpb25zXG5cbiAgIyBNZXRob2QgZm9yIGFjY2Vzc2luZyB0aGUgcHJpdmF0ZSBjYWxjdWxhdGlvbiBtZXRob2RzXG4gICNcbiAgY2FsYzogKG1ldGhvZCkgPT5cbiAgICBtZXRob2QuY2FsbChAKVxuXG4gICMgKHByaXZhdGUpIFdpZHRoIG9mIHRoZSBpbWFnZVxuICAjXG4gIGltZ1dpZHRoID0gLT5cbiAgICBwYXJzZUZsb2F0KEBpbWFnZVBvc2l0aW9uLndpZHRoICogQGltYWdlUG9zaXRpb24uc2NhbGUpXG5cbiAgIyAocHJpdmF0ZSkgVGhlIG51bWJlciBvZiBwaXhlbHMgYWRkZWQgd2l0aCBlYWNoIHpvb20gbGV2ZWxcbiAgI1xuICBpbWdXaWR0aENsaWNrSW5jcmVtZW50ID0gLT5cbiAgICBwYXJzZUZsb2F0KEBpbWFnZVBvc2l0aW9uLndpZHRoICogQGltYWdlUG9zaXRpb24uaW5jcmVtZW50KVxuXG4gICMgKHByaXZhdGUpIFRoZSB3aWR0aCBvZiB0aGUgY29udGFpbmVyXG4gICNcbiAgY29udGFpbmVyV2lkdGggPSAtPlxuICAgIHBhcnNlRmxvYXQoQG1hcmtlcnNDb250YWluZXIud2lkdGgoKSlcblxuICAjIChwcml2YXRlKSBOdW1iZXIgb2YgcGl4ZWxzIGxlZnQgc2lkZSBvZiBpbWFnZSBpcyBmcm9tXG4gICMgbGVmdCBzaWRlIG9mIHRoZSBjb250YWluZXJcbiAgI1xuICBpbWdPZmZzZXRMZWZ0ID0gLT5cbiAgICBNYXRoLmFicyhwYXJzZUZsb2F0KEBpbWFnZS5jc3MoJ2xlZnQnKSkpXG5cbiAgIyAocHJpdmF0ZSkgSGVpZ2h0IG9mIHRoZSBpbWFnZVxuICAjXG4gIGltZ0hlaWdodCA9IC0+XG4gICAgcGFyc2VGbG9hdChAaW1hZ2VQb3NpdGlvbi5oZWlnaHQgKiBAaW1hZ2VQb3NpdGlvbi5zY2FsZSlcblxuICAjIChwcml2YXRlKSBUaGUgbnVtYmVyIG9mIHBpeGVscyBhZGRlZCBvciByZW1vdmVkIHdpdGhcbiAgIyBlYWNoIHpvb20gbGV2ZWxcbiAgI1xuICBpbWdIZWlnaHRDbGlja0luY3JlbWVudCA9IC0+XG4gICAgcGFyc2VGbG9hdChAaW1hZ2VQb3NpdGlvbi5oZWlnaHQgKiBAaW1hZ2VQb3NpdGlvbi5pbmNyZW1lbnQpXG5cbiAgIyAocHJpdmF0ZSkgVGhlIGhlaWdodCBvZiB0aGUgY29udGFpbmVyIChwaXhlbHMpXG4gICNcbiAgY29udGFpbmVySGVpZ2h0ID0gLT5cbiAgICBwYXJzZUZsb2F0KEBtYXJrZXJzQ29udGFpbmVyLmhlaWdodCgpKVxuXG4gICMgKHByaXZhdGUpIFRoZSBudW1iZXIgb2YgcGl4ZWxzIHRoZSB0b3Agb2YgdGhlIGltYWdlIGlzXG4gICMgZnJvbSB0aGUgdG9wIG9mIHRoZSBjb250YWluZXJcbiAgI1xuICBpbWdPZmZzZXRUb3AgPSAtPlxuICAgIE1hdGguYWJzKHBhcnNlRmxvYXQoQGltYWdlLmNzcygndG9wJykpKVxuXG4gICMgKHByaXZhdGUpIENvb3JkaW5hdGVzIG9mIGFuIGV2ZW50IGFzIGEgcGVyY2VudGFnZSBvZiB0aGVcbiAgIyBkaW1lbnNpb25zIG9mIHRoZSBjb250YWluZXIsIHJlbGF0aXZlIHRvIHRoZSB0b3AgbGVmdFxuICAjIGNvcm5lciBvZiB0aGUgY29udGFpbmVyXG4gICNcbiAgekV2ZW50UG9zaXRpb24gPSAoZSkgLT5cbiAgICBsZWZ0OiAoZS5wYWdlWCAtIEBjb250YWluZXIub2Zmc2V0KCkubGVmdCkgLyBAY2FsYyhjb250YWluZXJXaWR0aClcbiAgICB0b3A6ICAoZS5wYWdlWSAtIEBjb250YWluZXIub2Zmc2V0KCkudG9wKSAvIEBjYWxjKGNvbnRhaW5lckhlaWdodClcblxuICAjID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09IEV2ZW50c1xuXG4gICMgKHByaXZhdGUpIExpc3RlbmVyIGZvciBkb3VibGUtY2xpY2tpbmcgb24gdGhlIHBsYW5cbiAgI1xuICB6RGJsQ2xpY2sgPSAoZSkgLT5cbiAgICBpZiAkKGUudGFyZ2V0KS5hdHRyKCdkYXRhLXpvb20taWQnKSA9PSBAem9vbUlkXG4gICAgICBjbGljayA9IHpFdmVudFBvc2l0aW9uLmNhbGwoQCwgZSlcbiAgICAgIEB6b29tSW4oJ2NsaWNrJywgY2xpY2subGVmdCwgY2xpY2sudG9wKVxuXG4gICMgKHByaXZhdGUpIExpc3RlbmVyIGZvciB0aGUgc3RhcnQgb2YgYSBjbGljayBvbiB0aGUgcGxhblxuICAjXG4gIHpNb3VzZURvd24gPSAoZSkgLT5cbiAgICBpZiAkKGUudGFyZ2V0KS5hdHRyKCdkYXRhLXpvb20taWQnKSA9PSBAem9vbUlkICYmIGUud2hpY2ggPT0gMVxuICAgICAgQGlzRHJhZ2dpbmcgPSB0cnVlXG4gICAgICBjb29yZHMgPSB6RXZlbnRQb3NpdGlvbi5jYWxsKEAsIGUpXG4gICAgICBAZHJhZ0Nvb3JkcyA9XG4gICAgICAgIHBvaW50UmVmOiBjb29yZHNcbiAgICAgICAgaW1nUmVmOlxuICAgICAgICAgIGxlZnQ6IDAgLSBAY2FsYyhpbWdPZmZzZXRMZWZ0KVxuICAgICAgICAgIHRvcDogMCAtIEBjYWxjKGltZ09mZnNldFRvcClcbiAgICAgICAgbWF4OlxuICAgICAgICAgIHJpZ2h0OiAoY29vcmRzLmxlZnQgKiBAY2FsYyhjb250YWluZXJXaWR0aCkpICsgQGNhbGMoaW1nT2Zmc2V0TGVmdClcbiAgICAgICAgICBsZWZ0OiAoY29vcmRzLmxlZnQgKiBAY2FsYyhjb250YWluZXJXaWR0aCkpIC0gKEBjYWxjKGltZ1dpZHRoKSAtXG4gICAgICAgICAgICAgICAgICAgICAgKEBjYWxjKGNvbnRhaW5lcldpZHRoKSArIEBjYWxjKGltZ09mZnNldExlZnQpKSlcbiAgICAgICAgICBib3R0b206IChjb29yZHMudG9wICogQGNhbGMoY29udGFpbmVySGVpZ2h0KSkgKyBAY2FsYyhpbWdPZmZzZXRUb3ApXG4gICAgICAgICAgdG9wOiAoY29vcmRzLnRvcCAqIEBjYWxjKGNvbnRhaW5lckhlaWdodCkpIC0gKEBjYWxjKGltZ0hlaWdodCkgLVxuICAgICAgICAgICAgICAgICAgICAgIChAY2FsYyhjb250YWluZXJIZWlnaHQpICsgQGNhbGMoaW1nT2Zmc2V0VG9wKSkpXG4gICAgdHJ1ZVxuXG4gICMgKHByaXZhdGUpIExpc3RlbmVyIGZvciB3aGVuIHRoZSBtb3VzZSBtb3ZlcyBhbnl3aGVyZSBvblxuICAjIHRoZSBkb2N1bWVudFxuICAjXG4gIHpNb3VzZU1vdmUgPSAoZSkgLT5cbiAgICBpZiBAaXNEcmFnZ2luZ1xuICAgICAgY29vcmRzID0gekV2ZW50UG9zaXRpb24uY2FsbChALCBlKVxuICAgICAgZHJhZ0xlZnQgPSBjb29yZHMubGVmdCAqIEBjYWxjKGNvbnRhaW5lcldpZHRoKVxuICAgICAgZHJhZ1RvcCA9IGNvb3Jkcy50b3AgKiBAY2FsYyhjb250YWluZXJIZWlnaHQpXG4gICAgICBpZiBkcmFnTGVmdCA+PSBAZHJhZ0Nvb3Jkcy5tYXgubGVmdCAmJiBkcmFnTGVmdCA8PSBAZHJhZ0Nvb3Jkcy5tYXgucmlnaHRcbiAgICAgICAgbGVmdCA9IChjb29yZHMubGVmdCAtIEBkcmFnQ29vcmRzLnBvaW50UmVmLmxlZnQpICogQGNhbGMoY29udGFpbmVyV2lkdGgpXG4gICAgICAgIEBpbWFnZVBvc2l0aW9uLmxlZnRQeCA9IEBkcmFnQ29vcmRzLmltZ1JlZi5sZWZ0ICsgbGVmdFxuICAgICAgZWxzZSBpZiBkcmFnTGVmdCA8IEBkcmFnQ29vcmRzLm1heC5sZWZ0XG4gICAgICAgIEBpbWFnZVBvc2l0aW9uLmxlZnRQeCA9IEBjYWxjKGNvbnRhaW5lcldpZHRoKSAtIEBjYWxjKGltZ1dpZHRoKVxuICAgICAgZWxzZSBpZiBkcmFnTGVmdCA+IEBkcmFnQ29vcmRzLm1heC5yaWdodFxuICAgICAgICBAaW1hZ2VQb3NpdGlvbi5sZWZ0UHggPSAwXG4gICAgICBpZiBkcmFnVG9wID49IEBkcmFnQ29vcmRzLm1heC50b3AgJiYgZHJhZ1RvcCA8PSBAZHJhZ0Nvb3Jkcy5tYXguYm90dG9tXG4gICAgICAgIHRvcCA9IChjb29yZHMudG9wIC0gQGRyYWdDb29yZHMucG9pbnRSZWYudG9wKSAqIEBjYWxjKGNvbnRhaW5lckhlaWdodClcbiAgICAgICAgQGltYWdlUG9zaXRpb24udG9wUHggPSBAZHJhZ0Nvb3Jkcy5pbWdSZWYudG9wICsgdG9wXG4gICAgICBlbHNlIGlmIGRyYWdUb3AgPCBAZHJhZ0Nvb3Jkcy5tYXgudG9wXG4gICAgICAgIEBpbWFnZVBvc2l0aW9uLnRvcFB4ID0gQGNhbGMoY29udGFpbmVySGVpZ2h0KSAtIEBjYWxjKGltZ0hlaWdodClcbiAgICAgIGVsc2UgaWYgZHJhZ1RvcCA+IEBkcmFnQ29vcmRzLm1heC5ib3R0b21cbiAgICAgICAgQGltYWdlUG9zaXRpb24udG9wUHggPSAwXG4gICAgICBzZXRCYWNrZ3JvdW5kLmNhbGwoQClcbiAgICB0cnVlXG5cbiAgIyAocHJpdmF0ZSkgTGlzdGVuZXIgZm9yIHRoZSBlbmQgb2YgYSBjbGljayBhbnl3aGVyZSBvblxuICAjIHRoZSBkb2N1bWVudFxuICAjXG4gIHpNb3VzZVVwID0gKGUpIC0+XG4gICAgQGlzRHJhZ2dpbmcgPSBmYWxzZVxuICAgIHBvc2l0aW9uSW5mb2JveGVzLmNhbGwoQClcbiAgICB0cnVlXG5cbiAgIyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PSBab29taW5nXG5cbiAgIyBUYWtlcyBjdXJyZW50IHpvb20gcG9zaXRpb24gYW5kIHpvb21zIGluIHRvIHRoZSBjZW50ZXJcbiAgIyBvbmUgbGV2ZWwgZGVlcGVyXG4gICNcbiAgem9vbUluOiA9PlxuICAgIEBpbWFnZVBvc2l0aW9uLnNjYWxlICA9IEBpbWFnZVBvc2l0aW9uLnNjYWxlICsgQGltYWdlUG9zaXRpb24uaW5jcmVtZW50XG4gICAgQGltYWdlUG9zaXRpb24ubGVmdFB4ID0gLSBAY2FsYyhpbWdPZmZzZXRMZWZ0KSAtXG4gICAgICAoQGNhbGMoaW1nV2lkdGhDbGlja0luY3JlbWVudCkgLyAyKVxuICAgIEBpbWFnZVBvc2l0aW9uLnRvcFB4ICA9IC0gQGNhbGMoaW1nT2Zmc2V0VG9wKSAtXG4gICAgICAoQGNhbGMoaW1nSGVpZ2h0Q2xpY2tJbmNyZW1lbnQpIC8gMilcbiAgICBhbmltYXRlQmFja2dyb3VuZC5jYWxsKEApXG4gICAgdHJ1ZVxuXG4gICMgWm9vbXMgb3V0IG9uZSBsZXZlbC4gQXR0ZW1wdHMgdG8gem9vbSBvdXQgZnJvbSB0aGVcbiAgIyBjZW50ZXIsIGJ1dCB3aWxsIGFkanVzdCBiYXNlZCBvbiBhdmFpbGFibGUgaW1hZ2Ugc3BhY2UuXG4gICNcbiAgem9vbU91dDogKCkgPT5cbiAgICBpZiBAaW1hZ2VQb3NpdGlvbi5zY2FsZSA+IDFcbiAgICAgIEBpbWFnZVBvc2l0aW9uLnNjYWxlICA9IEBpbWFnZVBvc2l0aW9uLnNjYWxlIC0gQGltYWdlUG9zaXRpb24uaW5jcmVtZW50XG4gICAgICBsZWZ0UHggPSAtIEBjYWxjKGltZ09mZnNldExlZnQpICsgKEBjYWxjKGltZ1dpZHRoQ2xpY2tJbmNyZW1lbnQpIC8gMilcbiAgICAgIHRvcFB4ICA9IC0gQGNhbGMoaW1nT2Zmc2V0VG9wKSArIChAY2FsYyhpbWdIZWlnaHRDbGlja0luY3JlbWVudCkgLyAyKVxuICAgICAgaWYgbGVmdFB4ID4gMFxuICAgICAgICBAaW1hZ2VQb3NpdGlvbi5sZWZ0UHggPSAwXG4gICAgICBlbHNlIGlmIGxlZnRQeCA8IEBjYWxjKGNvbnRhaW5lcldpZHRoKSAtIEBjYWxjKGltZ1dpZHRoKVxuICAgICAgICBAaW1hZ2VQb3NpdGlvbi5sZWZ0UHggPSBAY2FsYyhjb250YWluZXJXaWR0aCkgLSBAY2FsYyhpbWdXaWR0aClcbiAgICAgIGVsc2VcbiAgICAgICAgQGltYWdlUG9zaXRpb24ubGVmdFB4ID0gbGVmdFB4XG4gICAgICBpZiB0b3BQeCA+IDBcbiAgICAgICAgQGltYWdlUG9zaXRpb24udG9wUHggPSAwXG4gICAgICBlbHNlIGlmIHRvcFB4IDwgQGNhbGMoY29udGFpbmVySGVpZ2h0KSAtIEBjYWxjKGltZ0hlaWdodClcbiAgICAgICAgQGltYWdlUG9zaXRpb24udG9wUHggPSBAY2FsYyhjb250YWluZXJIZWlnaHQpIC0gQGNhbGMoaW1nSGVpZ2h0KVxuICAgICAgZWxzZVxuICAgICAgICBAaW1hZ2VQb3NpdGlvbi50b3BQeCA9IHRvcFB4XG4gICAgICBhbmltYXRlQmFja2dyb3VuZC5jYWxsKEApXG4gICAgICB0cnVlXG4gICAgZWxzZVxuICAgICAgZmFsc2VcblxuXG4gICMgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0gTWFya2VyIFJlZmVyZW5jZXNcblxuICAjIChwcml2YXRlKSBUaGUgbWFya2VyKHMpIHRoYXQgYXJlIGJlaW5nIGRyYWdnZWQsIGZvdW5kIGJ5XG4gICMgUGxhbml0J3MgZHJhZ2dpbmcgY2xhc3MuXG4gICNcbiAgZHJhZ2dpbmdNYXJrZXIgPSAtPlxuICAgIEBtYXJrZXJzQ29udGFpbmVyLmZpbmQoXCIuI3tQbGFuaXQubWFya2VyQ2xhc3N9LiN7UGxhbml0LmRyYWdnaW5nQ2xhc3N9XCIpXG5cbiAgIyAocHJpdmF0ZSkgQ29vcmRpbmF0ZXMgb2YgYW4gZXZlbnQgYXMgYSBwZXJjZW50YWdlIG9mIHRoZVxuICAjIGRpbWVuc2lvbnMgb2YgdGhlIGNvbnRhaW5lciwgcmVsYXRpdmUgdG8gdGhlIHRvcCBsZWZ0XG4gICMgY29ybmVyIG9mIHRoZSBpbWFnZVxuICAjXG4gIGdldEV2ZW50UG9zaXRpb24gPSAoZSkgLT5cbiAgICBpZiBAaW1hZ2VcbiAgICAgICMgaWYgdGhlcmUgaXMgYW4gaW1hZ2UsIHdlIG5lZWQgdG8gY2FsY3VsYXRlIHdpdGggaW1hZ2UgaW4gbWluZFxuICAgICAgeFB4ID0gZS5wYWdlWCAtIEBjb250YWluZXIub2Zmc2V0KCkubGVmdFxuICAgICAgeVB4ID0gZS5wYWdlWSAtIEBjb250YWluZXIub2Zmc2V0KCkudG9wXG4gICAgICB3SW1nID0gQGltYWdlLndpZHRoKClcbiAgICAgIGhJbWcgPSBAaW1hZ2UuaGVpZ2h0KClcbiAgICAgIHhJbWcgPSBwYXJzZUludChAaW1hZ2UuY3NzKCdsZWZ0JykpXG4gICAgICB5SW1nID0gcGFyc2VJbnQoQGltYWdlLmNzcygndG9wJykpXG4gICAgICB4UGMgPSAoKHhQeCArIE1hdGguYWJzKHhJbWcpKSAvIHdJbWcpICogMTAwXG4gICAgICB5UGMgPSAoKHlQeCArIE1hdGguYWJzKHlJbWcpKSAvIGhJbWcpICogMTAwXG4gICAgZWxzZVxuICAgICAgIyBvciB3ZSBjYW4ganVzdCBsb29rIGF0IHRoZSBjb250YWluZXJcbiAgICAgIHhQYyA9IChlLnBhZ2VYIC0gQGNvbnRhaW5lci5vZmZzZXQoKS5sZWZ0KSAvIEBjYWxjKGNvbnRhaW5lcldpZHRoKVxuICAgICAgeVBjID0gIChlLnBhZ2VZIC0gQGNvbnRhaW5lci5vZmZzZXQoKS50b3ApIC8gQGNhbGMoY29udGFpbmVySGVpZ2h0KVxuICAgIFt4UGMsIHlQY11cblxuICAjID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09IEV2ZW50c1xuXG4gICMgKHByaXZhdGUpIENhbGxlZCBhdCB0aGUgZW5kIG9mIGEgY2xpY2ssIHdoZW4gaXQgb2NjdXJzXG4gICMgb24gdG9wIG9mIHRoZSBwbGFuLlxuICAjXG4gIG1vdXNldXAgPSAoZSkgLT5cbiAgICAjIGRlYWxpbmcgd2l0aCBtYXJrZXJzLCBlc3AuIGRyYWdnaW5nIG1hcmtlcnNcbiAgICBtYXJrZXIgPSBAbWFya2Vyc0NvbnRhaW5lci5maW5kKFwiLiN7UGxhbml0LmRyYWdnaW5nQ2xhc3N9XCIpLmZpcnN0KClcbiAgICBpZiBkcmFnZ2luZ01hcmtlci5jYWxsKEApLmxlbmd0aCA+IDBcbiAgICAgIG0gPSBuZXcgUGxhbml0Lk1hcmtlcihAY29udGFpbmVyLCBtYXJrZXIuYXR0cignZGF0YS1tYXJrZXInKSlcbiAgICAgIGlmIEBvcHRpb25zLm1hcmtlckRyYWdFbmRcbiAgICAgICAgQG9wdGlvbnMubWFya2VyRHJhZ0VuZChlLCBtKVxuICAgICAgbS5zYXZlUG9zaXRpb24oKVxuICAgICAgbS5wb3NpdGlvbkluZm9ib3goKVxuICAgICAgZHJhZ2dpbmdNYXJrZXIuY2FsbChAKS5yZW1vdmVDbGFzcyhQbGFuaXQuZHJhZ2dpbmdDbGFzcylcbiAgICAjIGlmIGNsaWNrIGlzIG9uIHRoZSBjb250YWluZXJcbiAgICBpZiAkKGUudGFyZ2V0KS5oYXNDbGFzcyhQbGFuaXQubWFya2VyQ29udGFpbmVyQ2xhc3MpXG4gICAgICBpZiBAb3B0aW9ucy5jYW52YXNDbGlja1xuICAgICAgICBAb3B0aW9ucy5jYW52YXNDbGljayhlLCBnZXRFdmVudFBvc2l0aW9uLmNhbGwoQCwgZSkpXG4gICAgIyBpZiBjbGljayBpcyBvbiB0aGUgbWFya2Vyc1xuICAgIGlmKFxuICAgICAgJChlLnRhcmdldCkuaGFzQ2xhc3MoUGxhbml0Lm1hcmtlckNsYXNzKSB8fFxuICAgICAgJChlLnRhcmdldCkucGFyZW50cyhcIi4je1BsYW5pdC5tYXJrZXJDbGFzc31cIikubGVuZ3RoID4gMFxuICAgIClcbiAgICAgIGlmICQoZS50YXJnZXQpLmhhc0NsYXNzKFBsYW5pdC5tYXJrZXJDbGFzcylcbiAgICAgICAgbWFya2VyID0gJChlLnRhcmdldClcbiAgICAgIGVsc2VcbiAgICAgICAgbWFya2VyID0gJChlLnRhcmdldCkucGFyZW50cyhcIi4je1BsYW5pdC5tYXJrZXJDbGFzc31cIikuZmlyc3QoKVxuICAgICAgbSA9IG5ldyBQbGFuaXQuTWFya2VyKEBjb250YWluZXIsIG1hcmtlci5hdHRyKCdkYXRhLW1hcmtlcicpKVxuICAgICAgaWYgQG9wdGlvbnMubWFya2VyQ2xpY2tcbiAgICAgICAgQG9wdGlvbnMubWFya2VyQ2xpY2soZSwgbSlcbiAgICB0cnVlXG5cbiAgIyAocHJpdmF0ZSkgQ2FsbGVkIHdoZW5ldmVyIHRoZSBtb3VzZSBtb3ZlcyBvdmVyIHRoZSBwbGFuLlxuICAjXG4gIG1vdXNlbW92ZSA9IChlKSAtPlxuICAgIG1hcmtlcnMgPSBAbWFya2Vyc0NvbnRhaW5lci5maW5kKFwiLiN7UGxhbml0Lm1hcmtlckNsYXNzfS4je1BsYW5pdC5kcmFnZ2luZ0NsYXNzfVwiKVxuXG4gICAgaWYgbWFya2Vycy5sZW5ndGggPiAwXG5cbiAgICAgICMgb25seSB1c2UgZmlyc3QgbWFya2VyIGluIGNhc2UgdGhlcmUgYXJlIG1vcmUgdGhhblxuICAgICAgIyBvbmUgZHJhZ2dpbmdcbiAgICAgICNcbiAgICAgIG1hcmtlciA9IG1hcmtlcnMuZmlyc3QoKVxuXG4gICAgICAjIHdlIGhpZGUgdGhlIGluZm9ib3ggd2hpbGUgZHJhZ2dpbmdcbiAgICAgICNcbiAgICAgIGlmKFxuICAgICAgICBNYXRoLmFicyhlLnBhZ2VYIC0gbWFya2VyLmF0dHIoJ2RhdGEtZHJhZy1zdGFydC14JykpID4gMCB8fFxuICAgICAgICBNYXRoLmFicyhlLnBhZ2VZIC0gbWFya2VyLmF0dHIoJ2RhdGEtZHJhZy1zdGFydC15JykpID4gMFxuICAgICAgKVxuICAgICAgICBAY29udGFpbmVyLmZpbmQoXCIjI3ttYXJrZXIuYXR0cignZGF0YS1pbmZvYm94Jyl9XCIpLnJlbW92ZUNsYXNzKCdhY3RpdmUnKVxuXG4gICAgICAjIGNhbGN1bGF0ZSBwb3NpdGlvbnNcbiAgICAgICNcbiAgICAgIG1vdXNlTGVmdCAgICAgPSBlLnBhZ2VYIC0gQGNvbnRhaW5lci5vZmZzZXQoKS5sZWZ0XG4gICAgICBtb3VzZVRvcCAgICAgID0gZS5wYWdlWSAtIEBjb250YWluZXIub2Zmc2V0KCkudG9wXG4gICAgICBwbGFuUmlnaHQgICAgID0gQGNvbnRhaW5lci53aWR0aCgpXG4gICAgICBwbGFuQm90dG9tICAgID0gQGNvbnRhaW5lci5oZWlnaHQoKVxuICAgICAgbWFya2VyTGVmdCAgICA9IG1vdXNlTGVmdCAtIChtYXJrZXIub3V0ZXJXaWR0aCgpIC8gMilcbiAgICAgIG1hcmtlclRvcCAgICAgPSBtb3VzZVRvcCAtIChtYXJrZXIub3V0ZXJIZWlnaHQoKSAvIDIpXG4gICAgICBtYXJrZXJSaWdodCAgID0gbW91c2VMZWZ0ICsgKG1hcmtlci5vdXRlcldpZHRoKCkgLyAyKVxuICAgICAgbWFya2VyQm90dG9tICA9IG1vdXNlVG9wICsgKG1hcmtlci5vdXRlckhlaWdodCgpIC8gMilcbiAgICAgIG1hcmtlcldpZHRoICAgPSBtYXJrZXIub3V0ZXJXaWR0aCgpXG4gICAgICBtYXJrZXJIZWlnaHQgID0gbWFya2VyLm91dGVySGVpZ2h0KClcblxuICAgICAgIyBmaW5kIHRoZSBsZWZ0IHBvc2l0aW9uIG9mIHRoZSBtYXJrZXIgYmFzZWQgb25cbiAgICAgICMgcG9zaXRpb24gb2YgdGhlIG1vdXNlIHJlbGF0aXZlIHRvIHRoZSBwbGFuXG4gICAgICAjXG4gICAgICBpZiBtYXJrZXJMZWZ0IDw9IDBcbiAgICAgICAgbWFya2VyWCA9IDBcbiAgICAgIGVsc2UgaWYgbWFya2VyUmlnaHQgPCBwbGFuUmlnaHRcbiAgICAgICAgbWFya2VyWCA9IG1hcmtlckxlZnRcbiAgICAgIGVsc2VcbiAgICAgICAgbWFya2VyWCA9IHBsYW5SaWdodCAtIG1hcmtlcldpZHRoXG5cbiAgICAgICMgZmluZCB0aGUgbGVmdCBwb3NpdGlvbiBvZiB0aGUgbWFya2VyIGJhc2VkIG9uXG4gICAgICAjIHBvc2l0aW9uIG9mIHRoZSBtb3VzZSByZWxhdGl2ZSB0byB0aGUgcGxhblxuICAgICAgI1xuICAgICAgaWYgbWFya2VyVG9wIDw9IDBcbiAgICAgICAgbWFya2VyWSA9IDBcbiAgICAgIGVsc2UgaWYgbWFya2VyQm90dG9tIDwgcGxhbkJvdHRvbVxuICAgICAgICBtYXJrZXJZID0gbWFya2VyVG9wXG4gICAgICBlbHNlXG4gICAgICAgIG1hcmtlclkgPSBwbGFuQm90dG9tIC0gbWFya2VySGVpZ2h0XG5cbiAgICAgICMgc2V0IHRoZSBwb3NpdGlvbiBvZiB0aGUgbWFya2VyXG4gICAgICAjXG4gICAgICBtYXJrZXIuY3NzXG4gICAgICAgIGxlZnQ6IG1hcmtlclhcbiAgICAgICAgdG9wOiBtYXJrZXJZXG5cbiAgcmVzaXplID0gKGUpIC0+XG4gICAgaWYgQGltYWdlXG4gICAgICBAcmVzZXRJbWFnZSgpXG4gICAgICBAY29udGFpbmVyLmhlaWdodChAaW1hZ2UuaGVpZ2h0KCkpXG4gICAgZm9yIG1hcmtlciBpbiBAbWFya2Vyc0NvbnRhaW5lci5maW5kKCcucGxhbml0LW1hcmtlcicpXG4gICAgICBtID0gbmV3IFBsYW5pdC5NYXJrZXIoQGNvbnRhaW5lciwgJChtYXJrZXIpLmF0dHIoJ2RhdGEtbWFya2VyJykpXG4gICAgICBtLnNldCgpXG5cblxuICAjID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09IEFkZCBBIE1hcmtlclxuXG4gICMgQWRkcyBhIG1hcmtlciB0byB0aGUgcGxhblxuICAjXG4gIGFkZE1hcmtlcjogKG9wdGlvbnMgPSB7fSkgPT5cbiAgICBvcHRpb25zLmNvbnRhaW5lciA9IEBjb250YWluZXJcbiAgICBtYXJrZXIgPSBQbGFuaXQuTWFya2VyLmNyZWF0ZShvcHRpb25zKVxuICAgIHJldHVybiBtYXJrZXJcblxuY2xhc3MgUGxhbml0Lk1hcmtlclxuXG4gICMgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0gU2V0dXBcblxuICAjIFdoZW4gdGhlIE1hcmtlciBjbGFzcyBpcyBpbnN0YW50aWF0ZWQsIHdlIHJldHVybiB0aGVcbiAgIyBvYmplY3QsIGJ1dCBhbGwgd2UgbmVlZCB0byBkbyBpcyBzZXQgcmVmZXJlbmNlcyBhbmQgZmluZFxuICAjIHRoZSBhcHByb3ByaWF0ZSBqUXVlcnkgb2JqZWN0LlxuICAjXG4gICMgSXQncyBmb3IgdGhpcyByZWFzb24gdGhhdCB0aGUgY3JlYXRlIGFjdGlvbiBpcyBhIGNsYXNzXG4gICMgbWV0aG9kICh0aGUgbWFya2VyIGRvZXNuJ3QgcGh5c2ljYWxseSBleGlzdCB5ZXQpXG4gICNcbiAgY29uc3RydWN0b3I6IChAY29udGFpbmVyLCBpZCkgLT5cbiAgICAjIFNldCBPcHRpb25zXG4gICAgQG1hcmtlcnNDb250YWluZXIgPSBAY29udGFpbmVyLmZpbmQoXCIuI3tQbGFuaXQubWFya2VyQ29udGFpbmVyQ2xhc3N9XCIpXG4gICAgaWYgQGNvbnRhaW5lci5maW5kKFwiLiN7UGxhbml0LmltYWdlQ29udGFpbmVyfSA+IGltZ1wiKS5sZW5ndGggPiAwXG4gICAgICBAaW1hZ2UgPSBAY29udGFpbmVyLmZpbmQoXCIuI3tQbGFuaXQuaW1hZ2VDb250YWluZXJ9ID4gaW1nXCIpLmZpcnN0KClcblxuICAgICMgRmluZCBNYXJrZXJcbiAgICBAbWFya2VyID0gQG1hcmtlcnNDb250YWluZXIuZmluZChcbiAgICAgIFwiLiN7UGxhbml0Lm1hcmtlckNsYXNzfVtkYXRhLW1hcmtlcj0nI3tpZH0nXVwiXG4gICAgKS5maXJzdCgpXG5cbiAgICAjIFJldHVybiB0aGlzXG4gICAgQFxuXG4gICMgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0gQ3JlYXRlIE5ldyBNYXJrZXJcblxuICAjIChjbGFzcyBtZXRob2QpIENyZWF0ZXMgYSBuZXcgbWFya2VyXG4gICNcbiAgQGNyZWF0ZTogKG9wdGlvbnMpIC0+XG4gICAgIyBsb2NhbCByZWZlcmVuY2VzXG4gICAgY29udGFpbmVyID0gb3B0aW9ucy5jb250YWluZXJcbiAgICBtYXJrZXJzQ29udGFpbmVyID0gY29udGFpbmVyLmZpbmQoXCIuI3tQbGFuaXQubWFya2VyQ29udGFpbmVyQ2xhc3N9XCIpLmZpcnN0KClcbiAgICAjIHNldCBvcHRpb25zXG4gICAgb3B0aW9ucy5wbGFuaXRJRCA9IFBsYW5pdC5yYW5kb21TdHJpbmcoMjApIHVubGVzcyBvcHRpb25zLnBsYW5pdElEXG4gICAgaWYgb3B0aW9ucy5jb2xvciB0aGVuIGNvbG9yID0gb3B0aW9ucy5jb2xvciBlbHNlIGNvbG9yID0gJyNGQzVCM0YnXG4gICAgIyBmaW5kIHBvc2l0aW9uXG4gICAgbGVmdCA9ICgocGFyc2VGbG9hdChvcHRpb25zLmNvb3Jkc1swXSkgLyAxMDApICogY29udGFpbmVyLndpZHRoKCkpIC0gMTVcbiAgICB0b3AgPSAoKHBhcnNlRmxvYXQob3B0aW9ucy5jb29yZHNbMV0pIC8gMTAwKSAqIGNvbnRhaW5lci5oZWlnaHQoKSkgLSAxNVxuICAgICMgY3JlYXRlIHRoZSBtYXJrZXJcbiAgICBtYXJrZXJzQ29udGFpbmVyLmFwcGVuZChcbiAgICAgICQoJzxkaXY+PC9kaXY+JylcbiAgICAgICAgLmFkZENsYXNzKFBsYW5pdC5tYXJrZXJDbGFzcylcbiAgICAgICAgLmF0dHJcbiAgICAgICAgICAnZGF0YS1tYXJrZXInOiBvcHRpb25zLnBsYW5pdElEXG4gICAgICAgICAgJ2RhdGEteFBjJzogb3B0aW9ucy5jb29yZHNbMF1cbiAgICAgICAgICAnZGF0YS15UGMnOiBvcHRpb25zLmNvb3Jkc1sxXVxuICAgICAgICAuY3NzXG4gICAgICAgICAgbGVmdDogXCIje2xlZnR9cHhcIlxuICAgICAgICAgIHRvcDogXCIje3RvcH1weFwiXG4gICAgICAgICAgYmFja2dyb3VuZENvbG9yOiBjb2xvclxuICAgIClcbiAgICAjIGZpbmQgdGhlIG1hcmtlclxuICAgIG1hcmtlciA9IG1hcmtlcnNDb250YWluZXIuZmluZChcIi4je1BsYW5pdC5tYXJrZXJDbGFzc31cIikubGFzdCgpXG4gICAgbWFya2VyT2JqID0gbmV3IFBsYW5pdC5NYXJrZXIoY29udGFpbmVyLCBvcHRpb25zLnBsYW5pdElEKVxuICAgICMgYWRkIGNvbnRlbnQgYW5kIHN0eWxlcyBpZiBwYXNzZWQgYXMgb3B0aW9uc1xuICAgIGlmIG9wdGlvbnMuaWRcbiAgICAgIG1hcmtlci5hdHRyKCdkYXRhLWlkJzogb3B0aW9ucy5pZClcbiAgICBpZiBvcHRpb25zLmNsYXNzXG4gICAgICBtYXJrZXIuYWRkQ2xhc3Mob3B0aW9ucy5jbGFzcylcbiAgICBpZiBvcHRpb25zLmh0bWxcbiAgICAgIG1hcmtlci5odG1sKG9wdGlvbnMuaHRtbClcbiAgICBpZiBvcHRpb25zLnNpemVcbiAgICAgIG1hcmtlci5jc3NcbiAgICAgICAgd2lkdGg6IFwiI3tvcHRpb25zLnNpemV9cHhcIlxuICAgICAgICBoZWlnaHQ6IFwiI3tvcHRpb25zLnNpemV9cHhcIlxuICAgICMgc2V0dXAgZHJhZ2dhYmxlIGlmIG5lY2Vzc2FyeVxuICAgIGlmIG9wdGlvbnMuZHJhZ2dhYmxlXG4gICAgICBtYXJrZXIuYWRkQ2xhc3MoJ2RyYWdnYWJsZScpXG4gICAgICBtYXJrZXIub24gJ21vdXNlZG93bicsIChlKSA9PlxuICAgICAgICBpZiBlLndoaWNoID09IDFcbiAgICAgICAgICBtYXJrZXIgPSAkKGUudGFyZ2V0KS5jbG9zZXN0KFwiLiN7UGxhbml0Lm1hcmtlckNsYXNzfVwiKVxuICAgICAgICAgIG1hcmtlci5hZGRDbGFzcyhQbGFuaXQuZHJhZ2dpbmdDbGFzcylcbiAgICAgICAgICBtYXJrZXIuYXR0clxuICAgICAgICAgICAgJ2RhdGEtZHJhZy1zdGFydC14JzogZS5wYWdlWFxuICAgICAgICAgICAgJ2RhdGEtZHJhZy1zdGFydC15JzogZS5wYWdlWVxuICAgICMgc2V0dXAgaW5mb2JveCBpZiBuZWNlc3NhcnlcbiAgICBpZiBvcHRpb25zLmluZm9ib3hcbiAgICAgIGlkID0gUGxhbml0LnJhbmRvbVN0cmluZygxNilcbiAgICAgICMgc2V0IHN0eWxlIG9wdGlvbnMgb24gaW5mb2JveFxuICAgICAgaW5mb2JveCA9IG9wdGlvbnMuaW5mb2JveFxuICAgICAgaWYgaW5mb2JveC5wb3NpdGlvbiB0aGVuIHBvc2l0aW9uID0gaW5mb2JveC5wb3NpdGlvbiBlbHNlIHBvc2l0aW9uID0gJ3RvcCdcbiAgICAgIGlmIGluZm9ib3guYXJyb3cgdGhlbiBhcnJvdyA9IHRydWUgZWxzZSBhcnJvdyA9IGZhbHNlXG4gICAgICBpZiBhcnJvdyA9PSB0cnVlIHRoZW4gYXJyb3dDbGFzcyA9ICdhcnJvdycgZWxzZSBhcnJvd0NsYXNzID0gJydcbiAgICAgIGNsYXNzZXMgPSBcIiN7UGxhbml0LmluZm9ib3hDbGFzc30gI3twb3NpdGlvbn0gI3thcnJvd0NsYXNzfVwiXG4gICAgICAjIGFkZCBpbmZvYm94XG4gICAgICBjb250YWluZXIuZmluZChcIi4je1BsYW5pdC5pbmZvYm94Q29udGFpbmVyQ2xhc3N9XCIpLmFwcGVuZCBcIlwiXCJcbiAgICAgICAgPGRpdiBjbGFzcz1cIiN7Y2xhc3Nlc31cIiBpZD1cImluZm8tI3tpZH1cIlxuICAgICAgICAgIGRhdGEtcG9zaXRpb249XCIje3Bvc2l0aW9ufVwiPlxuICAgICAgICAgICAgI3tpbmZvYm94Lmh0bWx9XG4gICAgICAgIDwvZGl2PlxuICAgICAgICAgIFwiXCJcIlxuICAgICAgIyBhZGQgcG9zdC1vcHRpb25zIGlmIG5lY2Vzc2FyeVxuICAgICAgaWYgaW5mb2JveC5vZmZzZXRYXG4gICAgICAgIGNvbnRhaW5lci5maW5kKFwiLiN7UGxhbml0LmluZm9ib3hDbGFzc31cIikubGFzdCgpLmF0dHJcbiAgICAgICAgICAnZGF0YS1vZmZzZXQteCc6IGluZm9ib3gub2Zmc2V0WFxuICAgICAgaWYgaW5mb2JveC5vZmZzZXRZXG4gICAgICAgIGNvbnRhaW5lci5maW5kKFwiLiN7UGxhbml0LmluZm9ib3hDbGFzc31cIikubGFzdCgpLmF0dHJcbiAgICAgICAgICAnZGF0YS1vZmZzZXQteSc6IGluZm9ib3gub2Zmc2V0WVxuICAgICAgbWFya2VyLmF0dHIoJ2RhdGEtaW5mb2JveCcsIFwiaW5mby0je2lkfVwiKVxuICAgICAgbWFya2VyT2JqLnBvc2l0aW9uSW5mb2JveCgpXG4gICAgbWFya2VyT2JqXG5cbiAgIyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PSBDYWxjdWxhdGlvbnNcblxuICAjIEdldCB0aGUgcG9zaXRpb24gb2YgdGhlIG1hcmtlciBhcyBhIHBlcmNlbnRhZ2Ugb2YgMTAwLFxuICAjIHJlbGF0aXZlIHRvIHRoZSB0b3AgbGVmdCBvZiB0aGUgaW1hZ2UgKGlmIHRoZXJlIGlzIGFuIGltYWdlKS5cbiAgI1xuICBwb3NpdGlvbjogPT5cbiAgICB4UHggPSBAbWFya2VyLnBvc2l0aW9uKCkubGVmdCArIChAbWFya2VyLm91dGVyV2lkdGgoKSAvIDIpXG4gICAgeVB4ID0gQG1hcmtlci5wb3NpdGlvbigpLnRvcCArIChAbWFya2VyLm91dGVySGVpZ2h0KCkgLyAyKVxuICAgIGlmIEBpbWFnZVxuICAgICAgd0ltZyA9IEBpbWFnZS53aWR0aCgpXG4gICAgICBoSW1nID0gQGltYWdlLmhlaWdodCgpXG4gICAgICB4SW1nID0gcGFyc2VJbnQoQGltYWdlLmNzcygnbGVmdCcpKVxuICAgICAgeUltZyA9IHBhcnNlSW50KEBpbWFnZS5jc3MoJ3RvcCcpKVxuICAgICAgeFBjID0gKCh4UHggKyBNYXRoLmFicyh4SW1nKSkgLyB3SW1nKSAqIDEwMFxuICAgICAgeVBjID0gKCh5UHggKyBNYXRoLmFicyh5SW1nKSkgLyBoSW1nKSAqIDEwMFxuICAgIGVsc2VcbiAgICAgIHhQYyA9ICh4UHggLyBAY29udGFpbmVyLndpZHRoKCkpICogMTAwXG4gICAgICB5UGMgPSAoeVB4IC8gQGNvbnRhaW5lci5oZWlnaHQoKSkgKiAxMDBcbiAgICBbeFBjLCB5UGNdXG5cbiAgIyBHZXQgdGhlIHBvc2l0aW9uIG9mIHRoZSBtYXJrZXIgYXMgYSBwZXJjZW50YWdlIG9mIDEwMCxcbiAgIyByZWxhdGl2ZSB0byB0aGUgdG9wIGxlZnQgb2YgdGhlIGNvbnRhaW5lci5cbiAgI1xuICByZWxhdGl2ZVBvc2l0aW9uOiA9PlxuICAgIHhQeCA9IEBtYXJrZXIucG9zaXRpb24oKS5sZWZ0ICsgKEBtYXJrZXIub3V0ZXJXaWR0aCgpIC8gMilcbiAgICB5UHggPSBAbWFya2VyLnBvc2l0aW9uKCkudG9wICsgKEBtYXJrZXIub3V0ZXJIZWlnaHQoKSAvIDIpXG4gICAgeFBjID0gKHhQeCAvIEBjb250YWluZXIud2lkdGgoKSkgKiAxMDBcbiAgICB5UGMgPSAoeVB4IC8gQGNvbnRhaW5lci5oZWlnaHQoKSkgKiAxMDBcbiAgICBbeFBjLCB5UGNdXG5cbiAgIyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PSBBdHRyaWJ1dGVzXG5cbiAgIyBUaGUgYmFja2dyb3VuZCBjb2xvciBvZiB0aGUgbWFya2VyXG4gICNcbiAgY29sb3I6ID0+XG4gICAgQG1hcmtlci5jc3MoJ2JhY2tncm91bmRDb2xvcicpXG5cbiAgIyBSYW5kb21seS1nZW5lcmF0ZWQgSUQgZ2l2ZW4gYnkgcGxhbml0IHdoZW4gdGhlIG1hcmtlciBpc1xuICAjIGFkZGVkIHRvIHRoZSBwbGFuLlxuICAjXG4gIHBsYW5pdElEOiA9PlxuICAgIEBtYXJrZXIuYXR0cignZGF0YS1tYXJrZXInKVxuXG4gICMgVGhlIElEIG9mIHRoZSBtYXJrZXIsIHdoaWNoIHdvdWxkIGhhdmUgYmVlbiBhIG1hbnVhbFxuICAjIG9wdGlvblxuICAjXG4gIGlkOiA9PlxuICAgIEBtYXJrZXIuYXR0cignZGF0YS1pZCcpXG5cbiAgIyBXaGV0aGVyIG9yIG5vdCB0aGUgbWFya2VyIGlzIGFsbG93ZWQgdG8gYmUgZHJhZ2dlZFxuICAjXG4gIGlzRHJhZ2dhYmxlOiA9PlxuICAgIEBtYXJrZXIuaGFzQ2xhc3MoJ2RyYWdnYWJsZScpXG5cbiAgIyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PSBJbmZvYm94XG5cbiAgIyBUaGUgalF1ZXJ5IG9iamVjdCB0aGF0IGlzIHRoZSBtYXJrZXJzIGluZm9ib3ggKGlmIHRoZVxuICAjIG1hcmtlciBoYXMgYW4gaW5mb2JveClcbiAgI1xuICBpbmZvYm94OiA9PlxuICAgIGluZm9ib3ggPSBAY29udGFpbmVyLmZpbmQoXCIjI3tAbWFya2VyLmF0dHIoJ2RhdGEtaW5mb2JveCcpfVwiKVxuICAgIGlmIGluZm9ib3gubGVuZ3RoID4gMCB0aGVuIGluZm9ib3ggZWxzZSBudWxsXG5cbiAgIyBUaGUgbWFya3VwIHdpdGhpbiB0aGUgaW5mb2JveCwgaWYgdGhlIG1hcmtlciBoYXMgYW5cbiAgIyBpbmZvYm94XG4gICNcbiAgaW5mb2JveEhUTUw6ID0+XG4gICAgaWYgQGluZm9ib3goKSAmJiBAaW5mb2JveCgpLmxlbmd0aCA+IDAgdGhlbiBAaW5mb2JveCgpLmh0bWwoKSBlbHNlIG51bGxcblxuICAjIFdoZXRoZXIgdGhlIGluZm9ib3ggaXMgYmVpbmcgZGlzcGxheWVkLlxuICAjXG4gIGluZm9ib3hWaXNpYmxlOiA9PlxuICAgIEBpbmZvYm94KCkgJiYgQGluZm9ib3goKS5oYXNDbGFzcygnYWN0aXZlJylcblxuICAjIEhpZGVzIHRoZSBpbmZvYm94IGlmIGl0IGlzIHZpc2libGUuXG4gICNcbiAgaGlkZUluZm9ib3g6ID0+XG4gICAgaWYgQGluZm9ib3hWaXNpYmxlKClcbiAgICAgIEBpbmZvYm94KCkuYWRkQ2xhc3MoJ2hpZGRlbicpXG4gICAgICB0cnVlXG4gICAgZWxzZVxuICAgICAgZmFsc2VcblxuICAjIFNob3dzIHRoZSBpbmZvYm94IGlmIGl0IGlzIGhpZGRlbi5cbiAgI1xuICBzaG93SW5mb2JveDogPT5cbiAgICBpZiBAaW5mb2JveCgpICYmICFAaW5mb2JveFZpc2libGUoKVxuICAgICAgQGluZm9ib3goKS5hZGRDbGFzcygnYWN0aXZlJylcbiAgICAgIEB1bmhpZGVJbmZvYm94KClcbiAgICAgIHRydWVcbiAgICBlbHNlXG4gICAgICBmYWxzZVxuXG4gICMgU2ltaWxhciB0byBzaG93SW5mb2JveCwgYnV0IGxlc3MgYWdyZXNzaXZlLiBJdCB0YWtlc1xuICAjIGF3YXkgaXRzIGhpZGRlbiBjbGFzcywgaW5zdGVhZCBvZiBhZGRpbmcgYW4gYWN0aXZlXG4gICMgY2xhc3MuXG4gICNcbiAgdW5oaWRlSW5mb2JveDogPT5cbiAgICBpZiBAaW5mb2JveFZpc2libGUoKVxuICAgICAgQGluZm9ib3goKS5yZW1vdmVDbGFzcygnaGlkZGVuJylcbiAgICAgIHRydWVcbiAgICBlbHNlXG4gICAgICBmYWxzZVxuXG4gICMgRmluZCB0aGUgYXBwcm9wcmlhdGUgY29vcmRpbmF0ZXMgYXQgd2hpY2ggdG8gZGlzcGxheSB0aGVcbiAgIyBpbmZvYm94LCBiYXNlZCBvbiBvcHRpb25zLlxuICAjXG4gIGluZm9ib3hDb29yZHM6ID0+XG4gICAgaW5mb2JveCA9IEBjb250YWluZXIuZmluZChcIiMje0BtYXJrZXIuYXR0cignZGF0YS1pbmZvYm94Jyl9XCIpXG4gICAgbWFya2VyQ2VudGVyWCA9IChwYXJzZUZsb2F0KEByZWxhdGl2ZVBvc2l0aW9uKClbMF0gLyAxMDApICogQGNvbnRhaW5lci53aWR0aCgpKVxuICAgIG1hcmtlckNlbnRlclkgPSAocGFyc2VGbG9hdChAcmVsYXRpdmVQb3NpdGlvbigpWzFdIC8gMTAwKSAqIEBjb250YWluZXIuaGVpZ2h0KCkpXG4gICAgaVdpZHRoID0gaW5mb2JveC5vdXRlcldpZHRoKClcbiAgICBpSGFsZldpZHRoID0gaVdpZHRoIC8gMlxuICAgIGlIZWlnaHQgPSBpbmZvYm94Lm91dGVySGVpZ2h0KClcbiAgICBpSGFsZkhlaWdodCA9IGlIZWlnaHQgLyAyXG4gICAgY1dpZHRoID0gQGNvbnRhaW5lci53aWR0aCgpXG4gICAgY0hlaWdodCA9IEBjb250YWluZXIuaGVpZ2h0KClcbiAgICBtV2lkdGggPSBAbWFya2VyLm91dGVyV2lkdGgoKVxuICAgIG1IYWxmV2lkdGggPSBtV2lkdGggLyAyXG4gICAgbUhlaWdodCA9IEBtYXJrZXIub3V0ZXJIZWlnaHQoKVxuICAgIG1IYWxmSGVpZ2h0ID0gbUhlaWdodCAvIDJcbiAgICBidWZmZXIgPSA1XG4gICAgb2Zmc2V0WCA9IHBhcnNlSW50KGluZm9ib3guYXR0cignZGF0YS1vZmZzZXQteCcpKVxuICAgIG9mZnNldFggPSAwIHVubGVzcyBvZmZzZXRYXG4gICAgb2Zmc2V0WSA9IHBhcnNlSW50KGluZm9ib3guYXR0cignZGF0YS1vZmZzZXQteScpKVxuICAgIG9mZnNldFkgPSAwIHVubGVzcyBvZmZzZXRZXG4gICAgc3dpdGNoIGluZm9ib3guYXR0cignZGF0YS1wb3NpdGlvbicpXG4gICAgICB3aGVuICd0b3AnXG4gICAgICAgIGluZm9MZWZ0ID0gbWFya2VyQ2VudGVyWCAtIGlIYWxmV2lkdGhcbiAgICAgICAgaW5mb1RvcCA9IG1hcmtlckNlbnRlclkgLSBpSGVpZ2h0IC0gbUhhbGZIZWlnaHQgLSBidWZmZXJcbiAgICAgIHdoZW4gJ3JpZ2h0J1xuICAgICAgICBpbmZvTGVmdCA9IG1hcmtlckNlbnRlclggKyBtSGFsZldpZHRoICsgYnVmZmVyXG4gICAgICAgIGluZm9Ub3AgPSBtYXJrZXJDZW50ZXJZIC0gaUhhbGZIZWlnaHRcbiAgICAgIHdoZW4gJ2JvdHRvbSdcbiAgICAgICAgaW5mb0xlZnQgPSBtYXJrZXJDZW50ZXJYIC0gaUhhbGZXaWR0aFxuICAgICAgICBpbmZvVG9wID0gbWFya2VyQ2VudGVyWSArIG1IYWxmSGVpZ2h0ICsgYnVmZmVyXG4gICAgICB3aGVuICdsZWZ0J1xuICAgICAgICBpbmZvTGVmdCA9IG1hcmtlckNlbnRlclggLSBpV2lkdGggLSBtSGFsZldpZHRoIC0gYnVmZmVyXG4gICAgICAgIGluZm9Ub3AgPSBtYXJrZXJDZW50ZXJZIC0gaUhhbGZIZWlnaHRcbiAgICAgIHdoZW4gJ3RvcC1sZWZ0J1xuICAgICAgICBpbmZvTGVmdCA9IG1hcmtlckNlbnRlclggLSBpV2lkdGggLSBtSGFsZldpZHRoICsgYnVmZmVyXG4gICAgICAgIGluZm9Ub3AgPSBtYXJrZXJDZW50ZXJZIC0gaUhlaWdodCAtIG1IYWxmSGVpZ2h0ICsgYnVmZmVyXG4gICAgICB3aGVuICd0b3AtcmlnaHQnXG4gICAgICAgIGluZm9MZWZ0ID0gbWFya2VyQ2VudGVyWCArIG1IYWxmV2lkdGggLSBidWZmZXJcbiAgICAgICAgaW5mb1RvcCA9IG1hcmtlckNlbnRlclkgLSBpSGVpZ2h0IC0gbUhhbGZIZWlnaHQgKyBidWZmZXJcbiAgICAgIHdoZW4gJ2JvdHRvbS1sZWZ0J1xuICAgICAgICBpbmZvTGVmdCA9IG1hcmtlckNlbnRlclggLSBpV2lkdGggLSBtSGFsZldpZHRoICsgYnVmZmVyXG4gICAgICAgIGluZm9Ub3AgPSBtYXJrZXJDZW50ZXJZICsgbUhhbGZIZWlnaHQgLSBidWZmZXJcbiAgICAgIHdoZW4gJ2JvdHRvbS1yaWdodCdcbiAgICAgICAgaW5mb0xlZnQgPSBtYXJrZXJDZW50ZXJYICsgbUhhbGZXaWR0aCAtIGJ1ZmZlclxuICAgICAgICBpbmZvVG9wID0gbWFya2VyQ2VudGVyWSArIG1IYWxmSGVpZ2h0IC0gYnVmZmVyXG4gICAgbGVmdDogaW5mb0xlZnQgKyBvZmZzZXRYXG4gICAgdG9wOiBpbmZvVG9wICsgb2Zmc2V0WVxuXG4gICMgUGxhY2VzIHRoZSBpbmZvYm94IGluIHRoZSBjb3JyZWN0IHBvc2l0aW9uLlxuICAjXG4gIHBvc2l0aW9uSW5mb2JveDogPT5cbiAgICBjb29yZHMgPSBAaW5mb2JveENvb3JkcygpXG4gICAgQGNvbnRhaW5lci5maW5kKFwiIyN7QG1hcmtlci5hdHRyKCdkYXRhLWluZm9ib3gnKX1cIikuY3NzXG4gICAgICBsZWZ0OiBcIiN7Y29vcmRzLmxlZnR9cHhcIlxuICAgICAgdG9wOiBcIiN7Y29vcmRzLnRvcH1weFwiXG4gICAgQHBvc2l0aW9uKClcblxuICAjIEFuaW1hdGVzIHRoZSBpbmZvYm94IGZyb20gaXRzIGN1cnJlbnQgcG9zaXRpb24gdG8gaXRzXG4gICMgbmV3IHBvc2l0aW9uLlxuICAjXG4gIGFuaW1hdGVJbmZvYm94OiA9PlxuICAgIGNvb3JkcyA9IEBpbmZvYm94Q29vcmRzKClcbiAgICBAY29udGFpbmVyLmZpbmQoXCIjI3tAbWFya2VyLmF0dHIoJ2RhdGEtaW5mb2JveCcpfVwiKS5hbmltYXRlXG4gICAgICBsZWZ0OiBcIiN7Y29vcmRzLmxlZnR9cHhcIlxuICAgICAgdG9wOiBcIiN7Y29vcmRzLnRvcH1weFwiXG4gICAgLCAyNTAsICgpID0+XG4gICAgICByZXR1cm4gQHBvc2l0aW9uKClcblxuICAjID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09IEFjdGlvbnNcblxuICAjIHBvc2l0aW9ucyB0aGUgbWFya2VyIGFuZCBpbmZvYm94IGJhc2VkIG9uIGl0cyBkYXRhXG4gICMgYXR0cmlidXRlc1xuICAjXG4gIHNldDogPT5cbiAgICBpZiBAaW1hZ2VcbiAgICAgIGxlZnQgPSAoQGltYWdlLndpZHRoKCkgKiAoQG1hcmtlci5hdHRyKCdkYXRhLXhQYycpIC8gMTAwKSkgK1xuICAgICAgICBwYXJzZUZsb2F0KEBpbWFnZS5jc3MoJ2xlZnQnKSkgLSAoQG1hcmtlci5vdXRlcldpZHRoKCkgLyAyKVxuICAgICAgdG9wID0gKEBpbWFnZS5oZWlnaHQoKSAqIChAbWFya2VyLmF0dHIoJ2RhdGEteVBjJykgLyAxMDApKSArXG4gICAgICAgIHBhcnNlRmxvYXQoQGltYWdlLmNzcygndG9wJykpIC0gKEBtYXJrZXIub3V0ZXJIZWlnaHQoKSAvIDIpXG4gICAgZWxzZVxuICAgICAgbGVmdCA9IChAY29udGFpbmVyLndpZHRoKCkgKiAoQG1hcmtlci5hdHRyKCdkYXRhLXhQYycpIC8gMTAwKSkgLVxuICAgICAgICAoQG1hcmtlci5vdXRlcldpZHRoKCkgLyAyKVxuICAgICAgdG9wID0gKEBjb250YWluZXIuaGVpZ2h0KCkgKiAoQG1hcmtlci5hdHRyKCdkYXRhLXlQYycpIC8gMTAwKSkgLSBcbiAgICAgICAgKEBtYXJrZXIub3V0ZXJIZWlnaHQoKSAvIDIpXG4gICAgQG1hcmtlci5jc3NcbiAgICAgIGxlZnQ6IFwiI3tsZWZ0fXB4XCJcbiAgICAgIHRvcDogXCIje3RvcH1weFwiXG4gICAgQHBvc2l0aW9uSW5mb2JveCgpXG4gICAgW2xlZnQsIHRvcF1cblxuICAjIFVwZGF0ZXMgdGhlIG1hcmtlcidzIGRhdGEgYXR0cmlidXRlcyB3aXRoIGl0cyBuZXdcbiAgIyBwb3NpdGlvbi5cbiAgI1xuICBzYXZlUG9zaXRpb246ID0+XG4gICAgY29vcmRzID0gQHBvc2l0aW9uKClcbiAgICBAbWFya2VyLmF0dHJcbiAgICAgICdkYXRhLXhQYyc6IGNvb3Jkc1swXVxuICAgICAgJ2RhdGEteVBjJzogY29vcmRzWzFdXG4gICAgY29vcmRzXG5cbiAgIyBBbGxvd3MgeW91IHRvIGNoYW5nZSB0aGUgYXR0cmlidXRlcyBvZiB0aGUgbWFya2VyIG9uIHRoZVxuICAjIGZseS5cbiAgI1xuICB1cGRhdGU6IChvcHRpb25zKSA9PlxuICAgIGlmIG9wdGlvbnMuY29sb3JcbiAgICAgIEBtYXJrZXIuY3NzKGJhY2tncm91bmRDb2xvcjogb3B0aW9ucy5jb2xvcilcbiAgICBpZiBvcHRpb25zLmluZm9ib3hcbiAgICAgIEBtYXJrZXIuZmluZChcIi4je1BsYW5pdC5pbmZvYm94Q2xhc3N9XCIpLmh0bWwob3B0aW9ucy5pbmZvYm94KVxuICAgICAgQHBvc2l0aW9uSW5mb2JveCgpXG4gICAgaWYgb3B0aW9ucy5kcmFnZ2FibGVcbiAgICAgIEBtYXJrZXIucmVtb3ZlQ2xhc3MoJ2RyYWdnYWJsZScpXG4gICAgICBAbWFya2VyLmFkZENsYXNzKCdkcmFnZ2FibGUnKSBpZiBvcHRpb25zLmRyYWdnYWJsZSA9PSB0cnVlXG4gICAgaWYgb3B0aW9ucy5jb29yZHNcbiAgICAgIGxlZnQgPSAoKHBhcnNlRmxvYXQob3B0aW9ucy5jb29yZHNbMF0pIC8gMTAwKSAqIEBjb250YWluZXIud2lkdGgoKSkgLSAxNVxuICAgICAgdG9wID0gKChwYXJzZUZsb2F0KG9wdGlvbnMuY29vcmRzWzFdKSAvIDEwMCkgKiBAY29udGFpbmVyLmhlaWdodCgpKSAtIDE1XG4gICAgICBAbWFya2VyLmNzc1xuICAgICAgICBsZWZ0OiBcIiN7bGVmdH1weFwiXG4gICAgICAgIHRvcDogXCIje3RvcH1weFwiXG4gICAgdHJ1ZVxuXG4gICMgUmVtb3ZlcyB0aGUgbWFya2VyIGZyb20gdGhlIHBsYW4uXG4gICNcbiAgcmVtb3ZlOiA9PlxuICAgIEBpbmZvYm94KCkucmVtb3ZlKCkgaWYgQGluZm9ib3goKVxuICAgIEBtYXJrZXIucmVtb3ZlKClcbiAgICB0cnVlXG5cbiMgYXR0YWNoZXMgdGhlIFBsYW5pdCBjbGFzcyB0byBhIGdsb2JhbCBwbGFuaXQgdmFyaWFibGVcbndpbmRvdy5wbGFuaXQgPSBuZXcgUGxhbml0XG4iXX0=