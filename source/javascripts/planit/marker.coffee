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
    # console.log @marker.outerWidth() / @container.width()
    xPx = @marker.position().left + (@marker.outerWidth() / 2)
    yPx = @marker.position().top + (@marker.outerHeight() / 2)
    xPc = (xPx / @container.width()) * 100
    yPc = (yPx / @container.height()) * 100
    [xPc, yPc]

  # ------------------------------------------ Attributes

  color: =>
    @marker.css('backgroundColor')

  id: =>
    @marker.attr('data-marker')

  # ------------------------------------------ Infobox

  infoboxHTML: =>
    info = @marker.find('.planit-infobox')
    if info.length > 0 then info.html() else null

  # ------------------------------------------ Dragging

  isDraggable: =>
    @marker.hasClass('draggable')

  # ------------------------------------------ Actions

  update: (options) =>
    if options.color
      @marker.css(backgroundColor: options.color)
    if options.infobox
      @marker.find('.planit-infobox').html(options.infobox)
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
