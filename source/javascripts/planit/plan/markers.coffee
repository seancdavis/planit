
  # ======================================================== Add A Marker

  # Adds a marker to the plan
  #
  addMarker: (options = {}) =>
    options.container = @container
    marker = Planit.Marker.create(options)
    return marker
