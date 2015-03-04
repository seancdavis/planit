var Planit,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

Planit = (function() {
  function Planit() {
    this.canvasClick = __bind(this.canvasClick, this);
    this.markerClick = __bind(this.markerClick, this);
    this.markerDragEnd = __bind(this.markerDragEnd, this);
    this.getAllMarkers = __bind(this.getAllMarkers, this);
    this.getMarker = __bind(this.getMarker, this);
    this.addMarker = __bind(this.addMarker, this);
    this.initMarkers = __bind(this.initMarkers, this);
    this.initBackgroundImage = __bind(this.initBackgroundImage, this);
  }

  Planit.containerClass = 'planit-container';

  Planit.markerContainerClass = 'planit-markers-container';

  Planit.markerClass = 'planit-marker';

  Planit.markerContentClass = 'planit-marker-content';

  Planit.infoboxContainerClass = 'planit-infobox-container';

  Planit.prototype["new"] = function(_at_options) {
    this.options = _at_options != null ? _at_options : {};
    if (this.options.container) {
      this.options.container = $("#" + this.options.container);
    } else {
      this.options.container = $('#planit');
    }
    this.options.container.addClass('planit-container');
    this.options.container.append("<div class=\"" + Planit.infoboxContainerClass + "\"></div>\n<div class=\"" + Planit.markerContainerClass + "\"></div>");
    this.container = this.options.container;
    this.markersContainer = this.container.find("." + Planit.markerContainerClass).first();
    if (this.options.image && this.options.image.url) {
      this.container.append("<img src=\"" + this.options.image.url + "\">");
      this.markersContainer.css({
        backgroundImage: "url('" + this.options.image.url + "')"
      });
      this.initBackgroundImage();
    }
    if (this.options.markers && this.options.markers.length > 0) {
      this.initMarkers();
    }
    new Planit.Plan.Events({
      container: this.container,
      planit: this
    });
    return this;
  };

  Planit.prototype.initBackgroundImage = function() {
    var img, imgHeight;
    img = this.container.find('img').first();
    imgHeight = img.height();
    if (imgHeight > 0 && img.width() > 0) {
      this.container.css({
        height: imgHeight
      });
      img.remove();
      this.zoomable = new Planit.Plan.Zoomable({
        container: this.container
      });
      if (this.options.image.zoom) {
        this.zoomable["new"]();
      }
      return this.imgLoaded = true;
    } else {
      return setTimeout(this.initBackgroundImage, 250);
    }
  };

  Planit.prototype.initMarkers = function() {
    var marker, _i, _j, _len, _len1, _ref, _ref1, _results, _results1;
    if (this.options.image && this.options.image.url) {
      if (this.imgLoaded === true) {
        _ref = this.options.markers;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          marker = _ref[_i];
          _results.push(this.addMarker(marker));
        }
        return _results;
      } else {
        return setTimeout(this.initMarkers, 250);
      }
    } else {
      _ref1 = this.options.markers;
      _results1 = [];
      for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
        marker = _ref1[_j];
        _results1.push(this.addMarker(marker));
      }
      return _results1;
    }
  };

  Planit.prototype.addMarker = function(options) {
    options.container = this.container;
    return new Planit.Marker.Creator(options);
  };

  Planit.prototype.getMarker = function(id) {
    return new Planit.Marker(this.container, id);
  };

  Planit.prototype.getAllMarkers = function() {
    var plan;
    plan = new Planit.Plan(this.container);
    return plan.getAllMarkers();
  };

  Planit.prototype.centerOn = function(coords) {
    return this.zoomable.centerOn(coords);
  };

  Planit.prototype.zoomTo = function(level) {
    return this.zoomable.zoomTo(level);
  };

  Planit.prototype.markerDragEnd = function(event, marker) {
    if (this.options.markerDragEnd) {
      return this.options.markerDragEnd(event, marker);
    }
  };

  Planit.prototype.markerClick = function(event, marker) {
    if (this.options.markerClick) {
      return this.options.markerClick(event, marker);
    }
  };

  Planit.prototype.canvasClick = function(event, coords) {
    if (this.options.canvasClick) {
      return this.options.canvasClick(event, coords);
    }
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

window.planit = new Planit;

Planit.Plan = (function() {
  function Plan(_at_container) {
    this.container = _at_container;
    this.getAllMarkers = __bind(this.getAllMarkers, this);
    this.markersContainer = this.container.find("." + Planit.markerContainerClass).first();
  }

  Plan.prototype.getAllMarkers = function() {
    var m, marker, markers, _i, _len, _ref;
    markers = [];
    _ref = this.markersContainer.find('.planit-marker');
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      marker = _ref[_i];
      m = new Planit.Marker(this.container, $(marker).attr('data-marker'));
      marker = {
        coords: m.position(),
        draggable: m.isDraggable(),
        color: m.color()
      };
      if (m.infoboxHTML()) {
        marker.infobox = m.infoboxHTML();
      }
      markers.push(marker);
    }
    return markers;
  };

  return Plan;

})();

