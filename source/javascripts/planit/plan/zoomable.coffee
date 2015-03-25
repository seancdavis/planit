
  # ======================================================== Setting Image

  # Zoom the image out all the way and sets the markers
  # appropriately
  #
  resetImage: =>
    @imagePosition =
      leftPx:         0
      topPx:          0
      width:          @image.width()
      height:         @image.height()
      scale:          1
      increment:      0.5
    setBackground.call(@)
    true

  # (private) Moves the background and markers without
  # animation to the location set by the imagePosition
  # property
  #
  setBackground = ->
    @image.css
      left: "#{@imagePosition.leftPx}px"
      top: "#{@imagePosition.topPx}px"
      width: "#{@imagePosition.scale * 100.0}%"
      height: 'auto'
    setMarkers.call(@)

  # (private) Equivalent to setBackground, but with
  # animation
  #
  animateBackground = ->
    @image.animate
      left: "#{@imagePosition.leftPx}px"
      top: "#{@imagePosition.topPx}px"
      width: "#{@imagePosition.scale * 100.0}%"
      height: 'auto'
    , 250
    animateMarkers.call(@)

  # ======================================================== Setting Markers

  # (private) Sets markers in correct location, based on
  # image position
  #
  setMarkers = ->
    markers = @container.find(".#{Planit.markerClass}")
    if markers.length > 0
      for marker in markers
        left = (@calc(imgWidth) * ($(marker).attr('data-xPc') / 100)) +
          @imagePosition.leftPx - ($(marker).outerWidth() / 2)
        top = (@calc(imgHeight) * ($(marker).attr('data-yPc') / 100)) +
          @imagePosition.topPx - ($(marker).outerHeight() / 2)
        $(marker).css
          left: "#{left}px"
          top: "#{top}px"
      positionInfoboxes.call(@)

  # (private) Equivalent to setMarkers, but with animation
  #
  animateMarkers = ->
    markers = @container.find(".#{Planit.markerClass}")
    if markers.length > 0
      for marker in markers
        m = new Planit.Marker(@, $(marker).attr('data-marker'))
        m.hideInfobox()
        left = (@calc(imgWidth) * ($(marker).attr('data-xPc') / 100)) +
          @imagePosition.leftPx - ($(marker).outerWidth() / 2)
        top = (@calc(imgHeight) * ($(marker).attr('data-yPc') / 100)) +
          @imagePosition.topPx - ($(marker).outerHeight() / 2)
        do (m) ->
          $(marker).animate
            left: "#{left}px"
            top: "#{top}px"
          , 250, () =>
            m.positionInfobox()
            m.unhideInfobox()

  # ======================================================== Setting Infoboxes

  # (private) Appropriately position the infobox on every
  # marker, the logic for which is in the Marker class
  #
  positionInfoboxes = ->
    for marker in @container.find(".#{Planit.markerClass}")
      m = new Planit.Marker(@, $(marker).attr('data-marker'))
      m.positionInfobox()
    true

  # ======================================================== Move Actions

  # Will center the image on the given coordinates as [x,y]
  # in floated percentages. Ensures there is enough image on
  # each side by zooming in if necessary.
  #
  centerOn: (coords) =>
    if coords[0] >= 50 then x = 100 - coords[0] else x = coords[0]
    if coords[1] >= 50 then y = 100 - coords[1] else y = coords[1]
    wMin = 50 * (@calc(containerWidth) / x)
    hMin = 50 * (@calc(containerHeight) / y)
    # hides other active infoboxes, but will still show
    # this infobox
    @container.find(".#{Planit.infoboxClass}").removeClass('active')
    # Get our initial position
    @imagePosition.leftPx = - (
      (@calc(imgWidth) * (coords[0] / 100)) - (@calc(containerWidth) / 2)
    )
    @imagePosition.topPx = - (
      (@calc(imgHeight) * (coords[1] / 100)) - (@calc(containerHeight) / 2)
    )
    # keep theoretically making the image bigger until it is
    # large enough to center on our point
    while (@calc(imgWidth) < wMin) || (@calc(imgHeight) < hMin)
      @imagePosition.scale  = @imagePosition.scale + @imagePosition.increment
      @imagePosition.leftPx = - (
        (@calc(imgWidth) * (coords[0] / 100)) - (@calc(containerWidth) / 2)
      )
      @imagePosition.topPx = - (
        (@calc(imgHeight) * (coords[1] / 100)) - (@calc(containerHeight) / 2)
      )
    animateBackground.call(@)
    coords

  # Zooms the image to a specific "level" which is an
  # incremented integer starting at zero
  #
  zoomTo: (level) =>
    i = @imagePosition.increment
    unless ((level * i) + 1) == @imagePosition.scale
      @imagePosition.scale = (level * i) + 1 + i
      @zoomOut()
    level

  # ======================================================== Calculations

  # Method for accessing the private calculation methods
  #
  calc: (method) =>
    method.call(@)

  # (private) Width of the image
  #
  imgWidth = ->
    parseFloat(@imagePosition.width * @imagePosition.scale)

  # (private) The number of pixels added with each zoom level
  #
  imgWidthClickIncrement = ->
    parseFloat(@imagePosition.width * @imagePosition.increment)

  # (private) The width of the container
  #
  containerWidth = ->
    parseFloat(@markersContainer.width())

  # (private) Number of pixels left side of image is from
  # left side of the container
  #
  imgOffsetLeft = ->
    Math.abs(parseFloat(@image.css('left')))

  # (private) Height of the image
  #
  imgHeight = ->
    parseFloat(@imagePosition.height * @imagePosition.scale)

  # (private) The number of pixels added or removed with
  # each zoom level
  #
  imgHeightClickIncrement = ->
    parseFloat(@imagePosition.height * @imagePosition.increment)

  # (private) The height of the container (pixels)
  #
  containerHeight = ->
    parseFloat(@markersContainer.height())

  # (private) The number of pixels the top of the image is
  # from the top of the container
  #
  imgOffsetTop = ->
    Math.abs(parseFloat(@image.css('top')))

  # (private) Coordinates of an event as a percentage of the
  # dimensions of the container, relative to the top left
  # corner of the container
  #
  zEventPosition = (e) ->
    left: (e.pageX - @container.offset().left) / @calc(containerWidth)
    top:  (e.pageY - @container.offset().top) / @calc(containerHeight)

  # ======================================================== Events

  # (private) Listener for double-clicking on the plan
  #
  zDblClick = (e) ->
    if $(e.target).attr('data-zoom-id') == @zoomId
      click = zEventPosition.call(@, e)
      @zoomIn('click', click.left, click.top)

  # (private) Listener for the start of a click on the plan
  #
  zMouseDown = (e) ->
    if $(e.target).attr('data-zoom-id') == @zoomId && e.which == 1
      @isDragging = true
      coords = zEventPosition.call(@, e)
      @dragCoords =
        pointRef: coords
        imgRef:
          left: 0 - @calc(imgOffsetLeft)
          top: 0 - @calc(imgOffsetTop)
        max:
          right: (coords.left * @calc(containerWidth)) + @calc(imgOffsetLeft)
          left: (coords.left * @calc(containerWidth)) - (@calc(imgWidth) -
                      (@calc(containerWidth) + @calc(imgOffsetLeft)))
          bottom: (coords.top * @calc(containerHeight)) + @calc(imgOffsetTop)
          top: (coords.top * @calc(containerHeight)) - (@calc(imgHeight) -
                      (@calc(containerHeight) + @calc(imgOffsetTop)))
    true

  # (private) Listener for when the mouse moves anywhere on
  # the document
  #
  zMouseMove = (e) ->
    if @isDragging
      coords = zEventPosition.call(@, e)
      dragLeft = coords.left * @calc(containerWidth)
      dragTop = coords.top * @calc(containerHeight)
      if dragLeft >= @dragCoords.max.left && dragLeft <= @dragCoords.max.right
        left = (coords.left - @dragCoords.pointRef.left) * @calc(containerWidth)
        @imagePosition.leftPx = @dragCoords.imgRef.left + left
      else if dragLeft < @dragCoords.max.left
        @imagePosition.leftPx = @calc(containerWidth) - @calc(imgWidth)
      else if dragLeft > @dragCoords.max.right
        @imagePosition.leftPx = 0
      if dragTop >= @dragCoords.max.top && dragTop <= @dragCoords.max.bottom
        top = (coords.top - @dragCoords.pointRef.top) * @calc(containerHeight)
        @imagePosition.topPx = @dragCoords.imgRef.top + top
      else if dragTop < @dragCoords.max.top
        @imagePosition.topPx = @calc(containerHeight) - @calc(imgHeight)
      else if dragTop > @dragCoords.max.bottom
        @imagePosition.topPx = 0
      setBackground.call(@)
    true

  # (private) Listener for the end of a click anywhere on
  # the document
  #
  zMouseUp = (e) ->
    @isDragging = false
    positionInfoboxes.call(@)
    true

  # ======================================================== Zooming

  # Takes current zoom position and zooms in to the center
  # one level deeper
  #
  zoomIn: =>
    @imagePosition.scale  = @imagePosition.scale + @imagePosition.increment
    @imagePosition.leftPx = - @calc(imgOffsetLeft) -
      (@calc(imgWidthClickIncrement) / 2)
    @imagePosition.topPx  = - @calc(imgOffsetTop) -
      (@calc(imgHeightClickIncrement) / 2)
    animateBackground.call(@)
    true

  # Zooms out one level. Attempts to zoom out from the
  # center, but will adjust based on available image space.
  #
  zoomOut: () =>
    if @imagePosition.scale > 1
      @imagePosition.scale  = @imagePosition.scale - @imagePosition.increment
      leftPx = - @calc(imgOffsetLeft) + (@calc(imgWidthClickIncrement) / 2)
      topPx  = - @calc(imgOffsetTop) + (@calc(imgHeightClickIncrement) / 2)
      if leftPx > 0
        @imagePosition.leftPx = 0
      else if leftPx < @calc(containerWidth) - @calc(imgWidth)
        @imagePosition.leftPx = @calc(containerWidth) - @calc(imgWidth)
      else
        @imagePosition.leftPx = leftPx
      if topPx > 0
        @imagePosition.topPx = 0
      else if topPx < @calc(containerHeight) - @calc(imgHeight)
        @imagePosition.topPx = @calc(containerHeight) - @calc(imgHeight)
      else
        @imagePosition.topPx = topPx
      animateBackground.call(@)
      true
    else
      false
