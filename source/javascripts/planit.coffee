class Planit

  new: (@options) ->
    @options = {} unless @options
    @setOptions()
    @initPlan()
    $(window).load(@initMarkers)
    @

  setOptions: ->
    @setDefaultOptions()
    @planOptions.container = $("##{@options.container}") if @options.container
    @planOptions.backgroundImage = @options.backgroundImage if @options.backgroundImage

  setDefaultOptions: ->
    @planOptions =
      container: $('#planit')

  initPlan: ->
    @plan = new Planit.Plan(@planOptions)

  initMarkers: =>
    @markers = new Planit.Marker
      plan: @planOptions.container
    if @options.markers
      for marker in @options.markers
        @markers.add(marker)

  addMarker: (options) =>
    @markers.add(options)

window.planit = new Planit
