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
 * @typedef {object} SuggestionBox
 */

/**
 * @typedef {object} SuggestionDataset
 * @property {string} name
 * @property {int} itemType
 * @property {string} lang
 * @property {int} amount
 * @property {string} template
 */

/**
 * @typedef {object} PluginSearch
 * @property {boolean} enabled
 * @property {string} css
 * @property {SuggestionBox[]} searchBoxes
 * @property {SuggestionDataset[]} datasets
 */

/**
 * @typedef {object} Design
 * @property {string} id
 * @property {string} description
 */

/**
 * @typedef {object} Plugin
 * @property {PluginTech} tech
 * @property {PluginBase} base
 * @property {PluginFrontend} frontend
 * @property {PluginSearch} search
 * @property {object[]} importJobs
 */

/**
 * @typedef {object} PluginTech
 * @property {PluginTech} twoLeggedAuthentication
 * @property {PluginBase} authKeyName
 * @property {PluginFrontend} authSecretName
 */

/**
 * @typedef {object} Mandator
 * @property {MandatorBaseInformation} baseInformation
 */

/**
 * @typedef {object} MandatorBaseInformation
 * @property {string} id
 * @property {string} website
 * @property {string} alphanumericItems
 */

var PLUGIN_ANCHOR_CREATE = "plugin/create";
var PLUGIN_ANCHOR_CONFIG = "plugin/configuration";

