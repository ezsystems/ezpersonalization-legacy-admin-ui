/**
 * @typedef {object} PluginBase
 * @property {string} pluginId
 * @property {string} type
 * @property {string} endpoint
 * @property {string} appKey
 * @property {string} appSecret
 */

/**
 * @typedef {object} PluginFrontend
 * @property {string} design
 * @property {PluginRecoBox[]} boxes
 */

/**
 * @typedef {object} PluginRecoBox
 * @property {string} code
 * @property {string} name
 * @property {number} rows
 * @property {number} columns
 */

/**
 * @typedef {object} Design
 * @property {string} id
 * @property {string} description
 */

/**
 * @typedef {object} Plugin
 * @property {PluginBase} base
 * @property {PluginFrontend} frontend
 * @property {object[]} importJobs
 */
var pluginPanel = {

	/** @typedef {object} Mandator
	 *  @property {object} baseInformation
	 *
	 *  @member {Mandator}
	 **/
	mandator: null,


	/** @member {boolean} */
	manuallyTriggeredAtLeastOnce : false, // if triggered by event, or


	/** @member {string} */
	selectedPluginType : null,


	/** @member {Design[]} */
	designs : null,


	/** If plugin type was changed, designs must be reloaded
	 *
	 *  @member {string} */
	designsLoadedForPluginType : null,

	/**
	 *
	 *  @member {Plugin} */
	plugin : null,

	/**
	 *
	 *  @member {Plugin} */
	template : null,


	/** @member {Object} */
	$panel : null,

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

		this.$panel = $('#pluginPanel');

		this.$panel.find('.close_button').click(function() {
			self._back();
		});

		// user selects a plugin type (for example "MAGENTO") before creating a new plugin

		this.$panel.find('.type_selector div.type_button').click(function() {
			self.selectedPluginType = $(this).data("plugin-type");

			this._showStepTwo(true, self.selectedPluginType, null);
		});


		// user switches design

		var $design_select_box = this.$panel.find("#pg_design");

		$design_select_box.on("change", function() {
			if (!self.plugin) {
				console.warn("Error changing plugin design. Plugin is not loaded (yet?).");
				return;
			}

			var new_template_id = $design_select_box.val();

			self._loadTemplate(self.plugin.base.type, new_template_id).done(function(template) {
				self.plugin.frontend = JSON.parse(JSON.stringify(template.frontend)); // cloning

				self._showStepTwoFinal(false, self.plugin, template, self.designs);
			});
		});
	},


	'_createNewPlugin' : function(pluginType) {

	},


	/** @param {Mandator} mandator
	 */
	'init' : function(mandator) {
		this.mandator = mandator;
	},


	'show' : function(newPlugin, pluginCode) {
		this.manuallyTriggeredAtLeastOnce = true;

		this._show(newPlugin, pluginCode, true);
	},


	'_show' : function(newPlugin, pluginCode, pushState) {
		if ( ! this.mandator) {
			console.error("Unable to show the plugin panel. Mandator is null.");
			return;
		}

		var $h2 = this.$panel.find('h2');

		if (newPlugin) {
			$h2.attr("data-translate", "plugin_panel_new_plugin");
		} else if (pluginCode) {
			$h2.attr("data-translate", "plugin_panel_existed_plugin_code");
		} else {
			$h2.attr("data-translate", "plugin_panel_existed_plugin");
			$h2.find("span").text(pluginCode);
		}
		i18n($h2);

		if (newPlugin) {
			this._showStepOne();
		} else {
			this._showStepTwo(false, null, pluginCode);
		}

		this.$panel.find("input[name='pg_type']").val();

		$('#pluginPanel').show();

		if ( this.manuallyTriggeredAtLeastOnce ) {
			switchHistoryState(newPlugin ? "plugin" : "plugin." + pluginCode, pushState);
		}
	},


	'_showStepOne' : function() {
		this.$panel.find('.type_selector').show();
		this.$panel.find('.plugin_configuration').hide();
	},


	/**
	 * @param {string|Plugin} plugin
	 */
	'_loadPlugin' : function(plugin) {
		var self = this;

		if (typeof plugin === 'object') {
			return $.Deferred().resolve(plugin).promise();
		}

		var mname = this.mandator.baseInformation.id;

		var request = "/api/v4/" + encodeURIComponent(mname) + "/plugin";
		if (plugin) {
			request = request + "/" + encodeURIComponent(plugin);
		}
		request = request + "/get";

		return yooJson('#pluginPanel', {url: request});

		//return yooJson('#pluginPanel', {url: request, success: function(plugin) {
		//	self.plugin = plugin;
		//}});
	},


	/**
	 * @param {string} pluginType
	 * @param {string} pluginDesign
	 */
	'_loadTemplate' : function(pluginType, pluginDesign) {

		var mname = this.mandator.baseInformation.id;

		var request = "/api/v4/" + encodeURIComponent(mname) + "/plugin/template";
		request = request + "/" + encodeURIComponent(pluginType);
		if (pluginDesign) {
			request = request + "/" + encodeURIComponent(pluginDesign);
		}

		return yooJson('#pluginPanel', {url: request});
	},


	/**
	 * @param {string} pluginType
	 */
	'_loadDesigns' : function(pluginType) {

		if (pluginType === this.designsLoadedForPluginTypens) {
			return $.Deferred().resolve(this.designs).promise();
		}

		var self = this;

		var mname = this.mandator.baseInformation.id;

		var request = "/api/v4/" + encodeURIComponent(mname) + "/plugin/designs/" + encodeURIComponent(pluginType);

		return yooJson('#pluginPanel', {url: request, success: function(designs) {
			self.designs = designs;
			self.designsLoadedForPluginTypens = pluginType;
		}});
	},


	'_loadPluginAndDesigns' : function (pluginType, pluginCode) {
		return $.when(this._loadPlugin(pluginCode), this._loadDesigns(pluginType));
	},


	'_loadTemplateAndDesigns' : function (pluginType, pluginDesign) {
		return $.when(this._loadTemplate(pluginType, pluginDesign), this._loadDesigns(pluginType));
	},


	/**
	 * @param {boolean} newPlugin
	 * @param {string} pluginType
	 * @param {string|Plugin} plugin
	 */
	'_showStepTwo' : function(newPlugin, pluginType, plugin) {
		this.$panel.find('.type_selector').hide();
		this.$panel.find('.plugin_configuration').show();

		var self = this;

		if ( ! pluginType) {
			if (typeof plugin === "string") {
				this._loadPlugin(plugin).done(function(pluginObj) {
					self._showStepTwo(false, pluginObj.base.type, pluginObj);
				});
				return;
			} else {
				pluginType = plugin.base.type;
			}
		}

		if ( ! newPlugin) {
			this._loadPluginAndDesigns(pluginType, plugin).done(function(plugin, designs) {
				self._loadTemplate(pluginType, plugin.frontend.design).done(function(template) {
					self._showStepTwoFinal(true, plugin, template, designs);
				});
			});
		} else {
			this._loadTemplateAndDesigns(pluginType, null).done(function(template, designs) {
				self._showStepTwoFinal(false, template, template, designs);
			});
		}
	},


	/**
	 * @param {boolean} newPlugin
	 * @param {Plugin} plugin
	 * @param {Plugin} template
	 * @param {Design[]} designs
	 */
	'_showStepTwoFinal' : function(newPlugin, plugin, template, designs) {

		this.plugin = plugin;
		this.template = template;

		// Filling plugin type and id

		this.$panel.find("h2 span").text(plugin.base.pluginId);

		$("#pg_type").val(plugin.base.type);

		// Filling design select box

		var $pg_design = $("#pg_design");

		$pg_design.find("optgroup, option").remove();

		var currentGroupLabel;
		var $currentGroup = $pg_design;

		designs.forEach(/** @param {Design} design*/ function(design) {

			var parts = design.description.split(":");

			var description = (parts.length > 1) ?
				design.description.substring(parts[0].length + 1, design.description.length) :
				design.description;

			if (parts.length > 1) {
				if (currentGroupLabel != parts[0]) {
					currentGroupLabel = parts[0];
					$currentGroup = $pg_design.append($('<optgroup>', {label : currentGroupLabel}));
				}
			}

			$currentGroup.append($('<option>', {
				value: design.id,
				text: description ? design.id + ": " + description  : design.id
			}));
		});

		$currentGroup = $pg_design.append($('<optgroup>', {label : "Yoochoose"}));
		var $lastDesign = $('<option>', { value: "" });
		$currentGroup.append($lastDesign);

		$lastDesign.attr("data-translate", "plugin_recos_design_custom");

		i18n($currentGroup);

		// Looking for selected design

		var design = plugin.frontend.design;
		$pg_design.val(design);

		if ( ! $pg_design.val()) {
			$pg_design.val(""); // last design
		}

		// Filling recommendation box matrix

		$("pg_type").val(plugin.base.type);


		var $recosTable = this.$panel.find("tr.pg_recos table");

		$recosTable.find("tr").not(".fixed, .pg_template").remove();

		plugin.frontend.boxes.forEach(/** @param {PluginRecoBox} box */ function(box) {
			var $row = $recosTable.find("tr.pg_template").clone();
			$row.removeClass("pg_template");
			$row.show();

			var $box_header = $row.find("label[for='rows_xxx']");
			$box_header.attr("for", "rows_" + box.code);

			if (box.name) {
				$box_header.removeAttr("data-translate").text(box.name);
			} else {
				$box_header.attr("data-translate", "plugin_recos_box_code");
				$box_header.find("span").text(box.code);
				i18n($box_header);
			}

			$row.find("[for='columns_xxx']").attr("for", "columns_" + box.code);

			$row.find("#rows_xxx").attr("id", "rows_" + box.code).val(box.rows);
			$row.find("#columns_xxx").attr("id", "columns_" + box.code).val(box.columns);

			$recosTable.append($row);
		});
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
	}


};


////////////////////////////////////////////////////////////////////////////// TAB ////////////////


var pluginTab = {
	mandator: null, // full mandator object (a.k.a. MandatorPack)

	/** @member {Plugin[]} */
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
		// user clicks the button "create new plugin"

		$('#pluginTabControls').find('.create_new').click(function() {
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

		var $template = $("#pluginTab tr.pg_template").clone();
		$template.removeClass("pg_template");
		$template.show();

		var single_type = this.plugins.length > 0 ? this.plugins[0].base.type : null;
		var row; // we will use it later to fetch the icon

		$("#pluginTab tr").not(".fixed, .pg_template").remove();
		$("#pluginTab tr.pg_no_plugins").show();

		this.plugins.forEach(function(plugin) {

			$("#pluginTab tr.pg_no_plugins").hide();

			var type = plugin.base.type;

			row = $template.clone();

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

			$tab_button.find("label img").remove();

			var $icon = row.find(".pg_image img.pg_type_" + single_type).filter(":first").clone();

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
	 
	if (state && state.indexOf("plugin") === 0) {
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
	
	
