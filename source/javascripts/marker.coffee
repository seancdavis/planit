class Planit.Marker

  constructor: (@options) ->

    # default options
    @plan = @options.plan
    @markersContainer = @plan.find('.planit-markers-container')

    # bind draggable events
    $(document).on('mousemove', @mousemove)
    $(document).on('mouseup', @mouseup)

    # add marker
    @markersContainer.append(
      $('<div><div class="planit-marker-content"></div></div>')
        .addClass('planit-marker')
        .css
          left: "#{@options.coords[0]}%"
          top: "#{@options.coords[1]}%"
    )
    if @options.draggable
      @lastMarker().addClass('draggable')
      @lastMarker().on('mousedown', @mousedown)
    if @options.infobox
      id = @randomString(16)
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

  mousedown: (e) =>
    marker = $(e.target).closest('.planit-marker')
    marker.addClass('is-dragging')
    infoboxID = $(e.target).closest('.planit-marker').attr('data-infobox')
    $("##{infoboxID}").removeClass('active')

  mouseup: (e) =>
    if $(e.target).hasClass('planit-marker-content')
      marker = $(e.target).closest('.planit-marker')
      $("##{marker.attr('data-infobox')}").addClass('active')
    @draggingMarker().removeClass('is-dragging')

  mousemove: (e) =>
    markers = @markersContainer.find('.planit-marker.is-dragging')
    if markers.length > 0

      # only use first marker in case there are more than
      # one dragging
      # 
      marker = markers.first()

      # calculate positions
      # 
      mouseLeft     = e.pageX - @plan.offset().left
      mouseTop      = e.pageY - @plan.offset().top
      planRight     = @plan.width()
      planBottom    = @plan.height()
      markerLeft    = mouseLeft - (marker.outerWidth() / 2)
      markerTop     = mouseTop - (marker.outerHeight() / 2)
      markerRight   = mouseLeft + (marker.outerWidth() / 2)
      markerBottom  = mouseTop + (marker.outerHeight() / 2)
      markerWidth   = marker.outerWidth()
      markerHeight  = marker.outerHeight()

      # find the left position of the marker based on
      # position of the mouse relative to the plan
      # 
      if markerLeft <= 0
        markerX = 0
      else if markerRight < planRight
        markerX = markerLeft
      else
        markerX = planRight - markerWidth

      # find the left position of the marker based on
      # position of the mouse relative to the plan
      # 
      if markerTop <= 0
        markerY = 0
      else if markerBottom < planBottom
        markerY = markerTop
      else
        markerY = planBottom - markerHeight

      # set the position of the marker
      # 
      marker.css
        left: markerX
        top: markerY

  markers: ->
    @markersContainer.find('.planit-marker')

  draggingMarker: ->
    @markersContainer.find('.planit-marker.is-dragging')

  lastMarker: ->
    @markers().last()

  randomString: (length = 16) ->
    str = Math.random().toString(36).slice(2) 
    str = str + Math.random().toString(36).slice(2)
    str.substring(0, length - 1)
