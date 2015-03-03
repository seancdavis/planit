class Planit

  # ------------------------------------------ Refs

  @containerClass:        'planit-container'
  @markerContainerClass:  'planit-markers-container'
  @markerClass:           'planit-marker'
  @markerContentClass:    'planit-marker-content'
  @infoboxContainerClass: 'planit-infobox-container'

  # ------------------------------------------ Default Options

  new: (@options = {}) ->
    # Set Options
    if @options.container
      @options.container = $("##{@options.container}")
    else
      @options.container = $('#planit') 

    # Initialize Container
    @options.container.addClass('planit-container')
    @options.container.append """
      <div class="#{Planit.infoboxContainerClass}"></div>
      <div class="#{Planit.markerContainerClass}"></div>
        """

    # Refs
    @container = @options.container
    @markersContainer = @container.find(".#{Planit.markerContainerClass}").first()

    # Add image and zoom (if necessary)
    if @options.image && @options.image.url
      @container.append("""<img src="#{@options.image.url}">""")
      @markersContainer.css
        backgroundImage: "url('#{@options.image.url}')"
      @initBackgroundImage()

    # Add Markers (if necessary)
    if @options.markers && @options.markers.length > 0
      @initMarkers()

    # Bind Document Events
    new Planit.Plan.Events
      container: @container
      planit: @

    # Return this Planit object
    @

  initBackgroundImage: =>
    img = @container.find('img').first()
    imgHeight = img.height()
    if imgHeight > 0 && img.width() > 0
      @container.css
        height: imgHeight
      img.remove()
      if @options.image.zoom
        new Planit.Plan.Zoomable
          container: @container
      @imgLoaded = true
    else
      setTimeout(@initBackgroundImage, 250)

  initMarkers: =>
    if @options.image && @options.image.url
      if @imgLoaded == true
        @addMarker(marker) for marker in @options.markers
      else
        setTimeout(@initMarkers, 250)
    else
      @addMarker(marker) for marker in @options.markers

  # ------------------------------------------ Add A Marker

  addMarker: (options) =>
    options.container = @container
    new Planit.Marker.Creator(options)

  # ------------------------------------------ Retrieve Data

  getMarker: (id) =>
    new Planit.Marker(@container, id)

  getAllMarkers: () =>
    plan = new Planit.Plan(@container)
    plan.getAllMarkers()

  # ------------------------------------------ Event Callbacks

  markerDragEnd: (event, marker) =>
    if @options.markerDragEnd
      @options.markerDragEnd(event, marker)

  canvasClick: (event, coords) =>
    if @options.canvasClick
      @options.canvasClick(event, coords)

  # ------------------------------------------ Class Methods

  @randomString: (length = 16) ->
    str = Math.random().toString(36).slice(2) 
    str = str + Math.random().toString(36).slice(2)
    str.substring(0, length - 1)

# set this class to a global `planit` variable
window.planit = new Planit
