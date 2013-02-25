

_V_.extend({
	
	insertLast: function(node, parent){
		parent.appendChild(node);
	}
});


_V_.merge(_V_.Player.prototype, {
	resetSrc: function( item ) {
		
		// Stop the player
		this.trigger("pause");
		// Set Poster
		// Set the poster and big play button before the source because techs like "image" will hide the poster automatically since there is no need for a poster to an image
		this.poster( item.poster );
		
		// Show poster and big play
		this.posterImage.show();
		this.bigPlayButton.show();
		
		// Set new source
		this.src( item.src );
		
		
		
		// Hide the control bar, reset events
		/*this.controlBar.hide();
		this.one("play", _V_.proxy(this, function(){
		  this.controlBar.fadeIn();
		  this.on("mouseover", this.controlBar.proxy(this.controlBar.fadeIn));
		  this.on("mouseout", this.controlBar.proxy(this.controlBar.fadeOut));
		}));*/
		
		// Reset player
		this.tech.one( 'loadeddata', _V_.proxy(this, function(e) {
			this.trigger("durationchange");
			this.trigger("timeupdate");
		}));
	},
	poster: function( src ) {
		this.posterImage.el.src = src;
	}
});




// Don't want a component but want the helper functions
_V_.EasyClass = _V_.Class.extend({
	/* Events
	================================================================================ */
	on: function(type, fn, uid){
		_V_.on(this.el, type, _V_.proxy(this, fn));
		return this;
	},
	// Deprecated name for 'on' function
	addEvent: function(){ return this.on.apply(this, arguments); },
	
	off: function(type, fn){
		_V_.off(this.el, type, fn);
		return this;
	},
	// Deprecated name for 'off' function
	removeEvent: function(){ return this.off.apply(this, arguments); },
	
	trigger: function(type, e){
		_V_.trigger(this.el, type, e);
		return this;
	},
	// Deprecated name for 'off' function
	triggerEvent: function(){ return this.trigger.apply(this, arguments); },
	
	one: function(type, fn) {
		_V_.one(this.el, type, _V_.proxy(this, fn));
		return this;
	},
	
	/* Utility
	================================================================================ */
	each: function(arr, fn){ _V_.each.call(this, arr, fn); },
	
	eachProp: function(obj, fn){ _V_.eachProp.call(this, obj, fn); },
	
	extend: function(obj){ _V_.merge(this, obj) },
	
	// More easily attach 'this' to functions
	proxy: function(fn, uid){  return _V_.proxy(this, fn, uid); }

})