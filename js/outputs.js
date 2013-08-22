"use strict";

var JigglyOutput = function () {
  Jiggly.setOutputMethod(Jiggly.outputMethods.HTML5AUDIO);
  //Jiggly.setOutputMethod(Jiggly.outputMethods.WEBVIBRATION);
  var output = function(n) {
    Jiggly.runSpeed(75 * n, 1000);
  };
  return {
    output: output,
    mute: function(b) { Jiggly.mute(b); }
  };
};

