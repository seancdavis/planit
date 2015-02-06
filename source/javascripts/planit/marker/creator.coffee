class Planit.Marker.Creator

  constructor: (@options) ->
    # Set Options
    @container = @options.container
    @markersContainer = @container.find(".#{Planit.markerContainerClass}").first()
    unless @options.id
      @options.id = Planit.randomString(20)

    # Add Marker
    @markersContainer.append(
      $('<div><div class="planit-marker-content"></div></div>')
        .addClass('planit-marker')
        .attr('data-marker', @options.id)
        .css
          left: "#{@options.coords[0]}%"
          top: "#{@options.coords[1]}%"
    )

    # Bind Events (in a separate class)
    new Planit.Marker.Events(@options)

    # Return a new instance of this marker
    new Planit.Marker(@container, @options.id)
