/**
 * Base Content Slider Class
 * Extended for List Slider
 */

_V_.ContentSlider = _V_.Component.extend({
	slowMoveAmount: 25,
	fastMoveAmount: 70,
	currentMoveAmount: 0,
	
	moveInterval: null,
	fastMoveTimeout: null,
	
	fastMoveTime: 3000,
	moveIntervalTime: 50,
	
	options: {
		components: {
			"slideLeftButton": {},
			"slideFrame": {},
			"slideRightButton": {},
		}
	},
	
	
	init: function( player, options ) {
		this._super( player, options );
		
		// Dimensions
		this.player.on( 'ready', this.proxy(this._setSize) );
		
		// Events
		this.slideLeftButton.on( 'mousedown', this.proxy(function() {
			this._onMouseDown(1)
		}) );
		this.slideRightButton.on( 'mousedown',  this.proxy(function() {
			this._onMouseDown(-1)
		}) );
		
		this.slideLeftButton.on( 'mouseup', this.proxy( function() { this._onMouseUp(1) } ) );
		this.slideRightButton.on( 'mouseup', this.proxy( function() { this._onMouseUp(-1) } ) );
		
		this.slideLeftButton.on( 'mouseout', this.proxy( function() { this._onMouseUp(1) } ) );
		this.slideRightButton.on( 'mouseout', this.proxy( function() { this._onMouseUp(-1) } ) );
	},
	
	// Creates this.el (containing frame) and this.slidePane (the sliding element);
	createElement: function() {
		this.el = _V_.createElement( 'div', { className: this.buildCSSClass() } );
		
		// Must return an element, _V_.Component.init expects it
		return this.el;
	},
	
	buildCSSClass: function() {
		return 'vjs-slider ' + this._super();
	},
	
	_setSize: function() {
	//	console.log( this.el, this.slideLeftButton, this.slideRightButton )
		elWidth = parseInt( _V_.getComputedStyleValue( this.el, 'width' ) );
		leftWidth = parseInt( _V_.getComputedStyleValue( this.slideLeftButton.el, 'width' ) );
		rightWidth = parseInt( _V_.getComputedStyleValue( this.slideRightButton.el, 'width' ) );
		
		this.slideFrame.el.style.width = (elWidth - leftWidth - rightWidth) + 'px';
		this.slideFrame.getWidths();
	},
	
	// Add Content to the slider
	addContent: function() {
		
	},
	
	_onMouseDown: function(dir) {
		clearInterval( this.moveInterval );
		clearTimeout( this.fastMoveTimeout );
		
		this.currentMoveAmount = this.slowMoveAmount;
		
		this.moveInterval = setInterval( this.proxy( function() {
			this.slideFrame.movePaneBy( dir * this.currentMoveAmount );
		}), this.moveIntervalTime);
		
		this.fastMoveTimeout = setTimeout( this.proxy( function() {
			this.currentMoveAmount = this.fastMoveAmount;
		}), this.fastMoveTime)

		
	},
	_onMouseUp: function(dir) {
		clearInterval( this.moveInterval );
		clearTimeout( this.fastMoveTimeout );
		this.currentMoveAmount = 0;
	}
	
});

/**
 * Slide Frame
 * Holds and controls the slide pane
 */
