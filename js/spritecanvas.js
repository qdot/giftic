"use strict";

var SpriteLoaderCallbacks = {
  onLoadInfo : "",
  onLoadFrame : "",
  onLoadError : "",
  onLoadSuccess : "",
  onLoadProgress : ""
};

var SpritePlayerControls = (function () {
  var init = function() {
    $("#stop").css("color", "red");
    $("#play").css("color",  "black");
    $("#pause").css("color",  "black");
    $("#loopgif").css("color",  "black");

    $("#play").click(function() {
      $("#play").css("color",  "red");
      $("#stop").css("color",  "black");
      $("#pause").css("color",  "black");
      sprite.play();
    });
    $("#pause").click(function() {
      $("#play").css("color",  "black");
      $("#stop").css("color",  "black");
      $("#pause").css("color",  "red");
      sprite.pause();
    });
    $("#stop").click(function() {
      $("#play").css("color",  "black");
      $("#stop").css("color",  "red");
      $("#pause").css("color",  "black");
      sprite.pause();
      sprite.move_to(0);
    });
    $("#backward").click(function() {
      sprite.pause();
      sprite.move_relative(-1);
    });
    $("#forward").click(function() {
      sprite.pause();
      sprite.move_relative(1);
    });
    $("#loopgif").click(function() {
      if(sprite.get_looping()) {
        sprite.setloop(false);
        $("#loopgif").css("color",  "black");
      } else {
        sprite.setloop(true);
        $("#loopgif").css("color",  "red");
      }
    });
    function updateControls(event) {
      if(!sprite.get_looping()) {
        $("#play").style.color = "black";
        $("#stop").style.color = "red";
        $("#pause").style.color = "black";
        jig.output(0);
      }
    }
    document.addEventListener('gifloop', updateControls, false);
  };
  return {
    init : init
  };
});

