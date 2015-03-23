var Planit,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

Planit = (function() {
  function Planit() {
    this.canvasClick = bind(this.canvasClick, this);
    this.markerClick = bind(this.markerClick, this);
    this.markerDragEnd = bind(this.markerDragEnd, this);
    this.resize = bind(this.resize, this);
    this.getAllMarkers = bind(this.getAllMarkers, this);
    this.getMarker = bind(this.getMarker, this);
    this.addMarker = bind(this.addMarker, this);
    this.initMarkers = bind(this.initMarkers, this);
    this.initBackgroundImage = bind(this.initBackgroundImage, this);
  }

  Planit.containerClass = 'planit-container';

  Planit.markerContainerClass = 'planit-markers-container';

  Planit.markerContentClass = 'planit-marker-content';

  Planit.markerClass = 'planit-marker';

  Planit.draggingClass = 'is-dragging';

  Planit.infoboxContainerClass = 'planit-infobox-container';

  Planit.infoboxClass = 'planit-infobox';

  Planit.imageContainer = 'planit-image-container';

  Planit.prototype["new"] = function(options1) {
    this.options = options1 != null ? options1 : {};
    if (this.options.container) {
      this.options.container = $("#" + this.options.container);
    } else {
      this.options.container = $('#planit');
    }
    this.options.container.addClass(Planit.containerClass);
    this.options.container.append("<div class=\"" + Planit.infoboxContainerClass + "\"></div>\n<div class=\"" + Planit.markerContainerClass + "\"></div>");
    this.container = this.options.container;
    this.markersContainer = this.container.find("." + Planit.markerContainerClass).first();
    if (this.options.image && this.options.image.url) {
      this.container.prepend("<div class=\"" + Planit.imageContainer + "\">\n  <img src=\"" + this.options.image.url + "\">\n</div>");
      this.initBackgroundImage();
    }
    if (this.options.markers && this.options.markers.length > 0) {
      this.initMarkers();
    }
    new Planit.Plan.Events({
      container: this.container,
      planit: this
    });
    $(window).resize(this.resize);
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

  Planit.prototype.resize = function(e) {
    var image, j, len, m, marker, ref, results;
    image = this.container.find("." + Planit.imageContainer + " > img").first();
    this.zoomable.resetImage();
    if (image) {
      this.container.height(image.height());
    }
    ref = this.markersContainer.find("." + Planit.markerClass);
    results = [];
    for (j = 0, len = ref.length; j < len; j++) {
      marker = ref[j];
      m = new Planit.Marker(this.container, $(marker).attr('data-marker'));
      results.push(m.set());
    }
    return results;
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
    ref = this.markersContainer.find("." + Planit.markerClass);
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
    if (this.container.find("." + Planit.imageContainer + " > img").length > 0) {
      this.image = this.container.find("." + Planit.imageContainer + " > img").first();
    }
    $(document).on('mousemove', this.mousemove);
    $(document).on('mouseup', this.mouseup);
  }

  Events.prototype.markers = function() {
    return this.markersContainer.find("." + Planit.markerClass);
  };

  Events.prototype.draggingMarker = function() {
    return this.markersContainer.find("." + Planit.markerClass + "." + Planit.draggingClass);
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
    marker = this.markersContainer.find("." + Planit.draggingClass).first();
    if (this.draggingMarker().length > 0) {
      m = new Planit.Marker(this.container, marker.attr('data-marker'));
      this.options.planit.markerDragEnd(e, m);
      m.savePosition();
      m.positionInfobox();
      this.draggingMarker().removeClass(Planit.draggingClass);
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
    markers = this.markersContainer.find("." + Planit.markerClass + "." + Planit.draggingClass);
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
    this.resetImage = bind(this.resetImage, this);
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

  Zoomable.prototype.resetImage = function() {
    this.imagePosition = {
      leftPx: 0,
      topPx: 0,
      width: this.image.width(),
      height: this.image.height(),
      scale: 1,
      increment: 0.5
    };
    return this.setBackground();
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
      return this.positionInfoboxes();
    }
  };

  Zoomable.prototype.animateMarkers = function() {
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

  Zoomable.prototype.positionInfoboxes = function() {
    var j, len, m, marker, ref;
    ref = this.container.find("." + Planit.markerClass);
    for (j = 0, len = ref.length; j < len; j++) {
      marker = ref[j];
      m = new Planit.Marker(this.container, $(marker).attr('data-marker'));
      m.positionInfobox();
    }
    return true;
  };

  Zoomable.prototype.animateInfoboxes = function() {
    var j, len, m, marker, ref;
    ref = this.container.find("." + Planit.markerClass);
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
    this.container.find("." + Planit.infoboxClass).removeClass('active');
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
      classes = Planit.infoboxClass + " " + position + " " + arrowClass;
      this.container.find("." + Planit.infoboxContainerClass).append("<div class=\"" + classes + "\" id=\"info-" + id + "\"\n  data-position=\"" + position + "\">\n    " + options.html + "\n</div>");
      if (options.offsetX) {
        this.container.find("." + Planit.infoboxClass).last().attr({
          'data-offset-x': options.offsetX
        });
      }
      if (options.offsetY) {
        this.container.find("." + Planit.infoboxClass).last().attr({
          'data-offset-y': options.offsetY
        });
      }
      this.marker.attr('data-infobox', "info-" + id);
      this.markerObj.positionInfobox();
    }
  }

  Events.prototype.markers = function() {
    return this.markersContainer.find("." + Planit.markerClass);
  };

  Events.prototype.draggingMarker = function() {
    return this.markersContainer.find("." + Planit.markerClass + "." + Planit.draggingClass);
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
    this.markersContainer.append($('<div></div>').addClass(Planit.markerClass).attr({
      'data-marker': this.options.planitID,
      'data-xPc': this.options.coords[0],
      'data-yPc': this.options.coords[1]
    }).css({
      left: left + "px",
      top: top + "px",
      backgroundColor: color
    }));
    marker = this.markersContainer.find("." + Planit.markerClass).last();
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

//# sourceMappingURL=data:application/json;base64,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Rlc7RUFBQSxDQUFiOztpQkFBQTs7SUFuekJGLENBQUEiLCJmaWxlIjoicGxhbml0LXRtcC5qcyIsInNvdXJjZVJvb3QiOiIvc291cmNlLyIsInNvdXJjZXNDb250ZW50IjpbImNsYXNzIFBsYW5pdFxuXG4gICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIFJlZnNcblxuICBAY29udGFpbmVyQ2xhc3M6ICAgICAgICAncGxhbml0LWNvbnRhaW5lcidcbiAgQG1hcmtlckNvbnRhaW5lckNsYXNzOiAgJ3BsYW5pdC1tYXJrZXJzLWNvbnRhaW5lcidcbiAgQG1hcmtlckNvbnRlbnRDbGFzczogICAgJ3BsYW5pdC1tYXJrZXItY29udGVudCdcbiAgQG1hcmtlckNsYXNzOiAgICAgICAgICAgJ3BsYW5pdC1tYXJrZXInXG4gIEBkcmFnZ2luZ0NsYXNzOiAgICAgICAgICdpcy1kcmFnZ2luZydcbiAgQGluZm9ib3hDb250YWluZXJDbGFzczogJ3BsYW5pdC1pbmZvYm94LWNvbnRhaW5lcidcbiAgQGluZm9ib3hDbGFzczogICAgICAgICAgJ3BsYW5pdC1pbmZvYm94J1xuICBAaW1hZ2VDb250YWluZXI6ICAgICAgICAncGxhbml0LWltYWdlLWNvbnRhaW5lcidcblxuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBEZWZhdWx0IE9wdGlvbnNcblxuICBuZXc6IChAb3B0aW9ucyA9IHt9KSAtPlxuICAgICMgU2V0IE9wdGlvbnNcbiAgICBpZiBAb3B0aW9ucy5jb250YWluZXJcbiAgICAgIEBvcHRpb25zLmNvbnRhaW5lciA9ICQoXCIjI3tAb3B0aW9ucy5jb250YWluZXJ9XCIpXG4gICAgZWxzZVxuICAgICAgQG9wdGlvbnMuY29udGFpbmVyID0gJCgnI3BsYW5pdCcpXG5cbiAgICAjIEluaXRpYWxpemUgQ29udGFpbmVyXG4gICAgQG9wdGlvbnMuY29udGFpbmVyLmFkZENsYXNzKFBsYW5pdC5jb250YWluZXJDbGFzcylcbiAgICBAb3B0aW9ucy5jb250YWluZXIuYXBwZW5kIFwiXCJcIlxuICAgICAgPGRpdiBjbGFzcz1cIiN7UGxhbml0LmluZm9ib3hDb250YWluZXJDbGFzc31cIj48L2Rpdj5cbiAgICAgIDxkaXYgY2xhc3M9XCIje1BsYW5pdC5tYXJrZXJDb250YWluZXJDbGFzc31cIj48L2Rpdj5cbiAgICAgICAgXCJcIlwiXG5cbiAgICAjIFJlZnNcbiAgICBAY29udGFpbmVyID0gQG9wdGlvbnMuY29udGFpbmVyXG4gICAgQG1hcmtlcnNDb250YWluZXIgPSBAY29udGFpbmVyLmZpbmQoXCIuI3tQbGFuaXQubWFya2VyQ29udGFpbmVyQ2xhc3N9XCIpLmZpcnN0KClcblxuICAgICMgQWRkIGltYWdlIGFuZCB6b29tIChpZiBuZWNlc3NhcnkpXG4gICAgaWYgQG9wdGlvbnMuaW1hZ2UgJiYgQG9wdGlvbnMuaW1hZ2UudXJsXG4gICAgICBAY29udGFpbmVyLnByZXBlbmQgXCJcIlwiXG4gICAgICAgIDxkaXYgY2xhc3M9XCIje1BsYW5pdC5pbWFnZUNvbnRhaW5lcn1cIj5cbiAgICAgICAgICA8aW1nIHNyYz1cIiN7QG9wdGlvbnMuaW1hZ2UudXJsfVwiPlxuICAgICAgICA8L2Rpdj5cbiAgICAgIFwiXCJcIlxuICAgICAgIyBAbWFya2Vyc0NvbnRhaW5lci5jc3NcbiAgICAgICMgICBiYWNrZ3JvdW5kSW1hZ2U6IFwidXJsKCcje0BvcHRpb25zLmltYWdlLnVybH0nKVwiXG4gICAgICBAaW5pdEJhY2tncm91bmRJbWFnZSgpXG5cbiAgICAjIEFkZCBNYXJrZXJzIChpZiBuZWNlc3NhcnkpXG4gICAgaWYgQG9wdGlvbnMubWFya2VycyAmJiBAb3B0aW9ucy5tYXJrZXJzLmxlbmd0aCA+IDBcbiAgICAgIEBpbml0TWFya2VycygpXG5cbiAgICAjIEJpbmQgRG9jdW1lbnQgRXZlbnRzXG4gICAgbmV3IFBsYW5pdC5QbGFuLkV2ZW50c1xuICAgICAgY29udGFpbmVyOiBAY29udGFpbmVyXG4gICAgICBwbGFuaXQ6IEBcblxuICAgICQod2luZG93KS5yZXNpemUoQHJlc2l6ZSlcblxuICAgICMgUmV0dXJuIHRoaXMgUGxhbml0IG9iamVjdFxuICAgIEBcblxuICBpbml0QmFja2dyb3VuZEltYWdlOiA9PlxuICAgIGltZyA9IEBjb250YWluZXIuZmluZCgnaW1nJykuZmlyc3QoKVxuICAgIGltZ0hlaWdodCA9IGltZy5oZWlnaHQoKVxuICAgIGlmIGltZ0hlaWdodCA+IDAgJiYgaW1nLndpZHRoKCkgPiAwXG4gICAgICBAY29udGFpbmVyLmNzc1xuICAgICAgICBoZWlnaHQ6IGltZ0hlaWdodFxuICAgICAgQHpvb21hYmxlID0gbmV3IFBsYW5pdC5QbGFuLlpvb21hYmxlXG4gICAgICAgIGNvbnRhaW5lcjogQGNvbnRhaW5lclxuICAgICAgaWYgQG9wdGlvbnMuaW1hZ2Uuem9vbVxuICAgICAgICBAem9vbWFibGUubmV3KClcbiAgICAgIEBpbWdMb2FkZWQgPSB0cnVlXG4gICAgZWxzZVxuICAgICAgc2V0VGltZW91dChAaW5pdEJhY2tncm91bmRJbWFnZSwgMjUwKVxuXG4gIGluaXRNYXJrZXJzOiA9PlxuICAgIGlmIEBvcHRpb25zLmltYWdlICYmIEBvcHRpb25zLmltYWdlLnVybFxuICAgICAgaWYgQGltZ0xvYWRlZCA9PSB0cnVlXG4gICAgICAgIEBhZGRNYXJrZXIobWFya2VyKSBmb3IgbWFya2VyIGluIEBvcHRpb25zLm1hcmtlcnNcbiAgICAgIGVsc2VcbiAgICAgICAgc2V0VGltZW91dChAaW5pdE1hcmtlcnMsIDI1MClcbiAgICBlbHNlXG4gICAgICBAYWRkTWFya2VyKG1hcmtlcikgZm9yIG1hcmtlciBpbiBAb3B0aW9ucy5tYXJrZXJzXG5cbiAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gQWRkIEEgTWFya2VyXG5cbiAgYWRkTWFya2VyOiAob3B0aW9ucykgPT5cbiAgICBvcHRpb25zLmNvbnRhaW5lciA9IEBjb250YWluZXJcbiAgICBuZXcgUGxhbml0Lk1hcmtlci5DcmVhdG9yKG9wdGlvbnMpXG5cbiAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gUmV0cmlldmUgRGF0YVxuXG4gIGdldE1hcmtlcjogKGlkKSA9PlxuICAgIG5ldyBQbGFuaXQuTWFya2VyKEBjb250YWluZXIsIGlkKVxuXG4gIGdldEFsbE1hcmtlcnM6ICgpID0+XG4gICAgcGxhbiA9IG5ldyBQbGFuaXQuUGxhbihAY29udGFpbmVyKVxuICAgIHBsYW4uZ2V0QWxsTWFya2VycygpXG5cbiAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gUGxhbiBBY3Rpb25zXG5cbiAgY2VudGVyT246IChjb29yZHMpIC0+XG4gICAgQHpvb21hYmxlLmNlbnRlck9uKGNvb3JkcylcblxuICB6b29tVG86IChsZXZlbCkgLT5cbiAgICBAem9vbWFibGUuem9vbVRvKGxldmVsKVxuXG4gIHJlc2l6ZTogKGUpID0+XG4gICAgaW1hZ2UgPSBAY29udGFpbmVyLmZpbmQoXCIuI3tQbGFuaXQuaW1hZ2VDb250YWluZXJ9ID4gaW1nXCIpLmZpcnN0KClcbiAgICBAem9vbWFibGUucmVzZXRJbWFnZSgpXG4gICAgaWYgaW1hZ2VcbiAgICAgIEBjb250YWluZXIuaGVpZ2h0KGltYWdlLmhlaWdodCgpKVxuICAgIGZvciBtYXJrZXIgaW4gQG1hcmtlcnNDb250YWluZXIuZmluZChcIi4je1BsYW5pdC5tYXJrZXJDbGFzc31cIilcbiAgICAgIG0gPSBuZXcgUGxhbml0Lk1hcmtlcihAY29udGFpbmVyLCAkKG1hcmtlcikuYXR0cignZGF0YS1tYXJrZXInKSlcbiAgICAgIG0uc2V0KClcblxuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBFdmVudCBDYWxsYmFja3NcblxuICBtYXJrZXJEcmFnRW5kOiAoZXZlbnQsIG1hcmtlcikgPT5cbiAgICBpZiBAb3B0aW9ucy5tYXJrZXJEcmFnRW5kXG4gICAgICBAb3B0aW9ucy5tYXJrZXJEcmFnRW5kKGV2ZW50LCBtYXJrZXIpXG5cbiAgbWFya2VyQ2xpY2s6IChldmVudCwgbWFya2VyKSA9PlxuICAgIGlmIEBvcHRpb25zLm1hcmtlckNsaWNrXG4gICAgICBAb3B0aW9ucy5tYXJrZXJDbGljayhldmVudCwgbWFya2VyKVxuXG4gIGNhbnZhc0NsaWNrOiAoZXZlbnQsIGNvb3JkcykgPT5cbiAgICBpZiBAb3B0aW9ucy5jYW52YXNDbGlja1xuICAgICAgQG9wdGlvbnMuY2FudmFzQ2xpY2soZXZlbnQsIGNvb3JkcylcblxuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBDbGFzcyBNZXRob2RzXG5cbiAgQHJhbmRvbVN0cmluZzogKGxlbmd0aCA9IDE2KSAtPlxuICAgIHN0ciA9IE1hdGgucmFuZG9tKCkudG9TdHJpbmcoMzYpLnNsaWNlKDIpXG4gICAgc3RyID0gc3RyICsgTWF0aC5yYW5kb20oKS50b1N0cmluZygzNikuc2xpY2UoMilcbiAgICBzdHIuc3Vic3RyaW5nKDAsIGxlbmd0aCAtIDEpXG5cbiMgc2V0IHRoaXMgY2xhc3MgdG8gYSBnbG9iYWwgYHBsYW5pdGAgdmFyaWFibGVcbndpbmRvdy5wbGFuaXQgPSBuZXcgUGxhbml0XG5cbmNsYXNzIFBsYW5pdC5QbGFuXG5cbiAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gU2V0dXBcblxuICBjb25zdHJ1Y3RvcjogKEBjb250YWluZXIpIC0+XG4gICAgQG1hcmtlcnNDb250YWluZXIgPSBAY29udGFpbmVyLmZpbmQoXCIuI3tQbGFuaXQubWFya2VyQ29udGFpbmVyQ2xhc3N9XCIpLmZpcnN0KClcblxuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBHZXQgQWxsIE1hcmtlcnNcblxuICBnZXRBbGxNYXJrZXJzOiAoKSA9PlxuICAgIG1hcmtlcnMgPSBbXVxuICAgIGZvciBtYXJrZXIgaW4gQG1hcmtlcnNDb250YWluZXIuZmluZChcIi4je1BsYW5pdC5tYXJrZXJDbGFzc31cIilcbiAgICAgIG0gPSBuZXcgUGxhbml0Lk1hcmtlcihAY29udGFpbmVyLCAkKG1hcmtlcikuYXR0cignZGF0YS1tYXJrZXInKSlcbiAgICAgIG1hcmtlciA9XG4gICAgICAgICMgY29vcmRzOiBbbS5wb3NpdGlvbigpLmxlZnQsIG0ucG9zaXRpb24oKS50b3BdXG4gICAgICAgIGNvb3JkczogbS5wb3NpdGlvbigpXG4gICAgICAgIGRyYWdnYWJsZTogbS5pc0RyYWdnYWJsZSgpXG4gICAgICAgIGNvbG9yOiBtLmNvbG9yKClcbiAgICAgIG1hcmtlci5pbmZvYm94ID0gbS5pbmZvYm94SFRNTCgpIGlmIG0uaW5mb2JveEhUTUwoKVxuICAgICAgbWFya2Vycy5wdXNoKG0pXG4gICAgbWFya2Vyc1xuXG5jbGFzcyBQbGFuaXQuUGxhbi5FdmVudHNcblxuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBTZXR1cFxuXG4gIGNvbnN0cnVjdG9yOiAoQG9wdGlvbnMpIC0+XG5cbiAgICAjIGRlZmF1bHQgb3B0aW9uc1xuICAgIEBjb250YWluZXIgPSBAb3B0aW9ucy5jb250YWluZXJcbiAgICBAbWFya2Vyc0NvbnRhaW5lciA9IEBjb250YWluZXIuZmluZChcIi4je1BsYW5pdC5tYXJrZXJDb250YWluZXJDbGFzc31cIilcbiAgICBpZiBAY29udGFpbmVyLmZpbmQoXCIuI3tQbGFuaXQuaW1hZ2VDb250YWluZXJ9ID4gaW1nXCIpLmxlbmd0aCA+IDBcbiAgICAgIEBpbWFnZSA9IEBjb250YWluZXIuZmluZChcIi4je1BsYW5pdC5pbWFnZUNvbnRhaW5lcn0gPiBpbWdcIikuZmlyc3QoKVxuXG4gICAgIyBiaW5kIGRyYWdnYWJsZSBldmVudHNcbiAgICAkKGRvY3VtZW50KS5vbignbW91c2Vtb3ZlJywgQG1vdXNlbW92ZSlcbiAgICAkKGRvY3VtZW50KS5vbignbW91c2V1cCcsIEBtb3VzZXVwKVxuXG4gICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIFJlZnNcblxuICBtYXJrZXJzOiA9PlxuICAgIEBtYXJrZXJzQ29udGFpbmVyLmZpbmQoXCIuI3tQbGFuaXQubWFya2VyQ2xhc3N9XCIpXG5cbiAgZHJhZ2dpbmdNYXJrZXI6ID0+XG4gICAgQG1hcmtlcnNDb250YWluZXIuZmluZChcIi4je1BsYW5pdC5tYXJrZXJDbGFzc30uI3tQbGFuaXQuZHJhZ2dpbmdDbGFzc31cIilcblxuICBnZXRFdmVudFBvc2l0aW9uOiAoZSkgPT5cbiAgICAjIGNvbnRhaW5lciBkaW1lbnNpb25zXG4gICAgd0NvbnQgPSBwYXJzZUZsb2F0KEBtYXJrZXJzQ29udGFpbmVyLndpZHRoKCkpXG4gICAgaENvbnQgPSBwYXJzZUZsb2F0KEBtYXJrZXJzQ29udGFpbmVyLmhlaWdodCgpKVxuICAgICMgaWYoXG4gICAgIyAgIEBtYXJrZXJzQ29udGFpbmVyLmNzcygnYmFja2dyb3VuZEltYWdlJykgJiZcbiAgICAjICAgQG1hcmtlcnNDb250YWluZXIuY3NzKCdiYWNrZ3JvdW5kSW1hZ2UnKSAhPSAnbm9uZSdcbiAgICAjIClcbiAgICBpZiBAaW1hZ2VcbiAgICAgICMgaWYgdGhlcmUgaXMgYW4gaW1hZ2UsIHdlIG5lZWQgdG8gY2FsY3VsYXRlIHdpdGggaW1hZ2UgaW4gbWluZFxuICAgICAgeFB4ID0gZS5wYWdlWCAtIEBjb250YWluZXIub2Zmc2V0KCkubGVmdFxuICAgICAgeVB4ID0gZS5wYWdlWSAtIEBjb250YWluZXIub2Zmc2V0KCkudG9wXG4gICAgICB3SW1nID0gQGltYWdlLndpZHRoKClcbiAgICAgIGhJbWcgPSBAaW1hZ2UuaGVpZ2h0KClcbiAgICAgIHhJbWcgPSBwYXJzZUludChAaW1hZ2UuY3NzKCdsZWZ0JykpXG4gICAgICB5SW1nID0gcGFyc2VJbnQoQGltYWdlLmNzcygndG9wJykpXG4gICAgICB4UGMgPSAoKHhQeCArIE1hdGguYWJzKHhJbWcpKSAvIHdJbWcpICogMTAwXG4gICAgICB5UGMgPSAoKHlQeCArIE1hdGguYWJzKHlJbWcpKSAvIGhJbWcpICogMTAwXG4gICAgZWxzZVxuICAgICAgIyBvciB3ZSBjYW4ganVzdCBsb29rIGF0IHRoZSBjb250YWluZXJcbiAgICAgIHhQYyA9IChlLnBhZ2VYIC0gQGNvbnRhaW5lci5vZmZzZXQoKS5sZWZ0KSAvIHdDb250XG4gICAgICB5UGMgPSAgKGUucGFnZVkgLSBAY29udGFpbmVyLm9mZnNldCgpLnRvcCkgLyBoQ29udFxuICAgIFt4UGMsIHlQY11cblxuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBFdmVudHNcblxuICBtb3VzZXVwOiAoZSkgPT5cbiAgICAjIGRlYWxpbmcgd2l0aCBtYXJrZXJzLCBlc3AuIGRyYWdnaW5nIG1hcmtlcnNcbiAgICBtYXJrZXIgPSBAbWFya2Vyc0NvbnRhaW5lci5maW5kKFwiLiN7UGxhbml0LmRyYWdnaW5nQ2xhc3N9XCIpLmZpcnN0KClcbiAgICBpZiBAZHJhZ2dpbmdNYXJrZXIoKS5sZW5ndGggPiAwXG4gICAgICBtID0gbmV3IFBsYW5pdC5NYXJrZXIoQGNvbnRhaW5lciwgbWFya2VyLmF0dHIoJ2RhdGEtbWFya2VyJykpXG4gICAgICBAb3B0aW9ucy5wbGFuaXQubWFya2VyRHJhZ0VuZChlLCBtKVxuICAgICAgbS5zYXZlUG9zaXRpb24oKVxuICAgICAgbS5wb3NpdGlvbkluZm9ib3goKVxuICAgICAgQGRyYWdnaW5nTWFya2VyKCkucmVtb3ZlQ2xhc3MoUGxhbml0LmRyYWdnaW5nQ2xhc3MpXG4gICAgIyBpZiBjbGljayBpcyBvbiB0aGUgY29udGFpbmVyXG4gICAgaWYgJChlLnRhcmdldCkuaGFzQ2xhc3MoUGxhbml0Lm1hcmtlckNvbnRhaW5lckNsYXNzKVxuICAgICAgQG9wdGlvbnMucGxhbml0LmNhbnZhc0NsaWNrKGUsIEBnZXRFdmVudFBvc2l0aW9uKGUpKVxuICAgICMgaWYgY2xpY2sgaXMgb24gdGhlIG1hcmtlcnNcbiAgICBpZihcbiAgICAgICQoZS50YXJnZXQpLmhhc0NsYXNzKFBsYW5pdC5tYXJrZXJDbGFzcykgfHxcbiAgICAgICQoZS50YXJnZXQpLnBhcmVudHMoXCIuI3tQbGFuaXQubWFya2VyQ2xhc3N9XCIpLmxlbmd0aCA+IDBcbiAgICApXG4gICAgICBpZiAkKGUudGFyZ2V0KS5oYXNDbGFzcyhQbGFuaXQubWFya2VyQ2xhc3MpXG4gICAgICAgIG1hcmtlciA9ICQoZS50YXJnZXQpXG4gICAgICBlbHNlXG4gICAgICAgIG1hcmtlciA9ICQoZS50YXJnZXQpLnBhcmVudHMoXCIuI3tQbGFuaXQubWFya2VyQ2xhc3N9XCIpLmZpcnN0KClcbiAgICAgIG0gPSBuZXcgUGxhbml0Lk1hcmtlcihAY29udGFpbmVyLCBtYXJrZXIuYXR0cignZGF0YS1tYXJrZXInKSlcbiAgICAgIEBvcHRpb25zLnBsYW5pdC5tYXJrZXJDbGljayhlLCBtKVxuICAgIHRydWVcblxuICBtb3VzZW1vdmU6IChlKSA9PlxuICAgIG1hcmtlcnMgPSBAbWFya2Vyc0NvbnRhaW5lci5maW5kKFwiLiN7UGxhbml0Lm1hcmtlckNsYXNzfS4je1BsYW5pdC5kcmFnZ2luZ0NsYXNzfVwiKVxuXG4gICAgaWYgbWFya2Vycy5sZW5ndGggPiAwXG5cbiAgICAgICMgb25seSB1c2UgZmlyc3QgbWFya2VyIGluIGNhc2UgdGhlcmUgYXJlIG1vcmUgdGhhblxuICAgICAgIyBvbmUgZHJhZ2dpbmdcbiAgICAgICNcbiAgICAgIG1hcmtlciA9IG1hcmtlcnMuZmlyc3QoKVxuXG4gICAgICAjIHdlIGhpZGUgdGhlIGluZm9ib3ggd2hpbGUgZHJhZ2dpbmdcbiAgICAgICNcbiAgICAgIGlmKFxuICAgICAgICBNYXRoLmFicyhlLnBhZ2VYIC0gbWFya2VyLmF0dHIoJ2RhdGEtZHJhZy1zdGFydC14JykpID4gMCB8fFxuICAgICAgICBNYXRoLmFicyhlLnBhZ2VZIC0gbWFya2VyLmF0dHIoJ2RhdGEtZHJhZy1zdGFydC15JykpID4gMFxuICAgICAgKVxuICAgICAgICAkKFwiIyN7bWFya2VyLmF0dHIoJ2RhdGEtaW5mb2JveCcpfVwiKS5yZW1vdmVDbGFzcygnYWN0aXZlJylcblxuICAgICAgIyBjYWxjdWxhdGUgcG9zaXRpb25zXG4gICAgICAjXG4gICAgICBtb3VzZUxlZnQgICAgID0gZS5wYWdlWCAtIEBjb250YWluZXIub2Zmc2V0KCkubGVmdFxuICAgICAgbW91c2VUb3AgICAgICA9IGUucGFnZVkgLSBAY29udGFpbmVyLm9mZnNldCgpLnRvcFxuICAgICAgcGxhblJpZ2h0ICAgICA9IEBjb250YWluZXIud2lkdGgoKVxuICAgICAgcGxhbkJvdHRvbSAgICA9IEBjb250YWluZXIuaGVpZ2h0KClcbiAgICAgIG1hcmtlckxlZnQgICAgPSBtb3VzZUxlZnQgLSAobWFya2VyLm91dGVyV2lkdGgoKSAvIDIpXG4gICAgICBtYXJrZXJUb3AgICAgID0gbW91c2VUb3AgLSAobWFya2VyLm91dGVySGVpZ2h0KCkgLyAyKVxuICAgICAgbWFya2VyUmlnaHQgICA9IG1vdXNlTGVmdCArIChtYXJrZXIub3V0ZXJXaWR0aCgpIC8gMilcbiAgICAgIG1hcmtlckJvdHRvbSAgPSBtb3VzZVRvcCArIChtYXJrZXIub3V0ZXJIZWlnaHQoKSAvIDIpXG4gICAgICBtYXJrZXJXaWR0aCAgID0gbWFya2VyLm91dGVyV2lkdGgoKVxuICAgICAgbWFya2VySGVpZ2h0ICA9IG1hcmtlci5vdXRlckhlaWdodCgpXG5cbiAgICAgICMgZmluZCB0aGUgbGVmdCBwb3NpdGlvbiBvZiB0aGUgbWFya2VyIGJhc2VkIG9uXG4gICAgICAjIHBvc2l0aW9uIG9mIHRoZSBtb3VzZSByZWxhdGl2ZSB0byB0aGUgcGxhblxuICAgICAgI1xuICAgICAgaWYgbWFya2VyTGVmdCA8PSAwXG4gICAgICAgIG1hcmtlclggPSAwXG4gICAgICBlbHNlIGlmIG1hcmtlclJpZ2h0IDwgcGxhblJpZ2h0XG4gICAgICAgIG1hcmtlclggPSBtYXJrZXJMZWZ0XG4gICAgICBlbHNlXG4gICAgICAgIG1hcmtlclggPSBwbGFuUmlnaHQgLSBtYXJrZXJXaWR0aFxuXG4gICAgICAjIGZpbmQgdGhlIGxlZnQgcG9zaXRpb24gb2YgdGhlIG1hcmtlciBiYXNlZCBvblxuICAgICAgIyBwb3NpdGlvbiBvZiB0aGUgbW91c2UgcmVsYXRpdmUgdG8gdGhlIHBsYW5cbiAgICAgICNcbiAgICAgIGlmIG1hcmtlclRvcCA8PSAwXG4gICAgICAgIG1hcmtlclkgPSAwXG4gICAgICBlbHNlIGlmIG1hcmtlckJvdHRvbSA8IHBsYW5Cb3R0b21cbiAgICAgICAgbWFya2VyWSA9IG1hcmtlclRvcFxuICAgICAgZWxzZVxuICAgICAgICBtYXJrZXJZID0gcGxhbkJvdHRvbSAtIG1hcmtlckhlaWdodFxuXG4gICAgICAjIHNldCB0aGUgcG9zaXRpb24gb2YgdGhlIG1hcmtlclxuICAgICAgI1xuICAgICAgbWFya2VyLmNzc1xuICAgICAgICBsZWZ0OiBtYXJrZXJYXG4gICAgICAgIHRvcDogbWFya2VyWVxuXG5jbGFzcyBQbGFuaXQuUGxhbi5ab29tYWJsZVxuXG4gICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIFNldHVwXG5cbiAgY29uc3RydWN0b3I6IChAb3B0aW9ucykgLT5cbiAgICAjIGRlZmF1bHQgb3B0aW9uc1xuICAgIEBjb250YWluZXIgPSBAb3B0aW9ucy5jb250YWluZXJcbiAgICBAbWFya2Vyc0NvbnRhaW5lciA9IEBjb250YWluZXIuZmluZChcIi4je1BsYW5pdC5tYXJrZXJDb250YWluZXJDbGFzc31cIilcbiAgICBAaW1hZ2UgPSBAY29udGFpbmVyLmZpbmQoJ2ltZycpLmZpcnN0KClcbiAgICBAem9vbUlkID0gUGxhbml0LnJhbmRvbVN0cmluZygpXG4gICAgQG1hcmtlcnNDb250YWluZXIuYXR0cignZGF0YS16b29tLWlkJywgQHpvb21JZClcbiAgICAjIHNldCBpbml0aWFsIGJhY2tncm91bmQgY29vcmRpbmF0ZXNcbiAgICBAaW1hZ2VQb3NpdGlvbiA9XG4gICAgICBsZWZ0UHg6ICAgICAgICAgMFxuICAgICAgdG9wUHg6ICAgICAgICAgIDBcbiAgICAgIHdpZHRoOiAgICAgICAgICBAaW1hZ2Uud2lkdGgoKVxuICAgICAgaGVpZ2h0OiAgICAgICAgIEBpbWFnZS5oZWlnaHQoKVxuICAgICAgc2NhbGU6ICAgICAgICAgIDFcbiAgICAgIGluY3JlbWVudDogMC41XG4gICAgQHNldEJhY2tncm91bmQoKVxuXG4gICMgdGhpcyBvbmx5IGdldHMgcnVuIGlmIHRoZSB1c2VyIHNwZWNpZmllcyB6b29tYWJsZSAtLVxuICAjIG90aGVyd2lzZSB3ZSBhdCBsZWFzdCBoYXZlIHRoZSBjbGFzcyBpbml0aWFsaXplZFxuICAjXG4gIG5ldzogPT5cbiAgICAjIGRyYXcgdGhlIGNvbnRyb2xzIGRpbmt1c1xuICAgIEBjb250YWluZXIucHJlcGVuZCBcIlwiXCJcbiAgICAgIDxkaXYgY2xhc3M9XCJwbGFuaXQtY29udHJvbHNcIj5cbiAgICAgICAgPGEgaHJlZj1cIiNcIiBjbGFzcz1cInpvb21cIiBkYXRhLWFjdGlvbj1cImluXCI+KzwvYT5cbiAgICAgICAgPGEgaHJlZj1cIiNcIiBjbGFzcz1cInpvb21cIiBkYXRhLWFjdGlvbj1cIm91dFwiPi08L2E+XG4gICAgICA8L2Rpdj5cbiAgICBcIlwiXCJcbiAgICBAY29udGFpbmVyLmZpbmQoXCIuem9vbVtkYXRhLWFjdGlvbj0naW4nXVwiKS5jbGljayAoZSkgPT5cbiAgICAgIGUucHJldmVudERlZmF1bHQoKVxuICAgICAgQHpvb21JbigpXG4gICAgQGNvbnRhaW5lci5maW5kKFwiLnpvb21bZGF0YS1hY3Rpb249J291dCddXCIpLmNsaWNrIChlKSA9PlxuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICBAem9vbU91dCgpXG4gICAgIyBiaW5kIGRyYWdnYWJsZSBldmVudHNcbiAgICBAY29udGFpbmVyLm9uKCdkYmxjbGljaycsIEBkYmxjbGljaylcbiAgICBAY29udGFpbmVyLm9uKCdtb3VzZWRvd24nLCBAbW91c2Vkb3duKVxuICAgICQoZG9jdW1lbnQpLm9uKCdtb3VzZW1vdmUnLCBAbW91c2Vtb3ZlKVxuICAgICQoZG9jdW1lbnQpLm9uKCdtb3VzZXVwJywgQG1vdXNldXApXG5cbiAgcmVzZXRJbWFnZTogPT5cbiAgICBAaW1hZ2VQb3NpdGlvbiA9XG4gICAgICBsZWZ0UHg6ICAgICAgICAgMFxuICAgICAgdG9wUHg6ICAgICAgICAgIDBcbiAgICAgIHdpZHRoOiAgICAgICAgICBAaW1hZ2Uud2lkdGgoKVxuICAgICAgaGVpZ2h0OiAgICAgICAgIEBpbWFnZS5oZWlnaHQoKVxuICAgICAgc2NhbGU6ICAgICAgICAgIDFcbiAgICAgIGluY3JlbWVudDogMC41XG4gICAgQHNldEJhY2tncm91bmQoKVxuXG4gICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIEFjdGlvbnNcblxuICBzZXRCYWNrZ3JvdW5kOiA9PlxuICAgIEBpbWFnZS5jc3NcbiAgICAgIGxlZnQ6IFwiI3tAaW1hZ2VQb3NpdGlvbi5sZWZ0UHh9cHhcIlxuICAgICAgdG9wOiBcIiN7QGltYWdlUG9zaXRpb24udG9wUHh9cHhcIlxuICAgICAgd2lkdGg6IFwiI3tAaW1hZ2VQb3NpdGlvbi5zY2FsZSAqIDEwMC4wfSVcIlxuICAgICAgaGVpZ2h0OiAnYXV0bydcbiAgICBAc2V0TWFya2VycygpXG5cbiAgYW5pbWF0ZUJhY2tncm91bmQ6ID0+XG4gICAgQGltYWdlLmFuaW1hdGVcbiAgICAgIGxlZnQ6IFwiI3tAaW1hZ2VQb3NpdGlvbi5sZWZ0UHh9cHhcIlxuICAgICAgdG9wOiBcIiN7QGltYWdlUG9zaXRpb24udG9wUHh9cHhcIlxuICAgICAgd2lkdGg6IFwiI3tAaW1hZ2VQb3NpdGlvbi5zY2FsZSAqIDEwMC4wfSVcIlxuICAgICAgaGVpZ2h0OiAnYXV0bydcbiAgICAsIDI1MFxuICAgIEBhbmltYXRlTWFya2VycygpXG5cbiAgc2V0TWFya2VyczogPT5cbiAgICBtYXJrZXJzID0gQGNvbnRhaW5lci5maW5kKFwiLiN7UGxhbml0Lm1hcmtlckNsYXNzfVwiKVxuICAgIGlmIG1hcmtlcnMubGVuZ3RoID4gMFxuICAgICAgZm9yIG1hcmtlciBpbiBtYXJrZXJzXG4gICAgICAgIGxlZnQgPSAoQGltZ1dpZHRoKCkgKiAoJChtYXJrZXIpLmF0dHIoJ2RhdGEteFBjJykgLyAxMDApKSArXG4gICAgICAgICAgQGltYWdlUG9zaXRpb24ubGVmdFB4IC0gKCQobWFya2VyKS5vdXRlcldpZHRoKCkgLyAyKVxuICAgICAgICB0b3AgPSAoQGltZ0hlaWdodCgpICogKCQobWFya2VyKS5hdHRyKCdkYXRhLXlQYycpIC8gMTAwKSkgK1xuICAgICAgICAgIEBpbWFnZVBvc2l0aW9uLnRvcFB4IC0gKCQobWFya2VyKS5vdXRlckhlaWdodCgpIC8gMilcbiAgICAgICAgJChtYXJrZXIpLmNzc1xuICAgICAgICAgIGxlZnQ6IFwiI3tsZWZ0fXB4XCJcbiAgICAgICAgICB0b3A6IFwiI3t0b3B9cHhcIlxuICAgICAgQHBvc2l0aW9uSW5mb2JveGVzKClcblxuICBhbmltYXRlTWFya2VyczogPT5cbiAgICBtYXJrZXJzID0gQGNvbnRhaW5lci5maW5kKFwiLiN7UGxhbml0Lm1hcmtlckNsYXNzfVwiKVxuICAgIGlmIG1hcmtlcnMubGVuZ3RoID4gMFxuICAgICAgZm9yIG1hcmtlciBpbiBtYXJrZXJzXG4gICAgICAgIG0gPSBuZXcgUGxhbml0Lk1hcmtlcihAY29udGFpbmVyLCAkKG1hcmtlcikuYXR0cignZGF0YS1tYXJrZXInKSlcbiAgICAgICAgbS5oaWRlSW5mb2JveCgpXG4gICAgICAgIGxlZnQgPSAoQGltZ1dpZHRoKCkgKiAoJChtYXJrZXIpLmF0dHIoJ2RhdGEteFBjJykgLyAxMDApKSArXG4gICAgICAgICAgQGltYWdlUG9zaXRpb24ubGVmdFB4IC0gKCQobWFya2VyKS5vdXRlcldpZHRoKCkgLyAyKVxuICAgICAgICB0b3AgPSAoQGltZ0hlaWdodCgpICogKCQobWFya2VyKS5hdHRyKCdkYXRhLXlQYycpIC8gMTAwKSkgK1xuICAgICAgICAgIEBpbWFnZVBvc2l0aW9uLnRvcFB4IC0gKCQobWFya2VyKS5vdXRlckhlaWdodCgpIC8gMilcbiAgICAgICAgZG8gKG0pIC0+XG4gICAgICAgICAgJChtYXJrZXIpLmFuaW1hdGVcbiAgICAgICAgICAgIGxlZnQ6IFwiI3tsZWZ0fXB4XCJcbiAgICAgICAgICAgIHRvcDogXCIje3RvcH1weFwiXG4gICAgICAgICAgLCAyNTAsICgpID0+XG4gICAgICAgICAgICBtLnBvc2l0aW9uSW5mb2JveCgpXG4gICAgICAgICAgICBtLnVuaGlkZUluZm9ib3goKVxuXG4gIHBvc2l0aW9uSW5mb2JveGVzOiA9PlxuICAgIGZvciBtYXJrZXIgaW4gQGNvbnRhaW5lci5maW5kKFwiLiN7UGxhbml0Lm1hcmtlckNsYXNzfVwiKVxuICAgICAgbSA9IG5ldyBQbGFuaXQuTWFya2VyKEBjb250YWluZXIsICQobWFya2VyKS5hdHRyKCdkYXRhLW1hcmtlcicpKVxuICAgICAgbS5wb3NpdGlvbkluZm9ib3goKVxuICAgIHRydWVcblxuICBhbmltYXRlSW5mb2JveGVzOiA9PlxuICAgIGZvciBtYXJrZXIgaW4gQGNvbnRhaW5lci5maW5kKFwiLiN7UGxhbml0Lm1hcmtlckNsYXNzfVwiKVxuICAgICAgbSA9IG5ldyBQbGFuaXQuTWFya2VyKEBjb250YWluZXIsICQobWFya2VyKS5hdHRyKCdkYXRhLW1hcmtlcicpKVxuICAgICAgbS5hbmltYXRlSW5mb2JveCgpXG4gICAgdHJ1ZVxuXG4gIGNlbnRlck9uOiAoY29vcmRzKSA9PlxuICAgIGlmIGNvb3Jkc1swXSA+PSA1MCB0aGVuIHggPSAxMDAgLSBjb29yZHNbMF0gZWxzZSB4ID0gY29vcmRzWzBdXG4gICAgaWYgY29vcmRzWzFdID49IDUwIHRoZW4geSA9IDEwMCAtIGNvb3Jkc1sxXSBlbHNlIHkgPSBjb29yZHNbMV1cbiAgICB3TWluID0gNTAgKiAoQGNvbnRhaW5lcldpZHRoKCkgLyB4KVxuICAgIGhNaW4gPSA1MCAqIChAY29udGFpbmVySGVpZ2h0KCkgLyB5KVxuICAgICMgaGlkZXMgb3RoZXIgYWN0aXZlIGluZm9ib3hlcywgYnV0IHdpbGwgc3RpbGwgc2hvd1xuICAgICMgdGhpcyBpbmZvYm94XG4gICAgQGNvbnRhaW5lci5maW5kKFwiLiN7UGxhbml0LmluZm9ib3hDbGFzc31cIikucmVtb3ZlQ2xhc3MoJ2FjdGl2ZScpXG4gICAgIyBHZXQgb3VyIGluaXRpYWwgcG9zaXRpb25cbiAgICBAaW1hZ2VQb3NpdGlvbi5sZWZ0UHggPSAtIChcbiAgICAgIChAaW1nV2lkdGgoKSAqIChjb29yZHNbMF0gLyAxMDApKSAtIChAY29udGFpbmVyV2lkdGgoKSAvIDIpXG4gICAgKVxuICAgIEBpbWFnZVBvc2l0aW9uLnRvcFB4ID0gLSAoXG4gICAgICAoQGltZ0hlaWdodCgpICogKGNvb3Jkc1sxXSAvIDEwMCkpIC0gKEBjb250YWluZXJIZWlnaHQoKSAvIDIpXG4gICAgKVxuICAgICMga2VlcCB0aGVvcmV0aWNhbGx5IG1ha2luZyB0aGUgaW1hZ2UgYmlnZ2VyIHVudGlsIGl0IGlzXG4gICAgIyBsYXJnZSBlbm91Z2ggdG8gY2VudGVyIG9uIG91ciBwb2ludFxuICAgIHdoaWxlIChAaW1nV2lkdGgoKSA8IHdNaW4pIHx8IChAaW1nSGVpZ2h0KCkgPCBoTWluKVxuICAgICAgQGltYWdlUG9zaXRpb24uc2NhbGUgID0gQGltYWdlUG9zaXRpb24uc2NhbGUgKyBAaW1hZ2VQb3NpdGlvbi5pbmNyZW1lbnRcbiAgICAgIEBpbWFnZVBvc2l0aW9uLmxlZnRQeCA9IC0gKFxuICAgICAgICAoQGltZ1dpZHRoKCkgKiAoY29vcmRzWzBdIC8gMTAwKSkgLSAoQGNvbnRhaW5lcldpZHRoKCkgLyAyKVxuICAgICAgKVxuICAgICAgQGltYWdlUG9zaXRpb24udG9wUHggPSAtIChcbiAgICAgICAgKEBpbWdIZWlnaHQoKSAqIChjb29yZHNbMV0gLyAxMDApKSAtIChAY29udGFpbmVySGVpZ2h0KCkgLyAyKVxuICAgICAgKVxuICAgIEBhbmltYXRlQmFja2dyb3VuZCgpXG5cbiAgem9vbVRvOiAobGV2ZWwpID0+XG4gICAgaSA9IEBpbWFnZVBvc2l0aW9uLmluY3JlbWVudFxuICAgIHVubGVzcyAoKGxldmVsICogaSkgKyAxKSA9PSBAaW1hZ2VQb3NpdGlvbi5zY2FsZVxuICAgICAgQGltYWdlUG9zaXRpb24uc2NhbGUgPSAobGV2ZWwgKiBpKSArIDEgKyBpXG4gICAgICBAem9vbU91dCgpXG5cbiAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gQ2FsY3VsYXRpb25zXG5cbiAgIyAtLS0tLS0tLS0tIEltYWdlIFdpZHRoXG5cbiAgaW1nV2lkdGg6ID0+XG4gICAgcGFyc2VGbG9hdChAaW1hZ2VQb3NpdGlvbi53aWR0aCAqIEBpbWFnZVBvc2l0aW9uLnNjYWxlKVxuXG4gIHRtcEltZ1dpZHRoOiA9PlxuICAgICgxICsgQGltYWdlUG9zaXRpb24uaW5jcmVtZW50KSAqIEBpbWFnZVBvc2l0aW9uLndpZHRoKClcblxuICBpbWdXaWR0aENsaWNrSW5jcmVtZW50OiA9PlxuICAgIHBhcnNlRmxvYXQoQGltYWdlUG9zaXRpb24ud2lkdGggKiBAaW1hZ2VQb3NpdGlvbi5pbmNyZW1lbnQpXG5cbiAgaW1nV2lkdGhTY3JvbGxJbmNyZW1lbnQ6ID0+XG4gICAgcGFyc2VGbG9hdChAaW1hZ2VQb3NpdGlvbi53aWR0aCAqIEBpbWFnZVBvc2l0aW9uLnNjcm9sbEluY3JlbWVudClcblxuICBjb250YWluZXJXaWR0aDogPT5cbiAgICBwYXJzZUZsb2F0KEBtYXJrZXJzQ29udGFpbmVyLndpZHRoKCkpXG5cbiAgIyAtLS0tLS0tLS0tIExlZnQgLyBSaWdodFxuXG4gIGltZ09mZnNldExlZnQ6ID0+XG4gICAgTWF0aC5hYnMocGFyc2VGbG9hdChAaW1hZ2UuY3NzKCdsZWZ0JykpKVxuXG4gICMgLS0tLS0tLS0tLSBIZWlnaHRcblxuICBpbWdIZWlnaHQ6ID0+XG4gICAgcGFyc2VGbG9hdChAaW1hZ2VQb3NpdGlvbi5oZWlnaHQgKiBAaW1hZ2VQb3NpdGlvbi5zY2FsZSlcblxuICB0bXBJbWdIZWlnaHQ6ID0+XG4gICAgKDEgKyBAaW1hZ2VQb3NpdGlvbi5pbmNyZW1lbnQpICogQGltYWdlUG9zaXRpb24uaGVpZ2h0KClcblxuICBpbWdIZWlnaHRDbGlja0luY3JlbWVudDogPT5cbiAgICBwYXJzZUZsb2F0KEBpbWFnZVBvc2l0aW9uLmhlaWdodCAqIEBpbWFnZVBvc2l0aW9uLmluY3JlbWVudClcblxuICBpbWdIZWlnaHRTY3JvbGxJbmNyZW1lbnQ6ID0+XG4gICAgcGFyc2VGbG9hdChAaW1hZ2VQb3NpdGlvbi5oZWlnaHQgKiBAaW1hZ2VQb3NpdGlvbi5zY3JvbGxJbmNyZW1lbnQpXG5cbiAgY29udGFpbmVySGVpZ2h0OiA9PlxuICAgIHBhcnNlRmxvYXQoQG1hcmtlcnNDb250YWluZXIuaGVpZ2h0KCkpXG5cbiAgIyAtLS0tLS0tLS0tIFRvcCAvIEJvdHRvbVxuXG4gIGltZ09mZnNldFRvcDogPT5cbiAgICBNYXRoLmFicyhwYXJzZUZsb2F0KEBpbWFnZS5jc3MoJ3RvcCcpKSlcblxuICAjIC0tLS0tLS0tLS0gT3RoZXJcblxuICBnZXRFdmVudENvbnRhaW5lclBvc2l0aW9uOiAoZSkgPT5cbiAgICBsZWZ0OiAoZS5wYWdlWCAtIEBjb250YWluZXIub2Zmc2V0KCkubGVmdCkgLyBAY29udGFpbmVyV2lkdGgoKVxuICAgIHRvcDogIChlLnBhZ2VZIC0gQGNvbnRhaW5lci5vZmZzZXQoKS50b3ApIC8gQGNvbnRhaW5lckhlaWdodCgpXG5cbiAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gRXZlbnRzXG5cbiAgZGJsY2xpY2s6IChlKSA9PlxuICAgIGlmICQoZS50YXJnZXQpLmF0dHIoJ2RhdGEtem9vbS1pZCcpID09IEB6b29tSWRcbiAgICAgIGNsaWNrID0gQGdldEV2ZW50Q29udGFpbmVyUG9zaXRpb24oZSlcbiAgICAgIEB6b29tSW4oJ2NsaWNrJywgY2xpY2subGVmdCwgY2xpY2sudG9wKVxuXG4gIG1vdXNlZG93bjogKGUpID0+XG4gICAgaWYgJChlLnRhcmdldCkuYXR0cignZGF0YS16b29tLWlkJykgPT0gQHpvb21JZCAmJiBlLndoaWNoID09IDFcbiAgICAgIEBpc0RyYWdnaW5nID0gdHJ1ZVxuICAgICAgY29vcmRzID0gQGdldEV2ZW50Q29udGFpbmVyUG9zaXRpb24oZSlcbiAgICAgIEBkcmFnQ29vcmRzID1cbiAgICAgICAgcG9pbnRSZWY6IGNvb3Jkc1xuICAgICAgICBpbWdSZWY6XG4gICAgICAgICAgbGVmdDogMCAtIEBpbWdPZmZzZXRMZWZ0KClcbiAgICAgICAgICB0b3A6IDAgLSBAaW1nT2Zmc2V0VG9wKClcbiAgICAgICAgbWF4OlxuICAgICAgICAgIHJpZ2h0OiAoY29vcmRzLmxlZnQgKiBAY29udGFpbmVyV2lkdGgoKSkgKyBAaW1nT2Zmc2V0TGVmdCgpXG4gICAgICAgICAgbGVmdDogKGNvb3Jkcy5sZWZ0ICogQGNvbnRhaW5lcldpZHRoKCkpIC0gKEBpbWdXaWR0aCgpIC1cbiAgICAgICAgICAgICAgICAgICAgICAoQGNvbnRhaW5lcldpZHRoKCkgKyBAaW1nT2Zmc2V0TGVmdCgpKSlcbiAgICAgICAgICBib3R0b206IChjb29yZHMudG9wICogQGNvbnRhaW5lckhlaWdodCgpKSArIEBpbWdPZmZzZXRUb3AoKVxuICAgICAgICAgIHRvcDogKGNvb3Jkcy50b3AgKiBAY29udGFpbmVySGVpZ2h0KCkpIC0gKEBpbWdIZWlnaHQoKSAtXG4gICAgICAgICAgICAgICAgICAgICAgKEBjb250YWluZXJIZWlnaHQoKSArIEBpbWdPZmZzZXRUb3AoKSkpXG4gICAgdHJ1ZVxuXG4gIG1vdXNlbW92ZTogKGUpID0+XG4gICAgaWYgQGlzRHJhZ2dpbmdcbiAgICAgIGNvb3JkcyA9IEBnZXRFdmVudENvbnRhaW5lclBvc2l0aW9uKGUpXG4gICAgICBkcmFnTGVmdCA9IGNvb3Jkcy5sZWZ0ICogQGNvbnRhaW5lcldpZHRoKClcbiAgICAgIGRyYWdUb3AgPSBjb29yZHMudG9wICogQGNvbnRhaW5lckhlaWdodCgpXG4gICAgICBpZiBkcmFnTGVmdCA+PSBAZHJhZ0Nvb3Jkcy5tYXgubGVmdCAmJiBkcmFnTGVmdCA8PSBAZHJhZ0Nvb3Jkcy5tYXgucmlnaHRcbiAgICAgICAgbGVmdCA9IChjb29yZHMubGVmdCAtIEBkcmFnQ29vcmRzLnBvaW50UmVmLmxlZnQpICogQGNvbnRhaW5lcldpZHRoKClcbiAgICAgICAgQGltYWdlUG9zaXRpb24ubGVmdFB4ID0gQGRyYWdDb29yZHMuaW1nUmVmLmxlZnQgKyBsZWZ0XG4gICAgICBlbHNlIGlmIGRyYWdMZWZ0IDwgQGRyYWdDb29yZHMubWF4LmxlZnRcbiAgICAgICAgQGltYWdlUG9zaXRpb24ubGVmdFB4ID0gQGNvbnRhaW5lcldpZHRoKCkgLSBAaW1nV2lkdGgoKVxuICAgICAgZWxzZSBpZiBkcmFnTGVmdCA+IEBkcmFnQ29vcmRzLm1heC5yaWdodFxuICAgICAgICBAaW1hZ2VQb3NpdGlvbi5sZWZ0UHggPSAwXG4gICAgICBpZiBkcmFnVG9wID49IEBkcmFnQ29vcmRzLm1heC50b3AgJiYgZHJhZ1RvcCA8PSBAZHJhZ0Nvb3Jkcy5tYXguYm90dG9tXG4gICAgICAgIHRvcCA9IChjb29yZHMudG9wIC0gQGRyYWdDb29yZHMucG9pbnRSZWYudG9wKSAqIEBjb250YWluZXJIZWlnaHQoKVxuICAgICAgICBAaW1hZ2VQb3NpdGlvbi50b3BQeCA9IEBkcmFnQ29vcmRzLmltZ1JlZi50b3AgKyB0b3BcbiAgICAgIGVsc2UgaWYgZHJhZ1RvcCA8IEBkcmFnQ29vcmRzLm1heC50b3BcbiAgICAgICAgQGltYWdlUG9zaXRpb24udG9wUHggPSBAY29udGFpbmVySGVpZ2h0KCkgLSBAaW1nSGVpZ2h0KClcbiAgICAgIGVsc2UgaWYgZHJhZ1RvcCA+IEBkcmFnQ29vcmRzLm1heC5ib3R0b21cbiAgICAgICAgQGltYWdlUG9zaXRpb24udG9wUHggPSAwXG4gICAgICBAc2V0QmFja2dyb3VuZCgpXG4gICAgdHJ1ZVxuXG4gIG1vdXNldXA6IChlKSA9PlxuICAgIEBpc0RyYWdnaW5nID0gZmFsc2VcbiAgICBAcG9zaXRpb25JbmZvYm94ZXMoKVxuICAgIHRydWVcblxuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBab29taW5nXG5cbiAgem9vbUluOiA9PlxuICAgIEBpbWFnZVBvc2l0aW9uLnNjYWxlICA9IEBpbWFnZVBvc2l0aW9uLnNjYWxlICsgQGltYWdlUG9zaXRpb24uaW5jcmVtZW50XG4gICAgQGltYWdlUG9zaXRpb24ubGVmdFB4ID0gLSBAaW1nT2Zmc2V0TGVmdCgpIC0gKEBpbWdXaWR0aENsaWNrSW5jcmVtZW50KCkgLyAyKVxuICAgIEBpbWFnZVBvc2l0aW9uLnRvcFB4ICA9IC0gQGltZ09mZnNldFRvcCgpIC0gKEBpbWdIZWlnaHRDbGlja0luY3JlbWVudCgpIC8gMilcbiAgICBAYW5pbWF0ZUJhY2tncm91bmQoKVxuXG4gIHpvb21PdXQ6ICgpID0+XG4gICAgaWYgQGltYWdlUG9zaXRpb24uc2NhbGUgPiAxXG4gICAgICBAaW1hZ2VQb3NpdGlvbi5zY2FsZSAgPSBAaW1hZ2VQb3NpdGlvbi5zY2FsZSAtIEBpbWFnZVBvc2l0aW9uLmluY3JlbWVudFxuICAgICAgbGVmdFB4ID0gLSBAaW1nT2Zmc2V0TGVmdCgpICsgKEBpbWdXaWR0aENsaWNrSW5jcmVtZW50KCkgLyAyKVxuICAgICAgdG9wUHggID0gLSBAaW1nT2Zmc2V0VG9wKCkgKyAoQGltZ0hlaWdodENsaWNrSW5jcmVtZW50KCkgLyAyKVxuICAgICAgaWYgbGVmdFB4ID4gMFxuICAgICAgICBAaW1hZ2VQb3NpdGlvbi5sZWZ0UHggPSAwXG4gICAgICBlbHNlIGlmIGxlZnRQeCA8IEBjb250YWluZXJXaWR0aCgpIC0gQGltZ1dpZHRoKClcbiAgICAgICAgQGltYWdlUG9zaXRpb24ubGVmdFB4ID0gQGNvbnRhaW5lcldpZHRoKCkgLSBAaW1nV2lkdGgoKVxuICAgICAgZWxzZVxuICAgICAgICBAaW1hZ2VQb3NpdGlvbi5sZWZ0UHggPSBsZWZ0UHhcbiAgICAgIGlmIHRvcFB4ID4gMFxuICAgICAgICBAaW1hZ2VQb3NpdGlvbi50b3BQeCA9IDBcbiAgICAgIGVsc2UgaWYgdG9wUHggPCBAY29udGFpbmVySGVpZ2h0KCkgLSBAaW1nSGVpZ2h0KClcbiAgICAgICAgQGltYWdlUG9zaXRpb24udG9wUHggPSBAY29udGFpbmVySGVpZ2h0KCkgLSBAaW1nSGVpZ2h0KClcbiAgICAgIGVsc2VcbiAgICAgICAgQGltYWdlUG9zaXRpb24udG9wUHggPSB0b3BQeFxuICAgICAgQGFuaW1hdGVCYWNrZ3JvdW5kKClcblxuY2xhc3MgUGxhbml0Lk1hcmtlclxuXG4gIGNvbnN0cnVjdG9yOiAoQGNvbnRhaW5lciwgaWQpIC0+XG5cbiAgICAjIFNldCBPcHRpb25zXG4gICAgQG1hcmtlcnNDb250YWluZXIgPSBAY29udGFpbmVyLmZpbmQoXCIuI3tQbGFuaXQubWFya2VyQ29udGFpbmVyQ2xhc3N9XCIpXG4gICAgaWYgQGNvbnRhaW5lci5maW5kKFwiLiN7UGxhbml0LmltYWdlQ29udGFpbmVyfSA+IGltZ1wiKS5sZW5ndGggPiAwXG4gICAgICBAaW1hZ2UgPSBAY29udGFpbmVyLmZpbmQoXCIuI3tQbGFuaXQuaW1hZ2VDb250YWluZXJ9ID4gaW1nXCIpLmZpcnN0KClcblxuICAgICMgRmluZCBNYXJrZXJcbiAgICBAbWFya2VyID0gQG1hcmtlcnNDb250YWluZXIuZmluZChcbiAgICAgIFwiLiN7UGxhbml0Lm1hcmtlckNsYXNzfVtkYXRhLW1hcmtlcj0nI3tpZH0nXVwiXG4gICAgKS5maXJzdCgpXG5cbiAgICAjIFJldHVybiB0aGlzXG4gICAgQFxuXG4gICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIENhbGN1bGF0aW9uc1xuXG4gIHBvc2l0aW9uOiA9PlxuICAgIHhQeCA9IEBtYXJrZXIucG9zaXRpb24oKS5sZWZ0ICsgKEBtYXJrZXIub3V0ZXJXaWR0aCgpIC8gMilcbiAgICB5UHggPSBAbWFya2VyLnBvc2l0aW9uKCkudG9wICsgKEBtYXJrZXIub3V0ZXJIZWlnaHQoKSAvIDIpXG4gICAgaWYgQGltYWdlXG4gICAgICB3SW1nID0gQGltYWdlLndpZHRoKClcbiAgICAgIGhJbWcgPSBAaW1hZ2UuaGVpZ2h0KClcbiAgICAgIHhJbWcgPSBwYXJzZUludChAaW1hZ2UuY3NzKCdsZWZ0JykpXG4gICAgICB5SW1nID0gcGFyc2VJbnQoQGltYWdlLmNzcygndG9wJykpXG4gICAgICB4UGMgPSAoKHhQeCArIE1hdGguYWJzKHhJbWcpKSAvIHdJbWcpICogMTAwXG4gICAgICB5UGMgPSAoKHlQeCArIE1hdGguYWJzKHlJbWcpKSAvIGhJbWcpICogMTAwXG4gICAgZWxzZVxuICAgICAgeFBjID0gKHhQeCAvIEBjb250YWluZXIud2lkdGgoKSkgKiAxMDBcbiAgICAgIHlQYyA9ICh5UHggLyBAY29udGFpbmVyLmhlaWdodCgpKSAqIDEwMFxuICAgIFt4UGMsIHlQY11cblxuICByZWxhdGl2ZVBvc2l0aW9uOiA9PlxuICAgIHhQeCA9IEBtYXJrZXIucG9zaXRpb24oKS5sZWZ0ICsgKEBtYXJrZXIub3V0ZXJXaWR0aCgpIC8gMilcbiAgICB5UHggPSBAbWFya2VyLnBvc2l0aW9uKCkudG9wICsgKEBtYXJrZXIub3V0ZXJIZWlnaHQoKSAvIDIpXG4gICAgeFBjID0gKHhQeCAvIEBjb250YWluZXIud2lkdGgoKSkgKiAxMDBcbiAgICB5UGMgPSAoeVB4IC8gQGNvbnRhaW5lci5oZWlnaHQoKSkgKiAxMDBcbiAgICBbeFBjLCB5UGNdXG5cbiAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gQXR0cmlidXRlc1xuXG4gIGNvbG9yOiA9PlxuICAgIEBtYXJrZXIuY3NzKCdiYWNrZ3JvdW5kQ29sb3InKVxuXG4gIHBsYW5pdElEOiA9PlxuICAgIEBtYXJrZXIuYXR0cignZGF0YS1tYXJrZXInKVxuXG4gIGlkOiA9PlxuICAgIEBtYXJrZXIuYXR0cignZGF0YS1pZCcpXG5cbiAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gSW5mb2JveFxuXG4gIGluZm9ib3g6ID0+XG4gICAgaW5mb2JveCA9IEBjb250YWluZXIuZmluZChcIiMje0BtYXJrZXIuYXR0cignZGF0YS1pbmZvYm94Jyl9XCIpXG4gICAgaWYgaW5mb2JveC5sZW5ndGggPiAwIHRoZW4gaW5mb2JveCBlbHNlIG51bGxcblxuICBpbmZvYm94SFRNTDogPT5cbiAgICBpZiBAaW5mb2JveCgpICYmIEBpbmZvYm94KCkubGVuZ3RoID4gMCB0aGVuIEBpbmZvYm94KCkuaHRtbCgpIGVsc2UgbnVsbFxuXG4gIGluZm9ib3hWaXNpYmxlOiA9PlxuICAgIEBpbmZvYm94KCkgJiYgQGluZm9ib3goKS5oYXNDbGFzcygnYWN0aXZlJylcblxuICBoaWRlSW5mb2JveDogPT5cbiAgICBAaW5mb2JveCgpLmFkZENsYXNzKCdoaWRkZW4nKSBpZiBAaW5mb2JveFZpc2libGUoKVxuXG4gIHNob3dJbmZvYm94OiA9PlxuICAgIEBpbmZvYm94KCkuYWRkQ2xhc3MoJ2FjdGl2ZScpIGlmIEBpbmZvYm94KCkgJiYgIUBpbmZvYm94VmlzaWJsZSgpXG4gICAgQHVuaGlkZUluZm9ib3goKVxuXG4gIHVuaGlkZUluZm9ib3g6ID0+XG4gICAgQGluZm9ib3goKS5yZW1vdmVDbGFzcygnaGlkZGVuJykgaWYgQGluZm9ib3hWaXNpYmxlKClcblxuICBpbmZvYm94Q29vcmRzOiA9PlxuICAgIGluZm9ib3ggPSAkKFwiIyN7QG1hcmtlci5hdHRyKCdkYXRhLWluZm9ib3gnKX1cIilcbiAgICBtYXJrZXJDZW50ZXJYID0gKHBhcnNlRmxvYXQoQHJlbGF0aXZlUG9zaXRpb24oKVswXSAvIDEwMCkgKiBAY29udGFpbmVyLndpZHRoKCkpXG4gICAgbWFya2VyQ2VudGVyWSA9IChwYXJzZUZsb2F0KEByZWxhdGl2ZVBvc2l0aW9uKClbMV0gLyAxMDApICogQGNvbnRhaW5lci5oZWlnaHQoKSlcbiAgICBpV2lkdGggPSBpbmZvYm94Lm91dGVyV2lkdGgoKVxuICAgIGlIYWxmV2lkdGggPSBpV2lkdGggLyAyXG4gICAgaUhlaWdodCA9IGluZm9ib3gub3V0ZXJIZWlnaHQoKVxuICAgIGlIYWxmSGVpZ2h0ID0gaUhlaWdodCAvIDJcbiAgICBjV2lkdGggPSBAY29udGFpbmVyLndpZHRoKClcbiAgICBjSGVpZ2h0ID0gQGNvbnRhaW5lci5oZWlnaHQoKVxuICAgIG1XaWR0aCA9IEBtYXJrZXIub3V0ZXJXaWR0aCgpXG4gICAgbUhhbGZXaWR0aCA9IG1XaWR0aCAvIDJcbiAgICBtSGVpZ2h0ID0gQG1hcmtlci5vdXRlckhlaWdodCgpXG4gICAgbUhhbGZIZWlnaHQgPSBtSGVpZ2h0IC8gMlxuICAgIGJ1ZmZlciA9IDVcbiAgICBvZmZzZXRYID0gcGFyc2VJbnQoaW5mb2JveC5hdHRyKCdkYXRhLW9mZnNldC14JykpXG4gICAgb2Zmc2V0WCA9IDAgdW5sZXNzIG9mZnNldFhcbiAgICBvZmZzZXRZID0gcGFyc2VJbnQoaW5mb2JveC5hdHRyKCdkYXRhLW9mZnNldC15JykpXG4gICAgb2Zmc2V0WSA9IDAgdW5sZXNzIG9mZnNldFlcbiAgICBzd2l0Y2ggaW5mb2JveC5hdHRyKCdkYXRhLXBvc2l0aW9uJylcbiAgICAgIHdoZW4gJ3RvcCdcbiAgICAgICAgaW5mb0xlZnQgPSBtYXJrZXJDZW50ZXJYIC0gaUhhbGZXaWR0aFxuICAgICAgICBpbmZvVG9wID0gbWFya2VyQ2VudGVyWSAtIGlIZWlnaHQgLSBtSGFsZkhlaWdodCAtIGJ1ZmZlclxuICAgICAgd2hlbiAncmlnaHQnXG4gICAgICAgIGluZm9MZWZ0ID0gbWFya2VyQ2VudGVyWCArIG1IYWxmV2lkdGggKyBidWZmZXJcbiAgICAgICAgaW5mb1RvcCA9IG1hcmtlckNlbnRlclkgLSBpSGFsZkhlaWdodFxuICAgICAgd2hlbiAnYm90dG9tJ1xuICAgICAgICBpbmZvTGVmdCA9IG1hcmtlckNlbnRlclggLSBpSGFsZldpZHRoXG4gICAgICAgIGluZm9Ub3AgPSBtYXJrZXJDZW50ZXJZICsgbUhhbGZIZWlnaHQgKyBidWZmZXJcbiAgICAgIHdoZW4gJ2xlZnQnXG4gICAgICAgIGluZm9MZWZ0ID0gbWFya2VyQ2VudGVyWCAtIGlXaWR0aCAtIG1IYWxmV2lkdGggLSBidWZmZXJcbiAgICAgICAgaW5mb1RvcCA9IG1hcmtlckNlbnRlclkgLSBpSGFsZkhlaWdodFxuICAgICAgd2hlbiAndG9wLWxlZnQnXG4gICAgICAgIGluZm9MZWZ0ID0gbWFya2VyQ2VudGVyWCAtIGlXaWR0aCAtIG1IYWxmV2lkdGggKyBidWZmZXJcbiAgICAgICAgaW5mb1RvcCA9IG1hcmtlckNlbnRlclkgLSBpSGVpZ2h0IC0gbUhhbGZIZWlnaHQgKyBidWZmZXJcbiAgICAgIHdoZW4gJ3RvcC1yaWdodCdcbiAgICAgICAgaW5mb0xlZnQgPSBtYXJrZXJDZW50ZXJYICsgbUhhbGZXaWR0aCAtIGJ1ZmZlclxuICAgICAgICBpbmZvVG9wID0gbWFya2VyQ2VudGVyWSAtIGlIZWlnaHQgLSBtSGFsZkhlaWdodCArIGJ1ZmZlclxuICAgICAgd2hlbiAnYm90dG9tLWxlZnQnXG4gICAgICAgIGluZm9MZWZ0ID0gbWFya2VyQ2VudGVyWCAtIGlXaWR0aCAtIG1IYWxmV2lkdGggKyBidWZmZXJcbiAgICAgICAgaW5mb1RvcCA9IG1hcmtlckNlbnRlclkgKyBtSGFsZkhlaWdodCAtIGJ1ZmZlclxuICAgICAgd2hlbiAnYm90dG9tLXJpZ2h0J1xuICAgICAgICBpbmZvTGVmdCA9IG1hcmtlckNlbnRlclggKyBtSGFsZldpZHRoIC0gYnVmZmVyXG4gICAgICAgIGluZm9Ub3AgPSBtYXJrZXJDZW50ZXJZICsgbUhhbGZIZWlnaHQgLSBidWZmZXJcbiAgICBsZWZ0OiBpbmZvTGVmdCArIG9mZnNldFhcbiAgICB0b3A6IGluZm9Ub3AgKyBvZmZzZXRZXG5cbiAgcG9zaXRpb25JbmZvYm94OiA9PlxuICAgIGNvb3JkcyA9IEBpbmZvYm94Q29vcmRzKClcbiAgICAkKFwiIyN7QG1hcmtlci5hdHRyKCdkYXRhLWluZm9ib3gnKX1cIikuY3NzXG4gICAgICBsZWZ0OiBcIiN7Y29vcmRzLmxlZnR9cHhcIlxuICAgICAgdG9wOiBcIiN7Y29vcmRzLnRvcH1weFwiXG4gICAgQHBvc2l0aW9uKClcblxuICBhbmltYXRlSW5mb2JveDogPT5cbiAgICBjb29yZHMgPSBAaW5mb2JveENvb3JkcygpXG4gICAgJChcIiMje0BtYXJrZXIuYXR0cignZGF0YS1pbmZvYm94Jyl9XCIpLmFuaW1hdGVcbiAgICAgIGxlZnQ6IFwiI3tjb29yZHMubGVmdH1weFwiXG4gICAgICB0b3A6IFwiI3tjb29yZHMudG9wfXB4XCJcbiAgICAsIDI1MCwgKCkgPT5cbiAgICAgIHJldHVybiBAcG9zaXRpb24oKVxuXG4gICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIERyYWdnaW5nXG5cbiAgaXNEcmFnZ2FibGU6ID0+XG4gICAgQG1hcmtlci5oYXNDbGFzcygnZHJhZ2dhYmxlJylcblxuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBBY3Rpb25zXG5cbiAgc2V0OiA9PlxuICAgIGxlZnQgPSAoQGltYWdlLndpZHRoKCkgKiAoQG1hcmtlci5hdHRyKCdkYXRhLXhQYycpIC8gMTAwKSkgK1xuICAgICAgcGFyc2VGbG9hdChAaW1hZ2UuY3NzKCdsZWZ0JykpIC0gKEBtYXJrZXIub3V0ZXJXaWR0aCgpIC8gMilcbiAgICB0b3AgPSAoQGltYWdlLmhlaWdodCgpICogKEBtYXJrZXIuYXR0cignZGF0YS15UGMnKSAvIDEwMCkpICtcbiAgICAgIHBhcnNlRmxvYXQoQGltYWdlLmNzcygndG9wJykpIC0gKEBtYXJrZXIub3V0ZXJIZWlnaHQoKSAvIDIpXG4gICAgQG1hcmtlci5jc3NcbiAgICAgIGxlZnQ6IFwiI3tsZWZ0fXB4XCJcbiAgICAgIHRvcDogXCIje3RvcH1weFwiXG4gICAgQHBvc2l0aW9uSW5mb2JveCgpXG4gICAgW2xlZnQsIHRvcF1cblxuICBzYXZlUG9zaXRpb246ID0+XG4gICAgY29vcmRzID0gQHBvc2l0aW9uKClcbiAgICBAbWFya2VyLmF0dHJcbiAgICAgICdkYXRhLXhQYyc6IGNvb3Jkc1swXVxuICAgICAgJ2RhdGEteVBjJzogY29vcmRzWzFdXG5cbiAgdXBkYXRlOiAob3B0aW9ucykgPT5cbiAgICBpZiBvcHRpb25zLmNvbG9yXG4gICAgICBAbWFya2VyLmNzcyhiYWNrZ3JvdW5kQ29sb3I6IG9wdGlvbnMuY29sb3IpXG4gICAgaWYgb3B0aW9ucy5pbmZvYm94XG4gICAgICBAbWFya2VyLmZpbmQoXCIuI3tQbGFuaXQuaW5mb2JveENsYXNzfVwiKS5odG1sKG9wdGlvbnMuaW5mb2JveClcbiAgICAgIEBwb3NpdGlvbkluZm9ib3goKVxuICAgIGlmIG9wdGlvbnMuZHJhZ2dhYmxlXG4gICAgICBAbWFya2VyLnJlbW92ZUNsYXNzKCdkcmFnZ2FibGUnKVxuICAgICAgQG1hcmtlci5hZGRDbGFzcygnZHJhZ2dhYmxlJykgaWYgb3B0aW9ucy5kcmFnZ2FibGUgPT0gdHJ1ZVxuICAgIGlmIG9wdGlvbnMuY29vcmRzXG4gICAgICBsZWZ0ID0gKChwYXJzZUZsb2F0KG9wdGlvbnMuY29vcmRzWzBdKSAvIDEwMCkgKiBAY29udGFpbmVyLndpZHRoKCkpIC0gMTVcbiAgICAgIHRvcCA9ICgocGFyc2VGbG9hdChvcHRpb25zLmNvb3Jkc1sxXSkgLyAxMDApICogQGNvbnRhaW5lci5oZWlnaHQoKSkgLSAxNVxuICAgICAgQG1hcmtlci5jc3NcbiAgICAgICAgbGVmdDogXCIje2xlZnR9cHhcIlxuICAgICAgICB0b3A6IFwiI3t0b3B9cHhcIlxuXG4gIHJlbW92ZTogPT5cbiAgICBAaW5mb2JveCgpLnJlbW92ZSgpIGlmIEBpbmZvYm94KClcbiAgICBAbWFya2VyLnJlbW92ZSgpXG5cbmNsYXNzIFBsYW5pdC5NYXJrZXIuRXZlbnRzXG5cbiAgY29uc3RydWN0b3I6IChAb3B0aW9ucykgLT5cblxuICAgICMgU2V0IE9wdGlvbnNcbiAgICBAY29udGFpbmVyID0gQG9wdGlvbnMuY29udGFpbmVyXG4gICAgQG1hcmtlcnNDb250YWluZXIgPSBAY29udGFpbmVyLmZpbmQoXCIuI3tQbGFuaXQubWFya2VyQ29udGFpbmVyQ2xhc3N9XCIpXG5cbiAgICAjIEZpbmQgTWFya2VyXG4gICAgQG1hcmtlciA9IEBtYXJrZXJzQ29udGFpbmVyLmZpbmQoXG4gICAgICBcIi4je1BsYW5pdC5tYXJrZXJDbGFzc31bZGF0YS1tYXJrZXI9JyN7QG9wdGlvbnMucGxhbml0SUR9J11cIlxuICAgICkuZmlyc3QoKVxuICAgIEBtYXJrZXJPYmogPSBuZXcgUGxhbml0Lk1hcmtlcihAY29udGFpbmVyLCBAb3B0aW9ucy5wbGFuaXRJRClcblxuICAgICMgRHJhZ2dhYmxlXG4gICAgaWYgQG9wdGlvbnMuZHJhZ2dhYmxlXG4gICAgICBAbWFya2VyLmFkZENsYXNzKCdkcmFnZ2FibGUnKVxuICAgICAgQG1hcmtlci5vbiAnbW91c2Vkb3duJywgKGUpID0+XG4gICAgICAgIGlmIGUud2hpY2ggPT0gMVxuICAgICAgICAgIG1hcmtlciA9ICQoZS50YXJnZXQpLmNsb3Nlc3QoXCIuI3tQbGFuaXQubWFya2VyQ2xhc3N9XCIpXG4gICAgICAgICAgbWFya2VyLmFkZENsYXNzKFBsYW5pdC5kcmFnZ2luZ0NsYXNzKVxuICAgICAgICAgIG1hcmtlci5hdHRyXG4gICAgICAgICAgICAnZGF0YS1kcmFnLXN0YXJ0LXgnOiBlLnBhZ2VYXG4gICAgICAgICAgICAnZGF0YS1kcmFnLXN0YXJ0LXknOiBlLnBhZ2VZXG5cbiAgICAjIEluZm9ib3hcbiAgICBpZiBAb3B0aW9ucy5pbmZvYm94XG4gICAgICBpZCA9IFBsYW5pdC5yYW5kb21TdHJpbmcoMTYpXG4gICAgICAjIHNldCBzdHlsZSBvcHRpb25zIG9uIGluZm9ib3hcbiAgICAgIG9wdGlvbnMgPSBAb3B0aW9ucy5pbmZvYm94XG4gICAgICBpZiBvcHRpb25zLnBvc2l0aW9uIHRoZW4gcG9zaXRpb24gPSBvcHRpb25zLnBvc2l0aW9uIGVsc2UgcG9zaXRpb24gPSAndG9wJ1xuICAgICAgaWYgb3B0aW9ucy5hcnJvdyB0aGVuIGFycm93ID0gdHJ1ZSBlbHNlIGFycm93ID0gZmFsc2VcbiAgICAgIGlmIGFycm93ID09IHRydWUgdGhlbiBhcnJvd0NsYXNzID0gJ2Fycm93JyBlbHNlIGFycm93Q2xhc3MgPSAnJ1xuICAgICAgY2xhc3NlcyA9IFwiI3tQbGFuaXQuaW5mb2JveENsYXNzfSAje3Bvc2l0aW9ufSAje2Fycm93Q2xhc3N9XCJcbiAgICAgIEBjb250YWluZXIuZmluZChcIi4je1BsYW5pdC5pbmZvYm94Q29udGFpbmVyQ2xhc3N9XCIpLmFwcGVuZCBcIlwiXCJcbiAgICAgICAgPGRpdiBjbGFzcz1cIiN7Y2xhc3Nlc31cIiBpZD1cImluZm8tI3tpZH1cIlxuICAgICAgICAgIGRhdGEtcG9zaXRpb249XCIje3Bvc2l0aW9ufVwiPlxuICAgICAgICAgICAgI3tvcHRpb25zLmh0bWx9XG4gICAgICAgIDwvZGl2PlxuICAgICAgICAgIFwiXCJcIlxuICAgICAgaWYgb3B0aW9ucy5vZmZzZXRYXG4gICAgICAgIEBjb250YWluZXIuZmluZChcIi4je1BsYW5pdC5pbmZvYm94Q2xhc3N9XCIpLmxhc3QoKS5hdHRyXG4gICAgICAgICAgJ2RhdGEtb2Zmc2V0LXgnOiBvcHRpb25zLm9mZnNldFhcbiAgICAgIGlmIG9wdGlvbnMub2Zmc2V0WVxuICAgICAgICBAY29udGFpbmVyLmZpbmQoXCIuI3tQbGFuaXQuaW5mb2JveENsYXNzfVwiKS5sYXN0KCkuYXR0clxuICAgICAgICAgICdkYXRhLW9mZnNldC15Jzogb3B0aW9ucy5vZmZzZXRZXG4gICAgICBAbWFya2VyLmF0dHIoJ2RhdGEtaW5mb2JveCcsIFwiaW5mby0je2lkfVwiKVxuICAgICAgQG1hcmtlck9iai5wb3NpdGlvbkluZm9ib3goKVxuICAgICAgIyBAbWFya2VyLmNsaWNrIChlKSA9PlxuICAgICAgIyAgIGlmKFxuICAgICAgIyAgICAgIUBtYXJrZXIuYXR0cignZGF0YS1kcmFnLXN0YXJ0LXgnKSB8fFxuICAgICAgIyAgICAgIUBtYXJrZXIuYXR0cignZGF0YS1kcmFnLXN0YXJ0LXknKSB8fFxuICAgICAgIyAgICAgKFxuICAgICAgIyAgICAgICBNYXRoLmFicyhlLnBhZ2VYIC0gQG1hcmtlci5hdHRyKCdkYXRhLWRyYWctc3RhcnQteCcpKSA8IDEgJiZcbiAgICAgICMgICAgICAgTWF0aC5hYnMoZS5wYWdlWSAtIEBtYXJrZXIuYXR0cignZGF0YS1kcmFnLXN0YXJ0LXknKSkgPCAxXG4gICAgICAjICAgICApXG4gICAgICAjICAgKVxuICAgICAgIyAgICAgbWFya2VyID0gJChlLnRhcmdldCkuY2xvc2VzdChcIi4je1BsYW5pdC5tYXJrZXJDbGFzc31cIilcbiAgICAgICMgICAgICQoXCIjI3ttYXJrZXIuYXR0cignZGF0YS1pbmZvYm94Jyl9XCIpLnRvZ2dsZUNsYXNzKCdhY3RpdmUnKVxuXG4gIG1hcmtlcnM6IC0+XG4gICAgQG1hcmtlcnNDb250YWluZXIuZmluZChcIi4je1BsYW5pdC5tYXJrZXJDbGFzc31cIilcblxuICBkcmFnZ2luZ01hcmtlcjogLT5cbiAgICBAbWFya2Vyc0NvbnRhaW5lci5maW5kKFwiLiN7UGxhbml0Lm1hcmtlckNsYXNzfS4je1BsYW5pdC5kcmFnZ2luZ0NsYXNzfVwiKVxuXG5jbGFzcyBQbGFuaXQuTWFya2VyLkNyZWF0b3JcblxuICBjb25zdHJ1Y3RvcjogKEBvcHRpb25zKSAtPlxuICAgICMgU2V0IE9wdGlvbnNcbiAgICBAY29udGFpbmVyID0gQG9wdGlvbnMuY29udGFpbmVyXG4gICAgQG1hcmtlcnNDb250YWluZXIgPSBAY29udGFpbmVyLmZpbmQoXCIuI3tQbGFuaXQubWFya2VyQ29udGFpbmVyQ2xhc3N9XCIpLmZpcnN0KClcbiAgICB1bmxlc3MgQG9wdGlvbnMucGxhbml0SURcbiAgICAgIEBvcHRpb25zLnBsYW5pdElEID0gUGxhbml0LnJhbmRvbVN0cmluZygyMClcblxuICAgICMgQWRkIE1hcmtlclxuICAgIGlmIEBvcHRpb25zLmNvbG9yIHRoZW4gY29sb3IgPSBAb3B0aW9ucy5jb2xvciBlbHNlIGNvbG9yID0gJyNGQzVCM0YnXG5cbiAgICBsZWZ0ID0gKChwYXJzZUZsb2F0KEBvcHRpb25zLmNvb3Jkc1swXSkgLyAxMDApICogQGNvbnRhaW5lci53aWR0aCgpKSAtIDE1XG4gICAgdG9wID0gKChwYXJzZUZsb2F0KEBvcHRpb25zLmNvb3Jkc1sxXSkgLyAxMDApICogQGNvbnRhaW5lci5oZWlnaHQoKSkgLSAxNVxuICAgIEBtYXJrZXJzQ29udGFpbmVyLmFwcGVuZChcbiAgICAgICQoJzxkaXY+PC9kaXY+JylcbiAgICAgICAgLmFkZENsYXNzKFBsYW5pdC5tYXJrZXJDbGFzcylcbiAgICAgICAgLmF0dHJcbiAgICAgICAgICAnZGF0YS1tYXJrZXInOiBAb3B0aW9ucy5wbGFuaXRJRFxuICAgICAgICAgICdkYXRhLXhQYyc6IEBvcHRpb25zLmNvb3Jkc1swXVxuICAgICAgICAgICdkYXRhLXlQYyc6IEBvcHRpb25zLmNvb3Jkc1sxXVxuICAgICAgICAuY3NzXG4gICAgICAgICAgbGVmdDogXCIje2xlZnR9cHhcIlxuICAgICAgICAgIHRvcDogXCIje3RvcH1weFwiXG4gICAgICAgICAgYmFja2dyb3VuZENvbG9yOiBjb2xvclxuICAgIClcbiAgICBtYXJrZXIgPSBAbWFya2Vyc0NvbnRhaW5lci5maW5kKFwiLiN7UGxhbml0Lm1hcmtlckNsYXNzfVwiKS5sYXN0KClcbiAgICBpZiBAb3B0aW9ucy5pZFxuICAgICAgbWFya2VyLmF0dHIoJ2RhdGEtaWQnOiBAb3B0aW9ucy5pZClcbiAgICBpZiBAb3B0aW9ucy5jbGFzc1xuICAgICAgbWFya2VyLmFkZENsYXNzKEBvcHRpb25zLmNsYXNzKVxuICAgIGlmIEBvcHRpb25zLmh0bWxcbiAgICAgIG1hcmtlci5odG1sKEBvcHRpb25zLmh0bWwpXG4gICAgaWYgQG9wdGlvbnMuc2l6ZVxuICAgICAgbWFya2VyLmNzc1xuICAgICAgICB3aWR0aDogXCIje0BvcHRpb25zLnNpemV9cHhcIlxuICAgICAgICBoZWlnaHQ6IFwiI3tAb3B0aW9ucy5zaXplfXB4XCJcblxuICAgICMgQmluZCBFdmVudHMgKGluIGEgc2VwYXJhdGUgY2xhc3MpXG4gICAgbmV3IFBsYW5pdC5NYXJrZXIuRXZlbnRzKEBvcHRpb25zKVxuXG4gICAgIyBSZXR1cm4gYSBuZXcgaW5zdGFuY2Ugb2YgdGhpcyBtYXJrZXJcbiAgICBuZXcgUGxhbml0Lk1hcmtlcihAY29udGFpbmVyLCBAb3B0aW9ucy5wbGFuaXRJRClcbiJdfQ==