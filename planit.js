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
    var color, left, top;
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
    this.markersContainer.append($('<div><div class="planit-marker-content"></div></div>').addClass('planit-marker').attr({
      'data-marker': this.options.planitID,
      'data-xPc': this.options.coords[0],
      'data-yPc': this.options.coords[1]
    }).css({
      left: left + "px",
      top: top + "px",
      backgroundColor: color
    }));
    if (this.options.id) {
      this.markersContainer.find('.planit-marker').last().attr({
        'data-id': this.options.id
      });
    }
    if (this.options["class"]) {
      this.markersContainer.find('.planit-marker').last().addClass(this.options["class"]);
    }
    new Planit.Marker.Events(this.options);
    new Planit.Marker(this.container, this.options.planitID);
  }

  return Creator;

})();

//# sourceMappingURL=data:application/json;base64,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Q0FBQyxJQUFsQixDQUF3QixnQkFBeEIsQ0FBd0MsQ0FBQyxJQUF6QyxDQUFBLENBQStDLENBQUMsUUFBaEQsQ0FBeUQsSUFBQyxDQUFBLE9BQU8sQ0FBQyxPQUFELENBQWpFLENBQUEsQ0FERjtLQXpCQTtBQUFBLElBNkJJLElBQUEsTUFBTSxDQUFDLE1BQU0sQ0FBQyxNQUFkLENBQXFCLElBQUMsQ0FBQSxPQUF0QixDQTdCSixDQUFBO0FBQUEsSUFnQ0ksSUFBQSxNQUFNLENBQUMsTUFBUCxDQUFjLElBQUMsQ0FBQSxTQUFmLEVBQTBCLElBQUMsQ0FBQSxPQUFPLENBQUMsUUFBbkMsQ0FoQ0osQ0FGVztFQUFBLENBQWI7O2lCQUFBOztJQWptQkYsQ0FBQSIsImZpbGUiOiJwbGFuaXQtdG1wLmpzIiwic291cmNlUm9vdCI6Ii9zb3VyY2UvIiwic291cmNlc0NvbnRlbnQiOlsiY2xhc3MgUGxhbml0XG5cbiAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gUmVmc1xuXG4gIEBjb250YWluZXJDbGFzczogICAgICAgICdwbGFuaXQtY29udGFpbmVyJ1xuICBAbWFya2VyQ29udGFpbmVyQ2xhc3M6ICAncGxhbml0LW1hcmtlcnMtY29udGFpbmVyJ1xuICBAbWFya2VyQ2xhc3M6ICAgICAgICAgICAncGxhbml0LW1hcmtlcidcbiAgQG1hcmtlckNvbnRlbnRDbGFzczogICAgJ3BsYW5pdC1tYXJrZXItY29udGVudCdcbiAgQGluZm9ib3hDb250YWluZXJDbGFzczogJ3BsYW5pdC1pbmZvYm94LWNvbnRhaW5lcidcblxuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBEZWZhdWx0IE9wdGlvbnNcblxuICBuZXc6IChAb3B0aW9ucyA9IHt9KSAtPlxuICAgICMgU2V0IE9wdGlvbnNcbiAgICBpZiBAb3B0aW9ucy5jb250YWluZXJcbiAgICAgIEBvcHRpb25zLmNvbnRhaW5lciA9ICQoXCIjI3tAb3B0aW9ucy5jb250YWluZXJ9XCIpXG4gICAgZWxzZVxuICAgICAgQG9wdGlvbnMuY29udGFpbmVyID0gJCgnI3BsYW5pdCcpIFxuXG4gICAgIyBJbml0aWFsaXplIENvbnRhaW5lclxuICAgIEBvcHRpb25zLmNvbnRhaW5lci5hZGRDbGFzcygncGxhbml0LWNvbnRhaW5lcicpXG4gICAgQG9wdGlvbnMuY29udGFpbmVyLmFwcGVuZCBcIlwiXCJcbiAgICAgIDxkaXYgY2xhc3M9XCIje1BsYW5pdC5pbmZvYm94Q29udGFpbmVyQ2xhc3N9XCI+PC9kaXY+XG4gICAgICA8ZGl2IGNsYXNzPVwiI3tQbGFuaXQubWFya2VyQ29udGFpbmVyQ2xhc3N9XCI+PC9kaXY+XG4gICAgICAgIFwiXCJcIlxuXG4gICAgIyBSZWZzXG4gICAgQGNvbnRhaW5lciA9IEBvcHRpb25zLmNvbnRhaW5lclxuICAgIEBtYXJrZXJzQ29udGFpbmVyID0gQGNvbnRhaW5lci5maW5kKFwiLiN7UGxhbml0Lm1hcmtlckNvbnRhaW5lckNsYXNzfVwiKS5maXJzdCgpXG5cbiAgICAjIEFkZCBpbWFnZSBhbmQgem9vbSAoaWYgbmVjZXNzYXJ5KVxuICAgIGlmIEBvcHRpb25zLmltYWdlICYmIEBvcHRpb25zLmltYWdlLnVybFxuICAgICAgQGNvbnRhaW5lci5hcHBlbmQoXCJcIlwiPGltZyBzcmM9XCIje0BvcHRpb25zLmltYWdlLnVybH1cIj5cIlwiXCIpXG4gICAgICBAbWFya2Vyc0NvbnRhaW5lci5jc3NcbiAgICAgICAgYmFja2dyb3VuZEltYWdlOiBcInVybCgnI3tAb3B0aW9ucy5pbWFnZS51cmx9JylcIlxuICAgICAgQGluaXRCYWNrZ3JvdW5kSW1hZ2UoKVxuXG4gICAgIyBBZGQgTWFya2VycyAoaWYgbmVjZXNzYXJ5KVxuICAgIGlmIEBvcHRpb25zLm1hcmtlcnMgJiYgQG9wdGlvbnMubWFya2Vycy5sZW5ndGggPiAwXG4gICAgICBAaW5pdE1hcmtlcnMoKVxuXG4gICAgIyBCaW5kIERvY3VtZW50IEV2ZW50c1xuICAgIG5ldyBQbGFuaXQuUGxhbi5FdmVudHNcbiAgICAgIGNvbnRhaW5lcjogQGNvbnRhaW5lclxuICAgICAgcGxhbml0OiBAXG5cbiAgICAjIFJldHVybiB0aGlzIFBsYW5pdCBvYmplY3RcbiAgICBAXG5cbiAgaW5pdEJhY2tncm91bmRJbWFnZTogPT5cbiAgICBpbWcgPSBAY29udGFpbmVyLmZpbmQoJ2ltZycpLmZpcnN0KClcbiAgICBpbWdIZWlnaHQgPSBpbWcuaGVpZ2h0KClcbiAgICBpZiBpbWdIZWlnaHQgPiAwICYmIGltZy53aWR0aCgpID4gMFxuICAgICAgQGNvbnRhaW5lci5jc3NcbiAgICAgICAgaGVpZ2h0OiBpbWdIZWlnaHRcbiAgICAgIGltZy5yZW1vdmUoKVxuICAgICAgaWYgQG9wdGlvbnMuaW1hZ2Uuem9vbVxuICAgICAgICBuZXcgUGxhbml0LlBsYW4uWm9vbWFibGVcbiAgICAgICAgICBjb250YWluZXI6IEBjb250YWluZXJcbiAgICAgIEBpbWdMb2FkZWQgPSB0cnVlXG4gICAgZWxzZVxuICAgICAgc2V0VGltZW91dChAaW5pdEJhY2tncm91bmRJbWFnZSwgMjUwKVxuXG4gIGluaXRNYXJrZXJzOiA9PlxuICAgIGlmIEBvcHRpb25zLmltYWdlICYmIEBvcHRpb25zLmltYWdlLnVybFxuICAgICAgaWYgQGltZ0xvYWRlZCA9PSB0cnVlXG4gICAgICAgIEBhZGRNYXJrZXIobWFya2VyKSBmb3IgbWFya2VyIGluIEBvcHRpb25zLm1hcmtlcnNcbiAgICAgIGVsc2VcbiAgICAgICAgc2V0VGltZW91dChAaW5pdE1hcmtlcnMsIDI1MClcbiAgICBlbHNlXG4gICAgICBAYWRkTWFya2VyKG1hcmtlcikgZm9yIG1hcmtlciBpbiBAb3B0aW9ucy5tYXJrZXJzXG5cbiAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gQWRkIEEgTWFya2VyXG5cbiAgYWRkTWFya2VyOiAob3B0aW9ucykgPT5cbiAgICBvcHRpb25zLmNvbnRhaW5lciA9IEBjb250YWluZXJcbiAgICBuZXcgUGxhbml0Lk1hcmtlci5DcmVhdG9yKG9wdGlvbnMpXG5cbiAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gUmV0cmlldmUgRGF0YVxuXG4gIGdldE1hcmtlcjogKGlkKSA9PlxuICAgIG5ldyBQbGFuaXQuTWFya2VyKEBjb250YWluZXIsIGlkKVxuXG4gIGdldEFsbE1hcmtlcnM6ICgpID0+XG4gICAgcGxhbiA9IG5ldyBQbGFuaXQuUGxhbihAY29udGFpbmVyKVxuICAgIHBsYW4uZ2V0QWxsTWFya2VycygpXG5cbiAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gRXZlbnQgQ2FsbGJhY2tzXG5cbiAgbWFya2VyRHJhZ0VuZDogKGV2ZW50LCBtYXJrZXIpID0+XG4gICAgaWYgQG9wdGlvbnMubWFya2VyRHJhZ0VuZFxuICAgICAgQG9wdGlvbnMubWFya2VyRHJhZ0VuZChldmVudCwgbWFya2VyKVxuXG4gIG1hcmtlckNsaWNrOiAoZXZlbnQsIG1hcmtlcikgPT5cbiAgICBpZiBAb3B0aW9ucy5tYXJrZXJDbGlja1xuICAgICAgQG9wdGlvbnMubWFya2VyQ2xpY2soZXZlbnQsIG1hcmtlcilcblxuICBjYW52YXNDbGljazogKGV2ZW50LCBjb29yZHMpID0+XG4gICAgaWYgQG9wdGlvbnMuY2FudmFzQ2xpY2tcbiAgICAgIEBvcHRpb25zLmNhbnZhc0NsaWNrKGV2ZW50LCBjb29yZHMpXG5cbiAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gQ2xhc3MgTWV0aG9kc1xuXG4gIEByYW5kb21TdHJpbmc6IChsZW5ndGggPSAxNikgLT5cbiAgICBzdHIgPSBNYXRoLnJhbmRvbSgpLnRvU3RyaW5nKDM2KS5zbGljZSgyKSBcbiAgICBzdHIgPSBzdHIgKyBNYXRoLnJhbmRvbSgpLnRvU3RyaW5nKDM2KS5zbGljZSgyKVxuICAgIHN0ci5zdWJzdHJpbmcoMCwgbGVuZ3RoIC0gMSlcblxuIyBzZXQgdGhpcyBjbGFzcyB0byBhIGdsb2JhbCBgcGxhbml0YCB2YXJpYWJsZVxud2luZG93LnBsYW5pdCA9IG5ldyBQbGFuaXRcblxuY2xhc3MgUGxhbml0LlBsYW5cblxuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBTZXR1cFxuXG4gIGNvbnN0cnVjdG9yOiAoQGNvbnRhaW5lcikgLT5cbiAgICBAbWFya2Vyc0NvbnRhaW5lciA9IEBjb250YWluZXIuZmluZChcIi4je1BsYW5pdC5tYXJrZXJDb250YWluZXJDbGFzc31cIikuZmlyc3QoKVxuXG4gICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIEdldCBBbGwgTWFya2Vyc1xuXG4gIGdldEFsbE1hcmtlcnM6ICgpID0+XG4gICAgbWFya2VycyA9IFtdXG4gICAgZm9yIG1hcmtlciBpbiBAbWFya2Vyc0NvbnRhaW5lci5maW5kKCcucGxhbml0LW1hcmtlcicpXG4gICAgICBtID0gbmV3IFBsYW5pdC5NYXJrZXIoQGNvbnRhaW5lciwgJChtYXJrZXIpLmF0dHIoJ2RhdGEtbWFya2VyJykpXG4gICAgICBtYXJrZXIgPVxuICAgICAgICAjIGNvb3JkczogW20ucG9zaXRpb24oKS5sZWZ0LCBtLnBvc2l0aW9uKCkudG9wXVxuICAgICAgICBjb29yZHM6IG0ucG9zaXRpb24oKVxuICAgICAgICBkcmFnZ2FibGU6IG0uaXNEcmFnZ2FibGUoKVxuICAgICAgICBjb2xvcjogbS5jb2xvcigpXG4gICAgICBtYXJrZXIuaW5mb2JveCA9IG0uaW5mb2JveEhUTUwoKSBpZiBtLmluZm9ib3hIVE1MKClcbiAgICAgIG1hcmtlcnMucHVzaChtYXJrZXIpXG4gICAgbWFya2Vyc1xuXG5jbGFzcyBQbGFuaXQuUGxhbi5FdmVudHNcblxuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBTZXR1cFxuXG4gIGNvbnN0cnVjdG9yOiAoQG9wdGlvbnMpIC0+XG5cbiAgICAjIGRlZmF1bHQgb3B0aW9uc1xuICAgIEBjb250YWluZXIgPSBAb3B0aW9ucy5jb250YWluZXJcbiAgICBAbWFya2Vyc0NvbnRhaW5lciA9IEBjb250YWluZXIuZmluZChcIi4je1BsYW5pdC5tYXJrZXJDb250YWluZXJDbGFzc31cIilcblxuICAgICMgYmluZCBkcmFnZ2FibGUgZXZlbnRzXG4gICAgJChkb2N1bWVudCkub24oJ21vdXNlbW92ZScsIEBtb3VzZW1vdmUpXG4gICAgJChkb2N1bWVudCkub24oJ21vdXNldXAnLCBAbW91c2V1cClcblxuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBSZWZzXG5cbiAgbWFya2VyczogPT5cbiAgICBAbWFya2Vyc0NvbnRhaW5lci5maW5kKCcucGxhbml0LW1hcmtlcicpXG5cbiAgZHJhZ2dpbmdNYXJrZXI6ID0+XG4gICAgQG1hcmtlcnNDb250YWluZXIuZmluZCgnLnBsYW5pdC1tYXJrZXIuaXMtZHJhZ2dpbmcnKVxuXG4gIGdldEV2ZW50UG9zaXRpb246IChlKSA9PlxuICAgICMgY29udGFpbmVyIGRpbWVuc2lvbnNcbiAgICB3Q29udCA9IHBhcnNlRmxvYXQoQG1hcmtlcnNDb250YWluZXIud2lkdGgoKSlcbiAgICBoQ29udCA9IHBhcnNlRmxvYXQoQG1hcmtlcnNDb250YWluZXIuaGVpZ2h0KCkpXG4gICAgaWYoXG4gICAgICBAbWFya2Vyc0NvbnRhaW5lci5jc3MoJ2JhY2tncm91bmRJbWFnZScpICYmXG4gICAgICBAbWFya2Vyc0NvbnRhaW5lci5jc3MoJ2JhY2tncm91bmRJbWFnZScpICE9ICdub25lJ1xuICAgIClcbiAgICAgICMgaWYgdGhlcmUgaXMgYW4gaW1hZ2UsIHdlIG5lZWQgdG8gY2FsY3VsYXRlIHdpdGggaW1hZ2UgaW4gbWluZFxuICAgICAgeFB4ID0gZS5wYWdlWCAtIEBjb250YWluZXIub2Zmc2V0KCkubGVmdFxuICAgICAgeVB4ID0gZS5wYWdlWSAtIEBjb250YWluZXIub2Zmc2V0KCkudG9wXG4gICAgICBzY2FsZSA9IHBhcnNlSW50KEBtYXJrZXJzQ29udGFpbmVyLmNzcygnYmFja2dyb3VuZFNpemUnKSkgLyAxMDBcbiAgICAgIHdJbWcgPSBAY29udGFpbmVyLndpZHRoKCkgKiBzY2FsZVxuICAgICAgaEltZyA9IEBjb250YWluZXIuaGVpZ2h0KCkgKiBzY2FsZVxuICAgICAgeEltZyA9IHBhcnNlSW50KEBtYXJrZXJzQ29udGFpbmVyLmNzcygnYmFja2dyb3VuZFBvc2l0aW9uJykuc3BsaXQoJyAnKVswXSlcbiAgICAgIHlJbWcgPSBwYXJzZUludChAbWFya2Vyc0NvbnRhaW5lci5jc3MoJ2JhY2tncm91bmRQb3NpdGlvbicpLnNwbGl0KCcgJylbMV0pXG4gICAgICB4UGMgPSAoKHhQeCArIE1hdGguYWJzKHhJbWcpKSAvIHdJbWcpICogMTAwXG4gICAgICB5UGMgPSAoKHlQeCArIE1hdGguYWJzKHlJbWcpKSAvIGhJbWcpICogMTAwXG4gICAgZWxzZVxuICAgICAgIyBvciB3ZSBjYW4ganVzdCBsb29rIGF0IHRoZSBjb250YWluZXJcbiAgICAgIHhQYyA9IChlLnBhZ2VYIC0gQGNvbnRhaW5lci5vZmZzZXQoKS5sZWZ0KSAvIHdDb250XG4gICAgICB5UGMgPSAgKGUucGFnZVkgLSBAY29udGFpbmVyLm9mZnNldCgpLnRvcCkgLyBoQ29udFxuICAgIFt4UGMsIHlQY11cblxuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBFdmVudHNcblxuICBtb3VzZXVwOiAoZSkgPT5cbiAgICAjIGRlYWxpbmcgd2l0aCBtYXJrZXJzLCBlc3AuIGRyYWdnaW5nIG1hcmtlcnNcbiAgICBtYXJrZXIgPSBAbWFya2Vyc0NvbnRhaW5lci5maW5kKCcuaXMtZHJhZ2dpbmcnKS5maXJzdCgpXG4gICAgaWYgQGRyYWdnaW5nTWFya2VyKCkubGVuZ3RoID4gMFxuICAgICAgbSA9IG5ldyBQbGFuaXQuTWFya2VyKEBjb250YWluZXIsIG1hcmtlci5hdHRyKCdkYXRhLW1hcmtlcicpKVxuICAgICAgQG9wdGlvbnMucGxhbml0Lm1hcmtlckRyYWdFbmQoZSwgbSlcbiAgICAgIG0uc2F2ZVBvc2l0aW9uKClcbiAgICAgIG0ucG9zaXRpb25JbmZvYm94KClcbiAgICAgIEBkcmFnZ2luZ01hcmtlcigpLnJlbW92ZUNsYXNzKCdpcy1kcmFnZ2luZycpXG4gICAgIyBpZiBjbGljayBpcyBvbiB0aGUgY29udGFpbmVyXG4gICAgaWYgJChlLnRhcmdldCkuaGFzQ2xhc3MoUGxhbml0Lm1hcmtlckNvbnRhaW5lckNsYXNzKVxuICAgICAgQG9wdGlvbnMucGxhbml0LmNhbnZhc0NsaWNrKGUsIEBnZXRFdmVudFBvc2l0aW9uKGUpKVxuICAgICMgaWYgY2xpY2sgaXMgb24gdGhlIG1hcmtlcnNcbiAgICBpZihcbiAgICAgICQoZS50YXJnZXQpLmhhc0NsYXNzKFBsYW5pdC5tYXJrZXJDbGFzcykgfHwgXG4gICAgICAkKGUudGFyZ2V0KS5wYXJlbnRzKFwiLiN7UGxhbml0Lm1hcmtlckNsYXNzfVwiKS5sZW5ndGggPiAwXG4gICAgKVxuICAgICAgaWYgJChlLnRhcmdldCkuaGFzQ2xhc3MoUGxhbml0Lm1hcmtlckNsYXNzKVxuICAgICAgICBtYXJrZXIgPSAkKGUudGFyZ2V0KVxuICAgICAgZWxzZVxuICAgICAgICBtYXJrZXIgPSAkKGUudGFyZ2V0KS5wYXJlbnRzKFwiLiN7UGxhbml0Lm1hcmtlckNsYXNzfVwiKS5maXJzdCgpXG4gICAgICBtID0gbmV3IFBsYW5pdC5NYXJrZXIoQGNvbnRhaW5lciwgbWFya2VyLmF0dHIoJ2RhdGEtbWFya2VyJykpXG4gICAgICBAb3B0aW9ucy5wbGFuaXQubWFya2VyQ2xpY2soZSwgbSlcbiAgICB0cnVlXG5cbiAgbW91c2Vtb3ZlOiAoZSkgPT5cbiAgICBtYXJrZXJzID0gQG1hcmtlcnNDb250YWluZXIuZmluZCgnLnBsYW5pdC1tYXJrZXIuaXMtZHJhZ2dpbmcnKVxuXG4gICAgaWYgbWFya2Vycy5sZW5ndGggPiAwXG5cbiAgICAgICMgb25seSB1c2UgZmlyc3QgbWFya2VyIGluIGNhc2UgdGhlcmUgYXJlIG1vcmUgdGhhblxuICAgICAgIyBvbmUgZHJhZ2dpbmdcbiAgICAgICMgXG4gICAgICBtYXJrZXIgPSBtYXJrZXJzLmZpcnN0KClcblxuICAgICAgIyB3ZSBoaWRlIHRoZSBpbmZvYm94IHdoaWxlIGRyYWdnaW5nXG4gICAgICAjIFxuICAgICAgaWYoXG4gICAgICAgIE1hdGguYWJzKGUucGFnZVggLSBtYXJrZXIuYXR0cignZGF0YS1kcmFnLXN0YXJ0LXgnKSkgPiAwIHx8IFxuICAgICAgICBNYXRoLmFicyhlLnBhZ2VZIC0gbWFya2VyLmF0dHIoJ2RhdGEtZHJhZy1zdGFydC15JykpID4gMFxuICAgICAgKVxuICAgICAgICAkKFwiIyN7bWFya2VyLmF0dHIoJ2RhdGEtaW5mb2JveCcpfVwiKS5yZW1vdmVDbGFzcygnYWN0aXZlJylcblxuICAgICAgIyBjYWxjdWxhdGUgcG9zaXRpb25zXG4gICAgICAjIFxuICAgICAgbW91c2VMZWZ0ICAgICA9IGUucGFnZVggLSBAY29udGFpbmVyLm9mZnNldCgpLmxlZnRcbiAgICAgIG1vdXNlVG9wICAgICAgPSBlLnBhZ2VZIC0gQGNvbnRhaW5lci5vZmZzZXQoKS50b3BcbiAgICAgIHBsYW5SaWdodCAgICAgPSBAY29udGFpbmVyLndpZHRoKClcbiAgICAgIHBsYW5Cb3R0b20gICAgPSBAY29udGFpbmVyLmhlaWdodCgpXG4gICAgICBtYXJrZXJMZWZ0ICAgID0gbW91c2VMZWZ0IC0gKG1hcmtlci5vdXRlcldpZHRoKCkgLyAyKVxuICAgICAgbWFya2VyVG9wICAgICA9IG1vdXNlVG9wIC0gKG1hcmtlci5vdXRlckhlaWdodCgpIC8gMilcbiAgICAgIG1hcmtlclJpZ2h0ICAgPSBtb3VzZUxlZnQgKyAobWFya2VyLm91dGVyV2lkdGgoKSAvIDIpXG4gICAgICBtYXJrZXJCb3R0b20gID0gbW91c2VUb3AgKyAobWFya2VyLm91dGVySGVpZ2h0KCkgLyAyKVxuICAgICAgbWFya2VyV2lkdGggICA9IG1hcmtlci5vdXRlcldpZHRoKClcbiAgICAgIG1hcmtlckhlaWdodCAgPSBtYXJrZXIub3V0ZXJIZWlnaHQoKVxuXG4gICAgICAjIGZpbmQgdGhlIGxlZnQgcG9zaXRpb24gb2YgdGhlIG1hcmtlciBiYXNlZCBvblxuICAgICAgIyBwb3NpdGlvbiBvZiB0aGUgbW91c2UgcmVsYXRpdmUgdG8gdGhlIHBsYW5cbiAgICAgICMgXG4gICAgICBpZiBtYXJrZXJMZWZ0IDw9IDBcbiAgICAgICAgbWFya2VyWCA9IDBcbiAgICAgIGVsc2UgaWYgbWFya2VyUmlnaHQgPCBwbGFuUmlnaHRcbiAgICAgICAgbWFya2VyWCA9IG1hcmtlckxlZnRcbiAgICAgIGVsc2VcbiAgICAgICAgbWFya2VyWCA9IHBsYW5SaWdodCAtIG1hcmtlcldpZHRoXG5cbiAgICAgICMgZmluZCB0aGUgbGVmdCBwb3NpdGlvbiBvZiB0aGUgbWFya2VyIGJhc2VkIG9uXG4gICAgICAjIHBvc2l0aW9uIG9mIHRoZSBtb3VzZSByZWxhdGl2ZSB0byB0aGUgcGxhblxuICAgICAgIyBcbiAgICAgIGlmIG1hcmtlclRvcCA8PSAwXG4gICAgICAgIG1hcmtlclkgPSAwXG4gICAgICBlbHNlIGlmIG1hcmtlckJvdHRvbSA8IHBsYW5Cb3R0b21cbiAgICAgICAgbWFya2VyWSA9IG1hcmtlclRvcFxuICAgICAgZWxzZVxuICAgICAgICBtYXJrZXJZID0gcGxhbkJvdHRvbSAtIG1hcmtlckhlaWdodFxuXG4gICAgICAjIHNldCB0aGUgcG9zaXRpb24gb2YgdGhlIG1hcmtlclxuICAgICAgIyBcbiAgICAgIG1hcmtlci5jc3NcbiAgICAgICAgbGVmdDogbWFya2VyWFxuICAgICAgICB0b3A6IG1hcmtlcllcblxuY2xhc3MgUGxhbml0LlBsYW4uWm9vbWFibGVcblxuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBTZXR1cFxuXG4gIGNvbnN0cnVjdG9yOiAoQG9wdGlvbnMpIC0+XG4gICAgIyBkZWZhdWx0IG9wdGlvbnNcbiAgICBAY29udGFpbmVyID0gQG9wdGlvbnMuY29udGFpbmVyXG4gICAgQG1hcmtlcnNDb250YWluZXIgPSBAY29udGFpbmVyLmZpbmQoXCIuI3tQbGFuaXQubWFya2VyQ29udGFpbmVyQ2xhc3N9XCIpXG4gICAgQHpvb21JZCA9IFBsYW5pdC5yYW5kb21TdHJpbmcoKVxuICAgIEBtYXJrZXJzQ29udGFpbmVyLmF0dHIoJ2RhdGEtem9vbS1pZCcsIEB6b29tSWQpXG4gICAgIyBkcmF3IHRoZSBjb250cm9scyBkaW5rdXNcbiAgICBAY29udGFpbmVyLnByZXBlbmQgXCJcIlwiXG4gICAgICA8ZGl2IGNsYXNzPVwicGxhbml0LWNvbnRyb2xzXCI+XG4gICAgICAgIDxhIGhyZWY9XCIjXCIgY2xhc3M9XCJ6b29tXCIgZGF0YS1hY3Rpb249XCJpblwiPis8L2E+XG4gICAgICAgIDxhIGhyZWY9XCIjXCIgY2xhc3M9XCJ6b29tXCIgZGF0YS1hY3Rpb249XCJvdXRcIj4tPC9hPlxuICAgICAgPC9kaXY+XG4gICAgXCJcIlwiXG4gICAgQGNvbnRhaW5lci5maW5kKFwiLnpvb21bZGF0YS1hY3Rpb249J2luJ11cIikuY2xpY2sgKGUpID0+XG4gICAgICBlLnByZXZlbnREZWZhdWx0KClcbiAgICAgIEB6b29tSW4oKVxuICAgIEBjb250YWluZXIuZmluZChcIi56b29tW2RhdGEtYWN0aW9uPSdvdXQnXVwiKS5jbGljayAoZSkgPT5cbiAgICAgIGUucHJldmVudERlZmF1bHQoKVxuICAgICAgQHpvb21PdXQoKVxuICAgICMgYmluZCBkcmFnZ2FibGUgZXZlbnRzXG4gICAgQGNvbnRhaW5lci5vbignZGJsY2xpY2snLCBAZGJsY2xpY2spXG4gICAgQGNvbnRhaW5lci5vbignbW91c2Vkb3duJywgQG1vdXNlZG93bilcbiAgICAkKGRvY3VtZW50KS5vbignbW91c2Vtb3ZlJywgQG1vdXNlbW92ZSlcbiAgICAkKGRvY3VtZW50KS5vbignbW91c2V1cCcsIEBtb3VzZXVwKVxuICAgICMgc2V0IGluaXRpYWwgYmFja2dyb3VuZCBjb29yZGluYXRlc1xuICAgIEBpbWFnZVBvc2l0aW9uID1cbiAgICAgIGxlZnRQeDogICAgICAgICAwXG4gICAgICB0b3BQeDogICAgICAgICAgMFxuICAgICAgd2lkdGg6ICAgICAgICAgIEBtYXJrZXJzQ29udGFpbmVyLndpZHRoKClcbiAgICAgIGhlaWdodDogICAgICAgICBAbWFya2Vyc0NvbnRhaW5lci5oZWlnaHQoKVxuICAgICAgc2NhbGU6ICAgICAgICAgIDFcbiAgICAgIGluY3JlbWVudDogMC41XG4gICAgQHNldEJhY2tncm91bmQoKVxuXG4gICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIEFjdGlvbnNcblxuICBzZXRCYWNrZ3JvdW5kOiA9PlxuICAgIEBtYXJrZXJzQ29udGFpbmVyLmNzc1xuICAgICAgYmFja2dyb3VuZFBvc2l0aW9uOiBcIiN7QGltYWdlUG9zaXRpb24ubGVmdFB4fXB4ICN7QGltYWdlUG9zaXRpb24udG9wUHh9cHhcIlxuICAgICAgYmFja2dyb3VuZFNpemU6IFwiI3tAaW1hZ2VQb3NpdGlvbi5zY2FsZSAqIDEwMC4wfSVcIlxuICAgIEBzZXRNYXJrZXJzKClcblxuICBzZXRNYXJrZXJzOiA9PlxuICAgIG1hcmtlcnMgPSAkKCdkaXYucGxhbml0LW1hcmtlcicpXG4gICAgaWYgbWFya2Vycy5sZW5ndGggPiAwXG4gICAgICBmb3IgbWFya2VyIGluIG1hcmtlcnNcbiAgICAgICAgbGVmdCA9IChAaW1nV2lkdGgoKSAqICgkKG1hcmtlcikuYXR0cignZGF0YS14UGMnKSAvIDEwMCkpICsgXG4gICAgICAgICAgQGltYWdlUG9zaXRpb24ubGVmdFB4IC0gKCQobWFya2VyKS5vdXRlcldpZHRoKCkgLyAyKVxuICAgICAgICB0b3AgPSAoQGltZ0hlaWdodCgpICogKCQobWFya2VyKS5hdHRyKCdkYXRhLXlQYycpIC8gMTAwKSkgKyBcbiAgICAgICAgICBAaW1hZ2VQb3NpdGlvbi50b3BQeCAtICgkKG1hcmtlcikub3V0ZXJIZWlnaHQoKSAvIDIpXG4gICAgICAgICQobWFya2VyKS5jc3NcbiAgICAgICAgICBsZWZ0OiBcIiN7bGVmdH1weFwiXG4gICAgICAgICAgdG9wOiBcIiN7dG9wfXB4XCJcblxuICBwb3NpdGlvbkluZm9ib3hlczogPT5cbiAgICBmb3IgbWFya2VyIGluIEBjb250YWluZXIuZmluZCgnLnBsYW5pdC1tYXJrZXInKVxuICAgICAgbSA9IG5ldyBQbGFuaXQuTWFya2VyKEBjb250YWluZXIsICQobWFya2VyKS5hdHRyKCdkYXRhLW1hcmtlcicpKVxuICAgICAgbS5wb3NpdGlvbkluZm9ib3goKVxuICAgIHRydWVcblxuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBDYWxjdWxhdGlvbnNcblxuICAjIC0tLS0tLS0tLS0gSW1hZ2UgV2lkdGhcblxuICBpbWdXaWR0aDogPT5cbiAgICBwYXJzZUZsb2F0KEBpbWFnZVBvc2l0aW9uLndpZHRoICogQGltYWdlUG9zaXRpb24uc2NhbGUpXG5cbiAgdG1wSW1nV2lkdGg6ID0+XG4gICAgKDEgKyBAaW1hZ2VQb3NpdGlvbi5pbmNyZW1lbnQpICogQGltYWdlUG9zaXRpb24ud2lkdGgoKVxuXG4gIGltZ1dpZHRoQ2xpY2tJbmNyZW1lbnQ6ID0+XG4gICAgcGFyc2VGbG9hdChAaW1hZ2VQb3NpdGlvbi53aWR0aCAqIEBpbWFnZVBvc2l0aW9uLmluY3JlbWVudClcblxuICBpbWdXaWR0aFNjcm9sbEluY3JlbWVudDogPT5cbiAgICBwYXJzZUZsb2F0KEBpbWFnZVBvc2l0aW9uLndpZHRoICogQGltYWdlUG9zaXRpb24uc2Nyb2xsSW5jcmVtZW50KVxuXG4gIGNvbnRhaW5lcldpZHRoOiA9PlxuICAgIHBhcnNlRmxvYXQoQG1hcmtlcnNDb250YWluZXIud2lkdGgoKSlcblxuICAjIC0tLS0tLS0tLS0gTGVmdCAvIFJpZ2h0XG5cbiAgaW1nT2Zmc2V0TGVmdDogPT5cbiAgICBNYXRoLmFicyhcbiAgICAgIHBhcnNlRmxvYXQoQG1hcmtlcnNDb250YWluZXIuY3NzKCdiYWNrZ3JvdW5kUG9zaXRpb24nKS5zcGxpdCgnICcpWzBdKVxuICAgIClcblxuICAjIC0tLS0tLS0tLS0gSGVpZ2h0XG5cbiAgaW1nSGVpZ2h0OiA9PlxuICAgIHBhcnNlRmxvYXQoQGltYWdlUG9zaXRpb24uaGVpZ2h0ICogQGltYWdlUG9zaXRpb24uc2NhbGUpXG5cbiAgdG1wSW1nSGVpZ2h0OiA9PlxuICAgICgxICsgQGltYWdlUG9zaXRpb24uaW5jcmVtZW50KSAqIEBpbWFnZVBvc2l0aW9uLmhlaWdodCgpXG5cbiAgaW1nSGVpZ2h0Q2xpY2tJbmNyZW1lbnQ6ID0+XG4gICAgcGFyc2VGbG9hdChAaW1hZ2VQb3NpdGlvbi5oZWlnaHQgKiBAaW1hZ2VQb3NpdGlvbi5pbmNyZW1lbnQpXG5cbiAgaW1nSGVpZ2h0U2Nyb2xsSW5jcmVtZW50OiA9PlxuICAgIHBhcnNlRmxvYXQoQGltYWdlUG9zaXRpb24uaGVpZ2h0ICogQGltYWdlUG9zaXRpb24uc2Nyb2xsSW5jcmVtZW50KVxuXG4gIGNvbnRhaW5lckhlaWdodDogPT5cbiAgICBwYXJzZUZsb2F0KEBtYXJrZXJzQ29udGFpbmVyLmhlaWdodCgpKVxuXG4gICMgLS0tLS0tLS0tLSBUb3AgLyBCb3R0b21cblxuICBpbWdPZmZzZXRUb3A6ID0+XG4gICAgTWF0aC5hYnMoXG4gICAgICBwYXJzZUZsb2F0KEBtYXJrZXJzQ29udGFpbmVyLmNzcygnYmFja2dyb3VuZFBvc2l0aW9uJykuc3BsaXQoJyAnKVsxXSlcbiAgICApXG5cbiAgIyAtLS0tLS0tLS0tIE90aGVyXG5cbiAgZ2V0RXZlbnRDb250YWluZXJQb3NpdGlvbjogKGUpID0+XG4gICAgbGVmdDogKGUucGFnZVggLSBAY29udGFpbmVyLm9mZnNldCgpLmxlZnQpIC8gQGNvbnRhaW5lcldpZHRoKClcbiAgICB0b3A6ICAoZS5wYWdlWSAtIEBjb250YWluZXIub2Zmc2V0KCkudG9wKSAvIEBjb250YWluZXJIZWlnaHQoKVxuXG4gICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIEV2ZW50c1xuXG4gIGRibGNsaWNrOiAoZSkgPT5cbiAgICBpZiAkKGUudGFyZ2V0KS5hdHRyKCdkYXRhLXpvb20taWQnKSA9PSBAem9vbUlkXG4gICAgICBjbGljayA9IEBnZXRFdmVudENvbnRhaW5lclBvc2l0aW9uKGUpXG4gICAgICBAem9vbUluKCdjbGljaycsIGNsaWNrLmxlZnQsIGNsaWNrLnRvcClcblxuICBtb3VzZWRvd246IChlKSA9PlxuICAgIGlmICQoZS50YXJnZXQpLmF0dHIoJ2RhdGEtem9vbS1pZCcpID09IEB6b29tSWRcbiAgICAgIEBpc0RyYWdnaW5nID0gdHJ1ZVxuICAgICAgY29vcmRzID0gQGdldEV2ZW50Q29udGFpbmVyUG9zaXRpb24oZSlcbiAgICAgIEBkcmFnQ29vcmRzID0gXG4gICAgICAgIHBvaW50UmVmOiBjb29yZHNcbiAgICAgICAgaW1nUmVmOlxuICAgICAgICAgIGxlZnQ6IDAgLSBAaW1nT2Zmc2V0TGVmdCgpXG4gICAgICAgICAgdG9wOiAwIC0gQGltZ09mZnNldFRvcCgpXG4gICAgICAgIG1heDpcbiAgICAgICAgICByaWdodDogKGNvb3Jkcy5sZWZ0ICogQGNvbnRhaW5lcldpZHRoKCkpICsgQGltZ09mZnNldExlZnQoKVxuICAgICAgICAgIGxlZnQ6IChjb29yZHMubGVmdCAqIEBjb250YWluZXJXaWR0aCgpKSAtIChAaW1nV2lkdGgoKSAtIFxuICAgICAgICAgICAgICAgICAgICAgIChAY29udGFpbmVyV2lkdGgoKSArIEBpbWdPZmZzZXRMZWZ0KCkpKVxuICAgICAgICAgIGJvdHRvbTogKGNvb3Jkcy50b3AgKiBAY29udGFpbmVySGVpZ2h0KCkpICsgQGltZ09mZnNldFRvcCgpXG4gICAgICAgICAgdG9wOiAoY29vcmRzLnRvcCAqIEBjb250YWluZXJIZWlnaHQoKSkgLSAoQGltZ0hlaWdodCgpIC0gXG4gICAgICAgICAgICAgICAgICAgICAgKEBjb250YWluZXJIZWlnaHQoKSArIEBpbWdPZmZzZXRUb3AoKSkpXG4gICAgdHJ1ZVxuXG4gIG1vdXNlbW92ZTogKGUpID0+XG4gICAgaWYgQGlzRHJhZ2dpbmdcbiAgICAgIGNvb3JkcyA9IEBnZXRFdmVudENvbnRhaW5lclBvc2l0aW9uKGUpXG4gICAgICBkcmFnTGVmdCA9IGNvb3Jkcy5sZWZ0ICogQGNvbnRhaW5lcldpZHRoKClcbiAgICAgIGRyYWdUb3AgPSBjb29yZHMudG9wICogQGNvbnRhaW5lckhlaWdodCgpXG4gICAgICBpZiBkcmFnTGVmdCA+PSBAZHJhZ0Nvb3Jkcy5tYXgubGVmdCAmJiBkcmFnTGVmdCA8PSBAZHJhZ0Nvb3Jkcy5tYXgucmlnaHRcbiAgICAgICAgbGVmdCA9IChjb29yZHMubGVmdCAtIEBkcmFnQ29vcmRzLnBvaW50UmVmLmxlZnQpICogQGNvbnRhaW5lcldpZHRoKClcbiAgICAgICAgQGltYWdlUG9zaXRpb24ubGVmdFB4ID0gQGRyYWdDb29yZHMuaW1nUmVmLmxlZnQgKyBsZWZ0XG4gICAgICBlbHNlIGlmIGRyYWdMZWZ0IDwgQGRyYWdDb29yZHMubWF4LmxlZnRcbiAgICAgICAgQGltYWdlUG9zaXRpb24ubGVmdFB4ID0gQGNvbnRhaW5lcldpZHRoKCkgLSBAaW1nV2lkdGgoKVxuICAgICAgZWxzZSBpZiBkcmFnTGVmdCA+IEBkcmFnQ29vcmRzLm1heC5yaWdodFxuICAgICAgICBAaW1hZ2VQb3NpdGlvbi5sZWZ0UHggPSAwXG4gICAgICBpZiBkcmFnVG9wID49IEBkcmFnQ29vcmRzLm1heC50b3AgJiYgZHJhZ1RvcCA8PSBAZHJhZ0Nvb3Jkcy5tYXguYm90dG9tXG4gICAgICAgIHRvcCA9IChjb29yZHMudG9wIC0gQGRyYWdDb29yZHMucG9pbnRSZWYudG9wKSAqIEBjb250YWluZXJIZWlnaHQoKVxuICAgICAgICBAaW1hZ2VQb3NpdGlvbi50b3BQeCA9IEBkcmFnQ29vcmRzLmltZ1JlZi50b3AgKyB0b3BcbiAgICAgIGVsc2UgaWYgZHJhZ1RvcCA8IEBkcmFnQ29vcmRzLm1heC50b3BcbiAgICAgICAgQGltYWdlUG9zaXRpb24udG9wUHggPSBAY29udGFpbmVySGVpZ2h0KCkgLSBAaW1nSGVpZ2h0KClcbiAgICAgIGVsc2UgaWYgZHJhZ1RvcCA+IEBkcmFnQ29vcmRzLm1heC5ib3R0b21cbiAgICAgICAgQGltYWdlUG9zaXRpb24udG9wUHggPSAwXG4gICAgICBAc2V0QmFja2dyb3VuZCgpXG4gICAgdHJ1ZVxuXG4gIG1vdXNldXA6IChlKSA9PlxuICAgIEBpc0RyYWdnaW5nID0gZmFsc2VcbiAgICBAcG9zaXRpb25JbmZvYm94ZXMoKVxuICAgIHRydWVcblxuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBab29taW5nXG5cbiAgem9vbUluOiA9PlxuICAgIEBpbWFnZVBvc2l0aW9uLnNjYWxlICA9IEBpbWFnZVBvc2l0aW9uLnNjYWxlICsgQGltYWdlUG9zaXRpb24uaW5jcmVtZW50XG4gICAgQGltYWdlUG9zaXRpb24ubGVmdFB4ID0gLSBAaW1nT2Zmc2V0TGVmdCgpIC0gKEBpbWdXaWR0aENsaWNrSW5jcmVtZW50KCkgLyAyKVxuICAgIEBpbWFnZVBvc2l0aW9uLnRvcFB4ICA9IC0gQGltZ09mZnNldFRvcCgpIC0gKEBpbWdIZWlnaHRDbGlja0luY3JlbWVudCgpIC8gMilcbiAgICBAc2V0QmFja2dyb3VuZCgpXG4gICAgQHBvc2l0aW9uSW5mb2JveGVzKClcblxuICB6b29tT3V0OiAobGVmdCA9IDAuNSwgdG9wID0gMC41KSA9PlxuICAgIGlmIEBpbWFnZVBvc2l0aW9uLnNjYWxlID4gMVxuICAgICAgQGltYWdlUG9zaXRpb24uc2NhbGUgID0gQGltYWdlUG9zaXRpb24uc2NhbGUgLSBAaW1hZ2VQb3NpdGlvbi5pbmNyZW1lbnRcbiAgICAgIGxlZnRQeCA9IC0gQGltZ09mZnNldExlZnQoKSArIChAaW1nV2lkdGhDbGlja0luY3JlbWVudCgpIC8gMilcbiAgICAgIHRvcFB4ICA9IC0gQGltZ09mZnNldFRvcCgpICsgKEBpbWdIZWlnaHRDbGlja0luY3JlbWVudCgpIC8gMilcbiAgICAgIGlmIGxlZnRQeCArIEBpbWdXaWR0aENsaWNrSW5jcmVtZW50KCkgPiAwXG4gICAgICAgIEBpbWFnZVBvc2l0aW9uLmxlZnRQeCA9IDBcbiAgICAgIGVsc2UgaWYgbGVmdFB4IC0gQGltZ1dpZHRoQ2xpY2tJbmNyZW1lbnQoKSA8IEBjb250YWluZXJXaWR0aCgpIC0gQGltZ1dpZHRoKClcbiAgICAgICAgQGltYWdlUG9zaXRpb24ubGVmdFB4ID0gQGNvbnRhaW5lcldpZHRoKCkgLSBAaW1nV2lkdGgoKVxuICAgICAgaWYgdG9wUHggKyBAaW1nSGVpZ2h0Q2xpY2tJbmNyZW1lbnQoKSA+IDBcbiAgICAgICAgQGltYWdlUG9zaXRpb24udG9wUHggPSAwXG4gICAgICBlbHNlIGlmIHRvcFB4IC0gQGltZ0hlaWdodENsaWNrSW5jcmVtZW50KCkgPCBAY29udGFpbmVySGVpZ2h0KCkgLSBAaW1nSGVpZ2h0KClcbiAgICAgICAgQGltYWdlUG9zaXRpb24udG9wUHggPSBAY29udGFpbmVySGVpZ2h0KCkgLSBAaW1nSGVpZ2h0KClcbiAgICAgIEBzZXRCYWNrZ3JvdW5kKClcbiAgICAgIEBwb3NpdGlvbkluZm9ib3hlcygpXG5cbmNsYXNzIFBsYW5pdC5NYXJrZXJcblxuICBjb25zdHJ1Y3RvcjogKEBjb250YWluZXIsIGlkKSAtPlxuXG4gICAgIyBTZXQgT3B0aW9uc1xuICAgIEBtYXJrZXJzQ29udGFpbmVyID0gQGNvbnRhaW5lci5maW5kKFwiLiN7UGxhbml0Lm1hcmtlckNvbnRhaW5lckNsYXNzfVwiKVxuXG4gICAgIyBGaW5kIE1hcmtlclxuICAgIEBtYXJrZXIgPSBAbWFya2Vyc0NvbnRhaW5lci5maW5kKFxuICAgICAgXCIuI3tQbGFuaXQubWFya2VyQ2xhc3N9W2RhdGEtbWFya2VyPScje2lkfSddXCJcbiAgICApLmZpcnN0KClcblxuICAgICMgUmV0dXJuIHRoaXNcbiAgICBAXG5cbiAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gQ2FsY3VsYXRpb25zXG5cbiAgcG9zaXRpb246ID0+XG4gICAgeFB4ID0gQG1hcmtlci5wb3NpdGlvbigpLmxlZnQgKyAoQG1hcmtlci5vdXRlcldpZHRoKCkgLyAyKVxuICAgIHlQeCA9IEBtYXJrZXIucG9zaXRpb24oKS50b3AgKyAoQG1hcmtlci5vdXRlckhlaWdodCgpIC8gMilcbiAgICBpZiBAbWFya2Vyc0NvbnRhaW5lci5jc3MoJ2JhY2tncm91bmRJbWFnZScpXG4gICAgICBzY2FsZSA9IHBhcnNlSW50KEBtYXJrZXJzQ29udGFpbmVyLmNzcygnYmFja2dyb3VuZFNpemUnKSkgLyAxMDBcbiAgICAgIHdJbWcgPSBAY29udGFpbmVyLndpZHRoKCkgKiBzY2FsZVxuICAgICAgaEltZyA9IEBjb250YWluZXIuaGVpZ2h0KCkgKiBzY2FsZVxuICAgICAgeEltZyA9IHBhcnNlSW50KEBtYXJrZXJzQ29udGFpbmVyLmNzcygnYmFja2dyb3VuZFBvc2l0aW9uJykuc3BsaXQoJyAnKVswXSlcbiAgICAgIHlJbWcgPSBwYXJzZUludChAbWFya2Vyc0NvbnRhaW5lci5jc3MoJ2JhY2tncm91bmRQb3NpdGlvbicpLnNwbGl0KCcgJylbMV0pXG4gICAgICB4UGMgPSAoKHhQeCArIE1hdGguYWJzKHhJbWcpKSAvIHdJbWcpICogMTAwXG4gICAgICB5UGMgPSAoKHlQeCArIE1hdGguYWJzKHlJbWcpKSAvIGhJbWcpICogMTAwXG4gICAgZWxzZVxuICAgICAgeFBjID0gKHhQeCAvIEBjb250YWluZXIud2lkdGgoKSkgKiAxMDBcbiAgICAgIHlQYyA9ICh5UHggLyBAY29udGFpbmVyLmhlaWdodCgpKSAqIDEwMFxuICAgIFt4UGMsIHlQY11cblxuICByZWxhdGl2ZVBvc2l0aW9uOiA9PlxuICAgIHhQeCA9IEBtYXJrZXIucG9zaXRpb24oKS5sZWZ0ICsgKEBtYXJrZXIub3V0ZXJXaWR0aCgpIC8gMilcbiAgICB5UHggPSBAbWFya2VyLnBvc2l0aW9uKCkudG9wICsgKEBtYXJrZXIub3V0ZXJIZWlnaHQoKSAvIDIpXG4gICAgeFBjID0gKHhQeCAvIEBjb250YWluZXIud2lkdGgoKSkgKiAxMDBcbiAgICB5UGMgPSAoeVB4IC8gQGNvbnRhaW5lci5oZWlnaHQoKSkgKiAxMDBcbiAgICBbeFBjLCB5UGNdXG5cbiAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gQXR0cmlidXRlc1xuXG4gIGNvbG9yOiA9PlxuICAgIEBtYXJrZXIuY3NzKCdiYWNrZ3JvdW5kQ29sb3InKVxuXG4gIHBsYW5pdElEOiA9PlxuICAgIEBtYXJrZXIuYXR0cignZGF0YS1tYXJrZXInKVxuXG4gIGlkOiA9PlxuICAgIEBtYXJrZXIuYXR0cignZGF0YS1pZCcpXG5cbiAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gSW5mb2JveFxuXG4gIGluZm9ib3hIVE1MOiA9PlxuICAgIGluZm8gPSBAbWFya2VyLmZpbmQoJy5wbGFuaXQtaW5mb2JveCcpXG4gICAgaWYgaW5mby5sZW5ndGggPiAwIHRoZW4gaW5mby5odG1sKCkgZWxzZSBudWxsXG5cbiAgcG9zaXRpb25JbmZvYm94OiA9PlxuICAgIGluZm9ib3ggPSAkKFwiIyN7QG1hcmtlci5hdHRyKCdkYXRhLWluZm9ib3gnKX1cIilcbiAgICBtYXJrZXJDZW50ZXJYID0gKHBhcnNlRmxvYXQoQHJlbGF0aXZlUG9zaXRpb24oKVswXSAvIDEwMCkgKiBAY29udGFpbmVyLndpZHRoKCkpXG4gICAgbWFya2VyQ2VudGVyWSA9IChwYXJzZUZsb2F0KEByZWxhdGl2ZVBvc2l0aW9uKClbMV0gLyAxMDApICogQGNvbnRhaW5lci5oZWlnaHQoKSlcbiAgICBpbmZvTGVmdCA9IG1hcmtlckNlbnRlclggLSAoaW5mb2JveC5vdXRlcldpZHRoKCkgLyAyKVxuICAgIGluZm9Cb3R0b20gPSBAY29udGFpbmVyLmhlaWdodCgpIC0gbWFya2VyQ2VudGVyWSArIChAbWFya2VyLmhlaWdodCgpIC8gMikgKyA1XG4gICAgaW5mb2JveC5jc3NcbiAgICAgIGxlZnQ6IGluZm9MZWZ0XG4gICAgICBib3R0b206IGluZm9Cb3R0b21cbiAgICBAcG9zaXRpb24oKVxuXG4gICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIERyYWdnaW5nXG5cbiAgaXNEcmFnZ2FibGU6ID0+XG4gICAgQG1hcmtlci5oYXNDbGFzcygnZHJhZ2dhYmxlJylcblxuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBBY3Rpb25zXG5cbiAgc2F2ZVBvc2l0aW9uOiA9PlxuICAgIGNvb3JkcyA9IEBwb3NpdGlvbigpXG4gICAgQG1hcmtlci5hdHRyXG4gICAgICAnZGF0YS14UGMnOiBjb29yZHNbMF1cbiAgICAgICdkYXRhLXlQYyc6IGNvb3Jkc1sxXVxuXG4gIHVwZGF0ZTogKG9wdGlvbnMpID0+XG4gICAgaWYgb3B0aW9ucy5jb2xvclxuICAgICAgQG1hcmtlci5jc3MoYmFja2dyb3VuZENvbG9yOiBvcHRpb25zLmNvbG9yKVxuICAgIGlmIG9wdGlvbnMuaW5mb2JveFxuICAgICAgQG1hcmtlci5maW5kKCcucGxhbml0LWluZm9ib3gnKS5odG1sKG9wdGlvbnMuaW5mb2JveClcbiAgICAgIEBwb3NpdGlvbkluZm9ib3goKVxuICAgIGlmIG9wdGlvbnMuZHJhZ2dhYmxlXG4gICAgICBAbWFya2VyLnJlbW92ZUNsYXNzKCdkcmFnZ2FibGUnKVxuICAgICAgQG1hcmtlci5hZGRDbGFzcygnZHJhZ2dhYmxlJykgaWYgb3B0aW9ucy5kcmFnZ2FibGUgPT0gdHJ1ZVxuICAgIGlmIG9wdGlvbnMuY29vcmRzXG4gICAgICBsZWZ0ID0gKChwYXJzZUZsb2F0KG9wdGlvbnMuY29vcmRzWzBdKSAvIDEwMCkgKiBAY29udGFpbmVyLndpZHRoKCkpIC0gMTVcbiAgICAgIHRvcCA9ICgocGFyc2VGbG9hdChvcHRpb25zLmNvb3Jkc1sxXSkgLyAxMDApICogQGNvbnRhaW5lci5oZWlnaHQoKSkgLSAxNVxuICAgICAgQG1hcmtlci5jc3NcbiAgICAgICAgbGVmdDogXCIje2xlZnR9cHhcIlxuICAgICAgICB0b3A6IFwiI3t0b3B9cHhcIlxuXG4gIHJlbW92ZTogPT5cbiAgICBAbWFya2VyLnJlbW92ZSgpXG5cbmNsYXNzIFBsYW5pdC5NYXJrZXIuRXZlbnRzXG5cbiAgY29uc3RydWN0b3I6IChAb3B0aW9ucykgLT5cblxuICAgICMgU2V0IE9wdGlvbnNcbiAgICBAY29udGFpbmVyID0gQG9wdGlvbnMuY29udGFpbmVyXG4gICAgQG1hcmtlcnNDb250YWluZXIgPSBAY29udGFpbmVyLmZpbmQoXCIuI3tQbGFuaXQubWFya2VyQ29udGFpbmVyQ2xhc3N9XCIpXG5cbiAgICAjIEZpbmQgTWFya2VyXG4gICAgQG1hcmtlciA9IEBtYXJrZXJzQ29udGFpbmVyLmZpbmQoXG4gICAgICBcIi4je1BsYW5pdC5tYXJrZXJDbGFzc31bZGF0YS1tYXJrZXI9JyN7QG9wdGlvbnMucGxhbml0SUR9J11cIlxuICAgICkuZmlyc3QoKVxuICAgIEBtYXJrZXJPYmogPSBuZXcgUGxhbml0Lk1hcmtlcihAY29udGFpbmVyLCBAb3B0aW9ucy5wbGFuaXRJRClcblxuICAgICMgRHJhZ2dhYmxlXG4gICAgaWYgQG9wdGlvbnMuZHJhZ2dhYmxlXG4gICAgICBAbWFya2VyLmFkZENsYXNzKCdkcmFnZ2FibGUnKVxuICAgICAgQG1hcmtlci5vbiAnbW91c2Vkb3duJywgKGUpID0+XG4gICAgICAgIGlmIGUud2hpY2ggPT0gMVxuICAgICAgICAgIG1hcmtlciA9ICQoZS50YXJnZXQpLmNsb3Nlc3QoJy5wbGFuaXQtbWFya2VyJylcbiAgICAgICAgICBtYXJrZXIuYWRkQ2xhc3MoJ2lzLWRyYWdnaW5nJylcbiAgICAgICAgICBtYXJrZXIuYXR0clxuICAgICAgICAgICAgJ2RhdGEtZHJhZy1zdGFydC14JzogZS5wYWdlWFxuICAgICAgICAgICAgJ2RhdGEtZHJhZy1zdGFydC15JzogZS5wYWdlWVxuXG4gICAgIyBJbmZvYm94XG4gICAgaWYgQG9wdGlvbnMuaW5mb2JveFxuICAgICAgaWQgPSBQbGFuaXQucmFuZG9tU3RyaW5nKDE2KVxuICAgICAgQGNvbnRhaW5lci5maW5kKFwiLiN7UGxhbml0LmluZm9ib3hDb250YWluZXJDbGFzc31cIikuYXBwZW5kIFwiXCJcIlxuICAgICAgICA8ZGl2IGNsYXNzPVwicGxhbml0LWluZm9ib3hcIiBpZD1cImluZm8tI3tpZH1cIj4je0BvcHRpb25zLmluZm9ib3h9PC9kaXY+XG4gICAgICAgICAgXCJcIlwiXG4gICAgICBAbWFya2VyLmF0dHIoJ2RhdGEtaW5mb2JveCcsIFwiaW5mby0je2lkfVwiKVxuICAgICAgQG1hcmtlck9iai5wb3NpdGlvbkluZm9ib3goKVxuICAgICAgQG1hcmtlci5jbGljayAoZSkgPT5cbiAgICAgICAgaWYoXG4gICAgICAgICAgTWF0aC5hYnMoZS5wYWdlWCAtIEBtYXJrZXIuYXR0cignZGF0YS1kcmFnLXN0YXJ0LXgnKSkgPCAxICYmXG4gICAgICAgICAgTWF0aC5hYnMoZS5wYWdlWSAtIEBtYXJrZXIuYXR0cignZGF0YS1kcmFnLXN0YXJ0LXknKSkgPCAxXG4gICAgICAgIClcbiAgICAgICAgICBtYXJrZXIgPSAkKGUudGFyZ2V0KS5jbG9zZXN0KCcucGxhbml0LW1hcmtlcicpXG4gICAgICAgICAgJChcIiMje21hcmtlci5hdHRyKCdkYXRhLWluZm9ib3gnKX1cIikudG9nZ2xlQ2xhc3MoJ2FjdGl2ZScpXG5cbiAgbWFya2VyczogLT5cbiAgICBAbWFya2Vyc0NvbnRhaW5lci5maW5kKCcucGxhbml0LW1hcmtlcicpXG5cbiAgZHJhZ2dpbmdNYXJrZXI6IC0+XG4gICAgQG1hcmtlcnNDb250YWluZXIuZmluZCgnLnBsYW5pdC1tYXJrZXIuaXMtZHJhZ2dpbmcnKVxuXG5jbGFzcyBQbGFuaXQuTWFya2VyLkNyZWF0b3JcblxuICBjb25zdHJ1Y3RvcjogKEBvcHRpb25zKSAtPlxuICAgICMgU2V0IE9wdGlvbnNcbiAgICBAY29udGFpbmVyID0gQG9wdGlvbnMuY29udGFpbmVyXG4gICAgQG1hcmtlcnNDb250YWluZXIgPSBAY29udGFpbmVyLmZpbmQoXCIuI3tQbGFuaXQubWFya2VyQ29udGFpbmVyQ2xhc3N9XCIpLmZpcnN0KClcbiAgICB1bmxlc3MgQG9wdGlvbnMucGxhbml0SURcbiAgICAgIEBvcHRpb25zLnBsYW5pdElEID0gUGxhbml0LnJhbmRvbVN0cmluZygyMClcblxuICAgICMgQWRkIE1hcmtlclxuICAgIGlmIEBvcHRpb25zLmNvbG9yIHRoZW4gY29sb3IgPSBAb3B0aW9ucy5jb2xvciBlbHNlIGNvbG9yID0gJyNGQzVCM0YnXG5cbiAgICBsZWZ0ID0gKChwYXJzZUZsb2F0KEBvcHRpb25zLmNvb3Jkc1swXSkgLyAxMDApICogQGNvbnRhaW5lci53aWR0aCgpKSAtIDE1XG4gICAgdG9wID0gKChwYXJzZUZsb2F0KEBvcHRpb25zLmNvb3Jkc1sxXSkgLyAxMDApICogQGNvbnRhaW5lci5oZWlnaHQoKSkgLSAxNVxuICAgIEBtYXJrZXJzQ29udGFpbmVyLmFwcGVuZChcbiAgICAgICQoJzxkaXY+PGRpdiBjbGFzcz1cInBsYW5pdC1tYXJrZXItY29udGVudFwiPjwvZGl2PjwvZGl2PicpXG4gICAgICAgIC5hZGRDbGFzcygncGxhbml0LW1hcmtlcicpXG4gICAgICAgIC5hdHRyXG4gICAgICAgICAgJ2RhdGEtbWFya2VyJzogQG9wdGlvbnMucGxhbml0SURcbiAgICAgICAgICAnZGF0YS14UGMnOiBAb3B0aW9ucy5jb29yZHNbMF1cbiAgICAgICAgICAnZGF0YS15UGMnOiBAb3B0aW9ucy5jb29yZHNbMV1cbiAgICAgICAgLmNzc1xuICAgICAgICAgIGxlZnQ6IFwiI3tsZWZ0fXB4XCJcbiAgICAgICAgICB0b3A6IFwiI3t0b3B9cHhcIlxuICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogY29sb3JcbiAgICApXG4gICAgaWYgQG9wdGlvbnMuaWRcbiAgICAgIEBtYXJrZXJzQ29udGFpbmVyLmZpbmQoJy5wbGFuaXQtbWFya2VyJykubGFzdCgpLmF0dHJcbiAgICAgICAgJ2RhdGEtaWQnOiBAb3B0aW9ucy5pZFxuICAgIGlmIEBvcHRpb25zLmNsYXNzXG4gICAgICBAbWFya2Vyc0NvbnRhaW5lci5maW5kKCcucGxhbml0LW1hcmtlcicpLmxhc3QoKS5hZGRDbGFzcyhAb3B0aW9ucy5jbGFzcylcblxuICAgICMgQmluZCBFdmVudHMgKGluIGEgc2VwYXJhdGUgY2xhc3MpXG4gICAgbmV3IFBsYW5pdC5NYXJrZXIuRXZlbnRzKEBvcHRpb25zKVxuXG4gICAgIyBSZXR1cm4gYSBuZXcgaW5zdGFuY2Ugb2YgdGhpcyBtYXJrZXJcbiAgICBuZXcgUGxhbml0Lk1hcmtlcihAY29udGFpbmVyLCBAb3B0aW9ucy5wbGFuaXRJRClcbiJdfQ==