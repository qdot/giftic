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
      $('#view-button').removeClass('active');

      switch (m) {
      case 'select':
        $('#select-button').addClass('active');
        $('#view-button').addClass('disabled');
        e = $('#fileinput').detach();
        $('.apppanel').append(e);
        break;
      case 'view':
        $('#view-button').addClass('active');
        $('#view-button').removeClass('disabled');
        e = $('#sprite').detach();
        $('.apppanel').append(e);
        var e = $('#chartdiv').detach();
        $('.apppanel').append(e);
        break;
      default:
        break;
      }
    }

    var load_json = function() {
      var block = $('#jsonblock').val();
      var b = JSON.parse(block);
      output = b.outputs;
      show_graph();
    };

    var show_graph = function() {
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
      loader.load(src);
      canvas = sprite.get_canvas();
      ctx = canvas.getContext('2d');
      sprite.setloop(false);
      $('#spritecanvas').empty();
      $('#spritecanvas').append(sprite.get_canvas());
      switch_mode('view');
      load_json();
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
      if ($('#giffile').val() != '') {
        loadapp($('#giffile').val().replace('C:\\fakepath\\', ''));
      } else if ($('#gifremoteurl').val() != '') {
        loadapp('http://distro.nonpolynomial.com/' +
                'files/giftic/proxy.php?requrl=' +
                $('#gifremoteurl').val());
      } else {
        loadapp($('#gifurl').val());
      }
    });

    $('#select-button').click(function() {
      if (!$('#select-button').hasClass('disabled')) {
        switch_mode('select');
      }
    });

    $('#view-button').click(function() {
      if (!$('#view-button').hasClass('disabled')) {
        switch_mode('view');
      }
    });

    switch_mode('select');
  });

  giftic();
});
