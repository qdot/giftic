'use strict';

var RealTouchOutput = function() {
  var rt = RealTouch();
  rt.init(RealTouchMozTCPSocketConnector);
  rt.connect();

  var output = function(n) {
    rt.vectorMovement(Math.floor(Math.abs(n * 255)),
                      rt.AxisEnum.BOTH,
                      (n > 0) ? rt.DirEnum.OUT : rt.DirEnum.IN,
                      1000);
  };

  var template = function() {
    var d = document.createElement('div');
    var h1 = document.createElement('h1');
    h1.innerHTML = 'Realtouch.js';
    d.appendChild(h1);
    return d;
  };

  return {
    get name() { return 'Realtouch.js'; },
    template: template,
    output: output,
    mute: function(b) { Jiggly.mute(b); }
  };
};

OutputManager.add(RealTouchOutput());
