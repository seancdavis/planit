class Planit.Marker.Events

  constructor: (@options) ->

    # Set Options
    @container = @options.container
    @markersContainer = @container.find(".#{Planit.markerContainerClass}")

    # Find Marker
    @marker = @markersContainer.find(
      ".#{Planit.markerClass}[data-marker='#{@options.id}']"
    ).first()
    @markerObj = new Planit.Marker(@container, @options.id)

    # Draggable
    if @options.draggable
      @marker.addClass('draggable')
      @marker.on 'mousedown', (e) =>
        if $(e.target).attr('class') == 'planit-marker-content'
          marker = $(e.target).closest('.planit-marker')
          marker.addClass('is-dragging')
          infoboxID = $(e.target).closest('.planit-marker').attr('data-infobox')
          $("##{infoboxID}").removeClass('active')

    # Infobox
    if @options.infobox
      id = Planit.randomString(16)
      @container.find(".#{Planit.infoboxContainerClass}").append """
        <div class="planit-infobox" id="info-#{id}">#{@options.infobox}</div>
          """
      @marker.attr('data-infobox', "info-#{id}")
      @markerObj.positionInfobox()
      @marker.on 'mouseleave', (e) =>
        marker = $(e.target).closest('.planit-marker')
        infobox = $("##{marker.attr('data-infobox')}")
        infobox.removeClass('active')
      @marker.on 'mouseover', (e) =>
        marker = $(e.target).closest('.planit-marker')
        infobox = $("##{marker.attr('data-infobox')}")
        if marker.hasClass('is-dragging') || @draggingMarker().length > 0
          infobox.removeClass('active')
        else
          infobox.addClass('active')

  markers: ->
    @markersContainer.find('.planit-marker')

  draggingMarker: ->
    @markersContainer.find('.planit-marker.is-dragging')

  # lastMarker: ->
  #   @markers().last()
