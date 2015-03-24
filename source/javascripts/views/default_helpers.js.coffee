class App.Views.DefaultHelpers extends Backbone.View

  el: 'body'

  initialize: =>
    $(window).ready ->
      $('#container').fadeIn(500)