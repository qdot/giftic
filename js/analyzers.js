'use strict';

var CommandArray = function() {
  var commands = [];
  var addCommand = function(s, d) {
    commands.push({speed: s, direction: d});
  };
  return {
    add_cmd: addCommand,
    get_cmd: function(idx) { return commands[idx]; }
  };
};

var PointFrameArray = function(x, y) {
  var points = [];
  var status = 2;

  var clearHistory = function() {
    points.splice(1, points.length - 1);
  };

  var getFramePoint = function(i) {
    if (i < points.length) {
      return points[i];
    }
    return null;
  };

  var addFramePoint = function(x, y) {
    points.push({x: x, y: y});
  };

  var getLastPoint = function(p) {
    if (points.length == 0) {
      return null;
    }
    return points[points.length - 1];
  };

  addFramePoint(x, y);

  return {
    points: points,
    set_status: function(s) { status = s; },
    get_status: function() { return status; },
    clear_history: clearHistory,
    get_last_point: getLastPoint,
    get_frame_point: getFramePoint,
    add_frame_point: addFramePoint,
    get_num_points: function() { return points.length; }
  };
};

var IntensityAnalyzer = function() {
  var max;

  var analyze = function(points) {
    var i;
    var frame_intensities = [];
    for (i = 0; i < points.length; ++i) {
      if (points[i].get_status() === 0) {
        continue;
      }
      var frames_is = [];
      var frame_num = 0;
      var prev = points[i].get_last_point();
      var curr = points[i].get_frame_point(frame_num);
      while (curr !== null) {
        frames_is[frame_num] = Math.sqrt(Math.pow(curr.y - prev.y, 2) +
                                         Math.pow(curr.x - prev.x, 2));
        frame_num++;
        prev = curr;
        curr = points[i].get_frame_point(frame_num);
      }
      frame_intensities.push(frames_is);
    }
    if (frame_intensities.length == 0) {
      return undefined;
    }
    var cmd = new CommandArray();
    var max = 0;
    var avg = 0;
    var avgs = [];
    var c, j;
    for (i = 0; i < frame_intensities[0].length; ++i) {
      c = 0;
      for (j = 0; j < frame_intensities.length; ++j) {
        c += frame_intensities[j][i];
      }
      avg = c / frame_intensities.length;
      if (avg > max) max = avg;
      avgs.push(avg);
    }
    var final_avg = [];
    for (i = 0; i < avgs.length; ++i) {
      final_avg.push(avgs[i] / max);
    }
    return final_avg;
  };
  return {
    analyze: analyze
  };
};

var OpticalFlowAnalyzer = function() {
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
    var ctx = canvas.getContext('2d');
    var cur_frame;
    var imageData;
    var i;

    curr_img_pyr = new jsfeat.pyramid_t(3);
    prev_img_pyr = new jsfeat.pyramid_t(3);
    curr_img_pyr.allocate(canvas.width,
                          canvas.height,
                          jsfeat.U8_t | jsfeat.C1_t);
    prev_img_pyr.allocate(canvas.width,
                          canvas.height,
                          jsfeat.U8_t | jsfeat.C1_t);

    point_status = new Uint8Array(points.length);
    point_count = points.length;
    prev_xy = new Float32Array(points.length * 2);
    curr_xy = new Float32Array(points.length * 2);
    for (i = 0; i < points.length; ++i) {
      points[i].clear_history();
      curr_xy[i * 2] = points[i].get_frame_point(0).x;
      curr_xy[(i * 2) + 1] = points[i].get_frame_point(0).y;
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
      jsfeat.optical_flow_lk.track(prev_img_pyr,
                                   curr_img_pyr,
                                   prev_xy,
                                   curr_xy,
                                   point_count,
                                   options.win_size | 0,
                                   options.max_iterations | 0,
                                   point_status,
                                   options.epsilon,
                                   options.min_eigen);

      var current_point = 0;
      var new_point_count = 0;
      for (i = 0; i < point_count && current_point < points.length; ++i) {
        while (!points[current_point].get_status()) {
          current_point++;
          if (current_point == points.length) {
            return;
          }
        }

        points[current_point].add_frame_point(curr_xy[i * 2],
                                              curr_xy[(i * 2) + 1]);
        points[current_point].set_status(point_status[i]);

        if (point_status[i]) {
          if (new_point_count != i) {
            // No splice for array buffers.:(
            curr_xy[new_point_count * 2] = curr_xy[i * 2];
            curr_xy[(new_point_count * 2) + 1] = curr_xy[(i * 2) + 1];
          }
          new_point_count = new_point_count + 1;
        }
        current_point++;
      }
      // Out of points to process. Exit.
      if (!new_point_count) {
        return;
      }
      point_count = new_point_count;
      cur_frame = sprite.get_current_frame();
      sprite.move_relative(1);
    } while (cur_frame < sprite.get_current_frame());
  };

  return {
    analyze: analyze,
    set_win_size: function(size) {
      options.win_size = size;
    },
    get_win_size: function() {
      return options.win_size;
    },
    set_max_iterations: function(size) {
      options.max_iterations = size;
    },
    get_max_iterations: function() {
      return options.max_iterations;
    },
    set_epsilon: function(size) {
      options.epsilon = size;
    },
    get_epsilon: function() {
      return options.epsilon;
    },
    set_min_eigen: function(size) {
      options.min_eigen = size;
    },
    get_min_eigen: function() {
      return options.min_eigen;
    }
  };
};
