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
  var animateBackground, animateMarkers, containerHeight, containerWidth, imgHeight, imgHeightClickIncrement, imgOffsetLeft, imgOffsetTop, imgWidth, imgWidthClickIncrement, initCanvasMarkers, initContainer, initEvents, initImage, initMarkers, initMethods, initOptions, initZoomControls, initZoomable, positionInfoboxes, setBackground, setMarkers, zDblClick, zMouseDown, zMouseMove, zMouseUp;

  function Plan(options1) {
    var j, len, method, ref;
    this.options = options1 != null ? options1 : {};
    this.canvasClick = bind(this.canvasClick, this);
    this.markerClick = bind(this.markerClick, this);
    this.markerDragEnd = bind(this.markerDragEnd, this);
    this.mousemove = bind(this.mousemove, this);
    this.mouseup = bind(this.mouseup, this);
    this.getEventPosition = bind(this.getEventPosition, this);
    this.draggingMarker = bind(this.draggingMarker, this);
    this.markers = bind(this.markers, this);
    this.zoomOut = bind(this.zoomOut, this);
    this.zoomIn = bind(this.zoomIn, this);
    this.getEventContainerPosition = bind(this.getEventContainerPosition, this);
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
    $(document).on('mousemove', this.mousemove);
    return $(document).on('mouseup', this.mouseup);
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

  Plan.prototype.getEventContainerPosition = function(e) {
    return {
      left: (e.pageX - this.container.offset().left) / this.calc(containerWidth),
      top: (e.pageY - this.container.offset().top) / this.calc(containerHeight)
    };
  };

  zDblClick = function(e) {
    var click;
    if ($(e.target).attr('data-zoom-id') === this.zoomId) {
      click = this.getEventContainerPosition(e);
      return this.zoomIn('click', click.left, click.top);
    }
  };

  zMouseDown = function(e) {
    var coords;
    if ($(e.target).attr('data-zoom-id') === this.zoomId && e.which === 1) {
      this.isDragging = true;
      coords = this.getEventContainerPosition(e);
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
      coords = this.getEventContainerPosition(e);
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

  Plan.prototype.markers = function() {
    return this.markersContainer.find("." + Planit.markerClass);
  };

  Plan.prototype.draggingMarker = function() {
    return this.markersContainer.find("." + Planit.markerClass + "." + Planit.draggingClass);
  };

  Plan.prototype.getEventPosition = function(e) {
    var hCont, hImg, wCont, wImg, xImg, xPc, xPx, yImg, yPc, yPx;
    wCont = parseFloat(this.markersContainer.width());
    hCont = parseFloat(this.markersContainer.height());
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
      xPc = (e.pageX - this.container.offset().left) / wCont;
      yPc = (e.pageY - this.container.offset().top) / hCont;
    }
    return [xPc, yPc];
  };

  Plan.prototype.mouseup = function(e) {
    var m, marker;
    marker = this.markersContainer.find("." + Planit.draggingClass).first();
    if (this.draggingMarker().length > 0) {
      m = new Planit.Marker(this.container, marker.attr('data-marker'));
      this.options.markerDragEnd(e, m);
      m.savePosition();
      m.positionInfobox();
      this.draggingMarker().removeClass(Planit.draggingClass);
    }
    if ($(e.target).hasClass(Planit.markerContainerClass)) {
      this.options.canvasClick(e, this.getEventPosition(e));
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

  Plan.prototype.mousemove = function(e) {
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

  Plan.prototype.markerDragEnd = function(event, marker) {
    if (this.options.markerDragEnd) {
      return this.options.markerDragEnd(event, marker);
    }
  };

  Plan.prototype.markerClick = function(event, marker) {
    if (this.options.markerClick) {
      return this.options.markerClick(event, marker);
    }
  };

  Plan.prototype.canvasClick = function(event, coords) {
    if (this.options.canvasClick) {
      return this.options.canvasClick(event, coords);
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

//# sourceMappingURL=data:application/json;base64,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QUEsSUFBdUIsSUFBQyxDQUFBLE9BQUQsQ0FBQSxDQUF2QjtBQUFBLE1BQUEsSUFBQyxDQUFBLE9BQUQsQ0FBQSxDQUFVLENBQUMsTUFBWCxDQUFBLENBQUEsQ0FBQTtLQUFBO1dBQ0EsSUFBQyxDQUFBLE1BQU0sQ0FBQyxNQUFSLENBQUEsRUFGTTtFQUFBLENBMVBSLENBQUE7O2dCQUFBOztJQWhrQkYsQ0FBQTs7QUFBQSxNQSt6Qk0sQ0FBQyxNQUFQLEdBQWdCLEdBQUEsQ0FBQSxNQS96QmhCLENBQUEiLCJmaWxlIjoicGxhbml0LXRtcC5qcyIsInNvdXJjZVJvb3QiOiIvc291cmNlLyIsInNvdXJjZXNDb250ZW50IjpbImNsYXNzIFBsYW5pdFxuXG4gICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIERPTSBSZWZlcmVuY2VzXG5cbiAgQGNvbnRhaW5lckNsYXNzOiAgICAgICAgJ3BsYW5pdC1jb250YWluZXInXG4gIEBkcmFnZ2luZ0NsYXNzOiAgICAgICAgICdpcy1kcmFnZ2luZydcbiAgQGltYWdlQ29udGFpbmVyOiAgICAgICAgJ3BsYW5pdC1pbWFnZS1jb250YWluZXInXG4gIEBpbmZvYm94Q2xhc3M6ICAgICAgICAgICdwbGFuaXQtaW5mb2JveCdcbiAgQGluZm9ib3hDb250YWluZXJDbGFzczogJ3BsYW5pdC1pbmZvYm94LWNvbnRhaW5lcidcbiAgQG1hcmtlckNsYXNzOiAgICAgICAgICAgJ3BsYW5pdC1tYXJrZXInXG4gIEBtYXJrZXJDb250YWluZXJDbGFzczogICdwbGFuaXQtbWFya2Vycy1jb250YWluZXInXG4gIEBtYXJrZXJDb250ZW50Q2xhc3M6ICAgICdwbGFuaXQtbWFya2VyLWNvbnRlbnQnXG5cbiAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gSW5zdGFudGlhdGlvblxuXG4gIG5ldzogKEBvcHRpb25zID0ge30pIC0+XG4gICAgcmV0dXJuIG5ldyBQbGFuaXQuUGxhbihAb3B0aW9ucylcblxuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBHbG9iYWwgSGVscGVyc1xuXG4gIEByYW5kb21TdHJpbmc6IChsZW5ndGggPSAxNikgLT5cbiAgICBzdHIgPSBNYXRoLnJhbmRvbSgpLnRvU3RyaW5nKDM2KS5zbGljZSgyKVxuICAgIHN0ciA9IHN0ciArIE1hdGgucmFuZG9tKCkudG9TdHJpbmcoMzYpLnNsaWNlKDIpXG4gICAgc3RyLnN1YnN0cmluZygwLCBsZW5ndGggLSAxKVxuXG5jbGFzcyBQbGFuaXQuUGxhblxuXG4gICMgVGhpcyBjYWxscyBtZXRob2RzIHRvIGluc3RhbnRpYXRlIGEgbmV3IHBsYW4uIEZvdW5kIGluXG4gICMgcGxhbi9pbml0LmNvZmZlZVxuICAjXG4gIGNvbnN0cnVjdG9yOiAoQG9wdGlvbnMgPSB7fSkgLT5cbiAgICBtZXRob2QuY2FsbChAKSBmb3IgbWV0aG9kIGluIGluaXRNZXRob2RzKClcblxuICAjIChwcml2YXRlKSBNZXRob2RzIChpbiBvcmRlcikgbmVlZGVkIHRvIGluc3RhbnRpYXRlIHRoaXNcbiAgIyBvYmplY3RcbiAgI1xuICBpbml0TWV0aG9kcyA9IC0+XG4gICAgW2luaXRPcHRpb25zLCBpbml0Q29udGFpbmVyLCBpbml0SW1hZ2UsIGluaXRDYW52YXNNYXJrZXJzLCBpbml0RXZlbnRzXVxuXG5cbiAgIyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PSBPcHRpb25zXG5cbiAgIyAocHJpdmF0ZSkgQWRkIGRlZmF1bHQgb3B0aW9ucyBpZiB0aGUgbmVjZXNzYXJ5IG9wdGlvbnNcbiAgIyBhcmUgbWlzc2luZ1xuICAjXG4gIGluaXRPcHRpb25zID0gLT5cbiAgICBpZiBAb3B0aW9ucy5jb250YWluZXJcbiAgICAgIEBvcHRpb25zLmNvbnRhaW5lciA9ICQoXCIjI3tAb3B0aW9ucy5jb250YWluZXJ9XCIpXG4gICAgZWxzZVxuICAgICAgQG9wdGlvbnMuY29udGFpbmVyID0gJCgnI3BsYW5pdCcpXG4gICAgIyBkaXJlY3QgYWNjZXNzIHRvIHBsYW5pdCBjb250YWluZXJcbiAgICBAY29udGFpbmVyID0gQG9wdGlvbnMuY29udGFpbmVyXG5cbiAgIyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PSBDb250YWluZXJcblxuICAjIChwcml2YXRlKSBEcmF3IHRoZSBjb250YWluZXIgYW5kIHRoZSBzdWJjb250YWluZXJzXG4gICNcbiAgaW5pdENvbnRhaW5lciA9IC0+XG4gICAgQGNvbnRhaW5lci5hZGRDbGFzcyhQbGFuaXQuY29udGFpbmVyQ2xhc3MpXG4gICAgQGNvbnRhaW5lci5hcHBlbmQgXCJcIlwiXG4gICAgICA8ZGl2IGNsYXNzPVwiI3tQbGFuaXQuaW5mb2JveENvbnRhaW5lckNsYXNzfVwiPjwvZGl2PlxuICAgICAgPGRpdiBjbGFzcz1cIiN7UGxhbml0Lm1hcmtlckNvbnRhaW5lckNsYXNzfVwiPjwvZGl2PlxuICAgICAgICBcIlwiXCJcbiAgICBAbWFya2Vyc0NvbnRhaW5lciA9IEBjb250YWluZXIuZmluZChcIi4je1BsYW5pdC5tYXJrZXJDb250YWluZXJDbGFzc31cIilcbiAgICAgIC5maXJzdCgpICMgZGlyZWN0IGFjY2VzcyB0byBtYXJrZXJzIGNvbnRhaW5lclxuXG4gICMgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0gQmFja2dyb3VuZCBJbWFnZVxuXG4gICMgKHByaXZhdGUpIENyZWF0ZSBpbWFnZSBjb250YWluZXIgYW5kIGFkZCBpbWFnZSBpZlxuICAjIG5lY2Vzc2FyeVxuICAjXG4gIGluaXRJbWFnZSA9IC0+XG4gICAgaWYgQG9wdGlvbnMuaW1hZ2UgJiYgQG9wdGlvbnMuaW1hZ2UudXJsXG4gICAgICBAY29udGFpbmVyLnByZXBlbmQgXCJcIlwiXG4gICAgICAgIDxkaXYgY2xhc3M9XCIje1BsYW5pdC5pbWFnZUNvbnRhaW5lcn1cIj5cbiAgICAgICAgICA8aW1nIHNyYz1cIiN7QG9wdGlvbnMuaW1hZ2UudXJsfVwiPlxuICAgICAgICA8L2Rpdj5cbiAgICAgIFwiXCJcIlxuICAgICAgQGltYWdlID0gQGNvbnRhaW5lci5maW5kKCdpbWcnKS5maXJzdCgpXG4gICAgICBAaW1hZ2UubG9hZCAoKSA9PlxuICAgICAgICBAY29udGFpbmVyLmNzcyhoZWlnaHQ6IEBpbWFnZS5oZWlnaHQoKSlcbiAgICAgICAgaW5pdFpvb21hYmxlLmNhbGwoQClcbiAgICAgICAgaW5pdE1hcmtlcnMuY2FsbChAKVxuXG4gICMgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0gWm9vbWluZ1xuXG4gICMgKHByaXZhdGUpIFNldHMgb3VyIHJlZmVyZW5jZXMgZm9yIHdvcmtpbmcgd2l0aCB6b29tLCBhbmRcbiAgIyBjb250cm9scyB3aGV0aGVyIG9yIG5vdCB0byBhZGQgY29udHJvbHNcbiAgI1xuICBpbml0Wm9vbWFibGUgPSAtPlxuICAgICMgYWRkIHpvb20gSUQgdG8gbWFya2VycyBjb250YWluZXJcbiAgICBAem9vbUlkID0gUGxhbml0LnJhbmRvbVN0cmluZygpXG4gICAgQG1hcmtlcnNDb250YWluZXIuYXR0cignZGF0YS16b29tLWlkJywgQHpvb21JZClcbiAgICAjIHNldCBpbml0aWFsIGJhY2tncm91bmQgY29vcmRpbmF0ZXNcbiAgICBAcmVzZXRJbWFnZSgpXG4gICAgIyBhZGQgem9vbSBjb250cm9scyBpZiBuZWNlc3NhcnlcbiAgICBpbml0Wm9vbUNvbnRyb2xzLmNhbGwoQCkgaWYgQG9wdGlvbnMuaW1hZ2Uuem9vbVxuXG4gICMgKHByaXZhdGUpIFJlbmRlciB0aGUgem9vbSBjb250cm9scyBhbmQgYmluZHMgbmVjZXNzYXJ5XG4gICMgZXZlbnRzXG4gICNcbiAgaW5pdFpvb21Db250cm9scyA9IC0+XG4gICAgIyBkcmF3IHRoZSBjb250cm9scyBkaW5rdXNcbiAgICBAY29udGFpbmVyLnByZXBlbmQgXCJcIlwiXG4gICAgICA8ZGl2IGNsYXNzPVwicGxhbml0LWNvbnRyb2xzXCI+XG4gICAgICAgIDxhIGhyZWY9XCIjXCIgY2xhc3M9XCJ6b29tXCIgZGF0YS1hY3Rpb249XCJpblwiPis8L2E+XG4gICAgICAgIDxhIGhyZWY9XCIjXCIgY2xhc3M9XCJ6b29tXCIgZGF0YS1hY3Rpb249XCJvdXRcIj4tPC9hPlxuICAgICAgPC9kaXY+XG4gICAgXCJcIlwiXG4gICAgQGNvbnRhaW5lci5maW5kKFwiLnpvb21bZGF0YS1hY3Rpb249J2luJ11cIikuY2xpY2sgKGUpID0+XG4gICAgICBlLnByZXZlbnREZWZhdWx0KClcbiAgICAgIEB6b29tSW4oKVxuICAgIEBjb250YWluZXIuZmluZChcIi56b29tW2RhdGEtYWN0aW9uPSdvdXQnXVwiKS5jbGljayAoZSkgPT5cbiAgICAgIGUucHJldmVudERlZmF1bHQoKVxuICAgICAgQHpvb21PdXQoKVxuICAgICMgYmluZCBkcmFnZ2FibGUgZXZlbnRzXG4gICAgQGNvbnRhaW5lci5vbiAgICdkYmxjbGljaycsIChlKSA9PlxuICAgICAgekRibENsaWNrLmNhbGwoQCwgZSlcbiAgICBAY29udGFpbmVyLm9uICAgJ21vdXNlZG93bicsIChlKSA9PlxuICAgICAgek1vdXNlRG93bi5jYWxsKEAsIGUpXG4gICAgJChkb2N1bWVudCkub24gICdtb3VzZW1vdmUnLCAoZSkgPT5cbiAgICAgIHpNb3VzZU1vdmUuY2FsbChALCBlKVxuICAgICQoZG9jdW1lbnQpLm9uICAnbW91c2V1cCcsIChlKSA9PlxuICAgICAgek1vdXNlVXAuY2FsbChALCBlKVxuXG4gICMgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0gTWFya2Vyc1xuXG4gICMgKHByaXZhdGUpIFdpbGwgY2FsbCBpbml0TWFya2VycyBpZiB0aGVyZSBpcyBubyBpbWFnZSxcbiAgIyBvdGhlcndpc2UgaXQncyBjYWxsZWQgZnJvbSBpbml0SW1hZ2UsIHdoaWNoIHdhaXRzIGZvclxuICAjIHRoZSBpbWFnZSB0byBiZSBsb2FkZWQuXG4gICNcbiAgaW5pdENhbnZhc01hcmtlcnMgPSAtPlxuICAgIGluaXRNYXJrZXJzLmNhbGwoQCkgdW5sZXNzIEBvcHRpb25zLmltYWdlICYmIEBvcHRpb25zLmltYWdlLnVybFxuXG4gICMgSW50ZXJ2YWwgbWV0aG9kIHRoYXQgY29udGludWVzIHRvIGNoZWNrIGZvciBpbWFnZSBiZWluZ1xuICAjIGxvYWRlZCBiZWZvcmUgYWRkaW5nIG1hcmtlcnMgdG8gdGhlIHBsYW5cbiAgI1xuICBpbml0TWFya2VycyA9IC0+XG4gICAgaWYgQG9wdGlvbnMubWFya2VycyAmJiBAb3B0aW9ucy5tYXJrZXJzLmxlbmd0aCA+IDBcbiAgICAgIGZvciBtYXJrZXIgaW4gQG9wdGlvbnMubWFya2Vyc1xuICAgICAgICBtYXJrZXIuY29udGFpbmVyID0gQGNvbnRhaW5lclxuICAgICAgICBQbGFuaXQuTWFya2VyLmNyZWF0ZShtYXJrZXIpXG5cbiAgIyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PSBQbGFuIEV2ZW50c1xuXG4gICMgKHByaXZhdGUpIEJpbmQgZXZlbnRzIHRvIHRoZSBwbGFuLiBUaGVzZSBldmVudHMgZGVhbFxuICAjIG1vc3RseSB3aXRoIG1hcmtlcnMsIHNpbmNlIHNvbWUgZXZlbnQgc2hvdWxkIGJlIGF0dGFjaGVkXG4gICMgdG8gdGhlIHBsYW4gYW5kIGxhdGVyIGZpbmQgdGhlIGFwcHJvcHJpYXRlIG1hcmtlclxuICAjXG4gIGluaXRFdmVudHMgPSAtPlxuICAgIGlmIEBjb250YWluZXIuZmluZChcIi4je1BsYW5pdC5pbWFnZUNvbnRhaW5lcn0gPiBpbWdcIikubGVuZ3RoID4gMFxuICAgICAgQGltYWdlID0gQGNvbnRhaW5lci5maW5kKFwiLiN7UGxhbml0LmltYWdlQ29udGFpbmVyfSA+IGltZ1wiKS5maXJzdCgpXG4gICAgJChkb2N1bWVudCkub24oJ21vdXNlbW92ZScsIEBtb3VzZW1vdmUpXG4gICAgJChkb2N1bWVudCkub24oJ21vdXNldXAnLCBAbW91c2V1cClcblxuXG4gICMgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0gU2V0dGluZyBJbWFnZVxuXG4gICMgWm9vbWEgdGhlIGltYWdlIG91dCBhbGwgdGhlIHdheSBhbmQgc2V0cyB0aGUgbWFya2Vyc1xuICAjIGFwcHJvcHJpYXRlbHlcbiAgI1xuICByZXNldEltYWdlOiA9PlxuICAgIEBpbWFnZVBvc2l0aW9uID1cbiAgICAgIGxlZnRQeDogICAgICAgICAwXG4gICAgICB0b3BQeDogICAgICAgICAgMFxuICAgICAgd2lkdGg6ICAgICAgICAgIEBpbWFnZS53aWR0aCgpXG4gICAgICBoZWlnaHQ6ICAgICAgICAgQGltYWdlLmhlaWdodCgpXG4gICAgICBzY2FsZTogICAgICAgICAgMVxuICAgICAgaW5jcmVtZW50OiAgICAgIDAuNVxuICAgIHNldEJhY2tncm91bmQuY2FsbChAKVxuXG4gICMgKHByaXZhdGUpIE1vdmVzIHRoZSBiYWNrZ3JvdW5kIGFuZCBtYXJrZXJzIHdpdGhvdXRcbiAgIyBhbmltYXRpb24gdG8gdGhlIGxvY2F0aW9uIHNldCBieSB0aGUgaW1hZ2VQb3NpdGlvblxuICAjIHByb3BlcnR5XG4gICNcbiAgc2V0QmFja2dyb3VuZCA9IC0+XG4gICAgQGltYWdlLmNzc1xuICAgICAgbGVmdDogXCIje0BpbWFnZVBvc2l0aW9uLmxlZnRQeH1weFwiXG4gICAgICB0b3A6IFwiI3tAaW1hZ2VQb3NpdGlvbi50b3BQeH1weFwiXG4gICAgICB3aWR0aDogXCIje0BpbWFnZVBvc2l0aW9uLnNjYWxlICogMTAwLjB9JVwiXG4gICAgICBoZWlnaHQ6ICdhdXRvJ1xuICAgIHNldE1hcmtlcnMuY2FsbChAKVxuXG4gICMgKHByaXZhdGUpIEVxdWl2YWxlbnQgdG8gc2V0QmFja2dyb3VuZCwgYnV0IHdpdGhcbiAgIyBhbmltYXRpb25cbiAgI1xuICBhbmltYXRlQmFja2dyb3VuZCA9IC0+XG4gICAgQGltYWdlLmFuaW1hdGVcbiAgICAgIGxlZnQ6IFwiI3tAaW1hZ2VQb3NpdGlvbi5sZWZ0UHh9cHhcIlxuICAgICAgdG9wOiBcIiN7QGltYWdlUG9zaXRpb24udG9wUHh9cHhcIlxuICAgICAgd2lkdGg6IFwiI3tAaW1hZ2VQb3NpdGlvbi5zY2FsZSAqIDEwMC4wfSVcIlxuICAgICAgaGVpZ2h0OiAnYXV0bydcbiAgICAsIDI1MFxuICAgIGFuaW1hdGVNYXJrZXJzLmNhbGwoQClcblxuICAjID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09IFNldHRpbmcgTWFya2Vyc1xuXG4gICMgKHByaXZhdGUpIFNldHMgbWFya2VycyBpbiBjb3JyZWN0IGxvY2F0aW9uLCBiYXNlZCBvblxuICAjIGltYWdlIHBvc2l0aW9uXG4gICNcbiAgc2V0TWFya2VycyA9IC0+XG4gICAgbWFya2VycyA9IEBjb250YWluZXIuZmluZChcIi4je1BsYW5pdC5tYXJrZXJDbGFzc31cIilcbiAgICBpZiBtYXJrZXJzLmxlbmd0aCA+IDBcbiAgICAgIGZvciBtYXJrZXIgaW4gbWFya2Vyc1xuICAgICAgICBsZWZ0ID0gKEBjYWxjKGltZ1dpZHRoKSAqICgkKG1hcmtlcikuYXR0cignZGF0YS14UGMnKSAvIDEwMCkpICtcbiAgICAgICAgICBAaW1hZ2VQb3NpdGlvbi5sZWZ0UHggLSAoJChtYXJrZXIpLm91dGVyV2lkdGgoKSAvIDIpXG4gICAgICAgIHRvcCA9IChAY2FsYyhpbWdIZWlnaHQpICogKCQobWFya2VyKS5hdHRyKCdkYXRhLXlQYycpIC8gMTAwKSkgK1xuICAgICAgICAgIEBpbWFnZVBvc2l0aW9uLnRvcFB4IC0gKCQobWFya2VyKS5vdXRlckhlaWdodCgpIC8gMilcbiAgICAgICAgJChtYXJrZXIpLmNzc1xuICAgICAgICAgIGxlZnQ6IFwiI3tsZWZ0fXB4XCJcbiAgICAgICAgICB0b3A6IFwiI3t0b3B9cHhcIlxuICAgICAgcG9zaXRpb25JbmZvYm94ZXMuY2FsbChAKVxuXG4gICMgKHByaXZhdGUpIEVxdWl2YWxlbnQgdG8gc2V0TWFya2VycywgYnV0IHdpdGggYW5pbWF0aW9uXG4gICNcbiAgYW5pbWF0ZU1hcmtlcnMgPSAtPlxuICAgIG1hcmtlcnMgPSBAY29udGFpbmVyLmZpbmQoXCIuI3tQbGFuaXQubWFya2VyQ2xhc3N9XCIpXG4gICAgaWYgbWFya2Vycy5sZW5ndGggPiAwXG4gICAgICBmb3IgbWFya2VyIGluIG1hcmtlcnNcbiAgICAgICAgbSA9IG5ldyBQbGFuaXQuTWFya2VyKEBjb250YWluZXIsICQobWFya2VyKS5hdHRyKCdkYXRhLW1hcmtlcicpKVxuICAgICAgICBtLmhpZGVJbmZvYm94KClcbiAgICAgICAgbGVmdCA9IChAY2FsYyhpbWdXaWR0aCkgKiAoJChtYXJrZXIpLmF0dHIoJ2RhdGEteFBjJykgLyAxMDApKSArXG4gICAgICAgICAgQGltYWdlUG9zaXRpb24ubGVmdFB4IC0gKCQobWFya2VyKS5vdXRlcldpZHRoKCkgLyAyKVxuICAgICAgICB0b3AgPSAoQGNhbGMoaW1nSGVpZ2h0KSAqICgkKG1hcmtlcikuYXR0cignZGF0YS15UGMnKSAvIDEwMCkpICtcbiAgICAgICAgICBAaW1hZ2VQb3NpdGlvbi50b3BQeCAtICgkKG1hcmtlcikub3V0ZXJIZWlnaHQoKSAvIDIpXG4gICAgICAgIGRvIChtKSAtPlxuICAgICAgICAgICQobWFya2VyKS5hbmltYXRlXG4gICAgICAgICAgICBsZWZ0OiBcIiN7bGVmdH1weFwiXG4gICAgICAgICAgICB0b3A6IFwiI3t0b3B9cHhcIlxuICAgICAgICAgICwgMjUwLCAoKSA9PlxuICAgICAgICAgICAgbS5wb3NpdGlvbkluZm9ib3goKVxuICAgICAgICAgICAgbS51bmhpZGVJbmZvYm94KClcblxuICAjID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09IFNldHRpbmcgSW5mb2JveGVzXG5cbiAgIyAocHJpdmF0ZSkgQXBwcm9wcmlhdGVseSBwb3NpdGlvbiB0aGUgaW5mb2JveCBvbiBldmVyeVxuICAjIG1hcmtlciwgdGhlIGxvZ2ljIGZvciB3aGljaCBpcyBpbiB0aGUgTWFya2VyIGNsYXNzXG4gICNcbiAgcG9zaXRpb25JbmZvYm94ZXMgPSAtPlxuICAgIGZvciBtYXJrZXIgaW4gQGNvbnRhaW5lci5maW5kKFwiLiN7UGxhbml0Lm1hcmtlckNsYXNzfVwiKVxuICAgICAgbSA9IG5ldyBQbGFuaXQuTWFya2VyKEBjb250YWluZXIsICQobWFya2VyKS5hdHRyKCdkYXRhLW1hcmtlcicpKVxuICAgICAgbS5wb3NpdGlvbkluZm9ib3goKVxuICAgIHRydWVcblxuICAjID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09IE1vdmUgQWN0aW9uc1xuXG4gICMgV2lsbCBjZW50ZXIgdGhlIGltYWdlIG9uIHRoZSBnaXZlbiBjb29yZGluYXRlcyBhcyBbeCx5XVxuICAjIGluIGZsb2F0ZWQgcGVyY2VudGFnZXMuIEVuc3VyZXMgdGhlcmUgaXMgZW5vdWdoIGltYWdlIG9uXG4gICMgZWFjaCBzaWRlIGJ5IHpvb21pbmcgaW4gaWYgbmVjZXNzYXJ5LlxuICAjXG4gIGNlbnRlck9uOiAoY29vcmRzKSA9PlxuICAgIGlmIGNvb3Jkc1swXSA+PSA1MCB0aGVuIHggPSAxMDAgLSBjb29yZHNbMF0gZWxzZSB4ID0gY29vcmRzWzBdXG4gICAgaWYgY29vcmRzWzFdID49IDUwIHRoZW4geSA9IDEwMCAtIGNvb3Jkc1sxXSBlbHNlIHkgPSBjb29yZHNbMV1cbiAgICB3TWluID0gNTAgKiAoQGNhbGMoY29udGFpbmVyV2lkdGgpIC8geClcbiAgICBoTWluID0gNTAgKiAoQGNhbGMoY29udGFpbmVySGVpZ2h0KSAvIHkpXG4gICAgIyBoaWRlcyBvdGhlciBhY3RpdmUgaW5mb2JveGVzLCBidXQgd2lsbCBzdGlsbCBzaG93XG4gICAgIyB0aGlzIGluZm9ib3hcbiAgICBAY29udGFpbmVyLmZpbmQoXCIuI3tQbGFuaXQuaW5mb2JveENsYXNzfVwiKS5yZW1vdmVDbGFzcygnYWN0aXZlJylcbiAgICAjIEdldCBvdXIgaW5pdGlhbCBwb3NpdGlvblxuICAgIEBpbWFnZVBvc2l0aW9uLmxlZnRQeCA9IC0gKFxuICAgICAgKEBjYWxjKGltZ1dpZHRoKSAqIChjb29yZHNbMF0gLyAxMDApKSAtIChAY2FsYyhjb250YWluZXJXaWR0aCkgLyAyKVxuICAgIClcbiAgICBAaW1hZ2VQb3NpdGlvbi50b3BQeCA9IC0gKFxuICAgICAgKEBjYWxjKGltZ0hlaWdodCkgKiAoY29vcmRzWzFdIC8gMTAwKSkgLSAoQGNhbGMoY29udGFpbmVySGVpZ2h0KSAvIDIpXG4gICAgKVxuICAgICMga2VlcCB0aGVvcmV0aWNhbGx5IG1ha2luZyB0aGUgaW1hZ2UgYmlnZ2VyIHVudGlsIGl0IGlzXG4gICAgIyBsYXJnZSBlbm91Z2ggdG8gY2VudGVyIG9uIG91ciBwb2ludFxuICAgIHdoaWxlIChAY2FsYyhpbWdXaWR0aCkgPCB3TWluKSB8fCAoQGNhbGMoaW1nSGVpZ2h0KSA8IGhNaW4pXG4gICAgICBAaW1hZ2VQb3NpdGlvbi5zY2FsZSAgPSBAaW1hZ2VQb3NpdGlvbi5zY2FsZSArIEBpbWFnZVBvc2l0aW9uLmluY3JlbWVudFxuICAgICAgQGltYWdlUG9zaXRpb24ubGVmdFB4ID0gLSAoXG4gICAgICAgIChAY2FsYyhpbWdXaWR0aCkgKiAoY29vcmRzWzBdIC8gMTAwKSkgLSAoQGNhbGMoY29udGFpbmVyV2lkdGgpIC8gMilcbiAgICAgIClcbiAgICAgIEBpbWFnZVBvc2l0aW9uLnRvcFB4ID0gLSAoXG4gICAgICAgIChAY2FsYyhpbWdIZWlnaHQpICogKGNvb3Jkc1sxXSAvIDEwMCkpIC0gKEBjYWxjKGNvbnRhaW5lckhlaWdodCkgLyAyKVxuICAgICAgKVxuICAgIGFuaW1hdGVCYWNrZ3JvdW5kLmNhbGwoQClcbiAgICBjb29yZHNcblxuICAjIFpvb21zIHRoZSBpbWFnZSB0byBhIHNwZWNpZmljIFwibGV2ZWxcIiB3aGljaCBpcyBhblxuICAjIGluY3JlbWVudGVkIGludGVnZXIgc3RhcnRpbmcgYXQgemVyb1xuICAjXG4gIHpvb21UbzogKGxldmVsKSA9PlxuICAgIGkgPSBAaW1hZ2VQb3NpdGlvbi5pbmNyZW1lbnRcbiAgICB1bmxlc3MgKChsZXZlbCAqIGkpICsgMSkgPT0gQGltYWdlUG9zaXRpb24uc2NhbGVcbiAgICAgIEBpbWFnZVBvc2l0aW9uLnNjYWxlID0gKGxldmVsICogaSkgKyAxICsgaVxuICAgICAgQHpvb21PdXQoKVxuICAgIGxldmVsXG5cbiAgIyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PSBDYWxjdWxhdGlvbnNcblxuICAjIE1ldGhvZCBmb3IgYWNjZXNzaW5nIHRoZSBwcml2YXRlIGNhbGN1bGF0aW9uIG1ldGhvZHNcbiAgI1xuICBjYWxjOiAobWV0aG9kKSA9PlxuICAgIG1ldGhvZC5jYWxsKEApXG5cbiAgIyAocHJpdmF0ZSkgV2lkdGggb2YgdGhlIGltYWdlXG4gICNcbiAgaW1nV2lkdGggPSAtPlxuICAgIHBhcnNlRmxvYXQoQGltYWdlUG9zaXRpb24ud2lkdGggKiBAaW1hZ2VQb3NpdGlvbi5zY2FsZSlcblxuICAjIChwcml2YXRlKSBUaGUgbnVtYmVyIG9mIHBpeGVscyBhZGRlZCB3aXRoIGVhY2ggem9vbSBsZXZlbFxuICAjXG4gIGltZ1dpZHRoQ2xpY2tJbmNyZW1lbnQgPSAtPlxuICAgIHBhcnNlRmxvYXQoQGltYWdlUG9zaXRpb24ud2lkdGggKiBAaW1hZ2VQb3NpdGlvbi5pbmNyZW1lbnQpXG5cbiAgIyAocHJpdmF0ZSkgVGhlIHdpZHRoIG9mIHRoZSBjb250YWluZXJcbiAgI1xuICBjb250YWluZXJXaWR0aCA9IC0+XG4gICAgcGFyc2VGbG9hdChAbWFya2Vyc0NvbnRhaW5lci53aWR0aCgpKVxuXG4gICMgKHByaXZhdGUpIE51bWJlciBvZiBwaXhlbHMgbGVmdCBzaWRlIG9mIGltYWdlIGlzIGZyb21cbiAgIyBsZWZ0IHNpZGUgb2YgdGhlIGNvbnRhaW5lclxuICAjXG4gIGltZ09mZnNldExlZnQgPSAtPlxuICAgIE1hdGguYWJzKHBhcnNlRmxvYXQoQGltYWdlLmNzcygnbGVmdCcpKSlcblxuICAjIChwcml2YXRlKSBIZWlnaHQgb2YgdGhlIGltYWdlXG4gICNcbiAgaW1nSGVpZ2h0ID0gLT5cbiAgICBwYXJzZUZsb2F0KEBpbWFnZVBvc2l0aW9uLmhlaWdodCAqIEBpbWFnZVBvc2l0aW9uLnNjYWxlKVxuXG4gICMgKHByaXZhdGUpIFRoZSBudW1iZXIgb2YgcGl4ZWxzIGFkZGVkIG9yIHJlbW92ZWQgd2l0aFxuICAjIGVhY2ggem9vbSBsZXZlbFxuICAjXG4gIGltZ0hlaWdodENsaWNrSW5jcmVtZW50ID0gLT5cbiAgICBwYXJzZUZsb2F0KEBpbWFnZVBvc2l0aW9uLmhlaWdodCAqIEBpbWFnZVBvc2l0aW9uLmluY3JlbWVudClcblxuICAjIChwcml2YXRlKSBUaGUgaGVpZ2h0IG9mIHRoZSBjb250YWluZXIgKHBpeGVscylcbiAgI1xuICBjb250YWluZXJIZWlnaHQgPSAtPlxuICAgIHBhcnNlRmxvYXQoQG1hcmtlcnNDb250YWluZXIuaGVpZ2h0KCkpXG5cbiAgIyAocHJpdmF0ZSkgVGhlIG51bWJlciBvZiBwaXhlbHMgdGhlIHRvcCBvZiB0aGUgaW1hZ2UgaXNcbiAgIyBmcm9tIHRoZSB0b3Agb2YgdGhlIGNvbnRhaW5lclxuICAjXG4gIGltZ09mZnNldFRvcCA9IC0+XG4gICAgTWF0aC5hYnMocGFyc2VGbG9hdChAaW1hZ2UuY3NzKCd0b3AnKSkpXG5cbiAgIyBDb29yZGluYXRlcyBvZiBhbiBldmVudCBhcyBhIHBlcmNlbnRhZ2Ugb2YgdGhlXG4gICMgZGltZW5zaW9ucyBvZiB0aGUgY29udGFpbmVyLCByZWxhdGl2ZSB0byB0aGUgdG9wIGxlZnRcbiAgIyBjb3JuZXIgb2YgdGhlIGNvbnRhaW5lclxuICAjXG4gIGdldEV2ZW50Q29udGFpbmVyUG9zaXRpb246IChlKSA9PlxuICAgIGxlZnQ6IChlLnBhZ2VYIC0gQGNvbnRhaW5lci5vZmZzZXQoKS5sZWZ0KSAvIEBjYWxjKGNvbnRhaW5lcldpZHRoKVxuICAgIHRvcDogIChlLnBhZ2VZIC0gQGNvbnRhaW5lci5vZmZzZXQoKS50b3ApIC8gQGNhbGMoY29udGFpbmVySGVpZ2h0KVxuXG4gICMgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0gRXZlbnRzXG5cbiAgIyAocHJpdmF0ZSkgTGlzdGVuZXIgZm9yIGRvdWJsZS1jbGlja2luZyBvbiB0aGUgcGxhblxuICAjXG4gIHpEYmxDbGljayA9IChlKSAtPlxuICAgIGlmICQoZS50YXJnZXQpLmF0dHIoJ2RhdGEtem9vbS1pZCcpID09IEB6b29tSWRcbiAgICAgIGNsaWNrID0gQGdldEV2ZW50Q29udGFpbmVyUG9zaXRpb24oZSlcbiAgICAgIEB6b29tSW4oJ2NsaWNrJywgY2xpY2subGVmdCwgY2xpY2sudG9wKVxuXG4gICMgKHByaXZhdGUpIExpc3RlbmVyIGZvciB0aGUgc3RhcnQgb2YgYSBjbGljayBvbiB0aGUgcGxhblxuICAjXG4gIHpNb3VzZURvd24gPSAoZSkgLT5cbiAgICBpZiAkKGUudGFyZ2V0KS5hdHRyKCdkYXRhLXpvb20taWQnKSA9PSBAem9vbUlkICYmIGUud2hpY2ggPT0gMVxuICAgICAgQGlzRHJhZ2dpbmcgPSB0cnVlXG4gICAgICBjb29yZHMgPSBAZ2V0RXZlbnRDb250YWluZXJQb3NpdGlvbihlKVxuICAgICAgQGRyYWdDb29yZHMgPVxuICAgICAgICBwb2ludFJlZjogY29vcmRzXG4gICAgICAgIGltZ1JlZjpcbiAgICAgICAgICBsZWZ0OiAwIC0gQGNhbGMoaW1nT2Zmc2V0TGVmdClcbiAgICAgICAgICB0b3A6IDAgLSBAY2FsYyhpbWdPZmZzZXRUb3ApXG4gICAgICAgIG1heDpcbiAgICAgICAgICByaWdodDogKGNvb3Jkcy5sZWZ0ICogQGNhbGMoY29udGFpbmVyV2lkdGgpKSArIEBjYWxjKGltZ09mZnNldExlZnQpXG4gICAgICAgICAgbGVmdDogKGNvb3Jkcy5sZWZ0ICogQGNhbGMoY29udGFpbmVyV2lkdGgpKSAtIChAY2FsYyhpbWdXaWR0aCkgLVxuICAgICAgICAgICAgICAgICAgICAgIChAY2FsYyhjb250YWluZXJXaWR0aCkgKyBAY2FsYyhpbWdPZmZzZXRMZWZ0KSkpXG4gICAgICAgICAgYm90dG9tOiAoY29vcmRzLnRvcCAqIEBjYWxjKGNvbnRhaW5lckhlaWdodCkpICsgQGNhbGMoaW1nT2Zmc2V0VG9wKVxuICAgICAgICAgIHRvcDogKGNvb3Jkcy50b3AgKiBAY2FsYyhjb250YWluZXJIZWlnaHQpKSAtIChAY2FsYyhpbWdIZWlnaHQpIC1cbiAgICAgICAgICAgICAgICAgICAgICAoQGNhbGMoY29udGFpbmVySGVpZ2h0KSArIEBjYWxjKGltZ09mZnNldFRvcCkpKVxuICAgIHRydWVcblxuICAjIChwcml2YXRlKSBMaXN0ZW5lciBmb3Igd2hlbiB0aGUgbW91c2UgbW92ZXMgYW55d2hlcmUgb25cbiAgIyB0aGUgZG9jdW1lbnRcbiAgI1xuICB6TW91c2VNb3ZlID0gKGUpIC0+XG4gICAgaWYgQGlzRHJhZ2dpbmdcbiAgICAgIGNvb3JkcyA9IEBnZXRFdmVudENvbnRhaW5lclBvc2l0aW9uKGUpXG4gICAgICBkcmFnTGVmdCA9IGNvb3Jkcy5sZWZ0ICogQGNhbGMoY29udGFpbmVyV2lkdGgpXG4gICAgICBkcmFnVG9wID0gY29vcmRzLnRvcCAqIEBjYWxjKGNvbnRhaW5lckhlaWdodClcbiAgICAgIGlmIGRyYWdMZWZ0ID49IEBkcmFnQ29vcmRzLm1heC5sZWZ0ICYmIGRyYWdMZWZ0IDw9IEBkcmFnQ29vcmRzLm1heC5yaWdodFxuICAgICAgICBsZWZ0ID0gKGNvb3Jkcy5sZWZ0IC0gQGRyYWdDb29yZHMucG9pbnRSZWYubGVmdCkgKiBAY2FsYyhjb250YWluZXJXaWR0aClcbiAgICAgICAgQGltYWdlUG9zaXRpb24ubGVmdFB4ID0gQGRyYWdDb29yZHMuaW1nUmVmLmxlZnQgKyBsZWZ0XG4gICAgICBlbHNlIGlmIGRyYWdMZWZ0IDwgQGRyYWdDb29yZHMubWF4LmxlZnRcbiAgICAgICAgQGltYWdlUG9zaXRpb24ubGVmdFB4ID0gQGNhbGMoY29udGFpbmVyV2lkdGgpIC0gQGNhbGMoaW1nV2lkdGgpXG4gICAgICBlbHNlIGlmIGRyYWdMZWZ0ID4gQGRyYWdDb29yZHMubWF4LnJpZ2h0XG4gICAgICAgIEBpbWFnZVBvc2l0aW9uLmxlZnRQeCA9IDBcbiAgICAgIGlmIGRyYWdUb3AgPj0gQGRyYWdDb29yZHMubWF4LnRvcCAmJiBkcmFnVG9wIDw9IEBkcmFnQ29vcmRzLm1heC5ib3R0b21cbiAgICAgICAgdG9wID0gKGNvb3Jkcy50b3AgLSBAZHJhZ0Nvb3Jkcy5wb2ludFJlZi50b3ApICogQGNhbGMoY29udGFpbmVySGVpZ2h0KVxuICAgICAgICBAaW1hZ2VQb3NpdGlvbi50b3BQeCA9IEBkcmFnQ29vcmRzLmltZ1JlZi50b3AgKyB0b3BcbiAgICAgIGVsc2UgaWYgZHJhZ1RvcCA8IEBkcmFnQ29vcmRzLm1heC50b3BcbiAgICAgICAgQGltYWdlUG9zaXRpb24udG9wUHggPSBAY2FsYyhjb250YWluZXJIZWlnaHQpIC0gQGNhbGMoaW1nSGVpZ2h0KVxuICAgICAgZWxzZSBpZiBkcmFnVG9wID4gQGRyYWdDb29yZHMubWF4LmJvdHRvbVxuICAgICAgICBAaW1hZ2VQb3NpdGlvbi50b3BQeCA9IDBcbiAgICAgIHNldEJhY2tncm91bmQuY2FsbChAKVxuICAgIHRydWVcblxuICAjIChwcml2YXRlKSBMaXN0ZW5lciBmb3IgdGhlIGVuZCBvZiBhIGNsaWNrIGFueXdoZXJlIG9uXG4gICMgdGhlIGRvY3VtZW50XG4gICNcbiAgek1vdXNlVXAgPSAoZSkgLT5cbiAgICBAaXNEcmFnZ2luZyA9IGZhbHNlXG4gICAgcG9zaXRpb25JbmZvYm94ZXMuY2FsbChAKVxuICAgIHRydWVcblxuICAjID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09IFpvb21pbmdcblxuICAjIFRha2VzIGN1cnJlbnQgem9vbSBwb3NpdGlvbiBhbmQgem9vbXMgaW4gdG8gdGhlIGNlbnRlclxuICAjIG9uZSBsZXZlbCBkZWVwZXJcbiAgI1xuICB6b29tSW46ID0+XG4gICAgQGltYWdlUG9zaXRpb24uc2NhbGUgID0gQGltYWdlUG9zaXRpb24uc2NhbGUgKyBAaW1hZ2VQb3NpdGlvbi5pbmNyZW1lbnRcbiAgICBAaW1hZ2VQb3NpdGlvbi5sZWZ0UHggPSAtIEBjYWxjKGltZ09mZnNldExlZnQpIC1cbiAgICAgIChAY2FsYyhpbWdXaWR0aENsaWNrSW5jcmVtZW50KSAvIDIpXG4gICAgQGltYWdlUG9zaXRpb24udG9wUHggID0gLSBAY2FsYyhpbWdPZmZzZXRUb3ApIC1cbiAgICAgIChAY2FsYyhpbWdIZWlnaHRDbGlja0luY3JlbWVudCkgLyAyKVxuICAgIGFuaW1hdGVCYWNrZ3JvdW5kLmNhbGwoQClcblxuICAjIFpvb21zIG91dCBvbmUgbGV2ZWwuIEF0dGVtcHRzIHRvIHpvb20gb3V0IGZyb20gdGhlXG4gICMgY2VudGVyLCBidXQgd2lsbCBhZGp1c3QgYmFzZWQgb24gYXZhaWxhYmxlIGltYWdlIHNwYWNlLlxuICAjXG4gIHpvb21PdXQ6ICgpID0+XG4gICAgaWYgQGltYWdlUG9zaXRpb24uc2NhbGUgPiAxXG4gICAgICBAaW1hZ2VQb3NpdGlvbi5zY2FsZSAgPSBAaW1hZ2VQb3NpdGlvbi5zY2FsZSAtIEBpbWFnZVBvc2l0aW9uLmluY3JlbWVudFxuICAgICAgbGVmdFB4ID0gLSBAY2FsYyhpbWdPZmZzZXRMZWZ0KSArIChAY2FsYyhpbWdXaWR0aENsaWNrSW5jcmVtZW50KSAvIDIpXG4gICAgICB0b3BQeCAgPSAtIEBjYWxjKGltZ09mZnNldFRvcCkgKyAoQGNhbGMoaW1nSGVpZ2h0Q2xpY2tJbmNyZW1lbnQpIC8gMilcbiAgICAgIGlmIGxlZnRQeCA+IDBcbiAgICAgICAgQGltYWdlUG9zaXRpb24ubGVmdFB4ID0gMFxuICAgICAgZWxzZSBpZiBsZWZ0UHggPCBAY2FsYyhjb250YWluZXJXaWR0aCkgLSBAY2FsYyhpbWdXaWR0aClcbiAgICAgICAgQGltYWdlUG9zaXRpb24ubGVmdFB4ID0gQGNhbGMoY29udGFpbmVyV2lkdGgpIC0gQGNhbGMoaW1nV2lkdGgpXG4gICAgICBlbHNlXG4gICAgICAgIEBpbWFnZVBvc2l0aW9uLmxlZnRQeCA9IGxlZnRQeFxuICAgICAgaWYgdG9wUHggPiAwXG4gICAgICAgIEBpbWFnZVBvc2l0aW9uLnRvcFB4ID0gMFxuICAgICAgZWxzZSBpZiB0b3BQeCA8IEBjYWxjKGNvbnRhaW5lckhlaWdodCkgLSBAY2FsYyhpbWdIZWlnaHQpXG4gICAgICAgIEBpbWFnZVBvc2l0aW9uLnRvcFB4ID0gQGNhbGMoY29udGFpbmVySGVpZ2h0KSAtIEBjYWxjKGltZ0hlaWdodClcbiAgICAgIGVsc2VcbiAgICAgICAgQGltYWdlUG9zaXRpb24udG9wUHggPSB0b3BQeFxuICAgICAgYW5pbWF0ZUJhY2tncm91bmQuY2FsbChAKVxuXG5cbiAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gUmVmc1xuXG4gIG1hcmtlcnM6ID0+XG4gICAgQG1hcmtlcnNDb250YWluZXIuZmluZChcIi4je1BsYW5pdC5tYXJrZXJDbGFzc31cIilcblxuICBkcmFnZ2luZ01hcmtlcjogPT5cbiAgICBAbWFya2Vyc0NvbnRhaW5lci5maW5kKFwiLiN7UGxhbml0Lm1hcmtlckNsYXNzfS4je1BsYW5pdC5kcmFnZ2luZ0NsYXNzfVwiKVxuXG4gIGdldEV2ZW50UG9zaXRpb246IChlKSA9PlxuICAgICMgY29udGFpbmVyIGRpbWVuc2lvbnNcbiAgICB3Q29udCA9IHBhcnNlRmxvYXQoQG1hcmtlcnNDb250YWluZXIud2lkdGgoKSlcbiAgICBoQ29udCA9IHBhcnNlRmxvYXQoQG1hcmtlcnNDb250YWluZXIuaGVpZ2h0KCkpXG4gICAgIyBpZihcbiAgICAjICAgQG1hcmtlcnNDb250YWluZXIuY3NzKCdiYWNrZ3JvdW5kSW1hZ2UnKSAmJlxuICAgICMgICBAbWFya2Vyc0NvbnRhaW5lci5jc3MoJ2JhY2tncm91bmRJbWFnZScpICE9ICdub25lJ1xuICAgICMgKVxuICAgIGlmIEBpbWFnZVxuICAgICAgIyBpZiB0aGVyZSBpcyBhbiBpbWFnZSwgd2UgbmVlZCB0byBjYWxjdWxhdGUgd2l0aCBpbWFnZSBpbiBtaW5kXG4gICAgICB4UHggPSBlLnBhZ2VYIC0gQGNvbnRhaW5lci5vZmZzZXQoKS5sZWZ0XG4gICAgICB5UHggPSBlLnBhZ2VZIC0gQGNvbnRhaW5lci5vZmZzZXQoKS50b3BcbiAgICAgIHdJbWcgPSBAaW1hZ2Uud2lkdGgoKVxuICAgICAgaEltZyA9IEBpbWFnZS5oZWlnaHQoKVxuICAgICAgeEltZyA9IHBhcnNlSW50KEBpbWFnZS5jc3MoJ2xlZnQnKSlcbiAgICAgIHlJbWcgPSBwYXJzZUludChAaW1hZ2UuY3NzKCd0b3AnKSlcbiAgICAgIHhQYyA9ICgoeFB4ICsgTWF0aC5hYnMoeEltZykpIC8gd0ltZykgKiAxMDBcbiAgICAgIHlQYyA9ICgoeVB4ICsgTWF0aC5hYnMoeUltZykpIC8gaEltZykgKiAxMDBcbiAgICBlbHNlXG4gICAgICAjIG9yIHdlIGNhbiBqdXN0IGxvb2sgYXQgdGhlIGNvbnRhaW5lclxuICAgICAgeFBjID0gKGUucGFnZVggLSBAY29udGFpbmVyLm9mZnNldCgpLmxlZnQpIC8gd0NvbnRcbiAgICAgIHlQYyA9ICAoZS5wYWdlWSAtIEBjb250YWluZXIub2Zmc2V0KCkudG9wKSAvIGhDb250XG4gICAgW3hQYywgeVBjXVxuXG4gICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIEV2ZW50c1xuXG4gIG1vdXNldXA6IChlKSA9PlxuICAgICMgZGVhbGluZyB3aXRoIG1hcmtlcnMsIGVzcC4gZHJhZ2dpbmcgbWFya2Vyc1xuICAgIG1hcmtlciA9IEBtYXJrZXJzQ29udGFpbmVyLmZpbmQoXCIuI3tQbGFuaXQuZHJhZ2dpbmdDbGFzc31cIikuZmlyc3QoKVxuICAgIGlmIEBkcmFnZ2luZ01hcmtlcigpLmxlbmd0aCA+IDBcbiAgICAgIG0gPSBuZXcgUGxhbml0Lk1hcmtlcihAY29udGFpbmVyLCBtYXJrZXIuYXR0cignZGF0YS1tYXJrZXInKSlcbiAgICAgIEBvcHRpb25zLm1hcmtlckRyYWdFbmQoZSwgbSlcbiAgICAgIG0uc2F2ZVBvc2l0aW9uKClcbiAgICAgIG0ucG9zaXRpb25JbmZvYm94KClcbiAgICAgIEBkcmFnZ2luZ01hcmtlcigpLnJlbW92ZUNsYXNzKFBsYW5pdC5kcmFnZ2luZ0NsYXNzKVxuICAgICMgaWYgY2xpY2sgaXMgb24gdGhlIGNvbnRhaW5lclxuICAgIGlmICQoZS50YXJnZXQpLmhhc0NsYXNzKFBsYW5pdC5tYXJrZXJDb250YWluZXJDbGFzcylcbiAgICAgIEBvcHRpb25zLmNhbnZhc0NsaWNrKGUsIEBnZXRFdmVudFBvc2l0aW9uKGUpKVxuICAgICMgaWYgY2xpY2sgaXMgb24gdGhlIG1hcmtlcnNcbiAgICBpZihcbiAgICAgICQoZS50YXJnZXQpLmhhc0NsYXNzKFBsYW5pdC5tYXJrZXJDbGFzcykgfHxcbiAgICAgICQoZS50YXJnZXQpLnBhcmVudHMoXCIuI3tQbGFuaXQubWFya2VyQ2xhc3N9XCIpLmxlbmd0aCA+IDBcbiAgICApXG4gICAgICBpZiAkKGUudGFyZ2V0KS5oYXNDbGFzcyhQbGFuaXQubWFya2VyQ2xhc3MpXG4gICAgICAgIG1hcmtlciA9ICQoZS50YXJnZXQpXG4gICAgICBlbHNlXG4gICAgICAgIG1hcmtlciA9ICQoZS50YXJnZXQpLnBhcmVudHMoXCIuI3tQbGFuaXQubWFya2VyQ2xhc3N9XCIpLmZpcnN0KClcbiAgICAgIG0gPSBuZXcgUGxhbml0Lk1hcmtlcihAY29udGFpbmVyLCBtYXJrZXIuYXR0cignZGF0YS1tYXJrZXInKSlcbiAgICAgIEBvcHRpb25zLm1hcmtlckNsaWNrKGUsIG0pXG4gICAgdHJ1ZVxuXG4gIG1vdXNlbW92ZTogKGUpID0+XG4gICAgbWFya2VycyA9IEBtYXJrZXJzQ29udGFpbmVyLmZpbmQoXCIuI3tQbGFuaXQubWFya2VyQ2xhc3N9LiN7UGxhbml0LmRyYWdnaW5nQ2xhc3N9XCIpXG5cbiAgICBpZiBtYXJrZXJzLmxlbmd0aCA+IDBcblxuICAgICAgIyBvbmx5IHVzZSBmaXJzdCBtYXJrZXIgaW4gY2FzZSB0aGVyZSBhcmUgbW9yZSB0aGFuXG4gICAgICAjIG9uZSBkcmFnZ2luZ1xuICAgICAgI1xuICAgICAgbWFya2VyID0gbWFya2Vycy5maXJzdCgpXG5cbiAgICAgICMgd2UgaGlkZSB0aGUgaW5mb2JveCB3aGlsZSBkcmFnZ2luZ1xuICAgICAgI1xuICAgICAgaWYoXG4gICAgICAgIE1hdGguYWJzKGUucGFnZVggLSBtYXJrZXIuYXR0cignZGF0YS1kcmFnLXN0YXJ0LXgnKSkgPiAwIHx8XG4gICAgICAgIE1hdGguYWJzKGUucGFnZVkgLSBtYXJrZXIuYXR0cignZGF0YS1kcmFnLXN0YXJ0LXknKSkgPiAwXG4gICAgICApXG4gICAgICAgIEBjb250YWluZXIuZmluZChcIiMje21hcmtlci5hdHRyKCdkYXRhLWluZm9ib3gnKX1cIikucmVtb3ZlQ2xhc3MoJ2FjdGl2ZScpXG5cbiAgICAgICMgY2FsY3VsYXRlIHBvc2l0aW9uc1xuICAgICAgI1xuICAgICAgbW91c2VMZWZ0ICAgICA9IGUucGFnZVggLSBAY29udGFpbmVyLm9mZnNldCgpLmxlZnRcbiAgICAgIG1vdXNlVG9wICAgICAgPSBlLnBhZ2VZIC0gQGNvbnRhaW5lci5vZmZzZXQoKS50b3BcbiAgICAgIHBsYW5SaWdodCAgICAgPSBAY29udGFpbmVyLndpZHRoKClcbiAgICAgIHBsYW5Cb3R0b20gICAgPSBAY29udGFpbmVyLmhlaWdodCgpXG4gICAgICBtYXJrZXJMZWZ0ICAgID0gbW91c2VMZWZ0IC0gKG1hcmtlci5vdXRlcldpZHRoKCkgLyAyKVxuICAgICAgbWFya2VyVG9wICAgICA9IG1vdXNlVG9wIC0gKG1hcmtlci5vdXRlckhlaWdodCgpIC8gMilcbiAgICAgIG1hcmtlclJpZ2h0ICAgPSBtb3VzZUxlZnQgKyAobWFya2VyLm91dGVyV2lkdGgoKSAvIDIpXG4gICAgICBtYXJrZXJCb3R0b20gID0gbW91c2VUb3AgKyAobWFya2VyLm91dGVySGVpZ2h0KCkgLyAyKVxuICAgICAgbWFya2VyV2lkdGggICA9IG1hcmtlci5vdXRlcldpZHRoKClcbiAgICAgIG1hcmtlckhlaWdodCAgPSBtYXJrZXIub3V0ZXJIZWlnaHQoKVxuXG4gICAgICAjIGZpbmQgdGhlIGxlZnQgcG9zaXRpb24gb2YgdGhlIG1hcmtlciBiYXNlZCBvblxuICAgICAgIyBwb3NpdGlvbiBvZiB0aGUgbW91c2UgcmVsYXRpdmUgdG8gdGhlIHBsYW5cbiAgICAgICNcbiAgICAgIGlmIG1hcmtlckxlZnQgPD0gMFxuICAgICAgICBtYXJrZXJYID0gMFxuICAgICAgZWxzZSBpZiBtYXJrZXJSaWdodCA8IHBsYW5SaWdodFxuICAgICAgICBtYXJrZXJYID0gbWFya2VyTGVmdFxuICAgICAgZWxzZVxuICAgICAgICBtYXJrZXJYID0gcGxhblJpZ2h0IC0gbWFya2VyV2lkdGhcblxuICAgICAgIyBmaW5kIHRoZSBsZWZ0IHBvc2l0aW9uIG9mIHRoZSBtYXJrZXIgYmFzZWQgb25cbiAgICAgICMgcG9zaXRpb24gb2YgdGhlIG1vdXNlIHJlbGF0aXZlIHRvIHRoZSBwbGFuXG4gICAgICAjXG4gICAgICBpZiBtYXJrZXJUb3AgPD0gMFxuICAgICAgICBtYXJrZXJZID0gMFxuICAgICAgZWxzZSBpZiBtYXJrZXJCb3R0b20gPCBwbGFuQm90dG9tXG4gICAgICAgIG1hcmtlclkgPSBtYXJrZXJUb3BcbiAgICAgIGVsc2VcbiAgICAgICAgbWFya2VyWSA9IHBsYW5Cb3R0b20gLSBtYXJrZXJIZWlnaHRcblxuICAgICAgIyBzZXQgdGhlIHBvc2l0aW9uIG9mIHRoZSBtYXJrZXJcbiAgICAgICNcbiAgICAgIG1hcmtlci5jc3NcbiAgICAgICAgbGVmdDogbWFya2VyWFxuICAgICAgICB0b3A6IG1hcmtlcllcblxuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBFdmVudCBDYWxsYmFja3NcblxuICBtYXJrZXJEcmFnRW5kOiAoZXZlbnQsIG1hcmtlcikgPT5cbiAgICBpZiBAb3B0aW9ucy5tYXJrZXJEcmFnRW5kXG4gICAgICBAb3B0aW9ucy5tYXJrZXJEcmFnRW5kKGV2ZW50LCBtYXJrZXIpXG5cbiAgbWFya2VyQ2xpY2s6IChldmVudCwgbWFya2VyKSA9PlxuICAgIGlmIEBvcHRpb25zLm1hcmtlckNsaWNrXG4gICAgICBAb3B0aW9ucy5tYXJrZXJDbGljayhldmVudCwgbWFya2VyKVxuXG4gIGNhbnZhc0NsaWNrOiAoZXZlbnQsIGNvb3JkcykgPT5cbiAgICBpZiBAb3B0aW9ucy5jYW52YXNDbGlja1xuICAgICAgQG9wdGlvbnMuY2FudmFzQ2xpY2soZXZlbnQsIGNvb3JkcylcblxuY2xhc3MgUGxhbml0Lk1hcmtlclxuXG4gIGNvbnN0cnVjdG9yOiAoQGNvbnRhaW5lciwgaWQpIC0+XG5cbiAgICAjIFNldCBPcHRpb25zXG4gICAgQG1hcmtlcnNDb250YWluZXIgPSBAY29udGFpbmVyLmZpbmQoXCIuI3tQbGFuaXQubWFya2VyQ29udGFpbmVyQ2xhc3N9XCIpXG4gICAgaWYgQGNvbnRhaW5lci5maW5kKFwiLiN7UGxhbml0LmltYWdlQ29udGFpbmVyfSA+IGltZ1wiKS5sZW5ndGggPiAwXG4gICAgICBAaW1hZ2UgPSBAY29udGFpbmVyLmZpbmQoXCIuI3tQbGFuaXQuaW1hZ2VDb250YWluZXJ9ID4gaW1nXCIpLmZpcnN0KClcblxuICAgICMgRmluZCBNYXJrZXJcbiAgICBAbWFya2VyID0gQG1hcmtlcnNDb250YWluZXIuZmluZChcbiAgICAgIFwiLiN7UGxhbml0Lm1hcmtlckNsYXNzfVtkYXRhLW1hcmtlcj0nI3tpZH0nXVwiXG4gICAgKS5maXJzdCgpXG5cbiAgICAjIFJldHVybiB0aGlzXG4gICAgQFxuXG4gICMgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0gQ3JlYXRlIE5ldyBNYXJrZXJcblxuICBAY3JlYXRlOiAob3B0aW9ucykgLT5cbiAgICAjIGxvY2FsIHJlZmVyZW5jZXNcbiAgICBjb250YWluZXIgPSBvcHRpb25zLmNvbnRhaW5lclxuICAgIG1hcmtlcnNDb250YWluZXIgPSBjb250YWluZXIuZmluZChcIi4je1BsYW5pdC5tYXJrZXJDb250YWluZXJDbGFzc31cIikuZmlyc3QoKVxuICAgICMgc2V0IG9wdGlvbnNcbiAgICBvcHRpb25zLnBsYW5pdElEID0gUGxhbml0LnJhbmRvbVN0cmluZygyMCkgdW5sZXNzIG9wdGlvbnMucGxhbml0SURcbiAgICBpZiBvcHRpb25zLmNvbG9yIHRoZW4gY29sb3IgPSBvcHRpb25zLmNvbG9yIGVsc2UgY29sb3IgPSAnI0ZDNUIzRidcbiAgICAjIGZpbmQgcG9zaXRpb25cbiAgICBsZWZ0ID0gKChwYXJzZUZsb2F0KG9wdGlvbnMuY29vcmRzWzBdKSAvIDEwMCkgKiBjb250YWluZXIud2lkdGgoKSkgLSAxNVxuICAgIHRvcCA9ICgocGFyc2VGbG9hdChvcHRpb25zLmNvb3Jkc1sxXSkgLyAxMDApICogY29udGFpbmVyLmhlaWdodCgpKSAtIDE1XG4gICAgIyBjcmVhdGUgdGhlIG1hcmtlclxuICAgIG1hcmtlcnNDb250YWluZXIuYXBwZW5kKFxuICAgICAgJCgnPGRpdj48L2Rpdj4nKVxuICAgICAgICAuYWRkQ2xhc3MoUGxhbml0Lm1hcmtlckNsYXNzKVxuICAgICAgICAuYXR0clxuICAgICAgICAgICdkYXRhLW1hcmtlcic6IG9wdGlvbnMucGxhbml0SURcbiAgICAgICAgICAnZGF0YS14UGMnOiBvcHRpb25zLmNvb3Jkc1swXVxuICAgICAgICAgICdkYXRhLXlQYyc6IG9wdGlvbnMuY29vcmRzWzFdXG4gICAgICAgIC5jc3NcbiAgICAgICAgICBsZWZ0OiBcIiN7bGVmdH1weFwiXG4gICAgICAgICAgdG9wOiBcIiN7dG9wfXB4XCJcbiAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6IGNvbG9yXG4gICAgKVxuICAgICMgZmluZCB0aGUgbWFya2VyXG4gICAgbWFya2VyID0gbWFya2Vyc0NvbnRhaW5lci5maW5kKFwiLiN7UGxhbml0Lm1hcmtlckNsYXNzfVwiKS5sYXN0KClcbiAgICAjIGFkZCBjb250ZW50IGFuZCBzdHlsZXMgaWYgcGFzc2VkIGFzIG9wdGlvbnNcbiAgICBpZiBvcHRpb25zLmlkXG4gICAgICBtYXJrZXIuYXR0cignZGF0YS1pZCc6IG9wdGlvbnMuaWQpXG4gICAgaWYgb3B0aW9ucy5jbGFzc1xuICAgICAgbWFya2VyLmFkZENsYXNzKG9wdGlvbnMuY2xhc3MpXG4gICAgaWYgb3B0aW9ucy5odG1sXG4gICAgICBtYXJrZXIuaHRtbChvcHRpb25zLmh0bWwpXG4gICAgaWYgb3B0aW9ucy5zaXplXG4gICAgICBtYXJrZXIuY3NzXG4gICAgICAgIHdpZHRoOiBcIiN7b3B0aW9ucy5zaXplfXB4XCJcbiAgICAgICAgaGVpZ2h0OiBcIiN7b3B0aW9ucy5zaXplfXB4XCJcbiAgICAjIHNldHVwIGRyYWdnYWJsZSBpZiBuZWNlc3NhcnlcbiAgICBpZiBvcHRpb25zLmRyYWdnYWJsZVxuICAgICAgbWFya2VyLmFkZENsYXNzKCdkcmFnZ2FibGUnKVxuICAgICAgbWFya2VyLm9uICdtb3VzZWRvd24nLCAoZSkgPT5cbiAgICAgICAgaWYgZS53aGljaCA9PSAxXG4gICAgICAgICAgbWFya2VyID0gJChlLnRhcmdldCkuY2xvc2VzdChcIi4je1BsYW5pdC5tYXJrZXJDbGFzc31cIilcbiAgICAgICAgICBtYXJrZXIuYWRkQ2xhc3MoUGxhbml0LmRyYWdnaW5nQ2xhc3MpXG4gICAgICAgICAgbWFya2VyLmF0dHJcbiAgICAgICAgICAgICdkYXRhLWRyYWctc3RhcnQteCc6IGUucGFnZVhcbiAgICAgICAgICAgICdkYXRhLWRyYWctc3RhcnQteSc6IGUucGFnZVlcbiAgICAjIHNldHVwIGluZm9ib3ggaWYgbmVjZXNzYXJ5XG4gICAgaWYgb3B0aW9ucy5pbmZvYm94XG4gICAgICBpZCA9IFBsYW5pdC5yYW5kb21TdHJpbmcoMTYpXG4gICAgICAjIHNldCBzdHlsZSBvcHRpb25zIG9uIGluZm9ib3hcbiAgICAgIGluZm9ib3ggPSBvcHRpb25zLmluZm9ib3hcbiAgICAgIGlmIGluZm9ib3gucG9zaXRpb24gdGhlbiBwb3NpdGlvbiA9IGluZm9ib3gucG9zaXRpb24gZWxzZSBwb3NpdGlvbiA9ICd0b3AnXG4gICAgICBpZiBpbmZvYm94LmFycm93IHRoZW4gYXJyb3cgPSB0cnVlIGVsc2UgYXJyb3cgPSBmYWxzZVxuICAgICAgaWYgYXJyb3cgPT0gdHJ1ZSB0aGVuIGFycm93Q2xhc3MgPSAnYXJyb3cnIGVsc2UgYXJyb3dDbGFzcyA9ICcnXG4gICAgICBjbGFzc2VzID0gXCIje1BsYW5pdC5pbmZvYm94Q2xhc3N9ICN7cG9zaXRpb259ICN7YXJyb3dDbGFzc31cIlxuICAgICAgIyBhZGQgaW5mb2JveFxuICAgICAgY29udGFpbmVyLmZpbmQoXCIuI3tQbGFuaXQuaW5mb2JveENvbnRhaW5lckNsYXNzfVwiKS5hcHBlbmQgXCJcIlwiXG4gICAgICAgIDxkaXYgY2xhc3M9XCIje2NsYXNzZXN9XCIgaWQ9XCJpbmZvLSN7aWR9XCJcbiAgICAgICAgICBkYXRhLXBvc2l0aW9uPVwiI3twb3NpdGlvbn1cIj5cbiAgICAgICAgICAgICN7aW5mb2JveC5odG1sfVxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgICBcIlwiXCJcbiAgICAgICMgYWRkIHBvc3Qtb3B0aW9ucyBpZiBuZWNlc3NhcnlcbiAgICAgIGlmIGluZm9ib3gub2Zmc2V0WFxuICAgICAgICBjb250YWluZXIuZmluZChcIi4je1BsYW5pdC5pbmZvYm94Q2xhc3N9XCIpLmxhc3QoKS5hdHRyXG4gICAgICAgICAgJ2RhdGEtb2Zmc2V0LXgnOiBpbmZvYm94Lm9mZnNldFhcbiAgICAgIGlmIGluZm9ib3gub2Zmc2V0WVxuICAgICAgICBjb250YWluZXIuZmluZChcIi4je1BsYW5pdC5pbmZvYm94Q2xhc3N9XCIpLmxhc3QoKS5hdHRyXG4gICAgICAgICAgJ2RhdGEtb2Zmc2V0LXknOiBpbmZvYm94Lm9mZnNldFlcbiAgICAgIG1hcmtlci5hdHRyKCdkYXRhLWluZm9ib3gnLCBcImluZm8tI3tpZH1cIilcbiAgICAgIG0gPSBuZXcgUGxhbml0Lk1hcmtlcihjb250YWluZXIsIG9wdGlvbnMucGxhbml0SUQpXG4gICAgICBtLnBvc2l0aW9uSW5mb2JveCgpXG4gICAgICBtXG5cbiAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gQ2FsY3VsYXRpb25zXG5cbiAgcG9zaXRpb246ID0+XG4gICAgeFB4ID0gQG1hcmtlci5wb3NpdGlvbigpLmxlZnQgKyAoQG1hcmtlci5vdXRlcldpZHRoKCkgLyAyKVxuICAgIHlQeCA9IEBtYXJrZXIucG9zaXRpb24oKS50b3AgKyAoQG1hcmtlci5vdXRlckhlaWdodCgpIC8gMilcbiAgICBpZiBAaW1hZ2VcbiAgICAgIHdJbWcgPSBAaW1hZ2Uud2lkdGgoKVxuICAgICAgaEltZyA9IEBpbWFnZS5oZWlnaHQoKVxuICAgICAgeEltZyA9IHBhcnNlSW50KEBpbWFnZS5jc3MoJ2xlZnQnKSlcbiAgICAgIHlJbWcgPSBwYXJzZUludChAaW1hZ2UuY3NzKCd0b3AnKSlcbiAgICAgIHhQYyA9ICgoeFB4ICsgTWF0aC5hYnMoeEltZykpIC8gd0ltZykgKiAxMDBcbiAgICAgIHlQYyA9ICgoeVB4ICsgTWF0aC5hYnMoeUltZykpIC8gaEltZykgKiAxMDBcbiAgICBlbHNlXG4gICAgICB4UGMgPSAoeFB4IC8gQGNvbnRhaW5lci53aWR0aCgpKSAqIDEwMFxuICAgICAgeVBjID0gKHlQeCAvIEBjb250YWluZXIuaGVpZ2h0KCkpICogMTAwXG4gICAgW3hQYywgeVBjXVxuXG4gIHJlbGF0aXZlUG9zaXRpb246ID0+XG4gICAgeFB4ID0gQG1hcmtlci5wb3NpdGlvbigpLmxlZnQgKyAoQG1hcmtlci5vdXRlcldpZHRoKCkgLyAyKVxuICAgIHlQeCA9IEBtYXJrZXIucG9zaXRpb24oKS50b3AgKyAoQG1hcmtlci5vdXRlckhlaWdodCgpIC8gMilcbiAgICB4UGMgPSAoeFB4IC8gQGNvbnRhaW5lci53aWR0aCgpKSAqIDEwMFxuICAgIHlQYyA9ICh5UHggLyBAY29udGFpbmVyLmhlaWdodCgpKSAqIDEwMFxuICAgIFt4UGMsIHlQY11cblxuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBBdHRyaWJ1dGVzXG5cbiAgY29sb3I6ID0+XG4gICAgQG1hcmtlci5jc3MoJ2JhY2tncm91bmRDb2xvcicpXG5cbiAgcGxhbml0SUQ6ID0+XG4gICAgQG1hcmtlci5hdHRyKCdkYXRhLW1hcmtlcicpXG5cbiAgaWQ6ID0+XG4gICAgQG1hcmtlci5hdHRyKCdkYXRhLWlkJylcblxuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBJbmZvYm94XG5cbiAgaW5mb2JveDogPT5cbiAgICBpbmZvYm94ID0gQGNvbnRhaW5lci5maW5kKFwiIyN7QG1hcmtlci5hdHRyKCdkYXRhLWluZm9ib3gnKX1cIilcbiAgICBpZiBpbmZvYm94Lmxlbmd0aCA+IDAgdGhlbiBpbmZvYm94IGVsc2UgbnVsbFxuXG4gIGluZm9ib3hIVE1MOiA9PlxuICAgIGlmIEBpbmZvYm94KCkgJiYgQGluZm9ib3goKS5sZW5ndGggPiAwIHRoZW4gQGluZm9ib3goKS5odG1sKCkgZWxzZSBudWxsXG5cbiAgaW5mb2JveFZpc2libGU6ID0+XG4gICAgQGluZm9ib3goKSAmJiBAaW5mb2JveCgpLmhhc0NsYXNzKCdhY3RpdmUnKVxuXG4gIGhpZGVJbmZvYm94OiA9PlxuICAgIEBpbmZvYm94KCkuYWRkQ2xhc3MoJ2hpZGRlbicpIGlmIEBpbmZvYm94VmlzaWJsZSgpXG5cbiAgc2hvd0luZm9ib3g6ID0+XG4gICAgQGluZm9ib3goKS5hZGRDbGFzcygnYWN0aXZlJykgaWYgQGluZm9ib3goKSAmJiAhQGluZm9ib3hWaXNpYmxlKClcbiAgICBAdW5oaWRlSW5mb2JveCgpXG5cbiAgdW5oaWRlSW5mb2JveDogPT5cbiAgICBAaW5mb2JveCgpLnJlbW92ZUNsYXNzKCdoaWRkZW4nKSBpZiBAaW5mb2JveFZpc2libGUoKVxuXG4gIGluZm9ib3hDb29yZHM6ID0+XG4gICAgaW5mb2JveCA9IEBjb250YWluZXIuZmluZChcIiMje0BtYXJrZXIuYXR0cignZGF0YS1pbmZvYm94Jyl9XCIpXG4gICAgbWFya2VyQ2VudGVyWCA9IChwYXJzZUZsb2F0KEByZWxhdGl2ZVBvc2l0aW9uKClbMF0gLyAxMDApICogQGNvbnRhaW5lci53aWR0aCgpKVxuICAgIG1hcmtlckNlbnRlclkgPSAocGFyc2VGbG9hdChAcmVsYXRpdmVQb3NpdGlvbigpWzFdIC8gMTAwKSAqIEBjb250YWluZXIuaGVpZ2h0KCkpXG4gICAgaVdpZHRoID0gaW5mb2JveC5vdXRlcldpZHRoKClcbiAgICBpSGFsZldpZHRoID0gaVdpZHRoIC8gMlxuICAgIGlIZWlnaHQgPSBpbmZvYm94Lm91dGVySGVpZ2h0KClcbiAgICBpSGFsZkhlaWdodCA9IGlIZWlnaHQgLyAyXG4gICAgY1dpZHRoID0gQGNvbnRhaW5lci53aWR0aCgpXG4gICAgY0hlaWdodCA9IEBjb250YWluZXIuaGVpZ2h0KClcbiAgICBtV2lkdGggPSBAbWFya2VyLm91dGVyV2lkdGgoKVxuICAgIG1IYWxmV2lkdGggPSBtV2lkdGggLyAyXG4gICAgbUhlaWdodCA9IEBtYXJrZXIub3V0ZXJIZWlnaHQoKVxuICAgIG1IYWxmSGVpZ2h0ID0gbUhlaWdodCAvIDJcbiAgICBidWZmZXIgPSA1XG4gICAgb2Zmc2V0WCA9IHBhcnNlSW50KGluZm9ib3guYXR0cignZGF0YS1vZmZzZXQteCcpKVxuICAgIG9mZnNldFggPSAwIHVubGVzcyBvZmZzZXRYXG4gICAgb2Zmc2V0WSA9IHBhcnNlSW50KGluZm9ib3guYXR0cignZGF0YS1vZmZzZXQteScpKVxuICAgIG9mZnNldFkgPSAwIHVubGVzcyBvZmZzZXRZXG4gICAgc3dpdGNoIGluZm9ib3guYXR0cignZGF0YS1wb3NpdGlvbicpXG4gICAgICB3aGVuICd0b3AnXG4gICAgICAgIGluZm9MZWZ0ID0gbWFya2VyQ2VudGVyWCAtIGlIYWxmV2lkdGhcbiAgICAgICAgaW5mb1RvcCA9IG1hcmtlckNlbnRlclkgLSBpSGVpZ2h0IC0gbUhhbGZIZWlnaHQgLSBidWZmZXJcbiAgICAgIHdoZW4gJ3JpZ2h0J1xuICAgICAgICBpbmZvTGVmdCA9IG1hcmtlckNlbnRlclggKyBtSGFsZldpZHRoICsgYnVmZmVyXG4gICAgICAgIGluZm9Ub3AgPSBtYXJrZXJDZW50ZXJZIC0gaUhhbGZIZWlnaHRcbiAgICAgIHdoZW4gJ2JvdHRvbSdcbiAgICAgICAgaW5mb0xlZnQgPSBtYXJrZXJDZW50ZXJYIC0gaUhhbGZXaWR0aFxuICAgICAgICBpbmZvVG9wID0gbWFya2VyQ2VudGVyWSArIG1IYWxmSGVpZ2h0ICsgYnVmZmVyXG4gICAgICB3aGVuICdsZWZ0J1xuICAgICAgICBpbmZvTGVmdCA9IG1hcmtlckNlbnRlclggLSBpV2lkdGggLSBtSGFsZldpZHRoIC0gYnVmZmVyXG4gICAgICAgIGluZm9Ub3AgPSBtYXJrZXJDZW50ZXJZIC0gaUhhbGZIZWlnaHRcbiAgICAgIHdoZW4gJ3RvcC1sZWZ0J1xuICAgICAgICBpbmZvTGVmdCA9IG1hcmtlckNlbnRlclggLSBpV2lkdGggLSBtSGFsZldpZHRoICsgYnVmZmVyXG4gICAgICAgIGluZm9Ub3AgPSBtYXJrZXJDZW50ZXJZIC0gaUhlaWdodCAtIG1IYWxmSGVpZ2h0ICsgYnVmZmVyXG4gICAgICB3aGVuICd0b3AtcmlnaHQnXG4gICAgICAgIGluZm9MZWZ0ID0gbWFya2VyQ2VudGVyWCArIG1IYWxmV2lkdGggLSBidWZmZXJcbiAgICAgICAgaW5mb1RvcCA9IG1hcmtlckNlbnRlclkgLSBpSGVpZ2h0IC0gbUhhbGZIZWlnaHQgKyBidWZmZXJcbiAgICAgIHdoZW4gJ2JvdHRvbS1sZWZ0J1xuICAgICAgICBpbmZvTGVmdCA9IG1hcmtlckNlbnRlclggLSBpV2lkdGggLSBtSGFsZldpZHRoICsgYnVmZmVyXG4gICAgICAgIGluZm9Ub3AgPSBtYXJrZXJDZW50ZXJZICsgbUhhbGZIZWlnaHQgLSBidWZmZXJcbiAgICAgIHdoZW4gJ2JvdHRvbS1yaWdodCdcbiAgICAgICAgaW5mb0xlZnQgPSBtYXJrZXJDZW50ZXJYICsgbUhhbGZXaWR0aCAtIGJ1ZmZlclxuICAgICAgICBpbmZvVG9wID0gbWFya2VyQ2VudGVyWSArIG1IYWxmSGVpZ2h0IC0gYnVmZmVyXG4gICAgbGVmdDogaW5mb0xlZnQgKyBvZmZzZXRYXG4gICAgdG9wOiBpbmZvVG9wICsgb2Zmc2V0WVxuXG4gIHBvc2l0aW9uSW5mb2JveDogPT5cbiAgICBjb29yZHMgPSBAaW5mb2JveENvb3JkcygpXG4gICAgQGNvbnRhaW5lci5maW5kKFwiIyN7QG1hcmtlci5hdHRyKCdkYXRhLWluZm9ib3gnKX1cIikuY3NzXG4gICAgICBsZWZ0OiBcIiN7Y29vcmRzLmxlZnR9cHhcIlxuICAgICAgdG9wOiBcIiN7Y29vcmRzLnRvcH1weFwiXG4gICAgQHBvc2l0aW9uKClcblxuICBhbmltYXRlSW5mb2JveDogPT5cbiAgICBjb29yZHMgPSBAaW5mb2JveENvb3JkcygpXG4gICAgQGNvbnRhaW5lci5maW5kKFwiIyN7QG1hcmtlci5hdHRyKCdkYXRhLWluZm9ib3gnKX1cIikuYW5pbWF0ZVxuICAgICAgbGVmdDogXCIje2Nvb3Jkcy5sZWZ0fXB4XCJcbiAgICAgIHRvcDogXCIje2Nvb3Jkcy50b3B9cHhcIlxuICAgICwgMjUwLCAoKSA9PlxuICAgICAgcmV0dXJuIEBwb3NpdGlvbigpXG5cbiAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gRHJhZ2dpbmdcblxuICBpc0RyYWdnYWJsZTogPT5cbiAgICBAbWFya2VyLmhhc0NsYXNzKCdkcmFnZ2FibGUnKVxuXG4gICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIEFjdGlvbnNcblxuICBzZXQ6ID0+XG4gICAgbGVmdCA9IChAaW1hZ2Uud2lkdGgoKSAqIChAbWFya2VyLmF0dHIoJ2RhdGEteFBjJykgLyAxMDApKSArXG4gICAgICBwYXJzZUZsb2F0KEBpbWFnZS5jc3MoJ2xlZnQnKSkgLSAoQG1hcmtlci5vdXRlcldpZHRoKCkgLyAyKVxuICAgIHRvcCA9IChAaW1hZ2UuaGVpZ2h0KCkgKiAoQG1hcmtlci5hdHRyKCdkYXRhLXlQYycpIC8gMTAwKSkgK1xuICAgICAgcGFyc2VGbG9hdChAaW1hZ2UuY3NzKCd0b3AnKSkgLSAoQG1hcmtlci5vdXRlckhlaWdodCgpIC8gMilcbiAgICBAbWFya2VyLmNzc1xuICAgICAgbGVmdDogXCIje2xlZnR9cHhcIlxuICAgICAgdG9wOiBcIiN7dG9wfXB4XCJcbiAgICBAcG9zaXRpb25JbmZvYm94KClcbiAgICBbbGVmdCwgdG9wXVxuXG4gIHNhdmVQb3NpdGlvbjogPT5cbiAgICBjb29yZHMgPSBAcG9zaXRpb24oKVxuICAgIEBtYXJrZXIuYXR0clxuICAgICAgJ2RhdGEteFBjJzogY29vcmRzWzBdXG4gICAgICAnZGF0YS15UGMnOiBjb29yZHNbMV1cblxuICB1cGRhdGU6IChvcHRpb25zKSA9PlxuICAgIGlmIG9wdGlvbnMuY29sb3JcbiAgICAgIEBtYXJrZXIuY3NzKGJhY2tncm91bmRDb2xvcjogb3B0aW9ucy5jb2xvcilcbiAgICBpZiBvcHRpb25zLmluZm9ib3hcbiAgICAgIEBtYXJrZXIuZmluZChcIi4je1BsYW5pdC5pbmZvYm94Q2xhc3N9XCIpLmh0bWwob3B0aW9ucy5pbmZvYm94KVxuICAgICAgQHBvc2l0aW9uSW5mb2JveCgpXG4gICAgaWYgb3B0aW9ucy5kcmFnZ2FibGVcbiAgICAgIEBtYXJrZXIucmVtb3ZlQ2xhc3MoJ2RyYWdnYWJsZScpXG4gICAgICBAbWFya2VyLmFkZENsYXNzKCdkcmFnZ2FibGUnKSBpZiBvcHRpb25zLmRyYWdnYWJsZSA9PSB0cnVlXG4gICAgaWYgb3B0aW9ucy5jb29yZHNcbiAgICAgIGxlZnQgPSAoKHBhcnNlRmxvYXQob3B0aW9ucy5jb29yZHNbMF0pIC8gMTAwKSAqIEBjb250YWluZXIud2lkdGgoKSkgLSAxNVxuICAgICAgdG9wID0gKChwYXJzZUZsb2F0KG9wdGlvbnMuY29vcmRzWzFdKSAvIDEwMCkgKiBAY29udGFpbmVyLmhlaWdodCgpKSAtIDE1XG4gICAgICBAbWFya2VyLmNzc1xuICAgICAgICBsZWZ0OiBcIiN7bGVmdH1weFwiXG4gICAgICAgIHRvcDogXCIje3RvcH1weFwiXG5cbiAgcmVtb3ZlOiA9PlxuICAgIEBpbmZvYm94KCkucmVtb3ZlKCkgaWYgQGluZm9ib3goKVxuICAgIEBtYXJrZXIucmVtb3ZlKClcblxuIyBhdHRhY2hlcyB0aGUgUGxhbml0IGNsYXNzIHRvIGEgZ2xvYmFsIHBsYW5pdCB2YXJpYWJsZVxud2luZG93LnBsYW5pdCA9IG5ldyBQbGFuaXRcbiJdfQ==