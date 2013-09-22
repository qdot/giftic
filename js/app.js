'use strict';

$(document).ready(function() {

  var giftic = (function() {

    var sprite;
    var points = [];
    var canvas;
    var ctx;
    var overidx = -1;
    var output = null;
    var muted = true;
    var mode;

    function switch_mode(m) {
      if (mode === m) {
        return;
      }
      mode = m;
      var e;
      $('.apppanel').children().each(function(i) {
        e = $(this).detach();
        $('#appelements').append(e);
      });
      $('.help-text').children().each(function(i) {
        e = $(this).detach();
        $('#appelements').append(e);
      });
      $('#select-button').removeClass('active');
      $('#preview-button').removeClass('active');
      $('#spoints-button').removeClass('active');
      $('#inspect-button').removeClass('active');
      $('#export-button').removeClass('active');

      switch (m) {
      case 'file':
        $('#select-button').addClass('active');
        e = $('#fileinput').detach();
        $('.apppanel').append(e);
        e = $('#fileinput-help').detach();
        $('.help-text').append(e);
        break;
      case 'preview':
        $('#preview-button').addClass('active');
        $('#preview-button').removeClass('disabled');
        $('#spoints-button').removeClass('disabled');
        $('#inspect-button').removeClass('disabled');
        e = $('#sprite').detach();
        $('.apppanel').append(e);
        e = $('#preview-help').detach();
        $('.help-text').append(e);
        canvas.removeEventListener('click', on_canvas_click, false);
        break;
      case 'select':
        $('#spoints-button').addClass('active');
        e = $('#sprite').detach();
        $('.apppanel').append(e);
        e = $('#select-help').detach();
        $('.help-text').append(e);
        canvas.addEventListener('click', on_canvas_click, false);
        break;
      case 'output':
        $('#inspect-button').addClass('active');
        $('#export-button').removeClass('disabled');
        e = $('#sprite').detach();
        $('.apppanel').append(e);
        e = $('#chartdiv').detach();
        $('.apppanel').append(e);
        e = $('#outputdiv').detach();
        $('.apppanel').append(e);
        e = $('#inspect-help').detach();
        $('.help-text').append(e);
        run_analysis();
        break;
      case 'export':
        $('#export-button').addClass('active');
        e = $('#exportdiv').detach();
        $('.apppanel').append(e);
        break;
      default:
        break;
      }
    }

    function on_point_list_click(e) {
      var targ;
      if (e.target) targ = e.target;
      else if (e.srcElement) targ = e.srcElement;
      var id = targ.getAttribute('rel:index');
      points.splice(id, 1);
      //rebuild_point_list();
      sprite.move_to(sprite.get_current_frame());
    }

    function rebuild_point_list() {
      var list = document.getElementById('pointlist');
      while (list.firstChild) {
        list.removeChild(list.firstChild);
      }
      points.forEach(function(element, index, array) {
        var li = document.createElement('li');
        var a = document.createElement('a');
        switch (element.get_status()) {
        case 0:
          a.setAttribute('id', 'deadpoint');
          break;
        case 1:
          a.setAttribute('id', 'livepoint');
          break;
        case 2:
          a.setAttribute('id', 'newpoint');
          break;
        }
        a.setAttribute('rel:index', index);
        var text = document.createTextNode(
          element.get_frame_point(0).x.toString() +
            ', ' +
            element.get_frame_point(0).y.toString());
        a.appendChild(text);
        li.appendChild(a);
        a.addEventListener('click', on_point_list_click);
        a.onmouseover = on_point_mouse_over;
        a.onmouseout = on_point_mouse_out;
        document.getElementById('pointlist').appendChild(li);
      });
    }

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
      var coords = canvas.relMouseCoords(e);
      if (coords.x > 0 &&
          coords.y > 0 &&
          coords.x < canvas.width &&
          coords.y < canvas.height) {
        points.push(new PointFrameArray(coords.x, coords.y));
        draw_circle(coords.x, coords.y, 2);
        //rebuild_point_list();
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

    function relMouseCoords(event) {
      var totalOffsetX = 0,
          totalOffsetY = 0,
          canvasX = 0,
          canvasY = 0;
      var currentElement = this;

      do {
        totalOffsetX += currentElement.offsetLeft - currentElement.scrollLeft;
        totalOffsetY += currentElement.offsetTop - currentElement.scrollTop;
      } while (currentElement = currentElement.offsetParent);

      canvasX = event.pageX - totalOffsetX;
      canvasY = event.pageY - totalOffsetY;

      return {x: canvasX, y: canvasY};
    }

    HTMLCanvasElement.prototype.relMouseCoords = relMouseCoords;

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
          name: '',
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
      var a = new IntensityAnalyzer();
      output = a.analyze(points);
      update_export();
      //rebuild_point_list();
      document.addEventListener('gifmove', drawPoints, false);
      sprite.move_to(0);
      drawPoints();
      var z = (function() {
        var ar = [];
        for (var i = 0; i < output.length; ++i) {
          ar.push([i, output[i]]);
        }
        return ar;
      })();
      $.jqplot.config.enablePlugins = true;
      var plot = $.jqplot('chartdiv', [z],
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

    var loadapp = function(src) {
      sprite = new SpriteCanvas({ auto_play: false, rubbable: false });
      sprite.init();
      var loader = new GifLoader(sprite);
      loader.load(src);
      canvas = sprite.get_canvas();
      ctx = canvas.getContext('2d');
      sprite.setloop(false);
      $('#spritecanvas').empty();
      $('#spritecanvas').append(sprite.get_canvas());
      switch_mode('preview');
    };

    $('#furryporn').click(function() {
      loadapp('test.gif');
    });

    $('#bigfurryporn').click(function() {
      loadapp('test4.gif');
    });

    $('#blowjob').click(function() {
      loadapp('test3.gif');
    });

    $('#weird').click(function() {
      loadapp('test2.gif');
    });

    $('#gifsubmit').click(function() {
      var src;
      if ($('#giffile').val() != '') {
        src = $('#giffile').val().replace('C:\\fakepath\\', '');
      } else if ($('#gifremoteurl').val() != '') {
        src = 'http://distro.nonpolynomial.com/files/giftic/proxy.php?requrl=' +
          $('#gifremoteurl').val();
      } else {
        src = $('#gifurl').val();
      }
      loadapp(src);
    });

    $('#select-button').click(function() {
      if (!$('#select-button').hasClass('disabled')) {
        switch_mode('file');
      }
    });

    $('#preview-button').click(function() {
      if (!$('#preview-button').hasClass('disabled')) {
        switch_mode('preview');
      }
    });

    $('#spoints-button').click(function() {
      if (!$('#spoints-button').hasClass('disabled')) {
        switch_mode('select');
      }
    });

    $('#inspect-button').click(function() {
      if (!$('#inspect-button').hasClass('disabled')) {
        switch_mode('output');
      }
    });

    $('#export-button').click(function() {
      if (!$('#inspect-button').hasClass('disabled')) {
        switch_mode('export');
      }
    });

    switch_mode('file');
  });

  giftic();

  // $(window).resize(function(){
  //   $('.appdiv').css({
  //     position:'absolute',
  //     left: ($(window).width() - $('.appdiv').outerWidth())/2,
  //     top: ($(window).height() - $('.appdiv').outerHeight())/2
  //   });
  // });

  // To initially run the function:
  //$(window).resize();
});