Planit.Plan.Events = (function() {
  function Events(_at_options) {
    this.options = _at_options;
    this.mousemove = __bind(this.mousemove, this);
    this.mouseup = __bind(this.mouseup, this);
    this.getEventPosition = __bind(this.getEventPosition, this);
    this.draggingMarker = __bind(this.draggingMarker, this);
    this.markers = __bind(this.markers, this);
    this.container = this.options.container;
    this.markersContainer = this.container.find("." + Planit.markerContainerClass);
    $(document).on('mousemove', this.mousemove);
    $(document).on('mouseup', this.mouseup);
  }

  Events.prototype.markers = function() {
    return this.markersContainer.find('.planit-marker');
  };

  Events.prototype.draggingMarker = function() {
    return this.markersContainer.find('.planit-marker.is-dragging');
  };

  Events.prototype.getEventPosition = function(e) {
    var hCont, hImg, scale, wCont, wImg, xImg, xPc, xPx, yImg, yPc, yPx;
    wCont = parseFloat(this.markersContainer.width());
    hCont = parseFloat(this.markersContainer.height());
    if (this.markersContainer.css('backgroundImage') && this.markersContainer.css('backgroundImage') !== 'none') {
      xPx = e.pageX - this.container.offset().left;
      yPx = e.pageY - this.container.offset().top;
      scale = parseInt(this.markersContainer.css('backgroundSize')) / 100;
      wImg = this.container.width() * scale;
      hImg = this.container.height() * scale;
      xImg = parseInt(this.markersContainer.css('backgroundPosition').split(' ')[0]);
      yImg = parseInt(this.markersContainer.css('backgroundPosition').split(' ')[1]);
      xPc = ((xPx + Math.abs(xImg)) / wImg) * 100;
      yPc = ((yPx + Math.abs(yImg)) / hImg) * 100;
    } else {
      xPc = (e.pageX - this.container.offset().left) / wCont;
      yPc = (e.pageY - this.container.offset().top) / hCont;
    }
    return [xPc, yPc];
  };

  Events.prototype.mouseup = function(e) {
    var m, marker;
    marker = this.markersContainer.find('.is-dragging').first();
    if (this.draggingMarker().length > 0) {
      m = new Planit.Marker(this.container, marker.attr('data-marker'));
      this.options.planit.markerDragEnd(e, m);
      m.savePosition();
      m.positionInfobox();
      this.draggingMarker().removeClass('is-dragging');
    }
    if ($(e.target).hasClass(Planit.markerContainerClass)) {
      this.options.planit.canvasClick(e, this.getEventPosition(e));
    }
    if ($(e.target).hasClass(Planit.markerClass) || $(e.target).parents("." + Planit.markerClass).length > 0) {
      if ($(e.target).hasClass(Planit.markerClass)) {
        marker = $(e.target);
      } else {
        marker = $(e.target).parents("." + Planit.markerClass).first();
      }
      m = new Planit.Marker(this.container, marker.attr('data-marker'));
      this.options.planit.markerClick(e, m);
    }
    return true;
  };

  Events.prototype.mousemove = function(e) {
    var marker, markerBottom, markerHeight, markerLeft, markerRight, markerTop, markerWidth, markerX, markerY, markers, mouseLeft, mouseTop, planBottom, planRight;
    markers = this.markersContainer.find('.planit-marker.is-dragging');
    if (markers.length > 0) {
      marker = markers.first();
      if (Math.abs(e.pageX - marker.attr('data-drag-start-x')) > 0 || Math.abs(e.pageY - marker.attr('data-drag-start-y')) > 0) {
        $("#" + (marker.attr('data-infobox'))).removeClass('active');
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

  return Events;

})();

Planit.Plan.Zoomable = (function() {
  function Zoomable(_at_options) {
    this.options = _at_options;
    this.zoomOut = __bind(this.zoomOut, this);
    this.zoomIn = __bind(this.zoomIn, this);
    this.mouseup = __bind(this.mouseup, this);
    this.mousemove = __bind(this.mousemove, this);
    this.mousedown = __bind(this.mousedown, this);
    this.dblclick = __bind(this.dblclick, this);
    this.getEventContainerPosition = __bind(this.getEventContainerPosition, this);
    this.imgOffsetTop = __bind(this.imgOffsetTop, this);
    this.containerHeight = __bind(this.containerHeight, this);
    this.imgHeightScrollIncrement = __bind(this.imgHeightScrollIncrement, this);
    this.imgHeightClickIncrement = __bind(this.imgHeightClickIncrement, this);
    this.tmpImgHeight = __bind(this.tmpImgHeight, this);
    this.imgHeight = __bind(this.imgHeight, this);
    this.imgOffsetLeft = __bind(this.imgOffsetLeft, this);
    this.containerWidth = __bind(this.containerWidth, this);
    this.imgWidthScrollIncrement = __bind(this.imgWidthScrollIncrement, this);
    this.imgWidthClickIncrement = __bind(this.imgWidthClickIncrement, this);
    this.tmpImgWidth = __bind(this.tmpImgWidth, this);
    this.imgWidth = __bind(this.imgWidth, this);
    this.zoomTo = __bind(this.zoomTo, this);
    this.centerOn = __bind(this.centerOn, this);
    this.positionInfoboxes = __bind(this.positionInfoboxes, this);
    this.setMarkers = __bind(this.setMarkers, this);
    this.setBackground = __bind(this.setBackground, this);
    this["new"] = __bind(this["new"], this);
    this.container = this.options.container;
    this.markersContainer = this.container.find("." + Planit.markerContainerClass);
    this.zoomId = Planit.randomString();
    this.markersContainer.attr('data-zoom-id', this.zoomId);
    this.imagePosition = {
      leftPx: 0,
      topPx: 0,
      width: this.markersContainer.width(),
      height: this.markersContainer.height(),
      scale: 1,
      increment: 0.5
    };
    this.setBackground();
  }

  Zoomable.prototype["new"] = function() {
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

  Zoomable.prototype.setBackground = function() {
    this.markersContainer.css({
      backgroundPosition: this.imagePosition.leftPx + "px " + this.imagePosition.topPx + "px",
      backgroundSize: (this.imagePosition.scale * 100.0) + "%"
    });
    return this.setMarkers();
  };

  Zoomable.prototype.setMarkers = function() {
    var left, marker, markers, top, _i, _len, _results;
    markers = $('div.planit-marker');
    if (markers.length > 0) {
      _results = [];
      for (_i = 0, _len = markers.length; _i < _len; _i++) {
        marker = markers[_i];
        left = (this.imgWidth() * ($(marker).attr('data-xPc') / 100)) + this.imagePosition.leftPx - ($(marker).outerWidth() / 2);
        top = (this.imgHeight() * ($(marker).attr('data-yPc') / 100)) + this.imagePosition.topPx - ($(marker).outerHeight() / 2);
        _results.push($(marker).css({
          left: left + "px",
          top: top + "px"
        }));
      }
      return _results;
    }
  };

  Zoomable.prototype.positionInfoboxes = function() {
    var m, marker, _i, _len, _ref;
    _ref = this.container.find('.planit-marker');
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      marker = _ref[_i];
      m = new Planit.Marker(this.container, $(marker).attr('data-marker'));
      m.positionInfobox();
    }
    return true;
  };

  Zoomable.prototype.centerOn = function(coords) {
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
    if ((this.imgWidth() >= wMin) && (this.imgHeight() >= hMin)) {
      this.imagePosition.leftPx = -((this.imgWidth() * (coords[0] / 100)) - (this.containerWidth() / 2));
      this.imagePosition.topPx = -((this.imgHeight() * (coords[1] / 100)) - (this.containerHeight() / 2));
      this.setBackground();
      return $('.planit-infobox').removeClass('active');
    } else {
      this.zoomIn();
      return this.centerOn(coords);
    }
  };

  Zoomable.prototype.zoomTo = function(level) {
    var i;
    i = this.imagePosition.increment;
    this.imagePosition.scale = (level * i) + 1 + i;
    return this.zoomOut();
  };

  Zoomable.prototype.imgWidth = function() {
    return parseFloat(this.imagePosition.width * this.imagePosition.scale);
  };

  Zoomable.prototype.tmpImgWidth = function() {
    return (1 + this.imagePosition.increment) * this.imagePosition.width();
  };

  Zoomable.prototype.imgWidthClickIncrement = function() {
    return parseFloat(this.imagePosition.width * this.imagePosition.increment);
  };

  Zoomable.prototype.imgWidthScrollIncrement = function() {
    return parseFloat(this.imagePosition.width * this.imagePosition.scrollIncrement);
  };

  Zoomable.prototype.containerWidth = function() {
    return parseFloat(this.markersContainer.width());
  };

  Zoomable.prototype.imgOffsetLeft = function() {
    return Math.abs(parseFloat(this.markersContainer.css('backgroundPosition').split(' ')[0]));
  };

  Zoomable.prototype.imgHeight = function() {
    return parseFloat(this.imagePosition.height * this.imagePosition.scale);
  };

  Zoomable.prototype.tmpImgHeight = function() {
    return (1 + this.imagePosition.increment) * this.imagePosition.height();
  };

  Zoomable.prototype.imgHeightClickIncrement = function() {
    return parseFloat(this.imagePosition.height * this.imagePosition.increment);
  };

  Zoomable.prototype.imgHeightScrollIncrement = function() {
    return parseFloat(this.imagePosition.height * this.imagePosition.scrollIncrement);
  };

  Zoomable.prototype.containerHeight = function() {
    return parseFloat(this.markersContainer.height());
  };

  Zoomable.prototype.imgOffsetTop = function() {
    return Math.abs(parseFloat(this.markersContainer.css('backgroundPosition').split(' ')[1]));
  };

  Zoomable.prototype.getEventContainerPosition = function(e) {
    return {
      left: (e.pageX - this.container.offset().left) / this.containerWidth(),
      top: (e.pageY - this.container.offset().top) / this.containerHeight()
    };
  };

  Zoomable.prototype.dblclick = function(e) {
    var click;
    if ($(e.target).attr('data-zoom-id') === this.zoomId) {
      click = this.getEventContainerPosition(e);
      return this.zoomIn('click', click.left, click.top);
    }
  };

  Zoomable.prototype.mousedown = function(e) {
    var coords;
    if ($(e.target).attr('data-zoom-id') === this.zoomId) {
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

  Zoomable.prototype.mousemove = function(e) {
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
      this.setBackground();
    }
    return true;
  };

  Zoomable.prototype.mouseup = function(e) {
    this.isDragging = false;
    this.positionInfoboxes();
    return true;
  };

  Zoomable.prototype.zoomIn = function() {
    this.imagePosition.scale = this.imagePosition.scale + this.imagePosition.increment;
    this.imagePosition.leftPx = -this.imgOffsetLeft() - (this.imgWidthClickIncrement() / 2);
    this.imagePosition.topPx = -this.imgOffsetTop() - (this.imgHeightClickIncrement() / 2);
    this.setBackground();
    return this.positionInfoboxes();
  };

  Zoomable.prototype.zoomOut = function() {
    var leftPx, topPx;
    if (this.imagePosition.scale > 1) {
      this.imagePosition.scale = this.imagePosition.scale - this.imagePosition.increment;
      leftPx = -this.imgOffsetLeft() + (this.imgWidthClickIncrement() / 2);
      topPx = -this.imgOffsetTop() + (this.imgHeightClickIncrement() / 2);
      if (leftPx + this.imgWidthClickIncrement() > 0) {
        this.imagePosition.leftPx = 0;
      } else if (leftPx - this.imgWidthClickIncrement() < this.containerWidth() - this.imgWidth()) {
        this.imagePosition.leftPx = this.containerWidth() - this.imgWidth();
      }
      if (topPx + this.imgHeightClickIncrement() > 0) {
        this.imagePosition.topPx = 0;
      } else if (topPx - this.imgHeightClickIncrement() < this.containerHeight() - this.imgHeight()) {
        this.imagePosition.topPx = this.containerHeight() - this.imgHeight();
      }
      this.setBackground();
      return this.positionInfoboxes();
    }
  };

  return Zoomable;

})();

Planit.Marker = (function() {
  function Marker(_at_container, id) {
    this.container = _at_container;
    this.remove = __bind(this.remove, this);
    this.update = __bind(this.update, this);
    this.savePosition = __bind(this.savePosition, this);
    this.isDraggable = __bind(this.isDraggable, this);
    this.positionInfobox = __bind(this.positionInfobox, this);
    this.infoboxHTML = __bind(this.infoboxHTML, this);
    this.id = __bind(this.id, this);
    this.planitID = __bind(this.planitID, this);
    this.color = __bind(this.color, this);
    this.relativePosition = __bind(this.relativePosition, this);
    this.position = __bind(this.position, this);
    this.markersContainer = this.container.find("." + Planit.markerContainerClass);
    this.marker = this.markersContainer.find("." + Planit.markerClass + "[data-marker='" + id + "']").first();
    this;
  }

  Marker.prototype.position = function() {
    var hImg, scale, wImg, xImg, xPc, xPx, yImg, yPc, yPx;
    xPx = this.marker.position().left + (this.marker.outerWidth() / 2);
    yPx = this.marker.position().top + (this.marker.outerHeight() / 2);
    if (this.markersContainer.css('backgroundImage')) {
      scale = parseInt(this.markersContainer.css('backgroundSize')) / 100;
      wImg = this.container.width() * scale;
      hImg = this.container.height() * scale;
      xImg = parseInt(this.markersContainer.css('backgroundPosition').split(' ')[0]);
      yImg = parseInt(this.markersContainer.css('backgroundPosition').split(' ')[1]);
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

  Marker.prototype.infoboxHTML = function() {
    var info;
    info = this.marker.find('.planit-infobox');
    if (info.length > 0) {
      return info.html();
    } else {
      return null;
    }
  };

  Marker.prototype.positionInfobox = function() {
    var buffer, cHeight, cWidth, iHalfHeight, iHalfWidth, iHeight, iWidth, infoLeft, infoTop, infobox, mHalfHeight, mHalfWidth, mHeight, mWidth, markerCenterX, markerCenterY, offsetX, offsetY;
    infobox = $("#" + (this.marker.attr('data-infobox')));
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
    infobox.css({
      left: (infoLeft + offsetX) + "px",
      top: (infoTop + offsetY) + "px"
    });
    return this.position();
  };

  Marker.prototype.isDraggable = function() {
    return this.marker.hasClass('draggable');
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
      this.marker.find('.planit-infobox').html(options.infobox);
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
    return this.marker.remove();
  };

  return Marker;

})();

Planit.Marker.Events = (function() {
  function Events(_at_options) {
    var arrow, arrowClass, classes, id, options, position;
    this.options = _at_options;
    this.container = this.options.container;
    this.markersContainer = this.container.find("." + Planit.markerContainerClass);
    this.marker = this.markersContainer.find("." + Planit.markerClass + "[data-marker='" + this.options.planitID + "']").first();
    this.markerObj = new Planit.Marker(this.container, this.options.planitID);
    if (this.options.draggable) {
      this.marker.addClass('draggable');
      this.marker.on('mousedown', (function(_this) {
        return function(e) {
          var marker;
          if (e.which === 1) {
            marker = $(e.target).closest('.planit-marker');
            marker.addClass('is-dragging');
            return marker.attr({
              'data-drag-start-x': e.pageX,
              'data-drag-start-y': e.pageY
            });
          }
        };
      })(this));
    }
    if (this.options.infobox) {
      id = Planit.randomString(16);
      options = this.options.infobox;
      if (options.position) {
        position = options.position;
      } else {
        position = 'top';
      }
      if (options.arrow) {
        arrow = true;
      } else {
        arrow = false;
      }
      if (arrow === true) {
        arrowClass = 'arrow';
      } else {
        arrowClass = '';
      }
      classes = "planit-infobox " + position + " " + arrowClass;
      this.container.find("." + Planit.infoboxContainerClass).append("<div class=\"" + classes + "\" id=\"info-" + id + "\" \n  data-position=\"" + position + "\">\n    " + options.html + "\n</div>");
      if (options.offsetX) {
        this.container.find('.planit-infobox').last().attr({
          'data-offset-x': options.offsetX
        });
      }
      if (options.offsetY) {
        this.container.find('.planit-infobox').last().attr({
          'data-offset-y': options.offsetY
        });
      }
      this.marker.attr('data-infobox', "info-" + id);
      this.markerObj.positionInfobox();
      this.marker.click((function(_this) {
        return function(e) {
          var marker;
          if (!_this.marker.attr('data-drag-start-x') || !_this.marker.attr('data-drag-start-y') || (Math.abs(e.pageX - _this.marker.attr('data-drag-start-x')) < 1 && Math.abs(e.pageY - _this.marker.attr('data-drag-start-y')) < 1)) {
            marker = $(e.target).closest('.planit-marker');
            return $("#" + (marker.attr('data-infobox'))).toggleClass('active');
          }
        };
      })(this));
    }
  }

  Events.prototype.markers = function() {
    return this.markersContainer.find('.planit-marker');
  };

  Events.prototype.draggingMarker = function() {
    return this.markersContainer.find('.planit-marker.is-dragging');
  };

  return Events;

})();

Planit.Marker.Creator = (function() {
  function Creator(_at_options) {
    var color, left, marker, top;
    this.options = _at_options;
    this.container = this.options.container;
    this.markersContainer = this.container.find("." + Planit.markerContainerClass).first();
    if (!this.options.planitID) {
      this.options.planitID = Planit.randomString(20);
    }
    if (this.options.color) {
      color = this.options.color;
    } else {
      color = '#FC5B3F';
    }
    left = ((parseFloat(this.options.coords[0]) / 100) * this.container.width()) - 15;
    top = ((parseFloat(this.options.coords[1]) / 100) * this.container.height()) - 15;
    this.markersContainer.append($('<div></div>').addClass('planit-marker').attr({
      'data-marker': this.options.planitID,
      'data-xPc': this.options.coords[0],
      'data-yPc': this.options.coords[1]
    }).css({
      left: left + "px",
      top: top + "px",
      backgroundColor: color
    }));
    marker = this.markersContainer.find('.planit-marker').last();
    if (this.options.id) {
      marker.attr({
        'data-id': this.options.id
      });
    }
    if (this.options["class"]) {
      marker.addClass(this.options["class"]);
    }
    if (this.options.html) {
      marker.html(this.options.html);
    }
    if (this.options.size) {
      marker.css({
        width: this.options.size + "px",
        height: this.options.size + "px"
      });
    }
    new Planit.Marker.Events(this.options);
    new Planit.Marker(this.container, this.options.planitID);
  }

  return Creator;

})();

//# sourceMappingURL=data:application/json;base64,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RyxJQUFDLENBQUEsT0FBTyxDQUFDLE9BQUQsQ0FBWDtBQUNFLE1BQUEsTUFBTSxDQUFDLFFBQVAsQ0FBZ0IsSUFBQyxDQUFBLE9BQU8sQ0FBQyxPQUFELENBQXhCLENBQUEsQ0FERjtLQXpCQTtBQTJCQSxJQUFBLElBQUcsSUFBQyxDQUFBLE9BQU8sQ0FBQyxJQUFaO0FBQ0UsTUFBQSxNQUFNLENBQUMsSUFBUCxDQUFZLElBQUMsQ0FBQSxPQUFPLENBQUMsSUFBckIsQ0FBQSxDQURGO0tBM0JBO0FBNkJBLElBQUEsSUFBRyxJQUFDLENBQUEsT0FBTyxDQUFDLElBQVo7QUFDRSxNQUFBLE1BQU0sQ0FBQyxHQUFQLENBQ0U7QUFBQSxRQUFBLEtBQUEsRUFBVSxJQUFDLENBQUEsT0FBTyxDQUFDLElBQVYsR0FBZSxJQUF4QjtBQUFBLFFBQ0EsTUFBQSxFQUFXLElBQUMsQ0FBQSxPQUFPLENBQUMsSUFBVixHQUFlLElBRHpCO09BREYsQ0FBQSxDQURGO0tBN0JBO0FBQUEsSUFtQ0ksSUFBQSxNQUFNLENBQUMsTUFBTSxDQUFDLE1BQWQsQ0FBcUIsSUFBQyxDQUFBLE9BQXRCLENBbkNKLENBQUE7QUFBQSxJQXNDSSxJQUFBLE1BQU0sQ0FBQyxNQUFQLENBQWMsSUFBQyxDQUFBLFNBQWYsRUFBMEIsSUFBQyxDQUFBLE9BQU8sQ0FBQyxRQUFuQyxDQXRDSixDQUZXO0VBQUEsQ0FBYjs7aUJBQUE7O0lBanNCRixDQUFBIiwiZmlsZSI6InBsYW5pdC10bXAuanMiLCJzb3VyY2VSb290IjoiL3NvdXJjZS8iLCJzb3VyY2VzQ29udGVudCI6WyJjbGFzcyBQbGFuaXRcblxuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBSZWZzXG5cbiAgQGNvbnRhaW5lckNsYXNzOiAgICAgICAgJ3BsYW5pdC1jb250YWluZXInXG4gIEBtYXJrZXJDb250YWluZXJDbGFzczogICdwbGFuaXQtbWFya2Vycy1jb250YWluZXInXG4gIEBtYXJrZXJDbGFzczogICAgICAgICAgICdwbGFuaXQtbWFya2VyJ1xuICBAbWFya2VyQ29udGVudENsYXNzOiAgICAncGxhbml0LW1hcmtlci1jb250ZW50J1xuICBAaW5mb2JveENvbnRhaW5lckNsYXNzOiAncGxhbml0LWluZm9ib3gtY29udGFpbmVyJ1xuXG4gICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIERlZmF1bHQgT3B0aW9uc1xuXG4gIG5ldzogKEBvcHRpb25zID0ge30pIC0+XG4gICAgIyBTZXQgT3B0aW9uc1xuICAgIGlmIEBvcHRpb25zLmNvbnRhaW5lclxuICAgICAgQG9wdGlvbnMuY29udGFpbmVyID0gJChcIiMje0BvcHRpb25zLmNvbnRhaW5lcn1cIilcbiAgICBlbHNlXG4gICAgICBAb3B0aW9ucy5jb250YWluZXIgPSAkKCcjcGxhbml0JykgXG5cbiAgICAjIEluaXRpYWxpemUgQ29udGFpbmVyXG4gICAgQG9wdGlvbnMuY29udGFpbmVyLmFkZENsYXNzKCdwbGFuaXQtY29udGFpbmVyJylcbiAgICBAb3B0aW9ucy5jb250YWluZXIuYXBwZW5kIFwiXCJcIlxuICAgICAgPGRpdiBjbGFzcz1cIiN7UGxhbml0LmluZm9ib3hDb250YWluZXJDbGFzc31cIj48L2Rpdj5cbiAgICAgIDxkaXYgY2xhc3M9XCIje1BsYW5pdC5tYXJrZXJDb250YWluZXJDbGFzc31cIj48L2Rpdj5cbiAgICAgICAgXCJcIlwiXG5cbiAgICAjIFJlZnNcbiAgICBAY29udGFpbmVyID0gQG9wdGlvbnMuY29udGFpbmVyXG4gICAgQG1hcmtlcnNDb250YWluZXIgPSBAY29udGFpbmVyLmZpbmQoXCIuI3tQbGFuaXQubWFya2VyQ29udGFpbmVyQ2xhc3N9XCIpLmZpcnN0KClcblxuICAgICMgQWRkIGltYWdlIGFuZCB6b29tIChpZiBuZWNlc3NhcnkpXG4gICAgaWYgQG9wdGlvbnMuaW1hZ2UgJiYgQG9wdGlvbnMuaW1hZ2UudXJsXG4gICAgICBAY29udGFpbmVyLmFwcGVuZChcIlwiXCI8aW1nIHNyYz1cIiN7QG9wdGlvbnMuaW1hZ2UudXJsfVwiPlwiXCJcIilcbiAgICAgIEBtYXJrZXJzQ29udGFpbmVyLmNzc1xuICAgICAgICBiYWNrZ3JvdW5kSW1hZ2U6IFwidXJsKCcje0BvcHRpb25zLmltYWdlLnVybH0nKVwiXG4gICAgICBAaW5pdEJhY2tncm91bmRJbWFnZSgpXG5cbiAgICAjIEFkZCBNYXJrZXJzIChpZiBuZWNlc3NhcnkpXG4gICAgaWYgQG9wdGlvbnMubWFya2VycyAmJiBAb3B0aW9ucy5tYXJrZXJzLmxlbmd0aCA+IDBcbiAgICAgIEBpbml0TWFya2VycygpXG5cbiAgICAjIEJpbmQgRG9jdW1lbnQgRXZlbnRzXG4gICAgbmV3IFBsYW5pdC5QbGFuLkV2ZW50c1xuICAgICAgY29udGFpbmVyOiBAY29udGFpbmVyXG4gICAgICBwbGFuaXQ6IEBcblxuICAgICMgUmV0dXJuIHRoaXMgUGxhbml0IG9iamVjdFxuICAgIEBcblxuICBpbml0QmFja2dyb3VuZEltYWdlOiA9PlxuICAgIGltZyA9IEBjb250YWluZXIuZmluZCgnaW1nJykuZmlyc3QoKVxuICAgIGltZ0hlaWdodCA9IGltZy5oZWlnaHQoKVxuICAgIGlmIGltZ0hlaWdodCA+IDAgJiYgaW1nLndpZHRoKCkgPiAwXG4gICAgICBAY29udGFpbmVyLmNzc1xuICAgICAgICBoZWlnaHQ6IGltZ0hlaWdodFxuICAgICAgaW1nLnJlbW92ZSgpXG4gICAgICBAem9vbWFibGUgPSBuZXcgUGxhbml0LlBsYW4uWm9vbWFibGVcbiAgICAgICAgY29udGFpbmVyOiBAY29udGFpbmVyXG4gICAgICBpZiBAb3B0aW9ucy5pbWFnZS56b29tXG4gICAgICAgIEB6b29tYWJsZS5uZXcoKVxuICAgICAgQGltZ0xvYWRlZCA9IHRydWVcbiAgICBlbHNlXG4gICAgICBzZXRUaW1lb3V0KEBpbml0QmFja2dyb3VuZEltYWdlLCAyNTApXG5cbiAgaW5pdE1hcmtlcnM6ID0+XG4gICAgaWYgQG9wdGlvbnMuaW1hZ2UgJiYgQG9wdGlvbnMuaW1hZ2UudXJsXG4gICAgICBpZiBAaW1nTG9hZGVkID09IHRydWVcbiAgICAgICAgQGFkZE1hcmtlcihtYXJrZXIpIGZvciBtYXJrZXIgaW4gQG9wdGlvbnMubWFya2Vyc1xuICAgICAgZWxzZVxuICAgICAgICBzZXRUaW1lb3V0KEBpbml0TWFya2VycywgMjUwKVxuICAgIGVsc2VcbiAgICAgIEBhZGRNYXJrZXIobWFya2VyKSBmb3IgbWFya2VyIGluIEBvcHRpb25zLm1hcmtlcnNcblxuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBBZGQgQSBNYXJrZXJcblxuICBhZGRNYXJrZXI6IChvcHRpb25zKSA9PlxuICAgIG9wdGlvbnMuY29udGFpbmVyID0gQGNvbnRhaW5lclxuICAgIG5ldyBQbGFuaXQuTWFya2VyLkNyZWF0b3Iob3B0aW9ucylcblxuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBSZXRyaWV2ZSBEYXRhXG5cbiAgZ2V0TWFya2VyOiAoaWQpID0+XG4gICAgbmV3IFBsYW5pdC5NYXJrZXIoQGNvbnRhaW5lciwgaWQpXG5cbiAgZ2V0QWxsTWFya2VyczogKCkgPT5cbiAgICBwbGFuID0gbmV3IFBsYW5pdC5QbGFuKEBjb250YWluZXIpXG4gICAgcGxhbi5nZXRBbGxNYXJrZXJzKClcblxuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBQbGFuIEFjdGlvbnNcblxuICBjZW50ZXJPbjogKGNvb3JkcykgLT5cbiAgICBAem9vbWFibGUuY2VudGVyT24oY29vcmRzKVxuXG4gIHpvb21UbzogKGxldmVsKSAtPlxuICAgIEB6b29tYWJsZS56b29tVG8obGV2ZWwpXG5cbiAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gRXZlbnQgQ2FsbGJhY2tzXG5cbiAgbWFya2VyRHJhZ0VuZDogKGV2ZW50LCBtYXJrZXIpID0+XG4gICAgaWYgQG9wdGlvbnMubWFya2VyRHJhZ0VuZFxuICAgICAgQG9wdGlvbnMubWFya2VyRHJhZ0VuZChldmVudCwgbWFya2VyKVxuXG4gIG1hcmtlckNsaWNrOiAoZXZlbnQsIG1hcmtlcikgPT5cbiAgICBpZiBAb3B0aW9ucy5tYXJrZXJDbGlja1xuICAgICAgQG9wdGlvbnMubWFya2VyQ2xpY2soZXZlbnQsIG1hcmtlcilcblxuICBjYW52YXNDbGljazogKGV2ZW50LCBjb29yZHMpID0+XG4gICAgaWYgQG9wdGlvbnMuY2FudmFzQ2xpY2tcbiAgICAgIEBvcHRpb25zLmNhbnZhc0NsaWNrKGV2ZW50LCBjb29yZHMpXG5cbiAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gQ2xhc3MgTWV0aG9kc1xuXG4gIEByYW5kb21TdHJpbmc6IChsZW5ndGggPSAxNikgLT5cbiAgICBzdHIgPSBNYXRoLnJhbmRvbSgpLnRvU3RyaW5nKDM2KS5zbGljZSgyKSBcbiAgICBzdHIgPSBzdHIgKyBNYXRoLnJhbmRvbSgpLnRvU3RyaW5nKDM2KS5zbGljZSgyKVxuICAgIHN0ci5zdWJzdHJpbmcoMCwgbGVuZ3RoIC0gMSlcblxuIyBzZXQgdGhpcyBjbGFzcyB0byBhIGdsb2JhbCBgcGxhbml0YCB2YXJpYWJsZVxud2luZG93LnBsYW5pdCA9IG5ldyBQbGFuaXRcblxuY2xhc3MgUGxhbml0LlBsYW5cblxuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBTZXR1cFxuXG4gIGNvbnN0cnVjdG9yOiAoQGNvbnRhaW5lcikgLT5cbiAgICBAbWFya2Vyc0NvbnRhaW5lciA9IEBjb250YWluZXIuZmluZChcIi4je1BsYW5pdC5tYXJrZXJDb250YWluZXJDbGFzc31cIikuZmlyc3QoKVxuXG4gICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIEdldCBBbGwgTWFya2Vyc1xuXG4gIGdldEFsbE1hcmtlcnM6ICgpID0+XG4gICAgbWFya2VycyA9IFtdXG4gICAgZm9yIG1hcmtlciBpbiBAbWFya2Vyc0NvbnRhaW5lci5maW5kKCcucGxhbml0LW1hcmtlcicpXG4gICAgICBtID0gbmV3IFBsYW5pdC5NYXJrZXIoQGNvbnRhaW5lciwgJChtYXJrZXIpLmF0dHIoJ2RhdGEtbWFya2VyJykpXG4gICAgICBtYXJrZXIgPVxuICAgICAgICAjIGNvb3JkczogW20ucG9zaXRpb24oKS5sZWZ0LCBtLnBvc2l0aW9uKCkudG9wXVxuICAgICAgICBjb29yZHM6IG0ucG9zaXRpb24oKVxuICAgICAgICBkcmFnZ2FibGU6IG0uaXNEcmFnZ2FibGUoKVxuICAgICAgICBjb2xvcjogbS5jb2xvcigpXG4gICAgICBtYXJrZXIuaW5mb2JveCA9IG0uaW5mb2JveEhUTUwoKSBpZiBtLmluZm9ib3hIVE1MKClcbiAgICAgIG1hcmtlcnMucHVzaChtYXJrZXIpXG4gICAgbWFya2Vyc1xuXG5jbGFzcyBQbGFuaXQuUGxhbi5FdmVudHNcblxuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBTZXR1cFxuXG4gIGNvbnN0cnVjdG9yOiAoQG9wdGlvbnMpIC0+XG5cbiAgICAjIGRlZmF1bHQgb3B0aW9uc1xuICAgIEBjb250YWluZXIgPSBAb3B0aW9ucy5jb250YWluZXJcbiAgICBAbWFya2Vyc0NvbnRhaW5lciA9IEBjb250YWluZXIuZmluZChcIi4je1BsYW5pdC5tYXJrZXJDb250YWluZXJDbGFzc31cIilcblxuICAgICMgYmluZCBkcmFnZ2FibGUgZXZlbnRzXG4gICAgJChkb2N1bWVudCkub24oJ21vdXNlbW92ZScsIEBtb3VzZW1vdmUpXG4gICAgJChkb2N1bWVudCkub24oJ21vdXNldXAnLCBAbW91c2V1cClcblxuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBSZWZzXG5cbiAgbWFya2VyczogPT5cbiAgICBAbWFya2Vyc0NvbnRhaW5lci5maW5kKCcucGxhbml0LW1hcmtlcicpXG5cbiAgZHJhZ2dpbmdNYXJrZXI6ID0+XG4gICAgQG1hcmtlcnNDb250YWluZXIuZmluZCgnLnBsYW5pdC1tYXJrZXIuaXMtZHJhZ2dpbmcnKVxuXG4gIGdldEV2ZW50UG9zaXRpb246IChlKSA9PlxuICAgICMgY29udGFpbmVyIGRpbWVuc2lvbnNcbiAgICB3Q29udCA9IHBhcnNlRmxvYXQoQG1hcmtlcnNDb250YWluZXIud2lkdGgoKSlcbiAgICBoQ29udCA9IHBhcnNlRmxvYXQoQG1hcmtlcnNDb250YWluZXIuaGVpZ2h0KCkpXG4gICAgaWYoXG4gICAgICBAbWFya2Vyc0NvbnRhaW5lci5jc3MoJ2JhY2tncm91bmRJbWFnZScpICYmXG4gICAgICBAbWFya2Vyc0NvbnRhaW5lci5jc3MoJ2JhY2tncm91bmRJbWFnZScpICE9ICdub25lJ1xuICAgIClcbiAgICAgICMgaWYgdGhlcmUgaXMgYW4gaW1hZ2UsIHdlIG5lZWQgdG8gY2FsY3VsYXRlIHdpdGggaW1hZ2UgaW4gbWluZFxuICAgICAgeFB4ID0gZS5wYWdlWCAtIEBjb250YWluZXIub2Zmc2V0KCkubGVmdFxuICAgICAgeVB4ID0gZS5wYWdlWSAtIEBjb250YWluZXIub2Zmc2V0KCkudG9wXG4gICAgICBzY2FsZSA9IHBhcnNlSW50KEBtYXJrZXJzQ29udGFpbmVyLmNzcygnYmFja2dyb3VuZFNpemUnKSkgLyAxMDBcbiAgICAgIHdJbWcgPSBAY29udGFpbmVyLndpZHRoKCkgKiBzY2FsZVxuICAgICAgaEltZyA9IEBjb250YWluZXIuaGVpZ2h0KCkgKiBzY2FsZVxuICAgICAgeEltZyA9IHBhcnNlSW50KEBtYXJrZXJzQ29udGFpbmVyLmNzcygnYmFja2dyb3VuZFBvc2l0aW9uJykuc3BsaXQoJyAnKVswXSlcbiAgICAgIHlJbWcgPSBwYXJzZUludChAbWFya2Vyc0NvbnRhaW5lci5jc3MoJ2JhY2tncm91bmRQb3NpdGlvbicpLnNwbGl0KCcgJylbMV0pXG4gICAgICB4UGMgPSAoKHhQeCArIE1hdGguYWJzKHhJbWcpKSAvIHdJbWcpICogMTAwXG4gICAgICB5UGMgPSAoKHlQeCArIE1hdGguYWJzKHlJbWcpKSAvIGhJbWcpICogMTAwXG4gICAgZWxzZVxuICAgICAgIyBvciB3ZSBjYW4ganVzdCBsb29rIGF0IHRoZSBjb250YWluZXJcbiAgICAgIHhQYyA9IChlLnBhZ2VYIC0gQGNvbnRhaW5lci5vZmZzZXQoKS5sZWZ0KSAvIHdDb250XG4gICAgICB5UGMgPSAgKGUucGFnZVkgLSBAY29udGFpbmVyLm9mZnNldCgpLnRvcCkgLyBoQ29udFxuICAgIFt4UGMsIHlQY11cblxuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBFdmVudHNcblxuICBtb3VzZXVwOiAoZSkgPT5cbiAgICAjIGRlYWxpbmcgd2l0aCBtYXJrZXJzLCBlc3AuIGRyYWdnaW5nIG1hcmtlcnNcbiAgICBtYXJrZXIgPSBAbWFya2Vyc0NvbnRhaW5lci5maW5kKCcuaXMtZHJhZ2dpbmcnKS5maXJzdCgpXG4gICAgaWYgQGRyYWdnaW5nTWFya2VyKCkubGVuZ3RoID4gMFxuICAgICAgbSA9IG5ldyBQbGFuaXQuTWFya2VyKEBjb250YWluZXIsIG1hcmtlci5hdHRyKCdkYXRhLW1hcmtlcicpKVxuICAgICAgQG9wdGlvbnMucGxhbml0Lm1hcmtlckRyYWdFbmQoZSwgbSlcbiAgICAgIG0uc2F2ZVBvc2l0aW9uKClcbiAgICAgIG0ucG9zaXRpb25JbmZvYm94KClcbiAgICAgIEBkcmFnZ2luZ01hcmtlcigpLnJlbW92ZUNsYXNzKCdpcy1kcmFnZ2luZycpXG4gICAgIyBpZiBjbGljayBpcyBvbiB0aGUgY29udGFpbmVyXG4gICAgaWYgJChlLnRhcmdldCkuaGFzQ2xhc3MoUGxhbml0Lm1hcmtlckNvbnRhaW5lckNsYXNzKVxuICAgICAgQG9wdGlvbnMucGxhbml0LmNhbnZhc0NsaWNrKGUsIEBnZXRFdmVudFBvc2l0aW9uKGUpKVxuICAgICMgaWYgY2xpY2sgaXMgb24gdGhlIG1hcmtlcnNcbiAgICBpZihcbiAgICAgICQoZS50YXJnZXQpLmhhc0NsYXNzKFBsYW5pdC5tYXJrZXJDbGFzcykgfHwgXG4gICAgICAkKGUudGFyZ2V0KS5wYXJlbnRzKFwiLiN7UGxhbml0Lm1hcmtlckNsYXNzfVwiKS5sZW5ndGggPiAwXG4gICAgKVxuICAgICAgaWYgJChlLnRhcmdldCkuaGFzQ2xhc3MoUGxhbml0Lm1hcmtlckNsYXNzKVxuICAgICAgICBtYXJrZXIgPSAkKGUudGFyZ2V0KVxuICAgICAgZWxzZVxuICAgICAgICBtYXJrZXIgPSAkKGUudGFyZ2V0KS5wYXJlbnRzKFwiLiN7UGxhbml0Lm1hcmtlckNsYXNzfVwiKS5maXJzdCgpXG4gICAgICBtID0gbmV3IFBsYW5pdC5NYXJrZXIoQGNvbnRhaW5lciwgbWFya2VyLmF0dHIoJ2RhdGEtbWFya2VyJykpXG4gICAgICBAb3B0aW9ucy5wbGFuaXQubWFya2VyQ2xpY2soZSwgbSlcbiAgICB0cnVlXG5cbiAgbW91c2Vtb3ZlOiAoZSkgPT5cbiAgICBtYXJrZXJzID0gQG1hcmtlcnNDb250YWluZXIuZmluZCgnLnBsYW5pdC1tYXJrZXIuaXMtZHJhZ2dpbmcnKVxuXG4gICAgaWYgbWFya2Vycy5sZW5ndGggPiAwXG5cbiAgICAgICMgb25seSB1c2UgZmlyc3QgbWFya2VyIGluIGNhc2UgdGhlcmUgYXJlIG1vcmUgdGhhblxuICAgICAgIyBvbmUgZHJhZ2dpbmdcbiAgICAgICMgXG4gICAgICBtYXJrZXIgPSBtYXJrZXJzLmZpcnN0KClcblxuICAgICAgIyB3ZSBoaWRlIHRoZSBpbmZvYm94IHdoaWxlIGRyYWdnaW5nXG4gICAgICAjIFxuICAgICAgaWYoXG4gICAgICAgIE1hdGguYWJzKGUucGFnZVggLSBtYXJrZXIuYXR0cignZGF0YS1kcmFnLXN0YXJ0LXgnKSkgPiAwIHx8IFxuICAgICAgICBNYXRoLmFicyhlLnBhZ2VZIC0gbWFya2VyLmF0dHIoJ2RhdGEtZHJhZy1zdGFydC15JykpID4gMFxuICAgICAgKVxuICAgICAgICAkKFwiIyN7bWFya2VyLmF0dHIoJ2RhdGEtaW5mb2JveCcpfVwiKS5yZW1vdmVDbGFzcygnYWN0aXZlJylcblxuICAgICAgIyBjYWxjdWxhdGUgcG9zaXRpb25zXG4gICAgICAjIFxuICAgICAgbW91c2VMZWZ0ICAgICA9IGUucGFnZVggLSBAY29udGFpbmVyLm9mZnNldCgpLmxlZnRcbiAgICAgIG1vdXNlVG9wICAgICAgPSBlLnBhZ2VZIC0gQGNvbnRhaW5lci5vZmZzZXQoKS50b3BcbiAgICAgIHBsYW5SaWdodCAgICAgPSBAY29udGFpbmVyLndpZHRoKClcbiAgICAgIHBsYW5Cb3R0b20gICAgPSBAY29udGFpbmVyLmhlaWdodCgpXG4gICAgICBtYXJrZXJMZWZ0ICAgID0gbW91c2VMZWZ0IC0gKG1hcmtlci5vdXRlcldpZHRoKCkgLyAyKVxuICAgICAgbWFya2VyVG9wICAgICA9IG1vdXNlVG9wIC0gKG1hcmtlci5vdXRlckhlaWdodCgpIC8gMilcbiAgICAgIG1hcmtlclJpZ2h0ICAgPSBtb3VzZUxlZnQgKyAobWFya2VyLm91dGVyV2lkdGgoKSAvIDIpXG4gICAgICBtYXJrZXJCb3R0b20gID0gbW91c2VUb3AgKyAobWFya2VyLm91dGVySGVpZ2h0KCkgLyAyKVxuICAgICAgbWFya2VyV2lkdGggICA9IG1hcmtlci5vdXRlcldpZHRoKClcbiAgICAgIG1hcmtlckhlaWdodCAgPSBtYXJrZXIub3V0ZXJIZWlnaHQoKVxuXG4gICAgICAjIGZpbmQgdGhlIGxlZnQgcG9zaXRpb24gb2YgdGhlIG1hcmtlciBiYXNlZCBvblxuICAgICAgIyBwb3NpdGlvbiBvZiB0aGUgbW91c2UgcmVsYXRpdmUgdG8gdGhlIHBsYW5cbiAgICAgICMgXG4gICAgICBpZiBtYXJrZXJMZWZ0IDw9IDBcbiAgICAgICAgbWFya2VyWCA9IDBcbiAgICAgIGVsc2UgaWYgbWFya2VyUmlnaHQgPCBwbGFuUmlnaHRcbiAgICAgICAgbWFya2VyWCA9IG1hcmtlckxlZnRcbiAgICAgIGVsc2VcbiAgICAgICAgbWFya2VyWCA9IHBsYW5SaWdodCAtIG1hcmtlcldpZHRoXG5cbiAgICAgICMgZmluZCB0aGUgbGVmdCBwb3NpdGlvbiBvZiB0aGUgbWFya2VyIGJhc2VkIG9uXG4gICAgICAjIHBvc2l0aW9uIG9mIHRoZSBtb3VzZSByZWxhdGl2ZSB0byB0aGUgcGxhblxuICAgICAgIyBcbiAgICAgIGlmIG1hcmtlclRvcCA8PSAwXG4gICAgICAgIG1hcmtlclkgPSAwXG4gICAgICBlbHNlIGlmIG1hcmtlckJvdHRvbSA8IHBsYW5Cb3R0b21cbiAgICAgICAgbWFya2VyWSA9IG1hcmtlclRvcFxuICAgICAgZWxzZVxuICAgICAgICBtYXJrZXJZID0gcGxhbkJvdHRvbSAtIG1hcmtlckhlaWdodFxuXG4gICAgICAjIHNldCB0aGUgcG9zaXRpb24gb2YgdGhlIG1hcmtlclxuICAgICAgIyBcbiAgICAgIG1hcmtlci5jc3NcbiAgICAgICAgbGVmdDogbWFya2VyWFxuICAgICAgICB0b3A6IG1hcmtlcllcblxuY2xhc3MgUGxhbml0LlBsYW4uWm9vbWFibGVcblxuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBTZXR1cFxuXG4gIGNvbnN0cnVjdG9yOiAoQG9wdGlvbnMpIC0+XG4gICAgIyBkZWZhdWx0IG9wdGlvbnNcbiAgICBAY29udGFpbmVyID0gQG9wdGlvbnMuY29udGFpbmVyXG4gICAgQG1hcmtlcnNDb250YWluZXIgPSBAY29udGFpbmVyLmZpbmQoXCIuI3tQbGFuaXQubWFya2VyQ29udGFpbmVyQ2xhc3N9XCIpXG4gICAgQHpvb21JZCA9IFBsYW5pdC5yYW5kb21TdHJpbmcoKVxuICAgIEBtYXJrZXJzQ29udGFpbmVyLmF0dHIoJ2RhdGEtem9vbS1pZCcsIEB6b29tSWQpXG4gICAgIyBzZXQgaW5pdGlhbCBiYWNrZ3JvdW5kIGNvb3JkaW5hdGVzXG4gICAgQGltYWdlUG9zaXRpb24gPVxuICAgICAgbGVmdFB4OiAgICAgICAgIDBcbiAgICAgIHRvcFB4OiAgICAgICAgICAwXG4gICAgICB3aWR0aDogICAgICAgICAgQG1hcmtlcnNDb250YWluZXIud2lkdGgoKVxuICAgICAgaGVpZ2h0OiAgICAgICAgIEBtYXJrZXJzQ29udGFpbmVyLmhlaWdodCgpXG4gICAgICBzY2FsZTogICAgICAgICAgMVxuICAgICAgaW5jcmVtZW50OiAwLjVcbiAgICBAc2V0QmFja2dyb3VuZCgpXG5cbiAgIyB0aGlzIG9ubHkgZ2V0cyBydW4gaWYgdGhlIHVzZXIgc3BlY2lmaWVzIHpvb21hYmxlIC0tXG4gICMgb3RoZXJ3aXNlIHdlIGF0IGxlYXN0IGhhdmUgdGhlIGNsYXNzIGluaXRpYWxpemVkXG4gICMgXG4gIG5ldzogPT5cbiAgICAjIGRyYXcgdGhlIGNvbnRyb2xzIGRpbmt1c1xuICAgIEBjb250YWluZXIucHJlcGVuZCBcIlwiXCJcbiAgICAgIDxkaXYgY2xhc3M9XCJwbGFuaXQtY29udHJvbHNcIj5cbiAgICAgICAgPGEgaHJlZj1cIiNcIiBjbGFzcz1cInpvb21cIiBkYXRhLWFjdGlvbj1cImluXCI+KzwvYT5cbiAgICAgICAgPGEgaHJlZj1cIiNcIiBjbGFzcz1cInpvb21cIiBkYXRhLWFjdGlvbj1cIm91dFwiPi08L2E+XG4gICAgICA8L2Rpdj5cbiAgICBcIlwiXCJcbiAgICBAY29udGFpbmVyLmZpbmQoXCIuem9vbVtkYXRhLWFjdGlvbj0naW4nXVwiKS5jbGljayAoZSkgPT5cbiAgICAgIGUucHJldmVudERlZmF1bHQoKVxuICAgICAgQHpvb21JbigpXG4gICAgQGNvbnRhaW5lci5maW5kKFwiLnpvb21bZGF0YS1hY3Rpb249J291dCddXCIpLmNsaWNrIChlKSA9PlxuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICBAem9vbU91dCgpXG4gICAgIyBiaW5kIGRyYWdnYWJsZSBldmVudHNcbiAgICBAY29udGFpbmVyLm9uKCdkYmxjbGljaycsIEBkYmxjbGljaylcbiAgICBAY29udGFpbmVyLm9uKCdtb3VzZWRvd24nLCBAbW91c2Vkb3duKVxuICAgICQoZG9jdW1lbnQpLm9uKCdtb3VzZW1vdmUnLCBAbW91c2Vtb3ZlKVxuICAgICQoZG9jdW1lbnQpLm9uKCdtb3VzZXVwJywgQG1vdXNldXApXG5cbiAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gQWN0aW9uc1xuXG4gIHNldEJhY2tncm91bmQ6ID0+XG4gICAgQG1hcmtlcnNDb250YWluZXIuY3NzXG4gICAgICBiYWNrZ3JvdW5kUG9zaXRpb246IFwiI3tAaW1hZ2VQb3NpdGlvbi5sZWZ0UHh9cHggI3tAaW1hZ2VQb3NpdGlvbi50b3BQeH1weFwiXG4gICAgICBiYWNrZ3JvdW5kU2l6ZTogXCIje0BpbWFnZVBvc2l0aW9uLnNjYWxlICogMTAwLjB9JVwiXG4gICAgQHNldE1hcmtlcnMoKVxuXG4gIHNldE1hcmtlcnM6ID0+XG4gICAgbWFya2VycyA9ICQoJ2Rpdi5wbGFuaXQtbWFya2VyJylcbiAgICBpZiBtYXJrZXJzLmxlbmd0aCA+IDBcbiAgICAgIGZvciBtYXJrZXIgaW4gbWFya2Vyc1xuICAgICAgICBsZWZ0ID0gKEBpbWdXaWR0aCgpICogKCQobWFya2VyKS5hdHRyKCdkYXRhLXhQYycpIC8gMTAwKSkgKyBcbiAgICAgICAgICBAaW1hZ2VQb3NpdGlvbi5sZWZ0UHggLSAoJChtYXJrZXIpLm91dGVyV2lkdGgoKSAvIDIpXG4gICAgICAgIHRvcCA9IChAaW1nSGVpZ2h0KCkgKiAoJChtYXJrZXIpLmF0dHIoJ2RhdGEteVBjJykgLyAxMDApKSArIFxuICAgICAgICAgIEBpbWFnZVBvc2l0aW9uLnRvcFB4IC0gKCQobWFya2VyKS5vdXRlckhlaWdodCgpIC8gMilcbiAgICAgICAgJChtYXJrZXIpLmNzc1xuICAgICAgICAgIGxlZnQ6IFwiI3tsZWZ0fXB4XCJcbiAgICAgICAgICB0b3A6IFwiI3t0b3B9cHhcIlxuXG4gIHBvc2l0aW9uSW5mb2JveGVzOiA9PlxuICAgIGZvciBtYXJrZXIgaW4gQGNvbnRhaW5lci5maW5kKCcucGxhbml0LW1hcmtlcicpXG4gICAgICBtID0gbmV3IFBsYW5pdC5NYXJrZXIoQGNvbnRhaW5lciwgJChtYXJrZXIpLmF0dHIoJ2RhdGEtbWFya2VyJykpXG4gICAgICBtLnBvc2l0aW9uSW5mb2JveCgpXG4gICAgdHJ1ZVxuXG4gIGNlbnRlck9uOiAoY29vcmRzKSA9PlxuICAgIGlmIGNvb3Jkc1swXSA+PSA1MCB0aGVuIHggPSAxMDAgLSBjb29yZHNbMF0gZWxzZSB4ID0gY29vcmRzWzBdXG4gICAgaWYgY29vcmRzWzFdID49IDUwIHRoZW4geSA9IDEwMCAtIGNvb3Jkc1sxXSBlbHNlIHkgPSBjb29yZHNbMV1cbiAgICB3TWluID0gNTAgKiAoQGNvbnRhaW5lcldpZHRoKCkgLyB4KVxuICAgIGhNaW4gPSA1MCAqIChAY29udGFpbmVySGVpZ2h0KCkgLyB5KVxuICAgIGlmIChAaW1nV2lkdGgoKSA+PSB3TWluKSAmJiAoQGltZ0hlaWdodCgpID49IGhNaW4pXG4gICAgICBAaW1hZ2VQb3NpdGlvbi5sZWZ0UHggPSAtIChcbiAgICAgICAgKEBpbWdXaWR0aCgpICogKGNvb3Jkc1swXSAvIDEwMCkpIC0gKEBjb250YWluZXJXaWR0aCgpIC8gMilcbiAgICAgIClcbiAgICAgIEBpbWFnZVBvc2l0aW9uLnRvcFB4ID0gLSAoXG4gICAgICAgIChAaW1nSGVpZ2h0KCkgKiAoY29vcmRzWzFdIC8gMTAwKSkgLSAoQGNvbnRhaW5lckhlaWdodCgpIC8gMilcbiAgICAgIClcbiAgICAgIEBzZXRCYWNrZ3JvdW5kKClcbiAgICAgICMgaGlkZXMgb3RoZXIgYWN0aXZlIGluZm9ib3hlcywgYnV0IHdpbGwgc3RpbGwgc2hvd1xuICAgICAgIyB0aGlzIGluZm9ib3hcbiAgICAgICQoJy5wbGFuaXQtaW5mb2JveCcpLnJlbW92ZUNsYXNzKCdhY3RpdmUnKVxuICAgIGVsc2VcbiAgICAgIEB6b29tSW4oKVxuICAgICAgQGNlbnRlck9uKGNvb3JkcylcblxuICB6b29tVG86IChsZXZlbCkgPT5cbiAgICBpID0gQGltYWdlUG9zaXRpb24uaW5jcmVtZW50XG4gICAgQGltYWdlUG9zaXRpb24uc2NhbGUgPSAobGV2ZWwgKiBpKSArIDEgKyBpXG4gICAgQHpvb21PdXQoKVxuXG4gICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIENhbGN1bGF0aW9uc1xuXG4gICMgLS0tLS0tLS0tLSBJbWFnZSBXaWR0aFxuXG4gIGltZ1dpZHRoOiA9PlxuICAgIHBhcnNlRmxvYXQoQGltYWdlUG9zaXRpb24ud2lkdGggKiBAaW1hZ2VQb3NpdGlvbi5zY2FsZSlcblxuICB0bXBJbWdXaWR0aDogPT5cbiAgICAoMSArIEBpbWFnZVBvc2l0aW9uLmluY3JlbWVudCkgKiBAaW1hZ2VQb3NpdGlvbi53aWR0aCgpXG5cbiAgaW1nV2lkdGhDbGlja0luY3JlbWVudDogPT5cbiAgICBwYXJzZUZsb2F0KEBpbWFnZVBvc2l0aW9uLndpZHRoICogQGltYWdlUG9zaXRpb24uaW5jcmVtZW50KVxuXG4gIGltZ1dpZHRoU2Nyb2xsSW5jcmVtZW50OiA9PlxuICAgIHBhcnNlRmxvYXQoQGltYWdlUG9zaXRpb24ud2lkdGggKiBAaW1hZ2VQb3NpdGlvbi5zY3JvbGxJbmNyZW1lbnQpXG5cbiAgY29udGFpbmVyV2lkdGg6ID0+XG4gICAgcGFyc2VGbG9hdChAbWFya2Vyc0NvbnRhaW5lci53aWR0aCgpKVxuXG4gICMgLS0tLS0tLS0tLSBMZWZ0IC8gUmlnaHRcblxuICBpbWdPZmZzZXRMZWZ0OiA9PlxuICAgIE1hdGguYWJzKFxuICAgICAgcGFyc2VGbG9hdChAbWFya2Vyc0NvbnRhaW5lci5jc3MoJ2JhY2tncm91bmRQb3NpdGlvbicpLnNwbGl0KCcgJylbMF0pXG4gICAgKVxuXG4gICMgLS0tLS0tLS0tLSBIZWlnaHRcblxuICBpbWdIZWlnaHQ6ID0+XG4gICAgcGFyc2VGbG9hdChAaW1hZ2VQb3NpdGlvbi5oZWlnaHQgKiBAaW1hZ2VQb3NpdGlvbi5zY2FsZSlcblxuICB0bXBJbWdIZWlnaHQ6ID0+XG4gICAgKDEgKyBAaW1hZ2VQb3NpdGlvbi5pbmNyZW1lbnQpICogQGltYWdlUG9zaXRpb24uaGVpZ2h0KClcblxuICBpbWdIZWlnaHRDbGlja0luY3JlbWVudDogPT5cbiAgICBwYXJzZUZsb2F0KEBpbWFnZVBvc2l0aW9uLmhlaWdodCAqIEBpbWFnZVBvc2l0aW9uLmluY3JlbWVudClcblxuICBpbWdIZWlnaHRTY3JvbGxJbmNyZW1lbnQ6ID0+XG4gICAgcGFyc2VGbG9hdChAaW1hZ2VQb3NpdGlvbi5oZWlnaHQgKiBAaW1hZ2VQb3NpdGlvbi5zY3JvbGxJbmNyZW1lbnQpXG5cbiAgY29udGFpbmVySGVpZ2h0OiA9PlxuICAgIHBhcnNlRmxvYXQoQG1hcmtlcnNDb250YWluZXIuaGVpZ2h0KCkpXG5cbiAgIyAtLS0tLS0tLS0tIFRvcCAvIEJvdHRvbVxuXG4gIGltZ09mZnNldFRvcDogPT5cbiAgICBNYXRoLmFicyhcbiAgICAgIHBhcnNlRmxvYXQoQG1hcmtlcnNDb250YWluZXIuY3NzKCdiYWNrZ3JvdW5kUG9zaXRpb24nKS5zcGxpdCgnICcpWzFdKVxuICAgIClcblxuICAjIC0tLS0tLS0tLS0gT3RoZXJcblxuICBnZXRFdmVudENvbnRhaW5lclBvc2l0aW9uOiAoZSkgPT5cbiAgICBsZWZ0OiAoZS5wYWdlWCAtIEBjb250YWluZXIub2Zmc2V0KCkubGVmdCkgLyBAY29udGFpbmVyV2lkdGgoKVxuICAgIHRvcDogIChlLnBhZ2VZIC0gQGNvbnRhaW5lci5vZmZzZXQoKS50b3ApIC8gQGNvbnRhaW5lckhlaWdodCgpXG5cbiAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gRXZlbnRzXG5cbiAgZGJsY2xpY2s6IChlKSA9PlxuICAgIGlmICQoZS50YXJnZXQpLmF0dHIoJ2RhdGEtem9vbS1pZCcpID09IEB6b29tSWRcbiAgICAgIGNsaWNrID0gQGdldEV2ZW50Q29udGFpbmVyUG9zaXRpb24oZSlcbiAgICAgIEB6b29tSW4oJ2NsaWNrJywgY2xpY2subGVmdCwgY2xpY2sudG9wKVxuXG4gIG1vdXNlZG93bjogKGUpID0+XG4gICAgaWYgJChlLnRhcmdldCkuYXR0cignZGF0YS16b29tLWlkJykgPT0gQHpvb21JZFxuICAgICAgQGlzRHJhZ2dpbmcgPSB0cnVlXG4gICAgICBjb29yZHMgPSBAZ2V0RXZlbnRDb250YWluZXJQb3NpdGlvbihlKVxuICAgICAgQGRyYWdDb29yZHMgPSBcbiAgICAgICAgcG9pbnRSZWY6IGNvb3Jkc1xuICAgICAgICBpbWdSZWY6XG4gICAgICAgICAgbGVmdDogMCAtIEBpbWdPZmZzZXRMZWZ0KClcbiAgICAgICAgICB0b3A6IDAgLSBAaW1nT2Zmc2V0VG9wKClcbiAgICAgICAgbWF4OlxuICAgICAgICAgIHJpZ2h0OiAoY29vcmRzLmxlZnQgKiBAY29udGFpbmVyV2lkdGgoKSkgKyBAaW1nT2Zmc2V0TGVmdCgpXG4gICAgICAgICAgbGVmdDogKGNvb3Jkcy5sZWZ0ICogQGNvbnRhaW5lcldpZHRoKCkpIC0gKEBpbWdXaWR0aCgpIC0gXG4gICAgICAgICAgICAgICAgICAgICAgKEBjb250YWluZXJXaWR0aCgpICsgQGltZ09mZnNldExlZnQoKSkpXG4gICAgICAgICAgYm90dG9tOiAoY29vcmRzLnRvcCAqIEBjb250YWluZXJIZWlnaHQoKSkgKyBAaW1nT2Zmc2V0VG9wKClcbiAgICAgICAgICB0b3A6IChjb29yZHMudG9wICogQGNvbnRhaW5lckhlaWdodCgpKSAtIChAaW1nSGVpZ2h0KCkgLSBcbiAgICAgICAgICAgICAgICAgICAgICAoQGNvbnRhaW5lckhlaWdodCgpICsgQGltZ09mZnNldFRvcCgpKSlcbiAgICB0cnVlXG5cbiAgbW91c2Vtb3ZlOiAoZSkgPT5cbiAgICBpZiBAaXNEcmFnZ2luZ1xuICAgICAgY29vcmRzID0gQGdldEV2ZW50Q29udGFpbmVyUG9zaXRpb24oZSlcbiAgICAgIGRyYWdMZWZ0ID0gY29vcmRzLmxlZnQgKiBAY29udGFpbmVyV2lkdGgoKVxuICAgICAgZHJhZ1RvcCA9IGNvb3Jkcy50b3AgKiBAY29udGFpbmVySGVpZ2h0KClcbiAgICAgIGlmIGRyYWdMZWZ0ID49IEBkcmFnQ29vcmRzLm1heC5sZWZ0ICYmIGRyYWdMZWZ0IDw9IEBkcmFnQ29vcmRzLm1heC5yaWdodFxuICAgICAgICBsZWZ0ID0gKGNvb3Jkcy5sZWZ0IC0gQGRyYWdDb29yZHMucG9pbnRSZWYubGVmdCkgKiBAY29udGFpbmVyV2lkdGgoKVxuICAgICAgICBAaW1hZ2VQb3NpdGlvbi5sZWZ0UHggPSBAZHJhZ0Nvb3Jkcy5pbWdSZWYubGVmdCArIGxlZnRcbiAgICAgIGVsc2UgaWYgZHJhZ0xlZnQgPCBAZHJhZ0Nvb3Jkcy5tYXgubGVmdFxuICAgICAgICBAaW1hZ2VQb3NpdGlvbi5sZWZ0UHggPSBAY29udGFpbmVyV2lkdGgoKSAtIEBpbWdXaWR0aCgpXG4gICAgICBlbHNlIGlmIGRyYWdMZWZ0ID4gQGRyYWdDb29yZHMubWF4LnJpZ2h0XG4gICAgICAgIEBpbWFnZVBvc2l0aW9uLmxlZnRQeCA9IDBcbiAgICAgIGlmIGRyYWdUb3AgPj0gQGRyYWdDb29yZHMubWF4LnRvcCAmJiBkcmFnVG9wIDw9IEBkcmFnQ29vcmRzLm1heC5ib3R0b21cbiAgICAgICAgdG9wID0gKGNvb3Jkcy50b3AgLSBAZHJhZ0Nvb3Jkcy5wb2ludFJlZi50b3ApICogQGNvbnRhaW5lckhlaWdodCgpXG4gICAgICAgIEBpbWFnZVBvc2l0aW9uLnRvcFB4ID0gQGRyYWdDb29yZHMuaW1nUmVmLnRvcCArIHRvcFxuICAgICAgZWxzZSBpZiBkcmFnVG9wIDwgQGRyYWdDb29yZHMubWF4LnRvcFxuICAgICAgICBAaW1hZ2VQb3NpdGlvbi50b3BQeCA9IEBjb250YWluZXJIZWlnaHQoKSAtIEBpbWdIZWlnaHQoKVxuICAgICAgZWxzZSBpZiBkcmFnVG9wID4gQGRyYWdDb29yZHMubWF4LmJvdHRvbVxuICAgICAgICBAaW1hZ2VQb3NpdGlvbi50b3BQeCA9IDBcbiAgICAgIEBzZXRCYWNrZ3JvdW5kKClcbiAgICB0cnVlXG5cbiAgbW91c2V1cDogKGUpID0+XG4gICAgQGlzRHJhZ2dpbmcgPSBmYWxzZVxuICAgIEBwb3NpdGlvbkluZm9ib3hlcygpXG4gICAgdHJ1ZVxuXG4gICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIFpvb21pbmdcblxuICB6b29tSW46ID0+XG4gICAgQGltYWdlUG9zaXRpb24uc2NhbGUgID0gQGltYWdlUG9zaXRpb24uc2NhbGUgKyBAaW1hZ2VQb3NpdGlvbi5pbmNyZW1lbnRcbiAgICBAaW1hZ2VQb3NpdGlvbi5sZWZ0UHggPSAtIEBpbWdPZmZzZXRMZWZ0KCkgLSAoQGltZ1dpZHRoQ2xpY2tJbmNyZW1lbnQoKSAvIDIpXG4gICAgQGltYWdlUG9zaXRpb24udG9wUHggID0gLSBAaW1nT2Zmc2V0VG9wKCkgLSAoQGltZ0hlaWdodENsaWNrSW5jcmVtZW50KCkgLyAyKVxuICAgIEBzZXRCYWNrZ3JvdW5kKClcbiAgICBAcG9zaXRpb25JbmZvYm94ZXMoKVxuXG4gIHpvb21PdXQ6ICgpID0+XG4gICAgaWYgQGltYWdlUG9zaXRpb24uc2NhbGUgPiAxXG4gICAgICBAaW1hZ2VQb3NpdGlvbi5zY2FsZSAgPSBAaW1hZ2VQb3NpdGlvbi5zY2FsZSAtIEBpbWFnZVBvc2l0aW9uLmluY3JlbWVudFxuICAgICAgbGVmdFB4ID0gLSBAaW1nT2Zmc2V0TGVmdCgpICsgKEBpbWdXaWR0aENsaWNrSW5jcmVtZW50KCkgLyAyKVxuICAgICAgdG9wUHggID0gLSBAaW1nT2Zmc2V0VG9wKCkgKyAoQGltZ0hlaWdodENsaWNrSW5jcmVtZW50KCkgLyAyKVxuICAgICAgaWYgbGVmdFB4ICsgQGltZ1dpZHRoQ2xpY2tJbmNyZW1lbnQoKSA+IDBcbiAgICAgICAgQGltYWdlUG9zaXRpb24ubGVmdFB4ID0gMFxuICAgICAgZWxzZSBpZiBsZWZ0UHggLSBAaW1nV2lkdGhDbGlja0luY3JlbWVudCgpIDwgQGNvbnRhaW5lcldpZHRoKCkgLSBAaW1nV2lkdGgoKVxuICAgICAgICBAaW1hZ2VQb3NpdGlvbi5sZWZ0UHggPSBAY29udGFpbmVyV2lkdGgoKSAtIEBpbWdXaWR0aCgpXG4gICAgICBpZiB0b3BQeCArIEBpbWdIZWlnaHRDbGlja0luY3JlbWVudCgpID4gMFxuICAgICAgICBAaW1hZ2VQb3NpdGlvbi50b3BQeCA9IDBcbiAgICAgIGVsc2UgaWYgdG9wUHggLSBAaW1nSGVpZ2h0Q2xpY2tJbmNyZW1lbnQoKSA8IEBjb250YWluZXJIZWlnaHQoKSAtIEBpbWdIZWlnaHQoKVxuICAgICAgICBAaW1hZ2VQb3NpdGlvbi50b3BQeCA9IEBjb250YWluZXJIZWlnaHQoKSAtIEBpbWdIZWlnaHQoKVxuICAgICAgQHNldEJhY2tncm91bmQoKVxuICAgICAgQHBvc2l0aW9uSW5mb2JveGVzKClcblxuY2xhc3MgUGxhbml0Lk1hcmtlclxuXG4gIGNvbnN0cnVjdG9yOiAoQGNvbnRhaW5lciwgaWQpIC0+XG5cbiAgICAjIFNldCBPcHRpb25zXG4gICAgQG1hcmtlcnNDb250YWluZXIgPSBAY29udGFpbmVyLmZpbmQoXCIuI3tQbGFuaXQubWFya2VyQ29udGFpbmVyQ2xhc3N9XCIpXG5cbiAgICAjIEZpbmQgTWFya2VyXG4gICAgQG1hcmtlciA9IEBtYXJrZXJzQ29udGFpbmVyLmZpbmQoXG4gICAgICBcIi4je1BsYW5pdC5tYXJrZXJDbGFzc31bZGF0YS1tYXJrZXI9JyN7aWR9J11cIlxuICAgICkuZmlyc3QoKVxuXG4gICAgIyBSZXR1cm4gdGhpc1xuICAgIEBcblxuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBDYWxjdWxhdGlvbnNcblxuICBwb3NpdGlvbjogPT5cbiAgICB4UHggPSBAbWFya2VyLnBvc2l0aW9uKCkubGVmdCArIChAbWFya2VyLm91dGVyV2lkdGgoKSAvIDIpXG4gICAgeVB4ID0gQG1hcmtlci5wb3NpdGlvbigpLnRvcCArIChAbWFya2VyLm91dGVySGVpZ2h0KCkgLyAyKVxuICAgIGlmIEBtYXJrZXJzQ29udGFpbmVyLmNzcygnYmFja2dyb3VuZEltYWdlJylcbiAgICAgIHNjYWxlID0gcGFyc2VJbnQoQG1hcmtlcnNDb250YWluZXIuY3NzKCdiYWNrZ3JvdW5kU2l6ZScpKSAvIDEwMFxuICAgICAgd0ltZyA9IEBjb250YWluZXIud2lkdGgoKSAqIHNjYWxlXG4gICAgICBoSW1nID0gQGNvbnRhaW5lci5oZWlnaHQoKSAqIHNjYWxlXG4gICAgICB4SW1nID0gcGFyc2VJbnQoQG1hcmtlcnNDb250YWluZXIuY3NzKCdiYWNrZ3JvdW5kUG9zaXRpb24nKS5zcGxpdCgnICcpWzBdKVxuICAgICAgeUltZyA9IHBhcnNlSW50KEBtYXJrZXJzQ29udGFpbmVyLmNzcygnYmFja2dyb3VuZFBvc2l0aW9uJykuc3BsaXQoJyAnKVsxXSlcbiAgICAgIHhQYyA9ICgoeFB4ICsgTWF0aC5hYnMoeEltZykpIC8gd0ltZykgKiAxMDBcbiAgICAgIHlQYyA9ICgoeVB4ICsgTWF0aC5hYnMoeUltZykpIC8gaEltZykgKiAxMDBcbiAgICBlbHNlXG4gICAgICB4UGMgPSAoeFB4IC8gQGNvbnRhaW5lci53aWR0aCgpKSAqIDEwMFxuICAgICAgeVBjID0gKHlQeCAvIEBjb250YWluZXIuaGVpZ2h0KCkpICogMTAwXG4gICAgW3hQYywgeVBjXVxuXG4gIHJlbGF0aXZlUG9zaXRpb246ID0+XG4gICAgeFB4ID0gQG1hcmtlci5wb3NpdGlvbigpLmxlZnQgKyAoQG1hcmtlci5vdXRlcldpZHRoKCkgLyAyKVxuICAgIHlQeCA9IEBtYXJrZXIucG9zaXRpb24oKS50b3AgKyAoQG1hcmtlci5vdXRlckhlaWdodCgpIC8gMilcbiAgICB4UGMgPSAoeFB4IC8gQGNvbnRhaW5lci53aWR0aCgpKSAqIDEwMFxuICAgIHlQYyA9ICh5UHggLyBAY29udGFpbmVyLmhlaWdodCgpKSAqIDEwMFxuICAgIFt4UGMsIHlQY11cblxuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBBdHRyaWJ1dGVzXG5cbiAgY29sb3I6ID0+XG4gICAgQG1hcmtlci5jc3MoJ2JhY2tncm91bmRDb2xvcicpXG5cbiAgcGxhbml0SUQ6ID0+XG4gICAgQG1hcmtlci5hdHRyKCdkYXRhLW1hcmtlcicpXG5cbiAgaWQ6ID0+XG4gICAgQG1hcmtlci5hdHRyKCdkYXRhLWlkJylcblxuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBJbmZvYm94XG5cbiAgaW5mb2JveEhUTUw6ID0+XG4gICAgaW5mbyA9IEBtYXJrZXIuZmluZCgnLnBsYW5pdC1pbmZvYm94JylcbiAgICBpZiBpbmZvLmxlbmd0aCA+IDAgdGhlbiBpbmZvLmh0bWwoKSBlbHNlIG51bGxcblxuICBwb3NpdGlvbkluZm9ib3g6ID0+XG4gICAgaW5mb2JveCA9ICQoXCIjI3tAbWFya2VyLmF0dHIoJ2RhdGEtaW5mb2JveCcpfVwiKVxuICAgIG1hcmtlckNlbnRlclggPSAocGFyc2VGbG9hdChAcmVsYXRpdmVQb3NpdGlvbigpWzBdIC8gMTAwKSAqIEBjb250YWluZXIud2lkdGgoKSlcbiAgICBtYXJrZXJDZW50ZXJZID0gKHBhcnNlRmxvYXQoQHJlbGF0aXZlUG9zaXRpb24oKVsxXSAvIDEwMCkgKiBAY29udGFpbmVyLmhlaWdodCgpKVxuICAgIGlXaWR0aCA9IGluZm9ib3gub3V0ZXJXaWR0aCgpXG4gICAgaUhhbGZXaWR0aCA9IGlXaWR0aCAvIDJcbiAgICBpSGVpZ2h0ID0gaW5mb2JveC5vdXRlckhlaWdodCgpXG4gICAgaUhhbGZIZWlnaHQgPSBpSGVpZ2h0IC8gMlxuICAgIGNXaWR0aCA9IEBjb250YWluZXIud2lkdGgoKVxuICAgIGNIZWlnaHQgPSBAY29udGFpbmVyLmhlaWdodCgpXG4gICAgbVdpZHRoID0gQG1hcmtlci5vdXRlcldpZHRoKClcbiAgICBtSGFsZldpZHRoID0gbVdpZHRoIC8gMlxuICAgIG1IZWlnaHQgPSBAbWFya2VyLm91dGVySGVpZ2h0KClcbiAgICBtSGFsZkhlaWdodCA9IG1IZWlnaHQgLyAyXG4gICAgYnVmZmVyID0gNVxuICAgIG9mZnNldFggPSBwYXJzZUludChpbmZvYm94LmF0dHIoJ2RhdGEtb2Zmc2V0LXgnKSlcbiAgICBvZmZzZXRYID0gMCB1bmxlc3Mgb2Zmc2V0WFxuICAgIG9mZnNldFkgPSBwYXJzZUludChpbmZvYm94LmF0dHIoJ2RhdGEtb2Zmc2V0LXknKSlcbiAgICBvZmZzZXRZID0gMCB1bmxlc3Mgb2Zmc2V0WVxuICAgIHN3aXRjaCBpbmZvYm94LmF0dHIoJ2RhdGEtcG9zaXRpb24nKVxuICAgICAgd2hlbiAndG9wJ1xuICAgICAgICBpbmZvTGVmdCA9IG1hcmtlckNlbnRlclggLSBpSGFsZldpZHRoXG4gICAgICAgIGluZm9Ub3AgPSBtYXJrZXJDZW50ZXJZIC0gaUhlaWdodCAtIG1IYWxmSGVpZ2h0IC0gYnVmZmVyXG4gICAgICB3aGVuICdyaWdodCdcbiAgICAgICAgaW5mb0xlZnQgPSBtYXJrZXJDZW50ZXJYICsgbUhhbGZXaWR0aCArIGJ1ZmZlclxuICAgICAgICBpbmZvVG9wID0gbWFya2VyQ2VudGVyWSAtIGlIYWxmSGVpZ2h0XG4gICAgICB3aGVuICdib3R0b20nXG4gICAgICAgIGluZm9MZWZ0ID0gbWFya2VyQ2VudGVyWCAtIGlIYWxmV2lkdGhcbiAgICAgICAgaW5mb1RvcCA9IG1hcmtlckNlbnRlclkgKyBtSGFsZkhlaWdodCArIGJ1ZmZlclxuICAgICAgd2hlbiAnbGVmdCdcbiAgICAgICAgaW5mb0xlZnQgPSBtYXJrZXJDZW50ZXJYIC0gaVdpZHRoIC0gbUhhbGZXaWR0aCAtIGJ1ZmZlclxuICAgICAgICBpbmZvVG9wID0gbWFya2VyQ2VudGVyWSAtIGlIYWxmSGVpZ2h0XG4gICAgICB3aGVuICd0b3AtbGVmdCdcbiAgICAgICAgaW5mb0xlZnQgPSBtYXJrZXJDZW50ZXJYIC0gaVdpZHRoIC0gbUhhbGZXaWR0aCArIGJ1ZmZlclxuICAgICAgICBpbmZvVG9wID0gbWFya2VyQ2VudGVyWSAtIGlIZWlnaHQgLSBtSGFsZkhlaWdodCArIGJ1ZmZlclxuICAgICAgd2hlbiAndG9wLXJpZ2h0J1xuICAgICAgICBpbmZvTGVmdCA9IG1hcmtlckNlbnRlclggKyBtSGFsZldpZHRoIC0gYnVmZmVyXG4gICAgICAgIGluZm9Ub3AgPSBtYXJrZXJDZW50ZXJZIC0gaUhlaWdodCAtIG1IYWxmSGVpZ2h0ICsgYnVmZmVyXG4gICAgICB3aGVuICdib3R0b20tbGVmdCdcbiAgICAgICAgaW5mb0xlZnQgPSBtYXJrZXJDZW50ZXJYIC0gaVdpZHRoIC0gbUhhbGZXaWR0aCArIGJ1ZmZlclxuICAgICAgICBpbmZvVG9wID0gbWFya2VyQ2VudGVyWSArIG1IYWxmSGVpZ2h0IC0gYnVmZmVyXG4gICAgICB3aGVuICdib3R0b20tcmlnaHQnXG4gICAgICAgIGluZm9MZWZ0ID0gbWFya2VyQ2VudGVyWCArIG1IYWxmV2lkdGggLSBidWZmZXJcbiAgICAgICAgaW5mb1RvcCA9IG1hcmtlckNlbnRlclkgKyBtSGFsZkhlaWdodCAtIGJ1ZmZlclxuICAgIGluZm9ib3guY3NzXG4gICAgICBsZWZ0OiBcIiN7aW5mb0xlZnQgKyBvZmZzZXRYfXB4XCJcbiAgICAgIHRvcDogXCIje2luZm9Ub3AgKyBvZmZzZXRZfXB4XCJcbiAgICBAcG9zaXRpb24oKVxuXG4gICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIERyYWdnaW5nXG5cbiAgaXNEcmFnZ2FibGU6ID0+XG4gICAgQG1hcmtlci5oYXNDbGFzcygnZHJhZ2dhYmxlJylcblxuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBBY3Rpb25zXG5cbiAgc2F2ZVBvc2l0aW9uOiA9PlxuICAgIGNvb3JkcyA9IEBwb3NpdGlvbigpXG4gICAgQG1hcmtlci5hdHRyXG4gICAgICAnZGF0YS14UGMnOiBjb29yZHNbMF1cbiAgICAgICdkYXRhLXlQYyc6IGNvb3Jkc1sxXVxuXG4gIHVwZGF0ZTogKG9wdGlvbnMpID0+XG4gICAgaWYgb3B0aW9ucy5jb2xvclxuICAgICAgQG1hcmtlci5jc3MoYmFja2dyb3VuZENvbG9yOiBvcHRpb25zLmNvbG9yKVxuICAgIGlmIG9wdGlvbnMuaW5mb2JveFxuICAgICAgQG1hcmtlci5maW5kKCcucGxhbml0LWluZm9ib3gnKS5odG1sKG9wdGlvbnMuaW5mb2JveClcbiAgICAgIEBwb3NpdGlvbkluZm9ib3goKVxuICAgIGlmIG9wdGlvbnMuZHJhZ2dhYmxlXG4gICAgICBAbWFya2VyLnJlbW92ZUNsYXNzKCdkcmFnZ2FibGUnKVxuICAgICAgQG1hcmtlci5hZGRDbGFzcygnZHJhZ2dhYmxlJykgaWYgb3B0aW9ucy5kcmFnZ2FibGUgPT0gdHJ1ZVxuICAgIGlmIG9wdGlvbnMuY29vcmRzXG4gICAgICBsZWZ0ID0gKChwYXJzZUZsb2F0KG9wdGlvbnMuY29vcmRzWzBdKSAvIDEwMCkgKiBAY29udGFpbmVyLndpZHRoKCkpIC0gMTVcbiAgICAgIHRvcCA9ICgocGFyc2VGbG9hdChvcHRpb25zLmNvb3Jkc1sxXSkgLyAxMDApICogQGNvbnRhaW5lci5oZWlnaHQoKSkgLSAxNVxuICAgICAgQG1hcmtlci5jc3NcbiAgICAgICAgbGVmdDogXCIje2xlZnR9cHhcIlxuICAgICAgICB0b3A6IFwiI3t0b3B9cHhcIlxuXG4gIHJlbW92ZTogPT5cbiAgICBAbWFya2VyLnJlbW92ZSgpXG5cbmNsYXNzIFBsYW5pdC5NYXJrZXIuRXZlbnRzXG5cbiAgY29uc3RydWN0b3I6IChAb3B0aW9ucykgLT5cblxuICAgICMgU2V0IE9wdGlvbnNcbiAgICBAY29udGFpbmVyID0gQG9wdGlvbnMuY29udGFpbmVyXG4gICAgQG1hcmtlcnNDb250YWluZXIgPSBAY29udGFpbmVyLmZpbmQoXCIuI3tQbGFuaXQubWFya2VyQ29udGFpbmVyQ2xhc3N9XCIpXG5cbiAgICAjIEZpbmQgTWFya2VyXG4gICAgQG1hcmtlciA9IEBtYXJrZXJzQ29udGFpbmVyLmZpbmQoXG4gICAgICBcIi4je1BsYW5pdC5tYXJrZXJDbGFzc31bZGF0YS1tYXJrZXI9JyN7QG9wdGlvbnMucGxhbml0SUR9J11cIlxuICAgICkuZmlyc3QoKVxuICAgIEBtYXJrZXJPYmogPSBuZXcgUGxhbml0Lk1hcmtlcihAY29udGFpbmVyLCBAb3B0aW9ucy5wbGFuaXRJRClcblxuICAgICMgRHJhZ2dhYmxlXG4gICAgaWYgQG9wdGlvbnMuZHJhZ2dhYmxlXG4gICAgICBAbWFya2VyLmFkZENsYXNzKCdkcmFnZ2FibGUnKVxuICAgICAgQG1hcmtlci5vbiAnbW91c2Vkb3duJywgKGUpID0+XG4gICAgICAgIGlmIGUud2hpY2ggPT0gMVxuICAgICAgICAgIG1hcmtlciA9ICQoZS50YXJnZXQpLmNsb3Nlc3QoJy5wbGFuaXQtbWFya2VyJylcbiAgICAgICAgICBtYXJrZXIuYWRkQ2xhc3MoJ2lzLWRyYWdnaW5nJylcbiAgICAgICAgICBtYXJrZXIuYXR0clxuICAgICAgICAgICAgJ2RhdGEtZHJhZy1zdGFydC14JzogZS5wYWdlWFxuICAgICAgICAgICAgJ2RhdGEtZHJhZy1zdGFydC15JzogZS5wYWdlWVxuXG4gICAgIyBJbmZvYm94XG4gICAgaWYgQG9wdGlvbnMuaW5mb2JveFxuICAgICAgaWQgPSBQbGFuaXQucmFuZG9tU3RyaW5nKDE2KVxuICAgICAgIyBzZXQgc3R5bGUgb3B0aW9ucyBvbiBpbmZvYm94XG4gICAgICBvcHRpb25zID0gQG9wdGlvbnMuaW5mb2JveFxuICAgICAgaWYgb3B0aW9ucy5wb3NpdGlvbiB0aGVuIHBvc2l0aW9uID0gb3B0aW9ucy5wb3NpdGlvbiBlbHNlIHBvc2l0aW9uID0gJ3RvcCdcbiAgICAgIGlmIG9wdGlvbnMuYXJyb3cgdGhlbiBhcnJvdyA9IHRydWUgZWxzZSBhcnJvdyA9IGZhbHNlXG4gICAgICBpZiBhcnJvdyA9PSB0cnVlIHRoZW4gYXJyb3dDbGFzcyA9ICdhcnJvdycgZWxzZSBhcnJvd0NsYXNzID0gJydcbiAgICAgIGNsYXNzZXMgPSBcInBsYW5pdC1pbmZvYm94ICN7cG9zaXRpb259ICN7YXJyb3dDbGFzc31cIlxuICAgICAgQGNvbnRhaW5lci5maW5kKFwiLiN7UGxhbml0LmluZm9ib3hDb250YWluZXJDbGFzc31cIikuYXBwZW5kIFwiXCJcIlxuICAgICAgICA8ZGl2IGNsYXNzPVwiI3tjbGFzc2VzfVwiIGlkPVwiaW5mby0je2lkfVwiIFxuICAgICAgICAgIGRhdGEtcG9zaXRpb249XCIje3Bvc2l0aW9ufVwiPlxuICAgICAgICAgICAgI3tvcHRpb25zLmh0bWx9XG4gICAgICAgIDwvZGl2PlxuICAgICAgICAgIFwiXCJcIlxuICAgICAgaWYgb3B0aW9ucy5vZmZzZXRYXG4gICAgICAgIEBjb250YWluZXIuZmluZCgnLnBsYW5pdC1pbmZvYm94JykubGFzdCgpLmF0dHJcbiAgICAgICAgICAnZGF0YS1vZmZzZXQteCc6IG9wdGlvbnMub2Zmc2V0WFxuICAgICAgaWYgb3B0aW9ucy5vZmZzZXRZXG4gICAgICAgIEBjb250YWluZXIuZmluZCgnLnBsYW5pdC1pbmZvYm94JykubGFzdCgpLmF0dHJcbiAgICAgICAgICAnZGF0YS1vZmZzZXQteSc6IG9wdGlvbnMub2Zmc2V0WVxuICAgICAgQG1hcmtlci5hdHRyKCdkYXRhLWluZm9ib3gnLCBcImluZm8tI3tpZH1cIilcbiAgICAgIEBtYXJrZXJPYmoucG9zaXRpb25JbmZvYm94KClcbiAgICAgIEBtYXJrZXIuY2xpY2sgKGUpID0+XG4gICAgICAgIGlmKFxuICAgICAgICAgICFAbWFya2VyLmF0dHIoJ2RhdGEtZHJhZy1zdGFydC14JykgfHwgXG4gICAgICAgICAgIUBtYXJrZXIuYXR0cignZGF0YS1kcmFnLXN0YXJ0LXknKSB8fFxuICAgICAgICAgIChcbiAgICAgICAgICAgIE1hdGguYWJzKGUucGFnZVggLSBAbWFya2VyLmF0dHIoJ2RhdGEtZHJhZy1zdGFydC14JykpIDwgMSAmJlxuICAgICAgICAgICAgTWF0aC5hYnMoZS5wYWdlWSAtIEBtYXJrZXIuYXR0cignZGF0YS1kcmFnLXN0YXJ0LXknKSkgPCAxXG4gICAgICAgICAgKVxuICAgICAgICApXG4gICAgICAgICAgbWFya2VyID0gJChlLnRhcmdldCkuY2xvc2VzdCgnLnBsYW5pdC1tYXJrZXInKVxuICAgICAgICAgICQoXCIjI3ttYXJrZXIuYXR0cignZGF0YS1pbmZvYm94Jyl9XCIpLnRvZ2dsZUNsYXNzKCdhY3RpdmUnKVxuXG4gIG1hcmtlcnM6IC0+XG4gICAgQG1hcmtlcnNDb250YWluZXIuZmluZCgnLnBsYW5pdC1tYXJrZXInKVxuXG4gIGRyYWdnaW5nTWFya2VyOiAtPlxuICAgIEBtYXJrZXJzQ29udGFpbmVyLmZpbmQoJy5wbGFuaXQtbWFya2VyLmlzLWRyYWdnaW5nJylcblxuY2xhc3MgUGxhbml0Lk1hcmtlci5DcmVhdG9yXG5cbiAgY29uc3RydWN0b3I6IChAb3B0aW9ucykgLT5cbiAgICAjIFNldCBPcHRpb25zXG4gICAgQGNvbnRhaW5lciA9IEBvcHRpb25zLmNvbnRhaW5lclxuICAgIEBtYXJrZXJzQ29udGFpbmVyID0gQGNvbnRhaW5lci5maW5kKFwiLiN7UGxhbml0Lm1hcmtlckNvbnRhaW5lckNsYXNzfVwiKS5maXJzdCgpXG4gICAgdW5sZXNzIEBvcHRpb25zLnBsYW5pdElEXG4gICAgICBAb3B0aW9ucy5wbGFuaXRJRCA9IFBsYW5pdC5yYW5kb21TdHJpbmcoMjApXG5cbiAgICAjIEFkZCBNYXJrZXJcbiAgICBpZiBAb3B0aW9ucy5jb2xvciB0aGVuIGNvbG9yID0gQG9wdGlvbnMuY29sb3IgZWxzZSBjb2xvciA9ICcjRkM1QjNGJ1xuXG4gICAgbGVmdCA9ICgocGFyc2VGbG9hdChAb3B0aW9ucy5jb29yZHNbMF0pIC8gMTAwKSAqIEBjb250YWluZXIud2lkdGgoKSkgLSAxNVxuICAgIHRvcCA9ICgocGFyc2VGbG9hdChAb3B0aW9ucy5jb29yZHNbMV0pIC8gMTAwKSAqIEBjb250YWluZXIuaGVpZ2h0KCkpIC0gMTVcbiAgICBAbWFya2Vyc0NvbnRhaW5lci5hcHBlbmQoXG4gICAgICAkKCc8ZGl2PjwvZGl2PicpXG4gICAgICAgIC5hZGRDbGFzcygncGxhbml0LW1hcmtlcicpXG4gICAgICAgIC5hdHRyXG4gICAgICAgICAgJ2RhdGEtbWFya2VyJzogQG9wdGlvbnMucGxhbml0SURcbiAgICAgICAgICAnZGF0YS14UGMnOiBAb3B0aW9ucy5jb29yZHNbMF1cbiAgICAgICAgICAnZGF0YS15UGMnOiBAb3B0aW9ucy5jb29yZHNbMV1cbiAgICAgICAgLmNzc1xuICAgICAgICAgIGxlZnQ6IFwiI3tsZWZ0fXB4XCJcbiAgICAgICAgICB0b3A6IFwiI3t0b3B9cHhcIlxuICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogY29sb3JcbiAgICApXG4gICAgbWFya2VyID0gQG1hcmtlcnNDb250YWluZXIuZmluZCgnLnBsYW5pdC1tYXJrZXInKS5sYXN0KClcbiAgICBpZiBAb3B0aW9ucy5pZFxuICAgICAgbWFya2VyLmF0dHIoJ2RhdGEtaWQnOiBAb3B0aW9ucy5pZClcbiAgICBpZiBAb3B0aW9ucy5jbGFzc1xuICAgICAgbWFya2VyLmFkZENsYXNzKEBvcHRpb25zLmNsYXNzKVxuICAgIGlmIEBvcHRpb25zLmh0bWxcbiAgICAgIG1hcmtlci5odG1sKEBvcHRpb25zLmh0bWwpXG4gICAgaWYgQG9wdGlvbnMuc2l6ZVxuICAgICAgbWFya2VyLmNzc1xuICAgICAgICB3aWR0aDogXCIje0BvcHRpb25zLnNpemV9cHhcIlxuICAgICAgICBoZWlnaHQ6IFwiI3tAb3B0aW9ucy5zaXplfXB4XCJcblxuICAgICMgQmluZCBFdmVudHMgKGluIGEgc2VwYXJhdGUgY2xhc3MpXG4gICAgbmV3IFBsYW5pdC5NYXJrZXIuRXZlbnRzKEBvcHRpb25zKVxuXG4gICAgIyBSZXR1cm4gYSBuZXcgaW5zdGFuY2Ugb2YgdGhpcyBtYXJrZXJcbiAgICBuZXcgUGxhbml0Lk1hcmtlcihAY29udGFpbmVyLCBAb3B0aW9ucy5wbGFuaXRJRClcbiJdfQ==