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
    this.allMarkers = bind(this.allMarkers, this);
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

  Plan.prototype.allMarkers = function() {
    var j, len, marker, markers, ref;
    markers = [];
    ref = this.container.find("." + Planit.markerClass);
    for (j = 0, len = ref.length; j < len; j++) {
      marker = ref[j];
      markers.push(new Planit.Marker(this.container, $(marker).attr('data-marker')));
    }
    return markers;
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

//# sourceMappingURL=data:application/json;base64,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VUFBQSxDQUFXLE9BQU8sQ0FBQyxNQUFPLENBQUEsQ0FBQSxDQUExQixDQUFBLEdBQWdDLEdBQWpDLENBQUEsR0FBd0MsSUFBQyxDQUFBLFNBQVMsQ0FBQyxLQUFYLENBQUEsQ0FBekMsQ0FBQSxHQUErRCxFQUF0RSxDQUFBO0FBQUEsTUFDQSxHQUFBLEdBQU0sQ0FBQyxDQUFDLFVBQUEsQ0FBVyxPQUFPLENBQUMsTUFBTyxDQUFBLENBQUEsQ0FBMUIsQ0FBQSxHQUFnQyxHQUFqQyxDQUFBLEdBQXdDLElBQUMsQ0FBQSxTQUFTLENBQUMsTUFBWCxDQUFBLENBQXpDLENBQUEsR0FBZ0UsRUFEdEUsQ0FBQTtBQUFBLE1BRUEsSUFBQyxDQUFBLE1BQU0sQ0FBQyxHQUFSLENBQ0U7QUFBQSxRQUFBLElBQUEsRUFBUyxJQUFELEdBQU0sSUFBZDtBQUFBLFFBQ0EsR0FBQSxFQUFRLEdBQUQsR0FBSyxJQURaO09BREYsQ0FGQSxDQURGO0tBUkE7V0FjQSxLQWZNO0VBQUEsQ0E3U1IsQ0FBQTs7QUFBQSxtQkFnVUEsTUFBQSxHQUFRLFNBQUEsR0FBQTtBQUNOLElBQUEsSUFBdUIsSUFBQyxDQUFBLE9BQUQsQ0FBQSxDQUF2QjtBQUFBLE1BQUEsSUFBQyxDQUFBLE9BQUQsQ0FBQSxDQUFVLENBQUMsTUFBWCxDQUFBLENBQUEsQ0FBQTtLQUFBO0FBQUEsSUFDQSxJQUFDLENBQUEsTUFBTSxDQUFDLE1BQVIsQ0FBQSxDQURBLENBQUE7V0FFQSxLQUhNO0VBQUEsQ0FoVVIsQ0FBQTs7Z0JBQUE7O0lBbm1CRixDQUFBOztBQUFBLE1BeTZCTSxDQUFDLE1BQVAsR0FBZ0IsR0FBQSxDQUFBLE1BejZCaEIsQ0FBQSIsImZpbGUiOiJwbGFuaXQtdG1wLmpzIiwic291cmNlUm9vdCI6Ii9zb3VyY2UvIiwic291cmNlc0NvbnRlbnQiOlsiY2xhc3MgUGxhbml0XG5cbiAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gRE9NIFJlZmVyZW5jZXNcblxuICBAY29udGFpbmVyQ2xhc3M6ICAgICAgICAncGxhbml0LWNvbnRhaW5lcidcbiAgQGRyYWdnaW5nQ2xhc3M6ICAgICAgICAgJ2lzLWRyYWdnaW5nJ1xuICBAaW1hZ2VDb250YWluZXI6ICAgICAgICAncGxhbml0LWltYWdlLWNvbnRhaW5lcidcbiAgQGluZm9ib3hDbGFzczogICAgICAgICAgJ3BsYW5pdC1pbmZvYm94J1xuICBAaW5mb2JveENvbnRhaW5lckNsYXNzOiAncGxhbml0LWluZm9ib3gtY29udGFpbmVyJ1xuICBAbWFya2VyQ2xhc3M6ICAgICAgICAgICAncGxhbml0LW1hcmtlcidcbiAgQG1hcmtlckNvbnRhaW5lckNsYXNzOiAgJ3BsYW5pdC1tYXJrZXJzLWNvbnRhaW5lcidcbiAgQG1hcmtlckNvbnRlbnRDbGFzczogICAgJ3BsYW5pdC1tYXJrZXItY29udGVudCdcblxuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBJbnN0YW50aWF0aW9uXG5cbiAgbmV3OiAoQG9wdGlvbnMgPSB7fSkgLT5cbiAgICByZXR1cm4gbmV3IFBsYW5pdC5QbGFuKEBvcHRpb25zKVxuXG4gICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIEdsb2JhbCBIZWxwZXJzXG5cbiAgQHJhbmRvbVN0cmluZzogKGxlbmd0aCA9IDE2KSAtPlxuICAgIHN0ciA9IE1hdGgucmFuZG9tKCkudG9TdHJpbmcoMzYpLnNsaWNlKDIpXG4gICAgc3RyID0gc3RyICsgTWF0aC5yYW5kb20oKS50b1N0cmluZygzNikuc2xpY2UoMilcbiAgICBzdHIuc3Vic3RyaW5nKDAsIGxlbmd0aCAtIDEpXG5cbmNsYXNzIFBsYW5pdC5QbGFuXG5cbiAgIyBUaGlzIGNhbGxzIG1ldGhvZHMgdG8gaW5zdGFudGlhdGUgYSBuZXcgcGxhbi4gRm91bmQgaW5cbiAgIyBwbGFuL2luaXQuY29mZmVlXG4gICNcbiAgY29uc3RydWN0b3I6IChAb3B0aW9ucyA9IHt9KSAtPlxuICAgIG1ldGhvZC5jYWxsKEApIGZvciBtZXRob2QgaW4gaW5pdE1ldGhvZHMoKVxuXG4gICMgKHByaXZhdGUpIE1ldGhvZHMgKGluIG9yZGVyKSBuZWVkZWQgdG8gaW5zdGFudGlhdGUgdGhpc1xuICAjIG9iamVjdFxuICAjXG4gIGluaXRNZXRob2RzID0gLT5cbiAgICBbaW5pdE9wdGlvbnMsIGluaXRDb250YWluZXIsIGluaXRJbWFnZSwgaW5pdENhbnZhc01hcmtlcnMsIGluaXRFdmVudHNdXG5cblxuICAjID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09IE9wdGlvbnNcblxuICAjIChwcml2YXRlKSBBZGQgZGVmYXVsdCBvcHRpb25zIGlmIHRoZSBuZWNlc3Nhcnkgb3B0aW9uc1xuICAjIGFyZSBtaXNzaW5nXG4gICNcbiAgaW5pdE9wdGlvbnMgPSAtPlxuICAgIGlmIEBvcHRpb25zLmNvbnRhaW5lclxuICAgICAgQG9wdGlvbnMuY29udGFpbmVyID0gJChcIiMje0BvcHRpb25zLmNvbnRhaW5lcn1cIilcbiAgICBlbHNlXG4gICAgICBAb3B0aW9ucy5jb250YWluZXIgPSAkKCcjcGxhbml0JylcbiAgICAjIGRpcmVjdCBhY2Nlc3MgdG8gcGxhbml0IGNvbnRhaW5lclxuICAgIEBjb250YWluZXIgPSBAb3B0aW9ucy5jb250YWluZXJcblxuICAjID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09IENvbnRhaW5lclxuXG4gICMgKHByaXZhdGUpIERyYXcgdGhlIGNvbnRhaW5lciBhbmQgdGhlIHN1YmNvbnRhaW5lcnNcbiAgI1xuICBpbml0Q29udGFpbmVyID0gLT5cbiAgICBAY29udGFpbmVyLmFkZENsYXNzKFBsYW5pdC5jb250YWluZXJDbGFzcylcbiAgICBAY29udGFpbmVyLmFwcGVuZCBcIlwiXCJcbiAgICAgIDxkaXYgY2xhc3M9XCIje1BsYW5pdC5pbmZvYm94Q29udGFpbmVyQ2xhc3N9XCI+PC9kaXY+XG4gICAgICA8ZGl2IGNsYXNzPVwiI3tQbGFuaXQubWFya2VyQ29udGFpbmVyQ2xhc3N9XCI+PC9kaXY+XG4gICAgICAgIFwiXCJcIlxuICAgIEBtYXJrZXJzQ29udGFpbmVyID0gQGNvbnRhaW5lci5maW5kKFwiLiN7UGxhbml0Lm1hcmtlckNvbnRhaW5lckNsYXNzfVwiKVxuICAgICAgLmZpcnN0KCkgIyBkaXJlY3QgYWNjZXNzIHRvIG1hcmtlcnMgY29udGFpbmVyXG5cbiAgIyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PSBCYWNrZ3JvdW5kIEltYWdlXG5cbiAgIyAocHJpdmF0ZSkgQ3JlYXRlIGltYWdlIGNvbnRhaW5lciBhbmQgYWRkIGltYWdlIGlmXG4gICMgbmVjZXNzYXJ5XG4gICNcbiAgaW5pdEltYWdlID0gLT5cbiAgICBpZiBAb3B0aW9ucy5pbWFnZSAmJiBAb3B0aW9ucy5pbWFnZS51cmxcbiAgICAgIEBjb250YWluZXIucHJlcGVuZCBcIlwiXCJcbiAgICAgICAgPGRpdiBjbGFzcz1cIiN7UGxhbml0LmltYWdlQ29udGFpbmVyfVwiPlxuICAgICAgICAgIDxpbWcgc3JjPVwiI3tAb3B0aW9ucy5pbWFnZS51cmx9XCI+XG4gICAgICAgIDwvZGl2PlxuICAgICAgXCJcIlwiXG4gICAgICBAaW1hZ2UgPSBAY29udGFpbmVyLmZpbmQoJ2ltZycpLmZpcnN0KClcbiAgICAgIEBpbWFnZS5sb2FkICgpID0+XG4gICAgICAgIEBjb250YWluZXIuY3NzKGhlaWdodDogQGltYWdlLmhlaWdodCgpKVxuICAgICAgICBpbml0Wm9vbWFibGUuY2FsbChAKVxuICAgICAgICBpbml0TWFya2Vycy5jYWxsKEApXG5cbiAgIyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PSBab29taW5nXG5cbiAgIyAocHJpdmF0ZSkgU2V0cyBvdXIgcmVmZXJlbmNlcyBmb3Igd29ya2luZyB3aXRoIHpvb20sIGFuZFxuICAjIGNvbnRyb2xzIHdoZXRoZXIgb3Igbm90IHRvIGFkZCBjb250cm9sc1xuICAjXG4gIGluaXRab29tYWJsZSA9IC0+XG4gICAgIyBhZGQgem9vbSBJRCB0byBtYXJrZXJzIGNvbnRhaW5lclxuICAgIEB6b29tSWQgPSBQbGFuaXQucmFuZG9tU3RyaW5nKClcbiAgICBAbWFya2Vyc0NvbnRhaW5lci5hdHRyKCdkYXRhLXpvb20taWQnLCBAem9vbUlkKVxuICAgICMgc2V0IGluaXRpYWwgYmFja2dyb3VuZCBjb29yZGluYXRlc1xuICAgIEByZXNldEltYWdlKClcbiAgICAjIGFkZCB6b29tIGNvbnRyb2xzIGlmIG5lY2Vzc2FyeVxuICAgIGluaXRab29tQ29udHJvbHMuY2FsbChAKSBpZiBAb3B0aW9ucy5pbWFnZS56b29tXG5cbiAgIyAocHJpdmF0ZSkgUmVuZGVyIHRoZSB6b29tIGNvbnRyb2xzIGFuZCBiaW5kcyBuZWNlc3NhcnlcbiAgIyBldmVudHNcbiAgI1xuICBpbml0Wm9vbUNvbnRyb2xzID0gLT5cbiAgICAjIGRyYXcgdGhlIGNvbnRyb2xzIGRpbmt1c1xuICAgIEBjb250YWluZXIucHJlcGVuZCBcIlwiXCJcbiAgICAgIDxkaXYgY2xhc3M9XCJwbGFuaXQtY29udHJvbHNcIj5cbiAgICAgICAgPGEgaHJlZj1cIiNcIiBjbGFzcz1cInpvb21cIiBkYXRhLWFjdGlvbj1cImluXCI+KzwvYT5cbiAgICAgICAgPGEgaHJlZj1cIiNcIiBjbGFzcz1cInpvb21cIiBkYXRhLWFjdGlvbj1cIm91dFwiPi08L2E+XG4gICAgICA8L2Rpdj5cbiAgICBcIlwiXCJcbiAgICBAY29udGFpbmVyLmZpbmQoXCIuem9vbVtkYXRhLWFjdGlvbj0naW4nXVwiKS5jbGljayAoZSkgPT5cbiAgICAgIGUucHJldmVudERlZmF1bHQoKVxuICAgICAgQHpvb21JbigpXG4gICAgQGNvbnRhaW5lci5maW5kKFwiLnpvb21bZGF0YS1hY3Rpb249J291dCddXCIpLmNsaWNrIChlKSA9PlxuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICBAem9vbU91dCgpXG4gICAgIyBiaW5kIGRyYWdnYWJsZSBldmVudHNcbiAgICBAY29udGFpbmVyLm9uICAgJ2RibGNsaWNrJywgKGUpID0+XG4gICAgICB6RGJsQ2xpY2suY2FsbChALCBlKVxuICAgIEBjb250YWluZXIub24gICAnbW91c2Vkb3duJywgKGUpID0+XG4gICAgICB6TW91c2VEb3duLmNhbGwoQCwgZSlcbiAgICAkKGRvY3VtZW50KS5vbiAgJ21vdXNlbW92ZScsIChlKSA9PlxuICAgICAgek1vdXNlTW92ZS5jYWxsKEAsIGUpXG4gICAgJChkb2N1bWVudCkub24gICdtb3VzZXVwJywgKGUpID0+XG4gICAgICB6TW91c2VVcC5jYWxsKEAsIGUpXG5cbiAgIyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PSBNYXJrZXJzXG5cbiAgIyAocHJpdmF0ZSkgV2lsbCBjYWxsIGluaXRNYXJrZXJzIGlmIHRoZXJlIGlzIG5vIGltYWdlLFxuICAjIG90aGVyd2lzZSBpdCdzIGNhbGxlZCBmcm9tIGluaXRJbWFnZSwgd2hpY2ggd2FpdHMgZm9yXG4gICMgdGhlIGltYWdlIHRvIGJlIGxvYWRlZC5cbiAgI1xuICBpbml0Q2FudmFzTWFya2VycyA9IC0+XG4gICAgaW5pdE1hcmtlcnMuY2FsbChAKSB1bmxlc3MgQG9wdGlvbnMuaW1hZ2UgJiYgQG9wdGlvbnMuaW1hZ2UudXJsXG5cbiAgIyBJbnRlcnZhbCBtZXRob2QgdGhhdCBjb250aW51ZXMgdG8gY2hlY2sgZm9yIGltYWdlIGJlaW5nXG4gICMgbG9hZGVkIGJlZm9yZSBhZGRpbmcgbWFya2VycyB0byB0aGUgcGxhblxuICAjXG4gIGluaXRNYXJrZXJzID0gLT5cbiAgICBpZiBAb3B0aW9ucy5tYXJrZXJzICYmIEBvcHRpb25zLm1hcmtlcnMubGVuZ3RoID4gMFxuICAgICAgZm9yIG1hcmtlciBpbiBAb3B0aW9ucy5tYXJrZXJzXG4gICAgICAgIG1hcmtlci5jb250YWluZXIgPSBAY29udGFpbmVyXG4gICAgICAgIFBsYW5pdC5NYXJrZXIuY3JlYXRlKG1hcmtlcilcblxuICAjID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09IFBsYW4gRXZlbnRzXG5cbiAgIyAocHJpdmF0ZSkgQmluZCBldmVudHMgdG8gdGhlIHBsYW4uIFRoZXNlIGV2ZW50cyBkZWFsXG4gICMgbW9zdGx5IHdpdGggbWFya2Vycywgc2luY2Ugc29tZSBldmVudCBzaG91bGQgYmUgYXR0YWNoZWRcbiAgIyB0byB0aGUgcGxhbiBhbmQgbGF0ZXIgZmluZCB0aGUgYXBwcm9wcmlhdGUgbWFya2VyXG4gICNcbiAgaW5pdEV2ZW50cyA9IC0+XG4gICAgaWYgQGNvbnRhaW5lci5maW5kKFwiLiN7UGxhbml0LmltYWdlQ29udGFpbmVyfSA+IGltZ1wiKS5sZW5ndGggPiAwXG4gICAgICBAaW1hZ2UgPSBAY29udGFpbmVyLmZpbmQoXCIuI3tQbGFuaXQuaW1hZ2VDb250YWluZXJ9ID4gaW1nXCIpLmZpcnN0KClcbiAgICAkKGRvY3VtZW50KS5vbiAnbW91c2Vtb3ZlJywgKGUpID0+XG4gICAgICBtb3VzZW1vdmUuY2FsbChALCBlKVxuICAgICQoZG9jdW1lbnQpLm9uICdtb3VzZXVwJywgKGUpID0+XG4gICAgICBtb3VzZXVwLmNhbGwoQCwgZSlcbiAgICAkKHdpbmRvdykucmVzaXplIChlKSA9PlxuICAgICAgcmVzaXplLmNhbGwoQCwgZSlcblxuXG4gICMgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0gU2V0dGluZyBJbWFnZVxuXG4gICMgWm9vbSB0aGUgaW1hZ2Ugb3V0IGFsbCB0aGUgd2F5IGFuZCBzZXRzIHRoZSBtYXJrZXJzXG4gICMgYXBwcm9wcmlhdGVseVxuICAjXG4gIHJlc2V0SW1hZ2U6ID0+XG4gICAgQGltYWdlUG9zaXRpb24gPVxuICAgICAgbGVmdFB4OiAgICAgICAgIDBcbiAgICAgIHRvcFB4OiAgICAgICAgICAwXG4gICAgICB3aWR0aDogICAgICAgICAgQGltYWdlLndpZHRoKClcbiAgICAgIGhlaWdodDogICAgICAgICBAaW1hZ2UuaGVpZ2h0KClcbiAgICAgIHNjYWxlOiAgICAgICAgICAxXG4gICAgICBpbmNyZW1lbnQ6ICAgICAgMC41XG4gICAgc2V0QmFja2dyb3VuZC5jYWxsKEApXG4gICAgdHJ1ZVxuXG4gICMgKHByaXZhdGUpIE1vdmVzIHRoZSBiYWNrZ3JvdW5kIGFuZCBtYXJrZXJzIHdpdGhvdXRcbiAgIyBhbmltYXRpb24gdG8gdGhlIGxvY2F0aW9uIHNldCBieSB0aGUgaW1hZ2VQb3NpdGlvblxuICAjIHByb3BlcnR5XG4gICNcbiAgc2V0QmFja2dyb3VuZCA9IC0+XG4gICAgQGltYWdlLmNzc1xuICAgICAgbGVmdDogXCIje0BpbWFnZVBvc2l0aW9uLmxlZnRQeH1weFwiXG4gICAgICB0b3A6IFwiI3tAaW1hZ2VQb3NpdGlvbi50b3BQeH1weFwiXG4gICAgICB3aWR0aDogXCIje0BpbWFnZVBvc2l0aW9uLnNjYWxlICogMTAwLjB9JVwiXG4gICAgICBoZWlnaHQ6ICdhdXRvJ1xuICAgIHNldE1hcmtlcnMuY2FsbChAKVxuXG4gICMgKHByaXZhdGUpIEVxdWl2YWxlbnQgdG8gc2V0QmFja2dyb3VuZCwgYnV0IHdpdGhcbiAgIyBhbmltYXRpb25cbiAgI1xuICBhbmltYXRlQmFja2dyb3VuZCA9IC0+XG4gICAgQGltYWdlLmFuaW1hdGVcbiAgICAgIGxlZnQ6IFwiI3tAaW1hZ2VQb3NpdGlvbi5sZWZ0UHh9cHhcIlxuICAgICAgdG9wOiBcIiN7QGltYWdlUG9zaXRpb24udG9wUHh9cHhcIlxuICAgICAgd2lkdGg6IFwiI3tAaW1hZ2VQb3NpdGlvbi5zY2FsZSAqIDEwMC4wfSVcIlxuICAgICAgaGVpZ2h0OiAnYXV0bydcbiAgICAsIDI1MFxuICAgIGFuaW1hdGVNYXJrZXJzLmNhbGwoQClcblxuICAjID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09IFNldHRpbmcgTWFya2Vyc1xuXG4gICMgKHByaXZhdGUpIFNldHMgbWFya2VycyBpbiBjb3JyZWN0IGxvY2F0aW9uLCBiYXNlZCBvblxuICAjIGltYWdlIHBvc2l0aW9uXG4gICNcbiAgc2V0TWFya2VycyA9IC0+XG4gICAgbWFya2VycyA9IEBjb250YWluZXIuZmluZChcIi4je1BsYW5pdC5tYXJrZXJDbGFzc31cIilcbiAgICBpZiBtYXJrZXJzLmxlbmd0aCA+IDBcbiAgICAgIGZvciBtYXJrZXIgaW4gbWFya2Vyc1xuICAgICAgICBsZWZ0ID0gKEBjYWxjKGltZ1dpZHRoKSAqICgkKG1hcmtlcikuYXR0cignZGF0YS14UGMnKSAvIDEwMCkpICtcbiAgICAgICAgICBAaW1hZ2VQb3NpdGlvbi5sZWZ0UHggLSAoJChtYXJrZXIpLm91dGVyV2lkdGgoKSAvIDIpXG4gICAgICAgIHRvcCA9IChAY2FsYyhpbWdIZWlnaHQpICogKCQobWFya2VyKS5hdHRyKCdkYXRhLXlQYycpIC8gMTAwKSkgK1xuICAgICAgICAgIEBpbWFnZVBvc2l0aW9uLnRvcFB4IC0gKCQobWFya2VyKS5vdXRlckhlaWdodCgpIC8gMilcbiAgICAgICAgJChtYXJrZXIpLmNzc1xuICAgICAgICAgIGxlZnQ6IFwiI3tsZWZ0fXB4XCJcbiAgICAgICAgICB0b3A6IFwiI3t0b3B9cHhcIlxuICAgICAgcG9zaXRpb25JbmZvYm94ZXMuY2FsbChAKVxuXG4gICMgKHByaXZhdGUpIEVxdWl2YWxlbnQgdG8gc2V0TWFya2VycywgYnV0IHdpdGggYW5pbWF0aW9uXG4gICNcbiAgYW5pbWF0ZU1hcmtlcnMgPSAtPlxuICAgIG1hcmtlcnMgPSBAY29udGFpbmVyLmZpbmQoXCIuI3tQbGFuaXQubWFya2VyQ2xhc3N9XCIpXG4gICAgaWYgbWFya2Vycy5sZW5ndGggPiAwXG4gICAgICBmb3IgbWFya2VyIGluIG1hcmtlcnNcbiAgICAgICAgbSA9IG5ldyBQbGFuaXQuTWFya2VyKEBjb250YWluZXIsICQobWFya2VyKS5hdHRyKCdkYXRhLW1hcmtlcicpKVxuICAgICAgICBtLmhpZGVJbmZvYm94KClcbiAgICAgICAgbGVmdCA9IChAY2FsYyhpbWdXaWR0aCkgKiAoJChtYXJrZXIpLmF0dHIoJ2RhdGEteFBjJykgLyAxMDApKSArXG4gICAgICAgICAgQGltYWdlUG9zaXRpb24ubGVmdFB4IC0gKCQobWFya2VyKS5vdXRlcldpZHRoKCkgLyAyKVxuICAgICAgICB0b3AgPSAoQGNhbGMoaW1nSGVpZ2h0KSAqICgkKG1hcmtlcikuYXR0cignZGF0YS15UGMnKSAvIDEwMCkpICtcbiAgICAgICAgICBAaW1hZ2VQb3NpdGlvbi50b3BQeCAtICgkKG1hcmtlcikub3V0ZXJIZWlnaHQoKSAvIDIpXG4gICAgICAgIGRvIChtKSAtPlxuICAgICAgICAgICQobWFya2VyKS5hbmltYXRlXG4gICAgICAgICAgICBsZWZ0OiBcIiN7bGVmdH1weFwiXG4gICAgICAgICAgICB0b3A6IFwiI3t0b3B9cHhcIlxuICAgICAgICAgICwgMjUwLCAoKSA9PlxuICAgICAgICAgICAgbS5wb3NpdGlvbkluZm9ib3goKVxuICAgICAgICAgICAgbS51bmhpZGVJbmZvYm94KClcblxuICAjID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09IFNldHRpbmcgSW5mb2JveGVzXG5cbiAgIyAocHJpdmF0ZSkgQXBwcm9wcmlhdGVseSBwb3NpdGlvbiB0aGUgaW5mb2JveCBvbiBldmVyeVxuICAjIG1hcmtlciwgdGhlIGxvZ2ljIGZvciB3aGljaCBpcyBpbiB0aGUgTWFya2VyIGNsYXNzXG4gICNcbiAgcG9zaXRpb25JbmZvYm94ZXMgPSAtPlxuICAgIGZvciBtYXJrZXIgaW4gQGNvbnRhaW5lci5maW5kKFwiLiN7UGxhbml0Lm1hcmtlckNsYXNzfVwiKVxuICAgICAgbSA9IG5ldyBQbGFuaXQuTWFya2VyKEBjb250YWluZXIsICQobWFya2VyKS5hdHRyKCdkYXRhLW1hcmtlcicpKVxuICAgICAgbS5wb3NpdGlvbkluZm9ib3goKVxuICAgIHRydWVcblxuICAjID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09IE1vdmUgQWN0aW9uc1xuXG4gICMgV2lsbCBjZW50ZXIgdGhlIGltYWdlIG9uIHRoZSBnaXZlbiBjb29yZGluYXRlcyBhcyBbeCx5XVxuICAjIGluIGZsb2F0ZWQgcGVyY2VudGFnZXMuIEVuc3VyZXMgdGhlcmUgaXMgZW5vdWdoIGltYWdlIG9uXG4gICMgZWFjaCBzaWRlIGJ5IHpvb21pbmcgaW4gaWYgbmVjZXNzYXJ5LlxuICAjXG4gIGNlbnRlck9uOiAoY29vcmRzKSA9PlxuICAgIGlmIGNvb3Jkc1swXSA+PSA1MCB0aGVuIHggPSAxMDAgLSBjb29yZHNbMF0gZWxzZSB4ID0gY29vcmRzWzBdXG4gICAgaWYgY29vcmRzWzFdID49IDUwIHRoZW4geSA9IDEwMCAtIGNvb3Jkc1sxXSBlbHNlIHkgPSBjb29yZHNbMV1cbiAgICB3TWluID0gNTAgKiAoQGNhbGMoY29udGFpbmVyV2lkdGgpIC8geClcbiAgICBoTWluID0gNTAgKiAoQGNhbGMoY29udGFpbmVySGVpZ2h0KSAvIHkpXG4gICAgIyBoaWRlcyBvdGhlciBhY3RpdmUgaW5mb2JveGVzLCBidXQgd2lsbCBzdGlsbCBzaG93XG4gICAgIyB0aGlzIGluZm9ib3hcbiAgICBAY29udGFpbmVyLmZpbmQoXCIuI3tQbGFuaXQuaW5mb2JveENsYXNzfVwiKS5yZW1vdmVDbGFzcygnYWN0aXZlJylcbiAgICAjIEdldCBvdXIgaW5pdGlhbCBwb3NpdGlvblxuICAgIEBpbWFnZVBvc2l0aW9uLmxlZnRQeCA9IC0gKFxuICAgICAgKEBjYWxjKGltZ1dpZHRoKSAqIChjb29yZHNbMF0gLyAxMDApKSAtIChAY2FsYyhjb250YWluZXJXaWR0aCkgLyAyKVxuICAgIClcbiAgICBAaW1hZ2VQb3NpdGlvbi50b3BQeCA9IC0gKFxuICAgICAgKEBjYWxjKGltZ0hlaWdodCkgKiAoY29vcmRzWzFdIC8gMTAwKSkgLSAoQGNhbGMoY29udGFpbmVySGVpZ2h0KSAvIDIpXG4gICAgKVxuICAgICMga2VlcCB0aGVvcmV0aWNhbGx5IG1ha2luZyB0aGUgaW1hZ2UgYmlnZ2VyIHVudGlsIGl0IGlzXG4gICAgIyBsYXJnZSBlbm91Z2ggdG8gY2VudGVyIG9uIG91ciBwb2ludFxuICAgIHdoaWxlIChAY2FsYyhpbWdXaWR0aCkgPCB3TWluKSB8fCAoQGNhbGMoaW1nSGVpZ2h0KSA8IGhNaW4pXG4gICAgICBAaW1hZ2VQb3NpdGlvbi5zY2FsZSAgPSBAaW1hZ2VQb3NpdGlvbi5zY2FsZSArIEBpbWFnZVBvc2l0aW9uLmluY3JlbWVudFxuICAgICAgQGltYWdlUG9zaXRpb24ubGVmdFB4ID0gLSAoXG4gICAgICAgIChAY2FsYyhpbWdXaWR0aCkgKiAoY29vcmRzWzBdIC8gMTAwKSkgLSAoQGNhbGMoY29udGFpbmVyV2lkdGgpIC8gMilcbiAgICAgIClcbiAgICAgIEBpbWFnZVBvc2l0aW9uLnRvcFB4ID0gLSAoXG4gICAgICAgIChAY2FsYyhpbWdIZWlnaHQpICogKGNvb3Jkc1sxXSAvIDEwMCkpIC0gKEBjYWxjKGNvbnRhaW5lckhlaWdodCkgLyAyKVxuICAgICAgKVxuICAgIGFuaW1hdGVCYWNrZ3JvdW5kLmNhbGwoQClcbiAgICBjb29yZHNcblxuICAjIFpvb21zIHRoZSBpbWFnZSB0byBhIHNwZWNpZmljIFwibGV2ZWxcIiB3aGljaCBpcyBhblxuICAjIGluY3JlbWVudGVkIGludGVnZXIgc3RhcnRpbmcgYXQgemVyb1xuICAjXG4gIHpvb21UbzogKGxldmVsKSA9PlxuICAgIGkgPSBAaW1hZ2VQb3NpdGlvbi5pbmNyZW1lbnRcbiAgICB1bmxlc3MgKChsZXZlbCAqIGkpICsgMSkgPT0gQGltYWdlUG9zaXRpb24uc2NhbGVcbiAgICAgIEBpbWFnZVBvc2l0aW9uLnNjYWxlID0gKGxldmVsICogaSkgKyAxICsgaVxuICAgICAgQHpvb21PdXQoKVxuICAgIGxldmVsXG5cbiAgIyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PSBDYWxjdWxhdGlvbnNcblxuICAjIE1ldGhvZCBmb3IgYWNjZXNzaW5nIHRoZSBwcml2YXRlIGNhbGN1bGF0aW9uIG1ldGhvZHNcbiAgI1xuICBjYWxjOiAobWV0aG9kKSA9PlxuICAgIG1ldGhvZC5jYWxsKEApXG5cbiAgIyAocHJpdmF0ZSkgV2lkdGggb2YgdGhlIGltYWdlXG4gICNcbiAgaW1nV2lkdGggPSAtPlxuICAgIHBhcnNlRmxvYXQoQGltYWdlUG9zaXRpb24ud2lkdGggKiBAaW1hZ2VQb3NpdGlvbi5zY2FsZSlcblxuICAjIChwcml2YXRlKSBUaGUgbnVtYmVyIG9mIHBpeGVscyBhZGRlZCB3aXRoIGVhY2ggem9vbSBsZXZlbFxuICAjXG4gIGltZ1dpZHRoQ2xpY2tJbmNyZW1lbnQgPSAtPlxuICAgIHBhcnNlRmxvYXQoQGltYWdlUG9zaXRpb24ud2lkdGggKiBAaW1hZ2VQb3NpdGlvbi5pbmNyZW1lbnQpXG5cbiAgIyAocHJpdmF0ZSkgVGhlIHdpZHRoIG9mIHRoZSBjb250YWluZXJcbiAgI1xuICBjb250YWluZXJXaWR0aCA9IC0+XG4gICAgcGFyc2VGbG9hdChAbWFya2Vyc0NvbnRhaW5lci53aWR0aCgpKVxuXG4gICMgKHByaXZhdGUpIE51bWJlciBvZiBwaXhlbHMgbGVmdCBzaWRlIG9mIGltYWdlIGlzIGZyb21cbiAgIyBsZWZ0IHNpZGUgb2YgdGhlIGNvbnRhaW5lclxuICAjXG4gIGltZ09mZnNldExlZnQgPSAtPlxuICAgIE1hdGguYWJzKHBhcnNlRmxvYXQoQGltYWdlLmNzcygnbGVmdCcpKSlcblxuICAjIChwcml2YXRlKSBIZWlnaHQgb2YgdGhlIGltYWdlXG4gICNcbiAgaW1nSGVpZ2h0ID0gLT5cbiAgICBwYXJzZUZsb2F0KEBpbWFnZVBvc2l0aW9uLmhlaWdodCAqIEBpbWFnZVBvc2l0aW9uLnNjYWxlKVxuXG4gICMgKHByaXZhdGUpIFRoZSBudW1iZXIgb2YgcGl4ZWxzIGFkZGVkIG9yIHJlbW92ZWQgd2l0aFxuICAjIGVhY2ggem9vbSBsZXZlbFxuICAjXG4gIGltZ0hlaWdodENsaWNrSW5jcmVtZW50ID0gLT5cbiAgICBwYXJzZUZsb2F0KEBpbWFnZVBvc2l0aW9uLmhlaWdodCAqIEBpbWFnZVBvc2l0aW9uLmluY3JlbWVudClcblxuICAjIChwcml2YXRlKSBUaGUgaGVpZ2h0IG9mIHRoZSBjb250YWluZXIgKHBpeGVscylcbiAgI1xuICBjb250YWluZXJIZWlnaHQgPSAtPlxuICAgIHBhcnNlRmxvYXQoQG1hcmtlcnNDb250YWluZXIuaGVpZ2h0KCkpXG5cbiAgIyAocHJpdmF0ZSkgVGhlIG51bWJlciBvZiBwaXhlbHMgdGhlIHRvcCBvZiB0aGUgaW1hZ2UgaXNcbiAgIyBmcm9tIHRoZSB0b3Agb2YgdGhlIGNvbnRhaW5lclxuICAjXG4gIGltZ09mZnNldFRvcCA9IC0+XG4gICAgTWF0aC5hYnMocGFyc2VGbG9hdChAaW1hZ2UuY3NzKCd0b3AnKSkpXG5cbiAgIyAocHJpdmF0ZSkgQ29vcmRpbmF0ZXMgb2YgYW4gZXZlbnQgYXMgYSBwZXJjZW50YWdlIG9mIHRoZVxuICAjIGRpbWVuc2lvbnMgb2YgdGhlIGNvbnRhaW5lciwgcmVsYXRpdmUgdG8gdGhlIHRvcCBsZWZ0XG4gICMgY29ybmVyIG9mIHRoZSBjb250YWluZXJcbiAgI1xuICB6RXZlbnRQb3NpdGlvbiA9IChlKSAtPlxuICAgIGxlZnQ6IChlLnBhZ2VYIC0gQGNvbnRhaW5lci5vZmZzZXQoKS5sZWZ0KSAvIEBjYWxjKGNvbnRhaW5lcldpZHRoKVxuICAgIHRvcDogIChlLnBhZ2VZIC0gQGNvbnRhaW5lci5vZmZzZXQoKS50b3ApIC8gQGNhbGMoY29udGFpbmVySGVpZ2h0KVxuXG4gICMgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0gRXZlbnRzXG5cbiAgIyAocHJpdmF0ZSkgTGlzdGVuZXIgZm9yIGRvdWJsZS1jbGlja2luZyBvbiB0aGUgcGxhblxuICAjXG4gIHpEYmxDbGljayA9IChlKSAtPlxuICAgIGlmICQoZS50YXJnZXQpLmF0dHIoJ2RhdGEtem9vbS1pZCcpID09IEB6b29tSWRcbiAgICAgIGNsaWNrID0gekV2ZW50UG9zaXRpb24uY2FsbChALCBlKVxuICAgICAgQHpvb21JbignY2xpY2snLCBjbGljay5sZWZ0LCBjbGljay50b3ApXG5cbiAgIyAocHJpdmF0ZSkgTGlzdGVuZXIgZm9yIHRoZSBzdGFydCBvZiBhIGNsaWNrIG9uIHRoZSBwbGFuXG4gICNcbiAgek1vdXNlRG93biA9IChlKSAtPlxuICAgIGlmICQoZS50YXJnZXQpLmF0dHIoJ2RhdGEtem9vbS1pZCcpID09IEB6b29tSWQgJiYgZS53aGljaCA9PSAxXG4gICAgICBAaXNEcmFnZ2luZyA9IHRydWVcbiAgICAgIGNvb3JkcyA9IHpFdmVudFBvc2l0aW9uLmNhbGwoQCwgZSlcbiAgICAgIEBkcmFnQ29vcmRzID1cbiAgICAgICAgcG9pbnRSZWY6IGNvb3Jkc1xuICAgICAgICBpbWdSZWY6XG4gICAgICAgICAgbGVmdDogMCAtIEBjYWxjKGltZ09mZnNldExlZnQpXG4gICAgICAgICAgdG9wOiAwIC0gQGNhbGMoaW1nT2Zmc2V0VG9wKVxuICAgICAgICBtYXg6XG4gICAgICAgICAgcmlnaHQ6IChjb29yZHMubGVmdCAqIEBjYWxjKGNvbnRhaW5lcldpZHRoKSkgKyBAY2FsYyhpbWdPZmZzZXRMZWZ0KVxuICAgICAgICAgIGxlZnQ6IChjb29yZHMubGVmdCAqIEBjYWxjKGNvbnRhaW5lcldpZHRoKSkgLSAoQGNhbGMoaW1nV2lkdGgpIC1cbiAgICAgICAgICAgICAgICAgICAgICAoQGNhbGMoY29udGFpbmVyV2lkdGgpICsgQGNhbGMoaW1nT2Zmc2V0TGVmdCkpKVxuICAgICAgICAgIGJvdHRvbTogKGNvb3Jkcy50b3AgKiBAY2FsYyhjb250YWluZXJIZWlnaHQpKSArIEBjYWxjKGltZ09mZnNldFRvcClcbiAgICAgICAgICB0b3A6IChjb29yZHMudG9wICogQGNhbGMoY29udGFpbmVySGVpZ2h0KSkgLSAoQGNhbGMoaW1nSGVpZ2h0KSAtXG4gICAgICAgICAgICAgICAgICAgICAgKEBjYWxjKGNvbnRhaW5lckhlaWdodCkgKyBAY2FsYyhpbWdPZmZzZXRUb3ApKSlcbiAgICB0cnVlXG5cbiAgIyAocHJpdmF0ZSkgTGlzdGVuZXIgZm9yIHdoZW4gdGhlIG1vdXNlIG1vdmVzIGFueXdoZXJlIG9uXG4gICMgdGhlIGRvY3VtZW50XG4gICNcbiAgek1vdXNlTW92ZSA9IChlKSAtPlxuICAgIGlmIEBpc0RyYWdnaW5nXG4gICAgICBjb29yZHMgPSB6RXZlbnRQb3NpdGlvbi5jYWxsKEAsIGUpXG4gICAgICBkcmFnTGVmdCA9IGNvb3Jkcy5sZWZ0ICogQGNhbGMoY29udGFpbmVyV2lkdGgpXG4gICAgICBkcmFnVG9wID0gY29vcmRzLnRvcCAqIEBjYWxjKGNvbnRhaW5lckhlaWdodClcbiAgICAgIGlmIGRyYWdMZWZ0ID49IEBkcmFnQ29vcmRzLm1heC5sZWZ0ICYmIGRyYWdMZWZ0IDw9IEBkcmFnQ29vcmRzLm1heC5yaWdodFxuICAgICAgICBsZWZ0ID0gKGNvb3Jkcy5sZWZ0IC0gQGRyYWdDb29yZHMucG9pbnRSZWYubGVmdCkgKiBAY2FsYyhjb250YWluZXJXaWR0aClcbiAgICAgICAgQGltYWdlUG9zaXRpb24ubGVmdFB4ID0gQGRyYWdDb29yZHMuaW1nUmVmLmxlZnQgKyBsZWZ0XG4gICAgICBlbHNlIGlmIGRyYWdMZWZ0IDwgQGRyYWdDb29yZHMubWF4LmxlZnRcbiAgICAgICAgQGltYWdlUG9zaXRpb24ubGVmdFB4ID0gQGNhbGMoY29udGFpbmVyV2lkdGgpIC0gQGNhbGMoaW1nV2lkdGgpXG4gICAgICBlbHNlIGlmIGRyYWdMZWZ0ID4gQGRyYWdDb29yZHMubWF4LnJpZ2h0XG4gICAgICAgIEBpbWFnZVBvc2l0aW9uLmxlZnRQeCA9IDBcbiAgICAgIGlmIGRyYWdUb3AgPj0gQGRyYWdDb29yZHMubWF4LnRvcCAmJiBkcmFnVG9wIDw9IEBkcmFnQ29vcmRzLm1heC5ib3R0b21cbiAgICAgICAgdG9wID0gKGNvb3Jkcy50b3AgLSBAZHJhZ0Nvb3Jkcy5wb2ludFJlZi50b3ApICogQGNhbGMoY29udGFpbmVySGVpZ2h0KVxuICAgICAgICBAaW1hZ2VQb3NpdGlvbi50b3BQeCA9IEBkcmFnQ29vcmRzLmltZ1JlZi50b3AgKyB0b3BcbiAgICAgIGVsc2UgaWYgZHJhZ1RvcCA8IEBkcmFnQ29vcmRzLm1heC50b3BcbiAgICAgICAgQGltYWdlUG9zaXRpb24udG9wUHggPSBAY2FsYyhjb250YWluZXJIZWlnaHQpIC0gQGNhbGMoaW1nSGVpZ2h0KVxuICAgICAgZWxzZSBpZiBkcmFnVG9wID4gQGRyYWdDb29yZHMubWF4LmJvdHRvbVxuICAgICAgICBAaW1hZ2VQb3NpdGlvbi50b3BQeCA9IDBcbiAgICAgIHNldEJhY2tncm91bmQuY2FsbChAKVxuICAgIHRydWVcblxuICAjIChwcml2YXRlKSBMaXN0ZW5lciBmb3IgdGhlIGVuZCBvZiBhIGNsaWNrIGFueXdoZXJlIG9uXG4gICMgdGhlIGRvY3VtZW50XG4gICNcbiAgek1vdXNlVXAgPSAoZSkgLT5cbiAgICBAaXNEcmFnZ2luZyA9IGZhbHNlXG4gICAgcG9zaXRpb25JbmZvYm94ZXMuY2FsbChAKVxuICAgIHRydWVcblxuICAjID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09IFpvb21pbmdcblxuICAjIFRha2VzIGN1cnJlbnQgem9vbSBwb3NpdGlvbiBhbmQgem9vbXMgaW4gdG8gdGhlIGNlbnRlclxuICAjIG9uZSBsZXZlbCBkZWVwZXJcbiAgI1xuICB6b29tSW46ID0+XG4gICAgQGltYWdlUG9zaXRpb24uc2NhbGUgID0gQGltYWdlUG9zaXRpb24uc2NhbGUgKyBAaW1hZ2VQb3NpdGlvbi5pbmNyZW1lbnRcbiAgICBAaW1hZ2VQb3NpdGlvbi5sZWZ0UHggPSAtIEBjYWxjKGltZ09mZnNldExlZnQpIC1cbiAgICAgIChAY2FsYyhpbWdXaWR0aENsaWNrSW5jcmVtZW50KSAvIDIpXG4gICAgQGltYWdlUG9zaXRpb24udG9wUHggID0gLSBAY2FsYyhpbWdPZmZzZXRUb3ApIC1cbiAgICAgIChAY2FsYyhpbWdIZWlnaHRDbGlja0luY3JlbWVudCkgLyAyKVxuICAgIGFuaW1hdGVCYWNrZ3JvdW5kLmNhbGwoQClcbiAgICB0cnVlXG5cbiAgIyBab29tcyBvdXQgb25lIGxldmVsLiBBdHRlbXB0cyB0byB6b29tIG91dCBmcm9tIHRoZVxuICAjIGNlbnRlciwgYnV0IHdpbGwgYWRqdXN0IGJhc2VkIG9uIGF2YWlsYWJsZSBpbWFnZSBzcGFjZS5cbiAgI1xuICB6b29tT3V0OiAoKSA9PlxuICAgIGlmIEBpbWFnZVBvc2l0aW9uLnNjYWxlID4gMVxuICAgICAgQGltYWdlUG9zaXRpb24uc2NhbGUgID0gQGltYWdlUG9zaXRpb24uc2NhbGUgLSBAaW1hZ2VQb3NpdGlvbi5pbmNyZW1lbnRcbiAgICAgIGxlZnRQeCA9IC0gQGNhbGMoaW1nT2Zmc2V0TGVmdCkgKyAoQGNhbGMoaW1nV2lkdGhDbGlja0luY3JlbWVudCkgLyAyKVxuICAgICAgdG9wUHggID0gLSBAY2FsYyhpbWdPZmZzZXRUb3ApICsgKEBjYWxjKGltZ0hlaWdodENsaWNrSW5jcmVtZW50KSAvIDIpXG4gICAgICBpZiBsZWZ0UHggPiAwXG4gICAgICAgIEBpbWFnZVBvc2l0aW9uLmxlZnRQeCA9IDBcbiAgICAgIGVsc2UgaWYgbGVmdFB4IDwgQGNhbGMoY29udGFpbmVyV2lkdGgpIC0gQGNhbGMoaW1nV2lkdGgpXG4gICAgICAgIEBpbWFnZVBvc2l0aW9uLmxlZnRQeCA9IEBjYWxjKGNvbnRhaW5lcldpZHRoKSAtIEBjYWxjKGltZ1dpZHRoKVxuICAgICAgZWxzZVxuICAgICAgICBAaW1hZ2VQb3NpdGlvbi5sZWZ0UHggPSBsZWZ0UHhcbiAgICAgIGlmIHRvcFB4ID4gMFxuICAgICAgICBAaW1hZ2VQb3NpdGlvbi50b3BQeCA9IDBcbiAgICAgIGVsc2UgaWYgdG9wUHggPCBAY2FsYyhjb250YWluZXJIZWlnaHQpIC0gQGNhbGMoaW1nSGVpZ2h0KVxuICAgICAgICBAaW1hZ2VQb3NpdGlvbi50b3BQeCA9IEBjYWxjKGNvbnRhaW5lckhlaWdodCkgLSBAY2FsYyhpbWdIZWlnaHQpXG4gICAgICBlbHNlXG4gICAgICAgIEBpbWFnZVBvc2l0aW9uLnRvcFB4ID0gdG9wUHhcbiAgICAgIGFuaW1hdGVCYWNrZ3JvdW5kLmNhbGwoQClcbiAgICAgIHRydWVcbiAgICBlbHNlXG4gICAgICBmYWxzZVxuXG5cbiAgIyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PSBNYXJrZXIgUmVmZXJlbmNlc1xuXG4gICMgKHByaXZhdGUpIFRoZSBtYXJrZXIocykgdGhhdCBhcmUgYmVpbmcgZHJhZ2dlZCwgZm91bmQgYnlcbiAgIyBQbGFuaXQncyBkcmFnZ2luZyBjbGFzcy5cbiAgI1xuICBkcmFnZ2luZ01hcmtlciA9IC0+XG4gICAgQG1hcmtlcnNDb250YWluZXIuZmluZChcIi4je1BsYW5pdC5tYXJrZXJDbGFzc30uI3tQbGFuaXQuZHJhZ2dpbmdDbGFzc31cIilcblxuICAjIChwcml2YXRlKSBDb29yZGluYXRlcyBvZiBhbiBldmVudCBhcyBhIHBlcmNlbnRhZ2Ugb2YgdGhlXG4gICMgZGltZW5zaW9ucyBvZiB0aGUgY29udGFpbmVyLCByZWxhdGl2ZSB0byB0aGUgdG9wIGxlZnRcbiAgIyBjb3JuZXIgb2YgdGhlIGltYWdlXG4gICNcbiAgZ2V0RXZlbnRQb3NpdGlvbiA9IChlKSAtPlxuICAgIGlmIEBpbWFnZVxuICAgICAgIyBpZiB0aGVyZSBpcyBhbiBpbWFnZSwgd2UgbmVlZCB0byBjYWxjdWxhdGUgd2l0aCBpbWFnZSBpbiBtaW5kXG4gICAgICB4UHggPSBlLnBhZ2VYIC0gQGNvbnRhaW5lci5vZmZzZXQoKS5sZWZ0XG4gICAgICB5UHggPSBlLnBhZ2VZIC0gQGNvbnRhaW5lci5vZmZzZXQoKS50b3BcbiAgICAgIHdJbWcgPSBAaW1hZ2Uud2lkdGgoKVxuICAgICAgaEltZyA9IEBpbWFnZS5oZWlnaHQoKVxuICAgICAgeEltZyA9IHBhcnNlSW50KEBpbWFnZS5jc3MoJ2xlZnQnKSlcbiAgICAgIHlJbWcgPSBwYXJzZUludChAaW1hZ2UuY3NzKCd0b3AnKSlcbiAgICAgIHhQYyA9ICgoeFB4ICsgTWF0aC5hYnMoeEltZykpIC8gd0ltZykgKiAxMDBcbiAgICAgIHlQYyA9ICgoeVB4ICsgTWF0aC5hYnMoeUltZykpIC8gaEltZykgKiAxMDBcbiAgICBlbHNlXG4gICAgICAjIG9yIHdlIGNhbiBqdXN0IGxvb2sgYXQgdGhlIGNvbnRhaW5lclxuICAgICAgeFBjID0gKGUucGFnZVggLSBAY29udGFpbmVyLm9mZnNldCgpLmxlZnQpIC8gQGNhbGMoY29udGFpbmVyV2lkdGgpXG4gICAgICB5UGMgPSAgKGUucGFnZVkgLSBAY29udGFpbmVyLm9mZnNldCgpLnRvcCkgLyBAY2FsYyhjb250YWluZXJIZWlnaHQpXG4gICAgW3hQYywgeVBjXVxuXG4gICMgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0gRXZlbnRzXG5cbiAgIyAocHJpdmF0ZSkgQ2FsbGVkIGF0IHRoZSBlbmQgb2YgYSBjbGljaywgd2hlbiBpdCBvY2N1cnNcbiAgIyBvbiB0b3Agb2YgdGhlIHBsYW4uXG4gICNcbiAgbW91c2V1cCA9IChlKSAtPlxuICAgICMgZGVhbGluZyB3aXRoIG1hcmtlcnMsIGVzcC4gZHJhZ2dpbmcgbWFya2Vyc1xuICAgIG1hcmtlciA9IEBtYXJrZXJzQ29udGFpbmVyLmZpbmQoXCIuI3tQbGFuaXQuZHJhZ2dpbmdDbGFzc31cIikuZmlyc3QoKVxuICAgIGlmIGRyYWdnaW5nTWFya2VyLmNhbGwoQCkubGVuZ3RoID4gMFxuICAgICAgbSA9IG5ldyBQbGFuaXQuTWFya2VyKEBjb250YWluZXIsIG1hcmtlci5hdHRyKCdkYXRhLW1hcmtlcicpKVxuICAgICAgaWYgQG9wdGlvbnMubWFya2VyRHJhZ0VuZFxuICAgICAgICBAb3B0aW9ucy5tYXJrZXJEcmFnRW5kKGUsIG0pXG4gICAgICBtLnNhdmVQb3NpdGlvbigpXG4gICAgICBtLnBvc2l0aW9uSW5mb2JveCgpXG4gICAgICBkcmFnZ2luZ01hcmtlci5jYWxsKEApLnJlbW92ZUNsYXNzKFBsYW5pdC5kcmFnZ2luZ0NsYXNzKVxuICAgICMgaWYgY2xpY2sgaXMgb24gdGhlIGNvbnRhaW5lclxuICAgIGlmICQoZS50YXJnZXQpLmhhc0NsYXNzKFBsYW5pdC5tYXJrZXJDb250YWluZXJDbGFzcylcbiAgICAgIGlmIEBvcHRpb25zLmNhbnZhc0NsaWNrXG4gICAgICAgIEBvcHRpb25zLmNhbnZhc0NsaWNrKGUsIGdldEV2ZW50UG9zaXRpb24uY2FsbChALCBlKSlcbiAgICAjIGlmIGNsaWNrIGlzIG9uIHRoZSBtYXJrZXJzXG4gICAgaWYoXG4gICAgICAkKGUudGFyZ2V0KS5oYXNDbGFzcyhQbGFuaXQubWFya2VyQ2xhc3MpIHx8XG4gICAgICAkKGUudGFyZ2V0KS5wYXJlbnRzKFwiLiN7UGxhbml0Lm1hcmtlckNsYXNzfVwiKS5sZW5ndGggPiAwXG4gICAgKVxuICAgICAgaWYgJChlLnRhcmdldCkuaGFzQ2xhc3MoUGxhbml0Lm1hcmtlckNsYXNzKVxuICAgICAgICBtYXJrZXIgPSAkKGUudGFyZ2V0KVxuICAgICAgZWxzZVxuICAgICAgICBtYXJrZXIgPSAkKGUudGFyZ2V0KS5wYXJlbnRzKFwiLiN7UGxhbml0Lm1hcmtlckNsYXNzfVwiKS5maXJzdCgpXG4gICAgICBtID0gbmV3IFBsYW5pdC5NYXJrZXIoQGNvbnRhaW5lciwgbWFya2VyLmF0dHIoJ2RhdGEtbWFya2VyJykpXG4gICAgICBpZiBAb3B0aW9ucy5tYXJrZXJDbGlja1xuICAgICAgICBAb3B0aW9ucy5tYXJrZXJDbGljayhlLCBtKVxuICAgIHRydWVcblxuICAjIChwcml2YXRlKSBDYWxsZWQgd2hlbmV2ZXIgdGhlIG1vdXNlIG1vdmVzIG92ZXIgdGhlIHBsYW4uXG4gICNcbiAgbW91c2Vtb3ZlID0gKGUpIC0+XG4gICAgbWFya2VycyA9IEBtYXJrZXJzQ29udGFpbmVyLmZpbmQoXCIuI3tQbGFuaXQubWFya2VyQ2xhc3N9LiN7UGxhbml0LmRyYWdnaW5nQ2xhc3N9XCIpXG5cbiAgICBpZiBtYXJrZXJzLmxlbmd0aCA+IDBcblxuICAgICAgIyBvbmx5IHVzZSBmaXJzdCBtYXJrZXIgaW4gY2FzZSB0aGVyZSBhcmUgbW9yZSB0aGFuXG4gICAgICAjIG9uZSBkcmFnZ2luZ1xuICAgICAgI1xuICAgICAgbWFya2VyID0gbWFya2Vycy5maXJzdCgpXG5cbiAgICAgICMgd2UgaGlkZSB0aGUgaW5mb2JveCB3aGlsZSBkcmFnZ2luZ1xuICAgICAgI1xuICAgICAgaWYoXG4gICAgICAgIE1hdGguYWJzKGUucGFnZVggLSBtYXJrZXIuYXR0cignZGF0YS1kcmFnLXN0YXJ0LXgnKSkgPiAwIHx8XG4gICAgICAgIE1hdGguYWJzKGUucGFnZVkgLSBtYXJrZXIuYXR0cignZGF0YS1kcmFnLXN0YXJ0LXknKSkgPiAwXG4gICAgICApXG4gICAgICAgIEBjb250YWluZXIuZmluZChcIiMje21hcmtlci5hdHRyKCdkYXRhLWluZm9ib3gnKX1cIikucmVtb3ZlQ2xhc3MoJ2FjdGl2ZScpXG5cbiAgICAgICMgY2FsY3VsYXRlIHBvc2l0aW9uc1xuICAgICAgI1xuICAgICAgbW91c2VMZWZ0ICAgICA9IGUucGFnZVggLSBAY29udGFpbmVyLm9mZnNldCgpLmxlZnRcbiAgICAgIG1vdXNlVG9wICAgICAgPSBlLnBhZ2VZIC0gQGNvbnRhaW5lci5vZmZzZXQoKS50b3BcbiAgICAgIHBsYW5SaWdodCAgICAgPSBAY29udGFpbmVyLndpZHRoKClcbiAgICAgIHBsYW5Cb3R0b20gICAgPSBAY29udGFpbmVyLmhlaWdodCgpXG4gICAgICBtYXJrZXJMZWZ0ICAgID0gbW91c2VMZWZ0IC0gKG1hcmtlci5vdXRlcldpZHRoKCkgLyAyKVxuICAgICAgbWFya2VyVG9wICAgICA9IG1vdXNlVG9wIC0gKG1hcmtlci5vdXRlckhlaWdodCgpIC8gMilcbiAgICAgIG1hcmtlclJpZ2h0ICAgPSBtb3VzZUxlZnQgKyAobWFya2VyLm91dGVyV2lkdGgoKSAvIDIpXG4gICAgICBtYXJrZXJCb3R0b20gID0gbW91c2VUb3AgKyAobWFya2VyLm91dGVySGVpZ2h0KCkgLyAyKVxuICAgICAgbWFya2VyV2lkdGggICA9IG1hcmtlci5vdXRlcldpZHRoKClcbiAgICAgIG1hcmtlckhlaWdodCAgPSBtYXJrZXIub3V0ZXJIZWlnaHQoKVxuXG4gICAgICAjIGZpbmQgdGhlIGxlZnQgcG9zaXRpb24gb2YgdGhlIG1hcmtlciBiYXNlZCBvblxuICAgICAgIyBwb3NpdGlvbiBvZiB0aGUgbW91c2UgcmVsYXRpdmUgdG8gdGhlIHBsYW5cbiAgICAgICNcbiAgICAgIGlmIG1hcmtlckxlZnQgPD0gMFxuICAgICAgICBtYXJrZXJYID0gMFxuICAgICAgZWxzZSBpZiBtYXJrZXJSaWdodCA8IHBsYW5SaWdodFxuICAgICAgICBtYXJrZXJYID0gbWFya2VyTGVmdFxuICAgICAgZWxzZVxuICAgICAgICBtYXJrZXJYID0gcGxhblJpZ2h0IC0gbWFya2VyV2lkdGhcblxuICAgICAgIyBmaW5kIHRoZSBsZWZ0IHBvc2l0aW9uIG9mIHRoZSBtYXJrZXIgYmFzZWQgb25cbiAgICAgICMgcG9zaXRpb24gb2YgdGhlIG1vdXNlIHJlbGF0aXZlIHRvIHRoZSBwbGFuXG4gICAgICAjXG4gICAgICBpZiBtYXJrZXJUb3AgPD0gMFxuICAgICAgICBtYXJrZXJZID0gMFxuICAgICAgZWxzZSBpZiBtYXJrZXJCb3R0b20gPCBwbGFuQm90dG9tXG4gICAgICAgIG1hcmtlclkgPSBtYXJrZXJUb3BcbiAgICAgIGVsc2VcbiAgICAgICAgbWFya2VyWSA9IHBsYW5Cb3R0b20gLSBtYXJrZXJIZWlnaHRcblxuICAgICAgIyBzZXQgdGhlIHBvc2l0aW9uIG9mIHRoZSBtYXJrZXJcbiAgICAgICNcbiAgICAgIG1hcmtlci5jc3NcbiAgICAgICAgbGVmdDogbWFya2VyWFxuICAgICAgICB0b3A6IG1hcmtlcllcblxuICByZXNpemUgPSAoZSkgLT5cbiAgICBpZiBAaW1hZ2VcbiAgICAgIEByZXNldEltYWdlKClcbiAgICAgIEBjb250YWluZXIuaGVpZ2h0KEBpbWFnZS5oZWlnaHQoKSlcbiAgICBmb3IgbWFya2VyIGluIEBtYXJrZXJzQ29udGFpbmVyLmZpbmQoJy5wbGFuaXQtbWFya2VyJylcbiAgICAgIG0gPSBuZXcgUGxhbml0Lk1hcmtlcihAY29udGFpbmVyLCAkKG1hcmtlcikuYXR0cignZGF0YS1tYXJrZXInKSlcbiAgICAgIG0uc2V0KClcblxuXG4gICMgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0gQWRkIEEgTWFya2VyXG5cbiAgIyBBZGRzIGEgbWFya2VyIHRvIHRoZSBwbGFuXG4gICNcbiAgYWRkTWFya2VyOiAob3B0aW9ucyA9IHt9KSA9PlxuICAgIG9wdGlvbnMuY29udGFpbmVyID0gQGNvbnRhaW5lclxuICAgIG1hcmtlciA9IFBsYW5pdC5NYXJrZXIuY3JlYXRlKG9wdGlvbnMpXG4gICAgcmV0dXJuIG1hcmtlclxuXG4gICMgUmV0dXJucyBhbiBhcnJheSBvZiBhbGwgTWFya2VyIG9iamVjdHMgd2l0aGluIHRoZSBwbGFuXG4gICNcbiAgYWxsTWFya2VyczogPT5cbiAgICBtYXJrZXJzID0gW11cbiAgICBmb3IgbWFya2VyIGluIEBjb250YWluZXIuZmluZChcIi4je1BsYW5pdC5tYXJrZXJDbGFzc31cIilcbiAgICAgIG1hcmtlcnMucHVzaChuZXcgUGxhbml0Lk1hcmtlcihAY29udGFpbmVyLCAkKG1hcmtlcikuYXR0cignZGF0YS1tYXJrZXInKSkpXG4gICAgbWFya2Vyc1xuXG5jbGFzcyBQbGFuaXQuTWFya2VyXG5cbiAgIyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PSBTZXR1cFxuXG4gICMgV2hlbiB0aGUgTWFya2VyIGNsYXNzIGlzIGluc3RhbnRpYXRlZCwgd2UgcmV0dXJuIHRoZVxuICAjIG9iamVjdCwgYnV0IGFsbCB3ZSBuZWVkIHRvIGRvIGlzIHNldCByZWZlcmVuY2VzIGFuZCBmaW5kXG4gICMgdGhlIGFwcHJvcHJpYXRlIGpRdWVyeSBvYmplY3QuXG4gICNcbiAgIyBJdCdzIGZvciB0aGlzIHJlYXNvbiB0aGF0IHRoZSBjcmVhdGUgYWN0aW9uIGlzIGEgY2xhc3NcbiAgIyBtZXRob2QgKHRoZSBtYXJrZXIgZG9lc24ndCBwaHlzaWNhbGx5IGV4aXN0IHlldClcbiAgI1xuICBjb25zdHJ1Y3RvcjogKEBjb250YWluZXIsIGlkKSAtPlxuICAgICMgU2V0IE9wdGlvbnNcbiAgICBAbWFya2Vyc0NvbnRhaW5lciA9IEBjb250YWluZXIuZmluZChcIi4je1BsYW5pdC5tYXJrZXJDb250YWluZXJDbGFzc31cIilcbiAgICBpZiBAY29udGFpbmVyLmZpbmQoXCIuI3tQbGFuaXQuaW1hZ2VDb250YWluZXJ9ID4gaW1nXCIpLmxlbmd0aCA+IDBcbiAgICAgIEBpbWFnZSA9IEBjb250YWluZXIuZmluZChcIi4je1BsYW5pdC5pbWFnZUNvbnRhaW5lcn0gPiBpbWdcIikuZmlyc3QoKVxuXG4gICAgIyBGaW5kIE1hcmtlclxuICAgIEBtYXJrZXIgPSBAbWFya2Vyc0NvbnRhaW5lci5maW5kKFxuICAgICAgXCIuI3tQbGFuaXQubWFya2VyQ2xhc3N9W2RhdGEtbWFya2VyPScje2lkfSddXCJcbiAgICApLmZpcnN0KClcblxuICAgICMgUmV0dXJuIHRoaXNcbiAgICBAXG5cbiAgIyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PSBDcmVhdGUgTmV3IE1hcmtlclxuXG4gICMgKGNsYXNzIG1ldGhvZCkgQ3JlYXRlcyBhIG5ldyBtYXJrZXJcbiAgI1xuICBAY3JlYXRlOiAob3B0aW9ucykgLT5cbiAgICAjIGxvY2FsIHJlZmVyZW5jZXNcbiAgICBjb250YWluZXIgPSBvcHRpb25zLmNvbnRhaW5lclxuICAgIG1hcmtlcnNDb250YWluZXIgPSBjb250YWluZXIuZmluZChcIi4je1BsYW5pdC5tYXJrZXJDb250YWluZXJDbGFzc31cIikuZmlyc3QoKVxuICAgICMgc2V0IG9wdGlvbnNcbiAgICBvcHRpb25zLnBsYW5pdElEID0gUGxhbml0LnJhbmRvbVN0cmluZygyMCkgdW5sZXNzIG9wdGlvbnMucGxhbml0SURcbiAgICBpZiBvcHRpb25zLmNvbG9yIHRoZW4gY29sb3IgPSBvcHRpb25zLmNvbG9yIGVsc2UgY29sb3IgPSAnI0ZDNUIzRidcbiAgICAjIGZpbmQgcG9zaXRpb25cbiAgICBsZWZ0ID0gKChwYXJzZUZsb2F0KG9wdGlvbnMuY29vcmRzWzBdKSAvIDEwMCkgKiBjb250YWluZXIud2lkdGgoKSkgLSAxNVxuICAgIHRvcCA9ICgocGFyc2VGbG9hdChvcHRpb25zLmNvb3Jkc1sxXSkgLyAxMDApICogY29udGFpbmVyLmhlaWdodCgpKSAtIDE1XG4gICAgIyBjcmVhdGUgdGhlIG1hcmtlclxuICAgIG1hcmtlcnNDb250YWluZXIuYXBwZW5kKFxuICAgICAgJCgnPGRpdj48L2Rpdj4nKVxuICAgICAgICAuYWRkQ2xhc3MoUGxhbml0Lm1hcmtlckNsYXNzKVxuICAgICAgICAuYXR0clxuICAgICAgICAgICdkYXRhLW1hcmtlcic6IG9wdGlvbnMucGxhbml0SURcbiAgICAgICAgICAnZGF0YS14UGMnOiBvcHRpb25zLmNvb3Jkc1swXVxuICAgICAgICAgICdkYXRhLXlQYyc6IG9wdGlvbnMuY29vcmRzWzFdXG4gICAgICAgIC5jc3NcbiAgICAgICAgICBsZWZ0OiBcIiN7bGVmdH1weFwiXG4gICAgICAgICAgdG9wOiBcIiN7dG9wfXB4XCJcbiAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6IGNvbG9yXG4gICAgKVxuICAgICMgZmluZCB0aGUgbWFya2VyXG4gICAgbWFya2VyID0gbWFya2Vyc0NvbnRhaW5lci5maW5kKFwiLiN7UGxhbml0Lm1hcmtlckNsYXNzfVwiKS5sYXN0KClcbiAgICBtYXJrZXJPYmogPSBuZXcgUGxhbml0Lk1hcmtlcihjb250YWluZXIsIG9wdGlvbnMucGxhbml0SUQpXG4gICAgIyBhZGQgY29udGVudCBhbmQgc3R5bGVzIGlmIHBhc3NlZCBhcyBvcHRpb25zXG4gICAgaWYgb3B0aW9ucy5pZFxuICAgICAgbWFya2VyLmF0dHIoJ2RhdGEtaWQnOiBvcHRpb25zLmlkKVxuICAgIGlmIG9wdGlvbnMuY2xhc3NcbiAgICAgIG1hcmtlci5hZGRDbGFzcyhvcHRpb25zLmNsYXNzKVxuICAgIGlmIG9wdGlvbnMuaHRtbFxuICAgICAgbWFya2VyLmh0bWwob3B0aW9ucy5odG1sKVxuICAgIGlmIG9wdGlvbnMuc2l6ZVxuICAgICAgbWFya2VyLmNzc1xuICAgICAgICB3aWR0aDogXCIje29wdGlvbnMuc2l6ZX1weFwiXG4gICAgICAgIGhlaWdodDogXCIje29wdGlvbnMuc2l6ZX1weFwiXG4gICAgIyBzZXR1cCBkcmFnZ2FibGUgaWYgbmVjZXNzYXJ5XG4gICAgaWYgb3B0aW9ucy5kcmFnZ2FibGVcbiAgICAgIG1hcmtlci5hZGRDbGFzcygnZHJhZ2dhYmxlJylcbiAgICAgIG1hcmtlci5vbiAnbW91c2Vkb3duJywgKGUpID0+XG4gICAgICAgIGlmIGUud2hpY2ggPT0gMVxuICAgICAgICAgIG1hcmtlciA9ICQoZS50YXJnZXQpLmNsb3Nlc3QoXCIuI3tQbGFuaXQubWFya2VyQ2xhc3N9XCIpXG4gICAgICAgICAgbWFya2VyLmFkZENsYXNzKFBsYW5pdC5kcmFnZ2luZ0NsYXNzKVxuICAgICAgICAgIG1hcmtlci5hdHRyXG4gICAgICAgICAgICAnZGF0YS1kcmFnLXN0YXJ0LXgnOiBlLnBhZ2VYXG4gICAgICAgICAgICAnZGF0YS1kcmFnLXN0YXJ0LXknOiBlLnBhZ2VZXG4gICAgIyBzZXR1cCBpbmZvYm94IGlmIG5lY2Vzc2FyeVxuICAgIGlmIG9wdGlvbnMuaW5mb2JveFxuICAgICAgaWQgPSBQbGFuaXQucmFuZG9tU3RyaW5nKDE2KVxuICAgICAgIyBzZXQgc3R5bGUgb3B0aW9ucyBvbiBpbmZvYm94XG4gICAgICBpbmZvYm94ID0gb3B0aW9ucy5pbmZvYm94XG4gICAgICBpZiBpbmZvYm94LnBvc2l0aW9uIHRoZW4gcG9zaXRpb24gPSBpbmZvYm94LnBvc2l0aW9uIGVsc2UgcG9zaXRpb24gPSAndG9wJ1xuICAgICAgaWYgaW5mb2JveC5hcnJvdyB0aGVuIGFycm93ID0gdHJ1ZSBlbHNlIGFycm93ID0gZmFsc2VcbiAgICAgIGlmIGFycm93ID09IHRydWUgdGhlbiBhcnJvd0NsYXNzID0gJ2Fycm93JyBlbHNlIGFycm93Q2xhc3MgPSAnJ1xuICAgICAgY2xhc3NlcyA9IFwiI3tQbGFuaXQuaW5mb2JveENsYXNzfSAje3Bvc2l0aW9ufSAje2Fycm93Q2xhc3N9XCJcbiAgICAgICMgYWRkIGluZm9ib3hcbiAgICAgIGNvbnRhaW5lci5maW5kKFwiLiN7UGxhbml0LmluZm9ib3hDb250YWluZXJDbGFzc31cIikuYXBwZW5kIFwiXCJcIlxuICAgICAgICA8ZGl2IGNsYXNzPVwiI3tjbGFzc2VzfVwiIGlkPVwiaW5mby0je2lkfVwiXG4gICAgICAgICAgZGF0YS1wb3NpdGlvbj1cIiN7cG9zaXRpb259XCI+XG4gICAgICAgICAgICAje2luZm9ib3guaHRtbH1cbiAgICAgICAgPC9kaXY+XG4gICAgICAgICAgXCJcIlwiXG4gICAgICAjIGFkZCBwb3N0LW9wdGlvbnMgaWYgbmVjZXNzYXJ5XG4gICAgICBpZiBpbmZvYm94Lm9mZnNldFhcbiAgICAgICAgY29udGFpbmVyLmZpbmQoXCIuI3tQbGFuaXQuaW5mb2JveENsYXNzfVwiKS5sYXN0KCkuYXR0clxuICAgICAgICAgICdkYXRhLW9mZnNldC14JzogaW5mb2JveC5vZmZzZXRYXG4gICAgICBpZiBpbmZvYm94Lm9mZnNldFlcbiAgICAgICAgY29udGFpbmVyLmZpbmQoXCIuI3tQbGFuaXQuaW5mb2JveENsYXNzfVwiKS5sYXN0KCkuYXR0clxuICAgICAgICAgICdkYXRhLW9mZnNldC15JzogaW5mb2JveC5vZmZzZXRZXG4gICAgICBtYXJrZXIuYXR0cignZGF0YS1pbmZvYm94JywgXCJpbmZvLSN7aWR9XCIpXG4gICAgICBtYXJrZXJPYmoucG9zaXRpb25JbmZvYm94KClcbiAgICBtYXJrZXJPYmpcblxuICAjID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09IENhbGN1bGF0aW9uc1xuXG4gICMgR2V0IHRoZSBwb3NpdGlvbiBvZiB0aGUgbWFya2VyIGFzIGEgcGVyY2VudGFnZSBvZiAxMDAsXG4gICMgcmVsYXRpdmUgdG8gdGhlIHRvcCBsZWZ0IG9mIHRoZSBpbWFnZSAoaWYgdGhlcmUgaXMgYW4gaW1hZ2UpLlxuICAjXG4gIHBvc2l0aW9uOiA9PlxuICAgIHhQeCA9IEBtYXJrZXIucG9zaXRpb24oKS5sZWZ0ICsgKEBtYXJrZXIub3V0ZXJXaWR0aCgpIC8gMilcbiAgICB5UHggPSBAbWFya2VyLnBvc2l0aW9uKCkudG9wICsgKEBtYXJrZXIub3V0ZXJIZWlnaHQoKSAvIDIpXG4gICAgaWYgQGltYWdlXG4gICAgICB3SW1nID0gQGltYWdlLndpZHRoKClcbiAgICAgIGhJbWcgPSBAaW1hZ2UuaGVpZ2h0KClcbiAgICAgIHhJbWcgPSBwYXJzZUludChAaW1hZ2UuY3NzKCdsZWZ0JykpXG4gICAgICB5SW1nID0gcGFyc2VJbnQoQGltYWdlLmNzcygndG9wJykpXG4gICAgICB4UGMgPSAoKHhQeCArIE1hdGguYWJzKHhJbWcpKSAvIHdJbWcpICogMTAwXG4gICAgICB5UGMgPSAoKHlQeCArIE1hdGguYWJzKHlJbWcpKSAvIGhJbWcpICogMTAwXG4gICAgZWxzZVxuICAgICAgeFBjID0gKHhQeCAvIEBjb250YWluZXIud2lkdGgoKSkgKiAxMDBcbiAgICAgIHlQYyA9ICh5UHggLyBAY29udGFpbmVyLmhlaWdodCgpKSAqIDEwMFxuICAgIFt4UGMsIHlQY11cblxuICAjIEdldCB0aGUgcG9zaXRpb24gb2YgdGhlIG1hcmtlciBhcyBhIHBlcmNlbnRhZ2Ugb2YgMTAwLFxuICAjIHJlbGF0aXZlIHRvIHRoZSB0b3AgbGVmdCBvZiB0aGUgY29udGFpbmVyLlxuICAjXG4gIHJlbGF0aXZlUG9zaXRpb246ID0+XG4gICAgeFB4ID0gQG1hcmtlci5wb3NpdGlvbigpLmxlZnQgKyAoQG1hcmtlci5vdXRlcldpZHRoKCkgLyAyKVxuICAgIHlQeCA9IEBtYXJrZXIucG9zaXRpb24oKS50b3AgKyAoQG1hcmtlci5vdXRlckhlaWdodCgpIC8gMilcbiAgICB4UGMgPSAoeFB4IC8gQGNvbnRhaW5lci53aWR0aCgpKSAqIDEwMFxuICAgIHlQYyA9ICh5UHggLyBAY29udGFpbmVyLmhlaWdodCgpKSAqIDEwMFxuICAgIFt4UGMsIHlQY11cblxuICAjID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09IEF0dHJpYnV0ZXNcblxuICAjIFRoZSBiYWNrZ3JvdW5kIGNvbG9yIG9mIHRoZSBtYXJrZXJcbiAgI1xuICBjb2xvcjogPT5cbiAgICBAbWFya2VyLmNzcygnYmFja2dyb3VuZENvbG9yJylcblxuICAjIFJhbmRvbWx5LWdlbmVyYXRlZCBJRCBnaXZlbiBieSBwbGFuaXQgd2hlbiB0aGUgbWFya2VyIGlzXG4gICMgYWRkZWQgdG8gdGhlIHBsYW4uXG4gICNcbiAgcGxhbml0SUQ6ID0+XG4gICAgQG1hcmtlci5hdHRyKCdkYXRhLW1hcmtlcicpXG5cbiAgIyBUaGUgSUQgb2YgdGhlIG1hcmtlciwgd2hpY2ggd291bGQgaGF2ZSBiZWVuIGEgbWFudWFsXG4gICMgb3B0aW9uXG4gICNcbiAgaWQ6ID0+XG4gICAgQG1hcmtlci5hdHRyKCdkYXRhLWlkJylcblxuICAjIFdoZXRoZXIgb3Igbm90IHRoZSBtYXJrZXIgaXMgYWxsb3dlZCB0byBiZSBkcmFnZ2VkXG4gICNcbiAgaXNEcmFnZ2FibGU6ID0+XG4gICAgQG1hcmtlci5oYXNDbGFzcygnZHJhZ2dhYmxlJylcblxuICAjID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09IEluZm9ib3hcblxuICAjIFRoZSBqUXVlcnkgb2JqZWN0IHRoYXQgaXMgdGhlIG1hcmtlcnMgaW5mb2JveCAoaWYgdGhlXG4gICMgbWFya2VyIGhhcyBhbiBpbmZvYm94KVxuICAjXG4gIGluZm9ib3g6ID0+XG4gICAgaW5mb2JveCA9IEBjb250YWluZXIuZmluZChcIiMje0BtYXJrZXIuYXR0cignZGF0YS1pbmZvYm94Jyl9XCIpXG4gICAgaWYgaW5mb2JveC5sZW5ndGggPiAwIHRoZW4gaW5mb2JveCBlbHNlIG51bGxcblxuICAjIFRoZSBtYXJrdXAgd2l0aGluIHRoZSBpbmZvYm94LCBpZiB0aGUgbWFya2VyIGhhcyBhblxuICAjIGluZm9ib3hcbiAgI1xuICBpbmZvYm94SFRNTDogPT5cbiAgICBpZiBAaW5mb2JveCgpICYmIEBpbmZvYm94KCkubGVuZ3RoID4gMCB0aGVuIEBpbmZvYm94KCkuaHRtbCgpIGVsc2UgbnVsbFxuXG4gICMgV2hldGhlciB0aGUgaW5mb2JveCBpcyBiZWluZyBkaXNwbGF5ZWQuXG4gICNcbiAgaW5mb2JveFZpc2libGU6ID0+XG4gICAgQGluZm9ib3goKSAmJiBAaW5mb2JveCgpLmhhc0NsYXNzKCdhY3RpdmUnKVxuXG4gICMgSGlkZXMgdGhlIGluZm9ib3ggaWYgaXQgaXMgdmlzaWJsZS5cbiAgI1xuICBoaWRlSW5mb2JveDogPT5cbiAgICBpZiBAaW5mb2JveFZpc2libGUoKVxuICAgICAgQGluZm9ib3goKS5hZGRDbGFzcygnaGlkZGVuJylcbiAgICAgIHRydWVcbiAgICBlbHNlXG4gICAgICBmYWxzZVxuXG4gICMgU2hvd3MgdGhlIGluZm9ib3ggaWYgaXQgaXMgaGlkZGVuLlxuICAjXG4gIHNob3dJbmZvYm94OiA9PlxuICAgIGlmIEBpbmZvYm94KCkgJiYgIUBpbmZvYm94VmlzaWJsZSgpXG4gICAgICBAaW5mb2JveCgpLmFkZENsYXNzKCdhY3RpdmUnKVxuICAgICAgQHVuaGlkZUluZm9ib3goKVxuICAgICAgdHJ1ZVxuICAgIGVsc2VcbiAgICAgIGZhbHNlXG5cbiAgIyBTaW1pbGFyIHRvIHNob3dJbmZvYm94LCBidXQgbGVzcyBhZ3Jlc3NpdmUuIEl0IHRha2VzXG4gICMgYXdheSBpdHMgaGlkZGVuIGNsYXNzLCBpbnN0ZWFkIG9mIGFkZGluZyBhbiBhY3RpdmVcbiAgIyBjbGFzcy5cbiAgI1xuICB1bmhpZGVJbmZvYm94OiA9PlxuICAgIGlmIEBpbmZvYm94VmlzaWJsZSgpXG4gICAgICBAaW5mb2JveCgpLnJlbW92ZUNsYXNzKCdoaWRkZW4nKVxuICAgICAgdHJ1ZVxuICAgIGVsc2VcbiAgICAgIGZhbHNlXG5cbiAgIyBGaW5kIHRoZSBhcHByb3ByaWF0ZSBjb29yZGluYXRlcyBhdCB3aGljaCB0byBkaXNwbGF5IHRoZVxuICAjIGluZm9ib3gsIGJhc2VkIG9uIG9wdGlvbnMuXG4gICNcbiAgaW5mb2JveENvb3JkczogPT5cbiAgICBpbmZvYm94ID0gQGNvbnRhaW5lci5maW5kKFwiIyN7QG1hcmtlci5hdHRyKCdkYXRhLWluZm9ib3gnKX1cIilcbiAgICBtYXJrZXJDZW50ZXJYID0gKHBhcnNlRmxvYXQoQHJlbGF0aXZlUG9zaXRpb24oKVswXSAvIDEwMCkgKiBAY29udGFpbmVyLndpZHRoKCkpXG4gICAgbWFya2VyQ2VudGVyWSA9IChwYXJzZUZsb2F0KEByZWxhdGl2ZVBvc2l0aW9uKClbMV0gLyAxMDApICogQGNvbnRhaW5lci5oZWlnaHQoKSlcbiAgICBpV2lkdGggPSBpbmZvYm94Lm91dGVyV2lkdGgoKVxuICAgIGlIYWxmV2lkdGggPSBpV2lkdGggLyAyXG4gICAgaUhlaWdodCA9IGluZm9ib3gub3V0ZXJIZWlnaHQoKVxuICAgIGlIYWxmSGVpZ2h0ID0gaUhlaWdodCAvIDJcbiAgICBjV2lkdGggPSBAY29udGFpbmVyLndpZHRoKClcbiAgICBjSGVpZ2h0ID0gQGNvbnRhaW5lci5oZWlnaHQoKVxuICAgIG1XaWR0aCA9IEBtYXJrZXIub3V0ZXJXaWR0aCgpXG4gICAgbUhhbGZXaWR0aCA9IG1XaWR0aCAvIDJcbiAgICBtSGVpZ2h0ID0gQG1hcmtlci5vdXRlckhlaWdodCgpXG4gICAgbUhhbGZIZWlnaHQgPSBtSGVpZ2h0IC8gMlxuICAgIGJ1ZmZlciA9IDVcbiAgICBvZmZzZXRYID0gcGFyc2VJbnQoaW5mb2JveC5hdHRyKCdkYXRhLW9mZnNldC14JykpXG4gICAgb2Zmc2V0WCA9IDAgdW5sZXNzIG9mZnNldFhcbiAgICBvZmZzZXRZID0gcGFyc2VJbnQoaW5mb2JveC5hdHRyKCdkYXRhLW9mZnNldC15JykpXG4gICAgb2Zmc2V0WSA9IDAgdW5sZXNzIG9mZnNldFlcbiAgICBzd2l0Y2ggaW5mb2JveC5hdHRyKCdkYXRhLXBvc2l0aW9uJylcbiAgICAgIHdoZW4gJ3RvcCdcbiAgICAgICAgaW5mb0xlZnQgPSBtYXJrZXJDZW50ZXJYIC0gaUhhbGZXaWR0aFxuICAgICAgICBpbmZvVG9wID0gbWFya2VyQ2VudGVyWSAtIGlIZWlnaHQgLSBtSGFsZkhlaWdodCAtIGJ1ZmZlclxuICAgICAgd2hlbiAncmlnaHQnXG4gICAgICAgIGluZm9MZWZ0ID0gbWFya2VyQ2VudGVyWCArIG1IYWxmV2lkdGggKyBidWZmZXJcbiAgICAgICAgaW5mb1RvcCA9IG1hcmtlckNlbnRlclkgLSBpSGFsZkhlaWdodFxuICAgICAgd2hlbiAnYm90dG9tJ1xuICAgICAgICBpbmZvTGVmdCA9IG1hcmtlckNlbnRlclggLSBpSGFsZldpZHRoXG4gICAgICAgIGluZm9Ub3AgPSBtYXJrZXJDZW50ZXJZICsgbUhhbGZIZWlnaHQgKyBidWZmZXJcbiAgICAgIHdoZW4gJ2xlZnQnXG4gICAgICAgIGluZm9MZWZ0ID0gbWFya2VyQ2VudGVyWCAtIGlXaWR0aCAtIG1IYWxmV2lkdGggLSBidWZmZXJcbiAgICAgICAgaW5mb1RvcCA9IG1hcmtlckNlbnRlclkgLSBpSGFsZkhlaWdodFxuICAgICAgd2hlbiAndG9wLWxlZnQnXG4gICAgICAgIGluZm9MZWZ0ID0gbWFya2VyQ2VudGVyWCAtIGlXaWR0aCAtIG1IYWxmV2lkdGggKyBidWZmZXJcbiAgICAgICAgaW5mb1RvcCA9IG1hcmtlckNlbnRlclkgLSBpSGVpZ2h0IC0gbUhhbGZIZWlnaHQgKyBidWZmZXJcbiAgICAgIHdoZW4gJ3RvcC1yaWdodCdcbiAgICAgICAgaW5mb0xlZnQgPSBtYXJrZXJDZW50ZXJYICsgbUhhbGZXaWR0aCAtIGJ1ZmZlclxuICAgICAgICBpbmZvVG9wID0gbWFya2VyQ2VudGVyWSAtIGlIZWlnaHQgLSBtSGFsZkhlaWdodCArIGJ1ZmZlclxuICAgICAgd2hlbiAnYm90dG9tLWxlZnQnXG4gICAgICAgIGluZm9MZWZ0ID0gbWFya2VyQ2VudGVyWCAtIGlXaWR0aCAtIG1IYWxmV2lkdGggKyBidWZmZXJcbiAgICAgICAgaW5mb1RvcCA9IG1hcmtlckNlbnRlclkgKyBtSGFsZkhlaWdodCAtIGJ1ZmZlclxuICAgICAgd2hlbiAnYm90dG9tLXJpZ2h0J1xuICAgICAgICBpbmZvTGVmdCA9IG1hcmtlckNlbnRlclggKyBtSGFsZldpZHRoIC0gYnVmZmVyXG4gICAgICAgIGluZm9Ub3AgPSBtYXJrZXJDZW50ZXJZICsgbUhhbGZIZWlnaHQgLSBidWZmZXJcbiAgICBsZWZ0OiBpbmZvTGVmdCArIG9mZnNldFhcbiAgICB0b3A6IGluZm9Ub3AgKyBvZmZzZXRZXG5cbiAgIyBQbGFjZXMgdGhlIGluZm9ib3ggaW4gdGhlIGNvcnJlY3QgcG9zaXRpb24uXG4gICNcbiAgcG9zaXRpb25JbmZvYm94OiA9PlxuICAgIGNvb3JkcyA9IEBpbmZvYm94Q29vcmRzKClcbiAgICBAY29udGFpbmVyLmZpbmQoXCIjI3tAbWFya2VyLmF0dHIoJ2RhdGEtaW5mb2JveCcpfVwiKS5jc3NcbiAgICAgIGxlZnQ6IFwiI3tjb29yZHMubGVmdH1weFwiXG4gICAgICB0b3A6IFwiI3tjb29yZHMudG9wfXB4XCJcbiAgICBAcG9zaXRpb24oKVxuXG4gICMgQW5pbWF0ZXMgdGhlIGluZm9ib3ggZnJvbSBpdHMgY3VycmVudCBwb3NpdGlvbiB0byBpdHNcbiAgIyBuZXcgcG9zaXRpb24uXG4gICNcbiAgYW5pbWF0ZUluZm9ib3g6ID0+XG4gICAgY29vcmRzID0gQGluZm9ib3hDb29yZHMoKVxuICAgIEBjb250YWluZXIuZmluZChcIiMje0BtYXJrZXIuYXR0cignZGF0YS1pbmZvYm94Jyl9XCIpLmFuaW1hdGVcbiAgICAgIGxlZnQ6IFwiI3tjb29yZHMubGVmdH1weFwiXG4gICAgICB0b3A6IFwiI3tjb29yZHMudG9wfXB4XCJcbiAgICAsIDI1MCwgKCkgPT5cbiAgICAgIHJldHVybiBAcG9zaXRpb24oKVxuXG4gICMgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0gQWN0aW9uc1xuXG4gICMgcG9zaXRpb25zIHRoZSBtYXJrZXIgYW5kIGluZm9ib3ggYmFzZWQgb24gaXRzIGRhdGFcbiAgIyBhdHRyaWJ1dGVzXG4gICNcbiAgc2V0OiA9PlxuICAgIGlmIEBpbWFnZVxuICAgICAgbGVmdCA9IChAaW1hZ2Uud2lkdGgoKSAqIChAbWFya2VyLmF0dHIoJ2RhdGEteFBjJykgLyAxMDApKSArXG4gICAgICAgIHBhcnNlRmxvYXQoQGltYWdlLmNzcygnbGVmdCcpKSAtIChAbWFya2VyLm91dGVyV2lkdGgoKSAvIDIpXG4gICAgICB0b3AgPSAoQGltYWdlLmhlaWdodCgpICogKEBtYXJrZXIuYXR0cignZGF0YS15UGMnKSAvIDEwMCkpICtcbiAgICAgICAgcGFyc2VGbG9hdChAaW1hZ2UuY3NzKCd0b3AnKSkgLSAoQG1hcmtlci5vdXRlckhlaWdodCgpIC8gMilcbiAgICBlbHNlXG4gICAgICBsZWZ0ID0gKEBjb250YWluZXIud2lkdGgoKSAqIChAbWFya2VyLmF0dHIoJ2RhdGEteFBjJykgLyAxMDApKSAtXG4gICAgICAgIChAbWFya2VyLm91dGVyV2lkdGgoKSAvIDIpXG4gICAgICB0b3AgPSAoQGNvbnRhaW5lci5oZWlnaHQoKSAqIChAbWFya2VyLmF0dHIoJ2RhdGEteVBjJykgLyAxMDApKSAtIFxuICAgICAgICAoQG1hcmtlci5vdXRlckhlaWdodCgpIC8gMilcbiAgICBAbWFya2VyLmNzc1xuICAgICAgbGVmdDogXCIje2xlZnR9cHhcIlxuICAgICAgdG9wOiBcIiN7dG9wfXB4XCJcbiAgICBAcG9zaXRpb25JbmZvYm94KClcbiAgICBbbGVmdCwgdG9wXVxuXG4gICMgVXBkYXRlcyB0aGUgbWFya2VyJ3MgZGF0YSBhdHRyaWJ1dGVzIHdpdGggaXRzIG5ld1xuICAjIHBvc2l0aW9uLlxuICAjXG4gIHNhdmVQb3NpdGlvbjogPT5cbiAgICBjb29yZHMgPSBAcG9zaXRpb24oKVxuICAgIEBtYXJrZXIuYXR0clxuICAgICAgJ2RhdGEteFBjJzogY29vcmRzWzBdXG4gICAgICAnZGF0YS15UGMnOiBjb29yZHNbMV1cbiAgICBjb29yZHNcblxuICAjIEFsbG93cyB5b3UgdG8gY2hhbmdlIHRoZSBhdHRyaWJ1dGVzIG9mIHRoZSBtYXJrZXIgb24gdGhlXG4gICMgZmx5LlxuICAjXG4gIHVwZGF0ZTogKG9wdGlvbnMpID0+XG4gICAgaWYgb3B0aW9ucy5jb2xvclxuICAgICAgQG1hcmtlci5jc3MoYmFja2dyb3VuZENvbG9yOiBvcHRpb25zLmNvbG9yKVxuICAgIGlmIG9wdGlvbnMuaW5mb2JveFxuICAgICAgQG1hcmtlci5maW5kKFwiLiN7UGxhbml0LmluZm9ib3hDbGFzc31cIikuaHRtbChvcHRpb25zLmluZm9ib3gpXG4gICAgICBAcG9zaXRpb25JbmZvYm94KClcbiAgICBpZiBvcHRpb25zLmRyYWdnYWJsZVxuICAgICAgQG1hcmtlci5yZW1vdmVDbGFzcygnZHJhZ2dhYmxlJylcbiAgICAgIEBtYXJrZXIuYWRkQ2xhc3MoJ2RyYWdnYWJsZScpIGlmIG9wdGlvbnMuZHJhZ2dhYmxlID09IHRydWVcbiAgICBpZiBvcHRpb25zLmNvb3Jkc1xuICAgICAgbGVmdCA9ICgocGFyc2VGbG9hdChvcHRpb25zLmNvb3Jkc1swXSkgLyAxMDApICogQGNvbnRhaW5lci53aWR0aCgpKSAtIDE1XG4gICAgICB0b3AgPSAoKHBhcnNlRmxvYXQob3B0aW9ucy5jb29yZHNbMV0pIC8gMTAwKSAqIEBjb250YWluZXIuaGVpZ2h0KCkpIC0gMTVcbiAgICAgIEBtYXJrZXIuY3NzXG4gICAgICAgIGxlZnQ6IFwiI3tsZWZ0fXB4XCJcbiAgICAgICAgdG9wOiBcIiN7dG9wfXB4XCJcbiAgICB0cnVlXG5cbiAgIyBSZW1vdmVzIHRoZSBtYXJrZXIgZnJvbSB0aGUgcGxhbi5cbiAgI1xuICByZW1vdmU6ID0+XG4gICAgQGluZm9ib3goKS5yZW1vdmUoKSBpZiBAaW5mb2JveCgpXG4gICAgQG1hcmtlci5yZW1vdmUoKVxuICAgIHRydWVcblxuIyBhdHRhY2hlcyB0aGUgUGxhbml0IGNsYXNzIHRvIGEgZ2xvYmFsIHBsYW5pdCB2YXJpYWJsZVxud2luZG93LnBsYW5pdCA9IG5ldyBQbGFuaXRcbiJdfQ==