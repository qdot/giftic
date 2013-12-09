'use strict';

$(document).ready(function() {

  var giftic = (function() {
    var fileurl;
    var sprite;
    var points = [];
    var canvas;
    var ctx;
    var overidx = -1;
    var output = null;
    var muted = true;

    var add_output = function(evt) {
      var s = document.getElementById('outputselect');
      var index = s.selectedIndex;
      var o = s.options[index];
      var n = o.innerHTML;
      var outputs = OutputManager.outputList;
      var i;
      for (i = 0; i < outputs.length; ++i) {
        if (outputs[i].name === n) {
          $('#outputs-panel').append(outputs[i].template());
          document.addEventListener('gifmove', function(evt) {
            outputs[i].output(output[sprite.get_current_frame()]);
          });
          return;
        }
      }
    };

    var prepare_output = function() {
      $('#outputs-panel').empty();
      var outputs = OutputManager.outputList;
      var s = document.createElement('select');
      s.setAttribute('id', 'outputselect');
      var option;
      var i = 0;
      for (i = 0; i < outputs.length; ++i) {
        option = document.createElement('option');
        option.innerHTML = outputs[i].name;
        s.appendChild(option);
      }
      $('#outputs-panel').append(s);
      var b = document.createElement('input');
      b.setAttribute('type', 'button');
      b.setAttribute('value', 'Add Manager');
      b.addEventListener('click', add_output);
      $('#outputs-panel').append(b);
    };

    var load_json = function() {
      try {
        var block = $('#jsonblock').val();
        var b = JSON.parse(block);
      } catch (e) {
        console.log('Cannot load JSON');
        return;
      }
      output = b.outputs;
      show_graph();
    };

    function on_point_mouse_over(e) {
      var targ;
      if (e.target) targ = e.target;
      else if (e.srcElement) targ = e.srcElement;
      overidx = targ.getAttribute('rel:index');
      drawPoints();
    }

    function on_point_mouse_out(e) {
      overidx = -1;
      drawPoints();
    }

    function on_canvas_click(e) {
      var coords = getCursorPosition(canvas, e);
      if (coords.x > 0 &&
          coords.y > 0 &&
          coords.x < canvas.width &&
          coords.y < canvas.height) {
        points.push(new PointFrameArray(coords.x, coords.y));
        draw_circle(coords.x, coords.y, 2);
      }
    }

    function draw_circle(x, y, status) {
      switch (status) {
      case 0:
        ctx.fillStyle = 'rgb(255,0,0)';
        break;
      case 1:
        ctx.fillStyle = 'rgb(0,255,0)';
        break;
      case 2:
        ctx.fillStyle = 'rgb(0,0,255)';
        break;
      case 3:
        ctx.fillStyle = 'rgb(0,128,128)';
        break;
      }
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2, true);
      ctx.closePath();
      ctx.fill();
    }

    function getCursorPosition(canvas, event) {
      var x, y;

      var canoffset = $(canvas).offset();
      x = event.clientX + document.body.scrollLeft +
        document.documentElement.scrollLeft - Math.floor(canoffset.left);
      y = event.clientY + document.body.scrollTop +
        document.documentElement.scrollTop - Math.floor(canoffset.top) + 1;

      return {x: x, y: y};
    }

    var drawPoints = function() {
      var p;
      var cur_frame = sprite.get_current_frame();
      for (var i = 0; i < points.length; ++i) {
        p = points[i].get_frame_point(cur_frame);
        if (p) {
          if (i == overidx) {
            draw_circle(p.x, p.y, 3);
          } else {
            draw_circle(p.x, p.y, points[i].get_status());
          }
        }
      }
    };
    document.addEventListener('gifmove', drawPoints, false);

    var update_export = function() {
      var tracking_points = [];
      var fixed_output = [];
      var i;
      for (i = 0; i < points.length; ++i) {
        tracking_points.push([(points[i].get_frame_point(0).x),
                              (points[i].get_frame_point(0).y)]);
      }
      for (i = 0; i < output.length; ++i) {
        fixed_output.push(parseFloat((output[i]).toFixed(4)));
      }

      $('#json-export').val(JSON.stringify(
        {
          url: fileurl,
          giftic_version: '1.0',
          points: tracking_points,
          outputs: fixed_output
        }
      ));
    };

    var run_analysis = function() {
      var o = new OpticalFlowAnalyzer();
      document.removeEventListener('gifmove', drawPoints, false);
      o.analyze(sprite, points);
      //Remove all points that didn't live through processing
      points = points.filter(function(p) { return p.get_status() > 0;});
      if (points.length === 0) {
        $('#error-panel').show();
        $('#error-message').text('No points were able to be tracked for movement. Please select new points.');
        return;
      }
      $('#error-panel').hide();
      var a = new IntensityAnalyzer();
      output = a.analyze(points);
      update_export();
      document.addEventListener('gifmove', drawPoints, false);
      sprite.move_to(0);
      drawPoints();
      show_graph();
    };

    var show_graph = function() {
      $.jqplot.config.enablePlugins = true;
      if ($('#canvas-panel').hasClass('center-panel')) {
        $('#canvas-panel').removeClass('center-panel');
        $('#canvas-panel').addClass('pull-left');
        $('#side-panel').show();
      }
      $('#graph-panel').empty();
      var z = (function() {
        var ar = [];
        for (var i = 0; i < output.length; ++i) {
          ar.push([i, output[i]]);
        }
        return ar;
      })();
      var plot = $.jqplot('graph-panel', [z],
                          {
                            // Series options are specified as an array of
                            // objects, one object for each series.
                            series: [
                              {
                                // Change our line width and use a diamond
                                // shaped marker.
                                lineWidth: 2,
                                markerOptions: { style: 'diamond' },
                                dragable: {
                                  color: '#FF0000',
                                  constrainTo: 'y'
                                }
                              }
                            ],
                            axesDefaults: {
                              pad: 0,
                              tickOptions: {
                                showGridline: false
                              }
                            },
                            axes: {
                              xaxis: {
                                numberTicks: z.length
                              }
                            },
                            highlighter: {
                              show: true,
                              sizeAdjust: 7.5
                            },
                            cursor: {
                              show: false
                            }
                          });

      //http://jsfiddle.net/Boro/5QA8r/
      function DoSomeThing() {
        // *** highlight point in plot ***
        //console.log(" sth "+ plot.series[0].data[1][1]);
        var seriesIndex = 0; //0 as we have just one series
        var data = plot.series[seriesIndex].data;
        var pointIndex = sprite.get_current_frame();
        var x = plot.axes.xaxis.series_u2p(data[pointIndex][0]);
        var y = plot.axes.yaxis.series_u2p(data[pointIndex][1]);
        console.log('x= ' + x + '  y= ' + y);
        var r = 5;
        var drawingCanvas = $('.jqplot-highlight-canvas')[0];
        var context = drawingCanvas.getContext('2d');
        context.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height);
        context.strokeStyle = '#000000';
        context.fillStyle = '#FF00FF';
        context.beginPath();
        context.arc(x, y, r, 0, Math.PI * 2, true);
        context.closePath();
        context.stroke();
        context.fill();
      }
      document.addEventListener('gifmove', DoSomeThing, false);
    };

    var setupapp = function() {
      $('#loading-panel').hide();
      $('#application').show();
      $('#loading-panel').empty();
      $('#canvas-panel').prepend(canvas);
      $('#canvas-panel').width(canvas.width);
      $('#canvas-panel').height(canvas.height + 30);
      $('#side-panel').width(500);
      prepare_output();
      canvas.addEventListener('click', on_canvas_click, false);
    };

    var loadapp = function(src) {
      $('#file-panel').hide();
      $('#loading-panel').show();
      fileurl = src;
      sprite = new SpriteCanvas({ auto_play: false, rubbable: false });
      sprite.init();
      var loader = new GifLoader(sprite);
      if (typeof src === 'object') {
        loader.load_file(src);
      } else {
        loader.load_url(src);
      }
      canvas = sprite.get_canvas();
      ctx = canvas.getContext('2d');
      sprite.setloop(false);
      sprite.set_success_callback(setupapp);
      $('#loading-panel').append(sprite.get_canvas());
    };

    function url_domain(data) {
      var a = document.createElement('a');
      a.href = data;
      return a.host;
    }

    function url_protocol(data) {
      var a = document.createElement('a');
      a.href = data;
      return a.protocol;
    }

    $('#gobutton').click(function() {
      if (document.getElementById('fileinput').files.length > 0) {
        loadapp(document.getElementById('fileinput').files[0]);
        return;
      }
      var url = $('#fileselect').val();
      var docurl = window.location.href;
      var dochost = url_domain(docurl);
      var urlhost = url_domain(url);
      if (urlhost === dochost) {
        loadapp(url);
      } else if (dochost === 'localhost' || dochost === '127.0.0.1') {
        // If we're already on the local test webserver, use its bouncer to get
        // around CORS
        loadapp('http://127.0.0.1:8080/gifload' +
                '?g=' + url);
      } else {
        // TODO: Pop a warning about CORS, allow user to choose to go ahead,
        // choose another file. Also make automatic.
      }
    });

    $('#filebutton').click(function(e) {
      $('#fileinput').click();
    });

    $('#analyze').click(function(e) {
      run_analysis();
    });

    $('#fileinput').change(function(e) {
      $('#fileselect').val($('#fileinput').val());
    });

    $(document).on('keypress', function(eve) {
      if (eve.keyCode == 13 && $('#gobutton').is(':visible')) {
        $('#gobutton').click();
      }
    });
  });

  giftic();
});
