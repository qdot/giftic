/*
 * giftic - Jiggly.js Output Plugin
 * By Kyle Machulis (qDot) <kyle@nonpolynomial,com>
 *
 * Copyright Kyle Machulis (qDot)/Nonpolynomial Labs, 2013
 *
 * giftic is BSD Licensed. See giftic project license.txt for details.
 *
 * Description: Jiggly.js is a library that abstracts vibration mechanisms
 * (gamepad, audio, webvibrate) so that the same speed command can route to any
 * mechanism easily.
 */

'use strict';

var JigglyOutput = function() {
  Jiggly.setOutputMethod(Jiggly.outputMethods.HTML5AUDIO);
  //Jiggly.setOutputMethod(Jiggly.outputMethods.WEBVIBRATION);
  var output = function(n) {
    Jiggly.mute(false);

    Jiggly.runSpeed($('#volumeinput').val() * n, 1000);
  };

  var template = function() {
    var d = document.createElement('div');
    var h1 = document.createElement('h1');
    h1.innerHTML = 'Jiggly.js';
    d.appendChild(h1);
    var cb = document.createElement('input');
    cb.setAttribute('type', 'checkbox');
    cb.addEventListener('onclick', function(e) {
      Jiggly.mute(this.checked);
    });
    d.appendChild(cb);
    cb = document.createElement('input');
    cb.setAttribute('id', 'volumeinput');
    cb.setAttribute('type', 'range');
    cb.setAttribute('min', '0');
    cb.setAttribute('max', '100');
    d.appendChild(cb);
    return d;
  };

  return {
    get name() { return 'Jiggly.js'; },
    template: template,
    output: output,
    mute: function(b) { Jiggly.mute(b); }
  };
};

OutputManager.add(JigglyOutput());
