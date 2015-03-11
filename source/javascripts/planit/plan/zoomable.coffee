class Planit.Plan.Zoomable

  # ------------------------------------------ Setup

  constructor: (@options) ->
    # default options
    @container = @options.container
    @markersContainer = @container.find(".#{Planit.markerContainerClass}")
    @image = @container.find('img').first()
    @zoomId = Planit.randomString()
    @markersContainer.attr('data-zoom-id', @zoomId)
    # set initial background coordinates
    @imagePosition =
      leftPx:         0
      topPx:          0
      width:          @image.width()
      height:         @image.height()
      scale:          1
      increment: 0.5
    @setBackground()

  # this only gets run if the user specifies zoomable --
  # otherwise we at least have the class initialized
  #
  new: =>
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

  # ------------------------------------------ Actions

  setBackground: =>
    @image.css
      left: "#{@imagePosition.leftPx}px"
      top: "#{@imagePosition.topPx}px"
      width: "#{@imagePosition.scale * 100.0}%"
      height: 'auto'
    @setMarkers()

  animateBackground: =>
    @image.animate
      left: "#{@imagePosition.leftPx}px"
      top: "#{@imagePosition.topPx}px"
      width: "#{@imagePosition.scale * 100.0}%"
      height: 'auto'
    , 250
    @animateMarkers()

  setMarkers: =>
    markers = @container.find('div.planit-marker')
    if markers.length > 0
      for marker in markers
        left = (@imgWidth() * ($(marker).attr('data-xPc') / 100)) +
          @imagePosition.leftPx - ($(marker).outerWidth() / 2)
        top = (@imgHeight() * ($(marker).attr('data-yPc') / 100)) +
          @imagePosition.topPx - ($(marker).outerHeight() / 2)
        $(marker).css
          left: "#{left}px"
          top: "#{top}px"
      @positionInfoboxes()

  animateMarkers: =>
    markers = @container.find('div.planit-marker')
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
            m.showInfobox()

  positionInfoboxes: =>
    for marker in @container.find('.planit-marker')
      m = new Planit.Marker(@container, $(marker).attr('data-marker'))
      m.positionInfobox()
    true

  animateInfoboxes: =>
    for marker in @container.find('.planit-marker')
      m = new Planit.Marker(@container, $(marker).attr('data-marker'))
      m.animateInfobox()
    true

  centerOn: (coords) =>
    if coords[0] >= 50 then x = 100 - coords[0] else x = coords[0]
    if coords[1] >= 50 then y = 100 - coords[1] else y = coords[1]
    wMin = 50 * (@containerWidth() / x)
    hMin = 50 * (@containerHeight() / y)
    if (@imgWidth() >= wMin) && (@imgHeight() >= hMin)
      @imagePosition.leftPx = - (
        (@imgWidth() * (coords[0] / 100)) - (@containerWidth() / 2)
      )
      @imagePosition.topPx = - (
        (@imgHeight() * (coords[1] / 100)) - (@containerHeight() / 2)
      )
      @setBackground()
      # hides other active infoboxes, but will still show
      # this infobox
      $('.planit-infobox').removeClass('active')
    else
      @zoomIn()
      @centerOn(coords)

  zoomTo: (level) =>
    i = @imagePosition.increment
    @imagePosition.scale = (level * i) + 1 + i
    @zoomOut()

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
    Math.abs(parseFloat(@image.css('left')))

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
    @positionInfoboxes()
    true

  # ------------------------------------------ Zooming

  zoomIn: =>
    @imagePosition.scale  = @imagePosition.scale + @imagePosition.increment
    @imagePosition.leftPx = - @imgOffsetLeft() - (@imgWidthClickIncrement() / 2)
    @imagePosition.topPx  = - @imgOffsetTop() - (@imgHeightClickIncrement() / 2)
    # @setBackground()
    @animateBackground()

  zoomOut: () =>
    if @imagePosition.scale > 1
      @imagePosition.scale  = @imagePosition.scale - @imagePosition.increment
      leftPx = - @imgOffsetLeft() + (@imgWidthClickIncrement() / 2)
      topPx  = - @imgOffsetTop() + (@imgHeightClickIncrement() / 2)
      if leftPx + @imgWidthClickIncrement() > 0
        @imagePosition.leftPx = 0
      else if leftPx - @imgWidthClickIncrement() < @containerWidth() - @imgWidth()
        @imagePosition.leftPx = @containerWidth() - @imgWidth()
      if topPx + @imgHeightClickIncrement() > 0
        @imagePosition.topPx = 0
      else if topPx - @imgHeightClickIncrement() < @containerHeight() - @imgHeight()
        @imagePosition.topPx = @containerHeight() - @imgHeight()
      # @setBackground()
      @animateBackground()
