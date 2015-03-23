class Planit

  # ------------------------------------------ Refs

  @containerClass:        'planit-container'
  @markerContainerClass:  'planit-markers-container'
  @markerContentClass:    'planit-marker-content'
  @markerClass:           'planit-marker'
  @draggingClass:         'is-dragging'
  @infoboxContainerClass: 'planit-infobox-container'
  @infoboxClass:          'planit-infobox'
  @imageContainer:        'planit-image-container'

  # ------------------------------------------ Default Options

  new: (@options = {}) ->
    new Planit.Plan.Creator(@options)

  # ------------------------------------------ Add A Marker

  # ------------------------------------------ Retrieve Data

  getMarker: (id) =>
    new Planit.Marker(@container, id)

  getAllMarkers: () =>
    plan = new Planit.Plan(@container)
    plan.getAllMarkers()

  # ------------------------------------------ Plan Actions

  centerOn: (coords) ->
    @zoomable.centerOn(coords)

  zoomTo: (level) ->
    @zoomable.zoomTo(level)

  resize: (e) =>
    image = @container.find(".#{Planit.imageContainer} > img").first()
    @zoomable.resetImage()
    if image
      @container.height(image.height())
    for marker in @markersContainer.find(".#{Planit.markerClass}")
      m = new Planit.Marker(@container, $(marker).attr('data-marker'))
      m.set()

  # ------------------------------------------ Event Callbacks

  markerDragEnd: (event, marker) =>
    if @options.markerDragEnd
      @options.markerDragEnd(event, marker)

  markerClick: (event, marker) =>
    if @options.markerClick
      @options.markerClick(event, marker)

  canvasClick: (event, coords) =>
    if @options.canvasClick
      @options.canvasClick(event, coords)

  # ------------------------------------------ Class Methods

  @randomString: (length = 16) ->
    str = Math.random().toString(36).slice(2)
    str = str + Math.random().toString(36).slice(2)
    str.substring(0, length - 1)

# set this class to a global `planit` variable
window.planit = new Planit
