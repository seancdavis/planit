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
    infoLeft = markerCenterX - (infobox.outerWidth() / 2)
    infoBottom = @container.height() - markerCenterY + (@marker.height() / 2) + 5
    infobox.css
      left: infoLeft
      bottom: infoBottom
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
