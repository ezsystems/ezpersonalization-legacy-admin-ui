



var pluginPanel = {
		
	mandator: null,
	mname: null,
	manuallyTriggeredAtLeastOnce : false, // if triggered by event, or 
	selectedPluginType : null, 
	
	
	'preInit' : function() {
		var self = this;
		var html, css;
		$.when(
			$.get("/plugin/plugin_panel.html", '', function(data) { html = data; }),
			$.get("/plugin/plugin.css", '', function(data) { css = data; })
	    ).always(function() {
	    	$("head").append($("<style type='text/css'>").html(css));
	    	$("body").append(html);
	    	self._htmlReady();
	    });
	},
	
	
	/** Called by "preInit", when HTML for plugins is loaded and attached to the DOM. 
	 **/
	'_htmlReady' : function() {
		var self = this;
		
		$('#pluginPanel .close_button').click(function() {
			self._back();
		});
		
		$('#pluginTabControls .create_new').click(function() {
			self.show(true, "");
		});
		
		$('#pluginPanel .type_selector div.type_button').click(function() {
			selectedPluginType = $(this).data("plugin-type");
			self._switchView(2);
		});
	},
	
	
	'_createNewPlugin' : function(pluginType) {
		
	    var customerPromise = yooAjax(null, {
	        url: "/api/v4/" + encodeURIComponent(mname) + "/plugin/" + decodeURIComponent(mandatorDao.getId()),
	        success: function (json) {
	            customer = json.profilePack.customer; // <-- "customer" is a global variable
	            
	            if (customer.id) {
		        	$('#eemail').val(ifnull(customer.email, ""));
		        	$('#ecompany').val(ifnull(customer.company, ""));
		        	$('#efname').val(ifnull(customer.firstName, ""));
		        	$('#elname').val(ifnull(customer.lastName, ""));
		        	$('#ephone').val(ifnull(customer.phone, ""));
		        	$('#estreet_and_house').val(ifnull(customer.address.street, ""));
		        	$('#ezip').val(ifnull(customer.address.zip, ""));
		        	$('#ecity').val(ifnull(customer.address.city, ""));
		        	$('#ecountry').val(ifnull(customer.address.country, ""));
		        	
		        	$('#contract_details').show();
	            } else {
	            	$('#contract_details').hide();
	            }
	        }
	    });
	    
	    
		
	},


	'mname' : function() {
		return this.mandator.baseInformation.id;
	},
	
		
	'init' : function(mandator) {
		this.mandator = mandator;
	},
	
	
	'show' : function(newPlugin, pluginCode) {
		this.manuallyTriggeredAtLeastOnce = true;
		this._show(newPlugin, pluginCode, true);
	},
	
	
	'_switchView' : function(step) {
		if (step == 1) {
			$('#pluginPanel .type_selector').show();
			$('#pluginPanel .plugin_configuration').hide();
		} else {
			$('#pluginPanel .type_selector').hide();
			$('#pluginPanel .plugin_configuration').show();
		}
	},
	
	
	'_show' : function(newPlugin, pluginCode, pushState) {
		if (this.mandator) {
			console.error("Unable to show the plugin panel. Mandator is null.");
			return;
		}
		
		if (newPlugin) {
			this._switchView(1);
		} else {
			this._switchView(2);
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
	
	
