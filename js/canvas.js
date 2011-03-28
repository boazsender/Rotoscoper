/***
* @author Mike Taylor
* @copyright Copyright (c) 2009 Mike Taylor
* @license http://www.opensource.org/licenses/mit-license.php
* @version 0.2
*/

// namespace
var _MT = _MT || {};

_MT.CanvasDrawr = function(options) {
	
	// grab canvas element
	var canvas = document.getElementById(options.id),
			ctxt = canvas.getContext("2d");

	// set props from options, but the defaults are for the cool kids
	ctxt.lineWidth = options.size || Math.ceil(Math.random() * 75);
	ctxt.strokeStyle = options.color || ["red", "green", "yellow", "blue", "magenta", "orangered"][Math.floor(Math.random() * 6)];
	ctxt.lineCap = options.lineCap || "round";
	ctxt.pX = undefined;
	ctxt.pY = undefined;

	var self = {
		
		//bind click events
		init: function() {
			
			//set pX and pY from first click
			$(canvas).one("mousemove", self.set_anchor_point)
			
			//each click after draws line
			.mousemove(self.draw);
		},
		
		//generic move function
		set_anchor_point: function(e) {
			ctxt.pX = e.pageX;
			ctxt.pY = e.pageY;
			e.preventDefault();
		},
		
		draw: function(e) {
			var moveX = e.pageX - ctxt.pX,
					moveY = e.pageY - ctxt.pY;
			self.move(moveX, moveY);
		},

		move: function(changeX, changeY) {
			ctxt.beginPath();
			ctxt.moveTo(ctxt.pX,ctxt.pY);

			ctxt.pX += changeX;
			ctxt.pY += changeY;

			ctxt.lineTo(ctxt.pX, ctxt.pY);
			ctxt.stroke();
		}
	};
	return self.init();
};