_V_.SlideFrame = _V_.Component.extend({
	
	init: function(player, options) {
		this._super(player, options);
	},
	
	createElement: function() {
		var el = _V_.createElement('div',{
			className: this.buildCSSClass('vjs-slideFrame'),
			innerHTML: '<div class="' + this.buildCSSClass('vjs-slidePane') + '"></div>'
		});
		
		this.slidePane = el.getElementsByTagName('div')[0];
		this.slidePane.style.top = '0px';
		this.slidePane.style.left = '0px';
		
		return el;
	
	},
	
	buildCSSClass: function (className) {
		return className + ' ' + this._super();
	},
	
	getWidths: function() {
		this.paneWidth = this.slidePane.offsetWidth; //parseInt( _V_.getComputedStyleValue( this.slidePane, 'width' ) );
		this.frameWidth = this.el.offsetWidth;//parseInt( _V_.getComputedStyleValue( this.el, 'width' ) );
	},
	
	movePaneBy: function(moveAmount) {
		var newPos = ( parseInt( this.slidePane.style.left ) + moveAmount );
		//console.log( this.paneWidth, this.frameWidth, -1 * (this.paneWidth - this.frameWidth), newPos );
		this.movePaneTo( newPos );
	},
	movePaneTo: function( newPos ) {
		if ( newPos > 0 ) {
			newPos = 0;
		}
		
		if ( ( -1 * ( this.paneWidth - this.frameWidth )) > newPos && this.paneWidth > this.frameWidth ) {
			newPos = -1 * ( this.paneWidth - this.frameWidth );
		}
		//console.log( this.paneWidth, this.frameWidth, -1 * (this.paneWidth - this.frameWidth), newPos );
		this.slidePane.style.left = newPos + 'px';
	}
	
});




/**
 * Left
 */
_V_.SlideLeftButton = _V_.Button.extend({
	
	buttonText: "Slide Left",
	
	buildCSSClass: function() {
		return 'vjs-slideLeftButton vjs-slideButton ' + this._super();
	},
	
	onClick: function() {
		//this.trigger('slideLeft')
	}
});

/**
 * Right
 */
_V_.SlideRightButton = _V_.Button.extend({
	
	buttonText: "Slide Right",
	
	buildCSSClass: function() {
		return 'vjs-slideRightButton vjs-slideButton ' + this._super();
	},
	
	onClick: function() {
		//this.trigger('slideRight')
	}
});



/** *********************************************************
 * List Slider
 * Creates a slider of elements in a UL 
 */
