_V_.ShareButton = _V_.TextTrackButton.extend({
	kind: "share",
	buttonText: "Share",
	className: "vjs-share-button",
	defaults: {
		facebookShareIcon: {},
		twitterShareIcon: {},
		emailShareIcon: {},
		embedShareIcon: {}
	},
	
	init: function(player, options) {
		this.shareIcons = player.options.shareIcons || this.defaults;
		this._super( player, options );
		
		
		if ( this.menu.el.children.length > 1 ) {
			this.show();
		}
	},
	
	createItems: function(chaptersTrack){},
	
	createMenu: function(){
		var items = this.items = [];
		
		var menu = this.menu = new _V_.Menu(this.player, {components: this.shareIcons});
		console.log( menu.el );
		_V_.insertFirst( _V_.createElement("li", {
			className: "vjs-menu-title",
			innerHTML: _V_.uc(this.kind)
		}), menu.el);
		
		// Add Items
		
		// Add list to element		
		this.addComponent( menu );
		
		return menu;
	},
	
	addItem: function() {
		mi = new _V_.FacebookMenuItem(this.player, {});
		menu.addComponent(mi);
		this.items.push( mi );
	}
	
});

_V_.ShareMenuItem = _V_.MenuItem.extend({
	createElement: function() {
		var el = this._super();
		icon = _V_.createElement('span',{
			className: this.options.iconClass + ' vjs-menu-icon'
		});
		
		_V_.insertFirst( icon, el );
		return el;
	}
})

_V_.FacebookShareIcon = _V_.ShareMenuItem.extend({
	
	init: function(player, options){
		options.label = "Facebook";
		options.iconClass = "vjs-facebook"
		this._super(player, options);
	},
	onClick: function(){
		// Do facebook stuff
	}
});
_V_.TwitterShareIcon = _V_.ShareMenuItem.extend({
	
	init: function(player, options){
		options.label = "Twitter";
		options.iconClass = "vjs-twitter"
		this._super(player, options);
	},
	onClick: function(){
		// Do twitter stuff
	}
});
_V_.EmailShareIcon = _V_.ShareMenuItem.extend({
	
	init: function(player, options){
		options.label = "Email";
		options.iconClass = "vjs-email"
		this._super(player, options);
	},
	onClick: function(){
		// Do email stuff
	}
});
_V_.EmbedShareIcon = _V_.ShareMenuItem.extend({
	
	init: function(player, options){
		options.label = "Embed";
		options.iconClass = "vjs-embed"
		this._super(player, options);
	},
	onClick: function(){
		// Show embed code
	}
});

		
// Add Buttons to controlBar
// Add before everything else
//temp = _V_.merge( { "shareButton": {} }, _V_.ControlBar.prototype.options.components );
//_V_.ControlBar.prototype.options.components = temp;

// Add at the end
_V_.merge( _V_.ControlBar.prototype.options.components, { "shareButton": {} } );