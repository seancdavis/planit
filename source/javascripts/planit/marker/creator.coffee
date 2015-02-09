class Planit.Marker.Creator

  constructor: (@options) ->
    # Set Options
    @container = @options.container
    @markersContainer = @container.find(".#{Planit.markerContainerClass}").first()
    unless @options.id
      @options.id = Planit.randomString(20)

    # Add Marker
    left = parseFloat(@options.coords[0])
    left = left * 100 if left < 1
    top = parseFloat(@options.coords[1])
    top = top * 100 if top < 1
      
    @markersContainer.append(
      $('<div><div class="planit-marker-content"></div></div>')
        .addClass('planit-marker')
        .attr('data-marker', @options.id)
        .css
          left: "#{left}%"
          top: "#{top}%"
    )

    # Bind Events (in a separate class)
    new Planit.Marker.Events(@options)

    # Return a new instance of this marker
    new Planit.Marker(@container, @options.id)
