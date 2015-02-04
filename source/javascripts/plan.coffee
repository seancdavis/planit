class Planit.Plan

  constructor: (@options) ->
    @initContainers()

  initContainers: ->
    @options.container.addClass('planit-container')
    @options.container.append("""<div class="planit-markers-container"></div>""")