_V_.ListSlider = _V_.ContentSlider.extend({
	
	checkInterval: null,
	clickTimeout: null,
	clickTimeoutTime: 200,
	firstVisible: null,
	lastVisible: null,
	isMouseDown: false,
		
		
	init: function( player, options ) {
		this._super( player, options );
		
		// Add the list element to the slide pane
		_V_.insertLast( this.listEl, this.slideFrame.slidePane );
		
		
		// Add Elements if present
		if ( this.options.items ) {
			this.addItems( this.options.items );
			
		}
		
		// Events
		this.slideLeftButton.on( 'click', this.proxy(function() {
			this._onClick(1)
		}) );
		this.slideRightButton.on( 'click',  this.proxy(function() {
			this._onClick(-1)
		}) );
		
	},
	
	createElement: function() {
		var el = this._super();
		// Create the list element
		this.listEl = _V_.createElement( 'ul', {className: 'vjs-slideList' } );
	
		return el;
	},
	buildCSSClass: function() {
		return 'vjs-listSlider ' + this._super();
	},
	addItems: function( /* array */ items ) {
		this.each( items, function( item ) {
			_V_.insertLast( item.el, this.listEl );
		});
		// used for calculating the width
		this.refItem = items[0].el;
	},
	
	_setSize: function() {
		var elMarginRight,
			elMarginLeft,
			elWidth,
			totalWidth = 0;
		
		this.each( this.listEl.childNodes, function( item ) {
			
			elWidth = item.offsetWidth;
			elMarginRight = parseInt( _V_.getComputedStyleValue( item, 'margin-right' ) );
			elMarginLeft = parseInt( _V_.getComputedStyleValue( item, 'margin-left' ) );
			
			totalWidth += elWidth + elMarginRight + elMarginLeft;
		});
		
		
		
		this.listEl.style.width = (totalWidth+1) + 'px'; // not exactly sure why +1 but it works
		
		this._super();
		
		this.setVisible();
	},
	
	_onMouseDown: function( dir ) {
		
		this.quickClick = true;
		var _super = this._super;
		this.clickTimeout = setTimeout( this.proxy( function() {
			
			_super.call(this, dir);
			
			this.quickClick = false;
			this.isMouseDown = true;
			
			// Set visible class on items
			clearInterval( this.checkInterval );
			this.checkInterval = setInterval( this.proxy( function() {
				this.setVisible();
			}), this.moveIntervalTime );
		}), this.clickTimeoutTime );
	},
	
	_onMouseUp: function(dir) {
		
		this._super(dir);
		clearInterval( this.checkInterval );
		if ( this.isMouseDown ) {
			
			this.isMouseDown = false;
			var itemPos,
				visibleArea = this.getVisibleArea();
			
			this.firstVisible = false;
			this.setVisible();
			
			// Slide till the last item is completely visible
			if ( dir > 0 ) { // Sliding container right / left button
				itemPos = this.getItemPos( this.firstVisible );
				this.slideFrame.movePaneTo( -1 * itemPos.left )
			} else if ( dir < 0 ) { // Sliding container left / right button
				itemPos = this.getItemPos( this.lastVisible );
				this.slideFrame.movePaneBy( visibleArea.to - itemPos.right );
			}
			this.setVisible();
		}
	},
	
	_onClick: function(dir) {
		clearTimeout( this.clickTimeout );
		
		if ( this.quickClick ) {
			
			var itemPos,
				visibleArea = this.getVisibleArea();
			
			
			if ( dir > 0 && this.firstVisible.previousSibling ) {
				itemPos = this.getItemPos( this.firstVisible.previousSibling );
				this.slideFrame.movePaneTo( -1 * itemPos.left )
			} else if ( dir < 0 && this.lastVisible.nextSibling) {
				itemPos = this.getItemPos( this.lastVisible.nextSibling );
				this.slideFrame.movePaneBy( visibleArea.to - itemPos.right );
			}
			this.firstVisible = false;
			this.setVisible();
		}
		
	},
	setVisible: function() {
		this.each( this.listEl.childNodes, function( item ) {

			if ( this.isVisible( item ) ) {
				if ( !this.firstVisible ) {
					this.firstVisible = item;
				}
				_V_.addClass( item, 'visible' )
				this.lastVisible = item;
			} else {
				_V_.removeClass( item, 'visible' );
			}
		});
	},
	getVisibleArea: function() {
		var width,
			left;
		
		width = parseInt( this.slideFrame.el.style.width );
		left = -1 * parseInt( this.slideFrame.slidePane.style.left );
		
		return { from: left, to: left+width };
	},
	
	isVisible: function( item ) {
		var visibleArea = this.getVisibleArea(),
			itemPos = this.getItemPos( item );
		
		return itemPos.right > visibleArea.from && itemPos.left < visibleArea.to;
	},
	
	getItemPos: function( item ) {
		return { left: item.offsetLeft, right: item.offsetLeft + parseInt( item.offsetWidth ) +1 };
	}
});

/**
 * List Slider Item
 * Creates and contorls list items to be used by ListSlider
 */
_V_.ListSliderItem = _V_.Component.extend({
	init: function( player, options ) {
		this._super( player, options );
	},
	
	createElement: function() {
		el = _V_.createElement('li',{
			className: this.buildCSSClass()
		});
		return el;
	}
});

/** *********************************************************
 * THE ACTUAL PLAYLIST ... Finally
 */
