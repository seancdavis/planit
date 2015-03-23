class Planit.Plan.Creator

  # ------------------------------------------ Setup

  constructor: (@options = {}) ->
    method.call(@) for method in initMethods()
    # Return a new instance of a Plan
    return new Planit.Plan(@options)

  # (private) Methods (in order) needed to instantiate this
  # object
  #
  initMethods = ->
    [initOptions, initContainer, initImage, initMarkers, initEvents]

  # (private) Add default options if the necessary options
  # are missing
  #
  initOptions = ->
    if @options.container
      @options.container = $("##{@options.container}")
    else
      @options.container = $('#planit')
    @container = @options.container # direct access to planit container

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
      @initBackgroundImage()

  # Interval function that sets zoomable methods on the
  # container once the image is loaded
  #
  initBackgroundImage: =>
    img = @container.find('img').first()
    if img.height() > 0 && img.width() > 0
      @container.css
        height: img.height()
      zoomable = new Planit.Plan.Zoomable(@container)
      if @options.image.zoom
        zoomable.init()
      @imgLoaded = true
    else
      setTimeout(@initBackgroundImage, 250)

  # (private) Control adding markers to the plan. Wait for
  # image to be loaded if necessary.
  #
  initMarkers = ->
    if @options.markers && @options.markers.length > 0
      if @options.image && @options.image.url
        @addMarkers()
      else
        for marker in @options.markers
          marker.container = @container
          new Planit.Marker.Creator(marker)

  # Interval method that continues to check for image being
  # loaded before adding markers to the plan
  #
  addMarkers: =>
    if @imgLoaded && @imgLoaded == true
      for marker in @options.markers
        marker.container = @container
        new Planit.Marker.Creator(marker)
    else
      setTimeout(@addMarkers, 250)

  # (private) Bind events to the plan
  #
  initEvents = ->
    new Planit.Plan.Events(@options)
