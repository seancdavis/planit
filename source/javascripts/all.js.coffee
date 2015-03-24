#= require vendor/jquery
#= require vendor/underscore
#= require vendor/backbone
#= require_self
#= require_tree ./views
#= require_tree ./routers

window.App =
  # Models: {}
  Collections: {}
  Routers: {}
  Views: {}

$ ->
  new App.Routers.Router

  # Enable pushState for compatible browsers
  enablePushState = true

  # Disable for older browsers
  pushState = !!(enablePushState && window.history && window.history.pushState)

  Backbone.history.start({ pushState: pushState })
