class Planit

  new: (@options) ->
    @options = {} unless @options
    @setOptions()
    @initPlan()
    @initMarkers()

  setOptions: ->
    @setDefaultOptions()
    @container = $("##{@options.container}") if @options.container

  setDefaultOptions: ->
    @container = $('#planit')

  initPlan: ->
    @plan = new Planit.Plan
      container: @container

  initMarkers: ->
    @markers = new Planit.Marker
      plan: @container
    for marker in @options.markers
      @markers.add(marker)

window.planit = new Planit
