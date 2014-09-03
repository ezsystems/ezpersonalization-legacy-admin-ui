angular
  .module('yc.booking.services', [])
  .factory('scopeService', function() {
    var service = {
      scopes: {},
      publishScope: function(id, scope) {
        this.scopes[id] = scope;
      },
      broadcast: function(id, event, attrs) {
        console.log("broadcasting for id "+ id );
        this.scopes[id].$broadcast(event, attrs);
      }
    };
    return service;
  })