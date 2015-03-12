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
    this.resize = bind(this.resize, this);
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
    $(window).resize(this.resize);
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

  Events.prototype.resize = function(e) {
    var j, len, m, marker, ref, results;
    if (this.image) {
      this.container.height(this.image.height());
    }
    ref = this.markersContainer.find('.planit-marker');
    results = [];
    for (j = 0, len = ref.length; j < len; j++) {
      marker = ref[j];
      m = new Planit.Marker(this.container, $(marker).attr('data-marker'));
      results.push(m.set());
    }
    return results;
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

//# sourceMappingURL=data:application/json;base64,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QUNFLE1BQUEsTUFBTSxDQUFDLElBQVAsQ0FBWTtBQUFBLFFBQUEsU0FBQSxFQUFXLElBQUMsQ0FBQSxPQUFPLENBQUMsRUFBcEI7T0FBWixDQUFBLENBREY7S0F2QkE7QUF5QkEsSUFBQSxJQUFHLElBQUMsQ0FBQSxPQUFPLENBQUMsT0FBRCxDQUFYO0FBQ0UsTUFBQSxNQUFNLENBQUMsUUFBUCxDQUFnQixJQUFDLENBQUEsT0FBTyxDQUFDLE9BQUQsQ0FBeEIsQ0FBQSxDQURGO0tBekJBO0FBMkJBLElBQUEsSUFBRyxJQUFDLENBQUEsT0FBTyxDQUFDLElBQVo7QUFDRSxNQUFBLE1BQU0sQ0FBQyxJQUFQLENBQVksSUFBQyxDQUFBLE9BQU8sQ0FBQyxJQUFyQixDQUFBLENBREY7S0EzQkE7QUE2QkEsSUFBQSxJQUFHLElBQUMsQ0FBQSxPQUFPLENBQUMsSUFBWjtBQUNFLE1BQUEsTUFBTSxDQUFDLEdBQVAsQ0FDRTtBQUFBLFFBQUEsS0FBQSxFQUFVLElBQUMsQ0FBQSxPQUFPLENBQUMsSUFBVixHQUFlLElBQXhCO0FBQUEsUUFDQSxNQUFBLEVBQVcsSUFBQyxDQUFBLE9BQU8sQ0FBQyxJQUFWLEdBQWUsSUFEekI7T0FERixDQUFBLENBREY7S0E3QkE7QUFBQSxJQW1DSSxJQUFBLE1BQU0sQ0FBQyxNQUFNLENBQUMsTUFBZCxDQUFxQixJQUFDLENBQUEsT0FBdEIsQ0FuQ0osQ0FBQTtBQUFBLElBc0NJLElBQUEsTUFBTSxDQUFDLE1BQVAsQ0FBYyxJQUFDLENBQUEsU0FBZixFQUEwQixJQUFDLENBQUEsT0FBTyxDQUFDLFFBQW5DLENBdENKLENBRlc7RUFBQSxDQUFiOztpQkFBQTs7SUFyeUJGLENBQUEiLCJmaWxlIjoicGxhbml0LXRtcC5qcyIsInNvdXJjZVJvb3QiOiIvc291cmNlLyIsInNvdXJjZXNDb250ZW50IjpbImNsYXNzIFBsYW5pdFxuXG4gICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIFJlZnNcblxuICBAY29udGFpbmVyQ2xhc3M6ICAgICAgICAncGxhbml0LWNvbnRhaW5lcidcbiAgQG1hcmtlckNvbnRhaW5lckNsYXNzOiAgJ3BsYW5pdC1tYXJrZXJzLWNvbnRhaW5lcidcbiAgQG1hcmtlckNsYXNzOiAgICAgICAgICAgJ3BsYW5pdC1tYXJrZXInXG4gIEBtYXJrZXJDb250ZW50Q2xhc3M6ICAgICdwbGFuaXQtbWFya2VyLWNvbnRlbnQnXG4gIEBpbmZvYm94Q29udGFpbmVyQ2xhc3M6ICdwbGFuaXQtaW5mb2JveC1jb250YWluZXInXG5cbiAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gRGVmYXVsdCBPcHRpb25zXG5cbiAgbmV3OiAoQG9wdGlvbnMgPSB7fSkgLT5cbiAgICAjIFNldCBPcHRpb25zXG4gICAgaWYgQG9wdGlvbnMuY29udGFpbmVyXG4gICAgICBAb3B0aW9ucy5jb250YWluZXIgPSAkKFwiIyN7QG9wdGlvbnMuY29udGFpbmVyfVwiKVxuICAgIGVsc2VcbiAgICAgIEBvcHRpb25zLmNvbnRhaW5lciA9ICQoJyNwbGFuaXQnKVxuXG4gICAgIyBJbml0aWFsaXplIENvbnRhaW5lclxuICAgIEBvcHRpb25zLmNvbnRhaW5lci5hZGRDbGFzcygncGxhbml0LWNvbnRhaW5lcicpXG4gICAgQG9wdGlvbnMuY29udGFpbmVyLmFwcGVuZCBcIlwiXCJcbiAgICAgIDxkaXYgY2xhc3M9XCIje1BsYW5pdC5pbmZvYm94Q29udGFpbmVyQ2xhc3N9XCI+PC9kaXY+XG4gICAgICA8ZGl2IGNsYXNzPVwiI3tQbGFuaXQubWFya2VyQ29udGFpbmVyQ2xhc3N9XCI+PC9kaXY+XG4gICAgICAgIFwiXCJcIlxuXG4gICAgIyBSZWZzXG4gICAgQGNvbnRhaW5lciA9IEBvcHRpb25zLmNvbnRhaW5lclxuICAgIEBtYXJrZXJzQ29udGFpbmVyID0gQGNvbnRhaW5lci5maW5kKFwiLiN7UGxhbml0Lm1hcmtlckNvbnRhaW5lckNsYXNzfVwiKS5maXJzdCgpXG5cbiAgICAjIEFkZCBpbWFnZSBhbmQgem9vbSAoaWYgbmVjZXNzYXJ5KVxuICAgIGlmIEBvcHRpb25zLmltYWdlICYmIEBvcHRpb25zLmltYWdlLnVybFxuICAgICAgQGNvbnRhaW5lci5wcmVwZW5kIFwiXCJcIlxuICAgICAgICA8ZGl2IGNsYXNzPVwiaW1hZ2UtY29udGFpbmVyXCI+XG4gICAgICAgICAgPGltZyBzcmM9XCIje0BvcHRpb25zLmltYWdlLnVybH1cIj5cbiAgICAgICAgPC9kaXY+XG4gICAgICBcIlwiXCJcbiAgICAgICMgQG1hcmtlcnNDb250YWluZXIuY3NzXG4gICAgICAjICAgYmFja2dyb3VuZEltYWdlOiBcInVybCgnI3tAb3B0aW9ucy5pbWFnZS51cmx9JylcIlxuICAgICAgQGluaXRCYWNrZ3JvdW5kSW1hZ2UoKVxuXG4gICAgIyBBZGQgTWFya2VycyAoaWYgbmVjZXNzYXJ5KVxuICAgIGlmIEBvcHRpb25zLm1hcmtlcnMgJiYgQG9wdGlvbnMubWFya2Vycy5sZW5ndGggPiAwXG4gICAgICBAaW5pdE1hcmtlcnMoKVxuXG4gICAgIyBCaW5kIERvY3VtZW50IEV2ZW50c1xuICAgIG5ldyBQbGFuaXQuUGxhbi5FdmVudHNcbiAgICAgIGNvbnRhaW5lcjogQGNvbnRhaW5lclxuICAgICAgcGxhbml0OiBAXG5cbiAgICAjIFJldHVybiB0aGlzIFBsYW5pdCBvYmplY3RcbiAgICBAXG5cbiAgaW5pdEJhY2tncm91bmRJbWFnZTogPT5cbiAgICBpbWcgPSBAY29udGFpbmVyLmZpbmQoJ2ltZycpLmZpcnN0KClcbiAgICBpbWdIZWlnaHQgPSBpbWcuaGVpZ2h0KClcbiAgICBpZiBpbWdIZWlnaHQgPiAwICYmIGltZy53aWR0aCgpID4gMFxuICAgICAgQGNvbnRhaW5lci5jc3NcbiAgICAgICAgaGVpZ2h0OiBpbWdIZWlnaHRcbiAgICAgICMgaW1nLnJlbW92ZSgpXG4gICAgICBAem9vbWFibGUgPSBuZXcgUGxhbml0LlBsYW4uWm9vbWFibGVcbiAgICAgICAgY29udGFpbmVyOiBAY29udGFpbmVyXG4gICAgICBpZiBAb3B0aW9ucy5pbWFnZS56b29tXG4gICAgICAgIEB6b29tYWJsZS5uZXcoKVxuICAgICAgQGltZ0xvYWRlZCA9IHRydWVcbiAgICBlbHNlXG4gICAgICBzZXRUaW1lb3V0KEBpbml0QmFja2dyb3VuZEltYWdlLCAyNTApXG5cbiAgaW5pdE1hcmtlcnM6ID0+XG4gICAgaWYgQG9wdGlvbnMuaW1hZ2UgJiYgQG9wdGlvbnMuaW1hZ2UudXJsXG4gICAgICBpZiBAaW1nTG9hZGVkID09IHRydWVcbiAgICAgICAgQGFkZE1hcmtlcihtYXJrZXIpIGZvciBtYXJrZXIgaW4gQG9wdGlvbnMubWFya2Vyc1xuICAgICAgZWxzZVxuICAgICAgICBzZXRUaW1lb3V0KEBpbml0TWFya2VycywgMjUwKVxuICAgIGVsc2VcbiAgICAgIEBhZGRNYXJrZXIobWFya2VyKSBmb3IgbWFya2VyIGluIEBvcHRpb25zLm1hcmtlcnNcblxuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBBZGQgQSBNYXJrZXJcblxuICBhZGRNYXJrZXI6IChvcHRpb25zKSA9PlxuICAgIG9wdGlvbnMuY29udGFpbmVyID0gQGNvbnRhaW5lclxuICAgIG5ldyBQbGFuaXQuTWFya2VyLkNyZWF0b3Iob3B0aW9ucylcblxuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBSZXRyaWV2ZSBEYXRhXG5cbiAgZ2V0TWFya2VyOiAoaWQpID0+XG4gICAgbmV3IFBsYW5pdC5NYXJrZXIoQGNvbnRhaW5lciwgaWQpXG5cbiAgZ2V0QWxsTWFya2VyczogKCkgPT5cbiAgICBwbGFuID0gbmV3IFBsYW5pdC5QbGFuKEBjb250YWluZXIpXG4gICAgcGxhbi5nZXRBbGxNYXJrZXJzKClcblxuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBQbGFuIEFjdGlvbnNcblxuICBjZW50ZXJPbjogKGNvb3JkcykgLT5cbiAgICBAem9vbWFibGUuY2VudGVyT24oY29vcmRzKVxuXG4gIHpvb21UbzogKGxldmVsKSAtPlxuICAgIEB6b29tYWJsZS56b29tVG8obGV2ZWwpXG5cbiAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gRXZlbnQgQ2FsbGJhY2tzXG5cbiAgbWFya2VyRHJhZ0VuZDogKGV2ZW50LCBtYXJrZXIpID0+XG4gICAgaWYgQG9wdGlvbnMubWFya2VyRHJhZ0VuZFxuICAgICAgQG9wdGlvbnMubWFya2VyRHJhZ0VuZChldmVudCwgbWFya2VyKVxuXG4gIG1hcmtlckNsaWNrOiAoZXZlbnQsIG1hcmtlcikgPT5cbiAgICBpZiBAb3B0aW9ucy5tYXJrZXJDbGlja1xuICAgICAgQG9wdGlvbnMubWFya2VyQ2xpY2soZXZlbnQsIG1hcmtlcilcblxuICBjYW52YXNDbGljazogKGV2ZW50LCBjb29yZHMpID0+XG4gICAgaWYgQG9wdGlvbnMuY2FudmFzQ2xpY2tcbiAgICAgIEBvcHRpb25zLmNhbnZhc0NsaWNrKGV2ZW50LCBjb29yZHMpXG5cbiAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gQ2xhc3MgTWV0aG9kc1xuXG4gIEByYW5kb21TdHJpbmc6IChsZW5ndGggPSAxNikgLT5cbiAgICBzdHIgPSBNYXRoLnJhbmRvbSgpLnRvU3RyaW5nKDM2KS5zbGljZSgyKVxuICAgIHN0ciA9IHN0ciArIE1hdGgucmFuZG9tKCkudG9TdHJpbmcoMzYpLnNsaWNlKDIpXG4gICAgc3RyLnN1YnN0cmluZygwLCBsZW5ndGggLSAxKVxuXG4jIHNldCB0aGlzIGNsYXNzIHRvIGEgZ2xvYmFsIGBwbGFuaXRgIHZhcmlhYmxlXG53aW5kb3cucGxhbml0ID0gbmV3IFBsYW5pdFxuXG5jbGFzcyBQbGFuaXQuUGxhblxuXG4gICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIFNldHVwXG5cbiAgY29uc3RydWN0b3I6IChAY29udGFpbmVyKSAtPlxuICAgIEBtYXJrZXJzQ29udGFpbmVyID0gQGNvbnRhaW5lci5maW5kKFwiLiN7UGxhbml0Lm1hcmtlckNvbnRhaW5lckNsYXNzfVwiKS5maXJzdCgpXG5cbiAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gR2V0IEFsbCBNYXJrZXJzXG5cbiAgZ2V0QWxsTWFya2VyczogKCkgPT5cbiAgICBtYXJrZXJzID0gW11cbiAgICBmb3IgbWFya2VyIGluIEBtYXJrZXJzQ29udGFpbmVyLmZpbmQoJy5wbGFuaXQtbWFya2VyJylcbiAgICAgIG0gPSBuZXcgUGxhbml0Lk1hcmtlcihAY29udGFpbmVyLCAkKG1hcmtlcikuYXR0cignZGF0YS1tYXJrZXInKSlcbiAgICAgIG1hcmtlciA9XG4gICAgICAgICMgY29vcmRzOiBbbS5wb3NpdGlvbigpLmxlZnQsIG0ucG9zaXRpb24oKS50b3BdXG4gICAgICAgIGNvb3JkczogbS5wb3NpdGlvbigpXG4gICAgICAgIGRyYWdnYWJsZTogbS5pc0RyYWdnYWJsZSgpXG4gICAgICAgIGNvbG9yOiBtLmNvbG9yKClcbiAgICAgIG1hcmtlci5pbmZvYm94ID0gbS5pbmZvYm94SFRNTCgpIGlmIG0uaW5mb2JveEhUTUwoKVxuICAgICAgbWFya2Vycy5wdXNoKG0pXG4gICAgbWFya2Vyc1xuXG5jbGFzcyBQbGFuaXQuUGxhbi5FdmVudHNcblxuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBTZXR1cFxuXG4gIGNvbnN0cnVjdG9yOiAoQG9wdGlvbnMpIC0+XG5cbiAgICAjIGRlZmF1bHQgb3B0aW9uc1xuICAgIEBjb250YWluZXIgPSBAb3B0aW9ucy5jb250YWluZXJcbiAgICBAbWFya2Vyc0NvbnRhaW5lciA9IEBjb250YWluZXIuZmluZChcIi4je1BsYW5pdC5tYXJrZXJDb250YWluZXJDbGFzc31cIilcbiAgICBpZiBAY29udGFpbmVyLmZpbmQoJy5pbWFnZS1jb250YWluZXIgPiBpbWcnKS5sZW5ndGggPiAwXG4gICAgICBAaW1hZ2UgPSBAY29udGFpbmVyLmZpbmQoJy5pbWFnZS1jb250YWluZXIgPiBpbWcnKS5maXJzdCgpXG5cbiAgICAjIGJpbmQgZHJhZ2dhYmxlIGV2ZW50c1xuICAgICQoZG9jdW1lbnQpLm9uKCdtb3VzZW1vdmUnLCBAbW91c2Vtb3ZlKVxuICAgICQoZG9jdW1lbnQpLm9uKCdtb3VzZXVwJywgQG1vdXNldXApXG5cbiAgICAkKHdpbmRvdykucmVzaXplKEByZXNpemUpXG5cbiAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gUmVmc1xuXG4gIG1hcmtlcnM6ID0+XG4gICAgQG1hcmtlcnNDb250YWluZXIuZmluZCgnLnBsYW5pdC1tYXJrZXInKVxuXG4gIGRyYWdnaW5nTWFya2VyOiA9PlxuICAgIEBtYXJrZXJzQ29udGFpbmVyLmZpbmQoJy5wbGFuaXQtbWFya2VyLmlzLWRyYWdnaW5nJylcblxuICBnZXRFdmVudFBvc2l0aW9uOiAoZSkgPT5cbiAgICAjIGNvbnRhaW5lciBkaW1lbnNpb25zXG4gICAgd0NvbnQgPSBwYXJzZUZsb2F0KEBtYXJrZXJzQ29udGFpbmVyLndpZHRoKCkpXG4gICAgaENvbnQgPSBwYXJzZUZsb2F0KEBtYXJrZXJzQ29udGFpbmVyLmhlaWdodCgpKVxuICAgICMgaWYoXG4gICAgIyAgIEBtYXJrZXJzQ29udGFpbmVyLmNzcygnYmFja2dyb3VuZEltYWdlJykgJiZcbiAgICAjICAgQG1hcmtlcnNDb250YWluZXIuY3NzKCdiYWNrZ3JvdW5kSW1hZ2UnKSAhPSAnbm9uZSdcbiAgICAjIClcbiAgICBpZiBAaW1hZ2VcbiAgICAgICMgaWYgdGhlcmUgaXMgYW4gaW1hZ2UsIHdlIG5lZWQgdG8gY2FsY3VsYXRlIHdpdGggaW1hZ2UgaW4gbWluZFxuICAgICAgeFB4ID0gZS5wYWdlWCAtIEBjb250YWluZXIub2Zmc2V0KCkubGVmdFxuICAgICAgeVB4ID0gZS5wYWdlWSAtIEBjb250YWluZXIub2Zmc2V0KCkudG9wXG4gICAgICB3SW1nID0gQGltYWdlLndpZHRoKClcbiAgICAgIGhJbWcgPSBAaW1hZ2UuaGVpZ2h0KClcbiAgICAgIHhJbWcgPSBwYXJzZUludChAaW1hZ2UuY3NzKCdsZWZ0JykpXG4gICAgICB5SW1nID0gcGFyc2VJbnQoQGltYWdlLmNzcygndG9wJykpXG4gICAgICB4UGMgPSAoKHhQeCArIE1hdGguYWJzKHhJbWcpKSAvIHdJbWcpICogMTAwXG4gICAgICB5UGMgPSAoKHlQeCArIE1hdGguYWJzKHlJbWcpKSAvIGhJbWcpICogMTAwXG4gICAgZWxzZVxuICAgICAgIyBvciB3ZSBjYW4ganVzdCBsb29rIGF0IHRoZSBjb250YWluZXJcbiAgICAgIHhQYyA9IChlLnBhZ2VYIC0gQGNvbnRhaW5lci5vZmZzZXQoKS5sZWZ0KSAvIHdDb250XG4gICAgICB5UGMgPSAgKGUucGFnZVkgLSBAY29udGFpbmVyLm9mZnNldCgpLnRvcCkgLyBoQ29udFxuICAgIFt4UGMsIHlQY11cblxuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBFdmVudHNcblxuICBtb3VzZXVwOiAoZSkgPT5cbiAgICAjIGRlYWxpbmcgd2l0aCBtYXJrZXJzLCBlc3AuIGRyYWdnaW5nIG1hcmtlcnNcbiAgICBtYXJrZXIgPSBAbWFya2Vyc0NvbnRhaW5lci5maW5kKCcuaXMtZHJhZ2dpbmcnKS5maXJzdCgpXG4gICAgaWYgQGRyYWdnaW5nTWFya2VyKCkubGVuZ3RoID4gMFxuICAgICAgbSA9IG5ldyBQbGFuaXQuTWFya2VyKEBjb250YWluZXIsIG1hcmtlci5hdHRyKCdkYXRhLW1hcmtlcicpKVxuICAgICAgQG9wdGlvbnMucGxhbml0Lm1hcmtlckRyYWdFbmQoZSwgbSlcbiAgICAgIG0uc2F2ZVBvc2l0aW9uKClcbiAgICAgIG0ucG9zaXRpb25JbmZvYm94KClcbiAgICAgIEBkcmFnZ2luZ01hcmtlcigpLnJlbW92ZUNsYXNzKCdpcy1kcmFnZ2luZycpXG4gICAgIyBpZiBjbGljayBpcyBvbiB0aGUgY29udGFpbmVyXG4gICAgaWYgJChlLnRhcmdldCkuaGFzQ2xhc3MoUGxhbml0Lm1hcmtlckNvbnRhaW5lckNsYXNzKVxuICAgICAgQG9wdGlvbnMucGxhbml0LmNhbnZhc0NsaWNrKGUsIEBnZXRFdmVudFBvc2l0aW9uKGUpKVxuICAgICMgaWYgY2xpY2sgaXMgb24gdGhlIG1hcmtlcnNcbiAgICBpZihcbiAgICAgICQoZS50YXJnZXQpLmhhc0NsYXNzKFBsYW5pdC5tYXJrZXJDbGFzcykgfHxcbiAgICAgICQoZS50YXJnZXQpLnBhcmVudHMoXCIuI3tQbGFuaXQubWFya2VyQ2xhc3N9XCIpLmxlbmd0aCA+IDBcbiAgICApXG4gICAgICBpZiAkKGUudGFyZ2V0KS5oYXNDbGFzcyhQbGFuaXQubWFya2VyQ2xhc3MpXG4gICAgICAgIG1hcmtlciA9ICQoZS50YXJnZXQpXG4gICAgICBlbHNlXG4gICAgICAgIG1hcmtlciA9ICQoZS50YXJnZXQpLnBhcmVudHMoXCIuI3tQbGFuaXQubWFya2VyQ2xhc3N9XCIpLmZpcnN0KClcbiAgICAgIG0gPSBuZXcgUGxhbml0Lk1hcmtlcihAY29udGFpbmVyLCBtYXJrZXIuYXR0cignZGF0YS1tYXJrZXInKSlcbiAgICAgIEBvcHRpb25zLnBsYW5pdC5tYXJrZXJDbGljayhlLCBtKVxuICAgIHRydWVcblxuICBtb3VzZW1vdmU6IChlKSA9PlxuICAgIG1hcmtlcnMgPSBAbWFya2Vyc0NvbnRhaW5lci5maW5kKCcucGxhbml0LW1hcmtlci5pcy1kcmFnZ2luZycpXG5cbiAgICBpZiBtYXJrZXJzLmxlbmd0aCA+IDBcblxuICAgICAgIyBvbmx5IHVzZSBmaXJzdCBtYXJrZXIgaW4gY2FzZSB0aGVyZSBhcmUgbW9yZSB0aGFuXG4gICAgICAjIG9uZSBkcmFnZ2luZ1xuICAgICAgI1xuICAgICAgbWFya2VyID0gbWFya2Vycy5maXJzdCgpXG5cbiAgICAgICMgd2UgaGlkZSB0aGUgaW5mb2JveCB3aGlsZSBkcmFnZ2luZ1xuICAgICAgI1xuICAgICAgaWYoXG4gICAgICAgIE1hdGguYWJzKGUucGFnZVggLSBtYXJrZXIuYXR0cignZGF0YS1kcmFnLXN0YXJ0LXgnKSkgPiAwIHx8XG4gICAgICAgIE1hdGguYWJzKGUucGFnZVkgLSBtYXJrZXIuYXR0cignZGF0YS1kcmFnLXN0YXJ0LXknKSkgPiAwXG4gICAgICApXG4gICAgICAgICQoXCIjI3ttYXJrZXIuYXR0cignZGF0YS1pbmZvYm94Jyl9XCIpLnJlbW92ZUNsYXNzKCdhY3RpdmUnKVxuXG4gICAgICAjIGNhbGN1bGF0ZSBwb3NpdGlvbnNcbiAgICAgICNcbiAgICAgIG1vdXNlTGVmdCAgICAgPSBlLnBhZ2VYIC0gQGNvbnRhaW5lci5vZmZzZXQoKS5sZWZ0XG4gICAgICBtb3VzZVRvcCAgICAgID0gZS5wYWdlWSAtIEBjb250YWluZXIub2Zmc2V0KCkudG9wXG4gICAgICBwbGFuUmlnaHQgICAgID0gQGNvbnRhaW5lci53aWR0aCgpXG4gICAgICBwbGFuQm90dG9tICAgID0gQGNvbnRhaW5lci5oZWlnaHQoKVxuICAgICAgbWFya2VyTGVmdCAgICA9IG1vdXNlTGVmdCAtIChtYXJrZXIub3V0ZXJXaWR0aCgpIC8gMilcbiAgICAgIG1hcmtlclRvcCAgICAgPSBtb3VzZVRvcCAtIChtYXJrZXIub3V0ZXJIZWlnaHQoKSAvIDIpXG4gICAgICBtYXJrZXJSaWdodCAgID0gbW91c2VMZWZ0ICsgKG1hcmtlci5vdXRlcldpZHRoKCkgLyAyKVxuICAgICAgbWFya2VyQm90dG9tICA9IG1vdXNlVG9wICsgKG1hcmtlci5vdXRlckhlaWdodCgpIC8gMilcbiAgICAgIG1hcmtlcldpZHRoICAgPSBtYXJrZXIub3V0ZXJXaWR0aCgpXG4gICAgICBtYXJrZXJIZWlnaHQgID0gbWFya2VyLm91dGVySGVpZ2h0KClcblxuICAgICAgIyBmaW5kIHRoZSBsZWZ0IHBvc2l0aW9uIG9mIHRoZSBtYXJrZXIgYmFzZWQgb25cbiAgICAgICMgcG9zaXRpb24gb2YgdGhlIG1vdXNlIHJlbGF0aXZlIHRvIHRoZSBwbGFuXG4gICAgICAjXG4gICAgICBpZiBtYXJrZXJMZWZ0IDw9IDBcbiAgICAgICAgbWFya2VyWCA9IDBcbiAgICAgIGVsc2UgaWYgbWFya2VyUmlnaHQgPCBwbGFuUmlnaHRcbiAgICAgICAgbWFya2VyWCA9IG1hcmtlckxlZnRcbiAgICAgIGVsc2VcbiAgICAgICAgbWFya2VyWCA9IHBsYW5SaWdodCAtIG1hcmtlcldpZHRoXG5cbiAgICAgICMgZmluZCB0aGUgbGVmdCBwb3NpdGlvbiBvZiB0aGUgbWFya2VyIGJhc2VkIG9uXG4gICAgICAjIHBvc2l0aW9uIG9mIHRoZSBtb3VzZSByZWxhdGl2ZSB0byB0aGUgcGxhblxuICAgICAgI1xuICAgICAgaWYgbWFya2VyVG9wIDw9IDBcbiAgICAgICAgbWFya2VyWSA9IDBcbiAgICAgIGVsc2UgaWYgbWFya2VyQm90dG9tIDwgcGxhbkJvdHRvbVxuICAgICAgICBtYXJrZXJZID0gbWFya2VyVG9wXG4gICAgICBlbHNlXG4gICAgICAgIG1hcmtlclkgPSBwbGFuQm90dG9tIC0gbWFya2VySGVpZ2h0XG5cbiAgICAgICMgc2V0IHRoZSBwb3NpdGlvbiBvZiB0aGUgbWFya2VyXG4gICAgICAjXG4gICAgICBtYXJrZXIuY3NzXG4gICAgICAgIGxlZnQ6IG1hcmtlclhcbiAgICAgICAgdG9wOiBtYXJrZXJZXG5cbiAgcmVzaXplOiAoZSkgPT5cbiAgICBpZiBAaW1hZ2VcbiAgICAgIEBjb250YWluZXIuaGVpZ2h0KEBpbWFnZS5oZWlnaHQoKSlcbiAgICBmb3IgbWFya2VyIGluIEBtYXJrZXJzQ29udGFpbmVyLmZpbmQoJy5wbGFuaXQtbWFya2VyJylcbiAgICAgIG0gPSBuZXcgUGxhbml0Lk1hcmtlcihAY29udGFpbmVyLCAkKG1hcmtlcikuYXR0cignZGF0YS1tYXJrZXInKSlcbiAgICAgIG0uc2V0KClcblxuY2xhc3MgUGxhbml0LlBsYW4uWm9vbWFibGVcblxuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBTZXR1cFxuXG4gIGNvbnN0cnVjdG9yOiAoQG9wdGlvbnMpIC0+XG4gICAgIyBkZWZhdWx0IG9wdGlvbnNcbiAgICBAY29udGFpbmVyID0gQG9wdGlvbnMuY29udGFpbmVyXG4gICAgQG1hcmtlcnNDb250YWluZXIgPSBAY29udGFpbmVyLmZpbmQoXCIuI3tQbGFuaXQubWFya2VyQ29udGFpbmVyQ2xhc3N9XCIpXG4gICAgQGltYWdlID0gQGNvbnRhaW5lci5maW5kKCdpbWcnKS5maXJzdCgpXG4gICAgQHpvb21JZCA9IFBsYW5pdC5yYW5kb21TdHJpbmcoKVxuICAgIEBtYXJrZXJzQ29udGFpbmVyLmF0dHIoJ2RhdGEtem9vbS1pZCcsIEB6b29tSWQpXG4gICAgIyBzZXQgaW5pdGlhbCBiYWNrZ3JvdW5kIGNvb3JkaW5hdGVzXG4gICAgQGltYWdlUG9zaXRpb24gPVxuICAgICAgbGVmdFB4OiAgICAgICAgIDBcbiAgICAgIHRvcFB4OiAgICAgICAgICAwXG4gICAgICB3aWR0aDogICAgICAgICAgQGltYWdlLndpZHRoKClcbiAgICAgIGhlaWdodDogICAgICAgICBAaW1hZ2UuaGVpZ2h0KClcbiAgICAgIHNjYWxlOiAgICAgICAgICAxXG4gICAgICBpbmNyZW1lbnQ6IDAuNVxuICAgIEBzZXRCYWNrZ3JvdW5kKClcblxuICAjIHRoaXMgb25seSBnZXRzIHJ1biBpZiB0aGUgdXNlciBzcGVjaWZpZXMgem9vbWFibGUgLS1cbiAgIyBvdGhlcndpc2Ugd2UgYXQgbGVhc3QgaGF2ZSB0aGUgY2xhc3MgaW5pdGlhbGl6ZWRcbiAgI1xuICBuZXc6ID0+XG4gICAgIyBkcmF3IHRoZSBjb250cm9scyBkaW5rdXNcbiAgICBAY29udGFpbmVyLnByZXBlbmQgXCJcIlwiXG4gICAgICA8ZGl2IGNsYXNzPVwicGxhbml0LWNvbnRyb2xzXCI+XG4gICAgICAgIDxhIGhyZWY9XCIjXCIgY2xhc3M9XCJ6b29tXCIgZGF0YS1hY3Rpb249XCJpblwiPis8L2E+XG4gICAgICAgIDxhIGhyZWY9XCIjXCIgY2xhc3M9XCJ6b29tXCIgZGF0YS1hY3Rpb249XCJvdXRcIj4tPC9hPlxuICAgICAgPC9kaXY+XG4gICAgXCJcIlwiXG4gICAgQGNvbnRhaW5lci5maW5kKFwiLnpvb21bZGF0YS1hY3Rpb249J2luJ11cIikuY2xpY2sgKGUpID0+XG4gICAgICBlLnByZXZlbnREZWZhdWx0KClcbiAgICAgIEB6b29tSW4oKVxuICAgIEBjb250YWluZXIuZmluZChcIi56b29tW2RhdGEtYWN0aW9uPSdvdXQnXVwiKS5jbGljayAoZSkgPT5cbiAgICAgIGUucHJldmVudERlZmF1bHQoKVxuICAgICAgQHpvb21PdXQoKVxuICAgICMgYmluZCBkcmFnZ2FibGUgZXZlbnRzXG4gICAgQGNvbnRhaW5lci5vbignZGJsY2xpY2snLCBAZGJsY2xpY2spXG4gICAgQGNvbnRhaW5lci5vbignbW91c2Vkb3duJywgQG1vdXNlZG93bilcbiAgICAkKGRvY3VtZW50KS5vbignbW91c2Vtb3ZlJywgQG1vdXNlbW92ZSlcbiAgICAkKGRvY3VtZW50KS5vbignbW91c2V1cCcsIEBtb3VzZXVwKVxuXG4gICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIEFjdGlvbnNcblxuICBzZXRCYWNrZ3JvdW5kOiA9PlxuICAgIEBpbWFnZS5jc3NcbiAgICAgIGxlZnQ6IFwiI3tAaW1hZ2VQb3NpdGlvbi5sZWZ0UHh9cHhcIlxuICAgICAgdG9wOiBcIiN7QGltYWdlUG9zaXRpb24udG9wUHh9cHhcIlxuICAgICAgd2lkdGg6IFwiI3tAaW1hZ2VQb3NpdGlvbi5zY2FsZSAqIDEwMC4wfSVcIlxuICAgICAgaGVpZ2h0OiAnYXV0bydcbiAgICBAc2V0TWFya2VycygpXG5cbiAgYW5pbWF0ZUJhY2tncm91bmQ6ID0+XG4gICAgQGltYWdlLmFuaW1hdGVcbiAgICAgIGxlZnQ6IFwiI3tAaW1hZ2VQb3NpdGlvbi5sZWZ0UHh9cHhcIlxuICAgICAgdG9wOiBcIiN7QGltYWdlUG9zaXRpb24udG9wUHh9cHhcIlxuICAgICAgd2lkdGg6IFwiI3tAaW1hZ2VQb3NpdGlvbi5zY2FsZSAqIDEwMC4wfSVcIlxuICAgICAgaGVpZ2h0OiAnYXV0bydcbiAgICAsIDI1MFxuICAgIEBhbmltYXRlTWFya2VycygpXG5cbiAgc2V0TWFya2VyczogPT5cbiAgICBtYXJrZXJzID0gQGNvbnRhaW5lci5maW5kKCdkaXYucGxhbml0LW1hcmtlcicpXG4gICAgaWYgbWFya2Vycy5sZW5ndGggPiAwXG4gICAgICBmb3IgbWFya2VyIGluIG1hcmtlcnNcbiAgICAgICAgbGVmdCA9IChAaW1nV2lkdGgoKSAqICgkKG1hcmtlcikuYXR0cignZGF0YS14UGMnKSAvIDEwMCkpICtcbiAgICAgICAgICBAaW1hZ2VQb3NpdGlvbi5sZWZ0UHggLSAoJChtYXJrZXIpLm91dGVyV2lkdGgoKSAvIDIpXG4gICAgICAgIHRvcCA9IChAaW1nSGVpZ2h0KCkgKiAoJChtYXJrZXIpLmF0dHIoJ2RhdGEteVBjJykgLyAxMDApKSArXG4gICAgICAgICAgQGltYWdlUG9zaXRpb24udG9wUHggLSAoJChtYXJrZXIpLm91dGVySGVpZ2h0KCkgLyAyKVxuICAgICAgICAkKG1hcmtlcikuY3NzXG4gICAgICAgICAgbGVmdDogXCIje2xlZnR9cHhcIlxuICAgICAgICAgIHRvcDogXCIje3RvcH1weFwiXG4gICAgICBAcG9zaXRpb25JbmZvYm94ZXMoKVxuXG4gIGFuaW1hdGVNYXJrZXJzOiA9PlxuICAgIG1hcmtlcnMgPSBAY29udGFpbmVyLmZpbmQoJ2Rpdi5wbGFuaXQtbWFya2VyJylcbiAgICBpZiBtYXJrZXJzLmxlbmd0aCA+IDBcbiAgICAgIGZvciBtYXJrZXIgaW4gbWFya2Vyc1xuICAgICAgICBtID0gbmV3IFBsYW5pdC5NYXJrZXIoQGNvbnRhaW5lciwgJChtYXJrZXIpLmF0dHIoJ2RhdGEtbWFya2VyJykpXG4gICAgICAgIG0uaGlkZUluZm9ib3goKVxuICAgICAgICBsZWZ0ID0gKEBpbWdXaWR0aCgpICogKCQobWFya2VyKS5hdHRyKCdkYXRhLXhQYycpIC8gMTAwKSkgK1xuICAgICAgICAgIEBpbWFnZVBvc2l0aW9uLmxlZnRQeCAtICgkKG1hcmtlcikub3V0ZXJXaWR0aCgpIC8gMilcbiAgICAgICAgdG9wID0gKEBpbWdIZWlnaHQoKSAqICgkKG1hcmtlcikuYXR0cignZGF0YS15UGMnKSAvIDEwMCkpICtcbiAgICAgICAgICBAaW1hZ2VQb3NpdGlvbi50b3BQeCAtICgkKG1hcmtlcikub3V0ZXJIZWlnaHQoKSAvIDIpXG4gICAgICAgIGRvIChtKSAtPlxuICAgICAgICAgICQobWFya2VyKS5hbmltYXRlXG4gICAgICAgICAgICBsZWZ0OiBcIiN7bGVmdH1weFwiXG4gICAgICAgICAgICB0b3A6IFwiI3t0b3B9cHhcIlxuICAgICAgICAgICwgMjUwLCAoKSA9PlxuICAgICAgICAgICAgbS5wb3NpdGlvbkluZm9ib3goKVxuICAgICAgICAgICAgbS51bmhpZGVJbmZvYm94KClcblxuICBwb3NpdGlvbkluZm9ib3hlczogPT5cbiAgICBmb3IgbWFya2VyIGluIEBjb250YWluZXIuZmluZCgnLnBsYW5pdC1tYXJrZXInKVxuICAgICAgbSA9IG5ldyBQbGFuaXQuTWFya2VyKEBjb250YWluZXIsICQobWFya2VyKS5hdHRyKCdkYXRhLW1hcmtlcicpKVxuICAgICAgbS5wb3NpdGlvbkluZm9ib3goKVxuICAgIHRydWVcblxuICBhbmltYXRlSW5mb2JveGVzOiA9PlxuICAgIGZvciBtYXJrZXIgaW4gQGNvbnRhaW5lci5maW5kKCcucGxhbml0LW1hcmtlcicpXG4gICAgICBtID0gbmV3IFBsYW5pdC5NYXJrZXIoQGNvbnRhaW5lciwgJChtYXJrZXIpLmF0dHIoJ2RhdGEtbWFya2VyJykpXG4gICAgICBtLmFuaW1hdGVJbmZvYm94KClcbiAgICB0cnVlXG5cbiAgY2VudGVyT246IChjb29yZHMpID0+XG4gICAgaWYgY29vcmRzWzBdID49IDUwIHRoZW4geCA9IDEwMCAtIGNvb3Jkc1swXSBlbHNlIHggPSBjb29yZHNbMF1cbiAgICBpZiBjb29yZHNbMV0gPj0gNTAgdGhlbiB5ID0gMTAwIC0gY29vcmRzWzFdIGVsc2UgeSA9IGNvb3Jkc1sxXVxuICAgIHdNaW4gPSA1MCAqIChAY29udGFpbmVyV2lkdGgoKSAvIHgpXG4gICAgaE1pbiA9IDUwICogKEBjb250YWluZXJIZWlnaHQoKSAvIHkpXG4gICAgIyBoaWRlcyBvdGhlciBhY3RpdmUgaW5mb2JveGVzLCBidXQgd2lsbCBzdGlsbCBzaG93XG4gICAgIyB0aGlzIGluZm9ib3hcbiAgICBAY29udGFpbmVyLmZpbmQoJy5wbGFuaXQtaW5mb2JveCcpLnJlbW92ZUNsYXNzKCdhY3RpdmUnKVxuICAgICMga2VlcCB0aGVvcmV0aWNhbGx5IG1ha2luZyB0aGUgaW1hZ2UgYmlnZ2VyIHVudGlsIGl0IGlzXG4gICAgIyBsYXJnZSBlbm91Z2ggdG8gY2VudGVyIG9uIG91ciBwb2ludFxuICAgIEBpbWFnZVBvc2l0aW9uLnNjYWxlICA9IEBpbWFnZVBvc2l0aW9uLnNjYWxlICsgQGltYWdlUG9zaXRpb24uaW5jcmVtZW50XG4gICAgQGltYWdlUG9zaXRpb24ubGVmdFB4ID0gLSAoXG4gICAgICAoQGltZ1dpZHRoKCkgKiAoY29vcmRzWzBdIC8gMTAwKSkgLSAoQGNvbnRhaW5lcldpZHRoKCkgLyAyKVxuICAgIClcbiAgICBAaW1hZ2VQb3NpdGlvbi50b3BQeCA9IC0gKFxuICAgICAgKEBpbWdIZWlnaHQoKSAqIChjb29yZHNbMV0gLyAxMDApKSAtIChAY29udGFpbmVySGVpZ2h0KCkgLyAyKVxuICAgIClcbiAgICB3aGlsZSAoQGltZ1dpZHRoKCkgPCB3TWluKSB8fCAoQGltZ0hlaWdodCgpIDwgaE1pbilcbiAgICAgIEBpbWFnZVBvc2l0aW9uLnNjYWxlICA9IEBpbWFnZVBvc2l0aW9uLnNjYWxlICsgQGltYWdlUG9zaXRpb24uaW5jcmVtZW50XG4gICAgICBAaW1hZ2VQb3NpdGlvbi5sZWZ0UHggPSAtIChcbiAgICAgICAgKEBpbWdXaWR0aCgpICogKGNvb3Jkc1swXSAvIDEwMCkpIC0gKEBjb250YWluZXJXaWR0aCgpIC8gMilcbiAgICAgIClcbiAgICAgIEBpbWFnZVBvc2l0aW9uLnRvcFB4ID0gLSAoXG4gICAgICAgIChAaW1nSGVpZ2h0KCkgKiAoY29vcmRzWzFdIC8gMTAwKSkgLSAoQGNvbnRhaW5lckhlaWdodCgpIC8gMilcbiAgICAgIClcbiAgICBAYW5pbWF0ZUJhY2tncm91bmQoKVxuXG4gIHpvb21UbzogKGxldmVsKSA9PlxuICAgIGkgPSBAaW1hZ2VQb3NpdGlvbi5pbmNyZW1lbnRcbiAgICB1bmxlc3MgKChsZXZlbCAqIGkpICsgMSkgPT0gQGltYWdlUG9zaXRpb24uc2NhbGVcbiAgICAgIEBpbWFnZVBvc2l0aW9uLnNjYWxlID0gKGxldmVsICogaSkgKyAxICsgaVxuICAgICAgQHpvb21PdXQoKVxuXG4gICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIENhbGN1bGF0aW9uc1xuXG4gICMgLS0tLS0tLS0tLSBJbWFnZSBXaWR0aFxuXG4gIGltZ1dpZHRoOiA9PlxuICAgIHBhcnNlRmxvYXQoQGltYWdlUG9zaXRpb24ud2lkdGggKiBAaW1hZ2VQb3NpdGlvbi5zY2FsZSlcblxuICB0bXBJbWdXaWR0aDogPT5cbiAgICAoMSArIEBpbWFnZVBvc2l0aW9uLmluY3JlbWVudCkgKiBAaW1hZ2VQb3NpdGlvbi53aWR0aCgpXG5cbiAgaW1nV2lkdGhDbGlja0luY3JlbWVudDogPT5cbiAgICBwYXJzZUZsb2F0KEBpbWFnZVBvc2l0aW9uLndpZHRoICogQGltYWdlUG9zaXRpb24uaW5jcmVtZW50KVxuXG4gIGltZ1dpZHRoU2Nyb2xsSW5jcmVtZW50OiA9PlxuICAgIHBhcnNlRmxvYXQoQGltYWdlUG9zaXRpb24ud2lkdGggKiBAaW1hZ2VQb3NpdGlvbi5zY3JvbGxJbmNyZW1lbnQpXG5cbiAgY29udGFpbmVyV2lkdGg6ID0+XG4gICAgcGFyc2VGbG9hdChAbWFya2Vyc0NvbnRhaW5lci53aWR0aCgpKVxuXG4gICMgLS0tLS0tLS0tLSBMZWZ0IC8gUmlnaHRcblxuICBpbWdPZmZzZXRMZWZ0OiA9PlxuICAgIE1hdGguYWJzKHBhcnNlRmxvYXQoQGltYWdlLmNzcygnbGVmdCcpKSlcblxuICAjIC0tLS0tLS0tLS0gSGVpZ2h0XG5cbiAgaW1nSGVpZ2h0OiA9PlxuICAgIHBhcnNlRmxvYXQoQGltYWdlUG9zaXRpb24uaGVpZ2h0ICogQGltYWdlUG9zaXRpb24uc2NhbGUpXG5cbiAgdG1wSW1nSGVpZ2h0OiA9PlxuICAgICgxICsgQGltYWdlUG9zaXRpb24uaW5jcmVtZW50KSAqIEBpbWFnZVBvc2l0aW9uLmhlaWdodCgpXG5cbiAgaW1nSGVpZ2h0Q2xpY2tJbmNyZW1lbnQ6ID0+XG4gICAgcGFyc2VGbG9hdChAaW1hZ2VQb3NpdGlvbi5oZWlnaHQgKiBAaW1hZ2VQb3NpdGlvbi5pbmNyZW1lbnQpXG5cbiAgaW1nSGVpZ2h0U2Nyb2xsSW5jcmVtZW50OiA9PlxuICAgIHBhcnNlRmxvYXQoQGltYWdlUG9zaXRpb24uaGVpZ2h0ICogQGltYWdlUG9zaXRpb24uc2Nyb2xsSW5jcmVtZW50KVxuXG4gIGNvbnRhaW5lckhlaWdodDogPT5cbiAgICBwYXJzZUZsb2F0KEBtYXJrZXJzQ29udGFpbmVyLmhlaWdodCgpKVxuXG4gICMgLS0tLS0tLS0tLSBUb3AgLyBCb3R0b21cblxuICBpbWdPZmZzZXRUb3A6ID0+XG4gICAgTWF0aC5hYnMocGFyc2VGbG9hdChAaW1hZ2UuY3NzKCd0b3AnKSkpXG5cbiAgIyAtLS0tLS0tLS0tIE90aGVyXG5cbiAgZ2V0RXZlbnRDb250YWluZXJQb3NpdGlvbjogKGUpID0+XG4gICAgbGVmdDogKGUucGFnZVggLSBAY29udGFpbmVyLm9mZnNldCgpLmxlZnQpIC8gQGNvbnRhaW5lcldpZHRoKClcbiAgICB0b3A6ICAoZS5wYWdlWSAtIEBjb250YWluZXIub2Zmc2V0KCkudG9wKSAvIEBjb250YWluZXJIZWlnaHQoKVxuXG4gICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIEV2ZW50c1xuXG4gIGRibGNsaWNrOiAoZSkgPT5cbiAgICBpZiAkKGUudGFyZ2V0KS5hdHRyKCdkYXRhLXpvb20taWQnKSA9PSBAem9vbUlkXG4gICAgICBjbGljayA9IEBnZXRFdmVudENvbnRhaW5lclBvc2l0aW9uKGUpXG4gICAgICBAem9vbUluKCdjbGljaycsIGNsaWNrLmxlZnQsIGNsaWNrLnRvcClcblxuICBtb3VzZWRvd246IChlKSA9PlxuICAgIGlmICQoZS50YXJnZXQpLmF0dHIoJ2RhdGEtem9vbS1pZCcpID09IEB6b29tSWQgJiYgZS53aGljaCA9PSAxXG4gICAgICBAaXNEcmFnZ2luZyA9IHRydWVcbiAgICAgIGNvb3JkcyA9IEBnZXRFdmVudENvbnRhaW5lclBvc2l0aW9uKGUpXG4gICAgICBAZHJhZ0Nvb3JkcyA9XG4gICAgICAgIHBvaW50UmVmOiBjb29yZHNcbiAgICAgICAgaW1nUmVmOlxuICAgICAgICAgIGxlZnQ6IDAgLSBAaW1nT2Zmc2V0TGVmdCgpXG4gICAgICAgICAgdG9wOiAwIC0gQGltZ09mZnNldFRvcCgpXG4gICAgICAgIG1heDpcbiAgICAgICAgICByaWdodDogKGNvb3Jkcy5sZWZ0ICogQGNvbnRhaW5lcldpZHRoKCkpICsgQGltZ09mZnNldExlZnQoKVxuICAgICAgICAgIGxlZnQ6IChjb29yZHMubGVmdCAqIEBjb250YWluZXJXaWR0aCgpKSAtIChAaW1nV2lkdGgoKSAtXG4gICAgICAgICAgICAgICAgICAgICAgKEBjb250YWluZXJXaWR0aCgpICsgQGltZ09mZnNldExlZnQoKSkpXG4gICAgICAgICAgYm90dG9tOiAoY29vcmRzLnRvcCAqIEBjb250YWluZXJIZWlnaHQoKSkgKyBAaW1nT2Zmc2V0VG9wKClcbiAgICAgICAgICB0b3A6IChjb29yZHMudG9wICogQGNvbnRhaW5lckhlaWdodCgpKSAtIChAaW1nSGVpZ2h0KCkgLVxuICAgICAgICAgICAgICAgICAgICAgIChAY29udGFpbmVySGVpZ2h0KCkgKyBAaW1nT2Zmc2V0VG9wKCkpKVxuICAgIHRydWVcblxuICBtb3VzZW1vdmU6IChlKSA9PlxuICAgIGlmIEBpc0RyYWdnaW5nXG4gICAgICBjb29yZHMgPSBAZ2V0RXZlbnRDb250YWluZXJQb3NpdGlvbihlKVxuICAgICAgZHJhZ0xlZnQgPSBjb29yZHMubGVmdCAqIEBjb250YWluZXJXaWR0aCgpXG4gICAgICBkcmFnVG9wID0gY29vcmRzLnRvcCAqIEBjb250YWluZXJIZWlnaHQoKVxuICAgICAgaWYgZHJhZ0xlZnQgPj0gQGRyYWdDb29yZHMubWF4LmxlZnQgJiYgZHJhZ0xlZnQgPD0gQGRyYWdDb29yZHMubWF4LnJpZ2h0XG4gICAgICAgIGxlZnQgPSAoY29vcmRzLmxlZnQgLSBAZHJhZ0Nvb3Jkcy5wb2ludFJlZi5sZWZ0KSAqIEBjb250YWluZXJXaWR0aCgpXG4gICAgICAgIEBpbWFnZVBvc2l0aW9uLmxlZnRQeCA9IEBkcmFnQ29vcmRzLmltZ1JlZi5sZWZ0ICsgbGVmdFxuICAgICAgZWxzZSBpZiBkcmFnTGVmdCA8IEBkcmFnQ29vcmRzLm1heC5sZWZ0XG4gICAgICAgIEBpbWFnZVBvc2l0aW9uLmxlZnRQeCA9IEBjb250YWluZXJXaWR0aCgpIC0gQGltZ1dpZHRoKClcbiAgICAgIGVsc2UgaWYgZHJhZ0xlZnQgPiBAZHJhZ0Nvb3Jkcy5tYXgucmlnaHRcbiAgICAgICAgQGltYWdlUG9zaXRpb24ubGVmdFB4ID0gMFxuICAgICAgaWYgZHJhZ1RvcCA+PSBAZHJhZ0Nvb3Jkcy5tYXgudG9wICYmIGRyYWdUb3AgPD0gQGRyYWdDb29yZHMubWF4LmJvdHRvbVxuICAgICAgICB0b3AgPSAoY29vcmRzLnRvcCAtIEBkcmFnQ29vcmRzLnBvaW50UmVmLnRvcCkgKiBAY29udGFpbmVySGVpZ2h0KClcbiAgICAgICAgQGltYWdlUG9zaXRpb24udG9wUHggPSBAZHJhZ0Nvb3Jkcy5pbWdSZWYudG9wICsgdG9wXG4gICAgICBlbHNlIGlmIGRyYWdUb3AgPCBAZHJhZ0Nvb3Jkcy5tYXgudG9wXG4gICAgICAgIEBpbWFnZVBvc2l0aW9uLnRvcFB4ID0gQGNvbnRhaW5lckhlaWdodCgpIC0gQGltZ0hlaWdodCgpXG4gICAgICBlbHNlIGlmIGRyYWdUb3AgPiBAZHJhZ0Nvb3Jkcy5tYXguYm90dG9tXG4gICAgICAgIEBpbWFnZVBvc2l0aW9uLnRvcFB4ID0gMFxuICAgICAgQHNldEJhY2tncm91bmQoKVxuICAgIHRydWVcblxuICBtb3VzZXVwOiAoZSkgPT5cbiAgICBAaXNEcmFnZ2luZyA9IGZhbHNlXG4gICAgQHBvc2l0aW9uSW5mb2JveGVzKClcbiAgICB0cnVlXG5cbiAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gWm9vbWluZ1xuXG4gIHpvb21JbjogPT5cbiAgICBAaW1hZ2VQb3NpdGlvbi5zY2FsZSAgPSBAaW1hZ2VQb3NpdGlvbi5zY2FsZSArIEBpbWFnZVBvc2l0aW9uLmluY3JlbWVudFxuICAgIEBpbWFnZVBvc2l0aW9uLmxlZnRQeCA9IC0gQGltZ09mZnNldExlZnQoKSAtIChAaW1nV2lkdGhDbGlja0luY3JlbWVudCgpIC8gMilcbiAgICBAaW1hZ2VQb3NpdGlvbi50b3BQeCAgPSAtIEBpbWdPZmZzZXRUb3AoKSAtIChAaW1nSGVpZ2h0Q2xpY2tJbmNyZW1lbnQoKSAvIDIpXG4gICAgQGFuaW1hdGVCYWNrZ3JvdW5kKClcblxuICB6b29tT3V0OiAoKSA9PlxuICAgIGlmIEBpbWFnZVBvc2l0aW9uLnNjYWxlID4gMVxuICAgICAgQGltYWdlUG9zaXRpb24uc2NhbGUgID0gQGltYWdlUG9zaXRpb24uc2NhbGUgLSBAaW1hZ2VQb3NpdGlvbi5pbmNyZW1lbnRcbiAgICAgIGxlZnRQeCA9IC0gQGltZ09mZnNldExlZnQoKSArIChAaW1nV2lkdGhDbGlja0luY3JlbWVudCgpIC8gMilcbiAgICAgIHRvcFB4ICA9IC0gQGltZ09mZnNldFRvcCgpICsgKEBpbWdIZWlnaHRDbGlja0luY3JlbWVudCgpIC8gMilcbiAgICAgIGlmIGxlZnRQeCA+IDBcbiAgICAgICAgQGltYWdlUG9zaXRpb24ubGVmdFB4ID0gMFxuICAgICAgZWxzZSBpZiBsZWZ0UHggPCBAY29udGFpbmVyV2lkdGgoKSAtIEBpbWdXaWR0aCgpXG4gICAgICAgIEBpbWFnZVBvc2l0aW9uLmxlZnRQeCA9IEBjb250YWluZXJXaWR0aCgpIC0gQGltZ1dpZHRoKClcbiAgICAgIGVsc2VcbiAgICAgICAgQGltYWdlUG9zaXRpb24ubGVmdFB4ID0gbGVmdFB4XG4gICAgICBpZiB0b3BQeCA+IDBcbiAgICAgICAgQGltYWdlUG9zaXRpb24udG9wUHggPSAwXG4gICAgICBlbHNlIGlmIHRvcFB4IDwgQGNvbnRhaW5lckhlaWdodCgpIC0gQGltZ0hlaWdodCgpXG4gICAgICAgIEBpbWFnZVBvc2l0aW9uLnRvcFB4ID0gQGNvbnRhaW5lckhlaWdodCgpIC0gQGltZ0hlaWdodCgpXG4gICAgICBlbHNlXG4gICAgICAgIEBpbWFnZVBvc2l0aW9uLnRvcFB4ID0gdG9wUHhcbiAgICAgIEBhbmltYXRlQmFja2dyb3VuZCgpXG5cbmNsYXNzIFBsYW5pdC5NYXJrZXJcblxuICBjb25zdHJ1Y3RvcjogKEBjb250YWluZXIsIGlkKSAtPlxuXG4gICAgIyBTZXQgT3B0aW9uc1xuICAgIEBtYXJrZXJzQ29udGFpbmVyID0gQGNvbnRhaW5lci5maW5kKFwiLiN7UGxhbml0Lm1hcmtlckNvbnRhaW5lckNsYXNzfVwiKVxuICAgIGlmIEBjb250YWluZXIuZmluZCgnLmltYWdlLWNvbnRhaW5lciA+IGltZycpLmxlbmd0aCA+IDBcbiAgICAgIEBpbWFnZSA9IEBjb250YWluZXIuZmluZCgnLmltYWdlLWNvbnRhaW5lciA+IGltZycpLmZpcnN0KClcblxuICAgICMgRmluZCBNYXJrZXJcbiAgICBAbWFya2VyID0gQG1hcmtlcnNDb250YWluZXIuZmluZChcbiAgICAgIFwiLiN7UGxhbml0Lm1hcmtlckNsYXNzfVtkYXRhLW1hcmtlcj0nI3tpZH0nXVwiXG4gICAgKS5maXJzdCgpXG5cbiAgICAjIFJldHVybiB0aGlzXG4gICAgQFxuXG4gICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIENhbGN1bGF0aW9uc1xuXG4gIHBvc2l0aW9uOiA9PlxuICAgIHhQeCA9IEBtYXJrZXIucG9zaXRpb24oKS5sZWZ0ICsgKEBtYXJrZXIub3V0ZXJXaWR0aCgpIC8gMilcbiAgICB5UHggPSBAbWFya2VyLnBvc2l0aW9uKCkudG9wICsgKEBtYXJrZXIub3V0ZXJIZWlnaHQoKSAvIDIpXG4gICAgaWYgQGltYWdlXG4gICAgICB3SW1nID0gQGltYWdlLndpZHRoKClcbiAgICAgIGhJbWcgPSBAaW1hZ2UuaGVpZ2h0KClcbiAgICAgIHhJbWcgPSBwYXJzZUludChAaW1hZ2UuY3NzKCdsZWZ0JykpXG4gICAgICB5SW1nID0gcGFyc2VJbnQoQGltYWdlLmNzcygndG9wJykpXG4gICAgICB4UGMgPSAoKHhQeCArIE1hdGguYWJzKHhJbWcpKSAvIHdJbWcpICogMTAwXG4gICAgICB5UGMgPSAoKHlQeCArIE1hdGguYWJzKHlJbWcpKSAvIGhJbWcpICogMTAwXG4gICAgZWxzZVxuICAgICAgeFBjID0gKHhQeCAvIEBjb250YWluZXIud2lkdGgoKSkgKiAxMDBcbiAgICAgIHlQYyA9ICh5UHggLyBAY29udGFpbmVyLmhlaWdodCgpKSAqIDEwMFxuICAgIFt4UGMsIHlQY11cblxuICByZWxhdGl2ZVBvc2l0aW9uOiA9PlxuICAgIHhQeCA9IEBtYXJrZXIucG9zaXRpb24oKS5sZWZ0ICsgKEBtYXJrZXIub3V0ZXJXaWR0aCgpIC8gMilcbiAgICB5UHggPSBAbWFya2VyLnBvc2l0aW9uKCkudG9wICsgKEBtYXJrZXIub3V0ZXJIZWlnaHQoKSAvIDIpXG4gICAgeFBjID0gKHhQeCAvIEBjb250YWluZXIud2lkdGgoKSkgKiAxMDBcbiAgICB5UGMgPSAoeVB4IC8gQGNvbnRhaW5lci5oZWlnaHQoKSkgKiAxMDBcbiAgICBbeFBjLCB5UGNdXG5cbiAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gQXR0cmlidXRlc1xuXG4gIGNvbG9yOiA9PlxuICAgIEBtYXJrZXIuY3NzKCdiYWNrZ3JvdW5kQ29sb3InKVxuXG4gIHBsYW5pdElEOiA9PlxuICAgIEBtYXJrZXIuYXR0cignZGF0YS1tYXJrZXInKVxuXG4gIGlkOiA9PlxuICAgIEBtYXJrZXIuYXR0cignZGF0YS1pZCcpXG5cbiAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gSW5mb2JveFxuXG4gIGluZm9ib3g6ID0+XG4gICAgaW5mb2JveCA9IEBjb250YWluZXIuZmluZChcIiMje0BtYXJrZXIuYXR0cignZGF0YS1pbmZvYm94Jyl9XCIpXG4gICAgaWYgaW5mb2JveC5sZW5ndGggPiAwIHRoZW4gaW5mb2JveCBlbHNlIG51bGxcblxuICBpbmZvYm94SFRNTDogPT5cbiAgICBpZiBAaW5mb2JveCgpICYmIEBpbmZvYm94KCkubGVuZ3RoID4gMCB0aGVuIEBpbmZvYm94KCkuaHRtbCgpIGVsc2UgbnVsbFxuXG4gIGluZm9ib3hWaXNpYmxlOiA9PlxuICAgIEBpbmZvYm94KCkgJiYgQGluZm9ib3goKS5oYXNDbGFzcygnYWN0aXZlJylcblxuICBoaWRlSW5mb2JveDogPT5cbiAgICBAaW5mb2JveCgpLmFkZENsYXNzKCdoaWRkZW4nKSBpZiBAaW5mb2JveFZpc2libGUoKVxuXG4gIHNob3dJbmZvYm94OiA9PlxuICAgIEBpbmZvYm94KCkuYWRkQ2xhc3MoJ2FjdGl2ZScpIGlmIEBpbmZvYm94KCkgJiYgIUBpbmZvYm94VmlzaWJsZSgpXG4gICAgQHVuaGlkZUluZm9ib3goKVxuXG4gIHVuaGlkZUluZm9ib3g6ID0+XG4gICAgQGluZm9ib3goKS5yZW1vdmVDbGFzcygnaGlkZGVuJykgaWYgQGluZm9ib3hWaXNpYmxlKClcblxuICBpbmZvYm94Q29vcmRzOiA9PlxuICAgIGluZm9ib3ggPSAkKFwiIyN7QG1hcmtlci5hdHRyKCdkYXRhLWluZm9ib3gnKX1cIilcbiAgICBtYXJrZXJDZW50ZXJYID0gKHBhcnNlRmxvYXQoQHJlbGF0aXZlUG9zaXRpb24oKVswXSAvIDEwMCkgKiBAY29udGFpbmVyLndpZHRoKCkpXG4gICAgbWFya2VyQ2VudGVyWSA9IChwYXJzZUZsb2F0KEByZWxhdGl2ZVBvc2l0aW9uKClbMV0gLyAxMDApICogQGNvbnRhaW5lci5oZWlnaHQoKSlcbiAgICBpV2lkdGggPSBpbmZvYm94Lm91dGVyV2lkdGgoKVxuICAgIGlIYWxmV2lkdGggPSBpV2lkdGggLyAyXG4gICAgaUhlaWdodCA9IGluZm9ib3gub3V0ZXJIZWlnaHQoKVxuICAgIGlIYWxmSGVpZ2h0ID0gaUhlaWdodCAvIDJcbiAgICBjV2lkdGggPSBAY29udGFpbmVyLndpZHRoKClcbiAgICBjSGVpZ2h0ID0gQGNvbnRhaW5lci5oZWlnaHQoKVxuICAgIG1XaWR0aCA9IEBtYXJrZXIub3V0ZXJXaWR0aCgpXG4gICAgbUhhbGZXaWR0aCA9IG1XaWR0aCAvIDJcbiAgICBtSGVpZ2h0ID0gQG1hcmtlci5vdXRlckhlaWdodCgpXG4gICAgbUhhbGZIZWlnaHQgPSBtSGVpZ2h0IC8gMlxuICAgIGJ1ZmZlciA9IDVcbiAgICBvZmZzZXRYID0gcGFyc2VJbnQoaW5mb2JveC5hdHRyKCdkYXRhLW9mZnNldC14JykpXG4gICAgb2Zmc2V0WCA9IDAgdW5sZXNzIG9mZnNldFhcbiAgICBvZmZzZXRZID0gcGFyc2VJbnQoaW5mb2JveC5hdHRyKCdkYXRhLW9mZnNldC15JykpXG4gICAgb2Zmc2V0WSA9IDAgdW5sZXNzIG9mZnNldFlcbiAgICBzd2l0Y2ggaW5mb2JveC5hdHRyKCdkYXRhLXBvc2l0aW9uJylcbiAgICAgIHdoZW4gJ3RvcCdcbiAgICAgICAgaW5mb0xlZnQgPSBtYXJrZXJDZW50ZXJYIC0gaUhhbGZXaWR0aFxuICAgICAgICBpbmZvVG9wID0gbWFya2VyQ2VudGVyWSAtIGlIZWlnaHQgLSBtSGFsZkhlaWdodCAtIGJ1ZmZlclxuICAgICAgd2hlbiAncmlnaHQnXG4gICAgICAgIGluZm9MZWZ0ID0gbWFya2VyQ2VudGVyWCArIG1IYWxmV2lkdGggKyBidWZmZXJcbiAgICAgICAgaW5mb1RvcCA9IG1hcmtlckNlbnRlclkgLSBpSGFsZkhlaWdodFxuICAgICAgd2hlbiAnYm90dG9tJ1xuICAgICAgICBpbmZvTGVmdCA9IG1hcmtlckNlbnRlclggLSBpSGFsZldpZHRoXG4gICAgICAgIGluZm9Ub3AgPSBtYXJrZXJDZW50ZXJZICsgbUhhbGZIZWlnaHQgKyBidWZmZXJcbiAgICAgIHdoZW4gJ2xlZnQnXG4gICAgICAgIGluZm9MZWZ0ID0gbWFya2VyQ2VudGVyWCAtIGlXaWR0aCAtIG1IYWxmV2lkdGggLSBidWZmZXJcbiAgICAgICAgaW5mb1RvcCA9IG1hcmtlckNlbnRlclkgLSBpSGFsZkhlaWdodFxuICAgICAgd2hlbiAndG9wLWxlZnQnXG4gICAgICAgIGluZm9MZWZ0ID0gbWFya2VyQ2VudGVyWCAtIGlXaWR0aCAtIG1IYWxmV2lkdGggKyBidWZmZXJcbiAgICAgICAgaW5mb1RvcCA9IG1hcmtlckNlbnRlclkgLSBpSGVpZ2h0IC0gbUhhbGZIZWlnaHQgKyBidWZmZXJcbiAgICAgIHdoZW4gJ3RvcC1yaWdodCdcbiAgICAgICAgaW5mb0xlZnQgPSBtYXJrZXJDZW50ZXJYICsgbUhhbGZXaWR0aCAtIGJ1ZmZlclxuICAgICAgICBpbmZvVG9wID0gbWFya2VyQ2VudGVyWSAtIGlIZWlnaHQgLSBtSGFsZkhlaWdodCArIGJ1ZmZlclxuICAgICAgd2hlbiAnYm90dG9tLWxlZnQnXG4gICAgICAgIGluZm9MZWZ0ID0gbWFya2VyQ2VudGVyWCAtIGlXaWR0aCAtIG1IYWxmV2lkdGggKyBidWZmZXJcbiAgICAgICAgaW5mb1RvcCA9IG1hcmtlckNlbnRlclkgKyBtSGFsZkhlaWdodCAtIGJ1ZmZlclxuICAgICAgd2hlbiAnYm90dG9tLXJpZ2h0J1xuICAgICAgICBpbmZvTGVmdCA9IG1hcmtlckNlbnRlclggKyBtSGFsZldpZHRoIC0gYnVmZmVyXG4gICAgICAgIGluZm9Ub3AgPSBtYXJrZXJDZW50ZXJZICsgbUhhbGZIZWlnaHQgLSBidWZmZXJcbiAgICBsZWZ0OiBpbmZvTGVmdCArIG9mZnNldFhcbiAgICB0b3A6IGluZm9Ub3AgKyBvZmZzZXRZXG5cbiAgcG9zaXRpb25JbmZvYm94OiA9PlxuICAgIGNvb3JkcyA9IEBpbmZvYm94Q29vcmRzKClcbiAgICAkKFwiIyN7QG1hcmtlci5hdHRyKCdkYXRhLWluZm9ib3gnKX1cIikuY3NzXG4gICAgICBsZWZ0OiBcIiN7Y29vcmRzLmxlZnR9cHhcIlxuICAgICAgdG9wOiBcIiN7Y29vcmRzLnRvcH1weFwiXG4gICAgQHBvc2l0aW9uKClcblxuICBhbmltYXRlSW5mb2JveDogPT5cbiAgICBjb29yZHMgPSBAaW5mb2JveENvb3JkcygpXG4gICAgJChcIiMje0BtYXJrZXIuYXR0cignZGF0YS1pbmZvYm94Jyl9XCIpLmFuaW1hdGVcbiAgICAgIGxlZnQ6IFwiI3tjb29yZHMubGVmdH1weFwiXG4gICAgICB0b3A6IFwiI3tjb29yZHMudG9wfXB4XCJcbiAgICAsIDI1MCwgKCkgPT5cbiAgICAgIHJldHVybiBAcG9zaXRpb24oKVxuXG4gICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIERyYWdnaW5nXG5cbiAgaXNEcmFnZ2FibGU6ID0+XG4gICAgQG1hcmtlci5oYXNDbGFzcygnZHJhZ2dhYmxlJylcblxuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBBY3Rpb25zXG5cbiAgc2V0OiA9PlxuICAgIGxlZnQgPSAoQGltYWdlLndpZHRoKCkgKiAoQG1hcmtlci5hdHRyKCdkYXRhLXhQYycpIC8gMTAwKSkgK1xuICAgICAgcGFyc2VGbG9hdChAaW1hZ2UuY3NzKCdsZWZ0JykpIC0gKEBtYXJrZXIub3V0ZXJXaWR0aCgpIC8gMilcbiAgICB0b3AgPSAoQGltYWdlLmhlaWdodCgpICogKEBtYXJrZXIuYXR0cignZGF0YS15UGMnKSAvIDEwMCkpICtcbiAgICAgIHBhcnNlRmxvYXQoQGltYWdlLmNzcygndG9wJykpIC0gKEBtYXJrZXIub3V0ZXJIZWlnaHQoKSAvIDIpXG4gICAgQG1hcmtlci5jc3NcbiAgICAgIGxlZnQ6IFwiI3tsZWZ0fXB4XCJcbiAgICAgIHRvcDogXCIje3RvcH1weFwiXG4gICAgQHBvc2l0aW9uSW5mb2JveCgpXG4gICAgW2xlZnQsIHRvcF1cblxuICBzYXZlUG9zaXRpb246ID0+XG4gICAgY29vcmRzID0gQHBvc2l0aW9uKClcbiAgICBAbWFya2VyLmF0dHJcbiAgICAgICdkYXRhLXhQYyc6IGNvb3Jkc1swXVxuICAgICAgJ2RhdGEteVBjJzogY29vcmRzWzFdXG5cbiAgdXBkYXRlOiAob3B0aW9ucykgPT5cbiAgICBpZiBvcHRpb25zLmNvbG9yXG4gICAgICBAbWFya2VyLmNzcyhiYWNrZ3JvdW5kQ29sb3I6IG9wdGlvbnMuY29sb3IpXG4gICAgaWYgb3B0aW9ucy5pbmZvYm94XG4gICAgICBAbWFya2VyLmZpbmQoJy5wbGFuaXQtaW5mb2JveCcpLmh0bWwob3B0aW9ucy5pbmZvYm94KVxuICAgICAgQHBvc2l0aW9uSW5mb2JveCgpXG4gICAgaWYgb3B0aW9ucy5kcmFnZ2FibGVcbiAgICAgIEBtYXJrZXIucmVtb3ZlQ2xhc3MoJ2RyYWdnYWJsZScpXG4gICAgICBAbWFya2VyLmFkZENsYXNzKCdkcmFnZ2FibGUnKSBpZiBvcHRpb25zLmRyYWdnYWJsZSA9PSB0cnVlXG4gICAgaWYgb3B0aW9ucy5jb29yZHNcbiAgICAgIGxlZnQgPSAoKHBhcnNlRmxvYXQob3B0aW9ucy5jb29yZHNbMF0pIC8gMTAwKSAqIEBjb250YWluZXIud2lkdGgoKSkgLSAxNVxuICAgICAgdG9wID0gKChwYXJzZUZsb2F0KG9wdGlvbnMuY29vcmRzWzFdKSAvIDEwMCkgKiBAY29udGFpbmVyLmhlaWdodCgpKSAtIDE1XG4gICAgICBAbWFya2VyLmNzc1xuICAgICAgICBsZWZ0OiBcIiN7bGVmdH1weFwiXG4gICAgICAgIHRvcDogXCIje3RvcH1weFwiXG5cbiAgcmVtb3ZlOiA9PlxuICAgIEBpbmZvYm94KCkucmVtb3ZlKCkgaWYgQGluZm9ib3goKVxuICAgIEBtYXJrZXIucmVtb3ZlKClcblxuY2xhc3MgUGxhbml0Lk1hcmtlci5FdmVudHNcblxuICBjb25zdHJ1Y3RvcjogKEBvcHRpb25zKSAtPlxuXG4gICAgIyBTZXQgT3B0aW9uc1xuICAgIEBjb250YWluZXIgPSBAb3B0aW9ucy5jb250YWluZXJcbiAgICBAbWFya2Vyc0NvbnRhaW5lciA9IEBjb250YWluZXIuZmluZChcIi4je1BsYW5pdC5tYXJrZXJDb250YWluZXJDbGFzc31cIilcblxuICAgICMgRmluZCBNYXJrZXJcbiAgICBAbWFya2VyID0gQG1hcmtlcnNDb250YWluZXIuZmluZChcbiAgICAgIFwiLiN7UGxhbml0Lm1hcmtlckNsYXNzfVtkYXRhLW1hcmtlcj0nI3tAb3B0aW9ucy5wbGFuaXRJRH0nXVwiXG4gICAgKS5maXJzdCgpXG4gICAgQG1hcmtlck9iaiA9IG5ldyBQbGFuaXQuTWFya2VyKEBjb250YWluZXIsIEBvcHRpb25zLnBsYW5pdElEKVxuXG4gICAgIyBEcmFnZ2FibGVcbiAgICBpZiBAb3B0aW9ucy5kcmFnZ2FibGVcbiAgICAgIEBtYXJrZXIuYWRkQ2xhc3MoJ2RyYWdnYWJsZScpXG4gICAgICBAbWFya2VyLm9uICdtb3VzZWRvd24nLCAoZSkgPT5cbiAgICAgICAgaWYgZS53aGljaCA9PSAxXG4gICAgICAgICAgbWFya2VyID0gJChlLnRhcmdldCkuY2xvc2VzdCgnLnBsYW5pdC1tYXJrZXInKVxuICAgICAgICAgIG1hcmtlci5hZGRDbGFzcygnaXMtZHJhZ2dpbmcnKVxuICAgICAgICAgIG1hcmtlci5hdHRyXG4gICAgICAgICAgICAnZGF0YS1kcmFnLXN0YXJ0LXgnOiBlLnBhZ2VYXG4gICAgICAgICAgICAnZGF0YS1kcmFnLXN0YXJ0LXknOiBlLnBhZ2VZXG5cbiAgICAjIEluZm9ib3hcbiAgICBpZiBAb3B0aW9ucy5pbmZvYm94XG4gICAgICBpZCA9IFBsYW5pdC5yYW5kb21TdHJpbmcoMTYpXG4gICAgICAjIHNldCBzdHlsZSBvcHRpb25zIG9uIGluZm9ib3hcbiAgICAgIG9wdGlvbnMgPSBAb3B0aW9ucy5pbmZvYm94XG4gICAgICBpZiBvcHRpb25zLnBvc2l0aW9uIHRoZW4gcG9zaXRpb24gPSBvcHRpb25zLnBvc2l0aW9uIGVsc2UgcG9zaXRpb24gPSAndG9wJ1xuICAgICAgaWYgb3B0aW9ucy5hcnJvdyB0aGVuIGFycm93ID0gdHJ1ZSBlbHNlIGFycm93ID0gZmFsc2VcbiAgICAgIGlmIGFycm93ID09IHRydWUgdGhlbiBhcnJvd0NsYXNzID0gJ2Fycm93JyBlbHNlIGFycm93Q2xhc3MgPSAnJ1xuICAgICAgY2xhc3NlcyA9IFwicGxhbml0LWluZm9ib3ggI3twb3NpdGlvbn0gI3thcnJvd0NsYXNzfVwiXG4gICAgICBAY29udGFpbmVyLmZpbmQoXCIuI3tQbGFuaXQuaW5mb2JveENvbnRhaW5lckNsYXNzfVwiKS5hcHBlbmQgXCJcIlwiXG4gICAgICAgIDxkaXYgY2xhc3M9XCIje2NsYXNzZXN9XCIgaWQ9XCJpbmZvLSN7aWR9XCJcbiAgICAgICAgICBkYXRhLXBvc2l0aW9uPVwiI3twb3NpdGlvbn1cIj5cbiAgICAgICAgICAgICN7b3B0aW9ucy5odG1sfVxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgICBcIlwiXCJcbiAgICAgIGlmIG9wdGlvbnMub2Zmc2V0WFxuICAgICAgICBAY29udGFpbmVyLmZpbmQoJy5wbGFuaXQtaW5mb2JveCcpLmxhc3QoKS5hdHRyXG4gICAgICAgICAgJ2RhdGEtb2Zmc2V0LXgnOiBvcHRpb25zLm9mZnNldFhcbiAgICAgIGlmIG9wdGlvbnMub2Zmc2V0WVxuICAgICAgICBAY29udGFpbmVyLmZpbmQoJy5wbGFuaXQtaW5mb2JveCcpLmxhc3QoKS5hdHRyXG4gICAgICAgICAgJ2RhdGEtb2Zmc2V0LXknOiBvcHRpb25zLm9mZnNldFlcbiAgICAgIEBtYXJrZXIuYXR0cignZGF0YS1pbmZvYm94JywgXCJpbmZvLSN7aWR9XCIpXG4gICAgICBAbWFya2VyT2JqLnBvc2l0aW9uSW5mb2JveCgpXG4gICAgICAjIEBtYXJrZXIuY2xpY2sgKGUpID0+XG4gICAgICAjICAgaWYoXG4gICAgICAjICAgICAhQG1hcmtlci5hdHRyKCdkYXRhLWRyYWctc3RhcnQteCcpIHx8XG4gICAgICAjICAgICAhQG1hcmtlci5hdHRyKCdkYXRhLWRyYWctc3RhcnQteScpIHx8XG4gICAgICAjICAgICAoXG4gICAgICAjICAgICAgIE1hdGguYWJzKGUucGFnZVggLSBAbWFya2VyLmF0dHIoJ2RhdGEtZHJhZy1zdGFydC14JykpIDwgMSAmJlxuICAgICAgIyAgICAgICBNYXRoLmFicyhlLnBhZ2VZIC0gQG1hcmtlci5hdHRyKCdkYXRhLWRyYWctc3RhcnQteScpKSA8IDFcbiAgICAgICMgICAgIClcbiAgICAgICMgICApXG4gICAgICAjICAgICBtYXJrZXIgPSAkKGUudGFyZ2V0KS5jbG9zZXN0KCcucGxhbml0LW1hcmtlcicpXG4gICAgICAjICAgICAkKFwiIyN7bWFya2VyLmF0dHIoJ2RhdGEtaW5mb2JveCcpfVwiKS50b2dnbGVDbGFzcygnYWN0aXZlJylcblxuICBtYXJrZXJzOiAtPlxuICAgIEBtYXJrZXJzQ29udGFpbmVyLmZpbmQoJy5wbGFuaXQtbWFya2VyJylcblxuICBkcmFnZ2luZ01hcmtlcjogLT5cbiAgICBAbWFya2Vyc0NvbnRhaW5lci5maW5kKCcucGxhbml0LW1hcmtlci5pcy1kcmFnZ2luZycpXG5cbmNsYXNzIFBsYW5pdC5NYXJrZXIuQ3JlYXRvclxuXG4gIGNvbnN0cnVjdG9yOiAoQG9wdGlvbnMpIC0+XG4gICAgIyBTZXQgT3B0aW9uc1xuICAgIEBjb250YWluZXIgPSBAb3B0aW9ucy5jb250YWluZXJcbiAgICBAbWFya2Vyc0NvbnRhaW5lciA9IEBjb250YWluZXIuZmluZChcIi4je1BsYW5pdC5tYXJrZXJDb250YWluZXJDbGFzc31cIikuZmlyc3QoKVxuICAgIHVubGVzcyBAb3B0aW9ucy5wbGFuaXRJRFxuICAgICAgQG9wdGlvbnMucGxhbml0SUQgPSBQbGFuaXQucmFuZG9tU3RyaW5nKDIwKVxuXG4gICAgIyBBZGQgTWFya2VyXG4gICAgaWYgQG9wdGlvbnMuY29sb3IgdGhlbiBjb2xvciA9IEBvcHRpb25zLmNvbG9yIGVsc2UgY29sb3IgPSAnI0ZDNUIzRidcblxuICAgIGxlZnQgPSAoKHBhcnNlRmxvYXQoQG9wdGlvbnMuY29vcmRzWzBdKSAvIDEwMCkgKiBAY29udGFpbmVyLndpZHRoKCkpIC0gMTVcbiAgICB0b3AgPSAoKHBhcnNlRmxvYXQoQG9wdGlvbnMuY29vcmRzWzFdKSAvIDEwMCkgKiBAY29udGFpbmVyLmhlaWdodCgpKSAtIDE1XG4gICAgQG1hcmtlcnNDb250YWluZXIuYXBwZW5kKFxuICAgICAgJCgnPGRpdj48L2Rpdj4nKVxuICAgICAgICAuYWRkQ2xhc3MoJ3BsYW5pdC1tYXJrZXInKVxuICAgICAgICAuYXR0clxuICAgICAgICAgICdkYXRhLW1hcmtlcic6IEBvcHRpb25zLnBsYW5pdElEXG4gICAgICAgICAgJ2RhdGEteFBjJzogQG9wdGlvbnMuY29vcmRzWzBdXG4gICAgICAgICAgJ2RhdGEteVBjJzogQG9wdGlvbnMuY29vcmRzWzFdXG4gICAgICAgIC5jc3NcbiAgICAgICAgICBsZWZ0OiBcIiN7bGVmdH1weFwiXG4gICAgICAgICAgdG9wOiBcIiN7dG9wfXB4XCJcbiAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6IGNvbG9yXG4gICAgKVxuICAgIG1hcmtlciA9IEBtYXJrZXJzQ29udGFpbmVyLmZpbmQoJy5wbGFuaXQtbWFya2VyJykubGFzdCgpXG4gICAgaWYgQG9wdGlvbnMuaWRcbiAgICAgIG1hcmtlci5hdHRyKCdkYXRhLWlkJzogQG9wdGlvbnMuaWQpXG4gICAgaWYgQG9wdGlvbnMuY2xhc3NcbiAgICAgIG1hcmtlci5hZGRDbGFzcyhAb3B0aW9ucy5jbGFzcylcbiAgICBpZiBAb3B0aW9ucy5odG1sXG4gICAgICBtYXJrZXIuaHRtbChAb3B0aW9ucy5odG1sKVxuICAgIGlmIEBvcHRpb25zLnNpemVcbiAgICAgIG1hcmtlci5jc3NcbiAgICAgICAgd2lkdGg6IFwiI3tAb3B0aW9ucy5zaXplfXB4XCJcbiAgICAgICAgaGVpZ2h0OiBcIiN7QG9wdGlvbnMuc2l6ZX1weFwiXG5cbiAgICAjIEJpbmQgRXZlbnRzIChpbiBhIHNlcGFyYXRlIGNsYXNzKVxuICAgIG5ldyBQbGFuaXQuTWFya2VyLkV2ZW50cyhAb3B0aW9ucylcblxuICAgICMgUmV0dXJuIGEgbmV3IGluc3RhbmNlIG9mIHRoaXMgbWFya2VyXG4gICAgbmV3IFBsYW5pdC5NYXJrZXIoQGNvbnRhaW5lciwgQG9wdGlvbnMucGxhbml0SUQpXG4iXX0=