_V_.Playlist = _V_.ListSlider.extend({
	selectedIndex: 0,
	itemsByType: {},
	currentFilters: '',
	currentItems: [],
	
	init: function( player, options ) {
		// Add the Playlist control bar to components -- This has to be done here to avoid overwriting parent class options
		this.options.components.playlistControlBar = {};
		
		// Add the image screen controls if option is set
		if ( player.options.playlist.options.showImageControls ) {
			// Add image control elements to player components component
			player.playlistImageControlLeft = player.addComponent( new _V_.PlaylistImageControlLeft(player, {}) );
			player.playlistImageControlRight = player.addComponent( new _V_.PlaylistImageControlRight(player, {}) );
		}
		
		if ( player.options.playlist.url ) {
			player.options.playlist.items = [];
			// URL of playlist 
			_V_.get( player.options.playlist.url, this.proxy(function( responseTxt ) {
				// Client specific
				if ( responseTxt.search(/bvcallback/ig) >= 0 ) { // Old style playlist, convert it to the new style
					player.options.playlist.items = window.bv.convertFR( responseTxt );
				} else {
					player.options.playlist.items = JSON.parse( responseTxt );
				}
				
				// Not the most graceful, but is needed because of the dynamic loading
				options = this.getItems( player, options);
				this.addItems( this.items );
				this._setSize();
				this.selectIndex(0);
			}) );
		} else {
			// Get Playlist items
			options = this.geItems(player, options);	
		}
		
		
		// Mix in options from playlist options object
		options = _V_.merge(options, player.options.playlist.options );
		
		// Call base constructor	
		this._super( player, options );
		
		// Defaults
		this.options.autoplay = this.player.options.playlist.options.autoplay || false;
		
		// Add playlist to the player
		this.player.playlist = this;
		
		// Needs to be after this._super and this.player.playlist = this; because it references this.player.playlist
		this.engine = new _V_.PlaylistEngine( player );
		
		
		// If no default item to play, select the first.
		if ( !this.player.options.sources.length ) {
			this.selectIndex(0);
		}
		
		// Add Events to the left / right buttons for reporting.  Added here instead of base class so they wont be extended.
		this.slideLeftButton.on('click', this.proxy(function() {
			this.trigger('playlistleftbuttonclick');
		}));
		this.slideRightButton.on('click', this.proxy(function() {
			this.trigger('playlistrightbuttonclick');
		}));
	},
	getItems: function(player, options) {
		this.playlistItems = player.options.playlist.items;
			
		// Add Playlist Items
		this.items = this.constructList();
		// Initial list
		this.currentItems = options.items = this.items;
		return options;
	},
	constructList: function() {
		var theItems = [],
			tempItem,
			type,
			typeStr,
			x=0,
			self = this; // need to keep scope of item clicked, and "this"
			
		this.each( this.playlistItems, this.proxy( function( item ) {
			// Is the type set in the playlist element? If not extract from first source (all sources should be the same base type video, image, tour, etc)
			if ( !item.type ) {
				typeStr = item.sources[0].type;
				type = typeStr.substr(0,typeStr.indexOf('/'))
			} else {
				type = item.type;
			}
			
			// Create the new list element
			tempItem = new _V_.PlaylistItem(this.player, {
				item: item,
				type: type
			});
			
			// Click Action
			tempItem.on('click',function(e) {
				self.selectItem(this);
			});
			
			// Add to main item list
			theItems.push(tempItem);
			
			// Add to type specific list for filtering
			if ( !this.itemsByType[type] ) {
				this.itemsByType[type] = [];
			}
			this.itemsByType[type].push(tempItem);
			
		} ) );
		
		return theItems;
	},
	
	/**
	 * type ( string ): the type of filtering to apply
	 * strict ( boolean ): Should this be the only filter applied. Set all others to 'off'
	 */
	filterByType: function( type, strict ) {
			
		if ( strict ) {
			// Is this filter is already set
			if ( type == this.currentFilters ) { 
				return;
			}
			
			this.currentFilters = type;
		} else {
			if ( this.currentFilters.search(type) != -1 ) { // REMOVE FILTER
				this.currentFilters = this.currentFilters.replace( type, '');
			} else { // ADD FILTER
				this.currentFilters += ',' + type;
			}
		}
		// Pretty up the string
		this.currentFilters = this.currentFilters.replace( /\,,/gi , ',' ); // Replace ,, with ,
		this.currentFilters = this.currentFilters.replace( /^\,|\,$/gi , '' ); // Trim , from beginning and end
	
		// Clear current items
		this.listEl.innerHTML = "";
		console.log( 'FILTERING' );
	
		if ( this.currentFilters != '' ) {
			// Turn off all filter indicators
			this.playlistControlBar.playlistImageFilterButton.el.style.opacity = .4;
			this.playlistControlBar.playlistTourFilterButton.el.style.opacity = .4;
			this.playlistControlBar.playlistVideoFilterButton.el.style.opacity = .4;
			
			// Set Current items
			var filters = this.currentFilters.split(',');
			this.currentItems = [];
			
			console.log( filters, this.currentFilters );
			
			_V_.each( filters, this.proxy( function( filterName ) {
				if ( this.itemsByType[filterName]) {
					this.currentItems = this.currentItems.concat( this.itemsByType[filterName] );
				}
				// Turn on indicator
				switch( filterName ) {
					case 'video':
						this.playlistControlBar.playlistVideoFilterButton.el.style.opacity = 1;				
						break;
					case 'image':
						this.playlistControlBar.playlistImageFilterButton.el.style.opacity = 1;
						break;
					case 'tour':
						this.playlistControlBar.playlistTourFilterButton.el.style.opacity = 1;
						break;
				}
			}));
		} else {
			// Reset filter icons
			this.playlistControlBar.playlistImageFilterButton.el.style.opacity = 1;
			this.playlistControlBar.playlistTourFilterButton.el.style.opacity = 1;
			this.playlistControlBar.playlistVideoFilterButton.el.style.opacity = 1;
			this.currentItems = this.options.items
		}
		
		// Add New items
		if ( this.currentItems && this.currentItems.length ) {
			this.addItems( this.currentItems );
			this._setSize();
			this.focus( this.currentItems[0].el );
		}
		
		
		
	},
	
	selectItem: function( item ) {
	//	console.log( "LOAD ITEM: ", this, item, this.currentItems.indexOf( item ) );
		
		// Set the selectedIndex
		this.selectedIndex = this.currentItems.indexOf( item );
		// Hightlight newly selected item	
		this.each( this.currentItems, function( eachItem ) {
			_V_.removeClass( eachItem.el, 'selected' );
		});
		_V_.addClass( item.el, 'selected' );
		
		
		// Create and load the source object
		newLoadObject = {
			src: item.get('source'),
			poster: item.get('poster')
		}
		this.engine.load( newLoadObject );
		
		// Show selected item
		this.focus( item.el );
	},
	
	focus: function( item ) {
		var itemPos = this.getItemPos( item ),
			visibleArea = this.getVisibleArea();
		
		
		if ( itemPos.left < visibleArea.from ) {
			this.slideFrame.movePaneTo( -1 * itemPos.left )
		} else if ( itemPos.right > visibleArea.to ) {
			this.slideFrame.movePaneBy( visibleArea.to - itemPos.right );
		}
		this.firstVisible = false;
		this.setVisible();
	},
	
	/**
	 * convenience functions
	 */
	selectIndex: function( index ) {
		if ( this.currentItems.length >= index+1 ) {
			this.selectItem( this.currentItems[index] );
		} else {
			//... do nothing
		}
	},
	getIndex: function() {
		return this.selectedIndex;
	},
	getLength: function() {
		return this.currentItems.length;
	}
});




