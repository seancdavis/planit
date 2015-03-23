
  # ======================================================== Options

  # (private) Add default options if the necessary options
  # are missing
  #
  initOptions = ->
    if @options.container
      @options.container = $("##{@options.container}")
    else
      @options.container = $('#planit')
    # direct access to planit container
    @container = @options.container

  # ======================================================== Container

  # (private) Draw the container and the subcontainers
  #
  initContainer = ->
    @container.addClass(Planit.containerClass)
    @container.append """
      <div class="#{Planit.infoboxContainerClass}"></div>
      <div class="#{Planit.markerContainerClass}"></div>
        """
    @markersContainer = @container.find(".#{Planit.markerContainerClass}")
      .first() # direct access to markers container

  # ======================================================== Background Image

  # (private) Create image container and add image if
  # necessary
  #
  initImage = ->
    if @options.image && @options.image.url
      @container.prepend """
        <div class="#{Planit.imageContainer}">
          <img src="#{@options.image.url}">
        </div>
      """
      @image = @container.find('img').first()
      @image.load () =>
        @container.css(height: @image.height())
        initZoomable.call(@)
        initMarkers.call(@)

  # ======================================================== Zooming

  # (private) Sets our references for working with zoom, and
  # controls whether or not to add controls
  #
  initZoomable = ->
    # add zoom ID to markers container
    @zoomId = Planit.randomString()
    @markersContainer.attr('data-zoom-id', @zoomId)
    # set initial background coordinates
    @resetImage()
    # add zoom controls if necessary
    initZoomControls.call(@) if @options.image.zoom

  # (private) Render the zoom controls and binds necessary
  # events
  #
  initZoomControls = ->
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

  # ======================================================== Markers

  # (private) Will call initMarkers if there is no image,
  # otherwise it's called from initImage, which waits for
  # the image to be loaded.
  #
  initCanvasMarkers = ->
    initMarkers.call(@) unless @options.image && @options.image.url

  # Interval method that continues to check for image being
  # loaded before adding markers to the plan
  #
  initMarkers = ->
    if @options.markers && @options.markers.length > 0
      for marker in @options.markers
        marker.container = @container
        Planit.Marker.create(marker)

  # ======================================================== Plan Events

  # (private) Bind events to the plan. These events deal
  # mostly with markers, since some event should be attached
  # to the plan and later find the appropriate marker
  #
  initEvents = ->
    if @container.find(".#{Planit.imageContainer} > img").length > 0
      @image = @container.find(".#{Planit.imageContainer} > img").first()
    $(document).on('mousemove', @mousemove)
    $(document).on('mouseup', @mouseup)
