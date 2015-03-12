var Planit,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

Planit = (function() {
  function Planit() {
    this.canvasClick = bind(this.canvasClick, this);
    this.markerClick = bind(this.markerClick, this);
    this.markerDragEnd = bind(this.markerDragEnd, this);
    this.getAllMarkers = bind(this.getAllMarkers, this);
    this.getMarker = bind(this.getMarker, this);
    this.addMarker = bind(this.addMarker, this);
    this.initMarkers = bind(this.initMarkers, this);
    this.initBackgroundImage = bind(this.initBackgroundImage, this);
  }

  Planit.containerClass = 'planit-container';

  Planit.markerContainerClass = 'planit-markers-container';

  Planit.markerClass = 'planit-marker';

  Planit.markerContentClass = 'planit-marker-content';

  Planit.infoboxContainerClass = 'planit-infobox-container';

  Planit.prototype["new"] = function(options1) {
    this.options = options1 != null ? options1 : {};
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
      this.container.prepend("<div class=\"image-container\">\n  <img src=\"" + this.options.image.url + "\">\n</div>");
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
    var j, k, len, len1, marker, ref, ref1, results, results1;
    if (this.options.image && this.options.image.url) {
      if (this.imgLoaded === true) {
        ref = this.options.markers;
        results = [];
        for (j = 0, len = ref.length; j < len; j++) {
          marker = ref[j];
          results.push(this.addMarker(marker));
        }
        return results;
      } else {
        return setTimeout(this.initMarkers, 250);
      }
    } else {
      ref1 = this.options.markers;
      results1 = [];
      for (k = 0, len1 = ref1.length; k < len1; k++) {
        marker = ref1[k];
        results1.push(this.addMarker(marker));
      }
      return results1;
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
  function Plan(container) {
    this.container = container;
    this.getAllMarkers = bind(this.getAllMarkers, this);
    this.markersContainer = this.container.find("." + Planit.markerContainerClass).first();
  }

  Plan.prototype.getAllMarkers = function() {
    var j, len, m, marker, markers, ref;
    markers = [];
    ref = this.markersContainer.find('.planit-marker');
    for (j = 0, len = ref.length; j < len; j++) {
      marker = ref[j];
      m = new Planit.Marker(this.container, $(marker).attr('data-marker'));
      marker = {
        coords: m.position(),
        draggable: m.isDraggable(),
        color: m.color()
      };
      if (m.infoboxHTML()) {
        marker.infobox = m.infoboxHTML();
      }
      markers.push(m);
    }
    return markers;
  };

  return Plan;

})();

Planit.Plan.Events = (function() {
  function Events(options1) {
    this.options = options1;
    this.mousemove = bind(this.mousemove, this);
    this.mouseup = bind(this.mouseup, this);
    this.getEventPosition = bind(this.getEventPosition, this);
    this.draggingMarker = bind(this.draggingMarker, this);
    this.markers = bind(this.markers, this);
    this.container = this.options.container;
    this.markersContainer = this.container.find("." + Planit.markerContainerClass);
    if (this.container.find('.image-container > img').length > 0) {
      this.image = this.container.find('.image-container > img').first();
    }
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
  function Zoomable(options1) {
    this.options = options1;
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
    this.tmpImgHeight = bind(this.tmpImgHeight, this);
    this.imgHeight = bind(this.imgHeight, this);
    this.imgOffsetLeft = bind(this.imgOffsetLeft, this);
    this.containerWidth = bind(this.containerWidth, this);
    this.imgWidthScrollIncrement = bind(this.imgWidthScrollIncrement, this);
    this.imgWidthClickIncrement = bind(this.imgWidthClickIncrement, this);
    this.tmpImgWidth = bind(this.tmpImgWidth, this);
    this.imgWidth = bind(this.imgWidth, this);
    this.zoomTo = bind(this.zoomTo, this);
    this.centerOn = bind(this.centerOn, this);
    this.animateInfoboxes = bind(this.animateInfoboxes, this);
    this.positionInfoboxes = bind(this.positionInfoboxes, this);
    this.animateMarkers = bind(this.animateMarkers, this);
    this.setMarkers = bind(this.setMarkers, this);
    this.animateBackground = bind(this.animateBackground, this);
    this.setBackground = bind(this.setBackground, this);
    this["new"] = bind(this["new"], this);
    this.container = this.options.container;
    this.markersContainer = this.container.find("." + Planit.markerContainerClass);
    this.image = this.container.find('img').first();
    this.zoomId = Planit.randomString();
    this.markersContainer.attr('data-zoom-id', this.zoomId);
    this.imagePosition = {
      leftPx: 0,
      topPx: 0,
      width: this.image.width(),
      height: this.image.height(),
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
    this.image.css({
      left: this.imagePosition.leftPx + "px",
      top: this.imagePosition.topPx + "px",
      width: (this.imagePosition.scale * 100.0) + "%",
      height: 'auto'
    });
    return this.setMarkers();
  };

  Zoomable.prototype.animateBackground = function() {
    this.image.animate({
      left: this.imagePosition.leftPx + "px",
      top: this.imagePosition.topPx + "px",
      width: (this.imagePosition.scale * 100.0) + "%",
      height: 'auto'
    }, 250);
    return this.animateMarkers();
  };

  Zoomable.prototype.setMarkers = function() {
    var j, left, len, marker, markers, top;
    markers = this.container.find('div.planit-marker');
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
      return this.positionInfoboxes();
    }
  };

  Zoomable.prototype.animateMarkers = function() {
    var j, left, len, m, marker, markers, results, top;
    markers = this.container.find('div.planit-marker');
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

  Zoomable.prototype.positionInfoboxes = function() {
    var j, len, m, marker, ref;
    ref = this.container.find('.planit-marker');
    for (j = 0, len = ref.length; j < len; j++) {
      marker = ref[j];
      m = new Planit.Marker(this.container, $(marker).attr('data-marker'));
      m.positionInfobox();
    }
    return true;
  };

  Zoomable.prototype.animateInfoboxes = function() {
    var j, len, m, marker, ref;
    ref = this.container.find('.planit-marker');
    for (j = 0, len = ref.length; j < len; j++) {
      marker = ref[j];
      m = new Planit.Marker(this.container, $(marker).attr('data-marker'));
      m.animateInfobox();
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
    this.container.find('.planit-infobox').removeClass('active');
    this.imagePosition.scale = this.imagePosition.scale + this.imagePosition.increment;
    this.imagePosition.leftPx = -((this.imgWidth() * (coords[0] / 100)) - (this.containerWidth() / 2));
    this.imagePosition.topPx = -((this.imgHeight() * (coords[1] / 100)) - (this.containerHeight() / 2));
    while ((this.imgWidth() < wMin) || (this.imgHeight() < hMin)) {
      this.imagePosition.scale = this.imagePosition.scale + this.imagePosition.increment;
      this.imagePosition.leftPx = -((this.imgWidth() * (coords[0] / 100)) - (this.containerWidth() / 2));
      this.imagePosition.topPx = -((this.imgHeight() * (coords[1] / 100)) - (this.containerHeight() / 2));
    }
    return this.animateBackground();
  };

  Zoomable.prototype.zoomTo = function(level) {
    var i;
    i = this.imagePosition.increment;
    if (((level * i) + 1) !== this.imagePosition.scale) {
      this.imagePosition.scale = (level * i) + 1 + i;
      return this.zoomOut();
    }
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
    return Math.abs(parseFloat(this.image.css('left')));
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
    return Math.abs(parseFloat(this.image.css('top')));
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
    return this.animateBackground();
  };

  Zoomable.prototype.zoomOut = function() {
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
      return this.animateBackground();
    }
  };

  return Zoomable;

})();

Planit.Marker = (function() {
  function Marker(container, id) {
    this.container = container;
    this.remove = bind(this.remove, this);
    this.update = bind(this.update, this);
    this.savePosition = bind(this.savePosition, this);
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
    if (this.container.find('.image-container > img').length > 0) {
      this.image = this.container.find('.image-container > img').first();
    }
    this.marker = this.markersContainer.find("." + Planit.markerClass + "[data-marker='" + id + "']").first();
    this;
  }

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
    return {
      left: infoLeft + offsetX,
      top: infoTop + offsetY
    };
  };

  Marker.prototype.positionInfobox = function() {
    var coords;
    coords = this.infoboxCoords();
    $("#" + (this.marker.attr('data-infobox'))).css({
      left: coords.left + "px",
      top: coords.top + "px"
    });
    return this.position();
  };

  Marker.prototype.animateInfobox = function() {
    var coords;
    coords = this.infoboxCoords();
    return $("#" + (this.marker.attr('data-infobox'))).animate({
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
    if (this.infobox()) {
      this.infobox().remove();
    }
    return this.marker.remove();
  };

  return Marker;

})();

Planit.Marker.Events = (function() {
  function Events(options1) {
    var arrow, arrowClass, classes, id, options, position;
    this.options = options1;
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
      this.container.find("." + Planit.infoboxContainerClass).append("<div class=\"" + classes + "\" id=\"info-" + id + "\"\n  data-position=\"" + position + "\">\n    " + options.html + "\n</div>");
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
  function Creator(options1) {
    var color, left, marker, top;
    this.options = options1;
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInBsYW5pdC10bXAuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLElBQUEsTUFBQTtFQUFBLGdGQUFBOztBQUFBOzs7Ozs7Ozs7O0dBSUU7O0FBQUEsRUFBQSxNQUFDLENBQUEsY0FBRCxHQUF3QixrQkFBeEIsQ0FBQTs7QUFBQSxFQUNBLE1BQUMsQ0FBQSxvQkFBRCxHQUF3QiwwQkFEeEIsQ0FBQTs7QUFBQSxFQUVBLE1BQUMsQ0FBQSxXQUFELEdBQXdCLGVBRnhCLENBQUE7O0FBQUEsRUFHQSxNQUFDLENBQUEsa0JBQUQsR0FBd0IsdUJBSHhCLENBQUE7O0FBQUEsRUFJQSxNQUFDLENBQUEscUJBQUQsR0FBd0IsMEJBSnhCLENBQUE7O0FBQUEsbUJBUUEsTUFBQSxHQUFLLFNBQUMsUUFBRCxHQUFBO0FBRUgsSUFGSSxJQUFDLENBQUEsNkJBQUQsV0FBVyxFQUVmLENBQUE7QUFBQSxJQUFBLElBQUcsSUFBQyxDQUFBLE9BQU8sQ0FBQyxTQUFaO0FBQ0UsTUFBQSxJQUFDLENBQUEsT0FBTyxDQUFDLFNBQVQsR0FBcUIsQ0FBQSxDQUFFLEdBQUEsR0FBSSxJQUFDLENBQUEsT0FBTyxDQUFDLFNBQWYsQ0FBckIsQ0FERjtLQUFBLE1BQUE7QUFHRSxNQUFBLElBQUMsQ0FBQSxPQUFPLENBQUMsU0FBVCxHQUFxQixDQUFBLENBQUUsU0FBRixDQUFyQixDQUhGO0tBQUE7QUFBQSxJQU1BLElBQUMsQ0FBQSxPQUFPLENBQUMsU0FBUyxDQUFDLFFBQW5CLENBQTRCLGtCQUE1QixDQU5BLENBQUE7QUFBQSxJQU9BLElBQUMsQ0FBQSxPQUFPLENBQUMsU0FBUyxDQUFDLE1BQW5CLENBQTBCLGVBQUEsR0FDVixNQUFNLENBQUMscUJBREcsR0FDbUIsMEJBRG5CLEdBRVYsTUFBTSxDQUFDLG9CQUZHLEdBRWtCLFdBRjVDLENBUEEsQ0FBQTtBQUFBLElBYUEsSUFBQyxDQUFBLFNBQUQsR0FBYSxJQUFDLENBQUEsT0FBTyxDQUFDLFNBYnRCLENBQUE7QUFBQSxJQWNBLElBQUMsQ0FBQSxnQkFBRCxHQUFvQixJQUFDLENBQUEsU0FBUyxDQUFDLElBQVgsQ0FBZ0IsR0FBQSxHQUFJLE1BQU0sQ0FBQyxvQkFBM0IsQ0FBa0QsQ0FBQyxLQUFuRCxDQUFBLENBZHBCLENBQUE7QUFpQkEsSUFBQSxJQUFHLElBQUMsQ0FBQSxPQUFPLENBQUMsS0FBVCxJQUFrQixJQUFDLENBQUEsT0FBTyxDQUFDLEtBQUssQ0FBQyxHQUFwQztBQUNFLE1BQUEsSUFBQyxDQUFBLFNBQVMsQ0FBQyxPQUFYLENBQW1CLGdEQUFBLEdBRUgsSUFBQyxDQUFBLE9BQU8sQ0FBQyxLQUFLLENBQUMsR0FGWixHQUVnQixhQUZuQyxDQUFBLENBQUE7QUFBQSxNQU9BLElBQUMsQ0FBQSxtQkFBRCxDQUFBLENBUEEsQ0FERjtLQWpCQTtBQTRCQSxJQUFBLElBQUcsSUFBQyxDQUFBLE9BQU8sQ0FBQyxPQUFULElBQW9CLElBQUMsQ0FBQSxPQUFPLENBQUMsT0FBTyxDQUFDLE1BQWpCLEdBQTBCLENBQWpEO0FBQ0UsTUFBQSxJQUFDLENBQUEsV0FBRCxDQUFBLENBQUEsQ0FERjtLQTVCQTtBQUFBLElBZ0NJLElBQUEsTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFaLENBQ0Y7QUFBQSxNQUFBLFNBQUEsRUFBVyxJQUFDLENBQUEsU0FBWjtBQUFBLE1BQ0EsTUFBQSxFQUFRLElBRFI7S0FERSxDQWhDSixDQUFBO1dBcUNBLEtBdkNHO0VBQUEsQ0FSTCxDQUFBOztBQUFBLG1CQWlEQSxtQkFBQSxHQUFxQixTQUFBLEdBQUE7QUFDbkIsUUFBQSxjQUFBO0FBQUEsSUFBQSxHQUFBLEdBQU0sSUFBQyxDQUFBLFNBQVMsQ0FBQyxJQUFYLENBQWdCLEtBQWhCLENBQXNCLENBQUMsS0FBdkIsQ0FBQSxDQUFOLENBQUE7QUFBQSxJQUNBLFNBQUEsR0FBWSxHQUFHLENBQUMsTUFBSixDQUFBLENBRFosQ0FBQTtBQUVBLElBQUEsSUFBRyxTQUFBLEdBQVksQ0FBWixJQUFpQixHQUFHLENBQUMsS0FBSixDQUFBLENBQUEsR0FBYyxDQUFsQztBQUNFLE1BQUEsSUFBQyxDQUFBLFNBQVMsQ0FBQyxHQUFYLENBQ0U7QUFBQSxRQUFBLE1BQUEsRUFBUSxTQUFSO09BREYsQ0FBQSxDQUFBO0FBQUEsTUFHQSxJQUFDLENBQUEsUUFBRCxHQUFnQixJQUFBLE1BQU0sQ0FBQyxJQUFJLENBQUMsUUFBWixDQUNkO0FBQUEsUUFBQSxTQUFBLEVBQVcsSUFBQyxDQUFBLFNBQVo7T0FEYyxDQUhoQixDQUFBO0FBS0EsTUFBQSxJQUFHLElBQUMsQ0FBQSxPQUFPLENBQUMsS0FBSyxDQUFDLElBQWxCO0FBQ0UsUUFBQSxJQUFDLENBQUEsUUFBUSxDQUFDLEtBQUQsQ0FBVCxDQUFBLENBQUEsQ0FERjtPQUxBO2FBT0EsSUFBQyxDQUFBLFNBQUQsR0FBYSxLQVJmO0tBQUEsTUFBQTthQVVFLFVBQUEsQ0FBVyxJQUFDLENBQUEsbUJBQVosRUFBaUMsR0FBakMsRUFWRjtLQUhtQjtFQUFBLENBakRyQixDQUFBOztBQUFBLG1CQWdFQSxXQUFBLEdBQWEsU0FBQSxHQUFBO0FBQ1gsUUFBQSxxREFBQTtBQUFBLElBQUEsSUFBRyxJQUFDLENBQUEsT0FBTyxDQUFDLEtBQVQsSUFBa0IsSUFBQyxDQUFBLE9BQU8sQ0FBQyxLQUFLLENBQUMsR0FBcEM7QUFDRSxNQUFBLElBQUcsSUFBQyxDQUFBLFNBQUQsS0FBYyxJQUFqQjtBQUNFO0FBQUE7YUFBQSxxQ0FBQTswQkFBQTtBQUFBLHVCQUFBLElBQUMsQ0FBQSxTQUFELENBQVcsTUFBWCxFQUFBLENBQUE7QUFBQTt1QkFERjtPQUFBLE1BQUE7ZUFHRSxVQUFBLENBQVcsSUFBQyxDQUFBLFdBQVosRUFBeUIsR0FBekIsRUFIRjtPQURGO0tBQUEsTUFBQTtBQU1FO0FBQUE7V0FBQSx3Q0FBQTt5QkFBQTtBQUFBLHNCQUFBLElBQUMsQ0FBQSxTQUFELENBQVcsTUFBWCxFQUFBLENBQUE7QUFBQTtzQkFORjtLQURXO0VBQUEsQ0FoRWIsQ0FBQTs7QUFBQSxtQkEyRUEsU0FBQSxHQUFXLFNBQUMsT0FBRCxHQUFBO0FBQ1QsSUFBQSxPQUFPLENBQUMsU0FBUixHQUFvQixJQUFDLENBQUEsU0FBckIsQ0FBQTtXQUNJLElBQUEsTUFBTSxDQUFDLE1BQU0sQ0FBQyxPQUFkLENBQXNCLE9BQXRCLEVBRks7RUFBQSxDQTNFWCxDQUFBOztBQUFBLG1CQWlGQSxTQUFBLEdBQVcsU0FBQyxFQUFELEdBQUE7V0FDTCxJQUFBLE1BQU0sQ0FBQyxNQUFQLENBQWMsSUFBQyxDQUFBLFNBQWYsRUFBMEIsRUFBMUIsRUFESztFQUFBLENBakZYLENBQUE7O0FBQUEsbUJBb0ZBLGFBQUEsR0FBZSxTQUFBLEdBQUE7QUFDYixRQUFBLElBQUE7QUFBQSxJQUFBLElBQUEsR0FBVyxJQUFBLE1BQU0sQ0FBQyxJQUFQLENBQVksSUFBQyxDQUFBLFNBQWIsQ0FBWCxDQUFBO1dBQ0EsSUFBSSxDQUFDLGFBQUwsQ0FBQSxFQUZhO0VBQUEsQ0FwRmYsQ0FBQTs7QUFBQSxtQkEwRkEsUUFBQSxHQUFVLFNBQUMsTUFBRCxHQUFBO1dBQ1IsSUFBQyxDQUFBLFFBQVEsQ0FBQyxRQUFWLENBQW1CLE1BQW5CLEVBRFE7RUFBQSxDQTFGVixDQUFBOztBQUFBLG1CQTZGQSxNQUFBLEdBQVEsU0FBQyxLQUFELEdBQUE7V0FDTixJQUFDLENBQUEsUUFBUSxDQUFDLE1BQVYsQ0FBaUIsS0FBakIsRUFETTtFQUFBLENBN0ZSLENBQUE7O0FBQUEsbUJBa0dBLGFBQUEsR0FBZSxTQUFDLEtBQUQsRUFBUSxNQUFSLEdBQUE7QUFDYixJQUFBLElBQUcsSUFBQyxDQUFBLE9BQU8sQ0FBQyxhQUFaO2FBQ0UsSUFBQyxDQUFBLE9BQU8sQ0FBQyxhQUFULENBQXVCLEtBQXZCLEVBQThCLE1BQTlCLEVBREY7S0FEYTtFQUFBLENBbEdmLENBQUE7O0FBQUEsbUJBc0dBLFdBQUEsR0FBYSxTQUFDLEtBQUQsRUFBUSxNQUFSLEdBQUE7QUFDWCxJQUFBLElBQUcsSUFBQyxDQUFBLE9BQU8sQ0FBQyxXQUFaO2FBQ0UsSUFBQyxDQUFBLE9BQU8sQ0FBQyxXQUFULENBQXFCLEtBQXJCLEVBQTRCLE1BQTVCLEVBREY7S0FEVztFQUFBLENBdEdiLENBQUE7O0FBQUEsbUJBMEdBLFdBQUEsR0FBYSxTQUFDLEtBQUQsRUFBUSxNQUFSLEdBQUE7QUFDWCxJQUFBLElBQUcsSUFBQyxDQUFBLE9BQU8sQ0FBQyxXQUFaO2FBQ0UsSUFBQyxDQUFBLE9BQU8sQ0FBQyxXQUFULENBQXFCLEtBQXJCLEVBQTRCLE1BQTVCLEVBREY7S0FEVztFQUFBLENBMUdiLENBQUE7O0FBQUEsRUFnSEEsTUFBQyxDQUFBLFlBQUQsR0FBZSxTQUFDLE1BQUQsR0FBQTtBQUNiLFFBQUEsR0FBQTs7TUFEYyxTQUFTO0tBQ3ZCO0FBQUEsSUFBQSxHQUFBLEdBQU0sSUFBSSxDQUFDLE1BQUwsQ0FBQSxDQUFhLENBQUMsUUFBZCxDQUF1QixFQUF2QixDQUEwQixDQUFDLEtBQTNCLENBQWlDLENBQWpDLENBQU4sQ0FBQTtBQUFBLElBQ0EsR0FBQSxHQUFNLEdBQUEsR0FBTSxJQUFJLENBQUMsTUFBTCxDQUFBLENBQWEsQ0FBQyxRQUFkLENBQXVCLEVBQXZCLENBQTBCLENBQUMsS0FBM0IsQ0FBaUMsQ0FBakMsQ0FEWixDQUFBO1dBRUEsR0FBRyxDQUFDLFNBQUosQ0FBYyxDQUFkLEVBQWlCLE1BQUEsR0FBUyxDQUExQixFQUhhO0VBQUEsQ0FoSGYsQ0FBQTs7Z0JBQUE7O0lBSkYsQ0FBQTs7QUFBQSxNQTBITSxDQUFDLE1BQVAsR0FBZ0IsR0FBQSxDQUFBLE1BMUhoQixDQUFBOztBQUFBLE1BNEhZLENBQUM7QUFJRSxFQUFBLGNBQUMsU0FBRCxHQUFBO0FBQ1gsSUFEWSxJQUFDLENBQUEsWUFBRCxTQUNaLENBQUE7QUFBQSx1REFBQSxDQUFBO0FBQUEsSUFBQSxJQUFDLENBQUEsZ0JBQUQsR0FBb0IsSUFBQyxDQUFBLFNBQVMsQ0FBQyxJQUFYLENBQWdCLEdBQUEsR0FBSSxNQUFNLENBQUMsb0JBQTNCLENBQWtELENBQUMsS0FBbkQsQ0FBQSxDQUFwQixDQURXO0VBQUEsQ0FBYjs7QUFBQSxpQkFLQSxhQUFBLEdBQWUsU0FBQSxHQUFBO0FBQ2IsUUFBQSwrQkFBQTtBQUFBLElBQUEsT0FBQSxHQUFVLEVBQVYsQ0FBQTtBQUNBO0FBQUEsU0FBQSxxQ0FBQTtzQkFBQTtBQUNFLE1BQUEsQ0FBQSxHQUFRLElBQUEsTUFBTSxDQUFDLE1BQVAsQ0FBYyxJQUFDLENBQUEsU0FBZixFQUEwQixDQUFBLENBQUUsTUFBRixDQUFTLENBQUMsSUFBVixDQUFlLGFBQWYsQ0FBMUIsQ0FBUixDQUFBO0FBQUEsTUFDQSxNQUFBLEdBRUU7QUFBQSxRQUFBLE1BQUEsRUFBUSxDQUFDLENBQUMsUUFBRixDQUFBLENBQVI7QUFBQSxRQUNBLFNBQUEsRUFBVyxDQUFDLENBQUMsV0FBRixDQUFBLENBRFg7QUFBQSxRQUVBLEtBQUEsRUFBTyxDQUFDLENBQUMsS0FBRixDQUFBLENBRlA7T0FIRixDQUFBO0FBTUEsTUFBQSxJQUFvQyxDQUFDLENBQUMsV0FBRixDQUFBLENBQXBDO0FBQUEsUUFBQSxNQUFNLENBQUMsT0FBUCxHQUFpQixDQUFDLENBQUMsV0FBRixDQUFBLENBQWpCLENBQUE7T0FOQTtBQUFBLE1BT0EsT0FBTyxDQUFDLElBQVIsQ0FBYSxDQUFiLENBUEEsQ0FERjtBQUFBLEtBREE7V0FVQSxRQVhhO0VBQUEsQ0FMZixDQUFBOztjQUFBOztJQWhJRixDQUFBOztBQUFBLE1Ba0pZLENBQUMsSUFBSSxDQUFDO0FBSUgsRUFBQSxnQkFBQyxRQUFELEdBQUE7QUFHWCxJQUhZLElBQUMsQ0FBQSxVQUFELFFBR1osQ0FBQTtBQUFBLCtDQUFBLENBQUE7QUFBQSwyQ0FBQSxDQUFBO0FBQUEsNkRBQUEsQ0FBQTtBQUFBLHlEQUFBLENBQUE7QUFBQSwyQ0FBQSxDQUFBO0FBQUEsSUFBQSxJQUFDLENBQUEsU0FBRCxHQUFhLElBQUMsQ0FBQSxPQUFPLENBQUMsU0FBdEIsQ0FBQTtBQUFBLElBQ0EsSUFBQyxDQUFBLGdCQUFELEdBQW9CLElBQUMsQ0FBQSxTQUFTLENBQUMsSUFBWCxDQUFnQixHQUFBLEdBQUksTUFBTSxDQUFDLG9CQUEzQixDQURwQixDQUFBO0FBRUEsSUFBQSxJQUFHLElBQUMsQ0FBQSxTQUFTLENBQUMsSUFBWCxDQUFnQix3QkFBaEIsQ0FBeUMsQ0FBQyxNQUExQyxHQUFtRCxDQUF0RDtBQUNFLE1BQUEsSUFBQyxDQUFBLEtBQUQsR0FBUyxJQUFDLENBQUEsU0FBUyxDQUFDLElBQVgsQ0FBZ0Isd0JBQWhCLENBQXlDLENBQUMsS0FBMUMsQ0FBQSxDQUFULENBREY7S0FGQTtBQUFBLElBTUEsQ0FBQSxDQUFFLFFBQUYsQ0FBVyxDQUFDLEVBQVosQ0FBZSxXQUFmLEVBQTRCLElBQUMsQ0FBQSxTQUE3QixDQU5BLENBQUE7QUFBQSxJQU9BLENBQUEsQ0FBRSxRQUFGLENBQVcsQ0FBQyxFQUFaLENBQWUsU0FBZixFQUEwQixJQUFDLENBQUEsT0FBM0IsQ0FQQSxDQUhXO0VBQUEsQ0FBYjs7QUFBQSxtQkFjQSxPQUFBLEdBQVMsU0FBQSxHQUFBO1dBQ1AsSUFBQyxDQUFBLGdCQUFnQixDQUFDLElBQWxCLENBQXVCLGdCQUF2QixFQURPO0VBQUEsQ0FkVCxDQUFBOztBQUFBLG1CQWlCQSxjQUFBLEdBQWdCLFNBQUEsR0FBQTtXQUNkLElBQUMsQ0FBQSxnQkFBZ0IsQ0FBQyxJQUFsQixDQUF1Qiw0QkFBdkIsRUFEYztFQUFBLENBakJoQixDQUFBOztBQUFBLG1CQW9CQSxnQkFBQSxHQUFrQixTQUFDLENBQUQsR0FBQTtBQUVoQixRQUFBLHdEQUFBO0FBQUEsSUFBQSxLQUFBLEdBQVEsVUFBQSxDQUFXLElBQUMsQ0FBQSxnQkFBZ0IsQ0FBQyxLQUFsQixDQUFBLENBQVgsQ0FBUixDQUFBO0FBQUEsSUFDQSxLQUFBLEdBQVEsVUFBQSxDQUFXLElBQUMsQ0FBQSxnQkFBZ0IsQ0FBQyxNQUFsQixDQUFBLENBQVgsQ0FEUixDQUFBO0FBTUEsSUFBQSxJQUFHLElBQUMsQ0FBQSxLQUFKO0FBRUUsTUFBQSxHQUFBLEdBQU0sQ0FBQyxDQUFDLEtBQUYsR0FBVSxJQUFDLENBQUEsU0FBUyxDQUFDLE1BQVgsQ0FBQSxDQUFtQixDQUFDLElBQXBDLENBQUE7QUFBQSxNQUNBLEdBQUEsR0FBTSxDQUFDLENBQUMsS0FBRixHQUFVLElBQUMsQ0FBQSxTQUFTLENBQUMsTUFBWCxDQUFBLENBQW1CLENBQUMsR0FEcEMsQ0FBQTtBQUFBLE1BRUEsSUFBQSxHQUFPLElBQUMsQ0FBQSxLQUFLLENBQUMsS0FBUCxDQUFBLENBRlAsQ0FBQTtBQUFBLE1BR0EsSUFBQSxHQUFPLElBQUMsQ0FBQSxLQUFLLENBQUMsTUFBUCxDQUFBLENBSFAsQ0FBQTtBQUFBLE1BSUEsSUFBQSxHQUFPLFFBQUEsQ0FBUyxJQUFDLENBQUEsS0FBSyxDQUFDLEdBQVAsQ0FBVyxNQUFYLENBQVQsQ0FKUCxDQUFBO0FBQUEsTUFLQSxJQUFBLEdBQU8sUUFBQSxDQUFTLElBQUMsQ0FBQSxLQUFLLENBQUMsR0FBUCxDQUFXLEtBQVgsQ0FBVCxDQUxQLENBQUE7QUFBQSxNQU1BLEdBQUEsR0FBTSxDQUFDLENBQUMsR0FBQSxHQUFNLElBQUksQ0FBQyxHQUFMLENBQVMsSUFBVCxDQUFQLENBQUEsR0FBeUIsSUFBMUIsQ0FBQSxHQUFrQyxHQU54QyxDQUFBO0FBQUEsTUFPQSxHQUFBLEdBQU0sQ0FBQyxDQUFDLEdBQUEsR0FBTSxJQUFJLENBQUMsR0FBTCxDQUFTLElBQVQsQ0FBUCxDQUFBLEdBQXlCLElBQTFCLENBQUEsR0FBa0MsR0FQeEMsQ0FGRjtLQUFBLE1BQUE7QUFZRSxNQUFBLEdBQUEsR0FBTSxDQUFDLENBQUMsQ0FBQyxLQUFGLEdBQVUsSUFBQyxDQUFBLFNBQVMsQ0FBQyxNQUFYLENBQUEsQ0FBbUIsQ0FBQyxJQUEvQixDQUFBLEdBQXVDLEtBQTdDLENBQUE7QUFBQSxNQUNBLEdBQUEsR0FBTyxDQUFDLENBQUMsQ0FBQyxLQUFGLEdBQVUsSUFBQyxDQUFBLFNBQVMsQ0FBQyxNQUFYLENBQUEsQ0FBbUIsQ0FBQyxHQUEvQixDQUFBLEdBQXNDLEtBRDdDLENBWkY7S0FOQTtXQW9CQSxDQUFDLEdBQUQsRUFBTSxHQUFOLEVBdEJnQjtFQUFBLENBcEJsQixDQUFBOztBQUFBLG1CQThDQSxPQUFBLEdBQVMsU0FBQyxDQUFELEdBQUE7QUFFUCxRQUFBLFNBQUE7QUFBQSxJQUFBLE1BQUEsR0FBUyxJQUFDLENBQUEsZ0JBQWdCLENBQUMsSUFBbEIsQ0FBdUIsY0FBdkIsQ0FBc0MsQ0FBQyxLQUF2QyxDQUFBLENBQVQsQ0FBQTtBQUNBLElBQUEsSUFBRyxJQUFDLENBQUEsY0FBRCxDQUFBLENBQWlCLENBQUMsTUFBbEIsR0FBMkIsQ0FBOUI7QUFDRSxNQUFBLENBQUEsR0FBUSxJQUFBLE1BQU0sQ0FBQyxNQUFQLENBQWMsSUFBQyxDQUFBLFNBQWYsRUFBMEIsTUFBTSxDQUFDLElBQVAsQ0FBWSxhQUFaLENBQTFCLENBQVIsQ0FBQTtBQUFBLE1BQ0EsSUFBQyxDQUFBLE9BQU8sQ0FBQyxNQUFNLENBQUMsYUFBaEIsQ0FBOEIsQ0FBOUIsRUFBaUMsQ0FBakMsQ0FEQSxDQUFBO0FBQUEsTUFFQSxDQUFDLENBQUMsWUFBRixDQUFBLENBRkEsQ0FBQTtBQUFBLE1BR0EsQ0FBQyxDQUFDLGVBQUYsQ0FBQSxDQUhBLENBQUE7QUFBQSxNQUlBLElBQUMsQ0FBQSxjQUFELENBQUEsQ0FBaUIsQ0FBQyxXQUFsQixDQUE4QixhQUE5QixDQUpBLENBREY7S0FEQTtBQVFBLElBQUEsSUFBRyxDQUFBLENBQUUsQ0FBQyxDQUFDLE1BQUosQ0FBVyxDQUFDLFFBQVosQ0FBcUIsTUFBTSxDQUFDLG9CQUE1QixDQUFIO0FBQ0UsTUFBQSxJQUFDLENBQUEsT0FBTyxDQUFDLE1BQU0sQ0FBQyxXQUFoQixDQUE0QixDQUE1QixFQUErQixJQUFDLENBQUEsZ0JBQUQsQ0FBa0IsQ0FBbEIsQ0FBL0IsQ0FBQSxDQURGO0tBUkE7QUFXQSxJQUFBLElBQ0UsQ0FBQSxDQUFFLENBQUMsQ0FBQyxNQUFKLENBQVcsQ0FBQyxRQUFaLENBQXFCLE1BQU0sQ0FBQyxXQUE1QixDQUFBLElBQ0EsQ0FBQSxDQUFFLENBQUMsQ0FBQyxNQUFKLENBQVcsQ0FBQyxPQUFaLENBQW9CLEdBQUEsR0FBSSxNQUFNLENBQUMsV0FBL0IsQ0FBNkMsQ0FBQyxNQUE5QyxHQUF1RCxDQUZ6RDtBQUlFLE1BQUEsSUFBRyxDQUFBLENBQUUsQ0FBQyxDQUFDLE1BQUosQ0FBVyxDQUFDLFFBQVosQ0FBcUIsTUFBTSxDQUFDLFdBQTVCLENBQUg7QUFDRSxRQUFBLE1BQUEsR0FBUyxDQUFBLENBQUUsQ0FBQyxDQUFDLE1BQUosQ0FBVCxDQURGO09BQUEsTUFBQTtBQUdFLFFBQUEsTUFBQSxHQUFTLENBQUEsQ0FBRSxDQUFDLENBQUMsTUFBSixDQUFXLENBQUMsT0FBWixDQUFvQixHQUFBLEdBQUksTUFBTSxDQUFDLFdBQS9CLENBQTZDLENBQUMsS0FBOUMsQ0FBQSxDQUFULENBSEY7T0FBQTtBQUFBLE1BSUEsQ0FBQSxHQUFRLElBQUEsTUFBTSxDQUFDLE1BQVAsQ0FBYyxJQUFDLENBQUEsU0FBZixFQUEwQixNQUFNLENBQUMsSUFBUCxDQUFZLGFBQVosQ0FBMUIsQ0FKUixDQUFBO0FBQUEsTUFLQSxJQUFDLENBQUEsT0FBTyxDQUFDLE1BQU0sQ0FBQyxXQUFoQixDQUE0QixDQUE1QixFQUErQixDQUEvQixDQUxBLENBSkY7S0FYQTtXQXFCQSxLQXZCTztFQUFBLENBOUNULENBQUE7O0FBQUEsbUJBdUVBLFNBQUEsR0FBVyxTQUFDLENBQUQsR0FBQTtBQUNULFFBQUEsMEpBQUE7QUFBQSxJQUFBLE9BQUEsR0FBVSxJQUFDLENBQUEsZ0JBQWdCLENBQUMsSUFBbEIsQ0FBdUIsNEJBQXZCLENBQVYsQ0FBQTtBQUVBLElBQUEsSUFBRyxPQUFPLENBQUMsTUFBUixHQUFpQixDQUFwQjtBQUtFLE1BQUEsTUFBQSxHQUFTLE9BQU8sQ0FBQyxLQUFSLENBQUEsQ0FBVCxDQUFBO0FBSUEsTUFBQSxJQUNFLElBQUksQ0FBQyxHQUFMLENBQVMsQ0FBQyxDQUFDLEtBQUYsR0FBVSxNQUFNLENBQUMsSUFBUCxDQUFZLG1CQUFaLENBQW5CLENBQUEsR0FBdUQsQ0FBdkQsSUFDQSxJQUFJLENBQUMsR0FBTCxDQUFTLENBQUMsQ0FBQyxLQUFGLEdBQVUsTUFBTSxDQUFDLElBQVAsQ0FBWSxtQkFBWixDQUFuQixDQUFBLEdBQXVELENBRnpEO0FBSUUsUUFBQSxDQUFBLENBQUUsR0FBQSxHQUFHLENBQUMsTUFBTSxDQUFDLElBQVAsQ0FBWSxjQUFaLENBQUQsQ0FBTCxDQUFvQyxDQUFDLFdBQXJDLENBQWlELFFBQWpELENBQUEsQ0FKRjtPQUpBO0FBQUEsTUFZQSxTQUFBLEdBQWdCLENBQUMsQ0FBQyxLQUFGLEdBQVUsSUFBQyxDQUFBLFNBQVMsQ0FBQyxNQUFYLENBQUEsQ0FBbUIsQ0FBQyxJQVo5QyxDQUFBO0FBQUEsTUFhQSxRQUFBLEdBQWdCLENBQUMsQ0FBQyxLQUFGLEdBQVUsSUFBQyxDQUFBLFNBQVMsQ0FBQyxNQUFYLENBQUEsQ0FBbUIsQ0FBQyxHQWI5QyxDQUFBO0FBQUEsTUFjQSxTQUFBLEdBQWdCLElBQUMsQ0FBQSxTQUFTLENBQUMsS0FBWCxDQUFBLENBZGhCLENBQUE7QUFBQSxNQWVBLFVBQUEsR0FBZ0IsSUFBQyxDQUFBLFNBQVMsQ0FBQyxNQUFYLENBQUEsQ0FmaEIsQ0FBQTtBQUFBLE1BZ0JBLFVBQUEsR0FBZ0IsU0FBQSxHQUFZLENBQUMsTUFBTSxDQUFDLFVBQVAsQ0FBQSxDQUFBLEdBQXNCLENBQXZCLENBaEI1QixDQUFBO0FBQUEsTUFpQkEsU0FBQSxHQUFnQixRQUFBLEdBQVcsQ0FBQyxNQUFNLENBQUMsV0FBUCxDQUFBLENBQUEsR0FBdUIsQ0FBeEIsQ0FqQjNCLENBQUE7QUFBQSxNQWtCQSxXQUFBLEdBQWdCLFNBQUEsR0FBWSxDQUFDLE1BQU0sQ0FBQyxVQUFQLENBQUEsQ0FBQSxHQUFzQixDQUF2QixDQWxCNUIsQ0FBQTtBQUFBLE1BbUJBLFlBQUEsR0FBZ0IsUUFBQSxHQUFXLENBQUMsTUFBTSxDQUFDLFdBQVAsQ0FBQSxDQUFBLEdBQXVCLENBQXhCLENBbkIzQixDQUFBO0FBQUEsTUFvQkEsV0FBQSxHQUFnQixNQUFNLENBQUMsVUFBUCxDQUFBLENBcEJoQixDQUFBO0FBQUEsTUFxQkEsWUFBQSxHQUFnQixNQUFNLENBQUMsV0FBUCxDQUFBLENBckJoQixDQUFBO0FBMEJBLE1BQUEsSUFBRyxVQUFBLElBQWMsQ0FBakI7QUFDRSxRQUFBLE9BQUEsR0FBVSxDQUFWLENBREY7T0FBQSxNQUVLLElBQUcsV0FBQSxHQUFjLFNBQWpCO0FBQ0gsUUFBQSxPQUFBLEdBQVUsVUFBVixDQURHO09BQUEsTUFBQTtBQUdILFFBQUEsT0FBQSxHQUFVLFNBQUEsR0FBWSxXQUF0QixDQUhHO09BNUJMO0FBb0NBLE1BQUEsSUFBRyxTQUFBLElBQWEsQ0FBaEI7QUFDRSxRQUFBLE9BQUEsR0FBVSxDQUFWLENBREY7T0FBQSxNQUVLLElBQUcsWUFBQSxHQUFlLFVBQWxCO0FBQ0gsUUFBQSxPQUFBLEdBQVUsU0FBVixDQURHO09BQUEsTUFBQTtBQUdILFFBQUEsT0FBQSxHQUFVLFVBQUEsR0FBYSxZQUF2QixDQUhHO09BdENMO2FBNkNBLE1BQU0sQ0FBQyxHQUFQLENBQ0U7QUFBQSxRQUFBLElBQUEsRUFBTSxPQUFOO0FBQUEsUUFDQSxHQUFBLEVBQUssT0FETDtPQURGLEVBbERGO0tBSFM7RUFBQSxDQXZFWCxDQUFBOztnQkFBQTs7SUF0SkYsQ0FBQTs7QUFBQSxNQXNSWSxDQUFDLElBQUksQ0FBQztBQUlILEVBQUEsa0JBQUMsUUFBRCxHQUFBO0FBRVgsSUFGWSxJQUFDLENBQUEsVUFBRCxRQUVaLENBQUE7QUFBQSwyQ0FBQSxDQUFBO0FBQUEseUNBQUEsQ0FBQTtBQUFBLDJDQUFBLENBQUE7QUFBQSwrQ0FBQSxDQUFBO0FBQUEsK0NBQUEsQ0FBQTtBQUFBLDZDQUFBLENBQUE7QUFBQSwrRUFBQSxDQUFBO0FBQUEscURBQUEsQ0FBQTtBQUFBLDJEQUFBLENBQUE7QUFBQSw2RUFBQSxDQUFBO0FBQUEsMkVBQUEsQ0FBQTtBQUFBLHFEQUFBLENBQUE7QUFBQSwrQ0FBQSxDQUFBO0FBQUEsdURBQUEsQ0FBQTtBQUFBLHlEQUFBLENBQUE7QUFBQSwyRUFBQSxDQUFBO0FBQUEseUVBQUEsQ0FBQTtBQUFBLG1EQUFBLENBQUE7QUFBQSw2Q0FBQSxDQUFBO0FBQUEseUNBQUEsQ0FBQTtBQUFBLDZDQUFBLENBQUE7QUFBQSw2REFBQSxDQUFBO0FBQUEsK0RBQUEsQ0FBQTtBQUFBLHlEQUFBLENBQUE7QUFBQSxpREFBQSxDQUFBO0FBQUEsK0RBQUEsQ0FBQTtBQUFBLHVEQUFBLENBQUE7QUFBQSx5Q0FBQSxDQUFBO0FBQUEsSUFBQSxJQUFDLENBQUEsU0FBRCxHQUFhLElBQUMsQ0FBQSxPQUFPLENBQUMsU0FBdEIsQ0FBQTtBQUFBLElBQ0EsSUFBQyxDQUFBLGdCQUFELEdBQW9CLElBQUMsQ0FBQSxTQUFTLENBQUMsSUFBWCxDQUFnQixHQUFBLEdBQUksTUFBTSxDQUFDLG9CQUEzQixDQURwQixDQUFBO0FBQUEsSUFFQSxJQUFDLENBQUEsS0FBRCxHQUFTLElBQUMsQ0FBQSxTQUFTLENBQUMsSUFBWCxDQUFnQixLQUFoQixDQUFzQixDQUFDLEtBQXZCLENBQUEsQ0FGVCxDQUFBO0FBQUEsSUFHQSxJQUFDLENBQUEsTUFBRCxHQUFVLE1BQU0sQ0FBQyxZQUFQLENBQUEsQ0FIVixDQUFBO0FBQUEsSUFJQSxJQUFDLENBQUEsZ0JBQWdCLENBQUMsSUFBbEIsQ0FBdUIsY0FBdkIsRUFBdUMsSUFBQyxDQUFBLE1BQXhDLENBSkEsQ0FBQTtBQUFBLElBTUEsSUFBQyxDQUFBLGFBQUQsR0FDRTtBQUFBLE1BQUEsTUFBQSxFQUFnQixDQUFoQjtBQUFBLE1BQ0EsS0FBQSxFQUFnQixDQURoQjtBQUFBLE1BRUEsS0FBQSxFQUFnQixJQUFDLENBQUEsS0FBSyxDQUFDLEtBQVAsQ0FBQSxDQUZoQjtBQUFBLE1BR0EsTUFBQSxFQUFnQixJQUFDLENBQUEsS0FBSyxDQUFDLE1BQVAsQ0FBQSxDQUhoQjtBQUFBLE1BSUEsS0FBQSxFQUFnQixDQUpoQjtBQUFBLE1BS0EsU0FBQSxFQUFXLEdBTFg7S0FQRixDQUFBO0FBQUEsSUFhQSxJQUFDLENBQUEsYUFBRCxDQUFBLENBYkEsQ0FGVztFQUFBLENBQWI7O0FBQUEscUJBb0JBLE1BQUEsR0FBSyxTQUFBLEdBQUE7QUFFSCxJQUFBLElBQUMsQ0FBQSxTQUFTLENBQUMsT0FBWCxDQUFtQiw0SkFBbkIsQ0FBQSxDQUFBO0FBQUEsSUFNQSxJQUFDLENBQUEsU0FBUyxDQUFDLElBQVgsQ0FBZ0IseUJBQWhCLENBQTBDLENBQUMsS0FBM0MsQ0FBaUQsQ0FBQSxTQUFBLEtBQUEsR0FBQTthQUFBLFNBQUMsQ0FBRCxHQUFBO0FBQy9DLFFBQUEsQ0FBQyxDQUFDLGNBQUYsQ0FBQSxDQUFBLENBQUE7ZUFDQSxLQUFDLENBQUEsTUFBRCxDQUFBLEVBRitDO01BQUEsRUFBQTtJQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBakQsQ0FOQSxDQUFBO0FBQUEsSUFTQSxJQUFDLENBQUEsU0FBUyxDQUFDLElBQVgsQ0FBZ0IsMEJBQWhCLENBQTJDLENBQUMsS0FBNUMsQ0FBa0QsQ0FBQSxTQUFBLEtBQUEsR0FBQTthQUFBLFNBQUMsQ0FBRCxHQUFBO0FBQ2hELFFBQUEsQ0FBQyxDQUFDLGNBQUYsQ0FBQSxDQUFBLENBQUE7ZUFDQSxLQUFDLENBQUEsT0FBRCxDQUFBLEVBRmdEO01BQUEsRUFBQTtJQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBbEQsQ0FUQSxDQUFBO0FBQUEsSUFhQSxJQUFDLENBQUEsU0FBUyxDQUFDLEVBQVgsQ0FBYyxVQUFkLEVBQTBCLElBQUMsQ0FBQSxRQUEzQixDQWJBLENBQUE7QUFBQSxJQWNBLElBQUMsQ0FBQSxTQUFTLENBQUMsRUFBWCxDQUFjLFdBQWQsRUFBMkIsSUFBQyxDQUFBLFNBQTVCLENBZEEsQ0FBQTtBQUFBLElBZUEsQ0FBQSxDQUFFLFFBQUYsQ0FBVyxDQUFDLEVBQVosQ0FBZSxXQUFmLEVBQTRCLElBQUMsQ0FBQSxTQUE3QixDQWZBLENBQUE7V0FnQkEsQ0FBQSxDQUFFLFFBQUYsQ0FBVyxDQUFDLEVBQVosQ0FBZSxTQUFmLEVBQTBCLElBQUMsQ0FBQSxPQUEzQixFQWxCRztFQUFBLENBcEJMLENBQUE7O0FBQUEscUJBMENBLGFBQUEsR0FBZSxTQUFBLEdBQUE7QUFDYixJQUFBLElBQUMsQ0FBQSxLQUFLLENBQUMsR0FBUCxDQUNFO0FBQUEsTUFBQSxJQUFBLEVBQVMsSUFBQyxDQUFBLGFBQWEsQ0FBQyxNQUFoQixHQUF1QixJQUEvQjtBQUFBLE1BQ0EsR0FBQSxFQUFRLElBQUMsQ0FBQSxhQUFhLENBQUMsS0FBaEIsR0FBc0IsSUFEN0I7QUFBQSxNQUVBLEtBQUEsRUFBUyxDQUFDLElBQUMsQ0FBQSxhQUFhLENBQUMsS0FBZixHQUF1QixLQUF4QixDQUFBLEdBQThCLEdBRnZDO0FBQUEsTUFHQSxNQUFBLEVBQVEsTUFIUjtLQURGLENBQUEsQ0FBQTtXQUtBLElBQUMsQ0FBQSxVQUFELENBQUEsRUFOYTtFQUFBLENBMUNmLENBQUE7O0FBQUEscUJBa0RBLGlCQUFBLEdBQW1CLFNBQUEsR0FBQTtBQUNqQixJQUFBLElBQUMsQ0FBQSxLQUFLLENBQUMsT0FBUCxDQUNFO0FBQUEsTUFBQSxJQUFBLEVBQVMsSUFBQyxDQUFBLGFBQWEsQ0FBQyxNQUFoQixHQUF1QixJQUEvQjtBQUFBLE1BQ0EsR0FBQSxFQUFRLElBQUMsQ0FBQSxhQUFhLENBQUMsS0FBaEIsR0FBc0IsSUFEN0I7QUFBQSxNQUVBLEtBQUEsRUFBUyxDQUFDLElBQUMsQ0FBQSxhQUFhLENBQUMsS0FBZixHQUF1QixLQUF4QixDQUFBLEdBQThCLEdBRnZDO0FBQUEsTUFHQSxNQUFBLEVBQVEsTUFIUjtLQURGLEVBS0UsR0FMRixDQUFBLENBQUE7V0FNQSxJQUFDLENBQUEsY0FBRCxDQUFBLEVBUGlCO0VBQUEsQ0FsRG5CLENBQUE7O0FBQUEscUJBMkRBLFVBQUEsR0FBWSxTQUFBLEdBQUE7QUFDVixRQUFBLGtDQUFBO0FBQUEsSUFBQSxPQUFBLEdBQVUsSUFBQyxDQUFBLFNBQVMsQ0FBQyxJQUFYLENBQWdCLG1CQUFoQixDQUFWLENBQUE7QUFDQSxJQUFBLElBQUcsT0FBTyxDQUFDLE1BQVIsR0FBaUIsQ0FBcEI7QUFDRSxXQUFBLHlDQUFBOzRCQUFBO0FBQ0UsUUFBQSxJQUFBLEdBQU8sQ0FBQyxJQUFDLENBQUEsUUFBRCxDQUFBLENBQUEsR0FBYyxDQUFDLENBQUEsQ0FBRSxNQUFGLENBQVMsQ0FBQyxJQUFWLENBQWUsVUFBZixDQUFBLEdBQTZCLEdBQTlCLENBQWYsQ0FBQSxHQUNMLElBQUMsQ0FBQSxhQUFhLENBQUMsTUFEVixHQUNtQixDQUFDLENBQUEsQ0FBRSxNQUFGLENBQVMsQ0FBQyxVQUFWLENBQUEsQ0FBQSxHQUF5QixDQUExQixDQUQxQixDQUFBO0FBQUEsUUFFQSxHQUFBLEdBQU0sQ0FBQyxJQUFDLENBQUEsU0FBRCxDQUFBLENBQUEsR0FBZSxDQUFDLENBQUEsQ0FBRSxNQUFGLENBQVMsQ0FBQyxJQUFWLENBQWUsVUFBZixDQUFBLEdBQTZCLEdBQTlCLENBQWhCLENBQUEsR0FDSixJQUFDLENBQUEsYUFBYSxDQUFDLEtBRFgsR0FDbUIsQ0FBQyxDQUFBLENBQUUsTUFBRixDQUFTLENBQUMsV0FBVixDQUFBLENBQUEsR0FBMEIsQ0FBM0IsQ0FIekIsQ0FBQTtBQUFBLFFBSUEsQ0FBQSxDQUFFLE1BQUYsQ0FBUyxDQUFDLEdBQVYsQ0FDRTtBQUFBLFVBQUEsSUFBQSxFQUFTLElBQUQsR0FBTSxJQUFkO0FBQUEsVUFDQSxHQUFBLEVBQVEsR0FBRCxHQUFLLElBRFo7U0FERixDQUpBLENBREY7QUFBQSxPQUFBO2FBUUEsSUFBQyxDQUFBLGlCQUFELENBQUEsRUFURjtLQUZVO0VBQUEsQ0EzRFosQ0FBQTs7QUFBQSxxQkF3RUEsY0FBQSxHQUFnQixTQUFBLEdBQUE7QUFDZCxRQUFBLDhDQUFBO0FBQUEsSUFBQSxPQUFBLEdBQVUsSUFBQyxDQUFBLFNBQVMsQ0FBQyxJQUFYLENBQWdCLG1CQUFoQixDQUFWLENBQUE7QUFDQSxJQUFBLElBQUcsT0FBTyxDQUFDLE1BQVIsR0FBaUIsQ0FBcEI7QUFDRTtXQUFBLHlDQUFBOzRCQUFBO0FBQ0UsUUFBQSxDQUFBLEdBQVEsSUFBQSxNQUFNLENBQUMsTUFBUCxDQUFjLElBQUMsQ0FBQSxTQUFmLEVBQTBCLENBQUEsQ0FBRSxNQUFGLENBQVMsQ0FBQyxJQUFWLENBQWUsYUFBZixDQUExQixDQUFSLENBQUE7QUFBQSxRQUNBLENBQUMsQ0FBQyxXQUFGLENBQUEsQ0FEQSxDQUFBO0FBQUEsUUFFQSxJQUFBLEdBQU8sQ0FBQyxJQUFDLENBQUEsUUFBRCxDQUFBLENBQUEsR0FBYyxDQUFDLENBQUEsQ0FBRSxNQUFGLENBQVMsQ0FBQyxJQUFWLENBQWUsVUFBZixDQUFBLEdBQTZCLEdBQTlCLENBQWYsQ0FBQSxHQUNMLElBQUMsQ0FBQSxhQUFhLENBQUMsTUFEVixHQUNtQixDQUFDLENBQUEsQ0FBRSxNQUFGLENBQVMsQ0FBQyxVQUFWLENBQUEsQ0FBQSxHQUF5QixDQUExQixDQUgxQixDQUFBO0FBQUEsUUFJQSxHQUFBLEdBQU0sQ0FBQyxJQUFDLENBQUEsU0FBRCxDQUFBLENBQUEsR0FBZSxDQUFDLENBQUEsQ0FBRSxNQUFGLENBQVMsQ0FBQyxJQUFWLENBQWUsVUFBZixDQUFBLEdBQTZCLEdBQTlCLENBQWhCLENBQUEsR0FDSixJQUFDLENBQUEsYUFBYSxDQUFDLEtBRFgsR0FDbUIsQ0FBQyxDQUFBLENBQUUsTUFBRixDQUFTLENBQUMsV0FBVixDQUFBLENBQUEsR0FBMEIsQ0FBM0IsQ0FMekIsQ0FBQTtBQUFBLHFCQU1HLENBQUEsU0FBQyxDQUFELEdBQUE7aUJBQ0QsQ0FBQSxDQUFFLE1BQUYsQ0FBUyxDQUFDLE9BQVYsQ0FDRTtBQUFBLFlBQUEsSUFBQSxFQUFTLElBQUQsR0FBTSxJQUFkO0FBQUEsWUFDQSxHQUFBLEVBQVEsR0FBRCxHQUFLLElBRFo7V0FERixFQUdFLEdBSEYsRUFHTyxDQUFBLFNBQUEsS0FBQSxHQUFBO21CQUFBLFNBQUEsR0FBQTtBQUNMLGNBQUEsQ0FBQyxDQUFDLGVBQUYsQ0FBQSxDQUFBLENBQUE7cUJBQ0EsQ0FBQyxDQUFDLGFBQUYsQ0FBQSxFQUZLO1lBQUEsRUFBQTtVQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FIUCxFQURDO1FBQUEsQ0FBQSxDQUFILENBQUksQ0FBSixFQU5BLENBREY7QUFBQTtxQkFERjtLQUZjO0VBQUEsQ0F4RWhCLENBQUE7O0FBQUEscUJBMEZBLGlCQUFBLEdBQW1CLFNBQUEsR0FBQTtBQUNqQixRQUFBLHNCQUFBO0FBQUE7QUFBQSxTQUFBLHFDQUFBO3NCQUFBO0FBQ0UsTUFBQSxDQUFBLEdBQVEsSUFBQSxNQUFNLENBQUMsTUFBUCxDQUFjLElBQUMsQ0FBQSxTQUFmLEVBQTBCLENBQUEsQ0FBRSxNQUFGLENBQVMsQ0FBQyxJQUFWLENBQWUsYUFBZixDQUExQixDQUFSLENBQUE7QUFBQSxNQUNBLENBQUMsQ0FBQyxlQUFGLENBQUEsQ0FEQSxDQURGO0FBQUEsS0FBQTtXQUdBLEtBSmlCO0VBQUEsQ0ExRm5CLENBQUE7O0FBQUEscUJBZ0dBLGdCQUFBLEdBQWtCLFNBQUEsR0FBQTtBQUNoQixRQUFBLHNCQUFBO0FBQUE7QUFBQSxTQUFBLHFDQUFBO3NCQUFBO0FBQ0UsTUFBQSxDQUFBLEdBQVEsSUFBQSxNQUFNLENBQUMsTUFBUCxDQUFjLElBQUMsQ0FBQSxTQUFmLEVBQTBCLENBQUEsQ0FBRSxNQUFGLENBQVMsQ0FBQyxJQUFWLENBQWUsYUFBZixDQUExQixDQUFSLENBQUE7QUFBQSxNQUNBLENBQUMsQ0FBQyxjQUFGLENBQUEsQ0FEQSxDQURGO0FBQUEsS0FBQTtXQUdBLEtBSmdCO0VBQUEsQ0FoR2xCLENBQUE7O0FBQUEscUJBc0dBLFFBQUEsR0FBVSxTQUFDLE1BQUQsR0FBQTtBQUNSLFFBQUEsZ0JBQUE7QUFBQSxJQUFBLElBQUcsTUFBTyxDQUFBLENBQUEsQ0FBUCxJQUFhLEVBQWhCO0FBQXdCLE1BQUEsQ0FBQSxHQUFJLEdBQUEsR0FBTSxNQUFPLENBQUEsQ0FBQSxDQUFqQixDQUF4QjtLQUFBLE1BQUE7QUFBaUQsTUFBQSxDQUFBLEdBQUksTUFBTyxDQUFBLENBQUEsQ0FBWCxDQUFqRDtLQUFBO0FBQ0EsSUFBQSxJQUFHLE1BQU8sQ0FBQSxDQUFBLENBQVAsSUFBYSxFQUFoQjtBQUF3QixNQUFBLENBQUEsR0FBSSxHQUFBLEdBQU0sTUFBTyxDQUFBLENBQUEsQ0FBakIsQ0FBeEI7S0FBQSxNQUFBO0FBQWlELE1BQUEsQ0FBQSxHQUFJLE1BQU8sQ0FBQSxDQUFBLENBQVgsQ0FBakQ7S0FEQTtBQUFBLElBRUEsSUFBQSxHQUFPLEVBQUEsR0FBSyxDQUFDLElBQUMsQ0FBQSxjQUFELENBQUEsQ0FBQSxHQUFvQixDQUFyQixDQUZaLENBQUE7QUFBQSxJQUdBLElBQUEsR0FBTyxFQUFBLEdBQUssQ0FBQyxJQUFDLENBQUEsZUFBRCxDQUFBLENBQUEsR0FBcUIsQ0FBdEIsQ0FIWixDQUFBO0FBQUEsSUFNQSxJQUFDLENBQUEsU0FBUyxDQUFDLElBQVgsQ0FBZ0IsaUJBQWhCLENBQWtDLENBQUMsV0FBbkMsQ0FBK0MsUUFBL0MsQ0FOQSxDQUFBO0FBQUEsSUFTQSxJQUFDLENBQUEsYUFBYSxDQUFDLEtBQWYsR0FBd0IsSUFBQyxDQUFBLGFBQWEsQ0FBQyxLQUFmLEdBQXVCLElBQUMsQ0FBQSxhQUFhLENBQUMsU0FUOUQsQ0FBQTtBQUFBLElBVUEsSUFBQyxDQUFBLGFBQWEsQ0FBQyxNQUFmLEdBQXdCLENBQUEsQ0FDdEIsQ0FBQyxJQUFDLENBQUEsUUFBRCxDQUFBLENBQUEsR0FBYyxDQUFDLE1BQU8sQ0FBQSxDQUFBLENBQVAsR0FBWSxHQUFiLENBQWYsQ0FBQSxHQUFvQyxDQUFDLElBQUMsQ0FBQSxjQUFELENBQUEsQ0FBQSxHQUFvQixDQUFyQixDQURaLENBVjFCLENBQUE7QUFBQSxJQWFBLElBQUMsQ0FBQSxhQUFhLENBQUMsS0FBZixHQUF1QixDQUFBLENBQ3JCLENBQUMsSUFBQyxDQUFBLFNBQUQsQ0FBQSxDQUFBLEdBQWUsQ0FBQyxNQUFPLENBQUEsQ0FBQSxDQUFQLEdBQVksR0FBYixDQUFoQixDQUFBLEdBQXFDLENBQUMsSUFBQyxDQUFBLGVBQUQsQ0FBQSxDQUFBLEdBQXFCLENBQXRCLENBRGQsQ0FiekIsQ0FBQTtBQWdCQSxXQUFNLENBQUMsSUFBQyxDQUFBLFFBQUQsQ0FBQSxDQUFBLEdBQWMsSUFBZixDQUFBLElBQXdCLENBQUMsSUFBQyxDQUFBLFNBQUQsQ0FBQSxDQUFBLEdBQWUsSUFBaEIsQ0FBOUIsR0FBQTtBQUNFLE1BQUEsSUFBQyxDQUFBLGFBQWEsQ0FBQyxLQUFmLEdBQXdCLElBQUMsQ0FBQSxhQUFhLENBQUMsS0FBZixHQUF1QixJQUFDLENBQUEsYUFBYSxDQUFDLFNBQTlELENBQUE7QUFBQSxNQUNBLElBQUMsQ0FBQSxhQUFhLENBQUMsTUFBZixHQUF3QixDQUFBLENBQ3RCLENBQUMsSUFBQyxDQUFBLFFBQUQsQ0FBQSxDQUFBLEdBQWMsQ0FBQyxNQUFPLENBQUEsQ0FBQSxDQUFQLEdBQVksR0FBYixDQUFmLENBQUEsR0FBb0MsQ0FBQyxJQUFDLENBQUEsY0FBRCxDQUFBLENBQUEsR0FBb0IsQ0FBckIsQ0FEWixDQUQxQixDQUFBO0FBQUEsTUFJQSxJQUFDLENBQUEsYUFBYSxDQUFDLEtBQWYsR0FBdUIsQ0FBQSxDQUNyQixDQUFDLElBQUMsQ0FBQSxTQUFELENBQUEsQ0FBQSxHQUFlLENBQUMsTUFBTyxDQUFBLENBQUEsQ0FBUCxHQUFZLEdBQWIsQ0FBaEIsQ0FBQSxHQUFxQyxDQUFDLElBQUMsQ0FBQSxlQUFELENBQUEsQ0FBQSxHQUFxQixDQUF0QixDQURkLENBSnpCLENBREY7SUFBQSxDQWhCQTtXQXdCQSxJQUFDLENBQUEsaUJBQUQsQ0FBQSxFQXpCUTtFQUFBLENBdEdWLENBQUE7O0FBQUEscUJBaUlBLE1BQUEsR0FBUSxTQUFDLEtBQUQsR0FBQTtBQUNOLFFBQUEsQ0FBQTtBQUFBLElBQUEsQ0FBQSxHQUFJLElBQUMsQ0FBQSxhQUFhLENBQUMsU0FBbkIsQ0FBQTtBQUNBLElBQUEsSUFBTyxDQUFDLENBQUMsS0FBQSxHQUFRLENBQVQsQ0FBQSxHQUFjLENBQWYsQ0FBQSxLQUFxQixJQUFDLENBQUEsYUFBYSxDQUFDLEtBQTNDO0FBQ0UsTUFBQSxJQUFDLENBQUEsYUFBYSxDQUFDLEtBQWYsR0FBdUIsQ0FBQyxLQUFBLEdBQVEsQ0FBVCxDQUFBLEdBQWMsQ0FBZCxHQUFrQixDQUF6QyxDQUFBO2FBQ0EsSUFBQyxDQUFBLE9BQUQsQ0FBQSxFQUZGO0tBRk07RUFBQSxDQWpJUixDQUFBOztBQUFBLHFCQTJJQSxRQUFBLEdBQVUsU0FBQSxHQUFBO1dBQ1IsVUFBQSxDQUFXLElBQUMsQ0FBQSxhQUFhLENBQUMsS0FBZixHQUF1QixJQUFDLENBQUEsYUFBYSxDQUFDLEtBQWpELEVBRFE7RUFBQSxDQTNJVixDQUFBOztBQUFBLHFCQThJQSxXQUFBLEdBQWEsU0FBQSxHQUFBO1dBQ1gsQ0FBQyxDQUFBLEdBQUksSUFBQyxDQUFBLGFBQWEsQ0FBQyxTQUFwQixDQUFBLEdBQWlDLElBQUMsQ0FBQSxhQUFhLENBQUMsS0FBZixDQUFBLEVBRHRCO0VBQUEsQ0E5SWIsQ0FBQTs7QUFBQSxxQkFpSkEsc0JBQUEsR0FBd0IsU0FBQSxHQUFBO1dBQ3RCLFVBQUEsQ0FBVyxJQUFDLENBQUEsYUFBYSxDQUFDLEtBQWYsR0FBdUIsSUFBQyxDQUFBLGFBQWEsQ0FBQyxTQUFqRCxFQURzQjtFQUFBLENBakp4QixDQUFBOztBQUFBLHFCQW9KQSx1QkFBQSxHQUF5QixTQUFBLEdBQUE7V0FDdkIsVUFBQSxDQUFXLElBQUMsQ0FBQSxhQUFhLENBQUMsS0FBZixHQUF1QixJQUFDLENBQUEsYUFBYSxDQUFDLGVBQWpELEVBRHVCO0VBQUEsQ0FwSnpCLENBQUE7O0FBQUEscUJBdUpBLGNBQUEsR0FBZ0IsU0FBQSxHQUFBO1dBQ2QsVUFBQSxDQUFXLElBQUMsQ0FBQSxnQkFBZ0IsQ0FBQyxLQUFsQixDQUFBLENBQVgsRUFEYztFQUFBLENBdkpoQixDQUFBOztBQUFBLHFCQTRKQSxhQUFBLEdBQWUsU0FBQSxHQUFBO1dBQ2IsSUFBSSxDQUFDLEdBQUwsQ0FBUyxVQUFBLENBQVcsSUFBQyxDQUFBLEtBQUssQ0FBQyxHQUFQLENBQVcsTUFBWCxDQUFYLENBQVQsRUFEYTtFQUFBLENBNUpmLENBQUE7O0FBQUEscUJBaUtBLFNBQUEsR0FBVyxTQUFBLEdBQUE7V0FDVCxVQUFBLENBQVcsSUFBQyxDQUFBLGFBQWEsQ0FBQyxNQUFmLEdBQXdCLElBQUMsQ0FBQSxhQUFhLENBQUMsS0FBbEQsRUFEUztFQUFBLENBaktYLENBQUE7O0FBQUEscUJBb0tBLFlBQUEsR0FBYyxTQUFBLEdBQUE7V0FDWixDQUFDLENBQUEsR0FBSSxJQUFDLENBQUEsYUFBYSxDQUFDLFNBQXBCLENBQUEsR0FBaUMsSUFBQyxDQUFBLGFBQWEsQ0FBQyxNQUFmLENBQUEsRUFEckI7RUFBQSxDQXBLZCxDQUFBOztBQUFBLHFCQXVLQSx1QkFBQSxHQUF5QixTQUFBLEdBQUE7V0FDdkIsVUFBQSxDQUFXLElBQUMsQ0FBQSxhQUFhLENBQUMsTUFBZixHQUF3QixJQUFDLENBQUEsYUFBYSxDQUFDLFNBQWxELEVBRHVCO0VBQUEsQ0F2S3pCLENBQUE7O0FBQUEscUJBMEtBLHdCQUFBLEdBQTBCLFNBQUEsR0FBQTtXQUN4QixVQUFBLENBQVcsSUFBQyxDQUFBLGFBQWEsQ0FBQyxNQUFmLEdBQXdCLElBQUMsQ0FBQSxhQUFhLENBQUMsZUFBbEQsRUFEd0I7RUFBQSxDQTFLMUIsQ0FBQTs7QUFBQSxxQkE2S0EsZUFBQSxHQUFpQixTQUFBLEdBQUE7V0FDZixVQUFBLENBQVcsSUFBQyxDQUFBLGdCQUFnQixDQUFDLE1BQWxCLENBQUEsQ0FBWCxFQURlO0VBQUEsQ0E3S2pCLENBQUE7O0FBQUEscUJBa0xBLFlBQUEsR0FBYyxTQUFBLEdBQUE7V0FDWixJQUFJLENBQUMsR0FBTCxDQUFTLFVBQUEsQ0FBVyxJQUFDLENBQUEsS0FBSyxDQUFDLEdBQVAsQ0FBVyxLQUFYLENBQVgsQ0FBVCxFQURZO0VBQUEsQ0FsTGQsQ0FBQTs7QUFBQSxxQkF1TEEseUJBQUEsR0FBMkIsU0FBQyxDQUFELEdBQUE7V0FDekI7QUFBQSxNQUFBLElBQUEsRUFBTSxDQUFDLENBQUMsQ0FBQyxLQUFGLEdBQVUsSUFBQyxDQUFBLFNBQVMsQ0FBQyxNQUFYLENBQUEsQ0FBbUIsQ0FBQyxJQUEvQixDQUFBLEdBQXVDLElBQUMsQ0FBQSxjQUFELENBQUEsQ0FBN0M7QUFBQSxNQUNBLEdBQUEsRUFBTSxDQUFDLENBQUMsQ0FBQyxLQUFGLEdBQVUsSUFBQyxDQUFBLFNBQVMsQ0FBQyxNQUFYLENBQUEsQ0FBbUIsQ0FBQyxHQUEvQixDQUFBLEdBQXNDLElBQUMsQ0FBQSxlQUFELENBQUEsQ0FENUM7TUFEeUI7RUFBQSxDQXZMM0IsQ0FBQTs7QUFBQSxxQkE2TEEsUUFBQSxHQUFVLFNBQUMsQ0FBRCxHQUFBO0FBQ1IsUUFBQSxLQUFBO0FBQUEsSUFBQSxJQUFHLENBQUEsQ0FBRSxDQUFDLENBQUMsTUFBSixDQUFXLENBQUMsSUFBWixDQUFpQixjQUFqQixDQUFBLEtBQW9DLElBQUMsQ0FBQSxNQUF4QztBQUNFLE1BQUEsS0FBQSxHQUFRLElBQUMsQ0FBQSx5QkFBRCxDQUEyQixDQUEzQixDQUFSLENBQUE7YUFDQSxJQUFDLENBQUEsTUFBRCxDQUFRLE9BQVIsRUFBaUIsS0FBSyxDQUFDLElBQXZCLEVBQTZCLEtBQUssQ0FBQyxHQUFuQyxFQUZGO0tBRFE7RUFBQSxDQTdMVixDQUFBOztBQUFBLHFCQWtNQSxTQUFBLEdBQVcsU0FBQyxDQUFELEdBQUE7QUFDVCxRQUFBLE1BQUE7QUFBQSxJQUFBLElBQUcsQ0FBQSxDQUFFLENBQUMsQ0FBQyxNQUFKLENBQVcsQ0FBQyxJQUFaLENBQWlCLGNBQWpCLENBQUEsS0FBb0MsSUFBQyxDQUFBLE1BQXJDLElBQStDLENBQUMsQ0FBQyxLQUFGLEtBQVcsQ0FBN0Q7QUFDRSxNQUFBLElBQUMsQ0FBQSxVQUFELEdBQWMsSUFBZCxDQUFBO0FBQUEsTUFDQSxNQUFBLEdBQVMsSUFBQyxDQUFBLHlCQUFELENBQTJCLENBQTNCLENBRFQsQ0FBQTtBQUFBLE1BRUEsSUFBQyxDQUFBLFVBQUQsR0FDRTtBQUFBLFFBQUEsUUFBQSxFQUFVLE1BQVY7QUFBQSxRQUNBLE1BQUEsRUFDRTtBQUFBLFVBQUEsSUFBQSxFQUFNLENBQUEsR0FBSSxJQUFDLENBQUEsYUFBRCxDQUFBLENBQVY7QUFBQSxVQUNBLEdBQUEsRUFBSyxDQUFBLEdBQUksSUFBQyxDQUFBLFlBQUQsQ0FBQSxDQURUO1NBRkY7QUFBQSxRQUlBLEdBQUEsRUFDRTtBQUFBLFVBQUEsS0FBQSxFQUFPLENBQUMsTUFBTSxDQUFDLElBQVAsR0FBYyxJQUFDLENBQUEsY0FBRCxDQUFBLENBQWYsQ0FBQSxHQUFvQyxJQUFDLENBQUEsYUFBRCxDQUFBLENBQTNDO0FBQUEsVUFDQSxJQUFBLEVBQU0sQ0FBQyxNQUFNLENBQUMsSUFBUCxHQUFjLElBQUMsQ0FBQSxjQUFELENBQUEsQ0FBZixDQUFBLEdBQW9DLENBQUMsSUFBQyxDQUFBLFFBQUQsQ0FBQSxDQUFBLEdBQy9CLENBQUMsSUFBQyxDQUFBLGNBQUQsQ0FBQSxDQUFBLEdBQW9CLElBQUMsQ0FBQSxhQUFELENBQUEsQ0FBckIsQ0FEOEIsQ0FEMUM7QUFBQSxVQUdBLE1BQUEsRUFBUSxDQUFDLE1BQU0sQ0FBQyxHQUFQLEdBQWEsSUFBQyxDQUFBLGVBQUQsQ0FBQSxDQUFkLENBQUEsR0FBb0MsSUFBQyxDQUFBLFlBQUQsQ0FBQSxDQUg1QztBQUFBLFVBSUEsR0FBQSxFQUFLLENBQUMsTUFBTSxDQUFDLEdBQVAsR0FBYSxJQUFDLENBQUEsZUFBRCxDQUFBLENBQWQsQ0FBQSxHQUFvQyxDQUFDLElBQUMsQ0FBQSxTQUFELENBQUEsQ0FBQSxHQUM5QixDQUFDLElBQUMsQ0FBQSxlQUFELENBQUEsQ0FBQSxHQUFxQixJQUFDLENBQUEsWUFBRCxDQUFBLENBQXRCLENBRDZCLENBSnpDO1NBTEY7T0FIRixDQURGO0tBQUE7V0FlQSxLQWhCUztFQUFBLENBbE1YLENBQUE7O0FBQUEscUJBb05BLFNBQUEsR0FBVyxTQUFDLENBQUQsR0FBQTtBQUNULFFBQUEsb0NBQUE7QUFBQSxJQUFBLElBQUcsSUFBQyxDQUFBLFVBQUo7QUFDRSxNQUFBLE1BQUEsR0FBUyxJQUFDLENBQUEseUJBQUQsQ0FBMkIsQ0FBM0IsQ0FBVCxDQUFBO0FBQUEsTUFDQSxRQUFBLEdBQVcsTUFBTSxDQUFDLElBQVAsR0FBYyxJQUFDLENBQUEsY0FBRCxDQUFBLENBRHpCLENBQUE7QUFBQSxNQUVBLE9BQUEsR0FBVSxNQUFNLENBQUMsR0FBUCxHQUFhLElBQUMsQ0FBQSxlQUFELENBQUEsQ0FGdkIsQ0FBQTtBQUdBLE1BQUEsSUFBRyxRQUFBLElBQVksSUFBQyxDQUFBLFVBQVUsQ0FBQyxHQUFHLENBQUMsSUFBNUIsSUFBb0MsUUFBQSxJQUFZLElBQUMsQ0FBQSxVQUFVLENBQUMsR0FBRyxDQUFDLEtBQW5FO0FBQ0UsUUFBQSxJQUFBLEdBQU8sQ0FBQyxNQUFNLENBQUMsSUFBUCxHQUFjLElBQUMsQ0FBQSxVQUFVLENBQUMsUUFBUSxDQUFDLElBQXBDLENBQUEsR0FBNEMsSUFBQyxDQUFBLGNBQUQsQ0FBQSxDQUFuRCxDQUFBO0FBQUEsUUFDQSxJQUFDLENBQUEsYUFBYSxDQUFDLE1BQWYsR0FBd0IsSUFBQyxDQUFBLFVBQVUsQ0FBQyxNQUFNLENBQUMsSUFBbkIsR0FBMEIsSUFEbEQsQ0FERjtPQUFBLE1BR0ssSUFBRyxRQUFBLEdBQVcsSUFBQyxDQUFBLFVBQVUsQ0FBQyxHQUFHLENBQUMsSUFBOUI7QUFDSCxRQUFBLElBQUMsQ0FBQSxhQUFhLENBQUMsTUFBZixHQUF3QixJQUFDLENBQUEsY0FBRCxDQUFBLENBQUEsR0FBb0IsSUFBQyxDQUFBLFFBQUQsQ0FBQSxDQUE1QyxDQURHO09BQUEsTUFFQSxJQUFHLFFBQUEsR0FBVyxJQUFDLENBQUEsVUFBVSxDQUFDLEdBQUcsQ0FBQyxLQUE5QjtBQUNILFFBQUEsSUFBQyxDQUFBLGFBQWEsQ0FBQyxNQUFmLEdBQXdCLENBQXhCLENBREc7T0FSTDtBQVVBLE1BQUEsSUFBRyxPQUFBLElBQVcsSUFBQyxDQUFBLFVBQVUsQ0FBQyxHQUFHLENBQUMsR0FBM0IsSUFBa0MsT0FBQSxJQUFXLElBQUMsQ0FBQSxVQUFVLENBQUMsR0FBRyxDQUFDLE1BQWhFO0FBQ0UsUUFBQSxHQUFBLEdBQU0sQ0FBQyxNQUFNLENBQUMsR0FBUCxHQUFhLElBQUMsQ0FBQSxVQUFVLENBQUMsUUFBUSxDQUFDLEdBQW5DLENBQUEsR0FBMEMsSUFBQyxDQUFBLGVBQUQsQ0FBQSxDQUFoRCxDQUFBO0FBQUEsUUFDQSxJQUFDLENBQUEsYUFBYSxDQUFDLEtBQWYsR0FBdUIsSUFBQyxDQUFBLFVBQVUsQ0FBQyxNQUFNLENBQUMsR0FBbkIsR0FBeUIsR0FEaEQsQ0FERjtPQUFBLE1BR0ssSUFBRyxPQUFBLEdBQVUsSUFBQyxDQUFBLFVBQVUsQ0FBQyxHQUFHLENBQUMsR0FBN0I7QUFDSCxRQUFBLElBQUMsQ0FBQSxhQUFhLENBQUMsS0FBZixHQUF1QixJQUFDLENBQUEsZUFBRCxDQUFBLENBQUEsR0FBcUIsSUFBQyxDQUFBLFNBQUQsQ0FBQSxDQUE1QyxDQURHO09BQUEsTUFFQSxJQUFHLE9BQUEsR0FBVSxJQUFDLENBQUEsVUFBVSxDQUFDLEdBQUcsQ0FBQyxNQUE3QjtBQUNILFFBQUEsSUFBQyxDQUFBLGFBQWEsQ0FBQyxLQUFmLEdBQXVCLENBQXZCLENBREc7T0FmTDtBQUFBLE1BaUJBLElBQUMsQ0FBQSxhQUFELENBQUEsQ0FqQkEsQ0FERjtLQUFBO1dBbUJBLEtBcEJTO0VBQUEsQ0FwTlgsQ0FBQTs7QUFBQSxxQkEwT0EsT0FBQSxHQUFTLFNBQUMsQ0FBRCxHQUFBO0FBQ1AsSUFBQSxJQUFDLENBQUEsVUFBRCxHQUFjLEtBQWQsQ0FBQTtBQUFBLElBQ0EsSUFBQyxDQUFBLGlCQUFELENBQUEsQ0FEQSxDQUFBO1dBRUEsS0FITztFQUFBLENBMU9ULENBQUE7O0FBQUEscUJBaVBBLE1BQUEsR0FBUSxTQUFBLEdBQUE7QUFDTixJQUFBLElBQUMsQ0FBQSxhQUFhLENBQUMsS0FBZixHQUF3QixJQUFDLENBQUEsYUFBYSxDQUFDLEtBQWYsR0FBdUIsSUFBQyxDQUFBLGFBQWEsQ0FBQyxTQUE5RCxDQUFBO0FBQUEsSUFDQSxJQUFDLENBQUEsYUFBYSxDQUFDLE1BQWYsR0FBd0IsQ0FBQSxJQUFHLENBQUEsYUFBRCxDQUFBLENBQUYsR0FBcUIsQ0FBQyxJQUFDLENBQUEsc0JBQUQsQ0FBQSxDQUFBLEdBQTRCLENBQTdCLENBRDdDLENBQUE7QUFBQSxJQUVBLElBQUMsQ0FBQSxhQUFhLENBQUMsS0FBZixHQUF3QixDQUFBLElBQUcsQ0FBQSxZQUFELENBQUEsQ0FBRixHQUFvQixDQUFDLElBQUMsQ0FBQSx1QkFBRCxDQUFBLENBQUEsR0FBNkIsQ0FBOUIsQ0FGNUMsQ0FBQTtXQUdBLElBQUMsQ0FBQSxpQkFBRCxDQUFBLEVBSk07RUFBQSxDQWpQUixDQUFBOztBQUFBLHFCQXVQQSxPQUFBLEdBQVMsU0FBQSxHQUFBO0FBQ1AsUUFBQSxhQUFBO0FBQUEsSUFBQSxJQUFHLElBQUMsQ0FBQSxhQUFhLENBQUMsS0FBZixHQUF1QixDQUExQjtBQUNFLE1BQUEsSUFBQyxDQUFBLGFBQWEsQ0FBQyxLQUFmLEdBQXdCLElBQUMsQ0FBQSxhQUFhLENBQUMsS0FBZixHQUF1QixJQUFDLENBQUEsYUFBYSxDQUFDLFNBQTlELENBQUE7QUFBQSxNQUNBLE1BQUEsR0FBUyxDQUFBLElBQUcsQ0FBQSxhQUFELENBQUEsQ0FBRixHQUFxQixDQUFDLElBQUMsQ0FBQSxzQkFBRCxDQUFBLENBQUEsR0FBNEIsQ0FBN0IsQ0FEOUIsQ0FBQTtBQUFBLE1BRUEsS0FBQSxHQUFTLENBQUEsSUFBRyxDQUFBLFlBQUQsQ0FBQSxDQUFGLEdBQW9CLENBQUMsSUFBQyxDQUFBLHVCQUFELENBQUEsQ0FBQSxHQUE2QixDQUE5QixDQUY3QixDQUFBO0FBR0EsTUFBQSxJQUFHLE1BQUEsR0FBUyxDQUFaO0FBQ0UsUUFBQSxJQUFDLENBQUEsYUFBYSxDQUFDLE1BQWYsR0FBd0IsQ0FBeEIsQ0FERjtPQUFBLE1BRUssSUFBRyxNQUFBLEdBQVMsSUFBQyxDQUFBLGNBQUQsQ0FBQSxDQUFBLEdBQW9CLElBQUMsQ0FBQSxRQUFELENBQUEsQ0FBaEM7QUFDSCxRQUFBLElBQUMsQ0FBQSxhQUFhLENBQUMsTUFBZixHQUF3QixJQUFDLENBQUEsY0FBRCxDQUFBLENBQUEsR0FBb0IsSUFBQyxDQUFBLFFBQUQsQ0FBQSxDQUE1QyxDQURHO09BQUEsTUFBQTtBQUdILFFBQUEsSUFBQyxDQUFBLGFBQWEsQ0FBQyxNQUFmLEdBQXdCLE1BQXhCLENBSEc7T0FMTDtBQVNBLE1BQUEsSUFBRyxLQUFBLEdBQVEsQ0FBWDtBQUNFLFFBQUEsSUFBQyxDQUFBLGFBQWEsQ0FBQyxLQUFmLEdBQXVCLENBQXZCLENBREY7T0FBQSxNQUVLLElBQUcsS0FBQSxHQUFRLElBQUMsQ0FBQSxlQUFELENBQUEsQ0FBQSxHQUFxQixJQUFDLENBQUEsU0FBRCxDQUFBLENBQWhDO0FBQ0gsUUFBQSxJQUFDLENBQUEsYUFBYSxDQUFDLEtBQWYsR0FBdUIsSUFBQyxDQUFBLGVBQUQsQ0FBQSxDQUFBLEdBQXFCLElBQUMsQ0FBQSxTQUFELENBQUEsQ0FBNUMsQ0FERztPQUFBLE1BQUE7QUFHSCxRQUFBLElBQUMsQ0FBQSxhQUFhLENBQUMsS0FBZixHQUF1QixLQUF2QixDQUhHO09BWEw7YUFlQSxJQUFDLENBQUEsaUJBQUQsQ0FBQSxFQWhCRjtLQURPO0VBQUEsQ0F2UFQsQ0FBQTs7a0JBQUE7O0lBMVJGLENBQUE7O0FBQUEsTUFvaUJZLENBQUM7QUFFRSxFQUFBLGdCQUFDLFNBQUQsRUFBYSxFQUFiLEdBQUE7QUFHWCxJQUhZLElBQUMsQ0FBQSxZQUFELFNBR1osQ0FBQTtBQUFBLHlDQUFBLENBQUE7QUFBQSx5Q0FBQSxDQUFBO0FBQUEscURBQUEsQ0FBQTtBQUFBLG1EQUFBLENBQUE7QUFBQSx5REFBQSxDQUFBO0FBQUEsMkRBQUEsQ0FBQTtBQUFBLHVEQUFBLENBQUE7QUFBQSx1REFBQSxDQUFBO0FBQUEsbURBQUEsQ0FBQTtBQUFBLG1EQUFBLENBQUE7QUFBQSx5REFBQSxDQUFBO0FBQUEsbURBQUEsQ0FBQTtBQUFBLDJDQUFBLENBQUE7QUFBQSxpQ0FBQSxDQUFBO0FBQUEsNkNBQUEsQ0FBQTtBQUFBLHVDQUFBLENBQUE7QUFBQSw2REFBQSxDQUFBO0FBQUEsNkNBQUEsQ0FBQTtBQUFBLElBQUEsSUFBQyxDQUFBLGdCQUFELEdBQW9CLElBQUMsQ0FBQSxTQUFTLENBQUMsSUFBWCxDQUFnQixHQUFBLEdBQUksTUFBTSxDQUFDLG9CQUEzQixDQUFwQixDQUFBO0FBQ0EsSUFBQSxJQUFHLElBQUMsQ0FBQSxTQUFTLENBQUMsSUFBWCxDQUFnQix3QkFBaEIsQ0FBeUMsQ0FBQyxNQUExQyxHQUFtRCxDQUF0RDtBQUNFLE1BQUEsSUFBQyxDQUFBLEtBQUQsR0FBUyxJQUFDLENBQUEsU0FBUyxDQUFDLElBQVgsQ0FBZ0Isd0JBQWhCLENBQXlDLENBQUMsS0FBMUMsQ0FBQSxDQUFULENBREY7S0FEQTtBQUFBLElBS0EsSUFBQyxDQUFBLE1BQUQsR0FBVSxJQUFDLENBQUEsZ0JBQWdCLENBQUMsSUFBbEIsQ0FDUixHQUFBLEdBQUksTUFBTSxDQUFDLFdBQVgsR0FBdUIsZ0JBQXZCLEdBQXVDLEVBQXZDLEdBQTBDLElBRGxDLENBRVQsQ0FBQyxLQUZRLENBQUEsQ0FMVixDQUFBO0FBQUEsSUFVQSxJQVZBLENBSFc7RUFBQSxDQUFiOztBQUFBLG1CQWlCQSxRQUFBLEdBQVUsU0FBQSxHQUFBO0FBQ1IsUUFBQSwwQ0FBQTtBQUFBLElBQUEsR0FBQSxHQUFNLElBQUMsQ0FBQSxNQUFNLENBQUMsUUFBUixDQUFBLENBQWtCLENBQUMsSUFBbkIsR0FBMEIsQ0FBQyxJQUFDLENBQUEsTUFBTSxDQUFDLFVBQVIsQ0FBQSxDQUFBLEdBQXVCLENBQXhCLENBQWhDLENBQUE7QUFBQSxJQUNBLEdBQUEsR0FBTSxJQUFDLENBQUEsTUFBTSxDQUFDLFFBQVIsQ0FBQSxDQUFrQixDQUFDLEdBQW5CLEdBQXlCLENBQUMsSUFBQyxDQUFBLE1BQU0sQ0FBQyxXQUFSLENBQUEsQ0FBQSxHQUF3QixDQUF6QixDQUQvQixDQUFBO0FBRUEsSUFBQSxJQUFHLElBQUMsQ0FBQSxLQUFKO0FBQ0UsTUFBQSxJQUFBLEdBQU8sSUFBQyxDQUFBLEtBQUssQ0FBQyxLQUFQLENBQUEsQ0FBUCxDQUFBO0FBQUEsTUFDQSxJQUFBLEdBQU8sSUFBQyxDQUFBLEtBQUssQ0FBQyxNQUFQLENBQUEsQ0FEUCxDQUFBO0FBQUEsTUFFQSxJQUFBLEdBQU8sUUFBQSxDQUFTLElBQUMsQ0FBQSxLQUFLLENBQUMsR0FBUCxDQUFXLE1BQVgsQ0FBVCxDQUZQLENBQUE7QUFBQSxNQUdBLElBQUEsR0FBTyxRQUFBLENBQVMsSUFBQyxDQUFBLEtBQUssQ0FBQyxHQUFQLENBQVcsS0FBWCxDQUFULENBSFAsQ0FBQTtBQUFBLE1BSUEsR0FBQSxHQUFNLENBQUMsQ0FBQyxHQUFBLEdBQU0sSUFBSSxDQUFDLEdBQUwsQ0FBUyxJQUFULENBQVAsQ0FBQSxHQUF5QixJQUExQixDQUFBLEdBQWtDLEdBSnhDLENBQUE7QUFBQSxNQUtBLEdBQUEsR0FBTSxDQUFDLENBQUMsR0FBQSxHQUFNLElBQUksQ0FBQyxHQUFMLENBQVMsSUFBVCxDQUFQLENBQUEsR0FBeUIsSUFBMUIsQ0FBQSxHQUFrQyxHQUx4QyxDQURGO0tBQUEsTUFBQTtBQVFFLE1BQUEsR0FBQSxHQUFNLENBQUMsR0FBQSxHQUFNLElBQUMsQ0FBQSxTQUFTLENBQUMsS0FBWCxDQUFBLENBQVAsQ0FBQSxHQUE2QixHQUFuQyxDQUFBO0FBQUEsTUFDQSxHQUFBLEdBQU0sQ0FBQyxHQUFBLEdBQU0sSUFBQyxDQUFBLFNBQVMsQ0FBQyxNQUFYLENBQUEsQ0FBUCxDQUFBLEdBQThCLEdBRHBDLENBUkY7S0FGQTtXQVlBLENBQUMsR0FBRCxFQUFNLEdBQU4sRUFiUTtFQUFBLENBakJWLENBQUE7O0FBQUEsbUJBZ0NBLGdCQUFBLEdBQWtCLFNBQUEsR0FBQTtBQUNoQixRQUFBLGtCQUFBO0FBQUEsSUFBQSxHQUFBLEdBQU0sSUFBQyxDQUFBLE1BQU0sQ0FBQyxRQUFSLENBQUEsQ0FBa0IsQ0FBQyxJQUFuQixHQUEwQixDQUFDLElBQUMsQ0FBQSxNQUFNLENBQUMsVUFBUixDQUFBLENBQUEsR0FBdUIsQ0FBeEIsQ0FBaEMsQ0FBQTtBQUFBLElBQ0EsR0FBQSxHQUFNLElBQUMsQ0FBQSxNQUFNLENBQUMsUUFBUixDQUFBLENBQWtCLENBQUMsR0FBbkIsR0FBeUIsQ0FBQyxJQUFDLENBQUEsTUFBTSxDQUFDLFdBQVIsQ0FBQSxDQUFBLEdBQXdCLENBQXpCLENBRC9CLENBQUE7QUFBQSxJQUVBLEdBQUEsR0FBTSxDQUFDLEdBQUEsR0FBTSxJQUFDLENBQUEsU0FBUyxDQUFDLEtBQVgsQ0FBQSxDQUFQLENBQUEsR0FBNkIsR0FGbkMsQ0FBQTtBQUFBLElBR0EsR0FBQSxHQUFNLENBQUMsR0FBQSxHQUFNLElBQUMsQ0FBQSxTQUFTLENBQUMsTUFBWCxDQUFBLENBQVAsQ0FBQSxHQUE4QixHQUhwQyxDQUFBO1dBSUEsQ0FBQyxHQUFELEVBQU0sR0FBTixFQUxnQjtFQUFBLENBaENsQixDQUFBOztBQUFBLG1CQXlDQSxLQUFBLEdBQU8sU0FBQSxHQUFBO1dBQ0wsSUFBQyxDQUFBLE1BQU0sQ0FBQyxHQUFSLENBQVksaUJBQVosRUFESztFQUFBLENBekNQLENBQUE7O0FBQUEsbUJBNENBLFFBQUEsR0FBVSxTQUFBLEdBQUE7V0FDUixJQUFDLENBQUEsTUFBTSxDQUFDLElBQVIsQ0FBYSxhQUFiLEVBRFE7RUFBQSxDQTVDVixDQUFBOztBQUFBLG1CQStDQSxFQUFBLEdBQUksU0FBQSxHQUFBO1dBQ0YsSUFBQyxDQUFBLE1BQU0sQ0FBQyxJQUFSLENBQWEsU0FBYixFQURFO0VBQUEsQ0EvQ0osQ0FBQTs7QUFBQSxtQkFvREEsT0FBQSxHQUFTLFNBQUEsR0FBQTtBQUNQLFFBQUEsT0FBQTtBQUFBLElBQUEsT0FBQSxHQUFVLElBQUMsQ0FBQSxTQUFTLENBQUMsSUFBWCxDQUFnQixHQUFBLEdBQUcsQ0FBQyxJQUFDLENBQUEsTUFBTSxDQUFDLElBQVIsQ0FBYSxjQUFiLENBQUQsQ0FBbkIsQ0FBVixDQUFBO0FBQ0EsSUFBQSxJQUFHLE9BQU8sQ0FBQyxNQUFSLEdBQWlCLENBQXBCO2FBQTJCLFFBQTNCO0tBQUEsTUFBQTthQUF3QyxLQUF4QztLQUZPO0VBQUEsQ0FwRFQsQ0FBQTs7QUFBQSxtQkF3REEsV0FBQSxHQUFhLFNBQUEsR0FBQTtBQUNYLElBQUEsSUFBRyxJQUFDLENBQUEsT0FBRCxDQUFBLENBQUEsSUFBYyxJQUFDLENBQUEsT0FBRCxDQUFBLENBQVUsQ0FBQyxNQUFYLEdBQW9CLENBQXJDO2FBQTRDLElBQUMsQ0FBQSxPQUFELENBQUEsQ0FBVSxDQUFDLElBQVgsQ0FBQSxFQUE1QztLQUFBLE1BQUE7YUFBbUUsS0FBbkU7S0FEVztFQUFBLENBeERiLENBQUE7O0FBQUEsbUJBMkRBLGNBQUEsR0FBZ0IsU0FBQSxHQUFBO1dBQ2QsSUFBQyxDQUFBLE9BQUQsQ0FBQSxDQUFBLElBQWMsSUFBQyxDQUFBLE9BQUQsQ0FBQSxDQUFVLENBQUMsUUFBWCxDQUFvQixRQUFwQixFQURBO0VBQUEsQ0EzRGhCLENBQUE7O0FBQUEsbUJBOERBLFdBQUEsR0FBYSxTQUFBLEdBQUE7QUFDWCxJQUFBLElBQWlDLElBQUMsQ0FBQSxjQUFELENBQUEsQ0FBakM7YUFBQSxJQUFDLENBQUEsT0FBRCxDQUFBLENBQVUsQ0FBQyxRQUFYLENBQW9CLFFBQXBCLEVBQUE7S0FEVztFQUFBLENBOURiLENBQUE7O0FBQUEsbUJBaUVBLFdBQUEsR0FBYSxTQUFBLEdBQUE7QUFDWCxJQUFBLElBQWlDLElBQUMsQ0FBQSxPQUFELENBQUEsQ0FBQSxJQUFjLENBQUEsSUFBRSxDQUFBLGNBQUQsQ0FBQSxDQUFoRDtBQUFBLE1BQUEsSUFBQyxDQUFBLE9BQUQsQ0FBQSxDQUFVLENBQUMsUUFBWCxDQUFvQixRQUFwQixDQUFBLENBQUE7S0FBQTtXQUNBLElBQUMsQ0FBQSxhQUFELENBQUEsRUFGVztFQUFBLENBakViLENBQUE7O0FBQUEsbUJBcUVBLGFBQUEsR0FBZSxTQUFBLEdBQUE7QUFDYixJQUFBLElBQW9DLElBQUMsQ0FBQSxjQUFELENBQUEsQ0FBcEM7YUFBQSxJQUFDLENBQUEsT0FBRCxDQUFBLENBQVUsQ0FBQyxXQUFYLENBQXVCLFFBQXZCLEVBQUE7S0FEYTtFQUFBLENBckVmLENBQUE7O0FBQUEsbUJBd0VBLGFBQUEsR0FBZSxTQUFBLEdBQUE7QUFDYixRQUFBLHVMQUFBO0FBQUEsSUFBQSxPQUFBLEdBQVUsQ0FBQSxDQUFFLEdBQUEsR0FBRyxDQUFDLElBQUMsQ0FBQSxNQUFNLENBQUMsSUFBUixDQUFhLGNBQWIsQ0FBRCxDQUFMLENBQVYsQ0FBQTtBQUFBLElBQ0EsYUFBQSxHQUFpQixVQUFBLENBQVcsSUFBQyxDQUFBLGdCQUFELENBQUEsQ0FBb0IsQ0FBQSxDQUFBLENBQXBCLEdBQXlCLEdBQXBDLENBQUEsR0FBMkMsSUFBQyxDQUFBLFNBQVMsQ0FBQyxLQUFYLENBQUEsQ0FENUQsQ0FBQTtBQUFBLElBRUEsYUFBQSxHQUFpQixVQUFBLENBQVcsSUFBQyxDQUFBLGdCQUFELENBQUEsQ0FBb0IsQ0FBQSxDQUFBLENBQXBCLEdBQXlCLEdBQXBDLENBQUEsR0FBMkMsSUFBQyxDQUFBLFNBQVMsQ0FBQyxNQUFYLENBQUEsQ0FGNUQsQ0FBQTtBQUFBLElBR0EsTUFBQSxHQUFTLE9BQU8sQ0FBQyxVQUFSLENBQUEsQ0FIVCxDQUFBO0FBQUEsSUFJQSxVQUFBLEdBQWEsTUFBQSxHQUFTLENBSnRCLENBQUE7QUFBQSxJQUtBLE9BQUEsR0FBVSxPQUFPLENBQUMsV0FBUixDQUFBLENBTFYsQ0FBQTtBQUFBLElBTUEsV0FBQSxHQUFjLE9BQUEsR0FBVSxDQU54QixDQUFBO0FBQUEsSUFPQSxNQUFBLEdBQVMsSUFBQyxDQUFBLFNBQVMsQ0FBQyxLQUFYLENBQUEsQ0FQVCxDQUFBO0FBQUEsSUFRQSxPQUFBLEdBQVUsSUFBQyxDQUFBLFNBQVMsQ0FBQyxNQUFYLENBQUEsQ0FSVixDQUFBO0FBQUEsSUFTQSxNQUFBLEdBQVMsSUFBQyxDQUFBLE1BQU0sQ0FBQyxVQUFSLENBQUEsQ0FUVCxDQUFBO0FBQUEsSUFVQSxVQUFBLEdBQWEsTUFBQSxHQUFTLENBVnRCLENBQUE7QUFBQSxJQVdBLE9BQUEsR0FBVSxJQUFDLENBQUEsTUFBTSxDQUFDLFdBQVIsQ0FBQSxDQVhWLENBQUE7QUFBQSxJQVlBLFdBQUEsR0FBYyxPQUFBLEdBQVUsQ0FaeEIsQ0FBQTtBQUFBLElBYUEsTUFBQSxHQUFTLENBYlQsQ0FBQTtBQUFBLElBY0EsT0FBQSxHQUFVLFFBQUEsQ0FBUyxPQUFPLENBQUMsSUFBUixDQUFhLGVBQWIsQ0FBVCxDQWRWLENBQUE7QUFlQSxJQUFBLElBQUEsQ0FBQSxPQUFBO0FBQUEsTUFBQSxPQUFBLEdBQVUsQ0FBVixDQUFBO0tBZkE7QUFBQSxJQWdCQSxPQUFBLEdBQVUsUUFBQSxDQUFTLE9BQU8sQ0FBQyxJQUFSLENBQWEsZUFBYixDQUFULENBaEJWLENBQUE7QUFpQkEsSUFBQSxJQUFBLENBQUEsT0FBQTtBQUFBLE1BQUEsT0FBQSxHQUFVLENBQVYsQ0FBQTtLQWpCQTtBQWtCQSxZQUFPLE9BQU8sQ0FBQyxJQUFSLENBQWEsZUFBYixDQUFQO0FBQUEsV0FDTyxLQURQO0FBRUksUUFBQSxRQUFBLEdBQVcsYUFBQSxHQUFnQixVQUEzQixDQUFBO0FBQUEsUUFDQSxPQUFBLEdBQVUsYUFBQSxHQUFnQixPQUFoQixHQUEwQixXQUExQixHQUF3QyxNQURsRCxDQUZKO0FBQ087QUFEUCxXQUlPLE9BSlA7QUFLSSxRQUFBLFFBQUEsR0FBVyxhQUFBLEdBQWdCLFVBQWhCLEdBQTZCLE1BQXhDLENBQUE7QUFBQSxRQUNBLE9BQUEsR0FBVSxhQUFBLEdBQWdCLFdBRDFCLENBTEo7QUFJTztBQUpQLFdBT08sUUFQUDtBQVFJLFFBQUEsUUFBQSxHQUFXLGFBQUEsR0FBZ0IsVUFBM0IsQ0FBQTtBQUFBLFFBQ0EsT0FBQSxHQUFVLGFBQUEsR0FBZ0IsV0FBaEIsR0FBOEIsTUFEeEMsQ0FSSjtBQU9PO0FBUFAsV0FVTyxNQVZQO0FBV0ksUUFBQSxRQUFBLEdBQVcsYUFBQSxHQUFnQixNQUFoQixHQUF5QixVQUF6QixHQUFzQyxNQUFqRCxDQUFBO0FBQUEsUUFDQSxPQUFBLEdBQVUsYUFBQSxHQUFnQixXQUQxQixDQVhKO0FBVU87QUFWUCxXQWFPLFVBYlA7QUFjSSxRQUFBLFFBQUEsR0FBVyxhQUFBLEdBQWdCLE1BQWhCLEdBQXlCLFVBQXpCLEdBQXNDLE1BQWpELENBQUE7QUFBQSxRQUNBLE9BQUEsR0FBVSxhQUFBLEdBQWdCLE9BQWhCLEdBQTBCLFdBQTFCLEdBQXdDLE1BRGxELENBZEo7QUFhTztBQWJQLFdBZ0JPLFdBaEJQO0FBaUJJLFFBQUEsUUFBQSxHQUFXLGFBQUEsR0FBZ0IsVUFBaEIsR0FBNkIsTUFBeEMsQ0FBQTtBQUFBLFFBQ0EsT0FBQSxHQUFVLGFBQUEsR0FBZ0IsT0FBaEIsR0FBMEIsV0FBMUIsR0FBd0MsTUFEbEQsQ0FqQko7QUFnQk87QUFoQlAsV0FtQk8sYUFuQlA7QUFvQkksUUFBQSxRQUFBLEdBQVcsYUFBQSxHQUFnQixNQUFoQixHQUF5QixVQUF6QixHQUFzQyxNQUFqRCxDQUFBO0FBQUEsUUFDQSxPQUFBLEdBQVUsYUFBQSxHQUFnQixXQUFoQixHQUE4QixNQUR4QyxDQXBCSjtBQW1CTztBQW5CUCxXQXNCTyxjQXRCUDtBQXVCSSxRQUFBLFFBQUEsR0FBVyxhQUFBLEdBQWdCLFVBQWhCLEdBQTZCLE1BQXhDLENBQUE7QUFBQSxRQUNBLE9BQUEsR0FBVSxhQUFBLEdBQWdCLFdBQWhCLEdBQThCLE1BRHhDLENBdkJKO0FBQUEsS0FsQkE7V0EyQ0E7QUFBQSxNQUFBLElBQUEsRUFBTSxRQUFBLEdBQVcsT0FBakI7QUFBQSxNQUNBLEdBQUEsRUFBSyxPQUFBLEdBQVUsT0FEZjtNQTVDYTtFQUFBLENBeEVmLENBQUE7O0FBQUEsbUJBdUhBLGVBQUEsR0FBaUIsU0FBQSxHQUFBO0FBQ2YsUUFBQSxNQUFBO0FBQUEsSUFBQSxNQUFBLEdBQVMsSUFBQyxDQUFBLGFBQUQsQ0FBQSxDQUFULENBQUE7QUFBQSxJQUNBLENBQUEsQ0FBRSxHQUFBLEdBQUcsQ0FBQyxJQUFDLENBQUEsTUFBTSxDQUFDLElBQVIsQ0FBYSxjQUFiLENBQUQsQ0FBTCxDQUFxQyxDQUFDLEdBQXRDLENBQ0U7QUFBQSxNQUFBLElBQUEsRUFBUyxNQUFNLENBQUMsSUFBUixHQUFhLElBQXJCO0FBQUEsTUFDQSxHQUFBLEVBQVEsTUFBTSxDQUFDLEdBQVIsR0FBWSxJQURuQjtLQURGLENBREEsQ0FBQTtXQUlBLElBQUMsQ0FBQSxRQUFELENBQUEsRUFMZTtFQUFBLENBdkhqQixDQUFBOztBQUFBLG1CQThIQSxjQUFBLEdBQWdCLFNBQUEsR0FBQTtBQUNkLFFBQUEsTUFBQTtBQUFBLElBQUEsTUFBQSxHQUFTLElBQUMsQ0FBQSxhQUFELENBQUEsQ0FBVCxDQUFBO1dBQ0EsQ0FBQSxDQUFFLEdBQUEsR0FBRyxDQUFDLElBQUMsQ0FBQSxNQUFNLENBQUMsSUFBUixDQUFhLGNBQWIsQ0FBRCxDQUFMLENBQXFDLENBQUMsT0FBdEMsQ0FDRTtBQUFBLE1BQUEsSUFBQSxFQUFTLE1BQU0sQ0FBQyxJQUFSLEdBQWEsSUFBckI7QUFBQSxNQUNBLEdBQUEsRUFBUSxNQUFNLENBQUMsR0FBUixHQUFZLElBRG5CO0tBREYsRUFHRSxHQUhGLEVBR08sQ0FBQSxTQUFBLEtBQUEsR0FBQTthQUFBLFNBQUEsR0FBQTtBQUNMLGVBQU8sS0FBQyxDQUFBLFFBQUQsQ0FBQSxDQUFQLENBREs7TUFBQSxFQUFBO0lBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUhQLEVBRmM7RUFBQSxDQTlIaEIsQ0FBQTs7QUFBQSxtQkF3SUEsV0FBQSxHQUFhLFNBQUEsR0FBQTtXQUNYLElBQUMsQ0FBQSxNQUFNLENBQUMsUUFBUixDQUFpQixXQUFqQixFQURXO0VBQUEsQ0F4SWIsQ0FBQTs7QUFBQSxtQkE2SUEsWUFBQSxHQUFjLFNBQUEsR0FBQTtBQUNaLFFBQUEsTUFBQTtBQUFBLElBQUEsTUFBQSxHQUFTLElBQUMsQ0FBQSxRQUFELENBQUEsQ0FBVCxDQUFBO1dBQ0EsSUFBQyxDQUFBLE1BQU0sQ0FBQyxJQUFSLENBQ0U7QUFBQSxNQUFBLFVBQUEsRUFBWSxNQUFPLENBQUEsQ0FBQSxDQUFuQjtBQUFBLE1BQ0EsVUFBQSxFQUFZLE1BQU8sQ0FBQSxDQUFBLENBRG5CO0tBREYsRUFGWTtFQUFBLENBN0lkLENBQUE7O0FBQUEsbUJBbUpBLE1BQUEsR0FBUSxTQUFDLE9BQUQsR0FBQTtBQUNOLFFBQUEsU0FBQTtBQUFBLElBQUEsSUFBRyxPQUFPLENBQUMsS0FBWDtBQUNFLE1BQUEsSUFBQyxDQUFBLE1BQU0sQ0FBQyxHQUFSLENBQVk7QUFBQSxRQUFBLGVBQUEsRUFBaUIsT0FBTyxDQUFDLEtBQXpCO09BQVosQ0FBQSxDQURGO0tBQUE7QUFFQSxJQUFBLElBQUcsT0FBTyxDQUFDLE9BQVg7QUFDRSxNQUFBLElBQUMsQ0FBQSxNQUFNLENBQUMsSUFBUixDQUFhLGlCQUFiLENBQStCLENBQUMsSUFBaEMsQ0FBcUMsT0FBTyxDQUFDLE9BQTdDLENBQUEsQ0FBQTtBQUFBLE1BQ0EsSUFBQyxDQUFBLGVBQUQsQ0FBQSxDQURBLENBREY7S0FGQTtBQUtBLElBQUEsSUFBRyxPQUFPLENBQUMsU0FBWDtBQUNFLE1BQUEsSUFBQyxDQUFBLE1BQU0sQ0FBQyxXQUFSLENBQW9CLFdBQXBCLENBQUEsQ0FBQTtBQUNBLE1BQUEsSUFBaUMsT0FBTyxDQUFDLFNBQVIsS0FBcUIsSUFBdEQ7QUFBQSxRQUFBLElBQUMsQ0FBQSxNQUFNLENBQUMsUUFBUixDQUFpQixXQUFqQixDQUFBLENBQUE7T0FGRjtLQUxBO0FBUUEsSUFBQSxJQUFHLE9BQU8sQ0FBQyxNQUFYO0FBQ0UsTUFBQSxJQUFBLEdBQU8sQ0FBQyxDQUFDLFVBQUEsQ0FBVyxPQUFPLENBQUMsTUFBTyxDQUFBLENBQUEsQ0FBMUIsQ0FBQSxHQUFnQyxHQUFqQyxDQUFBLEdBQXdDLElBQUMsQ0FBQSxTQUFTLENBQUMsS0FBWCxDQUFBLENBQXpDLENBQUEsR0FBK0QsRUFBdEUsQ0FBQTtBQUFBLE1BQ0EsR0FBQSxHQUFNLENBQUMsQ0FBQyxVQUFBLENBQVcsT0FBTyxDQUFDLE1BQU8sQ0FBQSxDQUFBLENBQTFCLENBQUEsR0FBZ0MsR0FBakMsQ0FBQSxHQUF3QyxJQUFDLENBQUEsU0FBUyxDQUFDLE1BQVgsQ0FBQSxDQUF6QyxDQUFBLEdBQWdFLEVBRHRFLENBQUE7YUFFQSxJQUFDLENBQUEsTUFBTSxDQUFDLEdBQVIsQ0FDRTtBQUFBLFFBQUEsSUFBQSxFQUFTLElBQUQsR0FBTSxJQUFkO0FBQUEsUUFDQSxHQUFBLEVBQVEsR0FBRCxHQUFLLElBRFo7T0FERixFQUhGO0tBVE07RUFBQSxDQW5KUixDQUFBOztBQUFBLG1CQW1LQSxNQUFBLEdBQVEsU0FBQSxHQUFBO0FBQ04sSUFBQSxJQUF1QixJQUFDLENBQUEsT0FBRCxDQUFBLENBQXZCO0FBQUEsTUFBQSxJQUFDLENBQUEsT0FBRCxDQUFBLENBQVUsQ0FBQyxNQUFYLENBQUEsQ0FBQSxDQUFBO0tBQUE7V0FDQSxJQUFDLENBQUEsTUFBTSxDQUFDLE1BQVIsQ0FBQSxFQUZNO0VBQUEsQ0FuS1IsQ0FBQTs7Z0JBQUE7O0lBdGlCRixDQUFBOztBQUFBLE1BNnNCWSxDQUFDLE1BQU0sQ0FBQztBQUVMLEVBQUEsZ0JBQUMsUUFBRCxHQUFBO0FBR1gsUUFBQSxpREFBQTtBQUFBLElBSFksSUFBQyxDQUFBLFVBQUQsUUFHWixDQUFBO0FBQUEsSUFBQSxJQUFDLENBQUEsU0FBRCxHQUFhLElBQUMsQ0FBQSxPQUFPLENBQUMsU0FBdEIsQ0FBQTtBQUFBLElBQ0EsSUFBQyxDQUFBLGdCQUFELEdBQW9CLElBQUMsQ0FBQSxTQUFTLENBQUMsSUFBWCxDQUFnQixHQUFBLEdBQUksTUFBTSxDQUFDLG9CQUEzQixDQURwQixDQUFBO0FBQUEsSUFJQSxJQUFDLENBQUEsTUFBRCxHQUFVLElBQUMsQ0FBQSxnQkFBZ0IsQ0FBQyxJQUFsQixDQUNSLEdBQUEsR0FBSSxNQUFNLENBQUMsV0FBWCxHQUF1QixnQkFBdkIsR0FBdUMsSUFBQyxDQUFBLE9BQU8sQ0FBQyxRQUFoRCxHQUF5RCxJQURqRCxDQUVULENBQUMsS0FGUSxDQUFBLENBSlYsQ0FBQTtBQUFBLElBT0EsSUFBQyxDQUFBLFNBQUQsR0FBaUIsSUFBQSxNQUFNLENBQUMsTUFBUCxDQUFjLElBQUMsQ0FBQSxTQUFmLEVBQTBCLElBQUMsQ0FBQSxPQUFPLENBQUMsUUFBbkMsQ0FQakIsQ0FBQTtBQVVBLElBQUEsSUFBRyxJQUFDLENBQUEsT0FBTyxDQUFDLFNBQVo7QUFDRSxNQUFBLElBQUMsQ0FBQSxNQUFNLENBQUMsUUFBUixDQUFpQixXQUFqQixDQUFBLENBQUE7QUFBQSxNQUNBLElBQUMsQ0FBQSxNQUFNLENBQUMsRUFBUixDQUFXLFdBQVgsRUFBd0IsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUMsQ0FBRCxHQUFBO0FBQ3RCLGNBQUEsTUFBQTtBQUFBLFVBQUEsSUFBRyxDQUFDLENBQUMsS0FBRixLQUFXLENBQWQ7QUFDRSxZQUFBLE1BQUEsR0FBUyxDQUFBLENBQUUsQ0FBQyxDQUFDLE1BQUosQ0FBVyxDQUFDLE9BQVosQ0FBb0IsZ0JBQXBCLENBQVQsQ0FBQTtBQUFBLFlBQ0EsTUFBTSxDQUFDLFFBQVAsQ0FBZ0IsYUFBaEIsQ0FEQSxDQUFBO21CQUVBLE1BQU0sQ0FBQyxJQUFQLENBQ0U7QUFBQSxjQUFBLG1CQUFBLEVBQXFCLENBQUMsQ0FBQyxLQUF2QjtBQUFBLGNBQ0EsbUJBQUEsRUFBcUIsQ0FBQyxDQUFDLEtBRHZCO2FBREYsRUFIRjtXQURzQjtRQUFBLEVBQUE7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXhCLENBREEsQ0FERjtLQVZBO0FBcUJBLElBQUEsSUFBRyxJQUFDLENBQUEsT0FBTyxDQUFDLE9BQVo7QUFDRSxNQUFBLEVBQUEsR0FBSyxNQUFNLENBQUMsWUFBUCxDQUFvQixFQUFwQixDQUFMLENBQUE7QUFBQSxNQUVBLE9BQUEsR0FBVSxJQUFDLENBQUEsT0FBTyxDQUFDLE9BRm5CLENBQUE7QUFHQSxNQUFBLElBQUcsT0FBTyxDQUFDLFFBQVg7QUFBeUIsUUFBQSxRQUFBLEdBQVcsT0FBTyxDQUFDLFFBQW5CLENBQXpCO09BQUEsTUFBQTtBQUEwRCxRQUFBLFFBQUEsR0FBVyxLQUFYLENBQTFEO09BSEE7QUFJQSxNQUFBLElBQUcsT0FBTyxDQUFDLEtBQVg7QUFBc0IsUUFBQSxLQUFBLEdBQVEsSUFBUixDQUF0QjtPQUFBLE1BQUE7QUFBd0MsUUFBQSxLQUFBLEdBQVEsS0FBUixDQUF4QztPQUpBO0FBS0EsTUFBQSxJQUFHLEtBQUEsS0FBUyxJQUFaO0FBQXNCLFFBQUEsVUFBQSxHQUFhLE9BQWIsQ0FBdEI7T0FBQSxNQUFBO0FBQWdELFFBQUEsVUFBQSxHQUFhLEVBQWIsQ0FBaEQ7T0FMQTtBQUFBLE1BTUEsT0FBQSxHQUFVLGlCQUFBLEdBQWtCLFFBQWxCLEdBQTJCLEdBQTNCLEdBQThCLFVBTnhDLENBQUE7QUFBQSxNQU9BLElBQUMsQ0FBQSxTQUFTLENBQUMsSUFBWCxDQUFnQixHQUFBLEdBQUksTUFBTSxDQUFDLHFCQUEzQixDQUFtRCxDQUFDLE1BQXBELENBQTJELGVBQUEsR0FDM0MsT0FEMkMsR0FDbkMsZUFEbUMsR0FDdEIsRUFEc0IsR0FDbkIsd0JBRG1CLEdBRXRDLFFBRnNDLEdBRTdCLFdBRjZCLEdBR25ELE9BQU8sQ0FBQyxJQUgyQyxHQUd0QyxVQUhyQixDQVBBLENBQUE7QUFhQSxNQUFBLElBQUcsT0FBTyxDQUFDLE9BQVg7QUFDRSxRQUFBLElBQUMsQ0FBQSxTQUFTLENBQUMsSUFBWCxDQUFnQixpQkFBaEIsQ0FBa0MsQ0FBQyxJQUFuQyxDQUFBLENBQXlDLENBQUMsSUFBMUMsQ0FDRTtBQUFBLFVBQUEsZUFBQSxFQUFpQixPQUFPLENBQUMsT0FBekI7U0FERixDQUFBLENBREY7T0FiQTtBQWdCQSxNQUFBLElBQUcsT0FBTyxDQUFDLE9BQVg7QUFDRSxRQUFBLElBQUMsQ0FBQSxTQUFTLENBQUMsSUFBWCxDQUFnQixpQkFBaEIsQ0FBa0MsQ0FBQyxJQUFuQyxDQUFBLENBQXlDLENBQUMsSUFBMUMsQ0FDRTtBQUFBLFVBQUEsZUFBQSxFQUFpQixPQUFPLENBQUMsT0FBekI7U0FERixDQUFBLENBREY7T0FoQkE7QUFBQSxNQW1CQSxJQUFDLENBQUEsTUFBTSxDQUFDLElBQVIsQ0FBYSxjQUFiLEVBQTZCLE9BQUEsR0FBUSxFQUFyQyxDQW5CQSxDQUFBO0FBQUEsTUFvQkEsSUFBQyxDQUFBLFNBQVMsQ0FBQyxlQUFYLENBQUEsQ0FwQkEsQ0FERjtLQXhCVztFQUFBLENBQWI7O0FBQUEsbUJBMERBLE9BQUEsR0FBUyxTQUFBLEdBQUE7V0FDUCxJQUFDLENBQUEsZ0JBQWdCLENBQUMsSUFBbEIsQ0FBdUIsZ0JBQXZCLEVBRE87RUFBQSxDQTFEVCxDQUFBOztBQUFBLG1CQTZEQSxjQUFBLEdBQWdCLFNBQUEsR0FBQTtXQUNkLElBQUMsQ0FBQSxnQkFBZ0IsQ0FBQyxJQUFsQixDQUF1Qiw0QkFBdkIsRUFEYztFQUFBLENBN0RoQixDQUFBOztnQkFBQTs7SUEvc0JGLENBQUE7O0FBQUEsTUErd0JZLENBQUMsTUFBTSxDQUFDO0FBRUwsRUFBQSxpQkFBQyxRQUFELEdBQUE7QUFFWCxRQUFBLHdCQUFBO0FBQUEsSUFGWSxJQUFDLENBQUEsVUFBRCxRQUVaLENBQUE7QUFBQSxJQUFBLElBQUMsQ0FBQSxTQUFELEdBQWEsSUFBQyxDQUFBLE9BQU8sQ0FBQyxTQUF0QixDQUFBO0FBQUEsSUFDQSxJQUFDLENBQUEsZ0JBQUQsR0FBb0IsSUFBQyxDQUFBLFNBQVMsQ0FBQyxJQUFYLENBQWdCLEdBQUEsR0FBSSxNQUFNLENBQUMsb0JBQTNCLENBQWtELENBQUMsS0FBbkQsQ0FBQSxDQURwQixDQUFBO0FBRUEsSUFBQSxJQUFBLENBQUEsSUFBUSxDQUFBLE9BQU8sQ0FBQyxRQUFoQjtBQUNFLE1BQUEsSUFBQyxDQUFBLE9BQU8sQ0FBQyxRQUFULEdBQW9CLE1BQU0sQ0FBQyxZQUFQLENBQW9CLEVBQXBCLENBQXBCLENBREY7S0FGQTtBQU1BLElBQUEsSUFBRyxJQUFDLENBQUEsT0FBTyxDQUFDLEtBQVo7QUFBdUIsTUFBQSxLQUFBLEdBQVEsSUFBQyxDQUFBLE9BQU8sQ0FBQyxLQUFqQixDQUF2QjtLQUFBLE1BQUE7QUFBbUQsTUFBQSxLQUFBLEdBQVEsU0FBUixDQUFuRDtLQU5BO0FBQUEsSUFRQSxJQUFBLEdBQU8sQ0FBQyxDQUFDLFVBQUEsQ0FBVyxJQUFDLENBQUEsT0FBTyxDQUFDLE1BQU8sQ0FBQSxDQUFBLENBQTNCLENBQUEsR0FBaUMsR0FBbEMsQ0FBQSxHQUF5QyxJQUFDLENBQUEsU0FBUyxDQUFDLEtBQVgsQ0FBQSxDQUExQyxDQUFBLEdBQWdFLEVBUnZFLENBQUE7QUFBQSxJQVNBLEdBQUEsR0FBTSxDQUFDLENBQUMsVUFBQSxDQUFXLElBQUMsQ0FBQSxPQUFPLENBQUMsTUFBTyxDQUFBLENBQUEsQ0FBM0IsQ0FBQSxHQUFpQyxHQUFsQyxDQUFBLEdBQXlDLElBQUMsQ0FBQSxTQUFTLENBQUMsTUFBWCxDQUFBLENBQTFDLENBQUEsR0FBaUUsRUFUdkUsQ0FBQTtBQUFBLElBVUEsSUFBQyxDQUFBLGdCQUFnQixDQUFDLE1BQWxCLENBQ0UsQ0FBQSxDQUFFLGFBQUYsQ0FDRSxDQUFDLFFBREgsQ0FDWSxlQURaLENBRUUsQ0FBQyxJQUZILENBR0k7QUFBQSxNQUFBLGFBQUEsRUFBZSxJQUFDLENBQUEsT0FBTyxDQUFDLFFBQXhCO0FBQUEsTUFDQSxVQUFBLEVBQVksSUFBQyxDQUFBLE9BQU8sQ0FBQyxNQUFPLENBQUEsQ0FBQSxDQUQ1QjtBQUFBLE1BRUEsVUFBQSxFQUFZLElBQUMsQ0FBQSxPQUFPLENBQUMsTUFBTyxDQUFBLENBQUEsQ0FGNUI7S0FISixDQU1FLENBQUMsR0FOSCxDQU9JO0FBQUEsTUFBQSxJQUFBLEVBQVMsSUFBRCxHQUFNLElBQWQ7QUFBQSxNQUNBLEdBQUEsRUFBUSxHQUFELEdBQUssSUFEWjtBQUFBLE1BRUEsZUFBQSxFQUFpQixLQUZqQjtLQVBKLENBREYsQ0FWQSxDQUFBO0FBQUEsSUFzQkEsTUFBQSxHQUFTLElBQUMsQ0FBQSxnQkFBZ0IsQ0FBQyxJQUFsQixDQUF1QixnQkFBdkIsQ0FBd0MsQ0FBQyxJQUF6QyxDQUFBLENBdEJULENBQUE7QUF1QkEsSUFBQSxJQUFHLElBQUMsQ0FBQSxPQUFPLENBQUMsRUFBWjtBQUNFLE1BQUEsTUFBTSxDQUFDLElBQVAsQ0FBWTtBQUFBLFFBQUEsU0FBQSxFQUFXLElBQUMsQ0FBQSxPQUFPLENBQUMsRUFBcEI7T0FBWixDQUFBLENBREY7S0F2QkE7QUF5QkEsSUFBQSxJQUFHLElBQUMsQ0FBQSxPQUFPLENBQUMsT0FBRCxDQUFYO0FBQ0UsTUFBQSxNQUFNLENBQUMsUUFBUCxDQUFnQixJQUFDLENBQUEsT0FBTyxDQUFDLE9BQUQsQ0FBeEIsQ0FBQSxDQURGO0tBekJBO0FBMkJBLElBQUEsSUFBRyxJQUFDLENBQUEsT0FBTyxDQUFDLElBQVo7QUFDRSxNQUFBLE1BQU0sQ0FBQyxJQUFQLENBQVksSUFBQyxDQUFBLE9BQU8sQ0FBQyxJQUFyQixDQUFBLENBREY7S0EzQkE7QUE2QkEsSUFBQSxJQUFHLElBQUMsQ0FBQSxPQUFPLENBQUMsSUFBWjtBQUNFLE1BQUEsTUFBTSxDQUFDLEdBQVAsQ0FDRTtBQUFBLFFBQUEsS0FBQSxFQUFVLElBQUMsQ0FBQSxPQUFPLENBQUMsSUFBVixHQUFlLElBQXhCO0FBQUEsUUFDQSxNQUFBLEVBQVcsSUFBQyxDQUFBLE9BQU8sQ0FBQyxJQUFWLEdBQWUsSUFEekI7T0FERixDQUFBLENBREY7S0E3QkE7QUFBQSxJQW1DSSxJQUFBLE1BQU0sQ0FBQyxNQUFNLENBQUMsTUFBZCxDQUFxQixJQUFDLENBQUEsT0FBdEIsQ0FuQ0osQ0FBQTtBQUFBLElBc0NJLElBQUEsTUFBTSxDQUFDLE1BQVAsQ0FBYyxJQUFDLENBQUEsU0FBZixFQUEwQixJQUFDLENBQUEsT0FBTyxDQUFDLFFBQW5DLENBdENKLENBRlc7RUFBQSxDQUFiOztpQkFBQTs7SUFqeEJGLENBQUEiLCJmaWxlIjoicGxhbml0LXRtcC5qcyIsInNvdXJjZVJvb3QiOiIvc291cmNlLyIsInNvdXJjZXNDb250ZW50IjpbImNsYXNzIFBsYW5pdFxuXG4gICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIFJlZnNcblxuICBAY29udGFpbmVyQ2xhc3M6ICAgICAgICAncGxhbml0LWNvbnRhaW5lcidcbiAgQG1hcmtlckNvbnRhaW5lckNsYXNzOiAgJ3BsYW5pdC1tYXJrZXJzLWNvbnRhaW5lcidcbiAgQG1hcmtlckNsYXNzOiAgICAgICAgICAgJ3BsYW5pdC1tYXJrZXInXG4gIEBtYXJrZXJDb250ZW50Q2xhc3M6ICAgICdwbGFuaXQtbWFya2VyLWNvbnRlbnQnXG4gIEBpbmZvYm94Q29udGFpbmVyQ2xhc3M6ICdwbGFuaXQtaW5mb2JveC1jb250YWluZXInXG5cbiAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gRGVmYXVsdCBPcHRpb25zXG5cbiAgbmV3OiAoQG9wdGlvbnMgPSB7fSkgLT5cbiAgICAjIFNldCBPcHRpb25zXG4gICAgaWYgQG9wdGlvbnMuY29udGFpbmVyXG4gICAgICBAb3B0aW9ucy5jb250YWluZXIgPSAkKFwiIyN7QG9wdGlvbnMuY29udGFpbmVyfVwiKVxuICAgIGVsc2VcbiAgICAgIEBvcHRpb25zLmNvbnRhaW5lciA9ICQoJyNwbGFuaXQnKVxuXG4gICAgIyBJbml0aWFsaXplIENvbnRhaW5lclxuICAgIEBvcHRpb25zLmNvbnRhaW5lci5hZGRDbGFzcygncGxhbml0LWNvbnRhaW5lcicpXG4gICAgQG9wdGlvbnMuY29udGFpbmVyLmFwcGVuZCBcIlwiXCJcbiAgICAgIDxkaXYgY2xhc3M9XCIje1BsYW5pdC5pbmZvYm94Q29udGFpbmVyQ2xhc3N9XCI+PC9kaXY+XG4gICAgICA8ZGl2IGNsYXNzPVwiI3tQbGFuaXQubWFya2VyQ29udGFpbmVyQ2xhc3N9XCI+PC9kaXY+XG4gICAgICAgIFwiXCJcIlxuXG4gICAgIyBSZWZzXG4gICAgQGNvbnRhaW5lciA9IEBvcHRpb25zLmNvbnRhaW5lclxuICAgIEBtYXJrZXJzQ29udGFpbmVyID0gQGNvbnRhaW5lci5maW5kKFwiLiN7UGxhbml0Lm1hcmtlckNvbnRhaW5lckNsYXNzfVwiKS5maXJzdCgpXG5cbiAgICAjIEFkZCBpbWFnZSBhbmQgem9vbSAoaWYgbmVjZXNzYXJ5KVxuICAgIGlmIEBvcHRpb25zLmltYWdlICYmIEBvcHRpb25zLmltYWdlLnVybFxuICAgICAgQGNvbnRhaW5lci5wcmVwZW5kIFwiXCJcIlxuICAgICAgICA8ZGl2IGNsYXNzPVwiaW1hZ2UtY29udGFpbmVyXCI+XG4gICAgICAgICAgPGltZyBzcmM9XCIje0BvcHRpb25zLmltYWdlLnVybH1cIj5cbiAgICAgICAgPC9kaXY+XG4gICAgICBcIlwiXCJcbiAgICAgICMgQG1hcmtlcnNDb250YWluZXIuY3NzXG4gICAgICAjICAgYmFja2dyb3VuZEltYWdlOiBcInVybCgnI3tAb3B0aW9ucy5pbWFnZS51cmx9JylcIlxuICAgICAgQGluaXRCYWNrZ3JvdW5kSW1hZ2UoKVxuXG4gICAgIyBBZGQgTWFya2VycyAoaWYgbmVjZXNzYXJ5KVxuICAgIGlmIEBvcHRpb25zLm1hcmtlcnMgJiYgQG9wdGlvbnMubWFya2Vycy5sZW5ndGggPiAwXG4gICAgICBAaW5pdE1hcmtlcnMoKVxuXG4gICAgIyBCaW5kIERvY3VtZW50IEV2ZW50c1xuICAgIG5ldyBQbGFuaXQuUGxhbi5FdmVudHNcbiAgICAgIGNvbnRhaW5lcjogQGNvbnRhaW5lclxuICAgICAgcGxhbml0OiBAXG5cbiAgICAjIFJldHVybiB0aGlzIFBsYW5pdCBvYmplY3RcbiAgICBAXG5cbiAgaW5pdEJhY2tncm91bmRJbWFnZTogPT5cbiAgICBpbWcgPSBAY29udGFpbmVyLmZpbmQoJ2ltZycpLmZpcnN0KClcbiAgICBpbWdIZWlnaHQgPSBpbWcuaGVpZ2h0KClcbiAgICBpZiBpbWdIZWlnaHQgPiAwICYmIGltZy53aWR0aCgpID4gMFxuICAgICAgQGNvbnRhaW5lci5jc3NcbiAgICAgICAgaGVpZ2h0OiBpbWdIZWlnaHRcbiAgICAgICMgaW1nLnJlbW92ZSgpXG4gICAgICBAem9vbWFibGUgPSBuZXcgUGxhbml0LlBsYW4uWm9vbWFibGVcbiAgICAgICAgY29udGFpbmVyOiBAY29udGFpbmVyXG4gICAgICBpZiBAb3B0aW9ucy5pbWFnZS56b29tXG4gICAgICAgIEB6b29tYWJsZS5uZXcoKVxuICAgICAgQGltZ0xvYWRlZCA9IHRydWVcbiAgICBlbHNlXG4gICAgICBzZXRUaW1lb3V0KEBpbml0QmFja2dyb3VuZEltYWdlLCAyNTApXG5cbiAgaW5pdE1hcmtlcnM6ID0+XG4gICAgaWYgQG9wdGlvbnMuaW1hZ2UgJiYgQG9wdGlvbnMuaW1hZ2UudXJsXG4gICAgICBpZiBAaW1nTG9hZGVkID09IHRydWVcbiAgICAgICAgQGFkZE1hcmtlcihtYXJrZXIpIGZvciBtYXJrZXIgaW4gQG9wdGlvbnMubWFya2Vyc1xuICAgICAgZWxzZVxuICAgICAgICBzZXRUaW1lb3V0KEBpbml0TWFya2VycywgMjUwKVxuICAgIGVsc2VcbiAgICAgIEBhZGRNYXJrZXIobWFya2VyKSBmb3IgbWFya2VyIGluIEBvcHRpb25zLm1hcmtlcnNcblxuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBBZGQgQSBNYXJrZXJcblxuICBhZGRNYXJrZXI6IChvcHRpb25zKSA9PlxuICAgIG9wdGlvbnMuY29udGFpbmVyID0gQGNvbnRhaW5lclxuICAgIG5ldyBQbGFuaXQuTWFya2VyLkNyZWF0b3Iob3B0aW9ucylcblxuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBSZXRyaWV2ZSBEYXRhXG5cbiAgZ2V0TWFya2VyOiAoaWQpID0+XG4gICAgbmV3IFBsYW5pdC5NYXJrZXIoQGNvbnRhaW5lciwgaWQpXG5cbiAgZ2V0QWxsTWFya2VyczogKCkgPT5cbiAgICBwbGFuID0gbmV3IFBsYW5pdC5QbGFuKEBjb250YWluZXIpXG4gICAgcGxhbi5nZXRBbGxNYXJrZXJzKClcblxuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBQbGFuIEFjdGlvbnNcblxuICBjZW50ZXJPbjogKGNvb3JkcykgLT5cbiAgICBAem9vbWFibGUuY2VudGVyT24oY29vcmRzKVxuXG4gIHpvb21UbzogKGxldmVsKSAtPlxuICAgIEB6b29tYWJsZS56b29tVG8obGV2ZWwpXG5cbiAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gRXZlbnQgQ2FsbGJhY2tzXG5cbiAgbWFya2VyRHJhZ0VuZDogKGV2ZW50LCBtYXJrZXIpID0+XG4gICAgaWYgQG9wdGlvbnMubWFya2VyRHJhZ0VuZFxuICAgICAgQG9wdGlvbnMubWFya2VyRHJhZ0VuZChldmVudCwgbWFya2VyKVxuXG4gIG1hcmtlckNsaWNrOiAoZXZlbnQsIG1hcmtlcikgPT5cbiAgICBpZiBAb3B0aW9ucy5tYXJrZXJDbGlja1xuICAgICAgQG9wdGlvbnMubWFya2VyQ2xpY2soZXZlbnQsIG1hcmtlcilcblxuICBjYW52YXNDbGljazogKGV2ZW50LCBjb29yZHMpID0+XG4gICAgaWYgQG9wdGlvbnMuY2FudmFzQ2xpY2tcbiAgICAgIEBvcHRpb25zLmNhbnZhc0NsaWNrKGV2ZW50LCBjb29yZHMpXG5cbiAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gQ2xhc3MgTWV0aG9kc1xuXG4gIEByYW5kb21TdHJpbmc6IChsZW5ndGggPSAxNikgLT5cbiAgICBzdHIgPSBNYXRoLnJhbmRvbSgpLnRvU3RyaW5nKDM2KS5zbGljZSgyKVxuICAgIHN0ciA9IHN0ciArIE1hdGgucmFuZG9tKCkudG9TdHJpbmcoMzYpLnNsaWNlKDIpXG4gICAgc3RyLnN1YnN0cmluZygwLCBsZW5ndGggLSAxKVxuXG4jIHNldCB0aGlzIGNsYXNzIHRvIGEgZ2xvYmFsIGBwbGFuaXRgIHZhcmlhYmxlXG53aW5kb3cucGxhbml0ID0gbmV3IFBsYW5pdFxuXG5jbGFzcyBQbGFuaXQuUGxhblxuXG4gICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIFNldHVwXG5cbiAgY29uc3RydWN0b3I6IChAY29udGFpbmVyKSAtPlxuICAgIEBtYXJrZXJzQ29udGFpbmVyID0gQGNvbnRhaW5lci5maW5kKFwiLiN7UGxhbml0Lm1hcmtlckNvbnRhaW5lckNsYXNzfVwiKS5maXJzdCgpXG5cbiAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gR2V0IEFsbCBNYXJrZXJzXG5cbiAgZ2V0QWxsTWFya2VyczogKCkgPT5cbiAgICBtYXJrZXJzID0gW11cbiAgICBmb3IgbWFya2VyIGluIEBtYXJrZXJzQ29udGFpbmVyLmZpbmQoJy5wbGFuaXQtbWFya2VyJylcbiAgICAgIG0gPSBuZXcgUGxhbml0Lk1hcmtlcihAY29udGFpbmVyLCAkKG1hcmtlcikuYXR0cignZGF0YS1tYXJrZXInKSlcbiAgICAgIG1hcmtlciA9XG4gICAgICAgICMgY29vcmRzOiBbbS5wb3NpdGlvbigpLmxlZnQsIG0ucG9zaXRpb24oKS50b3BdXG4gICAgICAgIGNvb3JkczogbS5wb3NpdGlvbigpXG4gICAgICAgIGRyYWdnYWJsZTogbS5pc0RyYWdnYWJsZSgpXG4gICAgICAgIGNvbG9yOiBtLmNvbG9yKClcbiAgICAgIG1hcmtlci5pbmZvYm94ID0gbS5pbmZvYm94SFRNTCgpIGlmIG0uaW5mb2JveEhUTUwoKVxuICAgICAgbWFya2Vycy5wdXNoKG0pXG4gICAgbWFya2Vyc1xuXG5jbGFzcyBQbGFuaXQuUGxhbi5FdmVudHNcblxuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBTZXR1cFxuXG4gIGNvbnN0cnVjdG9yOiAoQG9wdGlvbnMpIC0+XG5cbiAgICAjIGRlZmF1bHQgb3B0aW9uc1xuICAgIEBjb250YWluZXIgPSBAb3B0aW9ucy5jb250YWluZXJcbiAgICBAbWFya2Vyc0NvbnRhaW5lciA9IEBjb250YWluZXIuZmluZChcIi4je1BsYW5pdC5tYXJrZXJDb250YWluZXJDbGFzc31cIilcbiAgICBpZiBAY29udGFpbmVyLmZpbmQoJy5pbWFnZS1jb250YWluZXIgPiBpbWcnKS5sZW5ndGggPiAwXG4gICAgICBAaW1hZ2UgPSBAY29udGFpbmVyLmZpbmQoJy5pbWFnZS1jb250YWluZXIgPiBpbWcnKS5maXJzdCgpXG5cbiAgICAjIGJpbmQgZHJhZ2dhYmxlIGV2ZW50c1xuICAgICQoZG9jdW1lbnQpLm9uKCdtb3VzZW1vdmUnLCBAbW91c2Vtb3ZlKVxuICAgICQoZG9jdW1lbnQpLm9uKCdtb3VzZXVwJywgQG1vdXNldXApXG5cbiAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gUmVmc1xuXG4gIG1hcmtlcnM6ID0+XG4gICAgQG1hcmtlcnNDb250YWluZXIuZmluZCgnLnBsYW5pdC1tYXJrZXInKVxuXG4gIGRyYWdnaW5nTWFya2VyOiA9PlxuICAgIEBtYXJrZXJzQ29udGFpbmVyLmZpbmQoJy5wbGFuaXQtbWFya2VyLmlzLWRyYWdnaW5nJylcblxuICBnZXRFdmVudFBvc2l0aW9uOiAoZSkgPT5cbiAgICAjIGNvbnRhaW5lciBkaW1lbnNpb25zXG4gICAgd0NvbnQgPSBwYXJzZUZsb2F0KEBtYXJrZXJzQ29udGFpbmVyLndpZHRoKCkpXG4gICAgaENvbnQgPSBwYXJzZUZsb2F0KEBtYXJrZXJzQ29udGFpbmVyLmhlaWdodCgpKVxuICAgICMgaWYoXG4gICAgIyAgIEBtYXJrZXJzQ29udGFpbmVyLmNzcygnYmFja2dyb3VuZEltYWdlJykgJiZcbiAgICAjICAgQG1hcmtlcnNDb250YWluZXIuY3NzKCdiYWNrZ3JvdW5kSW1hZ2UnKSAhPSAnbm9uZSdcbiAgICAjIClcbiAgICBpZiBAaW1hZ2VcbiAgICAgICMgaWYgdGhlcmUgaXMgYW4gaW1hZ2UsIHdlIG5lZWQgdG8gY2FsY3VsYXRlIHdpdGggaW1hZ2UgaW4gbWluZFxuICAgICAgeFB4ID0gZS5wYWdlWCAtIEBjb250YWluZXIub2Zmc2V0KCkubGVmdFxuICAgICAgeVB4ID0gZS5wYWdlWSAtIEBjb250YWluZXIub2Zmc2V0KCkudG9wXG4gICAgICB3SW1nID0gQGltYWdlLndpZHRoKClcbiAgICAgIGhJbWcgPSBAaW1hZ2UuaGVpZ2h0KClcbiAgICAgIHhJbWcgPSBwYXJzZUludChAaW1hZ2UuY3NzKCdsZWZ0JykpXG4gICAgICB5SW1nID0gcGFyc2VJbnQoQGltYWdlLmNzcygndG9wJykpXG4gICAgICB4UGMgPSAoKHhQeCArIE1hdGguYWJzKHhJbWcpKSAvIHdJbWcpICogMTAwXG4gICAgICB5UGMgPSAoKHlQeCArIE1hdGguYWJzKHlJbWcpKSAvIGhJbWcpICogMTAwXG4gICAgZWxzZVxuICAgICAgIyBvciB3ZSBjYW4ganVzdCBsb29rIGF0IHRoZSBjb250YWluZXJcbiAgICAgIHhQYyA9IChlLnBhZ2VYIC0gQGNvbnRhaW5lci5vZmZzZXQoKS5sZWZ0KSAvIHdDb250XG4gICAgICB5UGMgPSAgKGUucGFnZVkgLSBAY29udGFpbmVyLm9mZnNldCgpLnRvcCkgLyBoQ29udFxuICAgIFt4UGMsIHlQY11cblxuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBFdmVudHNcblxuICBtb3VzZXVwOiAoZSkgPT5cbiAgICAjIGRlYWxpbmcgd2l0aCBtYXJrZXJzLCBlc3AuIGRyYWdnaW5nIG1hcmtlcnNcbiAgICBtYXJrZXIgPSBAbWFya2Vyc0NvbnRhaW5lci5maW5kKCcuaXMtZHJhZ2dpbmcnKS5maXJzdCgpXG4gICAgaWYgQGRyYWdnaW5nTWFya2VyKCkubGVuZ3RoID4gMFxuICAgICAgbSA9IG5ldyBQbGFuaXQuTWFya2VyKEBjb250YWluZXIsIG1hcmtlci5hdHRyKCdkYXRhLW1hcmtlcicpKVxuICAgICAgQG9wdGlvbnMucGxhbml0Lm1hcmtlckRyYWdFbmQoZSwgbSlcbiAgICAgIG0uc2F2ZVBvc2l0aW9uKClcbiAgICAgIG0ucG9zaXRpb25JbmZvYm94KClcbiAgICAgIEBkcmFnZ2luZ01hcmtlcigpLnJlbW92ZUNsYXNzKCdpcy1kcmFnZ2luZycpXG4gICAgIyBpZiBjbGljayBpcyBvbiB0aGUgY29udGFpbmVyXG4gICAgaWYgJChlLnRhcmdldCkuaGFzQ2xhc3MoUGxhbml0Lm1hcmtlckNvbnRhaW5lckNsYXNzKVxuICAgICAgQG9wdGlvbnMucGxhbml0LmNhbnZhc0NsaWNrKGUsIEBnZXRFdmVudFBvc2l0aW9uKGUpKVxuICAgICMgaWYgY2xpY2sgaXMgb24gdGhlIG1hcmtlcnNcbiAgICBpZihcbiAgICAgICQoZS50YXJnZXQpLmhhc0NsYXNzKFBsYW5pdC5tYXJrZXJDbGFzcykgfHxcbiAgICAgICQoZS50YXJnZXQpLnBhcmVudHMoXCIuI3tQbGFuaXQubWFya2VyQ2xhc3N9XCIpLmxlbmd0aCA+IDBcbiAgICApXG4gICAgICBpZiAkKGUudGFyZ2V0KS5oYXNDbGFzcyhQbGFuaXQubWFya2VyQ2xhc3MpXG4gICAgICAgIG1hcmtlciA9ICQoZS50YXJnZXQpXG4gICAgICBlbHNlXG4gICAgICAgIG1hcmtlciA9ICQoZS50YXJnZXQpLnBhcmVudHMoXCIuI3tQbGFuaXQubWFya2VyQ2xhc3N9XCIpLmZpcnN0KClcbiAgICAgIG0gPSBuZXcgUGxhbml0Lk1hcmtlcihAY29udGFpbmVyLCBtYXJrZXIuYXR0cignZGF0YS1tYXJrZXInKSlcbiAgICAgIEBvcHRpb25zLnBsYW5pdC5tYXJrZXJDbGljayhlLCBtKVxuICAgIHRydWVcblxuICBtb3VzZW1vdmU6IChlKSA9PlxuICAgIG1hcmtlcnMgPSBAbWFya2Vyc0NvbnRhaW5lci5maW5kKCcucGxhbml0LW1hcmtlci5pcy1kcmFnZ2luZycpXG5cbiAgICBpZiBtYXJrZXJzLmxlbmd0aCA+IDBcblxuICAgICAgIyBvbmx5IHVzZSBmaXJzdCBtYXJrZXIgaW4gY2FzZSB0aGVyZSBhcmUgbW9yZSB0aGFuXG4gICAgICAjIG9uZSBkcmFnZ2luZ1xuICAgICAgI1xuICAgICAgbWFya2VyID0gbWFya2Vycy5maXJzdCgpXG5cbiAgICAgICMgd2UgaGlkZSB0aGUgaW5mb2JveCB3aGlsZSBkcmFnZ2luZ1xuICAgICAgI1xuICAgICAgaWYoXG4gICAgICAgIE1hdGguYWJzKGUucGFnZVggLSBtYXJrZXIuYXR0cignZGF0YS1kcmFnLXN0YXJ0LXgnKSkgPiAwIHx8XG4gICAgICAgIE1hdGguYWJzKGUucGFnZVkgLSBtYXJrZXIuYXR0cignZGF0YS1kcmFnLXN0YXJ0LXknKSkgPiAwXG4gICAgICApXG4gICAgICAgICQoXCIjI3ttYXJrZXIuYXR0cignZGF0YS1pbmZvYm94Jyl9XCIpLnJlbW92ZUNsYXNzKCdhY3RpdmUnKVxuXG4gICAgICAjIGNhbGN1bGF0ZSBwb3NpdGlvbnNcbiAgICAgICNcbiAgICAgIG1vdXNlTGVmdCAgICAgPSBlLnBhZ2VYIC0gQGNvbnRhaW5lci5vZmZzZXQoKS5sZWZ0XG4gICAgICBtb3VzZVRvcCAgICAgID0gZS5wYWdlWSAtIEBjb250YWluZXIub2Zmc2V0KCkudG9wXG4gICAgICBwbGFuUmlnaHQgICAgID0gQGNvbnRhaW5lci53aWR0aCgpXG4gICAgICBwbGFuQm90dG9tICAgID0gQGNvbnRhaW5lci5oZWlnaHQoKVxuICAgICAgbWFya2VyTGVmdCAgICA9IG1vdXNlTGVmdCAtIChtYXJrZXIub3V0ZXJXaWR0aCgpIC8gMilcbiAgICAgIG1hcmtlclRvcCAgICAgPSBtb3VzZVRvcCAtIChtYXJrZXIub3V0ZXJIZWlnaHQoKSAvIDIpXG4gICAgICBtYXJrZXJSaWdodCAgID0gbW91c2VMZWZ0ICsgKG1hcmtlci5vdXRlcldpZHRoKCkgLyAyKVxuICAgICAgbWFya2VyQm90dG9tICA9IG1vdXNlVG9wICsgKG1hcmtlci5vdXRlckhlaWdodCgpIC8gMilcbiAgICAgIG1hcmtlcldpZHRoICAgPSBtYXJrZXIub3V0ZXJXaWR0aCgpXG4gICAgICBtYXJrZXJIZWlnaHQgID0gbWFya2VyLm91dGVySGVpZ2h0KClcblxuICAgICAgIyBmaW5kIHRoZSBsZWZ0IHBvc2l0aW9uIG9mIHRoZSBtYXJrZXIgYmFzZWQgb25cbiAgICAgICMgcG9zaXRpb24gb2YgdGhlIG1vdXNlIHJlbGF0aXZlIHRvIHRoZSBwbGFuXG4gICAgICAjXG4gICAgICBpZiBtYXJrZXJMZWZ0IDw9IDBcbiAgICAgICAgbWFya2VyWCA9IDBcbiAgICAgIGVsc2UgaWYgbWFya2VyUmlnaHQgPCBwbGFuUmlnaHRcbiAgICAgICAgbWFya2VyWCA9IG1hcmtlckxlZnRcbiAgICAgIGVsc2VcbiAgICAgICAgbWFya2VyWCA9IHBsYW5SaWdodCAtIG1hcmtlcldpZHRoXG5cbiAgICAgICMgZmluZCB0aGUgbGVmdCBwb3NpdGlvbiBvZiB0aGUgbWFya2VyIGJhc2VkIG9uXG4gICAgICAjIHBvc2l0aW9uIG9mIHRoZSBtb3VzZSByZWxhdGl2ZSB0byB0aGUgcGxhblxuICAgICAgI1xuICAgICAgaWYgbWFya2VyVG9wIDw9IDBcbiAgICAgICAgbWFya2VyWSA9IDBcbiAgICAgIGVsc2UgaWYgbWFya2VyQm90dG9tIDwgcGxhbkJvdHRvbVxuICAgICAgICBtYXJrZXJZID0gbWFya2VyVG9wXG4gICAgICBlbHNlXG4gICAgICAgIG1hcmtlclkgPSBwbGFuQm90dG9tIC0gbWFya2VySGVpZ2h0XG5cbiAgICAgICMgc2V0IHRoZSBwb3NpdGlvbiBvZiB0aGUgbWFya2VyXG4gICAgICAjXG4gICAgICBtYXJrZXIuY3NzXG4gICAgICAgIGxlZnQ6IG1hcmtlclhcbiAgICAgICAgdG9wOiBtYXJrZXJZXG5cbmNsYXNzIFBsYW5pdC5QbGFuLlpvb21hYmxlXG5cbiAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gU2V0dXBcblxuICBjb25zdHJ1Y3RvcjogKEBvcHRpb25zKSAtPlxuICAgICMgZGVmYXVsdCBvcHRpb25zXG4gICAgQGNvbnRhaW5lciA9IEBvcHRpb25zLmNvbnRhaW5lclxuICAgIEBtYXJrZXJzQ29udGFpbmVyID0gQGNvbnRhaW5lci5maW5kKFwiLiN7UGxhbml0Lm1hcmtlckNvbnRhaW5lckNsYXNzfVwiKVxuICAgIEBpbWFnZSA9IEBjb250YWluZXIuZmluZCgnaW1nJykuZmlyc3QoKVxuICAgIEB6b29tSWQgPSBQbGFuaXQucmFuZG9tU3RyaW5nKClcbiAgICBAbWFya2Vyc0NvbnRhaW5lci5hdHRyKCdkYXRhLXpvb20taWQnLCBAem9vbUlkKVxuICAgICMgc2V0IGluaXRpYWwgYmFja2dyb3VuZCBjb29yZGluYXRlc1xuICAgIEBpbWFnZVBvc2l0aW9uID1cbiAgICAgIGxlZnRQeDogICAgICAgICAwXG4gICAgICB0b3BQeDogICAgICAgICAgMFxuICAgICAgd2lkdGg6ICAgICAgICAgIEBpbWFnZS53aWR0aCgpXG4gICAgICBoZWlnaHQ6ICAgICAgICAgQGltYWdlLmhlaWdodCgpXG4gICAgICBzY2FsZTogICAgICAgICAgMVxuICAgICAgaW5jcmVtZW50OiAwLjVcbiAgICBAc2V0QmFja2dyb3VuZCgpXG5cbiAgIyB0aGlzIG9ubHkgZ2V0cyBydW4gaWYgdGhlIHVzZXIgc3BlY2lmaWVzIHpvb21hYmxlIC0tXG4gICMgb3RoZXJ3aXNlIHdlIGF0IGxlYXN0IGhhdmUgdGhlIGNsYXNzIGluaXRpYWxpemVkXG4gICNcbiAgbmV3OiA9PlxuICAgICMgZHJhdyB0aGUgY29udHJvbHMgZGlua3VzXG4gICAgQGNvbnRhaW5lci5wcmVwZW5kIFwiXCJcIlxuICAgICAgPGRpdiBjbGFzcz1cInBsYW5pdC1jb250cm9sc1wiPlxuICAgICAgICA8YSBocmVmPVwiI1wiIGNsYXNzPVwiem9vbVwiIGRhdGEtYWN0aW9uPVwiaW5cIj4rPC9hPlxuICAgICAgICA8YSBocmVmPVwiI1wiIGNsYXNzPVwiem9vbVwiIGRhdGEtYWN0aW9uPVwib3V0XCI+LTwvYT5cbiAgICAgIDwvZGl2PlxuICAgIFwiXCJcIlxuICAgIEBjb250YWluZXIuZmluZChcIi56b29tW2RhdGEtYWN0aW9uPSdpbiddXCIpLmNsaWNrIChlKSA9PlxuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICBAem9vbUluKClcbiAgICBAY29udGFpbmVyLmZpbmQoXCIuem9vbVtkYXRhLWFjdGlvbj0nb3V0J11cIikuY2xpY2sgKGUpID0+XG4gICAgICBlLnByZXZlbnREZWZhdWx0KClcbiAgICAgIEB6b29tT3V0KClcbiAgICAjIGJpbmQgZHJhZ2dhYmxlIGV2ZW50c1xuICAgIEBjb250YWluZXIub24oJ2RibGNsaWNrJywgQGRibGNsaWNrKVxuICAgIEBjb250YWluZXIub24oJ21vdXNlZG93bicsIEBtb3VzZWRvd24pXG4gICAgJChkb2N1bWVudCkub24oJ21vdXNlbW92ZScsIEBtb3VzZW1vdmUpXG4gICAgJChkb2N1bWVudCkub24oJ21vdXNldXAnLCBAbW91c2V1cClcblxuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBBY3Rpb25zXG5cbiAgc2V0QmFja2dyb3VuZDogPT5cbiAgICBAaW1hZ2UuY3NzXG4gICAgICBsZWZ0OiBcIiN7QGltYWdlUG9zaXRpb24ubGVmdFB4fXB4XCJcbiAgICAgIHRvcDogXCIje0BpbWFnZVBvc2l0aW9uLnRvcFB4fXB4XCJcbiAgICAgIHdpZHRoOiBcIiN7QGltYWdlUG9zaXRpb24uc2NhbGUgKiAxMDAuMH0lXCJcbiAgICAgIGhlaWdodDogJ2F1dG8nXG4gICAgQHNldE1hcmtlcnMoKVxuXG4gIGFuaW1hdGVCYWNrZ3JvdW5kOiA9PlxuICAgIEBpbWFnZS5hbmltYXRlXG4gICAgICBsZWZ0OiBcIiN7QGltYWdlUG9zaXRpb24ubGVmdFB4fXB4XCJcbiAgICAgIHRvcDogXCIje0BpbWFnZVBvc2l0aW9uLnRvcFB4fXB4XCJcbiAgICAgIHdpZHRoOiBcIiN7QGltYWdlUG9zaXRpb24uc2NhbGUgKiAxMDAuMH0lXCJcbiAgICAgIGhlaWdodDogJ2F1dG8nXG4gICAgLCAyNTBcbiAgICBAYW5pbWF0ZU1hcmtlcnMoKVxuXG4gIHNldE1hcmtlcnM6ID0+XG4gICAgbWFya2VycyA9IEBjb250YWluZXIuZmluZCgnZGl2LnBsYW5pdC1tYXJrZXInKVxuICAgIGlmIG1hcmtlcnMubGVuZ3RoID4gMFxuICAgICAgZm9yIG1hcmtlciBpbiBtYXJrZXJzXG4gICAgICAgIGxlZnQgPSAoQGltZ1dpZHRoKCkgKiAoJChtYXJrZXIpLmF0dHIoJ2RhdGEteFBjJykgLyAxMDApKSArXG4gICAgICAgICAgQGltYWdlUG9zaXRpb24ubGVmdFB4IC0gKCQobWFya2VyKS5vdXRlcldpZHRoKCkgLyAyKVxuICAgICAgICB0b3AgPSAoQGltZ0hlaWdodCgpICogKCQobWFya2VyKS5hdHRyKCdkYXRhLXlQYycpIC8gMTAwKSkgK1xuICAgICAgICAgIEBpbWFnZVBvc2l0aW9uLnRvcFB4IC0gKCQobWFya2VyKS5vdXRlckhlaWdodCgpIC8gMilcbiAgICAgICAgJChtYXJrZXIpLmNzc1xuICAgICAgICAgIGxlZnQ6IFwiI3tsZWZ0fXB4XCJcbiAgICAgICAgICB0b3A6IFwiI3t0b3B9cHhcIlxuICAgICAgQHBvc2l0aW9uSW5mb2JveGVzKClcblxuICBhbmltYXRlTWFya2VyczogPT5cbiAgICBtYXJrZXJzID0gQGNvbnRhaW5lci5maW5kKCdkaXYucGxhbml0LW1hcmtlcicpXG4gICAgaWYgbWFya2Vycy5sZW5ndGggPiAwXG4gICAgICBmb3IgbWFya2VyIGluIG1hcmtlcnNcbiAgICAgICAgbSA9IG5ldyBQbGFuaXQuTWFya2VyKEBjb250YWluZXIsICQobWFya2VyKS5hdHRyKCdkYXRhLW1hcmtlcicpKVxuICAgICAgICBtLmhpZGVJbmZvYm94KClcbiAgICAgICAgbGVmdCA9IChAaW1nV2lkdGgoKSAqICgkKG1hcmtlcikuYXR0cignZGF0YS14UGMnKSAvIDEwMCkpICtcbiAgICAgICAgICBAaW1hZ2VQb3NpdGlvbi5sZWZ0UHggLSAoJChtYXJrZXIpLm91dGVyV2lkdGgoKSAvIDIpXG4gICAgICAgIHRvcCA9IChAaW1nSGVpZ2h0KCkgKiAoJChtYXJrZXIpLmF0dHIoJ2RhdGEteVBjJykgLyAxMDApKSArXG4gICAgICAgICAgQGltYWdlUG9zaXRpb24udG9wUHggLSAoJChtYXJrZXIpLm91dGVySGVpZ2h0KCkgLyAyKVxuICAgICAgICBkbyAobSkgLT5cbiAgICAgICAgICAkKG1hcmtlcikuYW5pbWF0ZVxuICAgICAgICAgICAgbGVmdDogXCIje2xlZnR9cHhcIlxuICAgICAgICAgICAgdG9wOiBcIiN7dG9wfXB4XCJcbiAgICAgICAgICAsIDI1MCwgKCkgPT5cbiAgICAgICAgICAgIG0ucG9zaXRpb25JbmZvYm94KClcbiAgICAgICAgICAgIG0udW5oaWRlSW5mb2JveCgpXG5cbiAgcG9zaXRpb25JbmZvYm94ZXM6ID0+XG4gICAgZm9yIG1hcmtlciBpbiBAY29udGFpbmVyLmZpbmQoJy5wbGFuaXQtbWFya2VyJylcbiAgICAgIG0gPSBuZXcgUGxhbml0Lk1hcmtlcihAY29udGFpbmVyLCAkKG1hcmtlcikuYXR0cignZGF0YS1tYXJrZXInKSlcbiAgICAgIG0ucG9zaXRpb25JbmZvYm94KClcbiAgICB0cnVlXG5cbiAgYW5pbWF0ZUluZm9ib3hlczogPT5cbiAgICBmb3IgbWFya2VyIGluIEBjb250YWluZXIuZmluZCgnLnBsYW5pdC1tYXJrZXInKVxuICAgICAgbSA9IG5ldyBQbGFuaXQuTWFya2VyKEBjb250YWluZXIsICQobWFya2VyKS5hdHRyKCdkYXRhLW1hcmtlcicpKVxuICAgICAgbS5hbmltYXRlSW5mb2JveCgpXG4gICAgdHJ1ZVxuXG4gIGNlbnRlck9uOiAoY29vcmRzKSA9PlxuICAgIGlmIGNvb3Jkc1swXSA+PSA1MCB0aGVuIHggPSAxMDAgLSBjb29yZHNbMF0gZWxzZSB4ID0gY29vcmRzWzBdXG4gICAgaWYgY29vcmRzWzFdID49IDUwIHRoZW4geSA9IDEwMCAtIGNvb3Jkc1sxXSBlbHNlIHkgPSBjb29yZHNbMV1cbiAgICB3TWluID0gNTAgKiAoQGNvbnRhaW5lcldpZHRoKCkgLyB4KVxuICAgIGhNaW4gPSA1MCAqIChAY29udGFpbmVySGVpZ2h0KCkgLyB5KVxuICAgICMgaGlkZXMgb3RoZXIgYWN0aXZlIGluZm9ib3hlcywgYnV0IHdpbGwgc3RpbGwgc2hvd1xuICAgICMgdGhpcyBpbmZvYm94XG4gICAgQGNvbnRhaW5lci5maW5kKCcucGxhbml0LWluZm9ib3gnKS5yZW1vdmVDbGFzcygnYWN0aXZlJylcbiAgICAjIGtlZXAgdGhlb3JldGljYWxseSBtYWtpbmcgdGhlIGltYWdlIGJpZ2dlciB1bnRpbCBpdCBpc1xuICAgICMgbGFyZ2UgZW5vdWdoIHRvIGNlbnRlciBvbiBvdXIgcG9pbnRcbiAgICBAaW1hZ2VQb3NpdGlvbi5zY2FsZSAgPSBAaW1hZ2VQb3NpdGlvbi5zY2FsZSArIEBpbWFnZVBvc2l0aW9uLmluY3JlbWVudFxuICAgIEBpbWFnZVBvc2l0aW9uLmxlZnRQeCA9IC0gKFxuICAgICAgKEBpbWdXaWR0aCgpICogKGNvb3Jkc1swXSAvIDEwMCkpIC0gKEBjb250YWluZXJXaWR0aCgpIC8gMilcbiAgICApXG4gICAgQGltYWdlUG9zaXRpb24udG9wUHggPSAtIChcbiAgICAgIChAaW1nSGVpZ2h0KCkgKiAoY29vcmRzWzFdIC8gMTAwKSkgLSAoQGNvbnRhaW5lckhlaWdodCgpIC8gMilcbiAgICApXG4gICAgd2hpbGUgKEBpbWdXaWR0aCgpIDwgd01pbikgfHwgKEBpbWdIZWlnaHQoKSA8IGhNaW4pXG4gICAgICBAaW1hZ2VQb3NpdGlvbi5zY2FsZSAgPSBAaW1hZ2VQb3NpdGlvbi5zY2FsZSArIEBpbWFnZVBvc2l0aW9uLmluY3JlbWVudFxuICAgICAgQGltYWdlUG9zaXRpb24ubGVmdFB4ID0gLSAoXG4gICAgICAgIChAaW1nV2lkdGgoKSAqIChjb29yZHNbMF0gLyAxMDApKSAtIChAY29udGFpbmVyV2lkdGgoKSAvIDIpXG4gICAgICApXG4gICAgICBAaW1hZ2VQb3NpdGlvbi50b3BQeCA9IC0gKFxuICAgICAgICAoQGltZ0hlaWdodCgpICogKGNvb3Jkc1sxXSAvIDEwMCkpIC0gKEBjb250YWluZXJIZWlnaHQoKSAvIDIpXG4gICAgICApXG4gICAgQGFuaW1hdGVCYWNrZ3JvdW5kKClcblxuICB6b29tVG86IChsZXZlbCkgPT5cbiAgICBpID0gQGltYWdlUG9zaXRpb24uaW5jcmVtZW50XG4gICAgdW5sZXNzICgobGV2ZWwgKiBpKSArIDEpID09IEBpbWFnZVBvc2l0aW9uLnNjYWxlXG4gICAgICBAaW1hZ2VQb3NpdGlvbi5zY2FsZSA9IChsZXZlbCAqIGkpICsgMSArIGlcbiAgICAgIEB6b29tT3V0KClcblxuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBDYWxjdWxhdGlvbnNcblxuICAjIC0tLS0tLS0tLS0gSW1hZ2UgV2lkdGhcblxuICBpbWdXaWR0aDogPT5cbiAgICBwYXJzZUZsb2F0KEBpbWFnZVBvc2l0aW9uLndpZHRoICogQGltYWdlUG9zaXRpb24uc2NhbGUpXG5cbiAgdG1wSW1nV2lkdGg6ID0+XG4gICAgKDEgKyBAaW1hZ2VQb3NpdGlvbi5pbmNyZW1lbnQpICogQGltYWdlUG9zaXRpb24ud2lkdGgoKVxuXG4gIGltZ1dpZHRoQ2xpY2tJbmNyZW1lbnQ6ID0+XG4gICAgcGFyc2VGbG9hdChAaW1hZ2VQb3NpdGlvbi53aWR0aCAqIEBpbWFnZVBvc2l0aW9uLmluY3JlbWVudClcblxuICBpbWdXaWR0aFNjcm9sbEluY3JlbWVudDogPT5cbiAgICBwYXJzZUZsb2F0KEBpbWFnZVBvc2l0aW9uLndpZHRoICogQGltYWdlUG9zaXRpb24uc2Nyb2xsSW5jcmVtZW50KVxuXG4gIGNvbnRhaW5lcldpZHRoOiA9PlxuICAgIHBhcnNlRmxvYXQoQG1hcmtlcnNDb250YWluZXIud2lkdGgoKSlcblxuICAjIC0tLS0tLS0tLS0gTGVmdCAvIFJpZ2h0XG5cbiAgaW1nT2Zmc2V0TGVmdDogPT5cbiAgICBNYXRoLmFicyhwYXJzZUZsb2F0KEBpbWFnZS5jc3MoJ2xlZnQnKSkpXG5cbiAgIyAtLS0tLS0tLS0tIEhlaWdodFxuXG4gIGltZ0hlaWdodDogPT5cbiAgICBwYXJzZUZsb2F0KEBpbWFnZVBvc2l0aW9uLmhlaWdodCAqIEBpbWFnZVBvc2l0aW9uLnNjYWxlKVxuXG4gIHRtcEltZ0hlaWdodDogPT5cbiAgICAoMSArIEBpbWFnZVBvc2l0aW9uLmluY3JlbWVudCkgKiBAaW1hZ2VQb3NpdGlvbi5oZWlnaHQoKVxuXG4gIGltZ0hlaWdodENsaWNrSW5jcmVtZW50OiA9PlxuICAgIHBhcnNlRmxvYXQoQGltYWdlUG9zaXRpb24uaGVpZ2h0ICogQGltYWdlUG9zaXRpb24uaW5jcmVtZW50KVxuXG4gIGltZ0hlaWdodFNjcm9sbEluY3JlbWVudDogPT5cbiAgICBwYXJzZUZsb2F0KEBpbWFnZVBvc2l0aW9uLmhlaWdodCAqIEBpbWFnZVBvc2l0aW9uLnNjcm9sbEluY3JlbWVudClcblxuICBjb250YWluZXJIZWlnaHQ6ID0+XG4gICAgcGFyc2VGbG9hdChAbWFya2Vyc0NvbnRhaW5lci5oZWlnaHQoKSlcblxuICAjIC0tLS0tLS0tLS0gVG9wIC8gQm90dG9tXG5cbiAgaW1nT2Zmc2V0VG9wOiA9PlxuICAgIE1hdGguYWJzKHBhcnNlRmxvYXQoQGltYWdlLmNzcygndG9wJykpKVxuXG4gICMgLS0tLS0tLS0tLSBPdGhlclxuXG4gIGdldEV2ZW50Q29udGFpbmVyUG9zaXRpb246IChlKSA9PlxuICAgIGxlZnQ6IChlLnBhZ2VYIC0gQGNvbnRhaW5lci5vZmZzZXQoKS5sZWZ0KSAvIEBjb250YWluZXJXaWR0aCgpXG4gICAgdG9wOiAgKGUucGFnZVkgLSBAY29udGFpbmVyLm9mZnNldCgpLnRvcCkgLyBAY29udGFpbmVySGVpZ2h0KClcblxuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBFdmVudHNcblxuICBkYmxjbGljazogKGUpID0+XG4gICAgaWYgJChlLnRhcmdldCkuYXR0cignZGF0YS16b29tLWlkJykgPT0gQHpvb21JZFxuICAgICAgY2xpY2sgPSBAZ2V0RXZlbnRDb250YWluZXJQb3NpdGlvbihlKVxuICAgICAgQHpvb21JbignY2xpY2snLCBjbGljay5sZWZ0LCBjbGljay50b3ApXG5cbiAgbW91c2Vkb3duOiAoZSkgPT5cbiAgICBpZiAkKGUudGFyZ2V0KS5hdHRyKCdkYXRhLXpvb20taWQnKSA9PSBAem9vbUlkICYmIGUud2hpY2ggPT0gMVxuICAgICAgQGlzRHJhZ2dpbmcgPSB0cnVlXG4gICAgICBjb29yZHMgPSBAZ2V0RXZlbnRDb250YWluZXJQb3NpdGlvbihlKVxuICAgICAgQGRyYWdDb29yZHMgPVxuICAgICAgICBwb2ludFJlZjogY29vcmRzXG4gICAgICAgIGltZ1JlZjpcbiAgICAgICAgICBsZWZ0OiAwIC0gQGltZ09mZnNldExlZnQoKVxuICAgICAgICAgIHRvcDogMCAtIEBpbWdPZmZzZXRUb3AoKVxuICAgICAgICBtYXg6XG4gICAgICAgICAgcmlnaHQ6IChjb29yZHMubGVmdCAqIEBjb250YWluZXJXaWR0aCgpKSArIEBpbWdPZmZzZXRMZWZ0KClcbiAgICAgICAgICBsZWZ0OiAoY29vcmRzLmxlZnQgKiBAY29udGFpbmVyV2lkdGgoKSkgLSAoQGltZ1dpZHRoKCkgLVxuICAgICAgICAgICAgICAgICAgICAgIChAY29udGFpbmVyV2lkdGgoKSArIEBpbWdPZmZzZXRMZWZ0KCkpKVxuICAgICAgICAgIGJvdHRvbTogKGNvb3Jkcy50b3AgKiBAY29udGFpbmVySGVpZ2h0KCkpICsgQGltZ09mZnNldFRvcCgpXG4gICAgICAgICAgdG9wOiAoY29vcmRzLnRvcCAqIEBjb250YWluZXJIZWlnaHQoKSkgLSAoQGltZ0hlaWdodCgpIC1cbiAgICAgICAgICAgICAgICAgICAgICAoQGNvbnRhaW5lckhlaWdodCgpICsgQGltZ09mZnNldFRvcCgpKSlcbiAgICB0cnVlXG5cbiAgbW91c2Vtb3ZlOiAoZSkgPT5cbiAgICBpZiBAaXNEcmFnZ2luZ1xuICAgICAgY29vcmRzID0gQGdldEV2ZW50Q29udGFpbmVyUG9zaXRpb24oZSlcbiAgICAgIGRyYWdMZWZ0ID0gY29vcmRzLmxlZnQgKiBAY29udGFpbmVyV2lkdGgoKVxuICAgICAgZHJhZ1RvcCA9IGNvb3Jkcy50b3AgKiBAY29udGFpbmVySGVpZ2h0KClcbiAgICAgIGlmIGRyYWdMZWZ0ID49IEBkcmFnQ29vcmRzLm1heC5sZWZ0ICYmIGRyYWdMZWZ0IDw9IEBkcmFnQ29vcmRzLm1heC5yaWdodFxuICAgICAgICBsZWZ0ID0gKGNvb3Jkcy5sZWZ0IC0gQGRyYWdDb29yZHMucG9pbnRSZWYubGVmdCkgKiBAY29udGFpbmVyV2lkdGgoKVxuICAgICAgICBAaW1hZ2VQb3NpdGlvbi5sZWZ0UHggPSBAZHJhZ0Nvb3Jkcy5pbWdSZWYubGVmdCArIGxlZnRcbiAgICAgIGVsc2UgaWYgZHJhZ0xlZnQgPCBAZHJhZ0Nvb3Jkcy5tYXgubGVmdFxuICAgICAgICBAaW1hZ2VQb3NpdGlvbi5sZWZ0UHggPSBAY29udGFpbmVyV2lkdGgoKSAtIEBpbWdXaWR0aCgpXG4gICAgICBlbHNlIGlmIGRyYWdMZWZ0ID4gQGRyYWdDb29yZHMubWF4LnJpZ2h0XG4gICAgICAgIEBpbWFnZVBvc2l0aW9uLmxlZnRQeCA9IDBcbiAgICAgIGlmIGRyYWdUb3AgPj0gQGRyYWdDb29yZHMubWF4LnRvcCAmJiBkcmFnVG9wIDw9IEBkcmFnQ29vcmRzLm1heC5ib3R0b21cbiAgICAgICAgdG9wID0gKGNvb3Jkcy50b3AgLSBAZHJhZ0Nvb3Jkcy5wb2ludFJlZi50b3ApICogQGNvbnRhaW5lckhlaWdodCgpXG4gICAgICAgIEBpbWFnZVBvc2l0aW9uLnRvcFB4ID0gQGRyYWdDb29yZHMuaW1nUmVmLnRvcCArIHRvcFxuICAgICAgZWxzZSBpZiBkcmFnVG9wIDwgQGRyYWdDb29yZHMubWF4LnRvcFxuICAgICAgICBAaW1hZ2VQb3NpdGlvbi50b3BQeCA9IEBjb250YWluZXJIZWlnaHQoKSAtIEBpbWdIZWlnaHQoKVxuICAgICAgZWxzZSBpZiBkcmFnVG9wID4gQGRyYWdDb29yZHMubWF4LmJvdHRvbVxuICAgICAgICBAaW1hZ2VQb3NpdGlvbi50b3BQeCA9IDBcbiAgICAgIEBzZXRCYWNrZ3JvdW5kKClcbiAgICB0cnVlXG5cbiAgbW91c2V1cDogKGUpID0+XG4gICAgQGlzRHJhZ2dpbmcgPSBmYWxzZVxuICAgIEBwb3NpdGlvbkluZm9ib3hlcygpXG4gICAgdHJ1ZVxuXG4gICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIFpvb21pbmdcblxuICB6b29tSW46ID0+XG4gICAgQGltYWdlUG9zaXRpb24uc2NhbGUgID0gQGltYWdlUG9zaXRpb24uc2NhbGUgKyBAaW1hZ2VQb3NpdGlvbi5pbmNyZW1lbnRcbiAgICBAaW1hZ2VQb3NpdGlvbi5sZWZ0UHggPSAtIEBpbWdPZmZzZXRMZWZ0KCkgLSAoQGltZ1dpZHRoQ2xpY2tJbmNyZW1lbnQoKSAvIDIpXG4gICAgQGltYWdlUG9zaXRpb24udG9wUHggID0gLSBAaW1nT2Zmc2V0VG9wKCkgLSAoQGltZ0hlaWdodENsaWNrSW5jcmVtZW50KCkgLyAyKVxuICAgIEBhbmltYXRlQmFja2dyb3VuZCgpXG5cbiAgem9vbU91dDogKCkgPT5cbiAgICBpZiBAaW1hZ2VQb3NpdGlvbi5zY2FsZSA+IDFcbiAgICAgIEBpbWFnZVBvc2l0aW9uLnNjYWxlICA9IEBpbWFnZVBvc2l0aW9uLnNjYWxlIC0gQGltYWdlUG9zaXRpb24uaW5jcmVtZW50XG4gICAgICBsZWZ0UHggPSAtIEBpbWdPZmZzZXRMZWZ0KCkgKyAoQGltZ1dpZHRoQ2xpY2tJbmNyZW1lbnQoKSAvIDIpXG4gICAgICB0b3BQeCAgPSAtIEBpbWdPZmZzZXRUb3AoKSArIChAaW1nSGVpZ2h0Q2xpY2tJbmNyZW1lbnQoKSAvIDIpXG4gICAgICBpZiBsZWZ0UHggPiAwXG4gICAgICAgIEBpbWFnZVBvc2l0aW9uLmxlZnRQeCA9IDBcbiAgICAgIGVsc2UgaWYgbGVmdFB4IDwgQGNvbnRhaW5lcldpZHRoKCkgLSBAaW1nV2lkdGgoKVxuICAgICAgICBAaW1hZ2VQb3NpdGlvbi5sZWZ0UHggPSBAY29udGFpbmVyV2lkdGgoKSAtIEBpbWdXaWR0aCgpXG4gICAgICBlbHNlXG4gICAgICAgIEBpbWFnZVBvc2l0aW9uLmxlZnRQeCA9IGxlZnRQeFxuICAgICAgaWYgdG9wUHggPiAwXG4gICAgICAgIEBpbWFnZVBvc2l0aW9uLnRvcFB4ID0gMFxuICAgICAgZWxzZSBpZiB0b3BQeCA8IEBjb250YWluZXJIZWlnaHQoKSAtIEBpbWdIZWlnaHQoKVxuICAgICAgICBAaW1hZ2VQb3NpdGlvbi50b3BQeCA9IEBjb250YWluZXJIZWlnaHQoKSAtIEBpbWdIZWlnaHQoKVxuICAgICAgZWxzZVxuICAgICAgICBAaW1hZ2VQb3NpdGlvbi50b3BQeCA9IHRvcFB4XG4gICAgICBAYW5pbWF0ZUJhY2tncm91bmQoKVxuXG5jbGFzcyBQbGFuaXQuTWFya2VyXG5cbiAgY29uc3RydWN0b3I6IChAY29udGFpbmVyLCBpZCkgLT5cblxuICAgICMgU2V0IE9wdGlvbnNcbiAgICBAbWFya2Vyc0NvbnRhaW5lciA9IEBjb250YWluZXIuZmluZChcIi4je1BsYW5pdC5tYXJrZXJDb250YWluZXJDbGFzc31cIilcbiAgICBpZiBAY29udGFpbmVyLmZpbmQoJy5pbWFnZS1jb250YWluZXIgPiBpbWcnKS5sZW5ndGggPiAwXG4gICAgICBAaW1hZ2UgPSBAY29udGFpbmVyLmZpbmQoJy5pbWFnZS1jb250YWluZXIgPiBpbWcnKS5maXJzdCgpXG5cbiAgICAjIEZpbmQgTWFya2VyXG4gICAgQG1hcmtlciA9IEBtYXJrZXJzQ29udGFpbmVyLmZpbmQoXG4gICAgICBcIi4je1BsYW5pdC5tYXJrZXJDbGFzc31bZGF0YS1tYXJrZXI9JyN7aWR9J11cIlxuICAgICkuZmlyc3QoKVxuXG4gICAgIyBSZXR1cm4gdGhpc1xuICAgIEBcblxuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBDYWxjdWxhdGlvbnNcblxuICBwb3NpdGlvbjogPT5cbiAgICB4UHggPSBAbWFya2VyLnBvc2l0aW9uKCkubGVmdCArIChAbWFya2VyLm91dGVyV2lkdGgoKSAvIDIpXG4gICAgeVB4ID0gQG1hcmtlci5wb3NpdGlvbigpLnRvcCArIChAbWFya2VyLm91dGVySGVpZ2h0KCkgLyAyKVxuICAgIGlmIEBpbWFnZVxuICAgICAgd0ltZyA9IEBpbWFnZS53aWR0aCgpXG4gICAgICBoSW1nID0gQGltYWdlLmhlaWdodCgpXG4gICAgICB4SW1nID0gcGFyc2VJbnQoQGltYWdlLmNzcygnbGVmdCcpKVxuICAgICAgeUltZyA9IHBhcnNlSW50KEBpbWFnZS5jc3MoJ3RvcCcpKVxuICAgICAgeFBjID0gKCh4UHggKyBNYXRoLmFicyh4SW1nKSkgLyB3SW1nKSAqIDEwMFxuICAgICAgeVBjID0gKCh5UHggKyBNYXRoLmFicyh5SW1nKSkgLyBoSW1nKSAqIDEwMFxuICAgIGVsc2VcbiAgICAgIHhQYyA9ICh4UHggLyBAY29udGFpbmVyLndpZHRoKCkpICogMTAwXG4gICAgICB5UGMgPSAoeVB4IC8gQGNvbnRhaW5lci5oZWlnaHQoKSkgKiAxMDBcbiAgICBbeFBjLCB5UGNdXG5cbiAgcmVsYXRpdmVQb3NpdGlvbjogPT5cbiAgICB4UHggPSBAbWFya2VyLnBvc2l0aW9uKCkubGVmdCArIChAbWFya2VyLm91dGVyV2lkdGgoKSAvIDIpXG4gICAgeVB4ID0gQG1hcmtlci5wb3NpdGlvbigpLnRvcCArIChAbWFya2VyLm91dGVySGVpZ2h0KCkgLyAyKVxuICAgIHhQYyA9ICh4UHggLyBAY29udGFpbmVyLndpZHRoKCkpICogMTAwXG4gICAgeVBjID0gKHlQeCAvIEBjb250YWluZXIuaGVpZ2h0KCkpICogMTAwXG4gICAgW3hQYywgeVBjXVxuXG4gICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIEF0dHJpYnV0ZXNcblxuICBjb2xvcjogPT5cbiAgICBAbWFya2VyLmNzcygnYmFja2dyb3VuZENvbG9yJylcblxuICBwbGFuaXRJRDogPT5cbiAgICBAbWFya2VyLmF0dHIoJ2RhdGEtbWFya2VyJylcblxuICBpZDogPT5cbiAgICBAbWFya2VyLmF0dHIoJ2RhdGEtaWQnKVxuXG4gICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIEluZm9ib3hcblxuICBpbmZvYm94OiA9PlxuICAgIGluZm9ib3ggPSBAY29udGFpbmVyLmZpbmQoXCIjI3tAbWFya2VyLmF0dHIoJ2RhdGEtaW5mb2JveCcpfVwiKVxuICAgIGlmIGluZm9ib3gubGVuZ3RoID4gMCB0aGVuIGluZm9ib3ggZWxzZSBudWxsXG5cbiAgaW5mb2JveEhUTUw6ID0+XG4gICAgaWYgQGluZm9ib3goKSAmJiBAaW5mb2JveCgpLmxlbmd0aCA+IDAgdGhlbiBAaW5mb2JveCgpLmh0bWwoKSBlbHNlIG51bGxcblxuICBpbmZvYm94VmlzaWJsZTogPT5cbiAgICBAaW5mb2JveCgpICYmIEBpbmZvYm94KCkuaGFzQ2xhc3MoJ2FjdGl2ZScpXG5cbiAgaGlkZUluZm9ib3g6ID0+XG4gICAgQGluZm9ib3goKS5hZGRDbGFzcygnaGlkZGVuJykgaWYgQGluZm9ib3hWaXNpYmxlKClcblxuICBzaG93SW5mb2JveDogPT5cbiAgICBAaW5mb2JveCgpLmFkZENsYXNzKCdhY3RpdmUnKSBpZiBAaW5mb2JveCgpICYmICFAaW5mb2JveFZpc2libGUoKVxuICAgIEB1bmhpZGVJbmZvYm94KClcblxuICB1bmhpZGVJbmZvYm94OiA9PlxuICAgIEBpbmZvYm94KCkucmVtb3ZlQ2xhc3MoJ2hpZGRlbicpIGlmIEBpbmZvYm94VmlzaWJsZSgpXG5cbiAgaW5mb2JveENvb3JkczogPT5cbiAgICBpbmZvYm94ID0gJChcIiMje0BtYXJrZXIuYXR0cignZGF0YS1pbmZvYm94Jyl9XCIpXG4gICAgbWFya2VyQ2VudGVyWCA9IChwYXJzZUZsb2F0KEByZWxhdGl2ZVBvc2l0aW9uKClbMF0gLyAxMDApICogQGNvbnRhaW5lci53aWR0aCgpKVxuICAgIG1hcmtlckNlbnRlclkgPSAocGFyc2VGbG9hdChAcmVsYXRpdmVQb3NpdGlvbigpWzFdIC8gMTAwKSAqIEBjb250YWluZXIuaGVpZ2h0KCkpXG4gICAgaVdpZHRoID0gaW5mb2JveC5vdXRlcldpZHRoKClcbiAgICBpSGFsZldpZHRoID0gaVdpZHRoIC8gMlxuICAgIGlIZWlnaHQgPSBpbmZvYm94Lm91dGVySGVpZ2h0KClcbiAgICBpSGFsZkhlaWdodCA9IGlIZWlnaHQgLyAyXG4gICAgY1dpZHRoID0gQGNvbnRhaW5lci53aWR0aCgpXG4gICAgY0hlaWdodCA9IEBjb250YWluZXIuaGVpZ2h0KClcbiAgICBtV2lkdGggPSBAbWFya2VyLm91dGVyV2lkdGgoKVxuICAgIG1IYWxmV2lkdGggPSBtV2lkdGggLyAyXG4gICAgbUhlaWdodCA9IEBtYXJrZXIub3V0ZXJIZWlnaHQoKVxuICAgIG1IYWxmSGVpZ2h0ID0gbUhlaWdodCAvIDJcbiAgICBidWZmZXIgPSA1XG4gICAgb2Zmc2V0WCA9IHBhcnNlSW50KGluZm9ib3guYXR0cignZGF0YS1vZmZzZXQteCcpKVxuICAgIG9mZnNldFggPSAwIHVubGVzcyBvZmZzZXRYXG4gICAgb2Zmc2V0WSA9IHBhcnNlSW50KGluZm9ib3guYXR0cignZGF0YS1vZmZzZXQteScpKVxuICAgIG9mZnNldFkgPSAwIHVubGVzcyBvZmZzZXRZXG4gICAgc3dpdGNoIGluZm9ib3guYXR0cignZGF0YS1wb3NpdGlvbicpXG4gICAgICB3aGVuICd0b3AnXG4gICAgICAgIGluZm9MZWZ0ID0gbWFya2VyQ2VudGVyWCAtIGlIYWxmV2lkdGhcbiAgICAgICAgaW5mb1RvcCA9IG1hcmtlckNlbnRlclkgLSBpSGVpZ2h0IC0gbUhhbGZIZWlnaHQgLSBidWZmZXJcbiAgICAgIHdoZW4gJ3JpZ2h0J1xuICAgICAgICBpbmZvTGVmdCA9IG1hcmtlckNlbnRlclggKyBtSGFsZldpZHRoICsgYnVmZmVyXG4gICAgICAgIGluZm9Ub3AgPSBtYXJrZXJDZW50ZXJZIC0gaUhhbGZIZWlnaHRcbiAgICAgIHdoZW4gJ2JvdHRvbSdcbiAgICAgICAgaW5mb0xlZnQgPSBtYXJrZXJDZW50ZXJYIC0gaUhhbGZXaWR0aFxuICAgICAgICBpbmZvVG9wID0gbWFya2VyQ2VudGVyWSArIG1IYWxmSGVpZ2h0ICsgYnVmZmVyXG4gICAgICB3aGVuICdsZWZ0J1xuICAgICAgICBpbmZvTGVmdCA9IG1hcmtlckNlbnRlclggLSBpV2lkdGggLSBtSGFsZldpZHRoIC0gYnVmZmVyXG4gICAgICAgIGluZm9Ub3AgPSBtYXJrZXJDZW50ZXJZIC0gaUhhbGZIZWlnaHRcbiAgICAgIHdoZW4gJ3RvcC1sZWZ0J1xuICAgICAgICBpbmZvTGVmdCA9IG1hcmtlckNlbnRlclggLSBpV2lkdGggLSBtSGFsZldpZHRoICsgYnVmZmVyXG4gICAgICAgIGluZm9Ub3AgPSBtYXJrZXJDZW50ZXJZIC0gaUhlaWdodCAtIG1IYWxmSGVpZ2h0ICsgYnVmZmVyXG4gICAgICB3aGVuICd0b3AtcmlnaHQnXG4gICAgICAgIGluZm9MZWZ0ID0gbWFya2VyQ2VudGVyWCArIG1IYWxmV2lkdGggLSBidWZmZXJcbiAgICAgICAgaW5mb1RvcCA9IG1hcmtlckNlbnRlclkgLSBpSGVpZ2h0IC0gbUhhbGZIZWlnaHQgKyBidWZmZXJcbiAgICAgIHdoZW4gJ2JvdHRvbS1sZWZ0J1xuICAgICAgICBpbmZvTGVmdCA9IG1hcmtlckNlbnRlclggLSBpV2lkdGggLSBtSGFsZldpZHRoICsgYnVmZmVyXG4gICAgICAgIGluZm9Ub3AgPSBtYXJrZXJDZW50ZXJZICsgbUhhbGZIZWlnaHQgLSBidWZmZXJcbiAgICAgIHdoZW4gJ2JvdHRvbS1yaWdodCdcbiAgICAgICAgaW5mb0xlZnQgPSBtYXJrZXJDZW50ZXJYICsgbUhhbGZXaWR0aCAtIGJ1ZmZlclxuICAgICAgICBpbmZvVG9wID0gbWFya2VyQ2VudGVyWSArIG1IYWxmSGVpZ2h0IC0gYnVmZmVyXG4gICAgbGVmdDogaW5mb0xlZnQgKyBvZmZzZXRYXG4gICAgdG9wOiBpbmZvVG9wICsgb2Zmc2V0WVxuXG4gIHBvc2l0aW9uSW5mb2JveDogPT5cbiAgICBjb29yZHMgPSBAaW5mb2JveENvb3JkcygpXG4gICAgJChcIiMje0BtYXJrZXIuYXR0cignZGF0YS1pbmZvYm94Jyl9XCIpLmNzc1xuICAgICAgbGVmdDogXCIje2Nvb3Jkcy5sZWZ0fXB4XCJcbiAgICAgIHRvcDogXCIje2Nvb3Jkcy50b3B9cHhcIlxuICAgIEBwb3NpdGlvbigpXG5cbiAgYW5pbWF0ZUluZm9ib3g6ID0+XG4gICAgY29vcmRzID0gQGluZm9ib3hDb29yZHMoKVxuICAgICQoXCIjI3tAbWFya2VyLmF0dHIoJ2RhdGEtaW5mb2JveCcpfVwiKS5hbmltYXRlXG4gICAgICBsZWZ0OiBcIiN7Y29vcmRzLmxlZnR9cHhcIlxuICAgICAgdG9wOiBcIiN7Y29vcmRzLnRvcH1weFwiXG4gICAgLCAyNTAsICgpID0+XG4gICAgICByZXR1cm4gQHBvc2l0aW9uKClcblxuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBEcmFnZ2luZ1xuXG4gIGlzRHJhZ2dhYmxlOiA9PlxuICAgIEBtYXJrZXIuaGFzQ2xhc3MoJ2RyYWdnYWJsZScpXG5cbiAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gQWN0aW9uc1xuXG4gIHNhdmVQb3NpdGlvbjogPT5cbiAgICBjb29yZHMgPSBAcG9zaXRpb24oKVxuICAgIEBtYXJrZXIuYXR0clxuICAgICAgJ2RhdGEteFBjJzogY29vcmRzWzBdXG4gICAgICAnZGF0YS15UGMnOiBjb29yZHNbMV1cblxuICB1cGRhdGU6IChvcHRpb25zKSA9PlxuICAgIGlmIG9wdGlvbnMuY29sb3JcbiAgICAgIEBtYXJrZXIuY3NzKGJhY2tncm91bmRDb2xvcjogb3B0aW9ucy5jb2xvcilcbiAgICBpZiBvcHRpb25zLmluZm9ib3hcbiAgICAgIEBtYXJrZXIuZmluZCgnLnBsYW5pdC1pbmZvYm94JykuaHRtbChvcHRpb25zLmluZm9ib3gpXG4gICAgICBAcG9zaXRpb25JbmZvYm94KClcbiAgICBpZiBvcHRpb25zLmRyYWdnYWJsZVxuICAgICAgQG1hcmtlci5yZW1vdmVDbGFzcygnZHJhZ2dhYmxlJylcbiAgICAgIEBtYXJrZXIuYWRkQ2xhc3MoJ2RyYWdnYWJsZScpIGlmIG9wdGlvbnMuZHJhZ2dhYmxlID09IHRydWVcbiAgICBpZiBvcHRpb25zLmNvb3Jkc1xuICAgICAgbGVmdCA9ICgocGFyc2VGbG9hdChvcHRpb25zLmNvb3Jkc1swXSkgLyAxMDApICogQGNvbnRhaW5lci53aWR0aCgpKSAtIDE1XG4gICAgICB0b3AgPSAoKHBhcnNlRmxvYXQob3B0aW9ucy5jb29yZHNbMV0pIC8gMTAwKSAqIEBjb250YWluZXIuaGVpZ2h0KCkpIC0gMTVcbiAgICAgIEBtYXJrZXIuY3NzXG4gICAgICAgIGxlZnQ6IFwiI3tsZWZ0fXB4XCJcbiAgICAgICAgdG9wOiBcIiN7dG9wfXB4XCJcblxuICByZW1vdmU6ID0+XG4gICAgQGluZm9ib3goKS5yZW1vdmUoKSBpZiBAaW5mb2JveCgpXG4gICAgQG1hcmtlci5yZW1vdmUoKVxuXG5jbGFzcyBQbGFuaXQuTWFya2VyLkV2ZW50c1xuXG4gIGNvbnN0cnVjdG9yOiAoQG9wdGlvbnMpIC0+XG5cbiAgICAjIFNldCBPcHRpb25zXG4gICAgQGNvbnRhaW5lciA9IEBvcHRpb25zLmNvbnRhaW5lclxuICAgIEBtYXJrZXJzQ29udGFpbmVyID0gQGNvbnRhaW5lci5maW5kKFwiLiN7UGxhbml0Lm1hcmtlckNvbnRhaW5lckNsYXNzfVwiKVxuXG4gICAgIyBGaW5kIE1hcmtlclxuICAgIEBtYXJrZXIgPSBAbWFya2Vyc0NvbnRhaW5lci5maW5kKFxuICAgICAgXCIuI3tQbGFuaXQubWFya2VyQ2xhc3N9W2RhdGEtbWFya2VyPScje0BvcHRpb25zLnBsYW5pdElEfSddXCJcbiAgICApLmZpcnN0KClcbiAgICBAbWFya2VyT2JqID0gbmV3IFBsYW5pdC5NYXJrZXIoQGNvbnRhaW5lciwgQG9wdGlvbnMucGxhbml0SUQpXG5cbiAgICAjIERyYWdnYWJsZVxuICAgIGlmIEBvcHRpb25zLmRyYWdnYWJsZVxuICAgICAgQG1hcmtlci5hZGRDbGFzcygnZHJhZ2dhYmxlJylcbiAgICAgIEBtYXJrZXIub24gJ21vdXNlZG93bicsIChlKSA9PlxuICAgICAgICBpZiBlLndoaWNoID09IDFcbiAgICAgICAgICBtYXJrZXIgPSAkKGUudGFyZ2V0KS5jbG9zZXN0KCcucGxhbml0LW1hcmtlcicpXG4gICAgICAgICAgbWFya2VyLmFkZENsYXNzKCdpcy1kcmFnZ2luZycpXG4gICAgICAgICAgbWFya2VyLmF0dHJcbiAgICAgICAgICAgICdkYXRhLWRyYWctc3RhcnQteCc6IGUucGFnZVhcbiAgICAgICAgICAgICdkYXRhLWRyYWctc3RhcnQteSc6IGUucGFnZVlcblxuICAgICMgSW5mb2JveFxuICAgIGlmIEBvcHRpb25zLmluZm9ib3hcbiAgICAgIGlkID0gUGxhbml0LnJhbmRvbVN0cmluZygxNilcbiAgICAgICMgc2V0IHN0eWxlIG9wdGlvbnMgb24gaW5mb2JveFxuICAgICAgb3B0aW9ucyA9IEBvcHRpb25zLmluZm9ib3hcbiAgICAgIGlmIG9wdGlvbnMucG9zaXRpb24gdGhlbiBwb3NpdGlvbiA9IG9wdGlvbnMucG9zaXRpb24gZWxzZSBwb3NpdGlvbiA9ICd0b3AnXG4gICAgICBpZiBvcHRpb25zLmFycm93IHRoZW4gYXJyb3cgPSB0cnVlIGVsc2UgYXJyb3cgPSBmYWxzZVxuICAgICAgaWYgYXJyb3cgPT0gdHJ1ZSB0aGVuIGFycm93Q2xhc3MgPSAnYXJyb3cnIGVsc2UgYXJyb3dDbGFzcyA9ICcnXG4gICAgICBjbGFzc2VzID0gXCJwbGFuaXQtaW5mb2JveCAje3Bvc2l0aW9ufSAje2Fycm93Q2xhc3N9XCJcbiAgICAgIEBjb250YWluZXIuZmluZChcIi4je1BsYW5pdC5pbmZvYm94Q29udGFpbmVyQ2xhc3N9XCIpLmFwcGVuZCBcIlwiXCJcbiAgICAgICAgPGRpdiBjbGFzcz1cIiN7Y2xhc3Nlc31cIiBpZD1cImluZm8tI3tpZH1cIlxuICAgICAgICAgIGRhdGEtcG9zaXRpb249XCIje3Bvc2l0aW9ufVwiPlxuICAgICAgICAgICAgI3tvcHRpb25zLmh0bWx9XG4gICAgICAgIDwvZGl2PlxuICAgICAgICAgIFwiXCJcIlxuICAgICAgaWYgb3B0aW9ucy5vZmZzZXRYXG4gICAgICAgIEBjb250YWluZXIuZmluZCgnLnBsYW5pdC1pbmZvYm94JykubGFzdCgpLmF0dHJcbiAgICAgICAgICAnZGF0YS1vZmZzZXQteCc6IG9wdGlvbnMub2Zmc2V0WFxuICAgICAgaWYgb3B0aW9ucy5vZmZzZXRZXG4gICAgICAgIEBjb250YWluZXIuZmluZCgnLnBsYW5pdC1pbmZvYm94JykubGFzdCgpLmF0dHJcbiAgICAgICAgICAnZGF0YS1vZmZzZXQteSc6IG9wdGlvbnMub2Zmc2V0WVxuICAgICAgQG1hcmtlci5hdHRyKCdkYXRhLWluZm9ib3gnLCBcImluZm8tI3tpZH1cIilcbiAgICAgIEBtYXJrZXJPYmoucG9zaXRpb25JbmZvYm94KClcbiAgICAgICMgQG1hcmtlci5jbGljayAoZSkgPT5cbiAgICAgICMgICBpZihcbiAgICAgICMgICAgICFAbWFya2VyLmF0dHIoJ2RhdGEtZHJhZy1zdGFydC14JykgfHxcbiAgICAgICMgICAgICFAbWFya2VyLmF0dHIoJ2RhdGEtZHJhZy1zdGFydC15JykgfHxcbiAgICAgICMgICAgIChcbiAgICAgICMgICAgICAgTWF0aC5hYnMoZS5wYWdlWCAtIEBtYXJrZXIuYXR0cignZGF0YS1kcmFnLXN0YXJ0LXgnKSkgPCAxICYmXG4gICAgICAjICAgICAgIE1hdGguYWJzKGUucGFnZVkgLSBAbWFya2VyLmF0dHIoJ2RhdGEtZHJhZy1zdGFydC15JykpIDwgMVxuICAgICAgIyAgICAgKVxuICAgICAgIyAgIClcbiAgICAgICMgICAgIG1hcmtlciA9ICQoZS50YXJnZXQpLmNsb3Nlc3QoJy5wbGFuaXQtbWFya2VyJylcbiAgICAgICMgICAgICQoXCIjI3ttYXJrZXIuYXR0cignZGF0YS1pbmZvYm94Jyl9XCIpLnRvZ2dsZUNsYXNzKCdhY3RpdmUnKVxuXG4gIG1hcmtlcnM6IC0+XG4gICAgQG1hcmtlcnNDb250YWluZXIuZmluZCgnLnBsYW5pdC1tYXJrZXInKVxuXG4gIGRyYWdnaW5nTWFya2VyOiAtPlxuICAgIEBtYXJrZXJzQ29udGFpbmVyLmZpbmQoJy5wbGFuaXQtbWFya2VyLmlzLWRyYWdnaW5nJylcblxuY2xhc3MgUGxhbml0Lk1hcmtlci5DcmVhdG9yXG5cbiAgY29uc3RydWN0b3I6IChAb3B0aW9ucykgLT5cbiAgICAjIFNldCBPcHRpb25zXG4gICAgQGNvbnRhaW5lciA9IEBvcHRpb25zLmNvbnRhaW5lclxuICAgIEBtYXJrZXJzQ29udGFpbmVyID0gQGNvbnRhaW5lci5maW5kKFwiLiN7UGxhbml0Lm1hcmtlckNvbnRhaW5lckNsYXNzfVwiKS5maXJzdCgpXG4gICAgdW5sZXNzIEBvcHRpb25zLnBsYW5pdElEXG4gICAgICBAb3B0aW9ucy5wbGFuaXRJRCA9IFBsYW5pdC5yYW5kb21TdHJpbmcoMjApXG5cbiAgICAjIEFkZCBNYXJrZXJcbiAgICBpZiBAb3B0aW9ucy5jb2xvciB0aGVuIGNvbG9yID0gQG9wdGlvbnMuY29sb3IgZWxzZSBjb2xvciA9ICcjRkM1QjNGJ1xuXG4gICAgbGVmdCA9ICgocGFyc2VGbG9hdChAb3B0aW9ucy5jb29yZHNbMF0pIC8gMTAwKSAqIEBjb250YWluZXIud2lkdGgoKSkgLSAxNVxuICAgIHRvcCA9ICgocGFyc2VGbG9hdChAb3B0aW9ucy5jb29yZHNbMV0pIC8gMTAwKSAqIEBjb250YWluZXIuaGVpZ2h0KCkpIC0gMTVcbiAgICBAbWFya2Vyc0NvbnRhaW5lci5hcHBlbmQoXG4gICAgICAkKCc8ZGl2PjwvZGl2PicpXG4gICAgICAgIC5hZGRDbGFzcygncGxhbml0LW1hcmtlcicpXG4gICAgICAgIC5hdHRyXG4gICAgICAgICAgJ2RhdGEtbWFya2VyJzogQG9wdGlvbnMucGxhbml0SURcbiAgICAgICAgICAnZGF0YS14UGMnOiBAb3B0aW9ucy5jb29yZHNbMF1cbiAgICAgICAgICAnZGF0YS15UGMnOiBAb3B0aW9ucy5jb29yZHNbMV1cbiAgICAgICAgLmNzc1xuICAgICAgICAgIGxlZnQ6IFwiI3tsZWZ0fXB4XCJcbiAgICAgICAgICB0b3A6IFwiI3t0b3B9cHhcIlxuICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogY29sb3JcbiAgICApXG4gICAgbWFya2VyID0gQG1hcmtlcnNDb250YWluZXIuZmluZCgnLnBsYW5pdC1tYXJrZXInKS5sYXN0KClcbiAgICBpZiBAb3B0aW9ucy5pZFxuICAgICAgbWFya2VyLmF0dHIoJ2RhdGEtaWQnOiBAb3B0aW9ucy5pZClcbiAgICBpZiBAb3B0aW9ucy5jbGFzc1xuICAgICAgbWFya2VyLmFkZENsYXNzKEBvcHRpb25zLmNsYXNzKVxuICAgIGlmIEBvcHRpb25zLmh0bWxcbiAgICAgIG1hcmtlci5odG1sKEBvcHRpb25zLmh0bWwpXG4gICAgaWYgQG9wdGlvbnMuc2l6ZVxuICAgICAgbWFya2VyLmNzc1xuICAgICAgICB3aWR0aDogXCIje0BvcHRpb25zLnNpemV9cHhcIlxuICAgICAgICBoZWlnaHQ6IFwiI3tAb3B0aW9ucy5zaXplfXB4XCJcblxuICAgICMgQmluZCBFdmVudHMgKGluIGEgc2VwYXJhdGUgY2xhc3MpXG4gICAgbmV3IFBsYW5pdC5NYXJrZXIuRXZlbnRzKEBvcHRpb25zKVxuXG4gICAgIyBSZXR1cm4gYSBuZXcgaW5zdGFuY2Ugb2YgdGhpcyBtYXJrZXJcbiAgICBuZXcgUGxhbml0Lk1hcmtlcihAY29udGFpbmVyLCBAb3B0aW9ucy5wbGFuaXRJRClcbiJdfQ==