/**
 * Playlist Items.  Contains the thumb and overlay
 */
_V_.PlaylistItem = _V_.ListSliderItem.extend({
	init: function( player, options ) {
		this._super( player, options );
		this.addEvents();
	},
	
	createElement: function() {
		var el = this._super();
		
		this.overlay = _V_.createElement('div',{
			className: this.buildCSSClass() + ' overlay ' + this.options.type
		});
		
		this.thumb = _V_.createElement('img',{
			src: this.options.item.thumb
		});
		
		
		
		_V_.insertFirst( this.thumb, el );
		_V_.insertLast( this.overlay, el );
		
		return el;
	},
	
	addEvents: function() {
		this.on('click',this.proxy( this.onClick) );
	},
	get: function( option ) {
		if ( option == 'source' ) {
			var returnVal;
			switch ( this.options.type ) {
				case 'image':
					returnVal = this.options.item.sources[0];
					break;
				case 'video':
					returnVal = this.options.item.sources
					break;
				default:
					returnVal = false;
			}
			return returnVal;
		} else {
			return this.options.item[option];
		}
	},
	onClick: function() {
		console.log('ITEM CLICK');
		this.trigger('playlistitemclick');
	}
})


/**
 * Controls the automated playlists
 */
_V_.PlaylistEngine = _V_.Class.extend({
	init: function( player, options ) {
		
		
		this.player = player;
		this.playlist = this.player.playlist;
		
		this.addEvents();
	},
	
	load: function( item ) {

		this.currentItem = item;
		this.player.resetSrc( item );
		
		var source = item.src[0] || item.src;
		//console.log( item, source );

		if ( source.type.search( 'image/') >= 0 ) {
			this.player.playlistImageControlLeft.show();
			this.player.playlistImageControlRight.show();
		} else {
			this.player.playlistImageControlLeft.hide();
			this.player.playlistImageControlRight.hide();
		}
	},
	addEvents: function() {
		this.player.on('ended', _V_.proxy( this, this.onEnded ) );
	},
	
	onEnded: function() {
		// When one item ends, play another?
		if ( this.playlist.options.autoplay ) {
			this.next();
			this.player.play();
		}
	},
	play: function() {
		// Probably won't be needed... 
	},
	next: function() {
		var nextIndex = this.player.playlist.getIndex() + 1;
		if ( nextIndex >= this.playlist.getLength() ) {
			nextIndex = 0;
		}
		this.playlist.selectIndex( nextIndex );
	},
	previous: function() {
		var nextIndex = this.player.playlist.getIndex() - 1;
		if ( nextIndex < 0 ) {
			nextIndex = this.playlist.getLength() - 1;
		}
		this.playlist.selectIndex( nextIndex );
	}
	
});


