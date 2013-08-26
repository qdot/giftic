# giftic

By Kyle Machulis (qDot) <kyle@nonpolynomial.com>

Part of the Fuck Everything Project - http://www.feverything.com

## Overview

giftic eats gifs and outputs feels.

It's a haptic renderer for animated GIFs. Actually, it's a haptic
renderer for anything that can be decomposed into frames and rendered
to an HTML5 canvas, so it'll work with SVG, APNG, and other formats,
though GIFs are probably going to be the most popular use case. It
also can put out control signals to whatever you want, not just haptic
control. But we're getting ahead of ourselves here.

For the haptic rendering, there's multiple output methods giftic
can use:

* WebVibration (for compatible browsers)
* Joystick Haptics as part of WebJoystick API (for compatible
  browsers)
* Audio (for [OhMiBod](http://ohmibod.com) and similar audio
  controlled vibrators)
* WebSocket output (for [RealTouch](http://www.realtouch.com) and
  other toys which requires access outside of the browser)

## Architecture

giftic is made up of two components, the encoder and the player. The
encoder is a tool to create new haptic encoding info for an animation.
It can even automatically encode information based on movement in the
animation, which can then be hand adjusted afterward. Haptic
information is exported from the encoder for later use.

The player provides an interface to replay patterns created with the
encoder.

All components of giftic are pure client-side javascript. No
information needs to be transfered to a server to use giftic, meaning
that usage can be kept private. 

## Image Fetching

## Libraries

giftic is built on top of the following libraries:

* [bootstrap](http://getbootstrap.com) - So we look like everyone else
  that's hip and cool
* [jquery](http://jquery.com) - Because why not
* [jsgif](https://github.com/shachaf/jsgif)/[libgif.js](https://github.com/buzzfeed/libgif-js) - Ripped apart for gif decoder
* [jqplot](http://jqplot.com) - Pattern graphing and manipulation
* [jsfeat](http://inspirit.github.io/jsfeat) - Lucas Kinade Optical
  Flow Algorithm for auto encoding
* [jiggly.js](http://github.com/qdot/jiggly.js) - Vibration output
  abstraction
* [howler.js](http://github.com/goldfire/howler.js) - Audio output
  abstraction

## License

Covered under the BSD license. See LICENSE.txt for more info
