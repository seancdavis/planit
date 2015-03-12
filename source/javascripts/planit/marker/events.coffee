class Planit.Marker.Events

  constructor: (@options) ->

    # Set Options
    @container = @options.container
    @markersContainer = @container.find(".#{Planit.markerContainerClass}")

    # Find Marker
    @marker = @markersContainer.find(
      ".#{Planit.markerClass}[data-marker='#{@options.planitID}']"
    ).first()
    @markerObj = new Planit.Marker(@container, @options.planitID)

    # Draggable
    if @options.draggable
      @marker.addClass('draggable')
      @marker.on 'mousedown', (e) =>
        if e.which == 1
          marker = $(e.target).closest('.planit-marker')
          marker.addClass('is-dragging')
          marker.attr
            'data-drag-start-x': e.pageX
            'data-drag-start-y': e.pageY

    # Infobox
    if @options.infobox
      id = Planit.randomString(16)
      # set style options on infobox
      options = @options.infobox
      if options.position then position = options.position else position = 'top'
      if options.arrow then arrow = true else arrow = false
      if arrow == true then arrowClass = 'arrow' else arrowClass = ''
      classes = "planit-infobox #{position} #{arrowClass}"
      @container.find(".#{Planit.infoboxContainerClass}").append """
        <div class="#{classes}" id="info-#{id}"
          data-position="#{position}">
            #{options.html}
        </div>
          """
      if options.offsetX
        @container.find('.planit-infobox').last().attr
          'data-offset-x': options.offsetX
      if options.offsetY
        @container.find('.planit-infobox').last().attr
          'data-offset-y': options.offsetY
      @marker.attr('data-infobox', "info-#{id}")
      @markerObj.positionInfobox()
      # @marker.click (e) =>
      #   if(
      #     !@marker.attr('data-drag-start-x') ||
      #     !@marker.attr('data-drag-start-y') ||
      #     (
      #       Math.abs(e.pageX - @marker.attr('data-drag-start-x')) < 1 &&
      #       Math.abs(e.pageY - @marker.attr('data-drag-start-y')) < 1
      #     )
      #   )
      #     marker = $(e.target).closest('.planit-marker')
      #     $("##{marker.attr('data-infobox')}").toggleClass('active')

  markers: ->
    @markersContainer.find('.planit-marker')

  draggingMarker: ->
    @markersContainer.find('.planit-marker.is-dragging')
