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
    xPc = xPx / @container.width()
    yPc = yPx / @container.height()
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
      @marker.css
        left: "#{parseFloat(options.coords[0]) * 100}%"
        top: "#{parseFloat(options.coords[1]) * 100}%"

  remove: =>
    @marker.remove()
