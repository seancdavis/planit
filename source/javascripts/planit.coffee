class Planit

  # ------------------------------------------ DOM References

  @containerClass:        'planit-container'
  @draggingClass:         'is-dragging'
  @imageContainer:        'planit-image-container'
  @infoboxClass:          'planit-infobox'
  @infoboxContainerClass: 'planit-infobox-container'
  @markerClass:           'planit-marker'
  @markerContainerClass:  'planit-markers-container'
  @markerContentClass:    'planit-marker-content'

  # ------------------------------------------ Instantiation

  new: (@options = {}) ->
    return new Planit.Plan(@options)

  # ------------------------------------------ Global Helpers

  @randomString: (length = 16) ->
    str = Math.random().toString(36).slice(2)
    str = str + Math.random().toString(36).slice(2)
    str.substring(0, length - 1)
