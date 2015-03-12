class Planit.Plan

  # ------------------------------------------ Setup

  constructor: (@container) ->
    @markersContainer = @container.find(".#{Planit.markerContainerClass}").first()

  # ------------------------------------------ Get All Markers

  getAllMarkers: () =>
    markers = []
    for marker in @markersContainer.find('.planit-marker')
      m = new Planit.Marker(@container, $(marker).attr('data-marker'))
      marker =
        # coords: [m.position().left, m.position().top]
        coords: m.position()
        draggable: m.isDraggable()
        color: m.color()
      marker.infobox = m.infoboxHTML() if m.infoboxHTML()
      markers.push(m)
    markers
