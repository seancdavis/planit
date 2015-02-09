class Planit.Marker.Creator

  constructor: (@options) ->
    # Set Options
    @container = @options.container
    @markersContainer = @container.find(".#{Planit.markerContainerClass}").first()
    unless @options.id
      @options.id = Planit.randomString(20)

    # Add Marker
    if @options.color then color = @options.color else color = '#FC5B3F'

    left = ((parseFloat(@options.coords[0]) / 100) * @container.width()) - 15
    top = ((parseFloat(@options.coords[1]) / 100) * @container.height()) - 15
    @markersContainer.append(
      $('<div><div class="planit-marker-content"></div></div>')
        .addClass('planit-marker')
        .attr('data-marker', @options.id)
        .css
          left: "#{left}px"
          top: "#{top}px"
          backgroundColor: color
    )

    # Bind Events (in a separate class)
    new Planit.Marker.Events(@options)

    # Return a new instance of this marker
    new Planit.Marker(@container, @options.id)
