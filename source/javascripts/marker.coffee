class Planit.Marker

  constructor: (@options) ->
    @setOptions()
    @bindDraggable()

  setOptions: ->
    @plan = @options.plan
    @markersContainer = @plan.find('.planit-markers-container')

  add: (options) ->
    @markersContainer.append($('<div></div>')
      .addClass('planit-marker')
      .css(
        left: "#{options.coords[0]}%"
        top: "#{options.coords[1]}%"
      )
    )
    if options.draggable
      @lastMarker().addClass('draggable')
      @lastMarker().on('mousedown', @mousedown)

  mousedown: (e) =>
    $(e.target).addClass('is-dragging')

  mouseup: (e) =>
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

  bindDraggable: ->
    $(document).on('mousemove', @mousemove)
    $(document).on('mouseup', @mouseup)

  markers: ->
    @markersContainer.find('.planit-marker')

  draggingMarker: ->
    @markersContainer.find('.planit-marker.is-dragging')

  lastMarker: ->
    @markers().last()
