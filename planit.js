var Planit;

Planit = (function() {
  function Planit() {}

  Planit.prototype["new"] = function(_at_options) {
    this.options = _at_options;
    if (!this.options) {
      this.options = {};
    }
    this.setOptions();
    this.initPlan();
    return this.initMarkers();
  };

  Planit.prototype.setOptions = function() {
    this.setDefaultOptions();
    if (this.options.container) {
      return this.container = $("#" + this.options.container);
    }
  };

  Planit.prototype.setDefaultOptions = function() {
    return this.container = $('#planit');
  };

  Planit.prototype.initPlan = function() {
    return this.plan = new Planit.Plan({
      container: this.container
    });
  };

  Planit.prototype.initMarkers = function() {
    var marker, _i, _len, _ref, _results;
    this.markers = new Planit.Marker({
      plan: this.container
    });
    _ref = this.options.markers;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      marker = _ref[_i];
      _results.push(this.markers.add(marker.coords));
    }
    return _results;
  };

  return Planit;

})();

window.planit = new Planit;

Planit.Plan = (function() {
  function Plan(_at_options) {
    this.options = _at_options;
    this.initContainers();
  }

  Plan.prototype.initContainers = function() {
    this.options.container.addClass('planit-container');
    return this.options.container.append("<div class=\"planit-markers-container\"></div>");
  };

  return Plan;

})();

Planit.Marker = (function() {
  function Marker(_at_options) {
    this.options = _at_options;
    this.setOptions();
  }

  Marker.prototype.setOptions = function() {
    this.plan = this.options.plan;
    return this.markersContainer = this.plan.find('.planit-markers-container');
  };

  Marker.prototype.add = function(coords) {
    return this.markersContainer.append($('<div></div>').addClass('planit-marker').css({
      left: coords[0] + "%",
      top: coords[1] + "%"
    }));
  };

  return Marker;

})();

//# sourceMappingURL=data:application/json;base64,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T0EsR0FBQSxHQUFLLFNBQUMsTUFBRCxHQUFBO1dBQ0gsSUFBQyxDQUFBLGdCQUFnQixDQUFDLE1BQWxCLENBQXlCLENBQUEsQ0FBRyxhQUFILENBQ3ZCLENBQUMsUUFEc0IsQ0FDWixlQURZLENBRXZCLENBQUMsR0FGc0IsQ0FHckI7QUFBQSxNQUFBLElBQUEsRUFBUyxNQUFPLENBQUEsQ0FBQSxDQUFSLEdBQVcsR0FBbkI7QUFBQSxNQUNBLEdBQUEsRUFBUSxNQUFPLENBQUEsQ0FBQSxDQUFSLEdBQVcsR0FEbEI7S0FIcUIsQ0FBekIsRUFERztFQUFBLENBUEwsQ0FBQTs7Z0JBQUE7O0lBeENGLENBQUEiLCJmaWxlIjoicGxhbml0LXRtcC5qcyIsInNvdXJjZVJvb3QiOiIvc291cmNlLyIsInNvdXJjZXNDb250ZW50IjpbImNsYXNzIFBsYW5pdFxuXG4gIG5ldzogKEBvcHRpb25zKSAtPlxuICAgIEBvcHRpb25zID0ge30gdW5sZXNzIEBvcHRpb25zXG4gICAgQHNldE9wdGlvbnMoKVxuICAgIEBpbml0UGxhbigpXG4gICAgQGluaXRNYXJrZXJzKClcblxuICBzZXRPcHRpb25zOiAtPlxuICAgIEBzZXREZWZhdWx0T3B0aW9ucygpXG4gICAgQGNvbnRhaW5lciA9ICQoXCIjI3tAb3B0aW9ucy5jb250YWluZXJ9XCIpIGlmIEBvcHRpb25zLmNvbnRhaW5lclxuXG4gIHNldERlZmF1bHRPcHRpb25zOiAtPlxuICAgIEBjb250YWluZXIgPSAkKCcjcGxhbml0JylcblxuICBpbml0UGxhbjogLT5cbiAgICBAcGxhbiA9IG5ldyBQbGFuaXQuUGxhblxuICAgICAgY29udGFpbmVyOiBAY29udGFpbmVyXG5cbiAgaW5pdE1hcmtlcnM6IC0+XG4gICAgQG1hcmtlcnMgPSBuZXcgUGxhbml0Lk1hcmtlclxuICAgICAgcGxhbjogQGNvbnRhaW5lclxuICAgIGZvciBtYXJrZXIgaW4gQG9wdGlvbnMubWFya2Vyc1xuICAgICAgQG1hcmtlcnMuYWRkKG1hcmtlci5jb29yZHMpXG5cblxud2luZG93LnBsYW5pdCA9IG5ldyBQbGFuaXRcblxuY2xhc3MgUGxhbml0LlBsYW5cblxuICBjb25zdHJ1Y3RvcjogKEBvcHRpb25zKSAtPlxuICAgIEBpbml0Q29udGFpbmVycygpXG5cbiAgaW5pdENvbnRhaW5lcnM6IC0+XG4gICAgQG9wdGlvbnMuY29udGFpbmVyLmFkZENsYXNzKCdwbGFuaXQtY29udGFpbmVyJylcbiAgICBAb3B0aW9ucy5jb250YWluZXIuYXBwZW5kKFwiXCJcIjxkaXYgY2xhc3M9XCJwbGFuaXQtbWFya2Vycy1jb250YWluZXJcIj48L2Rpdj5cIlwiXCIpXG5cblxuY2xhc3MgUGxhbml0Lk1hcmtlclxuXG4gIGNvbnN0cnVjdG9yOiAoQG9wdGlvbnMpIC0+XG4gICAgQHNldE9wdGlvbnMoKVxuXG4gIHNldE9wdGlvbnM6IC0+XG4gICAgQHBsYW4gPSBAb3B0aW9ucy5wbGFuXG4gICAgQG1hcmtlcnNDb250YWluZXIgPSBAcGxhbi5maW5kKCcucGxhbml0LW1hcmtlcnMtY29udGFpbmVyJylcblxuICBhZGQ6IChjb29yZHMpIC0+XG4gICAgQG1hcmtlcnNDb250YWluZXIuYXBwZW5kKCQoJzxkaXY+PC9kaXY+JylcbiAgICAgIC5hZGRDbGFzcygncGxhbml0LW1hcmtlcicpXG4gICAgICAuY3NzKFxuICAgICAgICBsZWZ0OiBcIiN7Y29vcmRzWzBdfSVcIlxuICAgICAgICB0b3A6IFwiI3tjb29yZHNbMV19JVwiXG4gICAgICApXG4gICAgKVxuIl19