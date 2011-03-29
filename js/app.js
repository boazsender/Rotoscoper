$(function(){
  var video = $('<video>', {
        src: '../video/trailer.mp4',
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

      kernal = Popcorn(video)


  kernal.listen('canplaythrough', function(){

    var canvasElem = $('#canvas'),
        canvas = canvasElem
          .get(0)
          .getContext("2d");

    kernal.listen('timeupdate', function(){

       $('#time').html( this.currentTime().toFixed(1) );

       canvas.clearRect(0, 0, 600, 335);

       var _img = $('<img>', {
         src : app.storage( this.currentTime().toFixed( 1 ) )
       }).get(0)

       canvas.drawImage( _img, 0, 0, 600, 335 );

       // console.log( app.storage( this.currentTime().toFixed(1) ) );

    });
    
    canvas.lineWidth = 3;
    canvas.strokeStyle = 'gray';
    canvas.lineCap = 'round';
    canvas.pX = undefined;
    canvas.pY = undefined;
    
    var app = window.app = {

      //bind click events
      init: function() {

        //set pX and pY from first click
        canvasElem
          .bind('mousedown', app.set_anchor_point)
          .bind('mouseup', function(e){
            canvasElem
              .unbind('mousemove', app.draw)
          })
      },

      set_anchor_point: function(e) {
        canvasElem.bind('mousemove', app.draw)
        canvas.pX = e.pageX;
        canvas.pY = e.pageY;
        e.preventDefault();
      },

      draw: function(e) {
        var moveX = e.pageX - canvas.pX,
            moveY = e.pageY - canvas.pY;
        app.move(moveX, moveY);
      },
      move: function(changeX, changeY) {
        canvas.beginPath();
        canvas.moveTo(canvas.pX,canvas.pY);

        canvas.pX += changeX;
        canvas.pY += changeY;

        canvas.lineTo(canvas.pX, canvas.pY);
        canvas.stroke();
      },
      storage : function( item ){
        if ( !localStorage.getItem( 'Rotoscoper' ) ){
          localStorage.setItem( 'Rotoscoper', '{}' )
        }
        
        if( item ) {
          return JSON.parse( localStorage.getItem( 'Rotoscoper' ) )[ item ]
        }

        return JSON.parse( localStorage.getItem( 'Rotoscoper' ) )
      },
      save_frame: function(){

        var _storage = app.storage();
        
        _storage[kernal.currentTime().toFixed(1) + ''] = canvas.canvas.toDataURL();
        
        localStorage.setItem('Rotoscoper', JSON.stringify( _storage ));

        canvas.clearRect(0, 0, 600, 335)
      }
    };
    
    app.init()

    $('#advance').click(function(){
      kernal.currentTime(kernal.currentTime() + .1);
      app.save_frame();
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
