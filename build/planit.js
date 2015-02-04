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
      return this.initPlan();
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
      return this.options.container.append("<div class=\"markers-container\"></div>");
    };

    return Plan;

  })();

  Planit.Marker = (function() {
    function Marker() {}

    return Marker;

  })();

  Planit.Coordinates = (function() {
    function Coordinates() {}

    return Coordinates;

  })();

}).call(this);

//# sourceMappingURL=planit.js.map
