class Planit.Plan.Zoomable

  # ------------------------------------------ Setup

  constructor: (@options) ->
    # default options
    @container = @options.container
    @markersContainer = @container.find(".#{Planit.markerContainerClass}")
    @zoomId = Planit.randomString()
    @markersContainer.attr('data-zoom-id', @zoomId)
    # bind draggable events
    $(@container).on('dblclick', @dblclick)
    $(@container).on('mousewheel', @scroll)
    # set initial background coordinates
    @imagePosition =
      leftPx:         0
      topPx:          0
      width:          @markersContainer.width()
      height:         @markersContainer.height()
      scale:          1
      clickIncrement: 0.5
      scrollIncrement:  0.1
    @setBackground()

  # ------------------------------------------ Actions

  setBackground: =>
    @imagePosition.scale = 1 if @imagePosition.scale < 1
    @imagePosition.leftPx = 0 if @imagePosition.leftPx > 0
    @imagePosition.topPx = 0 if @imagePosition.topPx > 0
    @markersContainer.css
      backgroundPosition: "#{@imagePosition.leftPx}px #{@imagePosition.topPx}px"
      backgroundSize: "#{@imagePosition.scale * 100.0}%"
    @setMarkers()

  setMarkers: =>
    markers = $('div.planit-marker')
    if markers.length > 0
      for marker in markers
        left = (@imgWidth() * ($(marker).attr('data-xPc') / 100)) - @imgOffsetLeft() - 
          ($(marker).outerWidth() / 2)
        top = (@imgHeight() * ($(marker).attr('data-yPc') / 100)) - @imgOffsetTop() - 
          ($(marker).outerHeight() / 2)
        $(marker).css
          left: "#{left}px"
          top: "#{top}px"

  # ------------------------------------------ Calculations

  imgWidth: =>
    parseFloat(@imagePosition.width * @imagePosition.scale)

  tmpImgWidth: =>
    (1 + @imagePosition.clickIncrement) * @imagePosition.width()

  imgWidthClickIncrement: =>
    parseFloat(@imagePosition.width * @imagePosition.clickIncrement)

  imgWidthScrollIncrement: =>
    parseFloat(@imagePosition.width * @imagePosition.scrollIncrement)

  containerWidth: =>
    parseFloat(@markersContainer.width())

  imgOffsetLeft: =>
    Math.abs(
      parseFloat(@markersContainer.css('backgroundPosition').split(' ')[0])
    )

  imgHeight: =>
    parseFloat(@imagePosition.height * @imagePosition.scale)

  tmpImgHeight: =>
    (1 + @imagePosition.clickIncrement) * @imagePosition.height()

  imgHeightClickIncrement: =>
    parseFloat(@imagePosition.height * @imagePosition.clickIncrement)

  imgHeightScrollIncrement: =>
    parseFloat(@imagePosition.height * @imagePosition.scrollIncrement)

  containerHeight: =>
    parseFloat(@markersContainer.height())

  imgOffsetTop: =>
    Math.abs(
      parseFloat(@markersContainer.css('backgroundPosition').split(' ')[1])
    )

  getEventContainerPosition: (e) =>
    left: (e.pageX - @container.offset().left) / @containerWidth()
    top:  (e.pageY - @container.offset().top) / @containerHeight()

  # ------------------------------------------ Events

  dblclick: (e) =>
    if $(e.target).attr('data-zoom-id') == @zoomId
      click = @getEventContainerPosition(e)
      @zoomIn('click', click.left, click.top)

  scroll: (e) =>
    e.preventDefault()
    if !@scrollTime || Date.now() - @scrollTime > 25
      @scrollTime = Date.now()
      if e.originalEvent.deltaY > 0
        zoom = @getEventContainerPosition(e)
        @zoomOut('scroll', zoom.left, zoom.top)
      else if e.originalEvent.deltaY < 0
        zoom = @getEventContainerPosition(e)
        @zoomIn('scroll', zoom.left, zoom.top)

  # ------------------------------------------ Zooming

  zoomIn: (type, left = 0.5, top = 0.5) =>
    if type == 'click'
      @imagePosition.scale  = @imagePosition.scale + @imagePosition.clickIncrement
      @imagePosition.leftPx = - @imgOffsetLeft() - (left * @imgWidthClickIncrement())
      @imagePosition.topPx  = - @imgOffsetTop() - (top * @imgHeightClickIncrement())
      @setBackground()
    else if type == 'scroll'
      @imagePosition.scale  = @imagePosition.scale + @imagePosition.scrollIncrement
      @imagePosition.leftPx = - @imgOffsetLeft() - (left * @imgWidthScrollIncrement())
      @imagePosition.topPx  = - @imgOffsetTop() - (top * @imgHeightScrollIncrement())
      @setBackground()

  zoomOut: (type, left = 0.5, top = 0.5) =>
    if type == 'click'
      @imagePosition.scale  = @imagePosition.scale - @imagePosition.clickIncrement
      @imagePosition.leftPx = - @imgOffsetLeft() + (left * @imgWidthClickIncrement())
      @imagePosition.topPx  = - @imgOffsetTop() + (top * @imgHeightClickIncrement())
      @setBackground()
    else if type == 'scroll'
      @imagePosition.scale  = @imagePosition.scale - @imagePosition.scrollIncrement
      @imagePosition.leftPx = - @imgOffsetLeft() + (left * @imgWidthScrollIncrement())
      @imagePosition.topPx  = - @imgOffsetTop() + (top * @imgHeightScrollIncrement())
      @setBackground()