var SpriteCanvas = function ( options ) {
  var playing = true;
  var loop = true;
  var loadError;
  var forward = true;
  var ctx_scaled = false;
  var canvas, ctx;
  var success_callback = undefined;
  var initialized = false;
  var load_callback = false;
  var controls = SpritePlayerControls();
  var moveEvent = document.createEvent("Event");
  moveEvent.initEvent("gifmove",true,true);
  var loopEvent = document.createEvent("Event");
  loopEvent.initEvent("gifloop",true,true);

  var frames = [];

  // var gif = options.gif;
  if (typeof options.auto_play == 'undefined') {
    options.auto_play = false; //(!gif.getAttribute('rel:auto_play') || gif.getAttribute('rel:auto_play') == '1');
  }

  if (typeof options.rubbable == 'undefined') {
    options.rubbable = false; //(!gif.getAttribute('rel:rubbable') || gif.getAttribute('rel:rubbable') == '1');
  }

  var onLoadInfo = function(width, height) {
    canvas.width = width;
    canvas.height = height;
  };

  var onLoadSuccess = function() {
    player.init();
    if (success_callback) {
      success_callback();
    }
  };

  var onLoadProgress = function (pos, length, draw) {
    if (draw) {
      var height = 25;
      var top = (canvas.height - height);
      var mid = (pos / length) * canvas.width;

      if (frames && frames.length > 0) {
        ctx.putImageData(frames[frames.length - 1].data, 0, 0);
      }
      // XXX Figure out alpha fillRect.
      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      ctx.fillRect(mid, top, canvas.width - mid, height);

      ctx.fillStyle = 'rgba(255,0,22,.8)';
      ctx.fillRect(0, top, (pos / length) * canvas.width, height);

    }
  };

  var onLoadError = function (originOfError) {
    var drawError = function () {
      ctx.fillStyle = 'black';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = 'red';
      ctx.lineWidth = 3;
      ctx.moveTo(0, 0);
      ctx.lineTo(canvas.width, canvas.height);
      ctx.moveTo(0, canvas.height);
      ctx.lineTo(canvas.width, 0);
      ctx.stroke();
    };

    loadError = originOfError;
    frames = [];
    drawError();
  };

  var onLoadFrame = function(frame) {
    frames.push(frame);
    if (!ctx_scaled)
    {
      ctx.scale(get_canvas_scale(),get_canvas_scale());
      ctx_scaled = true;
    }
  };

  var player = (function () {
    var i = -1;
    var delayInfo;

    var showingInfo = false;
    var pinned = false;

    var stepFrame = function (delta) { // XXX: Name is confusing.
      i = (i + delta + frames.length) % frames.length;
      delayInfo = frames[i].delay;
      putFrame();
      if (i == frames.length - 1) {
        document.dispatchEvent(loopEvent);
      }
    };

    var step = (function () {
      var stepping = false;

      var doStep = function () {
        stepping = playing;
        if (!stepping) return;
        if (!loop && i == frames.length - 1) {
          stepping = false;
          setTimeout(pause, 0);
        }
        stepFrame(forward ? 1 : -1);
        var delay = frames[i].delay * 10;
        if (!delay) delay = 100; // FIXME: Should this even default at all? What should it be?
        setTimeout(doStep, delay);
      };

      return function () {
        if (!stepping) setTimeout(doStep, 0);
      };
    }());

    var putFrame = function () {
      ctx.putImageData(frames[i].data, 0, 0);
      document.dispatchEvent(moveEvent);
    };

    var play = function () {
      playing = true;
      step();
    };

    var pause = function () {
      playing = false;
    };

    var setloop = function (b) {
      loop = b;
    };

    return {
      init: function () {
        if (loadError) return;

        ctx.scale(get_canvas_scale(),get_canvas_scale());

        if (options.auto_play) {
          step();
        }
        else {
          i = 0;
          putFrame();
        }
      },
      setloop: setloop,
      current_frame: function() { return i; },
      step: step,
      play: play,
      pause: pause,
      move_relative: stepFrame,
      length: function() { return frames.length; },
      move_to: function ( frame_idx ) {
        i = frame_idx;
        putFrame();
      }
    };
  }());

  var register_canvas_handers = function () {

    var maxTime = 1000,
        // allow movement if < 1000 ms (1 sec)
        maxDistance = Math.floor(canvas.width / (player.length() * 2)),
        // swipe movement of 50 pixels triggers the swipe
        startX = 0,
        startTime = 0;

    var cantouch = "ontouchend" in document;

    var aj = 0;
    var last_played = 0;

    var startup = function (e) {
      // prevent image drag (Firefox)
      e.preventDefault();
      if (options.auto_play) player.pause();

      var pos = (e.touches && e.touches.length > 0) ? e.touches[0] : e;

      var x = (pos.layerX > 0) ? pos.layerX : canvas.width / 2;
      var progress = x / canvas.width;

      player.move_to( Math.floor(progress * (player.length() - 1)) );

      startTime = e.timeStamp;
      startX = pos.pageX;
    };
    canvas.addEventListener((cantouch) ? 'touchstart' : 'mousedown', startup );

    var shutdown = function (e) {
      startTime = 0;
      startX = 0;
      if (options.auto_play) player.play();
    };
    canvas.addEventListener((cantouch) ? 'touchend' : 'mouseup', shutdown);

    var moveprogress = function (e) {
      e.preventDefault();
      var pos = (e.touches && e.touches.length > 0) ? e.touches[0] : e;

      var currentX = pos.pageX;
      currentDistance = (startX === 0) ? 0 : Math.abs(currentX - startX);
      // allow if movement < 1 sec
      currentTime = e.timeStamp;
      if (startTime !== 0 && currentDistance > maxDistance) {
        if (currentX < startX && player.current_frame() > 0) {
          player.move_relative(-1);
        }
        if (currentX > startX && player.current_frame() < player.length() - 1) {
          player.move_relative(1);
        }
        startTime = e.timeStamp;
        startX = pos.pageX;
      }

    };
    canvas.addEventListener((cantouch) ? 'touchmove' : 'mousemove', moveprogress);
  };

  var init_controls = function() {
    $("#stop").css("color", "red");
    $("#play").css("color",  "black");
    $("#pause").css("color",  "black");
    $("#loopgif").css("color",  "black");

    $("#play").click(function() {
      $("#play").css("color",  "red");
      $("#stop").css("color",  "black");
      $("#pause").css("color",  "black");
      player.play();
    });
    $("#pause").click(function() {
      $("#play").css("color",  "black");
      $("#stop").css("color",  "black");
      $("#pause").css("color",  "red");
      player.pause();
    });
    $("#stop").click(function() {
      $("#play").css("color",  "black");
      $("#stop").css("color",  "red");
      $("#pause").css("color",  "black");
      player.pause();
      player.move_to(0);
    });
    $("#backward").click(function() {
      player.pause();
      player.move_relative(-1);
    });
    $("#forward").click(function() {
      player.pause();
      player.move_relative(1);
    });
    $("#loopgif").click(function() {
      if(loop) {
        loop = false;
        $("#loopgif").css("color",  "black");
      } else {
        loop = true;
        $("#loopgif").css("color",  "red");
      }
    });
    function updateControls(event) {
      if(loop) {
        $("#play").style.color = "black";
        $("#stop").style.color = "red";
        $("#pause").style.color = "black";
      }
    }
    document.addEventListener('gifloop', updateControls, false);
  };

  var init = function () {
    if (initialized) return;
    canvas = document.createElement('canvas');
    ctx = canvas.getContext('2d');
    init_controls();
    initialized = true;
  };

  var get_canvas_scale = function() {
    if (options.max_width && canvas.width > options.max_width)
    {
      return options.max_width / canvas.width;
    }
    else
    {
      return 1;
    }
  };

  return {
    // play controls
    play: player.play,
    pause: player.pause,
    move_relative: player.move_relative,
    move_to: player.move_to,
    setloop: player.setloop,
    init: init,
    // getters for instance vars
    get_looping: function() {
      return loop;
    },
    get_playing: function() {
      return playing;
    },
    get_canvas: function() {
      return canvas;
    },
    get_loading: function() {
      return loading;
    },
    get_auto_play: function() {
      return options.auto_play;
    },
    get_length: function() {
      return player.length();
    },
    get_current_frame: function() {
      return player.current_frame();
    },
    set_success_callback: function(s) {
      success_callback = s;
    },
    onLoadInfo : onLoadInfo,
    onLoadFrame : onLoadFrame,
    onLoadError : onLoadError,
    onLoadSuccess : onLoadSuccess,
    onLoadProgress : onLoadProgress
  };

};
