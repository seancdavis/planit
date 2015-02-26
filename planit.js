var Planit,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

Planit = (function() {
  function Planit() {
    this.dragEnd = __bind(this.dragEnd, this);
    this.getAllMarkers = __bind(this.getAllMarkers, this);
    this.getMarker = __bind(this.getMarker, this);
    this.addMarker = __bind(this.addMarker, this);
  }

  Planit.containerClass = 'planit-container';

  Planit.markerContainerClass = 'planit-markers-container';

  Planit.markerClass = 'planit-marker';

  Planit.markerContentClass = 'planit-marker-content';

  Planit.prototype["new"] = function(_at_options) {
    this.options = _at_options != null ? _at_options : {};
    if (this.options.container) {
      this.options.container = $("#" + this.options.container);
    } else {
      this.options.container = $('#planit');
    }
    this.options.container.addClass('planit-container');
    this.options.container.append("<div class=\"" + Planit.markerContainerClass + "\"></div>");
    this.container = this.options.container;
    this.markersContainer = this.container.find("." + Planit.markerContainerClass).first();
    if (this.options.image && this.options.image.url) {
      this.container.append("<img src=\"" + this.options.image.url + "\">");
      this.markersContainer.css({
        backgroundImage: "url('" + this.options.image.url + "')"
      });
      $(window).load((function(_this) {
        return function() {
          _this.container.css({
            height: _this.container.find('img').first().height()
          });
          _this.container.find('img').first().remove();
          if (_this.options.image.zoom) {
            return new Planit.Plan.Zoomable({
              container: _this.container
            });
          }
        };
      })(this));
    }
    if (this.options.markers) {
      $(window).load((function(_this) {
        return function() {
          var marker, _i, _len, _ref, _results;
          _ref = _this.options.markers;
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            marker = _ref[_i];
            _results.push(_this.addMarker(marker));
          }
          return _results;
        };
      })(this));
    }
    new Planit.Plan.Events({
      container: this.container,
      planit: this
    });
    return this;
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

  Planit.prototype.dragEnd = function(event, marker) {
    if (this.options.dragEnd) {
      return this.options.dragEnd(event, marker);
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
    this.lastMarker = __bind(this.lastMarker, this);
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

  Events.prototype.lastMarker = function() {
    return this.markers().last();
  };

  Events.prototype.mouseup = function(e) {
    var m, marker;
    if ($(e.target).hasClass('planit-marker-content')) {
      marker = $(e.target).closest('.planit-marker');
      $("#" + (marker.attr('data-infobox'))).addClass('active');
    }
    marker = this.markersContainer.find('.is-dragging').first();
    if (this.draggingMarker().length > 0) {
      m = new Planit.Marker(this.container, marker.attr('data-marker'));
      this.options.planit.dragEnd(e, m);
      return this.draggingMarker().removeClass('is-dragging');
    }
  };

  Events.prototype.mousemove = function(e) {
    var marker, markerBottom, markerHeight, markerLeft, markerRight, markerTop, markerWidth, markerX, markerY, markers, mouseLeft, mouseTop, planBottom, planRight;
    markers = this.markersContainer.find('.planit-marker.is-dragging');
    if (markers.length > 0) {
      marker = markers.first();
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
    this.zoomIn = __bind(this.zoomIn, this);
    this.scroll = __bind(this.scroll, this);
    this.dblclick = __bind(this.dblclick, this);
    this.getEventContainerPosition = __bind(this.getEventContainerPosition, this);
    this.imgOffsetTop = __bind(this.imgOffsetTop, this);
    this.containerHeight = __bind(this.containerHeight, this);
    this.imgHeightIncrement = __bind(this.imgHeightIncrement, this);
    this.tmpImgHeight = __bind(this.tmpImgHeight, this);
    this.imgHeight = __bind(this.imgHeight, this);
    this.imgOffsetLeft = __bind(this.imgOffsetLeft, this);
    this.containerWidth = __bind(this.containerWidth, this);
    this.imgWidthIncrement = __bind(this.imgWidthIncrement, this);
    this.tmpImgWidth = __bind(this.tmpImgWidth, this);
    this.imgWidth = __bind(this.imgWidth, this);
    this.setBackground = __bind(this.setBackground, this);
    this.container = this.options.container;
    this.markersContainer = this.container.find("." + Planit.markerContainerClass);
    this.zoomId = Planit.randomString();
    this.markersContainer.attr('data-zoom-id', this.zoomId);
    $(this.container).on('dblclick', this.dblclick);
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
    return this.markersContainer.css({
      backgroundPosition: this.imagePosition.leftPx + "px " + this.imagePosition.topPx + "px",
      backgroundSize: (this.imagePosition.scale * 100.0) + "%"
    });
  };

  Zoomable.prototype.imgWidth = function() {
    return parseFloat(this.imagePosition.width * this.imagePosition.scale);
  };

  Zoomable.prototype.tmpImgWidth = function() {
    return (1 + this.imagePosition.increment) * this.imagePosition.width();
  };

  Zoomable.prototype.imgWidthIncrement = function() {
    return parseFloat(this.imagePosition.width * this.imagePosition.increment);
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

  Zoomable.prototype.imgHeightIncrement = function() {
    return parseFloat(this.imagePosition.height * this.imagePosition.increment);
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
      return this.zoomIn(click.left, click.top);
    }
  };

  Zoomable.prototype.scroll = function(e) {
    var direction;
    e.preventDefault();
    if (e.originalEvent.deltaY > 0) {
      direction = 'out';
    } else if (e.originalEvent.deltaY < 0) {
      direction = 'in';
    }
    if (direction) {
      return console.log(direction);
    }
  };

  Zoomable.prototype.zoomIn = function(left, top) {
    if (left == null) {
      left = 0.5;
    }
    if (top == null) {
      top = 0.5;
    }
    this.imagePosition.scale = this.imagePosition.scale + this.imagePosition.increment;
    console.log(top);
    this.imagePosition.leftPx = -this.imgOffsetLeft() - (left * this.imgWidthIncrement());
    this.imagePosition.topPx = -this.imgOffsetTop() - (top * this.imgHeightIncrement());
    return this.setBackground();
  };

  return Zoomable;

})();

Planit.Marker = (function() {
  function Marker(_at_container, id) {
    this.container = _at_container;
    this.remove = __bind(this.remove, this);
    this.update = __bind(this.update, this);
    this.isDraggable = __bind(this.isDraggable, this);
    this.infoboxHTML = __bind(this.infoboxHTML, this);
    this.id = __bind(this.id, this);
    this.color = __bind(this.color, this);
    this.position = __bind(this.position, this);
    this.markersContainer = this.container.find("." + Planit.markerContainerClass);
    this.marker = this.markersContainer.find("." + Planit.markerClass + "[data-marker='" + id + "']").first();
    this;
  }

  Marker.prototype.position = function() {
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

  Marker.prototype.isDraggable = function() {
    return this.marker.hasClass('draggable');
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
    var id, infobox;
    this.options = _at_options;
    this.container = this.options.container;
    this.markersContainer = this.container.find("." + Planit.markerContainerClass);
    this.marker = this.markersContainer.find("." + Planit.markerClass + "[data-marker='" + this.options.id + "']").first();
    if (this.options.draggable) {
      this.lastMarker().addClass('draggable');
      this.lastMarker().on('mousedown', (function(_this) {
        return function(e) {
          var infoboxID, marker;
          if ($(e.target).attr('class') === 'planit-marker-content') {
            marker = $(e.target).closest('.planit-marker');
            marker.addClass('is-dragging');
            infoboxID = $(e.target).closest('.planit-marker').attr('data-infobox');
            return $("#" + infoboxID).removeClass('active');
          }
        };
      })(this));
    }
    if (this.options.infobox) {
      id = Planit.randomString(16);
      this.lastMarker().find('.planit-marker-content').append("<div class=\"planit-infobox\" id=\"info-" + id + "\">" + this.options.infobox + "</div>");
      this.lastMarker().attr('data-infobox', "info-" + id);
      infobox = $("#" + (this.lastMarker().attr('data-infobox')));
      infobox.css({
        left: -(infobox.width() / 2),
        bottom: infobox.outerHeight() + 5
      });
      this.lastMarker().on('mouseleave', (function(_this) {
        return function(e) {
          var marker;
          marker = $(e.target).closest('.planit-marker');
          infobox = $("#" + (marker.attr('data-infobox')));
          return infobox.removeClass('active');
        };
      })(this));
      this.lastMarker().on('mouseover', (function(_this) {
        return function(e) {
          var marker;
          marker = $(e.target).closest('.planit-marker');
          infobox = $("#" + (marker.attr('data-infobox')));
          if (marker.hasClass('is-dragging') || _this.draggingMarker().length > 0) {
            return infobox.removeClass('active');
          } else {
            return infobox.addClass('active');
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

  Events.prototype.lastMarker = function() {
    return this.markers().last();
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
    this.markersContainer.append($('<div><div class="planit-marker-content"></div></div>').addClass('planit-marker').attr('data-marker', this.options.id).css({
      left: left + "px",
      top: top + "px",
      backgroundColor: color
    }));
    new Planit.Marker.Events(this.options);
    new Planit.Marker(this.container, this.options.id);
  }

  return Creator;

})();

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInBsYW5pdC10bXAuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLElBQUEsTUFBQTtFQUFBLGtGQUFBOztBQUFBOzs7Ozs7R0FJRTs7QUFBQSxFQUFBLE1BQUMsQ0FBQSxjQUFELEdBQXlCLGtCQUF6QixDQUFBOztBQUFBLEVBQ0EsTUFBQyxDQUFBLG9CQUFELEdBQXlCLDBCQUR6QixDQUFBOztBQUFBLEVBRUEsTUFBQyxDQUFBLFdBQUQsR0FBeUIsZUFGekIsQ0FBQTs7QUFBQSxFQUdBLE1BQUMsQ0FBQSxrQkFBRCxHQUF5Qix1QkFIekIsQ0FBQTs7QUFBQSxtQkFPQSxNQUFBLEdBQUssU0FBQyxXQUFELEdBQUE7QUFFSCxJQUZJLElBQUMsQ0FBQSxnQ0FBRCxjQUFXLEVBRWYsQ0FBQTtBQUFBLElBQUEsSUFBRyxJQUFDLENBQUEsT0FBTyxDQUFDLFNBQVo7QUFDRSxNQUFBLElBQUMsQ0FBQSxPQUFPLENBQUMsU0FBVCxHQUFxQixDQUFBLENBQUcsR0FBQSxHQUFHLElBQUMsQ0FBQSxPQUFPLENBQUMsU0FBZixDQUFyQixDQURGO0tBQUEsTUFBQTtBQUdFLE1BQUEsSUFBQyxDQUFBLE9BQU8sQ0FBQyxTQUFULEdBQXFCLENBQUEsQ0FBRyxTQUFILENBQXJCLENBSEY7S0FBQTtBQUFBLElBTUEsSUFBQyxDQUFBLE9BQU8sQ0FBQyxTQUFTLENBQUMsUUFBbkIsQ0FBNkIsa0JBQTdCLENBTkEsQ0FBQTtBQUFBLElBT0EsSUFBQyxDQUFBLE9BQU8sQ0FBQyxTQUFTLENBQUMsTUFBbkIsQ0FBNkIsZUFBQSxHQUNiLE1BQU0sQ0FBQyxvQkFETSxHQUNlLFdBRDVDLENBUEEsQ0FBQTtBQUFBLElBWUEsSUFBQyxDQUFBLFNBQUQsR0FBYSxJQUFDLENBQUEsT0FBTyxDQUFDLFNBWnRCLENBQUE7QUFBQSxJQWFBLElBQUMsQ0FBQSxnQkFBRCxHQUFvQixJQUFDLENBQUEsU0FBUyxDQUFDLElBQVgsQ0FBaUIsR0FBQSxHQUFHLE1BQU0sQ0FBQyxvQkFB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QUFDLEVBRmhDLENBR0UsQ0FBQyxHQUhILENBSUk7QUFBQSxNQUFBLElBQUEsRUFBUyxJQUFELEdBQU0sSUFBZDtBQUFBLE1BQ0EsR0FBQSxFQUFRLEdBQUQsR0FBSyxJQURaO0FBQUEsTUFFQSxlQUFBLEVBQWlCLEtBRmpCO0tBSkosQ0FERixDQVZBLENBQUE7QUFBQSxJQXFCSSxJQUFBLE1BQU0sQ0FBQyxNQUFNLENBQUMsTUFBZCxDQUFxQixJQUFDLENBQUEsT0FBdEIsQ0FyQkosQ0FBQTtBQUFBLElBd0JJLElBQUEsTUFBTSxDQUFDLE1BQVAsQ0FBYyxJQUFDLENBQUEsU0FBZixFQUEwQixJQUFDLENBQUEsT0FBTyxDQUFDLEVBQW5DLENBeEJKLENBRlc7RUFBQSxDQUFiOztpQkFBQTs7SUF0WkYsQ0FBQSIsImZpbGUiOiJwbGFuaXQtdG1wLmpzIiwic291cmNlUm9vdCI6Ii9zb3VyY2UvIiwic291cmNlc0NvbnRlbnQiOlsiY2xhc3MgUGxhbml0XG5cbiAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gUmVmc1xuXG4gIEBjb250YWluZXJDbGFzczogICAgICAgICdwbGFuaXQtY29udGFpbmVyJ1xuICBAbWFya2VyQ29udGFpbmVyQ2xhc3M6ICAncGxhbml0LW1hcmtlcnMtY29udGFpbmVyJ1xuICBAbWFya2VyQ2xhc3M6ICAgICAgICAgICAncGxhbml0LW1hcmtlcidcbiAgQG1hcmtlckNvbnRlbnRDbGFzczogICAgJ3BsYW5pdC1tYXJrZXItY29udGVudCdcblxuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBEZWZhdWx0IE9wdGlvbnNcblxuICBuZXc6IChAb3B0aW9ucyA9IHt9KSAtPlxuICAgICMgU2V0IE9wdGlvbnNcbiAgICBpZiBAb3B0aW9ucy5jb250YWluZXJcbiAgICAgIEBvcHRpb25zLmNvbnRhaW5lciA9ICQoXCIjI3tAb3B0aW9ucy5jb250YWluZXJ9XCIpXG4gICAgZWxzZVxuICAgICAgQG9wdGlvbnMuY29udGFpbmVyID0gJCgnI3BsYW5pdCcpIFxuXG4gICAgIyBJbml0aWFsaXplIENvbnRhaW5lclxuICAgIEBvcHRpb25zLmNvbnRhaW5lci5hZGRDbGFzcygncGxhbml0LWNvbnRhaW5lcicpXG4gICAgQG9wdGlvbnMuY29udGFpbmVyLmFwcGVuZCBcIlwiXCJcbiAgICAgIDxkaXYgY2xhc3M9XCIje1BsYW5pdC5tYXJrZXJDb250YWluZXJDbGFzc31cIj48L2Rpdj5cbiAgICAgICAgXCJcIlwiXG5cbiAgICAjIFJlZnNcbiAgICBAY29udGFpbmVyID0gQG9wdGlvbnMuY29udGFpbmVyXG4gICAgQG1hcmtlcnNDb250YWluZXIgPSBAY29udGFpbmVyLmZpbmQoXCIuI3tQbGFuaXQubWFya2VyQ29udGFpbmVyQ2xhc3N9XCIpLmZpcnN0KClcblxuICAgICMgQWRkIGltYWdlIGFuZCB6b29tIChpZiBuZWNlc3NhcnkpXG4gICAgaWYgQG9wdGlvbnMuaW1hZ2UgJiYgQG9wdGlvbnMuaW1hZ2UudXJsXG4gICAgICBAY29udGFpbmVyLmFwcGVuZChcIlwiXCI8aW1nIHNyYz1cIiN7QG9wdGlvbnMuaW1hZ2UudXJsfVwiPlwiXCJcIilcbiAgICAgIEBtYXJrZXJzQ29udGFpbmVyLmNzc1xuICAgICAgICBiYWNrZ3JvdW5kSW1hZ2U6IFwidXJsKCcje0BvcHRpb25zLmltYWdlLnVybH0nKVwiXG4gICAgICAkKHdpbmRvdykubG9hZCA9PlxuICAgICAgICBAY29udGFpbmVyLmNzc1xuICAgICAgICAgIGhlaWdodDogQGNvbnRhaW5lci5maW5kKCdpbWcnKS5maXJzdCgpLmhlaWdodCgpXG4gICAgICAgIEBjb250YWluZXIuZmluZCgnaW1nJykuZmlyc3QoKS5yZW1vdmUoKVxuICAgICAgICBpZiBAb3B0aW9ucy5pbWFnZS56b29tXG4gICAgICAgICAgbmV3IFBsYW5pdC5QbGFuLlpvb21hYmxlXG4gICAgICAgICAgICBjb250YWluZXI6IEBjb250YWluZXJcblxuICAgICMgQWRkIE1hcmtlcnMgKGlmIG5lY2Vzc2FyeSlcbiAgICBpZiBAb3B0aW9ucy5tYXJrZXJzXG4gICAgICAkKHdpbmRvdykubG9hZCAoKSA9PlxuICAgICAgICBAYWRkTWFya2VyKG1hcmtlcikgZm9yIG1hcmtlciBpbiBAb3B0aW9ucy5tYXJrZXJzXG5cbiAgICAjIEJpbmQgRG9jdW1lbnQgRXZlbnRzXG4gICAgbmV3IFBsYW5pdC5QbGFuLkV2ZW50c1xuICAgICAgY29udGFpbmVyOiBAY29udGFpbmVyXG4gICAgICBwbGFuaXQ6IEBcblxuICAgICMgUmV0dXJuIHRoaXMgUGxhbml0IG9iamVjdFxuICAgIEBcblxuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBBZGQgQSBNYXJrZXJcblxuICBhZGRNYXJrZXI6IChvcHRpb25zKSA9PlxuICAgIG9wdGlvbnMuY29udGFpbmVyID0gQGNvbnRhaW5lclxuICAgIG5ldyBQbGFuaXQuTWFya2VyLkNyZWF0b3Iob3B0aW9ucylcblxuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBSZXRyaWV2ZSBEYXRhXG5cbiAgZ2V0TWFya2VyOiAoaWQpID0+XG4gICAgbmV3IFBsYW5pdC5NYXJrZXIoQGNvbnRhaW5lciwgaWQpXG5cbiAgZ2V0QWxsTWFya2VyczogKCkgPT5cbiAgICBwbGFuID0gbmV3IFBsYW5pdC5QbGFuKEBjb250YWluZXIpXG4gICAgcGxhbi5nZXRBbGxNYXJrZXJzKClcblxuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBFdmVudCBDYWxsYmFja3NcblxuICBkcmFnRW5kOiAoZXZlbnQsIG1hcmtlcikgPT5cbiAgICBpZiBAb3B0aW9ucy5kcmFnRW5kXG4gICAgICBAb3B0aW9ucy5kcmFnRW5kKGV2ZW50LCBtYXJrZXIpXG5cbiAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gQ2xhc3MgTWV0aG9kc1xuXG4gIEByYW5kb21TdHJpbmc6IChsZW5ndGggPSAxNikgLT5cbiAgICBzdHIgPSBNYXRoLnJhbmRvbSgpLnRvU3RyaW5nKDM2KS5zbGljZSgyKSBcbiAgICBzdHIgPSBzdHIgKyBNYXRoLnJhbmRvbSgpLnRvU3RyaW5nKDM2KS5zbGljZSgyKVxuICAgIHN0ci5zdWJzdHJpbmcoMCwgbGVuZ3RoIC0gMSlcblxuIyBzZXQgdGhpcyBjbGFzcyB0byBhIGdsb2JhbCBgcGxhbml0YCB2YXJpYWJsZVxud2luZG93LnBsYW5pdCA9IG5ldyBQbGFuaXRcblxuY2xhc3MgUGxhbml0LlBsYW5cblxuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBTZXR1cFxuXG4gIGNvbnN0cnVjdG9yOiAoQGNvbnRhaW5lcikgLT5cbiAgICBAbWFya2Vyc0NvbnRhaW5lciA9IEBjb250YWluZXIuZmluZChcIi4je1BsYW5pdC5tYXJrZXJDb250YWluZXJDbGFzc31cIikuZmlyc3QoKVxuXG4gICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIEdldCBBbGwgTWFya2Vyc1xuXG4gIGdldEFsbE1hcmtlcnM6ICgpID0+XG4gICAgbWFya2VycyA9IFtdXG4gICAgZm9yIG1hcmtlciBpbiBAbWFya2Vyc0NvbnRhaW5lci5maW5kKCcucGxhbml0LW1hcmtlcicpXG4gICAgICBtID0gbmV3IFBsYW5pdC5NYXJrZXIoQGNvbnRhaW5lciwgJChtYXJrZXIpLmF0dHIoJ2RhdGEtbWFya2VyJykpXG4gICAgICBtYXJrZXIgPVxuICAgICAgICAjIGNvb3JkczogW20ucG9zaXRpb24oKS5sZWZ0LCBtLnBvc2l0aW9uKCkudG9wXVxuICAgICAgICBjb29yZHM6IG0ucG9zaXRpb24oKVxuICAgICAgICBkcmFnZ2FibGU6IG0uaXNEcmFnZ2FibGUoKVxuICAgICAgICBjb2xvcjogbS5jb2xvcigpXG4gICAgICBtYXJrZXIuaW5mb2JveCA9IG0uaW5mb2JveEhUTUwoKSBpZiBtLmluZm9ib3hIVE1MKClcbiAgICAgIG1hcmtlcnMucHVzaChtYXJrZXIpXG4gICAgbWFya2Vyc1xuXG5jbGFzcyBQbGFuaXQuUGxhbi5FdmVudHNcblxuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBTZXR1cFxuXG4gIGNvbnN0cnVjdG9yOiAoQG9wdGlvbnMpIC0+XG5cbiAgICAjIGRlZmF1bHQgb3B0aW9uc1xuICAgIEBjb250YWluZXIgPSBAb3B0aW9ucy5jb250YWluZXJcbiAgICBAbWFya2Vyc0NvbnRhaW5lciA9IEBjb250YWluZXIuZmluZChcIi4je1BsYW5pdC5tYXJrZXJDb250YWluZXJDbGFzc31cIilcblxuICAgICMgYmluZCBkcmFnZ2FibGUgZXZlbnRzXG4gICAgJChkb2N1bWVudCkub24oJ21vdXNlbW92ZScsIEBtb3VzZW1vdmUpXG4gICAgJChkb2N1bWVudCkub24oJ21vdXNldXAnLCBAbW91c2V1cClcblxuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBSZWZzXG5cbiAgbWFya2VyczogPT5cbiAgICBAbWFya2Vyc0NvbnRhaW5lci5maW5kKCcucGxhbml0LW1hcmtlcicpXG5cbiAgZHJhZ2dpbmdNYXJrZXI6ID0+XG4gICAgQG1hcmtlcnNDb250YWluZXIuZmluZCgnLnBsYW5pdC1tYXJrZXIuaXMtZHJhZ2dpbmcnKVxuXG4gIGxhc3RNYXJrZXI6ID0+XG4gICAgQG1hcmtlcnMoKS5sYXN0KClcblxuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBFdmVudHNcblxuICBtb3VzZXVwOiAoZSkgPT5cbiAgICBpZiAkKGUudGFyZ2V0KS5oYXNDbGFzcygncGxhbml0LW1hcmtlci1jb250ZW50JylcbiAgICAgIG1hcmtlciA9ICQoZS50YXJnZXQpLmNsb3Nlc3QoJy5wbGFuaXQtbWFya2VyJylcbiAgICAgICQoXCIjI3ttYXJrZXIuYXR0cignZGF0YS1pbmZvYm94Jyl9XCIpLmFkZENsYXNzKCdhY3RpdmUnKVxuICAgIG1hcmtlciA9IEBtYXJrZXJzQ29udGFpbmVyLmZpbmQoJy5pcy1kcmFnZ2luZycpLmZpcnN0KClcbiAgICBpZiBAZHJhZ2dpbmdNYXJrZXIoKS5sZW5ndGggPiAwXG4gICAgICBtID0gbmV3IFBsYW5pdC5NYXJrZXIoQGNvbnRhaW5lciwgbWFya2VyLmF0dHIoJ2RhdGEtbWFya2VyJykpXG4gICAgICBAb3B0aW9ucy5wbGFuaXQuZHJhZ0VuZChlLCBtKVxuICAgICAgQGRyYWdnaW5nTWFya2VyKCkucmVtb3ZlQ2xhc3MoJ2lzLWRyYWdnaW5nJylcblxuICBtb3VzZW1vdmU6IChlKSA9PlxuICAgIG1hcmtlcnMgPSBAbWFya2Vyc0NvbnRhaW5lci5maW5kKCcucGxhbml0LW1hcmtlci5pcy1kcmFnZ2luZycpXG4gICAgaWYgbWFya2Vycy5sZW5ndGggPiAwXG5cbiAgICAgICMgb25seSB1c2UgZmlyc3QgbWFya2VyIGluIGNhc2UgdGhlcmUgYXJlIG1vcmUgdGhhblxuICAgICAgIyBvbmUgZHJhZ2dpbmdcbiAgICAgICMgXG4gICAgICBtYXJrZXIgPSBtYXJrZXJzLmZpcnN0KClcblxuICAgICAgIyBjYWxjdWxhdGUgcG9zaXRpb25zXG4gICAgICAjIFxuICAgICAgbW91c2VMZWZ0ICAgICA9IGUucGFnZVggLSBAY29udGFpbmVyLm9mZnNldCgpLmxlZnRcbiAgICAgIG1vdXNlVG9wICAgICAgPSBlLnBhZ2VZIC0gQGNvbnRhaW5lci5vZmZzZXQoKS50b3BcbiAgICAgIHBsYW5SaWdodCAgICAgPSBAY29udGFpbmVyLndpZHRoKClcbiAgICAgIHBsYW5Cb3R0b20gICAgPSBAY29udGFpbmVyLmhlaWdodCgpXG4gICAgICBtYXJrZXJMZWZ0ICAgID0gbW91c2VMZWZ0IC0gKG1hcmtlci5vdXRlcldpZHRoKCkgLyAyKVxuICAgICAgbWFya2VyVG9wICAgICA9IG1vdXNlVG9wIC0gKG1hcmtlci5vdXRlckhlaWdodCgpIC8gMilcbiAgICAgIG1hcmtlclJpZ2h0ICAgPSBtb3VzZUxlZnQgKyAobWFya2VyLm91dGVyV2lkdGgoKSAvIDIpXG4gICAgICBtYXJrZXJCb3R0b20gID0gbW91c2VUb3AgKyAobWFya2VyLm91dGVySGVpZ2h0KCkgLyAyKVxuICAgICAgbWFya2VyV2lkdGggICA9IG1hcmtlci5vdXRlcldpZHRoKClcbiAgICAgIG1hcmtlckhlaWdodCAgPSBtYXJrZXIub3V0ZXJIZWlnaHQoKVxuXG4gICAgICAjIGZpbmQgdGhlIGxlZnQgcG9zaXRpb24gb2YgdGhlIG1hcmtlciBiYXNlZCBvblxuICAgICAgIyBwb3NpdGlvbiBvZiB0aGUgbW91c2UgcmVsYXRpdmUgdG8gdGhlIHBsYW5cbiAgICAgICMgXG4gICAgICBpZiBtYXJrZXJMZWZ0IDw9IDBcbiAgICAgICAgbWFya2VyWCA9IDBcbiAgICAgIGVsc2UgaWYgbWFya2VyUmlnaHQgPCBwbGFuUmlnaHRcbiAgICAgICAgbWFya2VyWCA9IG1hcmtlckxlZnRcbiAgICAgIGVsc2VcbiAgICAgICAgbWFya2VyWCA9IHBsYW5SaWdodCAtIG1hcmtlcldpZHRoXG5cbiAgICAgICMgZmluZCB0aGUgbGVmdCBwb3NpdGlvbiBvZiB0aGUgbWFya2VyIGJhc2VkIG9uXG4gICAgICAjIHBvc2l0aW9uIG9mIHRoZSBtb3VzZSByZWxhdGl2ZSB0byB0aGUgcGxhblxuICAgICAgIyBcbiAgICAgIGlmIG1hcmtlclRvcCA8PSAwXG4gICAgICAgIG1hcmtlclkgPSAwXG4gICAgICBlbHNlIGlmIG1hcmtlckJvdHRvbSA8IHBsYW5Cb3R0b21cbiAgICAgICAgbWFya2VyWSA9IG1hcmtlclRvcFxuICAgICAgZWxzZVxuICAgICAgICBtYXJrZXJZID0gcGxhbkJvdHRvbSAtIG1hcmtlckhlaWdodFxuXG4gICAgICAjIHNldCB0aGUgcG9zaXRpb24gb2YgdGhlIG1hcmtlclxuICAgICAgIyBcbiAgICAgIG1hcmtlci5jc3NcbiAgICAgICAgbGVmdDogbWFya2VyWFxuICAgICAgICB0b3A6IG1hcmtlcllcblxuY2xhc3MgUGxhbml0LlBsYW4uWm9vbWFibGVcblxuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBTZXR1cFxuXG4gIGNvbnN0cnVjdG9yOiAoQG9wdGlvbnMpIC0+XG4gICAgIyBkZWZhdWx0IG9wdGlvbnNcbiAgICBAY29udGFpbmVyID0gQG9wdGlvbnMuY29udGFpbmVyXG4gICAgQG1hcmtlcnNDb250YWluZXIgPSBAY29udGFpbmVyLmZpbmQoXCIuI3tQbGFuaXQubWFya2VyQ29udGFpbmVyQ2xhc3N9XCIpXG4gICAgQHpvb21JZCA9IFBsYW5pdC5yYW5kb21TdHJpbmcoKVxuICAgIEBtYXJrZXJzQ29udGFpbmVyLmF0dHIoJ2RhdGEtem9vbS1pZCcsIEB6b29tSWQpXG4gICAgIyBiaW5kIGRyYWdnYWJsZSBldmVudHNcbiAgICAkKEBjb250YWluZXIpLm9uKCdkYmxjbGljaycsIEBkYmxjbGljaylcbiAgICAjICQoQGNvbnRhaW5lcikub24oJ21vdXNld2hlZWwnLCAkLnRocm90dGxlKDI1MCwgQHNjcm9sbCkpXG4gICAgIyBzZXQgaW5pdGlhbCBiYWNrZ3JvdW5kIGNvb3JkaW5hdGVzXG4gICAgQGltYWdlUG9zaXRpb24gPVxuICAgICAgbGVmdFB4OiAgICAgMFxuICAgICAgdG9wUHg6ICAgICAgMFxuICAgICAgd2lkdGg6ICAgICAgQG1hcmtlcnNDb250YWluZXIud2lkdGgoKVxuICAgICAgaGVpZ2h0OiAgICAgQG1hcmtlcnNDb250YWluZXIuaGVpZ2h0KClcbiAgICAgIHNjYWxlOiAgICAgIDFcbiAgICAgIGluY3JlbWVudDogIDAuNVxuICAgIEBzZXRCYWNrZ3JvdW5kKClcblxuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBBY3Rpb25zXG5cbiAgc2V0QmFja2dyb3VuZDogPT5cbiAgICBAbWFya2Vyc0NvbnRhaW5lci5jc3NcbiAgICAgIGJhY2tncm91bmRQb3NpdGlvbjogXCIje0BpbWFnZVBvc2l0aW9uLmxlZnRQeH1weCAje0BpbWFnZVBvc2l0aW9uLnRvcFB4fXB4XCJcbiAgICAgIGJhY2tncm91bmRTaXplOiBcIiN7QGltYWdlUG9zaXRpb24uc2NhbGUgKiAxMDAuMH0lXCJcblxuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBDYWxjdWxhdGlvbnNcblxuICBpbWdXaWR0aDogPT5cbiAgICBwYXJzZUZsb2F0KEBpbWFnZVBvc2l0aW9uLndpZHRoICogQGltYWdlUG9zaXRpb24uc2NhbGUpXG5cbiAgdG1wSW1nV2lkdGg6ID0+XG4gICAgKDEgKyBAaW1hZ2VQb3NpdGlvbi5pbmNyZW1lbnQpICogQGltYWdlUG9zaXRpb24ud2lkdGgoKVxuXG4gIGltZ1dpZHRoSW5jcmVtZW50OiA9PlxuICAgIHBhcnNlRmxvYXQoQGltYWdlUG9zaXRpb24ud2lkdGggKiBAaW1hZ2VQb3NpdGlvbi5pbmNyZW1lbnQpXG5cbiAgY29udGFpbmVyV2lkdGg6ID0+XG4gICAgcGFyc2VGbG9hdChAbWFya2Vyc0NvbnRhaW5lci53aWR0aCgpKVxuXG4gIGltZ09mZnNldExlZnQ6ID0+XG4gICAgTWF0aC5hYnMoXG4gICAgICBwYXJzZUZsb2F0KEBtYXJrZXJzQ29udGFpbmVyLmNzcygnYmFja2dyb3VuZFBvc2l0aW9uJykuc3BsaXQoJyAnKVswXSlcbiAgICApXG5cbiAgaW1nSGVpZ2h0OiA9PlxuICAgIHBhcnNlRmxvYXQoQGltYWdlUG9zaXRpb24uaGVpZ2h0ICogQGltYWdlUG9zaXRpb24uc2NhbGUpXG5cbiAgdG1wSW1nSGVpZ2h0OiA9PlxuICAgICgxICsgQGltYWdlUG9zaXRpb24uaW5jcmVtZW50KSAqIEBpbWFnZVBvc2l0aW9uLmhlaWdodCgpXG5cbiAgaW1nSGVpZ2h0SW5jcmVtZW50OiA9PlxuICAgIHBhcnNlRmxvYXQoQGltYWdlUG9zaXRpb24uaGVpZ2h0ICogQGltYWdlUG9zaXRpb24uaW5jcmVtZW50KVxuXG4gIGNvbnRhaW5lckhlaWdodDogPT5cbiAgICBwYXJzZUZsb2F0KEBtYXJrZXJzQ29udGFpbmVyLmhlaWdodCgpKVxuXG4gIGltZ09mZnNldFRvcDogPT5cbiAgICBNYXRoLmFicyhcbiAgICAgIHBhcnNlRmxvYXQoQG1hcmtlcnNDb250YWluZXIuY3NzKCdiYWNrZ3JvdW5kUG9zaXRpb24nKS5zcGxpdCgnICcpWzFdKVxuICAgIClcblxuICBnZXRFdmVudENvbnRhaW5lclBvc2l0aW9uOiAoZSkgPT5cbiAgICBsZWZ0OiAoZS5wYWdlWCAtIEBjb250YWluZXIub2Zmc2V0KCkubGVmdCkgLyBAY29udGFpbmVyV2lkdGgoKVxuICAgIHRvcDogIChlLnBhZ2VZIC0gQGNvbnRhaW5lci5vZmZzZXQoKS50b3ApIC8gQGNvbnRhaW5lckhlaWdodCgpXG5cbiAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gRXZlbnRzXG5cbiAgZGJsY2xpY2s6IChlKSA9PlxuICAgIGlmICQoZS50YXJnZXQpLmF0dHIoJ2RhdGEtem9vbS1pZCcpID09IEB6b29tSWRcbiAgICAgIGNsaWNrID0gQGdldEV2ZW50Q29udGFpbmVyUG9zaXRpb24oZSlcbiAgICAgIEB6b29tSW4oY2xpY2subGVmdCwgY2xpY2sudG9wKVxuXG4gIHNjcm9sbDogKGUpID0+XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpXG4gICAgaWYgZS5vcmlnaW5hbEV2ZW50LmRlbHRhWSA+IDBcbiAgICAgIGRpcmVjdGlvbiA9ICdvdXQnXG4gICAgZWxzZSBpZiBlLm9yaWdpbmFsRXZlbnQuZGVsdGFZIDwgMFxuICAgICAgZGlyZWN0aW9uID0gJ2luJ1xuICAgIGNvbnNvbGUubG9nIGRpcmVjdGlvbiBpZiBkaXJlY3Rpb25cblxuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBab29taW5nXG5cbiAgem9vbUluOiAobGVmdCA9IDAuNSwgdG9wID0gMC41KSA9PlxuICAgIEBpbWFnZVBvc2l0aW9uLnNjYWxlICA9IEBpbWFnZVBvc2l0aW9uLnNjYWxlICsgQGltYWdlUG9zaXRpb24uaW5jcmVtZW50XG4gICAgY29uc29sZS5sb2cgdG9wXG4gICAgQGltYWdlUG9zaXRpb24ubGVmdFB4ID0gLSBAaW1nT2Zmc2V0TGVmdCgpIC0gKGxlZnQgKiBAaW1nV2lkdGhJbmNyZW1lbnQoKSlcbiAgICBAaW1hZ2VQb3NpdGlvbi50b3BQeCAgPSAtIEBpbWdPZmZzZXRUb3AoKSAtICh0b3AgKiBAaW1nSGVpZ2h0SW5jcmVtZW50KCkpXG4gICAgQHNldEJhY2tncm91bmQoKVxuXG5jbGFzcyBQbGFuaXQuTWFya2VyXG5cbiAgY29uc3RydWN0b3I6IChAY29udGFpbmVyLCBpZCkgLT5cblxuICAgICMgU2V0IE9wdGlvbnNcbiAgICBAbWFya2Vyc0NvbnRhaW5lciA9IEBjb250YWluZXIuZmluZChcIi4je1BsYW5pdC5tYXJrZXJDb250YWluZXJDbGFzc31cIilcblxuICAgICMgRmluZCBNYXJrZXJcbiAgICBAbWFya2VyID0gQG1hcmtlcnNDb250YWluZXIuZmluZChcbiAgICAgIFwiLiN7UGxhbml0Lm1hcmtlckNsYXNzfVtkYXRhLW1hcmtlcj0nI3tpZH0nXVwiXG4gICAgKS5maXJzdCgpXG5cbiAgICAjIFJldHVybiB0aGlzXG4gICAgQFxuXG4gICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIENhbGN1bGF0aW9uc1xuXG4gIHBvc2l0aW9uOiA9PlxuICAgIHhQeCA9IEBtYXJrZXIucG9zaXRpb24oKS5sZWZ0ICsgKEBtYXJrZXIub3V0ZXJXaWR0aCgpIC8gMilcbiAgICB5UHggPSBAbWFya2VyLnBvc2l0aW9uKCkudG9wICsgKEBtYXJrZXIub3V0ZXJIZWlnaHQoKSAvIDIpXG4gICAgeFBjID0gKHhQeCAvIEBjb250YWluZXIud2lkdGgoKSkgKiAxMDBcbiAgICB5UGMgPSAoeVB4IC8gQGNvbnRhaW5lci5oZWlnaHQoKSkgKiAxMDBcbiAgICBbeFBjLCB5UGNdXG5cbiAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gQXR0cmlidXRlc1xuXG4gIGNvbG9yOiA9PlxuICAgIEBtYXJrZXIuY3NzKCdiYWNrZ3JvdW5kQ29sb3InKVxuXG4gIGlkOiA9PlxuICAgIEBtYXJrZXIuYXR0cignZGF0YS1tYXJrZXInKVxuXG4gICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIEluZm9ib3hcblxuICBpbmZvYm94SFRNTDogPT5cbiAgICBpbmZvID0gQG1hcmtlci5maW5kKCcucGxhbml0LWluZm9ib3gnKVxuICAgIGlmIGluZm8ubGVuZ3RoID4gMCB0aGVuIGluZm8uaHRtbCgpIGVsc2UgbnVsbFxuXG4gICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIERyYWdnaW5nXG5cbiAgaXNEcmFnZ2FibGU6ID0+XG4gICAgQG1hcmtlci5oYXNDbGFzcygnZHJhZ2dhYmxlJylcblxuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBBY3Rpb25zXG5cbiAgdXBkYXRlOiAob3B0aW9ucykgPT5cbiAgICBpZiBvcHRpb25zLmNvbG9yXG4gICAgICBAbWFya2VyLmNzcyhiYWNrZ3JvdW5kQ29sb3I6IG9wdGlvbnMuY29sb3IpXG4gICAgaWYgb3B0aW9ucy5pbmZvYm94XG4gICAgICBAbWFya2VyLmZpbmQoJy5wbGFuaXQtaW5mb2JveCcpLmh0bWwob3B0aW9ucy5pbmZvYm94KVxuICAgIGlmIG9wdGlvbnMuZHJhZ2dhYmxlXG4gICAgICBAbWFya2VyLnJlbW92ZUNsYXNzKCdkcmFnZ2FibGUnKVxuICAgICAgQG1hcmtlci5hZGRDbGFzcygnZHJhZ2dhYmxlJykgaWYgb3B0aW9ucy5kcmFnZ2FibGUgPT0gdHJ1ZVxuICAgIGlmIG9wdGlvbnMuY29vcmRzXG4gICAgICBsZWZ0ID0gKChwYXJzZUZsb2F0KG9wdGlvbnMuY29vcmRzWzBdKSAvIDEwMCkgKiBAY29udGFpbmVyLndpZHRoKCkpIC0gMTVcbiAgICAgIHRvcCA9ICgocGFyc2VGbG9hdChvcHRpb25zLmNvb3Jkc1sxXSkgLyAxMDApICogQGNvbnRhaW5lci5oZWlnaHQoKSkgLSAxNVxuICAgICAgQG1hcmtlci5jc3NcbiAgICAgICAgbGVmdDogXCIje2xlZnR9cHhcIlxuICAgICAgICB0b3A6IFwiI3t0b3B9cHhcIlxuXG4gIHJlbW92ZTogPT5cbiAgICBAbWFya2VyLnJlbW92ZSgpXG5cbmNsYXNzIFBsYW5pdC5NYXJrZXIuRXZlbnRzXG5cbiAgY29uc3RydWN0b3I6IChAb3B0aW9ucykgLT5cblxuICAgICMgU2V0IE9wdGlvbnNcbiAgICBAY29udGFpbmVyID0gQG9wdGlvbnMuY29udGFpbmVyXG4gICAgQG1hcmtlcnNDb250YWluZXIgPSBAY29udGFpbmVyLmZpbmQoXCIuI3tQbGFuaXQubWFya2VyQ29udGFpbmVyQ2xhc3N9XCIpXG5cbiAgICAjIEZpbmQgTWFya2VyXG4gICAgQG1hcmtlciA9IEBtYXJrZXJzQ29udGFpbmVyLmZpbmQoXG4gICAgICBcIi4je1BsYW5pdC5tYXJrZXJDbGFzc31bZGF0YS1tYXJrZXI9JyN7QG9wdGlvbnMuaWR9J11cIlxuICAgICkuZmlyc3QoKVxuXG4gICAgIyBEcmFnZ2FibGVcbiAgICBpZiBAb3B0aW9ucy5kcmFnZ2FibGVcbiAgICAgIEBsYXN0TWFya2VyKCkuYWRkQ2xhc3MoJ2RyYWdnYWJsZScpXG4gICAgICBAbGFzdE1hcmtlcigpLm9uICdtb3VzZWRvd24nLCAoZSkgPT5cbiAgICAgICAgaWYgJChlLnRhcmdldCkuYXR0cignY2xhc3MnKSA9PSAncGxhbml0LW1hcmtlci1jb250ZW50J1xuICAgICAgICAgIG1hcmtlciA9ICQoZS50YXJnZXQpLmNsb3Nlc3QoJy5wbGFuaXQtbWFya2VyJylcbiAgICAgICAgICBtYXJrZXIuYWRkQ2xhc3MoJ2lzLWRyYWdnaW5nJylcbiAgICAgICAgICBpbmZvYm94SUQgPSAkKGUudGFyZ2V0KS5jbG9zZXN0KCcucGxhbml0LW1hcmtlcicpLmF0dHIoJ2RhdGEtaW5mb2JveCcpXG4gICAgICAgICAgJChcIiMje2luZm9ib3hJRH1cIikucmVtb3ZlQ2xhc3MoJ2FjdGl2ZScpXG5cbiAgICAjIEluZm9ib3hcbiAgICBpZiBAb3B0aW9ucy5pbmZvYm94XG4gICAgICBpZCA9IFBsYW5pdC5yYW5kb21TdHJpbmcoMTYpXG4gICAgICBAbGFzdE1hcmtlcigpLmZpbmQoJy5wbGFuaXQtbWFya2VyLWNvbnRlbnQnKS5hcHBlbmQgXCJcIlwiXG4gICAgICAgIDxkaXYgY2xhc3M9XCJwbGFuaXQtaW5mb2JveFwiIGlkPVwiaW5mby0je2lkfVwiPiN7QG9wdGlvbnMuaW5mb2JveH08L2Rpdj5cbiAgICAgICAgICBcIlwiXCJcbiAgICAgIEBsYXN0TWFya2VyKCkuYXR0cignZGF0YS1pbmZvYm94JywgXCJpbmZvLSN7aWR9XCIpXG4gICAgICBpbmZvYm94ID0gJChcIiMje0BsYXN0TWFya2VyKCkuYXR0cignZGF0YS1pbmZvYm94Jyl9XCIpXG4gICAgICBpbmZvYm94LmNzc1xuICAgICAgICBsZWZ0OiAtKGluZm9ib3gud2lkdGgoKSAvIDIpXG4gICAgICAgIGJvdHRvbTogaW5mb2JveC5vdXRlckhlaWdodCgpICsgNVxuICAgICAgQGxhc3RNYXJrZXIoKS5vbiAnbW91c2VsZWF2ZScsIChlKSA9PlxuICAgICAgICBtYXJrZXIgPSAkKGUudGFyZ2V0KS5jbG9zZXN0KCcucGxhbml0LW1hcmtlcicpXG4gICAgICAgIGluZm9ib3ggPSAkKFwiIyN7bWFya2VyLmF0dHIoJ2RhdGEtaW5mb2JveCcpfVwiKVxuICAgICAgICBpbmZvYm94LnJlbW92ZUNsYXNzKCdhY3RpdmUnKVxuICAgICAgQGxhc3RNYXJrZXIoKS5vbiAnbW91c2VvdmVyJywgKGUpID0+XG4gICAgICAgIG1hcmtlciA9ICQoZS50YXJnZXQpLmNsb3Nlc3QoJy5wbGFuaXQtbWFya2VyJylcbiAgICAgICAgaW5mb2JveCA9ICQoXCIjI3ttYXJrZXIuYXR0cignZGF0YS1pbmZvYm94Jyl9XCIpXG4gICAgICAgIGlmIG1hcmtlci5oYXNDbGFzcygnaXMtZHJhZ2dpbmcnKSB8fCBAZHJhZ2dpbmdNYXJrZXIoKS5sZW5ndGggPiAwXG4gICAgICAgICAgaW5mb2JveC5yZW1vdmVDbGFzcygnYWN0aXZlJylcbiAgICAgICAgZWxzZVxuICAgICAgICAgIGluZm9ib3guYWRkQ2xhc3MoJ2FjdGl2ZScpXG5cbiAgbWFya2VyczogLT5cbiAgICBAbWFya2Vyc0NvbnRhaW5lci5maW5kKCcucGxhbml0LW1hcmtlcicpXG5cbiAgZHJhZ2dpbmdNYXJrZXI6IC0+XG4gICAgQG1hcmtlcnNDb250YWluZXIuZmluZCgnLnBsYW5pdC1tYXJrZXIuaXMtZHJhZ2dpbmcnKVxuXG4gIGxhc3RNYXJrZXI6IC0+XG4gICAgQG1hcmtlcnMoKS5sYXN0KClcblxuY2xhc3MgUGxhbml0Lk1hcmtlci5DcmVhdG9yXG5cbiAgY29uc3RydWN0b3I6IChAb3B0aW9ucykgLT5cbiAgICAjIFNldCBPcHRpb25zXG4gICAgQGNvbnRhaW5lciA9IEBvcHRpb25zLmNvbnRhaW5lclxuICAgIEBtYXJrZXJzQ29udGFpbmVyID0gQGNvbnRhaW5lci5maW5kKFwiLiN7UGxhbml0Lm1hcmtlckNvbnRhaW5lckNsYXNzfVwiKS5maXJzdCgpXG4gICAgdW5sZXNzIEBvcHRpb25zLmlkXG4gICAgICBAb3B0aW9ucy5pZCA9IFBsYW5pdC5yYW5kb21TdHJpbmcoMjApXG5cbiAgICAjIEFkZCBNYXJrZXJcbiAgICBpZiBAb3B0aW9ucy5jb2xvciB0aGVuIGNvbG9yID0gQG9wdGlvbnMuY29sb3IgZWxzZSBjb2xvciA9ICcjRkM1QjNGJ1xuXG4gICAgbGVmdCA9ICgocGFyc2VGbG9hdChAb3B0aW9ucy5jb29yZHNbMF0pIC8gMTAwKSAqIEBjb250YWluZXIud2lkdGgoKSkgLSAxNVxuICAgIHRvcCA9ICgocGFyc2VGbG9hdChAb3B0aW9ucy5jb29yZHNbMV0pIC8gMTAwKSAqIEBjb250YWluZXIuaGVpZ2h0KCkpIC0gMTVcbiAgICBAbWFya2Vyc0NvbnRhaW5lci5hcHBlbmQoXG4gICAgICAkKCc8ZGl2PjxkaXYgY2xhc3M9XCJwbGFuaXQtbWFya2VyLWNvbnRlbnRcIj48L2Rpdj48L2Rpdj4nKVxuICAgICAgICAuYWRkQ2xhc3MoJ3BsYW5pdC1tYXJrZXInKVxuICAgICAgICAuYXR0cignZGF0YS1tYXJrZXInLCBAb3B0aW9ucy5pZClcbiAgICAgICAgLmNzc1xuICAgICAgICAgIGxlZnQ6IFwiI3tsZWZ0fXB4XCJcbiAgICAgICAgICB0b3A6IFwiI3t0b3B9cHhcIlxuICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogY29sb3JcbiAgICApXG5cbiAgICAjIEJpbmQgRXZlbnRzIChpbiBhIHNlcGFyYXRlIGNsYXNzKVxuICAgIG5ldyBQbGFuaXQuTWFya2VyLkV2ZW50cyhAb3B0aW9ucylcblxuICAgICMgUmV0dXJuIGEgbmV3IGluc3RhbmNlIG9mIHRoaXMgbWFya2VyXG4gICAgbmV3IFBsYW5pdC5NYXJrZXIoQGNvbnRhaW5lciwgQG9wdGlvbnMuaWQpXG4iXX0=