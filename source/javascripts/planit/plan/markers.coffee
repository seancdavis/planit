
  # ======================================================== Add A Marker

  # Adds a marker to the plan
  #
  addMarker: (options) =>
    options.container = @container
    Planit.Marker.create(options)
