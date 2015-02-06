class Planit.Marker.Events

  constructor: (@options) ->

    # Set Options
    @container = @options.container
    @markersContainer = @container.find(".#{Planit.markerContainerClass}")

    # Find Marker
    @marker = @markersContainer.find(
      ".#{Planit.markerClass}[data-marker='#{@options.id}']"
    ).first()

    # Draggable
    if @options.draggable
      @lastMarker().addClass('draggable')
      @lastMarker().on 'mousedown', (e) =>
        marker = $(e.target).closest('.planit-marker')
        marker.addClass('is-dragging')
        infoboxID = $(e.target).closest('.planit-marker').attr('data-infobox')
        $("##{infoboxID}").removeClass('active')

    # Infobox
    if @options.infobox
      id = Planit.randomString(16)
      @lastMarker().find('.planit-marker-content').append """
        <div class="planit-infobox" id="info-#{id}">#{@options.infobox}</div>
          """
      @lastMarker().attr('data-infobox', "info-#{id}")
      infobox = $("##{@lastMarker().attr('data-infobox')}")
      infobox.css
        left: -(infobox.width() / 2)
        bottom: infobox.outerHeight() + 5
      @lastMarker().on 'mouseleave', (e) =>
        marker = $(e.target).closest('.planit-marker')
        infobox = $("##{marker.attr('data-infobox')}")
        infobox.removeClass('active')
      @lastMarker().on 'mouseover', (e) =>
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

  lastMarker: ->
    @markers().last()
