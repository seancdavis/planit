class Planit.Plan

  constructor: (@options) ->
    @initContainers()
    @addBackgroundImage() if @options.backgroundImage

  initContainers: ->
    @container = @options.container
    @container.addClass('planit-container')
    @container.append("""<div class="planit-markers-container"></div>""")
    @markersContainer = @container.find('.planit-markers-container').first()

  addBackgroundImage: ->
    @container.append("""<img src="#{@options.backgroundImage}">""")
    @markersContainer.css
      backgroundImage: "url('#{@options.backgroundImage}')"
    $(window).load =>
      @container.css
        height: @container.find('img').first().height()
      @container.find('img').first().remove()

  # ------------------------------------------ Get All Markers

  getAllMarkers: () =>
    markers = []
    for marker in @markersContainer.find('.planit-marker')
      m = $(marker)
      marker =
        coords: [m.position().left, m.position().top]
      info = m.find('.planit-infobox')
      if info.length > 0
        marker.infobox = info.html()
      markers.push(marker)
    markers
