$(document).ready(function() {
  "use strict";
  var gif;
	document.getElementById("submit").addEventListener('click', (function() {
		var drawdiv = document.getElementById("gifcanvas");
    var img = document.createElement('img');
    img.src = document.getElementById("url").value;
    img.onload = function() {
      // Create canvas element
      var imgdiv = document.createElement('div');
      imgdiv.setAttribute('id', 'imgdiv');
      var canvasdiv = document.createElement('div');
      canvasdiv.setAttribute('id', 'canvasdiv');
      var canvas = document.createElement('canvas');
      var w = this.width;
      var h = this.height;
      canvas.setAttribute('width', this.width);
      canvas.setAttribute('height', this.height);
      var ctx = canvas.getContext('2d');
      canvasdiv.appendChild(canvas);
      //imgdiv.appendChild(img);
      drawdiv.appendChild(canvasdiv);
      drawdiv.appendChild(imgdiv);
      var gif = new SuperGif({ gif: img, auto_play: true, rubbable: false });
      gif.load();
      var gifctx = gif.get_canvas().getContext('2d');
      var newdiv = document.getElementById("newgifcanvas");
      newdiv.appendChild(gif.get_canvas());
      //gif.play();
      // canvas.onmousedown = function(e) {
      //   var startx = e.clientX;
      //   var starty = e.clientY;
      //   var x;
      //   var y;
      //   if (canvas.getContext) {
      //     var ctx = canvas.getContext('2d');
      //     ctx.moveTo(startx, starty);
      //   }
      //   canvas.onmousemove = function(e) {
      //     if (canvas.getContext) {
      //       var ctx = canvas.getContext('2d');
      //       ctx.clearRect(0, 0, this.width, this.height);
      //       var x = e.clientX;
      //       var y = e.clientY;
      //       var r = canvas.getBoundingClientRect();
      //       ctx.strokeRect(startx - r.left, starty - r.top,
      //                      (x - startx), (y - starty));
      //       ctx.moveTo(x, y);
      //     }
      //   };
      //   canvas.onmouseup = function(e) {
      //     // if (canvas.getContext) {
      //     //   var ctx = canvas.getContext('2d');
      //     //   ctx.clearRect(0, 0, this.width, this.height);
      //     // }
      //     cutcanvas = document.getElementById("cutcanvas");
      //     while (cutcanvas.firstChild) {
      //       cutcanvas.removeChild(cutcanvas.firstChild);
      //     }
      //     var x = e.clientX;
      //     var y = e.clientY;
      //     canvas.onmousemove = undefined;
      //     var tmpimg = document.createElement('img');
      //     tmpimg.setAttribute('width', Math.abs(x-startx));
      //     tmpimg.setAttribute('height', Math.abs(y-starty));
      //     var tmpcvs = gif.get_canvas();
      //     var tmpctx = tmpcvs.getContext('2d');
      //     var tmpgif = SuperGif( { gif: tmpimg, auto_play: false, rubbable: false });
      //     var r = canvas.getBoundingClientRect();
      //     for(var i = 0; i < gif.get_length(); ++i) {
      //       gif.move_to(i);
      //       tmpgif.add_frame({
      //         data: tmpctx.getImageData(startx - r.left, starty - r.top, (x - startx), (y - starty)),
      //         delay: 20
      //       });
      //     }
      //     tmpgif.force_finish();
      //     cutcanvas.appendChild(tmpgif.get_canvas());
      //     tmpgif.play();
      //     canvas.onmouseup = undefined;
      //   }
      //};
      // var gui,options,ctx,canvasWidth,canvasHeight;
      // var curr_img_pyr, prev_img_pyr, point_count, point_status, prev_xy, curr_xy, newcvs, newctx;

      // //newcvs = document.createElement("canvas");
      // //cutcanvas.appendChild(newcvs);
      // //newctx = newcvs.getContext("2d");
      // //newcvs.width = (x-startx);
      // //newcvs.height= (y-starty);

      // var demo_opt = function(){
      //   this.win_size = 20;
      //   this.max_iterations = 30;
      //   this.epsilon = 0.01;
      //   this.min_eigen = 0.001;
      // };

      // function demo_app() {
      //   canvasWidth  = w;
      //   canvasHeight = h;

      //   ctx.fillStyle = "rgb(0,255,0)";
      //   ctx.strokeStyle = "rgb(0,255,0)";

      //   curr_img_pyr = new jsfeat.pyramid_t(3);
      //   prev_img_pyr = new jsfeat.pyramid_t(3);
      //   curr_img_pyr.allocate(640, 480, jsfeat.U8_t|jsfeat.C1_t);
      //   prev_img_pyr.allocate(640, 480, jsfeat.U8_t|jsfeat.C1_t);

      //   point_count = 0;
      //   point_status = new Uint8Array(100);
      //   prev_xy = new Float32Array(100*2);
      //   curr_xy = new Float32Array(100*2);

      //   options = new demo_opt();
      // }

      // function tick() {
      //   requestAnimationFrame(tick);
      //   //ctx.drawImage(video, 0, 0, 640, 480);
      //   var imageData = gifctx.getImageData(0, 0, canvasWidth, canvasHeight);

      //   // swap flow data
      //   var _pt_xy = prev_xy;
      //   prev_xy = curr_xy;
      //   curr_xy = _pt_xy;
      //   var _pyr = prev_img_pyr;
      //   prev_img_pyr = curr_img_pyr;
      //   curr_img_pyr = _pyr;

      //   jsfeat.imgproc.grayscale(imageData.data, curr_img_pyr.data[0].data);
      //   curr_img_pyr.build(curr_img_pyr.data[0], true);
      //   jsfeat.optical_flow_lk.track(prev_img_pyr, curr_img_pyr, prev_xy, curr_xy, point_count, options.win_size|0, options.max_iterations|0, point_status, options.epsilon, options.min_eigen);
      //   prune_oflow_points(ctx);
      // }

      // function on_canvas_click(e) {
      //   var coords = canvas.relMouseCoords(e);
      //   if(coords.x > 0 & coords.y > 0 & coords.x < canvasWidth & coords.y < canvasHeight) {
      //     curr_xy[point_count<<1] = coords.x;
      //     curr_xy[(point_count<<1)+1] = coords.y;
      //     point_count++;
      //   }
      // }
      // canvas.addEventListener('click', on_canvas_click, false);

      // function draw_circle(ctx, x, y) {
      //   ctx.beginPath();
      //   ctx.arc(x, y, 4, 0, Math.PI*2, true); 
      //   ctx.closePath();
      //   ctx.fill();
      // }

      // function prune_oflow_points(ctx) {
      //   var n = point_count;
      //   var i=0,j=0;

      //   for(; i < n; ++i) {
      //     if(point_status[i] == 1) {
      //       if(j < i) {
      //         curr_xy[j<<1] = curr_xy[i<<1];
      //         curr_xy[(j<<1)+1] = curr_xy[(i<<1)+1];
      //       }
      //       draw_circle(ctx, curr_xy[j<<1], curr_xy[(j<<1)+1]);
      //       ++j;
      //     }
      //   }
      //   point_count = j;
      // }

      // function relMouseCoords(event) {
      //   var totalOffsetX=0,totalOffsetY=0,canvasX=0,canvasY=0;
      //   var currentElement = this;

      //   do {
      //     totalOffsetX += currentElement.offsetLeft - currentElement.scrollLeft;
      //     totalOffsetY += currentElement.offsetTop - currentElement.scrollTop;
      //   } while(currentElement = currentElement.offsetParent)

      //   canvasX = event.pageX - totalOffsetX;
      //   canvasY = event.pageY - totalOffsetY;

      //   return {x:canvasX, y:canvasY};
      // }
      // HTMLCanvasElement.prototype.relMouseCoords = relMouseCoords;
      // demo_app();
      // tick();
    };
	}));
});
