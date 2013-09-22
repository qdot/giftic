'use strict';

var OutputManager = (function() {

  var outputs = [];
  var active = [];
  var display = undefined;

  var addOutput = function(o) {
    outputs.push(o);
  };

  var activateOutput = function(o) {
    active.push(o);
  };

  var deactivateOutput = function(o) {
    var i = active.indexOf(o);
    active.splice(i, 1);
    showActiveOutputs();
  };

  var updateActiveOutputs = function(speed, direction) {
    for (var o in active) {
      o.update(speed, direction);
    }
  };

  var showActiveOutputs = function() {
    display.children().each(function(i) {
      this.detach();
    });
    for (var o in active) {
    }
  };

  return {
    get outputList() { return outputs; },
    setDisplayDiv: function(d) { display = d; },
    add: addOutput,
    activate: activateOutput,
    deactivate: deactivateOutput,
    show: undefined,
    update: updateActiveOutputs
  };
})();