/**
 * Playlist Controls
 */
_V_.PlaylistControlBar = _V_.Component.extend({
	options: {
		components: {
			'playlistFirstButton': {},
			'playlistPreviousButton': {},
			'playlistAutoPlayButton': {},
			'playlistNextButton': {},
			'playlistLastButton': {},
			
			// Reverse order for float right
			'playlistTourFilterButton': {},
			'playlistImageFilterButton': {},
			'playlistVideoFilterButton': {},
			'playlistFilterText': {}
		}
	},
	createElement: function() {
		return _V_.createElement('div',{
			className: this.buildCSSClass()
		});
	},
	buildCSSClass: function(){
		return "vjs-playlist-controls" + this._super();
	},
});


_V_.PlaylistFilterText = _V_.Component.extend({
	
	createElement: function() {
		return _V_.createElement('div',{
			innerHTML: 'Filter: ',
			className: this.buildCSSClass()
		})
	},
	
	buildCSSClass: function() {
		return 'vjs-filter-text ' + this._super();
	},
});

_V_.PlaylistImageFilterButton = _V_.Button.extend({
	
	buttonText: "Slide Right",
	
	buildCSSClass: function() {
		return 'vjs-image-filter vjs-playlist-button ' + this._super();
	},
	
	onClick: function() {
		this.player.playlist.filterByType('image');
		this.trigger('playlistimagefilterclick');
	}
});

_V_.PlaylistVideoFilterButton = _V_.Button.extend({
	
	buttonText: "Slide Right",
	
	buildCSSClass: function() {
		return 'vjs-video-filter vjs-playlist-button ' + this._super();
	},
	
	onClick: function() {
		this.player.playlist.filterByType('video');
		this.trigger('playlistvideofilterclick');
	}
});

