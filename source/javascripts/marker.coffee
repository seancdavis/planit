class Planit.Marker

  constructor: (@options) ->
    @setOptions()

  setOptions: ->
    @plan = @options.plan
    @markersContainer = @plan.find('.planit-markers-container')

  add: (coords) ->
    @markersContainer.append($('<div></div>')
      .addClass('planit-marker')
      .css(
        left: "#{coords[0]}%"
        top: "#{coords[1]}%"
      )
    )
