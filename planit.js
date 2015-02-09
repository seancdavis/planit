var Planit,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

Planit = (function() {
  function Planit() {
    this.dragEnd = __bind(this.dragEnd, this);
    this.getAllMarkers = __bind(this.getAllMarkers, this);
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
    if (this.options.backgroundImage) {
      this.container.append("<img src=\"" + this.options.backgroundImage + "\">");
      this.markersContainer.css({
        backgroundImage: "url('" + this.options.backgroundImage + "')"
      });
      $(window).load((function(_this) {
        return function() {
          _this.container.css({
            height: _this.container.find('img').first().height()
          });
          return _this.container.find('img').first().remove();
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
        coords: m.position()
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

Planit.Marker = (function() {
  function Marker(_at_container, id) {
    this.container = _at_container;
    this.infoboxHTML = __bind(this.infoboxHTML, this);
    this.position = __bind(this.position, this);
    this.markersContainer = this.container.find("." + Planit.markerContainerClass);
    this.marker = this.markersContainer.find("." + Planit.markerClass + "[data-marker='" + id + "']").first();
    this;
  }

  Marker.prototype.position = function() {
    var xPc, xPx, yPc, yPx;
    xPx = this.marker.position().left + (this.marker.outerWidth() / 2);
    yPx = this.marker.position().top + (this.marker.outerHeight() / 2);
    xPc = xPx / this.container.width();
    yPc = yPx / this.container.height();
    return [xPc, yPc];
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
          marker = $(e.target).closest('.planit-marker');
          marker.addClass('is-dragging');
          infoboxID = $(e.target).closest('.planit-marker').attr('data-infobox');
          return $("#" + infoboxID).removeClass('active');
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
    this.options = _at_options;
    this.container = this.options.container;
    this.markersContainer = this.container.find("." + Planit.markerContainerClass).first();
    if (!this.options.id) {
      this.options.id = Planit.randomString(20);
    }
    this.markersContainer.append($('<div><div class="planit-marker-content"></div></div>').addClass('planit-marker').attr('data-marker', this.options.id).css({
      left: this.options.coords[0] + "%",
      top: this.options.coords[1] + "%"
    }));
    new Planit.Marker.Events(this.options);
    new Planit.Marker(this.container, this.options.id);
  }

  return Creator;

})();

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInBsYW5pdC10bXAuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLElBQUEsTUFBQTtFQUFBLGtGQUFBOztBQUFBOzs7OztHQUlFOztBQUFBLEVBQUEsTUFBQyxDQUFBLGNBQUQsR0FBeUIsa0JBQXpCLENBQUE7O0FBQUEsRUFDQSxNQUFDLENBQUEsb0JBQUQsR0FBeUIsMEJBRHpCLENBQUE7O0FBQUEsRUFFQSxNQUFDLENBQUEsV0FBRCxHQUF5QixlQUZ6QixDQUFBOztBQUFBLEVBR0EsTUFBQyxDQUFBLGtCQUFELEdBQXlCLHVCQUh6QixDQUFBOztBQUFBLG1CQU9BLE1BQUEsR0FBSyxTQUFDLFdBQUQsR0FBQTtBQUVILElBRkksSUFBQyxDQUFBLGdDQUFELGNBQVcsRUFFZixDQUFBO0FBQUEsSUFBQSxJQUFHLElBQUMsQ0FBQSxPQUFPLENBQUMsU0FBWjtBQUNFLE1BQUEsSUFBQyxDQUFBLE9BQU8sQ0FBQyxTQUFULEdBQXFCLENBQUEsQ0FBRyxHQUFBLEdBQUcsSUFBQyxDQUFBLE9BQU8sQ0FBQyxTQUFmLENBQXJCLENBREY7S0FBQSxNQUFBO0FBR0UsTUFBQSxJQUFDLENBQUEsT0FBTyxDQUFDLFNBQVQsR0FBcUIsQ0FBQSxDQUFHLFNBQUgsQ0FBckIsQ0FIRjtLQUFBO0FBQUEsSUFNQSxJQUFDLENBQUEsT0FBTyxDQUFDLFNBQVMsQ0FBQyxRQUFuQixDQUE2QixrQkFBN0IsQ0FOQSxDQUFBO0FBQUEsSUFPQSxJQUFDLENBQUEsT0FBTyxDQUFDLFNBQVMsQ0FBQyxNQUFuQixDQUE2QixlQUFBLEdBQ2IsTUFBTSxDQUFDLG9CQURNLEdBQ2UsV0FENUMsQ0FQQSxDQUFBO0FBQUEsSUFZQSxJQUFDLENBQUEsU0FBRCxHQUFhLElBQUMsQ0FBQSxPQUFPLENBQUMsU0FadEIsQ0FBQTtBQUFBLElBYUEsSUFBQyxDQUFBLGdCQUFELEdBQW9CLElBQUMsQ0FBQSxTQUFTLENBQUMsSUFBWCxDQUFpQixHQUFBLEdBQUcsTUFBTSxDQUFDLG9CQUEzQixDQUFrRCxDQUFDLEtBQW5ELENBQUEsQ0FicEIsQ0FBQTtBQWdCQSxJQUFBLElBQUcsSUFBQyxDQUFBLE9BQU8sQ0FBQyxlQUFaO0FBQ0UsTUFBQSxJQUFDLENBQUEsU0FBUyxDQUFDLE1BQVgsQ0FBcUIsYUFBQSxHQUFZLElBQUMsQ0FBQSxPQUFPLENBQUMsZUFBckIsR0FBcUMsS0FBMUQsQ0FBQSxDQUFBO0FBQUEsTUFDQSxJQUFDLENBQUEsZ0JBQWdCLENBQUMsR0FBbEIsQ0FDRTtBQUFBLFFBQUEsZUFBQSxFQUFrQixPQUFBLEdBQU8sSUFBQyxDQUFBLE9BQU8sQ0FBQyxlQUFoQixHQUFnQyxJQUFsRDtPQURGLENBREEsQ0FBQTtBQUFBLE1BR0EsQ0FBQSxDQUFFLE1BQUYsQ0FBUyxDQUFDLElBQVYsQ0FBZSxDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQSxHQUFBO0FBQ2IsVUFBQSxLQUFDLENBQUEsU0FBUyxDQUFDLEdBQVgsQ0FDRTtBQUFBLFlBQUEsTUFBQSxFQUFRLEtBQUMsQ0FBQSxTQUFTLENBQUMsSUFBWCxDQUFpQixLQUFqQixDQUFzQixDQUFDLEtBQXZCLENBQUEsQ0FBOEIsQ0FBQyxNQUEvQixDQUFBLENBQVI7V0FERixDQUFBLENBQUE7aUJBRUEsS0FBQyxDQUFBLFNBQVMsQ0FBQyxJQUFYLENBQWlCLEtBQWpCLENBQXNCLENBQUMsS0FBdkIsQ0FBQSxDQUE4QixDQUFDLE1BQS9CLENBQUEsRUFIYTtRQUFBLEVBQUE7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQWYsQ0FIQSxDQURGO0tBaEJBO0FBMEJBLElBQUEsSUFBRyxJQUFDLENBQUEsT0FBTyxDQUFDLE9BQVo7QUFDRSxNQUFBLENBQUEsQ0FBRSxNQUFGLENBQVMsQ0FBQyxJQUFWLENBQWUsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUEsR0FBQTtBQUNiLGNBQUEsZ0NBQUE7QUFBQTtBQUFBO2VBQUEsMkNBQUE7OEJBQUE7QUFBQSwwQkFBQSxLQUFDLENBQUEsU0FBRCxDQUFXLE1BQVgsRUFBQSxDQUFBO0FBQUE7MEJBRGE7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFmLENBQUEsQ0FERjtLQTFCQTtBQUFBLElBK0JJLElBQUEsTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFaLENBQ0Y7QUFBQSxNQUFBLFNBQUEsRUFBVyxJQUFDLENBQUEsU0FBWjtBQUFBLE1BQ0EsTUFBQSxFQUFRLElBRFI7S0FERSxDQS9CSixDQUFBO1dBb0NBLEtBdENHO0VBQUEsQ0FQTCxDQUFBOztBQUFBLG1CQWlEQSxTQUFBLEdBQVcsU0FBQyxPQUFELEdBQUE7QUFDVCxJQUFBLE9BQU8sQ0FBQyxTQUFSLEdBQW9CLElBQUMsQ0FBQSxTQUFyQixDQUFBO1dBQ0ksSUFBQSxNQUFNLENBQUMsTUFBTSxDQUFDLE9BQWQsQ0FBc0IsT0FBdEIsRUFGSztFQUFBLENBakRYLENBQUE7O0FBQUEsbUJBdURBLGFBQUEsR0FBZSxTQUFBLEdBQUE7QUFDYixRQUFBLElBQUE7QUFBQSxJQUFBLElBQUEsR0FBVyxJQUFBLE1BQU0sQ0FBQyxJQUFQLENBQVksSUFBQyxDQUFBLFNBQWIsQ0FBWCxDQUFBO1dBQ0EsSUFBSSxDQUFDLGFBQUwsQ0FBQSxFQUZhO0VBQUEsQ0F2RGYsQ0FBQTs7QUFBQSxtQkE2REEsT0FBQSxHQUFTLFNBQUMsS0FBRCxFQUFRLE1BQVIsR0FBQTtBQUNQLElBQUEsSUFBRyxJQUFDLENBQUEsT0FBTyxDQUFDLE9BQVo7YUFDRSxJQUFDLENBQUEsT0FBTyxDQUFDLE9BQVQsQ0FBaUIsS0FBakIsRUFBd0IsTUFBeEIsRUFERjtLQURPO0VBQUEsQ0E3RFQsQ0FBQTs7QUFBQSxFQW1FQSxNQUFDLENBQUEsWUFBRCxHQUFlLFNBQUMsTUFBRCxHQUFBO0FBQ2IsUUFBQSxHQUFBOztNQURjLFNBQVM7S0FDdkI7QUFBQSxJQUFBLEdBQUEsR0FBTSxJQUFJLENBQUMsTUFBTCxDQUFBLENBQWEsQ0FBQyxRQUFkLENBQXVCLEVBQXZCLENBQTBCLENBQUMsS0FBM0IsQ0FBaUMsQ0FBakMsQ0FBTixDQUFBO0FBQUEsSUFDQSxHQUFBLEdBQU0sR0FBQSxHQUFNLElBQUksQ0FBQyxNQUFMLENBQUEsQ0FBYSxDQUFDLFFBQWQsQ0FBdUIsRUFBdkIsQ0FBMEIsQ0FBQyxLQUEzQixDQUFpQyxDQUFqQyxDQURaLENBQUE7V0FFQSxHQUFHLENBQUMsU0FBSixDQUFjLENBQWQsRUFBaUIsTUFBQSxHQUFTLENBQTFCLEVBSGE7RUFBQSxDQW5FZixDQUFBOztnQkFBQTs7SUFKRixDQUFBOztBQUFBLE1BNkVNLENBQUMsTUFBUCxHQUFnQixHQUFBLENBQUEsTUE3RWhCLENBQUE7O0FBQUEsTUErRVksQ0FBQztBQUlFLEVBQUEsY0FBQyxhQUFELEdBQUE7QUFDWCxJQURZLElBQUMsQ0FBQSxZQUFELGFBQ1osQ0FBQTtBQUFBLHlEQUFBLENBQUE7QUFBQSxJQUFBLElBQUMsQ0FBQSxnQkFBRCxHQUFvQixJQUFDLENBQUEsU0FBUyxDQUFDLElBQVgsQ0FBaUIsR0FBQSxHQUFHLE1BQU0sQ0FBQyxvQkFBM0IsQ0FBa0QsQ0FBQyxLQUFuRCxDQUFBLENBQXBCLENBRFc7RUFBQSxDQUFiOztBQUFBLGlCQUtBLGFBQUEsR0FBZSxTQUFBLEdBQUE7QUFDYixRQUFBLGtDQUFBO0FBQUEsSUFBQSxPQUFBLEdBQVUsRUFBVixDQUFBO0FBQ0E7QUFBQSxTQUFBLDJDQUFBO3dCQUFBO0FBQ0UsTUFBQSxDQUFBLEdBQVEsSUFBQSxNQUFNLENBQUMsTUFBUCxDQUFjLElBQUMsQ0FBQSxTQUFmLEVBQTBCLENBQUEsQ0FBRSxNQUFGLENBQVMsQ0FBQyxJQUFWLENBQWdCLGFBQWhCLENBQTFCLENBQVIsQ0FBQTtBQUFBLE1BQ0EsTUFBQSxHQUVFO0FBQUEsUUFBQSxNQUFBLEVBQVEsQ0FBQyxDQUFDLFFBQUYsQ0FBQSxDQUFSO09BSEYsQ0FBQTtBQUlBLE1BQUEsSUFBb0MsQ0FBQyxDQUFDLFdBQUYsQ0FBQSxDQUFwQztBQUFBLFFBQUEsTUFBTSxDQUFDLE9BQVAsR0FBaUIsQ0FBQyxDQUFDLFdBQUYsQ0FBQSxDQUFqQixDQUFBO09BSkE7QUFBQSxNQUtBLE9BQU8sQ0FBQyxJQUFSLENBQWEsTUFBYixDQUxBLENBREY7QUFBQSxLQURBO1dBUUEsUUFUYTtFQUFBLENBTGYsQ0FBQTs7Y0FBQTs7SUFuRkYsQ0FBQTs7QUFBQSxNQW1HWSxDQUFDLElBQUksQ0FBQztBQUlILEVBQUEsZ0JBQUMsV0FBRCxHQUFBO0FBR1gsSUFIWSxJQUFDLENBQUEsVUFBRCxXQUdaLENBQUE7QUFBQSxpREFBQSxDQUFBO0FBQUEsNkNBQUEsQ0FBQTtBQUFBLG1EQUFBLENBQUE7QUFBQSwyREFBQSxDQUFBO0FBQUEsNkNBQUEsQ0FBQTtBQUFBLElBQUEsSUFBQyxDQUFBLFNBQUQsR0FBYSxJQUFDLENBQUEsT0FBTyxDQUFDLFNBQXRCLENBQUE7QUFBQSxJQUNBLElBQUMsQ0FBQSxnQkFBRCxHQUFvQixJQUFDLENBQUEsU0FBUyxDQUFDLElBQVgsQ0FBaUIsR0FBQSxHQUFHLE1BQU0sQ0FBQyxvQkFBM0IsQ0FEcEIsQ0FBQTtBQUFBLElBSUEsQ0FBQSxDQUFFLFFBQUYsQ0FBVyxDQUFDLEVBQVosQ0FBZ0IsV0FBaEIsRUFBNEIsSUFBQyxDQUFBLFNBQTdCLENBSkEsQ0FBQTtBQUFBLElBS0EsQ0FBQSxDQUFFLFFBQUYsQ0FBVyxDQUFDLEVBQVosQ0FBZ0IsU0FBaEIsRUFBMEIsSUFBQyxDQUFBLE9BQTNCLENBTEEsQ0FIVztFQUFBLENBQWI7O0FBQUEsbUJBWUEsT0FBQSxHQUFTLFNBQUEsR0FBQTtXQUNQLElBQUMsQ0FBQSxnQkFBZ0IsQ0FBQyxJQUFsQixDQUF3QixnQkFBeEIsRUFETztFQUFBLENBWlQsQ0FBQTs7QUFBQSxtQkFlQSxjQUFBLEdBQWdCLFNBQUEsR0FBQTtXQUNkLElBQUMsQ0FBQSxnQkFBZ0IsQ0FBQyxJQUFsQixDQUF3Qiw0QkFBeEIsRUFEYztFQUFBLENBZmhCLENBQUE7O0FBQUEsbUJBa0JBLFVBQUEsR0FBWSxTQUFBLEdBQUE7V0FDVixJQUFDLENBQUEsT0FBRCxDQUFBLENBQVUsQ0FBQyxJQUFYLENBQUEsRUFEVTtFQUFBLENBbEJaLENBQUE7O0FBQUEsbUJBdUJBLE9BQUEsR0FBUyxTQUFDLENBQUQsR0FBQTtBQUNQLFFBQUEsU0FBQTtBQUFBLElBQUEsSUFBRyxDQUFBLENBQUUsQ0FBQyxDQUFDLE1BQUosQ0FBVyxDQUFDLFFBQVosQ0FBc0IsdUJBQXRCLENBQUg7QUFDRSxNQUFBLE1BQUEsR0FBUyxDQUFBLENBQUUsQ0FBQyxDQUFDLE1BQUosQ0FBVyxDQUFDLE9BQVosQ0FBcUIsZ0JBQXJCLENBQVQsQ0FBQTtBQUFBLE1BQ0EsQ0FBQSxDQUFHLEdBQUEsR0FBRSxDQUFDLE1BQU0sQ0FBQyxJQUFQLENBQWEsY0FBYixDQUFELENBQUwsQ0FBb0MsQ0FBQyxRQUFyQyxDQUErQyxRQUEvQyxDQURBLENBREY7S0FBQTtBQUFBLElBR0EsTUFBQSxHQUFTLElBQUMsQ0FBQSxnQkFBZ0IsQ0FBQyxJQUFsQixDQUF3QixjQUF4QixDQUFzQyxDQUFDLEtBQXZDLENBQUEsQ0FIVCxDQUFBO0FBSUEsSUFBQSxJQUFHLElBQUMsQ0FBQSxjQUFELENBQUEsQ0FBaUIsQ0FBQyxNQUFsQixHQUEyQixDQUE5QjtBQUNFLE1BQUEsQ0FBQSxHQUFRLElBQUEsTUFBTSxDQUFDLE1BQVAsQ0FBYyxJQUFDLENBQUEsU0FBZixFQUEwQixNQUFNLENBQUMsSUFBUCxDQUFhLGFBQWIsQ0FBMUIsQ0FBUixDQUFBO0FBQUEsTUFDQSxJQUFDLENBQUEsT0FBTyxDQUFDLE1BQU0sQ0FBQyxPQUFoQixDQUF3QixDQUF4QixFQUEyQixDQUEzQixDQURBLENBQUE7YUFFQSxJQUFDLENBQUEsY0FBRCxDQUFBLENBQWlCLENBQUMsV0FBbEIsQ0FBK0IsYUFBL0IsRUFIRjtLQUxPO0VBQUEsQ0F2QlQsQ0FBQTs7QUFBQSxtQkFpQ0EsU0FBQSxHQUFXLFNBQUMsQ0FBRCxHQUFBO0FBQ1QsUUFBQSwwSkFBQTtBQUFBLElBQUEsT0FBQSxHQUFVLElBQUMsQ0FBQSxnQkFBZ0IsQ0FBQyxJQUFsQixDQUF3Qiw0QkFBeEIsQ0FBVixDQUFBO0FBQ0EsSUFBQSxJQUFHLE9BQU8sQ0FBQyxNQUFSLEdBQWlCLENBQXBCO0FBS0UsTUFBQSxNQUFBLEdBQVMsT0FBTyxDQUFDLEtBQVIsQ0FBQSxDQUFULENBQUE7QUFBQSxNQUlBLFNBQUEsR0FBZ0IsQ0FBQyxDQUFDLEtBQUYsR0FBVSxJQUFDLENBQUEsU0FBUyxDQUFDLE1BQVgsQ0FBQSxDQUFtQixDQUFDLElBSjlDLENBQUE7QUFBQSxNQUtBLFFBQUEsR0FBZ0IsQ0FBQyxDQUFDLEtBQUYsR0FBVSxJQUFDLENBQUEsU0FBUyxDQUFDLE1BQVgsQ0FBQSxDQUFtQixDQUFDLEdBTDlDLENBQUE7QUFBQSxNQU1BLFNBQUEsR0FBZ0IsSUFBQyxDQUFBLFNBQVMsQ0FBQyxLQUFYLENBQUEsQ0FOaEIsQ0FBQTtBQUFBLE1BT0EsVUFBQSxHQUFnQixJQUFDLENBQUEsU0FBUyxDQUFDLE1BQVgsQ0FBQSxDQVBoQixDQUFBO0FBQUEsTUFRQSxVQUFBLEdBQWdCLFNBQUEsR0FBWSxDQUFDLE1BQU0sQ0FBQyxVQUFQLENBQUEsQ0FBQSxHQUFzQixDQUF2QixDQVI1QixDQUFBO0FBQUEsTUFTQSxTQUFBLEdBQWdCLFFBQUEsR0FBVyxDQUFDLE1BQU0sQ0FBQyxXQUFQLENBQUEsQ0FBQSxHQUF1QixDQUF4QixDQVQzQixDQUFBO0FBQUEsTUFVQSxXQUFBLEdBQWdCLFNBQUEsR0FBWSxDQUFDLE1BQU0sQ0FBQyxVQUFQLENBQUEsQ0FBQSxHQUFzQixDQUF2QixDQVY1QixDQUFBO0FBQUEsTUFXQSxZQUFBLEdBQWdCLFFBQUEsR0FBVyxDQUFDLE1BQU0sQ0FBQyxXQUFQLENBQUEsQ0FBQSxHQUF1QixDQUF4QixDQVgzQixDQUFBO0FBQUEsTUFZQSxXQUFBLEdBQWdCLE1BQU0sQ0FBQyxVQUFQLENBQUEsQ0FaaEIsQ0FBQTtBQUFBLE1BYUEsWUFBQSxHQUFnQixNQUFNLENBQUMsV0FBUCxDQUFBLENBYmhCLENBQUE7QUFrQkEsTUFBQSxJQUFHLFVBQUEsSUFBYyxDQUFqQjtBQUNFLFFBQUEsT0FBQSxHQUFVLENBQVYsQ0FERjtPQUFBLE1BRUssSUFBRyxXQUFBLEdBQWMsU0FBakI7QUFDSCxRQUFBLE9BQUEsR0FBVSxVQUFWLENBREc7T0FBQSxNQUFBO0FBR0gsUUFBQSxPQUFBLEdBQVUsU0FBQSxHQUFZLFdBQXRCLENBSEc7T0FwQkw7QUE0QkEsTUFBQSxJQUFHLFNBQUEsSUFBYSxDQUFoQjtBQUNFLFFBQUEsT0FBQSxHQUFVLENBQVYsQ0FERjtPQUFBLE1BRUssSUFBRyxZQUFBLEdBQWUsVUFBbEI7QUFDSCxRQUFBLE9BQUEsR0FBVSxTQUFWLENBREc7T0FBQSxNQUFBO0FBR0gsUUFBQSxPQUFBLEdBQVUsVUFBQSxHQUFhLFlBQXZCLENBSEc7T0E5Qkw7YUFxQ0EsTUFBTSxDQUFDLEdBQVAsQ0FDRTtBQUFBLFFBQUEsSUFBQSxFQUFNLE9BQU47QUFBQSxRQUNBLEdBQUEsRUFBSyxPQURMO09BREYsRUExQ0Y7S0FGUztFQUFBLENBakNYLENBQUE7O2dCQUFBOztJQXZHRixDQUFBOztBQUFBLE1Bd0xZLENBQUM7QUFFRSxFQUFBLGdCQUFDLGFBQUQsRUFBYSxFQUFiLEdBQUE7QUFHWCxJQUhZLElBQUMsQ0FBQSxZQUFELGFBR1osQ0FBQTtBQUFBLHFEQUFBLENBQUE7QUFBQSwrQ0FBQSxDQUFBO0FBQUEsSUFBQSxJQUFDLENBQUEsZ0JBQUQsR0FBb0IsSUFBQyxDQUFBLFNBQVMsQ0FBQyxJQUFYLENBQWlCLEdBQUEsR0FBRyxNQUFNLENBQUMsb0JBQTNCLENBQXBCLENBQUE7QUFBQSxJQUdBLElBQUMsQ0FBQSxNQUFELEdBQVUsSUFBQyxDQUFBLGdCQUFnQixDQUFDLElBQWxCLENBQ1AsR0FBQSxHQUFHLE1BQU0sQ0FBQyxXQUFWLEdBQXNCLGdCQUF0QixHQUFzQyxFQUF0QyxHQUF5QyxJQURsQyxDQUVULENBQUMsS0FGUSxDQUFBLENBSFYsQ0FBQTtBQUFBLElBUUEsSUFSQSxDQUhXO0VBQUEsQ0FBYjs7QUFBQSxtQkFlQSxRQUFBLEdBQVUsU0FBQSxHQUFBO0FBRVIsUUFBQSxrQkFBQTtBQUFBLElBQUEsR0FBQSxHQUFNLElBQUMsQ0FBQSxNQUFNLENBQUMsUUFBUixDQUFBLENBQWtCLENBQUMsSUFBbkIsR0FBMEIsQ0FBQyxJQUFDLENBQUEsTUFBTSxDQUFDLFVBQVIsQ0FBQSxDQUFBLEdBQXVCLENBQXhCLENBQWhDLENBQUE7QUFBQSxJQUNBLEdBQUEsR0FBTSxJQUFDLENBQUEsTUFBTSxDQUFDLFFBQVIsQ0FBQSxDQUFrQixDQUFDLEdBQW5CLEdBQXlCLENBQUMsSUFBQyxDQUFBLE1BQU0sQ0FBQyxXQUFSLENBQUEsQ0FBQSxHQUF3QixDQUF6QixDQUQvQixDQUFBO0FBQUEsSUFFQSxHQUFBLEdBQU0sR0FBQSxHQUFNLElBQUMsQ0FBQSxTQUFTLENBQUMsS0FBWCxDQUFBLENBRlosQ0FBQTtBQUFBLElBR0EsR0FBQSxHQUFNLEdBQUEsR0FBTSxJQUFDLENBQUEsU0FBUyxDQUFDLE1BQVgsQ0FBQSxDQUhaLENBQUE7V0FJQSxDQUFDLEdBQUQsRUFBTSxHQUFOLEVBTlE7RUFBQSxDQWZWLENBQUE7O0FBQUEsbUJBeUJBLFdBQUEsR0FBYSxTQUFBLEdBQUE7QUFDWCxRQUFBLElBQUE7QUFBQSxJQUFBLElBQUEsR0FBTyxJQUFDLENBQUEsTUFBTSxDQUFDLElBQVIsQ0FBYyxpQkFBZCxDQUFQLENBQUE7QUFDQSxJQUFBLElBQUcsSUFBSSxDQUFDLE1BQUwsR0FBYyxDQUFqQjthQUF3QixJQUFJLENBQUMsSUFBTCxDQUFBLEVBQXhCO0tBQUEsTUFBQTthQUF5QyxLQUF6QztLQUZXO0VBQUEsQ0F6QmIsQ0FBQTs7Z0JBQUE7O0lBMUxGLENBQUE7O0FBQUEsTUF1TlksQ0FBQyxNQUFNLENBQUM7QUFFTCxFQUFBLGdCQUFDLFdBQUQsR0FBQTtBQUdYLFFBQUEsV0FBQTtBQUFBLElBSFksSUFBQyxDQUFBLFVBQUQsV0FHWixDQUFBO0FBQUEsSUFBQSxJQUFDLENBQUEsU0FBRCxHQUFhLElBQUMsQ0FBQSxPQUFPLENBQUMsU0FBdEIsQ0FBQTtBQUFBLElBQ0EsSUFBQyxDQUFBLGdCQUFELEdBQW9CLElBQUMsQ0FBQSxTQUFTLENBQUMsSUFBWCxDQUFpQixHQUFBLEdBQUcsTUFBTSxDQUFDLG9CQUEzQixDQURwQixDQUFBO0FBQUEsSUFJQSxJQUFDLENBQUEsTUFBRCxHQUFVLElBQUMsQ0FBQSxnQkFBZ0IsQ0FBQyxJQUFsQixDQUNQLEdBQUEsR0FBRyxNQUFNLENBQUMsV0FBVixHQUFzQixnQkFBdEIsR0FBc0MsSUFBQyxDQUFBLE9BQU8sQ0FBQyxFQUEvQyxHQUFrRCxJQUQzQyxDQUVULENBQUMsS0FGUSxDQUFBLENBSlYsQ0FBQTtBQVNBLElBQUEsSUFBRyxJQUFDLENBQUEsT0FBTyxDQUFDLFNBQVo7QUFDRSxNQUFBLElBQUMsQ0FBQSxVQUFELENBQUEsQ0FBYSxDQUFDLFFBQWQsQ0FBd0IsV0FBeEIsQ0FBQSxDQUFBO0FBQUEsTUFDQSxJQUFDLENBQUEsVUFBRCxDQUFBLENBQWEsQ0FBQyxFQUFkLENBQWtCLFdBQWxCLEVBQThCLENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFDLENBQUQsR0FBQTtBQUM1QixjQUFBLGlCQUFBO0FBQUEsVUFBQSxNQUFBLEdBQVMsQ0FBQSxDQUFFLENBQUMsQ0FBQyxNQUFKLENBQVcsQ0FBQyxPQUFaLENBQXFCLGdCQUFyQixDQUFULENBQUE7QUFBQSxVQUNBLE1BQU0sQ0FBQyxRQUFQLENBQWlCLGFBQWpCLENBREEsQ0FBQTtBQUFBLFVBRUEsU0FBQSxHQUFZLENBQUEsQ0FBRSxDQUFDLENBQUMsTUFBSixDQUFXLENBQUMsT0FBWixDQUFxQixnQkFBckIsQ0FBcUMsQ0FBQyxJQUF0QyxDQUE0QyxjQUE1QyxDQUZaLENBQUE7aUJBR0EsQ0FBQSxDQUFHLEdBQUEsR0FBRyxTQUFOLENBQWtCLENBQUMsV0FBbkIsQ0FBZ0MsUUFBaEMsRUFKNEI7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUE5QixDQURBLENBREY7S0FUQTtBQWtCQSxJQUFBLElBQUcsSUFBQyxDQUFBLE9BQU8sQ0FBQyxPQUFaO0FBQ0UsTUFBQSxFQUFBLEdBQUssTUFBTSxDQUFDLFlBQVAsQ0FBb0IsRUFBcEIsQ0FBTCxDQUFBO0FBQUEsTUFDQSxJQUFDLENBQUEsVUFBRCxDQUFBLENBQWEsQ0FBQyxJQUFkLENBQW9CLHdCQUFwQixDQUE0QyxDQUFDLE1BQTdDLENBQXVELDBDQUFBLEdBQ2QsRUFEYyxHQUNYLEtBRFcsR0FDUCxJQUFDLENBQUEsT0FBTyxDQUFDLE9BREYsR0FDVSxRQURqRSxDQURBLENBQUE7QUFBQSxNQUlBLElBQUMsQ0FBQSxVQUFELENBQUEsQ0FBYSxDQUFDLElBQWQsQ0FBb0IsY0FBcEIsRUFBb0MsT0FBQSxHQUFPLEVBQTNDLENBSkEsQ0FBQTtBQUFBLE1BS0EsT0FBQSxHQUFVLENBQUEsQ0FBRyxHQUFBLEdBQUUsQ0FBQyxJQUFDLENBQUEsVUFBRCxDQUFBLENBQWEsQ0FBQyxJQUFkLENBQW9CLGNBQXBCLENBQUQsQ0FBTCxDQUxWLENBQUE7QUFBQSxNQU1BLE9BQU8sQ0FBQyxHQUFSLENBQ0U7QUFBQSxRQUFBLElBQUEsRUFBTSxDQUFBLENBQUUsT0FBTyxDQUFDLEtBQVIsQ0FBQSxDQUFBLEdBQWtCLENBQW5CLENBQVA7QUFBQSxRQUNBLE1BQUEsRUFBUSxPQUFPLENBQUMsV0FBUixDQUFBLENBQUEsR0FBd0IsQ0FEaEM7T0FERixDQU5BLENBQUE7QUFBQSxNQVNBLElBQUMsQ0FBQSxVQUFELENBQUEsQ0FBYSxDQUFDLEVBQWQsQ0FBa0IsWUFBbEIsRUFBK0IsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUMsQ0FBRCxHQUFBO0FBQzdCLGNBQUEsTUFBQTtBQUFBLFVBQUEsTUFBQSxHQUFTLENBQUEsQ0FBRSxDQUFDLENBQUMsTUFBSixDQUFXLENBQUMsT0FBWixDQUFxQixnQkFBckIsQ0FBVCxDQUFBO0FBQUEsVUFDQSxPQUFBLEdBQVUsQ0FBQSxDQUFHLEdBQUEsR0FBRSxDQUFDLE1BQU0sQ0FBQyxJQUFQLENBQWEsY0FBYixDQUFELENBQUwsQ0FEVixDQUFBO2lCQUVBLE9BQU8sQ0FBQyxXQUFSLENBQXFCLFFBQXJCLEVBSDZCO1FBQUEsRUFBQTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBL0IsQ0FUQSxDQUFBO0FBQUEsTUFhQSxJQUFDLENBQUEsVUFBRCxDQUFBLENBQWEsQ0FBQyxFQUFkLENBQWtCLFdBQWxCLEVBQThCLENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFDLENBQUQsR0FBQTtBQUM1QixjQUFBLE1BQUE7QUFBQSxVQUFBLE1BQUEsR0FBUyxDQUFBLENBQUUsQ0FBQyxDQUFDLE1BQUosQ0FBVyxDQUFDLE9BQVosQ0FBcUIsZ0JBQXJCLENBQVQsQ0FBQTtBQUFBLFVBQ0EsT0FBQSxHQUFVLENBQUEsQ0FBRyxHQUFBLEdBQUUsQ0FBQyxNQUFNLENBQUMsSUFBUCxDQUFhLGNBQWIsQ0FBRCxDQUFMLENBRFYsQ0FBQTtBQUVBLFVBQUEsSUFBRyxNQUFNLENBQUMsUUFBUCxDQUFpQixhQUFqQixDQUFBLElBQWtDLEtBQUMsQ0FBQSxjQUFELENBQUEsQ0FBaUIsQ0FBQyxNQUFsQixHQUEyQixDQUFoRTttQkFDRSxPQUFPLENBQUMsV0FBUixDQUFxQixRQUFyQixFQURGO1dBQUEsTUFBQTttQkFHRSxPQUFPLENBQUMsUUFBUixDQUFrQixRQUFsQixFQUhGO1dBSDRCO1FBQUEsRUFBQTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBOUIsQ0FiQSxDQURGO0tBckJXO0VBQUEsQ0FBYjs7QUFBQSxtQkEyQ0EsT0FBQSxHQUFTLFNBQUEsR0FBQTtXQUNQLElBQUMsQ0FBQSxnQkFBZ0IsQ0FBQyxJQUFsQixDQUF3QixnQkFBeEIsRUFETztFQUFBLENBM0NULENBQUE7O0FBQUEsbUJBOENBLGNBQUEsR0FBZ0IsU0FBQSxHQUFBO1dBQ2QsSUFBQyxDQUFBLGdCQUFnQixDQUFDLElBQWxCLENBQXdCLDRCQUF4QixFQURjO0VBQUEsQ0E5Q2hCLENBQUE7O0FBQUEsbUJBaURBLFVBQUEsR0FBWSxTQUFBLEdBQUE7V0FDVixJQUFDLENBQUEsT0FBRCxDQUFBLENBQVUsQ0FBQyxJQUFYLENBQUEsRUFEVTtFQUFBLENBakRaLENBQUE7O2dCQUFBOztJQXpORixDQUFBOztBQUFBLE1BNlFZLENBQUMsTUFBTSxDQUFDO0FBRUwsRUFBQSxpQkFBQyxXQUFELEdBQUE7QUFFWCxJQUZZLElBQUMsQ0FBQSxVQUFELFdBRVosQ0FBQTtBQUFBLElBQUEsSUFBQyxDQUFBLFNBQUQsR0FBYSxJQUFDLENBQUEsT0FBTyxDQUFDLFNBQXRCLENBQUE7QUFBQSxJQUNBLElBQUMsQ0FBQSxnQkFBRCxHQUFvQixJQUFDLENBQUEsU0FBUyxDQUFDLElBQVgsQ0FBaUIsR0FBQSxHQUFHLE1BQU0sQ0FBQyxvQkFBM0IsQ0FBa0QsQ0FBQyxLQUFuRCxDQUFBLENBRHBCLENBQUE7QUFFQSxJQUFBLElBQUEsQ0FBQSxJQUFRLENBQUEsT0FBTyxDQUFDLEVBQWhCO0FBQ0UsTUFBQSxJQUFDLENBQUEsT0FBTyxDQUFDLEVBQVQsR0FBYyxNQUFNLENBQUMsWUFBUCxDQUFvQixFQUFwQixDQUFkLENBREY7S0FGQTtBQUFBLElBTUEsSUFBQyxDQUFBLGdCQUFnQixDQUFDLE1BQWxCLENBQ0UsQ0FBQSxDQUFHLHNEQUFILENBQ0UsQ0FBQyxRQURILENBQ2EsZUFEYixDQUVFLENBQUMsSUFGSCxDQUVTLGFBRlQsRUFFdUIsSUFBQyxDQUFBLE9BQU8sQ0FBQyxFQUZoQyxDQUdFLENBQUMsR0FISCxDQUlJO0FBQUEsTUFBQSxJQUFBLEVBQVMsSUFBQyxDQUFBLE9BQU8sQ0FBQyxNQUFPLENBQUEsQ0FBQSxDQUFqQixHQUFvQixHQUE1QjtBQUFBLE1BQ0EsR0FBQSxFQUFRLElBQUMsQ0FBQSxPQUFPLENBQUMsTUFBTyxDQUFBLENBQUEsQ0FBakIsR0FBb0IsR0FEM0I7S0FKSixDQURGLENBTkEsQ0FBQTtBQUFBLElBZ0JJLElBQUEsTUFBTSxDQUFDLE1BQU0sQ0FBQyxNQUFkLENBQXFCLElBQUMsQ0FBQSxPQUF0QixDQWhCSixDQUFBO0FBQUEsSUFtQkksSUFBQSxNQUFNLENBQUMsTUFBUCxDQUFjLElBQUMsQ0FBQSxTQUFmLEVBQTBCLElBQUMsQ0FBQSxPQUFPLENBQUMsRUFBbkMsQ0FuQkosQ0FGVztFQUFBLENBQWI7O2lCQUFBOztJQS9RRixDQUFBIiwiZmlsZSI6InBsYW5pdC10bXAuanMiLCJzb3VyY2VSb290IjoiL3NvdXJjZS8iLCJzb3VyY2VzQ29udGVudCI6WyJjbGFzcyBQbGFuaXRcblxuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBSZWZzXG5cbiAgQGNvbnRhaW5lckNsYXNzOiAgICAgICAgJ3BsYW5pdC1jb250YWluZXInXG4gIEBtYXJrZXJDb250YWluZXJDbGFzczogICdwbGFuaXQtbWFya2Vycy1jb250YWluZXInXG4gIEBtYXJrZXJDbGFzczogICAgICAgICAgICdwbGFuaXQtbWFya2VyJ1xuICBAbWFya2VyQ29udGVudENsYXNzOiAgICAncGxhbml0LW1hcmtlci1jb250ZW50J1xuXG4gICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIERlZmF1bHQgT3B0aW9uc1xuXG4gIG5ldzogKEBvcHRpb25zID0ge30pIC0+XG4gICAgIyBTZXQgT3B0aW9uc1xuICAgIGlmIEBvcHRpb25zLmNvbnRhaW5lclxuICAgICAgQG9wdGlvbnMuY29udGFpbmVyID0gJChcIiMje0BvcHRpb25zLmNvbnRhaW5lcn1cIilcbiAgICBlbHNlXG4gICAgICBAb3B0aW9ucy5jb250YWluZXIgPSAkKCcjcGxhbml0JykgXG5cbiAgICAjIEluaXRpYWxpemUgQ29udGFpbmVyXG4gICAgQG9wdGlvbnMuY29udGFpbmVyLmFkZENsYXNzKCdwbGFuaXQtY29udGFpbmVyJylcbiAgICBAb3B0aW9ucy5jb250YWluZXIuYXBwZW5kIFwiXCJcIlxuICAgICAgPGRpdiBjbGFzcz1cIiN7UGxhbml0Lm1hcmtlckNvbnRhaW5lckNsYXNzfVwiPjwvZGl2PlxuICAgICAgICBcIlwiXCJcblxuICAgICMgUmVmc1xuICAgIEBjb250YWluZXIgPSBAb3B0aW9ucy5jb250YWluZXJcbiAgICBAbWFya2Vyc0NvbnRhaW5lciA9IEBjb250YWluZXIuZmluZChcIi4je1BsYW5pdC5tYXJrZXJDb250YWluZXJDbGFzc31cIikuZmlyc3QoKVxuXG4gICAgIyBBZGQgQmFja2dyb3VuZCBJbWFnZSAoaWYgbmVjZXNzYXJ5KVxuICAgIGlmIEBvcHRpb25zLmJhY2tncm91bmRJbWFnZVxuICAgICAgQGNvbnRhaW5lci5hcHBlbmQoXCJcIlwiPGltZyBzcmM9XCIje0BvcHRpb25zLmJhY2tncm91bmRJbWFnZX1cIj5cIlwiXCIpXG4gICAgICBAbWFya2Vyc0NvbnRhaW5lci5jc3NcbiAgICAgICAgYmFja2dyb3VuZEltYWdlOiBcInVybCgnI3tAb3B0aW9ucy5iYWNrZ3JvdW5kSW1hZ2V9JylcIlxuICAgICAgJCh3aW5kb3cpLmxvYWQgPT5cbiAgICAgICAgQGNvbnRhaW5lci5jc3NcbiAgICAgICAgICBoZWlnaHQ6IEBjb250YWluZXIuZmluZCgnaW1nJykuZmlyc3QoKS5oZWlnaHQoKVxuICAgICAgICBAY29udGFpbmVyLmZpbmQoJ2ltZycpLmZpcnN0KCkucmVtb3ZlKClcblxuICAgICMgQWRkIE1hcmtlcnMgKGlmIG5lY2Vzc2FyeSlcbiAgICBpZiBAb3B0aW9ucy5tYXJrZXJzXG4gICAgICAkKHdpbmRvdykubG9hZCAoKSA9PlxuICAgICAgICBAYWRkTWFya2VyKG1hcmtlcikgZm9yIG1hcmtlciBpbiBAb3B0aW9ucy5tYXJrZXJzXG5cbiAgICAjIEJpbmQgRG9jdW1lbnQgRXZlbnRzXG4gICAgbmV3IFBsYW5pdC5QbGFuLkV2ZW50c1xuICAgICAgY29udGFpbmVyOiBAY29udGFpbmVyXG4gICAgICBwbGFuaXQ6IEBcblxuICAgICMgUmV0dXJuIHRoaXMgUGxhbml0IG9iamVjdFxuICAgIEBcblxuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBBZGQgQSBNYXJrZXJcblxuICBhZGRNYXJrZXI6IChvcHRpb25zKSA9PlxuICAgIG9wdGlvbnMuY29udGFpbmVyID0gQGNvbnRhaW5lclxuICAgIG5ldyBQbGFuaXQuTWFya2VyLkNyZWF0b3Iob3B0aW9ucylcblxuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBHZXQgQWxsIE1hcmtlcnNcblxuICBnZXRBbGxNYXJrZXJzOiAoKSA9PlxuICAgIHBsYW4gPSBuZXcgUGxhbml0LlBsYW4oQGNvbnRhaW5lcilcbiAgICBwbGFuLmdldEFsbE1hcmtlcnMoKVxuXG4gICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIEV2ZW50IENhbGxiYWNrc1xuXG4gIGRyYWdFbmQ6IChldmVudCwgbWFya2VyKSA9PlxuICAgIGlmIEBvcHRpb25zLmRyYWdFbmRcbiAgICAgIEBvcHRpb25zLmRyYWdFbmQoZXZlbnQsIG1hcmtlcilcblxuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBDbGFzcyBNZXRob2RzXG5cbiAgQHJhbmRvbVN0cmluZzogKGxlbmd0aCA9IDE2KSAtPlxuICAgIHN0ciA9IE1hdGgucmFuZG9tKCkudG9TdHJpbmcoMzYpLnNsaWNlKDIpIFxuICAgIHN0ciA9IHN0ciArIE1hdGgucmFuZG9tKCkudG9TdHJpbmcoMzYpLnNsaWNlKDIpXG4gICAgc3RyLnN1YnN0cmluZygwLCBsZW5ndGggLSAxKVxuXG4jIHNldCB0aGlzIGNsYXNzIHRvIGEgZ2xvYmFsIGBwbGFuaXRgIHZhcmlhYmxlXG53aW5kb3cucGxhbml0ID0gbmV3IFBsYW5pdFxuXG5jbGFzcyBQbGFuaXQuUGxhblxuXG4gICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIFNldHVwXG5cbiAgY29uc3RydWN0b3I6IChAY29udGFpbmVyKSAtPlxuICAgIEBtYXJrZXJzQ29udGFpbmVyID0gQGNvbnRhaW5lci5maW5kKFwiLiN7UGxhbml0Lm1hcmtlckNvbnRhaW5lckNsYXNzfVwiKS5maXJzdCgpXG5cbiAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gR2V0IEFsbCBNYXJrZXJzXG5cbiAgZ2V0QWxsTWFya2VyczogKCkgPT5cbiAgICBtYXJrZXJzID0gW11cbiAgICBmb3IgbWFya2VyIGluIEBtYXJrZXJzQ29udGFpbmVyLmZpbmQoJy5wbGFuaXQtbWFya2VyJylcbiAgICAgIG0gPSBuZXcgUGxhbml0Lk1hcmtlcihAY29udGFpbmVyLCAkKG1hcmtlcikuYXR0cignZGF0YS1tYXJrZXInKSlcbiAgICAgIG1hcmtlciA9XG4gICAgICAgICMgY29vcmRzOiBbbS5wb3NpdGlvbigpLmxlZnQsIG0ucG9zaXRpb24oKS50b3BdXG4gICAgICAgIGNvb3JkczogbS5wb3NpdGlvbigpXG4gICAgICBtYXJrZXIuaW5mb2JveCA9IG0uaW5mb2JveEhUTUwoKSBpZiBtLmluZm9ib3hIVE1MKClcbiAgICAgIG1hcmtlcnMucHVzaChtYXJrZXIpXG4gICAgbWFya2Vyc1xuXG5jbGFzcyBQbGFuaXQuUGxhbi5FdmVudHNcblxuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBTZXR1cFxuXG4gIGNvbnN0cnVjdG9yOiAoQG9wdGlvbnMpIC0+XG5cbiAgICAjIGRlZmF1bHQgb3B0aW9uc1xuICAgIEBjb250YWluZXIgPSBAb3B0aW9ucy5jb250YWluZXJcbiAgICBAbWFya2Vyc0NvbnRhaW5lciA9IEBjb250YWluZXIuZmluZChcIi4je1BsYW5pdC5tYXJrZXJDb250YWluZXJDbGFzc31cIilcblxuICAgICMgYmluZCBkcmFnZ2FibGUgZXZlbnRzXG4gICAgJChkb2N1bWVudCkub24oJ21vdXNlbW92ZScsIEBtb3VzZW1vdmUpXG4gICAgJChkb2N1bWVudCkub24oJ21vdXNldXAnLCBAbW91c2V1cClcblxuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBSZWZzXG5cbiAgbWFya2VyczogPT5cbiAgICBAbWFya2Vyc0NvbnRhaW5lci5maW5kKCcucGxhbml0LW1hcmtlcicpXG5cbiAgZHJhZ2dpbmdNYXJrZXI6ID0+XG4gICAgQG1hcmtlcnNDb250YWluZXIuZmluZCgnLnBsYW5pdC1tYXJrZXIuaXMtZHJhZ2dpbmcnKVxuXG4gIGxhc3RNYXJrZXI6ID0+XG4gICAgQG1hcmtlcnMoKS5sYXN0KClcblxuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBFdmVudHNcblxuICBtb3VzZXVwOiAoZSkgPT5cbiAgICBpZiAkKGUudGFyZ2V0KS5oYXNDbGFzcygncGxhbml0LW1hcmtlci1jb250ZW50JylcbiAgICAgIG1hcmtlciA9ICQoZS50YXJnZXQpLmNsb3Nlc3QoJy5wbGFuaXQtbWFya2VyJylcbiAgICAgICQoXCIjI3ttYXJrZXIuYXR0cignZGF0YS1pbmZvYm94Jyl9XCIpLmFkZENsYXNzKCdhY3RpdmUnKVxuICAgIG1hcmtlciA9IEBtYXJrZXJzQ29udGFpbmVyLmZpbmQoJy5pcy1kcmFnZ2luZycpLmZpcnN0KClcbiAgICBpZiBAZHJhZ2dpbmdNYXJrZXIoKS5sZW5ndGggPiAwXG4gICAgICBtID0gbmV3IFBsYW5pdC5NYXJrZXIoQGNvbnRhaW5lciwgbWFya2VyLmF0dHIoJ2RhdGEtbWFya2VyJykpXG4gICAgICBAb3B0aW9ucy5wbGFuaXQuZHJhZ0VuZChlLCBtKVxuICAgICAgQGRyYWdnaW5nTWFya2VyKCkucmVtb3ZlQ2xhc3MoJ2lzLWRyYWdnaW5nJylcblxuICBtb3VzZW1vdmU6IChlKSA9PlxuICAgIG1hcmtlcnMgPSBAbWFya2Vyc0NvbnRhaW5lci5maW5kKCcucGxhbml0LW1hcmtlci5pcy1kcmFnZ2luZycpXG4gICAgaWYgbWFya2Vycy5sZW5ndGggPiAwXG5cbiAgICAgICMgb25seSB1c2UgZmlyc3QgbWFya2VyIGluIGNhc2UgdGhlcmUgYXJlIG1vcmUgdGhhblxuICAgICAgIyBvbmUgZHJhZ2dpbmdcbiAgICAgICMgXG4gICAgICBtYXJrZXIgPSBtYXJrZXJzLmZpcnN0KClcblxuICAgICAgIyBjYWxjdWxhdGUgcG9zaXRpb25zXG4gICAgICAjIFxuICAgICAgbW91c2VMZWZ0ICAgICA9IGUucGFnZVggLSBAY29udGFpbmVyLm9mZnNldCgpLmxlZnRcbiAgICAgIG1vdXNlVG9wICAgICAgPSBlLnBhZ2VZIC0gQGNvbnRhaW5lci5vZmZzZXQoKS50b3BcbiAgICAgIHBsYW5SaWdodCAgICAgPSBAY29udGFpbmVyLndpZHRoKClcbiAgICAgIHBsYW5Cb3R0b20gICAgPSBAY29udGFpbmVyLmhlaWdodCgpXG4gICAgICBtYXJrZXJMZWZ0ICAgID0gbW91c2VMZWZ0IC0gKG1hcmtlci5vdXRlcldpZHRoKCkgLyAyKVxuICAgICAgbWFya2VyVG9wICAgICA9IG1vdXNlVG9wIC0gKG1hcmtlci5vdXRlckhlaWdodCgpIC8gMilcbiAgICAgIG1hcmtlclJpZ2h0ICAgPSBtb3VzZUxlZnQgKyAobWFya2VyLm91dGVyV2lkdGgoKSAvIDIpXG4gICAgICBtYXJrZXJCb3R0b20gID0gbW91c2VUb3AgKyAobWFya2VyLm91dGVySGVpZ2h0KCkgLyAyKVxuICAgICAgbWFya2VyV2lkdGggICA9IG1hcmtlci5vdXRlcldpZHRoKClcbiAgICAgIG1hcmtlckhlaWdodCAgPSBtYXJrZXIub3V0ZXJIZWlnaHQoKVxuXG4gICAgICAjIGZpbmQgdGhlIGxlZnQgcG9zaXRpb24gb2YgdGhlIG1hcmtlciBiYXNlZCBvblxuICAgICAgIyBwb3NpdGlvbiBvZiB0aGUgbW91c2UgcmVsYXRpdmUgdG8gdGhlIHBsYW5cbiAgICAgICMgXG4gICAgICBpZiBtYXJrZXJMZWZ0IDw9IDBcbiAgICAgICAgbWFya2VyWCA9IDBcbiAgICAgIGVsc2UgaWYgbWFya2VyUmlnaHQgPCBwbGFuUmlnaHRcbiAgICAgICAgbWFya2VyWCA9IG1hcmtlckxlZnRcbiAgICAgIGVsc2VcbiAgICAgICAgbWFya2VyWCA9IHBsYW5SaWdodCAtIG1hcmtlcldpZHRoXG5cbiAgICAgICMgZmluZCB0aGUgbGVmdCBwb3NpdGlvbiBvZiB0aGUgbWFya2VyIGJhc2VkIG9uXG4gICAgICAjIHBvc2l0aW9uIG9mIHRoZSBtb3VzZSByZWxhdGl2ZSB0byB0aGUgcGxhblxuICAgICAgIyBcbiAgICAgIGlmIG1hcmtlclRvcCA8PSAwXG4gICAgICAgIG1hcmtlclkgPSAwXG4gICAgICBlbHNlIGlmIG1hcmtlckJvdHRvbSA8IHBsYW5Cb3R0b21cbiAgICAgICAgbWFya2VyWSA9IG1hcmtlclRvcFxuICAgICAgZWxzZVxuICAgICAgICBtYXJrZXJZID0gcGxhbkJvdHRvbSAtIG1hcmtlckhlaWdodFxuXG4gICAgICAjIHNldCB0aGUgcG9zaXRpb24gb2YgdGhlIG1hcmtlclxuICAgICAgIyBcbiAgICAgIG1hcmtlci5jc3NcbiAgICAgICAgbGVmdDogbWFya2VyWFxuICAgICAgICB0b3A6IG1hcmtlcllcblxuY2xhc3MgUGxhbml0Lk1hcmtlclxuXG4gIGNvbnN0cnVjdG9yOiAoQGNvbnRhaW5lciwgaWQpIC0+XG5cbiAgICAjIFNldCBPcHRpb25zXG4gICAgQG1hcmtlcnNDb250YWluZXIgPSBAY29udGFpbmVyLmZpbmQoXCIuI3tQbGFuaXQubWFya2VyQ29udGFpbmVyQ2xhc3N9XCIpXG5cbiAgICAjIEZpbmQgTWFya2VyXG4gICAgQG1hcmtlciA9IEBtYXJrZXJzQ29udGFpbmVyLmZpbmQoXG4gICAgICBcIi4je1BsYW5pdC5tYXJrZXJDbGFzc31bZGF0YS1tYXJrZXI9JyN7aWR9J11cIlxuICAgICkuZmlyc3QoKVxuXG4gICAgIyBSZXR1cm4gdGhpc1xuICAgIEBcblxuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBNYXJrZXIgQ2FsY3NcblxuICBwb3NpdGlvbjogPT5cbiAgICAjIGNvbnNvbGUubG9nIEBtYXJrZXIub3V0ZXJXaWR0aCgpIC8gQGNvbnRhaW5lci53aWR0aCgpXG4gICAgeFB4ID0gQG1hcmtlci5wb3NpdGlvbigpLmxlZnQgKyAoQG1hcmtlci5vdXRlcldpZHRoKCkgLyAyKVxuICAgIHlQeCA9IEBtYXJrZXIucG9zaXRpb24oKS50b3AgKyAoQG1hcmtlci5vdXRlckhlaWdodCgpIC8gMilcbiAgICB4UGMgPSB4UHggLyBAY29udGFpbmVyLndpZHRoKClcbiAgICB5UGMgPSB5UHggLyBAY29udGFpbmVyLmhlaWdodCgpXG4gICAgW3hQYywgeVBjXVxuXG4gICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIEluZm9ib3hcblxuICBpbmZvYm94SFRNTDogPT5cbiAgICBpbmZvID0gQG1hcmtlci5maW5kKCcucGxhbml0LWluZm9ib3gnKVxuICAgIGlmIGluZm8ubGVuZ3RoID4gMCB0aGVuIGluZm8uaHRtbCgpIGVsc2UgbnVsbFxuXG5jbGFzcyBQbGFuaXQuTWFya2VyLkV2ZW50c1xuXG4gIGNvbnN0cnVjdG9yOiAoQG9wdGlvbnMpIC0+XG5cbiAgICAjIFNldCBPcHRpb25zXG4gICAgQGNvbnRhaW5lciA9IEBvcHRpb25zLmNvbnRhaW5lclxuICAgIEBtYXJrZXJzQ29udGFpbmVyID0gQGNvbnRhaW5lci5maW5kKFwiLiN7UGxhbml0Lm1hcmtlckNvbnRhaW5lckNsYXNzfVwiKVxuXG4gICAgIyBGaW5kIE1hcmtlclxuICAgIEBtYXJrZXIgPSBAbWFya2Vyc0NvbnRhaW5lci5maW5kKFxuICAgICAgXCIuI3tQbGFuaXQubWFya2VyQ2xhc3N9W2RhdGEtbWFya2VyPScje0BvcHRpb25zLmlkfSddXCJcbiAgICApLmZpcnN0KClcblxuICAgICMgRHJhZ2dhYmxlXG4gICAgaWYgQG9wdGlvbnMuZHJhZ2dhYmxlXG4gICAgICBAbGFzdE1hcmtlcigpLmFkZENsYXNzKCdkcmFnZ2FibGUnKVxuICAgICAgQGxhc3RNYXJrZXIoKS5vbiAnbW91c2Vkb3duJywgKGUpID0+XG4gICAgICAgIG1hcmtlciA9ICQoZS50YXJnZXQpLmNsb3Nlc3QoJy5wbGFuaXQtbWFya2VyJylcbiAgICAgICAgbWFya2VyLmFkZENsYXNzKCdpcy1kcmFnZ2luZycpXG4gICAgICAgIGluZm9ib3hJRCA9ICQoZS50YXJnZXQpLmNsb3Nlc3QoJy5wbGFuaXQtbWFya2VyJykuYXR0cignZGF0YS1pbmZvYm94JylcbiAgICAgICAgJChcIiMje2luZm9ib3hJRH1cIikucmVtb3ZlQ2xhc3MoJ2FjdGl2ZScpXG5cbiAgICAjIEluZm9ib3hcbiAgICBpZiBAb3B0aW9ucy5pbmZvYm94XG4gICAgICBpZCA9IFBsYW5pdC5yYW5kb21TdHJpbmcoMTYpXG4gICAgICBAbGFzdE1hcmtlcigpLmZpbmQoJy5wbGFuaXQtbWFya2VyLWNvbnRlbnQnKS5hcHBlbmQgXCJcIlwiXG4gICAgICAgIDxkaXYgY2xhc3M9XCJwbGFuaXQtaW5mb2JveFwiIGlkPVwiaW5mby0je2lkfVwiPiN7QG9wdGlvbnMuaW5mb2JveH08L2Rpdj5cbiAgICAgICAgICBcIlwiXCJcbiAgICAgIEBsYXN0TWFya2VyKCkuYXR0cignZGF0YS1pbmZvYm94JywgXCJpbmZvLSN7aWR9XCIpXG4gICAgICBpbmZvYm94ID0gJChcIiMje0BsYXN0TWFya2VyKCkuYXR0cignZGF0YS1pbmZvYm94Jyl9XCIpXG4gICAgICBpbmZvYm94LmNzc1xuICAgICAgICBsZWZ0OiAtKGluZm9ib3gud2lkdGgoKSAvIDIpXG4gICAgICAgIGJvdHRvbTogaW5mb2JveC5vdXRlckhlaWdodCgpICsgNVxuICAgICAgQGxhc3RNYXJrZXIoKS5vbiAnbW91c2VsZWF2ZScsIChlKSA9PlxuICAgICAgICBtYXJrZXIgPSAkKGUudGFyZ2V0KS5jbG9zZXN0KCcucGxhbml0LW1hcmtlcicpXG4gICAgICAgIGluZm9ib3ggPSAkKFwiIyN7bWFya2VyLmF0dHIoJ2RhdGEtaW5mb2JveCcpfVwiKVxuICAgICAgICBpbmZvYm94LnJlbW92ZUNsYXNzKCdhY3RpdmUnKVxuICAgICAgQGxhc3RNYXJrZXIoKS5vbiAnbW91c2VvdmVyJywgKGUpID0+XG4gICAgICAgIG1hcmtlciA9ICQoZS50YXJnZXQpLmNsb3Nlc3QoJy5wbGFuaXQtbWFya2VyJylcbiAgICAgICAgaW5mb2JveCA9ICQoXCIjI3ttYXJrZXIuYXR0cignZGF0YS1pbmZvYm94Jyl9XCIpXG4gICAgICAgIGlmIG1hcmtlci5oYXNDbGFzcygnaXMtZHJhZ2dpbmcnKSB8fCBAZHJhZ2dpbmdNYXJrZXIoKS5sZW5ndGggPiAwXG4gICAgICAgICAgaW5mb2JveC5yZW1vdmVDbGFzcygnYWN0aXZlJylcbiAgICAgICAgZWxzZVxuICAgICAgICAgIGluZm9ib3guYWRkQ2xhc3MoJ2FjdGl2ZScpXG5cbiAgbWFya2VyczogLT5cbiAgICBAbWFya2Vyc0NvbnRhaW5lci5maW5kKCcucGxhbml0LW1hcmtlcicpXG5cbiAgZHJhZ2dpbmdNYXJrZXI6IC0+XG4gICAgQG1hcmtlcnNDb250YWluZXIuZmluZCgnLnBsYW5pdC1tYXJrZXIuaXMtZHJhZ2dpbmcnKVxuXG4gIGxhc3RNYXJrZXI6IC0+XG4gICAgQG1hcmtlcnMoKS5sYXN0KClcblxuY2xhc3MgUGxhbml0Lk1hcmtlci5DcmVhdG9yXG5cbiAgY29uc3RydWN0b3I6IChAb3B0aW9ucykgLT5cbiAgICAjIFNldCBPcHRpb25zXG4gICAgQGNvbnRhaW5lciA9IEBvcHRpb25zLmNvbnRhaW5lclxuICAgIEBtYXJrZXJzQ29udGFpbmVyID0gQGNvbnRhaW5lci5maW5kKFwiLiN7UGxhbml0Lm1hcmtlckNvbnRhaW5lckNsYXNzfVwiKS5maXJzdCgpXG4gICAgdW5sZXNzIEBvcHRpb25zLmlkXG4gICAgICBAb3B0aW9ucy5pZCA9IFBsYW5pdC5yYW5kb21TdHJpbmcoMjApXG5cbiAgICAjIEFkZCBNYXJrZXJcbiAgICBAbWFya2Vyc0NvbnRhaW5lci5hcHBlbmQoXG4gICAgICAkKCc8ZGl2PjxkaXYgY2xhc3M9XCJwbGFuaXQtbWFya2VyLWNvbnRlbnRcIj48L2Rpdj48L2Rpdj4nKVxuICAgICAgICAuYWRkQ2xhc3MoJ3BsYW5pdC1tYXJrZXInKVxuICAgICAgICAuYXR0cignZGF0YS1tYXJrZXInLCBAb3B0aW9ucy5pZClcbiAgICAgICAgLmNzc1xuICAgICAgICAgIGxlZnQ6IFwiI3tAb3B0aW9ucy5jb29yZHNbMF19JVwiXG4gICAgICAgICAgdG9wOiBcIiN7QG9wdGlvbnMuY29vcmRzWzFdfSVcIlxuICAgIClcblxuICAgICMgQmluZCBFdmVudHMgKGluIGEgc2VwYXJhdGUgY2xhc3MpXG4gICAgbmV3IFBsYW5pdC5NYXJrZXIuRXZlbnRzKEBvcHRpb25zKVxuXG4gICAgIyBSZXR1cm4gYSBuZXcgaW5zdGFuY2Ugb2YgdGhpcyBtYXJrZXJcbiAgICBuZXcgUGxhbml0Lk1hcmtlcihAY29udGFpbmVyLCBAb3B0aW9ucy5pZClcbiJdfQ==