_V_.PlaylistTourFilterButton = _V_.Button.extend({
	
	buttonText: "Slide Right",
	
	buildCSSClass: function() {
		return 'vjs-tour-filter vjs-playlist-button ' + this._super();
	},
	
	onClick: function() {
		this.player.playlist.filterByType('tour');
		this.trigger('playlisttourfilterclick');
	}
});


_V_.PlaylistFirstButton = _V_.Button.extend({
	
	buttonText: "Slide Right",
	
	buildCSSClass: function() {
		return 'vjs-first vjs-playlist-button ' + this._super();
	},
	
	onClick: function() {
		this.player.playlist.selectIndex(0);
		this.trigger('playlistfirstclick');
	}
});

_V_.PlaylistPreviousButton = _V_.Button.extend({
	
	buttonText: "Slide Right",
	
	buildCSSClass: function() {
		return 'vjs-previous vjs-playlist-button ' + this._super();
	},
	
	onClick: function() {
		this.player.playlist.engine.previous();
		this.trigger('playlistpreviousclick');
	}
});

_V_.PlaylistNextButton = _V_.Button.extend({
	
	buttonText: "Slide Right",
	
	buildCSSClass: function() {
		return 'vjs-next vjs-playlist-button ' + this._super();
	},
	
	onClick: function() {
		this.player.playlist.engine.next();
		this.trigger('playlistnextclick');
	}
});

_V_.PlaylistLastButton = _V_.Button.extend({
	
	buttonText: "Slide Right",
	
	buildCSSClass: function() {
		return 'vjs-last vjs-playlist-button ' + this._super();
	},
	
	onClick: function() {
		this.player.playlist.selectIndex( this.player.playlist.getLength()-1 );
		this.trigger('playlistlastclick');
	}
});

_V_.PlaylistAutoPlayButton = _V_.Button.extend({
	
	buttonText: "Auto Play",
	
	buildCSSClass: function() {
		return ((this.player.options.playlist.options.autoplay)?'vjs-stop ':'vjs-autoplay ')+'vjs-playlist-button ' + this._super();
	},
	
	onClick: function() {
		if ( this.player.playlist.options.autoplay ) {
			this.player.pause();
			this.player.playlist.options.autoplay = false;
		//	this.player.options.autoplay = false;
			_V_.removeClass(this.el, 'vjs-stop');
			_V_.addClass( this.el, 'vjs-autoplay' );
		} else {
			this.player.play();
			this.player.playlist.options.autoplay = true;
		//	this.player.options.autoplay = true;
			_V_.removeClass(this.el, 'vjs-autoplay');
			_V_.addClass( this.el, 'vjs-stop' );
		}
		this.trigger('playlistautoplayclick');
	}
});



_V_.PlaylistImageControlLeft = _V_.Button.extend({
	
	buttonText: "Previous Image",
	
	init: function( player, options ) {
		this._super( player, options );
	
		this.player.on( 'controlsvisible', this.proxy(this.fadeIn) );
		this.player.on( 'controlshidden', this.proxy(this.fadeOut) );
	},
	
	buildCSSClass: function() {
		return 'vjs-playlist-image-control vjs-playlist-image-left';
	},
	
	onClick: function() {
		this.player.playlist.filterByType('image', true);
		this.player.playlist.engine.previous();
		this.trigger('playlistimagepreviousclick');
	}
});

_V_.PlaylistImageControlRight = _V_.Button.extend({
	
	buttonText: "Next Image",
	
	init: function( player, options ) {
		this._super( player, options );
	
		this.player.on( 'controlsvisible', this.proxy(this.fadeIn) );
		this.player.on( 'controlshidden', this.proxy(this.fadeOut) );
	},
	
	buildCSSClass: function() {
		return 'vjs-playlist-image-control vjs-playlist-image-right';
	},
	
	onClick: function() {
		this.player.playlist.filterByType('image', true);
		this.player.playlist.engine.next();
		this.trigger('playlistimagenextclick');
	}
});



_V_.options.components.playlist = {};