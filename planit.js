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
      if (this.options.image.zoom) {
        new Planit.Plan.Zoomable({
          container: this.container
        });
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
    this.positionInfoboxes = __bind(this.positionInfoboxes, this);
    this.setMarkers = __bind(this.setMarkers, this);
    this.setBackground = __bind(this.setBackground, this);
    this.container = this.options.container;
    this.markersContainer = this.container.find("." + Planit.markerContainerClass);
    this.zoomId = Planit.randomString();
    this.markersContainer.attr('data-zoom-id', this.zoomId);
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
    $(document).on('mouseup', this.mouseup);
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

  Zoomable.prototype.zoomOut = function(left, top) {
    var leftPx, topPx;
    if (left == null) {
      left = 0.5;
    }
    if (top == null) {
      top = 0.5;
    }
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
    var infoBottom, infoLeft, infobox, markerCenterX, markerCenterY;
    infobox = $("#" + (this.marker.attr('data-infobox')));
    markerCenterX = parseFloat(this.relativePosition()[0] / 100) * this.container.width();
    markerCenterY = parseFloat(this.relativePosition()[1] / 100) * this.container.height();
    infoLeft = markerCenterX - (infobox.outerWidth() / 2);
    infoBottom = this.container.height() - markerCenterY + (this.marker.height() / 2) + 5;
    infobox.css({
      left: infoLeft,
      bottom: infoBottom
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
    var id;
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
      this.container.find("." + Planit.infoboxContainerClass).append("<div class=\"planit-infobox\" id=\"info-" + id + "\">" + this.options.infobox + "</div>");
      this.marker.attr('data-infobox', "info-" + id);
      this.markerObj.positionInfobox();
      this.marker.click((function(_this) {
        return function(e) {
          var marker;
          if (Math.abs(e.pageX - _this.marker.attr('data-drag-start-x')) < 1 && Math.abs(e.pageY - _this.marker.attr('data-drag-start-y')) < 1) {
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
    new Planit.Marker.Events(this.options);
    new Planit.Marker(this.container, this.options.planitID);
  }

  return Creator;

})();

//# sourceMappingURL=data:application/json;base64,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WDtBQUNFLE1BQUEsTUFBTSxDQUFDLFFBQVAsQ0FBZ0IsSUFBQyxDQUFBLE9BQU8sQ0FBQyxPQUFELENBQXhCLENBQUEsQ0FERjtLQXpCQTtBQTJCQSxJQUFBLElBQUcsSUFBQyxDQUFBLE9BQU8sQ0FBQyxJQUFaO0FBQ0UsTUFBQSxNQUFNLENBQUMsSUFBUCxDQUFZLElBQUMsQ0FBQSxPQUFPLENBQUMsSUFBckIsQ0FBQSxDQURGO0tBM0JBO0FBQUEsSUErQkksSUFBQSxNQUFNLENBQUMsTUFBTSxDQUFDLE1BQWQsQ0FBcUIsSUFBQyxDQUFBLE9BQXRCLENBL0JKLENBQUE7QUFBQSxJQWtDSSxJQUFBLE1BQU0sQ0FBQyxNQUFQLENBQWMsSUFBQyxDQUFBLFNBQWYsRUFBMEIsSUFBQyxDQUFBLE9BQU8sQ0FBQyxRQUFuQyxDQWxDSixDQUZXO0VBQUEsQ0FBYjs7aUJBQUE7O0lBam1CRixDQUFBIiwiZmlsZSI6InBsYW5pdC10bXAuanMiLCJzb3VyY2VSb290IjoiL3NvdXJjZS8iLCJzb3VyY2VzQ29udGVudCI6WyJjbGFzcyBQbGFuaXRcblxuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBSZWZzXG5cbiAgQGNvbnRhaW5lckNsYXNzOiAgICAgICAgJ3BsYW5pdC1jb250YWluZXInXG4gIEBtYXJrZXJDb250YWluZXJDbGFzczogICdwbGFuaXQtbWFya2Vycy1jb250YWluZXInXG4gIEBtYXJrZXJDbGFzczogICAgICAgICAgICdwbGFuaXQtbWFya2VyJ1xuICBAbWFya2VyQ29udGVudENsYXNzOiAgICAncGxhbml0LW1hcmtlci1jb250ZW50J1xuICBAaW5mb2JveENvbnRhaW5lckNsYXNzOiAncGxhbml0LWluZm9ib3gtY29udGFpbmVyJ1xuXG4gICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIERlZmF1bHQgT3B0aW9uc1xuXG4gIG5ldzogKEBvcHRpb25zID0ge30pIC0+XG4gICAgIyBTZXQgT3B0aW9uc1xuICAgIGlmIEBvcHRpb25zLmNvbnRhaW5lclxuICAgICAgQG9wdGlvbnMuY29udGFpbmVyID0gJChcIiMje0BvcHRpb25zLmNvbnRhaW5lcn1cIilcbiAgICBlbHNlXG4gICAgICBAb3B0aW9ucy5jb250YWluZXIgPSAkKCcjcGxhbml0JykgXG5cbiAgICAjIEluaXRpYWxpemUgQ29udGFpbmVyXG4gICAgQG9wdGlvbnMuY29udGFpbmVyLmFkZENsYXNzKCdwbGFuaXQtY29udGFpbmVyJylcbiAgICBAb3B0aW9ucy5jb250YWluZXIuYXBwZW5kIFwiXCJcIlxuICAgICAgPGRpdiBjbGFzcz1cIiN7UGxhbml0LmluZm9ib3hDb250YWluZXJDbGFzc31cIj48L2Rpdj5cbiAgICAgIDxkaXYgY2xhc3M9XCIje1BsYW5pdC5tYXJrZXJDb250YWluZXJDbGFzc31cIj48L2Rpdj5cbiAgICAgICAgXCJcIlwiXG5cbiAgICAjIFJlZnNcbiAgICBAY29udGFpbmVyID0gQG9wdGlvbnMuY29udGFpbmVyXG4gICAgQG1hcmtlcnNDb250YWluZXIgPSBAY29udGFpbmVyLmZpbmQoXCIuI3tQbGFuaXQubWFya2VyQ29udGFpbmVyQ2xhc3N9XCIpLmZpcnN0KClcblxuICAgICMgQWRkIGltYWdlIGFuZCB6b29tIChpZiBuZWNlc3NhcnkpXG4gICAgaWYgQG9wdGlvbnMuaW1hZ2UgJiYgQG9wdGlvbnMuaW1hZ2UudXJsXG4gICAgICBAY29udGFpbmVyLmFwcGVuZChcIlwiXCI8aW1nIHNyYz1cIiN7QG9wdGlvbnMuaW1hZ2UudXJsfVwiPlwiXCJcIilcbiAgICAgIEBtYXJrZXJzQ29udGFpbmVyLmNzc1xuICAgICAgICBiYWNrZ3JvdW5kSW1hZ2U6IFwidXJsKCcje0BvcHRpb25zLmltYWdlLnVybH0nKVwiXG4gICAgICBAaW5pdEJhY2tncm91bmRJbWFnZSgpXG5cbiAgICAjIEFkZCBNYXJrZXJzIChpZiBuZWNlc3NhcnkpXG4gICAgaWYgQG9wdGlvbnMubWFya2VycyAmJiBAb3B0aW9ucy5tYXJrZXJzLmxlbmd0aCA+IDBcbiAgICAgIEBpbml0TWFya2VycygpXG5cbiAgICAjIEJpbmQgRG9jdW1lbnQgRXZlbnRzXG4gICAgbmV3IFBsYW5pdC5QbGFuLkV2ZW50c1xuICAgICAgY29udGFpbmVyOiBAY29udGFpbmVyXG4gICAgICBwbGFuaXQ6IEBcblxuICAgICMgUmV0dXJuIHRoaXMgUGxhbml0IG9iamVjdFxuICAgIEBcblxuICBpbml0QmFja2dyb3VuZEltYWdlOiA9PlxuICAgIGltZyA9IEBjb250YWluZXIuZmluZCgnaW1nJykuZmlyc3QoKVxuICAgIGltZ0hlaWdodCA9IGltZy5oZWlnaHQoKVxuICAgIGlmIGltZ0hlaWdodCA+IDAgJiYgaW1nLndpZHRoKCkgPiAwXG4gICAgICBAY29udGFpbmVyLmNzc1xuICAgICAgICBoZWlnaHQ6IGltZ0hlaWdodFxuICAgICAgaW1nLnJlbW92ZSgpXG4gICAgICBpZiBAb3B0aW9ucy5pbWFnZS56b29tXG4gICAgICAgIG5ldyBQbGFuaXQuUGxhbi5ab29tYWJsZVxuICAgICAgICAgIGNvbnRhaW5lcjogQGNvbnRhaW5lclxuICAgICAgQGltZ0xvYWRlZCA9IHRydWVcbiAgICBlbHNlXG4gICAgICBzZXRUaW1lb3V0KEBpbml0QmFja2dyb3VuZEltYWdlLCAyNTApXG5cbiAgaW5pdE1hcmtlcnM6ID0+XG4gICAgaWYgQG9wdGlvbnMuaW1hZ2UgJiYgQG9wdGlvbnMuaW1hZ2UudXJsXG4gICAgICBpZiBAaW1nTG9hZGVkID09IHRydWVcbiAgICAgICAgQGFkZE1hcmtlcihtYXJrZXIpIGZvciBtYXJrZXIgaW4gQG9wdGlvbnMubWFya2Vyc1xuICAgICAgZWxzZVxuICAgICAgICBzZXRUaW1lb3V0KEBpbml0TWFya2VycywgMjUwKVxuICAgIGVsc2VcbiAgICAgIEBhZGRNYXJrZXIobWFya2VyKSBmb3IgbWFya2VyIGluIEBvcHRpb25zLm1hcmtlcnNcblxuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBBZGQgQSBNYXJrZXJcblxuICBhZGRNYXJrZXI6IChvcHRpb25zKSA9PlxuICAgIG9wdGlvbnMuY29udGFpbmVyID0gQGNvbnRhaW5lclxuICAgIG5ldyBQbGFuaXQuTWFya2VyLkNyZWF0b3Iob3B0aW9ucylcblxuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBSZXRyaWV2ZSBEYXRhXG5cbiAgZ2V0TWFya2VyOiAoaWQpID0+XG4gICAgbmV3IFBsYW5pdC5NYXJrZXIoQGNvbnRhaW5lciwgaWQpXG5cbiAgZ2V0QWxsTWFya2VyczogKCkgPT5cbiAgICBwbGFuID0gbmV3IFBsYW5pdC5QbGFuKEBjb250YWluZXIpXG4gICAgcGxhbi5nZXRBbGxNYXJrZXJzKClcblxuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBFdmVudCBDYWxsYmFja3NcblxuICBtYXJrZXJEcmFnRW5kOiAoZXZlbnQsIG1hcmtlcikgPT5cbiAgICBpZiBAb3B0aW9ucy5tYXJrZXJEcmFnRW5kXG4gICAgICBAb3B0aW9ucy5tYXJrZXJEcmFnRW5kKGV2ZW50LCBtYXJrZXIpXG5cbiAgbWFya2VyQ2xpY2s6IChldmVudCwgbWFya2VyKSA9PlxuICAgIGlmIEBvcHRpb25zLm1hcmtlckNsaWNrXG4gICAgICBAb3B0aW9ucy5tYXJrZXJDbGljayhldmVudCwgbWFya2VyKVxuXG4gIGNhbnZhc0NsaWNrOiAoZXZlbnQsIGNvb3JkcykgPT5cbiAgICBpZiBAb3B0aW9ucy5jYW52YXNDbGlja1xuICAgICAgQG9wdGlvbnMuY2FudmFzQ2xpY2soZXZlbnQsIGNvb3JkcylcblxuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBDbGFzcyBNZXRob2RzXG5cbiAgQHJhbmRvbVN0cmluZzogKGxlbmd0aCA9IDE2KSAtPlxuICAgIHN0ciA9IE1hdGgucmFuZG9tKCkudG9TdHJpbmcoMzYpLnNsaWNlKDIpIFxuICAgIHN0ciA9IHN0ciArIE1hdGgucmFuZG9tKCkudG9TdHJpbmcoMzYpLnNsaWNlKDIpXG4gICAgc3RyLnN1YnN0cmluZygwLCBsZW5ndGggLSAxKVxuXG4jIHNldCB0aGlzIGNsYXNzIHRvIGEgZ2xvYmFsIGBwbGFuaXRgIHZhcmlhYmxlXG53aW5kb3cucGxhbml0ID0gbmV3IFBsYW5pdFxuXG5jbGFzcyBQbGFuaXQuUGxhblxuXG4gICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIFNldHVwXG5cbiAgY29uc3RydWN0b3I6IChAY29udGFpbmVyKSAtPlxuICAgIEBtYXJrZXJzQ29udGFpbmVyID0gQGNvbnRhaW5lci5maW5kKFwiLiN7UGxhbml0Lm1hcmtlckNvbnRhaW5lckNsYXNzfVwiKS5maXJzdCgpXG5cbiAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gR2V0IEFsbCBNYXJrZXJzXG5cbiAgZ2V0QWxsTWFya2VyczogKCkgPT5cbiAgICBtYXJrZXJzID0gW11cbiAgICBmb3IgbWFya2VyIGluIEBtYXJrZXJzQ29udGFpbmVyLmZpbmQoJy5wbGFuaXQtbWFya2VyJylcbiAgICAgIG0gPSBuZXcgUGxhbml0Lk1hcmtlcihAY29udGFpbmVyLCAkKG1hcmtlcikuYXR0cignZGF0YS1tYXJrZXInKSlcbiAgICAgIG1hcmtlciA9XG4gICAgICAgICMgY29vcmRzOiBbbS5wb3NpdGlvbigpLmxlZnQsIG0ucG9zaXRpb24oKS50b3BdXG4gICAgICAgIGNvb3JkczogbS5wb3NpdGlvbigpXG4gICAgICAgIGRyYWdnYWJsZTogbS5pc0RyYWdnYWJsZSgpXG4gICAgICAgIGNvbG9yOiBtLmNvbG9yKClcbiAgICAgIG1hcmtlci5pbmZvYm94ID0gbS5pbmZvYm94SFRNTCgpIGlmIG0uaW5mb2JveEhUTUwoKVxuICAgICAgbWFya2Vycy5wdXNoKG1hcmtlcilcbiAgICBtYXJrZXJzXG5cbmNsYXNzIFBsYW5pdC5QbGFuLkV2ZW50c1xuXG4gICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIFNldHVwXG5cbiAgY29uc3RydWN0b3I6IChAb3B0aW9ucykgLT5cblxuICAgICMgZGVmYXVsdCBvcHRpb25zXG4gICAgQGNvbnRhaW5lciA9IEBvcHRpb25zLmNvbnRhaW5lclxuICAgIEBtYXJrZXJzQ29udGFpbmVyID0gQGNvbnRhaW5lci5maW5kKFwiLiN7UGxhbml0Lm1hcmtlckNvbnRhaW5lckNsYXNzfVwiKVxuXG4gICAgIyBiaW5kIGRyYWdnYWJsZSBldmVudHNcbiAgICAkKGRvY3VtZW50KS5vbignbW91c2Vtb3ZlJywgQG1vdXNlbW92ZSlcbiAgICAkKGRvY3VtZW50KS5vbignbW91c2V1cCcsIEBtb3VzZXVwKVxuXG4gICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIFJlZnNcblxuICBtYXJrZXJzOiA9PlxuICAgIEBtYXJrZXJzQ29udGFpbmVyLmZpbmQoJy5wbGFuaXQtbWFya2VyJylcblxuICBkcmFnZ2luZ01hcmtlcjogPT5cbiAgICBAbWFya2Vyc0NvbnRhaW5lci5maW5kKCcucGxhbml0LW1hcmtlci5pcy1kcmFnZ2luZycpXG5cbiAgZ2V0RXZlbnRQb3NpdGlvbjogKGUpID0+XG4gICAgIyBjb250YWluZXIgZGltZW5zaW9uc1xuICAgIHdDb250ID0gcGFyc2VGbG9hdChAbWFya2Vyc0NvbnRhaW5lci53aWR0aCgpKVxuICAgIGhDb250ID0gcGFyc2VGbG9hdChAbWFya2Vyc0NvbnRhaW5lci5oZWlnaHQoKSlcbiAgICBpZihcbiAgICAgIEBtYXJrZXJzQ29udGFpbmVyLmNzcygnYmFja2dyb3VuZEltYWdlJykgJiZcbiAgICAgIEBtYXJrZXJzQ29udGFpbmVyLmNzcygnYmFja2dyb3VuZEltYWdlJykgIT0gJ25vbmUnXG4gICAgKVxuICAgICAgIyBpZiB0aGVyZSBpcyBhbiBpbWFnZSwgd2UgbmVlZCB0byBjYWxjdWxhdGUgd2l0aCBpbWFnZSBpbiBtaW5kXG4gICAgICB4UHggPSBlLnBhZ2VYIC0gQGNvbnRhaW5lci5vZmZzZXQoKS5sZWZ0XG4gICAgICB5UHggPSBlLnBhZ2VZIC0gQGNvbnRhaW5lci5vZmZzZXQoKS50b3BcbiAgICAgIHNjYWxlID0gcGFyc2VJbnQoQG1hcmtlcnNDb250YWluZXIuY3NzKCdiYWNrZ3JvdW5kU2l6ZScpKSAvIDEwMFxuICAgICAgd0ltZyA9IEBjb250YWluZXIud2lkdGgoKSAqIHNjYWxlXG4gICAgICBoSW1nID0gQGNvbnRhaW5lci5oZWlnaHQoKSAqIHNjYWxlXG4gICAgICB4SW1nID0gcGFyc2VJbnQoQG1hcmtlcnNDb250YWluZXIuY3NzKCdiYWNrZ3JvdW5kUG9zaXRpb24nKS5zcGxpdCgnICcpWzBdKVxuICAgICAgeUltZyA9IHBhcnNlSW50KEBtYXJrZXJzQ29udGFpbmVyLmNzcygnYmFja2dyb3VuZFBvc2l0aW9uJykuc3BsaXQoJyAnKVsxXSlcbiAgICAgIHhQYyA9ICgoeFB4ICsgTWF0aC5hYnMoeEltZykpIC8gd0ltZykgKiAxMDBcbiAgICAgIHlQYyA9ICgoeVB4ICsgTWF0aC5hYnMoeUltZykpIC8gaEltZykgKiAxMDBcbiAgICBlbHNlXG4gICAgICAjIG9yIHdlIGNhbiBqdXN0IGxvb2sgYXQgdGhlIGNvbnRhaW5lclxuICAgICAgeFBjID0gKGUucGFnZVggLSBAY29udGFpbmVyLm9mZnNldCgpLmxlZnQpIC8gd0NvbnRcbiAgICAgIHlQYyA9ICAoZS5wYWdlWSAtIEBjb250YWluZXIub2Zmc2V0KCkudG9wKSAvIGhDb250XG4gICAgW3hQYywgeVBjXVxuXG4gICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIEV2ZW50c1xuXG4gIG1vdXNldXA6IChlKSA9PlxuICAgICMgZGVhbGluZyB3aXRoIG1hcmtlcnMsIGVzcC4gZHJhZ2dpbmcgbWFya2Vyc1xuICAgIG1hcmtlciA9IEBtYXJrZXJzQ29udGFpbmVyLmZpbmQoJy5pcy1kcmFnZ2luZycpLmZpcnN0KClcbiAgICBpZiBAZHJhZ2dpbmdNYXJrZXIoKS5sZW5ndGggPiAwXG4gICAgICBtID0gbmV3IFBsYW5pdC5NYXJrZXIoQGNvbnRhaW5lciwgbWFya2VyLmF0dHIoJ2RhdGEtbWFya2VyJykpXG4gICAgICBAb3B0aW9ucy5wbGFuaXQubWFya2VyRHJhZ0VuZChlLCBtKVxuICAgICAgbS5zYXZlUG9zaXRpb24oKVxuICAgICAgbS5wb3NpdGlvbkluZm9ib3goKVxuICAgICAgQGRyYWdnaW5nTWFya2VyKCkucmVtb3ZlQ2xhc3MoJ2lzLWRyYWdnaW5nJylcbiAgICAjIGlmIGNsaWNrIGlzIG9uIHRoZSBjb250YWluZXJcbiAgICBpZiAkKGUudGFyZ2V0KS5oYXNDbGFzcyhQbGFuaXQubWFya2VyQ29udGFpbmVyQ2xhc3MpXG4gICAgICBAb3B0aW9ucy5wbGFuaXQuY2FudmFzQ2xpY2soZSwgQGdldEV2ZW50UG9zaXRpb24oZSkpXG4gICAgIyBpZiBjbGljayBpcyBvbiB0aGUgbWFya2Vyc1xuICAgIGlmKFxuICAgICAgJChlLnRhcmdldCkuaGFzQ2xhc3MoUGxhbml0Lm1hcmtlckNsYXNzKSB8fCBcbiAgICAgICQoZS50YXJnZXQpLnBhcmVudHMoXCIuI3tQbGFuaXQubWFya2VyQ2xhc3N9XCIpLmxlbmd0aCA+IDBcbiAgICApXG4gICAgICBpZiAkKGUudGFyZ2V0KS5oYXNDbGFzcyhQbGFuaXQubWFya2VyQ2xhc3MpXG4gICAgICAgIG1hcmtlciA9ICQoZS50YXJnZXQpXG4gICAgICBlbHNlXG4gICAgICAgIG1hcmtlciA9ICQoZS50YXJnZXQpLnBhcmVudHMoXCIuI3tQbGFuaXQubWFya2VyQ2xhc3N9XCIpLmZpcnN0KClcbiAgICAgIG0gPSBuZXcgUGxhbml0Lk1hcmtlcihAY29udGFpbmVyLCBtYXJrZXIuYXR0cignZGF0YS1tYXJrZXInKSlcbiAgICAgIEBvcHRpb25zLnBsYW5pdC5tYXJrZXJDbGljayhlLCBtKVxuICAgIHRydWVcblxuICBtb3VzZW1vdmU6IChlKSA9PlxuICAgIG1hcmtlcnMgPSBAbWFya2Vyc0NvbnRhaW5lci5maW5kKCcucGxhbml0LW1hcmtlci5pcy1kcmFnZ2luZycpXG5cbiAgICBpZiBtYXJrZXJzLmxlbmd0aCA+IDBcblxuICAgICAgIyBvbmx5IHVzZSBmaXJzdCBtYXJrZXIgaW4gY2FzZSB0aGVyZSBhcmUgbW9yZSB0aGFuXG4gICAgICAjIG9uZSBkcmFnZ2luZ1xuICAgICAgIyBcbiAgICAgIG1hcmtlciA9IG1hcmtlcnMuZmlyc3QoKVxuXG4gICAgICAjIHdlIGhpZGUgdGhlIGluZm9ib3ggd2hpbGUgZHJhZ2dpbmdcbiAgICAgICMgXG4gICAgICBpZihcbiAgICAgICAgTWF0aC5hYnMoZS5wYWdlWCAtIG1hcmtlci5hdHRyKCdkYXRhLWRyYWctc3RhcnQteCcpKSA+IDAgfHwgXG4gICAgICAgIE1hdGguYWJzKGUucGFnZVkgLSBtYXJrZXIuYXR0cignZGF0YS1kcmFnLXN0YXJ0LXknKSkgPiAwXG4gICAgICApXG4gICAgICAgICQoXCIjI3ttYXJrZXIuYXR0cignZGF0YS1pbmZvYm94Jyl9XCIpLnJlbW92ZUNsYXNzKCdhY3RpdmUnKVxuXG4gICAgICAjIGNhbGN1bGF0ZSBwb3NpdGlvbnNcbiAgICAgICMgXG4gICAgICBtb3VzZUxlZnQgICAgID0gZS5wYWdlWCAtIEBjb250YWluZXIub2Zmc2V0KCkubGVmdFxuICAgICAgbW91c2VUb3AgICAgICA9IGUucGFnZVkgLSBAY29udGFpbmVyLm9mZnNldCgpLnRvcFxuICAgICAgcGxhblJpZ2h0ICAgICA9IEBjb250YWluZXIud2lkdGgoKVxuICAgICAgcGxhbkJvdHRvbSAgICA9IEBjb250YWluZXIuaGVpZ2h0KClcbiAgICAgIG1hcmtlckxlZnQgICAgPSBtb3VzZUxlZnQgLSAobWFya2VyLm91dGVyV2lkdGgoKSAvIDIpXG4gICAgICBtYXJrZXJUb3AgICAgID0gbW91c2VUb3AgLSAobWFya2VyLm91dGVySGVpZ2h0KCkgLyAyKVxuICAgICAgbWFya2VyUmlnaHQgICA9IG1vdXNlTGVmdCArIChtYXJrZXIub3V0ZXJXaWR0aCgpIC8gMilcbiAgICAgIG1hcmtlckJvdHRvbSAgPSBtb3VzZVRvcCArIChtYXJrZXIub3V0ZXJIZWlnaHQoKSAvIDIpXG4gICAgICBtYXJrZXJXaWR0aCAgID0gbWFya2VyLm91dGVyV2lkdGgoKVxuICAgICAgbWFya2VySGVpZ2h0ICA9IG1hcmtlci5vdXRlckhlaWdodCgpXG5cbiAgICAgICMgZmluZCB0aGUgbGVmdCBwb3NpdGlvbiBvZiB0aGUgbWFya2VyIGJhc2VkIG9uXG4gICAgICAjIHBvc2l0aW9uIG9mIHRoZSBtb3VzZSByZWxhdGl2ZSB0byB0aGUgcGxhblxuICAgICAgIyBcbiAgICAgIGlmIG1hcmtlckxlZnQgPD0gMFxuICAgICAgICBtYXJrZXJYID0gMFxuICAgICAgZWxzZSBpZiBtYXJrZXJSaWdodCA8IHBsYW5SaWdodFxuICAgICAgICBtYXJrZXJYID0gbWFya2VyTGVmdFxuICAgICAgZWxzZVxuICAgICAgICBtYXJrZXJYID0gcGxhblJpZ2h0IC0gbWFya2VyV2lkdGhcblxuICAgICAgIyBmaW5kIHRoZSBsZWZ0IHBvc2l0aW9uIG9mIHRoZSBtYXJrZXIgYmFzZWQgb25cbiAgICAgICMgcG9zaXRpb24gb2YgdGhlIG1vdXNlIHJlbGF0aXZlIHRvIHRoZSBwbGFuXG4gICAgICAjIFxuICAgICAgaWYgbWFya2VyVG9wIDw9IDBcbiAgICAgICAgbWFya2VyWSA9IDBcbiAgICAgIGVsc2UgaWYgbWFya2VyQm90dG9tIDwgcGxhbkJvdHRvbVxuICAgICAgICBtYXJrZXJZID0gbWFya2VyVG9wXG4gICAgICBlbHNlXG4gICAgICAgIG1hcmtlclkgPSBwbGFuQm90dG9tIC0gbWFya2VySGVpZ2h0XG5cbiAgICAgICMgc2V0IHRoZSBwb3NpdGlvbiBvZiB0aGUgbWFya2VyXG4gICAgICAjIFxuICAgICAgbWFya2VyLmNzc1xuICAgICAgICBsZWZ0OiBtYXJrZXJYXG4gICAgICAgIHRvcDogbWFya2VyWVxuXG5jbGFzcyBQbGFuaXQuUGxhbi5ab29tYWJsZVxuXG4gICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIFNldHVwXG5cbiAgY29uc3RydWN0b3I6IChAb3B0aW9ucykgLT5cbiAgICAjIGRlZmF1bHQgb3B0aW9uc1xuICAgIEBjb250YWluZXIgPSBAb3B0aW9ucy5jb250YWluZXJcbiAgICBAbWFya2Vyc0NvbnRhaW5lciA9IEBjb250YWluZXIuZmluZChcIi4je1BsYW5pdC5tYXJrZXJDb250YWluZXJDbGFzc31cIilcbiAgICBAem9vbUlkID0gUGxhbml0LnJhbmRvbVN0cmluZygpXG4gICAgQG1hcmtlcnNDb250YWluZXIuYXR0cignZGF0YS16b29tLWlkJywgQHpvb21JZClcbiAgICAjIGRyYXcgdGhlIGNvbnRyb2xzIGRpbmt1c1xuICAgIEBjb250YWluZXIucHJlcGVuZCBcIlwiXCJcbiAgICAgIDxkaXYgY2xhc3M9XCJwbGFuaXQtY29udHJvbHNcIj5cbiAgICAgICAgPGEgaHJlZj1cIiNcIiBjbGFzcz1cInpvb21cIiBkYXRhLWFjdGlvbj1cImluXCI+KzwvYT5cbiAgICAgICAgPGEgaHJlZj1cIiNcIiBjbGFzcz1cInpvb21cIiBkYXRhLWFjdGlvbj1cIm91dFwiPi08L2E+XG4gICAgICA8L2Rpdj5cbiAgICBcIlwiXCJcbiAgICBAY29udGFpbmVyLmZpbmQoXCIuem9vbVtkYXRhLWFjdGlvbj0naW4nXVwiKS5jbGljayAoZSkgPT5cbiAgICAgIGUucHJldmVudERlZmF1bHQoKVxuICAgICAgQHpvb21JbigpXG4gICAgQGNvbnRhaW5lci5maW5kKFwiLnpvb21bZGF0YS1hY3Rpb249J291dCddXCIpLmNsaWNrIChlKSA9PlxuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICBAem9vbU91dCgpXG4gICAgIyBiaW5kIGRyYWdnYWJsZSBldmVudHNcbiAgICBAY29udGFpbmVyLm9uKCdkYmxjbGljaycsIEBkYmxjbGljaylcbiAgICBAY29udGFpbmVyLm9uKCdtb3VzZWRvd24nLCBAbW91c2Vkb3duKVxuICAgICQoZG9jdW1lbnQpLm9uKCdtb3VzZW1vdmUnLCBAbW91c2Vtb3ZlKVxuICAgICQoZG9jdW1lbnQpLm9uKCdtb3VzZXVwJywgQG1vdXNldXApXG4gICAgIyBzZXQgaW5pdGlhbCBiYWNrZ3JvdW5kIGNvb3JkaW5hdGVzXG4gICAgQGltYWdlUG9zaXRpb24gPVxuICAgICAgbGVmdFB4OiAgICAgICAgIDBcbiAgICAgIHRvcFB4OiAgICAgICAgICAwXG4gICAgICB3aWR0aDogICAgICAgICAgQG1hcmtlcnNDb250YWluZXIud2lkdGgoKVxuICAgICAgaGVpZ2h0OiAgICAgICAgIEBtYXJrZXJzQ29udGFpbmVyLmhlaWdodCgpXG4gICAgICBzY2FsZTogICAgICAgICAgMVxuICAgICAgaW5jcmVtZW50OiAwLjVcbiAgICBAc2V0QmFja2dyb3VuZCgpXG5cbiAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gQWN0aW9uc1xuXG4gIHNldEJhY2tncm91bmQ6ID0+XG4gICAgQG1hcmtlcnNDb250YWluZXIuY3NzXG4gICAgICBiYWNrZ3JvdW5kUG9zaXRpb246IFwiI3tAaW1hZ2VQb3NpdGlvbi5sZWZ0UHh9cHggI3tAaW1hZ2VQb3NpdGlvbi50b3BQeH1weFwiXG4gICAgICBiYWNrZ3JvdW5kU2l6ZTogXCIje0BpbWFnZVBvc2l0aW9uLnNjYWxlICogMTAwLjB9JVwiXG4gICAgQHNldE1hcmtlcnMoKVxuXG4gIHNldE1hcmtlcnM6ID0+XG4gICAgbWFya2VycyA9ICQoJ2Rpdi5wbGFuaXQtbWFya2VyJylcbiAgICBpZiBtYXJrZXJzLmxlbmd0aCA+IDBcbiAgICAgIGZvciBtYXJrZXIgaW4gbWFya2Vyc1xuICAgICAgICBsZWZ0ID0gKEBpbWdXaWR0aCgpICogKCQobWFya2VyKS5hdHRyKCdkYXRhLXhQYycpIC8gMTAwKSkgKyBcbiAgICAgICAgICBAaW1hZ2VQb3NpdGlvbi5sZWZ0UHggLSAoJChtYXJrZXIpLm91dGVyV2lkdGgoKSAvIDIpXG4gICAgICAgIHRvcCA9IChAaW1nSGVpZ2h0KCkgKiAoJChtYXJrZXIpLmF0dHIoJ2RhdGEteVBjJykgLyAxMDApKSArIFxuICAgICAgICAgIEBpbWFnZVBvc2l0aW9uLnRvcFB4IC0gKCQobWFya2VyKS5vdXRlckhlaWdodCgpIC8gMilcbiAgICAgICAgJChtYXJrZXIpLmNzc1xuICAgICAgICAgIGxlZnQ6IFwiI3tsZWZ0fXB4XCJcbiAgICAgICAgICB0b3A6IFwiI3t0b3B9cHhcIlxuXG4gIHBvc2l0aW9uSW5mb2JveGVzOiA9PlxuICAgIGZvciBtYXJrZXIgaW4gQGNvbnRhaW5lci5maW5kKCcucGxhbml0LW1hcmtlcicpXG4gICAgICBtID0gbmV3IFBsYW5pdC5NYXJrZXIoQGNvbnRhaW5lciwgJChtYXJrZXIpLmF0dHIoJ2RhdGEtbWFya2VyJykpXG4gICAgICBtLnBvc2l0aW9uSW5mb2JveCgpXG4gICAgdHJ1ZVxuXG4gICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIENhbGN1bGF0aW9uc1xuXG4gICMgLS0tLS0tLS0tLSBJbWFnZSBXaWR0aFxuXG4gIGltZ1dpZHRoOiA9PlxuICAgIHBhcnNlRmxvYXQoQGltYWdlUG9zaXRpb24ud2lkdGggKiBAaW1hZ2VQb3NpdGlvbi5zY2FsZSlcblxuICB0bXBJbWdXaWR0aDogPT5cbiAgICAoMSArIEBpbWFnZVBvc2l0aW9uLmluY3JlbWVudCkgKiBAaW1hZ2VQb3NpdGlvbi53aWR0aCgpXG5cbiAgaW1nV2lkdGhDbGlja0luY3JlbWVudDogPT5cbiAgICBwYXJzZUZsb2F0KEBpbWFnZVBvc2l0aW9uLndpZHRoICogQGltYWdlUG9zaXRpb24uaW5jcmVtZW50KVxuXG4gIGltZ1dpZHRoU2Nyb2xsSW5jcmVtZW50OiA9PlxuICAgIHBhcnNlRmxvYXQoQGltYWdlUG9zaXRpb24ud2lkdGggKiBAaW1hZ2VQb3NpdGlvbi5zY3JvbGxJbmNyZW1lbnQpXG5cbiAgY29udGFpbmVyV2lkdGg6ID0+XG4gICAgcGFyc2VGbG9hdChAbWFya2Vyc0NvbnRhaW5lci53aWR0aCgpKVxuXG4gICMgLS0tLS0tLS0tLSBMZWZ0IC8gUmlnaHRcblxuICBpbWdPZmZzZXRMZWZ0OiA9PlxuICAgIE1hdGguYWJzKFxuICAgICAgcGFyc2VGbG9hdChAbWFya2Vyc0NvbnRhaW5lci5jc3MoJ2JhY2tncm91bmRQb3NpdGlvbicpLnNwbGl0KCcgJylbMF0pXG4gICAgKVxuXG4gICMgLS0tLS0tLS0tLSBIZWlnaHRcblxuICBpbWdIZWlnaHQ6ID0+XG4gICAgcGFyc2VGbG9hdChAaW1hZ2VQb3NpdGlvbi5oZWlnaHQgKiBAaW1hZ2VQb3NpdGlvbi5zY2FsZSlcblxuICB0bXBJbWdIZWlnaHQ6ID0+XG4gICAgKDEgKyBAaW1hZ2VQb3NpdGlvbi5pbmNyZW1lbnQpICogQGltYWdlUG9zaXRpb24uaGVpZ2h0KClcblxuICBpbWdIZWlnaHRDbGlja0luY3JlbWVudDogPT5cbiAgICBwYXJzZUZsb2F0KEBpbWFnZVBvc2l0aW9uLmhlaWdodCAqIEBpbWFnZVBvc2l0aW9uLmluY3JlbWVudClcblxuICBpbWdIZWlnaHRTY3JvbGxJbmNyZW1lbnQ6ID0+XG4gICAgcGFyc2VGbG9hdChAaW1hZ2VQb3NpdGlvbi5oZWlnaHQgKiBAaW1hZ2VQb3NpdGlvbi5zY3JvbGxJbmNyZW1lbnQpXG5cbiAgY29udGFpbmVySGVpZ2h0OiA9PlxuICAgIHBhcnNlRmxvYXQoQG1hcmtlcnNDb250YWluZXIuaGVpZ2h0KCkpXG5cbiAgIyAtLS0tLS0tLS0tIFRvcCAvIEJvdHRvbVxuXG4gIGltZ09mZnNldFRvcDogPT5cbiAgICBNYXRoLmFicyhcbiAgICAgIHBhcnNlRmxvYXQoQG1hcmtlcnNDb250YWluZXIuY3NzKCdiYWNrZ3JvdW5kUG9zaXRpb24nKS5zcGxpdCgnICcpWzFdKVxuICAgIClcblxuICAjIC0tLS0tLS0tLS0gT3RoZXJcblxuICBnZXRFdmVudENvbnRhaW5lclBvc2l0aW9uOiAoZSkgPT5cbiAgICBsZWZ0OiAoZS5wYWdlWCAtIEBjb250YWluZXIub2Zmc2V0KCkubGVmdCkgLyBAY29udGFpbmVyV2lkdGgoKVxuICAgIHRvcDogIChlLnBhZ2VZIC0gQGNvbnRhaW5lci5vZmZzZXQoKS50b3ApIC8gQGNvbnRhaW5lckhlaWdodCgpXG5cbiAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gRXZlbnRzXG5cbiAgZGJsY2xpY2s6IChlKSA9PlxuICAgIGlmICQoZS50YXJnZXQpLmF0dHIoJ2RhdGEtem9vbS1pZCcpID09IEB6b29tSWRcbiAgICAgIGNsaWNrID0gQGdldEV2ZW50Q29udGFpbmVyUG9zaXRpb24oZSlcbiAgICAgIEB6b29tSW4oJ2NsaWNrJywgY2xpY2subGVmdCwgY2xpY2sudG9wKVxuXG4gIG1vdXNlZG93bjogKGUpID0+XG4gICAgaWYgJChlLnRhcmdldCkuYXR0cignZGF0YS16b29tLWlkJykgPT0gQHpvb21JZFxuICAgICAgQGlzRHJhZ2dpbmcgPSB0cnVlXG4gICAgICBjb29yZHMgPSBAZ2V0RXZlbnRDb250YWluZXJQb3NpdGlvbihlKVxuICAgICAgQGRyYWdDb29yZHMgPSBcbiAgICAgICAgcG9pbnRSZWY6IGNvb3Jkc1xuICAgICAgICBpbWdSZWY6XG4gICAgICAgICAgbGVmdDogMCAtIEBpbWdPZmZzZXRMZWZ0KClcbiAgICAgICAgICB0b3A6IDAgLSBAaW1nT2Zmc2V0VG9wKClcbiAgICAgICAgbWF4OlxuICAgICAgICAgIHJpZ2h0OiAoY29vcmRzLmxlZnQgKiBAY29udGFpbmVyV2lkdGgoKSkgKyBAaW1nT2Zmc2V0TGVmdCgpXG4gICAgICAgICAgbGVmdDogKGNvb3Jkcy5sZWZ0ICogQGNvbnRhaW5lcldpZHRoKCkpIC0gKEBpbWdXaWR0aCgpIC0gXG4gICAgICAgICAgICAgICAgICAgICAgKEBjb250YWluZXJXaWR0aCgpICsgQGltZ09mZnNldExlZnQoKSkpXG4gICAgICAgICAgYm90dG9tOiAoY29vcmRzLnRvcCAqIEBjb250YWluZXJIZWlnaHQoKSkgKyBAaW1nT2Zmc2V0VG9wKClcbiAgICAgICAgICB0b3A6IChjb29yZHMudG9wICogQGNvbnRhaW5lckhlaWdodCgpKSAtIChAaW1nSGVpZ2h0KCkgLSBcbiAgICAgICAgICAgICAgICAgICAgICAoQGNvbnRhaW5lckhlaWdodCgpICsgQGltZ09mZnNldFRvcCgpKSlcbiAgICB0cnVlXG5cbiAgbW91c2Vtb3ZlOiAoZSkgPT5cbiAgICBpZiBAaXNEcmFnZ2luZ1xuICAgICAgY29vcmRzID0gQGdldEV2ZW50Q29udGFpbmVyUG9zaXRpb24oZSlcbiAgICAgIGRyYWdMZWZ0ID0gY29vcmRzLmxlZnQgKiBAY29udGFpbmVyV2lkdGgoKVxuICAgICAgZHJhZ1RvcCA9IGNvb3Jkcy50b3AgKiBAY29udGFpbmVySGVpZ2h0KClcbiAgICAgIGlmIGRyYWdMZWZ0ID49IEBkcmFnQ29vcmRzLm1heC5sZWZ0ICYmIGRyYWdMZWZ0IDw9IEBkcmFnQ29vcmRzLm1heC5yaWdodFxuICAgICAgICBsZWZ0ID0gKGNvb3Jkcy5sZWZ0IC0gQGRyYWdDb29yZHMucG9pbnRSZWYubGVmdCkgKiBAY29udGFpbmVyV2lkdGgoKVxuICAgICAgICBAaW1hZ2VQb3NpdGlvbi5sZWZ0UHggPSBAZHJhZ0Nvb3Jkcy5pbWdSZWYubGVmdCArIGxlZnRcbiAgICAgIGVsc2UgaWYgZHJhZ0xlZnQgPCBAZHJhZ0Nvb3Jkcy5tYXgubGVmdFxuICAgICAgICBAaW1hZ2VQb3NpdGlvbi5sZWZ0UHggPSBAY29udGFpbmVyV2lkdGgoKSAtIEBpbWdXaWR0aCgpXG4gICAgICBlbHNlIGlmIGRyYWdMZWZ0ID4gQGRyYWdDb29yZHMubWF4LnJpZ2h0XG4gICAgICAgIEBpbWFnZVBvc2l0aW9uLmxlZnRQeCA9IDBcbiAgICAgIGlmIGRyYWdUb3AgPj0gQGRyYWdDb29yZHMubWF4LnRvcCAmJiBkcmFnVG9wIDw9IEBkcmFnQ29vcmRzLm1heC5ib3R0b21cbiAgICAgICAgdG9wID0gKGNvb3Jkcy50b3AgLSBAZHJhZ0Nvb3Jkcy5wb2ludFJlZi50b3ApICogQGNvbnRhaW5lckhlaWdodCgpXG4gICAgICAgIEBpbWFnZVBvc2l0aW9uLnRvcFB4ID0gQGRyYWdDb29yZHMuaW1nUmVmLnRvcCArIHRvcFxuICAgICAgZWxzZSBpZiBkcmFnVG9wIDwgQGRyYWdDb29yZHMubWF4LnRvcFxuICAgICAgICBAaW1hZ2VQb3NpdGlvbi50b3BQeCA9IEBjb250YWluZXJIZWlnaHQoKSAtIEBpbWdIZWlnaHQoKVxuICAgICAgZWxzZSBpZiBkcmFnVG9wID4gQGRyYWdDb29yZHMubWF4LmJvdHRvbVxuICAgICAgICBAaW1hZ2VQb3NpdGlvbi50b3BQeCA9IDBcbiAgICAgIEBzZXRCYWNrZ3JvdW5kKClcbiAgICB0cnVlXG5cbiAgbW91c2V1cDogKGUpID0+XG4gICAgQGlzRHJhZ2dpbmcgPSBmYWxzZVxuICAgIEBwb3NpdGlvbkluZm9ib3hlcygpXG4gICAgdHJ1ZVxuXG4gICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIFpvb21pbmdcblxuICB6b29tSW46ID0+XG4gICAgQGltYWdlUG9zaXRpb24uc2NhbGUgID0gQGltYWdlUG9zaXRpb24uc2NhbGUgKyBAaW1hZ2VQb3NpdGlvbi5pbmNyZW1lbnRcbiAgICBAaW1hZ2VQb3NpdGlvbi5sZWZ0UHggPSAtIEBpbWdPZmZzZXRMZWZ0KCkgLSAoQGltZ1dpZHRoQ2xpY2tJbmNyZW1lbnQoKSAvIDIpXG4gICAgQGltYWdlUG9zaXRpb24udG9wUHggID0gLSBAaW1nT2Zmc2V0VG9wKCkgLSAoQGltZ0hlaWdodENsaWNrSW5jcmVtZW50KCkgLyAyKVxuICAgIEBzZXRCYWNrZ3JvdW5kKClcbiAgICBAcG9zaXRpb25JbmZvYm94ZXMoKVxuXG4gIHpvb21PdXQ6IChsZWZ0ID0gMC41LCB0b3AgPSAwLjUpID0+XG4gICAgaWYgQGltYWdlUG9zaXRpb24uc2NhbGUgPiAxXG4gICAgICBAaW1hZ2VQb3NpdGlvbi5zY2FsZSAgPSBAaW1hZ2VQb3NpdGlvbi5zY2FsZSAtIEBpbWFnZVBvc2l0aW9uLmluY3JlbWVudFxuICAgICAgbGVmdFB4ID0gLSBAaW1nT2Zmc2V0TGVmdCgpICsgKEBpbWdXaWR0aENsaWNrSW5jcmVtZW50KCkgLyAyKVxuICAgICAgdG9wUHggID0gLSBAaW1nT2Zmc2V0VG9wKCkgKyAoQGltZ0hlaWdodENsaWNrSW5jcmVtZW50KCkgLyAyKVxuICAgICAgaWYgbGVmdFB4ICsgQGltZ1dpZHRoQ2xpY2tJbmNyZW1lbnQoKSA+IDBcbiAgICAgICAgQGltYWdlUG9zaXRpb24ubGVmdFB4ID0gMFxuICAgICAgZWxzZSBpZiBsZWZ0UHggLSBAaW1nV2lkdGhDbGlja0luY3JlbWVudCgpIDwgQGNvbnRhaW5lcldpZHRoKCkgLSBAaW1nV2lkdGgoKVxuICAgICAgICBAaW1hZ2VQb3NpdGlvbi5sZWZ0UHggPSBAY29udGFpbmVyV2lkdGgoKSAtIEBpbWdXaWR0aCgpXG4gICAgICBpZiB0b3BQeCArIEBpbWdIZWlnaHRDbGlja0luY3JlbWVudCgpID4gMFxuICAgICAgICBAaW1hZ2VQb3NpdGlvbi50b3BQeCA9IDBcbiAgICAgIGVsc2UgaWYgdG9wUHggLSBAaW1nSGVpZ2h0Q2xpY2tJbmNyZW1lbnQoKSA8IEBjb250YWluZXJIZWlnaHQoKSAtIEBpbWdIZWlnaHQoKVxuICAgICAgICBAaW1hZ2VQb3NpdGlvbi50b3BQeCA9IEBjb250YWluZXJIZWlnaHQoKSAtIEBpbWdIZWlnaHQoKVxuICAgICAgQHNldEJhY2tncm91bmQoKVxuICAgICAgQHBvc2l0aW9uSW5mb2JveGVzKClcblxuY2xhc3MgUGxhbml0Lk1hcmtlclxuXG4gIGNvbnN0cnVjdG9yOiAoQGNvbnRhaW5lciwgaWQpIC0+XG5cbiAgICAjIFNldCBPcHRpb25zXG4gICAgQG1hcmtlcnNDb250YWluZXIgPSBAY29udGFpbmVyLmZpbmQoXCIuI3tQbGFuaXQubWFya2VyQ29udGFpbmVyQ2xhc3N9XCIpXG5cbiAgICAjIEZpbmQgTWFya2VyXG4gICAgQG1hcmtlciA9IEBtYXJrZXJzQ29udGFpbmVyLmZpbmQoXG4gICAgICBcIi4je1BsYW5pdC5tYXJrZXJDbGFzc31bZGF0YS1tYXJrZXI9JyN7aWR9J11cIlxuICAgICkuZmlyc3QoKVxuXG4gICAgIyBSZXR1cm4gdGhpc1xuICAgIEBcblxuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBDYWxjdWxhdGlvbnNcblxuICBwb3NpdGlvbjogPT5cbiAgICB4UHggPSBAbWFya2VyLnBvc2l0aW9uKCkubGVmdCArIChAbWFya2VyLm91dGVyV2lkdGgoKSAvIDIpXG4gICAgeVB4ID0gQG1hcmtlci5wb3NpdGlvbigpLnRvcCArIChAbWFya2VyLm91dGVySGVpZ2h0KCkgLyAyKVxuICAgIGlmIEBtYXJrZXJzQ29udGFpbmVyLmNzcygnYmFja2dyb3VuZEltYWdlJylcbiAgICAgIHNjYWxlID0gcGFyc2VJbnQoQG1hcmtlcnNDb250YWluZXIuY3NzKCdiYWNrZ3JvdW5kU2l6ZScpKSAvIDEwMFxuICAgICAgd0ltZyA9IEBjb250YWluZXIud2lkdGgoKSAqIHNjYWxlXG4gICAgICBoSW1nID0gQGNvbnRhaW5lci5oZWlnaHQoKSAqIHNjYWxlXG4gICAgICB4SW1nID0gcGFyc2VJbnQoQG1hcmtlcnNDb250YWluZXIuY3NzKCdiYWNrZ3JvdW5kUG9zaXRpb24nKS5zcGxpdCgnICcpWzBdKVxuICAgICAgeUltZyA9IHBhcnNlSW50KEBtYXJrZXJzQ29udGFpbmVyLmNzcygnYmFja2dyb3VuZFBvc2l0aW9uJykuc3BsaXQoJyAnKVsxXSlcbiAgICAgIHhQYyA9ICgoeFB4ICsgTWF0aC5hYnMoeEltZykpIC8gd0ltZykgKiAxMDBcbiAgICAgIHlQYyA9ICgoeVB4ICsgTWF0aC5hYnMoeUltZykpIC8gaEltZykgKiAxMDBcbiAgICBlbHNlXG4gICAgICB4UGMgPSAoeFB4IC8gQGNvbnRhaW5lci53aWR0aCgpKSAqIDEwMFxuICAgICAgeVBjID0gKHlQeCAvIEBjb250YWluZXIuaGVpZ2h0KCkpICogMTAwXG4gICAgW3hQYywgeVBjXVxuXG4gIHJlbGF0aXZlUG9zaXRpb246ID0+XG4gICAgeFB4ID0gQG1hcmtlci5wb3NpdGlvbigpLmxlZnQgKyAoQG1hcmtlci5vdXRlcldpZHRoKCkgLyAyKVxuICAgIHlQeCA9IEBtYXJrZXIucG9zaXRpb24oKS50b3AgKyAoQG1hcmtlci5vdXRlckhlaWdodCgpIC8gMilcbiAgICB4UGMgPSAoeFB4IC8gQGNvbnRhaW5lci53aWR0aCgpKSAqIDEwMFxuICAgIHlQYyA9ICh5UHggLyBAY29udGFpbmVyLmhlaWdodCgpKSAqIDEwMFxuICAgIFt4UGMsIHlQY11cblxuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBBdHRyaWJ1dGVzXG5cbiAgY29sb3I6ID0+XG4gICAgQG1hcmtlci5jc3MoJ2JhY2tncm91bmRDb2xvcicpXG5cbiAgcGxhbml0SUQ6ID0+XG4gICAgQG1hcmtlci5hdHRyKCdkYXRhLW1hcmtlcicpXG5cbiAgaWQ6ID0+XG4gICAgQG1hcmtlci5hdHRyKCdkYXRhLWlkJylcblxuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBJbmZvYm94XG5cbiAgaW5mb2JveEhUTUw6ID0+XG4gICAgaW5mbyA9IEBtYXJrZXIuZmluZCgnLnBsYW5pdC1pbmZvYm94JylcbiAgICBpZiBpbmZvLmxlbmd0aCA+IDAgdGhlbiBpbmZvLmh0bWwoKSBlbHNlIG51bGxcblxuICBwb3NpdGlvbkluZm9ib3g6ID0+XG4gICAgaW5mb2JveCA9ICQoXCIjI3tAbWFya2VyLmF0dHIoJ2RhdGEtaW5mb2JveCcpfVwiKVxuICAgIG1hcmtlckNlbnRlclggPSAocGFyc2VGbG9hdChAcmVsYXRpdmVQb3NpdGlvbigpWzBdIC8gMTAwKSAqIEBjb250YWluZXIud2lkdGgoKSlcbiAgICBtYXJrZXJDZW50ZXJZID0gKHBhcnNlRmxvYXQoQHJlbGF0aXZlUG9zaXRpb24oKVsxXSAvIDEwMCkgKiBAY29udGFpbmVyLmhlaWdodCgpKVxuICAgIGluZm9MZWZ0ID0gbWFya2VyQ2VudGVyWCAtIChpbmZvYm94Lm91dGVyV2lkdGgoKSAvIDIpXG4gICAgaW5mb0JvdHRvbSA9IEBjb250YWluZXIuaGVpZ2h0KCkgLSBtYXJrZXJDZW50ZXJZICsgKEBtYXJrZXIuaGVpZ2h0KCkgLyAyKSArIDVcbiAgICBpbmZvYm94LmNzc1xuICAgICAgbGVmdDogaW5mb0xlZnRcbiAgICAgIGJvdHRvbTogaW5mb0JvdHRvbVxuICAgIEBwb3NpdGlvbigpXG5cbiAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gRHJhZ2dpbmdcblxuICBpc0RyYWdnYWJsZTogPT5cbiAgICBAbWFya2VyLmhhc0NsYXNzKCdkcmFnZ2FibGUnKVxuXG4gICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIEFjdGlvbnNcblxuICBzYXZlUG9zaXRpb246ID0+XG4gICAgY29vcmRzID0gQHBvc2l0aW9uKClcbiAgICBAbWFya2VyLmF0dHJcbiAgICAgICdkYXRhLXhQYyc6IGNvb3Jkc1swXVxuICAgICAgJ2RhdGEteVBjJzogY29vcmRzWzFdXG5cbiAgdXBkYXRlOiAob3B0aW9ucykgPT5cbiAgICBpZiBvcHRpb25zLmNvbG9yXG4gICAgICBAbWFya2VyLmNzcyhiYWNrZ3JvdW5kQ29sb3I6IG9wdGlvbnMuY29sb3IpXG4gICAgaWYgb3B0aW9ucy5pbmZvYm94XG4gICAgICBAbWFya2VyLmZpbmQoJy5wbGFuaXQtaW5mb2JveCcpLmh0bWwob3B0aW9ucy5pbmZvYm94KVxuICAgICAgQHBvc2l0aW9uSW5mb2JveCgpXG4gICAgaWYgb3B0aW9ucy5kcmFnZ2FibGVcbiAgICAgIEBtYXJrZXIucmVtb3ZlQ2xhc3MoJ2RyYWdnYWJsZScpXG4gICAgICBAbWFya2VyLmFkZENsYXNzKCdkcmFnZ2FibGUnKSBpZiBvcHRpb25zLmRyYWdnYWJsZSA9PSB0cnVlXG4gICAgaWYgb3B0aW9ucy5jb29yZHNcbiAgICAgIGxlZnQgPSAoKHBhcnNlRmxvYXQob3B0aW9ucy5jb29yZHNbMF0pIC8gMTAwKSAqIEBjb250YWluZXIud2lkdGgoKSkgLSAxNVxuICAgICAgdG9wID0gKChwYXJzZUZsb2F0KG9wdGlvbnMuY29vcmRzWzFdKSAvIDEwMCkgKiBAY29udGFpbmVyLmhlaWdodCgpKSAtIDE1XG4gICAgICBAbWFya2VyLmNzc1xuICAgICAgICBsZWZ0OiBcIiN7bGVmdH1weFwiXG4gICAgICAgIHRvcDogXCIje3RvcH1weFwiXG5cbiAgcmVtb3ZlOiA9PlxuICAgIEBtYXJrZXIucmVtb3ZlKClcblxuY2xhc3MgUGxhbml0Lk1hcmtlci5FdmVudHNcblxuICBjb25zdHJ1Y3RvcjogKEBvcHRpb25zKSAtPlxuXG4gICAgIyBTZXQgT3B0aW9uc1xuICAgIEBjb250YWluZXIgPSBAb3B0aW9ucy5jb250YWluZXJcbiAgICBAbWFya2Vyc0NvbnRhaW5lciA9IEBjb250YWluZXIuZmluZChcIi4je1BsYW5pdC5tYXJrZXJDb250YWluZXJDbGFzc31cIilcblxuICAgICMgRmluZCBNYXJrZXJcbiAgICBAbWFya2VyID0gQG1hcmtlcnNDb250YWluZXIuZmluZChcbiAgICAgIFwiLiN7UGxhbml0Lm1hcmtlckNsYXNzfVtkYXRhLW1hcmtlcj0nI3tAb3B0aW9ucy5wbGFuaXRJRH0nXVwiXG4gICAgKS5maXJzdCgpXG4gICAgQG1hcmtlck9iaiA9IG5ldyBQbGFuaXQuTWFya2VyKEBjb250YWluZXIsIEBvcHRpb25zLnBsYW5pdElEKVxuXG4gICAgIyBEcmFnZ2FibGVcbiAgICBpZiBAb3B0aW9ucy5kcmFnZ2FibGVcbiAgICAgIEBtYXJrZXIuYWRkQ2xhc3MoJ2RyYWdnYWJsZScpXG4gICAgICBAbWFya2VyLm9uICdtb3VzZWRvd24nLCAoZSkgPT5cbiAgICAgICAgaWYgZS53aGljaCA9PSAxXG4gICAgICAgICAgbWFya2VyID0gJChlLnRhcmdldCkuY2xvc2VzdCgnLnBsYW5pdC1tYXJrZXInKVxuICAgICAgICAgIG1hcmtlci5hZGRDbGFzcygnaXMtZHJhZ2dpbmcnKVxuICAgICAgICAgIG1hcmtlci5hdHRyXG4gICAgICAgICAgICAnZGF0YS1kcmFnLXN0YXJ0LXgnOiBlLnBhZ2VYXG4gICAgICAgICAgICAnZGF0YS1kcmFnLXN0YXJ0LXknOiBlLnBhZ2VZXG5cbiAgICAjIEluZm9ib3hcbiAgICBpZiBAb3B0aW9ucy5pbmZvYm94XG4gICAgICBpZCA9IFBsYW5pdC5yYW5kb21TdHJpbmcoMTYpXG4gICAgICBAY29udGFpbmVyLmZpbmQoXCIuI3tQbGFuaXQuaW5mb2JveENvbnRhaW5lckNsYXNzfVwiKS5hcHBlbmQgXCJcIlwiXG4gICAgICAgIDxkaXYgY2xhc3M9XCJwbGFuaXQtaW5mb2JveFwiIGlkPVwiaW5mby0je2lkfVwiPiN7QG9wdGlvbnMuaW5mb2JveH08L2Rpdj5cbiAgICAgICAgICBcIlwiXCJcbiAgICAgIEBtYXJrZXIuYXR0cignZGF0YS1pbmZvYm94JywgXCJpbmZvLSN7aWR9XCIpXG4gICAgICBAbWFya2VyT2JqLnBvc2l0aW9uSW5mb2JveCgpXG4gICAgICBAbWFya2VyLmNsaWNrIChlKSA9PlxuICAgICAgICBpZihcbiAgICAgICAgICBNYXRoLmFicyhlLnBhZ2VYIC0gQG1hcmtlci5hdHRyKCdkYXRhLWRyYWctc3RhcnQteCcpKSA8IDEgJiZcbiAgICAgICAgICBNYXRoLmFicyhlLnBhZ2VZIC0gQG1hcmtlci5hdHRyKCdkYXRhLWRyYWctc3RhcnQteScpKSA8IDFcbiAgICAgICAgKVxuICAgICAgICAgIG1hcmtlciA9ICQoZS50YXJnZXQpLmNsb3Nlc3QoJy5wbGFuaXQtbWFya2VyJylcbiAgICAgICAgICAkKFwiIyN7bWFya2VyLmF0dHIoJ2RhdGEtaW5mb2JveCcpfVwiKS50b2dnbGVDbGFzcygnYWN0aXZlJylcblxuICBtYXJrZXJzOiAtPlxuICAgIEBtYXJrZXJzQ29udGFpbmVyLmZpbmQoJy5wbGFuaXQtbWFya2VyJylcblxuICBkcmFnZ2luZ01hcmtlcjogLT5cbiAgICBAbWFya2Vyc0NvbnRhaW5lci5maW5kKCcucGxhbml0LW1hcmtlci5pcy1kcmFnZ2luZycpXG5cbmNsYXNzIFBsYW5pdC5NYXJrZXIuQ3JlYXRvclxuXG4gIGNvbnN0cnVjdG9yOiAoQG9wdGlvbnMpIC0+XG4gICAgIyBTZXQgT3B0aW9uc1xuICAgIEBjb250YWluZXIgPSBAb3B0aW9ucy5jb250YWluZXJcbiAgICBAbWFya2Vyc0NvbnRhaW5lciA9IEBjb250YWluZXIuZmluZChcIi4je1BsYW5pdC5tYXJrZXJDb250YWluZXJDbGFzc31cIikuZmlyc3QoKVxuICAgIHVubGVzcyBAb3B0aW9ucy5wbGFuaXRJRFxuICAgICAgQG9wdGlvbnMucGxhbml0SUQgPSBQbGFuaXQucmFuZG9tU3RyaW5nKDIwKVxuXG4gICAgIyBBZGQgTWFya2VyXG4gICAgaWYgQG9wdGlvbnMuY29sb3IgdGhlbiBjb2xvciA9IEBvcHRpb25zLmNvbG9yIGVsc2UgY29sb3IgPSAnI0ZDNUIzRidcblxuICAgIGxlZnQgPSAoKHBhcnNlRmxvYXQoQG9wdGlvbnMuY29vcmRzWzBdKSAvIDEwMCkgKiBAY29udGFpbmVyLndpZHRoKCkpIC0gMTVcbiAgICB0b3AgPSAoKHBhcnNlRmxvYXQoQG9wdGlvbnMuY29vcmRzWzFdKSAvIDEwMCkgKiBAY29udGFpbmVyLmhlaWdodCgpKSAtIDE1XG4gICAgQG1hcmtlcnNDb250YWluZXIuYXBwZW5kKFxuICAgICAgJCgnPGRpdj48L2Rpdj4nKVxuICAgICAgICAuYWRkQ2xhc3MoJ3BsYW5pdC1tYXJrZXInKVxuICAgICAgICAuYXR0clxuICAgICAgICAgICdkYXRhLW1hcmtlcic6IEBvcHRpb25zLnBsYW5pdElEXG4gICAgICAgICAgJ2RhdGEteFBjJzogQG9wdGlvbnMuY29vcmRzWzBdXG4gICAgICAgICAgJ2RhdGEteVBjJzogQG9wdGlvbnMuY29vcmRzWzFdXG4gICAgICAgIC5jc3NcbiAgICAgICAgICBsZWZ0OiBcIiN7bGVmdH1weFwiXG4gICAgICAgICAgdG9wOiBcIiN7dG9wfXB4XCJcbiAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6IGNvbG9yXG4gICAgKVxuICAgIG1hcmtlciA9IEBtYXJrZXJzQ29udGFpbmVyLmZpbmQoJy5wbGFuaXQtbWFya2VyJykubGFzdCgpXG4gICAgaWYgQG9wdGlvbnMuaWRcbiAgICAgIG1hcmtlci5hdHRyKCdkYXRhLWlkJzogQG9wdGlvbnMuaWQpXG4gICAgaWYgQG9wdGlvbnMuY2xhc3NcbiAgICAgIG1hcmtlci5hZGRDbGFzcyhAb3B0aW9ucy5jbGFzcylcbiAgICBpZiBAb3B0aW9ucy5odG1sXG4gICAgICBtYXJrZXIuaHRtbChAb3B0aW9ucy5odG1sKVxuXG4gICAgIyBCaW5kIEV2ZW50cyAoaW4gYSBzZXBhcmF0ZSBjbGFzcylcbiAgICBuZXcgUGxhbml0Lk1hcmtlci5FdmVudHMoQG9wdGlvbnMpXG5cbiAgICAjIFJldHVybiBhIG5ldyBpbnN0YW5jZSBvZiB0aGlzIG1hcmtlclxuICAgIG5ldyBQbGFuaXQuTWFya2VyKEBjb250YWluZXIsIEBvcHRpb25zLnBsYW5pdElEKVxuIl19