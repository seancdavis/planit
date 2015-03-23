class Planit.Plan

  # ------------------------------------------ Setup

  constructor: (@options) ->
    @container = @options.container
    @zoomable = new Planit.Plan.Zoomable(@container)
    @markersContainer = @container.find(".#{Planit.markerContainerClass}").first()

  # ------------------------------------------ Get All Markers

  getMarker: (id) =>
    return new Planit.Marker(@container, id)

  getAllMarkers: () =>
    markers = []
    for marker in @markersContainer.find(".#{Planit.markerClass}")
      m = new Planit.Marker(@container, $(marker).attr('data-marker'))
      marker =
        # coords: [m.position().left, m.position().top]
        coords: m.position()
        draggable: m.isDraggable()
        color: m.color()
      marker.infobox = m.infoboxHTML() if m.infoboxHTML()
      markers.push(m)
    markers

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
