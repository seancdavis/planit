class Planit.Marker

  constructor: (@options) ->
    @setOptions()

  setOptions: ->
    @plan = @options.plan
    @markersContainer = @plan.find('.planit-markers-container')

  add: (coords) ->
    @markersContainer.append($('<div></div>')
      .addClass('planit-marker draggable')
      .css(
        left: "#{coords[0]}%"
        top: "#{coords[1]}%"
      )
    )
    new Draggabilly(@markersContainer.find('.planit-marker').last()[0],
      containment: '.planit-markers-container'
    )
