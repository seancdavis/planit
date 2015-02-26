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
    # set initial background coordinates
    @imagePosition =
      leftPx:     0
      topPx:      0
      width:      @markersContainer.width()
      height:     @markersContainer.height()
      scale:      1
      increment:  0.1
    @setBackground()

  # ------------------------------------------ Actions

  setBackground: =>
    img = @imagePosition
    console.log img
    @markersContainer.css
      backgroundPosition: "#{img.leftPx}px #{img.topPx}px"
      backgroundSize: "#{img.scale * 100.0}%"

  # ------------------------------------------ Calculations

  imgWidth: =>
    parseFloat(@imagePosition.width * @imagePosition.scale)

  tmpImgWith: =>
    (1 + @imagePosition.increment) * @imagePosition.width()

  imgHeight: =>
    parseFloat(@imagePosition.height * @imagePosition.scale)

  tmpImgHeight: =>
    (1 + @imagePosition.increment) * @imagePosition.height()

  imgOverflowLeft: =>
    Math.abs(
      parseFloat(@markersContainer.css('backgroundPosition').split(' ')[0])
    )

  imgOverflowTop: =>
    Math.abs(
      parseFloat(@markersContainer.css('backgroundPosition').split(' ')[1])
    )

  setOffsetPosition: (e) =>
    img = @imagePosition
    mouseInLeft     = e.pageX - @container.offset().left
    mouseInTop      = e.pageY - @container.offset().top
    # set event position reference
    @offset =
      left: (mouseInLeft + @imgOverflowLeft()) / @imgWidth()
      top:  (mouseInTop + @imgOverflowTop()) / @imgHeight()

  # ------------------------------------------ Events

  dblclick: (e) =>
    if $(e.target).attr('data-zoom-id') == @zoomId
      @setOffsetPosition(e)
      @zoomIn(@offset.left, @offset.top)

  # ------------------------------------------ Zooming

  zoomIn: (left = 0.5, top = 0.5) =>
    increment = 0.1
    @imagePosition.scale = @imagePosition.scale + increment
    bkgLeft = -((left * @imgWidth()) - (left * @markersContainer.width()))
    console.log @tmp
    # console.log @imgOverflowLeft()
    # console.log left
    # overflowLeft = left * @imgWidth()
    # containerLeft = left * @markersContainer.width()
    # console.log overflowLeft - containerLeft
    # console.log '--'
    @imagePosition.leftPx = -((left * @imgWidth()) - (left * @markersContainer.width()))
    @imagePosition.topPx = -((top * @imgHeight()) - (top * @markersContainer.height()))
    @setBackground()
