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
  var animateBackground, animateMarkers, initCanvasMarkers, initContainer, initEvents, initImage, initMarkers, initMethods, initOptions, initZoomControls, initZoomable, positionInfoboxes, setBackground, setMarkers;

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
    this.mouseup = bind(this.mouseup, this);
    this.mousemove = bind(this.mousemove, this);
    this.mousedown = bind(this.mousedown, this);
    this.dblclick = bind(this.dblclick, this);
    this.getEventContainerPosition = bind(this.getEventContainerPosition, this);
    this.imgOffsetTop = bind(this.imgOffsetTop, this);
    this.containerHeight = bind(this.containerHeight, this);
    this.imgHeightScrollIncrement = bind(this.imgHeightScrollIncrement, this);
    this.imgHeightClickIncrement = bind(this.imgHeightClickIncrement, this);
    this.imgHeight = bind(this.imgHeight, this);
    this.imgOffsetLeft = bind(this.imgOffsetLeft, this);
    this.containerWidth = bind(this.containerWidth, this);
    this.imgWidthScrollIncrement = bind(this.imgWidthScrollIncrement, this);
    this.imgWidthClickIncrement = bind(this.imgWidthClickIncrement, this);
    this.imgWidth = bind(this.imgWidth, this);
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
    this.container.on('dblclick', this.dblclick);
    this.container.on('mousedown', this.mousedown);
    $(document).on('mousemove', this.mousemove);
    return $(document).on('mouseup', this.mouseup);
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
        left = (this.imgWidth() * ($(marker).attr('data-xPc') / 100)) + this.imagePosition.leftPx - ($(marker).outerWidth() / 2);
        top = (this.imgHeight() * ($(marker).attr('data-yPc') / 100)) + this.imagePosition.topPx - ($(marker).outerHeight() / 2);
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
        left = (this.imgWidth() * ($(marker).attr('data-xPc') / 100)) + this.imagePosition.leftPx - ($(marker).outerWidth() / 2);
        top = (this.imgHeight() * ($(marker).attr('data-yPc') / 100)) + this.imagePosition.topPx - ($(marker).outerHeight() / 2);
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
    wMin = 50 * (this.containerWidth() / x);
    hMin = 50 * (this.containerHeight() / y);
    this.container.find("." + Planit.infoboxClass).removeClass('active');
    this.imagePosition.leftPx = -((this.imgWidth() * (coords[0] / 100)) - (this.containerWidth() / 2));
    this.imagePosition.topPx = -((this.imgHeight() * (coords[1] / 100)) - (this.containerHeight() / 2));
    while ((this.imgWidth() < wMin) || (this.imgHeight() < hMin)) {
      this.imagePosition.scale = this.imagePosition.scale + this.imagePosition.increment;
      this.imagePosition.leftPx = -((this.imgWidth() * (coords[0] / 100)) - (this.containerWidth() / 2));
      this.imagePosition.topPx = -((this.imgHeight() * (coords[1] / 100)) - (this.containerHeight() / 2));
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

  Plan.prototype.imgWidth = function() {
    return parseFloat(this.imagePosition.width * this.imagePosition.scale);
  };

  Plan.prototype.imgWidthClickIncrement = function() {
    return parseFloat(this.imagePosition.width * this.imagePosition.increment);
  };

  Plan.prototype.imgWidthScrollIncrement = function() {
    return parseFloat(this.imagePosition.width * this.imagePosition.scrollIncrement);
  };

  Plan.prototype.containerWidth = function() {
    return parseFloat(this.markersContainer.width());
  };

  Plan.prototype.imgOffsetLeft = function() {
    return Math.abs(parseFloat(this.image.css('left')));
  };

  Plan.prototype.imgHeight = function() {
    return parseFloat(this.imagePosition.height * this.imagePosition.scale);
  };

  Plan.prototype.imgHeightClickIncrement = function() {
    return parseFloat(this.imagePosition.height * this.imagePosition.increment);
  };

  Plan.prototype.imgHeightScrollIncrement = function() {
    return parseFloat(this.imagePosition.height * this.imagePosition.scrollIncrement);
  };

  Plan.prototype.containerHeight = function() {
    return parseFloat(this.markersContainer.height());
  };

  Plan.prototype.imgOffsetTop = function() {
    return Math.abs(parseFloat(this.image.css('top')));
  };

  Plan.prototype.getEventContainerPosition = function(e) {
    return {
      left: (e.pageX - this.container.offset().left) / this.containerWidth(),
      top: (e.pageY - this.container.offset().top) / this.containerHeight()
    };
  };

  Plan.prototype.dblclick = function(e) {
    var click;
    if ($(e.target).attr('data-zoom-id') === this.zoomId) {
      click = this.getEventContainerPosition(e);
      return this.zoomIn('click', click.left, click.top);
    }
  };

  Plan.prototype.mousedown = function(e) {
    var coords;
    if ($(e.target).attr('data-zoom-id') === this.zoomId && e.which === 1) {
      this.isDragging = true;
      coords = this.getEventContainerPosition(e);
      this.dragCoords = {
        pointRef: coords,
        imgRef: {
          left: 0 - this.imgOffsetLeft(),
          top: 0 - this.imgOffsetTop()
        },
        max: {
          right: (coords.left * this.containerWidth()) + this.imgOffsetLeft(),
          left: (coords.left * this.containerWidth()) - (this.imgWidth() - (this.containerWidth() + this.imgOffsetLeft())),
          bottom: (coords.top * this.containerHeight()) + this.imgOffsetTop(),
          top: (coords.top * this.containerHeight()) - (this.imgHeight() - (this.containerHeight() + this.imgOffsetTop()))
        }
      };
    }
    return true;
  };

  Plan.prototype.mousemove = function(e) {
    var coords, dragLeft, dragTop, left, top;
    if (this.isDragging) {
      coords = this.getEventContainerPosition(e);
      dragLeft = coords.left * this.containerWidth();
      dragTop = coords.top * this.containerHeight();
      if (dragLeft >= this.dragCoords.max.left && dragLeft <= this.dragCoords.max.right) {
        left = (coords.left - this.dragCoords.pointRef.left) * this.containerWidth();
        this.imagePosition.leftPx = this.dragCoords.imgRef.left + left;
      } else if (dragLeft < this.dragCoords.max.left) {
        this.imagePosition.leftPx = this.containerWidth() - this.imgWidth();
      } else if (dragLeft > this.dragCoords.max.right) {
        this.imagePosition.leftPx = 0;
      }
      if (dragTop >= this.dragCoords.max.top && dragTop <= this.dragCoords.max.bottom) {
        top = (coords.top - this.dragCoords.pointRef.top) * this.containerHeight();
        this.imagePosition.topPx = this.dragCoords.imgRef.top + top;
      } else if (dragTop < this.dragCoords.max.top) {
        this.imagePosition.topPx = this.containerHeight() - this.imgHeight();
      } else if (dragTop > this.dragCoords.max.bottom) {
        this.imagePosition.topPx = 0;
      }
      setBackground.call(this);
    }
    return true;
  };

  Plan.prototype.mouseup = function(e) {
    this.isDragging = false;
    positionInfoboxes.call(this);
    return true;
  };

  Plan.prototype.zoomIn = function() {
    this.imagePosition.scale = this.imagePosition.scale + this.imagePosition.increment;
    this.imagePosition.leftPx = -this.imgOffsetLeft() - (this.imgWidthClickIncrement() / 2);
    this.imagePosition.topPx = -this.imgOffsetTop() - (this.imgHeightClickIncrement() / 2);
    return animateBackground.call(this);
  };

  Plan.prototype.zoomOut = function() {
    var leftPx, topPx;
    if (this.imagePosition.scale > 1) {
      this.imagePosition.scale = this.imagePosition.scale - this.imagePosition.increment;
      leftPx = -this.imgOffsetLeft() + (this.imgWidthClickIncrement() / 2);
      topPx = -this.imgOffsetTop() + (this.imgHeightClickIncrement() / 2);
      if (leftPx > 0) {
        this.imagePosition.leftPx = 0;
      } else if (leftPx < this.containerWidth() - this.imgWidth()) {
        this.imagePosition.leftPx = this.containerWidth() - this.imgWidth();
      } else {
        this.imagePosition.leftPx = leftPx;
      }
      if (topPx > 0) {
        this.imagePosition.topPx = 0;
      } else if (topPx < this.containerHeight() - this.imgHeight()) {
        this.imagePosition.topPx = this.containerHeight() - this.imgHeight();
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInBsYW5pdC10bXAuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLElBQUEsTUFBQTtFQUFBLGdGQUFBOztBQUFBO3NCQUlFOztBQUFBLEVBQUEsTUFBQyxDQUFBLGNBQUQsR0FBd0Isa0JBQXhCLENBQUE7O0FBQUEsRUFDQSxNQUFDLENBQUEsYUFBRCxHQUF3QixhQUR4QixDQUFBOztBQUFBLEVBRUEsTUFBQyxDQUFBLGNBQUQsR0FBd0Isd0JBRnhCLENBQUE7O0FBQUEsRUFHQSxNQUFDLENBQUEsWUFBRCxHQUF3QixnQkFIeEIsQ0FBQTs7QUFBQSxFQUlBLE1BQUMsQ0FBQSxxQkFBRCxHQUF3QiwwQkFKeEIsQ0FBQTs7QUFBQSxFQUtBLE1BQUMsQ0FBQSxXQUFELEdBQXdCLGVBTHhCLENBQUE7O0FBQUEsRUFNQSxNQUFDLENBQUEsb0JBQUQsR0FBd0IsMEJBTnhCLENBQUE7O0FBQUEsRUFPQSxNQUFDLENBQUEsa0JBQUQsR0FBd0IsdUJBUHhCLENBQUE7O0FBQUEsbUJBV0EsTUFBQSxHQUFLLFNBQUMsUUFBRCxHQUFBO0FBQ0gsSUFESSxJQUFDLENBQUEsNkJBQUQsV0FBVyxFQUNmLENBQUE7QUFBQSxXQUFXLElBQUEsTUFBTSxDQUFDLElBQVAsQ0FBWSxJQUFDLENBQUEsT0FBYixDQUFYLENBREc7RUFBQSxDQVhMLENBQUE7O0FBQUEsRUFnQkEsTUFBQyxDQUFBLFlBQUQsR0FBZSxTQUFDLE1BQUQsR0FBQTtBQUNiLFFBQUEsR0FBQTs7TUFEYyxTQUFTO0tBQ3ZCO0FBQUEsSUFBQSxHQUFBLEdBQU0sSUFBSSxDQUFDLE1BQUwsQ0FBQSxDQUFhLENBQUMsUUFBZCxDQUF1QixFQUF2QixDQUEwQixDQUFDLEtBQTNCLENBQWlDLENBQWpDLENBQU4sQ0FBQTtBQUFBLElBQ0EsR0FBQSxHQUFNLEdBQUEsR0FBTSxJQUFJLENBQUMsTUFBTCxDQUFBLENBQWEsQ0FBQyxRQUFkLENBQXVCLEVBQXZCLENBQTBCLENBQUMsS0FBM0IsQ0FBaUMsQ0FBakMsQ0FEWixDQUFBO1dBRUEsR0FBRyxDQUFDLFNBQUosQ0FBYyxDQUFkLEVBQWlCLE1BQUEsR0FBUyxDQUExQixFQUhhO0VBQUEsQ0FoQmYsQ0FBQTs7Z0JBQUE7O0lBSkYsQ0FBQTs7QUFBQSxNQXlCWSxDQUFDO0FBS1gsTUFBQSwrTUFBQTs7QUFBYSxFQUFBLGNBQUMsUUFBRCxHQUFBO0FBQ1gsUUFBQSxtQkFBQTtBQUFBLElBRFksSUFBQyxDQUFBLDZCQUFELFdBQVcsRUFDdkIsQ0FBQTtBQUFBLG1EQUFBLENBQUE7QUFBQSxtREFBQSxDQUFBO0FBQUEsdURBQUEsQ0FBQTtBQUFBLCtDQUFBLENBQUE7QUFBQSwyQ0FBQSxDQUFBO0FBQUEsNkRBQUEsQ0FBQTtBQUFBLHlEQUFBLENBQUE7QUFBQSwyQ0FBQSxDQUFBO0FBQUEsMkNBQUEsQ0FBQTtBQUFBLHlDQUFBLENBQUE7QUFBQSwyQ0FBQSxDQUFBO0FBQUEsK0NBQUEsQ0FBQTtBQUFBLCtDQUFBLENBQUE7QUFBQSw2Q0FBQSxDQUFBO0FBQUEsK0VBQUEsQ0FBQTtBQUFBLHFEQUFBLENBQUE7QUFBQSwyREFBQSxDQUFBO0FBQUEsNkVBQUEsQ0FBQTtBQUFBLDJFQUFBLENBQUE7QUFBQSwrQ0FBQSxDQUFBO0FBQUEsdURBQUEsQ0FBQTtBQUFBLHlEQUFBLENBQUE7QUFBQSwyRUFBQSxDQUFBO0FBQUEseUVBQUEsQ0FBQTtBQUFBLDZDQUFBLENBQUE7QUFBQSx5Q0FBQSxDQUFBO0FBQUEsNkNBQUEsQ0FBQTtBQUFBLGlEQUFBLENBQUE7QUFBQTtBQUFBLFNBQUEscUNBQUE7c0JBQUE7QUFBQSxNQUFBLE1BQU0sQ0FBQyxJQUFQLENBQVksSUFBWixDQUFBLENBQUE7QUFBQSxLQURXO0VBQUEsQ0FBYjs7QUFBQSxFQU1BLFdBQUEsR0FBYyxTQUFBLEdBQUE7V0FDWixDQUFDLFdBQUQsRUFBYyxhQUFkLEVBQTZCLFNBQTdCLEVBQXdDLGlCQUF4QyxFQUEyRCxVQUEzRCxFQURZO0VBQUEsQ0FOZCxDQUFBOztBQUFBLEVBZUEsV0FBQSxHQUFjLFNBQUEsR0FBQTtBQUNaLElBQUEsSUFBRyxJQUFDLENBQUEsT0FBTyxDQUFDLFNBQVo7QUFDRSxNQUFBLElBQUMsQ0FBQSxPQUFPLENBQUMsU0FBVCxHQUFxQixDQUFBLENBQUUsR0FBQSxHQUFJLElBQUMsQ0FBQSxPQUFPLENBQUMsU0FBZixDQUFyQixDQURGO0tBQUEsTUFBQTtBQUdFLE1BQUEsSUFBQyxDQUFBLE9BQU8sQ0FBQyxTQUFULEdBQXFCLENBQUEsQ0FBRSxTQUFGLENBQXJCLENBSEY7S0FBQTtXQUtBLElBQUMsQ0FBQSxTQUFELEdBQWEsSUFBQyxDQUFBLE9BQU8sQ0FBQyxVQU5WO0VBQUEsQ0FmZCxDQUFBOztBQUFBLEVBMkJBLGFBQUEsR0FBZ0IsU0FBQSxHQUFBO0FBQ2QsSUFBQSxJQUFDLENBQUEsU0FBUyxDQUFDLFFBQVgsQ0FBb0IsTUFBTSxDQUFDLGNBQTNCLENBQUEsQ0FBQTtBQUFBLElBQ0EsSUFBQyxDQUFBLFNBQVMsQ0FBQyxNQUFYLENBQWtCLGVBQUEsR0FDRixNQUFNLENBQUMscUJBREwsR0FDMkIsMEJBRDNCLEdBRUYsTUFBTSxDQUFDLG9CQUZMLEdBRTBCLFdBRjVDLENBREEsQ0FBQTtXQUtBLElBQUMsQ0FBQSxnQkFBRCxHQUFvQixJQUFDLENBQUEsU0FBUyxDQUFDLElBQVgsQ0FBZ0IsR0FBQSxHQUFJLE1BQU0sQ0FBQyxvQkFBM0IsQ0FDbEIsQ0FBQyxLQURpQixDQUFBLEVBTk47RUFBQSxDQTNCaEIsQ0FBQTs7QUFBQSxFQXlDQSxTQUFBLEdBQVksU0FBQSxHQUFBO0FBQ1YsSUFBQSxJQUFHLElBQUMsQ0FBQSxPQUFPLENBQUMsS0FBVCxJQUFrQixJQUFDLENBQUEsT0FBTyxDQUFDLEtBQUssQ0FBQyxHQUFwQztBQUNFLE1BQUEsSUFBQyxDQUFBLFNBQVMsQ0FBQyxPQUFYLENBQW1CLGVBQUEsR0FDSCxNQUFNLENBQUMsY0FESixHQUNtQixvQkFEbkIsR0FFSCxJQUFDLENBQUEsT0FBTyxDQUFDLEtBQUssQ0FBQyxHQUZaLEdBRWdCLGFBRm5DLENBQUEsQ0FBQTtBQUFBLE1BS0EsSUFBQyxDQUFBLEtBQUQsR0FBUyxJQUFDLENBQUEsU0FBUyxDQUFDLElBQVgsQ0FBZ0IsS0FBaEIsQ0FBc0IsQ0FBQyxLQUF2QixDQUFBLENBTFQsQ0FBQTthQU1BLElBQUMsQ0FBQSxLQUFLLENBQUMsSUFBUCxDQUFZLENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFBLEdBQUE7QUFDVixVQUFBLEtBQUMsQ0FBQSxTQUFTLENBQUMsR0FBWCxDQUFlO0FBQUEsWUFBQSxNQUFBLEVBQVEsS0FBQyxDQUFBLEtBQUssQ0FBQyxNQUFQLENBQUEsQ0FBUjtXQUFmLENBQUEsQ0FBQTtBQUFBLFVBQ0EsWUFBWSxDQUFDLElBQWIsQ0FBa0IsS0FBbEIsQ0FEQSxDQUFBO2lCQUVBLFdBQVcsQ0FBQyxJQUFaLENBQWlCLEtBQWpCLEVBSFU7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFaLEVBUEY7S0FEVTtFQUFBLENBekNaLENBQUE7O0FBQUEsRUEyREEsWUFBQSxHQUFlLFNBQUEsR0FBQTtBQUViLElBQUEsSUFBQyxDQUFBLE1BQUQsR0FBVSxNQUFNLENBQUMsWUFBUCxDQUFBLENBQVYsQ0FBQTtBQUFBLElBQ0EsSUFBQyxDQUFBLGdCQUFnQixDQUFDLElBQWxCLENBQXVCLGNBQXZCLEVBQXVDLElBQUMsQ0FBQSxNQUF4QyxDQURBLENBQUE7QUFBQSxJQUdBLElBQUMsQ0FBQSxVQUFELENBQUEsQ0FIQSxDQUFBO0FBS0EsSUFBQSxJQUE0QixJQUFDLENBQUEsT0FBTyxDQUFDLEtBQUssQ0FBQyxJQUEzQzthQUFBLGdCQUFnQixDQUFDLElBQWpCLENBQXNCLElBQXRCLEVBQUE7S0FQYTtFQUFBLENBM0RmLENBQUE7O0FBQUEsRUF1RUEsZ0JBQUEsR0FBbUIsU0FBQSxHQUFBO0FBRWpCLElBQUEsSUFBQyxDQUFBLFNBQVMsQ0FBQyxPQUFYLENBQW1CLDRKQUFuQixDQUFBLENBQUE7QUFBQSxJQU1BLElBQUMsQ0FBQSxTQUFTLENBQUMsSUFBWCxDQUFnQix5QkFBaEIsQ0FBMEMsQ0FBQyxLQUEzQyxDQUFpRCxDQUFBLFNBQUEsS0FBQSxHQUFBO2FBQUEsU0FBQyxDQUFELEdBQUE7QUFDL0MsUUFBQSxDQUFDLENBQUMsY0FBRixDQUFBLENBQUEsQ0FBQTtlQUNBLEtBQUMsQ0FBQSxNQUFELENBQUEsRUFGK0M7TUFBQSxFQUFBO0lBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFqRCxDQU5BLENBQUE7QUFBQSxJQVNBLElBQUMsQ0FBQSxTQUFTLENBQUMsSUFBWCxDQUFnQiwwQkFBaEIsQ0FBMkMsQ0FBQyxLQUE1QyxDQUFrRCxDQUFBLFNBQUEsS0FBQSxHQUFBO2FBQUEsU0FBQyxDQUFELEdBQUE7QUFDaEQsUUFBQSxDQUFDLENBQUMsY0FBRixDQUFBLENBQUEsQ0FBQTtlQUNBLEtBQUMsQ0FBQSxPQUFELENBQUEsRUFGZ0Q7TUFBQSxFQUFBO0lBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFsRCxDQVRBLENBQUE7QUFBQSxJQWFBLElBQUMsQ0FBQSxTQUFTLENBQUMsRUFBWCxDQUFjLFVBQWQsRUFBMEIsSUFBQyxDQUFBLFFBQTNCLENBYkEsQ0FBQTtBQUFBLElBY0EsSUFBQyxDQUFBLFNBQVMsQ0FBQyxFQUFYLENBQWMsV0FBZCxFQUEyQixJQUFDLENBQUEsU0FBNUIsQ0FkQSxDQUFBO0FBQUEsSUFlQSxDQUFBLENBQUUsUUFBRixDQUFXLENBQUMsRUFBWixDQUFlLFdBQWYsRUFBNEIsSUFBQyxDQUFBLFNBQTdCLENBZkEsQ0FBQTtXQWdCQSxDQUFBLENBQUUsUUFBRixDQUFXLENBQUMsRUFBWixDQUFlLFNBQWYsRUFBMEIsSUFBQyxDQUFBLE9BQTNCLEVBbEJpQjtFQUFBLENBdkVuQixDQUFBOztBQUFBLEVBaUdBLGlCQUFBLEdBQW9CLFNBQUEsR0FBQTtBQUNsQixJQUFBLElBQUEsQ0FBQSxDQUEyQixJQUFDLENBQUEsT0FBTyxDQUFDLEtBQVQsSUFBa0IsSUFBQyxDQUFBLE9BQU8sQ0FBQyxLQUFLLENBQUMsR0FBNUQsQ0FBQTthQUFBLFdBQVcsQ0FBQyxJQUFaLENBQWlCLElBQWpCLEVBQUE7S0FEa0I7RUFBQSxDQWpHcEIsQ0FBQTs7QUFBQSxFQXVHQSxXQUFBLEdBQWMsU0FBQSxHQUFBO0FBQ1osUUFBQSw0QkFBQTtBQUFBLElBQUEsSUFBRyxJQUFDLENBQUEsT0FBTyxDQUFDLE9BQVQsSUFBb0IsSUFBQyxDQUFBLE9BQU8sQ0FBQyxPQUFPLENBQUMsTUFBakIsR0FBMEIsQ0FBakQ7QUFDRTtBQUFBO1dBQUEscUNBQUE7d0JBQUE7QUFDRSxRQUFBLE1BQU0sQ0FBQyxTQUFQLEdBQW1CLElBQUMsQ0FBQSxTQUFwQixDQUFBO0FBQUEscUJBQ0EsTUFBTSxDQUFDLE1BQU0sQ0FBQyxNQUFkLENBQXFCLE1BQXJCLEVBREEsQ0FERjtBQUFBO3FCQURGO0tBRFk7RUFBQSxDQXZHZCxDQUFBOztBQUFBLEVBbUhBLFVBQUEsR0FBYSxTQUFBLEdBQUE7QUFDWCxJQUFBLElBQUcsSUFBQyxDQUFBLFNBQVMsQ0FBQyxJQUFYLENBQWdCLEdBQUEsR0FBSSxNQUFNLENBQUMsY0FBWCxHQUEwQixRQUExQyxDQUFrRCxDQUFDLE1BQW5ELEdBQTRELENBQS9EO0FBQ0UsTUFBQSxJQUFDLENBQUEsS0FBRCxHQUFTLElBQUMsQ0FBQSxTQUFTLENBQUMsSUFBWCxDQUFnQixHQUFBLEdBQUksTUFBTSxDQUFDLGNBQVgsR0FBMEIsUUFBMUMsQ0FBa0QsQ0FBQyxLQUFuRCxDQUFBLENBQVQsQ0FERjtLQUFBO0FBQUEsSUFFQSxDQUFBLENBQUUsUUFBRixDQUFXLENBQUMsRUFBWixDQUFlLFdBQWYsRUFBNEIsSUFBQyxDQUFBLFNBQTdCLENBRkEsQ0FBQTtXQUdBLENBQUEsQ0FBRSxRQUFGLENBQVcsQ0FBQyxFQUFaLENBQWUsU0FBZixFQUEwQixJQUFDLENBQUEsT0FBM0IsRUFKVztFQUFBLENBbkhiLENBQUE7O0FBQUEsaUJBK0hBLFVBQUEsR0FBWSxTQUFBLEdBQUE7QUFDVixJQUFBLElBQUMsQ0FBQSxhQUFELEdBQ0U7QUFBQSxNQUFBLE1BQUEsRUFBZ0IsQ0FBaEI7QUFBQSxNQUNBLEtBQUEsRUFBZ0IsQ0FEaEI7QUFBQSxNQUVBLEtBQUEsRUFBZ0IsSUFBQyxDQUFBLEtBQUssQ0FBQyxLQUFQLENBQUEsQ0FGaEI7QUFBQSxNQUdBLE1BQUEsRUFBZ0IsSUFBQyxDQUFBLEtBQUssQ0FBQyxNQUFQLENBQUEsQ0FIaEI7QUFBQSxNQUlBLEtBQUEsRUFBZ0IsQ0FKaEI7QUFBQSxNQUtBLFNBQUEsRUFBZ0IsR0FMaEI7S0FERixDQUFBO1dBT0EsYUFBYSxDQUFDLElBQWQsQ0FBbUIsSUFBbkIsRUFSVTtFQUFBLENBL0haLENBQUE7O0FBQUEsRUE2SUEsYUFBQSxHQUFnQixTQUFBLEdBQUE7QUFDZCxJQUFBLElBQUMsQ0FBQSxLQUFLLENBQUMsR0FBUCxDQUNFO0FBQUEsTUFBQSxJQUFBLEVBQVMsSUFBQyxDQUFBLGFBQWEsQ0FBQyxNQUFoQixHQUF1QixJQUEvQjtBQUFBLE1BQ0EsR0FBQSxFQUFRLElBQUMsQ0FBQSxhQUFhLENBQUMsS0FBaEIsR0FBc0IsSUFEN0I7QUFBQSxNQUVBLEtBQUEsRUFBUyxDQUFDLElBQUMsQ0FBQSxhQUFhLENBQUMsS0FBZixHQUF1QixLQUF4QixDQUFBLEdBQThCLEdBRnZDO0FBQUEsTUFHQSxNQUFBLEVBQVEsTUFIUjtLQURGLENBQUEsQ0FBQTtXQUtBLFVBQVUsQ0FBQyxJQUFYLENBQWdCLElBQWhCLEVBTmM7RUFBQSxDQTdJaEIsQ0FBQTs7QUFBQSxFQXdKQSxpQkFBQSxHQUFvQixTQUFBLEdBQUE7QUFDbEIsSUFBQSxJQUFDLENBQUEsS0FBSyxDQUFDLE9BQVAsQ0FDRTtBQUFBLE1BQUEsSUFBQSxFQUFTLElBQUMsQ0FBQSxhQUFhLENBQUMsTUFBaEIsR0FBdUIsSUFBL0I7QUFBQSxNQUNBLEdBQUEsRUFBUSxJQUFDLENBQUEsYUFBYSxDQUFDLEtBQWhCLEdBQXNCLElBRDdCO0FBQUEsTUFFQSxLQUFBLEVBQVMsQ0FBQyxJQUFDLENBQUEsYUFBYSxDQUFDLEtBQWYsR0FBdUIsS0FBeEIsQ0FBQSxHQUE4QixHQUZ2QztBQUFBLE1BR0EsTUFBQSxFQUFRLE1BSFI7S0FERixFQUtFLEdBTEYsQ0FBQSxDQUFBO1dBTUEsY0FBYyxDQUFDLElBQWYsQ0FBb0IsSUFBcEIsRUFQa0I7RUFBQSxDQXhKcEIsQ0FBQTs7QUFBQSxFQXNLQSxVQUFBLEdBQWEsU0FBQSxHQUFBO0FBQ1gsUUFBQSxrQ0FBQTtBQUFBLElBQUEsT0FBQSxHQUFVLElBQUMsQ0FBQSxTQUFTLENBQUMsSUFBWCxDQUFnQixHQUFBLEdBQUksTUFBTSxDQUFDLFdBQTNCLENBQVYsQ0FBQTtBQUNBLElBQUEsSUFBRyxPQUFPLENBQUMsTUFBUixHQUFpQixDQUFwQjtBQUNFLFdBQUEseUNBQUE7NEJBQUE7QUFDRSxRQUFBLElBQUEsR0FBTyxDQUFDLElBQUMsQ0FBQSxRQUFELENBQUEsQ0FBQSxHQUFjLENBQUMsQ0FBQSxDQUFFLE1BQUYsQ0FBUyxDQUFDLElBQVYsQ0FBZSxVQUFmLENBQUEsR0FBNkIsR0FBOUIsQ0FBZixDQUFBLEdBQ0wsSUFBQyxDQUFBLGFBQWEsQ0FBQyxNQURWLEdBQ21CLENBQUMsQ0FBQSxDQUFFLE1BQUYsQ0FBUyxDQUFDLFVBQVYsQ0FBQSxDQUFBLEdBQXlCLENBQTFCLENBRDFCLENBQUE7QUFBQSxRQUVBLEdBQUEsR0FBTSxDQUFDLElBQUMsQ0FBQSxTQUFELENBQUEsQ0FBQSxHQUFlLENBQUMsQ0FBQSxDQUFFLE1BQUYsQ0FBUyxDQUFDLElBQVYsQ0FBZSxVQUFmLENBQUEsR0FBNkIsR0FBOUIsQ0FBaEIsQ0FBQSxHQUNKLElBQUMsQ0FBQSxhQUFhLENBQUMsS0FEWCxHQUNtQixDQUFDLENBQUEsQ0FBRSxNQUFGLENBQVMsQ0FBQyxXQUFWLENBQUEsQ0FBQSxHQUEwQixDQUEzQixDQUh6QixDQUFBO0FBQUEsUUFJQSxDQUFBLENBQUUsTUFBRixDQUFTLENBQUMsR0FBVixDQUNFO0FBQUEsVUFBQSxJQUFBLEVBQVMsSUFBRCxHQUFNLElBQWQ7QUFBQSxVQUNBLEdBQUEsRUFBUSxHQUFELEdBQUssSUFEWjtTQURGLENBSkEsQ0FERjtBQUFBLE9BQUE7YUFRQSxpQkFBaUIsQ0FBQyxJQUFsQixDQUF1QixJQUF2QixFQVRGO0tBRlc7RUFBQSxDQXRLYixDQUFBOztBQUFBLEVBcUxBLGNBQUEsR0FBaUIsU0FBQSxHQUFBO0FBQ2YsUUFBQSw4Q0FBQTtBQUFBLElBQUEsT0FBQSxHQUFVLElBQUMsQ0FBQSxTQUFTLENBQUMsSUFBWCxDQUFnQixHQUFBLEdBQUksTUFBTSxDQUFDLFdBQTNCLENBQVYsQ0FBQTtBQUNBLElBQUEsSUFBRyxPQUFPLENBQUMsTUFBUixHQUFpQixDQUFwQjtBQUNFO1dBQUEseUNBQUE7NEJBQUE7QUFDRSxRQUFBLENBQUEsR0FBUSxJQUFBLE1BQU0sQ0FBQyxNQUFQLENBQWMsSUFBQyxDQUFBLFNBQWYsRUFBMEIsQ0FBQSxDQUFFLE1BQUYsQ0FBUyxDQUFDLElBQVYsQ0FBZSxhQUFmLENBQTFCLENBQVIsQ0FBQTtBQUFBLFFBQ0EsQ0FBQyxDQUFDLFdBQUYsQ0FBQSxDQURBLENBQUE7QUFBQSxRQUVBLElBQUEsR0FBTyxDQUFDLElBQUMsQ0FBQSxRQUFELENBQUEsQ0FBQSxHQUFjLENBQUMsQ0FBQSxDQUFFLE1BQUYsQ0FBUyxDQUFDLElBQVYsQ0FBZSxVQUFmLENBQUEsR0FBNkIsR0FBOUIsQ0FBZixDQUFBLEdBQ0wsSUFBQyxDQUFBLGFBQWEsQ0FBQyxNQURWLEdBQ21CLENBQUMsQ0FBQSxDQUFFLE1BQUYsQ0FBUyxDQUFDLFVBQVYsQ0FBQSxDQUFBLEdBQXlCLENBQTFCLENBSDFCLENBQUE7QUFBQSxRQUlBLEdBQUEsR0FBTSxDQUFDLElBQUMsQ0FBQSxTQUFELENBQUEsQ0FBQSxHQUFlLENBQUMsQ0FBQSxDQUFFLE1BQUYsQ0FBUyxDQUFDLElBQVYsQ0FBZSxVQUFmLENBQUEsR0FBNkIsR0FBOUIsQ0FBaEIsQ0FBQSxHQUNKLElBQUMsQ0FBQSxhQUFhLENBQUMsS0FEWCxHQUNtQixDQUFDLENBQUEsQ0FBRSxNQUFGLENBQVMsQ0FBQyxXQUFWLENBQUEsQ0FBQSxHQUEwQixDQUEzQixDQUx6QixDQUFBO0FBQUEscUJBTUcsQ0FBQSxTQUFDLENBQUQsR0FBQTtpQkFDRCxDQUFBLENBQUUsTUFBRixDQUFTLENBQUMsT0FBVixDQUNFO0FBQUEsWUFBQSxJQUFBLEVBQVMsSUFBRCxHQUFNLElBQWQ7QUFBQSxZQUNBLEdBQUEsRUFBUSxHQUFELEdBQUssSUFEWjtXQURGLEVBR0UsR0FIRixFQUdPLENBQUEsU0FBQSxLQUFBLEdBQUE7bUJBQUEsU0FBQSxHQUFBO0FBQ0wsY0FBQSxDQUFDLENBQUMsZUFBRixDQUFBLENBQUEsQ0FBQTtxQkFDQSxDQUFDLENBQUMsYUFBRixDQUFBLEVBRks7WUFBQSxFQUFBO1VBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUhQLEVBREM7UUFBQSxDQUFBLENBQUgsQ0FBSSxDQUFKLEVBTkEsQ0FERjtBQUFBO3FCQURGO0tBRmU7RUFBQSxDQXJMakIsQ0FBQTs7QUFBQSxFQTRNQSxpQkFBQSxHQUFvQixTQUFBLEdBQUE7QUFDbEIsUUFBQSxzQkFBQTtBQUFBO0FBQUEsU0FBQSxxQ0FBQTtzQkFBQTtBQUNFLE1BQUEsQ0FBQSxHQUFRLElBQUEsTUFBTSxDQUFDLE1BQVAsQ0FBYyxJQUFDLENBQUEsU0FBZixFQUEwQixDQUFBLENBQUUsTUFBRixDQUFTLENBQUMsSUFBVixDQUFlLGFBQWYsQ0FBMUIsQ0FBUixDQUFBO0FBQUEsTUFDQSxDQUFDLENBQUMsZUFBRixDQUFBLENBREEsQ0FERjtBQUFBLEtBQUE7V0FHQSxLQUprQjtFQUFBLENBNU1wQixDQUFBOztBQUFBLGlCQXdOQSxRQUFBLEdBQVUsU0FBQyxNQUFELEdBQUE7QUFDUixRQUFBLGdCQUFBO0FBQUEsSUFBQSxJQUFHLE1BQU8sQ0FBQSxDQUFBLENBQVAsSUFBYSxFQUFoQjtBQUF3QixNQUFBLENBQUEsR0FBSSxHQUFBLEdBQU0sTUFBTyxDQUFBLENBQUEsQ0FBakIsQ0FBeEI7S0FBQSxNQUFBO0FBQWlELE1BQUEsQ0FBQSxHQUFJLE1BQU8sQ0FBQSxDQUFBLENBQVgsQ0FBakQ7S0FBQTtBQUNBLElBQUEsSUFBRyxNQUFPLENBQUEsQ0FBQSxDQUFQLElBQWEsRUFBaEI7QUFBd0IsTUFBQSxDQUFBLEdBQUksR0FBQSxHQUFNLE1BQU8sQ0FBQSxDQUFBLENBQWpCLENBQXhCO0tBQUEsTUFBQTtBQUFpRCxNQUFBLENBQUEsR0FBSSxNQUFPLENBQUEsQ0FBQSxDQUFYLENBQWpEO0tBREE7QUFBQSxJQUVBLElBQUEsR0FBTyxFQUFBLEdBQUssQ0FBQyxJQUFDLENBQUEsY0FBRCxDQUFBLENBQUEsR0FBb0IsQ0FBckIsQ0FGWixDQUFBO0FBQUEsSUFHQSxJQUFBLEdBQU8sRUFBQSxHQUFLLENBQUMsSUFBQyxDQUFBLGVBQUQsQ0FBQSxDQUFBLEdBQXFCLENBQXRCLENBSFosQ0FBQTtBQUFBLElBTUEsSUFBQyxDQUFBLFNBQVMsQ0FBQyxJQUFYLENBQWdCLEdBQUEsR0FBSSxNQUFNLENBQUMsWUFBM0IsQ0FBMEMsQ0FBQyxXQUEzQyxDQUF1RCxRQUF2RCxDQU5BLENBQUE7QUFBQSxJQVFBLElBQUMsQ0FBQSxhQUFhLENBQUMsTUFBZixHQUF3QixDQUFBLENBQ3RCLENBQUMsSUFBQyxDQUFBLFFBQUQsQ0FBQSxDQUFBLEdBQWMsQ0FBQyxNQUFPLENBQUEsQ0FBQSxDQUFQLEdBQVksR0FBYixDQUFmLENBQUEsR0FBb0MsQ0FBQyxJQUFDLENBQUEsY0FBRCxDQUFBLENBQUEsR0FBb0IsQ0FBckIsQ0FEWixDQVIxQixDQUFBO0FBQUEsSUFXQSxJQUFDLENBQUEsYUFBYSxDQUFDLEtBQWYsR0FBdUIsQ0FBQSxDQUNyQixDQUFDLElBQUMsQ0FBQSxTQUFELENBQUEsQ0FBQSxHQUFlLENBQUMsTUFBTyxDQUFBLENBQUEsQ0FBUCxHQUFZLEdBQWIsQ0FBaEIsQ0FBQSxHQUFxQyxDQUFDLElBQUMsQ0FBQSxlQUFELENBQUEsQ0FBQSxHQUFxQixDQUF0QixDQURkLENBWHpCLENBQUE7QUFnQkEsV0FBTSxDQUFDLElBQUMsQ0FBQSxRQUFELENBQUEsQ0FBQSxHQUFjLElBQWYsQ0FBQSxJQUF3QixDQUFDLElBQUMsQ0FBQSxTQUFELENBQUEsQ0FBQSxHQUFlLElBQWhCLENBQTlCLEdBQUE7QUFDRSxNQUFBLElBQUMsQ0FBQSxhQUFhLENBQUMsS0FBZixHQUF3QixJQUFDLENBQUEsYUFBYSxDQUFDLEtBQWYsR0FBdUIsSUFBQyxDQUFBLGFBQWEsQ0FBQyxTQUE5RCxDQUFBO0FBQUEsTUFDQSxJQUFDLENBQUEsYUFBYSxDQUFDLE1BQWYsR0FBd0IsQ0FBQSxDQUN0QixDQUFDLElBQUMsQ0FBQSxRQUFELENBQUEsQ0FBQSxHQUFjLENBQUMsTUFBTyxDQUFBLENBQUEsQ0FBUCxHQUFZLEdBQWIsQ0FBZixDQUFBLEdBQW9DLENBQUMsSUFBQyxDQUFBLGNBQUQsQ0FBQSxDQUFBLEdBQW9CLENBQXJCLENBRFosQ0FEMUIsQ0FBQTtBQUFBLE1BSUEsSUFBQyxDQUFBLGFBQWEsQ0FBQyxLQUFmLEdBQXVCLENBQUEsQ0FDckIsQ0FBQyxJQUFDLENBQUEsU0FBRCxDQUFBLENBQUEsR0FBZSxDQUFDLE1BQU8sQ0FBQSxDQUFBLENBQVAsR0FBWSxHQUFiLENBQWhCLENBQUEsR0FBcUMsQ0FBQyxJQUFDLENBQUEsZUFBRCxDQUFBLENBQUEsR0FBcUIsQ0FBdEIsQ0FEZCxDQUp6QixDQURGO0lBQUEsQ0FoQkE7QUFBQSxJQXdCQSxpQkFBaUIsQ0FBQyxJQUFsQixDQUF1QixJQUF2QixDQXhCQSxDQUFBO1dBeUJBLE9BMUJRO0VBQUEsQ0F4TlYsQ0FBQTs7QUFBQSxpQkF1UEEsTUFBQSxHQUFRLFNBQUMsS0FBRCxHQUFBO0FBQ04sUUFBQSxDQUFBO0FBQUEsSUFBQSxDQUFBLEdBQUksSUFBQyxDQUFBLGFBQWEsQ0FBQyxTQUFuQixDQUFBO0FBQ0EsSUFBQSxJQUFPLENBQUMsQ0FBQyxLQUFBLEdBQVEsQ0FBVCxDQUFBLEdBQWMsQ0FBZixDQUFBLEtBQXFCLElBQUMsQ0FBQSxhQUFhLENBQUMsS0FBM0M7QUFDRSxNQUFBLElBQUMsQ0FBQSxhQUFhLENBQUMsS0FBZixHQUF1QixDQUFDLEtBQUEsR0FBUSxDQUFULENBQUEsR0FBYyxDQUFkLEdBQWtCLENBQXpDLENBQUE7QUFBQSxNQUNBLElBQUMsQ0FBQSxPQUFELENBQUEsQ0FEQSxDQURGO0tBREE7V0FJQSxNQUxNO0VBQUEsQ0F2UFIsQ0FBQTs7QUFBQSxpQkFnUUEsUUFBQSxHQUFVLFNBQUEsR0FBQTtXQUNSLFVBQUEsQ0FBVyxJQUFDLENBQUEsYUFBYSxDQUFDLEtBQWYsR0FBdUIsSUFBQyxDQUFBLGFBQWEsQ0FBQyxLQUFqRCxFQURRO0VBQUEsQ0FoUVYsQ0FBQTs7QUFBQSxpQkFtUUEsc0JBQUEsR0FBd0IsU0FBQSxHQUFBO1dBQ3RCLFVBQUEsQ0FBVyxJQUFDLENBQUEsYUFBYSxDQUFDLEtBQWYsR0FBdUIsSUFBQyxDQUFBLGFBQWEsQ0FBQyxTQUFqRCxFQURzQjtFQUFBLENBblF4QixDQUFBOztBQUFBLGlCQXNRQSx1QkFBQSxHQUF5QixTQUFBLEdBQUE7V0FDdkIsVUFBQSxDQUFXLElBQUMsQ0FBQSxhQUFhLENBQUMsS0FBZixHQUF1QixJQUFDLENBQUEsYUFBYSxDQUFDLGVBQWpELEVBRHVCO0VBQUEsQ0F0UXpCLENBQUE7O0FBQUEsaUJBeVFBLGNBQUEsR0FBZ0IsU0FBQSxHQUFBO1dBQ2QsVUFBQSxDQUFXLElBQUMsQ0FBQSxnQkFBZ0IsQ0FBQyxLQUFsQixDQUFBLENBQVgsRUFEYztFQUFBLENBelFoQixDQUFBOztBQUFBLGlCQThRQSxhQUFBLEdBQWUsU0FBQSxHQUFBO1dBQ2IsSUFBSSxDQUFDLEdBQUwsQ0FBUyxVQUFBLENBQVcsSUFBQyxDQUFBLEtBQUssQ0FBQyxHQUFQLENBQVcsTUFBWCxDQUFYLENBQVQsRUFEYTtFQUFBLENBOVFmLENBQUE7O0FBQUEsaUJBbVJBLFNBQUEsR0FBVyxTQUFBLEdBQUE7V0FDVCxVQUFBLENBQVcsSUFBQyxDQUFBLGFBQWEsQ0FBQyxNQUFmLEdBQXdCLElBQUMsQ0FBQSxhQUFhLENBQUMsS0FBbEQsRUFEUztFQUFBLENBblJYLENBQUE7O0FBQUEsaUJBc1JBLHVCQUFBLEdBQXlCLFNBQUEsR0FBQTtXQUN2QixVQUFBLENBQVcsSUFBQyxDQUFBLGFBQWEsQ0FBQyxNQUFmLEdBQXdCLElBQUMsQ0FBQSxhQUFhLENBQUMsU0FBbEQsRUFEdUI7RUFBQSxDQXRSekIsQ0FBQTs7QUFBQSxpQkF5UkEsd0JBQUEsR0FBMEIsU0FBQSxHQUFBO1dBQ3hCLFVBQUEsQ0FBVyxJQUFDLENBQUEsYUFBYSxDQUFDLE1BQWYsR0FBd0IsSUFBQyxDQUFBLGFBQWEsQ0FBQyxlQUFsRCxFQUR3QjtFQUFBLENBelIxQixDQUFBOztBQUFBLGlCQTRSQSxlQUFBLEdBQWlCLFNBQUEsR0FBQTtXQUNmLFVBQUEsQ0FBVyxJQUFDLENBQUEsZ0JBQWdCLENBQUMsTUFBbEIsQ0FBQSxDQUFYLEVBRGU7RUFBQSxDQTVSakIsQ0FBQTs7QUFBQSxpQkFpU0EsWUFBQSxHQUFjLFNBQUEsR0FBQTtXQUNaLElBQUksQ0FBQyxHQUFMLENBQVMsVUFBQSxDQUFXLElBQUMsQ0FBQSxLQUFLLENBQUMsR0FBUCxDQUFXLEtBQVgsQ0FBWCxDQUFULEVBRFk7RUFBQSxDQWpTZCxDQUFBOztBQUFBLGlCQXNTQSx5QkFBQSxHQUEyQixTQUFDLENBQUQsR0FBQTtXQUN6QjtBQUFBLE1BQUEsSUFBQSxFQUFNLENBQUMsQ0FBQyxDQUFDLEtBQUYsR0FBVSxJQUFDLENBQUEsU0FBUyxDQUFDLE1BQVgsQ0FBQSxDQUFtQixDQUFDLElBQS9CLENBQUEsR0FBdUMsSUFBQyxDQUFBLGNBQUQsQ0FBQSxDQUE3QztBQUFBLE1BQ0EsR0FBQSxFQUFNLENBQUMsQ0FBQyxDQUFDLEtBQUYsR0FBVSxJQUFDLENBQUEsU0FBUyxDQUFDLE1BQVgsQ0FBQSxDQUFtQixDQUFDLEdBQS9CLENBQUEsR0FBc0MsSUFBQyxDQUFBLGVBQUQsQ0FBQSxDQUQ1QztNQUR5QjtFQUFBLENBdFMzQixDQUFBOztBQUFBLGlCQTRTQSxRQUFBLEdBQVUsU0FBQyxDQUFELEdBQUE7QUFDUixRQUFBLEtBQUE7QUFBQSxJQUFBLElBQUcsQ0FBQSxDQUFFLENBQUMsQ0FBQyxNQUFKLENBQVcsQ0FBQyxJQUFaLENBQWlCLGNBQWpCLENBQUEsS0FBb0MsSUFBQyxDQUFBLE1BQXhDO0FBQ0UsTUFBQSxLQUFBLEdBQVEsSUFBQyxDQUFBLHlCQUFELENBQTJCLENBQTNCLENBQVIsQ0FBQTthQUNBLElBQUMsQ0FBQSxNQUFELENBQVEsT0FBUixFQUFpQixLQUFLLENBQUMsSUFBdkIsRUFBNkIsS0FBSyxDQUFDLEdBQW5DLEVBRkY7S0FEUTtFQUFBLENBNVNWLENBQUE7O0FBQUEsaUJBaVRBLFNBQUEsR0FBVyxTQUFDLENBQUQsR0FBQTtBQUNULFFBQUEsTUFBQTtBQUFBLElBQUEsSUFBRyxDQUFBLENBQUUsQ0FBQyxDQUFDLE1BQUosQ0FBVyxDQUFDLElBQVosQ0FBaUIsY0FBakIsQ0FBQSxLQUFvQyxJQUFDLENBQUEsTUFBckMsSUFBK0MsQ0FBQyxDQUFDLEtBQUYsS0FBVyxDQUE3RDtBQUNFLE1BQUEsSUFBQyxDQUFBLFVBQUQsR0FBYyxJQUFkLENBQUE7QUFBQSxNQUNBLE1BQUEsR0FBUyxJQUFDLENBQUEseUJBQUQsQ0FBMkIsQ0FBM0IsQ0FEVCxDQUFBO0FBQUEsTUFFQSxJQUFDLENBQUEsVUFBRCxHQUNFO0FBQUEsUUFBQSxRQUFBLEVBQVUsTUFBVjtBQUFBLFFBQ0EsTUFBQSxFQUNFO0FBQUEsVUFBQSxJQUFBLEVBQU0sQ0FBQSxHQUFJLElBQUMsQ0FBQSxhQUFELENBQUEsQ0FBVjtBQUFBLFVBQ0EsR0FBQSxFQUFLLENBQUEsR0FBSSxJQUFDLENBQUEsWUFBRCxDQUFBLENBRFQ7U0FGRjtBQUFBLFFBSUEsR0FBQSxFQUNFO0FBQUEsVUFBQSxLQUFBLEVBQU8sQ0FBQyxNQUFNLENBQUMsSUFBUCxHQUFjLElBQUMsQ0FBQSxjQUFELENBQUEsQ0FBZixDQUFBLEdBQW9DLElBQUMsQ0FBQSxhQUFELENBQUEsQ0FBM0M7QUFBQSxVQUNBLElBQUEsRUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFQLEdBQWMsSUFBQyxDQUFBLGNBQUQsQ0FBQSxDQUFmLENBQUEsR0FBb0MsQ0FBQyxJQUFDLENBQUEsUUFBRCxDQUFBLENBQUEsR0FDL0IsQ0FBQyxJQUFDLENBQUEsY0FBRCxDQUFBLENBQUEsR0FBb0IsSUFBQyxDQUFBLGFBQUQsQ0FBQSxDQUFyQixDQUQ4QixDQUQxQztBQUFBLFVBR0EsTUFBQSxFQUFRLENBQUMsTUFBTSxDQUFDLEdBQVAsR0FBYSxJQUFDLENBQUEsZUFBRCxDQUFBLENBQWQsQ0FBQSxHQUFvQyxJQUFDLENBQUEsWUFBRCxDQUFBLENBSDVDO0FBQUEsVUFJQSxHQUFBLEVBQUssQ0FBQyxNQUFNLENBQUMsR0FBUCxHQUFhLElBQUMsQ0FBQSxlQUFELENBQUEsQ0FBZCxDQUFBLEdBQW9DLENBQUMsSUFBQyxDQUFBLFNBQUQsQ0FBQSxDQUFBLEdBQzlCLENBQUMsSUFBQyxDQUFBLGVBQUQsQ0FBQSxDQUFBLEdBQXFCLElBQUMsQ0FBQSxZQUFELENBQUEsQ0FBdEIsQ0FENkIsQ0FKekM7U0FMRjtPQUhGLENBREY7S0FBQTtXQWVBLEtBaEJTO0VBQUEsQ0FqVFgsQ0FBQTs7QUFBQSxpQkFtVUEsU0FBQSxHQUFXLFNBQUMsQ0FBRCxHQUFBO0FBQ1QsUUFBQSxvQ0FBQTtBQUFBLElBQUEsSUFBRyxJQUFDLENBQUEsVUFBSjtBQUNFLE1BQUEsTUFBQSxHQUFTLElBQUMsQ0FBQSx5QkFBRCxDQUEyQixDQUEzQixDQUFULENBQUE7QUFBQSxNQUNBLFFBQUEsR0FBVyxNQUFNLENBQUMsSUFBUCxHQUFjLElBQUMsQ0FBQSxjQUFELENBQUEsQ0FEekIsQ0FBQTtBQUFBLE1BRUEsT0FBQSxHQUFVLE1BQU0sQ0FBQyxHQUFQLEdBQWEsSUFBQyxDQUFBLGVBQUQsQ0FBQSxDQUZ2QixDQUFBO0FBR0EsTUFBQSxJQUFHLFFBQUEsSUFBWSxJQUFDLENBQUEsVUFBVSxDQUFDLEdBQUcsQ0FBQyxJQUE1QixJQUFvQyxRQUFBLElBQVksSUFBQyxDQUFBLFVBQVUsQ0FBQyxHQUFHLENBQUMsS0FBbkU7QUFDRSxRQUFBLElBQUEsR0FBTyxDQUFDLE1BQU0sQ0FBQyxJQUFQLEdBQWMsSUFBQyxDQUFBLFVBQVUsQ0FBQyxRQUFRLENBQUMsSUFBcEMsQ0FBQSxHQUE0QyxJQUFDLENBQUEsY0FBRCxDQUFBLENBQW5ELENBQUE7QUFBQSxRQUNBLElBQUMsQ0FBQSxhQUFhLENBQUMsTUFBZixHQUF3QixJQUFDLENBQUEsVUFBVSxDQUFDLE1BQU0sQ0FBQyxJQUFuQixHQUEwQixJQURsRCxDQURGO09BQUEsTUFHSyxJQUFHLFFBQUEsR0FBVyxJQUFDLENBQUEsVUFBVSxDQUFDLEdBQUcsQ0FBQyxJQUE5QjtBQUNILFFBQUEsSUFBQyxDQUFBLGFBQWEsQ0FBQyxNQUFmLEdBQXdCLElBQUMsQ0FBQSxjQUFELENBQUEsQ0FBQSxHQUFvQixJQUFDLENBQUEsUUFBRCxDQUFBLENBQTVDLENBREc7T0FBQSxNQUVBLElBQUcsUUFBQSxHQUFXLElBQUMsQ0FBQSxVQUFVLENBQUMsR0FBRyxDQUFDLEtBQTlCO0FBQ0gsUUFBQSxJQUFDLENBQUEsYUFBYSxDQUFDLE1BQWYsR0FBd0IsQ0FBeEIsQ0FERztPQVJMO0FBVUEsTUFBQSxJQUFHLE9BQUEsSUFBVyxJQUFDLENBQUEsVUFBVSxDQUFDLEdBQUcsQ0FBQyxHQUEzQixJQUFrQyxPQUFBLElBQVcsSUFBQyxDQUFBLFVBQVUsQ0FBQyxHQUFHLENBQUMsTUFBaEU7QUFDRSxRQUFBLEdBQUEsR0FBTSxDQUFDLE1BQU0sQ0FBQyxHQUFQLEdBQWEsSUFBQyxDQUFBLFVBQVUsQ0FBQyxRQUFRLENBQUMsR0FBbkMsQ0FBQSxHQUEwQyxJQUFDLENBQUEsZUFBRCxDQUFBLENBQWhELENBQUE7QUFBQSxRQUNBLElBQUMsQ0FBQSxhQUFhLENBQUMsS0FBZixHQUF1QixJQUFDLENBQUEsVUFBVSxDQUFDLE1BQU0sQ0FBQyxHQUFuQixHQUF5QixHQURoRCxDQURGO09BQUEsTUFHSyxJQUFHLE9BQUEsR0FBVSxJQUFDLENBQUEsVUFBVSxDQUFDLEdBQUcsQ0FBQyxHQUE3QjtBQUNILFFBQUEsSUFBQyxDQUFBLGFBQWEsQ0FBQyxLQUFmLEdBQXVCLElBQUMsQ0FBQSxlQUFELENBQUEsQ0FBQSxHQUFxQixJQUFDLENBQUEsU0FBRCxDQUFBLENBQTVDLENBREc7T0FBQSxNQUVBLElBQUcsT0FBQSxHQUFVLElBQUMsQ0FBQSxVQUFVLENBQUMsR0FBRyxDQUFDLE1BQTdCO0FBQ0gsUUFBQSxJQUFDLENBQUEsYUFBYSxDQUFDLEtBQWYsR0FBdUIsQ0FBdkIsQ0FERztPQWZMO0FBQUEsTUFpQkEsYUFBYSxDQUFDLElBQWQsQ0FBbUIsSUFBbkIsQ0FqQkEsQ0FERjtLQUFBO1dBbUJBLEtBcEJTO0VBQUEsQ0FuVVgsQ0FBQTs7QUFBQSxpQkF5VkEsT0FBQSxHQUFTLFNBQUMsQ0FBRCxHQUFBO0FBQ1AsSUFBQSxJQUFDLENBQUEsVUFBRCxHQUFjLEtBQWQsQ0FBQTtBQUFBLElBQ0EsaUJBQWlCLENBQUMsSUFBbEIsQ0FBdUIsSUFBdkIsQ0FEQSxDQUFBO1dBRUEsS0FITztFQUFBLENBelZULENBQUE7O0FBQUEsaUJBZ1dBLE1BQUEsR0FBUSxTQUFBLEdBQUE7QUFDTixJQUFBLElBQUMsQ0FBQSxhQUFhLENBQUMsS0FBZixHQUF3QixJQUFDLENBQUEsYUFBYSxDQUFDLEtBQWYsR0FBdUIsSUFBQyxDQUFBLGFBQWEsQ0FBQyxTQUE5RCxDQUFBO0FBQUEsSUFDQSxJQUFDLENBQUEsYUFBYSxDQUFDLE1BQWYsR0FBd0IsQ0FBQSxJQUFHLENBQUEsYUFBRCxDQUFBLENBQUYsR0FBcUIsQ0FBQyxJQUFDLENBQUEsc0JBQUQsQ0FBQSxDQUFBLEdBQTRCLENBQTdCLENBRDdDLENBQUE7QUFBQSxJQUVBLElBQUMsQ0FBQSxhQUFhLENBQUMsS0FBZixHQUF3QixDQUFBLElBQUcsQ0FBQSxZQUFELENBQUEsQ0FBRixHQUFvQixDQUFDLElBQUMsQ0FBQSx1QkFBRCxDQUFBLENBQUEsR0FBNkIsQ0FBOUIsQ0FGNUMsQ0FBQTtXQUdBLGlCQUFpQixDQUFDLElBQWxCLENBQXVCLElBQXZCLEVBSk07RUFBQSxDQWhXUixDQUFBOztBQUFBLGlCQXNXQSxPQUFBLEdBQVMsU0FBQSxHQUFBO0FBQ1AsUUFBQSxhQUFBO0FBQUEsSUFBQSxJQUFHLElBQUMsQ0FBQSxhQUFhLENBQUMsS0FBZixHQUF1QixDQUExQjtBQUNFLE1BQUEsSUFBQyxDQUFBLGFBQWEsQ0FBQyxLQUFmLEdBQXdCLElBQUMsQ0FBQSxhQUFhLENBQUMsS0FBZixHQUF1QixJQUFDLENBQUEsYUFBYSxDQUFDLFNBQTlELENBQUE7QUFBQSxNQUNBLE1BQUEsR0FBUyxDQUFBLElBQUcsQ0FBQSxhQUFELENBQUEsQ0FBRixHQUFxQixDQUFDLElBQUMsQ0FBQSxzQkFBRCxDQUFBLENBQUEsR0FBNEIsQ0FBN0IsQ0FEOUIsQ0FBQTtBQUFBLE1BRUEsS0FBQSxHQUFTLENBQUEsSUFBRyxDQUFBLFlBQUQsQ0FBQSxDQUFGLEdBQW9CLENBQUMsSUFBQyxDQUFBLHVCQUFELENBQUEsQ0FBQSxHQUE2QixDQUE5QixDQUY3QixDQUFBO0FBR0EsTUFBQSxJQUFHLE1BQUEsR0FBUyxDQUFaO0FBQ0UsUUFBQSxJQUFDLENBQUEsYUFBYSxDQUFDLE1BQWYsR0FBd0IsQ0FBeEIsQ0FERjtPQUFBLE1BRUssSUFBRyxNQUFBLEdBQVMsSUFBQyxDQUFBLGNBQUQsQ0FBQSxDQUFBLEdBQW9CLElBQUMsQ0FBQSxRQUFELENBQUEsQ0FBaEM7QUFDSCxRQUFBLElBQUMsQ0FBQSxhQUFhLENBQUMsTUFBZixHQUF3QixJQUFDLENBQUEsY0FBRCxDQUFBLENBQUEsR0FBb0IsSUFBQyxDQUFBLFFBQUQsQ0FBQSxDQUE1QyxDQURHO09BQUEsTUFBQTtBQUdILFFBQUEsSUFBQyxDQUFBLGFBQWEsQ0FBQyxNQUFmLEdBQXdCLE1BQXhCLENBSEc7T0FMTDtBQVNBLE1BQUEsSUFBRyxLQUFBLEdBQVEsQ0FBWDtBQUNFLFFBQUEsSUFBQyxDQUFBLGFBQWEsQ0FBQyxLQUFmLEdBQXVCLENBQXZCLENBREY7T0FBQSxNQUVLLElBQUcsS0FBQSxHQUFRLElBQUMsQ0FBQSxlQUFELENBQUEsQ0FBQSxHQUFxQixJQUFDLENBQUEsU0FBRCxDQUFBLENBQWhDO0FBQ0gsUUFBQSxJQUFDLENBQUEsYUFBYSxDQUFDLEtBQWYsR0FBdUIsSUFBQyxDQUFBLGVBQUQsQ0FBQSxDQUFBLEdBQXFCLElBQUMsQ0FBQSxTQUFELENBQUEsQ0FBNUMsQ0FERztPQUFBLE1BQUE7QUFHSCxRQUFBLElBQUMsQ0FBQSxhQUFhLENBQUMsS0FBZixHQUF1QixLQUF2QixDQUhHO09BWEw7YUFlQSxpQkFBaUIsQ0FBQyxJQUFsQixDQUF1QixJQUF2QixFQWhCRjtLQURPO0VBQUEsQ0F0V1QsQ0FBQTs7QUFBQSxpQkE0WEEsT0FBQSxHQUFTLFNBQUEsR0FBQTtXQUNQLElBQUMsQ0FBQSxnQkFBZ0IsQ0FBQyxJQUFsQixDQUF1QixHQUFBLEdBQUksTUFBTSxDQUFDLFdBQWxDLEVBRE87RUFBQSxDQTVYVCxDQUFBOztBQUFBLGlCQStYQSxjQUFBLEdBQWdCLFNBQUEsR0FBQTtXQUNkLElBQUMsQ0FBQSxnQkFBZ0IsQ0FBQyxJQUFsQixDQUF1QixHQUFBLEdBQUksTUFBTSxDQUFDLFdBQVgsR0FBdUIsR0FBdkIsR0FBMEIsTUFBTSxDQUFDLGFBQXhELEVBRGM7RUFBQSxDQS9YaEIsQ0FBQTs7QUFBQSxpQkFrWUEsZ0JBQUEsR0FBa0IsU0FBQyxDQUFELEdBQUE7QUFFaEIsUUFBQSx3REFBQTtBQUFBLElBQUEsS0FBQSxHQUFRLFVBQUEsQ0FBVyxJQUFDLENBQUEsZ0JBQWdCLENBQUMsS0FBbEIsQ0FBQSxDQUFYLENBQVIsQ0FBQTtBQUFBLElBQ0EsS0FBQSxHQUFRLFVBQUEsQ0FBVyxJQUFDLENBQUEsZ0JBQWdCLENBQUMsTUFBbEIsQ0FBQSxDQUFYLENBRFIsQ0FBQTtBQU1BLElBQUEsSUFBRyxJQUFDLENBQUEsS0FBSjtBQUVFLE1BQUEsR0FBQSxHQUFNLENBQUMsQ0FBQyxLQUFGLEdBQVUsSUFBQyxDQUFBLFNBQVMsQ0FBQyxNQUFYLENBQUEsQ0FBbUIsQ0FBQyxJQUFwQyxDQUFBO0FBQUEsTUFDQSxHQUFBLEdBQU0sQ0FBQyxDQUFDLEtBQUYsR0FBVSxJQUFDLENBQUEsU0FBUyxDQUFDLE1BQVgsQ0FBQSxDQUFtQixDQUFDLEdBRHBDLENBQUE7QUFBQSxNQUVBLElBQUEsR0FBTyxJQUFDLENBQUEsS0FBSyxDQUFDLEtBQVAsQ0FBQSxDQUZQLENBQUE7QUFBQSxNQUdBLElBQUEsR0FBTyxJQUFDLENBQUEsS0FBSyxDQUFDLE1BQVAsQ0FBQSxDQUhQLENBQUE7QUFBQSxNQUlBLElBQUEsR0FBTyxRQUFBLENBQVMsSUFBQyxDQUFBLEtBQUssQ0FBQyxHQUFQLENBQVcsTUFBWCxDQUFULENBSlAsQ0FBQTtBQUFBLE1BS0EsSUFBQSxHQUFPLFFBQUEsQ0FBUyxJQUFDLENBQUEsS0FBSyxDQUFDLEdBQVAsQ0FBVyxLQUFYLENBQVQsQ0FMUCxDQUFBO0FBQUEsTUFNQSxHQUFBLEdBQU0sQ0FBQyxDQUFDLEdBQUEsR0FBTSxJQUFJLENBQUMsR0FBTCxDQUFTLElBQVQsQ0FBUCxDQUFBLEdBQXlCLElBQTFCLENBQUEsR0FBa0MsR0FOeEMsQ0FBQTtBQUFBLE1BT0EsR0FBQSxHQUFNLENBQUMsQ0FBQyxHQUFBLEdBQU0sSUFBSSxDQUFDLEdBQUwsQ0FBUyxJQUFULENBQVAsQ0FBQSxHQUF5QixJQUExQixDQUFBLEdBQWtDLEdBUHhDLENBRkY7S0FBQSxNQUFBO0FBWUUsTUFBQSxHQUFBLEdBQU0sQ0FBQyxDQUFDLENBQUMsS0FBRixHQUFVLElBQUMsQ0FBQSxTQUFTLENBQUMsTUFBWCxDQUFBLENBQW1CLENBQUMsSUFBL0IsQ0FBQSxHQUF1QyxLQUE3QyxDQUFBO0FBQUEsTUFDQSxHQUFBLEdBQU8sQ0FBQyxDQUFDLENBQUMsS0FBRixHQUFVLElBQUMsQ0FBQSxTQUFTLENBQUMsTUFBWCxDQUFBLENBQW1CLENBQUMsR0FBL0IsQ0FBQSxHQUFzQyxLQUQ3QyxDQVpGO0tBTkE7V0FvQkEsQ0FBQyxHQUFELEVBQU0sR0FBTixFQXRCZ0I7RUFBQSxDQWxZbEIsQ0FBQTs7QUFBQSxpQkE0WkEsT0FBQSxHQUFTLFNBQUMsQ0FBRCxHQUFBO0FBRVAsUUFBQSxTQUFBO0FBQUEsSUFBQSxNQUFBLEdBQVMsSUFBQyxDQUFBLGdCQUFnQixDQUFDLElBQWxCLENBQXVCLEdBQUEsR0FBSSxNQUFNLENBQUMsYUFBbEMsQ0FBa0QsQ0FBQyxLQUFuRCxDQUFBLENBQVQsQ0FBQTtBQUNBLElBQUEsSUFBRyxJQUFDLENBQUEsY0FBRCxDQUFBLENBQWlCLENBQUMsTUFBbEIsR0FBMkIsQ0FBOUI7QUFDRSxNQUFBLENBQUEsR0FBUSxJQUFBLE1BQU0sQ0FBQyxNQUFQLENBQWMsSUFBQyxDQUFBLFNBQWYsRUFBMEIsTUFBTSxDQUFDLElBQVAsQ0FBWSxhQUFaLENBQTFCLENBQVIsQ0FBQTtBQUFBLE1BQ0EsSUFBQyxDQUFBLE9BQU8sQ0FBQyxhQUFULENBQXVCLENBQXZCLEVBQTBCLENBQTFCLENBREEsQ0FBQTtBQUFBLE1BRUEsQ0FBQyxDQUFDLFlBQUYsQ0FBQSxDQUZBLENBQUE7QUFBQSxNQUdBLENBQUMsQ0FBQyxlQUFGLENBQUEsQ0FIQSxDQUFBO0FBQUEsTUFJQSxJQUFDLENBQUEsY0FBRCxDQUFBLENBQWlCLENBQUMsV0FBbEIsQ0FBOEIsTUFBTSxDQUFDLGFBQXJDLENBSkEsQ0FERjtLQURBO0FBUUEsSUFBQSxJQUFHLENBQUEsQ0FBRSxDQUFDLENBQUMsTUFBSixDQUFXLENBQUMsUUFBWixDQUFxQixNQUFNLENBQUMsb0JBQTVCLENBQUg7QUFDRSxNQUFBLElBQUMsQ0FBQSxPQUFPLENBQUMsV0FBVCxDQUFxQixDQUFyQixFQUF3QixJQUFDLENBQUEsZ0JBQUQsQ0FBa0IsQ0FBbEIsQ0FBeEIsQ0FBQSxDQURGO0tBUkE7QUFXQSxJQUFBLElBQ0UsQ0FBQSxDQUFFLENBQUMsQ0FBQyxNQUFKLENBQVcsQ0FBQyxRQUFaLENBQXFCLE1BQU0sQ0FBQyxXQUE1QixDQUFBLElBQ0EsQ0FBQSxDQUFFLENBQUMsQ0FBQyxNQUFKLENBQVcsQ0FBQyxPQUFaLENBQW9CLEdBQUEsR0FBSSxNQUFNLENBQUMsV0FBL0IsQ0FBNkMsQ0FBQyxNQUE5QyxHQUF1RCxDQUZ6RDtBQUlFLE1BQUEsSUFBRyxDQUFBLENBQUUsQ0FBQyxDQUFDLE1BQUosQ0FBVyxDQUFDLFFBQVosQ0FBcUIsTUFBTSxDQUFDLFdBQTVCLENBQUg7QUFDRSxRQUFBLE1BQUEsR0FBUyxDQUFBLENBQUUsQ0FBQyxDQUFDLE1BQUosQ0FBVCxDQURGO09BQUEsTUFBQTtBQUdFLFFBQUEsTUFBQSxHQUFTLENBQUEsQ0FBRSxDQUFDLENBQUMsTUFBSixDQUFXLENBQUMsT0FBWixDQUFvQixHQUFBLEdBQUksTUFBTSxDQUFDLFdBQS9CLENBQTZDLENBQUMsS0FBOUMsQ0FBQSxDQUFULENBSEY7T0FBQTtBQUFBLE1BSUEsQ0FBQSxHQUFRLElBQUEsTUFBTSxDQUFDLE1BQVAsQ0FBYyxJQUFDLENBQUEsU0FBZixFQUEwQixNQUFNLENBQUMsSUFBUCxDQUFZLGFBQVosQ0FBMUIsQ0FKUixDQUFBO0FBQUEsTUFLQSxJQUFDLENBQUEsT0FBTyxDQUFDLFdBQVQsQ0FBcUIsQ0FBckIsRUFBd0IsQ0FBeEIsQ0FMQSxDQUpGO0tBWEE7V0FxQkEsS0F2Qk87RUFBQSxDQTVaVCxDQUFBOztBQUFBLGlCQXFiQSxTQUFBLEdBQVcsU0FBQyxDQUFELEdBQUE7QUFDVCxRQUFBLDBKQUFBO0FBQUEsSUFBQSxPQUFBLEdBQVUsSUFBQyxDQUFBLGdCQUFnQixDQUFDLElBQWxCLENBQXVCLEdBQUEsR0FBSSxNQUFNLENBQUMsV0FBWCxHQUF1QixHQUF2QixHQUEwQixNQUFNLENBQUMsYUFBeEQsQ0FBVixDQUFBO0FBRUEsSUFBQSxJQUFHLE9BQU8sQ0FBQyxNQUFSLEdBQWlCLENBQXBCO0FBS0UsTUFBQSxNQUFBLEdBQVMsT0FBTyxDQUFDLEtBQVIsQ0FBQSxDQUFULENBQUE7QUFJQSxNQUFBLElBQ0UsSUFBSSxDQUFDLEdBQUwsQ0FBUyxDQUFDLENBQUMsS0FBRixHQUFVLE1BQU0sQ0FBQyxJQUFQLENBQVksbUJBQVosQ0FBbkIsQ0FBQSxHQUF1RCxDQUF2RCxJQUNBLElBQUksQ0FBQyxHQUFMLENBQVMsQ0FBQyxDQUFDLEtBQUYsR0FBVSxNQUFNLENBQUMsSUFBUCxDQUFZLG1CQUFaLENBQW5CLENBQUEsR0FBdUQsQ0FGekQ7QUFJRSxRQUFBLElBQUMsQ0FBQSxTQUFTLENBQUMsSUFBWCxDQUFnQixHQUFBLEdBQUcsQ0FBQyxNQUFNLENBQUMsSUFBUCxDQUFZLGNBQVosQ0FBRCxDQUFuQixDQUFrRCxDQUFDLFdBQW5ELENBQStELFFBQS9ELENBQUEsQ0FKRjtPQUpBO0FBQUEsTUFZQSxTQUFBLEdBQWdCLENBQUMsQ0FBQyxLQUFGLEdBQVUsSUFBQyxDQUFBLFNBQVMsQ0FBQyxNQUFYLENBQUEsQ0FBbUIsQ0FBQyxJQVo5QyxDQUFBO0FBQUEsTUFhQSxRQUFBLEdBQWdCLENBQUMsQ0FBQyxLQUFGLEdBQVUsSUFBQyxDQUFBLFNBQVMsQ0FBQyxNQUFYLENBQUEsQ0FBbUIsQ0FBQyxHQWI5QyxDQUFBO0FBQUEsTUFjQSxTQUFBLEdBQWdCLElBQUMsQ0FBQSxTQUFTLENBQUMsS0FBWCxDQUFBLENBZGhCLENBQUE7QUFBQSxNQWVBLFVBQUEsR0FBZ0IsSUFBQyxDQUFBLFNBQVMsQ0FBQyxNQUFYLENBQUEsQ0FmaEIsQ0FBQTtBQUFBLE1BZ0JBLFVBQUEsR0FBZ0IsU0FBQSxHQUFZLENBQUMsTUFBTSxDQUFDLFVBQVAsQ0FBQSxDQUFBLEdBQXNCLENBQXZCLENBaEI1QixDQUFBO0FBQUEsTUFpQkEsU0FBQSxHQUFnQixRQUFBLEdBQVcsQ0FBQyxNQUFNLENBQUMsV0FBUCxDQUFBLENBQUEsR0FBdUIsQ0FBeEIsQ0FqQjNCLENBQUE7QUFBQSxNQWtCQSxXQUFBLEdBQWdCLFNBQUEsR0FBWSxDQUFDLE1BQU0sQ0FBQyxVQUFQLENBQUEsQ0FBQSxHQUFzQixDQUF2QixDQWxCNUIsQ0FBQTtBQUFBLE1BbUJBLFlBQUEsR0FBZ0IsUUFBQSxHQUFXLENBQUMsTUFBTSxDQUFDLFdBQVAsQ0FBQSxDQUFBLEdBQXVCLENBQXhCLENBbkIzQixDQUFBO0FBQUEsTUFvQkEsV0FBQSxHQUFnQixNQUFNLENBQUMsVUFBUCxDQUFBLENBcEJoQixDQUFBO0FBQUEsTUFxQkEsWUFBQSxHQUFnQixNQUFNLENBQUMsV0FBUCxDQUFBLENBckJoQixDQUFBO0FBMEJBLE1BQUEsSUFBRyxVQUFBLElBQWMsQ0FBakI7QUFDRSxRQUFBLE9BQUEsR0FBVSxDQUFWLENBREY7T0FBQSxNQUVLLElBQUcsV0FBQSxHQUFjLFNBQWpCO0FBQ0gsUUFBQSxPQUFBLEdBQVUsVUFBVixDQURHO09BQUEsTUFBQTtBQUdILFFBQUEsT0FBQSxHQUFVLFNBQUEsR0FBWSxXQUF0QixDQUhHO09BNUJMO0FBb0NBLE1BQUEsSUFBRyxTQUFBLElBQWEsQ0FBaEI7QUFDRSxRQUFBLE9BQUEsR0FBVSxDQUFWLENBREY7T0FBQSxNQUVLLElBQUcsWUFBQSxHQUFlLFVBQWxCO0FBQ0gsUUFBQSxPQUFBLEdBQVUsU0FBVixDQURHO09BQUEsTUFBQTtBQUdILFFBQUEsT0FBQSxHQUFVLFVBQUEsR0FBYSxZQUF2QixDQUhHO09BdENMO2FBNkNBLE1BQU0sQ0FBQyxHQUFQLENBQ0U7QUFBQSxRQUFBLElBQUEsRUFBTSxPQUFOO0FBQUEsUUFDQSxHQUFBLEVBQUssT0FETDtPQURGLEVBbERGO0tBSFM7RUFBQSxDQXJiWCxDQUFBOztBQUFBLGlCQWdmQSxhQUFBLEdBQWUsU0FBQyxLQUFELEVBQVEsTUFBUixHQUFBO0FBQ2IsSUFBQSxJQUFHLElBQUMsQ0FBQSxPQUFPLENBQUMsYUFBWjthQUNFLElBQUMsQ0FBQSxPQUFPLENBQUMsYUFBVCxDQUF1QixLQUF2QixFQUE4QixNQUE5QixFQURGO0tBRGE7RUFBQSxDQWhmZixDQUFBOztBQUFBLGlCQW9mQSxXQUFBLEdBQWEsU0FBQyxLQUFELEVBQVEsTUFBUixHQUFBO0FBQ1gsSUFBQSxJQUFHLElBQUMsQ0FBQSxPQUFPLENBQUMsV0FBWjthQUNFLElBQUMsQ0FBQSxPQUFPLENBQUMsV0FBVCxDQUFxQixLQUFyQixFQUE0QixNQUE1QixFQURGO0tBRFc7RUFBQSxDQXBmYixDQUFBOztBQUFBLGlCQXdmQSxXQUFBLEdBQWEsU0FBQyxLQUFELEVBQVEsTUFBUixHQUFBO0FBQ1gsSUFBQSxJQUFHLElBQUMsQ0FBQSxPQUFPLENBQUMsV0FBWjthQUNFLElBQUMsQ0FBQSxPQUFPLENBQUMsV0FBVCxDQUFxQixLQUFyQixFQUE0QixNQUE1QixFQURGO0tBRFc7RUFBQSxDQXhmYixDQUFBOztjQUFBOztJQTlCRixDQUFBOztBQUFBLE1BMGhCWSxDQUFDO0FBRUUsRUFBQSxnQkFBQyxVQUFELEVBQWEsRUFBYixHQUFBO0FBR1gsSUFIWSxJQUFDLENBQUEsWUFBRCxVQUdaLENBQUE7QUFBQSx5Q0FBQSxDQUFBO0FBQUEseUNBQUEsQ0FBQTtBQUFBLHFEQUFBLENBQUE7QUFBQSxtQ0FBQSxDQUFBO0FBQUEsbURBQUEsQ0FBQTtBQUFBLHlEQUFBLENBQUE7QUFBQSwyREFBQSxDQUFBO0FBQUEsdURBQUEsQ0FBQTtBQUFBLHVEQUFBLENBQUE7QUFBQSxtREFBQSxDQUFBO0FBQUEsbURBQUEsQ0FBQTtBQUFBLHlEQUFBLENBQUE7QUFBQSxtREFBQSxDQUFBO0FBQUEsMkNBQUEsQ0FBQTtBQUFBLGlDQUFBLENBQUE7QUFBQSw2Q0FBQSxDQUFBO0FBQUEsdUNBQUEsQ0FBQTtBQUFBLDZEQUFBLENBQUE7QUFBQSw2Q0FBQSxDQUFBO0FBQUEsSUFBQSxJQUFDLENBQUEsZ0JBQUQsR0FBb0IsSUFBQyxDQUFBLFNBQVMsQ0FBQyxJQUFYLENBQWdCLEdBQUEsR0FBSSxNQUFNLENBQUMsb0JBQTNCLENBQXBCLENBQUE7QUFDQSxJQUFBLElBQUcsSUFBQyxDQUFBLFNBQVMsQ0FBQyxJQUFYLENBQWdCLEdBQUEsR0FBSSxNQUFNLENBQUMsY0FBWCxHQUEwQixRQUExQyxDQUFrRCxDQUFDLE1BQW5ELEdBQTRELENBQS9EO0FBQ0UsTUFBQSxJQUFDLENBQUEsS0FBRCxHQUFTLElBQUMsQ0FBQSxTQUFTLENBQUMsSUFBWCxDQUFnQixHQUFBLEdBQUksTUFBTSxDQUFDLGNBQVgsR0FBMEIsUUFBMUMsQ0FBa0QsQ0FBQyxLQUFuRCxDQUFBLENBQVQsQ0FERjtLQURBO0FBQUEsSUFLQSxJQUFDLENBQUEsTUFBRCxHQUFVLElBQUMsQ0FBQSxnQkFBZ0IsQ0FBQyxJQUFsQixDQUNSLEdBQUEsR0FBSSxNQUFNLENBQUMsV0FBWCxHQUF1QixnQkFBdkIsR0FBdUMsRUFBdkMsR0FBMEMsSUFEbEMsQ0FFVCxDQUFDLEtBRlEsQ0FBQSxDQUxWLENBQUE7QUFBQSxJQVVBLElBVkEsQ0FIVztFQUFBLENBQWI7O0FBQUEsRUFpQkEsTUFBQyxDQUFBLE1BQUQsR0FBUyxTQUFDLE9BQUQsR0FBQTtBQUVQLFFBQUEsMkdBQUE7QUFBQSxJQUFBLFNBQUEsR0FBWSxPQUFPLENBQUMsU0FBcEIsQ0FBQTtBQUFBLElBQ0EsZ0JBQUEsR0FBbUIsU0FBUyxDQUFDLElBQVYsQ0FBZSxHQUFBLEdBQUksTUFBTSxDQUFDLG9CQUExQixDQUFpRCxDQUFDLEtBQWxELENBQUEsQ0FEbkIsQ0FBQTtBQUdBLElBQUEsSUFBQSxDQUFBLE9BQXlELENBQUMsUUFBMUQ7QUFBQSxNQUFBLE9BQU8sQ0FBQyxRQUFSLEdBQW1CLE1BQU0sQ0FBQyxZQUFQLENBQW9CLEVBQXBCLENBQW5CLENBQUE7S0FIQTtBQUlBLElBQUEsSUFBRyxPQUFPLENBQUMsS0FBWDtBQUFzQixNQUFBLEtBQUEsR0FBUSxPQUFPLENBQUMsS0FBaEIsQ0FBdEI7S0FBQSxNQUFBO0FBQWlELE1BQUEsS0FBQSxHQUFRLFNBQVIsQ0FBakQ7S0FKQTtBQUFBLElBTUEsSUFBQSxHQUFPLENBQUMsQ0FBQyxVQUFBLENBQVcsT0FBTyxDQUFDLE1BQU8sQ0FBQSxDQUFBLENBQTFCLENBQUEsR0FBZ0MsR0FBakMsQ0FBQSxHQUF3QyxTQUFTLENBQUMsS0FBVixDQUFBLENBQXpDLENBQUEsR0FBOEQsRUFOckUsQ0FBQTtBQUFBLElBT0EsR0FBQSxHQUFNLENBQUMsQ0FBQyxVQUFBLENBQVcsT0FBTyxDQUFDLE1BQU8sQ0FBQSxDQUFBLENBQTFCLENBQUEsR0FBZ0MsR0FBakMsQ0FBQSxHQUF3QyxTQUFTLENBQUMsTUFBVixDQUFBLENBQXpDLENBQUEsR0FBK0QsRUFQckUsQ0FBQTtBQUFBLElBU0EsZ0JBQWdCLENBQUMsTUFBakIsQ0FDRSxDQUFBLENBQUUsYUFBRixDQUNFLENBQUMsUUFESCxDQUNZLE1BQU0sQ0FBQyxXQURuQixDQUVFLENBQUMsSUFGSCxDQUdJO0FBQUEsTUFBQSxhQUFBLEVBQWUsT0FBTyxDQUFDLFFBQXZCO0FBQUEsTUFDQSxVQUFBLEVBQVksT0FBTyxDQUFDLE1BQU8sQ0FBQSxDQUFBLENBRDNCO0FBQUEsTUFFQSxVQUFBLEVBQVksT0FBTyxDQUFDLE1BQU8sQ0FBQSxDQUFBLENBRjNCO0tBSEosQ0FNRSxDQUFDLEdBTkgsQ0FPSTtBQUFBLE1BQUEsSUFBQSxFQUFTLElBQUQsR0FBTSxJQUFkO0FBQUEsTUFDQSxHQUFBLEVBQVEsR0FBRCxHQUFLLElBRFo7QUFBQSxNQUVBLGVBQUEsRUFBaUIsS0FGakI7S0FQSixDQURGLENBVEEsQ0FBQTtBQUFBLElBc0JBLE1BQUEsR0FBUyxnQkFBZ0IsQ0FBQyxJQUFqQixDQUFzQixHQUFBLEdBQUksTUFBTSxDQUFDLFdBQWpDLENBQStDLENBQUMsSUFBaEQsQ0FBQSxDQXRCVCxDQUFBO0FBd0JBLElBQUEsSUFBRyxPQUFPLENBQUMsRUFBWDtBQUNFLE1BQUEsTUFBTSxDQUFDLElBQVAsQ0FBWTtBQUFBLFFBQUEsU0FBQSxFQUFXLE9BQU8sQ0FBQyxFQUFuQjtPQUFaLENBQUEsQ0FERjtLQXhCQTtBQTBCQSxJQUFBLElBQUcsT0FBTyxDQUFDLE9BQUQsQ0FBVjtBQUNFLE1BQUEsTUFBTSxDQUFDLFFBQVAsQ0FBZ0IsT0FBTyxDQUFDLE9BQUQsQ0FBdkIsQ0FBQSxDQURGO0tBMUJBO0FBNEJBLElBQUEsSUFBRyxPQUFPLENBQUMsSUFBWDtBQUNFLE1BQUEsTUFBTSxDQUFDLElBQVAsQ0FBWSxPQUFPLENBQUMsSUFBcEIsQ0FBQSxDQURGO0tBNUJBO0FBOEJBLElBQUEsSUFBRyxPQUFPLENBQUMsSUFBWDtBQUNFLE1BQUEsTUFBTSxDQUFDLEdBQVAsQ0FDRTtBQUFBLFFBQUEsS0FBQSxFQUFVLE9BQU8sQ0FBQyxJQUFULEdBQWMsSUFBdkI7QUFBQSxRQUNBLE1BQUEsRUFBVyxPQUFPLENBQUMsSUFBVCxHQUFjLElBRHhCO09BREYsQ0FBQSxDQURGO0tBOUJBO0FBbUNBLElBQUEsSUFBRyxPQUFPLENBQUMsU0FBWDtBQUNFLE1BQUEsTUFBTSxDQUFDLFFBQVAsQ0FBZ0IsV0FBaEIsQ0FBQSxDQUFBO0FBQUEsTUFDQSxNQUFNLENBQUMsRUFBUCxDQUFVLFdBQVYsRUFBdUIsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUMsQ0FBRCxHQUFBO0FBQ3JCLFVBQUEsSUFBRyxDQUFDLENBQUMsS0FBRixLQUFXLENBQWQ7QUFDRSxZQUFBLE1BQUEsR0FBUyxDQUFBLENBQUUsQ0FBQyxDQUFDLE1BQUosQ0FBVyxDQUFDLE9BQVosQ0FBb0IsR0FBQSxHQUFJLE1BQU0sQ0FBQyxXQUEvQixDQUFULENBQUE7QUFBQSxZQUNBLE1BQU0sQ0FBQyxRQUFQLENBQWdCLE1BQU0sQ0FBQyxhQUF2QixDQURBLENBQUE7bUJBRUEsTUFBTSxDQUFDLElBQVAsQ0FDRTtBQUFBLGNBQUEsbUJBQUEsRUFBcUIsQ0FBQyxDQUFDLEtBQXZCO0FBQUEsY0FDQSxtQkFBQSxFQUFxQixDQUFDLENBQUMsS0FEdkI7YUFERixFQUhGO1dBRHFCO1FBQUEsRUFBQTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBdkIsQ0FEQSxDQURGO0tBbkNBO0FBNkNBLElBQUEsSUFBRyxPQUFPLENBQUMsT0FBWDtBQUNFLE1BQUEsRUFBQSxHQUFLLE1BQU0sQ0FBQyxZQUFQLENBQW9CLEVBQXBCLENBQUwsQ0FBQTtBQUFBLE1BRUEsT0FBQSxHQUFVLE9BQU8sQ0FBQyxPQUZsQixDQUFBO0FBR0EsTUFBQSxJQUFHLE9BQU8sQ0FBQyxRQUFYO0FBQXlCLFFBQUEsUUFBQSxHQUFXLE9BQU8sQ0FBQyxRQUFuQixDQUF6QjtPQUFBLE1BQUE7QUFBMEQsUUFBQSxRQUFBLEdBQVcsS0FBWCxDQUExRDtPQUhBO0FBSUEsTUFBQSxJQUFHLE9BQU8sQ0FBQyxLQUFYO0FBQXNCLFFBQUEsS0FBQSxHQUFRLElBQVIsQ0FBdEI7T0FBQSxNQUFBO0FBQXdDLFFBQUEsS0FBQSxHQUFRLEtBQVIsQ0FBeEM7T0FKQTtBQUtBLE1BQUEsSUFBRyxLQUFBLEtBQVMsSUFBWjtBQUFzQixRQUFBLFVBQUEsR0FBYSxPQUFiLENBQXRCO09BQUEsTUFBQTtBQUFnRCxRQUFBLFVBQUEsR0FBYSxFQUFiLENBQWhEO09BTEE7QUFBQSxNQU1BLE9BQUEsR0FBYSxNQUFNLENBQUMsWUFBUixHQUFxQixHQUFyQixHQUF3QixRQUF4QixHQUFpQyxHQUFqQyxHQUFvQyxVQU5oRCxDQUFBO0FBQUEsTUFRQSxTQUFTLENBQUMsSUFBVixDQUFlLEdBQUEsR0FBSSxNQUFNLENBQUMscUJBQTFCLENBQWtELENBQUMsTUFBbkQsQ0FBMEQsZUFBQSxHQUMxQyxPQUQwQyxHQUNsQyxlQURrQyxHQUNyQixFQURxQixHQUNsQix3QkFEa0IsR0FFckMsUUFGcUMsR0FFNUIsV0FGNEIsR0FHbEQsT0FBTyxDQUFDLElBSDBDLEdBR3JDLFVBSHJCLENBUkEsQ0FBQTtBQWVBLE1BQUEsSUFBRyxPQUFPLENBQUMsT0FBWDtBQUNFLFFBQUEsU0FBUyxDQUFDLElBQVYsQ0FBZSxHQUFBLEdBQUksTUFBTSxDQUFDLFlBQTFCLENBQXlDLENBQUMsSUFBMUMsQ0FBQSxDQUFnRCxDQUFDLElBQWpELENBQ0U7QUFBQSxVQUFBLGVBQUEsRUFBaUIsT0FBTyxDQUFDLE9BQXpCO1NBREYsQ0FBQSxDQURGO09BZkE7QUFrQkEsTUFBQSxJQUFHLE9BQU8sQ0FBQyxPQUFYO0FBQ0UsUUFBQSxTQUFTLENBQUMsSUFBVixDQUFlLEdBQUEsR0FBSSxNQUFNLENBQUMsWUFBMUIsQ0FBeUMsQ0FBQyxJQUExQyxDQUFBLENBQWdELENBQUMsSUFBakQsQ0FDRTtBQUFBLFVBQUEsZUFBQSxFQUFpQixPQUFPLENBQUMsT0FBekI7U0FERixDQUFBLENBREY7T0FsQkE7QUFBQSxNQXFCQSxNQUFNLENBQUMsSUFBUCxDQUFZLGNBQVosRUFBNEIsT0FBQSxHQUFRLEVBQXBDLENBckJBLENBQUE7QUFBQSxNQXNCQSxDQUFBLEdBQVEsSUFBQSxNQUFNLENBQUMsTUFBUCxDQUFjLFNBQWQsRUFBeUIsT0FBTyxDQUFDLFFBQWpDLENBdEJSLENBQUE7QUFBQSxNQXVCQSxDQUFDLENBQUMsZUFBRixDQUFBLENBdkJBLENBQUE7YUF3QkEsRUF6QkY7S0EvQ087RUFBQSxDQWpCVCxDQUFBOztBQUFBLG1CQTZGQSxRQUFBLEdBQVUsU0FBQSxHQUFBO0FBQ1IsUUFBQSwwQ0FBQTtBQUFBLElBQUEsR0FBQSxHQUFNLElBQUMsQ0FBQSxNQUFNLENBQUMsUUFBUixDQUFBLENBQWtCLENBQUMsSUFBbkIsR0FBMEIsQ0FBQyxJQUFDLENBQUEsTUFBTSxDQUFDLFVBQVIsQ0FBQSxDQUFBLEdBQXVCLENBQXhCLENBQWhDLENBQUE7QUFBQSxJQUNBLEdBQUEsR0FBTSxJQUFDLENBQUEsTUFBTSxDQUFDLFFBQVIsQ0FBQSxDQUFrQixDQUFDLEdBQW5CLEdBQXlCLENBQUMsSUFBQyxDQUFBLE1BQU0sQ0FBQyxXQUFSLENBQUEsQ0FBQSxHQUF3QixDQUF6QixDQUQvQixDQUFBO0FBRUEsSUFBQSxJQUFHLElBQUMsQ0FBQSxLQUFKO0FBQ0UsTUFBQSxJQUFBLEdBQU8sSUFBQyxDQUFBLEtBQUssQ0FBQyxLQUFQLENBQUEsQ0FBUCxDQUFBO0FBQUEsTUFDQSxJQUFBLEdBQU8sSUFBQyxDQUFBLEtBQUssQ0FBQyxNQUFQLENBQUEsQ0FEUCxDQUFBO0FBQUEsTUFFQSxJQUFBLEdBQU8sUUFBQSxDQUFTLElBQUMsQ0FBQSxLQUFLLENBQUMsR0FBUCxDQUFXLE1BQVgsQ0FBVCxDQUZQLENBQUE7QUFBQSxNQUdBLElBQUEsR0FBTyxRQUFBLENBQVMsSUFBQyxDQUFBLEtBQUssQ0FBQyxHQUFQLENBQVcsS0FBWCxDQUFULENBSFAsQ0FBQTtBQUFBLE1BSUEsR0FBQSxHQUFNLENBQUMsQ0FBQyxHQUFBLEdBQU0sSUFBSSxDQUFDLEdBQUwsQ0FBUyxJQUFULENBQVAsQ0FBQSxHQUF5QixJQUExQixDQUFBLEdBQWtDLEdBSnhDLENBQUE7QUFBQSxNQUtBLEdBQUEsR0FBTSxDQUFDLENBQUMsR0FBQSxHQUFNLElBQUksQ0FBQyxHQUFMLENBQVMsSUFBVCxDQUFQLENBQUEsR0FBeUIsSUFBMUIsQ0FBQSxHQUFrQyxHQUx4QyxDQURGO0tBQUEsTUFBQTtBQVFFLE1BQUEsR0FBQSxHQUFNLENBQUMsR0FBQSxHQUFNLElBQUMsQ0FBQSxTQUFTLENBQUMsS0FBWCxDQUFBLENBQVAsQ0FBQSxHQUE2QixHQUFuQyxDQUFBO0FBQUEsTUFDQSxHQUFBLEdBQU0sQ0FBQyxHQUFBLEdBQU0sSUFBQyxDQUFBLFNBQVMsQ0FBQyxNQUFYLENBQUEsQ0FBUCxDQUFBLEdBQThCLEdBRHBDLENBUkY7S0FGQTtXQVlBLENBQUMsR0FBRCxFQUFNLEdBQU4sRUFiUTtFQUFBLENBN0ZWLENBQUE7O0FBQUEsbUJBNEdBLGdCQUFBLEdBQWtCLFNBQUEsR0FBQTtBQUNoQixRQUFBLGtCQUFBO0FBQUEsSUFBQSxHQUFBLEdBQU0sSUFBQyxDQUFBLE1BQU0sQ0FBQyxRQUFSLENBQUEsQ0FBa0IsQ0FBQyxJQUFuQixHQUEwQixDQUFDLElBQUMsQ0FBQSxNQUFNLENBQUMsVUFBUixDQUFBLENBQUEsR0FBdUIsQ0FBeEIsQ0FBaEMsQ0FBQTtBQUFBLElBQ0EsR0FBQSxHQUFNLElBQUMsQ0FBQSxNQUFNLENBQUMsUUFBUixDQUFBLENBQWtCLENBQUMsR0FBbkIsR0FBeUIsQ0FBQyxJQUFDLENBQUEsTUFBTSxDQUFDLFdBQVIsQ0FBQSxDQUFBLEdBQXdCLENBQXpCLENBRC9CLENBQUE7QUFBQSxJQUVBLEdBQUEsR0FBTSxDQUFDLEdBQUEsR0FBTSxJQUFDLENBQUEsU0FBUyxDQUFDLEtBQVgsQ0FBQSxDQUFQLENBQUEsR0FBNkIsR0FGbkMsQ0FBQTtBQUFBLElBR0EsR0FBQSxHQUFNLENBQUMsR0FBQSxHQUFNLElBQUMsQ0FBQSxTQUFTLENBQUMsTUFBWCxDQUFBLENBQVAsQ0FBQSxHQUE4QixHQUhwQyxDQUFBO1dBSUEsQ0FBQyxHQUFELEVBQU0sR0FBTixFQUxnQjtFQUFBLENBNUdsQixDQUFBOztBQUFBLG1CQXFIQSxLQUFBLEdBQU8sU0FBQSxHQUFBO1dBQ0wsSUFBQyxDQUFBLE1BQU0sQ0FBQyxHQUFSLENBQVksaUJBQVosRUFESztFQUFBLENBckhQLENBQUE7O0FBQUEsbUJBd0hBLFFBQUEsR0FBVSxTQUFBLEdBQUE7V0FDUixJQUFDLENBQUEsTUFBTSxDQUFDLElBQVIsQ0FBYSxhQUFiLEVBRFE7RUFBQSxDQXhIVixDQUFBOztBQUFBLG1CQTJIQSxFQUFBLEdBQUksU0FBQSxHQUFBO1dBQ0YsSUFBQyxDQUFBLE1BQU0sQ0FBQyxJQUFSLENBQWEsU0FBYixFQURFO0VBQUEsQ0EzSEosQ0FBQTs7QUFBQSxtQkFnSUEsT0FBQSxHQUFTLFNBQUEsR0FBQTtBQUNQLFFBQUEsT0FBQTtBQUFBLElBQUEsT0FBQSxHQUFVLElBQUMsQ0FBQSxTQUFTLENBQUMsSUFBWCxDQUFnQixHQUFBLEdBQUcsQ0FBQyxJQUFDLENBQUEsTUFBTSxDQUFDLElBQVIsQ0FBYSxjQUFiLENBQUQsQ0FBbkIsQ0FBVixDQUFBO0FBQ0EsSUFBQSxJQUFHLE9BQU8sQ0FBQyxNQUFSLEdBQWlCLENBQXBCO2FBQTJCLFFBQTNCO0tBQUEsTUFBQTthQUF3QyxLQUF4QztLQUZPO0VBQUEsQ0FoSVQsQ0FBQTs7QUFBQSxtQkFvSUEsV0FBQSxHQUFhLFNBQUEsR0FBQTtBQUNYLElBQUEsSUFBRyxJQUFDLENBQUEsT0FBRCxDQUFBLENBQUEsSUFBYyxJQUFDLENBQUEsT0FBRCxDQUFBLENBQVUsQ0FBQyxNQUFYLEdBQW9CLENBQXJDO2FBQTRDLElBQUMsQ0FBQSxPQUFELENBQUEsQ0FBVSxDQUFDLElBQVgsQ0FBQSxFQUE1QztLQUFBLE1BQUE7YUFBbUUsS0FBbkU7S0FEVztFQUFBLENBcEliLENBQUE7O0FBQUEsbUJBdUlBLGNBQUEsR0FBZ0IsU0FBQSxHQUFBO1dBQ2QsSUFBQyxDQUFBLE9BQUQsQ0FBQSxDQUFBLElBQWMsSUFBQyxDQUFBLE9BQUQsQ0FBQSxDQUFVLENBQUMsUUFBWCxDQUFvQixRQUFwQixFQURBO0VBQUEsQ0F2SWhCLENBQUE7O0FBQUEsbUJBMElBLFdBQUEsR0FBYSxTQUFBLEdBQUE7QUFDWCxJQUFBLElBQWlDLElBQUMsQ0FBQSxjQUFELENBQUEsQ0FBakM7YUFBQSxJQUFDLENBQUEsT0FBRCxDQUFBLENBQVUsQ0FBQyxRQUFYLENBQW9CLFFBQXBCLEVBQUE7S0FEVztFQUFBLENBMUliLENBQUE7O0FBQUEsbUJBNklBLFdBQUEsR0FBYSxTQUFBLEdBQUE7QUFDWCxJQUFBLElBQWlDLElBQUMsQ0FBQSxPQUFELENBQUEsQ0FBQSxJQUFjLENBQUEsSUFBRSxDQUFBLGNBQUQsQ0FBQSxDQUFoRDtBQUFBLE1BQUEsSUFBQyxDQUFBLE9BQUQsQ0FBQSxDQUFVLENBQUMsUUFBWCxDQUFvQixRQUFwQixDQUFBLENBQUE7S0FBQTtXQUNBLElBQUMsQ0FBQSxhQUFELENBQUEsRUFGVztFQUFBLENBN0liLENBQUE7O0FBQUEsbUJBaUpBLGFBQUEsR0FBZSxTQUFBLEdBQUE7QUFDYixJQUFBLElBQW9DLElBQUMsQ0FBQSxjQUFELENBQUEsQ0FBcEM7YUFBQSxJQUFDLENBQUEsT0FBRCxDQUFBLENBQVUsQ0FBQyxXQUFYLENBQXVCLFFBQXZCLEVBQUE7S0FEYTtFQUFBLENBakpmLENBQUE7O0FBQUEsbUJBb0pBLGFBQUEsR0FBZSxTQUFBLEdBQUE7QUFDYixRQUFBLHVMQUFBO0FBQUEsSUFBQSxPQUFBLEdBQVUsSUFBQyxDQUFBLFNBQVMsQ0FBQyxJQUFYLENBQWdCLEdBQUEsR0FBRyxDQUFDLElBQUMsQ0FBQSxNQUFNLENBQUMsSUFBUixDQUFhLGNBQWIsQ0FBRCxDQUFuQixDQUFWLENBQUE7QUFBQSxJQUNBLGFBQUEsR0FBaUIsVUFBQSxDQUFXLElBQUMsQ0FBQSxnQkFBRCxDQUFBLENBQW9CLENBQUEsQ0FBQSxDQUFwQixHQUF5QixHQUFwQyxDQUFBLEdBQTJDLElBQUMsQ0FBQSxTQUFTLENBQUMsS0FBWCxDQUFBLENBRDVELENBQUE7QUFBQSxJQUVBLGFBQUEsR0FBaUIsVUFBQSxDQUFXLElBQUMsQ0FBQSxnQkFBRCxDQUFBLENBQW9CLENBQUEsQ0FBQSxDQUFwQixHQUF5QixHQUFwQyxDQUFBLEdBQTJDLElBQUMsQ0FBQSxTQUFTLENBQUMsTUFBWCxDQUFBLENBRjVELENBQUE7QUFBQSxJQUdBLE1BQUEsR0FBUyxPQUFPLENBQUMsVUFBUixDQUFBLENBSFQsQ0FBQTtBQUFBLElBSUEsVUFBQSxHQUFhLE1BQUEsR0FBUyxDQUp0QixDQUFBO0FBQUEsSUFLQSxPQUFBLEdBQVUsT0FBTyxDQUFDLFdBQVIsQ0FBQSxDQUxWLENBQUE7QUFBQSxJQU1BLFdBQUEsR0FBYyxPQUFBLEdBQVUsQ0FOeEIsQ0FBQTtBQUFBLElBT0EsTUFBQSxHQUFTLElBQUMsQ0FBQSxTQUFTLENBQUMsS0FBWCxDQUFBLENBUFQsQ0FBQTtBQUFBLElBUUEsT0FBQSxHQUFVLElBQUMsQ0FBQSxTQUFTLENBQUMsTUFBWCxDQUFBLENBUlYsQ0FBQTtBQUFBLElBU0EsTUFBQSxHQUFTLElBQUMsQ0FBQSxNQUFNLENBQUMsVUFBUixDQUFBLENBVFQsQ0FBQTtBQUFBLElBVUEsVUFBQSxHQUFhLE1BQUEsR0FBUyxDQVZ0QixDQUFBO0FBQUEsSUFXQSxPQUFBLEdBQVUsSUFBQyxDQUFBLE1BQU0sQ0FBQyxXQUFSLENBQUEsQ0FYVixDQUFBO0FBQUEsSUFZQSxXQUFBLEdBQWMsT0FBQSxHQUFVLENBWnhCLENBQUE7QUFBQSxJQWFBLE1BQUEsR0FBUyxDQWJULENBQUE7QUFBQSxJQWNBLE9BQUEsR0FBVSxRQUFBLENBQVMsT0FBTyxDQUFDLElBQVIsQ0FBYSxlQUFiLENBQVQsQ0FkVixDQUFBO0FBZUEsSUFBQSxJQUFBLENBQUEsT0FBQTtBQUFBLE1BQUEsT0FBQSxHQUFVLENBQVYsQ0FBQTtLQWZBO0FBQUEsSUFnQkEsT0FBQSxHQUFVLFFBQUEsQ0FBUyxPQUFPLENBQUMsSUFBUixDQUFhLGVBQWIsQ0FBVCxDQWhCVixDQUFBO0FBaUJBLElBQUEsSUFBQSxDQUFBLE9BQUE7QUFBQSxNQUFBLE9BQUEsR0FBVSxDQUFWLENBQUE7S0FqQkE7QUFrQkEsWUFBTyxPQUFPLENBQUMsSUFBUixDQUFhLGVBQWIsQ0FBUDtBQUFBLFdBQ08sS0FEUDtBQUVJLFFBQUEsUUFBQSxHQUFXLGFBQUEsR0FBZ0IsVUFBM0IsQ0FBQTtBQUFBLFFBQ0EsT0FBQSxHQUFVLGFBQUEsR0FBZ0IsT0FBaEIsR0FBMEIsV0FBMUIsR0FBd0MsTUFEbEQsQ0FGSjtBQUNPO0FBRFAsV0FJTyxPQUpQO0FBS0ksUUFBQSxRQUFBLEdBQVcsYUFBQSxHQUFnQixVQUFoQixHQUE2QixNQUF4QyxDQUFBO0FBQUEsUUFDQSxPQUFBLEdBQVUsYUFBQSxHQUFnQixXQUQxQixDQUxKO0FBSU87QUFKUCxXQU9PLFFBUFA7QUFRSSxRQUFBLFFBQUEsR0FBVyxhQUFBLEdBQWdCLFVBQTNCLENBQUE7QUFBQSxRQUNBLE9BQUEsR0FBVSxhQUFBLEdBQWdCLFdBQWhCLEdBQThCLE1BRHhDLENBUko7QUFPTztBQVBQLFdBVU8sTUFWUDtBQVdJLFFBQUEsUUFBQSxHQUFXLGFBQUEsR0FBZ0IsTUFBaEIsR0FBeUIsVUFBekIsR0FBc0MsTUFBakQsQ0FBQTtBQUFBLFFBQ0EsT0FBQSxHQUFVLGFBQUEsR0FBZ0IsV0FEMUIsQ0FYSjtBQVVPO0FBVlAsV0FhTyxVQWJQO0FBY0ksUUFBQSxRQUFBLEdBQVcsYUFBQSxHQUFnQixNQUFoQixHQUF5QixVQUF6QixHQUFzQyxNQUFqRCxDQUFBO0FBQUEsUUFDQSxPQUFBLEdBQVUsYUFBQSxHQUFnQixPQUFoQixHQUEwQixXQUExQixHQUF3QyxNQURsRCxDQWRKO0FBYU87QUFiUCxXQWdCTyxXQWhCUDtBQWlCSSxRQUFBLFFBQUEsR0FBVyxhQUFBLEdBQWdCLFVBQWhCLEdBQTZCLE1BQXhDLENBQUE7QUFBQSxRQUNBLE9BQUEsR0FBVSxhQUFBLEdBQWdCLE9BQWhCLEdBQTBCLFdBQTFCLEdBQXdDLE1BRGxELENBakJKO0FBZ0JPO0FBaEJQLFdBbUJPLGFBbkJQO0FBb0JJLFFBQUEsUUFBQSxHQUFXLGFBQUEsR0FBZ0IsTUFBaEIsR0FBeUIsVUFBekIsR0FBc0MsTUFBakQsQ0FBQTtBQUFBLFFBQ0EsT0FBQSxHQUFVLGFBQUEsR0FBZ0IsV0FBaEIsR0FBOEIsTUFEeEMsQ0FwQko7QUFtQk87QUFuQlAsV0FzQk8sY0F0QlA7QUF1QkksUUFBQSxRQUFBLEdBQVcsYUFBQSxHQUFnQixVQUFoQixHQUE2QixNQUF4QyxDQUFBO0FBQUEsUUFDQSxPQUFBLEdBQVUsYUFBQSxHQUFnQixXQUFoQixHQUE4QixNQUR4QyxDQXZCSjtBQUFBLEtBbEJBO1dBMkNBO0FBQUEsTUFBQSxJQUFBLEVBQU0sUUFBQSxHQUFXLE9BQWpCO0FBQUEsTUFDQSxHQUFBLEVBQUssT0FBQSxHQUFVLE9BRGY7TUE1Q2E7RUFBQSxDQXBKZixDQUFBOztBQUFBLG1CQW1NQSxlQUFBLEdBQWlCLFNBQUEsR0FBQTtBQUNmLFFBQUEsTUFBQTtBQUFBLElBQUEsTUFBQSxHQUFTLElBQUMsQ0FBQSxhQUFELENBQUEsQ0FBVCxDQUFBO0FBQUEsSUFDQSxJQUFDLENBQUEsU0FBUyxDQUFDLElBQVgsQ0FBZ0IsR0FBQSxHQUFHLENBQUMsSUFBQyxDQUFBLE1BQU0sQ0FBQyxJQUFSLENBQWEsY0FBYixDQUFELENBQW5CLENBQW1ELENBQUMsR0FBcEQsQ0FDRTtBQUFBLE1BQUEsSUFBQSxFQUFTLE1BQU0sQ0FBQyxJQUFSLEdBQWEsSUFBckI7QUFBQSxNQUNBLEdBQUEsRUFBUSxNQUFNLENBQUMsR0FBUixHQUFZLElBRG5CO0tBREYsQ0FEQSxDQUFBO1dBSUEsSUFBQyxDQUFBLFFBQUQsQ0FBQSxFQUxlO0VBQUEsQ0FuTWpCLENBQUE7O0FBQUEsbUJBME1BLGNBQUEsR0FBZ0IsU0FBQSxHQUFBO0FBQ2QsUUFBQSxNQUFBO0FBQUEsSUFBQSxNQUFBLEdBQVMsSUFBQyxDQUFBLGFBQUQsQ0FBQSxDQUFULENBQUE7V0FDQSxJQUFDLENBQUEsU0FBUyxDQUFDLElBQVgsQ0FBZ0IsR0FBQSxHQUFHLENBQUMsSUFBQyxDQUFBLE1BQU0sQ0FBQyxJQUFSLENBQWEsY0FBYixDQUFELENBQW5CLENBQW1ELENBQUMsT0FBcEQsQ0FDRTtBQUFBLE1BQUEsSUFBQSxFQUFTLE1BQU0sQ0FBQyxJQUFSLEdBQWEsSUFBckI7QUFBQSxNQUNBLEdBQUEsRUFBUSxNQUFNLENBQUMsR0FBUixHQUFZLElBRG5CO0tBREYsRUFHRSxHQUhGLEVBR08sQ0FBQSxTQUFBLEtBQUEsR0FBQTthQUFBLFNBQUEsR0FBQTtBQUNMLGVBQU8sS0FBQyxDQUFBLFFBQUQsQ0FBQSxDQUFQLENBREs7TUFBQSxFQUFBO0lBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUhQLEVBRmM7RUFBQSxDQTFNaEIsQ0FBQTs7QUFBQSxtQkFvTkEsV0FBQSxHQUFhLFNBQUEsR0FBQTtXQUNYLElBQUMsQ0FBQSxNQUFNLENBQUMsUUFBUixDQUFpQixXQUFqQixFQURXO0VBQUEsQ0FwTmIsQ0FBQTs7QUFBQSxtQkF5TkEsR0FBQSxHQUFLLFNBQUEsR0FBQTtBQUNILFFBQUEsU0FBQTtBQUFBLElBQUEsSUFBQSxHQUFPLENBQUMsSUFBQyxDQUFBLEtBQUssQ0FBQyxLQUFQLENBQUEsQ0FBQSxHQUFpQixDQUFDLElBQUMsQ0FBQSxNQUFNLENBQUMsSUFBUixDQUFhLFVBQWIsQ0FBQSxHQUEyQixHQUE1QixDQUFsQixDQUFBLEdBQ0wsVUFBQSxDQUFXLElBQUMsQ0FBQSxLQUFLLENBQUMsR0FBUCxDQUFXLE1BQVgsQ0FBWCxDQURLLEdBQzRCLENBQUMsSUFBQyxDQUFBLE1BQU0sQ0FBQyxVQUFSLENBQUEsQ0FBQSxHQUF1QixDQUF4QixDQURuQyxDQUFBO0FBQUEsSUFFQSxHQUFBLEdBQU0sQ0FBQyxJQUFDLENBQUEsS0FBSyxDQUFDLE1BQVAsQ0FBQSxDQUFBLEdBQWtCLENBQUMsSUFBQyxDQUFBLE1BQU0sQ0FBQyxJQUFSLENBQWEsVUFBYixDQUFBLEdBQTJCLEdBQTVCLENBQW5CLENBQUEsR0FDSixVQUFBLENBQVcsSUFBQyxDQUFBLEtBQUssQ0FBQyxHQUFQLENBQVcsS0FBWCxDQUFYLENBREksR0FDNEIsQ0FBQyxJQUFDLENBQUEsTUFBTSxDQUFDLFdBQVIsQ0FBQSxDQUFBLEdBQXdCLENBQXpCLENBSGxDLENBQUE7QUFBQSxJQUlBLElBQUMsQ0FBQSxNQUFNLENBQUMsR0FBUixDQUNFO0FBQUEsTUFBQSxJQUFBLEVBQVMsSUFBRCxHQUFNLElBQWQ7QUFBQSxNQUNBLEdBQUEsRUFBUSxHQUFELEdBQUssSUFEWjtLQURGLENBSkEsQ0FBQTtBQUFBLElBT0EsSUFBQyxDQUFBLGVBQUQsQ0FBQSxDQVBBLENBQUE7V0FRQSxDQUFDLElBQUQsRUFBTyxHQUFQLEVBVEc7RUFBQSxDQXpOTCxDQUFBOztBQUFBLG1CQW9PQSxZQUFBLEdBQWMsU0FBQSxHQUFBO0FBQ1osUUFBQSxNQUFBO0FBQUEsSUFBQSxNQUFBLEdBQVMsSUFBQyxDQUFBLFFBQUQsQ0FBQSxDQUFULENBQUE7V0FDQSxJQUFDLENBQUEsTUFBTSxDQUFDLElBQVIsQ0FDRTtBQUFBLE1BQUEsVUFBQSxFQUFZLE1BQU8sQ0FBQSxDQUFBLENBQW5CO0FBQUEsTUFDQSxVQUFBLEVBQVksTUFBTyxDQUFBLENBQUEsQ0FEbkI7S0FERixFQUZZO0VBQUEsQ0FwT2QsQ0FBQTs7QUFBQSxtQkEwT0EsTUFBQSxHQUFRLFNBQUMsT0FBRCxHQUFBO0FBQ04sUUFBQSxTQUFBO0FBQUEsSUFBQSxJQUFHLE9BQU8sQ0FBQyxLQUFYO0FBQ0UsTUFBQSxJQUFDLENBQUEsTUFBTSxDQUFDLEdBQVIsQ0FBWTtBQUFBLFFBQUEsZUFBQSxFQUFpQixPQUFPLENBQUMsS0FBekI7T0FBWixDQUFBLENBREY7S0FBQTtBQUVBLElBQUEsSUFBRyxPQUFPLENBQUMsT0FBWDtBQUNFLE1BQUEsSUFBQyxDQUFBLE1BQU0sQ0FBQyxJQUFSLENBQWEsR0FBQSxHQUFJLE1BQU0sQ0FBQyxZQUF4QixDQUF1QyxDQUFDLElBQXhDLENBQTZDLE9BQU8sQ0FBQyxPQUFyRCxDQUFBLENBQUE7QUFBQSxNQUNBLElBQUMsQ0FBQSxlQUFELENBQUEsQ0FEQSxDQURGO0tBRkE7QUFLQSxJQUFBLElBQUcsT0FBTyxDQUFDLFNBQVg7QUFDRSxNQUFBLElBQUMsQ0FBQSxNQUFNLENBQUMsV0FBUixDQUFvQixXQUFwQixDQUFBLENBQUE7QUFDQSxNQUFBLElBQWlDLE9BQU8sQ0FBQyxTQUFSLEtBQXFCLElBQXREO0FBQUEsUUFBQSxJQUFDLENBQUEsTUFBTSxDQUFDLFFBQVIsQ0FBaUIsV0FBakIsQ0FBQSxDQUFBO09BRkY7S0FMQTtBQVFBLElBQUEsSUFBRyxPQUFPLENBQUMsTUFBWDtBQUNFLE1BQUEsSUFBQSxHQUFPLENBQUMsQ0FBQyxVQUFBLENBQVcsT0FBTyxDQUFDLE1BQU8sQ0FBQSxDQUFBLENBQTFCLENBQUEsR0FBZ0MsR0FBakMsQ0FBQSxHQUF3QyxJQUFDLENBQUEsU0FBUyxDQUFDLEtBQVgsQ0FBQSxDQUF6QyxDQUFBLEdBQStELEVBQXRFLENBQUE7QUFBQSxNQUNBLEdBQUEsR0FBTSxDQUFDLENBQUMsVUFBQSxDQUFXLE9BQU8sQ0FBQyxNQUFPLENBQUEsQ0FBQSxDQUExQixDQUFBLEdBQWdDLEdBQWpDLENBQUEsR0FBd0MsSUFBQyxDQUFBLFNBQVMsQ0FBQyxNQUFYLENBQUEsQ0FBekMsQ0FBQSxHQUFnRSxFQUR0RSxDQUFBO2FBRUEsSUFBQyxDQUFBLE1BQU0sQ0FBQyxHQUFSLENBQ0U7QUFBQSxRQUFBLElBQUEsRUFBUyxJQUFELEdBQU0sSUFBZDtBQUFBLFFBQ0EsR0FBQSxFQUFRLEdBQUQsR0FBSyxJQURaO09BREYsRUFIRjtLQVRNO0VBQUEsQ0ExT1IsQ0FBQTs7QUFBQSxtQkEwUEEsTUFBQSxHQUFRLFNBQUEsR0FBQTtBQUNOLElBQUEsSUFBdUIsSUFBQyxDQUFBLE9BQUQsQ0FBQSxDQUF2QjtBQUFBLE1BQUEsSUFBQyxDQUFBLE9BQUQsQ0FBQSxDQUFVLENBQUMsTUFBWCxDQUFBLENBQUEsQ0FBQTtLQUFBO1dBQ0EsSUFBQyxDQUFBLE1BQU0sQ0FBQyxNQUFSLENBQUEsRUFGTTtFQUFBLENBMVBSLENBQUE7O2dCQUFBOztJQTVoQkYsQ0FBQTs7QUFBQSxNQTJ4Qk0sQ0FBQyxNQUFQLEdBQWdCLEdBQUEsQ0FBQSxNQTN4QmhCLENBQUEiLCJmaWxlIjoicGxhbml0LXRtcC5qcyIsInNvdXJjZVJvb3QiOiIvc291cmNlLyIsInNvdXJjZXNDb250ZW50IjpbImNsYXNzIFBsYW5pdFxuXG4gICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIERPTSBSZWZlcmVuY2VzXG5cbiAgQGNvbnRhaW5lckNsYXNzOiAgICAgICAgJ3BsYW5pdC1jb250YWluZXInXG4gIEBkcmFnZ2luZ0NsYXNzOiAgICAgICAgICdpcy1kcmFnZ2luZydcbiAgQGltYWdlQ29udGFpbmVyOiAgICAgICAgJ3BsYW5pdC1pbWFnZS1jb250YWluZXInXG4gIEBpbmZvYm94Q2xhc3M6ICAgICAgICAgICdwbGFuaXQtaW5mb2JveCdcbiAgQGluZm9ib3hDb250YWluZXJDbGFzczogJ3BsYW5pdC1pbmZvYm94LWNvbnRhaW5lcidcbiAgQG1hcmtlckNsYXNzOiAgICAgICAgICAgJ3BsYW5pdC1tYXJrZXInXG4gIEBtYXJrZXJDb250YWluZXJDbGFzczogICdwbGFuaXQtbWFya2Vycy1jb250YWluZXInXG4gIEBtYXJrZXJDb250ZW50Q2xhc3M6ICAgICdwbGFuaXQtbWFya2VyLWNvbnRlbnQnXG5cbiAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gSW5zdGFudGlhdGlvblxuXG4gIG5ldzogKEBvcHRpb25zID0ge30pIC0+XG4gICAgcmV0dXJuIG5ldyBQbGFuaXQuUGxhbihAb3B0aW9ucylcblxuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBHbG9iYWwgSGVscGVyc1xuXG4gIEByYW5kb21TdHJpbmc6IChsZW5ndGggPSAxNikgLT5cbiAgICBzdHIgPSBNYXRoLnJhbmRvbSgpLnRvU3RyaW5nKDM2KS5zbGljZSgyKVxuICAgIHN0ciA9IHN0ciArIE1hdGgucmFuZG9tKCkudG9TdHJpbmcoMzYpLnNsaWNlKDIpXG4gICAgc3RyLnN1YnN0cmluZygwLCBsZW5ndGggLSAxKVxuXG5jbGFzcyBQbGFuaXQuUGxhblxuXG4gICMgVGhpcyBjYWxscyBtZXRob2RzIHRvIGluc3RhbnRpYXRlIGEgbmV3IHBsYW4uIEZvdW5kIGluXG4gICMgcGxhbi9pbml0LmNvZmZlZVxuICAjXG4gIGNvbnN0cnVjdG9yOiAoQG9wdGlvbnMgPSB7fSkgLT5cbiAgICBtZXRob2QuY2FsbChAKSBmb3IgbWV0aG9kIGluIGluaXRNZXRob2RzKClcblxuICAjIChwcml2YXRlKSBNZXRob2RzIChpbiBvcmRlcikgbmVlZGVkIHRvIGluc3RhbnRpYXRlIHRoaXNcbiAgIyBvYmplY3RcbiAgI1xuICBpbml0TWV0aG9kcyA9IC0+XG4gICAgW2luaXRPcHRpb25zLCBpbml0Q29udGFpbmVyLCBpbml0SW1hZ2UsIGluaXRDYW52YXNNYXJrZXJzLCBpbml0RXZlbnRzXVxuXG5cbiAgIyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PSBPcHRpb25zXG5cbiAgIyAocHJpdmF0ZSkgQWRkIGRlZmF1bHQgb3B0aW9ucyBpZiB0aGUgbmVjZXNzYXJ5IG9wdGlvbnNcbiAgIyBhcmUgbWlzc2luZ1xuICAjXG4gIGluaXRPcHRpb25zID0gLT5cbiAgICBpZiBAb3B0aW9ucy5jb250YWluZXJcbiAgICAgIEBvcHRpb25zLmNvbnRhaW5lciA9ICQoXCIjI3tAb3B0aW9ucy5jb250YWluZXJ9XCIpXG4gICAgZWxzZVxuICAgICAgQG9wdGlvbnMuY29udGFpbmVyID0gJCgnI3BsYW5pdCcpXG4gICAgIyBkaXJlY3QgYWNjZXNzIHRvIHBsYW5pdCBjb250YWluZXJcbiAgICBAY29udGFpbmVyID0gQG9wdGlvbnMuY29udGFpbmVyXG5cbiAgIyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PSBDb250YWluZXJcblxuICAjIChwcml2YXRlKSBEcmF3IHRoZSBjb250YWluZXIgYW5kIHRoZSBzdWJjb250YWluZXJzXG4gICNcbiAgaW5pdENvbnRhaW5lciA9IC0+XG4gICAgQGNvbnRhaW5lci5hZGRDbGFzcyhQbGFuaXQuY29udGFpbmVyQ2xhc3MpXG4gICAgQGNvbnRhaW5lci5hcHBlbmQgXCJcIlwiXG4gICAgICA8ZGl2IGNsYXNzPVwiI3tQbGFuaXQuaW5mb2JveENvbnRhaW5lckNsYXNzfVwiPjwvZGl2PlxuICAgICAgPGRpdiBjbGFzcz1cIiN7UGxhbml0Lm1hcmtlckNvbnRhaW5lckNsYXNzfVwiPjwvZGl2PlxuICAgICAgICBcIlwiXCJcbiAgICBAbWFya2Vyc0NvbnRhaW5lciA9IEBjb250YWluZXIuZmluZChcIi4je1BsYW5pdC5tYXJrZXJDb250YWluZXJDbGFzc31cIilcbiAgICAgIC5maXJzdCgpICMgZGlyZWN0IGFjY2VzcyB0byBtYXJrZXJzIGNvbnRhaW5lclxuXG4gICMgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0gQmFja2dyb3VuZCBJbWFnZVxuXG4gICMgKHByaXZhdGUpIENyZWF0ZSBpbWFnZSBjb250YWluZXIgYW5kIGFkZCBpbWFnZSBpZlxuICAjIG5lY2Vzc2FyeVxuICAjXG4gIGluaXRJbWFnZSA9IC0+XG4gICAgaWYgQG9wdGlvbnMuaW1hZ2UgJiYgQG9wdGlvbnMuaW1hZ2UudXJsXG4gICAgICBAY29udGFpbmVyLnByZXBlbmQgXCJcIlwiXG4gICAgICAgIDxkaXYgY2xhc3M9XCIje1BsYW5pdC5pbWFnZUNvbnRhaW5lcn1cIj5cbiAgICAgICAgICA8aW1nIHNyYz1cIiN7QG9wdGlvbnMuaW1hZ2UudXJsfVwiPlxuICAgICAgICA8L2Rpdj5cbiAgICAgIFwiXCJcIlxuICAgICAgQGltYWdlID0gQGNvbnRhaW5lci5maW5kKCdpbWcnKS5maXJzdCgpXG4gICAgICBAaW1hZ2UubG9hZCAoKSA9PlxuICAgICAgICBAY29udGFpbmVyLmNzcyhoZWlnaHQ6IEBpbWFnZS5oZWlnaHQoKSlcbiAgICAgICAgaW5pdFpvb21hYmxlLmNhbGwoQClcbiAgICAgICAgaW5pdE1hcmtlcnMuY2FsbChAKVxuXG4gICMgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0gWm9vbWluZ1xuXG4gICMgKHByaXZhdGUpIFNldHMgb3VyIHJlZmVyZW5jZXMgZm9yIHdvcmtpbmcgd2l0aCB6b29tLCBhbmRcbiAgIyBjb250cm9scyB3aGV0aGVyIG9yIG5vdCB0byBhZGQgY29udHJvbHNcbiAgI1xuICBpbml0Wm9vbWFibGUgPSAtPlxuICAgICMgYWRkIHpvb20gSUQgdG8gbWFya2VycyBjb250YWluZXJcbiAgICBAem9vbUlkID0gUGxhbml0LnJhbmRvbVN0cmluZygpXG4gICAgQG1hcmtlcnNDb250YWluZXIuYXR0cignZGF0YS16b29tLWlkJywgQHpvb21JZClcbiAgICAjIHNldCBpbml0aWFsIGJhY2tncm91bmQgY29vcmRpbmF0ZXNcbiAgICBAcmVzZXRJbWFnZSgpXG4gICAgIyBhZGQgem9vbSBjb250cm9scyBpZiBuZWNlc3NhcnlcbiAgICBpbml0Wm9vbUNvbnRyb2xzLmNhbGwoQCkgaWYgQG9wdGlvbnMuaW1hZ2Uuem9vbVxuXG4gICMgKHByaXZhdGUpIFJlbmRlciB0aGUgem9vbSBjb250cm9scyBhbmQgYmluZHMgbmVjZXNzYXJ5XG4gICMgZXZlbnRzXG4gICNcbiAgaW5pdFpvb21Db250cm9scyA9IC0+XG4gICAgIyBkcmF3IHRoZSBjb250cm9scyBkaW5rdXNcbiAgICBAY29udGFpbmVyLnByZXBlbmQgXCJcIlwiXG4gICAgICA8ZGl2IGNsYXNzPVwicGxhbml0LWNvbnRyb2xzXCI+XG4gICAgICAgIDxhIGhyZWY9XCIjXCIgY2xhc3M9XCJ6b29tXCIgZGF0YS1hY3Rpb249XCJpblwiPis8L2E+XG4gICAgICAgIDxhIGhyZWY9XCIjXCIgY2xhc3M9XCJ6b29tXCIgZGF0YS1hY3Rpb249XCJvdXRcIj4tPC9hPlxuICAgICAgPC9kaXY+XG4gICAgXCJcIlwiXG4gICAgQGNvbnRhaW5lci5maW5kKFwiLnpvb21bZGF0YS1hY3Rpb249J2luJ11cIikuY2xpY2sgKGUpID0+XG4gICAgICBlLnByZXZlbnREZWZhdWx0KClcbiAgICAgIEB6b29tSW4oKVxuICAgIEBjb250YWluZXIuZmluZChcIi56b29tW2RhdGEtYWN0aW9uPSdvdXQnXVwiKS5jbGljayAoZSkgPT5cbiAgICAgIGUucHJldmVudERlZmF1bHQoKVxuICAgICAgQHpvb21PdXQoKVxuICAgICMgYmluZCBkcmFnZ2FibGUgZXZlbnRzXG4gICAgQGNvbnRhaW5lci5vbignZGJsY2xpY2snLCBAZGJsY2xpY2spXG4gICAgQGNvbnRhaW5lci5vbignbW91c2Vkb3duJywgQG1vdXNlZG93bilcbiAgICAkKGRvY3VtZW50KS5vbignbW91c2Vtb3ZlJywgQG1vdXNlbW92ZSlcbiAgICAkKGRvY3VtZW50KS5vbignbW91c2V1cCcsIEBtb3VzZXVwKVxuXG4gICMgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0gTWFya2Vyc1xuXG4gICMgKHByaXZhdGUpIFdpbGwgY2FsbCBpbml0TWFya2VycyBpZiB0aGVyZSBpcyBubyBpbWFnZSxcbiAgIyBvdGhlcndpc2UgaXQncyBjYWxsZWQgZnJvbSBpbml0SW1hZ2UsIHdoaWNoIHdhaXRzIGZvclxuICAjIHRoZSBpbWFnZSB0byBiZSBsb2FkZWQuXG4gICNcbiAgaW5pdENhbnZhc01hcmtlcnMgPSAtPlxuICAgIGluaXRNYXJrZXJzLmNhbGwoQCkgdW5sZXNzIEBvcHRpb25zLmltYWdlICYmIEBvcHRpb25zLmltYWdlLnVybFxuXG4gICMgSW50ZXJ2YWwgbWV0aG9kIHRoYXQgY29udGludWVzIHRvIGNoZWNrIGZvciBpbWFnZSBiZWluZ1xuICAjIGxvYWRlZCBiZWZvcmUgYWRkaW5nIG1hcmtlcnMgdG8gdGhlIHBsYW5cbiAgI1xuICBpbml0TWFya2VycyA9IC0+XG4gICAgaWYgQG9wdGlvbnMubWFya2VycyAmJiBAb3B0aW9ucy5tYXJrZXJzLmxlbmd0aCA+IDBcbiAgICAgIGZvciBtYXJrZXIgaW4gQG9wdGlvbnMubWFya2Vyc1xuICAgICAgICBtYXJrZXIuY29udGFpbmVyID0gQGNvbnRhaW5lclxuICAgICAgICBQbGFuaXQuTWFya2VyLmNyZWF0ZShtYXJrZXIpXG5cbiAgIyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PSBQbGFuIEV2ZW50c1xuXG4gICMgKHByaXZhdGUpIEJpbmQgZXZlbnRzIHRvIHRoZSBwbGFuLiBUaGVzZSBldmVudHMgZGVhbFxuICAjIG1vc3RseSB3aXRoIG1hcmtlcnMsIHNpbmNlIHNvbWUgZXZlbnQgc2hvdWxkIGJlIGF0dGFjaGVkXG4gICMgdG8gdGhlIHBsYW4gYW5kIGxhdGVyIGZpbmQgdGhlIGFwcHJvcHJpYXRlIG1hcmtlclxuICAjXG4gIGluaXRFdmVudHMgPSAtPlxuICAgIGlmIEBjb250YWluZXIuZmluZChcIi4je1BsYW5pdC5pbWFnZUNvbnRhaW5lcn0gPiBpbWdcIikubGVuZ3RoID4gMFxuICAgICAgQGltYWdlID0gQGNvbnRhaW5lci5maW5kKFwiLiN7UGxhbml0LmltYWdlQ29udGFpbmVyfSA+IGltZ1wiKS5maXJzdCgpXG4gICAgJChkb2N1bWVudCkub24oJ21vdXNlbW92ZScsIEBtb3VzZW1vdmUpXG4gICAgJChkb2N1bWVudCkub24oJ21vdXNldXAnLCBAbW91c2V1cClcblxuXG4gICMgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0gU2V0dGluZyBJbWFnZVxuXG4gICMgWm9vbWEgdGhlIGltYWdlIG91dCBhbGwgdGhlIHdheSBhbmQgc2V0cyB0aGUgbWFya2Vyc1xuICAjIGFwcHJvcHJpYXRlbHlcbiAgI1xuICByZXNldEltYWdlOiA9PlxuICAgIEBpbWFnZVBvc2l0aW9uID1cbiAgICAgIGxlZnRQeDogICAgICAgICAwXG4gICAgICB0b3BQeDogICAgICAgICAgMFxuICAgICAgd2lkdGg6ICAgICAgICAgIEBpbWFnZS53aWR0aCgpXG4gICAgICBoZWlnaHQ6ICAgICAgICAgQGltYWdlLmhlaWdodCgpXG4gICAgICBzY2FsZTogICAgICAgICAgMVxuICAgICAgaW5jcmVtZW50OiAgICAgIDAuNVxuICAgIHNldEJhY2tncm91bmQuY2FsbChAKVxuXG4gICMgKHByaXZhdGUpIE1vdmVzIHRoZSBiYWNrZ3JvdW5kIGFuZCBtYXJrZXJzIHdpdGhvdXRcbiAgIyBhbmltYXRpb24gdG8gdGhlIGxvY2F0aW9uIHNldCBieSB0aGUgaW1hZ2VQb3NpdGlvblxuICAjIHByb3BlcnR5XG4gICNcbiAgc2V0QmFja2dyb3VuZCA9IC0+XG4gICAgQGltYWdlLmNzc1xuICAgICAgbGVmdDogXCIje0BpbWFnZVBvc2l0aW9uLmxlZnRQeH1weFwiXG4gICAgICB0b3A6IFwiI3tAaW1hZ2VQb3NpdGlvbi50b3BQeH1weFwiXG4gICAgICB3aWR0aDogXCIje0BpbWFnZVBvc2l0aW9uLnNjYWxlICogMTAwLjB9JVwiXG4gICAgICBoZWlnaHQ6ICdhdXRvJ1xuICAgIHNldE1hcmtlcnMuY2FsbChAKVxuXG4gICMgKHByaXZhdGUpIEVxdWl2YWxlbnQgdG8gc2V0QmFja2dyb3VuZCwgYnV0IHdpdGhcbiAgIyBhbmltYXRpb25cbiAgI1xuICBhbmltYXRlQmFja2dyb3VuZCA9IC0+XG4gICAgQGltYWdlLmFuaW1hdGVcbiAgICAgIGxlZnQ6IFwiI3tAaW1hZ2VQb3NpdGlvbi5sZWZ0UHh9cHhcIlxuICAgICAgdG9wOiBcIiN7QGltYWdlUG9zaXRpb24udG9wUHh9cHhcIlxuICAgICAgd2lkdGg6IFwiI3tAaW1hZ2VQb3NpdGlvbi5zY2FsZSAqIDEwMC4wfSVcIlxuICAgICAgaGVpZ2h0OiAnYXV0bydcbiAgICAsIDI1MFxuICAgIGFuaW1hdGVNYXJrZXJzLmNhbGwoQClcblxuICAjID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09IFNldHRpbmcgTWFya2Vyc1xuXG4gICMgKHByaXZhdGUpIFNldHMgbWFya2VycyBpbiBjb3JyZWN0IGxvY2F0aW9uLCBiYXNlZCBvblxuICAjIGltYWdlIHBvc2l0aW9uXG4gICNcbiAgc2V0TWFya2VycyA9IC0+XG4gICAgbWFya2VycyA9IEBjb250YWluZXIuZmluZChcIi4je1BsYW5pdC5tYXJrZXJDbGFzc31cIilcbiAgICBpZiBtYXJrZXJzLmxlbmd0aCA+IDBcbiAgICAgIGZvciBtYXJrZXIgaW4gbWFya2Vyc1xuICAgICAgICBsZWZ0ID0gKEBpbWdXaWR0aCgpICogKCQobWFya2VyKS5hdHRyKCdkYXRhLXhQYycpIC8gMTAwKSkgK1xuICAgICAgICAgIEBpbWFnZVBvc2l0aW9uLmxlZnRQeCAtICgkKG1hcmtlcikub3V0ZXJXaWR0aCgpIC8gMilcbiAgICAgICAgdG9wID0gKEBpbWdIZWlnaHQoKSAqICgkKG1hcmtlcikuYXR0cignZGF0YS15UGMnKSAvIDEwMCkpICtcbiAgICAgICAgICBAaW1hZ2VQb3NpdGlvbi50b3BQeCAtICgkKG1hcmtlcikub3V0ZXJIZWlnaHQoKSAvIDIpXG4gICAgICAgICQobWFya2VyKS5jc3NcbiAgICAgICAgICBsZWZ0OiBcIiN7bGVmdH1weFwiXG4gICAgICAgICAgdG9wOiBcIiN7dG9wfXB4XCJcbiAgICAgIHBvc2l0aW9uSW5mb2JveGVzLmNhbGwoQClcblxuICAjIChwcml2YXRlKSBFcXVpdmFsZW50IHRvIHNldE1hcmtlcnMsIGJ1dCB3aXRoIGFuaW1hdGlvblxuICAjXG4gIGFuaW1hdGVNYXJrZXJzID0gLT5cbiAgICBtYXJrZXJzID0gQGNvbnRhaW5lci5maW5kKFwiLiN7UGxhbml0Lm1hcmtlckNsYXNzfVwiKVxuICAgIGlmIG1hcmtlcnMubGVuZ3RoID4gMFxuICAgICAgZm9yIG1hcmtlciBpbiBtYXJrZXJzXG4gICAgICAgIG0gPSBuZXcgUGxhbml0Lk1hcmtlcihAY29udGFpbmVyLCAkKG1hcmtlcikuYXR0cignZGF0YS1tYXJrZXInKSlcbiAgICAgICAgbS5oaWRlSW5mb2JveCgpXG4gICAgICAgIGxlZnQgPSAoQGltZ1dpZHRoKCkgKiAoJChtYXJrZXIpLmF0dHIoJ2RhdGEteFBjJykgLyAxMDApKSArXG4gICAgICAgICAgQGltYWdlUG9zaXRpb24ubGVmdFB4IC0gKCQobWFya2VyKS5vdXRlcldpZHRoKCkgLyAyKVxuICAgICAgICB0b3AgPSAoQGltZ0hlaWdodCgpICogKCQobWFya2VyKS5hdHRyKCdkYXRhLXlQYycpIC8gMTAwKSkgK1xuICAgICAgICAgIEBpbWFnZVBvc2l0aW9uLnRvcFB4IC0gKCQobWFya2VyKS5vdXRlckhlaWdodCgpIC8gMilcbiAgICAgICAgZG8gKG0pIC0+XG4gICAgICAgICAgJChtYXJrZXIpLmFuaW1hdGVcbiAgICAgICAgICAgIGxlZnQ6IFwiI3tsZWZ0fXB4XCJcbiAgICAgICAgICAgIHRvcDogXCIje3RvcH1weFwiXG4gICAgICAgICAgLCAyNTAsICgpID0+XG4gICAgICAgICAgICBtLnBvc2l0aW9uSW5mb2JveCgpXG4gICAgICAgICAgICBtLnVuaGlkZUluZm9ib3goKVxuXG4gICMgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0gU2V0dGluZyBJbmZvYm94ZXNcblxuICAjIChwcml2YXRlKSBBcHByb3ByaWF0ZWx5IHBvc2l0aW9uIHRoZSBpbmZvYm94IG9uIGV2ZXJ5XG4gICMgbWFya2VyLCB0aGUgbG9naWMgZm9yIHdoaWNoIGlzIGluIHRoZSBNYXJrZXIgY2xhc3NcbiAgI1xuICBwb3NpdGlvbkluZm9ib3hlcyA9IC0+XG4gICAgZm9yIG1hcmtlciBpbiBAY29udGFpbmVyLmZpbmQoXCIuI3tQbGFuaXQubWFya2VyQ2xhc3N9XCIpXG4gICAgICBtID0gbmV3IFBsYW5pdC5NYXJrZXIoQGNvbnRhaW5lciwgJChtYXJrZXIpLmF0dHIoJ2RhdGEtbWFya2VyJykpXG4gICAgICBtLnBvc2l0aW9uSW5mb2JveCgpXG4gICAgdHJ1ZVxuXG4gICMgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0gTW92ZSBBY3Rpb25zXG5cbiAgIyBXaWxsIGNlbnRlciB0aGUgaW1hZ2Ugb24gdGhlIGdpdmVuIGNvb3JkaW5hdGVzIGFzIFt4LHldXG4gICMgaW4gZmxvYXRlZCBwZXJjZW50YWdlcy4gRW5zdXJlcyB0aGVyZSBpcyBlbm91Z2ggaW1hZ2Ugb25cbiAgIyBlYWNoIHNpZGUgYnkgem9vbWluZyBpbiBpZiBuZWNlc3NhcnkuXG4gICNcbiAgY2VudGVyT246IChjb29yZHMpID0+XG4gICAgaWYgY29vcmRzWzBdID49IDUwIHRoZW4geCA9IDEwMCAtIGNvb3Jkc1swXSBlbHNlIHggPSBjb29yZHNbMF1cbiAgICBpZiBjb29yZHNbMV0gPj0gNTAgdGhlbiB5ID0gMTAwIC0gY29vcmRzWzFdIGVsc2UgeSA9IGNvb3Jkc1sxXVxuICAgIHdNaW4gPSA1MCAqIChAY29udGFpbmVyV2lkdGgoKSAvIHgpXG4gICAgaE1pbiA9IDUwICogKEBjb250YWluZXJIZWlnaHQoKSAvIHkpXG4gICAgIyBoaWRlcyBvdGhlciBhY3RpdmUgaW5mb2JveGVzLCBidXQgd2lsbCBzdGlsbCBzaG93XG4gICAgIyB0aGlzIGluZm9ib3hcbiAgICBAY29udGFpbmVyLmZpbmQoXCIuI3tQbGFuaXQuaW5mb2JveENsYXNzfVwiKS5yZW1vdmVDbGFzcygnYWN0aXZlJylcbiAgICAjIEdldCBvdXIgaW5pdGlhbCBwb3NpdGlvblxuICAgIEBpbWFnZVBvc2l0aW9uLmxlZnRQeCA9IC0gKFxuICAgICAgKEBpbWdXaWR0aCgpICogKGNvb3Jkc1swXSAvIDEwMCkpIC0gKEBjb250YWluZXJXaWR0aCgpIC8gMilcbiAgICApXG4gICAgQGltYWdlUG9zaXRpb24udG9wUHggPSAtIChcbiAgICAgIChAaW1nSGVpZ2h0KCkgKiAoY29vcmRzWzFdIC8gMTAwKSkgLSAoQGNvbnRhaW5lckhlaWdodCgpIC8gMilcbiAgICApXG4gICAgIyBrZWVwIHRoZW9yZXRpY2FsbHkgbWFraW5nIHRoZSBpbWFnZSBiaWdnZXIgdW50aWwgaXQgaXNcbiAgICAjIGxhcmdlIGVub3VnaCB0byBjZW50ZXIgb24gb3VyIHBvaW50XG4gICAgd2hpbGUgKEBpbWdXaWR0aCgpIDwgd01pbikgfHwgKEBpbWdIZWlnaHQoKSA8IGhNaW4pXG4gICAgICBAaW1hZ2VQb3NpdGlvbi5zY2FsZSAgPSBAaW1hZ2VQb3NpdGlvbi5zY2FsZSArIEBpbWFnZVBvc2l0aW9uLmluY3JlbWVudFxuICAgICAgQGltYWdlUG9zaXRpb24ubGVmdFB4ID0gLSAoXG4gICAgICAgIChAaW1nV2lkdGgoKSAqIChjb29yZHNbMF0gLyAxMDApKSAtIChAY29udGFpbmVyV2lkdGgoKSAvIDIpXG4gICAgICApXG4gICAgICBAaW1hZ2VQb3NpdGlvbi50b3BQeCA9IC0gKFxuICAgICAgICAoQGltZ0hlaWdodCgpICogKGNvb3Jkc1sxXSAvIDEwMCkpIC0gKEBjb250YWluZXJIZWlnaHQoKSAvIDIpXG4gICAgICApXG4gICAgYW5pbWF0ZUJhY2tncm91bmQuY2FsbChAKVxuICAgIGNvb3Jkc1xuXG4gICMgWm9vbXMgdGhlIGltYWdlIHRvIGEgc3BlY2lmaWMgXCJsZXZlbFwiIHdoaWNoIGlzIGFuXG4gICMgaW5jcmVtZW50ZWQgaW50ZWdlciBzdGFydGluZyBhdCB6ZXJvXG4gICNcbiAgem9vbVRvOiAobGV2ZWwpID0+XG4gICAgaSA9IEBpbWFnZVBvc2l0aW9uLmluY3JlbWVudFxuICAgIHVubGVzcyAoKGxldmVsICogaSkgKyAxKSA9PSBAaW1hZ2VQb3NpdGlvbi5zY2FsZVxuICAgICAgQGltYWdlUG9zaXRpb24uc2NhbGUgPSAobGV2ZWwgKiBpKSArIDEgKyBpXG4gICAgICBAem9vbU91dCgpXG4gICAgbGV2ZWxcblxuICAjID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09IENhbGN1bGF0aW9uc1xuXG4gIGltZ1dpZHRoOiA9PlxuICAgIHBhcnNlRmxvYXQoQGltYWdlUG9zaXRpb24ud2lkdGggKiBAaW1hZ2VQb3NpdGlvbi5zY2FsZSlcblxuICBpbWdXaWR0aENsaWNrSW5jcmVtZW50OiA9PlxuICAgIHBhcnNlRmxvYXQoQGltYWdlUG9zaXRpb24ud2lkdGggKiBAaW1hZ2VQb3NpdGlvbi5pbmNyZW1lbnQpXG5cbiAgaW1nV2lkdGhTY3JvbGxJbmNyZW1lbnQ6ID0+XG4gICAgcGFyc2VGbG9hdChAaW1hZ2VQb3NpdGlvbi53aWR0aCAqIEBpbWFnZVBvc2l0aW9uLnNjcm9sbEluY3JlbWVudClcblxuICBjb250YWluZXJXaWR0aDogPT5cbiAgICBwYXJzZUZsb2F0KEBtYXJrZXJzQ29udGFpbmVyLndpZHRoKCkpXG5cbiAgIyAtLS0tLS0tLS0tIExlZnQgLyBSaWdodFxuXG4gIGltZ09mZnNldExlZnQ6ID0+XG4gICAgTWF0aC5hYnMocGFyc2VGbG9hdChAaW1hZ2UuY3NzKCdsZWZ0JykpKVxuXG4gICMgLS0tLS0tLS0tLSBIZWlnaHRcblxuICBpbWdIZWlnaHQ6ID0+XG4gICAgcGFyc2VGbG9hdChAaW1hZ2VQb3NpdGlvbi5oZWlnaHQgKiBAaW1hZ2VQb3NpdGlvbi5zY2FsZSlcblxuICBpbWdIZWlnaHRDbGlja0luY3JlbWVudDogPT5cbiAgICBwYXJzZUZsb2F0KEBpbWFnZVBvc2l0aW9uLmhlaWdodCAqIEBpbWFnZVBvc2l0aW9uLmluY3JlbWVudClcblxuICBpbWdIZWlnaHRTY3JvbGxJbmNyZW1lbnQ6ID0+XG4gICAgcGFyc2VGbG9hdChAaW1hZ2VQb3NpdGlvbi5oZWlnaHQgKiBAaW1hZ2VQb3NpdGlvbi5zY3JvbGxJbmNyZW1lbnQpXG5cbiAgY29udGFpbmVySGVpZ2h0OiA9PlxuICAgIHBhcnNlRmxvYXQoQG1hcmtlcnNDb250YWluZXIuaGVpZ2h0KCkpXG5cbiAgIyAtLS0tLS0tLS0tIFRvcCAvIEJvdHRvbVxuXG4gIGltZ09mZnNldFRvcDogPT5cbiAgICBNYXRoLmFicyhwYXJzZUZsb2F0KEBpbWFnZS5jc3MoJ3RvcCcpKSlcblxuICAjIC0tLS0tLS0tLS0gT3RoZXJcblxuICBnZXRFdmVudENvbnRhaW5lclBvc2l0aW9uOiAoZSkgPT5cbiAgICBsZWZ0OiAoZS5wYWdlWCAtIEBjb250YWluZXIub2Zmc2V0KCkubGVmdCkgLyBAY29udGFpbmVyV2lkdGgoKVxuICAgIHRvcDogIChlLnBhZ2VZIC0gQGNvbnRhaW5lci5vZmZzZXQoKS50b3ApIC8gQGNvbnRhaW5lckhlaWdodCgpXG5cbiAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gRXZlbnRzXG5cbiAgZGJsY2xpY2s6IChlKSA9PlxuICAgIGlmICQoZS50YXJnZXQpLmF0dHIoJ2RhdGEtem9vbS1pZCcpID09IEB6b29tSWRcbiAgICAgIGNsaWNrID0gQGdldEV2ZW50Q29udGFpbmVyUG9zaXRpb24oZSlcbiAgICAgIEB6b29tSW4oJ2NsaWNrJywgY2xpY2subGVmdCwgY2xpY2sudG9wKVxuXG4gIG1vdXNlZG93bjogKGUpID0+XG4gICAgaWYgJChlLnRhcmdldCkuYXR0cignZGF0YS16b29tLWlkJykgPT0gQHpvb21JZCAmJiBlLndoaWNoID09IDFcbiAgICAgIEBpc0RyYWdnaW5nID0gdHJ1ZVxuICAgICAgY29vcmRzID0gQGdldEV2ZW50Q29udGFpbmVyUG9zaXRpb24oZSlcbiAgICAgIEBkcmFnQ29vcmRzID1cbiAgICAgICAgcG9pbnRSZWY6IGNvb3Jkc1xuICAgICAgICBpbWdSZWY6XG4gICAgICAgICAgbGVmdDogMCAtIEBpbWdPZmZzZXRMZWZ0KClcbiAgICAgICAgICB0b3A6IDAgLSBAaW1nT2Zmc2V0VG9wKClcbiAgICAgICAgbWF4OlxuICAgICAgICAgIHJpZ2h0OiAoY29vcmRzLmxlZnQgKiBAY29udGFpbmVyV2lkdGgoKSkgKyBAaW1nT2Zmc2V0TGVmdCgpXG4gICAgICAgICAgbGVmdDogKGNvb3Jkcy5sZWZ0ICogQGNvbnRhaW5lcldpZHRoKCkpIC0gKEBpbWdXaWR0aCgpIC1cbiAgICAgICAgICAgICAgICAgICAgICAoQGNvbnRhaW5lcldpZHRoKCkgKyBAaW1nT2Zmc2V0TGVmdCgpKSlcbiAgICAgICAgICBib3R0b206IChjb29yZHMudG9wICogQGNvbnRhaW5lckhlaWdodCgpKSArIEBpbWdPZmZzZXRUb3AoKVxuICAgICAgICAgIHRvcDogKGNvb3Jkcy50b3AgKiBAY29udGFpbmVySGVpZ2h0KCkpIC0gKEBpbWdIZWlnaHQoKSAtXG4gICAgICAgICAgICAgICAgICAgICAgKEBjb250YWluZXJIZWlnaHQoKSArIEBpbWdPZmZzZXRUb3AoKSkpXG4gICAgdHJ1ZVxuXG4gIG1vdXNlbW92ZTogKGUpID0+XG4gICAgaWYgQGlzRHJhZ2dpbmdcbiAgICAgIGNvb3JkcyA9IEBnZXRFdmVudENvbnRhaW5lclBvc2l0aW9uKGUpXG4gICAgICBkcmFnTGVmdCA9IGNvb3Jkcy5sZWZ0ICogQGNvbnRhaW5lcldpZHRoKClcbiAgICAgIGRyYWdUb3AgPSBjb29yZHMudG9wICogQGNvbnRhaW5lckhlaWdodCgpXG4gICAgICBpZiBkcmFnTGVmdCA+PSBAZHJhZ0Nvb3Jkcy5tYXgubGVmdCAmJiBkcmFnTGVmdCA8PSBAZHJhZ0Nvb3Jkcy5tYXgucmlnaHRcbiAgICAgICAgbGVmdCA9IChjb29yZHMubGVmdCAtIEBkcmFnQ29vcmRzLnBvaW50UmVmLmxlZnQpICogQGNvbnRhaW5lcldpZHRoKClcbiAgICAgICAgQGltYWdlUG9zaXRpb24ubGVmdFB4ID0gQGRyYWdDb29yZHMuaW1nUmVmLmxlZnQgKyBsZWZ0XG4gICAgICBlbHNlIGlmIGRyYWdMZWZ0IDwgQGRyYWdDb29yZHMubWF4LmxlZnRcbiAgICAgICAgQGltYWdlUG9zaXRpb24ubGVmdFB4ID0gQGNvbnRhaW5lcldpZHRoKCkgLSBAaW1nV2lkdGgoKVxuICAgICAgZWxzZSBpZiBkcmFnTGVmdCA+IEBkcmFnQ29vcmRzLm1heC5yaWdodFxuICAgICAgICBAaW1hZ2VQb3NpdGlvbi5sZWZ0UHggPSAwXG4gICAgICBpZiBkcmFnVG9wID49IEBkcmFnQ29vcmRzLm1heC50b3AgJiYgZHJhZ1RvcCA8PSBAZHJhZ0Nvb3Jkcy5tYXguYm90dG9tXG4gICAgICAgIHRvcCA9IChjb29yZHMudG9wIC0gQGRyYWdDb29yZHMucG9pbnRSZWYudG9wKSAqIEBjb250YWluZXJIZWlnaHQoKVxuICAgICAgICBAaW1hZ2VQb3NpdGlvbi50b3BQeCA9IEBkcmFnQ29vcmRzLmltZ1JlZi50b3AgKyB0b3BcbiAgICAgIGVsc2UgaWYgZHJhZ1RvcCA8IEBkcmFnQ29vcmRzLm1heC50b3BcbiAgICAgICAgQGltYWdlUG9zaXRpb24udG9wUHggPSBAY29udGFpbmVySGVpZ2h0KCkgLSBAaW1nSGVpZ2h0KClcbiAgICAgIGVsc2UgaWYgZHJhZ1RvcCA+IEBkcmFnQ29vcmRzLm1heC5ib3R0b21cbiAgICAgICAgQGltYWdlUG9zaXRpb24udG9wUHggPSAwXG4gICAgICBzZXRCYWNrZ3JvdW5kLmNhbGwoQClcbiAgICB0cnVlXG5cbiAgbW91c2V1cDogKGUpID0+XG4gICAgQGlzRHJhZ2dpbmcgPSBmYWxzZVxuICAgIHBvc2l0aW9uSW5mb2JveGVzLmNhbGwoQClcbiAgICB0cnVlXG5cbiAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gWm9vbWluZ1xuXG4gIHpvb21JbjogPT5cbiAgICBAaW1hZ2VQb3NpdGlvbi5zY2FsZSAgPSBAaW1hZ2VQb3NpdGlvbi5zY2FsZSArIEBpbWFnZVBvc2l0aW9uLmluY3JlbWVudFxuICAgIEBpbWFnZVBvc2l0aW9uLmxlZnRQeCA9IC0gQGltZ09mZnNldExlZnQoKSAtIChAaW1nV2lkdGhDbGlja0luY3JlbWVudCgpIC8gMilcbiAgICBAaW1hZ2VQb3NpdGlvbi50b3BQeCAgPSAtIEBpbWdPZmZzZXRUb3AoKSAtIChAaW1nSGVpZ2h0Q2xpY2tJbmNyZW1lbnQoKSAvIDIpXG4gICAgYW5pbWF0ZUJhY2tncm91bmQuY2FsbChAKVxuXG4gIHpvb21PdXQ6ICgpID0+XG4gICAgaWYgQGltYWdlUG9zaXRpb24uc2NhbGUgPiAxXG4gICAgICBAaW1hZ2VQb3NpdGlvbi5zY2FsZSAgPSBAaW1hZ2VQb3NpdGlvbi5zY2FsZSAtIEBpbWFnZVBvc2l0aW9uLmluY3JlbWVudFxuICAgICAgbGVmdFB4ID0gLSBAaW1nT2Zmc2V0TGVmdCgpICsgKEBpbWdXaWR0aENsaWNrSW5jcmVtZW50KCkgLyAyKVxuICAgICAgdG9wUHggID0gLSBAaW1nT2Zmc2V0VG9wKCkgKyAoQGltZ0hlaWdodENsaWNrSW5jcmVtZW50KCkgLyAyKVxuICAgICAgaWYgbGVmdFB4ID4gMFxuICAgICAgICBAaW1hZ2VQb3NpdGlvbi5sZWZ0UHggPSAwXG4gICAgICBlbHNlIGlmIGxlZnRQeCA8IEBjb250YWluZXJXaWR0aCgpIC0gQGltZ1dpZHRoKClcbiAgICAgICAgQGltYWdlUG9zaXRpb24ubGVmdFB4ID0gQGNvbnRhaW5lcldpZHRoKCkgLSBAaW1nV2lkdGgoKVxuICAgICAgZWxzZVxuICAgICAgICBAaW1hZ2VQb3NpdGlvbi5sZWZ0UHggPSBsZWZ0UHhcbiAgICAgIGlmIHRvcFB4ID4gMFxuICAgICAgICBAaW1hZ2VQb3NpdGlvbi50b3BQeCA9IDBcbiAgICAgIGVsc2UgaWYgdG9wUHggPCBAY29udGFpbmVySGVpZ2h0KCkgLSBAaW1nSGVpZ2h0KClcbiAgICAgICAgQGltYWdlUG9zaXRpb24udG9wUHggPSBAY29udGFpbmVySGVpZ2h0KCkgLSBAaW1nSGVpZ2h0KClcbiAgICAgIGVsc2VcbiAgICAgICAgQGltYWdlUG9zaXRpb24udG9wUHggPSB0b3BQeFxuICAgICAgYW5pbWF0ZUJhY2tncm91bmQuY2FsbChAKVxuXG5cbiAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gUmVmc1xuXG4gIG1hcmtlcnM6ID0+XG4gICAgQG1hcmtlcnNDb250YWluZXIuZmluZChcIi4je1BsYW5pdC5tYXJrZXJDbGFzc31cIilcblxuICBkcmFnZ2luZ01hcmtlcjogPT5cbiAgICBAbWFya2Vyc0NvbnRhaW5lci5maW5kKFwiLiN7UGxhbml0Lm1hcmtlckNsYXNzfS4je1BsYW5pdC5kcmFnZ2luZ0NsYXNzfVwiKVxuXG4gIGdldEV2ZW50UG9zaXRpb246IChlKSA9PlxuICAgICMgY29udGFpbmVyIGRpbWVuc2lvbnNcbiAgICB3Q29udCA9IHBhcnNlRmxvYXQoQG1hcmtlcnNDb250YWluZXIud2lkdGgoKSlcbiAgICBoQ29udCA9IHBhcnNlRmxvYXQoQG1hcmtlcnNDb250YWluZXIuaGVpZ2h0KCkpXG4gICAgIyBpZihcbiAgICAjICAgQG1hcmtlcnNDb250YWluZXIuY3NzKCdiYWNrZ3JvdW5kSW1hZ2UnKSAmJlxuICAgICMgICBAbWFya2Vyc0NvbnRhaW5lci5jc3MoJ2JhY2tncm91bmRJbWFnZScpICE9ICdub25lJ1xuICAgICMgKVxuICAgIGlmIEBpbWFnZVxuICAgICAgIyBpZiB0aGVyZSBpcyBhbiBpbWFnZSwgd2UgbmVlZCB0byBjYWxjdWxhdGUgd2l0aCBpbWFnZSBpbiBtaW5kXG4gICAgICB4UHggPSBlLnBhZ2VYIC0gQGNvbnRhaW5lci5vZmZzZXQoKS5sZWZ0XG4gICAgICB5UHggPSBlLnBhZ2VZIC0gQGNvbnRhaW5lci5vZmZzZXQoKS50b3BcbiAgICAgIHdJbWcgPSBAaW1hZ2Uud2lkdGgoKVxuICAgICAgaEltZyA9IEBpbWFnZS5oZWlnaHQoKVxuICAgICAgeEltZyA9IHBhcnNlSW50KEBpbWFnZS5jc3MoJ2xlZnQnKSlcbiAgICAgIHlJbWcgPSBwYXJzZUludChAaW1hZ2UuY3NzKCd0b3AnKSlcbiAgICAgIHhQYyA9ICgoeFB4ICsgTWF0aC5hYnMoeEltZykpIC8gd0ltZykgKiAxMDBcbiAgICAgIHlQYyA9ICgoeVB4ICsgTWF0aC5hYnMoeUltZykpIC8gaEltZykgKiAxMDBcbiAgICBlbHNlXG4gICAgICAjIG9yIHdlIGNhbiBqdXN0IGxvb2sgYXQgdGhlIGNvbnRhaW5lclxuICAgICAgeFBjID0gKGUucGFnZVggLSBAY29udGFpbmVyLm9mZnNldCgpLmxlZnQpIC8gd0NvbnRcbiAgICAgIHlQYyA9ICAoZS5wYWdlWSAtIEBjb250YWluZXIub2Zmc2V0KCkudG9wKSAvIGhDb250XG4gICAgW3hQYywgeVBjXVxuXG4gICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIEV2ZW50c1xuXG4gIG1vdXNldXA6IChlKSA9PlxuICAgICMgZGVhbGluZyB3aXRoIG1hcmtlcnMsIGVzcC4gZHJhZ2dpbmcgbWFya2Vyc1xuICAgIG1hcmtlciA9IEBtYXJrZXJzQ29udGFpbmVyLmZpbmQoXCIuI3tQbGFuaXQuZHJhZ2dpbmdDbGFzc31cIikuZmlyc3QoKVxuICAgIGlmIEBkcmFnZ2luZ01hcmtlcigpLmxlbmd0aCA+IDBcbiAgICAgIG0gPSBuZXcgUGxhbml0Lk1hcmtlcihAY29udGFpbmVyLCBtYXJrZXIuYXR0cignZGF0YS1tYXJrZXInKSlcbiAgICAgIEBvcHRpb25zLm1hcmtlckRyYWdFbmQoZSwgbSlcbiAgICAgIG0uc2F2ZVBvc2l0aW9uKClcbiAgICAgIG0ucG9zaXRpb25JbmZvYm94KClcbiAgICAgIEBkcmFnZ2luZ01hcmtlcigpLnJlbW92ZUNsYXNzKFBsYW5pdC5kcmFnZ2luZ0NsYXNzKVxuICAgICMgaWYgY2xpY2sgaXMgb24gdGhlIGNvbnRhaW5lclxuICAgIGlmICQoZS50YXJnZXQpLmhhc0NsYXNzKFBsYW5pdC5tYXJrZXJDb250YWluZXJDbGFzcylcbiAgICAgIEBvcHRpb25zLmNhbnZhc0NsaWNrKGUsIEBnZXRFdmVudFBvc2l0aW9uKGUpKVxuICAgICMgaWYgY2xpY2sgaXMgb24gdGhlIG1hcmtlcnNcbiAgICBpZihcbiAgICAgICQoZS50YXJnZXQpLmhhc0NsYXNzKFBsYW5pdC5tYXJrZXJDbGFzcykgfHxcbiAgICAgICQoZS50YXJnZXQpLnBhcmVudHMoXCIuI3tQbGFuaXQubWFya2VyQ2xhc3N9XCIpLmxlbmd0aCA+IDBcbiAgICApXG4gICAgICBpZiAkKGUudGFyZ2V0KS5oYXNDbGFzcyhQbGFuaXQubWFya2VyQ2xhc3MpXG4gICAgICAgIG1hcmtlciA9ICQoZS50YXJnZXQpXG4gICAgICBlbHNlXG4gICAgICAgIG1hcmtlciA9ICQoZS50YXJnZXQpLnBhcmVudHMoXCIuI3tQbGFuaXQubWFya2VyQ2xhc3N9XCIpLmZpcnN0KClcbiAgICAgIG0gPSBuZXcgUGxhbml0Lk1hcmtlcihAY29udGFpbmVyLCBtYXJrZXIuYXR0cignZGF0YS1tYXJrZXInKSlcbiAgICAgIEBvcHRpb25zLm1hcmtlckNsaWNrKGUsIG0pXG4gICAgdHJ1ZVxuXG4gIG1vdXNlbW92ZTogKGUpID0+XG4gICAgbWFya2VycyA9IEBtYXJrZXJzQ29udGFpbmVyLmZpbmQoXCIuI3tQbGFuaXQubWFya2VyQ2xhc3N9LiN7UGxhbml0LmRyYWdnaW5nQ2xhc3N9XCIpXG5cbiAgICBpZiBtYXJrZXJzLmxlbmd0aCA+IDBcblxuICAgICAgIyBvbmx5IHVzZSBmaXJzdCBtYXJrZXIgaW4gY2FzZSB0aGVyZSBhcmUgbW9yZSB0aGFuXG4gICAgICAjIG9uZSBkcmFnZ2luZ1xuICAgICAgI1xuICAgICAgbWFya2VyID0gbWFya2Vycy5maXJzdCgpXG5cbiAgICAgICMgd2UgaGlkZSB0aGUgaW5mb2JveCB3aGlsZSBkcmFnZ2luZ1xuICAgICAgI1xuICAgICAgaWYoXG4gICAgICAgIE1hdGguYWJzKGUucGFnZVggLSBtYXJrZXIuYXR0cignZGF0YS1kcmFnLXN0YXJ0LXgnKSkgPiAwIHx8XG4gICAgICAgIE1hdGguYWJzKGUucGFnZVkgLSBtYXJrZXIuYXR0cignZGF0YS1kcmFnLXN0YXJ0LXknKSkgPiAwXG4gICAgICApXG4gICAgICAgIEBjb250YWluZXIuZmluZChcIiMje21hcmtlci5hdHRyKCdkYXRhLWluZm9ib3gnKX1cIikucmVtb3ZlQ2xhc3MoJ2FjdGl2ZScpXG5cbiAgICAgICMgY2FsY3VsYXRlIHBvc2l0aW9uc1xuICAgICAgI1xuICAgICAgbW91c2VMZWZ0ICAgICA9IGUucGFnZVggLSBAY29udGFpbmVyLm9mZnNldCgpLmxlZnRcbiAgICAgIG1vdXNlVG9wICAgICAgPSBlLnBhZ2VZIC0gQGNvbnRhaW5lci5vZmZzZXQoKS50b3BcbiAgICAgIHBsYW5SaWdodCAgICAgPSBAY29udGFpbmVyLndpZHRoKClcbiAgICAgIHBsYW5Cb3R0b20gICAgPSBAY29udGFpbmVyLmhlaWdodCgpXG4gICAgICBtYXJrZXJMZWZ0ICAgID0gbW91c2VMZWZ0IC0gKG1hcmtlci5vdXRlcldpZHRoKCkgLyAyKVxuICAgICAgbWFya2VyVG9wICAgICA9IG1vdXNlVG9wIC0gKG1hcmtlci5vdXRlckhlaWdodCgpIC8gMilcbiAgICAgIG1hcmtlclJpZ2h0ICAgPSBtb3VzZUxlZnQgKyAobWFya2VyLm91dGVyV2lkdGgoKSAvIDIpXG4gICAgICBtYXJrZXJCb3R0b20gID0gbW91c2VUb3AgKyAobWFya2VyLm91dGVySGVpZ2h0KCkgLyAyKVxuICAgICAgbWFya2VyV2lkdGggICA9IG1hcmtlci5vdXRlcldpZHRoKClcbiAgICAgIG1hcmtlckhlaWdodCAgPSBtYXJrZXIub3V0ZXJIZWlnaHQoKVxuXG4gICAgICAjIGZpbmQgdGhlIGxlZnQgcG9zaXRpb24gb2YgdGhlIG1hcmtlciBiYXNlZCBvblxuICAgICAgIyBwb3NpdGlvbiBvZiB0aGUgbW91c2UgcmVsYXRpdmUgdG8gdGhlIHBsYW5cbiAgICAgICNcbiAgICAgIGlmIG1hcmtlckxlZnQgPD0gMFxuICAgICAgICBtYXJrZXJYID0gMFxuICAgICAgZWxzZSBpZiBtYXJrZXJSaWdodCA8IHBsYW5SaWdodFxuICAgICAgICBtYXJrZXJYID0gbWFya2VyTGVmdFxuICAgICAgZWxzZVxuICAgICAgICBtYXJrZXJYID0gcGxhblJpZ2h0IC0gbWFya2VyV2lkdGhcblxuICAgICAgIyBmaW5kIHRoZSBsZWZ0IHBvc2l0aW9uIG9mIHRoZSBtYXJrZXIgYmFzZWQgb25cbiAgICAgICMgcG9zaXRpb24gb2YgdGhlIG1vdXNlIHJlbGF0aXZlIHRvIHRoZSBwbGFuXG4gICAgICAjXG4gICAgICBpZiBtYXJrZXJUb3AgPD0gMFxuICAgICAgICBtYXJrZXJZID0gMFxuICAgICAgZWxzZSBpZiBtYXJrZXJCb3R0b20gPCBwbGFuQm90dG9tXG4gICAgICAgIG1hcmtlclkgPSBtYXJrZXJUb3BcbiAgICAgIGVsc2VcbiAgICAgICAgbWFya2VyWSA9IHBsYW5Cb3R0b20gLSBtYXJrZXJIZWlnaHRcblxuICAgICAgIyBzZXQgdGhlIHBvc2l0aW9uIG9mIHRoZSBtYXJrZXJcbiAgICAgICNcbiAgICAgIG1hcmtlci5jc3NcbiAgICAgICAgbGVmdDogbWFya2VyWFxuICAgICAgICB0b3A6IG1hcmtlcllcblxuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBFdmVudCBDYWxsYmFja3NcblxuICBtYXJrZXJEcmFnRW5kOiAoZXZlbnQsIG1hcmtlcikgPT5cbiAgICBpZiBAb3B0aW9ucy5tYXJrZXJEcmFnRW5kXG4gICAgICBAb3B0aW9ucy5tYXJrZXJEcmFnRW5kKGV2ZW50LCBtYXJrZXIpXG5cbiAgbWFya2VyQ2xpY2s6IChldmVudCwgbWFya2VyKSA9PlxuICAgIGlmIEBvcHRpb25zLm1hcmtlckNsaWNrXG4gICAgICBAb3B0aW9ucy5tYXJrZXJDbGljayhldmVudCwgbWFya2VyKVxuXG4gIGNhbnZhc0NsaWNrOiAoZXZlbnQsIGNvb3JkcykgPT5cbiAgICBpZiBAb3B0aW9ucy5jYW52YXNDbGlja1xuICAgICAgQG9wdGlvbnMuY2FudmFzQ2xpY2soZXZlbnQsIGNvb3JkcylcblxuY2xhc3MgUGxhbml0Lk1hcmtlclxuXG4gIGNvbnN0cnVjdG9yOiAoQGNvbnRhaW5lciwgaWQpIC0+XG5cbiAgICAjIFNldCBPcHRpb25zXG4gICAgQG1hcmtlcnNDb250YWluZXIgPSBAY29udGFpbmVyLmZpbmQoXCIuI3tQbGFuaXQubWFya2VyQ29udGFpbmVyQ2xhc3N9XCIpXG4gICAgaWYgQGNvbnRhaW5lci5maW5kKFwiLiN7UGxhbml0LmltYWdlQ29udGFpbmVyfSA+IGltZ1wiKS5sZW5ndGggPiAwXG4gICAgICBAaW1hZ2UgPSBAY29udGFpbmVyLmZpbmQoXCIuI3tQbGFuaXQuaW1hZ2VDb250YWluZXJ9ID4gaW1nXCIpLmZpcnN0KClcblxuICAgICMgRmluZCBNYXJrZXJcbiAgICBAbWFya2VyID0gQG1hcmtlcnNDb250YWluZXIuZmluZChcbiAgICAgIFwiLiN7UGxhbml0Lm1hcmtlckNsYXNzfVtkYXRhLW1hcmtlcj0nI3tpZH0nXVwiXG4gICAgKS5maXJzdCgpXG5cbiAgICAjIFJldHVybiB0aGlzXG4gICAgQFxuXG4gICMgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0gQ3JlYXRlIE5ldyBNYXJrZXJcblxuICBAY3JlYXRlOiAob3B0aW9ucykgLT5cbiAgICAjIGxvY2FsIHJlZmVyZW5jZXNcbiAgICBjb250YWluZXIgPSBvcHRpb25zLmNvbnRhaW5lclxuICAgIG1hcmtlcnNDb250YWluZXIgPSBjb250YWluZXIuZmluZChcIi4je1BsYW5pdC5tYXJrZXJDb250YWluZXJDbGFzc31cIikuZmlyc3QoKVxuICAgICMgc2V0IG9wdGlvbnNcbiAgICBvcHRpb25zLnBsYW5pdElEID0gUGxhbml0LnJhbmRvbVN0cmluZygyMCkgdW5sZXNzIG9wdGlvbnMucGxhbml0SURcbiAgICBpZiBvcHRpb25zLmNvbG9yIHRoZW4gY29sb3IgPSBvcHRpb25zLmNvbG9yIGVsc2UgY29sb3IgPSAnI0ZDNUIzRidcbiAgICAjIGZpbmQgcG9zaXRpb25cbiAgICBsZWZ0ID0gKChwYXJzZUZsb2F0KG9wdGlvbnMuY29vcmRzWzBdKSAvIDEwMCkgKiBjb250YWluZXIud2lkdGgoKSkgLSAxNVxuICAgIHRvcCA9ICgocGFyc2VGbG9hdChvcHRpb25zLmNvb3Jkc1sxXSkgLyAxMDApICogY29udGFpbmVyLmhlaWdodCgpKSAtIDE1XG4gICAgIyBjcmVhdGUgdGhlIG1hcmtlclxuICAgIG1hcmtlcnNDb250YWluZXIuYXBwZW5kKFxuICAgICAgJCgnPGRpdj48L2Rpdj4nKVxuICAgICAgICAuYWRkQ2xhc3MoUGxhbml0Lm1hcmtlckNsYXNzKVxuICAgICAgICAuYXR0clxuICAgICAgICAgICdkYXRhLW1hcmtlcic6IG9wdGlvbnMucGxhbml0SURcbiAgICAgICAgICAnZGF0YS14UGMnOiBvcHRpb25zLmNvb3Jkc1swXVxuICAgICAgICAgICdkYXRhLXlQYyc6IG9wdGlvbnMuY29vcmRzWzFdXG4gICAgICAgIC5jc3NcbiAgICAgICAgICBsZWZ0OiBcIiN7bGVmdH1weFwiXG4gICAgICAgICAgdG9wOiBcIiN7dG9wfXB4XCJcbiAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6IGNvbG9yXG4gICAgKVxuICAgICMgZmluZCB0aGUgbWFya2VyXG4gICAgbWFya2VyID0gbWFya2Vyc0NvbnRhaW5lci5maW5kKFwiLiN7UGxhbml0Lm1hcmtlckNsYXNzfVwiKS5sYXN0KClcbiAgICAjIGFkZCBjb250ZW50IGFuZCBzdHlsZXMgaWYgcGFzc2VkIGFzIG9wdGlvbnNcbiAgICBpZiBvcHRpb25zLmlkXG4gICAgICBtYXJrZXIuYXR0cignZGF0YS1pZCc6IG9wdGlvbnMuaWQpXG4gICAgaWYgb3B0aW9ucy5jbGFzc1xuICAgICAgbWFya2VyLmFkZENsYXNzKG9wdGlvbnMuY2xhc3MpXG4gICAgaWYgb3B0aW9ucy5odG1sXG4gICAgICBtYXJrZXIuaHRtbChvcHRpb25zLmh0bWwpXG4gICAgaWYgb3B0aW9ucy5zaXplXG4gICAgICBtYXJrZXIuY3NzXG4gICAgICAgIHdpZHRoOiBcIiN7b3B0aW9ucy5zaXplfXB4XCJcbiAgICAgICAgaGVpZ2h0OiBcIiN7b3B0aW9ucy5zaXplfXB4XCJcbiAgICAjIHNldHVwIGRyYWdnYWJsZSBpZiBuZWNlc3NhcnlcbiAgICBpZiBvcHRpb25zLmRyYWdnYWJsZVxuICAgICAgbWFya2VyLmFkZENsYXNzKCdkcmFnZ2FibGUnKVxuICAgICAgbWFya2VyLm9uICdtb3VzZWRvd24nLCAoZSkgPT5cbiAgICAgICAgaWYgZS53aGljaCA9PSAxXG4gICAgICAgICAgbWFya2VyID0gJChlLnRhcmdldCkuY2xvc2VzdChcIi4je1BsYW5pdC5tYXJrZXJDbGFzc31cIilcbiAgICAgICAgICBtYXJrZXIuYWRkQ2xhc3MoUGxhbml0LmRyYWdnaW5nQ2xhc3MpXG4gICAgICAgICAgbWFya2VyLmF0dHJcbiAgICAgICAgICAgICdkYXRhLWRyYWctc3RhcnQteCc6IGUucGFnZVhcbiAgICAgICAgICAgICdkYXRhLWRyYWctc3RhcnQteSc6IGUucGFnZVlcbiAgICAjIHNldHVwIGluZm9ib3ggaWYgbmVjZXNzYXJ5XG4gICAgaWYgb3B0aW9ucy5pbmZvYm94XG4gICAgICBpZCA9IFBsYW5pdC5yYW5kb21TdHJpbmcoMTYpXG4gICAgICAjIHNldCBzdHlsZSBvcHRpb25zIG9uIGluZm9ib3hcbiAgICAgIGluZm9ib3ggPSBvcHRpb25zLmluZm9ib3hcbiAgICAgIGlmIGluZm9ib3gucG9zaXRpb24gdGhlbiBwb3NpdGlvbiA9IGluZm9ib3gucG9zaXRpb24gZWxzZSBwb3NpdGlvbiA9ICd0b3AnXG4gICAgICBpZiBpbmZvYm94LmFycm93IHRoZW4gYXJyb3cgPSB0cnVlIGVsc2UgYXJyb3cgPSBmYWxzZVxuICAgICAgaWYgYXJyb3cgPT0gdHJ1ZSB0aGVuIGFycm93Q2xhc3MgPSAnYXJyb3cnIGVsc2UgYXJyb3dDbGFzcyA9ICcnXG4gICAgICBjbGFzc2VzID0gXCIje1BsYW5pdC5pbmZvYm94Q2xhc3N9ICN7cG9zaXRpb259ICN7YXJyb3dDbGFzc31cIlxuICAgICAgIyBhZGQgaW5mb2JveFxuICAgICAgY29udGFpbmVyLmZpbmQoXCIuI3tQbGFuaXQuaW5mb2JveENvbnRhaW5lckNsYXNzfVwiKS5hcHBlbmQgXCJcIlwiXG4gICAgICAgIDxkaXYgY2xhc3M9XCIje2NsYXNzZXN9XCIgaWQ9XCJpbmZvLSN7aWR9XCJcbiAgICAgICAgICBkYXRhLXBvc2l0aW9uPVwiI3twb3NpdGlvbn1cIj5cbiAgICAgICAgICAgICN7aW5mb2JveC5odG1sfVxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgICBcIlwiXCJcbiAgICAgICMgYWRkIHBvc3Qtb3B0aW9ucyBpZiBuZWNlc3NhcnlcbiAgICAgIGlmIGluZm9ib3gub2Zmc2V0WFxuICAgICAgICBjb250YWluZXIuZmluZChcIi4je1BsYW5pdC5pbmZvYm94Q2xhc3N9XCIpLmxhc3QoKS5hdHRyXG4gICAgICAgICAgJ2RhdGEtb2Zmc2V0LXgnOiBpbmZvYm94Lm9mZnNldFhcbiAgICAgIGlmIGluZm9ib3gub2Zmc2V0WVxuICAgICAgICBjb250YWluZXIuZmluZChcIi4je1BsYW5pdC5pbmZvYm94Q2xhc3N9XCIpLmxhc3QoKS5hdHRyXG4gICAgICAgICAgJ2RhdGEtb2Zmc2V0LXknOiBpbmZvYm94Lm9mZnNldFlcbiAgICAgIG1hcmtlci5hdHRyKCdkYXRhLWluZm9ib3gnLCBcImluZm8tI3tpZH1cIilcbiAgICAgIG0gPSBuZXcgUGxhbml0Lk1hcmtlcihjb250YWluZXIsIG9wdGlvbnMucGxhbml0SUQpXG4gICAgICBtLnBvc2l0aW9uSW5mb2JveCgpXG4gICAgICBtXG5cbiAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gQ2FsY3VsYXRpb25zXG5cbiAgcG9zaXRpb246ID0+XG4gICAgeFB4ID0gQG1hcmtlci5wb3NpdGlvbigpLmxlZnQgKyAoQG1hcmtlci5vdXRlcldpZHRoKCkgLyAyKVxuICAgIHlQeCA9IEBtYXJrZXIucG9zaXRpb24oKS50b3AgKyAoQG1hcmtlci5vdXRlckhlaWdodCgpIC8gMilcbiAgICBpZiBAaW1hZ2VcbiAgICAgIHdJbWcgPSBAaW1hZ2Uud2lkdGgoKVxuICAgICAgaEltZyA9IEBpbWFnZS5oZWlnaHQoKVxuICAgICAgeEltZyA9IHBhcnNlSW50KEBpbWFnZS5jc3MoJ2xlZnQnKSlcbiAgICAgIHlJbWcgPSBwYXJzZUludChAaW1hZ2UuY3NzKCd0b3AnKSlcbiAgICAgIHhQYyA9ICgoeFB4ICsgTWF0aC5hYnMoeEltZykpIC8gd0ltZykgKiAxMDBcbiAgICAgIHlQYyA9ICgoeVB4ICsgTWF0aC5hYnMoeUltZykpIC8gaEltZykgKiAxMDBcbiAgICBlbHNlXG4gICAgICB4UGMgPSAoeFB4IC8gQGNvbnRhaW5lci53aWR0aCgpKSAqIDEwMFxuICAgICAgeVBjID0gKHlQeCAvIEBjb250YWluZXIuaGVpZ2h0KCkpICogMTAwXG4gICAgW3hQYywgeVBjXVxuXG4gIHJlbGF0aXZlUG9zaXRpb246ID0+XG4gICAgeFB4ID0gQG1hcmtlci5wb3NpdGlvbigpLmxlZnQgKyAoQG1hcmtlci5vdXRlcldpZHRoKCkgLyAyKVxuICAgIHlQeCA9IEBtYXJrZXIucG9zaXRpb24oKS50b3AgKyAoQG1hcmtlci5vdXRlckhlaWdodCgpIC8gMilcbiAgICB4UGMgPSAoeFB4IC8gQGNvbnRhaW5lci53aWR0aCgpKSAqIDEwMFxuICAgIHlQYyA9ICh5UHggLyBAY29udGFpbmVyLmhlaWdodCgpKSAqIDEwMFxuICAgIFt4UGMsIHlQY11cblxuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBBdHRyaWJ1dGVzXG5cbiAgY29sb3I6ID0+XG4gICAgQG1hcmtlci5jc3MoJ2JhY2tncm91bmRDb2xvcicpXG5cbiAgcGxhbml0SUQ6ID0+XG4gICAgQG1hcmtlci5hdHRyKCdkYXRhLW1hcmtlcicpXG5cbiAgaWQ6ID0+XG4gICAgQG1hcmtlci5hdHRyKCdkYXRhLWlkJylcblxuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBJbmZvYm94XG5cbiAgaW5mb2JveDogPT5cbiAgICBpbmZvYm94ID0gQGNvbnRhaW5lci5maW5kKFwiIyN7QG1hcmtlci5hdHRyKCdkYXRhLWluZm9ib3gnKX1cIilcbiAgICBpZiBpbmZvYm94Lmxlbmd0aCA+IDAgdGhlbiBpbmZvYm94IGVsc2UgbnVsbFxuXG4gIGluZm9ib3hIVE1MOiA9PlxuICAgIGlmIEBpbmZvYm94KCkgJiYgQGluZm9ib3goKS5sZW5ndGggPiAwIHRoZW4gQGluZm9ib3goKS5odG1sKCkgZWxzZSBudWxsXG5cbiAgaW5mb2JveFZpc2libGU6ID0+XG4gICAgQGluZm9ib3goKSAmJiBAaW5mb2JveCgpLmhhc0NsYXNzKCdhY3RpdmUnKVxuXG4gIGhpZGVJbmZvYm94OiA9PlxuICAgIEBpbmZvYm94KCkuYWRkQ2xhc3MoJ2hpZGRlbicpIGlmIEBpbmZvYm94VmlzaWJsZSgpXG5cbiAgc2hvd0luZm9ib3g6ID0+XG4gICAgQGluZm9ib3goKS5hZGRDbGFzcygnYWN0aXZlJykgaWYgQGluZm9ib3goKSAmJiAhQGluZm9ib3hWaXNpYmxlKClcbiAgICBAdW5oaWRlSW5mb2JveCgpXG5cbiAgdW5oaWRlSW5mb2JveDogPT5cbiAgICBAaW5mb2JveCgpLnJlbW92ZUNsYXNzKCdoaWRkZW4nKSBpZiBAaW5mb2JveFZpc2libGUoKVxuXG4gIGluZm9ib3hDb29yZHM6ID0+XG4gICAgaW5mb2JveCA9IEBjb250YWluZXIuZmluZChcIiMje0BtYXJrZXIuYXR0cignZGF0YS1pbmZvYm94Jyl9XCIpXG4gICAgbWFya2VyQ2VudGVyWCA9IChwYXJzZUZsb2F0KEByZWxhdGl2ZVBvc2l0aW9uKClbMF0gLyAxMDApICogQGNvbnRhaW5lci53aWR0aCgpKVxuICAgIG1hcmtlckNlbnRlclkgPSAocGFyc2VGbG9hdChAcmVsYXRpdmVQb3NpdGlvbigpWzFdIC8gMTAwKSAqIEBjb250YWluZXIuaGVpZ2h0KCkpXG4gICAgaVdpZHRoID0gaW5mb2JveC5vdXRlcldpZHRoKClcbiAgICBpSGFsZldpZHRoID0gaVdpZHRoIC8gMlxuICAgIGlIZWlnaHQgPSBpbmZvYm94Lm91dGVySGVpZ2h0KClcbiAgICBpSGFsZkhlaWdodCA9IGlIZWlnaHQgLyAyXG4gICAgY1dpZHRoID0gQGNvbnRhaW5lci53aWR0aCgpXG4gICAgY0hlaWdodCA9IEBjb250YWluZXIuaGVpZ2h0KClcbiAgICBtV2lkdGggPSBAbWFya2VyLm91dGVyV2lkdGgoKVxuICAgIG1IYWxmV2lkdGggPSBtV2lkdGggLyAyXG4gICAgbUhlaWdodCA9IEBtYXJrZXIub3V0ZXJIZWlnaHQoKVxuICAgIG1IYWxmSGVpZ2h0ID0gbUhlaWdodCAvIDJcbiAgICBidWZmZXIgPSA1XG4gICAgb2Zmc2V0WCA9IHBhcnNlSW50KGluZm9ib3guYXR0cignZGF0YS1vZmZzZXQteCcpKVxuICAgIG9mZnNldFggPSAwIHVubGVzcyBvZmZzZXRYXG4gICAgb2Zmc2V0WSA9IHBhcnNlSW50KGluZm9ib3guYXR0cignZGF0YS1vZmZzZXQteScpKVxuICAgIG9mZnNldFkgPSAwIHVubGVzcyBvZmZzZXRZXG4gICAgc3dpdGNoIGluZm9ib3guYXR0cignZGF0YS1wb3NpdGlvbicpXG4gICAgICB3aGVuICd0b3AnXG4gICAgICAgIGluZm9MZWZ0ID0gbWFya2VyQ2VudGVyWCAtIGlIYWxmV2lkdGhcbiAgICAgICAgaW5mb1RvcCA9IG1hcmtlckNlbnRlclkgLSBpSGVpZ2h0IC0gbUhhbGZIZWlnaHQgLSBidWZmZXJcbiAgICAgIHdoZW4gJ3JpZ2h0J1xuICAgICAgICBpbmZvTGVmdCA9IG1hcmtlckNlbnRlclggKyBtSGFsZldpZHRoICsgYnVmZmVyXG4gICAgICAgIGluZm9Ub3AgPSBtYXJrZXJDZW50ZXJZIC0gaUhhbGZIZWlnaHRcbiAgICAgIHdoZW4gJ2JvdHRvbSdcbiAgICAgICAgaW5mb0xlZnQgPSBtYXJrZXJDZW50ZXJYIC0gaUhhbGZXaWR0aFxuICAgICAgICBpbmZvVG9wID0gbWFya2VyQ2VudGVyWSArIG1IYWxmSGVpZ2h0ICsgYnVmZmVyXG4gICAgICB3aGVuICdsZWZ0J1xuICAgICAgICBpbmZvTGVmdCA9IG1hcmtlckNlbnRlclggLSBpV2lkdGggLSBtSGFsZldpZHRoIC0gYnVmZmVyXG4gICAgICAgIGluZm9Ub3AgPSBtYXJrZXJDZW50ZXJZIC0gaUhhbGZIZWlnaHRcbiAgICAgIHdoZW4gJ3RvcC1sZWZ0J1xuICAgICAgICBpbmZvTGVmdCA9IG1hcmtlckNlbnRlclggLSBpV2lkdGggLSBtSGFsZldpZHRoICsgYnVmZmVyXG4gICAgICAgIGluZm9Ub3AgPSBtYXJrZXJDZW50ZXJZIC0gaUhlaWdodCAtIG1IYWxmSGVpZ2h0ICsgYnVmZmVyXG4gICAgICB3aGVuICd0b3AtcmlnaHQnXG4gICAgICAgIGluZm9MZWZ0ID0gbWFya2VyQ2VudGVyWCArIG1IYWxmV2lkdGggLSBidWZmZXJcbiAgICAgICAgaW5mb1RvcCA9IG1hcmtlckNlbnRlclkgLSBpSGVpZ2h0IC0gbUhhbGZIZWlnaHQgKyBidWZmZXJcbiAgICAgIHdoZW4gJ2JvdHRvbS1sZWZ0J1xuICAgICAgICBpbmZvTGVmdCA9IG1hcmtlckNlbnRlclggLSBpV2lkdGggLSBtSGFsZldpZHRoICsgYnVmZmVyXG4gICAgICAgIGluZm9Ub3AgPSBtYXJrZXJDZW50ZXJZICsgbUhhbGZIZWlnaHQgLSBidWZmZXJcbiAgICAgIHdoZW4gJ2JvdHRvbS1yaWdodCdcbiAgICAgICAgaW5mb0xlZnQgPSBtYXJrZXJDZW50ZXJYICsgbUhhbGZXaWR0aCAtIGJ1ZmZlclxuICAgICAgICBpbmZvVG9wID0gbWFya2VyQ2VudGVyWSArIG1IYWxmSGVpZ2h0IC0gYnVmZmVyXG4gICAgbGVmdDogaW5mb0xlZnQgKyBvZmZzZXRYXG4gICAgdG9wOiBpbmZvVG9wICsgb2Zmc2V0WVxuXG4gIHBvc2l0aW9uSW5mb2JveDogPT5cbiAgICBjb29yZHMgPSBAaW5mb2JveENvb3JkcygpXG4gICAgQGNvbnRhaW5lci5maW5kKFwiIyN7QG1hcmtlci5hdHRyKCdkYXRhLWluZm9ib3gnKX1cIikuY3NzXG4gICAgICBsZWZ0OiBcIiN7Y29vcmRzLmxlZnR9cHhcIlxuICAgICAgdG9wOiBcIiN7Y29vcmRzLnRvcH1weFwiXG4gICAgQHBvc2l0aW9uKClcblxuICBhbmltYXRlSW5mb2JveDogPT5cbiAgICBjb29yZHMgPSBAaW5mb2JveENvb3JkcygpXG4gICAgQGNvbnRhaW5lci5maW5kKFwiIyN7QG1hcmtlci5hdHRyKCdkYXRhLWluZm9ib3gnKX1cIikuYW5pbWF0ZVxuICAgICAgbGVmdDogXCIje2Nvb3Jkcy5sZWZ0fXB4XCJcbiAgICAgIHRvcDogXCIje2Nvb3Jkcy50b3B9cHhcIlxuICAgICwgMjUwLCAoKSA9PlxuICAgICAgcmV0dXJuIEBwb3NpdGlvbigpXG5cbiAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gRHJhZ2dpbmdcblxuICBpc0RyYWdnYWJsZTogPT5cbiAgICBAbWFya2VyLmhhc0NsYXNzKCdkcmFnZ2FibGUnKVxuXG4gICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIEFjdGlvbnNcblxuICBzZXQ6ID0+XG4gICAgbGVmdCA9IChAaW1hZ2Uud2lkdGgoKSAqIChAbWFya2VyLmF0dHIoJ2RhdGEteFBjJykgLyAxMDApKSArXG4gICAgICBwYXJzZUZsb2F0KEBpbWFnZS5jc3MoJ2xlZnQnKSkgLSAoQG1hcmtlci5vdXRlcldpZHRoKCkgLyAyKVxuICAgIHRvcCA9IChAaW1hZ2UuaGVpZ2h0KCkgKiAoQG1hcmtlci5hdHRyKCdkYXRhLXlQYycpIC8gMTAwKSkgK1xuICAgICAgcGFyc2VGbG9hdChAaW1hZ2UuY3NzKCd0b3AnKSkgLSAoQG1hcmtlci5vdXRlckhlaWdodCgpIC8gMilcbiAgICBAbWFya2VyLmNzc1xuICAgICAgbGVmdDogXCIje2xlZnR9cHhcIlxuICAgICAgdG9wOiBcIiN7dG9wfXB4XCJcbiAgICBAcG9zaXRpb25JbmZvYm94KClcbiAgICBbbGVmdCwgdG9wXVxuXG4gIHNhdmVQb3NpdGlvbjogPT5cbiAgICBjb29yZHMgPSBAcG9zaXRpb24oKVxuICAgIEBtYXJrZXIuYXR0clxuICAgICAgJ2RhdGEteFBjJzogY29vcmRzWzBdXG4gICAgICAnZGF0YS15UGMnOiBjb29yZHNbMV1cblxuICB1cGRhdGU6IChvcHRpb25zKSA9PlxuICAgIGlmIG9wdGlvbnMuY29sb3JcbiAgICAgIEBtYXJrZXIuY3NzKGJhY2tncm91bmRDb2xvcjogb3B0aW9ucy5jb2xvcilcbiAgICBpZiBvcHRpb25zLmluZm9ib3hcbiAgICAgIEBtYXJrZXIuZmluZChcIi4je1BsYW5pdC5pbmZvYm94Q2xhc3N9XCIpLmh0bWwob3B0aW9ucy5pbmZvYm94KVxuICAgICAgQHBvc2l0aW9uSW5mb2JveCgpXG4gICAgaWYgb3B0aW9ucy5kcmFnZ2FibGVcbiAgICAgIEBtYXJrZXIucmVtb3ZlQ2xhc3MoJ2RyYWdnYWJsZScpXG4gICAgICBAbWFya2VyLmFkZENsYXNzKCdkcmFnZ2FibGUnKSBpZiBvcHRpb25zLmRyYWdnYWJsZSA9PSB0cnVlXG4gICAgaWYgb3B0aW9ucy5jb29yZHNcbiAgICAgIGxlZnQgPSAoKHBhcnNlRmxvYXQob3B0aW9ucy5jb29yZHNbMF0pIC8gMTAwKSAqIEBjb250YWluZXIud2lkdGgoKSkgLSAxNVxuICAgICAgdG9wID0gKChwYXJzZUZsb2F0KG9wdGlvbnMuY29vcmRzWzFdKSAvIDEwMCkgKiBAY29udGFpbmVyLmhlaWdodCgpKSAtIDE1XG4gICAgICBAbWFya2VyLmNzc1xuICAgICAgICBsZWZ0OiBcIiN7bGVmdH1weFwiXG4gICAgICAgIHRvcDogXCIje3RvcH1weFwiXG5cbiAgcmVtb3ZlOiA9PlxuICAgIEBpbmZvYm94KCkucmVtb3ZlKCkgaWYgQGluZm9ib3goKVxuICAgIEBtYXJrZXIucmVtb3ZlKClcblxuIyBhdHRhY2hlcyB0aGUgUGxhbml0IGNsYXNzIHRvIGEgZ2xvYmFsIHBsYW5pdCB2YXJpYWJsZVxud2luZG93LnBsYW5pdCA9IG5ldyBQbGFuaXRcbiJdfQ==