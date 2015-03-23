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
    return new Planit.Plan.Creator(this.options);
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

Planit.Plan.Creator = (function() {
  var initContainer, initEvents, initImage, initMarkers, initMethods, initOptions;

  function Creator(options1) {
    var j, len, method, ref;
    this.options = options1 != null ? options1 : {};
    this.addMarkers = bind(this.addMarkers, this);
    this.initBackgroundImage = bind(this.initBackgroundImage, this);
    ref = initMethods();
    for (j = 0, len = ref.length; j < len; j++) {
      method = ref[j];
      method.call(this);
    }
    new Planit.Plan(this.container);
  }

  initMethods = function() {
    return [initOptions, initContainer, initImage, initMarkers, initEvents];
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
      return this.initBackgroundImage();
    }
  };

  Creator.prototype.initBackgroundImage = function() {
    var img;
    img = this.container.find('img').first();
    if (img.height() > 0 && img.width() > 0) {
      this.container.css({
        height: img.height()
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

  initMarkers = function() {
    var j, len, marker, ref, results;
    if (this.options.markers && this.options.markers.length > 0) {
      if (this.options.image && this.options.image.url) {
        return this.addMarkers();
      } else {
        ref = this.options.markers;
        results = [];
        for (j = 0, len = ref.length; j < len; j++) {
          marker = ref[j];
          marker.container = this.container;
          results.push(new Planit.Marker.Creator(marker));
        }
        return results;
      }
    }
  };

  Creator.prototype.addMarkers = function() {
    var j, len, marker, ref, results;
    if (this.imgLoaded && this.imgLoaded === true) {
      ref = this.options.markers;
      results = [];
      for (j = 0, len = ref.length; j < len; j++) {
        marker = ref[j];
        marker.container = this.container;
        results.push(new Planit.Marker.Creator(marker));
      }
      return results;
    } else {
      return setTimeout(this.addMarkers, 250);
    }
  };

  initEvents = function() {
    return new Planit.Plan.Events({
      container: this.container,
      planit: this
    });
  };

  return Creator;

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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInBsYW5pdC10bXAuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLElBQUEsTUFBQTtFQUFBLGdGQUFBOztBQUFBOzs7Ozs7OztHQUlFOztBQUFBLEVBQUEsTUFBQyxDQUFBLGNBQUQsR0FBd0Isa0JBQXhCLENBQUE7O0FBQUEsRUFDQSxNQUFDLENBQUEsb0JBQUQsR0FBd0IsMEJBRHhCLENBQUE7O0FBQUEsRUFFQSxNQUFDLENBQUEsa0JBQUQsR0FBd0IsdUJBRnhCLENBQUE7O0FBQUEsRUFHQSxNQUFDLENBQUEsV0FBRCxHQUF3QixlQUh4QixDQUFBOztBQUFBLEVBSUEsTUFBQyxDQUFBLGFBQUQsR0FBd0IsYUFKeEIsQ0FBQTs7QUFBQSxFQUtBLE1BQUMsQ0FBQSxxQkFBRCxHQUF3QiwwQkFMeEIsQ0FBQTs7QUFBQSxFQU1BLE1BQUMsQ0FBQSxZQUFELEdBQXdCLGdCQU54QixDQUFBOztBQUFBLEVBT0EsTUFBQyxDQUFBLGNBQUQsR0FBd0Isd0JBUHhCLENBQUE7O0FBQUEsbUJBV0EsTUFBQSxHQUFLLFNBQUMsUUFBRCxHQUFBO0FBQ0gsSUFESSxJQUFDLENBQUEsNkJBQUQsV0FBVyxFQUNmLENBQUE7V0FBSSxJQUFBLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBWixDQUFvQixJQUFDLENBQUEsT0FBckIsRUFERDtFQUFBLENBWEwsQ0FBQTs7QUFBQSxtQkFrQkEsU0FBQSxHQUFXLFNBQUMsRUFBRCxHQUFBO1dBQ0wsSUFBQSxNQUFNLENBQUMsTUFBUCxDQUFjLElBQUMsQ0FBQSxTQUFmLEVBQTBCLEVBQTFCLEVBREs7RUFBQSxDQWxCWCxDQUFBOztBQUFBLG1CQXFCQSxhQUFBLEdBQWUsU0FBQSxHQUFBO0FBQ2IsUUFBQSxJQUFBO0FBQUEsSUFBQSxJQUFBLEdBQVcsSUFBQSxNQUFNLENBQUMsSUFBUCxDQUFZLElBQUMsQ0FBQSxTQUFiLENBQVgsQ0FBQTtXQUNBLElBQUksQ0FBQyxhQUFMLENBQUEsRUFGYTtFQUFBLENBckJmLENBQUE7O0FBQUEsbUJBMkJBLFFBQUEsR0FBVSxTQUFDLE1BQUQsR0FBQTtXQUNSLElBQUMsQ0FBQSxRQUFRLENBQUMsUUFBVixDQUFtQixNQUFuQixFQURRO0VBQUEsQ0EzQlYsQ0FBQTs7QUFBQSxtQkE4QkEsTUFBQSxHQUFRLFNBQUMsS0FBRCxHQUFBO1dBQ04sSUFBQyxDQUFBLFFBQVEsQ0FBQyxNQUFWLENBQWlCLEtBQWpCLEVBRE07RUFBQSxDQTlCUixDQUFBOztBQUFBLG1CQWlDQSxNQUFBLEdBQVEsU0FBQyxDQUFELEdBQUE7QUFDTixRQUFBLHNDQUFBO0FBQUEsSUFBQSxLQUFBLEdBQVEsSUFBQyxDQUFBLFNBQVMsQ0FBQyxJQUFYLENBQWdCLEdBQUEsR0FBSSxNQUFNLENBQUMsY0FBWCxHQUEwQixRQUExQyxDQUFrRCxDQUFDLEtBQW5ELENBQUEsQ0FBUixDQUFBO0FBQUEsSUFDQSxJQUFDLENBQUEsUUFBUSxDQUFDLFVBQVYsQ0FBQSxDQURBLENBQUE7QUFFQSxJQUFBLElBQUcsS0FBSDtBQUNFLE1BQUEsSUFBQyxDQUFBLFNBQVMsQ0FBQyxNQUFYLENBQWtCLEtBQUssQ0FBQyxNQUFOLENBQUEsQ0FBbEIsQ0FBQSxDQURGO0tBRkE7QUFJQTtBQUFBO1NBQUEscUNBQUE7c0JBQUE7QUFDRSxNQUFBLENBQUEsR0FBUSxJQUFBLE1BQU0sQ0FBQyxNQUFQLENBQWMsSUFBQyxDQUFBLFNBQWYsRUFBMEIsQ0FBQSxDQUFFLE1BQUYsQ0FBUyxDQUFDLElBQVYsQ0FBZSxhQUFmLENBQTFCLENBQVIsQ0FBQTtBQUFBLG1CQUNBLENBQUMsQ0FBQyxHQUFGLENBQUEsRUFEQSxDQURGO0FBQUE7bUJBTE07RUFBQSxDQWpDUixDQUFBOztBQUFBLG1CQTRDQSxhQUFBLEdBQWUsU0FBQyxLQUFELEVBQVEsTUFBUixHQUFBO0FBQ2IsSUFBQSxJQUFHLElBQUMsQ0FBQSxPQUFPLENBQUMsYUFBWjthQUNFLElBQUMsQ0FBQSxPQUFPLENBQUMsYUFBVCxDQUF1QixLQUF2QixFQUE4QixNQUE5QixFQURGO0tBRGE7RUFBQSxDQTVDZixDQUFBOztBQUFBLG1CQWdEQSxXQUFBLEdBQWEsU0FBQyxLQUFELEVBQVEsTUFBUixHQUFBO0FBQ1gsSUFBQSxJQUFHLElBQUMsQ0FBQSxPQUFPLENBQUMsV0FBWjthQUNFLElBQUMsQ0FBQSxPQUFPLENBQUMsV0FBVCxDQUFxQixLQUFyQixFQUE0QixNQUE1QixFQURGO0tBRFc7RUFBQSxDQWhEYixDQUFBOztBQUFBLG1CQW9EQSxXQUFBLEdBQWEsU0FBQyxLQUFELEVBQVEsTUFBUixHQUFBO0FBQ1gsSUFBQSxJQUFHLElBQUMsQ0FBQSxPQUFPLENBQUMsV0FBWjthQUNFLElBQUMsQ0FBQSxPQUFPLENBQUMsV0FBVCxDQUFxQixLQUFyQixFQUE0QixNQUE1QixFQURGO0tBRFc7RUFBQSxDQXBEYixDQUFBOztBQUFBLEVBMERBLE1BQUMsQ0FBQSxZQUFELEdBQWUsU0FBQyxNQUFELEdBQUE7QUFDYixRQUFBLEdBQUE7O01BRGMsU0FBUztLQUN2QjtBQUFBLElBQUEsR0FBQSxHQUFNLElBQUksQ0FBQyxNQUFMLENBQUEsQ0FBYSxDQUFDLFFBQWQsQ0FBdUIsRUFBdkIsQ0FBMEIsQ0FBQyxLQUEzQixDQUFpQyxDQUFqQyxDQUFOLENBQUE7QUFBQSxJQUNBLEdBQUEsR0FBTSxHQUFBLEdBQU0sSUFBSSxDQUFDLE1BQUwsQ0FBQSxDQUFhLENBQUMsUUFBZCxDQUF1QixFQUF2QixDQUEwQixDQUFDLEtBQTNCLENBQWlDLENBQWpDLENBRFosQ0FBQTtXQUVBLEdBQUcsQ0FBQyxTQUFKLENBQWMsQ0FBZCxFQUFpQixNQUFBLEdBQVMsQ0FBMUIsRUFIYTtFQUFBLENBMURmLENBQUE7O2dCQUFBOztJQUpGLENBQUE7O0FBQUEsTUFvRU0sQ0FBQyxNQUFQLEdBQWdCLEdBQUEsQ0FBQSxNQXBFaEIsQ0FBQTs7QUFBQSxNQXNFWSxDQUFDO0FBSUUsRUFBQSxjQUFDLFNBQUQsR0FBQTtBQUNYLElBRFksSUFBQyxDQUFBLFlBQUQsU0FDWixDQUFBO0FBQUEsdURBQUEsQ0FBQTtBQUFBLElBQUEsSUFBQyxDQUFBLGdCQUFELEdBQW9CLElBQUMsQ0FBQSxTQUFTLENBQUMsSUFBWCxDQUFnQixHQUFBLEdBQUksTUFBTSxDQUFDLG9CQUEzQixDQUFrRCxDQUFDLEtBQW5ELENBQUEsQ0FBcEIsQ0FEVztFQUFBLENBQWI7O0FBQUEsaUJBS0EsYUFBQSxHQUFlLFNBQUEsR0FBQTtBQUNiLFFBQUEsK0JBQUE7QUFBQSxJQUFBLE9BQUEsR0FBVSxFQUFWLENBQUE7QUFDQTtBQUFBLFNBQUEscUNBQUE7c0JBQUE7QUFDRSxNQUFBLENBQUEsR0FBUSxJQUFBLE1BQU0sQ0FBQyxNQUFQLENBQWMsSUFBQyxDQUFBLFNBQWYsRUFBMEIsQ0FBQSxDQUFFLE1BQUYsQ0FBUyxDQUFDLElBQVYsQ0FBZSxhQUFmLENBQTFCLENBQVIsQ0FBQTtBQUFBLE1BQ0EsTUFBQSxHQUVFO0FBQUEsUUFBQSxNQUFBLEVBQVEsQ0FBQyxDQUFDLFFBQUYsQ0FBQSxDQUFSO0FBQUEsUUFDQSxTQUFBLEVBQVcsQ0FBQyxDQUFDLFdBQUYsQ0FBQSxDQURYO0FBQUEsUUFFQSxLQUFBLEVBQU8sQ0FBQyxDQUFDLEtBQUYsQ0FBQSxDQUZQO09BSEYsQ0FBQTtBQU1BLE1BQUEsSUFBb0MsQ0FBQyxDQUFDLFdBQUYsQ0FBQSxDQUFwQztBQUFBLFFBQUEsTUFBTSxDQUFDLE9BQVAsR0FBaUIsQ0FBQyxDQUFDLFdBQUYsQ0FBQSxDQUFqQixDQUFBO09BTkE7QUFBQSxNQU9BLE9BQU8sQ0FBQyxJQUFSLENBQWEsQ0FBYixDQVBBLENBREY7QUFBQSxLQURBO1dBVUEsUUFYYTtFQUFBLENBTGYsQ0FBQTs7Y0FBQTs7SUExRUYsQ0FBQTs7QUFBQSxNQTRGWSxDQUFDLElBQUksQ0FBQztBQUloQixNQUFBLDJFQUFBOztBQUFhLEVBQUEsaUJBQUMsUUFBRCxHQUFBO0FBQ1gsUUFBQSxtQkFBQTtBQUFBLElBRFksSUFBQyxDQUFBLDZCQUFELFdBQVcsRUFDdkIsQ0FBQTtBQUFBLGlEQUFBLENBQUE7QUFBQSxtRUFBQSxDQUFBO0FBQUE7QUFBQSxTQUFBLHFDQUFBO3NCQUFBO0FBQUEsTUFBQSxNQUFNLENBQUMsSUFBUCxDQUFZLElBQVosQ0FBQSxDQUFBO0FBQUEsS0FBQTtBQUFBLElBRUksSUFBQSxNQUFNLENBQUMsSUFBUCxDQUFZLElBQUMsQ0FBQSxTQUFiLENBRkosQ0FEVztFQUFBLENBQWI7O0FBQUEsRUFRQSxXQUFBLEdBQWMsU0FBQSxHQUFBO1dBQ1osQ0FBQyxXQUFELEVBQWMsYUFBZCxFQUE2QixTQUE3QixFQUF3QyxXQUF4QyxFQUFxRCxVQUFyRCxFQURZO0VBQUEsQ0FSZCxDQUFBOztBQUFBLEVBY0EsV0FBQSxHQUFjLFNBQUEsR0FBQTtBQUNaLElBQUEsSUFBRyxJQUFDLENBQUEsT0FBTyxDQUFDLFNBQVo7QUFDRSxNQUFBLElBQUMsQ0FBQSxPQUFPLENBQUMsU0FBVCxHQUFxQixDQUFBLENBQUUsR0FBQSxHQUFJLElBQUMsQ0FBQSxPQUFPLENBQUMsU0FBZixDQUFyQixDQURGO0tBQUEsTUFBQTtBQUdFLE1BQUEsSUFBQyxDQUFBLE9BQU8sQ0FBQyxTQUFULEdBQXFCLENBQUEsQ0FBRSxTQUFGLENBQXJCLENBSEY7S0FBQTtXQUlBLElBQUMsQ0FBQSxTQUFELEdBQWEsSUFBQyxDQUFBLE9BQU8sQ0FBQyxVQUxWO0VBQUEsQ0FkZCxDQUFBOztBQUFBLEVBdUJBLGFBQUEsR0FBZ0IsU0FBQSxHQUFBO0FBQ2QsSUFBQSxJQUFDLENBQUEsU0FBUyxDQUFDLFFBQVgsQ0FBb0IsTUFBTSxDQUFDLGNBQTNCLENBQUEsQ0FBQTtBQUFBLElBQ0EsSUFBQyxDQUFBLFNBQVMsQ0FBQyxNQUFYLENBQWtCLGVBQUEsR0FDRixNQUFNLENBQUMscUJBREwsR0FDMkIsMEJBRDNCLEdBRUYsTUFBTSxDQUFDLG9CQUZMLEdBRTBCLFdBRjVDLENBREEsQ0FBQTtXQUtBLElBQUMsQ0FBQSxnQkFBRCxHQUFvQixJQUFDLENBQUEsU0FBUyxDQUFDLElBQVgsQ0FBZ0IsR0FBQSxHQUFJLE1BQU0sQ0FBQyxvQkFBM0IsQ0FDbEIsQ0FBQyxLQURpQixDQUFBLEVBTk47RUFBQSxDQXZCaEIsQ0FBQTs7QUFBQSxFQW1DQSxTQUFBLEdBQVksU0FBQSxHQUFBO0FBQ1YsSUFBQSxJQUFHLElBQUMsQ0FBQSxPQUFPLENBQUMsS0FBVCxJQUFrQixJQUFDLENBQUEsT0FBTyxDQUFDLEtBQUssQ0FBQyxHQUFwQztBQUNFLE1BQUEsSUFBQyxDQUFBLFNBQVMsQ0FBQyxPQUFYLENBQW1CLGVBQUEsR0FDSCxNQUFNLENBQUMsY0FESixHQUNtQixvQkFEbkIsR0FFSCxJQUFDLENBQUEsT0FBTyxDQUFDLEtBQUssQ0FBQyxHQUZaLEdBRWdCLGFBRm5DLENBQUEsQ0FBQTthQUtBLElBQUMsQ0FBQSxtQkFBRCxDQUFBLEVBTkY7S0FEVTtFQUFBLENBbkNaLENBQUE7O0FBQUEsb0JBK0NBLG1CQUFBLEdBQXFCLFNBQUEsR0FBQTtBQUNuQixRQUFBLEdBQUE7QUFBQSxJQUFBLEdBQUEsR0FBTSxJQUFDLENBQUEsU0FBUyxDQUFDLElBQVgsQ0FBZ0IsS0FBaEIsQ0FBc0IsQ0FBQyxLQUF2QixDQUFBLENBQU4sQ0FBQTtBQUNBLElBQUEsSUFBRyxHQUFHLENBQUMsTUFBSixDQUFBLENBQUEsR0FBZSxDQUFmLElBQW9CLEdBQUcsQ0FBQyxLQUFKLENBQUEsQ0FBQSxHQUFjLENBQXJDO0FBQ0UsTUFBQSxJQUFDLENBQUEsU0FBUyxDQUFDLEdBQVgsQ0FDRTtBQUFBLFFBQUEsTUFBQSxFQUFRLEdBQUcsQ0FBQyxNQUFKLENBQUEsQ0FBUjtPQURGLENBQUEsQ0FBQTtBQUFBLE1BRUEsSUFBQyxDQUFBLFFBQUQsR0FBZ0IsSUFBQSxNQUFNLENBQUMsSUFBSSxDQUFDLFFBQVosQ0FDZDtBQUFBLFFBQUEsU0FBQSxFQUFXLElBQUMsQ0FBQSxTQUFaO09BRGMsQ0FGaEIsQ0FBQTtBQUlBLE1BQUEsSUFBRyxJQUFDLENBQUEsT0FBTyxDQUFDLEtBQUssQ0FBQyxJQUFsQjtBQUNFLFFBQUEsSUFBQyxDQUFBLFFBQVEsQ0FBQyxLQUFELENBQVQsQ0FBQSxDQUFBLENBREY7T0FKQTthQU1BLElBQUMsQ0FBQSxTQUFELEdBQWEsS0FQZjtLQUFBLE1BQUE7YUFTRSxVQUFBLENBQVcsSUFBQyxDQUFBLG1CQUFaLEVBQWlDLEdBQWpDLEVBVEY7S0FGbUI7RUFBQSxDQS9DckIsQ0FBQTs7QUFBQSxFQStEQSxXQUFBLEdBQWMsU0FBQSxHQUFBO0FBQ1osUUFBQSw0QkFBQTtBQUFBLElBQUEsSUFBRyxJQUFDLENBQUEsT0FBTyxDQUFDLE9BQVQsSUFBb0IsSUFBQyxDQUFBLE9BQU8sQ0FBQyxPQUFPLENBQUMsTUFBakIsR0FBMEIsQ0FBakQ7QUFDRSxNQUFBLElBQUcsSUFBQyxDQUFBLE9BQU8sQ0FBQyxLQUFULElBQWtCLElBQUMsQ0FBQSxPQUFPLENBQUMsS0FBSyxDQUFDLEdBQXBDO2VBQ0UsSUFBQyxDQUFBLFVBQUQsQ0FBQSxFQURGO09BQUEsTUFBQTtBQUdFO0FBQUE7YUFBQSxxQ0FBQTswQkFBQTtBQUNFLFVBQUEsTUFBTSxDQUFDLFNBQVAsR0FBbUIsSUFBQyxDQUFBLFNBQXBCLENBQUE7QUFBQSx1QkFDSSxJQUFBLE1BQU0sQ0FBQyxNQUFNLENBQUMsT0FBZCxDQUFzQixNQUF0QixFQURKLENBREY7QUFBQTt1QkFIRjtPQURGO0tBRFk7RUFBQSxDQS9EZCxDQUFBOztBQUFBLG9CQTJFQSxVQUFBLEdBQVksU0FBQSxHQUFBO0FBQ1YsUUFBQSw0QkFBQTtBQUFBLElBQUEsSUFBRyxJQUFDLENBQUEsU0FBRCxJQUFjLElBQUMsQ0FBQSxTQUFELEtBQWMsSUFBL0I7QUFDRTtBQUFBO1dBQUEscUNBQUE7d0JBQUE7QUFDRSxRQUFBLE1BQU0sQ0FBQyxTQUFQLEdBQW1CLElBQUMsQ0FBQSxTQUFwQixDQUFBO0FBQUEscUJBQ0ksSUFBQSxNQUFNLENBQUMsTUFBTSxDQUFDLE9BQWQsQ0FBc0IsTUFBdEIsRUFESixDQURGO0FBQUE7cUJBREY7S0FBQSxNQUFBO2FBS0UsVUFBQSxDQUFXLElBQUMsQ0FBQSxVQUFaLEVBQXdCLEdBQXhCLEVBTEY7S0FEVTtFQUFBLENBM0VaLENBQUE7O0FBQUEsRUFxRkEsVUFBQSxHQUFhLFNBQUEsR0FBQTtXQUNQLElBQUEsTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFaLENBQ0Y7QUFBQSxNQUFBLFNBQUEsRUFBVyxJQUFDLENBQUEsU0FBWjtBQUFBLE1BQ0EsTUFBQSxFQUFRLElBRFI7S0FERSxFQURPO0VBQUEsQ0FyRmIsQ0FBQTs7aUJBQUE7O0lBaEdGLENBQUE7O0FBQUEsTUEwTFksQ0FBQyxJQUFJLENBQUM7QUFJSCxFQUFBLGdCQUFDLFFBQUQsR0FBQTtBQUdYLElBSFksSUFBQyxDQUFBLFVBQUQsUUFHWixDQUFBO0FBQUEsK0NBQUEsQ0FBQTtBQUFBLDJDQUFBLENBQUE7QUFBQSw2REFBQSxDQUFBO0FBQUEseURBQUEsQ0FBQTtBQUFBLDJDQUFBLENBQUE7QUFBQSxJQUFBLElBQUMsQ0FBQSxTQUFELEdBQWEsSUFBQyxDQUFBLE9BQU8sQ0FBQyxTQUF0QixDQUFBO0FBQUEsSUFDQSxJQUFDLENBQUEsZ0JBQUQsR0FBb0IsSUFBQyxDQUFBLFNBQVMsQ0FBQyxJQUFYLENBQWdCLEdBQUEsR0FBSSxNQUFNLENBQUMsb0JBQTNCLENBRHBCLENBQUE7QUFFQSxJQUFBLElBQUcsSUFBQyxDQUFBLFNBQVMsQ0FBQyxJQUFYLENBQWdCLEdBQUEsR0FBSSxNQUFNLENBQUMsY0FBWCxHQUEwQixRQUExQyxDQUFrRCxDQUFDLE1BQW5ELEdBQTRELENBQS9EO0FBQ0UsTUFBQSxJQUFDLENBQUEsS0FBRCxHQUFTLElBQUMsQ0FBQSxTQUFTLENBQUMsSUFBWCxDQUFnQixHQUFBLEdBQUksTUFBTSxDQUFDLGNBQVgsR0FBMEIsUUFBMUMsQ0FBa0QsQ0FBQyxLQUFuRCxDQUFBLENBQVQsQ0FERjtLQUZBO0FBQUEsSUFNQSxDQUFBLENBQUUsUUFBRixDQUFXLENBQUMsRUFBWixDQUFlLFdBQWYsRUFBNEIsSUFBQyxDQUFBLFNBQTdCLENBTkEsQ0FBQTtBQUFBLElBT0EsQ0FBQSxDQUFFLFFBQUYsQ0FBVyxDQUFDLEVBQVosQ0FBZSxTQUFmLEVBQTBCLElBQUMsQ0FBQSxPQUEzQixDQVBBLENBSFc7RUFBQSxDQUFiOztBQUFBLG1CQWNBLE9BQUEsR0FBUyxTQUFBLEdBQUE7V0FDUCxJQUFDLENBQUEsZ0JBQWdCLENBQUMsSUFBbEIsQ0FBdUIsR0FBQSxHQUFJLE1BQU0sQ0FBQyxXQUFsQyxFQURPO0VBQUEsQ0FkVCxDQUFBOztBQUFBLG1CQWlCQSxjQUFBLEdBQWdCLFNBQUEsR0FBQTtXQUNkLElBQUMsQ0FBQSxnQkFBZ0IsQ0FBQyxJQUFsQixDQUF1QixHQUFBLEdBQUksTUFBTSxDQUFDLFdBQVgsR0FBdUIsR0FBdkIsR0FBMEIsTUFBTSxDQUFDLGFBQXhELEVBRGM7RUFBQSxDQWpCaEIsQ0FBQTs7QUFBQSxtQkFvQkEsZ0JBQUEsR0FBa0IsU0FBQyxDQUFELEdBQUE7QUFFaEIsUUFBQSx3REFBQTtBQUFBLElBQUEsS0FBQSxHQUFRLFVBQUEsQ0FBVyxJQUFDLENBQUEsZ0JBQWdCLENBQUMsS0FBbEIsQ0FBQSxDQUFYLENBQVIsQ0FBQTtBQUFBLElBQ0EsS0FBQSxHQUFRLFVBQUEsQ0FBVyxJQUFDLENBQUEsZ0JBQWdCLENBQUMsTUFBbEIsQ0FBQSxDQUFYLENBRFIsQ0FBQTtBQU1BLElBQUEsSUFBRyxJQUFDLENBQUEsS0FBSjtBQUVFLE1BQUEsR0FBQSxHQUFNLENBQUMsQ0FBQyxLQUFGLEdBQVUsSUFBQyxDQUFBLFNBQVMsQ0FBQyxNQUFYLENBQUEsQ0FBbUIsQ0FBQyxJQUFwQyxDQUFBO0FBQUEsTUFDQSxHQUFBLEdBQU0sQ0FBQyxDQUFDLEtBQUYsR0FBVSxJQUFDLENBQUEsU0FBUyxDQUFDLE1BQVgsQ0FBQSxDQUFtQixDQUFDLEdBRHBDLENBQUE7QUFBQSxNQUVBLElBQUEsR0FBTyxJQUFDLENBQUEsS0FBSyxDQUFDLEtBQVAsQ0FBQSxDQUZQLENBQUE7QUFBQSxNQUdBLElBQUEsR0FBTyxJQUFDLENBQUEsS0FBSyxDQUFDLE1BQVAsQ0FBQSxDQUhQLENBQUE7QUFBQSxNQUlBLElBQUEsR0FBTyxRQUFBLENBQVMsSUFBQyxDQUFBLEtBQUssQ0FBQyxHQUFQLENBQVcsTUFBWCxDQUFULENBSlAsQ0FBQTtBQUFBLE1BS0EsSUFBQSxHQUFPLFFBQUEsQ0FBUyxJQUFDLENBQUEsS0FBSyxDQUFDLEdBQVAsQ0FBVyxLQUFYLENBQVQsQ0FMUCxDQUFBO0FBQUEsTUFNQSxHQUFBLEdBQU0sQ0FBQyxDQUFDLEdBQUEsR0FBTSxJQUFJLENBQUMsR0FBTCxDQUFTLElBQVQsQ0FBUCxDQUFBLEdBQXlCLElBQTFCLENBQUEsR0FBa0MsR0FOeEMsQ0FBQTtBQUFBLE1BT0EsR0FBQSxHQUFNLENBQUMsQ0FBQyxHQUFBLEdBQU0sSUFBSSxDQUFDLEdBQUwsQ0FBUyxJQUFULENBQVAsQ0FBQSxHQUF5QixJQUExQixDQUFBLEdBQWtDLEdBUHhDLENBRkY7S0FBQSxNQUFBO0FBWUUsTUFBQSxHQUFBLEdBQU0sQ0FBQyxDQUFDLENBQUMsS0FBRixHQUFVLElBQUMsQ0FBQSxTQUFTLENBQUMsTUFBWCxDQUFBLENBQW1CLENBQUMsSUFBL0IsQ0FBQSxHQUF1QyxLQUE3QyxDQUFBO0FBQUEsTUFDQSxHQUFBLEdBQU8sQ0FBQyxDQUFDLENBQUMsS0FBRixHQUFVLElBQUMsQ0FBQSxTQUFTLENBQUMsTUFBWCxDQUFBLENBQW1CLENBQUMsR0FBL0IsQ0FBQSxHQUFzQyxLQUQ3QyxDQVpGO0tBTkE7V0FvQkEsQ0FBQyxHQUFELEVBQU0sR0FBTixFQXRCZ0I7RUFBQSxDQXBCbEIsQ0FBQTs7QUFBQSxtQkE4Q0EsT0FBQSxHQUFTLFNBQUMsQ0FBRCxHQUFBO0FBRVAsUUFBQSxTQUFBO0FBQUEsSUFBQSxNQUFBLEdBQVMsSUFBQyxDQUFBLGdCQUFnQixDQUFDLElBQWxCLENBQXVCLEdBQUEsR0FBSSxNQUFNLENBQUMsYUFBbEMsQ0FBa0QsQ0FBQyxLQUFuRCxDQUFBLENBQVQsQ0FBQTtBQUNBLElBQUEsSUFBRyxJQUFDLENBQUEsY0FBRCxDQUFBLENBQWlCLENBQUMsTUFBbEIsR0FBMkIsQ0FBOUI7QUFDRSxNQUFBLENBQUEsR0FBUSxJQUFBLE1BQU0sQ0FBQyxNQUFQLENBQWMsSUFBQyxDQUFBLFNBQWYsRUFBMEIsTUFBTSxDQUFDLElBQVAsQ0FBWSxhQUFaLENBQTFCLENBQVIsQ0FBQTtBQUFBLE1BQ0EsSUFBQyxDQUFBLE9BQU8sQ0FBQyxNQUFNLENBQUMsYUFBaEIsQ0FBOEIsQ0FBOUIsRUFBaUMsQ0FBakMsQ0FEQSxDQUFBO0FBQUEsTUFFQSxDQUFDLENBQUMsWUFBRixDQUFBLENBRkEsQ0FBQTtBQUFBLE1BR0EsQ0FBQyxDQUFDLGVBQUYsQ0FBQSxDQUhBLENBQUE7QUFBQSxNQUlBLElBQUMsQ0FBQSxjQUFELENBQUEsQ0FBaUIsQ0FBQyxXQUFsQixDQUE4QixNQUFNLENBQUMsYUFBckMsQ0FKQSxDQURGO0tBREE7QUFRQSxJQUFBLElBQUcsQ0FBQSxDQUFFLENBQUMsQ0FBQyxNQUFKLENBQVcsQ0FBQyxRQUFaLENBQXFCLE1BQU0sQ0FBQyxvQkFBNUIsQ0FBSDtBQUNFLE1BQUEsSUFBQyxDQUFBLE9BQU8sQ0FBQyxNQUFNLENBQUMsV0FBaEIsQ0FBNEIsQ0FBNUIsRUFBK0IsSUFBQyxDQUFBLGdCQUFELENBQWtCLENBQWxCLENBQS9CLENBQUEsQ0FERjtLQVJBO0FBV0EsSUFBQSxJQUNFLENBQUEsQ0FBRSxDQUFDLENBQUMsTUFBSixDQUFXLENBQUMsUUFBWixDQUFxQixNQUFNLENBQUMsV0FBNUIsQ0FBQSxJQUNBLENBQUEsQ0FBRSxDQUFDLENBQUMsTUFBSixDQUFXLENBQUMsT0FBWixDQUFvQixHQUFBLEdBQUksTUFBTSxDQUFDLFdBQS9CLENBQTZDLENBQUMsTUFBOUMsR0FBdUQsQ0FGekQ7QUFJRSxNQUFBLElBQUcsQ0FBQSxDQUFFLENBQUMsQ0FBQyxNQUFKLENBQVcsQ0FBQyxRQUFaLENBQXFCLE1BQU0sQ0FBQyxXQUE1QixDQUFIO0FBQ0UsUUFBQSxNQUFBLEdBQVMsQ0FBQSxDQUFFLENBQUMsQ0FBQyxNQUFKLENBQVQsQ0FERjtPQUFBLE1BQUE7QUFHRSxRQUFBLE1BQUEsR0FBUyxDQUFBLENBQUUsQ0FBQyxDQUFDLE1BQUosQ0FBVyxDQUFDLE9BQVosQ0FBb0IsR0FBQSxHQUFJLE1BQU0sQ0FBQyxXQUEvQixDQUE2QyxDQUFDLEtBQTlDLENBQUEsQ0FBVCxDQUhGO09BQUE7QUFBQSxNQUlBLENBQUEsR0FBUSxJQUFBLE1BQU0sQ0FBQyxNQUFQLENBQWMsSUFBQyxDQUFBLFNBQWYsRUFBMEIsTUFBTSxDQUFDLElBQVAsQ0FBWSxhQUFaLENBQTFCLENBSlIsQ0FBQTtBQUFBLE1BS0EsSUFBQyxDQUFBLE9BQU8sQ0FBQyxNQUFNLENBQUMsV0FBaEIsQ0FBNEIsQ0FBNUIsRUFBK0IsQ0FBL0IsQ0FMQSxDQUpGO0tBWEE7V0FxQkEsS0F2Qk87RUFBQSxDQTlDVCxDQUFBOztBQUFBLG1CQXVFQSxTQUFBLEdBQVcsU0FBQyxDQUFELEdBQUE7QUFDVCxRQUFBLDBKQUFBO0FBQUEsSUFBQSxPQUFBLEdBQVUsSUFBQyxDQUFBLGdCQUFnQixDQUFDLElBQWxCLENBQXVCLEdBQUEsR0FBSSxNQUFNLENBQUMsV0FBWCxHQUF1QixHQUF2QixHQUEwQixNQUFNLENBQUMsYUFBeEQsQ0FBVixDQUFBO0FBRUEsSUFBQSxJQUFHLE9BQU8sQ0FBQyxNQUFSLEdBQWlCLENBQXBCO0FBS0UsTUFBQSxNQUFBLEdBQVMsT0FBTyxDQUFDLEtBQVIsQ0FBQSxDQUFULENBQUE7QUFJQSxNQUFBLElBQ0UsSUFBSSxDQUFDLEdBQUwsQ0FBUyxDQUFDLENBQUMsS0FBRixHQUFVLE1BQU0sQ0FBQyxJQUFQLENBQVksbUJBQVosQ0FBbkIsQ0FBQSxHQUF1RCxDQUF2RCxJQUNBLElBQUksQ0FBQyxHQUFMLENBQVMsQ0FBQyxDQUFDLEtBQUYsR0FBVSxNQUFNLENBQUMsSUFBUCxDQUFZLG1CQUFaLENBQW5CLENBQUEsR0FBdUQsQ0FGekQ7QUFJRSxRQUFBLElBQUMsQ0FBQSxTQUFTLENBQUMsSUFBWCxDQUFnQixHQUFBLEdBQUcsQ0FBQyxNQUFNLENBQUMsSUFBUCxDQUFZLGNBQVosQ0FBRCxDQUFuQixDQUFrRCxDQUFDLFdBQW5ELENBQStELFFBQS9ELENBQUEsQ0FKRjtPQUpBO0FBQUEsTUFZQSxTQUFBLEdBQWdCLENBQUMsQ0FBQyxLQUFGLEdBQVUsSUFBQyxDQUFBLFNBQVMsQ0FBQyxNQUFYLENBQUEsQ0FBbUIsQ0FBQyxJQVo5QyxDQUFBO0FBQUEsTUFhQSxRQUFBLEdBQWdCLENBQUMsQ0FBQyxLQUFGLEdBQVUsSUFBQyxDQUFBLFNBQVMsQ0FBQyxNQUFYLENBQUEsQ0FBbUIsQ0FBQyxHQWI5QyxDQUFBO0FBQUEsTUFjQSxTQUFBLEdBQWdCLElBQUMsQ0FBQSxTQUFTLENBQUMsS0FBWCxDQUFBLENBZGhCLENBQUE7QUFBQSxNQWVBLFVBQUEsR0FBZ0IsSUFBQyxDQUFBLFNBQVMsQ0FBQyxNQUFYLENBQUEsQ0FmaEIsQ0FBQTtBQUFBLE1BZ0JBLFVBQUEsR0FBZ0IsU0FBQSxHQUFZLENBQUMsTUFBTSxDQUFDLFVBQVAsQ0FBQSxDQUFBLEdBQXNCLENBQXZCLENBaEI1QixDQUFBO0FBQUEsTUFpQkEsU0FBQSxHQUFnQixRQUFBLEdBQVcsQ0FBQyxNQUFNLENBQUMsV0FBUCxDQUFBLENBQUEsR0FBdUIsQ0FBeEIsQ0FqQjNCLENBQUE7QUFBQSxNQWtCQSxXQUFBLEdBQWdCLFNBQUEsR0FBWSxDQUFDLE1BQU0sQ0FBQyxVQUFQLENBQUEsQ0FBQSxHQUFzQixDQUF2QixDQWxCNUIsQ0FBQTtBQUFBLE1BbUJBLFlBQUEsR0FBZ0IsUUFBQSxHQUFXLENBQUMsTUFBTSxDQUFDLFdBQVAsQ0FBQSxDQUFBLEdBQXVCLENBQXhCLENBbkIzQixDQUFBO0FBQUEsTUFvQkEsV0FBQSxHQUFnQixNQUFNLENBQUMsVUFBUCxDQUFBLENBcEJoQixDQUFBO0FBQUEsTUFxQkEsWUFBQSxHQUFnQixNQUFNLENBQUMsV0FBUCxDQUFBLENBckJoQixDQUFBO0FBMEJBLE1BQUEsSUFBRyxVQUFBLElBQWMsQ0FBakI7QUFDRSxRQUFBLE9BQUEsR0FBVSxDQUFWLENBREY7T0FBQSxNQUVLLElBQUcsV0FBQSxHQUFjLFNBQWpCO0FBQ0gsUUFBQSxPQUFBLEdBQVUsVUFBVixDQURHO09BQUEsTUFBQTtBQUdILFFBQUEsT0FBQSxHQUFVLFNBQUEsR0FBWSxXQUF0QixDQUhHO09BNUJMO0FBb0NBLE1BQUEsSUFBRyxTQUFBLElBQWEsQ0FBaEI7QUFDRSxRQUFBLE9BQUEsR0FBVSxDQUFWLENBREY7T0FBQSxNQUVLLElBQUcsWUFBQSxHQUFlLFVBQWxCO0FBQ0gsUUFBQSxPQUFBLEdBQVUsU0FBVixDQURHO09BQUEsTUFBQTtBQUdILFFBQUEsT0FBQSxHQUFVLFVBQUEsR0FBYSxZQUF2QixDQUhHO09BdENMO2FBNkNBLE1BQU0sQ0FBQyxHQUFQLENBQ0U7QUFBQSxRQUFBLElBQUEsRUFBTSxPQUFOO0FBQUEsUUFDQSxHQUFBLEVBQUssT0FETDtPQURGLEVBbERGO0tBSFM7RUFBQSxDQXZFWCxDQUFBOztnQkFBQTs7SUE5TEYsQ0FBQTs7QUFBQSxNQThUWSxDQUFDLElBQUksQ0FBQztBQUlILEVBQUEsa0JBQUMsUUFBRCxHQUFBO0FBRVgsSUFGWSxJQUFDLENBQUEsVUFBRCxRQUVaLENBQUE7QUFBQSwyQ0FBQSxDQUFBO0FBQUEseUNBQUEsQ0FBQTtBQUFBLDJDQUFBLENBQUE7QUFBQSwrQ0FBQSxDQUFBO0FBQUEsK0NBQUEsQ0FBQTtBQUFBLDZDQUFBLENBQUE7QUFBQSwrRUFBQSxDQUFBO0FBQUEscURBQUEsQ0FBQTtBQUFBLDJEQUFBLENBQUE7QUFBQSw2RUFBQSxDQUFBO0FBQUEsMkVBQUEsQ0FBQTtBQUFBLHFEQUFBLENBQUE7QUFBQSwrQ0FBQSxDQUFBO0FBQUEsdURBQUEsQ0FBQTtBQUFBLHlEQUFBLENBQUE7QUFBQSwyRUFBQSxDQUFBO0FBQUEseUVBQUEsQ0FBQTtBQUFBLG1EQUFBLENBQUE7QUFBQSw2Q0FBQSxDQUFBO0FBQUEseUNBQUEsQ0FBQTtBQUFBLDZDQUFBLENBQUE7QUFBQSw2REFBQSxDQUFBO0FBQUEsK0RBQUEsQ0FBQTtBQUFBLHlEQUFBLENBQUE7QUFBQSxpREFBQSxDQUFBO0FBQUEsK0RBQUEsQ0FBQTtBQUFBLHVEQUFBLENBQUE7QUFBQSxpREFBQSxDQUFBO0FBQUEseUNBQUEsQ0FBQTtBQUFBLElBQUEsSUFBQyxDQUFBLFNBQUQsR0FBYSxJQUFDLENBQUEsT0FBTyxDQUFDLFNBQXRCLENBQUE7QUFBQSxJQUNBLElBQUMsQ0FBQSxnQkFBRCxHQUFvQixJQUFDLENBQUEsU0FBUyxDQUFDLElBQVgsQ0FBZ0IsR0FBQSxHQUFJLE1BQU0sQ0FBQyxvQkFBM0IsQ0FEcEIsQ0FBQTtBQUFBLElBRUEsSUFBQyxDQUFBLEtBQUQsR0FBUyxJQUFDLENBQUEsU0FBUyxDQUFDLElBQVgsQ0FBZ0IsS0FBaEIsQ0FBc0IsQ0FBQyxLQUF2QixDQUFBLENBRlQsQ0FBQTtBQUFBLElBR0EsSUFBQyxDQUFBLE1BQUQsR0FBVSxNQUFNLENBQUMsWUFBUCxDQUFBLENBSFYsQ0FBQTtBQUFBLElBSUEsSUFBQyxDQUFBLGdCQUFnQixDQUFDLElBQWxCLENBQXVCLGNBQXZCLEVBQXVDLElBQUMsQ0FBQSxNQUF4QyxDQUpBLENBQUE7QUFBQSxJQU1BLElBQUMsQ0FBQSxhQUFELEdBQ0U7QUFBQSxNQUFBLE1BQUEsRUFBZ0IsQ0FBaEI7QUFBQSxNQUNBLEtBQUEsRUFBZ0IsQ0FEaEI7QUFBQSxNQUVBLEtBQUEsRUFBZ0IsSUFBQyxDQUFBLEtBQUssQ0FBQyxLQUFQLENBQUEsQ0FGaEI7QUFBQSxNQUdBLE1BQUEsRUFBZ0IsSUFBQyxDQUFBLEtBQUssQ0FBQyxNQUFQLENBQUEsQ0FIaEI7QUFBQSxNQUlBLEtBQUEsRUFBZ0IsQ0FKaEI7QUFBQSxNQUtBLFNBQUEsRUFBVyxHQUxYO0tBUEYsQ0FBQTtBQUFBLElBYUEsSUFBQyxDQUFBLGFBQUQsQ0FBQSxDQWJBLENBRlc7RUFBQSxDQUFiOztBQUFBLHFCQW9CQSxNQUFBLEdBQUssU0FBQSxHQUFBO0FBRUgsSUFBQSxJQUFDLENBQUEsU0FBUyxDQUFDLE9BQVgsQ0FBbUIsNEpBQW5CLENBQUEsQ0FBQTtBQUFBLElBTUEsSUFBQyxDQUFBLFNBQVMsQ0FBQyxJQUFYLENBQWdCLHlCQUFoQixDQUEwQyxDQUFDLEtBQTNDLENBQWlELENBQUEsU0FBQSxLQUFBLEdBQUE7YUFBQSxTQUFDLENBQUQsR0FBQTtBQUMvQyxRQUFBLENBQUMsQ0FBQyxjQUFGLENBQUEsQ0FBQSxDQUFBO2VBQ0EsS0FBQyxDQUFBLE1BQUQsQ0FBQSxFQUYrQztNQUFBLEVBQUE7SUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQWpELENBTkEsQ0FBQTtBQUFBLElBU0EsSUFBQyxDQUFBLFNBQVMsQ0FBQyxJQUFYLENBQWdCLDBCQUFoQixDQUEyQyxDQUFDLEtBQTVDLENBQWtELENBQUEsU0FBQSxLQUFBLEdBQUE7YUFBQSxTQUFDLENBQUQsR0FBQTtBQUNoRCxRQUFBLENBQUMsQ0FBQyxjQUFGLENBQUEsQ0FBQSxDQUFBO2VBQ0EsS0FBQyxDQUFBLE9BQUQsQ0FBQSxFQUZnRDtNQUFBLEVBQUE7SUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQWxELENBVEEsQ0FBQTtBQUFBLElBYUEsSUFBQyxDQUFBLFNBQVMsQ0FBQyxFQUFYLENBQWMsVUFBZCxFQUEwQixJQUFDLENBQUEsUUFBM0IsQ0FiQSxDQUFBO0FBQUEsSUFjQSxJQUFDLENBQUEsU0FBUyxDQUFDLEVBQVgsQ0FBYyxXQUFkLEVBQTJCLElBQUMsQ0FBQSxTQUE1QixDQWRBLENBQUE7QUFBQSxJQWVBLENBQUEsQ0FBRSxRQUFGLENBQVcsQ0FBQyxFQUFaLENBQWUsV0FBZixFQUE0QixJQUFDLENBQUEsU0FBN0IsQ0FmQSxDQUFBO1dBZ0JBLENBQUEsQ0FBRSxRQUFGLENBQVcsQ0FBQyxFQUFaLENBQWUsU0FBZixFQUEwQixJQUFDLENBQUEsT0FBM0IsRUFsQkc7RUFBQSxDQXBCTCxDQUFBOztBQUFBLHFCQXdDQSxVQUFBLEdBQVksU0FBQSxHQUFBO0FBQ1YsSUFBQSxJQUFDLENBQUEsYUFBRCxHQUNFO0FBQUEsTUFBQSxNQUFBLEVBQWdCLENBQWhCO0FBQUEsTUFDQSxLQUFBLEVBQWdCLENBRGhCO0FBQUEsTUFFQSxLQUFBLEVBQWdCLElBQUMsQ0FBQSxLQUFLLENBQUMsS0FBUCxDQUFBLENBRmhCO0FBQUEsTUFHQSxNQUFBLEVBQWdCLElBQUMsQ0FBQSxLQUFLLENBQUMsTUFBUCxDQUFBLENBSGhCO0FBQUEsTUFJQSxLQUFBLEVBQWdCLENBSmhCO0FBQUEsTUFLQSxTQUFBLEVBQVcsR0FMWDtLQURGLENBQUE7V0FPQSxJQUFDLENBQUEsYUFBRCxDQUFBLEVBUlU7RUFBQSxDQXhDWixDQUFBOztBQUFBLHFCQW9EQSxhQUFBLEdBQWUsU0FBQSxHQUFBO0FBQ2IsSUFBQSxJQUFDLENBQUEsS0FBSyxDQUFDLEdBQVAsQ0FDRTtBQUFBLE1BQUEsSUFBQSxFQUFTLElBQUMsQ0FBQSxhQUFhLENBQUMsTUFBaEIsR0FBdUIsSUFBL0I7QUFBQSxNQUNBLEdBQUEsRUFBUSxJQUFDLENBQUEsYUFBYSxDQUFDLEtBQWhCLEdBQXNCLElBRDdCO0FBQUEsTUFFQSxLQUFBLEVBQVMsQ0FBQyxJQUFDLENBQUEsYUFBYSxDQUFDLEtBQWYsR0FBdUIsS0FBeEIsQ0FBQSxHQUE4QixHQUZ2QztBQUFBLE1BR0EsTUFBQSxFQUFRLE1BSFI7S0FERixDQUFBLENBQUE7V0FLQSxJQUFDLENBQUEsVUFBRCxDQUFBLEVBTmE7RUFBQSxDQXBEZixDQUFBOztBQUFBLHFCQTREQSxpQkFBQSxHQUFtQixTQUFBLEdBQUE7QUFDakIsSUFBQSxJQUFDLENBQUEsS0FBSyxDQUFDLE9BQVAsQ0FDRTtBQUFBLE1BQUEsSUFBQSxFQUFTLElBQUMsQ0FBQSxhQUFhLENBQUMsTUFBaEIsR0FBdUIsSUFBL0I7QUFBQSxNQUNBLEdBQUEsRUFBUSxJQUFDLENBQUEsYUFBYSxDQUFDLEtBQWhCLEdBQXNCLElBRDdCO0FBQUEsTUFFQSxLQUFBLEVBQVMsQ0FBQyxJQUFDLENBQUEsYUFBYSxDQUFDLEtBQWYsR0FBdUIsS0FBeEIsQ0FBQSxHQUE4QixHQUZ2QztBQUFBLE1BR0EsTUFBQSxFQUFRLE1BSFI7S0FERixFQUtFLEdBTEYsQ0FBQSxDQUFBO1dBTUEsSUFBQyxDQUFBLGNBQUQsQ0FBQSxFQVBpQjtFQUFBLENBNURuQixDQUFBOztBQUFBLHFCQXFFQSxVQUFBLEdBQVksU0FBQSxHQUFBO0FBQ1YsUUFBQSxrQ0FBQTtBQUFBLElBQUEsT0FBQSxHQUFVLElBQUMsQ0FBQSxTQUFTLENBQUMsSUFBWCxDQUFnQixHQUFBLEdBQUksTUFBTSxDQUFDLFdBQTNCLENBQVYsQ0FBQTtBQUNBLElBQUEsSUFBRyxPQUFPLENBQUMsTUFBUixHQUFpQixDQUFwQjtBQUNFLFdBQUEseUNBQUE7NEJBQUE7QUFDRSxRQUFBLElBQUEsR0FBTyxDQUFDLElBQUMsQ0FBQSxRQUFELENBQUEsQ0FBQSxHQUFjLENBQUMsQ0FBQSxDQUFFLE1BQUYsQ0FBUyxDQUFDLElBQVYsQ0FBZSxVQUFmLENBQUEsR0FBNkIsR0FBOUIsQ0FBZixDQUFBLEdBQ0wsSUFBQyxDQUFBLGFBQWEsQ0FBQyxNQURWLEdBQ21CLENBQUMsQ0FBQSxDQUFFLE1BQUYsQ0FBUyxDQUFDLFVBQVYsQ0FBQSxDQUFBLEdBQXlCLENBQTFCLENBRDFCLENBQUE7QUFBQSxRQUVBLEdBQUEsR0FBTSxDQUFDLElBQUMsQ0FBQSxTQUFELENBQUEsQ0FBQSxHQUFlLENBQUMsQ0FBQSxDQUFFLE1BQUYsQ0FBUyxDQUFDLElBQVYsQ0FBZSxVQUFmLENBQUEsR0FBNkIsR0FBOUIsQ0FBaEIsQ0FBQSxHQUNKLElBQUMsQ0FBQSxhQUFhLENBQUMsS0FEWCxHQUNtQixDQUFDLENBQUEsQ0FBRSxNQUFGLENBQVMsQ0FBQyxXQUFWLENBQUEsQ0FBQSxHQUEwQixDQUEzQixDQUh6QixDQUFBO0FBQUEsUUFJQSxDQUFBLENBQUUsTUFBRixDQUFTLENBQUMsR0FBVixDQUNFO0FBQUEsVUFBQSxJQUFBLEVBQVMsSUFBRCxHQUFNLElBQWQ7QUFBQSxVQUNBLEdBQUEsRUFBUSxHQUFELEdBQUssSUFEWjtTQURGLENBSkEsQ0FERjtBQUFBLE9BQUE7YUFRQSxJQUFDLENBQUEsaUJBQUQsQ0FBQSxFQVRGO0tBRlU7RUFBQSxDQXJFWixDQUFBOztBQUFBLHFCQWtGQSxjQUFBLEdBQWdCLFNBQUEsR0FBQTtBQUNkLFFBQUEsOENBQUE7QUFBQSxJQUFBLE9BQUEsR0FBVSxJQUFDLENBQUEsU0FBUyxDQUFDLElBQVgsQ0FBZ0IsR0FBQSxHQUFJLE1BQU0sQ0FBQyxXQUEzQixDQUFWLENBQUE7QUFDQSxJQUFBLElBQUcsT0FBTyxDQUFDLE1BQVIsR0FBaUIsQ0FBcEI7QUFDRTtXQUFBLHlDQUFBOzRCQUFBO0FBQ0UsUUFBQSxDQUFBLEdBQVEsSUFBQSxNQUFNLENBQUMsTUFBUCxDQUFjLElBQUMsQ0FBQSxTQUFmLEVBQTBCLENBQUEsQ0FBRSxNQUFGLENBQVMsQ0FBQyxJQUFWLENBQWUsYUFBZixDQUExQixDQUFSLENBQUE7QUFBQSxRQUNBLENBQUMsQ0FBQyxXQUFGLENBQUEsQ0FEQSxDQUFBO0FBQUEsUUFFQSxJQUFBLEdBQU8sQ0FBQyxJQUFDLENBQUEsUUFBRCxDQUFBLENBQUEsR0FBYyxDQUFDLENBQUEsQ0FBRSxNQUFGLENBQVMsQ0FBQyxJQUFWLENBQWUsVUFBZixDQUFBLEdBQTZCLEdBQTlCLENBQWYsQ0FBQSxHQUNMLElBQUMsQ0FBQSxhQUFhLENBQUMsTUFEVixHQUNtQixDQUFDLENBQUEsQ0FBRSxNQUFGLENBQVMsQ0FBQyxVQUFWLENBQUEsQ0FBQSxHQUF5QixDQUExQixDQUgxQixDQUFBO0FBQUEsUUFJQSxHQUFBLEdBQU0sQ0FBQyxJQUFDLENBQUEsU0FBRCxDQUFBLENBQUEsR0FBZSxDQUFDLENBQUEsQ0FBRSxNQUFGLENBQVMsQ0FBQyxJQUFWLENBQWUsVUFBZixDQUFBLEdBQTZCLEdBQTlCLENBQWhCLENBQUEsR0FDSixJQUFDLENBQUEsYUFBYSxDQUFDLEtBRFgsR0FDbUIsQ0FBQyxDQUFBLENBQUUsTUFBRixDQUFTLENBQUMsV0FBVixDQUFBLENBQUEsR0FBMEIsQ0FBM0IsQ0FMekIsQ0FBQTtBQUFBLHFCQU1HLENBQUEsU0FBQyxDQUFELEdBQUE7aUJBQ0QsQ0FBQSxDQUFFLE1BQUYsQ0FBUyxDQUFDLE9BQVYsQ0FDRTtBQUFBLFlBQUEsSUFBQSxFQUFTLElBQUQsR0FBTSxJQUFkO0FBQUEsWUFDQSxHQUFBLEVBQVEsR0FBRCxHQUFLLElBRFo7V0FERixFQUdFLEdBSEYsRUFHTyxDQUFBLFNBQUEsS0FBQSxHQUFBO21CQUFBLFNBQUEsR0FBQTtBQUNMLGNBQUEsQ0FBQyxDQUFDLGVBQUYsQ0FBQSxDQUFBLENBQUE7cUJBQ0EsQ0FBQyxDQUFDLGFBQUYsQ0FBQSxFQUZLO1lBQUEsRUFBQTtVQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FIUCxFQURDO1FBQUEsQ0FBQSxDQUFILENBQUksQ0FBSixFQU5BLENBREY7QUFBQTtxQkFERjtLQUZjO0VBQUEsQ0FsRmhCLENBQUE7O0FBQUEscUJBb0dBLGlCQUFBLEdBQW1CLFNBQUEsR0FBQTtBQUNqQixRQUFBLHNCQUFBO0FBQUE7QUFBQSxTQUFBLHFDQUFBO3NCQUFBO0FBQ0UsTUFBQSxDQUFBLEdBQVEsSUFBQSxNQUFNLENBQUMsTUFBUCxDQUFjLElBQUMsQ0FBQSxTQUFmLEVBQTBCLENBQUEsQ0FBRSxNQUFGLENBQVMsQ0FBQyxJQUFWLENBQWUsYUFBZixDQUExQixDQUFSLENBQUE7QUFBQSxNQUNBLENBQUMsQ0FBQyxlQUFGLENBQUEsQ0FEQSxDQURGO0FBQUEsS0FBQTtXQUdBLEtBSmlCO0VBQUEsQ0FwR25CLENBQUE7O0FBQUEscUJBMEdBLGdCQUFBLEdBQWtCLFNBQUEsR0FBQTtBQUNoQixRQUFBLHNCQUFBO0FBQUE7QUFBQSxTQUFBLHFDQUFBO3NCQUFBO0FBQ0UsTUFBQSxDQUFBLEdBQVEsSUFBQSxNQUFNLENBQUMsTUFBUCxDQUFjLElBQUMsQ0FBQSxTQUFmLEVBQTBCLENBQUEsQ0FBRSxNQUFGLENBQVMsQ0FBQyxJQUFWLENBQWUsYUFBZixDQUExQixDQUFSLENBQUE7QUFBQSxNQUNBLENBQUMsQ0FBQyxjQUFGLENBQUEsQ0FEQSxDQURGO0FBQUEsS0FBQTtXQUdBLEtBSmdCO0VBQUEsQ0ExR2xCLENBQUE7O0FBQUEscUJBZ0hBLFFBQUEsR0FBVSxTQUFDLE1BQUQsR0FBQTtBQUNSLFFBQUEsZ0JBQUE7QUFBQSxJQUFBLElBQUcsTUFBTyxDQUFBLENBQUEsQ0FBUCxJQUFhLEVBQWhCO0FBQXdCLE1BQUEsQ0FBQSxHQUFJLEdBQUEsR0FBTSxNQUFPLENBQUEsQ0FBQSxDQUFqQixDQUF4QjtLQUFBLE1BQUE7QUFBaUQsTUFBQSxDQUFBLEdBQUksTUFBTyxDQUFBLENBQUEsQ0FBWCxDQUFqRDtLQUFBO0FBQ0EsSUFBQSxJQUFHLE1BQU8sQ0FBQSxDQUFBLENBQVAsSUFBYSxFQUFoQjtBQUF3QixNQUFBLENBQUEsR0FBSSxHQUFBLEdBQU0sTUFBTyxDQUFBLENBQUEsQ0FBakIsQ0FBeEI7S0FBQSxNQUFBO0FBQWlELE1BQUEsQ0FBQSxHQUFJLE1BQU8sQ0FBQSxDQUFBLENBQVgsQ0FBakQ7S0FEQTtBQUFBLElBRUEsSUFBQSxHQUFPLEVBQUEsR0FBSyxDQUFDLElBQUMsQ0FBQSxjQUFELENBQUEsQ0FBQSxHQUFvQixDQUFyQixDQUZaLENBQUE7QUFBQSxJQUdBLElBQUEsR0FBTyxFQUFBLEdBQUssQ0FBQyxJQUFDLENBQUEsZUFBRCxDQUFBLENBQUEsR0FBcUIsQ0FBdEIsQ0FIWixDQUFBO0FBQUEsSUFNQSxJQUFDLENBQUEsU0FBUyxDQUFDLElBQVgsQ0FBZ0IsR0FBQSxHQUFJLE1BQU0sQ0FBQyxZQUEzQixDQUEwQyxDQUFDLFdBQTNDLENBQXVELFFBQXZELENBTkEsQ0FBQTtBQUFBLElBUUEsSUFBQyxDQUFBLGFBQWEsQ0FBQyxNQUFmLEdBQXdCLENBQUEsQ0FDdEIsQ0FBQyxJQUFDLENBQUEsUUFBRCxDQUFBLENBQUEsR0FBYyxDQUFDLE1BQU8sQ0FBQSxDQUFBLENBQVAsR0FBWSxHQUFiLENBQWYsQ0FBQSxHQUFvQyxDQUFDLElBQUMsQ0FBQSxjQUFELENBQUEsQ0FBQSxHQUFvQixDQUFyQixDQURaLENBUjFCLENBQUE7QUFBQSxJQVdBLElBQUMsQ0FBQSxhQUFhLENBQUMsS0FBZixHQUF1QixDQUFBLENBQ3JCLENBQUMsSUFBQyxDQUFBLFNBQUQsQ0FBQSxDQUFBLEdBQWUsQ0FBQyxNQUFPLENBQUEsQ0FBQSxDQUFQLEdBQVksR0FBYixDQUFoQixDQUFBLEdBQXFDLENBQUMsSUFBQyxDQUFBLGVBQUQsQ0FBQSxDQUFBLEdBQXFCLENBQXRCLENBRGQsQ0FYekIsQ0FBQTtBQWdCQSxXQUFNLENBQUMsSUFBQyxDQUFBLFFBQUQsQ0FBQSxDQUFBLEdBQWMsSUFBZixDQUFBLElBQXdCLENBQUMsSUFBQyxDQUFBLFNBQUQsQ0FBQSxDQUFBLEdBQWUsSUFBaEIsQ0FBOUIsR0FBQTtBQUNFLE1BQUEsSUFBQyxDQUFBLGFBQWEsQ0FBQyxLQUFmLEdBQXdCLElBQUMsQ0FBQSxhQUFhLENBQUMsS0FBZixHQUF1QixJQUFDLENBQUEsYUFBYSxDQUFDLFNBQTlELENBQUE7QUFBQSxNQUNBLElBQUMsQ0FBQSxhQUFhLENBQUMsTUFBZixHQUF3QixDQUFBLENBQ3RCLENBQUMsSUFBQyxDQUFBLFFBQUQsQ0FBQSxDQUFBLEdBQWMsQ0FBQyxNQUFPLENBQUEsQ0FBQSxDQUFQLEdBQVksR0FBYixDQUFmLENBQUEsR0FBb0MsQ0FBQyxJQUFDLENBQUEsY0FBRCxDQUFBLENBQUEsR0FBb0IsQ0FBckIsQ0FEWixDQUQxQixDQUFBO0FBQUEsTUFJQSxJQUFDLENBQUEsYUFBYSxDQUFDLEtBQWYsR0FBdUIsQ0FBQSxDQUNyQixDQUFDLElBQUMsQ0FBQSxTQUFELENBQUEsQ0FBQSxHQUFlLENBQUMsTUFBTyxDQUFBLENBQUEsQ0FBUCxHQUFZLEdBQWIsQ0FBaEIsQ0FBQSxHQUFxQyxDQUFDLElBQUMsQ0FBQSxlQUFELENBQUEsQ0FBQSxHQUFxQixDQUF0QixDQURkLENBSnpCLENBREY7SUFBQSxDQWhCQTtXQXdCQSxJQUFDLENBQUEsaUJBQUQsQ0FBQSxFQXpCUTtFQUFBLENBaEhWLENBQUE7O0FBQUEscUJBMklBLE1BQUEsR0FBUSxTQUFDLEtBQUQsR0FBQTtBQUNOLFFBQUEsQ0FBQTtBQUFBLElBQUEsQ0FBQSxHQUFJLElBQUMsQ0FBQSxhQUFhLENBQUMsU0FBbkIsQ0FBQTtBQUNBLElBQUEsSUFBTyxDQUFDLENBQUMsS0FBQSxHQUFRLENBQVQsQ0FBQSxHQUFjLENBQWYsQ0FBQSxLQUFxQixJQUFDLENBQUEsYUFBYSxDQUFDLEtBQTNDO0FBQ0UsTUFBQSxJQUFDLENBQUEsYUFBYSxDQUFDLEtBQWYsR0FBdUIsQ0FBQyxLQUFBLEdBQVEsQ0FBVCxDQUFBLEdBQWMsQ0FBZCxHQUFrQixDQUF6QyxDQUFBO2FBQ0EsSUFBQyxDQUFBLE9BQUQsQ0FBQSxFQUZGO0tBRk07RUFBQSxDQTNJUixDQUFBOztBQUFBLHFCQXFKQSxRQUFBLEdBQVUsU0FBQSxHQUFBO1dBQ1IsVUFBQSxDQUFXLElBQUMsQ0FBQSxhQUFhLENBQUMsS0FBZixHQUF1QixJQUFDLENBQUEsYUFBYSxDQUFDLEtBQWpELEVBRFE7RUFBQSxDQXJKVixDQUFBOztBQUFBLHFCQXdKQSxXQUFBLEdBQWEsU0FBQSxHQUFBO1dBQ1gsQ0FBQyxDQUFBLEdBQUksSUFBQyxDQUFBLGFBQWEsQ0FBQyxTQUFwQixDQUFBLEdBQWlDLElBQUMsQ0FBQSxhQUFhLENBQUMsS0FBZixDQUFBLEVBRHRCO0VBQUEsQ0F4SmIsQ0FBQTs7QUFBQSxxQkEySkEsc0JBQUEsR0FBd0IsU0FBQSxHQUFBO1dBQ3RCLFVBQUEsQ0FBVyxJQUFDLENBQUEsYUFBYSxDQUFDLEtBQWYsR0FBdUIsSUFBQyxDQUFBLGFBQWEsQ0FBQyxTQUFqRCxFQURzQjtFQUFBLENBM0p4QixDQUFBOztBQUFBLHFCQThKQSx1QkFBQSxHQUF5QixTQUFBLEdBQUE7V0FDdkIsVUFBQSxDQUFXLElBQUMsQ0FBQSxhQUFhLENBQUMsS0FBZixHQUF1QixJQUFDLENBQUEsYUFBYSxDQUFDLGVBQWpELEVBRHVCO0VBQUEsQ0E5SnpCLENBQUE7O0FBQUEscUJBaUtBLGNBQUEsR0FBZ0IsU0FBQSxHQUFBO1dBQ2QsVUFBQSxDQUFXLElBQUMsQ0FBQSxnQkFBZ0IsQ0FBQyxLQUFsQixDQUFBLENBQVgsRUFEYztFQUFBLENBaktoQixDQUFBOztBQUFBLHFCQXNLQSxhQUFBLEdBQWUsU0FBQSxHQUFBO1dBQ2IsSUFBSSxDQUFDLEdBQUwsQ0FBUyxVQUFBLENBQVcsSUFBQyxDQUFBLEtBQUssQ0FBQyxHQUFQLENBQVcsTUFBWCxDQUFYLENBQVQsRUFEYTtFQUFBLENBdEtmLENBQUE7O0FBQUEscUJBMktBLFNBQUEsR0FBVyxTQUFBLEdBQUE7V0FDVCxVQUFBLENBQVcsSUFBQyxDQUFBLGFBQWEsQ0FBQyxNQUFmLEdBQXdCLElBQUMsQ0FBQSxhQUFhLENBQUMsS0FBbEQsRUFEUztFQUFBLENBM0tYLENBQUE7O0FBQUEscUJBOEtBLFlBQUEsR0FBYyxTQUFBLEdBQUE7V0FDWixDQUFDLENBQUEsR0FBSSxJQUFDLENBQUEsYUFBYSxDQUFDLFNBQXBCLENBQUEsR0FBaUMsSUFBQyxDQUFBLGFBQWEsQ0FBQyxNQUFmLENBQUEsRUFEckI7RUFBQSxDQTlLZCxDQUFBOztBQUFBLHFCQWlMQSx1QkFBQSxHQUF5QixTQUFBLEdBQUE7V0FDdkIsVUFBQSxDQUFXLElBQUMsQ0FBQSxhQUFhLENBQUMsTUFBZixHQUF3QixJQUFDLENBQUEsYUFBYSxDQUFDLFNBQWxELEVBRHVCO0VBQUEsQ0FqTHpCLENBQUE7O0FBQUEscUJBb0xBLHdCQUFBLEdBQTBCLFNBQUEsR0FBQTtXQUN4QixVQUFBLENBQVcsSUFBQyxDQUFBLGFBQWEsQ0FBQyxNQUFmLEdBQXdCLElBQUMsQ0FBQSxhQUFhLENBQUMsZUFBbEQsRUFEd0I7RUFBQSxDQXBMMUIsQ0FBQTs7QUFBQSxxQkF1TEEsZUFBQSxHQUFpQixTQUFBLEdBQUE7V0FDZixVQUFBLENBQVcsSUFBQyxDQUFBLGdCQUFnQixDQUFDLE1BQWxCLENBQUEsQ0FBWCxFQURlO0VBQUEsQ0F2TGpCLENBQUE7O0FBQUEscUJBNExBLFlBQUEsR0FBYyxTQUFBLEdBQUE7V0FDWixJQUFJLENBQUMsR0FBTCxDQUFTLFVBQUEsQ0FBVyxJQUFDLENBQUEsS0FBSyxDQUFDLEdBQVAsQ0FBVyxLQUFYLENBQVgsQ0FBVCxFQURZO0VBQUEsQ0E1TGQsQ0FBQTs7QUFBQSxxQkFpTUEseUJBQUEsR0FBMkIsU0FBQyxDQUFELEdBQUE7V0FDekI7QUFBQSxNQUFBLElBQUEsRUFBTSxDQUFDLENBQUMsQ0FBQyxLQUFGLEdBQVUsSUFBQyxDQUFBLFNBQVMsQ0FBQyxNQUFYLENBQUEsQ0FBbUIsQ0FBQyxJQUEvQixDQUFBLEdBQXVDLElBQUMsQ0FBQSxjQUFELENBQUEsQ0FBN0M7QUFBQSxNQUNBLEdBQUEsRUFBTSxDQUFDLENBQUMsQ0FBQyxLQUFGLEdBQVUsSUFBQyxDQUFBLFNBQVMsQ0FBQyxNQUFYLENBQUEsQ0FBbUIsQ0FBQyxHQUEvQixDQUFBLEdBQXNDLElBQUMsQ0FBQSxlQUFELENBQUEsQ0FENUM7TUFEeUI7RUFBQSxDQWpNM0IsQ0FBQTs7QUFBQSxxQkF1TUEsUUFBQSxHQUFVLFNBQUMsQ0FBRCxHQUFBO0FBQ1IsUUFBQSxLQUFBO0FBQUEsSUFBQSxJQUFHLENBQUEsQ0FBRSxDQUFDLENBQUMsTUFBSixDQUFXLENBQUMsSUFBWixDQUFpQixjQUFqQixDQUFBLEtBQW9DLElBQUMsQ0FBQSxNQUF4QztBQUNFLE1BQUEsS0FBQSxHQUFRLElBQUMsQ0FBQSx5QkFBRCxDQUEyQixDQUEzQixDQUFSLENBQUE7YUFDQSxJQUFDLENBQUEsTUFBRCxDQUFRLE9BQVIsRUFBaUIsS0FBSyxDQUFDLElBQXZCLEVBQTZCLEtBQUssQ0FBQyxHQUFuQyxFQUZGO0tBRFE7RUFBQSxDQXZNVixDQUFBOztBQUFBLHFCQTRNQSxTQUFBLEdBQVcsU0FBQyxDQUFELEdBQUE7QUFDVCxRQUFBLE1BQUE7QUFBQSxJQUFBLElBQUcsQ0FBQSxDQUFFLENBQUMsQ0FBQyxNQUFKLENBQVcsQ0FBQyxJQUFaLENBQWlCLGNBQWpCLENBQUEsS0FBb0MsSUFBQyxDQUFBLE1BQXJDLElBQStDLENBQUMsQ0FBQyxLQUFGLEtBQVcsQ0FBN0Q7QUFDRSxNQUFBLElBQUMsQ0FBQSxVQUFELEdBQWMsSUFBZCxDQUFBO0FBQUEsTUFDQSxNQUFBLEdBQVMsSUFBQyxDQUFBLHlCQUFELENBQTJCLENBQTNCLENBRFQsQ0FBQTtBQUFBLE1BRUEsSUFBQyxDQUFBLFVBQUQsR0FDRTtBQUFBLFFBQUEsUUFBQSxFQUFVLE1BQVY7QUFBQSxRQUNBLE1BQUEsRUFDRTtBQUFBLFVBQUEsSUFBQSxFQUFNLENBQUEsR0FBSSxJQUFDLENBQUEsYUFBRCxDQUFBLENBQVY7QUFBQSxVQUNBLEdBQUEsRUFBSyxDQUFBLEdBQUksSUFBQyxDQUFBLFlBQUQsQ0FBQSxDQURUO1NBRkY7QUFBQSxRQUlBLEdBQUEsRUFDRTtBQUFBLFVBQUEsS0FBQSxFQUFPLENBQUMsTUFBTSxDQUFDLElBQVAsR0FBYyxJQUFDLENBQUEsY0FBRCxDQUFBLENBQWYsQ0FBQSxHQUFvQyxJQUFDLENBQUEsYUFBRCxDQUFBLENBQTNDO0FBQUEsVUFDQSxJQUFBLEVBQU0sQ0FBQyxNQUFNLENBQUMsSUFBUCxHQUFjLElBQUMsQ0FBQSxjQUFELENBQUEsQ0FBZixDQUFBLEdBQW9DLENBQUMsSUFBQyxDQUFBLFFBQUQsQ0FBQSxDQUFBLEdBQy9CLENBQUMsSUFBQyxDQUFBLGNBQUQsQ0FBQSxDQUFBLEdBQW9CLElBQUMsQ0FBQSxhQUFELENBQUEsQ0FBckIsQ0FEOEIsQ0FEMUM7QUFBQSxVQUdBLE1BQUEsRUFBUSxDQUFDLE1BQU0sQ0FBQyxHQUFQLEdBQWEsSUFBQyxDQUFBLGVBQUQsQ0FBQSxDQUFkLENBQUEsR0FBb0MsSUFBQyxDQUFBLFlBQUQsQ0FBQSxDQUg1QztBQUFBLFVBSUEsR0FBQSxFQUFLLENBQUMsTUFBTSxDQUFDLEdBQVAsR0FBYSxJQUFDLENBQUEsZUFBRCxDQUFBLENBQWQsQ0FBQSxHQUFvQyxDQUFDLElBQUMsQ0FBQSxTQUFELENBQUEsQ0FBQSxHQUM5QixDQUFDLElBQUMsQ0FBQSxlQUFELENBQUEsQ0FBQSxHQUFxQixJQUFDLENBQUEsWUFBRCxDQUFBLENBQXRCLENBRDZCLENBSnpDO1NBTEY7T0FIRixDQURGO0tBQUE7V0FlQSxLQWhCUztFQUFBLENBNU1YLENBQUE7O0FBQUEscUJBOE5BLFNBQUEsR0FBVyxTQUFDLENBQUQsR0FBQTtBQUNULFFBQUEsb0NBQUE7QUFBQSxJQUFBLElBQUcsSUFBQyxDQUFBLFVBQUo7QUFDRSxNQUFBLE1BQUEsR0FBUyxJQUFDLENBQUEseUJBQUQsQ0FBMkIsQ0FBM0IsQ0FBVCxDQUFBO0FBQUEsTUFDQSxRQUFBLEdBQVcsTUFBTSxDQUFDLElBQVAsR0FBYyxJQUFDLENBQUEsY0FBRCxDQUFBLENBRHpCLENBQUE7QUFBQSxNQUVBLE9BQUEsR0FBVSxNQUFNLENBQUMsR0FBUCxHQUFhLElBQUMsQ0FBQSxlQUFELENBQUEsQ0FGdkIsQ0FBQTtBQUdBLE1BQUEsSUFBRyxRQUFBLElBQVksSUFBQyxDQUFBLFVBQVUsQ0FBQyxHQUFHLENBQUMsSUFBNUIsSUFBb0MsUUFBQSxJQUFZLElBQUMsQ0FBQSxVQUFVLENBQUMsR0FBRyxDQUFDLEtBQW5FO0FBQ0UsUUFBQSxJQUFBLEdBQU8sQ0FBQyxNQUFNLENBQUMsSUFBUCxHQUFjLElBQUMsQ0FBQSxVQUFVLENBQUMsUUFBUSxDQUFDLElBQXBDLENBQUEsR0FBNEMsSUFBQyxDQUFBLGNBQUQsQ0FBQSxDQUFuRCxDQUFBO0FBQUEsUUFDQSxJQUFDLENBQUEsYUFBYSxDQUFDLE1BQWYsR0FBd0IsSUFBQyxDQUFBLFVBQVUsQ0FBQyxNQUFNLENBQUMsSUFBbkIsR0FBMEIsSUFEbEQsQ0FERjtPQUFBLE1BR0ssSUFBRyxRQUFBLEdBQVcsSUFBQyxDQUFBLFVBQVUsQ0FBQyxHQUFHLENBQUMsSUFBOUI7QUFDSCxRQUFBLElBQUMsQ0FBQSxhQUFhLENBQUMsTUFBZixHQUF3QixJQUFDLENBQUEsY0FBRCxDQUFBLENBQUEsR0FBb0IsSUFBQyxDQUFBLFFBQUQsQ0FBQSxDQUE1QyxDQURHO09BQUEsTUFFQSxJQUFHLFFBQUEsR0FBVyxJQUFDLENBQUEsVUFBVSxDQUFDLEdBQUcsQ0FBQyxLQUE5QjtBQUNILFFBQUEsSUFBQyxDQUFBLGFBQWEsQ0FBQyxNQUFmLEdBQXdCLENBQXhCLENBREc7T0FSTDtBQVVBLE1BQUEsSUFBRyxPQUFBLElBQVcsSUFBQyxDQUFBLFVBQVUsQ0FBQyxHQUFHLENBQUMsR0FBM0IsSUFBa0MsT0FBQSxJQUFXLElBQUMsQ0FBQSxVQUFVLENBQUMsR0FBRyxDQUFDLE1BQWhFO0FBQ0UsUUFBQSxHQUFBLEdBQU0sQ0FBQyxNQUFNLENBQUMsR0FBUCxHQUFhLElBQUMsQ0FBQSxVQUFVLENBQUMsUUFBUSxDQUFDLEdBQW5DLENBQUEsR0FBMEMsSUFBQyxDQUFBLGVBQUQsQ0FBQSxDQUFoRCxDQUFBO0FBQUEsUUFDQSxJQUFDLENBQUEsYUFBYSxDQUFDLEtBQWYsR0FBdUIsSUFBQyxDQUFBLFVBQVUsQ0FBQyxNQUFNLENBQUMsR0FBbkIsR0FBeUIsR0FEaEQsQ0FERjtPQUFBLE1BR0ssSUFBRyxPQUFBLEdBQVUsSUFBQyxDQUFBLFVBQVUsQ0FBQyxHQUFHLENBQUMsR0FBN0I7QUFDSCxRQUFBLElBQUMsQ0FBQSxhQUFhLENBQUMsS0FBZixHQUF1QixJQUFDLENBQUEsZUFBRCxDQUFBLENBQUEsR0FBcUIsSUFBQyxDQUFBLFNBQUQsQ0FBQSxDQUE1QyxDQURHO09BQUEsTUFFQSxJQUFHLE9BQUEsR0FBVSxJQUFDLENBQUEsVUFBVSxDQUFDLEdBQUcsQ0FBQyxNQUE3QjtBQUNILFFBQUEsSUFBQyxDQUFBLGFBQWEsQ0FBQyxLQUFmLEdBQXVCLENBQXZCLENBREc7T0FmTDtBQUFBLE1BaUJBLElBQUMsQ0FBQSxhQUFELENBQUEsQ0FqQkEsQ0FERjtLQUFBO1dBbUJBLEtBcEJTO0VBQUEsQ0E5TlgsQ0FBQTs7QUFBQSxxQkFvUEEsT0FBQSxHQUFTLFNBQUMsQ0FBRCxHQUFBO0FBQ1AsSUFBQSxJQUFDLENBQUEsVUFBRCxHQUFjLEtBQWQsQ0FBQTtBQUFBLElBQ0EsSUFBQyxDQUFBLGlCQUFELENBQUEsQ0FEQSxDQUFBO1dBRUEsS0FITztFQUFBLENBcFBULENBQUE7O0FBQUEscUJBMlBBLE1BQUEsR0FBUSxTQUFBLEdBQUE7QUFDTixJQUFBLElBQUMsQ0FBQSxhQUFhLENBQUMsS0FBZixHQUF3QixJQUFDLENBQUEsYUFBYSxDQUFDLEtBQWYsR0FBdUIsSUFBQyxDQUFBLGFBQWEsQ0FBQyxTQUE5RCxDQUFBO0FBQUEsSUFDQSxJQUFDLENBQUEsYUFBYSxDQUFDLE1BQWYsR0FBd0IsQ0FBQSxJQUFHLENBQUEsYUFBRCxDQUFBLENBQUYsR0FBcUIsQ0FBQyxJQUFDLENBQUEsc0JBQUQsQ0FBQSxDQUFBLEdBQTRCLENBQTdCLENBRDdDLENBQUE7QUFBQSxJQUVBLElBQUMsQ0FBQSxhQUFhLENBQUMsS0FBZixHQUF3QixDQUFBLElBQUcsQ0FBQSxZQUFELENBQUEsQ0FBRixHQUFvQixDQUFDLElBQUMsQ0FBQSx1QkFBRCxDQUFBLENBQUEsR0FBNkIsQ0FBOUIsQ0FGNUMsQ0FBQTtXQUdBLElBQUMsQ0FBQSxpQkFBRCxDQUFBLEVBSk07RUFBQSxDQTNQUixDQUFBOztBQUFBLHFCQWlRQSxPQUFBLEdBQVMsU0FBQSxHQUFBO0FBQ1AsUUFBQSxhQUFBO0FBQUEsSUFBQSxJQUFHLElBQUMsQ0FBQSxhQUFhLENBQUMsS0FBZixHQUF1QixDQUExQjtBQUNFLE1BQUEsSUFBQyxDQUFBLGFBQWEsQ0FBQyxLQUFmLEdBQXdCLElBQUMsQ0FBQSxhQUFhLENBQUMsS0FBZixHQUF1QixJQUFDLENBQUEsYUFBYSxDQUFDLFNBQTlELENBQUE7QUFBQSxNQUNBLE1BQUEsR0FBUyxDQUFBLElBQUcsQ0FBQSxhQUFELENBQUEsQ0FBRixHQUFxQixDQUFDLElBQUMsQ0FBQSxzQkFBRCxDQUFBLENBQUEsR0FBNEIsQ0FBN0IsQ0FEOUIsQ0FBQTtBQUFBLE1BRUEsS0FBQSxHQUFTLENBQUEsSUFBRyxDQUFBLFlBQUQsQ0FBQSxDQUFGLEdBQW9CLENBQUMsSUFBQyxDQUFBLHVCQUFELENBQUEsQ0FBQSxHQUE2QixDQUE5QixDQUY3QixDQUFBO0FBR0EsTUFBQSxJQUFHLE1BQUEsR0FBUyxDQUFaO0FBQ0UsUUFBQSxJQUFDLENBQUEsYUFBYSxDQUFDLE1BQWYsR0FBd0IsQ0FBeEIsQ0FERjtPQUFBLE1BRUssSUFBRyxNQUFBLEdBQVMsSUFBQyxDQUFBLGNBQUQsQ0FBQSxDQUFBLEdBQW9CLElBQUMsQ0FBQSxRQUFELENBQUEsQ0FBaEM7QUFDSCxRQUFBLElBQUMsQ0FBQSxhQUFhLENBQUMsTUFBZixHQUF3QixJQUFDLENBQUEsY0FBRCxDQUFBLENBQUEsR0FBb0IsSUFBQyxDQUFBLFFBQUQsQ0FBQSxDQUE1QyxDQURHO09BQUEsTUFBQTtBQUdILFFBQUEsSUFBQyxDQUFBLGFBQWEsQ0FBQyxNQUFmLEdBQXdCLE1BQXhCLENBSEc7T0FMTDtBQVNBLE1BQUEsSUFBRyxLQUFBLEdBQVEsQ0FBWDtBQUNFLFFBQUEsSUFBQyxDQUFBLGFBQWEsQ0FBQyxLQUFmLEdBQXVCLENBQXZCLENBREY7T0FBQSxNQUVLLElBQUcsS0FBQSxHQUFRLElBQUMsQ0FBQSxlQUFELENBQUEsQ0FBQSxHQUFxQixJQUFDLENBQUEsU0FBRCxDQUFBLENBQWhDO0FBQ0gsUUFBQSxJQUFDLENBQUEsYUFBYSxDQUFDLEtBQWYsR0FBdUIsSUFBQyxDQUFBLGVBQUQsQ0FBQSxDQUFBLEdBQXFCLElBQUMsQ0FBQSxTQUFELENBQUEsQ0FBNUMsQ0FERztPQUFBLE1BQUE7QUFHSCxRQUFBLElBQUMsQ0FBQSxhQUFhLENBQUMsS0FBZixHQUF1QixLQUF2QixDQUhHO09BWEw7YUFlQSxJQUFDLENBQUEsaUJBQUQsQ0FBQSxFQWhCRjtLQURPO0VBQUEsQ0FqUVQsQ0FBQTs7a0JBQUE7O0lBbFVGLENBQUE7O0FBQUEsTUFzbEJZLENBQUM7QUFFRSxFQUFBLGdCQUFDLFNBQUQsRUFBYSxFQUFiLEdBQUE7QUFHWCxJQUhZLElBQUMsQ0FBQSxZQUFELFNBR1osQ0FBQTtBQUFBLHlDQUFBLENBQUE7QUFBQSx5Q0FBQSxDQUFBO0FBQUEscURBQUEsQ0FBQTtBQUFBLG1DQUFBLENBQUE7QUFBQSxtREFBQSxDQUFBO0FBQUEseURBQUEsQ0FBQTtBQUFBLDJEQUFBLENBQUE7QUFBQSx1REFBQSxDQUFBO0FBQUEsdURBQUEsQ0FBQTtBQUFBLG1EQUFBLENBQUE7QUFBQSxtREFBQSxDQUFBO0FBQUEseURBQUEsQ0FBQTtBQUFBLG1EQUFBLENBQUE7QUFBQSwyQ0FBQSxDQUFBO0FBQUEsaUNBQUEsQ0FBQTtBQUFBLDZDQUFBLENBQUE7QUFBQSx1Q0FBQSxDQUFBO0FBQUEsNkRBQUEsQ0FBQTtBQUFBLDZDQUFBLENBQUE7QUFBQSxJQUFBLElBQUMsQ0FBQSxnQkFBRCxHQUFvQixJQUFDLENBQUEsU0FBUyxDQUFDLElBQVgsQ0FBZ0IsR0FBQSxHQUFJLE1BQU0sQ0FBQyxvQkFBM0IsQ0FBcEIsQ0FBQTtBQUNBLElBQUEsSUFBRyxJQUFDLENBQUEsU0FBUyxDQUFDLElBQVgsQ0FBZ0IsR0FBQSxHQUFJLE1BQU0sQ0FBQyxjQUFYLEdBQTBCLFFBQTFDLENBQWtELENBQUMsTUFBbkQsR0FBNEQsQ0FBL0Q7QUFDRSxNQUFBLElBQUMsQ0FBQSxLQUFELEdBQVMsSUFBQyxDQUFBLFNBQVMsQ0FBQyxJQUFYLENBQWdCLEdBQUEsR0FBSSxNQUFNLENBQUMsY0FBWCxHQUEwQixRQUExQyxDQUFrRCxDQUFDLEtBQW5ELENBQUEsQ0FBVCxDQURGO0tBREE7QUFBQSxJQUtBLElBQUMsQ0FBQSxNQUFELEdBQVUsSUFBQyxDQUFBLGdCQUFnQixDQUFDLElBQWxCLENBQ1IsR0FBQSxHQUFJLE1BQU0sQ0FBQyxXQUFYLEdBQXVCLGdCQUF2QixHQUF1QyxFQUF2QyxHQUEwQyxJQURsQyxDQUVULENBQUMsS0FGUSxDQUFBLENBTFYsQ0FBQTtBQUFBLElBVUEsSUFWQSxDQUhXO0VBQUEsQ0FBYjs7QUFBQSxtQkFpQkEsUUFBQSxHQUFVLFNBQUEsR0FBQTtBQUNSLFFBQUEsMENBQUE7QUFBQSxJQUFBLEdBQUEsR0FBTSxJQUFDLENBQUEsTUFBTSxDQUFDLFFBQVIsQ0FBQSxDQUFrQixDQUFDLElBQW5CLEdBQTBCLENBQUMsSUFBQyxDQUFBLE1BQU0sQ0FBQyxVQUFSLENBQUEsQ0FBQSxHQUF1QixDQUF4QixDQUFoQyxDQUFBO0FBQUEsSUFDQSxHQUFBLEdBQU0sSUFBQyxDQUFBLE1BQU0sQ0FBQyxRQUFSLENBQUEsQ0FBa0IsQ0FBQyxHQUFuQixHQUF5QixDQUFDLElBQUMsQ0FBQSxNQUFNLENBQUMsV0FBUixDQUFBLENBQUEsR0FBd0IsQ0FBekIsQ0FEL0IsQ0FBQTtBQUVBLElBQUEsSUFBRyxJQUFDLENBQUEsS0FBSjtBQUNFLE1BQUEsSUFBQSxHQUFPLElBQUMsQ0FBQSxLQUFLLENBQUMsS0FBUCxDQUFBLENBQVAsQ0FBQTtBQUFBLE1BQ0EsSUFBQSxHQUFPLElBQUMsQ0FBQSxLQUFLLENBQUMsTUFBUCxDQUFBLENBRFAsQ0FBQTtBQUFBLE1BRUEsSUFBQSxHQUFPLFFBQUEsQ0FBUyxJQUFDLENBQUEsS0FBSyxDQUFDLEdBQVAsQ0FBVyxNQUFYLENBQVQsQ0FGUCxDQUFBO0FBQUEsTUFHQSxJQUFBLEdBQU8sUUFBQSxDQUFTLElBQUMsQ0FBQSxLQUFLLENBQUMsR0FBUCxDQUFXLEtBQVgsQ0FBVCxDQUhQLENBQUE7QUFBQSxNQUlBLEdBQUEsR0FBTSxDQUFDLENBQUMsR0FBQSxHQUFNLElBQUksQ0FBQyxHQUFMLENBQVMsSUFBVCxDQUFQLENBQUEsR0FBeUIsSUFBMUIsQ0FBQSxHQUFrQyxHQUp4QyxDQUFBO0FBQUEsTUFLQSxHQUFBLEdBQU0sQ0FBQyxDQUFDLEdBQUEsR0FBTSxJQUFJLENBQUMsR0FBTCxDQUFTLElBQVQsQ0FBUCxDQUFBLEdBQXlCLElBQTFCLENBQUEsR0FBa0MsR0FMeEMsQ0FERjtLQUFBLE1BQUE7QUFRRSxNQUFBLEdBQUEsR0FBTSxDQUFDLEdBQUEsR0FBTSxJQUFDLENBQUEsU0FBUyxDQUFDLEtBQVgsQ0FBQSxDQUFQLENBQUEsR0FBNkIsR0FBbkMsQ0FBQTtBQUFBLE1BQ0EsR0FBQSxHQUFNLENBQUMsR0FBQSxHQUFNLElBQUMsQ0FBQSxTQUFTLENBQUMsTUFBWCxDQUFBLENBQVAsQ0FBQSxHQUE4QixHQURwQyxDQVJGO0tBRkE7V0FZQSxDQUFDLEdBQUQsRUFBTSxHQUFOLEVBYlE7RUFBQSxDQWpCVixDQUFBOztBQUFBLG1CQWdDQSxnQkFBQSxHQUFrQixTQUFBLEdBQUE7QUFDaEIsUUFBQSxrQkFBQTtBQUFBLElBQUEsR0FBQSxHQUFNLElBQUMsQ0FBQSxNQUFNLENBQUMsUUFBUixDQUFBLENBQWtCLENBQUMsSUFBbkIsR0FBMEIsQ0FBQyxJQUFDLENBQUEsTUFBTSxDQUFDLFVBQVIsQ0FBQSxDQUFBLEdBQXVCLENBQXhCLENBQWhDLENBQUE7QUFBQSxJQUNBLEdBQUEsR0FBTSxJQUFDLENBQUEsTUFBTSxDQUFDLFFBQVIsQ0FBQSxDQUFrQixDQUFDLEdBQW5CLEdBQXlCLENBQUMsSUFBQyxDQUFBLE1BQU0sQ0FBQyxXQUFSLENBQUEsQ0FBQSxHQUF3QixDQUF6QixDQUQvQixDQUFBO0FBQUEsSUFFQSxHQUFBLEdBQU0sQ0FBQyxHQUFBLEdBQU0sSUFBQyxDQUFBLFNBQVMsQ0FBQyxLQUFYLENBQUEsQ0FBUCxDQUFBLEdBQTZCLEdBRm5DLENBQUE7QUFBQSxJQUdBLEdBQUEsR0FBTSxDQUFDLEdBQUEsR0FBTSxJQUFDLENBQUEsU0FBUyxDQUFDLE1BQVgsQ0FBQSxDQUFQLENBQUEsR0FBOEIsR0FIcEMsQ0FBQTtXQUlBLENBQUMsR0FBRCxFQUFNLEdBQU4sRUFMZ0I7RUFBQSxDQWhDbEIsQ0FBQTs7QUFBQSxtQkF5Q0EsS0FBQSxHQUFPLFNBQUEsR0FBQTtXQUNMLElBQUMsQ0FBQSxNQUFNLENBQUMsR0FBUixDQUFZLGlCQUFaLEVBREs7RUFBQSxDQXpDUCxDQUFBOztBQUFBLG1CQTRDQSxRQUFBLEdBQVUsU0FBQSxHQUFBO1dBQ1IsSUFBQyxDQUFBLE1BQU0sQ0FBQyxJQUFSLENBQWEsYUFBYixFQURRO0VBQUEsQ0E1Q1YsQ0FBQTs7QUFBQSxtQkErQ0EsRUFBQSxHQUFJLFNBQUEsR0FBQTtXQUNGLElBQUMsQ0FBQSxNQUFNLENBQUMsSUFBUixDQUFhLFNBQWIsRUFERTtFQUFBLENBL0NKLENBQUE7O0FBQUEsbUJBb0RBLE9BQUEsR0FBUyxTQUFBLEdBQUE7QUFDUCxRQUFBLE9BQUE7QUFBQSxJQUFBLE9BQUEsR0FBVSxJQUFDLENBQUEsU0FBUyxDQUFDLElBQVgsQ0FBZ0IsR0FBQSxHQUFHLENBQUMsSUFBQyxDQUFBLE1BQU0sQ0FBQyxJQUFSLENBQWEsY0FBYixDQUFELENBQW5CLENBQVYsQ0FBQTtBQUNBLElBQUEsSUFBRyxPQUFPLENBQUMsTUFBUixHQUFpQixDQUFwQjthQUEyQixRQUEzQjtLQUFBLE1BQUE7YUFBd0MsS0FBeEM7S0FGTztFQUFBLENBcERULENBQUE7O0FBQUEsbUJBd0RBLFdBQUEsR0FBYSxTQUFBLEdBQUE7QUFDWCxJQUFBLElBQUcsSUFBQyxDQUFBLE9BQUQsQ0FBQSxDQUFBLElBQWMsSUFBQyxDQUFBLE9BQUQsQ0FBQSxDQUFVLENBQUMsTUFBWCxHQUFvQixDQUFyQzthQUE0QyxJQUFDLENBQUEsT0FBRCxDQUFBLENBQVUsQ0FBQyxJQUFYLENBQUEsRUFBNUM7S0FBQSxNQUFBO2FBQW1FLEtBQW5FO0tBRFc7RUFBQSxDQXhEYixDQUFBOztBQUFBLG1CQTJEQSxjQUFBLEdBQWdCLFNBQUEsR0FBQTtXQUNkLElBQUMsQ0FBQSxPQUFELENBQUEsQ0FBQSxJQUFjLElBQUMsQ0FBQSxPQUFELENBQUEsQ0FBVSxDQUFDLFFBQVgsQ0FBb0IsUUFBcEIsRUFEQTtFQUFBLENBM0RoQixDQUFBOztBQUFBLG1CQThEQSxXQUFBLEdBQWEsU0FBQSxHQUFBO0FBQ1gsSUFBQSxJQUFpQyxJQUFDLENBQUEsY0FBRCxDQUFBLENBQWpDO2FBQUEsSUFBQyxDQUFBLE9BQUQsQ0FBQSxDQUFVLENBQUMsUUFBWCxDQUFvQixRQUFwQixFQUFBO0tBRFc7RUFBQSxDQTlEYixDQUFBOztBQUFBLG1CQWlFQSxXQUFBLEdBQWEsU0FBQSxHQUFBO0FBQ1gsSUFBQSxJQUFpQyxJQUFDLENBQUEsT0FBRCxDQUFBLENBQUEsSUFBYyxDQUFBLElBQUUsQ0FBQSxjQUFELENBQUEsQ0FBaEQ7QUFBQSxNQUFBLElBQUMsQ0FBQSxPQUFELENBQUEsQ0FBVSxDQUFDLFFBQVgsQ0FBb0IsUUFBcEIsQ0FBQSxDQUFBO0tBQUE7V0FDQSxJQUFDLENBQUEsYUFBRCxDQUFBLEVBRlc7RUFBQSxDQWpFYixDQUFBOztBQUFBLG1CQXFFQSxhQUFBLEdBQWUsU0FBQSxHQUFBO0FBQ2IsSUFBQSxJQUFvQyxJQUFDLENBQUEsY0FBRCxDQUFBLENBQXBDO2FBQUEsSUFBQyxDQUFBLE9BQUQsQ0FBQSxDQUFVLENBQUMsV0FBWCxDQUF1QixRQUF2QixFQUFBO0tBRGE7RUFBQSxDQXJFZixDQUFBOztBQUFBLG1CQXdFQSxhQUFBLEdBQWUsU0FBQSxHQUFBO0FBQ2IsUUFBQSx1TEFBQTtBQUFBLElBQUEsT0FBQSxHQUFVLElBQUMsQ0FBQSxTQUFTLENBQUMsSUFBWCxDQUFnQixHQUFBLEdBQUcsQ0FBQyxJQUFDLENBQUEsTUFBTSxDQUFDLElBQVIsQ0FBYSxjQUFiLENBQUQsQ0FBbkIsQ0FBVixDQUFBO0FBQUEsSUFDQSxhQUFBLEdBQWlCLFVBQUEsQ0FBVyxJQUFDLENBQUEsZ0JBQUQsQ0FBQSxDQUFvQixDQUFBLENBQUEsQ0FBcEIsR0FBeUIsR0FBcEMsQ0FBQSxHQUEyQyxJQUFDLENBQUEsU0FBUyxDQUFDLEtBQVgsQ0FBQSxDQUQ1RCxDQUFBO0FBQUEsSUFFQSxhQUFBLEdBQWlCLFVBQUEsQ0FBVyxJQUFDLENBQUEsZ0JBQUQsQ0FBQSxDQUFvQixDQUFBLENBQUEsQ0FBcEIsR0FBeUIsR0FBcEMsQ0FBQSxHQUEyQyxJQUFDLENBQUEsU0FBUyxDQUFDLE1BQVgsQ0FBQSxDQUY1RCxDQUFBO0FBQUEsSUFHQSxNQUFBLEdBQVMsT0FBTyxDQUFDLFVBQVIsQ0FBQSxDQUhULENBQUE7QUFBQSxJQUlBLFVBQUEsR0FBYSxNQUFBLEdBQVMsQ0FKdEIsQ0FBQTtBQUFBLElBS0EsT0FBQSxHQUFVLE9BQU8sQ0FBQyxXQUFSLENBQUEsQ0FMVixDQUFBO0FBQUEsSUFNQSxXQUFBLEdBQWMsT0FBQSxHQUFVLENBTnhCLENBQUE7QUFBQSxJQU9BLE1BQUEsR0FBUyxJQUFDLENBQUEsU0FBUyxDQUFDLEtBQVgsQ0FBQSxDQVBULENBQUE7QUFBQSxJQVFBLE9BQUEsR0FBVSxJQUFDLENBQUEsU0FBUyxDQUFDLE1BQVgsQ0FBQSxDQVJWLENBQUE7QUFBQSxJQVNBLE1BQUEsR0FBUyxJQUFDLENBQUEsTUFBTSxDQUFDLFVBQVIsQ0FBQSxDQVRULENBQUE7QUFBQSxJQVVBLFVBQUEsR0FBYSxNQUFBLEdBQVMsQ0FWdEIsQ0FBQTtBQUFBLElBV0EsT0FBQSxHQUFVLElBQUMsQ0FBQSxNQUFNLENBQUMsV0FBUixDQUFBLENBWFYsQ0FBQTtBQUFBLElBWUEsV0FBQSxHQUFjLE9BQUEsR0FBVSxDQVp4QixDQUFBO0FBQUEsSUFhQSxNQUFBLEdBQVMsQ0FiVCxDQUFBO0FBQUEsSUFjQSxPQUFBLEdBQVUsUUFBQSxDQUFTLE9BQU8sQ0FBQyxJQUFSLENBQWEsZUFBYixDQUFULENBZFYsQ0FBQTtBQWVBLElBQUEsSUFBQSxDQUFBLE9BQUE7QUFBQSxNQUFBLE9BQUEsR0FBVSxDQUFWLENBQUE7S0FmQTtBQUFBLElBZ0JBLE9BQUEsR0FBVSxRQUFBLENBQVMsT0FBTyxDQUFDLElBQVIsQ0FBYSxlQUFiLENBQVQsQ0FoQlYsQ0FBQTtBQWlCQSxJQUFBLElBQUEsQ0FBQSxPQUFBO0FBQUEsTUFBQSxPQUFBLEdBQVUsQ0FBVixDQUFBO0tBakJBO0FBa0JBLFlBQU8sT0FBTyxDQUFDLElBQVIsQ0FBYSxlQUFiLENBQVA7QUFBQSxXQUNPLEtBRFA7QUFFSSxRQUFBLFFBQUEsR0FBVyxhQUFBLEdBQWdCLFVBQTNCLENBQUE7QUFBQSxRQUNBLE9BQUEsR0FBVSxhQUFBLEdBQWdCLE9BQWhCLEdBQTBCLFdBQTFCLEdBQXdDLE1BRGxELENBRko7QUFDTztBQURQLFdBSU8sT0FKUDtBQUtJLFFBQUEsUUFBQSxHQUFXLGFBQUEsR0FBZ0IsVUFBaEIsR0FBNkIsTUFBeEMsQ0FBQTtBQUFBLFFBQ0EsT0FBQSxHQUFVLGFBQUEsR0FBZ0IsV0FEMUIsQ0FMSjtBQUlPO0FBSlAsV0FPTyxRQVBQO0FBUUksUUFBQSxRQUFBLEdBQVcsYUFBQSxHQUFnQixVQUEzQixDQUFBO0FBQUEsUUFDQSxPQUFBLEdBQVUsYUFBQSxHQUFnQixXQUFoQixHQUE4QixNQUR4QyxDQVJKO0FBT087QUFQUCxXQVVPLE1BVlA7QUFXSSxRQUFBLFFBQUEsR0FBVyxhQUFBLEdBQWdCLE1BQWhCLEdBQXlCLFVBQXpCLEdBQXNDLE1BQWpELENBQUE7QUFBQSxRQUNBLE9BQUEsR0FBVSxhQUFBLEdBQWdCLFdBRDFCLENBWEo7QUFVTztBQVZQLFdBYU8sVUFiUDtBQWNJLFFBQUEsUUFBQSxHQUFXLGFBQUEsR0FBZ0IsTUFBaEIsR0FBeUIsVUFBekIsR0FBc0MsTUFBakQsQ0FBQTtBQUFBLFFBQ0EsT0FBQSxHQUFVLGFBQUEsR0FBZ0IsT0FBaEIsR0FBMEIsV0FBMUIsR0FBd0MsTUFEbEQsQ0FkSjtBQWFPO0FBYlAsV0FnQk8sV0FoQlA7QUFpQkksUUFBQSxRQUFBLEdBQVcsYUFBQSxHQUFnQixVQUFoQixHQUE2QixNQUF4QyxDQUFBO0FBQUEsUUFDQSxPQUFBLEdBQVUsYUFBQSxHQUFnQixPQUFoQixHQUEwQixXQUExQixHQUF3QyxNQURsRCxDQWpCSjtBQWdCTztBQWhCUCxXQW1CTyxhQW5CUDtBQW9CSSxRQUFBLFFBQUEsR0FBVyxhQUFBLEdBQWdCLE1BQWhCLEdBQXlCLFVBQXpCLEdBQXNDLE1BQWpELENBQUE7QUFBQSxRQUNBLE9BQUEsR0FBVSxhQUFBLEdBQWdCLFdBQWhCLEdBQThCLE1BRHhDLENBcEJKO0FBbUJPO0FBbkJQLFdBc0JPLGNBdEJQO0FBdUJJLFFBQUEsUUFBQSxHQUFXLGFBQUEsR0FBZ0IsVUFBaEIsR0FBNkIsTUFBeEMsQ0FBQTtBQUFBLFFBQ0EsT0FBQSxHQUFVLGFBQUEsR0FBZ0IsV0FBaEIsR0FBOEIsTUFEeEMsQ0F2Qko7QUFBQSxLQWxCQTtXQTJDQTtBQUFBLE1BQUEsSUFBQSxFQUFNLFFBQUEsR0FBVyxPQUFqQjtBQUFBLE1BQ0EsR0FBQSxFQUFLLE9BQUEsR0FBVSxPQURmO01BNUNhO0VBQUEsQ0F4RWYsQ0FBQTs7QUFBQSxtQkF1SEEsZUFBQSxHQUFpQixTQUFBLEdBQUE7QUFDZixRQUFBLE1BQUE7QUFBQSxJQUFBLE1BQUEsR0FBUyxJQUFDLENBQUEsYUFBRCxDQUFBLENBQVQsQ0FBQTtBQUFBLElBQ0EsSUFBQyxDQUFBLFNBQVMsQ0FBQyxJQUFYLENBQWdCLEdBQUEsR0FBRyxDQUFDLElBQUMsQ0FBQSxNQUFNLENBQUMsSUFBUixDQUFhLGNBQWIsQ0FBRCxDQUFuQixDQUFtRCxDQUFDLEdBQXBELENBQ0U7QUFBQSxNQUFBLElBQUEsRUFBUyxNQUFNLENBQUMsSUFBUixHQUFhLElBQXJCO0FBQUEsTUFDQSxHQUFBLEVBQVEsTUFBTSxDQUFDLEdBQVIsR0FBWSxJQURuQjtLQURGLENBREEsQ0FBQTtXQUlBLElBQUMsQ0FBQSxRQUFELENBQUEsRUFMZTtFQUFBLENBdkhqQixDQUFBOztBQUFBLG1CQThIQSxjQUFBLEdBQWdCLFNBQUEsR0FBQTtBQUNkLFFBQUEsTUFBQTtBQUFBLElBQUEsTUFBQSxHQUFTLElBQUMsQ0FBQSxhQUFELENBQUEsQ0FBVCxDQUFBO1dBQ0EsSUFBQyxDQUFBLFNBQVMsQ0FBQyxJQUFYLENBQWdCLEdBQUEsR0FBRyxDQUFDLElBQUMsQ0FBQSxNQUFNLENBQUMsSUFBUixDQUFhLGNBQWIsQ0FBRCxDQUFuQixDQUFtRCxDQUFDLE9BQXBELENBQ0U7QUFBQSxNQUFBLElBQUEsRUFBUyxNQUFNLENBQUMsSUFBUixHQUFhLElBQXJCO0FBQUEsTUFDQSxHQUFBLEVBQVEsTUFBTSxDQUFDLEdBQVIsR0FBWSxJQURuQjtLQURGLEVBR0UsR0FIRixFQUdPLENBQUEsU0FBQSxLQUFBLEdBQUE7YUFBQSxTQUFBLEdBQUE7QUFDTCxlQUFPLEtBQUMsQ0FBQSxRQUFELENBQUEsQ0FBUCxDQURLO01BQUEsRUFBQTtJQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FIUCxFQUZjO0VBQUEsQ0E5SGhCLENBQUE7O0FBQUEsbUJBd0lBLFdBQUEsR0FBYSxTQUFBLEdBQUE7V0FDWCxJQUFDLENBQUEsTUFBTSxDQUFDLFFBQVIsQ0FBaUIsV0FBakIsRUFEVztFQUFBLENBeEliLENBQUE7O0FBQUEsbUJBNklBLEdBQUEsR0FBSyxTQUFBLEdBQUE7QUFDSCxRQUFBLFNBQUE7QUFBQSxJQUFBLElBQUEsR0FBTyxDQUFDLElBQUMsQ0FBQSxLQUFLLENBQUMsS0FBUCxDQUFBLENBQUEsR0FBaUIsQ0FBQyxJQUFDLENBQUEsTUFBTSxDQUFDLElBQVIsQ0FBYSxVQUFiLENBQUEsR0FBMkIsR0FBNUIsQ0FBbEIsQ0FBQSxHQUNMLFVBQUEsQ0FBVyxJQUFDLENBQUEsS0FBSyxDQUFDLEdBQVAsQ0FBVyxNQUFYLENBQVgsQ0FESyxHQUM0QixDQUFDLElBQUMsQ0FBQSxNQUFNLENBQUMsVUFBUixDQUFBLENBQUEsR0FBdUIsQ0FBeEIsQ0FEbkMsQ0FBQTtBQUFBLElBRUEsR0FBQSxHQUFNLENBQUMsSUFBQyxDQUFBLEtBQUssQ0FBQyxNQUFQLENBQUEsQ0FBQSxHQUFrQixDQUFDLElBQUMsQ0FBQSxNQUFNLENBQUMsSUFBUixDQUFhLFVBQWIsQ0FBQSxHQUEyQixHQUE1QixDQUFuQixDQUFBLEdBQ0osVUFBQSxDQUFXLElBQUMsQ0FBQSxLQUFLLENBQUMsR0FBUCxDQUFXLEtBQVgsQ0FBWCxDQURJLEdBQzRCLENBQUMsSUFBQyxDQUFBLE1BQU0sQ0FBQyxXQUFSLENBQUEsQ0FBQSxHQUF3QixDQUF6QixDQUhsQyxDQUFBO0FBQUEsSUFJQSxJQUFDLENBQUEsTUFBTSxDQUFDLEdBQVIsQ0FDRTtBQUFBLE1BQUEsSUFBQSxFQUFTLElBQUQsR0FBTSxJQUFkO0FBQUEsTUFDQSxHQUFBLEVBQVEsR0FBRCxHQUFLLElBRFo7S0FERixDQUpBLENBQUE7QUFBQSxJQU9BLElBQUMsQ0FBQSxlQUFELENBQUEsQ0FQQSxDQUFBO1dBUUEsQ0FBQyxJQUFELEVBQU8sR0FBUCxFQVRHO0VBQUEsQ0E3SUwsQ0FBQTs7QUFBQSxtQkF3SkEsWUFBQSxHQUFjLFNBQUEsR0FBQTtBQUNaLFFBQUEsTUFBQTtBQUFBLElBQUEsTUFBQSxHQUFTLElBQUMsQ0FBQSxRQUFELENBQUEsQ0FBVCxDQUFBO1dBQ0EsSUFBQyxDQUFBLE1BQU0sQ0FBQyxJQUFSLENBQ0U7QUFBQSxNQUFBLFVBQUEsRUFBWSxNQUFPLENBQUEsQ0FBQSxDQUFuQjtBQUFBLE1BQ0EsVUFBQSxFQUFZLE1BQU8sQ0FBQSxDQUFBLENBRG5CO0tBREYsRUFGWTtFQUFBLENBeEpkLENBQUE7O0FBQUEsbUJBOEpBLE1BQUEsR0FBUSxTQUFDLE9BQUQsR0FBQTtBQUNOLFFBQUEsU0FBQTtBQUFBLElBQUEsSUFBRyxPQUFPLENBQUMsS0FBWDtBQUNFLE1BQUEsSUFBQyxDQUFBLE1BQU0sQ0FBQyxHQUFSLENBQVk7QUFBQSxRQUFBLGVBQUEsRUFBaUIsT0FBTyxDQUFDLEtBQXpCO09BQVosQ0FBQSxDQURGO0tBQUE7QUFFQSxJQUFBLElBQUcsT0FBTyxDQUFDLE9BQVg7QUFDRSxNQUFBLElBQUMsQ0FBQSxNQUFNLENBQUMsSUFBUixDQUFhLEdBQUEsR0FBSSxNQUFNLENBQUMsWUFBeEIsQ0FBdUMsQ0FBQyxJQUF4QyxDQUE2QyxPQUFPLENBQUMsT0FBckQsQ0FBQSxDQUFBO0FBQUEsTUFDQSxJQUFDLENBQUEsZUFBRCxDQUFBLENBREEsQ0FERjtLQUZBO0FBS0EsSUFBQSxJQUFHLE9BQU8sQ0FBQyxTQUFYO0FBQ0UsTUFBQSxJQUFDLENBQUEsTUFBTSxDQUFDLFdBQVIsQ0FBb0IsV0FBcEIsQ0FBQSxDQUFBO0FBQ0EsTUFBQSxJQUFpQyxPQUFPLENBQUMsU0FBUixLQUFxQixJQUF0RDtBQUFBLFFBQUEsSUFBQyxDQUFBLE1BQU0sQ0FBQyxRQUFSLENBQWlCLFdBQWpCLENBQUEsQ0FBQTtPQUZGO0tBTEE7QUFRQSxJQUFBLElBQUcsT0FBTyxDQUFDLE1BQVg7QUFDRSxNQUFBLElBQUEsR0FBTyxDQUFDLENBQUMsVUFBQSxDQUFXLE9BQU8sQ0FBQyxNQUFPLENBQUEsQ0FBQSxDQUExQixDQUFBLEdBQWdDLEdBQWpDLENBQUEsR0FBd0MsSUFBQyxDQUFBLFNBQVMsQ0FBQyxLQUFYLENBQUEsQ0FBekMsQ0FBQSxHQUErRCxFQUF0RSxDQUFBO0FBQUEsTUFDQSxHQUFBLEdBQU0sQ0FBQyxDQUFDLFVBQUEsQ0FBVyxPQUFPLENBQUMsTUFBTyxDQUFBLENBQUEsQ0FBMUIsQ0FBQSxHQUFnQyxHQUFqQyxDQUFBLEdBQXdDLElBQUMsQ0FBQSxTQUFTLENBQUMsTUFBWCxDQUFBLENBQXpDLENBQUEsR0FBZ0UsRUFEdEUsQ0FBQTthQUVBLElBQUMsQ0FBQSxNQUFNLENBQUMsR0FBUixDQUNFO0FBQUEsUUFBQSxJQUFBLEVBQVMsSUFBRCxHQUFNLElBQWQ7QUFBQSxRQUNBLEdBQUEsRUFBUSxHQUFELEdBQUssSUFEWjtPQURGLEVBSEY7S0FUTTtFQUFBLENBOUpSLENBQUE7O0FBQUEsbUJBOEtBLE1BQUEsR0FBUSxTQUFBLEdBQUE7QUFDTixJQUFBLElBQXVCLElBQUMsQ0FBQSxPQUFELENBQUEsQ0FBdkI7QUFBQSxNQUFBLElBQUMsQ0FBQSxPQUFELENBQUEsQ0FBVSxDQUFDLE1BQVgsQ0FBQSxDQUFBLENBQUE7S0FBQTtXQUNBLElBQUMsQ0FBQSxNQUFNLENBQUMsTUFBUixDQUFBLEVBRk07RUFBQSxDQTlLUixDQUFBOztnQkFBQTs7SUF4bEJGLENBQUE7O0FBQUEsTUEwd0JZLENBQUMsTUFBTSxDQUFDO0FBRUwsRUFBQSxnQkFBQyxRQUFELEdBQUE7QUFHWCxRQUFBLGlEQUFBO0FBQUEsSUFIWSxJQUFDLENBQUEsVUFBRCxRQUdaLENBQUE7QUFBQSxJQUFBLElBQUMsQ0FBQSxTQUFELEdBQWEsSUFBQyxDQUFBLE9BQU8sQ0FBQyxTQUF0QixDQUFBO0FBQUEsSUFDQSxJQUFDLENBQUEsZ0JBQUQsR0FBb0IsSUFBQyxDQUFBLFNBQVMsQ0FBQyxJQUFYLENBQWdCLEdBQUEsR0FBSSxNQUFNLENBQUMsb0JBQTNCLENBRHBCLENBQUE7QUFBQSxJQUlBLElBQUMsQ0FBQSxNQUFELEdBQVUsSUFBQyxDQUFBLGdCQUFnQixDQUFDLElBQWxCLENBQ1IsR0FBQSxHQUFJLE1BQU0sQ0FBQyxXQUFYLEdBQXVCLGdCQUF2QixHQUF1QyxJQUFDLENBQUEsT0FBTyxDQUFDLFFBQWhELEdBQXlELElBRGpELENBRVQsQ0FBQyxLQUZRLENBQUEsQ0FKVixDQUFBO0FBQUEsSUFPQSxJQUFDLENBQUEsU0FBRCxHQUFpQixJQUFBLE1BQU0sQ0FBQyxNQUFQLENBQWMsSUFBQyxDQUFBLFNBQWYsRUFBMEIsSUFBQyxDQUFBLE9BQU8sQ0FBQyxRQUFuQyxDQVBqQixDQUFBO0FBVUEsSUFBQSxJQUFHLElBQUMsQ0FBQSxPQUFPLENBQUMsU0FBWjtBQUNFLE1BQUEsSUFBQyxDQUFBLE1BQU0sQ0FBQyxRQUFSLENBQWlCLFdBQWpCLENBQUEsQ0FBQTtBQUFBLE1BQ0EsSUFBQyxDQUFBLE1BQU0sQ0FBQyxFQUFSLENBQVcsV0FBWCxFQUF3QixDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQyxDQUFELEdBQUE7QUFDdEIsY0FBQSxNQUFBO0FBQUEsVUFBQSxJQUFHLENBQUMsQ0FBQyxLQUFGLEtBQVcsQ0FBZDtBQUNFLFlBQUEsTUFBQSxHQUFTLENBQUEsQ0FBRSxDQUFDLENBQUMsTUFBSixDQUFXLENBQUMsT0FBWixDQUFvQixHQUFBLEdBQUksTUFBTSxDQUFDLFdBQS9CLENBQVQsQ0FBQTtBQUFBLFlBQ0EsTUFBTSxDQUFDLFFBQVAsQ0FBZ0IsTUFBTSxDQUFDLGFBQXZCLENBREEsQ0FBQTttQkFFQSxNQUFNLENBQUMsSUFBUCxDQUNFO0FBQUEsY0FBQSxtQkFBQSxFQUFxQixDQUFDLENBQUMsS0FBdkI7QUFBQSxjQUNBLG1CQUFBLEVBQXFCLENBQUMsQ0FBQyxLQUR2QjthQURGLEVBSEY7V0FEc0I7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUF4QixDQURBLENBREY7S0FWQTtBQXFCQSxJQUFBLElBQUcsSUFBQyxDQUFBLE9BQU8sQ0FBQyxPQUFaO0FBQ0UsTUFBQSxFQUFBLEdBQUssTUFBTSxDQUFDLFlBQVAsQ0FBb0IsRUFBcEIsQ0FBTCxDQUFBO0FBQUEsTUFFQSxPQUFBLEdBQVUsSUFBQyxDQUFBLE9BQU8sQ0FBQyxPQUZuQixDQUFBO0FBR0EsTUFBQSxJQUFHLE9BQU8sQ0FBQyxRQUFYO0FBQXlCLFFBQUEsUUFBQSxHQUFXLE9BQU8sQ0FBQyxRQUFuQixDQUF6QjtPQUFBLE1BQUE7QUFBMEQsUUFBQSxRQUFBLEdBQVcsS0FBWCxDQUExRDtPQUhBO0FBSUEsTUFBQSxJQUFHLE9BQU8sQ0FBQyxLQUFYO0FBQXNCLFFBQUEsS0FBQSxHQUFRLElBQVIsQ0FBdEI7T0FBQSxNQUFBO0FBQXdDLFFBQUEsS0FBQSxHQUFRLEtBQVIsQ0FBeEM7T0FKQTtBQUtBLE1BQUEsSUFBRyxLQUFBLEtBQVMsSUFBWjtBQUFzQixRQUFBLFVBQUEsR0FBYSxPQUFiLENBQXRCO09BQUEsTUFBQTtBQUFnRCxRQUFBLFVBQUEsR0FBYSxFQUFiLENBQWhEO09BTEE7QUFBQSxNQU1BLE9BQUEsR0FBYSxNQUFNLENBQUMsWUFBUixHQUFxQixHQUFyQixHQUF3QixRQUF4QixHQUFpQyxHQUFqQyxHQUFvQyxVQU5oRCxDQUFBO0FBQUEsTUFPQSxJQUFDLENBQUEsU0FBUyxDQUFDLElBQVgsQ0FBZ0IsR0FBQSxHQUFJLE1BQU0sQ0FBQyxxQkFBM0IsQ0FBbUQsQ0FBQyxNQUFwRCxDQUEyRCxlQUFBLEdBQzNDLE9BRDJDLEdBQ25DLGVBRG1DLEdBQ3RCLEVBRHNCLEdBQ25CLHdCQURtQixHQUV0QyxRQUZzQyxHQUU3QixXQUY2QixHQUduRCxPQUFPLENBQUMsSUFIMkMsR0FHdEMsVUFIckIsQ0FQQSxDQUFBO0FBYUEsTUFBQSxJQUFHLE9BQU8sQ0FBQyxPQUFYO0FBQ0UsUUFBQSxJQUFDLENBQUEsU0FBUyxDQUFDLElBQVgsQ0FBZ0IsR0FBQSxHQUFJLE1BQU0sQ0FBQyxZQUEzQixDQUEwQyxDQUFDLElBQTNDLENBQUEsQ0FBaUQsQ0FBQyxJQUFsRCxDQUNFO0FBQUEsVUFBQSxlQUFBLEVBQWlCLE9BQU8sQ0FBQyxPQUF6QjtTQURGLENBQUEsQ0FERjtPQWJBO0FBZ0JBLE1BQUEsSUFBRyxPQUFPLENBQUMsT0FBWDtBQUNFLFFBQUEsSUFBQyxDQUFBLFNBQVMsQ0FBQyxJQUFYLENBQWdCLEdBQUEsR0FBSSxNQUFNLENBQUMsWUFBM0IsQ0FBMEMsQ0FBQyxJQUEzQyxDQUFBLENBQWlELENBQUMsSUFBbEQsQ0FDRTtBQUFBLFVBQUEsZUFBQSxFQUFpQixPQUFPLENBQUMsT0FBekI7U0FERixDQUFBLENBREY7T0FoQkE7QUFBQSxNQW1CQSxJQUFDLENBQUEsTUFBTSxDQUFDLElBQVIsQ0FBYSxjQUFiLEVBQTZCLE9BQUEsR0FBUSxFQUFyQyxDQW5CQSxDQUFBO0FBQUEsTUFvQkEsSUFBQyxDQUFBLFNBQVMsQ0FBQyxlQUFYLENBQUEsQ0FwQkEsQ0FERjtLQXhCVztFQUFBLENBQWI7O0FBQUEsbUJBK0NBLE9BQUEsR0FBUyxTQUFBLEdBQUE7V0FDUCxJQUFDLENBQUEsZ0JBQWdCLENBQUMsSUFBbEIsQ0FBdUIsR0FBQSxHQUFJLE1BQU0sQ0FBQyxXQUFsQyxFQURPO0VBQUEsQ0EvQ1QsQ0FBQTs7QUFBQSxtQkFrREEsY0FBQSxHQUFnQixTQUFBLEdBQUE7V0FDZCxJQUFDLENBQUEsZ0JBQWdCLENBQUMsSUFBbEIsQ0FBdUIsR0FBQSxHQUFJLE1BQU0sQ0FBQyxXQUFYLEdBQXVCLEdBQXZCLEdBQTBCLE1BQU0sQ0FBQyxhQUF4RCxFQURjO0VBQUEsQ0FsRGhCLENBQUE7O2dCQUFBOztJQTV3QkYsQ0FBQTs7QUFBQSxNQWkwQlksQ0FBQyxNQUFNLENBQUM7QUFFTCxFQUFBLGlCQUFDLFFBQUQsR0FBQTtBQUVYLFFBQUEsd0JBQUE7QUFBQSxJQUZZLElBQUMsQ0FBQSxVQUFELFFBRVosQ0FBQTtBQUFBLElBQUEsSUFBQyxDQUFBLFNBQUQsR0FBYSxJQUFDLENBQUEsT0FBTyxDQUFDLFNBQXRCLENBQUE7QUFBQSxJQUNBLElBQUMsQ0FBQSxnQkFBRCxHQUFvQixJQUFDLENBQUEsU0FBUyxDQUFDLElBQVgsQ0FBZ0IsR0FBQSxHQUFJLE1BQU0sQ0FBQyxvQkFBM0IsQ0FBa0QsQ0FBQyxLQUFuRCxDQUFBLENBRHBCLENBQUE7QUFFQSxJQUFBLElBQUEsQ0FBQSxJQUFRLENBQUEsT0FBTyxDQUFDLFFBQWhCO0FBQ0UsTUFBQSxJQUFDLENBQUEsT0FBTyxDQUFDLFFBQVQsR0FBb0IsTUFBTSxDQUFDLFlBQVAsQ0FBb0IsRUFBcEIsQ0FBcEIsQ0FERjtLQUZBO0FBTUEsSUFBQSxJQUFHLElBQUMsQ0FBQSxPQUFPLENBQUMsS0FBWjtBQUF1QixNQUFBLEtBQUEsR0FBUSxJQUFDLENBQUEsT0FBTyxDQUFDLEtBQWpCLENBQXZCO0tBQUEsTUFBQTtBQUFtRCxNQUFBLEtBQUEsR0FBUSxTQUFSLENBQW5EO0tBTkE7QUFBQSxJQVFBLElBQUEsR0FBTyxDQUFDLENBQUMsVUFBQSxDQUFXLElBQUMsQ0FBQSxPQUFPLENBQUMsTUFBTyxDQUFBLENBQUEsQ0FBM0IsQ0FBQSxHQUFpQyxHQUFsQyxDQUFBLEdBQXlDLElBQUMsQ0FBQSxTQUFTLENBQUMsS0FBWCxDQUFBLENBQTFDLENBQUEsR0FBZ0UsRUFSdkUsQ0FBQTtBQUFBLElBU0EsR0FBQSxHQUFNLENBQUMsQ0FBQyxVQUFBLENBQVcsSUFBQyxDQUFBLE9BQU8sQ0FBQyxNQUFPLENBQUEsQ0FBQSxDQUEzQixDQUFBLEdBQWlDLEdBQWxDLENBQUEsR0FBeUMsSUFBQyxDQUFBLFNBQVMsQ0FBQyxNQUFYLENBQUEsQ0FBMUMsQ0FBQSxHQUFpRSxFQVR2RSxDQUFBO0FBQUEsSUFVQSxJQUFDLENBQUEsZ0JBQWdCLENBQUMsTUFBbEIsQ0FDRSxDQUFBLENBQUUsYUFBRixDQUNFLENBQUMsUUFESCxDQUNZLE1BQU0sQ0FBQyxXQURuQixDQUVFLENBQUMsSUFGSCxDQUdJO0FBQUEsTUFBQSxhQUFBLEVBQWUsSUFBQyxDQUFBLE9BQU8sQ0FBQyxRQUF4QjtBQUFBLE1BQ0EsVUFBQSxFQUFZLElBQUMsQ0FBQSxPQUFPLENBQUMsTUFBTyxDQUFBLENBQUEsQ0FENUI7QUFBQSxNQUVBLFVBQUEsRUFBWSxJQUFDLENBQUEsT0FBTyxDQUFDLE1BQU8sQ0FBQSxDQUFBLENBRjVCO0tBSEosQ0FNRSxDQUFDLEdBTkgsQ0FPSTtBQUFBLE1BQUEsSUFBQSxFQUFTLElBQUQsR0FBTSxJQUFkO0FBQUEsTUFDQSxHQUFBLEVBQVEsR0FBRCxHQUFLLElBRFo7QUFBQSxNQUVBLGVBQUEsRUFBaUIsS0FGakI7S0FQSixDQURGLENBVkEsQ0FBQTtBQUFBLElBc0JBLE1BQUEsR0FBUyxJQUFDLENBQUEsZ0JBQWdCLENBQUMsSUFBbEIsQ0FBdUIsR0FBQSxHQUFJLE1BQU0sQ0FBQyxXQUFsQyxDQUFnRCxDQUFDLElBQWpELENBQUEsQ0F0QlQsQ0FBQTtBQXVCQSxJQUFBLElBQUcsSUFBQyxDQUFBLE9BQU8sQ0FBQyxFQUFaO0FBQ0UsTUFBQSxNQUFNLENBQUMsSUFBUCxDQUFZO0FBQUEsUUFBQSxTQUFBLEVBQVcsSUFBQyxDQUFBLE9BQU8sQ0FBQyxFQUFwQjtPQUFaLENBQUEsQ0FERjtLQXZCQTtBQXlCQSxJQUFBLElBQUcsSUFBQyxDQUFBLE9BQU8sQ0FBQyxPQUFELENBQVg7QUFDRSxNQUFBLE1BQU0sQ0FBQyxRQUFQLENBQWdCLElBQUMsQ0FBQSxPQUFPLENBQUMsT0FBRCxDQUF4QixDQUFBLENBREY7S0F6QkE7QUEyQkEsSUFBQSxJQUFHLElBQUMsQ0FBQSxPQUFPLENBQUMsSUFBWjtBQUNFLE1BQUEsTUFBTSxDQUFDLElBQVAsQ0FBWSxJQUFDLENBQUEsT0FBTyxDQUFDLElBQXJCLENBQUEsQ0FERjtLQTNCQTtBQTZCQSxJQUFBLElBQUcsSUFBQyxDQUFBLE9BQU8sQ0FBQyxJQUFaO0FBQ0UsTUFBQSxNQUFNLENBQUMsR0FBUCxDQUNFO0FBQUEsUUFBQSxLQUFBLEVBQVUsSUFBQyxDQUFBLE9BQU8sQ0FBQyxJQUFWLEdBQWUsSUFBeEI7QUFBQSxRQUNBLE1BQUEsRUFBVyxJQUFDLENBQUEsT0FBTyxDQUFDLElBQVYsR0FBZSxJQUR6QjtPQURGLENBQUEsQ0FERjtLQTdCQTtBQUFBLElBbUNJLElBQUEsTUFBTSxDQUFDLE1BQU0sQ0FBQyxNQUFkLENBQXFCLElBQUMsQ0FBQSxPQUF0QixDQW5DSixDQUFBO0FBQUEsSUFzQ0ksSUFBQSxNQUFNLENBQUMsTUFBUCxDQUFjLElBQUMsQ0FBQSxTQUFmLEVBQTBCLElBQUMsQ0FBQSxPQUFPLENBQUMsUUFBbkMsQ0F0Q0osQ0FGVztFQUFBLENBQWI7O2lCQUFBOztJQW4wQkYsQ0FBQSIsImZpbGUiOiJwbGFuaXQtdG1wLmpzIiwic291cmNlUm9vdCI6Ii9zb3VyY2UvIiwic291cmNlc0NvbnRlbnQiOlsiY2xhc3MgUGxhbml0XG5cbiAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gUmVmc1xuXG4gIEBjb250YWluZXJDbGFzczogICAgICAgICdwbGFuaXQtY29udGFpbmVyJ1xuICBAbWFya2VyQ29udGFpbmVyQ2xhc3M6ICAncGxhbml0LW1hcmtlcnMtY29udGFpbmVyJ1xuICBAbWFya2VyQ29udGVudENsYXNzOiAgICAncGxhbml0LW1hcmtlci1jb250ZW50J1xuICBAbWFya2VyQ2xhc3M6ICAgICAgICAgICAncGxhbml0LW1hcmtlcidcbiAgQGRyYWdnaW5nQ2xhc3M6ICAgICAgICAgJ2lzLWRyYWdnaW5nJ1xuICBAaW5mb2JveENvbnRhaW5lckNsYXNzOiAncGxhbml0LWluZm9ib3gtY29udGFpbmVyJ1xuICBAaW5mb2JveENsYXNzOiAgICAgICAgICAncGxhbml0LWluZm9ib3gnXG4gIEBpbWFnZUNvbnRhaW5lcjogICAgICAgICdwbGFuaXQtaW1hZ2UtY29udGFpbmVyJ1xuXG4gICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIERlZmF1bHQgT3B0aW9uc1xuXG4gIG5ldzogKEBvcHRpb25zID0ge30pIC0+XG4gICAgbmV3IFBsYW5pdC5QbGFuLkNyZWF0b3IoQG9wdGlvbnMpXG5cbiAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gQWRkIEEgTWFya2VyXG5cbiAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gUmV0cmlldmUgRGF0YVxuXG4gIGdldE1hcmtlcjogKGlkKSA9PlxuICAgIG5ldyBQbGFuaXQuTWFya2VyKEBjb250YWluZXIsIGlkKVxuXG4gIGdldEFsbE1hcmtlcnM6ICgpID0+XG4gICAgcGxhbiA9IG5ldyBQbGFuaXQuUGxhbihAY29udGFpbmVyKVxuICAgIHBsYW4uZ2V0QWxsTWFya2VycygpXG5cbiAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gUGxhbiBBY3Rpb25zXG5cbiAgY2VudGVyT246IChjb29yZHMpIC0+XG4gICAgQHpvb21hYmxlLmNlbnRlck9uKGNvb3JkcylcblxuICB6b29tVG86IChsZXZlbCkgLT5cbiAgICBAem9vbWFibGUuem9vbVRvKGxldmVsKVxuXG4gIHJlc2l6ZTogKGUpID0+XG4gICAgaW1hZ2UgPSBAY29udGFpbmVyLmZpbmQoXCIuI3tQbGFuaXQuaW1hZ2VDb250YWluZXJ9ID4gaW1nXCIpLmZpcnN0KClcbiAgICBAem9vbWFibGUucmVzZXRJbWFnZSgpXG4gICAgaWYgaW1hZ2VcbiAgICAgIEBjb250YWluZXIuaGVpZ2h0KGltYWdlLmhlaWdodCgpKVxuICAgIGZvciBtYXJrZXIgaW4gQG1hcmtlcnNDb250YWluZXIuZmluZChcIi4je1BsYW5pdC5tYXJrZXJDbGFzc31cIilcbiAgICAgIG0gPSBuZXcgUGxhbml0Lk1hcmtlcihAY29udGFpbmVyLCAkKG1hcmtlcikuYXR0cignZGF0YS1tYXJrZXInKSlcbiAgICAgIG0uc2V0KClcblxuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBFdmVudCBDYWxsYmFja3NcblxuICBtYXJrZXJEcmFnRW5kOiAoZXZlbnQsIG1hcmtlcikgPT5cbiAgICBpZiBAb3B0aW9ucy5tYXJrZXJEcmFnRW5kXG4gICAgICBAb3B0aW9ucy5tYXJrZXJEcmFnRW5kKGV2ZW50LCBtYXJrZXIpXG5cbiAgbWFya2VyQ2xpY2s6IChldmVudCwgbWFya2VyKSA9PlxuICAgIGlmIEBvcHRpb25zLm1hcmtlckNsaWNrXG4gICAgICBAb3B0aW9ucy5tYXJrZXJDbGljayhldmVudCwgbWFya2VyKVxuXG4gIGNhbnZhc0NsaWNrOiAoZXZlbnQsIGNvb3JkcykgPT5cbiAgICBpZiBAb3B0aW9ucy5jYW52YXNDbGlja1xuICAgICAgQG9wdGlvbnMuY2FudmFzQ2xpY2soZXZlbnQsIGNvb3JkcylcblxuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBDbGFzcyBNZXRob2RzXG5cbiAgQHJhbmRvbVN0cmluZzogKGxlbmd0aCA9IDE2KSAtPlxuICAgIHN0ciA9IE1hdGgucmFuZG9tKCkudG9TdHJpbmcoMzYpLnNsaWNlKDIpXG4gICAgc3RyID0gc3RyICsgTWF0aC5yYW5kb20oKS50b1N0cmluZygzNikuc2xpY2UoMilcbiAgICBzdHIuc3Vic3RyaW5nKDAsIGxlbmd0aCAtIDEpXG5cbiMgc2V0IHRoaXMgY2xhc3MgdG8gYSBnbG9iYWwgYHBsYW5pdGAgdmFyaWFibGVcbndpbmRvdy5wbGFuaXQgPSBuZXcgUGxhbml0XG5cbmNsYXNzIFBsYW5pdC5QbGFuXG5cbiAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gU2V0dXBcblxuICBjb25zdHJ1Y3RvcjogKEBjb250YWluZXIpIC0+XG4gICAgQG1hcmtlcnNDb250YWluZXIgPSBAY29udGFpbmVyLmZpbmQoXCIuI3tQbGFuaXQubWFya2VyQ29udGFpbmVyQ2xhc3N9XCIpLmZpcnN0KClcblxuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBHZXQgQWxsIE1hcmtlcnNcblxuICBnZXRBbGxNYXJrZXJzOiAoKSA9PlxuICAgIG1hcmtlcnMgPSBbXVxuICAgIGZvciBtYXJrZXIgaW4gQG1hcmtlcnNDb250YWluZXIuZmluZChcIi4je1BsYW5pdC5tYXJrZXJDbGFzc31cIilcbiAgICAgIG0gPSBuZXcgUGxhbml0Lk1hcmtlcihAY29udGFpbmVyLCAkKG1hcmtlcikuYXR0cignZGF0YS1tYXJrZXInKSlcbiAgICAgIG1hcmtlciA9XG4gICAgICAgICMgY29vcmRzOiBbbS5wb3NpdGlvbigpLmxlZnQsIG0ucG9zaXRpb24oKS50b3BdXG4gICAgICAgIGNvb3JkczogbS5wb3NpdGlvbigpXG4gICAgICAgIGRyYWdnYWJsZTogbS5pc0RyYWdnYWJsZSgpXG4gICAgICAgIGNvbG9yOiBtLmNvbG9yKClcbiAgICAgIG1hcmtlci5pbmZvYm94ID0gbS5pbmZvYm94SFRNTCgpIGlmIG0uaW5mb2JveEhUTUwoKVxuICAgICAgbWFya2Vycy5wdXNoKG0pXG4gICAgbWFya2Vyc1xuXG5jbGFzcyBQbGFuaXQuUGxhbi5DcmVhdG9yXG5cbiAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gU2V0dXBcblxuICBjb25zdHJ1Y3RvcjogKEBvcHRpb25zID0ge30pIC0+XG4gICAgbWV0aG9kLmNhbGwoQCkgZm9yIG1ldGhvZCBpbiBpbml0TWV0aG9kcygpXG4gICAgIyBSZXR1cm4gYSBuZXcgaW5zdGFuY2Ugb2YgYSBQbGFuXG4gICAgbmV3IFBsYW5pdC5QbGFuKEBjb250YWluZXIpXG5cbiAgIyAocHJpdmF0ZSkgTWV0aG9kcyAoaW4gb3JkZXIpIG5lZWRlZCB0byBpbnN0YW50aWF0ZSB0aGlzXG4gICMgb2JqZWN0XG4gICNcbiAgaW5pdE1ldGhvZHMgPSAtPlxuICAgIFtpbml0T3B0aW9ucywgaW5pdENvbnRhaW5lciwgaW5pdEltYWdlLCBpbml0TWFya2VycywgaW5pdEV2ZW50c11cblxuICAjIChwcml2YXRlKSBBZGQgZGVmYXVsdCBvcHRpb25zIGlmIHRoZSBuZWNlc3Nhcnkgb3B0aW9uc1xuICAjIGFyZSBtaXNzaW5nXG4gICNcbiAgaW5pdE9wdGlvbnMgPSAtPlxuICAgIGlmIEBvcHRpb25zLmNvbnRhaW5lclxuICAgICAgQG9wdGlvbnMuY29udGFpbmVyID0gJChcIiMje0BvcHRpb25zLmNvbnRhaW5lcn1cIilcbiAgICBlbHNlXG4gICAgICBAb3B0aW9ucy5jb250YWluZXIgPSAkKCcjcGxhbml0JylcbiAgICBAY29udGFpbmVyID0gQG9wdGlvbnMuY29udGFpbmVyICMgZGlyZWN0IGFjY2VzcyB0byBwbGFuaXQgY29udGFpbmVyXG5cbiAgIyAocHJpdmF0ZSkgRHJhdyB0aGUgY29udGFpbmVyIGFuZCB0aGUgc3ViY29udGFpbmVyc1xuICAjXG4gIGluaXRDb250YWluZXIgPSAtPlxuICAgIEBjb250YWluZXIuYWRkQ2xhc3MoUGxhbml0LmNvbnRhaW5lckNsYXNzKVxuICAgIEBjb250YWluZXIuYXBwZW5kIFwiXCJcIlxuICAgICAgPGRpdiBjbGFzcz1cIiN7UGxhbml0LmluZm9ib3hDb250YWluZXJDbGFzc31cIj48L2Rpdj5cbiAgICAgIDxkaXYgY2xhc3M9XCIje1BsYW5pdC5tYXJrZXJDb250YWluZXJDbGFzc31cIj48L2Rpdj5cbiAgICAgICAgXCJcIlwiXG4gICAgQG1hcmtlcnNDb250YWluZXIgPSBAY29udGFpbmVyLmZpbmQoXCIuI3tQbGFuaXQubWFya2VyQ29udGFpbmVyQ2xhc3N9XCIpXG4gICAgICAuZmlyc3QoKSAjIGRpcmVjdCBhY2Nlc3MgdG8gbWFya2VycyBjb250YWluZXJcblxuICAjIChwcml2YXRlKSBDcmVhdGUgaW1hZ2UgY29udGFpbmVyIGFuZCBhZGQgaW1hZ2UgaWZcbiAgIyBuZWNlc3NhcnlcbiAgI1xuICBpbml0SW1hZ2UgPSAtPlxuICAgIGlmIEBvcHRpb25zLmltYWdlICYmIEBvcHRpb25zLmltYWdlLnVybFxuICAgICAgQGNvbnRhaW5lci5wcmVwZW5kIFwiXCJcIlxuICAgICAgICA8ZGl2IGNsYXNzPVwiI3tQbGFuaXQuaW1hZ2VDb250YWluZXJ9XCI+XG4gICAgICAgICAgPGltZyBzcmM9XCIje0BvcHRpb25zLmltYWdlLnVybH1cIj5cbiAgICAgICAgPC9kaXY+XG4gICAgICBcIlwiXCJcbiAgICAgIEBpbml0QmFja2dyb3VuZEltYWdlKClcblxuICAjIEludGVydmFsIGZ1bmN0aW9uIHRoYXQgc2V0cyB6b29tYWJsZSBtZXRob2RzIG9uIHRoZVxuICAjIGNvbnRhaW5lciBvbmNlIHRoZSBpbWFnZSBpcyBsb2FkZWRcbiAgI1xuICBpbml0QmFja2dyb3VuZEltYWdlOiA9PlxuICAgIGltZyA9IEBjb250YWluZXIuZmluZCgnaW1nJykuZmlyc3QoKVxuICAgIGlmIGltZy5oZWlnaHQoKSA+IDAgJiYgaW1nLndpZHRoKCkgPiAwXG4gICAgICBAY29udGFpbmVyLmNzc1xuICAgICAgICBoZWlnaHQ6IGltZy5oZWlnaHQoKVxuICAgICAgQHpvb21hYmxlID0gbmV3IFBsYW5pdC5QbGFuLlpvb21hYmxlXG4gICAgICAgIGNvbnRhaW5lcjogQGNvbnRhaW5lclxuICAgICAgaWYgQG9wdGlvbnMuaW1hZ2Uuem9vbVxuICAgICAgICBAem9vbWFibGUubmV3KClcbiAgICAgIEBpbWdMb2FkZWQgPSB0cnVlXG4gICAgZWxzZVxuICAgICAgc2V0VGltZW91dChAaW5pdEJhY2tncm91bmRJbWFnZSwgMjUwKVxuXG4gICMgKHByaXZhdGUpIENvbnRyb2wgYWRkaW5nIG1hcmtlcnMgdG8gdGhlIHBsYW4uIFdhaXQgZm9yXG4gICMgaW1hZ2UgdG8gYmUgbG9hZGVkIGlmIG5lY2Vzc2FyeS5cbiAgI1xuICBpbml0TWFya2VycyA9IC0+XG4gICAgaWYgQG9wdGlvbnMubWFya2VycyAmJiBAb3B0aW9ucy5tYXJrZXJzLmxlbmd0aCA+IDBcbiAgICAgIGlmIEBvcHRpb25zLmltYWdlICYmIEBvcHRpb25zLmltYWdlLnVybFxuICAgICAgICBAYWRkTWFya2VycygpXG4gICAgICBlbHNlXG4gICAgICAgIGZvciBtYXJrZXIgaW4gQG9wdGlvbnMubWFya2Vyc1xuICAgICAgICAgIG1hcmtlci5jb250YWluZXIgPSBAY29udGFpbmVyXG4gICAgICAgICAgbmV3IFBsYW5pdC5NYXJrZXIuQ3JlYXRvcihtYXJrZXIpXG5cbiAgIyBJbnRlcnZhbCBtZXRob2QgdGhhdCBjb250aW51ZXMgdG8gY2hlY2sgZm9yIGltYWdlIGJlaW5nXG4gICMgbG9hZGVkIGJlZm9yZSBhZGRpbmcgbWFya2VycyB0byB0aGUgcGxhblxuICAjXG4gIGFkZE1hcmtlcnM6ID0+XG4gICAgaWYgQGltZ0xvYWRlZCAmJiBAaW1nTG9hZGVkID09IHRydWVcbiAgICAgIGZvciBtYXJrZXIgaW4gQG9wdGlvbnMubWFya2Vyc1xuICAgICAgICBtYXJrZXIuY29udGFpbmVyID0gQGNvbnRhaW5lclxuICAgICAgICBuZXcgUGxhbml0Lk1hcmtlci5DcmVhdG9yKG1hcmtlcilcbiAgICBlbHNlXG4gICAgICBzZXRUaW1lb3V0KEBhZGRNYXJrZXJzLCAyNTApXG5cbiAgIyAocHJpdmF0ZSkgQmluZCBldmVudHMgdG8gdGhlIHBsYW5cbiAgI1xuICBpbml0RXZlbnRzID0gLT5cbiAgICBuZXcgUGxhbml0LlBsYW4uRXZlbnRzXG4gICAgICBjb250YWluZXI6IEBjb250YWluZXJcbiAgICAgIHBsYW5pdDogQFxuXG5jbGFzcyBQbGFuaXQuUGxhbi5FdmVudHNcblxuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBTZXR1cFxuXG4gIGNvbnN0cnVjdG9yOiAoQG9wdGlvbnMpIC0+XG5cbiAgICAjIGRlZmF1bHQgb3B0aW9uc1xuICAgIEBjb250YWluZXIgPSBAb3B0aW9ucy5jb250YWluZXJcbiAgICBAbWFya2Vyc0NvbnRhaW5lciA9IEBjb250YWluZXIuZmluZChcIi4je1BsYW5pdC5tYXJrZXJDb250YWluZXJDbGFzc31cIilcbiAgICBpZiBAY29udGFpbmVyLmZpbmQoXCIuI3tQbGFuaXQuaW1hZ2VDb250YWluZXJ9ID4gaW1nXCIpLmxlbmd0aCA+IDBcbiAgICAgIEBpbWFnZSA9IEBjb250YWluZXIuZmluZChcIi4je1BsYW5pdC5pbWFnZUNvbnRhaW5lcn0gPiBpbWdcIikuZmlyc3QoKVxuXG4gICAgIyBiaW5kIGRyYWdnYWJsZSBldmVudHNcbiAgICAkKGRvY3VtZW50KS5vbignbW91c2Vtb3ZlJywgQG1vdXNlbW92ZSlcbiAgICAkKGRvY3VtZW50KS5vbignbW91c2V1cCcsIEBtb3VzZXVwKVxuXG4gICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIFJlZnNcblxuICBtYXJrZXJzOiA9PlxuICAgIEBtYXJrZXJzQ29udGFpbmVyLmZpbmQoXCIuI3tQbGFuaXQubWFya2VyQ2xhc3N9XCIpXG5cbiAgZHJhZ2dpbmdNYXJrZXI6ID0+XG4gICAgQG1hcmtlcnNDb250YWluZXIuZmluZChcIi4je1BsYW5pdC5tYXJrZXJDbGFzc30uI3tQbGFuaXQuZHJhZ2dpbmdDbGFzc31cIilcblxuICBnZXRFdmVudFBvc2l0aW9uOiAoZSkgPT5cbiAgICAjIGNvbnRhaW5lciBkaW1lbnNpb25zXG4gICAgd0NvbnQgPSBwYXJzZUZsb2F0KEBtYXJrZXJzQ29udGFpbmVyLndpZHRoKCkpXG4gICAgaENvbnQgPSBwYXJzZUZsb2F0KEBtYXJrZXJzQ29udGFpbmVyLmhlaWdodCgpKVxuICAgICMgaWYoXG4gICAgIyAgIEBtYXJrZXJzQ29udGFpbmVyLmNzcygnYmFja2dyb3VuZEltYWdlJykgJiZcbiAgICAjICAgQG1hcmtlcnNDb250YWluZXIuY3NzKCdiYWNrZ3JvdW5kSW1hZ2UnKSAhPSAnbm9uZSdcbiAgICAjIClcbiAgICBpZiBAaW1hZ2VcbiAgICAgICMgaWYgdGhlcmUgaXMgYW4gaW1hZ2UsIHdlIG5lZWQgdG8gY2FsY3VsYXRlIHdpdGggaW1hZ2UgaW4gbWluZFxuICAgICAgeFB4ID0gZS5wYWdlWCAtIEBjb250YWluZXIub2Zmc2V0KCkubGVmdFxuICAgICAgeVB4ID0gZS5wYWdlWSAtIEBjb250YWluZXIub2Zmc2V0KCkudG9wXG4gICAgICB3SW1nID0gQGltYWdlLndpZHRoKClcbiAgICAgIGhJbWcgPSBAaW1hZ2UuaGVpZ2h0KClcbiAgICAgIHhJbWcgPSBwYXJzZUludChAaW1hZ2UuY3NzKCdsZWZ0JykpXG4gICAgICB5SW1nID0gcGFyc2VJbnQoQGltYWdlLmNzcygndG9wJykpXG4gICAgICB4UGMgPSAoKHhQeCArIE1hdGguYWJzKHhJbWcpKSAvIHdJbWcpICogMTAwXG4gICAgICB5UGMgPSAoKHlQeCArIE1hdGguYWJzKHlJbWcpKSAvIGhJbWcpICogMTAwXG4gICAgZWxzZVxuICAgICAgIyBvciB3ZSBjYW4ganVzdCBsb29rIGF0IHRoZSBjb250YWluZXJcbiAgICAgIHhQYyA9IChlLnBhZ2VYIC0gQGNvbnRhaW5lci5vZmZzZXQoKS5sZWZ0KSAvIHdDb250XG4gICAgICB5UGMgPSAgKGUucGFnZVkgLSBAY29udGFpbmVyLm9mZnNldCgpLnRvcCkgLyBoQ29udFxuICAgIFt4UGMsIHlQY11cblxuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBFdmVudHNcblxuICBtb3VzZXVwOiAoZSkgPT5cbiAgICAjIGRlYWxpbmcgd2l0aCBtYXJrZXJzLCBlc3AuIGRyYWdnaW5nIG1hcmtlcnNcbiAgICBtYXJrZXIgPSBAbWFya2Vyc0NvbnRhaW5lci5maW5kKFwiLiN7UGxhbml0LmRyYWdnaW5nQ2xhc3N9XCIpLmZpcnN0KClcbiAgICBpZiBAZHJhZ2dpbmdNYXJrZXIoKS5sZW5ndGggPiAwXG4gICAgICBtID0gbmV3IFBsYW5pdC5NYXJrZXIoQGNvbnRhaW5lciwgbWFya2VyLmF0dHIoJ2RhdGEtbWFya2VyJykpXG4gICAgICBAb3B0aW9ucy5wbGFuaXQubWFya2VyRHJhZ0VuZChlLCBtKVxuICAgICAgbS5zYXZlUG9zaXRpb24oKVxuICAgICAgbS5wb3NpdGlvbkluZm9ib3goKVxuICAgICAgQGRyYWdnaW5nTWFya2VyKCkucmVtb3ZlQ2xhc3MoUGxhbml0LmRyYWdnaW5nQ2xhc3MpXG4gICAgIyBpZiBjbGljayBpcyBvbiB0aGUgY29udGFpbmVyXG4gICAgaWYgJChlLnRhcmdldCkuaGFzQ2xhc3MoUGxhbml0Lm1hcmtlckNvbnRhaW5lckNsYXNzKVxuICAgICAgQG9wdGlvbnMucGxhbml0LmNhbnZhc0NsaWNrKGUsIEBnZXRFdmVudFBvc2l0aW9uKGUpKVxuICAgICMgaWYgY2xpY2sgaXMgb24gdGhlIG1hcmtlcnNcbiAgICBpZihcbiAgICAgICQoZS50YXJnZXQpLmhhc0NsYXNzKFBsYW5pdC5tYXJrZXJDbGFzcykgfHxcbiAgICAgICQoZS50YXJnZXQpLnBhcmVudHMoXCIuI3tQbGFuaXQubWFya2VyQ2xhc3N9XCIpLmxlbmd0aCA+IDBcbiAgICApXG4gICAgICBpZiAkKGUudGFyZ2V0KS5oYXNDbGFzcyhQbGFuaXQubWFya2VyQ2xhc3MpXG4gICAgICAgIG1hcmtlciA9ICQoZS50YXJnZXQpXG4gICAgICBlbHNlXG4gICAgICAgIG1hcmtlciA9ICQoZS50YXJnZXQpLnBhcmVudHMoXCIuI3tQbGFuaXQubWFya2VyQ2xhc3N9XCIpLmZpcnN0KClcbiAgICAgIG0gPSBuZXcgUGxhbml0Lk1hcmtlcihAY29udGFpbmVyLCBtYXJrZXIuYXR0cignZGF0YS1tYXJrZXInKSlcbiAgICAgIEBvcHRpb25zLnBsYW5pdC5tYXJrZXJDbGljayhlLCBtKVxuICAgIHRydWVcblxuICBtb3VzZW1vdmU6IChlKSA9PlxuICAgIG1hcmtlcnMgPSBAbWFya2Vyc0NvbnRhaW5lci5maW5kKFwiLiN7UGxhbml0Lm1hcmtlckNsYXNzfS4je1BsYW5pdC5kcmFnZ2luZ0NsYXNzfVwiKVxuXG4gICAgaWYgbWFya2Vycy5sZW5ndGggPiAwXG5cbiAgICAgICMgb25seSB1c2UgZmlyc3QgbWFya2VyIGluIGNhc2UgdGhlcmUgYXJlIG1vcmUgdGhhblxuICAgICAgIyBvbmUgZHJhZ2dpbmdcbiAgICAgICNcbiAgICAgIG1hcmtlciA9IG1hcmtlcnMuZmlyc3QoKVxuXG4gICAgICAjIHdlIGhpZGUgdGhlIGluZm9ib3ggd2hpbGUgZHJhZ2dpbmdcbiAgICAgICNcbiAgICAgIGlmKFxuICAgICAgICBNYXRoLmFicyhlLnBhZ2VYIC0gbWFya2VyLmF0dHIoJ2RhdGEtZHJhZy1zdGFydC14JykpID4gMCB8fFxuICAgICAgICBNYXRoLmFicyhlLnBhZ2VZIC0gbWFya2VyLmF0dHIoJ2RhdGEtZHJhZy1zdGFydC15JykpID4gMFxuICAgICAgKVxuICAgICAgICBAY29udGFpbmVyLmZpbmQoXCIjI3ttYXJrZXIuYXR0cignZGF0YS1pbmZvYm94Jyl9XCIpLnJlbW92ZUNsYXNzKCdhY3RpdmUnKVxuXG4gICAgICAjIGNhbGN1bGF0ZSBwb3NpdGlvbnNcbiAgICAgICNcbiAgICAgIG1vdXNlTGVmdCAgICAgPSBlLnBhZ2VYIC0gQGNvbnRhaW5lci5vZmZzZXQoKS5sZWZ0XG4gICAgICBtb3VzZVRvcCAgICAgID0gZS5wYWdlWSAtIEBjb250YWluZXIub2Zmc2V0KCkudG9wXG4gICAgICBwbGFuUmlnaHQgICAgID0gQGNvbnRhaW5lci53aWR0aCgpXG4gICAgICBwbGFuQm90dG9tICAgID0gQGNvbnRhaW5lci5oZWlnaHQoKVxuICAgICAgbWFya2VyTGVmdCAgICA9IG1vdXNlTGVmdCAtIChtYXJrZXIub3V0ZXJXaWR0aCgpIC8gMilcbiAgICAgIG1hcmtlclRvcCAgICAgPSBtb3VzZVRvcCAtIChtYXJrZXIub3V0ZXJIZWlnaHQoKSAvIDIpXG4gICAgICBtYXJrZXJSaWdodCAgID0gbW91c2VMZWZ0ICsgKG1hcmtlci5vdXRlcldpZHRoKCkgLyAyKVxuICAgICAgbWFya2VyQm90dG9tICA9IG1vdXNlVG9wICsgKG1hcmtlci5vdXRlckhlaWdodCgpIC8gMilcbiAgICAgIG1hcmtlcldpZHRoICAgPSBtYXJrZXIub3V0ZXJXaWR0aCgpXG4gICAgICBtYXJrZXJIZWlnaHQgID0gbWFya2VyLm91dGVySGVpZ2h0KClcblxuICAgICAgIyBmaW5kIHRoZSBsZWZ0IHBvc2l0aW9uIG9mIHRoZSBtYXJrZXIgYmFzZWQgb25cbiAgICAgICMgcG9zaXRpb24gb2YgdGhlIG1vdXNlIHJlbGF0aXZlIHRvIHRoZSBwbGFuXG4gICAgICAjXG4gICAgICBpZiBtYXJrZXJMZWZ0IDw9IDBcbiAgICAgICAgbWFya2VyWCA9IDBcbiAgICAgIGVsc2UgaWYgbWFya2VyUmlnaHQgPCBwbGFuUmlnaHRcbiAgICAgICAgbWFya2VyWCA9IG1hcmtlckxlZnRcbiAgICAgIGVsc2VcbiAgICAgICAgbWFya2VyWCA9IHBsYW5SaWdodCAtIG1hcmtlcldpZHRoXG5cbiAgICAgICMgZmluZCB0aGUgbGVmdCBwb3NpdGlvbiBvZiB0aGUgbWFya2VyIGJhc2VkIG9uXG4gICAgICAjIHBvc2l0aW9uIG9mIHRoZSBtb3VzZSByZWxhdGl2ZSB0byB0aGUgcGxhblxuICAgICAgI1xuICAgICAgaWYgbWFya2VyVG9wIDw9IDBcbiAgICAgICAgbWFya2VyWSA9IDBcbiAgICAgIGVsc2UgaWYgbWFya2VyQm90dG9tIDwgcGxhbkJvdHRvbVxuICAgICAgICBtYXJrZXJZID0gbWFya2VyVG9wXG4gICAgICBlbHNlXG4gICAgICAgIG1hcmtlclkgPSBwbGFuQm90dG9tIC0gbWFya2VySGVpZ2h0XG5cbiAgICAgICMgc2V0IHRoZSBwb3NpdGlvbiBvZiB0aGUgbWFya2VyXG4gICAgICAjXG4gICAgICBtYXJrZXIuY3NzXG4gICAgICAgIGxlZnQ6IG1hcmtlclhcbiAgICAgICAgdG9wOiBtYXJrZXJZXG5cbmNsYXNzIFBsYW5pdC5QbGFuLlpvb21hYmxlXG5cbiAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gU2V0dXBcblxuICBjb25zdHJ1Y3RvcjogKEBvcHRpb25zKSAtPlxuICAgICMgZGVmYXVsdCBvcHRpb25zXG4gICAgQGNvbnRhaW5lciA9IEBvcHRpb25zLmNvbnRhaW5lclxuICAgIEBtYXJrZXJzQ29udGFpbmVyID0gQGNvbnRhaW5lci5maW5kKFwiLiN7UGxhbml0Lm1hcmtlckNvbnRhaW5lckNsYXNzfVwiKVxuICAgIEBpbWFnZSA9IEBjb250YWluZXIuZmluZCgnaW1nJykuZmlyc3QoKVxuICAgIEB6b29tSWQgPSBQbGFuaXQucmFuZG9tU3RyaW5nKClcbiAgICBAbWFya2Vyc0NvbnRhaW5lci5hdHRyKCdkYXRhLXpvb20taWQnLCBAem9vbUlkKVxuICAgICMgc2V0IGluaXRpYWwgYmFja2dyb3VuZCBjb29yZGluYXRlc1xuICAgIEBpbWFnZVBvc2l0aW9uID1cbiAgICAgIGxlZnRQeDogICAgICAgICAwXG4gICAgICB0b3BQeDogICAgICAgICAgMFxuICAgICAgd2lkdGg6ICAgICAgICAgIEBpbWFnZS53aWR0aCgpXG4gICAgICBoZWlnaHQ6ICAgICAgICAgQGltYWdlLmhlaWdodCgpXG4gICAgICBzY2FsZTogICAgICAgICAgMVxuICAgICAgaW5jcmVtZW50OiAwLjVcbiAgICBAc2V0QmFja2dyb3VuZCgpXG5cbiAgIyB0aGlzIG9ubHkgZ2V0cyBydW4gaWYgdGhlIHVzZXIgc3BlY2lmaWVzIHpvb21hYmxlIC0tXG4gICMgb3RoZXJ3aXNlIHdlIGF0IGxlYXN0IGhhdmUgdGhlIGNsYXNzIGluaXRpYWxpemVkXG4gICNcbiAgbmV3OiA9PlxuICAgICMgZHJhdyB0aGUgY29udHJvbHMgZGlua3VzXG4gICAgQGNvbnRhaW5lci5wcmVwZW5kIFwiXCJcIlxuICAgICAgPGRpdiBjbGFzcz1cInBsYW5pdC1jb250cm9sc1wiPlxuICAgICAgICA8YSBocmVmPVwiI1wiIGNsYXNzPVwiem9vbVwiIGRhdGEtYWN0aW9uPVwiaW5cIj4rPC9hPlxuICAgICAgICA8YSBocmVmPVwiI1wiIGNsYXNzPVwiem9vbVwiIGRhdGEtYWN0aW9uPVwib3V0XCI+LTwvYT5cbiAgICAgIDwvZGl2PlxuICAgIFwiXCJcIlxuICAgIEBjb250YWluZXIuZmluZChcIi56b29tW2RhdGEtYWN0aW9uPSdpbiddXCIpLmNsaWNrIChlKSA9PlxuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICBAem9vbUluKClcbiAgICBAY29udGFpbmVyLmZpbmQoXCIuem9vbVtkYXRhLWFjdGlvbj0nb3V0J11cIikuY2xpY2sgKGUpID0+XG4gICAgICBlLnByZXZlbnREZWZhdWx0KClcbiAgICAgIEB6b29tT3V0KClcbiAgICAjIGJpbmQgZHJhZ2dhYmxlIGV2ZW50c1xuICAgIEBjb250YWluZXIub24oJ2RibGNsaWNrJywgQGRibGNsaWNrKVxuICAgIEBjb250YWluZXIub24oJ21vdXNlZG93bicsIEBtb3VzZWRvd24pXG4gICAgJChkb2N1bWVudCkub24oJ21vdXNlbW92ZScsIEBtb3VzZW1vdmUpXG4gICAgJChkb2N1bWVudCkub24oJ21vdXNldXAnLCBAbW91c2V1cClcblxuICByZXNldEltYWdlOiA9PlxuICAgIEBpbWFnZVBvc2l0aW9uID1cbiAgICAgIGxlZnRQeDogICAgICAgICAwXG4gICAgICB0b3BQeDogICAgICAgICAgMFxuICAgICAgd2lkdGg6ICAgICAgICAgIEBpbWFnZS53aWR0aCgpXG4gICAgICBoZWlnaHQ6ICAgICAgICAgQGltYWdlLmhlaWdodCgpXG4gICAgICBzY2FsZTogICAgICAgICAgMVxuICAgICAgaW5jcmVtZW50OiAwLjVcbiAgICBAc2V0QmFja2dyb3VuZCgpXG5cbiAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gQWN0aW9uc1xuXG4gIHNldEJhY2tncm91bmQ6ID0+XG4gICAgQGltYWdlLmNzc1xuICAgICAgbGVmdDogXCIje0BpbWFnZVBvc2l0aW9uLmxlZnRQeH1weFwiXG4gICAgICB0b3A6IFwiI3tAaW1hZ2VQb3NpdGlvbi50b3BQeH1weFwiXG4gICAgICB3aWR0aDogXCIje0BpbWFnZVBvc2l0aW9uLnNjYWxlICogMTAwLjB9JVwiXG4gICAgICBoZWlnaHQ6ICdhdXRvJ1xuICAgIEBzZXRNYXJrZXJzKClcblxuICBhbmltYXRlQmFja2dyb3VuZDogPT5cbiAgICBAaW1hZ2UuYW5pbWF0ZVxuICAgICAgbGVmdDogXCIje0BpbWFnZVBvc2l0aW9uLmxlZnRQeH1weFwiXG4gICAgICB0b3A6IFwiI3tAaW1hZ2VQb3NpdGlvbi50b3BQeH1weFwiXG4gICAgICB3aWR0aDogXCIje0BpbWFnZVBvc2l0aW9uLnNjYWxlICogMTAwLjB9JVwiXG4gICAgICBoZWlnaHQ6ICdhdXRvJ1xuICAgICwgMjUwXG4gICAgQGFuaW1hdGVNYXJrZXJzKClcblxuICBzZXRNYXJrZXJzOiA9PlxuICAgIG1hcmtlcnMgPSBAY29udGFpbmVyLmZpbmQoXCIuI3tQbGFuaXQubWFya2VyQ2xhc3N9XCIpXG4gICAgaWYgbWFya2Vycy5sZW5ndGggPiAwXG4gICAgICBmb3IgbWFya2VyIGluIG1hcmtlcnNcbiAgICAgICAgbGVmdCA9IChAaW1nV2lkdGgoKSAqICgkKG1hcmtlcikuYXR0cignZGF0YS14UGMnKSAvIDEwMCkpICtcbiAgICAgICAgICBAaW1hZ2VQb3NpdGlvbi5sZWZ0UHggLSAoJChtYXJrZXIpLm91dGVyV2lkdGgoKSAvIDIpXG4gICAgICAgIHRvcCA9IChAaW1nSGVpZ2h0KCkgKiAoJChtYXJrZXIpLmF0dHIoJ2RhdGEteVBjJykgLyAxMDApKSArXG4gICAgICAgICAgQGltYWdlUG9zaXRpb24udG9wUHggLSAoJChtYXJrZXIpLm91dGVySGVpZ2h0KCkgLyAyKVxuICAgICAgICAkKG1hcmtlcikuY3NzXG4gICAgICAgICAgbGVmdDogXCIje2xlZnR9cHhcIlxuICAgICAgICAgIHRvcDogXCIje3RvcH1weFwiXG4gICAgICBAcG9zaXRpb25JbmZvYm94ZXMoKVxuXG4gIGFuaW1hdGVNYXJrZXJzOiA9PlxuICAgIG1hcmtlcnMgPSBAY29udGFpbmVyLmZpbmQoXCIuI3tQbGFuaXQubWFya2VyQ2xhc3N9XCIpXG4gICAgaWYgbWFya2Vycy5sZW5ndGggPiAwXG4gICAgICBmb3IgbWFya2VyIGluIG1hcmtlcnNcbiAgICAgICAgbSA9IG5ldyBQbGFuaXQuTWFya2VyKEBjb250YWluZXIsICQobWFya2VyKS5hdHRyKCdkYXRhLW1hcmtlcicpKVxuICAgICAgICBtLmhpZGVJbmZvYm94KClcbiAgICAgICAgbGVmdCA9IChAaW1nV2lkdGgoKSAqICgkKG1hcmtlcikuYXR0cignZGF0YS14UGMnKSAvIDEwMCkpICtcbiAgICAgICAgICBAaW1hZ2VQb3NpdGlvbi5sZWZ0UHggLSAoJChtYXJrZXIpLm91dGVyV2lkdGgoKSAvIDIpXG4gICAgICAgIHRvcCA9IChAaW1nSGVpZ2h0KCkgKiAoJChtYXJrZXIpLmF0dHIoJ2RhdGEteVBjJykgLyAxMDApKSArXG4gICAgICAgICAgQGltYWdlUG9zaXRpb24udG9wUHggLSAoJChtYXJrZXIpLm91dGVySGVpZ2h0KCkgLyAyKVxuICAgICAgICBkbyAobSkgLT5cbiAgICAgICAgICAkKG1hcmtlcikuYW5pbWF0ZVxuICAgICAgICAgICAgbGVmdDogXCIje2xlZnR9cHhcIlxuICAgICAgICAgICAgdG9wOiBcIiN7dG9wfXB4XCJcbiAgICAgICAgICAsIDI1MCwgKCkgPT5cbiAgICAgICAgICAgIG0ucG9zaXRpb25JbmZvYm94KClcbiAgICAgICAgICAgIG0udW5oaWRlSW5mb2JveCgpXG5cbiAgcG9zaXRpb25JbmZvYm94ZXM6ID0+XG4gICAgZm9yIG1hcmtlciBpbiBAY29udGFpbmVyLmZpbmQoXCIuI3tQbGFuaXQubWFya2VyQ2xhc3N9XCIpXG4gICAgICBtID0gbmV3IFBsYW5pdC5NYXJrZXIoQGNvbnRhaW5lciwgJChtYXJrZXIpLmF0dHIoJ2RhdGEtbWFya2VyJykpXG4gICAgICBtLnBvc2l0aW9uSW5mb2JveCgpXG4gICAgdHJ1ZVxuXG4gIGFuaW1hdGVJbmZvYm94ZXM6ID0+XG4gICAgZm9yIG1hcmtlciBpbiBAY29udGFpbmVyLmZpbmQoXCIuI3tQbGFuaXQubWFya2VyQ2xhc3N9XCIpXG4gICAgICBtID0gbmV3IFBsYW5pdC5NYXJrZXIoQGNvbnRhaW5lciwgJChtYXJrZXIpLmF0dHIoJ2RhdGEtbWFya2VyJykpXG4gICAgICBtLmFuaW1hdGVJbmZvYm94KClcbiAgICB0cnVlXG5cbiAgY2VudGVyT246IChjb29yZHMpID0+XG4gICAgaWYgY29vcmRzWzBdID49IDUwIHRoZW4geCA9IDEwMCAtIGNvb3Jkc1swXSBlbHNlIHggPSBjb29yZHNbMF1cbiAgICBpZiBjb29yZHNbMV0gPj0gNTAgdGhlbiB5ID0gMTAwIC0gY29vcmRzWzFdIGVsc2UgeSA9IGNvb3Jkc1sxXVxuICAgIHdNaW4gPSA1MCAqIChAY29udGFpbmVyV2lkdGgoKSAvIHgpXG4gICAgaE1pbiA9IDUwICogKEBjb250YWluZXJIZWlnaHQoKSAvIHkpXG4gICAgIyBoaWRlcyBvdGhlciBhY3RpdmUgaW5mb2JveGVzLCBidXQgd2lsbCBzdGlsbCBzaG93XG4gICAgIyB0aGlzIGluZm9ib3hcbiAgICBAY29udGFpbmVyLmZpbmQoXCIuI3tQbGFuaXQuaW5mb2JveENsYXNzfVwiKS5yZW1vdmVDbGFzcygnYWN0aXZlJylcbiAgICAjIEdldCBvdXIgaW5pdGlhbCBwb3NpdGlvblxuICAgIEBpbWFnZVBvc2l0aW9uLmxlZnRQeCA9IC0gKFxuICAgICAgKEBpbWdXaWR0aCgpICogKGNvb3Jkc1swXSAvIDEwMCkpIC0gKEBjb250YWluZXJXaWR0aCgpIC8gMilcbiAgICApXG4gICAgQGltYWdlUG9zaXRpb24udG9wUHggPSAtIChcbiAgICAgIChAaW1nSGVpZ2h0KCkgKiAoY29vcmRzWzFdIC8gMTAwKSkgLSAoQGNvbnRhaW5lckhlaWdodCgpIC8gMilcbiAgICApXG4gICAgIyBrZWVwIHRoZW9yZXRpY2FsbHkgbWFraW5nIHRoZSBpbWFnZSBiaWdnZXIgdW50aWwgaXQgaXNcbiAgICAjIGxhcmdlIGVub3VnaCB0byBjZW50ZXIgb24gb3VyIHBvaW50XG4gICAgd2hpbGUgKEBpbWdXaWR0aCgpIDwgd01pbikgfHwgKEBpbWdIZWlnaHQoKSA8IGhNaW4pXG4gICAgICBAaW1hZ2VQb3NpdGlvbi5zY2FsZSAgPSBAaW1hZ2VQb3NpdGlvbi5zY2FsZSArIEBpbWFnZVBvc2l0aW9uLmluY3JlbWVudFxuICAgICAgQGltYWdlUG9zaXRpb24ubGVmdFB4ID0gLSAoXG4gICAgICAgIChAaW1nV2lkdGgoKSAqIChjb29yZHNbMF0gLyAxMDApKSAtIChAY29udGFpbmVyV2lkdGgoKSAvIDIpXG4gICAgICApXG4gICAgICBAaW1hZ2VQb3NpdGlvbi50b3BQeCA9IC0gKFxuICAgICAgICAoQGltZ0hlaWdodCgpICogKGNvb3Jkc1sxXSAvIDEwMCkpIC0gKEBjb250YWluZXJIZWlnaHQoKSAvIDIpXG4gICAgICApXG4gICAgQGFuaW1hdGVCYWNrZ3JvdW5kKClcblxuICB6b29tVG86IChsZXZlbCkgPT5cbiAgICBpID0gQGltYWdlUG9zaXRpb24uaW5jcmVtZW50XG4gICAgdW5sZXNzICgobGV2ZWwgKiBpKSArIDEpID09IEBpbWFnZVBvc2l0aW9uLnNjYWxlXG4gICAgICBAaW1hZ2VQb3NpdGlvbi5zY2FsZSA9IChsZXZlbCAqIGkpICsgMSArIGlcbiAgICAgIEB6b29tT3V0KClcblxuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBDYWxjdWxhdGlvbnNcblxuICAjIC0tLS0tLS0tLS0gSW1hZ2UgV2lkdGhcblxuICBpbWdXaWR0aDogPT5cbiAgICBwYXJzZUZsb2F0KEBpbWFnZVBvc2l0aW9uLndpZHRoICogQGltYWdlUG9zaXRpb24uc2NhbGUpXG5cbiAgdG1wSW1nV2lkdGg6ID0+XG4gICAgKDEgKyBAaW1hZ2VQb3NpdGlvbi5pbmNyZW1lbnQpICogQGltYWdlUG9zaXRpb24ud2lkdGgoKVxuXG4gIGltZ1dpZHRoQ2xpY2tJbmNyZW1lbnQ6ID0+XG4gICAgcGFyc2VGbG9hdChAaW1hZ2VQb3NpdGlvbi53aWR0aCAqIEBpbWFnZVBvc2l0aW9uLmluY3JlbWVudClcblxuICBpbWdXaWR0aFNjcm9sbEluY3JlbWVudDogPT5cbiAgICBwYXJzZUZsb2F0KEBpbWFnZVBvc2l0aW9uLndpZHRoICogQGltYWdlUG9zaXRpb24uc2Nyb2xsSW5jcmVtZW50KVxuXG4gIGNvbnRhaW5lcldpZHRoOiA9PlxuICAgIHBhcnNlRmxvYXQoQG1hcmtlcnNDb250YWluZXIud2lkdGgoKSlcblxuICAjIC0tLS0tLS0tLS0gTGVmdCAvIFJpZ2h0XG5cbiAgaW1nT2Zmc2V0TGVmdDogPT5cbiAgICBNYXRoLmFicyhwYXJzZUZsb2F0KEBpbWFnZS5jc3MoJ2xlZnQnKSkpXG5cbiAgIyAtLS0tLS0tLS0tIEhlaWdodFxuXG4gIGltZ0hlaWdodDogPT5cbiAgICBwYXJzZUZsb2F0KEBpbWFnZVBvc2l0aW9uLmhlaWdodCAqIEBpbWFnZVBvc2l0aW9uLnNjYWxlKVxuXG4gIHRtcEltZ0hlaWdodDogPT5cbiAgICAoMSArIEBpbWFnZVBvc2l0aW9uLmluY3JlbWVudCkgKiBAaW1hZ2VQb3NpdGlvbi5oZWlnaHQoKVxuXG4gIGltZ0hlaWdodENsaWNrSW5jcmVtZW50OiA9PlxuICAgIHBhcnNlRmxvYXQoQGltYWdlUG9zaXRpb24uaGVpZ2h0ICogQGltYWdlUG9zaXRpb24uaW5jcmVtZW50KVxuXG4gIGltZ0hlaWdodFNjcm9sbEluY3JlbWVudDogPT5cbiAgICBwYXJzZUZsb2F0KEBpbWFnZVBvc2l0aW9uLmhlaWdodCAqIEBpbWFnZVBvc2l0aW9uLnNjcm9sbEluY3JlbWVudClcblxuICBjb250YWluZXJIZWlnaHQ6ID0+XG4gICAgcGFyc2VGbG9hdChAbWFya2Vyc0NvbnRhaW5lci5oZWlnaHQoKSlcblxuICAjIC0tLS0tLS0tLS0gVG9wIC8gQm90dG9tXG5cbiAgaW1nT2Zmc2V0VG9wOiA9PlxuICAgIE1hdGguYWJzKHBhcnNlRmxvYXQoQGltYWdlLmNzcygndG9wJykpKVxuXG4gICMgLS0tLS0tLS0tLSBPdGhlclxuXG4gIGdldEV2ZW50Q29udGFpbmVyUG9zaXRpb246IChlKSA9PlxuICAgIGxlZnQ6IChlLnBhZ2VYIC0gQGNvbnRhaW5lci5vZmZzZXQoKS5sZWZ0KSAvIEBjb250YWluZXJXaWR0aCgpXG4gICAgdG9wOiAgKGUucGFnZVkgLSBAY29udGFpbmVyLm9mZnNldCgpLnRvcCkgLyBAY29udGFpbmVySGVpZ2h0KClcblxuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBFdmVudHNcblxuICBkYmxjbGljazogKGUpID0+XG4gICAgaWYgJChlLnRhcmdldCkuYXR0cignZGF0YS16b29tLWlkJykgPT0gQHpvb21JZFxuICAgICAgY2xpY2sgPSBAZ2V0RXZlbnRDb250YWluZXJQb3NpdGlvbihlKVxuICAgICAgQHpvb21JbignY2xpY2snLCBjbGljay5sZWZ0LCBjbGljay50b3ApXG5cbiAgbW91c2Vkb3duOiAoZSkgPT5cbiAgICBpZiAkKGUudGFyZ2V0KS5hdHRyKCdkYXRhLXpvb20taWQnKSA9PSBAem9vbUlkICYmIGUud2hpY2ggPT0gMVxuICAgICAgQGlzRHJhZ2dpbmcgPSB0cnVlXG4gICAgICBjb29yZHMgPSBAZ2V0RXZlbnRDb250YWluZXJQb3NpdGlvbihlKVxuICAgICAgQGRyYWdDb29yZHMgPVxuICAgICAgICBwb2ludFJlZjogY29vcmRzXG4gICAgICAgIGltZ1JlZjpcbiAgICAgICAgICBsZWZ0OiAwIC0gQGltZ09mZnNldExlZnQoKVxuICAgICAgICAgIHRvcDogMCAtIEBpbWdPZmZzZXRUb3AoKVxuICAgICAgICBtYXg6XG4gICAgICAgICAgcmlnaHQ6IChjb29yZHMubGVmdCAqIEBjb250YWluZXJXaWR0aCgpKSArIEBpbWdPZmZzZXRMZWZ0KClcbiAgICAgICAgICBsZWZ0OiAoY29vcmRzLmxlZnQgKiBAY29udGFpbmVyV2lkdGgoKSkgLSAoQGltZ1dpZHRoKCkgLVxuICAgICAgICAgICAgICAgICAgICAgIChAY29udGFpbmVyV2lkdGgoKSArIEBpbWdPZmZzZXRMZWZ0KCkpKVxuICAgICAgICAgIGJvdHRvbTogKGNvb3Jkcy50b3AgKiBAY29udGFpbmVySGVpZ2h0KCkpICsgQGltZ09mZnNldFRvcCgpXG4gICAgICAgICAgdG9wOiAoY29vcmRzLnRvcCAqIEBjb250YWluZXJIZWlnaHQoKSkgLSAoQGltZ0hlaWdodCgpIC1cbiAgICAgICAgICAgICAgICAgICAgICAoQGNvbnRhaW5lckhlaWdodCgpICsgQGltZ09mZnNldFRvcCgpKSlcbiAgICB0cnVlXG5cbiAgbW91c2Vtb3ZlOiAoZSkgPT5cbiAgICBpZiBAaXNEcmFnZ2luZ1xuICAgICAgY29vcmRzID0gQGdldEV2ZW50Q29udGFpbmVyUG9zaXRpb24oZSlcbiAgICAgIGRyYWdMZWZ0ID0gY29vcmRzLmxlZnQgKiBAY29udGFpbmVyV2lkdGgoKVxuICAgICAgZHJhZ1RvcCA9IGNvb3Jkcy50b3AgKiBAY29udGFpbmVySGVpZ2h0KClcbiAgICAgIGlmIGRyYWdMZWZ0ID49IEBkcmFnQ29vcmRzLm1heC5sZWZ0ICYmIGRyYWdMZWZ0IDw9IEBkcmFnQ29vcmRzLm1heC5yaWdodFxuICAgICAgICBsZWZ0ID0gKGNvb3Jkcy5sZWZ0IC0gQGRyYWdDb29yZHMucG9pbnRSZWYubGVmdCkgKiBAY29udGFpbmVyV2lkdGgoKVxuICAgICAgICBAaW1hZ2VQb3NpdGlvbi5sZWZ0UHggPSBAZHJhZ0Nvb3Jkcy5pbWdSZWYubGVmdCArIGxlZnRcbiAgICAgIGVsc2UgaWYgZHJhZ0xlZnQgPCBAZHJhZ0Nvb3Jkcy5tYXgubGVmdFxuICAgICAgICBAaW1hZ2VQb3NpdGlvbi5sZWZ0UHggPSBAY29udGFpbmVyV2lkdGgoKSAtIEBpbWdXaWR0aCgpXG4gICAgICBlbHNlIGlmIGRyYWdMZWZ0ID4gQGRyYWdDb29yZHMubWF4LnJpZ2h0XG4gICAgICAgIEBpbWFnZVBvc2l0aW9uLmxlZnRQeCA9IDBcbiAgICAgIGlmIGRyYWdUb3AgPj0gQGRyYWdDb29yZHMubWF4LnRvcCAmJiBkcmFnVG9wIDw9IEBkcmFnQ29vcmRzLm1heC5ib3R0b21cbiAgICAgICAgdG9wID0gKGNvb3Jkcy50b3AgLSBAZHJhZ0Nvb3Jkcy5wb2ludFJlZi50b3ApICogQGNvbnRhaW5lckhlaWdodCgpXG4gICAgICAgIEBpbWFnZVBvc2l0aW9uLnRvcFB4ID0gQGRyYWdDb29yZHMuaW1nUmVmLnRvcCArIHRvcFxuICAgICAgZWxzZSBpZiBkcmFnVG9wIDwgQGRyYWdDb29yZHMubWF4LnRvcFxuICAgICAgICBAaW1hZ2VQb3NpdGlvbi50b3BQeCA9IEBjb250YWluZXJIZWlnaHQoKSAtIEBpbWdIZWlnaHQoKVxuICAgICAgZWxzZSBpZiBkcmFnVG9wID4gQGRyYWdDb29yZHMubWF4LmJvdHRvbVxuICAgICAgICBAaW1hZ2VQb3NpdGlvbi50b3BQeCA9IDBcbiAgICAgIEBzZXRCYWNrZ3JvdW5kKClcbiAgICB0cnVlXG5cbiAgbW91c2V1cDogKGUpID0+XG4gICAgQGlzRHJhZ2dpbmcgPSBmYWxzZVxuICAgIEBwb3NpdGlvbkluZm9ib3hlcygpXG4gICAgdHJ1ZVxuXG4gICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIFpvb21pbmdcblxuICB6b29tSW46ID0+XG4gICAgQGltYWdlUG9zaXRpb24uc2NhbGUgID0gQGltYWdlUG9zaXRpb24uc2NhbGUgKyBAaW1hZ2VQb3NpdGlvbi5pbmNyZW1lbnRcbiAgICBAaW1hZ2VQb3NpdGlvbi5sZWZ0UHggPSAtIEBpbWdPZmZzZXRMZWZ0KCkgLSAoQGltZ1dpZHRoQ2xpY2tJbmNyZW1lbnQoKSAvIDIpXG4gICAgQGltYWdlUG9zaXRpb24udG9wUHggID0gLSBAaW1nT2Zmc2V0VG9wKCkgLSAoQGltZ0hlaWdodENsaWNrSW5jcmVtZW50KCkgLyAyKVxuICAgIEBhbmltYXRlQmFja2dyb3VuZCgpXG5cbiAgem9vbU91dDogKCkgPT5cbiAgICBpZiBAaW1hZ2VQb3NpdGlvbi5zY2FsZSA+IDFcbiAgICAgIEBpbWFnZVBvc2l0aW9uLnNjYWxlICA9IEBpbWFnZVBvc2l0aW9uLnNjYWxlIC0gQGltYWdlUG9zaXRpb24uaW5jcmVtZW50XG4gICAgICBsZWZ0UHggPSAtIEBpbWdPZmZzZXRMZWZ0KCkgKyAoQGltZ1dpZHRoQ2xpY2tJbmNyZW1lbnQoKSAvIDIpXG4gICAgICB0b3BQeCAgPSAtIEBpbWdPZmZzZXRUb3AoKSArIChAaW1nSGVpZ2h0Q2xpY2tJbmNyZW1lbnQoKSAvIDIpXG4gICAgICBpZiBsZWZ0UHggPiAwXG4gICAgICAgIEBpbWFnZVBvc2l0aW9uLmxlZnRQeCA9IDBcbiAgICAgIGVsc2UgaWYgbGVmdFB4IDwgQGNvbnRhaW5lcldpZHRoKCkgLSBAaW1nV2lkdGgoKVxuICAgICAgICBAaW1hZ2VQb3NpdGlvbi5sZWZ0UHggPSBAY29udGFpbmVyV2lkdGgoKSAtIEBpbWdXaWR0aCgpXG4gICAgICBlbHNlXG4gICAgICAgIEBpbWFnZVBvc2l0aW9uLmxlZnRQeCA9IGxlZnRQeFxuICAgICAgaWYgdG9wUHggPiAwXG4gICAgICAgIEBpbWFnZVBvc2l0aW9uLnRvcFB4ID0gMFxuICAgICAgZWxzZSBpZiB0b3BQeCA8IEBjb250YWluZXJIZWlnaHQoKSAtIEBpbWdIZWlnaHQoKVxuICAgICAgICBAaW1hZ2VQb3NpdGlvbi50b3BQeCA9IEBjb250YWluZXJIZWlnaHQoKSAtIEBpbWdIZWlnaHQoKVxuICAgICAgZWxzZVxuICAgICAgICBAaW1hZ2VQb3NpdGlvbi50b3BQeCA9IHRvcFB4XG4gICAgICBAYW5pbWF0ZUJhY2tncm91bmQoKVxuXG5jbGFzcyBQbGFuaXQuTWFya2VyXG5cbiAgY29uc3RydWN0b3I6IChAY29udGFpbmVyLCBpZCkgLT5cblxuICAgICMgU2V0IE9wdGlvbnNcbiAgICBAbWFya2Vyc0NvbnRhaW5lciA9IEBjb250YWluZXIuZmluZChcIi4je1BsYW5pdC5tYXJrZXJDb250YWluZXJDbGFzc31cIilcbiAgICBpZiBAY29udGFpbmVyLmZpbmQoXCIuI3tQbGFuaXQuaW1hZ2VDb250YWluZXJ9ID4gaW1nXCIpLmxlbmd0aCA+IDBcbiAgICAgIEBpbWFnZSA9IEBjb250YWluZXIuZmluZChcIi4je1BsYW5pdC5pbWFnZUNvbnRhaW5lcn0gPiBpbWdcIikuZmlyc3QoKVxuXG4gICAgIyBGaW5kIE1hcmtlclxuICAgIEBtYXJrZXIgPSBAbWFya2Vyc0NvbnRhaW5lci5maW5kKFxuICAgICAgXCIuI3tQbGFuaXQubWFya2VyQ2xhc3N9W2RhdGEtbWFya2VyPScje2lkfSddXCJcbiAgICApLmZpcnN0KClcblxuICAgICMgUmV0dXJuIHRoaXNcbiAgICBAXG5cbiAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gQ2FsY3VsYXRpb25zXG5cbiAgcG9zaXRpb246ID0+XG4gICAgeFB4ID0gQG1hcmtlci5wb3NpdGlvbigpLmxlZnQgKyAoQG1hcmtlci5vdXRlcldpZHRoKCkgLyAyKVxuICAgIHlQeCA9IEBtYXJrZXIucG9zaXRpb24oKS50b3AgKyAoQG1hcmtlci5vdXRlckhlaWdodCgpIC8gMilcbiAgICBpZiBAaW1hZ2VcbiAgICAgIHdJbWcgPSBAaW1hZ2Uud2lkdGgoKVxuICAgICAgaEltZyA9IEBpbWFnZS5oZWlnaHQoKVxuICAgICAgeEltZyA9IHBhcnNlSW50KEBpbWFnZS5jc3MoJ2xlZnQnKSlcbiAgICAgIHlJbWcgPSBwYXJzZUludChAaW1hZ2UuY3NzKCd0b3AnKSlcbiAgICAgIHhQYyA9ICgoeFB4ICsgTWF0aC5hYnMoeEltZykpIC8gd0ltZykgKiAxMDBcbiAgICAgIHlQYyA9ICgoeVB4ICsgTWF0aC5hYnMoeUltZykpIC8gaEltZykgKiAxMDBcbiAgICBlbHNlXG4gICAgICB4UGMgPSAoeFB4IC8gQGNvbnRhaW5lci53aWR0aCgpKSAqIDEwMFxuICAgICAgeVBjID0gKHlQeCAvIEBjb250YWluZXIuaGVpZ2h0KCkpICogMTAwXG4gICAgW3hQYywgeVBjXVxuXG4gIHJlbGF0aXZlUG9zaXRpb246ID0+XG4gICAgeFB4ID0gQG1hcmtlci5wb3NpdGlvbigpLmxlZnQgKyAoQG1hcmtlci5vdXRlcldpZHRoKCkgLyAyKVxuICAgIHlQeCA9IEBtYXJrZXIucG9zaXRpb24oKS50b3AgKyAoQG1hcmtlci5vdXRlckhlaWdodCgpIC8gMilcbiAgICB4UGMgPSAoeFB4IC8gQGNvbnRhaW5lci53aWR0aCgpKSAqIDEwMFxuICAgIHlQYyA9ICh5UHggLyBAY29udGFpbmVyLmhlaWdodCgpKSAqIDEwMFxuICAgIFt4UGMsIHlQY11cblxuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBBdHRyaWJ1dGVzXG5cbiAgY29sb3I6ID0+XG4gICAgQG1hcmtlci5jc3MoJ2JhY2tncm91bmRDb2xvcicpXG5cbiAgcGxhbml0SUQ6ID0+XG4gICAgQG1hcmtlci5hdHRyKCdkYXRhLW1hcmtlcicpXG5cbiAgaWQ6ID0+XG4gICAgQG1hcmtlci5hdHRyKCdkYXRhLWlkJylcblxuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBJbmZvYm94XG5cbiAgaW5mb2JveDogPT5cbiAgICBpbmZvYm94ID0gQGNvbnRhaW5lci5maW5kKFwiIyN7QG1hcmtlci5hdHRyKCdkYXRhLWluZm9ib3gnKX1cIilcbiAgICBpZiBpbmZvYm94Lmxlbmd0aCA+IDAgdGhlbiBpbmZvYm94IGVsc2UgbnVsbFxuXG4gIGluZm9ib3hIVE1MOiA9PlxuICAgIGlmIEBpbmZvYm94KCkgJiYgQGluZm9ib3goKS5sZW5ndGggPiAwIHRoZW4gQGluZm9ib3goKS5odG1sKCkgZWxzZSBudWxsXG5cbiAgaW5mb2JveFZpc2libGU6ID0+XG4gICAgQGluZm9ib3goKSAmJiBAaW5mb2JveCgpLmhhc0NsYXNzKCdhY3RpdmUnKVxuXG4gIGhpZGVJbmZvYm94OiA9PlxuICAgIEBpbmZvYm94KCkuYWRkQ2xhc3MoJ2hpZGRlbicpIGlmIEBpbmZvYm94VmlzaWJsZSgpXG5cbiAgc2hvd0luZm9ib3g6ID0+XG4gICAgQGluZm9ib3goKS5hZGRDbGFzcygnYWN0aXZlJykgaWYgQGluZm9ib3goKSAmJiAhQGluZm9ib3hWaXNpYmxlKClcbiAgICBAdW5oaWRlSW5mb2JveCgpXG5cbiAgdW5oaWRlSW5mb2JveDogPT5cbiAgICBAaW5mb2JveCgpLnJlbW92ZUNsYXNzKCdoaWRkZW4nKSBpZiBAaW5mb2JveFZpc2libGUoKVxuXG4gIGluZm9ib3hDb29yZHM6ID0+XG4gICAgaW5mb2JveCA9IEBjb250YWluZXIuZmluZChcIiMje0BtYXJrZXIuYXR0cignZGF0YS1pbmZvYm94Jyl9XCIpXG4gICAgbWFya2VyQ2VudGVyWCA9IChwYXJzZUZsb2F0KEByZWxhdGl2ZVBvc2l0aW9uKClbMF0gLyAxMDApICogQGNvbnRhaW5lci53aWR0aCgpKVxuICAgIG1hcmtlckNlbnRlclkgPSAocGFyc2VGbG9hdChAcmVsYXRpdmVQb3NpdGlvbigpWzFdIC8gMTAwKSAqIEBjb250YWluZXIuaGVpZ2h0KCkpXG4gICAgaVdpZHRoID0gaW5mb2JveC5vdXRlcldpZHRoKClcbiAgICBpSGFsZldpZHRoID0gaVdpZHRoIC8gMlxuICAgIGlIZWlnaHQgPSBpbmZvYm94Lm91dGVySGVpZ2h0KClcbiAgICBpSGFsZkhlaWdodCA9IGlIZWlnaHQgLyAyXG4gICAgY1dpZHRoID0gQGNvbnRhaW5lci53aWR0aCgpXG4gICAgY0hlaWdodCA9IEBjb250YWluZXIuaGVpZ2h0KClcbiAgICBtV2lkdGggPSBAbWFya2VyLm91dGVyV2lkdGgoKVxuICAgIG1IYWxmV2lkdGggPSBtV2lkdGggLyAyXG4gICAgbUhlaWdodCA9IEBtYXJrZXIub3V0ZXJIZWlnaHQoKVxuICAgIG1IYWxmSGVpZ2h0ID0gbUhlaWdodCAvIDJcbiAgICBidWZmZXIgPSA1XG4gICAgb2Zmc2V0WCA9IHBhcnNlSW50KGluZm9ib3guYXR0cignZGF0YS1vZmZzZXQteCcpKVxuICAgIG9mZnNldFggPSAwIHVubGVzcyBvZmZzZXRYXG4gICAgb2Zmc2V0WSA9IHBhcnNlSW50KGluZm9ib3guYXR0cignZGF0YS1vZmZzZXQteScpKVxuICAgIG9mZnNldFkgPSAwIHVubGVzcyBvZmZzZXRZXG4gICAgc3dpdGNoIGluZm9ib3guYXR0cignZGF0YS1wb3NpdGlvbicpXG4gICAgICB3aGVuICd0b3AnXG4gICAgICAgIGluZm9MZWZ0ID0gbWFya2VyQ2VudGVyWCAtIGlIYWxmV2lkdGhcbiAgICAgICAgaW5mb1RvcCA9IG1hcmtlckNlbnRlclkgLSBpSGVpZ2h0IC0gbUhhbGZIZWlnaHQgLSBidWZmZXJcbiAgICAgIHdoZW4gJ3JpZ2h0J1xuICAgICAgICBpbmZvTGVmdCA9IG1hcmtlckNlbnRlclggKyBtSGFsZldpZHRoICsgYnVmZmVyXG4gICAgICAgIGluZm9Ub3AgPSBtYXJrZXJDZW50ZXJZIC0gaUhhbGZIZWlnaHRcbiAgICAgIHdoZW4gJ2JvdHRvbSdcbiAgICAgICAgaW5mb0xlZnQgPSBtYXJrZXJDZW50ZXJYIC0gaUhhbGZXaWR0aFxuICAgICAgICBpbmZvVG9wID0gbWFya2VyQ2VudGVyWSArIG1IYWxmSGVpZ2h0ICsgYnVmZmVyXG4gICAgICB3aGVuICdsZWZ0J1xuICAgICAgICBpbmZvTGVmdCA9IG1hcmtlckNlbnRlclggLSBpV2lkdGggLSBtSGFsZldpZHRoIC0gYnVmZmVyXG4gICAgICAgIGluZm9Ub3AgPSBtYXJrZXJDZW50ZXJZIC0gaUhhbGZIZWlnaHRcbiAgICAgIHdoZW4gJ3RvcC1sZWZ0J1xuICAgICAgICBpbmZvTGVmdCA9IG1hcmtlckNlbnRlclggLSBpV2lkdGggLSBtSGFsZldpZHRoICsgYnVmZmVyXG4gICAgICAgIGluZm9Ub3AgPSBtYXJrZXJDZW50ZXJZIC0gaUhlaWdodCAtIG1IYWxmSGVpZ2h0ICsgYnVmZmVyXG4gICAgICB3aGVuICd0b3AtcmlnaHQnXG4gICAgICAgIGluZm9MZWZ0ID0gbWFya2VyQ2VudGVyWCArIG1IYWxmV2lkdGggLSBidWZmZXJcbiAgICAgICAgaW5mb1RvcCA9IG1hcmtlckNlbnRlclkgLSBpSGVpZ2h0IC0gbUhhbGZIZWlnaHQgKyBidWZmZXJcbiAgICAgIHdoZW4gJ2JvdHRvbS1sZWZ0J1xuICAgICAgICBpbmZvTGVmdCA9IG1hcmtlckNlbnRlclggLSBpV2lkdGggLSBtSGFsZldpZHRoICsgYnVmZmVyXG4gICAgICAgIGluZm9Ub3AgPSBtYXJrZXJDZW50ZXJZICsgbUhhbGZIZWlnaHQgLSBidWZmZXJcbiAgICAgIHdoZW4gJ2JvdHRvbS1yaWdodCdcbiAgICAgICAgaW5mb0xlZnQgPSBtYXJrZXJDZW50ZXJYICsgbUhhbGZXaWR0aCAtIGJ1ZmZlclxuICAgICAgICBpbmZvVG9wID0gbWFya2VyQ2VudGVyWSArIG1IYWxmSGVpZ2h0IC0gYnVmZmVyXG4gICAgbGVmdDogaW5mb0xlZnQgKyBvZmZzZXRYXG4gICAgdG9wOiBpbmZvVG9wICsgb2Zmc2V0WVxuXG4gIHBvc2l0aW9uSW5mb2JveDogPT5cbiAgICBjb29yZHMgPSBAaW5mb2JveENvb3JkcygpXG4gICAgQGNvbnRhaW5lci5maW5kKFwiIyN7QG1hcmtlci5hdHRyKCdkYXRhLWluZm9ib3gnKX1cIikuY3NzXG4gICAgICBsZWZ0OiBcIiN7Y29vcmRzLmxlZnR9cHhcIlxuICAgICAgdG9wOiBcIiN7Y29vcmRzLnRvcH1weFwiXG4gICAgQHBvc2l0aW9uKClcblxuICBhbmltYXRlSW5mb2JveDogPT5cbiAgICBjb29yZHMgPSBAaW5mb2JveENvb3JkcygpXG4gICAgQGNvbnRhaW5lci5maW5kKFwiIyN7QG1hcmtlci5hdHRyKCdkYXRhLWluZm9ib3gnKX1cIikuYW5pbWF0ZVxuICAgICAgbGVmdDogXCIje2Nvb3Jkcy5sZWZ0fXB4XCJcbiAgICAgIHRvcDogXCIje2Nvb3Jkcy50b3B9cHhcIlxuICAgICwgMjUwLCAoKSA9PlxuICAgICAgcmV0dXJuIEBwb3NpdGlvbigpXG5cbiAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gRHJhZ2dpbmdcblxuICBpc0RyYWdnYWJsZTogPT5cbiAgICBAbWFya2VyLmhhc0NsYXNzKCdkcmFnZ2FibGUnKVxuXG4gICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIEFjdGlvbnNcblxuICBzZXQ6ID0+XG4gICAgbGVmdCA9IChAaW1hZ2Uud2lkdGgoKSAqIChAbWFya2VyLmF0dHIoJ2RhdGEteFBjJykgLyAxMDApKSArXG4gICAgICBwYXJzZUZsb2F0KEBpbWFnZS5jc3MoJ2xlZnQnKSkgLSAoQG1hcmtlci5vdXRlcldpZHRoKCkgLyAyKVxuICAgIHRvcCA9IChAaW1hZ2UuaGVpZ2h0KCkgKiAoQG1hcmtlci5hdHRyKCdkYXRhLXlQYycpIC8gMTAwKSkgK1xuICAgICAgcGFyc2VGbG9hdChAaW1hZ2UuY3NzKCd0b3AnKSkgLSAoQG1hcmtlci5vdXRlckhlaWdodCgpIC8gMilcbiAgICBAbWFya2VyLmNzc1xuICAgICAgbGVmdDogXCIje2xlZnR9cHhcIlxuICAgICAgdG9wOiBcIiN7dG9wfXB4XCJcbiAgICBAcG9zaXRpb25JbmZvYm94KClcbiAgICBbbGVmdCwgdG9wXVxuXG4gIHNhdmVQb3NpdGlvbjogPT5cbiAgICBjb29yZHMgPSBAcG9zaXRpb24oKVxuICAgIEBtYXJrZXIuYXR0clxuICAgICAgJ2RhdGEteFBjJzogY29vcmRzWzBdXG4gICAgICAnZGF0YS15UGMnOiBjb29yZHNbMV1cblxuICB1cGRhdGU6IChvcHRpb25zKSA9PlxuICAgIGlmIG9wdGlvbnMuY29sb3JcbiAgICAgIEBtYXJrZXIuY3NzKGJhY2tncm91bmRDb2xvcjogb3B0aW9ucy5jb2xvcilcbiAgICBpZiBvcHRpb25zLmluZm9ib3hcbiAgICAgIEBtYXJrZXIuZmluZChcIi4je1BsYW5pdC5pbmZvYm94Q2xhc3N9XCIpLmh0bWwob3B0aW9ucy5pbmZvYm94KVxuICAgICAgQHBvc2l0aW9uSW5mb2JveCgpXG4gICAgaWYgb3B0aW9ucy5kcmFnZ2FibGVcbiAgICAgIEBtYXJrZXIucmVtb3ZlQ2xhc3MoJ2RyYWdnYWJsZScpXG4gICAgICBAbWFya2VyLmFkZENsYXNzKCdkcmFnZ2FibGUnKSBpZiBvcHRpb25zLmRyYWdnYWJsZSA9PSB0cnVlXG4gICAgaWYgb3B0aW9ucy5jb29yZHNcbiAgICAgIGxlZnQgPSAoKHBhcnNlRmxvYXQob3B0aW9ucy5jb29yZHNbMF0pIC8gMTAwKSAqIEBjb250YWluZXIud2lkdGgoKSkgLSAxNVxuICAgICAgdG9wID0gKChwYXJzZUZsb2F0KG9wdGlvbnMuY29vcmRzWzFdKSAvIDEwMCkgKiBAY29udGFpbmVyLmhlaWdodCgpKSAtIDE1XG4gICAgICBAbWFya2VyLmNzc1xuICAgICAgICBsZWZ0OiBcIiN7bGVmdH1weFwiXG4gICAgICAgIHRvcDogXCIje3RvcH1weFwiXG5cbiAgcmVtb3ZlOiA9PlxuICAgIEBpbmZvYm94KCkucmVtb3ZlKCkgaWYgQGluZm9ib3goKVxuICAgIEBtYXJrZXIucmVtb3ZlKClcblxuY2xhc3MgUGxhbml0Lk1hcmtlci5FdmVudHNcblxuICBjb25zdHJ1Y3RvcjogKEBvcHRpb25zKSAtPlxuXG4gICAgIyBTZXQgT3B0aW9uc1xuICAgIEBjb250YWluZXIgPSBAb3B0aW9ucy5jb250YWluZXJcbiAgICBAbWFya2Vyc0NvbnRhaW5lciA9IEBjb250YWluZXIuZmluZChcIi4je1BsYW5pdC5tYXJrZXJDb250YWluZXJDbGFzc31cIilcblxuICAgICMgRmluZCBNYXJrZXJcbiAgICBAbWFya2VyID0gQG1hcmtlcnNDb250YWluZXIuZmluZChcbiAgICAgIFwiLiN7UGxhbml0Lm1hcmtlckNsYXNzfVtkYXRhLW1hcmtlcj0nI3tAb3B0aW9ucy5wbGFuaXRJRH0nXVwiXG4gICAgKS5maXJzdCgpXG4gICAgQG1hcmtlck9iaiA9IG5ldyBQbGFuaXQuTWFya2VyKEBjb250YWluZXIsIEBvcHRpb25zLnBsYW5pdElEKVxuXG4gICAgIyBEcmFnZ2FibGVcbiAgICBpZiBAb3B0aW9ucy5kcmFnZ2FibGVcbiAgICAgIEBtYXJrZXIuYWRkQ2xhc3MoJ2RyYWdnYWJsZScpXG4gICAgICBAbWFya2VyLm9uICdtb3VzZWRvd24nLCAoZSkgPT5cbiAgICAgICAgaWYgZS53aGljaCA9PSAxXG4gICAgICAgICAgbWFya2VyID0gJChlLnRhcmdldCkuY2xvc2VzdChcIi4je1BsYW5pdC5tYXJrZXJDbGFzc31cIilcbiAgICAgICAgICBtYXJrZXIuYWRkQ2xhc3MoUGxhbml0LmRyYWdnaW5nQ2xhc3MpXG4gICAgICAgICAgbWFya2VyLmF0dHJcbiAgICAgICAgICAgICdkYXRhLWRyYWctc3RhcnQteCc6IGUucGFnZVhcbiAgICAgICAgICAgICdkYXRhLWRyYWctc3RhcnQteSc6IGUucGFnZVlcblxuICAgICMgSW5mb2JveFxuICAgIGlmIEBvcHRpb25zLmluZm9ib3hcbiAgICAgIGlkID0gUGxhbml0LnJhbmRvbVN0cmluZygxNilcbiAgICAgICMgc2V0IHN0eWxlIG9wdGlvbnMgb24gaW5mb2JveFxuICAgICAgb3B0aW9ucyA9IEBvcHRpb25zLmluZm9ib3hcbiAgICAgIGlmIG9wdGlvbnMucG9zaXRpb24gdGhlbiBwb3NpdGlvbiA9IG9wdGlvbnMucG9zaXRpb24gZWxzZSBwb3NpdGlvbiA9ICd0b3AnXG4gICAgICBpZiBvcHRpb25zLmFycm93IHRoZW4gYXJyb3cgPSB0cnVlIGVsc2UgYXJyb3cgPSBmYWxzZVxuICAgICAgaWYgYXJyb3cgPT0gdHJ1ZSB0aGVuIGFycm93Q2xhc3MgPSAnYXJyb3cnIGVsc2UgYXJyb3dDbGFzcyA9ICcnXG4gICAgICBjbGFzc2VzID0gXCIje1BsYW5pdC5pbmZvYm94Q2xhc3N9ICN7cG9zaXRpb259ICN7YXJyb3dDbGFzc31cIlxuICAgICAgQGNvbnRhaW5lci5maW5kKFwiLiN7UGxhbml0LmluZm9ib3hDb250YWluZXJDbGFzc31cIikuYXBwZW5kIFwiXCJcIlxuICAgICAgICA8ZGl2IGNsYXNzPVwiI3tjbGFzc2VzfVwiIGlkPVwiaW5mby0je2lkfVwiXG4gICAgICAgICAgZGF0YS1wb3NpdGlvbj1cIiN7cG9zaXRpb259XCI+XG4gICAgICAgICAgICAje29wdGlvbnMuaHRtbH1cbiAgICAgICAgPC9kaXY+XG4gICAgICAgICAgXCJcIlwiXG4gICAgICBpZiBvcHRpb25zLm9mZnNldFhcbiAgICAgICAgQGNvbnRhaW5lci5maW5kKFwiLiN7UGxhbml0LmluZm9ib3hDbGFzc31cIikubGFzdCgpLmF0dHJcbiAgICAgICAgICAnZGF0YS1vZmZzZXQteCc6IG9wdGlvbnMub2Zmc2V0WFxuICAgICAgaWYgb3B0aW9ucy5vZmZzZXRZXG4gICAgICAgIEBjb250YWluZXIuZmluZChcIi4je1BsYW5pdC5pbmZvYm94Q2xhc3N9XCIpLmxhc3QoKS5hdHRyXG4gICAgICAgICAgJ2RhdGEtb2Zmc2V0LXknOiBvcHRpb25zLm9mZnNldFlcbiAgICAgIEBtYXJrZXIuYXR0cignZGF0YS1pbmZvYm94JywgXCJpbmZvLSN7aWR9XCIpXG4gICAgICBAbWFya2VyT2JqLnBvc2l0aW9uSW5mb2JveCgpXG5cbiAgbWFya2VyczogLT5cbiAgICBAbWFya2Vyc0NvbnRhaW5lci5maW5kKFwiLiN7UGxhbml0Lm1hcmtlckNsYXNzfVwiKVxuXG4gIGRyYWdnaW5nTWFya2VyOiAtPlxuICAgIEBtYXJrZXJzQ29udGFpbmVyLmZpbmQoXCIuI3tQbGFuaXQubWFya2VyQ2xhc3N9LiN7UGxhbml0LmRyYWdnaW5nQ2xhc3N9XCIpXG5cbmNsYXNzIFBsYW5pdC5NYXJrZXIuQ3JlYXRvclxuXG4gIGNvbnN0cnVjdG9yOiAoQG9wdGlvbnMpIC0+XG4gICAgIyBTZXQgT3B0aW9uc1xuICAgIEBjb250YWluZXIgPSBAb3B0aW9ucy5jb250YWluZXJcbiAgICBAbWFya2Vyc0NvbnRhaW5lciA9IEBjb250YWluZXIuZmluZChcIi4je1BsYW5pdC5tYXJrZXJDb250YWluZXJDbGFzc31cIikuZmlyc3QoKVxuICAgIHVubGVzcyBAb3B0aW9ucy5wbGFuaXRJRFxuICAgICAgQG9wdGlvbnMucGxhbml0SUQgPSBQbGFuaXQucmFuZG9tU3RyaW5nKDIwKVxuXG4gICAgIyBBZGQgTWFya2VyXG4gICAgaWYgQG9wdGlvbnMuY29sb3IgdGhlbiBjb2xvciA9IEBvcHRpb25zLmNvbG9yIGVsc2UgY29sb3IgPSAnI0ZDNUIzRidcblxuICAgIGxlZnQgPSAoKHBhcnNlRmxvYXQoQG9wdGlvbnMuY29vcmRzWzBdKSAvIDEwMCkgKiBAY29udGFpbmVyLndpZHRoKCkpIC0gMTVcbiAgICB0b3AgPSAoKHBhcnNlRmxvYXQoQG9wdGlvbnMuY29vcmRzWzFdKSAvIDEwMCkgKiBAY29udGFpbmVyLmhlaWdodCgpKSAtIDE1XG4gICAgQG1hcmtlcnNDb250YWluZXIuYXBwZW5kKFxuICAgICAgJCgnPGRpdj48L2Rpdj4nKVxuICAgICAgICAuYWRkQ2xhc3MoUGxhbml0Lm1hcmtlckNsYXNzKVxuICAgICAgICAuYXR0clxuICAgICAgICAgICdkYXRhLW1hcmtlcic6IEBvcHRpb25zLnBsYW5pdElEXG4gICAgICAgICAgJ2RhdGEteFBjJzogQG9wdGlvbnMuY29vcmRzWzBdXG4gICAgICAgICAgJ2RhdGEteVBjJzogQG9wdGlvbnMuY29vcmRzWzFdXG4gICAgICAgIC5jc3NcbiAgICAgICAgICBsZWZ0OiBcIiN7bGVmdH1weFwiXG4gICAgICAgICAgdG9wOiBcIiN7dG9wfXB4XCJcbiAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6IGNvbG9yXG4gICAgKVxuICAgIG1hcmtlciA9IEBtYXJrZXJzQ29udGFpbmVyLmZpbmQoXCIuI3tQbGFuaXQubWFya2VyQ2xhc3N9XCIpLmxhc3QoKVxuICAgIGlmIEBvcHRpb25zLmlkXG4gICAgICBtYXJrZXIuYXR0cignZGF0YS1pZCc6IEBvcHRpb25zLmlkKVxuICAgIGlmIEBvcHRpb25zLmNsYXNzXG4gICAgICBtYXJrZXIuYWRkQ2xhc3MoQG9wdGlvbnMuY2xhc3MpXG4gICAgaWYgQG9wdGlvbnMuaHRtbFxuICAgICAgbWFya2VyLmh0bWwoQG9wdGlvbnMuaHRtbClcbiAgICBpZiBAb3B0aW9ucy5zaXplXG4gICAgICBtYXJrZXIuY3NzXG4gICAgICAgIHdpZHRoOiBcIiN7QG9wdGlvbnMuc2l6ZX1weFwiXG4gICAgICAgIGhlaWdodDogXCIje0BvcHRpb25zLnNpemV9cHhcIlxuXG4gICAgIyBCaW5kIEV2ZW50cyAoaW4gYSBzZXBhcmF0ZSBjbGFzcylcbiAgICBuZXcgUGxhbml0Lk1hcmtlci5FdmVudHMoQG9wdGlvbnMpXG5cbiAgICAjIFJldHVybiBhIG5ldyBpbnN0YW5jZSBvZiB0aGlzIG1hcmtlclxuICAgIG5ldyBQbGFuaXQuTWFya2VyKEBjb250YWluZXIsIEBvcHRpb25zLnBsYW5pdElEKVxuIl19