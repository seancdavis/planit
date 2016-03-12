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
        marker.plan = this;
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
        m = new Planit.Marker(this, $(marker).attr('data-marker'));
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
      m = new Planit.Marker(this, $(marker).attr('data-marker'));
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
      m = new Planit.Marker(this, marker.attr('data-marker'));
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
      m = new Planit.Marker(this, marker.attr('data-marker'));
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
      m = new Planit.Marker(this, $(marker).attr('data-marker'));
      results.push(m.set());
    }
    return results;
  };

  Plan.prototype.addMarker = function(options) {
    var marker;
    if (options == null) {
      options = {};
    }
    options.plan = this;
    marker = Planit.Marker.create(options);
    return marker;
  };

  Plan.prototype.allMarkers = function() {
    var j, len, marker, markers, ref;
    markers = [];
    ref = this.container.find("." + Planit.markerClass);
    for (j = 0, len = ref.length; j < len; j++) {
      marker = ref[j];
      markers.push(new Planit.Marker(this, $(marker).attr('data-marker')));
    }
    return markers;
  };

  return Plan;

})();

Planit.Marker = (function() {
  function Marker(plan1, id) {
    this.plan = plan1;
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
    this.enableDragging = bind(this.enableDragging, this);
    this.container = this.plan.container;
    this.markersContainer = this.container.find("." + Planit.markerContainerClass);
    if (this.container.find("." + Planit.imageContainer + " > img").length > 0) {
      this.image = this.container.find("." + Planit.imageContainer + " > img").first();
    }
    this.marker = this.markersContainer.find("." + Planit.markerClass + "[data-marker='" + id + "']").first();
    this;
  }

  Marker.create = function(options) {
    var arrow, arrowClass, classes, color, container, id, infobox, left, marker, markerObj, markersContainer, plan, position, top;
    plan = options.plan;
    container = plan.container;
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
    markerObj = new Planit.Marker(plan, options.planitID);
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
      markerObj.enableDragging(marker);
    }
    if (plan.options.markerMouseOver) {
      marker.on('mouseover', (function(_this) {
        return function(e) {
          plan.options.markerMouseOver(e, markerObj);
          return true;
        };
      })(this));
    }
    if (plan.options.markerMouseOut) {
      marker.on('mouseout', (function(_this) {
        return function(e) {
          plan.options.markerMouseOut(e, markerObj);
          return true;
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

  Marker.prototype.enableDragging = function(marker) {
    return marker.on('mousedown', (function(_this) {
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
    if (options.draggable !== void 0) {
      if (options.draggable === true) {
        this.marker.addClass('draggable');
        this.enableDragging(this.marker);
      } else {
        this.marker.removeClass('draggable');
        this.marker.off('mousedown');
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInBsYW5pdC10bXAuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLElBQUEsTUFBQTtFQUFBOztBQUFNOzs7RUFJSixNQUFDLENBQUEsY0FBRCxHQUF3Qjs7RUFDeEIsTUFBQyxDQUFBLGFBQUQsR0FBd0I7O0VBQ3hCLE1BQUMsQ0FBQSxjQUFELEdBQXdCOztFQUN4QixNQUFDLENBQUEsWUFBRCxHQUF3Qjs7RUFDeEIsTUFBQyxDQUFBLHFCQUFELEdBQXdCOztFQUN4QixNQUFDLENBQUEsV0FBRCxHQUF3Qjs7RUFDeEIsTUFBQyxDQUFBLG9CQUFELEdBQXdCOztFQUN4QixNQUFDLENBQUEsa0JBQUQsR0FBd0I7O21CQUl4QixNQUFBLEdBQUssU0FBQyxRQUFEO0lBQUMsSUFBQyxDQUFBLDZCQUFELFdBQVc7QUFDZixXQUFXLElBQUEsTUFBTSxDQUFDLElBQVAsQ0FBWSxJQUFDLENBQUEsT0FBYjtFQURSOztFQUtMLE1BQUMsQ0FBQSxZQUFELEdBQWUsU0FBQyxNQUFEO0FBQ2IsUUFBQTs7TUFEYyxTQUFTOztJQUN2QixHQUFBLEdBQU0sSUFBSSxDQUFDLE1BQUwsQ0FBQSxDQUFhLENBQUMsUUFBZCxDQUF1QixFQUF2QixDQUEwQixDQUFDLEtBQTNCLENBQWlDLENBQWpDO0lBQ04sR0FBQSxHQUFNLEdBQUEsR0FBTSxJQUFJLENBQUMsTUFBTCxDQUFBLENBQWEsQ0FBQyxRQUFkLENBQXVCLEVBQXZCLENBQTBCLENBQUMsS0FBM0IsQ0FBaUMsQ0FBakM7V0FDWixHQUFHLENBQUMsU0FBSixDQUFjLENBQWQsRUFBaUIsTUFBQSxHQUFTLENBQTFCO0VBSGE7Ozs7OztBQUtYLE1BQU0sQ0FBQztBQUtYLE1BQUE7O0VBQWEsY0FBQyxRQUFEO0FBQ1gsUUFBQTtJQURZLElBQUMsQ0FBQSw2QkFBRCxXQUFXOzs7Ozs7Ozs7QUFDdkI7QUFBQSxTQUFBLHFDQUFBOztNQUFBLE1BQU0sQ0FBQyxJQUFQLENBQVksSUFBWjtBQUFBO0VBRFc7O0VBTWIsV0FB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LEdBQXdDLElBQUMsQ0FBQSxTQUFTLENBQUMsS0FBWCxDQUFBLENBQXpDLENBQUEsR0FBK0Q7TUFDdEUsR0FBQSxHQUFNLENBQUMsQ0FBQyxVQUFBLENBQVcsT0FBTyxDQUFDLE1BQU8sQ0FBQSxDQUFBLENBQTFCLENBQUEsR0FBZ0MsR0FBakMsQ0FBQSxHQUF3QyxJQUFDLENBQUEsU0FBUyxDQUFDLE1BQVgsQ0FBQSxDQUF6QyxDQUFBLEdBQWdFO01BQ3RFLElBQUMsQ0FBQSxNQUFNLENBQUMsR0FBUixDQUNFO1FBQUEsSUFBQSxFQUFTLElBQUQsR0FBTSxJQUFkO1FBQ0EsR0FBQSxFQUFRLEdBQUQsR0FBSyxJQURaO09BREYsRUFIRjs7V0FNQTtFQW5CTTs7bUJBdUJSLE1BQUEsR0FBUSxTQUFBO0lBQ04sSUFBdUIsSUFBQyxDQUFBLE9BQUQsQ0FBQSxDQUF2QjtNQUFBLElBQUMsQ0FBQSxPQUFELENBQUEsQ0FBVSxDQUFDLE1BQVgsQ0FBQSxFQUFBOztJQUNBLElBQUMsQ0FBQSxNQUFNLENBQUMsTUFBUixDQUFBO1dBQ0E7RUFITTs7Ozs7O0FBTVYsTUFBTSxDQUFDLE1BQVAsR0FBZ0IsSUFBSSIsImZpbGUiOiJwbGFuaXQtdG1wLmpzIiwic291cmNlUm9vdCI6Ii9zb3VyY2UvIiwic291cmNlc0NvbnRlbnQiOlsiY2xhc3MgUGxhbml0XG5cbiAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gRE9NIFJlZmVyZW5jZXNcblxuICBAY29udGFpbmVyQ2xhc3M6ICAgICAgICAncGxhbml0LWNvbnRhaW5lcidcbiAgQGRyYWdnaW5nQ2xhc3M6ICAgICAgICAgJ2lzLWRyYWdnaW5nJ1xuICBAaW1hZ2VDb250YWluZXI6ICAgICAgICAncGxhbml0LWltYWdlLWNvbnRhaW5lcidcbiAgQGluZm9ib3hDbGFzczogICAgICAgICAgJ3BsYW5pdC1pbmZvYm94J1xuICBAaW5mb2JveENvbnRhaW5lckNsYXNzOiAncGxhbml0LWluZm9ib3gtY29udGFpbmVyJ1xuICBAbWFya2VyQ2xhc3M6ICAgICAgICAgICAncGxhbml0LW1hcmtlcidcbiAgQG1hcmtlckNvbnRhaW5lckNsYXNzOiAgJ3BsYW5pdC1tYXJrZXJzLWNvbnRhaW5lcidcbiAgQG1hcmtlckNvbnRlbnRDbGFzczogICAgJ3BsYW5pdC1tYXJrZXItY29udGVudCdcblxuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBJbnN0YW50aWF0aW9uXG5cbiAgbmV3OiAoQG9wdGlvbnMgPSB7fSkgLT5cbiAgICByZXR1cm4gbmV3IFBsYW5pdC5QbGFuKEBvcHRpb25zKVxuXG4gICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIEdsb2JhbCBIZWxwZXJzXG5cbiAgQHJhbmRvbVN0cmluZzogKGxlbmd0aCA9IDE2KSAtPlxuICAgIHN0ciA9IE1hdGgucmFuZG9tKCkudG9TdHJpbmcoMzYpLnNsaWNlKDIpXG4gICAgc3RyID0gc3RyICsgTWF0aC5yYW5kb20oKS50b1N0cmluZygzNikuc2xpY2UoMilcbiAgICBzdHIuc3Vic3RyaW5nKDAsIGxlbmd0aCAtIDEpXG5cbmNsYXNzIFBsYW5pdC5QbGFuXG5cbiAgIyBUaGlzIGNhbGxzIG1ldGhvZHMgdG8gaW5zdGFudGlhdGUgYSBuZXcgcGxhbi4gRm91bmQgaW5cbiAgIyBwbGFuL2luaXQuY29mZmVlXG4gICNcbiAgY29uc3RydWN0b3I6IChAb3B0aW9ucyA9IHt9KSAtPlxuICAgIG1ldGhvZC5jYWxsKEApIGZvciBtZXRob2QgaW4gaW5pdE1ldGhvZHMoKVxuXG4gICMgKHByaXZhdGUpIE1ldGhvZHMgKGluIG9yZGVyKSBuZWVkZWQgdG8gaW5zdGFudGlhdGUgdGhpc1xuICAjIG9iamVjdFxuICAjXG4gIGluaXRNZXRob2RzID0gLT5cbiAgICBbaW5pdE9wdGlvbnMsIGluaXRDb250YWluZXIsIGluaXRJbWFnZSwgaW5pdENhbnZhc01hcmtlcnMsIGluaXRFdmVudHNdXG5cblxuICAjID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09IE9wdGlvbnNcblxuICAjIChwcml2YXRlKSBBZGQgZGVmYXVsdCBvcHRpb25zIGlmIHRoZSBuZWNlc3Nhcnkgb3B0aW9uc1xuICAjIGFyZSBtaXNzaW5nXG4gICNcbiAgaW5pdE9wdGlvbnMgPSAtPlxuICAgIGlmIEBvcHRpb25zLmNvbnRhaW5lclxuICAgICAgQG9wdGlvbnMuY29udGFpbmVyID0gJChcIiMje0BvcHRpb25zLmNvbnRhaW5lcn1cIilcbiAgICBlbHNlXG4gICAgICBAb3B0aW9ucy5jb250YWluZXIgPSAkKCcjcGxhbml0JylcbiAgICAjIGRpcmVjdCBhY2Nlc3MgdG8gcGxhbml0IGNvbnRhaW5lclxuICAgIEBjb250YWluZXIgPSBAb3B0aW9ucy5jb250YWluZXJcblxuICAjID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09IENvbnRhaW5lclxuXG4gICMgKHByaXZhdGUpIERyYXcgdGhlIGNvbnRhaW5lciBhbmQgdGhlIHN1YmNvbnRhaW5lcnNcbiAgI1xuICBpbml0Q29udGFpbmVyID0gLT5cbiAgICBAY29udGFpbmVyLmFkZENsYXNzKFBsYW5pdC5jb250YWluZXJDbGFzcylcbiAgICBAY29udGFpbmVyLmFwcGVuZCBcIlwiXCJcbiAgICAgIDxkaXYgY2xhc3M9XCIje1BsYW5pdC5pbmZvYm94Q29udGFpbmVyQ2xhc3N9XCI+PC9kaXY+XG4gICAgICA8ZGl2IGNsYXNzPVwiI3tQbGFuaXQubWFya2VyQ29udGFpbmVyQ2xhc3N9XCI+PC9kaXY+XG4gICAgICAgIFwiXCJcIlxuICAgIEBtYXJrZXJzQ29udGFpbmVyID0gQGNvbnRhaW5lci5maW5kKFwiLiN7UGxhbml0Lm1hcmtlckNvbnRhaW5lckNsYXNzfVwiKVxuICAgICAgLmZpcnN0KCkgIyBkaXJlY3QgYWNjZXNzIHRvIG1hcmtlcnMgY29udGFpbmVyXG5cbiAgIyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PSBCYWNrZ3JvdW5kIEltYWdlXG5cbiAgIyAocHJpdmF0ZSkgQ3JlYXRlIGltYWdlIGNvbnRhaW5lciBhbmQgYWRkIGltYWdlIGlmXG4gICMgbmVjZXNzYXJ5XG4gICNcbiAgaW5pdEltYWdlID0gLT5cbiAgICBpZiBAb3B0aW9ucy5pbWFnZSAmJiBAb3B0aW9ucy5pbWFnZS51cmxcbiAgICAgIEBjb250YWluZXIucHJlcGVuZCBcIlwiXCJcbiAgICAgICAgPGRpdiBjbGFzcz1cIiN7UGxhbml0LmltYWdlQ29udGFpbmVyfVwiPlxuICAgICAgICAgIDxpbWcgc3JjPVwiI3tAb3B0aW9ucy5pbWFnZS51cmx9XCI+XG4gICAgICAgIDwvZGl2PlxuICAgICAgXCJcIlwiXG4gICAgICBAaW1hZ2UgPSBAY29udGFpbmVyLmZpbmQoJ2ltZycpLmZpcnN0KClcbiAgICAgIEBpbWFnZS5sb2FkICgpID0+XG4gICAgICAgIEBjb250YWluZXIuY3NzKGhlaWdodDogQGltYWdlLmhlaWdodCgpKVxuICAgICAgICBpbml0Wm9vbWFibGUuY2FsbChAKVxuICAgICAgICBpbml0TWFya2Vycy5jYWxsKEApXG5cbiAgIyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PSBab29taW5nXG5cbiAgIyAocHJpdmF0ZSkgU2V0cyBvdXIgcmVmZXJlbmNlcyBmb3Igd29ya2luZyB3aXRoIHpvb20sIGFuZFxuICAjIGNvbnRyb2xzIHdoZXRoZXIgb3Igbm90IHRvIGFkZCBjb250cm9sc1xuICAjXG4gIGluaXRab29tYWJsZSA9IC0+XG4gICAgIyBhZGQgem9vbSBJRCB0byBtYXJrZXJzIGNvbnRhaW5lclxuICAgIEB6b29tSWQgPSBQbGFuaXQucmFuZG9tU3RyaW5nKClcbiAgICBAbWFya2Vyc0NvbnRhaW5lci5hdHRyKCdkYXRhLXpvb20taWQnLCBAem9vbUlkKVxuICAgICMgc2V0IGluaXRpYWwgYmFja2dyb3VuZCBjb29yZGluYXRlc1xuICAgIEByZXNldEltYWdlKClcbiAgICAjIGFkZCB6b29tIGNvbnRyb2xzIGlmIG5lY2Vzc2FyeVxuICAgIGluaXRab29tQ29udHJvbHMuY2FsbChAKSBpZiBAb3B0aW9ucy5pbWFnZS56b29tXG5cbiAgIyAocHJpdmF0ZSkgUmVuZGVyIHRoZSB6b29tIGNvbnRyb2xzIGFuZCBiaW5kcyBuZWNlc3NhcnlcbiAgIyBldmVudHNcbiAgI1xuICBpbml0Wm9vbUNvbnRyb2xzID0gLT5cbiAgICAjIGRyYXcgdGhlIGNvbnRyb2xzIGRpbmt1c1xuICAgIEBjb250YWluZXIucHJlcGVuZCBcIlwiXCJcbiAgICAgIDxkaXYgY2xhc3M9XCJwbGFuaXQtY29udHJvbHNcIj5cbiAgICAgICAgPGEgaHJlZj1cIiNcIiBjbGFzcz1cInpvb21cIiBkYXRhLWFjdGlvbj1cImluXCI+KzwvYT5cbiAgICAgICAgPGEgaHJlZj1cIiNcIiBjbGFzcz1cInpvb21cIiBkYXRhLWFjdGlvbj1cIm91dFwiPi08L2E+XG4gICAgICA8L2Rpdj5cbiAgICBcIlwiXCJcbiAgICBAY29udGFpbmVyLmZpbmQoXCIuem9vbVtkYXRhLWFjdGlvbj0naW4nXVwiKS5jbGljayAoZSkgPT5cbiAgICAgIGUucHJldmVudERlZmF1bHQoKVxuICAgICAgQHpvb21JbigpXG4gICAgQGNvbnRhaW5lci5maW5kKFwiLnpvb21bZGF0YS1hY3Rpb249J291dCddXCIpLmNsaWNrIChlKSA9PlxuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICBAem9vbU91dCgpXG4gICAgIyBiaW5kIGRyYWdnYWJsZSBldmVudHNcbiAgICBAY29udGFpbmVyLm9uICAgJ2RibGNsaWNrJywgKGUpID0+XG4gICAgICB6RGJsQ2xpY2suY2FsbChALCBlKVxuICAgIEBjb250YWluZXIub24gICAnbW91c2Vkb3duJywgKGUpID0+XG4gICAgICB6TW91c2VEb3duLmNhbGwoQCwgZSlcbiAgICAkKGRvY3VtZW50KS5vbiAgJ21vdXNlbW92ZScsIChlKSA9PlxuICAgICAgek1vdXNlTW92ZS5jYWxsKEAsIGUpXG4gICAgJChkb2N1bWVudCkub24gICdtb3VzZXVwJywgKGUpID0+XG4gICAgICB6TW91c2VVcC5jYWxsKEAsIGUpXG5cbiAgIyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PSBNYXJrZXJzXG5cbiAgIyAocHJpdmF0ZSkgV2lsbCBjYWxsIGluaXRNYXJrZXJzIGlmIHRoZXJlIGlzIG5vIGltYWdlLFxuICAjIG90aGVyd2lzZSBpdCdzIGNhbGxlZCBmcm9tIGluaXRJbWFnZSwgd2hpY2ggd2FpdHMgZm9yXG4gICMgdGhlIGltYWdlIHRvIGJlIGxvYWRlZC5cbiAgI1xuICBpbml0Q2FudmFzTWFya2VycyA9IC0+XG4gICAgaW5pdE1hcmtlcnMuY2FsbChAKSB1bmxlc3MgQG9wdGlvbnMuaW1hZ2UgJiYgQG9wdGlvbnMuaW1hZ2UudXJsXG5cbiAgIyBJbnRlcnZhbCBtZXRob2QgdGhhdCBjb250aW51ZXMgdG8gY2hlY2sgZm9yIGltYWdlIGJlaW5nXG4gICMgbG9hZGVkIGJlZm9yZSBhZGRpbmcgbWFya2VycyB0byB0aGUgcGxhblxuICAjXG4gIGluaXRNYXJrZXJzID0gLT5cbiAgICBpZiBAb3B0aW9ucy5tYXJrZXJzICYmIEBvcHRpb25zLm1hcmtlcnMubGVuZ3RoID4gMFxuICAgICAgZm9yIG1hcmtlciBpbiBAb3B0aW9ucy5tYXJrZXJzXG4gICAgICAgIG1hcmtlci5wbGFuID0gQFxuICAgICAgICBQbGFuaXQuTWFya2VyLmNyZWF0ZShtYXJrZXIpXG5cbiAgIyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PSBQbGFuIEV2ZW50c1xuXG4gICMgKHByaXZhdGUpIEJpbmQgZXZlbnRzIHRvIHRoZSBwbGFuLiBUaGVzZSBldmVudHMgZGVhbFxuICAjIG1vc3RseSB3aXRoIG1hcmtlcnMsIHNpbmNlIHNvbWUgZXZlbnQgc2hvdWxkIGJlIGF0dGFjaGVkXG4gICMgdG8gdGhlIHBsYW4gYW5kIGxhdGVyIGZpbmQgdGhlIGFwcHJvcHJpYXRlIG1hcmtlclxuICAjXG4gIGluaXRFdmVudHMgPSAtPlxuICAgIGlmIEBjb250YWluZXIuZmluZChcIi4je1BsYW5pdC5pbWFnZUNvbnRhaW5lcn0gPiBpbWdcIikubGVuZ3RoID4gMFxuICAgICAgQGltYWdlID0gQGNvbnRhaW5lci5maW5kKFwiLiN7UGxhbml0LmltYWdlQ29udGFpbmVyfSA+IGltZ1wiKS5maXJzdCgpXG4gICAgJChkb2N1bWVudCkub24gJ21vdXNlbW92ZScsIChlKSA9PlxuICAgICAgbW91c2Vtb3ZlLmNhbGwoQCwgZSlcbiAgICAkKGRvY3VtZW50KS5vbiAnbW91c2V1cCcsIChlKSA9PlxuICAgICAgbW91c2V1cC5jYWxsKEAsIGUpXG4gICAgJCh3aW5kb3cpLnJlc2l6ZSAoZSkgPT5cbiAgICAgIHJlc2l6ZS5jYWxsKEAsIGUpXG5cblxuICAjID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09IFNldHRpbmcgSW1hZ2VcblxuICAjIFpvb20gdGhlIGltYWdlIG91dCBhbGwgdGhlIHdheSBhbmQgc2V0cyB0aGUgbWFya2Vyc1xuICAjIGFwcHJvcHJpYXRlbHlcbiAgI1xuICByZXNldEltYWdlOiA9PlxuICAgIEBpbWFnZVBvc2l0aW9uID1cbiAgICAgIGxlZnRQeDogICAgICAgICAwXG4gICAgICB0b3BQeDogICAgICAgICAgMFxuICAgICAgd2lkdGg6ICAgICAgICAgIEBpbWFnZS53aWR0aCgpXG4gICAgICBoZWlnaHQ6ICAgICAgICAgQGltYWdlLmhlaWdodCgpXG4gICAgICBzY2FsZTogICAgICAgICAgMVxuICAgICAgaW5jcmVtZW50OiAgICAgIDAuNVxuICAgIHNldEJhY2tncm91bmQuY2FsbChAKVxuICAgIHRydWVcblxuICAjIChwcml2YXRlKSBNb3ZlcyB0aGUgYmFja2dyb3VuZCBhbmQgbWFya2VycyB3aXRob3V0XG4gICMgYW5pbWF0aW9uIHRvIHRoZSBsb2NhdGlvbiBzZXQgYnkgdGhlIGltYWdlUG9zaXRpb25cbiAgIyBwcm9wZXJ0eVxuICAjXG4gIHNldEJhY2tncm91bmQgPSAtPlxuICAgIEBpbWFnZS5jc3NcbiAgICAgIGxlZnQ6IFwiI3tAaW1hZ2VQb3NpdGlvbi5sZWZ0UHh9cHhcIlxuICAgICAgdG9wOiBcIiN7QGltYWdlUG9zaXRpb24udG9wUHh9cHhcIlxuICAgICAgd2lkdGg6IFwiI3tAaW1hZ2VQb3NpdGlvbi5zY2FsZSAqIDEwMC4wfSVcIlxuICAgICAgaGVpZ2h0OiAnYXV0bydcbiAgICBzZXRNYXJrZXJzLmNhbGwoQClcblxuICAjIChwcml2YXRlKSBFcXVpdmFsZW50IHRvIHNldEJhY2tncm91bmQsIGJ1dCB3aXRoXG4gICMgYW5pbWF0aW9uXG4gICNcbiAgYW5pbWF0ZUJhY2tncm91bmQgPSAtPlxuICAgIEBpbWFnZS5hbmltYXRlXG4gICAgICBsZWZ0OiBcIiN7QGltYWdlUG9zaXRpb24ubGVmdFB4fXB4XCJcbiAgICAgIHRvcDogXCIje0BpbWFnZVBvc2l0aW9uLnRvcFB4fXB4XCJcbiAgICAgIHdpZHRoOiBcIiN7QGltYWdlUG9zaXRpb24uc2NhbGUgKiAxMDAuMH0lXCJcbiAgICAgIGhlaWdodDogJ2F1dG8nXG4gICAgLCAyNTBcbiAgICBhbmltYXRlTWFya2Vycy5jYWxsKEApXG5cbiAgIyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PSBTZXR0aW5nIE1hcmtlcnNcblxuICAjIChwcml2YXRlKSBTZXRzIG1hcmtlcnMgaW4gY29ycmVjdCBsb2NhdGlvbiwgYmFzZWQgb25cbiAgIyBpbWFnZSBwb3NpdGlvblxuICAjXG4gIHNldE1hcmtlcnMgPSAtPlxuICAgIG1hcmtlcnMgPSBAY29udGFpbmVyLmZpbmQoXCIuI3tQbGFuaXQubWFya2VyQ2xhc3N9XCIpXG4gICAgaWYgbWFya2Vycy5sZW5ndGggPiAwXG4gICAgICBmb3IgbWFya2VyIGluIG1hcmtlcnNcbiAgICAgICAgbGVmdCA9IChAY2FsYyhpbWdXaWR0aCkgKiAoJChtYXJrZXIpLmF0dHIoJ2RhdGEteFBjJykgLyAxMDApKSArXG4gICAgICAgICAgQGltYWdlUG9zaXRpb24ubGVmdFB4IC0gKCQobWFya2VyKS5vdXRlcldpZHRoKCkgLyAyKVxuICAgICAgICB0b3AgPSAoQGNhbGMoaW1nSGVpZ2h0KSAqICgkKG1hcmtlcikuYXR0cignZGF0YS15UGMnKSAvIDEwMCkpICtcbiAgICAgICAgICBAaW1hZ2VQb3NpdGlvbi50b3BQeCAtICgkKG1hcmtlcikub3V0ZXJIZWlnaHQoKSAvIDIpXG4gICAgICAgICQobWFya2VyKS5jc3NcbiAgICAgICAgICBsZWZ0OiBcIiN7bGVmdH1weFwiXG4gICAgICAgICAgdG9wOiBcIiN7dG9wfXB4XCJcbiAgICAgIHBvc2l0aW9uSW5mb2JveGVzLmNhbGwoQClcblxuICAjIChwcml2YXRlKSBFcXVpdmFsZW50IHRvIHNldE1hcmtlcnMsIGJ1dCB3aXRoIGFuaW1hdGlvblxuICAjXG4gIGFuaW1hdGVNYXJrZXJzID0gLT5cbiAgICBtYXJrZXJzID0gQGNvbnRhaW5lci5maW5kKFwiLiN7UGxhbml0Lm1hcmtlckNsYXNzfVwiKVxuICAgIGlmIG1hcmtlcnMubGVuZ3RoID4gMFxuICAgICAgZm9yIG1hcmtlciBpbiBtYXJrZXJzXG4gICAgICAgIG0gPSBuZXcgUGxhbml0Lk1hcmtlcihALCAkKG1hcmtlcikuYXR0cignZGF0YS1tYXJrZXInKSlcbiAgICAgICAgbS5oaWRlSW5mb2JveCgpXG4gICAgICAgIGxlZnQgPSAoQGNhbGMoaW1nV2lkdGgpICogKCQobWFya2VyKS5hdHRyKCdkYXRhLXhQYycpIC8gMTAwKSkgK1xuICAgICAgICAgIEBpbWFnZVBvc2l0aW9uLmxlZnRQeCAtICgkKG1hcmtlcikub3V0ZXJXaWR0aCgpIC8gMilcbiAgICAgICAgdG9wID0gKEBjYWxjKGltZ0hlaWdodCkgKiAoJChtYXJrZXIpLmF0dHIoJ2RhdGEteVBjJykgLyAxMDApKSArXG4gICAgICAgICAgQGltYWdlUG9zaXRpb24udG9wUHggLSAoJChtYXJrZXIpLm91dGVySGVpZ2h0KCkgLyAyKVxuICAgICAgICBkbyAobSkgLT5cbiAgICAgICAgICAkKG1hcmtlcikuYW5pbWF0ZVxuICAgICAgICAgICAgbGVmdDogXCIje2xlZnR9cHhcIlxuICAgICAgICAgICAgdG9wOiBcIiN7dG9wfXB4XCJcbiAgICAgICAgICAsIDI1MCwgKCkgPT5cbiAgICAgICAgICAgIG0ucG9zaXRpb25JbmZvYm94KClcbiAgICAgICAgICAgIG0udW5oaWRlSW5mb2JveCgpXG5cbiAgIyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PSBTZXR0aW5nIEluZm9ib3hlc1xuXG4gICMgKHByaXZhdGUpIEFwcHJvcHJpYXRlbHkgcG9zaXRpb24gdGhlIGluZm9ib3ggb24gZXZlcnlcbiAgIyBtYXJrZXIsIHRoZSBsb2dpYyBmb3Igd2hpY2ggaXMgaW4gdGhlIE1hcmtlciBjbGFzc1xuICAjXG4gIHBvc2l0aW9uSW5mb2JveGVzID0gLT5cbiAgICBmb3IgbWFya2VyIGluIEBjb250YWluZXIuZmluZChcIi4je1BsYW5pdC5tYXJrZXJDbGFzc31cIilcbiAgICAgIG0gPSBuZXcgUGxhbml0Lk1hcmtlcihALCAkKG1hcmtlcikuYXR0cignZGF0YS1tYXJrZXInKSlcbiAgICAgIG0ucG9zaXRpb25JbmZvYm94KClcbiAgICB0cnVlXG5cbiAgIyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PSBNb3ZlIEFjdGlvbnNcblxuICAjIFdpbGwgY2VudGVyIHRoZSBpbWFnZSBvbiB0aGUgZ2l2ZW4gY29vcmRpbmF0ZXMgYXMgW3gseV1cbiAgIyBpbiBmbG9hdGVkIHBlcmNlbnRhZ2VzLiBFbnN1cmVzIHRoZXJlIGlzIGVub3VnaCBpbWFnZSBvblxuICAjIGVhY2ggc2lkZSBieSB6b29taW5nIGluIGlmIG5lY2Vzc2FyeS5cbiAgI1xuICBjZW50ZXJPbjogKGNvb3JkcykgPT5cbiAgICBpZiBjb29yZHNbMF0gPj0gNTAgdGhlbiB4ID0gMTAwIC0gY29vcmRzWzBdIGVsc2UgeCA9IGNvb3Jkc1swXVxuICAgIGlmIGNvb3Jkc1sxXSA+PSA1MCB0aGVuIHkgPSAxMDAgLSBjb29yZHNbMV0gZWxzZSB5ID0gY29vcmRzWzFdXG4gICAgd01pbiA9IDUwICogKEBjYWxjKGNvbnRhaW5lcldpZHRoKSAvIHgpXG4gICAgaE1pbiA9IDUwICogKEBjYWxjKGNvbnRhaW5lckhlaWdodCkgLyB5KVxuICAgICMgaGlkZXMgb3RoZXIgYWN0aXZlIGluZm9ib3hlcywgYnV0IHdpbGwgc3RpbGwgc2hvd1xuICAgICMgdGhpcyBpbmZvYm94XG4gICAgQGNvbnRhaW5lci5maW5kKFwiLiN7UGxhbml0LmluZm9ib3hDbGFzc31cIikucmVtb3ZlQ2xhc3MoJ2FjdGl2ZScpXG4gICAgIyBHZXQgb3VyIGluaXRpYWwgcG9zaXRpb25cbiAgICBAaW1hZ2VQb3NpdGlvbi5sZWZ0UHggPSAtIChcbiAgICAgIChAY2FsYyhpbWdXaWR0aCkgKiAoY29vcmRzWzBdIC8gMTAwKSkgLSAoQGNhbGMoY29udGFpbmVyV2lkdGgpIC8gMilcbiAgICApXG4gICAgQGltYWdlUG9zaXRpb24udG9wUHggPSAtIChcbiAgICAgIChAY2FsYyhpbWdIZWlnaHQpICogKGNvb3Jkc1sxXSAvIDEwMCkpIC0gKEBjYWxjKGNvbnRhaW5lckhlaWdodCkgLyAyKVxuICAgIClcbiAgICAjIGtlZXAgdGhlb3JldGljYWxseSBtYWtpbmcgdGhlIGltYWdlIGJpZ2dlciB1bnRpbCBpdCBpc1xuICAgICMgbGFyZ2UgZW5vdWdoIHRvIGNlbnRlciBvbiBvdXIgcG9pbnRcbiAgICB3aGlsZSAoQGNhbGMoaW1nV2lkdGgpIDwgd01pbikgfHwgKEBjYWxjKGltZ0hlaWdodCkgPCBoTWluKVxuICAgICAgQGltYWdlUG9zaXRpb24uc2NhbGUgID0gQGltYWdlUG9zaXRpb24uc2NhbGUgKyBAaW1hZ2VQb3NpdGlvbi5pbmNyZW1lbnRcbiAgICAgIEBpbWFnZVBvc2l0aW9uLmxlZnRQeCA9IC0gKFxuICAgICAgICAoQGNhbGMoaW1nV2lkdGgpICogKGNvb3Jkc1swXSAvIDEwMCkpIC0gKEBjYWxjKGNvbnRhaW5lcldpZHRoKSAvIDIpXG4gICAgICApXG4gICAgICBAaW1hZ2VQb3NpdGlvbi50b3BQeCA9IC0gKFxuICAgICAgICAoQGNhbGMoaW1nSGVpZ2h0KSAqIChjb29yZHNbMV0gLyAxMDApKSAtIChAY2FsYyhjb250YWluZXJIZWlnaHQpIC8gMilcbiAgICAgIClcbiAgICBhbmltYXRlQmFja2dyb3VuZC5jYWxsKEApXG4gICAgY29vcmRzXG5cbiAgIyBab29tcyB0aGUgaW1hZ2UgdG8gYSBzcGVjaWZpYyBcImxldmVsXCIgd2hpY2ggaXMgYW5cbiAgIyBpbmNyZW1lbnRlZCBpbnRlZ2VyIHN0YXJ0aW5nIGF0IHplcm9cbiAgI1xuICB6b29tVG86IChsZXZlbCkgPT5cbiAgICBpID0gQGltYWdlUG9zaXRpb24uaW5jcmVtZW50XG4gICAgdW5sZXNzICgobGV2ZWwgKiBpKSArIDEpID09IEBpbWFnZVBvc2l0aW9uLnNjYWxlXG4gICAgICBAaW1hZ2VQb3NpdGlvbi5zY2FsZSA9IChsZXZlbCAqIGkpICsgMSArIGlcbiAgICAgIEB6b29tT3V0KClcbiAgICBsZXZlbFxuXG4gICMgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0gQ2FsY3VsYXRpb25zXG5cbiAgIyBNZXRob2QgZm9yIGFjY2Vzc2luZyB0aGUgcHJpdmF0ZSBjYWxjdWxhdGlvbiBtZXRob2RzXG4gICNcbiAgY2FsYzogKG1ldGhvZCkgPT5cbiAgICBtZXRob2QuY2FsbChAKVxuXG4gICMgKHByaXZhdGUpIFdpZHRoIG9mIHRoZSBpbWFnZVxuICAjXG4gIGltZ1dpZHRoID0gLT5cbiAgICBwYXJzZUZsb2F0KEBpbWFnZVBvc2l0aW9uLndpZHRoICogQGltYWdlUG9zaXRpb24uc2NhbGUpXG5cbiAgIyAocHJpdmF0ZSkgVGhlIG51bWJlciBvZiBwaXhlbHMgYWRkZWQgd2l0aCBlYWNoIHpvb20gbGV2ZWxcbiAgI1xuICBpbWdXaWR0aENsaWNrSW5jcmVtZW50ID0gLT5cbiAgICBwYXJzZUZsb2F0KEBpbWFnZVBvc2l0aW9uLndpZHRoICogQGltYWdlUG9zaXRpb24uaW5jcmVtZW50KVxuXG4gICMgKHByaXZhdGUpIFRoZSB3aWR0aCBvZiB0aGUgY29udGFpbmVyXG4gICNcbiAgY29udGFpbmVyV2lkdGggPSAtPlxuICAgIHBhcnNlRmxvYXQoQG1hcmtlcnNDb250YWluZXIud2lkdGgoKSlcblxuICAjIChwcml2YXRlKSBOdW1iZXIgb2YgcGl4ZWxzIGxlZnQgc2lkZSBvZiBpbWFnZSBpcyBmcm9tXG4gICMgbGVmdCBzaWRlIG9mIHRoZSBjb250YWluZXJcbiAgI1xuICBpbWdPZmZzZXRMZWZ0ID0gLT5cbiAgICBNYXRoLmFicyhwYXJzZUZsb2F0KEBpbWFnZS5jc3MoJ2xlZnQnKSkpXG5cbiAgIyAocHJpdmF0ZSkgSGVpZ2h0IG9mIHRoZSBpbWFnZVxuICAjXG4gIGltZ0hlaWdodCA9IC0+XG4gICAgcGFyc2VGbG9hdChAaW1hZ2VQb3NpdGlvbi5oZWlnaHQgKiBAaW1hZ2VQb3NpdGlvbi5zY2FsZSlcblxuICAjIChwcml2YXRlKSBUaGUgbnVtYmVyIG9mIHBpeGVscyBhZGRlZCBvciByZW1vdmVkIHdpdGhcbiAgIyBlYWNoIHpvb20gbGV2ZWxcbiAgI1xuICBpbWdIZWlnaHRDbGlja0luY3JlbWVudCA9IC0+XG4gICAgcGFyc2VGbG9hdChAaW1hZ2VQb3NpdGlvbi5oZWlnaHQgKiBAaW1hZ2VQb3NpdGlvbi5pbmNyZW1lbnQpXG5cbiAgIyAocHJpdmF0ZSkgVGhlIGhlaWdodCBvZiB0aGUgY29udGFpbmVyIChwaXhlbHMpXG4gICNcbiAgY29udGFpbmVySGVpZ2h0ID0gLT5cbiAgICBwYXJzZUZsb2F0KEBtYXJrZXJzQ29udGFpbmVyLmhlaWdodCgpKVxuXG4gICMgKHByaXZhdGUpIFRoZSBudW1iZXIgb2YgcGl4ZWxzIHRoZSB0b3Agb2YgdGhlIGltYWdlIGlzXG4gICMgZnJvbSB0aGUgdG9wIG9mIHRoZSBjb250YWluZXJcbiAgI1xuICBpbWdPZmZzZXRUb3AgPSAtPlxuICAgIE1hdGguYWJzKHBhcnNlRmxvYXQoQGltYWdlLmNzcygndG9wJykpKVxuXG4gICMgKHByaXZhdGUpIENvb3JkaW5hdGVzIG9mIGFuIGV2ZW50IGFzIGEgcGVyY2VudGFnZSBvZiB0aGVcbiAgIyBkaW1lbnNpb25zIG9mIHRoZSBjb250YWluZXIsIHJlbGF0aXZlIHRvIHRoZSB0b3AgbGVmdFxuICAjIGNvcm5lciBvZiB0aGUgY29udGFpbmVyXG4gICNcbiAgekV2ZW50UG9zaXRpb24gPSAoZSkgLT5cbiAgICBsZWZ0OiAoZS5wYWdlWCAtIEBjb250YWluZXIub2Zmc2V0KCkubGVmdCkgLyBAY2FsYyhjb250YWluZXJXaWR0aClcbiAgICB0b3A6ICAoZS5wYWdlWSAtIEBjb250YWluZXIub2Zmc2V0KCkudG9wKSAvIEBjYWxjKGNvbnRhaW5lckhlaWdodClcblxuICAjID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09IEV2ZW50c1xuXG4gICMgKHByaXZhdGUpIExpc3RlbmVyIGZvciBkb3VibGUtY2xpY2tpbmcgb24gdGhlIHBsYW5cbiAgI1xuICB6RGJsQ2xpY2sgPSAoZSkgLT5cbiAgICBpZiAkKGUudGFyZ2V0KS5hdHRyKCdkYXRhLXpvb20taWQnKSA9PSBAem9vbUlkXG4gICAgICBjbGljayA9IHpFdmVudFBvc2l0aW9uLmNhbGwoQCwgZSlcbiAgICAgIEB6b29tSW4oJ2NsaWNrJywgY2xpY2subGVmdCwgY2xpY2sudG9wKVxuXG4gICMgKHByaXZhdGUpIExpc3RlbmVyIGZvciB0aGUgc3RhcnQgb2YgYSBjbGljayBvbiB0aGUgcGxhblxuICAjXG4gIHpNb3VzZURvd24gPSAoZSkgLT5cbiAgICBpZiAkKGUudGFyZ2V0KS5hdHRyKCdkYXRhLXpvb20taWQnKSA9PSBAem9vbUlkICYmIGUud2hpY2ggPT0gMVxuICAgICAgQGlzRHJhZ2dpbmcgPSB0cnVlXG4gICAgICBjb29yZHMgPSB6RXZlbnRQb3NpdGlvbi5jYWxsKEAsIGUpXG4gICAgICBAZHJhZ0Nvb3JkcyA9XG4gICAgICAgIHBvaW50UmVmOiBjb29yZHNcbiAgICAgICAgaW1nUmVmOlxuICAgICAgICAgIGxlZnQ6IDAgLSBAY2FsYyhpbWdPZmZzZXRMZWZ0KVxuICAgICAgICAgIHRvcDogMCAtIEBjYWxjKGltZ09mZnNldFRvcClcbiAgICAgICAgbWF4OlxuICAgICAgICAgIHJpZ2h0OiAoY29vcmRzLmxlZnQgKiBAY2FsYyhjb250YWluZXJXaWR0aCkpICsgQGNhbGMoaW1nT2Zmc2V0TGVmdClcbiAgICAgICAgICBsZWZ0OiAoY29vcmRzLmxlZnQgKiBAY2FsYyhjb250YWluZXJXaWR0aCkpIC0gKEBjYWxjKGltZ1dpZHRoKSAtXG4gICAgICAgICAgICAgICAgICAgICAgKEBjYWxjKGNvbnRhaW5lcldpZHRoKSArIEBjYWxjKGltZ09mZnNldExlZnQpKSlcbiAgICAgICAgICBib3R0b206IChjb29yZHMudG9wICogQGNhbGMoY29udGFpbmVySGVpZ2h0KSkgKyBAY2FsYyhpbWdPZmZzZXRUb3ApXG4gICAgICAgICAgdG9wOiAoY29vcmRzLnRvcCAqIEBjYWxjKGNvbnRhaW5lckhlaWdodCkpIC0gKEBjYWxjKGltZ0hlaWdodCkgLVxuICAgICAgICAgICAgICAgICAgICAgIChAY2FsYyhjb250YWluZXJIZWlnaHQpICsgQGNhbGMoaW1nT2Zmc2V0VG9wKSkpXG4gICAgdHJ1ZVxuXG4gICMgKHByaXZhdGUpIExpc3RlbmVyIGZvciB3aGVuIHRoZSBtb3VzZSBtb3ZlcyBhbnl3aGVyZSBvblxuICAjIHRoZSBkb2N1bWVudFxuICAjXG4gIHpNb3VzZU1vdmUgPSAoZSkgLT5cbiAgICBpZiBAaXNEcmFnZ2luZ1xuICAgICAgY29vcmRzID0gekV2ZW50UG9zaXRpb24uY2FsbChALCBlKVxuICAgICAgZHJhZ0xlZnQgPSBjb29yZHMubGVmdCAqIEBjYWxjKGNvbnRhaW5lcldpZHRoKVxuICAgICAgZHJhZ1RvcCA9IGNvb3Jkcy50b3AgKiBAY2FsYyhjb250YWluZXJIZWlnaHQpXG4gICAgICBpZiBkcmFnTGVmdCA+PSBAZHJhZ0Nvb3Jkcy5tYXgubGVmdCAmJiBkcmFnTGVmdCA8PSBAZHJhZ0Nvb3Jkcy5tYXgucmlnaHRcbiAgICAgICAgbGVmdCA9IChjb29yZHMubGVmdCAtIEBkcmFnQ29vcmRzLnBvaW50UmVmLmxlZnQpICogQGNhbGMoY29udGFpbmVyV2lkdGgpXG4gICAgICAgIEBpbWFnZVBvc2l0aW9uLmxlZnRQeCA9IEBkcmFnQ29vcmRzLmltZ1JlZi5sZWZ0ICsgbGVmdFxuICAgICAgZWxzZSBpZiBkcmFnTGVmdCA8IEBkcmFnQ29vcmRzLm1heC5sZWZ0XG4gICAgICAgIEBpbWFnZVBvc2l0aW9uLmxlZnRQeCA9IEBjYWxjKGNvbnRhaW5lcldpZHRoKSAtIEBjYWxjKGltZ1dpZHRoKVxuICAgICAgZWxzZSBpZiBkcmFnTGVmdCA+IEBkcmFnQ29vcmRzLm1heC5yaWdodFxuICAgICAgICBAaW1hZ2VQb3NpdGlvbi5sZWZ0UHggPSAwXG4gICAgICBpZiBkcmFnVG9wID49IEBkcmFnQ29vcmRzLm1heC50b3AgJiYgZHJhZ1RvcCA8PSBAZHJhZ0Nvb3Jkcy5tYXguYm90dG9tXG4gICAgICAgIHRvcCA9IChjb29yZHMudG9wIC0gQGRyYWdDb29yZHMucG9pbnRSZWYudG9wKSAqIEBjYWxjKGNvbnRhaW5lckhlaWdodClcbiAgICAgICAgQGltYWdlUG9zaXRpb24udG9wUHggPSBAZHJhZ0Nvb3Jkcy5pbWdSZWYudG9wICsgdG9wXG4gICAgICBlbHNlIGlmIGRyYWdUb3AgPCBAZHJhZ0Nvb3Jkcy5tYXgudG9wXG4gICAgICAgIEBpbWFnZVBvc2l0aW9uLnRvcFB4ID0gQGNhbGMoY29udGFpbmVySGVpZ2h0KSAtIEBjYWxjKGltZ0hlaWdodClcbiAgICAgIGVsc2UgaWYgZHJhZ1RvcCA+IEBkcmFnQ29vcmRzLm1heC5ib3R0b21cbiAgICAgICAgQGltYWdlUG9zaXRpb24udG9wUHggPSAwXG4gICAgICBzZXRCYWNrZ3JvdW5kLmNhbGwoQClcbiAgICB0cnVlXG5cbiAgIyAocHJpdmF0ZSkgTGlzdGVuZXIgZm9yIHRoZSBlbmQgb2YgYSBjbGljayBhbnl3aGVyZSBvblxuICAjIHRoZSBkb2N1bWVudFxuICAjXG4gIHpNb3VzZVVwID0gKGUpIC0+XG4gICAgQGlzRHJhZ2dpbmcgPSBmYWxzZVxuICAgIHBvc2l0aW9uSW5mb2JveGVzLmNhbGwoQClcbiAgICB0cnVlXG5cbiAgIyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PSBab29taW5nXG5cbiAgIyBUYWtlcyBjdXJyZW50IHpvb20gcG9zaXRpb24gYW5kIHpvb21zIGluIHRvIHRoZSBjZW50ZXJcbiAgIyBvbmUgbGV2ZWwgZGVlcGVyXG4gICNcbiAgem9vbUluOiA9PlxuICAgIEBpbWFnZVBvc2l0aW9uLnNjYWxlICA9IEBpbWFnZVBvc2l0aW9uLnNjYWxlICsgQGltYWdlUG9zaXRpb24uaW5jcmVtZW50XG4gICAgQGltYWdlUG9zaXRpb24ubGVmdFB4ID0gLSBAY2FsYyhpbWdPZmZzZXRMZWZ0KSAtXG4gICAgICAoQGNhbGMoaW1nV2lkdGhDbGlja0luY3JlbWVudCkgLyAyKVxuICAgIEBpbWFnZVBvc2l0aW9uLnRvcFB4ICA9IC0gQGNhbGMoaW1nT2Zmc2V0VG9wKSAtXG4gICAgICAoQGNhbGMoaW1nSGVpZ2h0Q2xpY2tJbmNyZW1lbnQpIC8gMilcbiAgICBhbmltYXRlQmFja2dyb3VuZC5jYWxsKEApXG4gICAgdHJ1ZVxuXG4gICMgWm9vbXMgb3V0IG9uZSBsZXZlbC4gQXR0ZW1wdHMgdG8gem9vbSBvdXQgZnJvbSB0aGVcbiAgIyBjZW50ZXIsIGJ1dCB3aWxsIGFkanVzdCBiYXNlZCBvbiBhdmFpbGFibGUgaW1hZ2Ugc3BhY2UuXG4gICNcbiAgem9vbU91dDogKCkgPT5cbiAgICBpZiBAaW1hZ2VQb3NpdGlvbi5zY2FsZSA+IDFcbiAgICAgIEBpbWFnZVBvc2l0aW9uLnNjYWxlICA9IEBpbWFnZVBvc2l0aW9uLnNjYWxlIC0gQGltYWdlUG9zaXRpb24uaW5jcmVtZW50XG4gICAgICBsZWZ0UHggPSAtIEBjYWxjKGltZ09mZnNldExlZnQpICsgKEBjYWxjKGltZ1dpZHRoQ2xpY2tJbmNyZW1lbnQpIC8gMilcbiAgICAgIHRvcFB4ICA9IC0gQGNhbGMoaW1nT2Zmc2V0VG9wKSArIChAY2FsYyhpbWdIZWlnaHRDbGlja0luY3JlbWVudCkgLyAyKVxuICAgICAgaWYgbGVmdFB4ID4gMFxuICAgICAgICBAaW1hZ2VQb3NpdGlvbi5sZWZ0UHggPSAwXG4gICAgICBlbHNlIGlmIGxlZnRQeCA8IEBjYWxjKGNvbnRhaW5lcldpZHRoKSAtIEBjYWxjKGltZ1dpZHRoKVxuICAgICAgICBAaW1hZ2VQb3NpdGlvbi5sZWZ0UHggPSBAY2FsYyhjb250YWluZXJXaWR0aCkgLSBAY2FsYyhpbWdXaWR0aClcbiAgICAgIGVsc2VcbiAgICAgICAgQGltYWdlUG9zaXRpb24ubGVmdFB4ID0gbGVmdFB4XG4gICAgICBpZiB0b3BQeCA+IDBcbiAgICAgICAgQGltYWdlUG9zaXRpb24udG9wUHggPSAwXG4gICAgICBlbHNlIGlmIHRvcFB4IDwgQGNhbGMoY29udGFpbmVySGVpZ2h0KSAtIEBjYWxjKGltZ0hlaWdodClcbiAgICAgICAgQGltYWdlUG9zaXRpb24udG9wUHggPSBAY2FsYyhjb250YWluZXJIZWlnaHQpIC0gQGNhbGMoaW1nSGVpZ2h0KVxuICAgICAgZWxzZVxuICAgICAgICBAaW1hZ2VQb3NpdGlvbi50b3BQeCA9IHRvcFB4XG4gICAgICBhbmltYXRlQmFja2dyb3VuZC5jYWxsKEApXG4gICAgICB0cnVlXG4gICAgZWxzZVxuICAgICAgZmFsc2VcblxuXG4gICMgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0gTWFya2VyIFJlZmVyZW5jZXNcblxuICAjIChwcml2YXRlKSBUaGUgbWFya2VyKHMpIHRoYXQgYXJlIGJlaW5nIGRyYWdnZWQsIGZvdW5kIGJ5XG4gICMgUGxhbml0J3MgZHJhZ2dpbmcgY2xhc3MuXG4gICNcbiAgZHJhZ2dpbmdNYXJrZXIgPSAtPlxuICAgIEBtYXJrZXJzQ29udGFpbmVyLmZpbmQoXCIuI3tQbGFuaXQubWFya2VyQ2xhc3N9LiN7UGxhbml0LmRyYWdnaW5nQ2xhc3N9XCIpXG5cbiAgIyAocHJpdmF0ZSkgQ29vcmRpbmF0ZXMgb2YgYW4gZXZlbnQgYXMgYSBwZXJjZW50YWdlIG9mIHRoZVxuICAjIGRpbWVuc2lvbnMgb2YgdGhlIGNvbnRhaW5lciwgcmVsYXRpdmUgdG8gdGhlIHRvcCBsZWZ0XG4gICMgY29ybmVyIG9mIHRoZSBpbWFnZVxuICAjXG4gIGdldEV2ZW50UG9zaXRpb24gPSAoZSkgLT5cbiAgICBpZiBAaW1hZ2VcbiAgICAgICMgaWYgdGhlcmUgaXMgYW4gaW1hZ2UsIHdlIG5lZWQgdG8gY2FsY3VsYXRlIHdpdGggaW1hZ2UgaW4gbWluZFxuICAgICAgeFB4ID0gZS5wYWdlWCAtIEBjb250YWluZXIub2Zmc2V0KCkubGVmdFxuICAgICAgeVB4ID0gZS5wYWdlWSAtIEBjb250YWluZXIub2Zmc2V0KCkudG9wXG4gICAgICB3SW1nID0gQGltYWdlLndpZHRoKClcbiAgICAgIGhJbWcgPSBAaW1hZ2UuaGVpZ2h0KClcbiAgICAgIHhJbWcgPSBwYXJzZUludChAaW1hZ2UuY3NzKCdsZWZ0JykpXG4gICAgICB5SW1nID0gcGFyc2VJbnQoQGltYWdlLmNzcygndG9wJykpXG4gICAgICB4UGMgPSAoKHhQeCArIE1hdGguYWJzKHhJbWcpKSAvIHdJbWcpICogMTAwXG4gICAgICB5UGMgPSAoKHlQeCArIE1hdGguYWJzKHlJbWcpKSAvIGhJbWcpICogMTAwXG4gICAgZWxzZVxuICAgICAgIyBvciB3ZSBjYW4ganVzdCBsb29rIGF0IHRoZSBjb250YWluZXJcbiAgICAgIHhQYyA9IChlLnBhZ2VYIC0gQGNvbnRhaW5lci5vZmZzZXQoKS5sZWZ0KSAvIEBjYWxjKGNvbnRhaW5lcldpZHRoKVxuICAgICAgeVBjID0gIChlLnBhZ2VZIC0gQGNvbnRhaW5lci5vZmZzZXQoKS50b3ApIC8gQGNhbGMoY29udGFpbmVySGVpZ2h0KVxuICAgIFt4UGMsIHlQY11cblxuICAjID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09IEV2ZW50c1xuXG4gICMgKHByaXZhdGUpIENhbGxlZCBhdCB0aGUgZW5kIG9mIGEgY2xpY2ssIHdoZW4gaXQgb2NjdXJzXG4gICMgb24gdG9wIG9mIHRoZSBwbGFuLlxuICAjXG4gIG1vdXNldXAgPSAoZSkgLT5cbiAgICAjIGRlYWxpbmcgd2l0aCBtYXJrZXJzLCBlc3AuIGRyYWdnaW5nIG1hcmtlcnNcbiAgICBtYXJrZXIgPSBAbWFya2Vyc0NvbnRhaW5lci5maW5kKFwiLiN7UGxhbml0LmRyYWdnaW5nQ2xhc3N9XCIpLmZpcnN0KClcbiAgICBpZiBkcmFnZ2luZ01hcmtlci5jYWxsKEApLmxlbmd0aCA+IDBcbiAgICAgIG0gPSBuZXcgUGxhbml0Lk1hcmtlcihALCBtYXJrZXIuYXR0cignZGF0YS1tYXJrZXInKSlcbiAgICAgIGlmIEBvcHRpb25zLm1hcmtlckRyYWdFbmRcbiAgICAgICAgQG9wdGlvbnMubWFya2VyRHJhZ0VuZChlLCBtKVxuICAgICAgbS5zYXZlUG9zaXRpb24oKVxuICAgICAgbS5wb3NpdGlvbkluZm9ib3goKVxuICAgICAgZHJhZ2dpbmdNYXJrZXIuY2FsbChAKS5yZW1vdmVDbGFzcyhQbGFuaXQuZHJhZ2dpbmdDbGFzcylcbiAgICAjIGlmIGNsaWNrIGlzIG9uIHRoZSBjb250YWluZXJcbiAgICBpZiAkKGUudGFyZ2V0KS5oYXNDbGFzcyhQbGFuaXQubWFya2VyQ29udGFpbmVyQ2xhc3MpXG4gICAgICBpZiBAb3B0aW9ucy5jYW52YXNDbGlja1xuICAgICAgICBAb3B0aW9ucy5jYW52YXNDbGljayhlLCBnZXRFdmVudFBvc2l0aW9uLmNhbGwoQCwgZSkpXG4gICAgIyBpZiBjbGljayBpcyBvbiB0aGUgbWFya2Vyc1xuICAgIGlmKFxuICAgICAgJChlLnRhcmdldCkuaGFzQ2xhc3MoUGxhbml0Lm1hcmtlckNsYXNzKSB8fFxuICAgICAgJChlLnRhcmdldCkucGFyZW50cyhcIi4je1BsYW5pdC5tYXJrZXJDbGFzc31cIikubGVuZ3RoID4gMFxuICAgIClcbiAgICAgIGlmICQoZS50YXJnZXQpLmhhc0NsYXNzKFBsYW5pdC5tYXJrZXJDbGFzcylcbiAgICAgICAgbWFya2VyID0gJChlLnRhcmdldClcbiAgICAgIGVsc2VcbiAgICAgICAgbWFya2VyID0gJChlLnRhcmdldCkucGFyZW50cyhcIi4je1BsYW5pdC5tYXJrZXJDbGFzc31cIikuZmlyc3QoKVxuICAgICAgbSA9IG5ldyBQbGFuaXQuTWFya2VyKEAsIG1hcmtlci5hdHRyKCdkYXRhLW1hcmtlcicpKVxuICAgICAgaWYgQG9wdGlvbnMubWFya2VyQ2xpY2tcbiAgICAgICAgQG9wdGlvbnMubWFya2VyQ2xpY2soZSwgbSlcbiAgICB0cnVlXG5cbiAgIyAocHJpdmF0ZSkgQ2FsbGVkIHdoZW5ldmVyIHRoZSBtb3VzZSBtb3ZlcyBvdmVyIHRoZSBwbGFuLlxuICAjXG4gIG1vdXNlbW92ZSA9IChlKSAtPlxuICAgIG1hcmtlcnMgPSBAbWFya2Vyc0NvbnRhaW5lci5maW5kKFwiLiN7UGxhbml0Lm1hcmtlckNsYXNzfS4je1BsYW5pdC5kcmFnZ2luZ0NsYXNzfVwiKVxuXG4gICAgaWYgbWFya2Vycy5sZW5ndGggPiAwXG5cbiAgICAgICMgb25seSB1c2UgZmlyc3QgbWFya2VyIGluIGNhc2UgdGhlcmUgYXJlIG1vcmUgdGhhblxuICAgICAgIyBvbmUgZHJhZ2dpbmdcbiAgICAgICNcbiAgICAgIG1hcmtlciA9IG1hcmtlcnMuZmlyc3QoKVxuXG4gICAgICAjIHdlIGhpZGUgdGhlIGluZm9ib3ggd2hpbGUgZHJhZ2dpbmdcbiAgICAgICNcbiAgICAgIGlmKFxuICAgICAgICBNYXRoLmFicyhlLnBhZ2VYIC0gbWFya2VyLmF0dHIoJ2RhdGEtZHJhZy1zdGFydC14JykpID4gMCB8fFxuICAgICAgICBNYXRoLmFicyhlLnBhZ2VZIC0gbWFya2VyLmF0dHIoJ2RhdGEtZHJhZy1zdGFydC15JykpID4gMFxuICAgICAgKVxuICAgICAgICBAY29udGFpbmVyLmZpbmQoXCIjI3ttYXJrZXIuYXR0cignZGF0YS1pbmZvYm94Jyl9XCIpLnJlbW92ZUNsYXNzKCdhY3RpdmUnKVxuXG4gICAgICAjIGNhbGN1bGF0ZSBwb3NpdGlvbnNcbiAgICAgICNcbiAgICAgIG1vdXNlTGVmdCAgICAgPSBlLnBhZ2VYIC0gQGNvbnRhaW5lci5vZmZzZXQoKS5sZWZ0XG4gICAgICBtb3VzZVRvcCAgICAgID0gZS5wYWdlWSAtIEBjb250YWluZXIub2Zmc2V0KCkudG9wXG4gICAgICBwbGFuUmlnaHQgICAgID0gQGNvbnRhaW5lci53aWR0aCgpXG4gICAgICBwbGFuQm90dG9tICAgID0gQGNvbnRhaW5lci5oZWlnaHQoKVxuICAgICAgbWFya2VyTGVmdCAgICA9IG1vdXNlTGVmdCAtIChtYXJrZXIub3V0ZXJXaWR0aCgpIC8gMilcbiAgICAgIG1hcmtlclRvcCAgICAgPSBtb3VzZVRvcCAtIChtYXJrZXIub3V0ZXJIZWlnaHQoKSAvIDIpXG4gICAgICBtYXJrZXJSaWdodCAgID0gbW91c2VMZWZ0ICsgKG1hcmtlci5vdXRlcldpZHRoKCkgLyAyKVxuICAgICAgbWFya2VyQm90dG9tICA9IG1vdXNlVG9wICsgKG1hcmtlci5vdXRlckhlaWdodCgpIC8gMilcbiAgICAgIG1hcmtlcldpZHRoICAgPSBtYXJrZXIub3V0ZXJXaWR0aCgpXG4gICAgICBtYXJrZXJIZWlnaHQgID0gbWFya2VyLm91dGVySGVpZ2h0KClcblxuICAgICAgIyBmaW5kIHRoZSBsZWZ0IHBvc2l0aW9uIG9mIHRoZSBtYXJrZXIgYmFzZWQgb25cbiAgICAgICMgcG9zaXRpb24gb2YgdGhlIG1vdXNlIHJlbGF0aXZlIHRvIHRoZSBwbGFuXG4gICAgICAjXG4gICAgICBpZiBtYXJrZXJMZWZ0IDw9IDBcbiAgICAgICAgbWFya2VyWCA9IDBcbiAgICAgIGVsc2UgaWYgbWFya2VyUmlnaHQgPCBwbGFuUmlnaHRcbiAgICAgICAgbWFya2VyWCA9IG1hcmtlckxlZnRcbiAgICAgIGVsc2VcbiAgICAgICAgbWFya2VyWCA9IHBsYW5SaWdodCAtIG1hcmtlcldpZHRoXG5cbiAgICAgICMgZmluZCB0aGUgbGVmdCBwb3NpdGlvbiBvZiB0aGUgbWFya2VyIGJhc2VkIG9uXG4gICAgICAjIHBvc2l0aW9uIG9mIHRoZSBtb3VzZSByZWxhdGl2ZSB0byB0aGUgcGxhblxuICAgICAgI1xuICAgICAgaWYgbWFya2VyVG9wIDw9IDBcbiAgICAgICAgbWFya2VyWSA9IDBcbiAgICAgIGVsc2UgaWYgbWFya2VyQm90dG9tIDwgcGxhbkJvdHRvbVxuICAgICAgICBtYXJrZXJZID0gbWFya2VyVG9wXG4gICAgICBlbHNlXG4gICAgICAgIG1hcmtlclkgPSBwbGFuQm90dG9tIC0gbWFya2VySGVpZ2h0XG5cbiAgICAgICMgc2V0IHRoZSBwb3NpdGlvbiBvZiB0aGUgbWFya2VyXG4gICAgICAjXG4gICAgICBtYXJrZXIuY3NzXG4gICAgICAgIGxlZnQ6IG1hcmtlclhcbiAgICAgICAgdG9wOiBtYXJrZXJZXG5cbiAgcmVzaXplID0gKGUpIC0+XG4gICAgaWYgQGltYWdlXG4gICAgICBAcmVzZXRJbWFnZSgpXG4gICAgICBAY29udGFpbmVyLmhlaWdodChAaW1hZ2UuaGVpZ2h0KCkpXG4gICAgZm9yIG1hcmtlciBpbiBAbWFya2Vyc0NvbnRhaW5lci5maW5kKCcucGxhbml0LW1hcmtlcicpXG4gICAgICBtID0gbmV3IFBsYW5pdC5NYXJrZXIoQCwgJChtYXJrZXIpLmF0dHIoJ2RhdGEtbWFya2VyJykpXG4gICAgICBtLnNldCgpXG5cblxuICAjID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09IEFkZCBBIE1hcmtlclxuXG4gICMgQWRkcyBhIG1hcmtlciB0byB0aGUgcGxhblxuICAjXG4gIGFkZE1hcmtlcjogKG9wdGlvbnMgPSB7fSkgPT5cbiAgICBvcHRpb25zLnBsYW4gPSBAXG4gICAgbWFya2VyID0gUGxhbml0Lk1hcmtlci5jcmVhdGUob3B0aW9ucylcbiAgICByZXR1cm4gbWFya2VyXG5cbiAgIyBSZXR1cm5zIGFuIGFycmF5IG9mIGFsbCBNYXJrZXIgb2JqZWN0cyB3aXRoaW4gdGhlIHBsYW5cbiAgI1xuICBhbGxNYXJrZXJzOiA9PlxuICAgIG1hcmtlcnMgPSBbXVxuICAgIGZvciBtYXJrZXIgaW4gQGNvbnRhaW5lci5maW5kKFwiLiN7UGxhbml0Lm1hcmtlckNsYXNzfVwiKVxuICAgICAgbWFya2Vycy5wdXNoKG5ldyBQbGFuaXQuTWFya2VyKEAsICQobWFya2VyKS5hdHRyKCdkYXRhLW1hcmtlcicpKSlcbiAgICBtYXJrZXJzXG5cbmNsYXNzIFBsYW5pdC5NYXJrZXJcblxuICAjID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09IFNldHVwXG5cbiAgIyBXaGVuIHRoZSBNYXJrZXIgY2xhc3MgaXMgaW5zdGFudGlhdGVkLCB3ZSByZXR1cm4gdGhlXG4gICMgb2JqZWN0LCBidXQgYWxsIHdlIG5lZWQgdG8gZG8gaXMgc2V0IHJlZmVyZW5jZXMgYW5kIGZpbmRcbiAgIyB0aGUgYXBwcm9wcmlhdGUgalF1ZXJ5IG9iamVjdC5cbiAgI1xuICAjIEl0J3MgZm9yIHRoaXMgcmVhc29uIHRoYXQgdGhlIGNyZWF0ZSBhY3Rpb24gaXMgYSBjbGFzc1xuICAjIG1ldGhvZCAodGhlIG1hcmtlciBkb2Vzbid0IHBoeXNpY2FsbHkgZXhpc3QgeWV0KVxuICAjXG4gIGNvbnN0cnVjdG9yOiAoQHBsYW4sIGlkKSAtPlxuICAgICMgU2V0IE9wdGlvbnNcbiAgICBAY29udGFpbmVyID0gQHBsYW4uY29udGFpbmVyXG4gICAgQG1hcmtlcnNDb250YWluZXIgPSBAY29udGFpbmVyLmZpbmQoXCIuI3tQbGFuaXQubWFya2VyQ29udGFpbmVyQ2xhc3N9XCIpXG4gICAgaWYgQGNvbnRhaW5lci5maW5kKFwiLiN7UGxhbml0LmltYWdlQ29udGFpbmVyfSA+IGltZ1wiKS5sZW5ndGggPiAwXG4gICAgICBAaW1hZ2UgPSBAY29udGFpbmVyLmZpbmQoXCIuI3tQbGFuaXQuaW1hZ2VDb250YWluZXJ9ID4gaW1nXCIpLmZpcnN0KClcblxuICAgICMgRmluZCBNYXJrZXJcbiAgICBAbWFya2VyID0gQG1hcmtlcnNDb250YWluZXIuZmluZChcbiAgICAgIFwiLiN7UGxhbml0Lm1hcmtlckNsYXNzfVtkYXRhLW1hcmtlcj0nI3tpZH0nXVwiXG4gICAgKS5maXJzdCgpXG5cbiAgICAjIFJldHVybiB0aGlzXG4gICAgQFxuXG4gICMgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0gQ3JlYXRlIE5ldyBNYXJrZXJcblxuICAjIChjbGFzcyBtZXRob2QpIENyZWF0ZXMgYSBuZXcgbWFya2VyXG4gICNcbiAgQGNyZWF0ZTogKG9wdGlvbnMpIC0+XG4gICAgIyBsb2NhbCByZWZlcmVuY2VzXG4gICAgcGxhbiA9IG9wdGlvbnMucGxhblxuICAgIGNvbnRhaW5lciA9IHBsYW4uY29udGFpbmVyXG4gICAgbWFya2Vyc0NvbnRhaW5lciA9IGNvbnRhaW5lci5maW5kKFwiLiN7UGxhbml0Lm1hcmtlckNvbnRhaW5lckNsYXNzfVwiKS5maXJzdCgpXG4gICAgIyBzZXQgb3B0aW9uc1xuICAgIG9wdGlvbnMucGxhbml0SUQgPSBQbGFuaXQucmFuZG9tU3RyaW5nKDIwKSB1bmxlc3Mgb3B0aW9ucy5wbGFuaXRJRFxuICAgIGlmIG9wdGlvbnMuY29sb3IgdGhlbiBjb2xvciA9IG9wdGlvbnMuY29sb3IgZWxzZSBjb2xvciA9ICcjRkM1QjNGJ1xuICAgICMgZmluZCBwb3NpdGlvblxuICAgIGxlZnQgPSAoKHBhcnNlRmxvYXQob3B0aW9ucy5jb29yZHNbMF0pIC8gMTAwKSAqIGNvbnRhaW5lci53aWR0aCgpKSAtIDE1XG4gICAgdG9wID0gKChwYXJzZUZsb2F0KG9wdGlvbnMuY29vcmRzWzFdKSAvIDEwMCkgKiBjb250YWluZXIuaGVpZ2h0KCkpIC0gMTVcbiAgICAjIGNyZWF0ZSB0aGUgbWFya2VyXG4gICAgbWFya2Vyc0NvbnRhaW5lci5hcHBlbmQoXG4gICAgICAkKCc8ZGl2PjwvZGl2PicpXG4gICAgICAgIC5hZGRDbGFzcyhQbGFuaXQubWFya2VyQ2xhc3MpXG4gICAgICAgIC5hdHRyXG4gICAgICAgICAgJ2RhdGEtbWFya2VyJzogb3B0aW9ucy5wbGFuaXRJRFxuICAgICAgICAgICdkYXRhLXhQYyc6IG9wdGlvbnMuY29vcmRzWzBdXG4gICAgICAgICAgJ2RhdGEteVBjJzogb3B0aW9ucy5jb29yZHNbMV1cbiAgICAgICAgLmNzc1xuICAgICAgICAgIGxlZnQ6IFwiI3tsZWZ0fXB4XCJcbiAgICAgICAgICB0b3A6IFwiI3t0b3B9cHhcIlxuICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogY29sb3JcbiAgICApXG4gICAgIyBmaW5kIHRoZSBtYXJrZXJcbiAgICBtYXJrZXIgPSBtYXJrZXJzQ29udGFpbmVyLmZpbmQoXCIuI3tQbGFuaXQubWFya2VyQ2xhc3N9XCIpLmxhc3QoKVxuICAgIG1hcmtlck9iaiA9IG5ldyBQbGFuaXQuTWFya2VyKHBsYW4sIG9wdGlvbnMucGxhbml0SUQpXG4gICAgIyBhZGQgY29udGVudCBhbmQgc3R5bGVzIGlmIHBhc3NlZCBhcyBvcHRpb25zXG4gICAgaWYgb3B0aW9ucy5pZFxuICAgICAgbWFya2VyLmF0dHIoJ2RhdGEtaWQnOiBvcHRpb25zLmlkKVxuICAgIGlmIG9wdGlvbnMuY2xhc3NcbiAgICAgIG1hcmtlci5hZGRDbGFzcyhvcHRpb25zLmNsYXNzKVxuICAgIGlmIG9wdGlvbnMuaHRtbFxuICAgICAgbWFya2VyLmh0bWwob3B0aW9ucy5odG1sKVxuICAgIGlmIG9wdGlvbnMuc2l6ZVxuICAgICAgbWFya2VyLmNzc1xuICAgICAgICB3aWR0aDogXCIje29wdGlvbnMuc2l6ZX1weFwiXG4gICAgICAgIGhlaWdodDogXCIje29wdGlvbnMuc2l6ZX1weFwiXG4gICAgIyBzZXR1cCBkcmFnZ2FibGUgaWYgbmVjZXNzYXJ5XG4gICAgaWYgb3B0aW9ucy5kcmFnZ2FibGVcbiAgICAgIG1hcmtlci5hZGRDbGFzcygnZHJhZ2dhYmxlJylcbiAgICAgIG1hcmtlck9iai5lbmFibGVEcmFnZ2luZyhtYXJrZXIpXG4gICAgIyBiaW5kIG1hcmtlciBldmVudHNcbiAgICBpZiBwbGFuLm9wdGlvbnMubWFya2VyTW91c2VPdmVyXG4gICAgICBtYXJrZXIub24gJ21vdXNlb3ZlcicsIChlKSA9PlxuICAgICAgICBwbGFuLm9wdGlvbnMubWFya2VyTW91c2VPdmVyKGUsIG1hcmtlck9iailcbiAgICAgICAgdHJ1ZVxuICAgIGlmIHBsYW4ub3B0aW9ucy5tYXJrZXJNb3VzZU91dFxuICAgICAgbWFya2VyLm9uICdtb3VzZW91dCcsIChlKSA9PlxuICAgICAgICBwbGFuLm9wdGlvbnMubWFya2VyTW91c2VPdXQoZSwgbWFya2VyT2JqKVxuICAgICAgICB0cnVlXG4gICAgIyBzZXR1cCBpbmZvYm94IGlmIG5lY2Vzc2FyeVxuICAgIGlmIG9wdGlvbnMuaW5mb2JveFxuICAgICAgaWQgPSBQbGFuaXQucmFuZG9tU3RyaW5nKDE2KVxuICAgICAgIyBzZXQgc3R5bGUgb3B0aW9ucyBvbiBpbmZvYm94XG4gICAgICBpbmZvYm94ID0gb3B0aW9ucy5pbmZvYm94XG4gICAgICBpZiBpbmZvYm94LnBvc2l0aW9uIHRoZW4gcG9zaXRpb24gPSBpbmZvYm94LnBvc2l0aW9uIGVsc2UgcG9zaXRpb24gPSAndG9wJ1xuICAgICAgaWYgaW5mb2JveC5hcnJvdyB0aGVuIGFycm93ID0gdHJ1ZSBlbHNlIGFycm93ID0gZmFsc2VcbiAgICAgIGlmIGFycm93ID09IHRydWUgdGhlbiBhcnJvd0NsYXNzID0gJ2Fycm93JyBlbHNlIGFycm93Q2xhc3MgPSAnJ1xuICAgICAgY2xhc3NlcyA9IFwiI3tQbGFuaXQuaW5mb2JveENsYXNzfSAje3Bvc2l0aW9ufSAje2Fycm93Q2xhc3N9XCJcbiAgICAgICMgYWRkIGluZm9ib3hcbiAgICAgIGNvbnRhaW5lci5maW5kKFwiLiN7UGxhbml0LmluZm9ib3hDb250YWluZXJDbGFzc31cIikuYXBwZW5kIFwiXCJcIlxuICAgICAgICA8ZGl2IGNsYXNzPVwiI3tjbGFzc2VzfVwiIGlkPVwiaW5mby0je2lkfVwiXG4gICAgICAgICAgZGF0YS1wb3NpdGlvbj1cIiN7cG9zaXRpb259XCI+XG4gICAgICAgICAgICAje2luZm9ib3guaHRtbH1cbiAgICAgICAgPC9kaXY+XG4gICAgICAgICAgXCJcIlwiXG4gICAgICAjIGFkZCBwb3N0LW9wdGlvbnMgaWYgbmVjZXNzYXJ5XG4gICAgICBpZiBpbmZvYm94Lm9mZnNldFhcbiAgICAgICAgY29udGFpbmVyLmZpbmQoXCIuI3tQbGFuaXQuaW5mb2JveENsYXNzfVwiKS5sYXN0KCkuYXR0clxuICAgICAgICAgICdkYXRhLW9mZnNldC14JzogaW5mb2JveC5vZmZzZXRYXG4gICAgICBpZiBpbmZvYm94Lm9mZnNldFlcbiAgICAgICAgY29udGFpbmVyLmZpbmQoXCIuI3tQbGFuaXQuaW5mb2JveENsYXNzfVwiKS5sYXN0KCkuYXR0clxuICAgICAgICAgICdkYXRhLW9mZnNldC15JzogaW5mb2JveC5vZmZzZXRZXG4gICAgICBtYXJrZXIuYXR0cignZGF0YS1pbmZvYm94JywgXCJpbmZvLSN7aWR9XCIpXG4gICAgICBtYXJrZXJPYmoucG9zaXRpb25JbmZvYm94KClcbiAgICBtYXJrZXJPYmpcblxuICBlbmFibGVEcmFnZ2luZzogKG1hcmtlcikgPT5cbiAgICBtYXJrZXIub24gJ21vdXNlZG93bicsIChlKSA9PlxuICAgICAgaWYgZS53aGljaCA9PSAxXG4gICAgICAgIG1hcmtlciA9ICQoZS50YXJnZXQpLmNsb3Nlc3QoXCIuI3tQbGFuaXQubWFya2VyQ2xhc3N9XCIpXG4gICAgICAgIG1hcmtlci5hZGRDbGFzcyhQbGFuaXQuZHJhZ2dpbmdDbGFzcylcbiAgICAgICAgbWFya2VyLmF0dHJcbiAgICAgICAgICAnZGF0YS1kcmFnLXN0YXJ0LXgnOiBlLnBhZ2VYXG4gICAgICAgICAgJ2RhdGEtZHJhZy1zdGFydC15JzogZS5wYWdlWVxuXG4gICMgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0gQ2FsY3VsYXRpb25zXG5cbiAgIyBHZXQgdGhlIHBvc2l0aW9uIG9mIHRoZSBtYXJrZXIgYXMgYSBwZXJjZW50YWdlIG9mIDEwMCxcbiAgIyByZWxhdGl2ZSB0byB0aGUgdG9wIGxlZnQgb2YgdGhlIGltYWdlIChpZiB0aGVyZSBpcyBhbiBpbWFnZSkuXG4gICNcbiAgcG9zaXRpb246ID0+XG4gICAgeFB4ID0gQG1hcmtlci5wb3NpdGlvbigpLmxlZnQgKyAoQG1hcmtlci5vdXRlcldpZHRoKCkgLyAyKVxuICAgIHlQeCA9IEBtYXJrZXIucG9zaXRpb24oKS50b3AgKyAoQG1hcmtlci5vdXRlckhlaWdodCgpIC8gMilcbiAgICBpZiBAaW1hZ2VcbiAgICAgIHdJbWcgPSBAaW1hZ2Uud2lkdGgoKVxuICAgICAgaEltZyA9IEBpbWFnZS5oZWlnaHQoKVxuICAgICAgeEltZyA9IHBhcnNlSW50KEBpbWFnZS5jc3MoJ2xlZnQnKSlcbiAgICAgIHlJbWcgPSBwYXJzZUludChAaW1hZ2UuY3NzKCd0b3AnKSlcbiAgICAgIHhQYyA9ICgoeFB4ICsgTWF0aC5hYnMoeEltZykpIC8gd0ltZykgKiAxMDBcbiAgICAgIHlQYyA9ICgoeVB4ICsgTWF0aC5hYnMoeUltZykpIC8gaEltZykgKiAxMDBcbiAgICBlbHNlXG4gICAgICB4UGMgPSAoeFB4IC8gQGNvbnRhaW5lci53aWR0aCgpKSAqIDEwMFxuICAgICAgeVBjID0gKHlQeCAvIEBjb250YWluZXIuaGVpZ2h0KCkpICogMTAwXG4gICAgW3hQYywgeVBjXVxuXG4gICMgR2V0IHRoZSBwb3NpdGlvbiBvZiB0aGUgbWFya2VyIGFzIGEgcGVyY2VudGFnZSBvZiAxMDAsXG4gICMgcmVsYXRpdmUgdG8gdGhlIHRvcCBsZWZ0IG9mIHRoZSBjb250YWluZXIuXG4gICNcbiAgcmVsYXRpdmVQb3NpdGlvbjogPT5cbiAgICB4UHggPSBAbWFya2VyLnBvc2l0aW9uKCkubGVmdCArIChAbWFya2VyLm91dGVyV2lkdGgoKSAvIDIpXG4gICAgeVB4ID0gQG1hcmtlci5wb3NpdGlvbigpLnRvcCArIChAbWFya2VyLm91dGVySGVpZ2h0KCkgLyAyKVxuICAgIHhQYyA9ICh4UHggLyBAY29udGFpbmVyLndpZHRoKCkpICogMTAwXG4gICAgeVBjID0gKHlQeCAvIEBjb250YWluZXIuaGVpZ2h0KCkpICogMTAwXG4gICAgW3hQYywgeVBjXVxuXG4gICMgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0gQXR0cmlidXRlc1xuXG4gICMgVGhlIGJhY2tncm91bmQgY29sb3Igb2YgdGhlIG1hcmtlclxuICAjXG4gIGNvbG9yOiA9PlxuICAgIEBtYXJrZXIuY3NzKCdiYWNrZ3JvdW5kQ29sb3InKVxuXG4gICMgUmFuZG9tbHktZ2VuZXJhdGVkIElEIGdpdmVuIGJ5IHBsYW5pdCB3aGVuIHRoZSBtYXJrZXIgaXNcbiAgIyBhZGRlZCB0byB0aGUgcGxhbi5cbiAgI1xuICBwbGFuaXRJRDogPT5cbiAgICBAbWFya2VyLmF0dHIoJ2RhdGEtbWFya2VyJylcblxuICAjIFRoZSBJRCBvZiB0aGUgbWFya2VyLCB3aGljaCB3b3VsZCBoYXZlIGJlZW4gYSBtYW51YWxcbiAgIyBvcHRpb25cbiAgI1xuICBpZDogPT5cbiAgICBAbWFya2VyLmF0dHIoJ2RhdGEtaWQnKVxuXG4gICMgV2hldGhlciBvciBub3QgdGhlIG1hcmtlciBpcyBhbGxvd2VkIHRvIGJlIGRyYWdnZWRcbiAgI1xuICBpc0RyYWdnYWJsZTogPT5cbiAgICBAbWFya2VyLmhhc0NsYXNzKCdkcmFnZ2FibGUnKVxuXG4gICMgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0gSW5mb2JveFxuXG4gICMgVGhlIGpRdWVyeSBvYmplY3QgdGhhdCBpcyB0aGUgbWFya2VycyBpbmZvYm94IChpZiB0aGVcbiAgIyBtYXJrZXIgaGFzIGFuIGluZm9ib3gpXG4gICNcbiAgaW5mb2JveDogPT5cbiAgICBpbmZvYm94ID0gQGNvbnRhaW5lci5maW5kKFwiIyN7QG1hcmtlci5hdHRyKCdkYXRhLWluZm9ib3gnKX1cIilcbiAgICBpZiBpbmZvYm94Lmxlbmd0aCA+IDAgdGhlbiBpbmZvYm94IGVsc2UgbnVsbFxuXG4gICMgVGhlIG1hcmt1cCB3aXRoaW4gdGhlIGluZm9ib3gsIGlmIHRoZSBtYXJrZXIgaGFzIGFuXG4gICMgaW5mb2JveFxuICAjXG4gIGluZm9ib3hIVE1MOiA9PlxuICAgIGlmIEBpbmZvYm94KCkgJiYgQGluZm9ib3goKS5sZW5ndGggPiAwIHRoZW4gQGluZm9ib3goKS5odG1sKCkgZWxzZSBudWxsXG5cbiAgIyBXaGV0aGVyIHRoZSBpbmZvYm94IGlzIGJlaW5nIGRpc3BsYXllZC5cbiAgI1xuICBpbmZvYm94VmlzaWJsZTogPT5cbiAgICBAaW5mb2JveCgpICYmIEBpbmZvYm94KCkuaGFzQ2xhc3MoJ2FjdGl2ZScpXG5cbiAgIyBIaWRlcyB0aGUgaW5mb2JveCBpZiBpdCBpcyB2aXNpYmxlLlxuICAjXG4gIGhpZGVJbmZvYm94OiA9PlxuICAgIGlmIEBpbmZvYm94VmlzaWJsZSgpXG4gICAgICBAaW5mb2JveCgpLmFkZENsYXNzKCdoaWRkZW4nKVxuICAgICAgdHJ1ZVxuICAgIGVsc2VcbiAgICAgIGZhbHNlXG5cbiAgIyBTaG93cyB0aGUgaW5mb2JveCBpZiBpdCBpcyBoaWRkZW4uXG4gICNcbiAgc2hvd0luZm9ib3g6ID0+XG4gICAgaWYgQGluZm9ib3goKSAmJiAhQGluZm9ib3hWaXNpYmxlKClcbiAgICAgIEBpbmZvYm94KCkuYWRkQ2xhc3MoJ2FjdGl2ZScpXG4gICAgICBAdW5oaWRlSW5mb2JveCgpXG4gICAgICB0cnVlXG4gICAgZWxzZVxuICAgICAgZmFsc2VcblxuICAjIFNpbWlsYXIgdG8gc2hvd0luZm9ib3gsIGJ1dCBsZXNzIGFncmVzc2l2ZS4gSXQgdGFrZXNcbiAgIyBhd2F5IGl0cyBoaWRkZW4gY2xhc3MsIGluc3RlYWQgb2YgYWRkaW5nIGFuIGFjdGl2ZVxuICAjIGNsYXNzLlxuICAjXG4gIHVuaGlkZUluZm9ib3g6ID0+XG4gICAgaWYgQGluZm9ib3hWaXNpYmxlKClcbiAgICAgIEBpbmZvYm94KCkucmVtb3ZlQ2xhc3MoJ2hpZGRlbicpXG4gICAgICB0cnVlXG4gICAgZWxzZVxuICAgICAgZmFsc2VcblxuICAjIEZpbmQgdGhlIGFwcHJvcHJpYXRlIGNvb3JkaW5hdGVzIGF0IHdoaWNoIHRvIGRpc3BsYXkgdGhlXG4gICMgaW5mb2JveCwgYmFzZWQgb24gb3B0aW9ucy5cbiAgI1xuICBpbmZvYm94Q29vcmRzOiA9PlxuICAgIGluZm9ib3ggPSBAY29udGFpbmVyLmZpbmQoXCIjI3tAbWFya2VyLmF0dHIoJ2RhdGEtaW5mb2JveCcpfVwiKVxuICAgIG1hcmtlckNlbnRlclggPSAocGFyc2VGbG9hdChAcmVsYXRpdmVQb3NpdGlvbigpWzBdIC8gMTAwKSAqIEBjb250YWluZXIud2lkdGgoKSlcbiAgICBtYXJrZXJDZW50ZXJZID0gKHBhcnNlRmxvYXQoQHJlbGF0aXZlUG9zaXRpb24oKVsxXSAvIDEwMCkgKiBAY29udGFpbmVyLmhlaWdodCgpKVxuICAgIGlXaWR0aCA9IGluZm9ib3gub3V0ZXJXaWR0aCgpXG4gICAgaUhhbGZXaWR0aCA9IGlXaWR0aCAvIDJcbiAgICBpSGVpZ2h0ID0gaW5mb2JveC5vdXRlckhlaWdodCgpXG4gICAgaUhhbGZIZWlnaHQgPSBpSGVpZ2h0IC8gMlxuICAgIGNXaWR0aCA9IEBjb250YWluZXIud2lkdGgoKVxuICAgIGNIZWlnaHQgPSBAY29udGFpbmVyLmhlaWdodCgpXG4gICAgbVdpZHRoID0gQG1hcmtlci5vdXRlcldpZHRoKClcbiAgICBtSGFsZldpZHRoID0gbVdpZHRoIC8gMlxuICAgIG1IZWlnaHQgPSBAbWFya2VyLm91dGVySGVpZ2h0KClcbiAgICBtSGFsZkhlaWdodCA9IG1IZWlnaHQgLyAyXG4gICAgYnVmZmVyID0gNVxuICAgIG9mZnNldFggPSBwYXJzZUludChpbmZvYm94LmF0dHIoJ2RhdGEtb2Zmc2V0LXgnKSlcbiAgICBvZmZzZXRYID0gMCB1bmxlc3Mgb2Zmc2V0WFxuICAgIG9mZnNldFkgPSBwYXJzZUludChpbmZvYm94LmF0dHIoJ2RhdGEtb2Zmc2V0LXknKSlcbiAgICBvZmZzZXRZID0gMCB1bmxlc3Mgb2Zmc2V0WVxuICAgIHN3aXRjaCBpbmZvYm94LmF0dHIoJ2RhdGEtcG9zaXRpb24nKVxuICAgICAgd2hlbiAndG9wJ1xuICAgICAgICBpbmZvTGVmdCA9IG1hcmtlckNlbnRlclggLSBpSGFsZldpZHRoXG4gICAgICAgIGluZm9Ub3AgPSBtYXJrZXJDZW50ZXJZIC0gaUhlaWdodCAtIG1IYWxmSGVpZ2h0IC0gYnVmZmVyXG4gICAgICB3aGVuICdyaWdodCdcbiAgICAgICAgaW5mb0xlZnQgPSBtYXJrZXJDZW50ZXJYICsgbUhhbGZXaWR0aCArIGJ1ZmZlclxuICAgICAgICBpbmZvVG9wID0gbWFya2VyQ2VudGVyWSAtIGlIYWxmSGVpZ2h0XG4gICAgICB3aGVuICdib3R0b20nXG4gICAgICAgIGluZm9MZWZ0ID0gbWFya2VyQ2VudGVyWCAtIGlIYWxmV2lkdGhcbiAgICAgICAgaW5mb1RvcCA9IG1hcmtlckNlbnRlclkgKyBtSGFsZkhlaWdodCArIGJ1ZmZlclxuICAgICAgd2hlbiAnbGVmdCdcbiAgICAgICAgaW5mb0xlZnQgPSBtYXJrZXJDZW50ZXJYIC0gaVdpZHRoIC0gbUhhbGZXaWR0aCAtIGJ1ZmZlclxuICAgICAgICBpbmZvVG9wID0gbWFya2VyQ2VudGVyWSAtIGlIYWxmSGVpZ2h0XG4gICAgICB3aGVuICd0b3AtbGVmdCdcbiAgICAgICAgaW5mb0xlZnQgPSBtYXJrZXJDZW50ZXJYIC0gaVdpZHRoIC0gbUhhbGZXaWR0aCArIGJ1ZmZlclxuICAgICAgICBpbmZvVG9wID0gbWFya2VyQ2VudGVyWSAtIGlIZWlnaHQgLSBtSGFsZkhlaWdodCArIGJ1ZmZlclxuICAgICAgd2hlbiAndG9wLXJpZ2h0J1xuICAgICAgICBpbmZvTGVmdCA9IG1hcmtlckNlbnRlclggKyBtSGFsZldpZHRoIC0gYnVmZmVyXG4gICAgICAgIGluZm9Ub3AgPSBtYXJrZXJDZW50ZXJZIC0gaUhlaWdodCAtIG1IYWxmSGVpZ2h0ICsgYnVmZmVyXG4gICAgICB3aGVuICdib3R0b20tbGVmdCdcbiAgICAgICAgaW5mb0xlZnQgPSBtYXJrZXJDZW50ZXJYIC0gaVdpZHRoIC0gbUhhbGZXaWR0aCArIGJ1ZmZlclxuICAgICAgICBpbmZvVG9wID0gbWFya2VyQ2VudGVyWSArIG1IYWxmSGVpZ2h0IC0gYnVmZmVyXG4gICAgICB3aGVuICdib3R0b20tcmlnaHQnXG4gICAgICAgIGluZm9MZWZ0ID0gbWFya2VyQ2VudGVyWCArIG1IYWxmV2lkdGggLSBidWZmZXJcbiAgICAgICAgaW5mb1RvcCA9IG1hcmtlckNlbnRlclkgKyBtSGFsZkhlaWdodCAtIGJ1ZmZlclxuICAgIGxlZnQ6IGluZm9MZWZ0ICsgb2Zmc2V0WFxuICAgIHRvcDogaW5mb1RvcCArIG9mZnNldFlcblxuICAjIFBsYWNlcyB0aGUgaW5mb2JveCBpbiB0aGUgY29ycmVjdCBwb3NpdGlvbi5cbiAgI1xuICBwb3NpdGlvbkluZm9ib3g6ID0+XG4gICAgY29vcmRzID0gQGluZm9ib3hDb29yZHMoKVxuICAgIEBjb250YWluZXIuZmluZChcIiMje0BtYXJrZXIuYXR0cignZGF0YS1pbmZvYm94Jyl9XCIpLmNzc1xuICAgICAgbGVmdDogXCIje2Nvb3Jkcy5sZWZ0fXB4XCJcbiAgICAgIHRvcDogXCIje2Nvb3Jkcy50b3B9cHhcIlxuICAgIEBwb3NpdGlvbigpXG5cbiAgIyBBbmltYXRlcyB0aGUgaW5mb2JveCBmcm9tIGl0cyBjdXJyZW50IHBvc2l0aW9uIHRvIGl0c1xuICAjIG5ldyBwb3NpdGlvbi5cbiAgI1xuICBhbmltYXRlSW5mb2JveDogPT5cbiAgICBjb29yZHMgPSBAaW5mb2JveENvb3JkcygpXG4gICAgQGNvbnRhaW5lci5maW5kKFwiIyN7QG1hcmtlci5hdHRyKCdkYXRhLWluZm9ib3gnKX1cIikuYW5pbWF0ZVxuICAgICAgbGVmdDogXCIje2Nvb3Jkcy5sZWZ0fXB4XCJcbiAgICAgIHRvcDogXCIje2Nvb3Jkcy50b3B9cHhcIlxuICAgICwgMjUwLCAoKSA9PlxuICAgICAgcmV0dXJuIEBwb3NpdGlvbigpXG5cbiAgIyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PSBBY3Rpb25zXG5cbiAgIyBwb3NpdGlvbnMgdGhlIG1hcmtlciBhbmQgaW5mb2JveCBiYXNlZCBvbiBpdHMgZGF0YVxuICAjIGF0dHJpYnV0ZXNcbiAgI1xuICBzZXQ6ID0+XG4gICAgaWYgQGltYWdlXG4gICAgICBsZWZ0ID0gKEBpbWFnZS53aWR0aCgpICogKEBtYXJrZXIuYXR0cignZGF0YS14UGMnKSAvIDEwMCkpICtcbiAgICAgICAgcGFyc2VGbG9hdChAaW1hZ2UuY3NzKCdsZWZ0JykpIC0gKEBtYXJrZXIub3V0ZXJXaWR0aCgpIC8gMilcbiAgICAgIHRvcCA9IChAaW1hZ2UuaGVpZ2h0KCkgKiAoQG1hcmtlci5hdHRyKCdkYXRhLXlQYycpIC8gMTAwKSkgK1xuICAgICAgICBwYXJzZUZsb2F0KEBpbWFnZS5jc3MoJ3RvcCcpKSAtIChAbWFya2VyLm91dGVySGVpZ2h0KCkgLyAyKVxuICAgIGVsc2VcbiAgICAgIGxlZnQgPSAoQGNvbnRhaW5lci53aWR0aCgpICogKEBtYXJrZXIuYXR0cignZGF0YS14UGMnKSAvIDEwMCkpIC1cbiAgICAgICAgKEBtYXJrZXIub3V0ZXJXaWR0aCgpIC8gMilcbiAgICAgIHRvcCA9IChAY29udGFpbmVyLmhlaWdodCgpICogKEBtYXJrZXIuYXR0cignZGF0YS15UGMnKSAvIDEwMCkpIC0gXG4gICAgICAgIChAbWFya2VyLm91dGVySGVpZ2h0KCkgLyAyKVxuICAgIEBtYXJrZXIuY3NzXG4gICAgICBsZWZ0OiBcIiN7bGVmdH1weFwiXG4gICAgICB0b3A6IFwiI3t0b3B9cHhcIlxuICAgIEBwb3NpdGlvbkluZm9ib3goKVxuICAgIFtsZWZ0LCB0b3BdXG5cbiAgIyBVcGRhdGVzIHRoZSBtYXJrZXIncyBkYXRhIGF0dHJpYnV0ZXMgd2l0aCBpdHMgbmV3XG4gICMgcG9zaXRpb24uXG4gICNcbiAgc2F2ZVBvc2l0aW9uOiA9PlxuICAgIGNvb3JkcyA9IEBwb3NpdGlvbigpXG4gICAgQG1hcmtlci5hdHRyXG4gICAgICAnZGF0YS14UGMnOiBjb29yZHNbMF1cbiAgICAgICdkYXRhLXlQYyc6IGNvb3Jkc1sxXVxuICAgIGNvb3Jkc1xuXG4gICMgQWxsb3dzIHlvdSB0byBjaGFuZ2UgdGhlIGF0dHJpYnV0ZXMgb2YgdGhlIG1hcmtlciBvbiB0aGVcbiAgIyBmbHkuXG4gICNcbiAgdXBkYXRlOiAob3B0aW9ucykgPT5cbiAgICBpZiBvcHRpb25zLmNvbG9yXG4gICAgICBAbWFya2VyLmNzcyhiYWNrZ3JvdW5kQ29sb3I6IG9wdGlvbnMuY29sb3IpXG4gICAgaWYgb3B0aW9ucy5pbmZvYm94XG4gICAgICBAbWFya2VyLmZpbmQoXCIuI3tQbGFuaXQuaW5mb2JveENsYXNzfVwiKS5odG1sKG9wdGlvbnMuaW5mb2JveClcbiAgICAgIEBwb3NpdGlvbkluZm9ib3goKVxuICAgIGlmIG9wdGlvbnMuZHJhZ2dhYmxlICE9IHVuZGVmaW5lZFxuICAgICAgaWYgb3B0aW9ucy5kcmFnZ2FibGUgPT0gdHJ1ZVxuICAgICAgICBAbWFya2VyLmFkZENsYXNzKCdkcmFnZ2FibGUnKVxuICAgICAgICBALmVuYWJsZURyYWdnaW5nKEBtYXJrZXIpXG4gICAgICBlbHNlXG4gICAgICAgIEBtYXJrZXIucmVtb3ZlQ2xhc3MoJ2RyYWdnYWJsZScpXG4gICAgICAgIEBtYXJrZXIub2ZmKCdtb3VzZWRvd24nKVxuICAgIGlmIG9wdGlvbnMuY29vcmRzXG4gICAgICBsZWZ0ID0gKChwYXJzZUZsb2F0KG9wdGlvbnMuY29vcmRzWzBdKSAvIDEwMCkgKiBAY29udGFpbmVyLndpZHRoKCkpIC0gMTVcbiAgICAgIHRvcCA9ICgocGFyc2VGbG9hdChvcHRpb25zLmNvb3Jkc1sxXSkgLyAxMDApICogQGNvbnRhaW5lci5oZWlnaHQoKSkgLSAxNVxuICAgICAgQG1hcmtlci5jc3NcbiAgICAgICAgbGVmdDogXCIje2xlZnR9cHhcIlxuICAgICAgICB0b3A6IFwiI3t0b3B9cHhcIlxuICAgIHRydWVcblxuICAjIFJlbW92ZXMgdGhlIG1hcmtlciBmcm9tIHRoZSBwbGFuLlxuICAjXG4gIHJlbW92ZTogPT5cbiAgICBAaW5mb2JveCgpLnJlbW92ZSgpIGlmIEBpbmZvYm94KClcbiAgICBAbWFya2VyLnJlbW92ZSgpXG4gICAgdHJ1ZVxuXG4jIGF0dGFjaGVzIHRoZSBQbGFuaXQgY2xhc3MgdG8gYSBnbG9iYWwgcGxhbml0IHZhcmlhYmxlXG53aW5kb3cucGxhbml0ID0gbmV3IFBsYW5pdFxuIl19