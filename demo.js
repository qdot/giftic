$(document).ready(function() {
  var gif;
	document.getElementById("submit").addEventListener('click', (function() {
		drawdiv = document.getElementById("gifcanvas");
    img = document.createElement('img');
    img.src = document.getElementById("url").value;
    img.onload = function() {
      // Create canvas element
      imgdiv = document.createElement('div');
      imgdiv.setAttribute('id', 'imgdiv');
      canvasdiv = document.createElement('div');
      canvasdiv.setAttribute('id', 'canvasdiv');
      canvas = document.createElement('canvas');
      canvas.setAttribute('width', this.width);
      canvas.setAttribute('height', this.height);
      canvasdiv.appendChild(canvas);
      //imgdiv.appendChild(img);
      drawdiv.appendChild(canvasdiv);
      drawdiv.appendChild(imgdiv);
      gif = new SuperGif({ gif: img, auto_play: false, rubbable: false });
      gif.load();
      newdiv = document.getElementById("newgifcanvas");
      newdiv.appendChild(gif.get_canvas());
      canvas.onmousedown = function(e) {
        var startx = e.clientX;
        var starty = e.clientY;
        var x;
        var y;
        if (canvas.getContext) {
          var ctx = canvas.getContext('2d');
          ctx.moveTo(startx, starty);
        }
        canvas.onmousemove = function(e) {
          if (canvas.getContext) {
            var ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, this.width, this.height);
            var x = e.clientX;
            var y = e.clientY;
            var r = canvas.getBoundingClientRect();
            ctx.strokeRect(startx - r.left, starty - r.top,
                           (x - startx), (y - starty));
            ctx.moveTo(x, y);
          }
        };
        canvas.onmouseup = function(e) {
          // if (canvas.getContext) {
          //   var ctx = canvas.getContext('2d');
          //   ctx.clearRect(0, 0, this.width, this.height);
          // }
          cutcanvas = document.getElementById("cutcanvas");
          while (cutcanvas.firstChild) {
            cutcanvas.removeChild(cutcanvas.firstChild);
          }
          var x = e.clientX;
          var y = e.clientY;
          canvas.onmousemove = undefined;
          var tmpimg = document.createElement('img');
          tmpimg.setAttribute('width', Math.abs(x-startx));
          tmpimg.setAttribute('height', Math.abs(y-starty));
          var tmpcvs = gif.get_canvas();
          var tmpctx = tmpcvs.getContext('2d');
          var tmpgif = SuperGif( { gif: tmpimg, auto_play: false, rubbable: false });
          var r = canvas.getBoundingClientRect();
          for(var i = 0; i < gif.get_length(); ++i) {
            gif.move_to(i);
            tmpgif.add_frame({
              data: tmpctx.getImageData(startx - r.left, starty - r.top, (x - startx), (y - starty)),
              delay: 20
            });
          }
          tmpgif.force_finish();
          cutcanvas.appendChild(tmpgif.get_canvas());
          tmpgif.play();
          canvas.onmouseup = undefined;
        };

      };
    };
	}));

  // document.getElementById("process").addEventListener('click', (function() {
  // }));

});
