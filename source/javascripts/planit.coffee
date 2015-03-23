class Planit

  # ------------------------------------------ Refs

  @containerClass:        'planit-container'
  @markerContainerClass:  'planit-markers-container'
  @markerContentClass:    'planit-marker-content'
  @markerClass:           'planit-marker'
  @draggingClass:         'is-dragging'
  @infoboxContainerClass: 'planit-infobox-container'
  @infoboxClass:          'planit-infobox'
  @imageContainer:        'planit-image-container'

  # ------------------------------------------ Default Options

  new: (@options = {}) ->
    new Planit.Plan.Creator(@options)

  # ------------------------------------------ Class Methods

  @randomString: (length = 16) ->
    str = Math.random().toString(36).slice(2)
    str = str + Math.random().toString(36).slice(2)
    str.substring(0, length - 1)

# set this class to a global `planit` variable
window.planit = new Planit
