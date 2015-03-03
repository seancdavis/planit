var Planit,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

Planit = (function() {
  function Planit() {
    this.canvasClick = __bind(this.canvasClick, this);
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

  Marker.prototype.id = function() {
    return this.marker.attr('data-marker');
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
    this.marker = this.markersContainer.find("." + Planit.markerClass + "[data-marker='" + this.options.id + "']").first();
    this.markerObj = new Planit.Marker(this.container, this.options.id);
    if (this.options.draggable) {
      this.marker.addClass('draggable');
      this.marker.on('mousedown', (function(_this) {
        return function(e) {
          var marker;
          marker = $(e.target).closest('.planit-marker');
          marker.addClass('is-dragging');
          return marker.attr({
            'data-drag-start-x': e.pageX,
            'data-drag-start-y': e.pageY
          });
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
    if (!this.options.id) {
      this.options.id = Planit.randomString(20);
    }
    if (this.options.color) {
      color = this.options.color;
    } else {
      color = '#FC5B3F';
    }
    left = ((parseFloat(this.options.coords[0]) / 100) * this.container.width()) - 15;
    top = ((parseFloat(this.options.coords[1]) / 100) * this.container.height()) - 15;
    this.markersContainer.append($('<div><div class="planit-marker-content"></div></div>').addClass('planit-marker').attr({
      'data-marker': this.options.id,
      'data-xPc': this.options.coords[0],
      'data-yPc': this.options.coords[1]
    }).css({
      left: left + "px",
      top: top + "px",
      backgroundColor: color
    }));
    new Planit.Marker.Events(this.options);
    new Planit.Marker(this.container, this.options.id);
  }

  return Creator;

})();

//# sourceMappingURL=data:application/json;base64,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QUFDLENBQUEsT0FBTyxDQUFDLE1BQU8sQ0FBQSxDQUFBLENBQTNCLENBQUEsR0FBaUMsR0FBbEMsQ0FBQSxHQUF5QyxJQUFDLENBQUEsU0FBUyxDQUFDLE1BQVgsQ0FBQSxDQUExQyxDQUFBLEdBQWlFLEVBVHZFLENBQUE7QUFBQSxJQVVBLElBQUMsQ0FBQSxnQkFBZ0IsQ0FBQyxNQUFsQixDQUNFLENBQUEsQ0FBRyxzREFBSCxDQUNFLENBQUMsUUFESCxDQUNhLGVBRGIsQ0FFRSxDQUFDLElBRkgsQ0FHSztBQUFBLE1BQUEsYUFBQSxFQUFjLElBQUMsQ0FBQSxPQUFPLENBQUMsRUFBdkI7QUFBQSxNQUNBLFVBQUEsRUFBVyxJQUFDLENBQUEsT0FBTyxDQUFDLE1BQU8sQ0FBQSxDQUFBLENBRDNCO0FBQUEsTUFFQSxVQUFBLEVBQVcsSUFBQyxDQUFBLE9BQU8sQ0FBQyxNQUFPLENBQUEsQ0FBQSxDQUYzQjtLQUhMLENBTUUsQ0FBQyxHQU5ILENBT0k7QUFBQSxNQUFBLElBQUEsRUFBUyxJQUFELEdBQU0sSUFBZDtBQUFBLE1BQ0EsR0FBQSxFQUFRLEdBQUQsR0FBSyxJQURaO0FBQUEsTUFFQSxlQUFBLEVBQWlCLEtBRmpCO0tBUEosQ0FERixDQVZBLENBQUE7QUFBQSxJQXdCSSxJQUFBLE1BQU0sQ0FBQyxNQUFNLENBQUMsTUFBZCxDQUFxQixJQUFDLENBQUEsT0FBdEIsQ0F4QkosQ0FBQTtBQUFBLElBMkJJLElBQUEsTUFBTSxDQUFDLE1BQVAsQ0FBYyxJQUFDLENBQUEsU0FBZixFQUEwQixJQUFDLENBQUEsT0FBTyxDQUFDLEVBQW5DLENBM0JKLENBRlc7RUFBQSxDQUFiOztpQkFBQTs7SUE5a0JGLENBQUEiLCJmaWxlIjoicGxhbml0LXRtcC5qcyIsInNvdXJjZVJvb3QiOiIvc291cmNlLyIsInNvdXJjZXNDb250ZW50IjpbImNsYXNzIFBsYW5pdFxuXG4gICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIFJlZnNcblxuICBAY29udGFpbmVyQ2xhc3M6ICAgICAgICAncGxhbml0LWNvbnRhaW5lcidcbiAgQG1hcmtlckNvbnRhaW5lckNsYXNzOiAgJ3BsYW5pdC1tYXJrZXJzLWNvbnRhaW5lcidcbiAgQG1hcmtlckNsYXNzOiAgICAgICAgICAgJ3BsYW5pdC1tYXJrZXInXG4gIEBtYXJrZXJDb250ZW50Q2xhc3M6ICAgICdwbGFuaXQtbWFya2VyLWNvbnRlbnQnXG4gIEBpbmZvYm94Q29udGFpbmVyQ2xhc3M6ICdwbGFuaXQtaW5mb2JveC1jb250YWluZXInXG5cbiAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gRGVmYXVsdCBPcHRpb25zXG5cbiAgbmV3OiAoQG9wdGlvbnMgPSB7fSkgLT5cbiAgICAjIFNldCBPcHRpb25zXG4gICAgaWYgQG9wdGlvbnMuY29udGFpbmVyXG4gICAgICBAb3B0aW9ucy5jb250YWluZXIgPSAkKFwiIyN7QG9wdGlvbnMuY29udGFpbmVyfVwiKVxuICAgIGVsc2VcbiAgICAgIEBvcHRpb25zLmNvbnRhaW5lciA9ICQoJyNwbGFuaXQnKSBcblxuICAgICMgSW5pdGlhbGl6ZSBDb250YWluZXJcbiAgICBAb3B0aW9ucy5jb250YWluZXIuYWRkQ2xhc3MoJ3BsYW5pdC1jb250YWluZXInKVxuICAgIEBvcHRpb25zLmNvbnRhaW5lci5hcHBlbmQgXCJcIlwiXG4gICAgICA8ZGl2IGNsYXNzPVwiI3tQbGFuaXQuaW5mb2JveENvbnRhaW5lckNsYXNzfVwiPjwvZGl2PlxuICAgICAgPGRpdiBjbGFzcz1cIiN7UGxhbml0Lm1hcmtlckNvbnRhaW5lckNsYXNzfVwiPjwvZGl2PlxuICAgICAgICBcIlwiXCJcblxuICAgICMgUmVmc1xuICAgIEBjb250YWluZXIgPSBAb3B0aW9ucy5jb250YWluZXJcbiAgICBAbWFya2Vyc0NvbnRhaW5lciA9IEBjb250YWluZXIuZmluZChcIi4je1BsYW5pdC5tYXJrZXJDb250YWluZXJDbGFzc31cIikuZmlyc3QoKVxuXG4gICAgIyBBZGQgaW1hZ2UgYW5kIHpvb20gKGlmIG5lY2Vzc2FyeSlcbiAgICBpZiBAb3B0aW9ucy5pbWFnZSAmJiBAb3B0aW9ucy5pbWFnZS51cmxcbiAgICAgIEBjb250YWluZXIuYXBwZW5kKFwiXCJcIjxpbWcgc3JjPVwiI3tAb3B0aW9ucy5pbWFnZS51cmx9XCI+XCJcIlwiKVxuICAgICAgQG1hcmtlcnNDb250YWluZXIuY3NzXG4gICAgICAgIGJhY2tncm91bmRJbWFnZTogXCJ1cmwoJyN7QG9wdGlvbnMuaW1hZ2UudXJsfScpXCJcbiAgICAgIEBpbml0QmFja2dyb3VuZEltYWdlKClcblxuICAgICMgQWRkIE1hcmtlcnMgKGlmIG5lY2Vzc2FyeSlcbiAgICBpZiBAb3B0aW9ucy5tYXJrZXJzICYmIEBvcHRpb25zLm1hcmtlcnMubGVuZ3RoID4gMFxuICAgICAgQGluaXRNYXJrZXJzKClcblxuICAgICMgQmluZCBEb2N1bWVudCBFdmVudHNcbiAgICBuZXcgUGxhbml0LlBsYW4uRXZlbnRzXG4gICAgICBjb250YWluZXI6IEBjb250YWluZXJcbiAgICAgIHBsYW5pdDogQFxuXG4gICAgIyBSZXR1cm4gdGhpcyBQbGFuaXQgb2JqZWN0XG4gICAgQFxuXG4gIGluaXRCYWNrZ3JvdW5kSW1hZ2U6ID0+XG4gICAgaW1nID0gQGNvbnRhaW5lci5maW5kKCdpbWcnKS5maXJzdCgpXG4gICAgaW1nSGVpZ2h0ID0gaW1nLmhlaWdodCgpXG4gICAgaWYgaW1nSGVpZ2h0ID4gMCAmJiBpbWcud2lkdGgoKSA+IDBcbiAgICAgIEBjb250YWluZXIuY3NzXG4gICAgICAgIGhlaWdodDogaW1nSGVpZ2h0XG4gICAgICBpbWcucmVtb3ZlKClcbiAgICAgIGlmIEBvcHRpb25zLmltYWdlLnpvb21cbiAgICAgICAgbmV3IFBsYW5pdC5QbGFuLlpvb21hYmxlXG4gICAgICAgICAgY29udGFpbmVyOiBAY29udGFpbmVyXG4gICAgICBAaW1nTG9hZGVkID0gdHJ1ZVxuICAgIGVsc2VcbiAgICAgIHNldFRpbWVvdXQoQGluaXRCYWNrZ3JvdW5kSW1hZ2UsIDI1MClcblxuICBpbml0TWFya2VyczogPT5cbiAgICBpZiBAb3B0aW9ucy5pbWFnZSAmJiBAb3B0aW9ucy5pbWFnZS51cmxcbiAgICAgIGlmIEBpbWdMb2FkZWQgPT0gdHJ1ZVxuICAgICAgICBAYWRkTWFya2VyKG1hcmtlcikgZm9yIG1hcmtlciBpbiBAb3B0aW9ucy5tYXJrZXJzXG4gICAgICBlbHNlXG4gICAgICAgIHNldFRpbWVvdXQoQGluaXRNYXJrZXJzLCAyNTApXG4gICAgZWxzZVxuICAgICAgQGFkZE1hcmtlcihtYXJrZXIpIGZvciBtYXJrZXIgaW4gQG9wdGlvbnMubWFya2Vyc1xuXG4gICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIEFkZCBBIE1hcmtlclxuXG4gIGFkZE1hcmtlcjogKG9wdGlvbnMpID0+XG4gICAgb3B0aW9ucy5jb250YWluZXIgPSBAY29udGFpbmVyXG4gICAgbmV3IFBsYW5pdC5NYXJrZXIuQ3JlYXRvcihvcHRpb25zKVxuXG4gICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIFJldHJpZXZlIERhdGFcblxuICBnZXRNYXJrZXI6IChpZCkgPT5cbiAgICBuZXcgUGxhbml0Lk1hcmtlcihAY29udGFpbmVyLCBpZClcblxuICBnZXRBbGxNYXJrZXJzOiAoKSA9PlxuICAgIHBsYW4gPSBuZXcgUGxhbml0LlBsYW4oQGNvbnRhaW5lcilcbiAgICBwbGFuLmdldEFsbE1hcmtlcnMoKVxuXG4gICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIEV2ZW50IENhbGxiYWNrc1xuXG4gIG1hcmtlckRyYWdFbmQ6IChldmVudCwgbWFya2VyKSA9PlxuICAgIGlmIEBvcHRpb25zLm1hcmtlckRyYWdFbmRcbiAgICAgIEBvcHRpb25zLm1hcmtlckRyYWdFbmQoZXZlbnQsIG1hcmtlcilcblxuICBjYW52YXNDbGljazogKGV2ZW50LCBjb29yZHMpID0+XG4gICAgaWYgQG9wdGlvbnMuY2FudmFzQ2xpY2tcbiAgICAgIEBvcHRpb25zLmNhbnZhc0NsaWNrKGV2ZW50LCBjb29yZHMpXG5cbiAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gQ2xhc3MgTWV0aG9kc1xuXG4gIEByYW5kb21TdHJpbmc6IChsZW5ndGggPSAxNikgLT5cbiAgICBzdHIgPSBNYXRoLnJhbmRvbSgpLnRvU3RyaW5nKDM2KS5zbGljZSgyKSBcbiAgICBzdHIgPSBzdHIgKyBNYXRoLnJhbmRvbSgpLnRvU3RyaW5nKDM2KS5zbGljZSgyKVxuICAgIHN0ci5zdWJzdHJpbmcoMCwgbGVuZ3RoIC0gMSlcblxuIyBzZXQgdGhpcyBjbGFzcyB0byBhIGdsb2JhbCBgcGxhbml0YCB2YXJpYWJsZVxud2luZG93LnBsYW5pdCA9IG5ldyBQbGFuaXRcblxuY2xhc3MgUGxhbml0LlBsYW5cblxuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBTZXR1cFxuXG4gIGNvbnN0cnVjdG9yOiAoQGNvbnRhaW5lcikgLT5cbiAgICBAbWFya2Vyc0NvbnRhaW5lciA9IEBjb250YWluZXIuZmluZChcIi4je1BsYW5pdC5tYXJrZXJDb250YWluZXJDbGFzc31cIikuZmlyc3QoKVxuXG4gICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIEdldCBBbGwgTWFya2Vyc1xuXG4gIGdldEFsbE1hcmtlcnM6ICgpID0+XG4gICAgbWFya2VycyA9IFtdXG4gICAgZm9yIG1hcmtlciBpbiBAbWFya2Vyc0NvbnRhaW5lci5maW5kKCcucGxhbml0LW1hcmtlcicpXG4gICAgICBtID0gbmV3IFBsYW5pdC5NYXJrZXIoQGNvbnRhaW5lciwgJChtYXJrZXIpLmF0dHIoJ2RhdGEtbWFya2VyJykpXG4gICAgICBtYXJrZXIgPVxuICAgICAgICAjIGNvb3JkczogW20ucG9zaXRpb24oKS5sZWZ0LCBtLnBvc2l0aW9uKCkudG9wXVxuICAgICAgICBjb29yZHM6IG0ucG9zaXRpb24oKVxuICAgICAgICBkcmFnZ2FibGU6IG0uaXNEcmFnZ2FibGUoKVxuICAgICAgICBjb2xvcjogbS5jb2xvcigpXG4gICAgICBtYXJrZXIuaW5mb2JveCA9IG0uaW5mb2JveEhUTUwoKSBpZiBtLmluZm9ib3hIVE1MKClcbiAgICAgIG1hcmtlcnMucHVzaChtYXJrZXIpXG4gICAgbWFya2Vyc1xuXG5jbGFzcyBQbGFuaXQuUGxhbi5FdmVudHNcblxuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBTZXR1cFxuXG4gIGNvbnN0cnVjdG9yOiAoQG9wdGlvbnMpIC0+XG5cbiAgICAjIGRlZmF1bHQgb3B0aW9uc1xuICAgIEBjb250YWluZXIgPSBAb3B0aW9ucy5jb250YWluZXJcbiAgICBAbWFya2Vyc0NvbnRhaW5lciA9IEBjb250YWluZXIuZmluZChcIi4je1BsYW5pdC5tYXJrZXJDb250YWluZXJDbGFzc31cIilcblxuICAgICMgYmluZCBkcmFnZ2FibGUgZXZlbnRzXG4gICAgJChkb2N1bWVudCkub24oJ21vdXNlbW92ZScsIEBtb3VzZW1vdmUpXG4gICAgJChkb2N1bWVudCkub24oJ21vdXNldXAnLCBAbW91c2V1cClcblxuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBSZWZzXG5cbiAgbWFya2VyczogPT5cbiAgICBAbWFya2Vyc0NvbnRhaW5lci5maW5kKCcucGxhbml0LW1hcmtlcicpXG5cbiAgZHJhZ2dpbmdNYXJrZXI6ID0+XG4gICAgQG1hcmtlcnNDb250YWluZXIuZmluZCgnLnBsYW5pdC1tYXJrZXIuaXMtZHJhZ2dpbmcnKVxuXG4gIGdldEV2ZW50UG9zaXRpb246IChlKSA9PlxuICAgICMgY29udGFpbmVyIGRpbWVuc2lvbnNcbiAgICB3Q29udCA9IHBhcnNlRmxvYXQoQG1hcmtlcnNDb250YWluZXIud2lkdGgoKSlcbiAgICBoQ29udCA9IHBhcnNlRmxvYXQoQG1hcmtlcnNDb250YWluZXIuaGVpZ2h0KCkpXG4gICAgaWYoXG4gICAgICBAbWFya2Vyc0NvbnRhaW5lci5jc3MoJ2JhY2tncm91bmRJbWFnZScpICYmXG4gICAgICBAbWFya2Vyc0NvbnRhaW5lci5jc3MoJ2JhY2tncm91bmRJbWFnZScpICE9ICdub25lJ1xuICAgIClcbiAgICAgICMgaWYgdGhlcmUgaXMgYW4gaW1hZ2UsIHdlIG5lZWQgdG8gY2FsY3VsYXRlIHdpdGggaW1hZ2UgaW4gbWluZFxuICAgICAgeFB4ID0gZS5wYWdlWCAtIEBjb250YWluZXIub2Zmc2V0KCkubGVmdFxuICAgICAgeVB4ID0gZS5wYWdlWSAtIEBjb250YWluZXIub2Zmc2V0KCkudG9wXG4gICAgICBzY2FsZSA9IHBhcnNlSW50KEBtYXJrZXJzQ29udGFpbmVyLmNzcygnYmFja2dyb3VuZFNpemUnKSkgLyAxMDBcbiAgICAgIHdJbWcgPSBAY29udGFpbmVyLndpZHRoKCkgKiBzY2FsZVxuICAgICAgaEltZyA9IEBjb250YWluZXIuaGVpZ2h0KCkgKiBzY2FsZVxuICAgICAgeEltZyA9IHBhcnNlSW50KEBtYXJrZXJzQ29udGFpbmVyLmNzcygnYmFja2dyb3VuZFBvc2l0aW9uJykuc3BsaXQoJyAnKVswXSlcbiAgICAgIHlJbWcgPSBwYXJzZUludChAbWFya2Vyc0NvbnRhaW5lci5jc3MoJ2JhY2tncm91bmRQb3NpdGlvbicpLnNwbGl0KCcgJylbMV0pXG4gICAgICB4UGMgPSAoKHhQeCArIE1hdGguYWJzKHhJbWcpKSAvIHdJbWcpICogMTAwXG4gICAgICB5UGMgPSAoKHlQeCArIE1hdGguYWJzKHlJbWcpKSAvIGhJbWcpICogMTAwXG4gICAgZWxzZVxuICAgICAgIyBvciB3ZSBjYW4ganVzdCBsb29rIGF0IHRoZSBjb250YWluZXJcbiAgICAgIHhQYyA9IChlLnBhZ2VYIC0gQGNvbnRhaW5lci5vZmZzZXQoKS5sZWZ0KSAvIHdDb250XG4gICAgICB5UGMgPSAgKGUucGFnZVkgLSBAY29udGFpbmVyLm9mZnNldCgpLnRvcCkgLyBoQ29udFxuICAgIFt4UGMsIHlQY11cblxuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBFdmVudHNcblxuICBtb3VzZXVwOiAoZSkgPT5cbiAgICAjIGRlYWxpbmcgd2l0aCBtYXJrZXJzLCBlc3AuIGRyYWdnaW5nIG1hcmtlcnNcbiAgICBtYXJrZXIgPSBAbWFya2Vyc0NvbnRhaW5lci5maW5kKCcuaXMtZHJhZ2dpbmcnKS5maXJzdCgpXG4gICAgaWYgQGRyYWdnaW5nTWFya2VyKCkubGVuZ3RoID4gMFxuICAgICAgbSA9IG5ldyBQbGFuaXQuTWFya2VyKEBjb250YWluZXIsIG1hcmtlci5hdHRyKCdkYXRhLW1hcmtlcicpKVxuICAgICAgQG9wdGlvbnMucGxhbml0Lm1hcmtlckRyYWdFbmQoZSwgbSlcbiAgICAgIG0uc2F2ZVBvc2l0aW9uKClcbiAgICAgIG0ucG9zaXRpb25JbmZvYm94KClcbiAgICAgIEBkcmFnZ2luZ01hcmtlcigpLnJlbW92ZUNsYXNzKCdpcy1kcmFnZ2luZycpXG4gICAgIyBpZiBjbGljayBpcyBvbiB0aGUgY29udGFpbmVyXG4gICAgaWYgJChlLnRhcmdldCkuaGFzQ2xhc3MoUGxhbml0Lm1hcmtlckNvbnRhaW5lckNsYXNzKVxuICAgICAgQG9wdGlvbnMucGxhbml0LmNhbnZhc0NsaWNrKGUsIEBnZXRFdmVudFBvc2l0aW9uKGUpKVxuICAgIHRydWVcblxuICBtb3VzZW1vdmU6IChlKSA9PlxuICAgIG1hcmtlcnMgPSBAbWFya2Vyc0NvbnRhaW5lci5maW5kKCcucGxhbml0LW1hcmtlci5pcy1kcmFnZ2luZycpXG5cbiAgICBpZiBtYXJrZXJzLmxlbmd0aCA+IDBcblxuICAgICAgIyBvbmx5IHVzZSBmaXJzdCBtYXJrZXIgaW4gY2FzZSB0aGVyZSBhcmUgbW9yZSB0aGFuXG4gICAgICAjIG9uZSBkcmFnZ2luZ1xuICAgICAgIyBcbiAgICAgIG1hcmtlciA9IG1hcmtlcnMuZmlyc3QoKVxuXG4gICAgICAjIHdlIGhpZGUgdGhlIGluZm9ib3ggd2hpbGUgZHJhZ2dpbmdcbiAgICAgICMgXG4gICAgICBpZihcbiAgICAgICAgTWF0aC5hYnMoZS5wYWdlWCAtIG1hcmtlci5hdHRyKCdkYXRhLWRyYWctc3RhcnQteCcpKSA+IDAgfHwgXG4gICAgICAgIE1hdGguYWJzKGUucGFnZVkgLSBtYXJrZXIuYXR0cignZGF0YS1kcmFnLXN0YXJ0LXknKSkgPiAwXG4gICAgICApXG4gICAgICAgICQoXCIjI3ttYXJrZXIuYXR0cignZGF0YS1pbmZvYm94Jyl9XCIpLnJlbW92ZUNsYXNzKCdhY3RpdmUnKVxuXG4gICAgICAjIGNhbGN1bGF0ZSBwb3NpdGlvbnNcbiAgICAgICMgXG4gICAgICBtb3VzZUxlZnQgICAgID0gZS5wYWdlWCAtIEBjb250YWluZXIub2Zmc2V0KCkubGVmdFxuICAgICAgbW91c2VUb3AgICAgICA9IGUucGFnZVkgLSBAY29udGFpbmVyLm9mZnNldCgpLnRvcFxuICAgICAgcGxhblJpZ2h0ICAgICA9IEBjb250YWluZXIud2lkdGgoKVxuICAgICAgcGxhbkJvdHRvbSAgICA9IEBjb250YWluZXIuaGVpZ2h0KClcbiAgICAgIG1hcmtlckxlZnQgICAgPSBtb3VzZUxlZnQgLSAobWFya2VyLm91dGVyV2lkdGgoKSAvIDIpXG4gICAgICBtYXJrZXJUb3AgICAgID0gbW91c2VUb3AgLSAobWFya2VyLm91dGVySGVpZ2h0KCkgLyAyKVxuICAgICAgbWFya2VyUmlnaHQgICA9IG1vdXNlTGVmdCArIChtYXJrZXIub3V0ZXJXaWR0aCgpIC8gMilcbiAgICAgIG1hcmtlckJvdHRvbSAgPSBtb3VzZVRvcCArIChtYXJrZXIub3V0ZXJIZWlnaHQoKSAvIDIpXG4gICAgICBtYXJrZXJXaWR0aCAgID0gbWFya2VyLm91dGVyV2lkdGgoKVxuICAgICAgbWFya2VySGVpZ2h0ICA9IG1hcmtlci5vdXRlckhlaWdodCgpXG5cbiAgICAgICMgZmluZCB0aGUgbGVmdCBwb3NpdGlvbiBvZiB0aGUgbWFya2VyIGJhc2VkIG9uXG4gICAgICAjIHBvc2l0aW9uIG9mIHRoZSBtb3VzZSByZWxhdGl2ZSB0byB0aGUgcGxhblxuICAgICAgIyBcbiAgICAgIGlmIG1hcmtlckxlZnQgPD0gMFxuICAgICAgICBtYXJrZXJYID0gMFxuICAgICAgZWxzZSBpZiBtYXJrZXJSaWdodCA8IHBsYW5SaWdodFxuICAgICAgICBtYXJrZXJYID0gbWFya2VyTGVmdFxuICAgICAgZWxzZVxuICAgICAgICBtYXJrZXJYID0gcGxhblJpZ2h0IC0gbWFya2VyV2lkdGhcblxuICAgICAgIyBmaW5kIHRoZSBsZWZ0IHBvc2l0aW9uIG9mIHRoZSBtYXJrZXIgYmFzZWQgb25cbiAgICAgICMgcG9zaXRpb24gb2YgdGhlIG1vdXNlIHJlbGF0aXZlIHRvIHRoZSBwbGFuXG4gICAgICAjIFxuICAgICAgaWYgbWFya2VyVG9wIDw9IDBcbiAgICAgICAgbWFya2VyWSA9IDBcbiAgICAgIGVsc2UgaWYgbWFya2VyQm90dG9tIDwgcGxhbkJvdHRvbVxuICAgICAgICBtYXJrZXJZID0gbWFya2VyVG9wXG4gICAgICBlbHNlXG4gICAgICAgIG1hcmtlclkgPSBwbGFuQm90dG9tIC0gbWFya2VySGVpZ2h0XG5cbiAgICAgICMgc2V0IHRoZSBwb3NpdGlvbiBvZiB0aGUgbWFya2VyXG4gICAgICAjIFxuICAgICAgbWFya2VyLmNzc1xuICAgICAgICBsZWZ0OiBtYXJrZXJYXG4gICAgICAgIHRvcDogbWFya2VyWVxuXG5jbGFzcyBQbGFuaXQuUGxhbi5ab29tYWJsZVxuXG4gICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIFNldHVwXG5cbiAgY29uc3RydWN0b3I6IChAb3B0aW9ucykgLT5cbiAgICAjIGRlZmF1bHQgb3B0aW9uc1xuICAgIEBjb250YWluZXIgPSBAb3B0aW9ucy5jb250YWluZXJcbiAgICBAbWFya2Vyc0NvbnRhaW5lciA9IEBjb250YWluZXIuZmluZChcIi4je1BsYW5pdC5tYXJrZXJDb250YWluZXJDbGFzc31cIilcbiAgICBAem9vbUlkID0gUGxhbml0LnJhbmRvbVN0cmluZygpXG4gICAgQG1hcmtlcnNDb250YWluZXIuYXR0cignZGF0YS16b29tLWlkJywgQHpvb21JZClcbiAgICAjIGRyYXcgdGhlIGNvbnRyb2xzIGRpbmt1c1xuICAgIEBjb250YWluZXIucHJlcGVuZCBcIlwiXCJcbiAgICAgIDxkaXYgY2xhc3M9XCJwbGFuaXQtY29udHJvbHNcIj5cbiAgICAgICAgPGEgaHJlZj1cIiNcIiBjbGFzcz1cInpvb21cIiBkYXRhLWFjdGlvbj1cImluXCI+KzwvYT5cbiAgICAgICAgPGEgaHJlZj1cIiNcIiBjbGFzcz1cInpvb21cIiBkYXRhLWFjdGlvbj1cIm91dFwiPi08L2E+XG4gICAgICA8L2Rpdj5cbiAgICBcIlwiXCJcbiAgICBAY29udGFpbmVyLmZpbmQoXCIuem9vbVtkYXRhLWFjdGlvbj0naW4nXVwiKS5jbGljayAoZSkgPT5cbiAgICAgIGUucHJldmVudERlZmF1bHQoKVxuICAgICAgQHpvb21JbigpXG4gICAgQGNvbnRhaW5lci5maW5kKFwiLnpvb21bZGF0YS1hY3Rpb249J291dCddXCIpLmNsaWNrIChlKSA9PlxuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICBAem9vbU91dCgpXG4gICAgIyBiaW5kIGRyYWdnYWJsZSBldmVudHNcbiAgICBAY29udGFpbmVyLm9uKCdkYmxjbGljaycsIEBkYmxjbGljaylcbiAgICBAY29udGFpbmVyLm9uKCdtb3VzZWRvd24nLCBAbW91c2Vkb3duKVxuICAgICQoZG9jdW1lbnQpLm9uKCdtb3VzZW1vdmUnLCBAbW91c2Vtb3ZlKVxuICAgICQoZG9jdW1lbnQpLm9uKCdtb3VzZXVwJywgQG1vdXNldXApXG4gICAgIyBzZXQgaW5pdGlhbCBiYWNrZ3JvdW5kIGNvb3JkaW5hdGVzXG4gICAgQGltYWdlUG9zaXRpb24gPVxuICAgICAgbGVmdFB4OiAgICAgICAgIDBcbiAgICAgIHRvcFB4OiAgICAgICAgICAwXG4gICAgICB3aWR0aDogICAgICAgICAgQG1hcmtlcnNDb250YWluZXIud2lkdGgoKVxuICAgICAgaGVpZ2h0OiAgICAgICAgIEBtYXJrZXJzQ29udGFpbmVyLmhlaWdodCgpXG4gICAgICBzY2FsZTogICAgICAgICAgMVxuICAgICAgaW5jcmVtZW50OiAwLjVcbiAgICBAc2V0QmFja2dyb3VuZCgpXG5cbiAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gQWN0aW9uc1xuXG4gIHNldEJhY2tncm91bmQ6ID0+XG4gICAgQG1hcmtlcnNDb250YWluZXIuY3NzXG4gICAgICBiYWNrZ3JvdW5kUG9zaXRpb246IFwiI3tAaW1hZ2VQb3NpdGlvbi5sZWZ0UHh9cHggI3tAaW1hZ2VQb3NpdGlvbi50b3BQeH1weFwiXG4gICAgICBiYWNrZ3JvdW5kU2l6ZTogXCIje0BpbWFnZVBvc2l0aW9uLnNjYWxlICogMTAwLjB9JVwiXG4gICAgQHNldE1hcmtlcnMoKVxuXG4gIHNldE1hcmtlcnM6ID0+XG4gICAgbWFya2VycyA9ICQoJ2Rpdi5wbGFuaXQtbWFya2VyJylcbiAgICBpZiBtYXJrZXJzLmxlbmd0aCA+IDBcbiAgICAgIGZvciBtYXJrZXIgaW4gbWFya2Vyc1xuICAgICAgICBsZWZ0ID0gKEBpbWdXaWR0aCgpICogKCQobWFya2VyKS5hdHRyKCdkYXRhLXhQYycpIC8gMTAwKSkgKyBcbiAgICAgICAgICBAaW1hZ2VQb3NpdGlvbi5sZWZ0UHggLSAoJChtYXJrZXIpLm91dGVyV2lkdGgoKSAvIDIpXG4gICAgICAgIHRvcCA9IChAaW1nSGVpZ2h0KCkgKiAoJChtYXJrZXIpLmF0dHIoJ2RhdGEteVBjJykgLyAxMDApKSArIFxuICAgICAgICAgIEBpbWFnZVBvc2l0aW9uLnRvcFB4IC0gKCQobWFya2VyKS5vdXRlckhlaWdodCgpIC8gMilcbiAgICAgICAgJChtYXJrZXIpLmNzc1xuICAgICAgICAgIGxlZnQ6IFwiI3tsZWZ0fXB4XCJcbiAgICAgICAgICB0b3A6IFwiI3t0b3B9cHhcIlxuXG4gIHBvc2l0aW9uSW5mb2JveGVzOiA9PlxuICAgIGZvciBtYXJrZXIgaW4gQGNvbnRhaW5lci5maW5kKCcucGxhbml0LW1hcmtlcicpXG4gICAgICBtID0gbmV3IFBsYW5pdC5NYXJrZXIoQGNvbnRhaW5lciwgJChtYXJrZXIpLmF0dHIoJ2RhdGEtbWFya2VyJykpXG4gICAgICBtLnBvc2l0aW9uSW5mb2JveCgpXG4gICAgdHJ1ZVxuXG4gICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIENhbGN1bGF0aW9uc1xuXG4gICMgLS0tLS0tLS0tLSBJbWFnZSBXaWR0aFxuXG4gIGltZ1dpZHRoOiA9PlxuICAgIHBhcnNlRmxvYXQoQGltYWdlUG9zaXRpb24ud2lkdGggKiBAaW1hZ2VQb3NpdGlvbi5zY2FsZSlcblxuICB0bXBJbWdXaWR0aDogPT5cbiAgICAoMSArIEBpbWFnZVBvc2l0aW9uLmluY3JlbWVudCkgKiBAaW1hZ2VQb3NpdGlvbi53aWR0aCgpXG5cbiAgaW1nV2lkdGhDbGlja0luY3JlbWVudDogPT5cbiAgICBwYXJzZUZsb2F0KEBpbWFnZVBvc2l0aW9uLndpZHRoICogQGltYWdlUG9zaXRpb24uaW5jcmVtZW50KVxuXG4gIGltZ1dpZHRoU2Nyb2xsSW5jcmVtZW50OiA9PlxuICAgIHBhcnNlRmxvYXQoQGltYWdlUG9zaXRpb24ud2lkdGggKiBAaW1hZ2VQb3NpdGlvbi5zY3JvbGxJbmNyZW1lbnQpXG5cbiAgY29udGFpbmVyV2lkdGg6ID0+XG4gICAgcGFyc2VGbG9hdChAbWFya2Vyc0NvbnRhaW5lci53aWR0aCgpKVxuXG4gICMgLS0tLS0tLS0tLSBMZWZ0IC8gUmlnaHRcblxuICBpbWdPZmZzZXRMZWZ0OiA9PlxuICAgIE1hdGguYWJzKFxuICAgICAgcGFyc2VGbG9hdChAbWFya2Vyc0NvbnRhaW5lci5jc3MoJ2JhY2tncm91bmRQb3NpdGlvbicpLnNwbGl0KCcgJylbMF0pXG4gICAgKVxuXG4gICMgLS0tLS0tLS0tLSBIZWlnaHRcblxuICBpbWdIZWlnaHQ6ID0+XG4gICAgcGFyc2VGbG9hdChAaW1hZ2VQb3NpdGlvbi5oZWlnaHQgKiBAaW1hZ2VQb3NpdGlvbi5zY2FsZSlcblxuICB0bXBJbWdIZWlnaHQ6ID0+XG4gICAgKDEgKyBAaW1hZ2VQb3NpdGlvbi5pbmNyZW1lbnQpICogQGltYWdlUG9zaXRpb24uaGVpZ2h0KClcblxuICBpbWdIZWlnaHRDbGlja0luY3JlbWVudDogPT5cbiAgICBwYXJzZUZsb2F0KEBpbWFnZVBvc2l0aW9uLmhlaWdodCAqIEBpbWFnZVBvc2l0aW9uLmluY3JlbWVudClcblxuICBpbWdIZWlnaHRTY3JvbGxJbmNyZW1lbnQ6ID0+XG4gICAgcGFyc2VGbG9hdChAaW1hZ2VQb3NpdGlvbi5oZWlnaHQgKiBAaW1hZ2VQb3NpdGlvbi5zY3JvbGxJbmNyZW1lbnQpXG5cbiAgY29udGFpbmVySGVpZ2h0OiA9PlxuICAgIHBhcnNlRmxvYXQoQG1hcmtlcnNDb250YWluZXIuaGVpZ2h0KCkpXG5cbiAgIyAtLS0tLS0tLS0tIFRvcCAvIEJvdHRvbVxuXG4gIGltZ09mZnNldFRvcDogPT5cbiAgICBNYXRoLmFicyhcbiAgICAgIHBhcnNlRmxvYXQoQG1hcmtlcnNDb250YWluZXIuY3NzKCdiYWNrZ3JvdW5kUG9zaXRpb24nKS5zcGxpdCgnICcpWzFdKVxuICAgIClcblxuICAjIC0tLS0tLS0tLS0gT3RoZXJcblxuICBnZXRFdmVudENvbnRhaW5lclBvc2l0aW9uOiAoZSkgPT5cbiAgICBsZWZ0OiAoZS5wYWdlWCAtIEBjb250YWluZXIub2Zmc2V0KCkubGVmdCkgLyBAY29udGFpbmVyV2lkdGgoKVxuICAgIHRvcDogIChlLnBhZ2VZIC0gQGNvbnRhaW5lci5vZmZzZXQoKS50b3ApIC8gQGNvbnRhaW5lckhlaWdodCgpXG5cbiAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gRXZlbnRzXG5cbiAgZGJsY2xpY2s6IChlKSA9PlxuICAgIGlmICQoZS50YXJnZXQpLmF0dHIoJ2RhdGEtem9vbS1pZCcpID09IEB6b29tSWRcbiAgICAgIGNsaWNrID0gQGdldEV2ZW50Q29udGFpbmVyUG9zaXRpb24oZSlcbiAgICAgIEB6b29tSW4oJ2NsaWNrJywgY2xpY2subGVmdCwgY2xpY2sudG9wKVxuXG4gIG1vdXNlZG93bjogKGUpID0+XG4gICAgaWYgJChlLnRhcmdldCkuYXR0cignZGF0YS16b29tLWlkJykgPT0gQHpvb21JZFxuICAgICAgQGlzRHJhZ2dpbmcgPSB0cnVlXG4gICAgICBjb29yZHMgPSBAZ2V0RXZlbnRDb250YWluZXJQb3NpdGlvbihlKVxuICAgICAgQGRyYWdDb29yZHMgPSBcbiAgICAgICAgcG9pbnRSZWY6IGNvb3Jkc1xuICAgICAgICBpbWdSZWY6XG4gICAgICAgICAgbGVmdDogMCAtIEBpbWdPZmZzZXRMZWZ0KClcbiAgICAgICAgICB0b3A6IDAgLSBAaW1nT2Zmc2V0VG9wKClcbiAgICAgICAgbWF4OlxuICAgICAgICAgIHJpZ2h0OiAoY29vcmRzLmxlZnQgKiBAY29udGFpbmVyV2lkdGgoKSkgKyBAaW1nT2Zmc2V0TGVmdCgpXG4gICAgICAgICAgbGVmdDogKGNvb3Jkcy5sZWZ0ICogQGNvbnRhaW5lcldpZHRoKCkpIC0gKEBpbWdXaWR0aCgpIC0gXG4gICAgICAgICAgICAgICAgICAgICAgKEBjb250YWluZXJXaWR0aCgpICsgQGltZ09mZnNldExlZnQoKSkpXG4gICAgICAgICAgYm90dG9tOiAoY29vcmRzLnRvcCAqIEBjb250YWluZXJIZWlnaHQoKSkgKyBAaW1nT2Zmc2V0VG9wKClcbiAgICAgICAgICB0b3A6IChjb29yZHMudG9wICogQGNvbnRhaW5lckhlaWdodCgpKSAtIChAaW1nSGVpZ2h0KCkgLSBcbiAgICAgICAgICAgICAgICAgICAgICAoQGNvbnRhaW5lckhlaWdodCgpICsgQGltZ09mZnNldFRvcCgpKSlcbiAgICB0cnVlXG5cbiAgbW91c2Vtb3ZlOiAoZSkgPT5cbiAgICBpZiBAaXNEcmFnZ2luZ1xuICAgICAgY29vcmRzID0gQGdldEV2ZW50Q29udGFpbmVyUG9zaXRpb24oZSlcbiAgICAgIGRyYWdMZWZ0ID0gY29vcmRzLmxlZnQgKiBAY29udGFpbmVyV2lkdGgoKVxuICAgICAgZHJhZ1RvcCA9IGNvb3Jkcy50b3AgKiBAY29udGFpbmVySGVpZ2h0KClcbiAgICAgIGlmIGRyYWdMZWZ0ID49IEBkcmFnQ29vcmRzLm1heC5sZWZ0ICYmIGRyYWdMZWZ0IDw9IEBkcmFnQ29vcmRzLm1heC5yaWdodFxuICAgICAgICBsZWZ0ID0gKGNvb3Jkcy5sZWZ0IC0gQGRyYWdDb29yZHMucG9pbnRSZWYubGVmdCkgKiBAY29udGFpbmVyV2lkdGgoKVxuICAgICAgICBAaW1hZ2VQb3NpdGlvbi5sZWZ0UHggPSBAZHJhZ0Nvb3Jkcy5pbWdSZWYubGVmdCArIGxlZnRcbiAgICAgIGVsc2UgaWYgZHJhZ0xlZnQgPCBAZHJhZ0Nvb3Jkcy5tYXgubGVmdFxuICAgICAgICBAaW1hZ2VQb3NpdGlvbi5sZWZ0UHggPSBAY29udGFpbmVyV2lkdGgoKSAtIEBpbWdXaWR0aCgpXG4gICAgICBlbHNlIGlmIGRyYWdMZWZ0ID4gQGRyYWdDb29yZHMubWF4LnJpZ2h0XG4gICAgICAgIEBpbWFnZVBvc2l0aW9uLmxlZnRQeCA9IDBcbiAgICAgIGlmIGRyYWdUb3AgPj0gQGRyYWdDb29yZHMubWF4LnRvcCAmJiBkcmFnVG9wIDw9IEBkcmFnQ29vcmRzLm1heC5ib3R0b21cbiAgICAgICAgdG9wID0gKGNvb3Jkcy50b3AgLSBAZHJhZ0Nvb3Jkcy5wb2ludFJlZi50b3ApICogQGNvbnRhaW5lckhlaWdodCgpXG4gICAgICAgIEBpbWFnZVBvc2l0aW9uLnRvcFB4ID0gQGRyYWdDb29yZHMuaW1nUmVmLnRvcCArIHRvcFxuICAgICAgZWxzZSBpZiBkcmFnVG9wIDwgQGRyYWdDb29yZHMubWF4LnRvcFxuICAgICAgICBAaW1hZ2VQb3NpdGlvbi50b3BQeCA9IEBjb250YWluZXJIZWlnaHQoKSAtIEBpbWdIZWlnaHQoKVxuICAgICAgZWxzZSBpZiBkcmFnVG9wID4gQGRyYWdDb29yZHMubWF4LmJvdHRvbVxuICAgICAgICBAaW1hZ2VQb3NpdGlvbi50b3BQeCA9IDBcbiAgICAgIEBzZXRCYWNrZ3JvdW5kKClcbiAgICB0cnVlXG5cbiAgbW91c2V1cDogKGUpID0+XG4gICAgQGlzRHJhZ2dpbmcgPSBmYWxzZVxuICAgIEBwb3NpdGlvbkluZm9ib3hlcygpXG4gICAgdHJ1ZVxuXG4gICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIFpvb21pbmdcblxuICB6b29tSW46ID0+XG4gICAgQGltYWdlUG9zaXRpb24uc2NhbGUgID0gQGltYWdlUG9zaXRpb24uc2NhbGUgKyBAaW1hZ2VQb3NpdGlvbi5pbmNyZW1lbnRcbiAgICBAaW1hZ2VQb3NpdGlvbi5sZWZ0UHggPSAtIEBpbWdPZmZzZXRMZWZ0KCkgLSAoQGltZ1dpZHRoQ2xpY2tJbmNyZW1lbnQoKSAvIDIpXG4gICAgQGltYWdlUG9zaXRpb24udG9wUHggID0gLSBAaW1nT2Zmc2V0VG9wKCkgLSAoQGltZ0hlaWdodENsaWNrSW5jcmVtZW50KCkgLyAyKVxuICAgIEBzZXRCYWNrZ3JvdW5kKClcbiAgICBAcG9zaXRpb25JbmZvYm94ZXMoKVxuXG4gIHpvb21PdXQ6IChsZWZ0ID0gMC41LCB0b3AgPSAwLjUpID0+XG4gICAgaWYgQGltYWdlUG9zaXRpb24uc2NhbGUgPiAxXG4gICAgICBAaW1hZ2VQb3NpdGlvbi5zY2FsZSAgPSBAaW1hZ2VQb3NpdGlvbi5zY2FsZSAtIEBpbWFnZVBvc2l0aW9uLmluY3JlbWVudFxuICAgICAgbGVmdFB4ID0gLSBAaW1nT2Zmc2V0TGVmdCgpICsgKEBpbWdXaWR0aENsaWNrSW5jcmVtZW50KCkgLyAyKVxuICAgICAgdG9wUHggID0gLSBAaW1nT2Zmc2V0VG9wKCkgKyAoQGltZ0hlaWdodENsaWNrSW5jcmVtZW50KCkgLyAyKVxuICAgICAgaWYgbGVmdFB4ICsgQGltZ1dpZHRoQ2xpY2tJbmNyZW1lbnQoKSA+IDBcbiAgICAgICAgQGltYWdlUG9zaXRpb24ubGVmdFB4ID0gMFxuICAgICAgZWxzZSBpZiBsZWZ0UHggLSBAaW1nV2lkdGhDbGlja0luY3JlbWVudCgpIDwgQGNvbnRhaW5lcldpZHRoKCkgLSBAaW1nV2lkdGgoKVxuICAgICAgICBAaW1hZ2VQb3NpdGlvbi5sZWZ0UHggPSBAY29udGFpbmVyV2lkdGgoKSAtIEBpbWdXaWR0aCgpXG4gICAgICBpZiB0b3BQeCArIEBpbWdIZWlnaHRDbGlja0luY3JlbWVudCgpID4gMFxuICAgICAgICBAaW1hZ2VQb3NpdGlvbi50b3BQeCA9IDBcbiAgICAgIGVsc2UgaWYgdG9wUHggLSBAaW1nSGVpZ2h0Q2xpY2tJbmNyZW1lbnQoKSA8IEBjb250YWluZXJIZWlnaHQoKSAtIEBpbWdIZWlnaHQoKVxuICAgICAgICBAaW1hZ2VQb3NpdGlvbi50b3BQeCA9IEBjb250YWluZXJIZWlnaHQoKSAtIEBpbWdIZWlnaHQoKVxuICAgICAgQHNldEJhY2tncm91bmQoKVxuICAgICAgQHBvc2l0aW9uSW5mb2JveGVzKClcblxuY2xhc3MgUGxhbml0Lk1hcmtlclxuXG4gIGNvbnN0cnVjdG9yOiAoQGNvbnRhaW5lciwgaWQpIC0+XG5cbiAgICAjIFNldCBPcHRpb25zXG4gICAgQG1hcmtlcnNDb250YWluZXIgPSBAY29udGFpbmVyLmZpbmQoXCIuI3tQbGFuaXQubWFya2VyQ29udGFpbmVyQ2xhc3N9XCIpXG5cbiAgICAjIEZpbmQgTWFya2VyXG4gICAgQG1hcmtlciA9IEBtYXJrZXJzQ29udGFpbmVyLmZpbmQoXG4gICAgICBcIi4je1BsYW5pdC5tYXJrZXJDbGFzc31bZGF0YS1tYXJrZXI9JyN7aWR9J11cIlxuICAgICkuZmlyc3QoKVxuXG4gICAgIyBSZXR1cm4gdGhpc1xuICAgIEBcblxuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBDYWxjdWxhdGlvbnNcblxuICBwb3NpdGlvbjogPT5cbiAgICB4UHggPSBAbWFya2VyLnBvc2l0aW9uKCkubGVmdCArIChAbWFya2VyLm91dGVyV2lkdGgoKSAvIDIpXG4gICAgeVB4ID0gQG1hcmtlci5wb3NpdGlvbigpLnRvcCArIChAbWFya2VyLm91dGVySGVpZ2h0KCkgLyAyKVxuICAgIGlmIEBtYXJrZXJzQ29udGFpbmVyLmNzcygnYmFja2dyb3VuZEltYWdlJylcbiAgICAgIHNjYWxlID0gcGFyc2VJbnQoQG1hcmtlcnNDb250YWluZXIuY3NzKCdiYWNrZ3JvdW5kU2l6ZScpKSAvIDEwMFxuICAgICAgd0ltZyA9IEBjb250YWluZXIud2lkdGgoKSAqIHNjYWxlXG4gICAgICBoSW1nID0gQGNvbnRhaW5lci5oZWlnaHQoKSAqIHNjYWxlXG4gICAgICB4SW1nID0gcGFyc2VJbnQoQG1hcmtlcnNDb250YWluZXIuY3NzKCdiYWNrZ3JvdW5kUG9zaXRpb24nKS5zcGxpdCgnICcpWzBdKVxuICAgICAgeUltZyA9IHBhcnNlSW50KEBtYXJrZXJzQ29udGFpbmVyLmNzcygnYmFja2dyb3VuZFBvc2l0aW9uJykuc3BsaXQoJyAnKVsxXSlcbiAgICAgIHhQYyA9ICgoeFB4ICsgTWF0aC5hYnMoeEltZykpIC8gd0ltZykgKiAxMDBcbiAgICAgIHlQYyA9ICgoeVB4ICsgTWF0aC5hYnMoeUltZykpIC8gaEltZykgKiAxMDBcbiAgICBlbHNlXG4gICAgICB4UGMgPSAoeFB4IC8gQGNvbnRhaW5lci53aWR0aCgpKSAqIDEwMFxuICAgICAgeVBjID0gKHlQeCAvIEBjb250YWluZXIuaGVpZ2h0KCkpICogMTAwXG4gICAgW3hQYywgeVBjXVxuXG4gIHJlbGF0aXZlUG9zaXRpb246ID0+XG4gICAgeFB4ID0gQG1hcmtlci5wb3NpdGlvbigpLmxlZnQgKyAoQG1hcmtlci5vdXRlcldpZHRoKCkgLyAyKVxuICAgIHlQeCA9IEBtYXJrZXIucG9zaXRpb24oKS50b3AgKyAoQG1hcmtlci5vdXRlckhlaWdodCgpIC8gMilcbiAgICB4UGMgPSAoeFB4IC8gQGNvbnRhaW5lci53aWR0aCgpKSAqIDEwMFxuICAgIHlQYyA9ICh5UHggLyBAY29udGFpbmVyLmhlaWdodCgpKSAqIDEwMFxuICAgIFt4UGMsIHlQY11cblxuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBBdHRyaWJ1dGVzXG5cbiAgY29sb3I6ID0+XG4gICAgQG1hcmtlci5jc3MoJ2JhY2tncm91bmRDb2xvcicpXG5cbiAgaWQ6ID0+XG4gICAgQG1hcmtlci5hdHRyKCdkYXRhLW1hcmtlcicpXG5cbiAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gSW5mb2JveFxuXG4gIGluZm9ib3hIVE1MOiA9PlxuICAgIGluZm8gPSBAbWFya2VyLmZpbmQoJy5wbGFuaXQtaW5mb2JveCcpXG4gICAgaWYgaW5mby5sZW5ndGggPiAwIHRoZW4gaW5mby5odG1sKCkgZWxzZSBudWxsXG5cbiAgcG9zaXRpb25JbmZvYm94OiA9PlxuICAgIGluZm9ib3ggPSAkKFwiIyN7QG1hcmtlci5hdHRyKCdkYXRhLWluZm9ib3gnKX1cIilcbiAgICBtYXJrZXJDZW50ZXJYID0gKHBhcnNlRmxvYXQoQHJlbGF0aXZlUG9zaXRpb24oKVswXSAvIDEwMCkgKiBAY29udGFpbmVyLndpZHRoKCkpXG4gICAgbWFya2VyQ2VudGVyWSA9IChwYXJzZUZsb2F0KEByZWxhdGl2ZVBvc2l0aW9uKClbMV0gLyAxMDApICogQGNvbnRhaW5lci5oZWlnaHQoKSlcbiAgICBpbmZvTGVmdCA9IG1hcmtlckNlbnRlclggLSAoaW5mb2JveC5vdXRlcldpZHRoKCkgLyAyKVxuICAgIGluZm9Cb3R0b20gPSBAY29udGFpbmVyLmhlaWdodCgpIC0gbWFya2VyQ2VudGVyWSArIChAbWFya2VyLmhlaWdodCgpIC8gMikgKyA1XG4gICAgaW5mb2JveC5jc3NcbiAgICAgIGxlZnQ6IGluZm9MZWZ0XG4gICAgICBib3R0b206IGluZm9Cb3R0b21cbiAgICBAcG9zaXRpb24oKVxuXG4gICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIERyYWdnaW5nXG5cbiAgaXNEcmFnZ2FibGU6ID0+XG4gICAgQG1hcmtlci5oYXNDbGFzcygnZHJhZ2dhYmxlJylcblxuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBBY3Rpb25zXG5cbiAgc2F2ZVBvc2l0aW9uOiA9PlxuICAgIGNvb3JkcyA9IEBwb3NpdGlvbigpXG4gICAgQG1hcmtlci5hdHRyXG4gICAgICAnZGF0YS14UGMnOiBjb29yZHNbMF1cbiAgICAgICdkYXRhLXlQYyc6IGNvb3Jkc1sxXVxuXG4gIHVwZGF0ZTogKG9wdGlvbnMpID0+XG4gICAgaWYgb3B0aW9ucy5jb2xvclxuICAgICAgQG1hcmtlci5jc3MoYmFja2dyb3VuZENvbG9yOiBvcHRpb25zLmNvbG9yKVxuICAgIGlmIG9wdGlvbnMuaW5mb2JveFxuICAgICAgQG1hcmtlci5maW5kKCcucGxhbml0LWluZm9ib3gnKS5odG1sKG9wdGlvbnMuaW5mb2JveClcbiAgICAgIEBwb3NpdGlvbkluZm9ib3goKVxuICAgIGlmIG9wdGlvbnMuZHJhZ2dhYmxlXG4gICAgICBAbWFya2VyLnJlbW92ZUNsYXNzKCdkcmFnZ2FibGUnKVxuICAgICAgQG1hcmtlci5hZGRDbGFzcygnZHJhZ2dhYmxlJykgaWYgb3B0aW9ucy5kcmFnZ2FibGUgPT0gdHJ1ZVxuICAgIGlmIG9wdGlvbnMuY29vcmRzXG4gICAgICBsZWZ0ID0gKChwYXJzZUZsb2F0KG9wdGlvbnMuY29vcmRzWzBdKSAvIDEwMCkgKiBAY29udGFpbmVyLndpZHRoKCkpIC0gMTVcbiAgICAgIHRvcCA9ICgocGFyc2VGbG9hdChvcHRpb25zLmNvb3Jkc1sxXSkgLyAxMDApICogQGNvbnRhaW5lci5oZWlnaHQoKSkgLSAxNVxuICAgICAgQG1hcmtlci5jc3NcbiAgICAgICAgbGVmdDogXCIje2xlZnR9cHhcIlxuICAgICAgICB0b3A6IFwiI3t0b3B9cHhcIlxuXG4gIHJlbW92ZTogPT5cbiAgICBAbWFya2VyLnJlbW92ZSgpXG5cbmNsYXNzIFBsYW5pdC5NYXJrZXIuRXZlbnRzXG5cbiAgY29uc3RydWN0b3I6IChAb3B0aW9ucykgLT5cblxuICAgICMgU2V0IE9wdGlvbnNcbiAgICBAY29udGFpbmVyID0gQG9wdGlvbnMuY29udGFpbmVyXG4gICAgQG1hcmtlcnNDb250YWluZXIgPSBAY29udGFpbmVyLmZpbmQoXCIuI3tQbGFuaXQubWFya2VyQ29udGFpbmVyQ2xhc3N9XCIpXG5cbiAgICAjIEZpbmQgTWFya2VyXG4gICAgQG1hcmtlciA9IEBtYXJrZXJzQ29udGFpbmVyLmZpbmQoXG4gICAgICBcIi4je1BsYW5pdC5tYXJrZXJDbGFzc31bZGF0YS1tYXJrZXI9JyN7QG9wdGlvbnMuaWR9J11cIlxuICAgICkuZmlyc3QoKVxuICAgIEBtYXJrZXJPYmogPSBuZXcgUGxhbml0Lk1hcmtlcihAY29udGFpbmVyLCBAb3B0aW9ucy5pZClcblxuICAgICMgRHJhZ2dhYmxlXG4gICAgaWYgQG9wdGlvbnMuZHJhZ2dhYmxlXG4gICAgICBAbWFya2VyLmFkZENsYXNzKCdkcmFnZ2FibGUnKVxuICAgICAgQG1hcmtlci5vbiAnbW91c2Vkb3duJywgKGUpID0+XG4gICAgICAgIG1hcmtlciA9ICQoZS50YXJnZXQpLmNsb3Nlc3QoJy5wbGFuaXQtbWFya2VyJylcbiAgICAgICAgbWFya2VyLmFkZENsYXNzKCdpcy1kcmFnZ2luZycpXG4gICAgICAgIG1hcmtlci5hdHRyXG4gICAgICAgICAgJ2RhdGEtZHJhZy1zdGFydC14JzogZS5wYWdlWFxuICAgICAgICAgICdkYXRhLWRyYWctc3RhcnQteSc6IGUucGFnZVlcblxuICAgICMgSW5mb2JveFxuICAgIGlmIEBvcHRpb25zLmluZm9ib3hcbiAgICAgIGlkID0gUGxhbml0LnJhbmRvbVN0cmluZygxNilcbiAgICAgIEBjb250YWluZXIuZmluZChcIi4je1BsYW5pdC5pbmZvYm94Q29udGFpbmVyQ2xhc3N9XCIpLmFwcGVuZCBcIlwiXCJcbiAgICAgICAgPGRpdiBjbGFzcz1cInBsYW5pdC1pbmZvYm94XCIgaWQ9XCJpbmZvLSN7aWR9XCI+I3tAb3B0aW9ucy5pbmZvYm94fTwvZGl2PlxuICAgICAgICAgIFwiXCJcIlxuICAgICAgQG1hcmtlci5hdHRyKCdkYXRhLWluZm9ib3gnLCBcImluZm8tI3tpZH1cIilcbiAgICAgIEBtYXJrZXJPYmoucG9zaXRpb25JbmZvYm94KClcbiAgICAgIEBtYXJrZXIuY2xpY2sgKGUpID0+XG4gICAgICAgIGlmKFxuICAgICAgICAgIE1hdGguYWJzKGUucGFnZVggLSBAbWFya2VyLmF0dHIoJ2RhdGEtZHJhZy1zdGFydC14JykpIDwgMSAmJlxuICAgICAgICAgIE1hdGguYWJzKGUucGFnZVkgLSBAbWFya2VyLmF0dHIoJ2RhdGEtZHJhZy1zdGFydC15JykpIDwgMVxuICAgICAgICApXG4gICAgICAgICAgbWFya2VyID0gJChlLnRhcmdldCkuY2xvc2VzdCgnLnBsYW5pdC1tYXJrZXInKVxuICAgICAgICAgICQoXCIjI3ttYXJrZXIuYXR0cignZGF0YS1pbmZvYm94Jyl9XCIpLnRvZ2dsZUNsYXNzKCdhY3RpdmUnKVxuXG4gIG1hcmtlcnM6IC0+XG4gICAgQG1hcmtlcnNDb250YWluZXIuZmluZCgnLnBsYW5pdC1tYXJrZXInKVxuXG4gIGRyYWdnaW5nTWFya2VyOiAtPlxuICAgIEBtYXJrZXJzQ29udGFpbmVyLmZpbmQoJy5wbGFuaXQtbWFya2VyLmlzLWRyYWdnaW5nJylcblxuY2xhc3MgUGxhbml0Lk1hcmtlci5DcmVhdG9yXG5cbiAgY29uc3RydWN0b3I6IChAb3B0aW9ucykgLT5cbiAgICAjIFNldCBPcHRpb25zXG4gICAgQGNvbnRhaW5lciA9IEBvcHRpb25zLmNvbnRhaW5lclxuICAgIEBtYXJrZXJzQ29udGFpbmVyID0gQGNvbnRhaW5lci5maW5kKFwiLiN7UGxhbml0Lm1hcmtlckNvbnRhaW5lckNsYXNzfVwiKS5maXJzdCgpXG4gICAgdW5sZXNzIEBvcHRpb25zLmlkXG4gICAgICBAb3B0aW9ucy5pZCA9IFBsYW5pdC5yYW5kb21TdHJpbmcoMjApXG5cbiAgICAjIEFkZCBNYXJrZXJcbiAgICBpZiBAb3B0aW9ucy5jb2xvciB0aGVuIGNvbG9yID0gQG9wdGlvbnMuY29sb3IgZWxzZSBjb2xvciA9ICcjRkM1QjNGJ1xuXG4gICAgbGVmdCA9ICgocGFyc2VGbG9hdChAb3B0aW9ucy5jb29yZHNbMF0pIC8gMTAwKSAqIEBjb250YWluZXIud2lkdGgoKSkgLSAxNVxuICAgIHRvcCA9ICgocGFyc2VGbG9hdChAb3B0aW9ucy5jb29yZHNbMV0pIC8gMTAwKSAqIEBjb250YWluZXIuaGVpZ2h0KCkpIC0gMTVcbiAgICBAbWFya2Vyc0NvbnRhaW5lci5hcHBlbmQoXG4gICAgICAkKCc8ZGl2PjxkaXYgY2xhc3M9XCJwbGFuaXQtbWFya2VyLWNvbnRlbnRcIj48L2Rpdj48L2Rpdj4nKVxuICAgICAgICAuYWRkQ2xhc3MoJ3BsYW5pdC1tYXJrZXInKVxuICAgICAgICAuYXR0clxuICAgICAgICAgICdkYXRhLW1hcmtlcic6IEBvcHRpb25zLmlkXG4gICAgICAgICAgJ2RhdGEteFBjJzogQG9wdGlvbnMuY29vcmRzWzBdXG4gICAgICAgICAgJ2RhdGEteVBjJzogQG9wdGlvbnMuY29vcmRzWzFdXG4gICAgICAgIC5jc3NcbiAgICAgICAgICBsZWZ0OiBcIiN7bGVmdH1weFwiXG4gICAgICAgICAgdG9wOiBcIiN7dG9wfXB4XCJcbiAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6IGNvbG9yXG4gICAgKVxuXG4gICAgIyBCaW5kIEV2ZW50cyAoaW4gYSBzZXBhcmF0ZSBjbGFzcylcbiAgICBuZXcgUGxhbml0Lk1hcmtlci5FdmVudHMoQG9wdGlvbnMpXG5cbiAgICAjIFJldHVybiBhIG5ldyBpbnN0YW5jZSBvZiB0aGlzIG1hcmtlclxuICAgIG5ldyBQbGFuaXQuTWFya2VyKEBjb250YWluZXIsIEBvcHRpb25zLmlkKVxuIl19