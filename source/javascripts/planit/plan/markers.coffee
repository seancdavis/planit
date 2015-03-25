
  # ======================================================== Add A Marker

  # Adds a marker to the plan
  #
  addMarker: (options = {}) =>
    options.plan = @
    marker = Planit.Marker.create(options)
    return marker

  # Returns an array of all Marker objects within the plan
  #
  allMarkers: =>
    markers = []
    for marker in @container.find(".#{Planit.markerClass}")
      markers.push(new Planit.Marker(@, $(marker).attr('data-marker')))
    markers
