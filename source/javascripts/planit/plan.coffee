class Planit.Plan

  # ------------------------------------------ Setup

  constructor: (@container) ->
    @markersContainer = @container.find(".#{Planit.markerContainerClass}").first()

  # ------------------------------------------ Get All Markers

  getAllMarkers: () =>
    markers = []
    for marker in @markersContainer.find('.planit-marker')
      m = $(marker)
      marker =
        coords: [m.position().left, m.position().top]
      info = m.find('.planit-infobox')
      if info.length > 0
        marker.infobox = info.html()
      markers.push(marker)
    markers
