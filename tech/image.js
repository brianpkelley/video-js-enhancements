/* Image Playback Technology - Wrapper for displaying images
================================================================================ */



_V_.imageEngine = _V_.Class.extend({
	timers: [], // Array of timers used to ensure that one doesn't slip through the cracks and cause issues
	
	init: function(player, imageTech) {
	//	this._super(player)
		this.player = player;
		this.imageTech = imageTech;
		this.isPaused = true;
		
		
		this.reset();
	},
	
	reset: function() {
		this.timerDuration = this.player.options.playlist.options.imageDuration;
		
		this.player.duration(this.timerDuration);

		this.clearTimers();

		this.currentPosition = 0.00;
		
	},
	clearTimers: function() {
		for( var x = 0; x < this.timers.length; x++ ) {
			clearInterval( this.timers[x] );
			this.timers[x] = null;
		}
	},
	updateTimer: function() {
		
		if ( this.timerDuration <= this.currentPosition ) { // NEXT IMAGE
			this.clearTimers();
			this.currentPosition = this.timerDuration;
			this.pause();
			
			this.imageTech.trigger('ended');
			this.imageTech.trigger('timeupdate')
			this.imageTech.trigger('currenttime')
		} else {
			this.currentPosition = Math.round((this.currentPosition + .2)*100)/100;
			this.imageTech.trigger('timeupdate')
			this.imageTech.trigger('currenttime')
		}
	},
	
	play: function() {
		self = this;
		
		this.clearTimers();
		
		this.timers.push( setInterval( function() { self.updateTimer.apply(self); }, 200 ) );
		this.isPaused = false;
		this.imageTech.trigger('play');
	},
	pause: function() {
		this.clearTimers();
		this.isPaused = true;
		this.imageTech.trigger('pause');
	},
	
	duration: function() { return (this.timerDuration)?this.timerDuration: this.player.options.images.duration; },
	setCurrentTime: function(seconds) { this.currentPosition = seconds; },
	currentTime: function() { return this.currentPosition; },
	paused: function() { return this.isPaused; }
	
});




