"use strict";

$(document).ready(function() {

  var PointFrameArray = function(x, y) {
    var points = [];
    var status = 2;

    var getFramePoint = function(i) {
      if (i < points.length) {
        return points[i];
      }
      return null;
    };

    var addFramePoint = function(x, y) {
      points.push({x : x, y : y});
    };

    var getLastPoint = function(p) {
      if (points.length == 0) {
        return null;
      }
      return points[points.length - 1];
    };

    addFramePoint(x, y);

    return {
      points : points,
      set_status : function (s) { status = s; },
      get_status : function () { return status; },
      get_last_point : getLastPoint,
      get_frame_point : getFramePoint,
      add_frame_point : addFramePoint,
      get_num_points : function () { return points.length; }
    };
  };

  var OpticalFlowAnalyzer = function () {
    var opts = function() {
      this.win_size = 20;
      this.max_iterations = 30;
      this.epsilon = 0.01;
      this.min_eigen = 0.001;
    };

    var options = new opts();

    var analyze = function(sprite, points) {
      if (!points.length) {
        return;
      }

      var curr_img_pyr;
      var prev_img_pyr;
      var point_count;
      var point_status;
      var prev_xy;
      var curr_xy;
      var canvas = sprite.get_canvas();
      var ctx = canvas.getContext("2d");
      var cur_frame;
      var imageData;
      var i;

      curr_img_pyr = new jsfeat.pyramid_t(3);
      prev_img_pyr = new jsfeat.pyramid_t(3);
      curr_img_pyr.allocate(canvas.width, canvas.height, jsfeat.U8_t|jsfeat.C1_t);
      prev_img_pyr.allocate(canvas.width, canvas.height, jsfeat.U8_t|jsfeat.C1_t);

      point_status = new Uint8Array(points.length);
      point_count = points.length;
      prev_xy = new Float32Array(points.length*2);
      curr_xy = new Float32Array(points.length*2);
      for (i = 0; i < points.length; ++i) {
        curr_xy[i*2] = points[i].get_frame_point(0).x;
        curr_xy[(i*2)+1] = points[i].get_frame_point(0).y;
      }

      // build first frame
      sprite.move_to(0);
      imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      jsfeat.imgproc.grayscale(imageData.data, curr_img_pyr.data[0].data);
      curr_img_pyr.build(curr_img_pyr.data[0], true);
      sprite.move_to(1);
      do {
        imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

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

        var current_point = 0;
        var new_point_count = 0;
        for (i = 0; i < point_count && current_point < points.length; ++i) {
          while(!points[current_point].get_status()) {
            current_point++;
            if (current_point == points.length) {
              return;
            }
          }

          points[current_point].add_frame_point(curr_xy[i*2], curr_xy[(i*2)+1]);
          points[current_point].set_status(point_status[i]);

          if (point_status[i]) {
            if (new_point_count != i) {
              // No splice for array buffers. :(
              curr_xy[new_point_count*2] = curr_xy[i*2];
              curr_xy[(new_point_count*2)+1] = curr_xy[(i*2)+1];
            }
            new_point_count = new_point_count + 1;
          }
          current_point++;
        }
        // Out of points to process. Exit.
        if(!new_point_count) {
          return;
        }
        point_count = new_point_count;
        cur_frame = sprite.get_current_frame();
        sprite.move_relative(1);
      } while(cur_frame < sprite.get_current_frame());
    };

    return {
      analyze : analyze,
      set_win_size : function(size) {
        options.win_size = size;
      },
      get_win_size : function() {
        return options.win_size;
      },
      set_max_iterations : function(size) {
        options.max_iterations = size;
      },
      get_max_iterations : function() {
        return options.max_iterations;
      },
      set_epsilon : function(size) {
        options.epsilon = size;
      },
      get_epsilon : function() {
        return options.epsilon;
      },
      set_min_eigen : function(size) {
        options.min_eigen = size;
      },
      get_min_eigen : function() {
        return options.min_eigen;
      }
    };
  };

  var FeelGIF = (function () {

    var sprite;
    var points = [];
    var canvas;
    var ctx;

    function on_point_list_click(e) {
      var targ;
      if (e.target) targ = e.target;
      else if (e.srcElement) targ = e.srcElement;
      var id = targ.getAttribute("rel:index");
      points.splice(id, 1);
      rebuild_point_list();
    }

    function rebuild_point_list() {
      var list = document.getElementById("pointlist");
      while (list.firstChild) {
        list.removeChild(list.firstChild);
      }
      points.forEach(function(element, index, array) {
        var li = document.createElement("li");
        li.setAttribute("class", "pointlink");
        var a = document.createElement("a");
        switch(element.get_status()) {
        case 0:
          a.setAttribute("id", "deadpoint");
          break;
        case 1:
          a.setAttribute("id", "livepoint");
          break;
        case 2:
          a.setAttribute("id", "newpoint");
          break;
        }
        a.setAttribute("rel:index", index);
        var text = document.createTextNode(element.get_frame_point(0).x.toString() + ", " + element.get_frame_point(0).y.toString());
        a.appendChild(text);
        li.appendChild(a);
        li.addEventListener("click", on_point_list_click);
        document.getElementById("pointlist").appendChild(li);
      });
    }

    function on_canvas_click(e) {
      var coords = canvas.relMouseCoords(e);
      if(coords.x > 0 & coords.y > 0 & coords.x < canvas.width & coords.y < canvas.height) {
        points.push(new PointFrameArray(coords.x, coords.y));
        draw_circle(coords.x, coords.y, 2);
        rebuild_point_list();
      }
    }

    function draw_circle(x, y, status) {
      switch(status) {
      case 0:
        ctx.fillStyle = "rgb(255,0,0)";
        break;
      case 1:
        ctx.fillStyle = "rgb(0,255,0)";
        break;
      case 2:
        ctx.fillStyle = "rgb(0,0,255)";
        break;
      }
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI*2, true);
      ctx.closePath();
      ctx.fill();
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

    var drawPoints = function() {
      var p;
      var cur_frame = sprite.get_current_frame();
      for(var i = 0; i < points.length; ++i) {
        p = points[i].get_frame_point(cur_frame);
        if (p) {
          draw_circle(p.x, p.y, points[i].get_status());
        }
      }
    };
    document.addEventListener('gifmove', drawPoints, false);


    var setupGifControls = function() {
      document.getElementById("stop").style.color = "red";
      document.getElementById("play").style.color = "black";
      document.getElementById("pause").style.color = "black";
      document.getElementById("loopgif").style.color = "black";

      document.getElementById("play").addEventListener("click", function() {
        document.getElementById("play").style.color = "red";
        document.getElementById("stop").style.color = "black";
        document.getElementById("pause").style.color = "black";
        sprite.play();
      });
      document.getElementById("pause").addEventListener("click", function() {
        document.getElementById("play").style.color = "black";
        document.getElementById("stop").style.color = "black";
        document.getElementById("pause").style.color = "red";
        sprite.pause();
      });
      document.getElementById("stop").addEventListener("click", function() {
        document.getElementById("play").style.color = "black";
        document.getElementById("stop").style.color = "red";
        document.getElementById("pause").style.color = "black";
        sprite.pause();
        sprite.move_to(0);
      });
      document.getElementById("backward").addEventListener("click", function() {
        sprite.pause();
        sprite.move_relative(-1);
      });
      document.getElementById("forward").addEventListener("click", function() {
        sprite.pause();
        sprite.move_relative(1);
      });
      document.getElementById("loopgif").addEventListener("click", function() {
        if(sprite.get_looping()) {
          sprite.setloop(false);
          document.getElementById("loopgif").style.color = "black";
        } else {
          sprite.setloop(true);
          document.getElementById("loopgif").style.color = "red";
        }
      });
      document.getElementById("analyze").addEventListener("click", function() {
        var o = new OpticalFlowAnalyzer();
        document.removeEventListener('gifmove', drawPoints, false);
        o.analyze(sprite, points);
        rebuild_point_list();
        document.addEventListener('gifmove', drawPoints, false);
        sprite.move_to(0);
        drawPoints();
      });
      function updateControls(event) {
        if(!sprite.get_looping()) {
          document.getElementById("play").style.color = "black";
          document.getElementById("stop").style.color = "red";
          document.getElementById("pause").style.color = "black";
        }
      }
      document.addEventListener('gifloop', updateControls, false);
    };

    document.getElementById("gifsubmit").addEventListener('click', (function() {
      var drawdiv = document.getElementById("pregifcanvas");
      var src;
      sprite = new SpriteCanvas({ auto_play: false, rubbable: false });
      sprite.init();
      var loader = new GifLoader(sprite.get_loader());
      if(document.getElementById("giffile").value != "") {
        src = document.getElementById("giffile").value;
      } else {
        src = document.getElementById("gifurl").value;
      }
      loader.load(src);
      canvas = sprite.get_canvas();
      ctx = canvas.getContext("2d");
      sprite.setloop(false);
      drawdiv.appendChild(sprite.get_canvas());
      setupGifControls();
      canvas.addEventListener('click', on_canvas_click, false);
      document.getElementById("fileinput").style.display = "none";
      document.getElementById("preprocessing").style.display = "block";
    }));
  });

  FeelGIF();
});
