/*
 * Rotoscoper app.js
 * https://github.com/boazsender/Rotoscoper
 *
 * Copyright (c) 2010 Boaz Sender
 * Authors: Boaz Sender
 * Dual licensed under the MIT and GPL licenses.
 * http://code.bocoup.com/license/
 * 
 * Canvas drawing code based on work from Mike Taylor's home page
 * "_MT.CanvasDrawr" at http://miketaylr.com
 *
 */

(function( global, $ ) {


  //  rotoFrame public API
  function rotoFrame( options ) {
    return new Frame( options );
  }

  //  Frame ctor
  //    deps: Popcorn, jQuery, Underscore
  function Frame( options ) {

    var self = this;

    options.fps || ( options.fps = 35 );
  
    _.extend( this, options );

    this.frames = {
      data: null, 
      last: null
    };
    
    this.kernal.listen( "play", function() {

      self.frames.data = self.storage();

      //  Call the rendering throttler
      self.throttle();

    }); 

    this.initMouse();
  
    return this;
  }

  Frame.prototype.initMouse = function() {
    var self = this;
    //set pX and pY from first click
    this.canvas
      .bind('mousedown', function( e ) {

        self.setAnchorPoint( e );

      })
      .bind('mouseup', function( e ){
        self.canvas
          .unbind('mousemove')
      })
  };

  Frame.prototype.setAnchorPoint = function( e ) {
    var self = this;
    
    this.canvas.bind('mousemove', function( e ) {
      self.draw( e );
    });
    
    this.context.pX = e.pageX;
    this.context.pY = e.pageY;

    e.preventDefault();
  };

  Frame.prototype.draw = function( e ) {
    var moveX = e.pageX - this.context.pX,
        moveY = e.pageY - this.context.pY;

    this.move( moveX, moveY );
  };
  
  Frame.prototype.move = function(changeX, changeY) {
    this.context.beginPath();
    this.context.moveTo( this.context.pX,this.context.pY );

    this.context.pX += changeX;
    this.context.pY += changeY;

    this.context.lineTo( this.context.pX, this.context.pY );
    this.context.stroke();
  };
  
  Frame.prototype.storage  = function( item ) {
    if ( !localStorage.getItem( 'Rotoscoper' ) ){
      localStorage.setItem( 'Rotoscoper', '{}' );
    }
    
    if ( item ) {
      return JSON.parse( localStorage.getItem( 'Rotoscoper' ) )[ item ];
    }

    return JSON.parse( localStorage.getItem( 'Rotoscoper' ) );
  };
  
  Frame.prototype.saveFrameData = function() {

    var _storage = this.storage();

    _storage[ this.kernal.currentTime().toFixed(1) + ''] = this.context.canvas.toDataURL();
    
    localStorage.setItem('Rotoscoper', JSON.stringify( _storage ));

    this.context.clearRect(0, 0, 600, 335)
  };    

  Frame.prototype.throttle = function( time ) {
    //  Return immediately if paused/ended
    if ( this.kernal.media.paused || this.kernal.media.ended ) {
      return;
    }

    time = +( ( time > 0 && +time.toFixed( 1 ) ) || time );
    //  Process the current scene

    this.render( time );
    
    //  Store ref to `this` context
    var self = this;
    
    //  The actual throttling is handled here, 
    //  throttle set to 20 fps
    setTimeout(function () {
      
      //  Recall the processing throttler
      self.throttle( time + .1 );

    }, 1000/this.fps );  
  }

  Frame.prototype.render = function( time ) {

    time = this.kernal.currentTime().toFixed( 1 );

    //  Update time display 
    if ( this.hasTimeDisplay ) {
      $('#time').html( time );
    }
    
    //  Clear last frame
    this.context.clearRect( 0, 0, 600, 335 );      

    var frame, $img;

    //  Get frame data from cached frames index
    frame = this.frames.data[ time ];

    //  Return if no frame to draw
    if ( !frame ) {

      frame = this.frames.last;
      
      return;
    }

    
    $img = $('<img>', {
      src : frame
    }).get(0);

    this.frames.last = frame;
    
    this.context.drawImage( $img, 0, 0, 600, 335 );

  };

  global.rotoFrame = rotoFrame;  

})( window, jQuery );

$(function(){
  var video = $('<video>', {
        id: 'subject',
        src: 'trailer.ogv',
        css:{
          width: 600,
          position: 'absolute',
          top: 0,
          left: 0,
          zIndex: '1'
        }
      })
      .appendTo('body')
      .get(0),

      kernal = Popcorn(video);



  kernal.listen('canplaythrough', function() {

    var canvas = $('#canvas'),
        context = canvas.get(0).getContext("2d");

    context.lineWidth = 3;
    context.strokeStyle = 'gray';
    context.lineCap = 'round';
    context.pX = undefined;
    context.pY = undefined;

    

    var roto = rotoFrame({
                  kernal: kernal,
                  context: context, 
                  canvas: canvas, 
                  hasTimeDisplay: true
                });


    $('input[name="colorpicker"]').bind('change blur', function() {

      var val = $(this).val();

      if ( context && context.strokeStyle ) {
        context.strokeStyle = val;
      }
    });

    $('input[name="sizepicker"]').bind('change', function() {

      var val = $(this).val();

      if ( context && context.lineWidth ) {
        context.lineWidth = val;
      }
    
    });

    $('#advance-fw,#advance-rw,#reset').click(function(){

      roto.saveFrameData();
      
      var _id = $(this)[0].id;
      
      kernal.currentTime(
        _id === 'reset' ? 0 : (
          _id === 'advance-rw' ?
            kernal.currentTime() - .1 :
            kernal.currentTime() + .1
        )
      );

      $('#time').html( kernal.currentTime().toFixed(1) );

    });
    
    $('#playback').toggle(function(){
      kernal.play();
      $(this).text('||').attr('alt', 'pause');
    }, function(){
      kernal.pause();
      $(this).text('>').attr('alt', 'play');
    });

    var $footer = $('footer');
    
    $('input,button').hover(function() {
      $footer.html( $(this).attr('alt') );
    }, function() {
      $footer.empty();
    });

  });
})
