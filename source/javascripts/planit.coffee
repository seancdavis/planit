class Planit

  # ------------------------------------------ Default Options

  new: (@options) ->

    # Default Options
    @options = {} unless @options
    @planOptions =
      container: $('#planit')

    # Input Options
    @planOptions.container = $("##{@options.container}") if @options.container
    @planOptions.backgroundImage = @options.backgroundImage if @options.backgroundImage

    # Initialize Plan
    @plan = new Planit.Plan(@planOptions)

    # Add Markers (if necessary)
    if @options.markers
      $(window).load () =>
        @addMarker(marker) for marker in @options.markers

    # Return this Planit object
    @

  # ------------------------------------------ Add A Marker

  addMarker: (options) =>
    options.plan = @planOptions.container
    new Planit.Marker(options)

# set this class to a global `planit` variable
window.planit = new Planit