_V_.image = _V_.PlaybackTech.extend({

	init: function(player, options, ready){
		this.player = player;
		this.el = this.createElement();
		
		this.ready(ready);
		
		this.addEvent("click", this.proxy(this.onClick));
		
		var source = options.source;
		this.engine = new _V_.imageEngine( this.player, this );
		
		
		// If the element source is already set, we may have missed the loadstart event, and want to trigger it.
		// We don't want to set the source again and interrupt playback.
		if (source && this.el.currentSrc == source.src) {
			player.trigger("loadstart");
			
		// Otherwise set the source if one was provided.
		console.log( source );
		} else if (source) {
			this.src( source.src );
		}
		
		// Chrome and Safari both have issues with autoplay.
		// In Safari (5.1.1), when we move the video element into the container div, autoplay doesn't work.
		// In Chrome (15), if you have autoplay + a poster + no controls, the video gets hidden (but audio plays)
		// This fixes both issues. Need to wait for API, so it updates displays correctly
		player.ready(function(){
			if (this.options.autoplay && this.paused()) {
				this.tag.poster = null; // Chrome Fix. Fixed in Chrome v16.
				this.play();
			}
		});
		
		this.setupTriggers();
		
		this.triggerReady();
		
		/*
		this.player.controlBar.currentTimeDisplay.hide();
		this.player.controlBar.durationDisplay.hide();
		this.player.controlBar.progressControl.hide();
		this.player.controlBar.remainingTimeDisplay.hide();
		this.player.controlBar.timeDivider.hide();
		*/
	},
	
	destroy: function(){
		this.player.tag = false;
		this.removeTriggers();
		this.el.parentNode.removeChild(this.el);
		
		this.engine.reset();
		
		this.player.controlBar.volumeControl.show();
		this.player.controlBar.muteToggle.show();
		this.player.controlBar.captionsButton.show();
		this.player.controlBar.chaptersButton.show();
		this.player.controlBar.subtitlesButton.show();
		/*
		this.player.controlBar.currentTimeDisplay.show();
		this.player.controlBar.durationDisplay.show();
		this.player.controlBar.progressControl.show();
		this.player.controlBar.remainingTimeDisplay.show();
		this.player.controlBar.timeDivider.show();
		*/
	},
	
	createElement: function(){
		
		
		// If possible, reuse original tag for HTML5 playback technology element
		var player = this.player,
			el = player.tag,
			newEl,
			newImg;
		
		// Check if this browser supports moving the element into the box.
		
		if (!el || this.support.movingElementInDOM === false) {
			
			// If the original tag is still there, remove it.
			if (el) {
				player.el.removeChild(el);
			}
			
			newEl = _V_.createElement("div", {
				id: el.id || player.el.id + "_html_img_api",
				className: el.className || "vjs-tech vjs-images"
			});
			
			el = newEl;
			_V_.insertFirst(el, player.el);
			
			newImg = _V_.createElement("img", { className:'vjs-image'});
			
			this.img = newImg;
			_V_.on( this.img, 'load', this.proxy(function() {
				this.trigger('loadeddata');
			}));
			_V_.insertFirst(this.img, el );
			this.player.trigger('progress');
		}
		
		// Update tag settings, in case they were overridden
		_V_.each(["autoplay","preload","loop","muted"], function(attr){ // ,"poster"
			if (player.options[attr] !== null) {
				el[attr] = player.options[attr];
			}
		}, this);
		
		// Hide controls used for video
		console.log( this.player.controlBar );
		this.player.controlBar.volumeControl.hide();
		this.player.controlBar.muteToggle.hide();
		this.player.controlBar.captionsButton.hide();
		this.player.controlBar.chaptersButton.hide();
		this.player.controlBar.subtitlesButton.hide();
		return el;
	},
	
	// Make video events trigger player events
	// May seem verbose here, but makes other APIs possible.
	setupTriggers: function(){
		_V_.each.call(this, _V_.image.events, function(type){
			_V_.addEvent(this.el, type, _V_.proxy(this.player, this.eventHandler));
		});
	},
	removeTriggers: function(){
		_V_.each.call(this, _V_.image.events, function(type){
			_V_.removeEvent(this.el, type, _V_.proxy(this.player, this.eventHandler));
		});
	},
	eventHandler: function(e){
		console.log( e.type );
		e.stopPropagation();
		this.triggerEvent(e);
	},
	
	play: function(){ this.engine.play();  },
	pause: function(){ this.engine.pause(); },
	paused: function(){ return this.engine.paused(); /* just for now */ },
	
	currentTime: function(){ return this.engine.currentTime(); /* just for now this.el.currentTime; */},
	setCurrentTime: function(seconds){
		this.engine.setCurrentTime(seconds);
		/* just for now */
		/*try {
			this.el.currentTime = seconds;
		} catch(e) {
			_V_.log(e, "Video isn't ready. (VideoJS)");
			// this.warning(VideoJS.warnings.videoNotReady);
		}*/
	},
	
	duration: function(){ return this.engine.duration(); /* just for now */ },
	buffered: function(){ return _V_.createTimeRange(0,this.engine.duration()); /* just for now */ },
	
	volume: function(){ return 0; },
	setVolume: function(percentAsDecimal){ },
	
	// NOT NEEDED FOR IMAGES --- Needed for player tech
	muted: function(){ return false },
	setMuted: function(muted){ this.el.muted = false; },
	
	width: function(){ return this.el.offsetWidth; },
	height: function(){ return this.el.offsetHeight; },
	
	supportsFullScreen: function(){	return false; },
	
	
	// Launch Lightbox?
	enterFullScreen: function(){},
	exitFullScreen: function(){},
	
	src: function(src){
		console.log( "LOADING :", src );
		// Reset all the counters		
		this.engine.reset();
		this.img.src = src;
		console.log( "HIDING POSTER: ", this.player);
		this.player.posterImage.hide();
		this.player.bigPlayButton.hide();
	},
	load: function(){ /*this.el.load();*/ /* just for now */ },
	currentSrc: function(){ return this.img.src; },
	
	preload: function(){ return false; /* just for now this.el.preload; */ },
	setPreload: function(val){ /* just for now this.el.preload = val; */ },
	autoplay: function(){ return false; /*this.el.autoplay;*/ },
	setAutoplay: function(val){ /* just for now this.el.autoplay = val; */ },
	loop: function(){ return false; /* just for now this.el.loop;*/ },
	setLoop: function(val){ /* just for now this.el.loop = val; */},
	
	error: function(){ return this.el.error; },

	seeking: function(){ return this.el.seeking; },

	ended: function(){ return this.el.ended; },

	controls: function(){ return false /* Just for now */ /*this.player.options.controls;*/ },
	defaultMuted: function(){ return this.el.defaultMuted; }
});

/* IMG Support Testing -------------------------------------------------------- */

_V_.image.isSupported = function(){
	return !!document.createElement('img'); // All 'modern' browsers should support img tags
};

_V_.image.canPlaySource = function(srcObj){
	_V_.image.prototype.support.svgSupport();

	if (srcObj.type in _V_.image.prototype.support.formats) {
		return true;
	} else {
		return false;
	}
};



// List of all HTML5 events (various uses).
_V_.image.events = "loadstart,suspend,abort,error,emptied,stalled,loadedmetadata,loadeddata,canplay,canplaythrough,playing,waiting,seeking,seeked,ended,durationchange,timeupdate,progress,play,pause,ratechange,volumechange".split(",");

/* HTML5 Device Fixes ---------------------------------------------------------- */

_V_.image.prototype.support = {
	svgCheck: false,
	formats: {
		"image/jpeg":"JPG",
		"image/jpg":"JPG",
		"image/gif":"GIF",
		"image/png":"PNG"
	},
	svgSupport: function() {
		if ( this.svgCheck ) return;
		if ( !!document.createElementNS && !!document.createElementNS('http://www.w3.org/2000/svg', "svg").createSVGRect ) {
			this.formats["image/svg"] = "SVG"
		}
		this.svgCheck = true;
	},
	
	// Support for tech specific full screen. (webkitEnterFullScreen, not requestFullscreen)
	// http://developer.apple.com/library/safari/#documentation/AudioVideo/Reference/HTMLVideoElementClassReference/HTMLVideoElement/HTMLVideoElement.html
	// Seems to be broken in Chromium/Chrome && Safari in Leopard
	fullscreen: false,
	
	// In iOS, if you move a video element in the DOM, it breaks video playback.
	movingElementInDOM: true

};
