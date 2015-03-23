class Planit.Plan

  # This calls methods to instantiate a new plan. Found in
  # plan/init.coffee
  #
  constructor: (@options = {}) ->
    method.call(@) for method in initMethods()

  # (private) Methods (in order) needed to instantiate this
  # object
  #
  initMethods = ->
    [initOptions, initContainer, initImage, initCanvasMarkers, initEvents]
