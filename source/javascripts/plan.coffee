class Planit.Plan

  constructor: (@options) ->
    @initContainers()
    @addBackgroundImage() if @options.backgroundImage

  initContainers: ->
    @options.container.addClass('planit-container')
    @options.container.append("""<div class="planit-markers-container"></div>""")

  addBackgroundImage: ->
    @options.container.append("""<img src="#{@options.backgroundImage}">""")
    @options.container.find('.planit-markers-container').css
      backgroundImage: "url('#{@options.backgroundImage}')"
    $(window).load =>
      @options.container.css
        height: @options.container.find('img').first().height()
      @options.container.find('img').first().remove()

