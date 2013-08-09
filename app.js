"use strict";

$(document).ready(function() {
  document.getElementById("filesubmit").addEventListener('click', (function() {
		var drawdiv = document.getElementById("pregifcanvas");
    var containerdiv = document.getElementById("pregifcanvas");
    var img = document.createElement('img');
    img.src = document.getElementById("url").value;
    img.onload = function() {
      // Create canvas element
      var canvas = document.createElement('canvas');
      var ctx = canvas.getContext('2d');
      var gif = new SuperGif({ gif: img, auto_play: true, rubbable: false });

      containerdiv.setAttribute('width', this.width);
      containerdiv.setAttribute('height', this.height);
      drawdiv.setAttribute('width', this.width);
      drawdiv.setAttribute('height', this.height);
      canvas.setAttribute('width', this.width);
      canvas.setAttribute('height', this.height);
      canvas.style.position = "absolute";

      gif.load();
      drawdiv.appendChild(gif.get_canvas());

      fileinput.style.display = "none";
      preprocessing.style.display = "block";
      document.getElementById("play").addEventListener("click", function() {
        gif.play();
      });
      document.getElementById("pause").addEventListener("click", function() {
        gif.play();
      });
      document.getElementById("stop").addEventListener("click", function() {
        gif.pause();
        gif.move_to(0);
      });
      document.getElementById("backward").addEventListener("click", function() {
        gif.pause();
        gif.move_relative(-1);
      });
      document.getElementById("forward").addEventListener("click", function() {
        gif.pause();
        gif.move_relative(1);
      });
    };
  }));
});
