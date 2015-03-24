class Planit.Marker

  # ======================================================== Setup

  # When the Marker class is instantiated, we return the
  # object, but all we need to do is set references and find
  # the appropriate jQuery object.
  #
  # It's for this reason that the create action is a class
  # method (the marker doesn't physically exist yet)
  #
  constructor: (@container, id) ->
    # Set Options
    @markersContainer = @container.find(".#{Planit.markerContainerClass}")
    if @container.find(".#{Planit.imageContainer} > img").length > 0
      @image = @container.find(".#{Planit.imageContainer} > img").first()

    # Find Marker
    @marker = @markersContainer.find(
      ".#{Planit.markerClass}[data-marker='#{id}']"
    ).first()

    # Return this
    @

  # ======================================================== Create New Marker

  # (class method) Creates a new marker
  #
  @create: (options) ->
    # local references
    container = options.container
    markersContainer = container.find(".#{Planit.markerContainerClass}").first()
    # set options
    options.planitID = Planit.randomString(20) unless options.planitID
    if options.color then color = options.color else color = '#FC5B3F'
    # find position
    left = ((parseFloat(options.coords[0]) / 100) * container.width()) - 15
    top = ((parseFloat(options.coords[1]) / 100) * container.height()) - 15
    # create the marker
    markersContainer.append(
      $('<div></div>')
        .addClass(Planit.markerClass)
        .attr
          'data-marker': options.planitID
          'data-xPc': options.coords[0]
          'data-yPc': options.coords[1]
        .css
          left: "#{left}px"
          top: "#{top}px"
          backgroundColor: color
    )
    # find the marker
    marker = markersContainer.find(".#{Planit.markerClass}").last()
    # add content and styles if passed as options
    if options.id
      marker.attr('data-id': options.id)
    if options.class
      marker.addClass(options.class)
    if options.html
      marker.html(options.html)
    if options.size
      marker.css
        width: "#{options.size}px"
        height: "#{options.size}px"
    # setup draggable if necessary
    if options.draggable
      marker.addClass('draggable')
      marker.on 'mousedown', (e) =>
        if e.which == 1
          marker = $(e.target).closest(".#{Planit.markerClass}")
          marker.addClass(Planit.draggingClass)
          marker.attr
            'data-drag-start-x': e.pageX
            'data-drag-start-y': e.pageY
    # setup infobox if necessary
    if options.infobox
      id = Planit.randomString(16)
      # set style options on infobox
      infobox = options.infobox
      if infobox.position then position = infobox.position else position = 'top'
      if infobox.arrow then arrow = true else arrow = false
      if arrow == true then arrowClass = 'arrow' else arrowClass = ''
      classes = "#{Planit.infoboxClass} #{position} #{arrowClass}"
      # add infobox
      container.find(".#{Planit.infoboxContainerClass}").append """
        <div class="#{classes}" id="info-#{id}"
          data-position="#{position}">
            #{infobox.html}
        </div>
          """
      # add post-options if necessary
      if infobox.offsetX
        container.find(".#{Planit.infoboxClass}").last().attr
          'data-offset-x': infobox.offsetX
      if infobox.offsetY
        container.find(".#{Planit.infoboxClass}").last().attr
          'data-offset-y': infobox.offsetY
      marker.attr('data-infobox', "info-#{id}")
      m = new Planit.Marker(container, options.planitID)
      m.positionInfobox()
      m

  # ======================================================== Calculations

  # Get the position of the marker as a percentage of 100,
  # relative to the top left of the image (if there is an image).
  #
  position: =>
    xPx = @marker.position().left + (@marker.outerWidth() / 2)
    yPx = @marker.position().top + (@marker.outerHeight() / 2)
    if @image
      wImg = @image.width()
      hImg = @image.height()
      xImg = parseInt(@image.css('left'))
      yImg = parseInt(@image.css('top'))
      xPc = ((xPx + Math.abs(xImg)) / wImg) * 100
      yPc = ((yPx + Math.abs(yImg)) / hImg) * 100
    else
      xPc = (xPx / @container.width()) * 100
      yPc = (yPx / @container.height()) * 100
    [xPc, yPc]

  # Get the position of the marker as a percentage of 100,
  # relative to the top left of the container.
  #
  relativePosition: =>
    xPx = @marker.position().left + (@marker.outerWidth() / 2)
    yPx = @marker.position().top + (@marker.outerHeight() / 2)
    xPc = (xPx / @container.width()) * 100
    yPc = (yPx / @container.height()) * 100
    [xPc, yPc]

  # ======================================================== Attributes

  # The background color of the marker
  #
  color: =>
    @marker.css('backgroundColor')

  # Randomly-generated ID given by planit when the marker is
  # added to the plan.
  #
  planitID: =>
    @marker.attr('data-marker')

  # The ID of the marker, which would have been a manual
  # option
  #
  id: =>
    @marker.attr('data-id')

  # Whether or not the marker is currently being dragged
  #
  isDraggable: =>
    @marker.hasClass('draggable')

  # ======================================================== Infobox

  # The jQuery object that is the markers infobox (if the
  # marker has an infobox)
  #
  infobox: =>
    infobox = @container.find("##{@marker.attr('data-infobox')}")
    if infobox.length > 0 then infobox else null

  # The markup within the infobox, if the marker has an
  # infobox
  #
  infoboxHTML: =>
    if @infobox() && @infobox().length > 0 then @infobox().html() else null

  # Whether the infobox is being displayed.
  #
  infoboxVisible: =>
    @infobox() && @infobox().hasClass('active')

  # Hides the infobox if it is visible.
  #
  hideInfobox: =>
    @infobox().addClass('hidden') if @infoboxVisible()

  # Shows the infobox if it is hidden.
  #
  showInfobox: =>
    @infobox().addClass('active') if @infobox() && !@infoboxVisible()
    @unhideInfobox()

  # Similar to showInfobox, but less agressive. It takes
  # away its hidden class, instead of adding an active
  # class.
  #
  unhideInfobox: =>
    @infobox().removeClass('hidden') if @infoboxVisible()

  # Find the appropriate coordinates at which to display the
  # infobox, based on options.
  #
  infoboxCoords: =>
    infobox = @container.find("##{@marker.attr('data-infobox')}")
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
    offsetX = parseInt(infobox.attr('data-offset-x'))
    offsetX = 0 unless offsetX
    offsetY = parseInt(infobox.attr('data-offset-y'))
    offsetY = 0 unless offsetY
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
    left: infoLeft + offsetX
    top: infoTop + offsetY

  # Places the infobox in the correct position.
  #
  positionInfobox: =>
    coords = @infoboxCoords()
    @container.find("##{@marker.attr('data-infobox')}").css
      left: "#{coords.left}px"
      top: "#{coords.top}px"
    @position()

  # Animates the infobox from its current position to its
  # new position.
  #
  animateInfobox: =>
    coords = @infoboxCoords()
    @container.find("##{@marker.attr('data-infobox')}").animate
      left: "#{coords.left}px"
      top: "#{coords.top}px"
    , 250, () =>
      return @position()

  # ======================================================== Actions

  # positions the marker and infobox based on its data
  # attributes
  #
  set: =>
    left = (@image.width() * (@marker.attr('data-xPc') / 100)) +
      parseFloat(@image.css('left')) - (@marker.outerWidth() / 2)
    top = (@image.height() * (@marker.attr('data-yPc') / 100)) +
      parseFloat(@image.css('top')) - (@marker.outerHeight() / 2)
    @marker.css
      left: "#{left}px"
      top: "#{top}px"
    @positionInfobox()
    [left, top]

  # Updates the marker's data attributes with its new
  # position.
  #
  savePosition: =>
    coords = @position()
    @marker.attr
      'data-xPc': coords[0]
      'data-yPc': coords[1]

  # Allows you to change the attributes of the marker on the
  # fly.
  #
  update: (options) =>
    if options.color
      @marker.css(backgroundColor: options.color)
    if options.infobox
      @marker.find(".#{Planit.infoboxClass}").html(options.infobox)
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

  # Removes the marker from the plan.
  #
  remove: =>
    @infobox().remove() if @infobox()
    @marker.remove()
