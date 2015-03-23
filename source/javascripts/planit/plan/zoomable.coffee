
  # ======================================================== Setting Image

  # Zooma the image out all the way and sets the markers
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
        left = (@imgWidth() * ($(marker).attr('data-xPc') / 100)) +
          @imagePosition.leftPx - ($(marker).outerWidth() / 2)
        top = (@imgHeight() * ($(marker).attr('data-yPc') / 100)) +
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
        m = new Planit.Marker(@container, $(marker).attr('data-marker'))
        m.hideInfobox()
        left = (@imgWidth() * ($(marker).attr('data-xPc') / 100)) +
          @imagePosition.leftPx - ($(marker).outerWidth() / 2)
        top = (@imgHeight() * ($(marker).attr('data-yPc') / 100)) +
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
      m = new Planit.Marker(@container, $(marker).attr('data-marker'))
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
    wMin = 50 * (@containerWidth() / x)
    hMin = 50 * (@containerHeight() / y)
    # hides other active infoboxes, but will still show
    # this infobox
    @container.find(".#{Planit.infoboxClass}").removeClass('active')
    # Get our initial position
    @imagePosition.leftPx = - (
      (@imgWidth() * (coords[0] / 100)) - (@containerWidth() / 2)
    )
    @imagePosition.topPx = - (
      (@imgHeight() * (coords[1] / 100)) - (@containerHeight() / 2)
    )
    # keep theoretically making the image bigger until it is
    # large enough to center on our point
    while (@imgWidth() < wMin) || (@imgHeight() < hMin)
      @imagePosition.scale  = @imagePosition.scale + @imagePosition.increment
      @imagePosition.leftPx = - (
        (@imgWidth() * (coords[0] / 100)) - (@containerWidth() / 2)
      )
      @imagePosition.topPx = - (
        (@imgHeight() * (coords[1] / 100)) - (@containerHeight() / 2)
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

  imgWidth: =>
    parseFloat(@imagePosition.width * @imagePosition.scale)

  imgWidthClickIncrement: =>
    parseFloat(@imagePosition.width * @imagePosition.increment)

  imgWidthScrollIncrement: =>
    parseFloat(@imagePosition.width * @imagePosition.scrollIncrement)

  containerWidth: =>
    parseFloat(@markersContainer.width())

  # ---------- Left / Right

  imgOffsetLeft: =>
    Math.abs(parseFloat(@image.css('left')))

  # ---------- Height

  imgHeight: =>
    parseFloat(@imagePosition.height * @imagePosition.scale)

  imgHeightClickIncrement: =>
    parseFloat(@imagePosition.height * @imagePosition.increment)

  imgHeightScrollIncrement: =>
    parseFloat(@imagePosition.height * @imagePosition.scrollIncrement)

  containerHeight: =>
    parseFloat(@markersContainer.height())

  # ---------- Top / Bottom

  imgOffsetTop: =>
    Math.abs(parseFloat(@image.css('top')))

  # ---------- Other

  getEventContainerPosition: (e) =>
    left: (e.pageX - @container.offset().left) / @containerWidth()
    top:  (e.pageY - @container.offset().top) / @containerHeight()

  # ------------------------------------------ Events

  dblclick: (e) =>
    if $(e.target).attr('data-zoom-id') == @zoomId
      click = @getEventContainerPosition(e)
      @zoomIn('click', click.left, click.top)

  mousedown: (e) =>
    if $(e.target).attr('data-zoom-id') == @zoomId && e.which == 1
      @isDragging = true
      coords = @getEventContainerPosition(e)
      @dragCoords =
        pointRef: coords
        imgRef:
          left: 0 - @imgOffsetLeft()
          top: 0 - @imgOffsetTop()
        max:
          right: (coords.left * @containerWidth()) + @imgOffsetLeft()
          left: (coords.left * @containerWidth()) - (@imgWidth() -
                      (@containerWidth() + @imgOffsetLeft()))
          bottom: (coords.top * @containerHeight()) + @imgOffsetTop()
          top: (coords.top * @containerHeight()) - (@imgHeight() -
                      (@containerHeight() + @imgOffsetTop()))
    true

  mousemove: (e) =>
    if @isDragging
      coords = @getEventContainerPosition(e)
      dragLeft = coords.left * @containerWidth()
      dragTop = coords.top * @containerHeight()
      if dragLeft >= @dragCoords.max.left && dragLeft <= @dragCoords.max.right
        left = (coords.left - @dragCoords.pointRef.left) * @containerWidth()
        @imagePosition.leftPx = @dragCoords.imgRef.left + left
      else if dragLeft < @dragCoords.max.left
        @imagePosition.leftPx = @containerWidth() - @imgWidth()
      else if dragLeft > @dragCoords.max.right
        @imagePosition.leftPx = 0
      if dragTop >= @dragCoords.max.top && dragTop <= @dragCoords.max.bottom
        top = (coords.top - @dragCoords.pointRef.top) * @containerHeight()
        @imagePosition.topPx = @dragCoords.imgRef.top + top
      else if dragTop < @dragCoords.max.top
        @imagePosition.topPx = @containerHeight() - @imgHeight()
      else if dragTop > @dragCoords.max.bottom
        @imagePosition.topPx = 0
      setBackground.call(@)
    true

  mouseup: (e) =>
    @isDragging = false
    positionInfoboxes.call(@)
    true

  # ------------------------------------------ Zooming

  zoomIn: =>
    @imagePosition.scale  = @imagePosition.scale + @imagePosition.increment
    @imagePosition.leftPx = - @imgOffsetLeft() - (@imgWidthClickIncrement() / 2)
    @imagePosition.topPx  = - @imgOffsetTop() - (@imgHeightClickIncrement() / 2)
    animateBackground.call(@)

  zoomOut: () =>
    if @imagePosition.scale > 1
      @imagePosition.scale  = @imagePosition.scale - @imagePosition.increment
      leftPx = - @imgOffsetLeft() + (@imgWidthClickIncrement() / 2)
      topPx  = - @imgOffsetTop() + (@imgHeightClickIncrement() / 2)
      if leftPx > 0
        @imagePosition.leftPx = 0
      else if leftPx < @containerWidth() - @imgWidth()
        @imagePosition.leftPx = @containerWidth() - @imgWidth()
      else
        @imagePosition.leftPx = leftPx
      if topPx > 0
        @imagePosition.topPx = 0
      else if topPx < @containerHeight() - @imgHeight()
        @imagePosition.topPx = @containerHeight() - @imgHeight()
      else
        @imagePosition.topPx = topPx
      animateBackground.call(@)
