'use strict';

$(document).ready(function() {

  var giftic = (function() {
    var appmode;
    var fileurl;
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
      // $('.apppanel').children().each(function(i) {
      //   e = $(this).detach();
      //   $('#appelements').append(e);
      // });
      // $('.help-text').children().each(function(i) {
      //   e = $(this).detach();
      //   $('#appelements').append(e);
      // });

      if (appmode === "create") {
        $('#create-select-button').removeClass('active');
        $('#create-preview-button').removeClass('active');
        $('#create-spoints-button').removeClass('active');
        $('#create-inspect-button').removeClass('active');
        $('#create-export-button').removeClass('active');

        switch (m) {
        case 'file':
          e = $('.file-opener').detach();
          $('.appdiv').append(e);
          break;
          // $('#create-select-button').addClass('active');
          // e = $('#fileinput').detach();
          // $('.apppanel').append(e);
          // e = $('#fileinput-help').detach();
          // $('.help-text').append(e);
          // break;
        case 'preview':
          $('#create-preview-button').addClass('active');
          $('#create-preview-button').removeClass('disabled');
          $('#create-spoints-button').removeClass('disabled');
          $('#create-inspect-button').removeClass('disabled');
          e = $('#sprite').detach();
          $('.apppanel').append(e);
          e = $('#preview-help').detach();
          $('.help-text').append(e);
          canvas.removeEventListener('click', on_canvas_click, false);
          break;
        case 'select':
          $('#create-spoints-button').addClass('active');
          e = $('#sprite').detach();
          $('.apppanel').append(e);
          e = $('#select-help').detach();
          $('.help-text').append(e);
          canvas.addEventListener('click', on_canvas_click, false);
          break;
        case 'output':
          $('#create-inspect-button').addClass('active');
          $('#create-export-button').removeClass('disabled');
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
          $('#create-export-button').addClass('active');
          e = $('#exportdiv').detach();
          $('.apppanel').append(e);
          break;
        default:
          break;
        }
      } else {
        $('#view-select-button').removeClass('active');
        $('#view-view-button').removeClass('active');

        switch (m) {
        case 'select':
          $('#view-select-button').addClass('active');
          $('#view-view-button').addClass('disabled');
          e = $('#fileinput').detach();
          $('.apppanel').append(e);
          break;
        case 'view':
          $('#view-view-button').addClass('active');
          $('#view-view-button').removeClass('disabled');
          e = $('#sprite').detach();
          $('.apppanel').append(e);
          e = $('#chartdiv').detach();
          $('.apppanel').append(e);
          e = $('#outputdiv').detach();
          $('.apppanel').append(e);
          prepare_output();
          break;
        default:
          break;
        }
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

    // http://stackoverflow.com/questions/8498592/extract-root-domain-name-from-string
    function url_domain(data) {
      var a = document.createElement('a');
      a.href = data;
      return a.hostname;
    }

    function url_protocol(data) {
      var a = document.createElement('a');
      a.href = data;
      return a.protocol;
    }

    $('#gifsubmit').click(function() {
      if (document.getElementById('fileinput').files.length > 0) {
        loadapp(document.getElementById('fileinput').files[0]);
        return;
      }
      var url = $('#fileselect').val();
      var docurl = window.location.href;
      var dochost = url_domain(docurl);
      var urlhost = url_domain(url);
      if (urlhost === dochost) {
        // If we're on the same domain, load as usual. This may break if we're
        // trying to open file:// while accessing giftic from file:// but
        // whatever.
        loadapp(url);
      } else if (dochost === "localhost" || dochost === "127.0.0.1") {
        // If we're already on the local test webserver, use its bouncer to get
        // around CORS
        loadapp('http://127.0.0.1:8080/gifload' +
                '?g=' + $('#giflocalurl').val());
      } else {
        // If we're remote or else using file:// access, use the remote bouncer
        loadapp('http://distro.nonpolynomial.com/' +
                'files/giftic/proxy.php?requrl=' +
                $('#gifremoteurl').val());
      }
    });

    $('#create-select-button').click(function() {
      if (!$('#create-select-button').hasClass('disabled')) {
        switch_mode('file');
      }
    });

    $('#view-select-button').click(function() {
      if (!$('#view-select-button').hasClass('disabled')) {
        switch_mode('file');
      }
    });

    $('#create-preview-button').click(function() {
      if (!$('#create-preview-button').hasClass('disabled')) {
        switch_mode('preview');
      }
    });

    $('#create-spoints-button').click(function() {
      if (!$('#create-spoints-button').hasClass('disabled')) {
        switch_mode('select');
      }
    });

    $('#create-inspect-button').click(function() {
      if (!$('#create-inspect-button').hasClass('disabled')) {
        switch_mode('output');
      }
    });

    $('#create-export-button').click(function() {
      if (!$('#create-inspect-button').hasClass('disabled')) {
        switch_mode('export');
      }
    });

    $('#view-view-button').click(function() {
      if (!$('#view-view-button').hasClass('disabled')) {
        switch_mode('view');
      }
    });

    $('#createmode').click(function() {
      appmode = "create";
      var e;
      $('.appdiv').children().each(function(i) {
        e = $(this).detach();
        $('#appelements').append(e);
      });
      // e = $('.creator-navigation').detach();
      // $('.appdiv').append(e);
      // e = $('.application').detach();
      // $('.appdiv').append(e);
      switch_mode('file');
    });

    $('#viewmode').click(function() {
      appmode = "view";
      var e;
      $('.appdiv').children().each(function(i) {
        e = $(this).detach();
        $('#appelements').append(e);
      });
      // e = $('.viewer-navigation').detach();
      // $('.appdiv').append(e);
      // e = $('.application').detach();
      // $('.appdiv').append(e);
      switch_mode('select');
    });

		$('#filebutton').click(function(e) {
			$('#fileinput').click();
		});

		$('#fileinput').change(function(e) {
      $('#fileselect').val($('#fileinput').val());
		});

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
