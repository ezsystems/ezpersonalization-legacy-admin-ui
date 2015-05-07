



var pluginPanel = {
		
	mandator: null,
	manuallyTriggeredAtLeastOnce : false, // if triggered by event, or 
	selectedPluginType : null, 
	
	
	'preInit' : function() {
		var self = this;
		var html;
		$.when(
			$.get("/plugin/plugin_panel.html", '', function(data) { html = data; })
	    ).always(function() {
	    	$("body").append(html);
	    	self._htmlReady();
	    });
	},
	
	
	/** Called by "preInit", when HTML for plugins is loaded and attached to the DOM. 
	 **/
	'_htmlReady' : function() {
		var self = this;
		
		// user closes the plugin dialog
		
		$('#pluginPanel .close_button').click(function() {
			self._back();
		});
		
		// user selects a plugin type (for example "MAGENTO") before creating a new plugin
		
		$('#pluginPanel .type_selector div.type_button').click(function() {
			self.selectedPluginType = $(this).data("plugin-type");
			
			self._createNewPlugin(self.selectedPluginType);
			
				self._switchView(2);
		});
	},
	
	
	'_createNewPlugin' : function(pluginType) {
		var self = this;
		var	mname = this.mandator.baseInformation.id;
		
		var designs;
		
	    yooAjax("#pluginPanel", {
	        url: "/api/v4/" + encodeURIComponent(mname) + "/plugin/designs/" + encodeURIComponent(pluginType),
	        success: function (json) {
	        	designs = json;
	        }
	    }).pipe(function(designs) {
    		var request = "/api/v4/" + encodeURIComponent(mname) + "/plugin/template/" + encodeURIComponent(pluginType);
    		
    		if (designs.length > 0) {
    			request += "/" + encodeURIComponent(designs[0].id);
    		}
	    	
	    	return yooAjax("#pluginPanel", {url: request});
		}).done(function(template) {
			self._populateData(template);
		});
	},
	
	
	'_populateData' : function(plugin) {
		
		
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
		if ( ! this.mandator) {
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

		
};


var pluginTab = {
	mandator: null, // full mandator object (a.k.a. MandatorPack)
	plugins: null,  // the list of plugins (data)
	
	'preInit' : function() {
		var self = this;
		var html, css;
		$.when(
			$.get("/plugin/plugin_tab.html", '', function(data) { html = data; }),
			$.get("/plugin/plugin.css", '', function(data) { css = data; })
	    ).always(function() {
	    	$("head").append($("<style type='text/css'>").html(css));
	    	$("section.scenarios").append(html);
	    	self._htmlReady();
	    });
	},
	
	/** Called by "preInit", when HTML for plugins is loaded and attached to the DOM. 
	 **/
	'_htmlReady' : function() {
		var self = this;
		
		// user clicks the button "create new plugin"
		
		$('#pluginTabControls .create_new').click(function() {
			pluginPanel.show(true, "");
		});
	},	
	
	'init' : function(mandator) {
		this.mandator = mandator;
		this.loadPluginList();
	},
	
	
	'loadPluginList' : function() {
		var self = this;
		var	mname = this.mandator.baseInformation.id;
		
		yooAjax("#pluginTab", {
	        url: "/api/v4/" + encodeURIComponent(mname) + "/plugin/all",
	        success: function (json) {
	        	self.plugins = json;
	        	self._populateData();
	        }
	   });
	},
	
	
	'_populateData' : function() {
		
		// filling the table
		
		var template = $("#pluginTab tr.pg_template").clone();
		template.removeClass("template");
		template.show();
		
		var single_type = this.plugins.length > 0 ? this.plugins[0].base.type : null;
		var row; // we will use it later to fetch the icon
		
		this.plugins.forEach(function(plugin) {
			
			var type = plugin.base.type;
			
			row = template.clone();
			
			if (type != single_type) {
				single_type = null;
			}
			
			row.find(".pg_image img").hide();
			row.find(".pg_image img.pg_type_" + type).show();
			
			row.find(".pg_type").text(plugin.base.type);
			row.find(".pg_code").text(ifnull(plugin.base.pluginId, " - "));
			row.find(".pg_design").text(plugin.frontend.design);
			
			var $reco = row.find(".pg_recoboxes");
			plugin.frontend.boxes.forEach(function(box) {
				var $box = $("<div></div>");
				$box.text(box.code + " [" + (box.rows * box.columns) + "]");
				$reco.append($box);
			});

			row.find(".pg_search").text("not supported by this plugin type");
			row.find(".pg_newsletters").text("not supported by this plugin type");
			
			row.find(".pg_import_jobs").text(plugin.importJobs.length);
			
			row.find(".pg_import_settings").on("click", function(event) {
				
				pluginPanel.show(false, plugin.base.pluginId);
				return false; // disabling default redirect
			});
			
			$("#pluginTab tr.header").after(row);
		});
		
		// icon
		
		var $tab_button = $("section.scenarios li.tabPlugins");
		
		if (single_type) {
			var $icon = row.find(".pg_image img.pg_type_" + single_type).clone();
			
			$icon.css("margin", "0em");
			$icon.css("vertical-align", "top");
			
			$tab_button.find("label span").hide();
			$tab_button.find("label").css("font-size", "0.4em");
			$tab_button.find("label").append($icon);
			
		} else {
			$tab_button.find("label span").show();
			$tab_button.find("label img").hide();
		}
		
	},
	

	'destroy' : function() {
		this.mandator = null;
	}
};


// Attaching HTML and creating event handling

pluginTab.preInit();
pluginPanel.preInit();



function pluginPopstate(event, manualTriggered) {
	var state = ifnull(event.state, event.detail); // PopStateEvent has 'state' flag, but custom event 'detail'
	 
	if (state && state.indexOf("plugin") == 0) {
		var dot = state.indexOf(".");
		var code = (dot == -1) ? null : state.substring(dot + 1, state.length);
		
		pluginPanel._show(dot == -1, code, manualTriggered);
		
		$("section.scenarios .tabPlugins").trigger("click"); // activating the plugin tab
		
	} else {
		pluginPanel.hide();
	}
}	


window.addEventListener('popstate_manual', function(event) {
	pluginPopstate(event, true);
});


window.addEventListener('popstate', function(event) {
	pluginPopstate(event, false);
});


window.addEventListener('dashboard_tab_switched', function(event) {
	
		
});


window.addEventListener('mandator_loaded', function(event) {
	
	var mandator = event.detail;
	
	if (mandator) {
		pluginPanel.init(mandator);
		pluginTab.init(mandator);
	} else {
		pluginPanel.destroy();
		pluginTab.destroy();
	}
	
});
	
	
