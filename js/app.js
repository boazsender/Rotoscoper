
(function( global, $ ) {

	//	Remote load underscore
	var head = document.head || document.getElementsByTagName("head")[0] || document.documentElement, 
			script = document.createElement("script");

	script.async = true;
	script.src = "http://documentcloud.github.com/underscore/underscore-min.js";

	//	When underscore is available, define our ctor
	script.onload = function() {

		//	rotoFrame public API
		function rotoFrame( options ) {
			return new Frame( options );
		}

		//	Frame ctor
		//		deps: jQuery, Underscore
		function Frame( options ) {

			var self = this;

			options.timeout || ( options.timeout = 0 );
		
			_.extend( this, options );


			this.kernal.listen( "play", function() {

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

		Frame.prototype.throttle = function() {
			//  Return immediately if paused/ended
			if ( this.kernal.media.paused || this.kernal.media.ended ) {
			  return;
			}
			
			//  Process the current scene
			this.render();
			
			//  Store ref to `this` context
			var self = this;
			
			//  The actual throttling is handled here, 
			//  throttle set to 20 fps
			setTimeout(function () {
			  
			  //  Recall the processing throttler
			  self.throttle();

			}, this.timeout );	
		}

		Frame.prototype.render = function() {

			$('#time').html( this.kernal.currentTime().toFixed(1) );

			this.context.clearRect(0, 0, 600, 335);

			var frame, _img;

			// ^ RW: this is a VERY cool trick - what if you loaded all the "scenes" 
			//				in earlier and hide them in the DOM?
			frame = this.storage( this.kernal.currentTime().toFixed( 1 ) );

			//	Return if no frame to draw
			if ( !frame ) {
				return;
			}

			_img = $('<img>', {
				src : frame
			}).get(0)

			this.context.drawImage( _img, 0, 0, 600, 335 );

			// console.log( app.storage( this.currentTime().toFixed(1) ) );	
		}


		global.rotoFrame = rotoFrame;	
	}

	head.insertBefore( script, head.firstChild );




})( window, jQuery );

$(function(){
  var video = $('<video>', {
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



  kernal.listen('canplaythrough', function(){

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
									canvas: canvas
								});
    
    $('#advance').click(function(){
      kernal.currentTime(kernal.currentTime() + .1);
      roto.saveFrameData();
    });

    $('#playback').toggle(function(){
      kernal.play();
      $(this).text('Pause');
    }, function(){
      kernal.pause();
      $(this).text('Play');
    })

  });
})
