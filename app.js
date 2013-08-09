"use strict";

$(document).ready(function() {
  var options,ctx,canvasWidth,canvasHeight;
  var curr_img_pyr, prev_img_pyr, point_count, point_status, prev_xy, curr_xy;

  var demo_opt = function(){
    this.win_size = 20;
    this.max_iterations = 30;
    this.epsilon = 0.01;
    this.min_eigen = 0.001;
  }

  document.getElementById("filesubmit").addEventListener('click', (function() {
		var drawdiv = document.getElementById("pregifcanvas");
    var img = document.createElement('img');
    img.src = document.getElementById("url").value;
    img.onload = function() {
      // Create canvas element

      var gif = new SuperGif({ gif: img, auto_play: true, rubbable: false });
      document.getElementById("play").addEventListener("click", function() {
        gif.play();
      });
      document.getElementById("pause").addEventListener("click", function() {
        gif.pause();
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

      gif.load();
      var canvas = gif.get_canvas();
      var ctx = canvas.getContext('2d');
      drawdiv.appendChild(gif.get_canvas());

      fileinput.style.display = "none";
      preprocessing.style.display = "block";

      function demo_app() {
        canvasWidth  = canvas.width;
        canvasHeight = canvas.height;
        ctx = canvas.getContext('2d');

        ctx.fillStyle = "rgb(0,255,0)";
        ctx.strokeStyle = "rgb(0,255,0)";

        curr_img_pyr = new jsfeat.pyramid_t(3);
        prev_img_pyr = new jsfeat.pyramid_t(3);
        curr_img_pyr.allocate(640, 480, jsfeat.U8_t|jsfeat.C1_t);
        prev_img_pyr.allocate(640, 480, jsfeat.U8_t|jsfeat.C1_t);

        point_count = 0;
        point_status = new Uint8Array(100);
        prev_xy = new Float32Array(100*2);
        curr_xy = new Float32Array(100*2);

        options = new demo_opt();
      }

      function tick() {
        //ctx.drawImage(video, 0, 0, 640, 480);
        var imageData = ctx.getImageData(0, 0, 640, 480);

        // swap flow data
        var _pt_xy = prev_xy;
        prev_xy = curr_xy;
        curr_xy = _pt_xy;
        var _pyr = prev_img_pyr;
        prev_img_pyr = curr_img_pyr;
        curr_img_pyr = _pyr;

        jsfeat.imgproc.grayscale(imageData.data, curr_img_pyr.data[0].data);
        curr_img_pyr.build(curr_img_pyr.data[0], true);
        jsfeat.optical_flow_lk.track(prev_img_pyr, curr_img_pyr, prev_xy, curr_xy, point_count, options.win_size|0, options.max_iterations|0, point_status, options.epsilon, options.min_eigen);
        prune_oflow_points(ctx);
      }

      function on_canvas_click(e) {
        var coords = canvas.relMouseCoords(e);
        if(coords.x > 0 & coords.y > 0 & coords.x < canvasWidth & coords.y < canvasHeight) {
          curr_xy[point_count<<1] = coords.x;
          curr_xy[(point_count<<1)+1] = coords.y;
          point_count++;
        }
      }
      canvas.addEventListener('click', on_canvas_click, false);

      function draw_circle(ctx, x, y) {
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI*2, true); 
        ctx.closePath();
        ctx.fill();
      }

      function prune_oflow_points(ctx) {
        var n = point_count;
        var i=0,j=0;

        for(; i < n; ++i) {
          if(point_status[i] == 1) {
            if(j < i) {
              curr_xy[j<<1] = curr_xy[i<<1];
              curr_xy[(j<<1)+1] = curr_xy[(i<<1)+1];
            }
            draw_circle(ctx, curr_xy[j<<1], curr_xy[(j<<1)+1]);
            ++j;
          }
        }
        point_count = j;
      }

      function relMouseCoords(event) {
        var totalOffsetX=0,totalOffsetY=0,canvasX=0,canvasY=0;
        var currentElement = this;

        do {
          totalOffsetX += currentElement.offsetLeft - currentElement.scrollLeft;
          totalOffsetY += currentElement.offsetTop - currentElement.scrollTop;
        } while(currentElement = currentElement.offsetParent)

        canvasX = event.pageX - totalOffsetX;
        canvasY = event.pageY - totalOffsetY;

        return {x:canvasX, y:canvasY};
      }
      HTMLCanvasElement.prototype.relMouseCoords = relMouseCoords;
      demo_app();
      document.addEventListener('gifmove', tick, false);
    };
  }));
});
