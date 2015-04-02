



var pluginPanel = {
		
	mandator: null,
	manuallyTriggeredAtLeastOnce : false, // if triggered by event, or 
	
	
	'preInit' : function() {
		var self = this;
		
		$.get("/includes/plugin_panel.html", '', function(data) {
			$("body").append(data);
			self._htmlReady();
		});
	},
	
	
	'_htmlReady' : function() {
		var self = this;
		
		$('#pluginPanel .close_button').click(function () {
			self._back();
		});
		$('#pluginTabControls .create_new').click(function () {
			self.show(true, "");
		});
	},
	
		
	'init' : function(mandator) {
		this.mandator = mandator;
	},
	
	
	'show' : function(newPlugin, pluginCode) {
		this.manuallyTriggeredAtLeastOnce = true;
		this._show(newPlugin, pluginCode, true);
	},
	
	
	'_show' : function(newPlugin, pluginCode, pushState) {
		if (this.mandator) {
			console.error("Unable to show the plugin panel. Mandator is null.");
			return;
		}
		$('#pluginPanel').show();
		
		if ( this.manuallyTriggeredAtLeastOnce ) {
			switchHistoryState(newPlugin ? "plugin" : "plugin." + pluginCode, pushState);
		}
	},
	
	
	'_back' : function() {
		if (this.manuallyTriggeredAtLeastOnce) {
			window.history.back();
		} else {
			this.hide();
		}
	},

	
	'hide' : function() {
		$('#pluginPanel').hide();
		switchHistoryState("", false);
	},	


	'destroy' : function() {
		this.hide();
		this.mandator = null;
	},


	'popstate' : function(event, manualTriggered) {
		var state = ifnull(event.state, event.detail); // PopStateEvent has 'state' flag, but custom event 'detail'
		 
		if (state && state.indexOf("plugin") == 0) {
			var dot = state.indexOf(".");
			var code = (dot == -1) ? null : state.substring(dot + 1, state.length);
			
			pluginPanel._show(dot == -1, code, manualTriggered);
		} else {
			pluginPanel.hide();
		}
	}		
		
};


// Attaching HTML and creating event handling

pluginPanel.preInit();


window.addEventListener('popstate_manual', function(event) {
	pluginPanel.popstate(event, true);
});


window.addEventListener('popstate', function(event) {
	pluginPanel.popstate(event, false);
});


window.addEventListener('mandator_loaded', function(event) {
	
	var mandator = event.detail;
	
	if (mandator) {
		pluginPanel.init(mandator);
	} else {
		pluginPanel.destroy();
	}
	
});
	
	
