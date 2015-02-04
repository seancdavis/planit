var Planit;

Planit.Coordinates = (function() {
  function Coordinates() {}

  return Coordinates;

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

//# sourceMappingURL=data:application/json;base64,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U0FBQSxHQUFBO0FBQ1gsUUFBQSxnQ0FBQTtBQUFBLElBQUEsSUFBQyxDQUFBLE9BQUQsR0FBZSxJQUFBLE1BQU0sQ0FBQyxNQUFQLENBQ2I7QUFBQSxNQUFBLElBQUEsRUFBTSxJQUFDLENBQUEsU0FBUDtLQURhLENBQWYsQ0FBQTtBQUVBO0FBQUE7U0FBQSwyQ0FBQTt3QkFBQTtBQUNFLG9CQUFBLElBQUMsQ0FBQSxPQUFPLENBQUMsR0FBVCxDQUFhLE1BQU0sQ0FBQyxNQUFwQixFQUFBLENBREY7QUFBQTtvQkFIVztFQUFBLENBakJiLENBQUE7O2dCQUFBOztJQS9CRixDQUFBOztBQUFBLE1BdURNLENBQUMsTUFBUCxHQUFnQixHQUFBLENBQUEsTUF2RGhCLENBQUEiLCJmaWxlIjoicGxhbml0LmpzIiwic291cmNlUm9vdCI6Ii9zb3VyY2UvIiwic291cmNlc0NvbnRlbnQiOlsiY2xhc3MgUGxhbml0LkNvb3JkaW5hdGVzXG5jbGFzcyBQbGFuaXQuTWFya2VyXG5cbiAgY29uc3RydWN0b3I6IChAb3B0aW9ucykgLT5cbiAgICBAc2V0T3B0aW9ucygpXG5cbiAgc2V0T3B0aW9uczogLT5cbiAgICBAcGxhbiA9IEBvcHRpb25zLnBsYW5cbiAgICBAbWFya2Vyc0NvbnRhaW5lciA9IEBwbGFuLmZpbmQoJy5wbGFuaXQtbWFya2Vycy1jb250YWluZXInKVxuXG4gIGFkZDogKGNvb3JkcykgLT5cbiAgICBAbWFya2Vyc0NvbnRhaW5lci5hcHBlbmQoJCgnPGRpdj48L2Rpdj4nKVxuICAgICAgLmFkZENsYXNzKCdwbGFuaXQtbWFya2VyJylcbiAgICAgIC5jc3MoXG4gICAgICAgIGxlZnQ6IFwiI3tjb29yZHNbMF19JVwiXG4gICAgICAgIHRvcDogXCIje2Nvb3Jkc1sxXX0lXCJcbiAgICAgIClcbiAgICApXG5cbmNsYXNzIFBsYW5pdC5QbGFuXG5cbiAgY29uc3RydWN0b3I6IChAb3B0aW9ucykgLT5cbiAgICBAaW5pdENvbnRhaW5lcnMoKVxuXG4gIGluaXRDb250YWluZXJzOiAtPlxuICAgIEBvcHRpb25zLmNvbnRhaW5lci5hZGRDbGFzcygncGxhbml0LWNvbnRhaW5lcicpXG4gICAgQG9wdGlvbnMuY29udGFpbmVyLmFwcGVuZChcIlwiXCI8ZGl2IGNsYXNzPVwicGxhbml0LW1hcmtlcnMtY29udGFpbmVyXCI+PC9kaXY+XCJcIlwiKVxuXG5cbmNsYXNzIFBsYW5pdFxuXG4gIG5ldzogKEBvcHRpb25zKSAtPlxuICAgIEBvcHRpb25zID0ge30gdW5sZXNzIEBvcHRpb25zXG4gICAgQHNldE9wdGlvbnMoKVxuICAgIEBpbml0UGxhbigpXG4gICAgQGluaXRNYXJrZXJzKClcblxuICBzZXRPcHRpb25zOiAtPlxuICAgIEBzZXREZWZhdWx0T3B0aW9ucygpXG4gICAgQGNvbnRhaW5lciA9ICQoXCIjI3tAb3B0aW9ucy5jb250YWluZXJ9XCIpIGlmIEBvcHRpb25zLmNvbnRhaW5lclxuXG4gIHNldERlZmF1bHRPcHRpb25zOiAtPlxuICAgIEBjb250YWluZXIgPSAkKCcjcGxhbml0JylcblxuICBpbml0UGxhbjogLT5cbiAgICBAcGxhbiA9IG5ldyBQbGFuaXQuUGxhblxuICAgICAgY29udGFpbmVyOiBAY29udGFpbmVyXG5cbiAgaW5pdE1hcmtlcnM6IC0+XG4gICAgQG1hcmtlcnMgPSBuZXcgUGxhbml0Lk1hcmtlclxuICAgICAgcGxhbjogQGNvbnRhaW5lclxuICAgIGZvciBtYXJrZXIgaW4gQG9wdGlvbnMubWFya2Vyc1xuICAgICAgQG1hcmtlcnMuYWRkKG1hcmtlci5jb29yZHMpXG5cblxud2luZG93LnBsYW5pdCA9IG5ldyBQbGFuaXRcbiJdfQ==