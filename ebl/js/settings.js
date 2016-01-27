
var reference_code = gupDecoded('reference_code');
var customerID     = gupDecoded('customer_id');
var fromTemplate   = gupDecoded('from_template');

	
  $(document).ready(function() {
	  setLoadingDiv($('body'));
	  
	  $.when(
		  initialize_configurator_header(),
		  include(["/js/dao/scenario.js"]).then(function() {
			  return scenarioDao.init(customerID, reference_code, true);
	  	  })
	  ).always(function() {
		  unsetLoadingDiv($('body'));
	  }).done(function() {
		  initializeSolutionAndItemTypes();
		  initialize();
	  }).fail(function() {
		  setMessagePopUp("problem", "configurator_error_loading_scenario", reference_code);
	  });
	  
  });
	  
	
	/** It must be called as the <code>mandatorInfo</code> is loaded.
	 */
	function initializeSolutionAndItemTypes() {
		var solution = mandatorInfo.baseInformation.version;
		
		var defaultItemType = mandatorInfo.itemTypeConfiguration.defaultType;
  			 
		if (solution == 'EXTENDED') {
			
			$("#input_type_block select").html(""); // removing all options
			$("#output_type_block ul").html(""); // removing all list items
			
	  		for (var i in mandatorInfo.itemTypeConfiguration.types) {
	  			var t = mandatorInfo.itemTypeConfiguration.types[i];
	  			var open = '';
	  			var close = '';
	  			var pipe = '';
	  			if ((t.contentTypes && t.contentTypes != '' && t.contentTypes != 'undefined' && t.contentTypes != 'null') || (t.language && t.language != '' && t.language != 'undefined' && t.language != 'null')) {
	  				open = '[';
	  				close = ']';
	  				if (t.contentTypes && t.language) {
	  					pipe = ' | ';
	  				}
	  			}
	  			 var d =  t.description + ' (' + t.id + ') '  + open + ((t.contentTypes != null && t.contentTypes != 'null') ? t.contentTypes : '') + pipe + ((t.language != null && t.language != 'null') ? t.language : '') + close;
	  			var selectedTxt = '';
	  			if(t.id == defaultItemType && fromTemplate ){
	  				selectedTxt = ' id="defaultInItemType" selected = "selected" ';
	  				console.log("defaultItemType="+defaultItemType+".");
	  			}
	  			$('<option value="' + t.id + '"'+selectedTxt+'></option>').appendTo($("#input_type_block select")).text(d);
	  			
	  			var li = $('<li class="checkbox_field"></li>').appendTo($("#output_type_block ul"));

	  			$('<input value="' + t.id + '" type="checkbox" id="output_type_' + t.id + '" name="output_type">').appendTo(li);
	  			
	  			$('<label for="output_type_' + t.id + '"></label>').appendTo(li).text(" " + d);
	  		}
			
			if (fromTemplate) { // creating new scenario
				$("#output_type_block input[value='" + defaultItemType + "']").prop('checked', true);
			}
		} else {
			
			var defaultItemTypeDescription = "Default";
			
			for (var i in mandatorInfo.itemTypeConfiguration.types) {
				if (mandatorInfo.itemTypeConfiguration.types[i].id == defaultItemType) {
					defaultItemTypeDescription = mandatorInfo.itemTypeConfiguration.types[i].description;
					
				}
			}
			
			var d = defaultItemTypeDescription + ' (' + defaultItemType + ')';
			var l = $('<label></label>').text(d);
			
			$('#input_type_block').hide();
			$('#output_type_block').hide();
			
			$('#input_type_block, #output_type_block').css("opacity",'0.50');
			
			$('#filter_group_item li:has(#no_cheaper_products)').hide();
			$('#filter_group_item li:has(#enable_min_price)').hide();
			$('#filter_group_item li:has(#no_price_hide)').hide();

			$('#filter_group_user').hide();
			
			$('#no_cheaper_products, #enable_min_price').parent().css("opacity",'0.50');
		}
		
		$('#input_type_block .value').css('visibility', 'visible');
		$('#output_type_block .value').css('visibility', 'visible');
	}
	
	
  	var initialize = function() {
  		
  		$("#scenario_title").prop('disabled', false);

		if (fromTemplate) {
			$('#scenario_id').prop('disabled', false);
			$('.configurator_tab').addClass("no_link").find('a').attr("style", "color: #000000; cursor:text;").find('span').attr("style", "text-decoration: none;");
			$('.preview_tab').addClass("no_link").find('a').attr("style", "color: #000000; cursor:text;").find('span').attr("style", "text-decoration: none;");
			$('#button_save').attr('data-translate', 'settings_button_save_next_step');
			$('.delete').attr('data-translate', 'settings_cancel');
		}

		//$('.configurator_tab').find('a').attr("href", "configuratorpop.html?reference_code=" + reference_code + "&customer_id=" + customerID);
		$('.settings_tab').find('a').attr('href', 'settingspop.html?reference_code='+reference_code+'&customer_id='+customerID);
		
		var updateFunction = function() {
			var a = updateScenario();
			var b = updateFilters();
			var disable = !a || !b;
			if (disable) {
				setLockedDiv($('#button_save'));
			} else {
				unsetLockedDiv($('#button_save'));
			}
		};
		
		
		var title = scenarioDao.scenario.title ? scenarioDao.scenario.title + " (" + scenarioDao.scenario.referenceCode + ")" : scenarioDao.scenario.referenceCode;
		
		var additionalParameter = "?reference_code=" + encodeURIComponent(reference_code) + "&customer_id=" + encodeURIComponent(customerID);
		window.parent.history.replaceState(null, title, "/" + additionalParameter);
		
		renderScenario();
		
		updateFunction();
		
		$("input, textarea, select").change(updateFunction);
		
		$("input").keyup(updateFunction);
		
		$('#button_save').click(function() {
			saveForm();
		});
	};
	
	
	function saveForm(){
		setLoadingDiv($('body'));
		
		saveSettingsForm(function () {
			unsetLoadingDiv($('body'));
			
			magicMessage("positive", "message_data_saved_successfully");
			
			if(fromTemplate != ""){
				window.location = $('.configurator_tab').find('a').attr("href");
			}
		});
	}
	
	
	function saveSettingsForm(callback) {
		
		var url = "";
		if(fromTemplate == "") {
			url = "ebl/v3/" + encodeURIComponent(customerID) + "/structure/update_scenario";
		}
		else if(fromTemplate == "1") {
			url = "ebl/v3/" + encodeURIComponent(customerID) + "/structure/create_scenario";
		}
		else if(fromTemplate == "2") {
			url = "ebl/v3/" + encodeURIComponent(customerID) + "/structure/copy_library_scenario?source_reference_code=" + encodeURIComponent(reference_code) + "&destination_reference_code=" + encodeURIComponent($('#scenario_id').val());
		}
		else if(fromTemplate == "3") {
			url = "ebl/v3/" + encodeURIComponent(customerID) + "/structure/create_scenario";
		}
	
		var scenarioID = $('#scenario_id').val();
		var wrongId = false;
		if( (scenarioID.indexOf(" ") != 0) &&  (scenarioID.indexOf(" ") != scenarioID.length) && (scenarioID.indexOf(" ") != -1)) {
			wrongId = true;
			setMessagePopUp("problem", "error_wrong_characters_in_id");
		} else {
			if(scenarioID.indexOf(".") != -1 || scenarioID.indexOf(":") != -1 || scenarioID.indexOf(";") != -1 || scenarioID.indexOf("/") != -1 || scenarioID.indexOf("\\") != -1 || scenarioID.indexOf("'") != -1 || scenarioID.indexOf('"') != -1) {
				wrongId = true;
				setMessagePopUp("problem", "error_wrong_characters_in_id");
			}
		}
		
		if(wrongId == false) {
			
			setLoadingDiv($('body'));
		
			var json = $('body').data('scenario');
			$.ajax({
				type:"POST",
				beforeSend: function(x) {
					if (x && x.overrideMimeType) {
					  x.overrideMimeType("application/json;charset=UTF-8");
					}
				  },
					statusCode: {
							409: function (jqXHR, textStatus, errorThrown) {
							setMessagePopUp("problem", "error_scenario_id_already_exists");
							}
					},
				mimeType: "application/json",
				contentType: "application/json",
				dataType: "json",
				data: JSON.stringify(json.scenario),
				url: url,
				success: function(json){
					//on success
					if(fromTemplate != "") {
						$('.configurator_tab').find('a').attr("href", "configuratorpop.html?reference_code=" + json.scenario.referenceCode + "&customer_id=" + customerID);
						reference_code = encodeURIComponent(json.scenario.referenceCode);
						addScenarioToParent();
					}
					
					$('.preview_tab').find('a').attr("href", "previewpop.html?reference_code=" + reference_code + "&customer_id=" + customerID+"&outputtypes="+json.scenario.outputItemTypes.toString()+"&inputtype="+json.scenario.inputItemType);
					
					saveFiltersForm(callback);
				},
				error : function(jqXHR, textStatus, errorThrown) {
					configuratorErrorHandler(jqXHR, textStatus, errorThrown);
				}
			});
		}
	}
	
	
	function saveFiltersForm(callback) {
		//Save profile filters
		var json = $('body').data('filters_profile');
		$.ajax({
			type:"POST",
			beforeSend: function(x) {
				if (x && x.overrideMimeType) {
				  x.overrideMimeType("application/json;charset=UTF-8");
				}
			  },
			mimeType: "application/json",
			contentType: "application/json",
			dataType: "json",
			data: JSON.stringify(json.profileFilterSet),
			url: "ebl/v3/" + encodeURIComponent(customerID) + "/structure/update_filter_set/profile/" + encodeURIComponent(reference_code),
			success: function(json){
				saveStandradFilters(callback);
			},
			error : function(jqXHR, textStatus, errorThrown) {
				configuratorErrorHandler(jqXHR, textStatus, errorThrown);
			}
		});
	}
	
	
	function saveStandradFilters(callback){
		//Save standard filters
		var json = $('body').data('filters_standard');
		$.ajax({
			type:"POST",
			beforeSend: function(x) {
				if (x && x.overrideMimeType) {
				  x.overrideMimeType("application/json;charset=UTF-8");
				}
			  },
			mimeType: "application/json",
			contentType: "application/json",
			dataType: "json",
			data: JSON.stringify(json.standardFilterSet),
			url: "ebl/v3/" + encodeURIComponent(customerID) + "/structure/update_filter_set/standard/" + encodeURIComponent(reference_code),
			success: function(json){
				callback();
			},
			error : function(jqXHR, textStatus, errorThrown) {
				configuratorErrorHandler(jqXHR, textStatus, errorThrown);
			}
		});
	}
	
	
	function updateFilters() {

		var $no_price_hide  = $('#filter_group_item input[name="no_price_hide"]');
		var $no_cheaper_products  = $('#no_cheaper_products');
		var $limit_min_price = $('#limit_min_price');

		var no_price_hide_checked = $no_price_hide.prop("checked");
		var no_cheaper_products_checked = $no_cheaper_products.prop("checked");

		// optimistic defaults
		var result = true;
		$('#limit_min_price').removeClass("problem");
		$('#limit_max_recs_per_session').removeClass("problem");
		$('#validation_invalid_min_price').hide();
		$('#validation_invalid_max_repeated_reco').hide();
		
		
		var jsonStandard = $('body').data('filters_standard');
		var jsonProfile = $('body').data('filters_profile');
		
		if(no_cheaper_products_checked) {
			jsonStandard.standardFilterSet.excludeCheaperItems = "YES";
		} else {
			jsonStandard.standardFilterSet.excludeCheaperItems = "NO";
		}
		
		jsonStandard.standardFilterSet.excludeTopSellingResults = $('#no_top_sellings')[0].checked;
		
		jsonStandard.standardFilterSet.excludeContextItems = $('#currently_viewed')[0].checked;
		
		jsonProfile.profileFilterSet.excludeAlreadyPurchased = $('#no_already_purchased')[0].checked;

		jsonStandard.standardFilterSet.excludeItemsWithoutPrice = no_price_hide_checked;
		
		var maxRecsChecked = $('#enable_limit_max_recs_per_session')[0].checked;
		$('#limit_max_recs_per_session').prop("disabled", ! maxRecsChecked);
		
		if(maxRecsChecked) {
			if ($('#limit_max_recs_per_session')[0].validity.valid) {
				jsonProfile.profileFilterSet.excludeRepeatedRecommendations = $('#limit_max_recs_per_session').val();
			} else {
				$('#limit_max_recs_per_session').addClass("problem");
				$('#validation_invalid_max_repeated_reco').show();
				result = false;
			}
		} else {
			jsonProfile.profileFilterSet.excludeRepeatedRecommendations = null;
		}

		var minPriceChecked = $('#enable_min_price').prop("checked");
		$limit_min_price.prop("disabled", ! minPriceChecked);
		
		
		if(minPriceChecked) {
			if ($limit_min_price[0].validity.valid) {
				jsonStandard.standardFilterSet.minimalItemPrice = $('#limit_min_price').val();
			} else {
				$limit_min_price.addClass("problem");
				$('#validation_invalid_min_price').show();
				result = false;
			}
		} else {
			jsonStandard.standardFilterSet.minimalItemPrice = null;
		}

		$no_price_hide.prop("disabled", !no_cheaper_products_checked && !minPriceChecked);

		// USER BOOST FILTER

		var boostChecked = $('#filter_group_user input[name="user_boost_enable"]').is(':checked');
		var diffChecked = $('#filter_group_user input[name="user_boost_diff"]').is(':checked');
		
		var $boostAttr  = $('#filter_group_user input[name="user_boost_attr"]');
		var $boostValue = $('#filter_group_user input[name="user_boost_value"]');
		var $boostDiff  = $('#filter_group_user input[name="user_boost_diff"]');
		var $boostDiffName = $('#filter_group_user input[name="user_boost_diff_name"]');
		
		$boostAttr.prop("disabled", ! boostChecked);
		$boostValue.prop("disabled", ! boostChecked);
		$boostDiff.prop("disabled", ! boostChecked);
		$boostDiffName.prop("disabled", ! boostChecked || ! diffChecked);
		
		if ( ! diffChecked) {
			$('#filter_group_user input[name="user_boost_diff_name"]').val("");
		}
		
		var boostAttr = $('#filter_group_user input[name="user_boost_attr"]').val();
		
		if (boostChecked && $boostAttr.val() && $boostValue.val() != 0) {
			jsonProfile.profileFilterSet.attributeBoost = {
					itemAttributeName : $boostAttr.val(),
					userAttributeName : diffChecked ? $boostDiffName.val() : $boostAttr.val(),
					boost : $boostValue.val() 
			};
		} else {
			jsonProfile.profileFilterSet.attributeBoost = null;
		}

					
		$('body').data('filters_standard', jsonStandard);
		$('body').data('filters_profile',jsonProfile);
		
		$('label[for="fpemail"]').parent().removeClass("problem");
		$('label[for="captcha"]').parent().removeClass("problem");
		
		return result;
	}
	
	
	function loadScenario(callback) {
		
		setLoadingDiv($('body'));
		
		$.when(
			scenarioDao.init(customerID, refcode, withFilters)
		).done(function() {
			renderScenario();
			unsetLoadingDiv($('body'));
			if (callback) {
				callback();
			}
		});
	} 

	
	function renderScenario() {
		
		var json = { scenario : scenarioDao.scenario }; 
		
		$('body').data('scenario', json);
	
		$('#scenario_title').val(json.scenario.title);
		$('#scenario_id').val(json.scenario.referenceCode);
		if(json.scenario.inputItemType && json.scenario.inputItemType > 0){
			$('#input_type').val(json.scenario.inputItemType);
		}
		
		$('input[id^="output_type"]').each(function() {
			if(json.scenario.outputItemTypes.length > 0) {
				$('.preview_tab').find('a').attr("href", "previewpop.html?reference_code=" + reference_code + "&customer_id=" + customerID+"&outputtypes="+json.scenario.outputItemTypes.toString()+"&inputtype="+json.scenario.inputItemType);
				for(var i = 0; i < json.scenario.outputItemTypes.length; i++) {
					if(json.scenario.outputItemTypes[i] == $(this).val()) {
						$(this).prop("checked", true);
					}
				}
			}
		});
		var additionalParameter = "?reference_code=" + json.scenario.referenceCode + "&customer_id=" + customerID;
		$('#sc_description').val(json.scenario.description);
		$('.go_next').attr("href", "configuratorpop.html" + additionalParameter);
		

		json = { standardFilterSet : scenarioDao.standardFilterSet };
		
		$('body').data('filters_standard', json);
		
		var set = json.standardFilterSet;

		// standard filter

		var $no_price_hide  = $('#filter_group_item input[name="no_price_hide"]');
		$no_price_hide.prop("checked", set.excludeItemsWithoutPrice);

		if (set.excludeCheaperItems == "YES") { 
			$('#no_cheaper_products').prop("checked", true);
		}
		
		$('#currently_viewed').prop("checked", set.excludeContextItems);

		$('#no_top_sellings').prop("checked", set.excludeTopSellingResults);

		if (set.minimalItemPrice) {
			$('#enable_min_price').prop("checked", true);
			$('#limit_min_price').prop("disabled", false);
			$('#limit_min_price').val(set.minimalItemPrice);
		}
		
		// profile filter
		
		json = { profileFilterSet : scenarioDao.profileFilterSet };
		
		var pset = json.profileFilterSet;
		
		$('body').data('filters_profile', json);
			
		var excludeAlreadyPurchased = pset.excludeAlreadyPurchased;
		var excludeRepeatedRecommendations = pset.excludeRepeatedRecommendations;
		
		if(excludeAlreadyPurchased == true) {
			$('#no_already_purchased').prop("checked", true);
		}
		
		if(excludeRepeatedRecommendations != null) {
			$('#enable_limit_max_recs_per_session').prop("checked", true);
			$('#limit_max_recs_per_session').prop("disabled", false);
			$('#limit_max_recs_per_session').val(excludeRepeatedRecommendations);
		}
		
		// USER BOOST FILTER
		
		var $boostEnabled  = $('#filter_group_user input[name="user_boost_enable"]');
		var $boostAttr     = $('#filter_group_user input[name="user_boost_attr"]');
		var $boostValue    = $('#filter_group_user input[name="user_boost_value"]');
		var $boostDiff     = $('#filter_group_user input[name="user_boost_diff"]');
		var $boostDiffName = $('#filter_group_user input[name="user_boost_diff_name"]');
		
		if (pset.attributeBoost) {
			$boostEnabled.prop("checked", true);
			$boostAttr.val(pset.attributeBoost.itemAttributeName);
			$boostValue.val(pset.attributeBoost.boost);
			
			$boostAttr.prop("disabled", false);
			$boostValue.prop("disabled", false);
			$boostDiff.prop("disabled", false);
			
			if (pset.attributeBoost.itemAttributeName != pset.attributeBoost.userAttributeName ) {
				$boostDiff.prop("checked", true);
				$boostDiffName.val(pset.attributeBoost.userAttributeName);
				$boostDiffName.prop("disabled", false);
			} else {
				$boostDiff.prop("checked", false);
				$boostDiffName.prop("disabled", true);
			}
		} else {
			$boostEnabled.prop("checked", false);
			$boostAttr.prop("disabled", true);
			$boostValue.prop("disabled", true);
			$boostDiff.prop("disabled", true);
			$boostDiffName.prop("disabled", true);
		}
	}
	
	
	function addScenarioToParent(){
		
		var json = $('body').data('scenario');
		var title = json.scenario.title;
		var referenceCode = json.scenario.referenceCode;
		var description = json.scenario.description;
		var j =-1;
		window.parent.$('.scenario').each(function(){
			var eid = $(this).attr('id');
			if(eid != null && eid !='undefined'){
				eida = eid.split('_');
				if(eida.length>1){
					jid = eida[1];
					if(jid>j){
						j = jid;
					}
				}
			}
		});
		j++;
		console.log("j="+j);
		//the dummy is a emtpy scenario that will be copied and added for all given scenarios from the server
        //it will be filled with the data from the server
        var dummy = window.parent.$('.available_scenarios').children('li').last();
        var dummyClone = $(dummy).clone();
        $(dummyClone).show();
		var escapedRefCode = escape(referenceCode);
        $(dummyClone).children("div").attr("id", "scenario_" + j);

        if (title == null || $.trim(title) == "") {
             title = referenceCode;
        }
        if (description == null) {
            description = "Some brief description of the scenario, that can be edited together with other parameters";
        }
		var options = "<option value='" + referenceCode + "'>" + title + "</option>";
        $(dummyClone).children("div#scenario_" + j).children("h4").children("span").text(title);
        $(dummyClone).children("div#scenario_" + j).children("p.description").text(description);
        var additionalParameter = "?reference_code=" + escapedRefCode + "&customer_id=" + customerID;
        //The links at the end of the page must have a referenceCode and customerID at request get parameter
        $(dummyClone).children("div#scenario_" + j).find("h4").children("font.settings").html('<a  onclick="$(\'#settingsF\').attr(\'src\',\'settingspop.html' + additionalParameter + '\'); $(\'#settingsP\').show();"><span>&nbsp;&nbsp;&nbsp;&nbsp;</span></a>');

        $(dummyClone).children("div").children("p.data").removeClass("unavailable").removeClass("ascending").removeClass("descending");
        $(dummyClone).children("div").children("p.data").removeClass("unavailable").addClass("unavailable");
        $(dummyClone).children("div").children("p.data").children("span").children("strong").text("0");
        //set the radio buttons initialy
        $(dummyClone).children("div#scenario_" + j).removeClass("problem").removeClass("ready_to_use").removeClass("partly_available");
        $(dummyClone).children("div#scenario_" + j).addClass("problem");
        window.parent.$('.available_scenarios').append(dummyClone);
        
        window.parent.$('#select_for_delivered_recommendations_chart_bar_1').append(options);
        window.parent.$('#select_for_delivered_recommendations_chart_bar_2').append(options);
        window.parent.$('#select_for_delivered_recommendations_chart_bar_3').append(options);

	}

	
	function updateScenario() {
		
		var result = true;
		$('#output_type_block input, #scenario_id').removeClass("problem");
		$('#validation_no_ouput_type').hide();
		$('#validation_no_scenario_id').hide();
		
		
		var json = $('body').data('scenario');
				
		json.scenario.title = $('#scenario_title').val();
		
		var refcode = $.trim($('#scenario_id').val());
		
		if (refcode) {
			json.scenario.referenceCode = refcode;			
		} else {
			$('#scenario_id').addClass("problem");
			$('#validation_no_scenario_id').show();
			result = false;
		}
		
		json.scenario.description = $('#sc_description').val();

		var solution = mandatorInfo.baseInformation.version;
		
		if (solution == 'EXTENDED') {
			json.scenario.inputItemType = $('#input_type').val();
			
			json.scenario.outputItemTypes = new Array();
			$('input[id^="output_type"]').each(function() {
				if($(this).prop("checked")) {
					json.scenario.outputItemTypes.push(parseInt($(this).val()));
				}
			});
			
			if (! json.scenario.outputItemTypes.length) {
				$('#output_type_block input').addClass("problem");
				$('#validation_no_ouput_type').show();
				result = false;
			}
		} else {
			var defaultItemType = mandatorInfo.itemTypeConfiguration.defaultType;
			json.scenario.inputItemType = defaultItemType;
			json.scenario.outputItemTypes = [defaultItemType];
		}
		
		$('body').data('scenario', json);
		
		return result;
	}
