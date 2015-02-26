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
    # $(@container).on('mousewheel', $.throttle(250, @scroll))
    # set initial background coordinates
    @imagePosition =
      leftPx:     0
      topPx:      0
      width:      @markersContainer.width()
      height:     @markersContainer.height()
      scale:      1
      increment:  0.5
    @setBackground()

  # ------------------------------------------ Actions

  setBackground: =>
    @markersContainer.css
      backgroundPosition: "#{@imagePosition.leftPx}px #{@imagePosition.topPx}px"
      backgroundSize: "#{@imagePosition.scale * 100.0}%"

  # ------------------------------------------ Calculations

  imgWidth: =>
    parseFloat(@imagePosition.width * @imagePosition.scale)

  tmpImgWidth: =>
    (1 + @imagePosition.increment) * @imagePosition.width()

  imgWidthIncrement: =>
    parseFloat(@imagePosition.width * @imagePosition.increment)

  containerWidth: =>
    parseFloat(@markersContainer.width())

  imgOffsetLeft: =>
    Math.abs(
      parseFloat(@markersContainer.css('backgroundPosition').split(' ')[0])
    )

  imgHeight: =>
    parseFloat(@imagePosition.height * @imagePosition.scale)

  tmpImgHeight: =>
    (1 + @imagePosition.increment) * @imagePosition.height()

  imgHeightIncrement: =>
    parseFloat(@imagePosition.height * @imagePosition.increment)

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
      @zoomIn(click.left, click.top)

  scroll: (e) =>
    e.preventDefault()
    if e.originalEvent.deltaY > 0
      direction = 'out'
    else if e.originalEvent.deltaY < 0
      direction = 'in'
    console.log direction if direction

  # ------------------------------------------ Zooming

  zoomIn: (left = 0.5, top = 0.5) =>
    @imagePosition.scale  = @imagePosition.scale + @imagePosition.increment
    console.log top
    @imagePosition.leftPx = - @imgOffsetLeft() - (left * @imgWidthIncrement())
    @imagePosition.topPx  = - @imgOffsetTop() - (top * @imgHeightIncrement())
    @setBackground()
