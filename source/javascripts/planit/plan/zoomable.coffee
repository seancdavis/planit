class Planit.Plan.Zoomable

  # ------------------------------------------ Setup

  constructor: (@options) ->
    # default options
    @container = @options.container
    @markersContainer = @container.find(".#{Planit.markerContainerClass}")
    @zoomId = Planit.randomString()
    @markersContainer.attr('data-zoom-id', @zoomId)
    # draw the controls dinkus
    @container.prepend """
      <div class="planit-controls">
        <a href="#" class="zoom" data-action="in">+</a>
        <a href="#" class="zoom" data-action="out">-</a>
      </div>
    """
    @container.find(".zoom[data-action='in']").click (e) =>
      e.preventDefault()
      @zoomIn()
    @container.find(".zoom[data-action='out']").click (e) =>
      e.preventDefault()
      @zoomOut()
    # bind draggable events
    @container.on('dblclick', @dblclick)
    @container.on('mousedown', @mousedown)
    $(document).on('mousemove', @mousemove)
    $(document).on('mouseup', @mouseup)
    # set initial background coordinates
    @imagePosition =
      leftPx:         0
      topPx:          0
      width:          @markersContainer.width()
      height:         @markersContainer.height()
      scale:          1
      increment: 0.5
    @setBackground()

  # ------------------------------------------ Actions

  setBackground: =>
    @markersContainer.css
      backgroundPosition: "#{@imagePosition.leftPx}px #{@imagePosition.topPx}px"
      backgroundSize: "#{@imagePosition.scale * 100.0}%"
    @setMarkers()

  setMarkers: =>
    markers = $('div.planit-marker')
    if markers.length > 0
      for marker in markers
        left = (@imgWidth() * ($(marker).attr('data-xPc') / 100)) + 
          @imagePosition.leftPx - ($(marker).outerWidth() / 2)
        top = (@imgHeight() * ($(marker).attr('data-yPc') / 100)) + 
          @imagePosition.topPx - ($(marker).outerHeight() / 2)
        $(marker).css
          left: "#{left}px"
          top: "#{top}px"

  # ------------------------------------------ Calculations

  # ---------- Image Width

  imgWidth: =>
    parseFloat(@imagePosition.width * @imagePosition.scale)

  tmpImgWidth: =>
    (1 + @imagePosition.increment) * @imagePosition.width()

  imgWidthClickIncrement: =>
    parseFloat(@imagePosition.width * @imagePosition.increment)

  imgWidthScrollIncrement: =>
    parseFloat(@imagePosition.width * @imagePosition.scrollIncrement)

  containerWidth: =>
    parseFloat(@markersContainer.width())

  # ---------- Left / Right

  imgOffsetLeft: =>
    Math.abs(
      parseFloat(@markersContainer.css('backgroundPosition').split(' ')[0])
    )

  # ---------- Height

  imgHeight: =>
    parseFloat(@imagePosition.height * @imagePosition.scale)

  tmpImgHeight: =>
    (1 + @imagePosition.increment) * @imagePosition.height()

  imgHeightClickIncrement: =>
    parseFloat(@imagePosition.height * @imagePosition.increment)

  imgHeightScrollIncrement: =>
    parseFloat(@imagePosition.height * @imagePosition.scrollIncrement)

  containerHeight: =>
    parseFloat(@markersContainer.height())

  # ---------- Top / Bottom

  imgOffsetTop: =>
    Math.abs(
      parseFloat(@markersContainer.css('backgroundPosition').split(' ')[1])
    )

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
    if $(e.target).attr('data-zoom-id') == @zoomId
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
      @setBackground()
    true

  mouseup: (e) =>
    @isDragging = false
    true

  # ------------------------------------------ Zooming

  zoomIn: =>
    @imagePosition.scale  = @imagePosition.scale + @imagePosition.increment
    @imagePosition.leftPx = - @imgOffsetLeft() - (@imgWidthClickIncrement() / 2)
    @imagePosition.topPx  = - @imgOffsetTop() - (@imgHeightClickIncrement() / 2)
    @setBackground()

  zoomOut: (left = 0.5, top = 0.5) =>
    if @imagePosition.scale > 1
      @imagePosition.scale  = @imagePosition.scale - @imagePosition.increment
      leftPx = - @imgOffsetLeft() + (@imgWidthClickIncrement() / 2)
      topPx  = - @imgOffsetTop() + (@imgHeightClickIncrement() / 2)
      if leftPx > 0
        @imagePosition.leftPx = 0
      else if leftPx < @containerWidth() - @imgWidth()
        @imagePosition.leftPx = @containerWidth() - @imgWidth()
      if topPx > 0
        @imagePosition.topPx = 0
      else if topPx < @containerHeight() - @imgHeight()
        @imagePosition.topPx = @containerHeight() - @imgHeight()
      @setBackground()
