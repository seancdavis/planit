(function() {
  var Planit;

  Planit = (function() {
    function Planit() {}

    Planit.prototype["new"] = function(options) {
      this.options = options;
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
    function Plan(options) {
      this.options = options;
      this.initContainers();
    }

    Plan.prototype.initContainers = function() {
      this.options.container.addClass('planit-container');
      return this.options.container.append("<div class=\"planit-markers-container\"></div>");
    };

    return Plan;

  })();

  Planit.Marker = (function() {
    function Marker(options) {
      this.options = options;
      this.setOptions();
    }

    Marker.prototype.setOptions = function() {
      this.plan = this.options.plan;
      return this.markersContainer = this.plan.find('.planit-markers-container');
    };

    Marker.prototype.add = function(coords) {
      return this.markersContainer.append($('<div></div>').addClass('planit-marker').css({
        left: "" + coords[0] + "%",
        top: "" + coords[1] + "%"
      }));
    };

    return Marker;

  })();

  Planit.Coordinates = (function() {
    function Coordinates() {}

    return Coordinates;

  })();

}).call(this);

//# sourceMappingURL=planit.js.map
