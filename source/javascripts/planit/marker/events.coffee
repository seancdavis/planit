class Planit.Marker.Events

  constructor: (@options) ->

    # Set Options
    @container = @options.container
    @markersContainer = @container.find(".#{Planit.markerContainerClass}")

    # Find Marker
    @marker = @markersContainer.find(
      ".#{Planit.markerClass}[data-marker='#{@options.planitID}']"
    ).first()
    @markerObj = new Planit.Marker(@container, @options.planitID)

    # Draggable
    if @options.draggable
      @marker.addClass('draggable')
      @marker.on 'mousedown', (e) =>
        marker = $(e.target).closest('.planit-marker')
        marker.addClass('is-dragging')
        marker.attr
          'data-drag-start-x': e.pageX
          'data-drag-start-y': e.pageY

    # Infobox
    if @options.infobox
      id = Planit.randomString(16)
      @container.find(".#{Planit.infoboxContainerClass}").append """
        <div class="planit-infobox" id="info-#{id}">#{@options.infobox}</div>
          """
      @marker.attr('data-infobox', "info-#{id}")
      @markerObj.positionInfobox()
      @marker.click (e) =>
        if(
          Math.abs(e.pageX - @marker.attr('data-drag-start-x')) < 1 &&
          Math.abs(e.pageY - @marker.attr('data-drag-start-y')) < 1
        )
          marker = $(e.target).closest('.planit-marker')
          $("##{marker.attr('data-infobox')}").toggleClass('active')

  markers: ->
    @markersContainer.find('.planit-marker')

  draggingMarker: ->
    @markersContainer.find('.planit-marker.is-dragging')