var pluginPanel = {

	/**
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
	 *  @member {Plugin} */
	template : null,

	/**
	 *  @member {boolean} */
	creating : false,

	/** @member {Object} */
	$panel : null,


    /** Is MUST be called ONCE, after the object is created.
     */
	'preInit' : function() {
        var self = this;
		var html;
		var html_logos;
		$.when(
			$.get("/plugin/plugin_panel.html", '', function(data) { html = data; }),
			$.get("/plugin/plugin_logos.html", '', function(data) { html_logos = data; })
	    ).always(function() {
	    	$("body").append(html);
			self.$panel = $('#pluginPanel');
			self.$panel.find('div.plugin_logo_wrapper').each(function() {
				$(this).append($(html_logos));
			});

	    	self._htmlReady();
	    });
	},


	/** Called by "preInit", when HTML for plugins is loaded and attached to the DOM.
	 **/
	'_htmlReady' : function() {
		var self = this;

		// user closes the plugin dialog
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

		var $application_key = this.$panel.find("#plugin_app_key");

		var $saveAndClose = this.$panel.find(".plugin_save_and_quit");
        var $saveOnly = this.$panel.find(".plugin_save");

		$application_key.on("change", function() {
			if (self.plugin.tech.twoLeggedAuthentication && $application_key.val()) {
                $saveAndClose.attr("data-translate", "plugin_save_oauth");
			} else {
                $saveAndClose.attr("data-translate", "plugin_save_quit");
			}
			i18n($saveAndClose);
		});


        $saveAndClose.on("click", function() {
            self._saveAndHide();
        });

        $saveOnly.on("click", function() {
            self._saveOnly();
        });
	},

    '_saveAndHide': function() {

        var self = this;

        this._saveOnly().done(function() {
            var $application_key = self.plugin.base.appKey;
            var $endpoint = self.plugin.tech.twoLeggedAuthentication
				? ifTrempty(self.plugin.base.endpoint, self.mandator.baseInformation.website)
				: false;

            if ($application_key && $endpoint) {
                setMessagePopUp("neutral", "plugin_message_redirecting_to_oauth", $endpoint);

                var url = self._pluginApiUrl() + "/auth?returnUrl=/";
                window.location = url;
            } else {
                self.hide();
            }
        });
    },

    '_saveOnly': function() {

        if ( ! this._updateJson()) {
             return $.Deferred().fail().promise();
        }

        var plugin = this.plugin;

        var request = {
            base : plugin.base,
            frontend : plugin.frontend,
            search : plugin.search
        };

        var	mandator_id = this.mandator.baseInformation.id;

        return yooJson(this.$panel.find(".contentWrapper"), {
            url: "/api/v4/" + encodeURIComponent(mandator_id) + "/plugin/" + (this.creating ? "create" : "update"),
            data: request
        }).done(function() {
            setMessagePopUp("positive", "message_data_saved_successfully");
        });
    },

    /** Returns the URL for the current plugin like
     *  /api/v4/#mandator-id#/plugin/#plugin-id#
     *
     *  @returns {string}
     */
    "_pluginApiUrl" : function () {
        var	mandator_id = this.mandator.baseInformation.id;
        var id = this.plugin.base.pluginId;
        var url = "/api/v4/" + encodeURIComponent(mandator_id) + "/plugin";
        if (id) {
            url += "/" + encodeURIComponent(id);
        }
        return url;
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

		var $header = this.$panel.find('h2');

		if (newPlugin) {
			$header.attr("data-translate", "plugin_panel_new_plugin");
		} else if (pluginCode) {
			$header.attr("data-translate", "plugin_panel_existed_plugin_code");
		} else {
			$header.attr("data-translate", "plugin_panel_existed_plugin");
			$header.find("span").text(pluginCode);
		}
		i18n($header);

        $('#pluginPanel').show(); // <-- SHOW PANEL

		if (newPlugin) {
			this._showStepOne();
		} else {
			this._showStepTwo(false, null, pluginCode);
		}

		if ( this.manuallyTriggeredAtLeastOnce ) {
			if (pluginCode) {
				switchHistoryState(newPlugin ? PLUGIN_ANCHOR_CREATE : PLUGIN_ANCHOR_CONFIG + "/" + encodeURIComponent(pluginCode), pushState);
			} else {
				switchHistoryState(newPlugin ? PLUGIN_ANCHOR_CREATE : PLUGIN_ANCHOR_CONFIG, pushState);
			}
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

		if (typeof plugin === 'object' && plugin !== null) { // null is ID for _default_ plugin
			return $.Deferred().resolve(plugin).promise();
		}

		var mname = this.mandator.baseInformation.id;

		var request = "/api/v4/" + encodeURIComponent(mname) + "/plugin";
		if (plugin) {
			request = request + "/" + encodeURIComponent(plugin);
		}
		request = request + "/get";

		return yooJson(this.$panel.find(".contentWrapper"), {url: request});

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

		return yooJson(this.$panel.find(".contentWrapper"), {url: request});
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

		return yooJson(this.$panel.find(".contentWrapper"), {url: request, success: function(designs) {
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

		if ( ! pluginType) { // <-- loading plugin, if not exists
			if (typeof plugin === "string" || plugin === null) {
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
					self._showStepTwoFinal(false, plugin, template, designs);
				});
			});
		} else {
			this._loadTemplateAndDesigns(pluginType, null).done(function(template, designs) {
				self._showStepTwoFinal(true, template, template, designs);
			});
		}
	},

    /**
     * @param {Design[]} designs
     * @param {string} designId
     */
    '_findDesignDescription': function(designs, designId) {
        var result = "Custom";
        designs.forEach(/** @param {Design} design*/ function(design) {
            if (design.id == designId) {
                result = design.description;
            }
        });
        return result;
    },

	/**
	 * @param {boolean} newPlugin
	 * @param {Plugin} plugin
	 * 		Current plugin JSON to be configured.
	 * 		In case of a new plugin, same instance as template
	 * @param {Plugin} template
	 * @param {Design[]} designs
	 */
	'_showStepTwoFinal' : function(newPlugin, plugin, template, designs) {

		this.plugin = plugin;
		this.template = template;
		this.creating = newPlugin;

		// Filling plugin type and id

		this.$panel.find("h2 span").text(plugin.base.pluginId);

		$("#pg_type").val(plugin.base.type);

		this.$panel.find("div.plugin_logo div").hide();
		this.$panel.find("div.plugin_logo div[data-plugin-type='"+plugin.base.type+"']").show();

		var $inputPluginId = $("#plugin_id");

		$inputPluginId.val(plugin.base.pluginId);

		if (newPlugin) {
			$inputPluginId.removeAttr("readonly");
		} else {
			$inputPluginId.attr("readonly", "readonly");
		}

		// Filling design select box

		var $pg_design = $("#pg_design");

		// Looking for selected design
        var designDescription = this._findDesignDescription(designs, plugin.frontend.design);

        if (designDescription) {
            $pg_design.val(designDescription);
            $pg_design.attr("data-translate", "");
        } else {
            $pg_design.attr("data-translate", "plugin_recos_design_custom");
        }
        i18n($pg_design);


		if ( ! $pg_design.val()) {
			$pg_design.val(""); // last design
		}

		// Filling recommendation box matrix

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

		// Filling Product Import Section

		var import_config = this.$panel.find(".plugin_import");

		if ( ! plugin.base.importAvailable) {
			import_config.hide();
		} else {
			import_config.show();

			var $endpoint = this.$panel.find("#plugin_endpoint");
			var $app_key = this.$panel.find("#plugin_app_key");
			var $app_secret = this.$panel.find("#plugin_app_secret");

			var $app_key_label = this.$panel.find("label[for=plugin_app_key]");
			var $app_secret_label = this.$panel.find("label[for=plugin_app_secret]");

			$app_key.val(plugin.base.appKey);
			$app_secret.val(plugin.base.appSecret);

			var $oauth_section = this.$panel.find(".plugin_oauth");

			if (plugin.tech.authKeyName) {
				$app_key_label.text(plugin.tech.authKeyName);
				$app_secret_label.text(plugin.tech.authSecretName)
				$oauth_section.show();
			} else {
				$oauth_section.hide();
			}

			$endpoint.val(plugin.base.endpoint);
			$app_key.val(plugin.base.appKey);
			$app_secret.val(plugin.base.appSecret);
		}

		$app_key.trigger("change"); // adjusting save button description
	},


    /** Updates the field #plugin using the data from the from.
     *
     *  @returns {boolean}
     *      true, if the update was successful.
     */
	"_updateJson" : function() {

		var $panel = this.$panel;

		$panel.find("input, select").removeClass("problem");
		$panel.find("div.plugin_errors div").hide();

		var plugin = this.plugin;

		if (plugin === null) {
			return false; // not loaded (yet)
		}

		var $id = $("#plugin_id");

        plugin.base.pluginId = $id.val();

        plugin.frontend.design = $id.val();

		plugin.frontend.boxes.forEach(/** @param {PluginRecoBox} box */ function(box) {
			var $rows = $panel.find("#rows_" + box.code);
			var $columns = $panel.find("#columns_" + box.code);

            box.rows = $rows.val();
            box.columns = $columns.val();
		});

        plugin.base.endpoint  = $("#plugin_endpoint").val();
        plugin.base.appKey    = $("#plugin_app_key").val();
        plugin.base.appSecret = $("#plugin_app_secret").val();

        return true;
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
	plugins: null,  // the list of plugins (data),

	/** @member {jQuery} */
	$tab: null,

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

		this.$tab = $("#pluginTab");
	},

	'init' : function(mandator) {
		this.mandator = mandator;
		this.loadPluginList();
	},


	/**
	 * @param {String} pluginId
	 * @return {Plugin}
	 */
	'findPlugin' : function(pluginId) {
		for(var i=0; i < this.plugins.length; i++) {
			if (this.plugins[i].base.pluginId == pluginId) {
				return this.plugins[i];
			}
		}
		return null;
	},


	'loadPluginList' : function() {
		var self = this;
		var	mname = this.mandator.baseInformation.id;

        yooJson(this.$tab, {
	        url: "/api/v4/" + encodeURIComponent(mname) + "/plugin/all",
	        success: function (json) {
	        	self.plugins = json;
	        	self._populateData();
	        }
	   });
	},


	'_populateData' : function() {

		// filling the table
		var self = this;

		var $template = this.$tab.find("tr.pg_template").clone();
		$template.removeClass("pg_template");
		$template.show();

		var single_type = this.plugins.length > 0 ? this.plugins[0].base.type : null;
		var row; // we will use it later to fetch the icon

		this.$tab.find("tr").not(".fixed, .pg_template").remove();
		this.$tab.find("tr.pg_no_plugins").show();

		this.plugins.forEach(function(plugin) {

			self.$tab.find("tr.pg_no_plugins").hide();

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

			var $search = row.find(".pg_search");

			plugin.search.datasets.forEach(function(dataset) {
				var $box = $("<div></div>");
				$box.text(dataset.name + " [" + (dataset.amount) + "]");
				$search.append($box);
			});

			//row.find(".pg_search").text("not supported by this plugin type");
			row.find(".pg_newsletters").text("not supported by this plugin type");

			row.find(".pg_import_jobs").text(plugin.importJobs.length);

			row.find(".pg_import_settings").on("click", function(event) {

				pluginPanel.show(false, plugin.base.pluginId);
				return false; // disabling default redirect
			});

			self.$tab.find("tr.header").after(row);
		});

		// icon

		var $tab_button = $("section.scenarios li.tabPlugins");

		if (single_type) {

			$tab_button.find("label img").remove();

			var $icon = row.find(".pg_image img.pg_type_" + single_type).filter(":first").clone();

			//$icon.css("margin", "0em");
			$icon.css("vertical-align", "top");

			var $div = $("<div style='margin: -1.4em;'></div>");
			$div.append($icon);

			$tab_button.find("label span").hide();
			$tab_button.find("label").css("font-size", "0.4em");
			$tab_button.find("label").append($div);

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

	if (state && state === PLUGIN_ANCHOR_CREATE) {

		pluginPanel._show(true, null, manualTriggered);

		$("section.scenarios .tabPlugins").trigger("click"); // activating the plugin tab

	} else if (state && state.indexOf(PLUGIN_ANCHOR_CONFIG) === 0) {

		var found_exist = state.substring(PLUGIN_ANCHOR_CONFIG.length, state.length).match(/^(\/(\w*))?$/);

		if (found_exist) {
			var code = (found_exist.length >= 2 && found_exist[2]) ? decodeURIComponent(found_exist[2]): null;

			pluginPanel._show(false, code, manualTriggered);

			$("section.scenarios .tabPlugins").trigger("click"); // activating the plugin tab
		} else {
			pluginPanel.hide();
		}

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
	
	
