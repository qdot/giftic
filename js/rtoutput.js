/*
 * giftic - RealTouch.js Output Plugin
 * By Kyle Machulis (qDot) <kyle@nonpolynomial,com>
 *
 * Copyright Kyle Machulis (qDot)/Nonpolynomial Labs, 2013
 *
 * giftic is BSD Licensed. See giftic project license.txt for details.
 *
 * Description: Realtouch.js uses a network connection to send commands to the
 * Realtouch Agent, either through websockets or a TCP Socket if we have it
 * available to us (we usually don't).
 */
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
