class Planit.Marker

  constructor: (@container, id) ->

    # Set Options
    @markersContainer = @container.find(".#{Planit.markerContainerClass}")

    # Find Marker
    @marker = @markersContainer.find(
      ".#{Planit.markerClass}[data-marker='#{id}']"
    ).first()

    # Return this
    @

  # ------------------------------------------ Calculations

  position: =>
    xPx = @marker.position().left + (@marker.outerWidth() / 2)
    yPx = @marker.position().top + (@marker.outerHeight() / 2)
    if @markersContainer.css('backgroundImage')
      scale = parseInt(@markersContainer.css('backgroundSize')) / 100
      wImg = @container.width() * scale
      hImg = @container.height() * scale
      xImg = parseInt(@markersContainer.css('backgroundPosition').split(' ')[0])
      yImg = parseInt(@markersContainer.css('backgroundPosition').split(' ')[1])
      xPc = ((xPx + Math.abs(xImg)) / wImg) * 100
      yPc = ((yPx + Math.abs(yImg)) / hImg) * 100
    else
      xPc = (xPx / @container.width()) * 100
      yPc = (yPx / @container.height()) * 100
    [xPc, yPc]

  relativePosition: =>
    xPx = @marker.position().left + (@marker.outerWidth() / 2)
    yPx = @marker.position().top + (@marker.outerHeight() / 2)
    xPc = (xPx / @container.width()) * 100
    yPc = (yPx / @container.height()) * 100
    [xPc, yPc]

  # ------------------------------------------ Attributes

  color: =>
    @marker.css('backgroundColor')

  planitID: =>
    @marker.attr('data-marker')

  id: =>
    @marker.attr('data-id')

  # ------------------------------------------ Infobox

  infoboxHTML: =>
    info = @marker.find('.planit-infobox')
    if info.length > 0 then info.html() else null

  positionInfobox: =>
    infobox = $("##{@marker.attr('data-infobox')}")
    markerCenterX = (parseFloat(@relativePosition()[0] / 100) * @container.width())
    markerCenterY = (parseFloat(@relativePosition()[1] / 100) * @container.height())
    iWidth = infobox.outerWidth()
    iHalfWidth = iWidth / 2
    iHeight = infobox.outerHeight()
    iHalfHeight = iHeight / 2
    cWidth = @container.width()
    cHeight = @container.height()
    mWidth = @marker.outerWidth()
    mHalfWidth = mWidth / 2
    mHeight = @marker.outerHeight()
    mHalfHeight = mHeight / 2
    buffer = 5
    switch infobox.attr('data-position')
      when 'top'
        infoLeft = markerCenterX - iHalfWidth
        infoTop = markerCenterY - iHeight - mHalfHeight - buffer
      when 'right'
        infoLeft = markerCenterX + mHalfWidth + buffer
        infoTop = markerCenterY - iHalfHeight
      when 'bottom'
        infoLeft = markerCenterX - iHalfWidth
        infoTop = markerCenterY + mHalfHeight + buffer
      when 'left'
        infoLeft = markerCenterX - iWidth - mHalfWidth - buffer
        infoTop = markerCenterY - iHalfHeight
      when 'top-left'
        infoLeft = markerCenterX - iWidth - mHalfWidth + buffer
        infoTop = markerCenterY - iHeight - mHalfHeight + buffer
      when 'top-right'
        infoLeft = markerCenterX + mHalfWidth - buffer
        infoTop = markerCenterY - iHeight - mHalfHeight + buffer
      when 'bottom-left'
        infoLeft = markerCenterX - iWidth - mHalfWidth + buffer
        infoTop = markerCenterY + mHalfHeight - buffer
      when 'bottom-right'
        infoLeft = markerCenterX + mHalfWidth - buffer
        infoTop = markerCenterY + mHalfHeight - buffer
    infobox.css
      left: infoLeft
      top: infoTop
    @position()

  # ------------------------------------------ Dragging

  isDraggable: =>
    @marker.hasClass('draggable')

  # ------------------------------------------ Actions

  savePosition: =>
    coords = @position()
    @marker.attr
      'data-xPc': coords[0]
      'data-yPc': coords[1]

  update: (options) =>
    if options.color
      @marker.css(backgroundColor: options.color)
    if options.infobox
      @marker.find('.planit-infobox').html(options.infobox)
      @positionInfobox()
    if options.draggable
      @marker.removeClass('draggable')
      @marker.addClass('draggable') if options.draggable == true
    if options.coords
      left = ((parseFloat(options.coords[0]) / 100) * @container.width()) - 15
      top = ((parseFloat(options.coords[1]) / 100) * @container.height()) - 15
      @marker.css
        left: "#{left}px"
        top: "#{top}px"

  remove: =>
    @marker.remove()
