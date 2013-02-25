

_V_.Reporting = _V_.EasyClass.extend({
	
	// The basic events.  Can be extened upon with concatenation.
	eventNames: 'play,pause,timeupdate,ended,fullscreenchange,resize',
	
	init: function( player, options ) {
		this.player = player;
		
		this.options = _V_.merge( this.options, options );
		
		this.events = this.eventNames.split(',');
		
		this.each( this.events, this.proxy( function( event ) {
			console.log( "Initializing ", event );
			this.player.on( event, this.proxy( this.eventHandler ) );
		}));
		
	},
	
	eventHandler: function(e) {
		//console.log( e.type );
		if ( typeof this['on'+_V_.uc(e.type)] == 'function' ) {
			this['on'+_V_.uc(e.type)](e);
		}
	}
});


_V_.MdsReporting = _V_.Reporting.extend({
	
	options: {
		playReportInterval: 2
	},
	
	onPlay: function() {
		console.log("onPlay Event");
	},
	onPause: function() {
		console.log("onPause Event");
	},
	onTimeupdate: function(e) {
		currentTime = this.player.currentTime()
		if ( !Math.round( currentTime % this.options.playReportInterval )  ) {
			console.log( Math.round( currentTime ) );
		}
	},
	onEnded: function() {
		console.log("onEnded Event");
	}
});
