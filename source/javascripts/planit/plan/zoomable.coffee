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
    # @imagePosition.scale = 1 if @imagePosition.scale < 1
    # @imagePosition.leftPx = 0 if @imagePosition.leftPx > 0
    # @imagePosition.topPx = 0 if @imagePosition.topPx > 0
    # unless @hasRightOffset()
    #   @imagePosition.leftPx = - (@imgWidth() - @containerWidth())
    # console.log "#{@imagePosition.leftPx} :: #{@imagePosition.topPx}"
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

  # ---------- Image Width

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

  # ---------- Left / Right

  imgOffsetLeft: =>
    Math.abs(
      parseFloat(@markersContainer.css('backgroundPosition').split(' ')[0])
    )

  # hasRightOffset: =>
  #   (@imgWidth() - @imgOffsetLeft()) > @containerWidth()

  # ---------- Height

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

  # ---------- Top / Bottom

  imgOffsetTop: =>
    Math.abs(
      parseFloat(@markersContainer.css('backgroundPosition').split(' ')[1])
    )

  hasBottomOffset: =>
    (@imgHeight() - @imgOffsetTop()) > @containerHeight()

  # ---------- Other

  getEventContainerPosition: (e) =>
    left: (e.pageX - @container.offset().left) / @containerWidth()
    top:  (e.pageY - @container.offset().top) / @containerHeight()

  # ------------------------------------------ Events

  dblclick: (e) =>
    if $(e.target).attr('data-zoom-id') == @zoomId
      click = @getEventContainerPosition(e)
      @zoomIn('click', click.left, click.top)

  scroll: (e) =>
    # only run any of this if we aren't dragging a marker
    unless $('div.planit-marker.is-dragging').length > 0
      e.preventDefault()
      # init scroll refs the first time this event is fired
      unless @scrollTime
        @setScrollTime()
        @setScrollPoint(e)
      # difference between now and when scrollTime was last
      # updated
      scrollDiff = Date.now() - @scrollTime
      # we reset the scroll reference point if it's been long
      # enough that we determine a "new scroll" has begun
      if scrollDiff > 100
        @setScrollTime()
        @setScrollPoint(e)
        @scrollZoom(e)
      # otherwise, we set a buffer so the zoom can only
      # happen every so often
      else if scrollDiff > 25
        @setScrollTime()
        @scrollZoom(e)

  setScrollTime: =>
    @scrollTime = Date.now()

  setScrollPoint: (e) =>
    @scrollPosition = @getEventContainerPosition(e)

  scrollZoom: (e) =>
    if e.originalEvent.deltaY > 0 && @imagePosition.scale > 1
      @zoomOut('scroll', @scrollPosition.left, @scrollPosition.top)
    else if e.originalEvent.deltaY < 0
      @zoomIn('scroll', @scrollPosition.left, @scrollPosition.top)

  # ------------------------------------------ Zooming

  zoomIn: (type, left = 0.5, top = 0.5) =>
    if type == 'click'
      @imagePosition.scale  = @imagePosition.scale + @imagePosition.clickIncrement
      @imagePosition.leftPx = - @imgOffsetLeft() - (left * @imgWidthClickIncrement())
      @imagePosition.topPx  = - @imgOffsetTop() - (top * @imgHeightClickIncrement())
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
    else if type == 'scroll'
      @imagePosition.scale  = @imagePosition.scale - @imagePosition.scrollIncrement
      @imagePosition.leftPx = - @imgOffsetLeft() + (left * @imgWidthScrollIncrement())
      console.log @imagePosition.leftPx
      # console.log @imagePosition.leftPx
      # console.log "#{@imagePosition.leftPx} > 0 :: #{@imagePosition.leftPx > 0}"
      if @imagePosition.leftPx > 0
        @imagePosition.leftPx = 0
      else if (@imgWidth() - Math.abs(@imagePosition.leftPx)) < @containerWidth()
        @imagePosition.leftPx = - @imgOffsetLeft() + @imgWidthScrollIncrement()
      console.log @imagePosition.leftPx
      @imagePosition.topPx = - @imgOffsetTop() + (left * @imgHeightScrollIncrement())
      if @imagePosition.topPx > 0
        @imagePosition.topPx = 0
      else if (@imgHeight() - Math.abs(@imagePosition.topPx)) < @containerHeight()
        @imagePosition.topPx = - @imgOffsetTop() + @imgHeightScrollIncrement()
      console.log @imagePosition.leftPx
      console.log '---'
      # console.log "#{@imagePosition.leftPx} :: #{@imagePosition.topPx}"
    @setBackground()