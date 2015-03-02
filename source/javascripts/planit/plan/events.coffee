class Planit.Plan.Events

  # ------------------------------------------ Setup

  constructor: (@options) ->

    # default options
    @container = @options.container
    @markersContainer = @container.find(".#{Planit.markerContainerClass}")

    # bind draggable events
    $(document).on('mousemove', @mousemove)
    $(document).on('mouseup', @mouseup)

  # ------------------------------------------ Refs

  markers: =>
    @markersContainer.find('.planit-marker')

  draggingMarker: =>
    @markersContainer.find('.planit-marker.is-dragging')

  # ------------------------------------------ Events

  mouseup: (e) =>
    if $(e.target).hasClass('planit-marker-content')
      marker = $(e.target).closest('.planit-marker')
      $("##{marker.attr('data-infobox')}").addClass('active')
    marker = @markersContainer.find('.is-dragging').first()
    if @draggingMarker().length > 0
      m = new Planit.Marker(@container, marker.attr('data-marker'))
      @options.planit.dragEnd(e, m)
      m.savePosition()
      m.positionInfobox()
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
      mouseLeft     = e.pageX - @container.offset().left
      mouseTop      = e.pageY - @container.offset().top
      planRight     = @container.width()
      planBottom    = @container.height()
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
