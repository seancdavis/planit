class Planit

  new: (@options) ->
    @options = {} unless @options
    @setOptions()
    @initPlan()

  setOptions: ->
    @setDefaultOptions()
    @container = $("##{@options.container}") if @options.container

  setDefaultOptions: ->
    @container = $('#planit')

  initPlan: ->
    @plan = new Planit.Plan
      container: @container

window.planit = new Planit
