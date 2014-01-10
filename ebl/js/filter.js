
	var reference_code = gup( 'reference_code' );
	var customerID = gup('customer_id');
	var fromTemplate = gup('from_template');
	
	
	
	$(window).ready(function() {
		scenarioReady();
		//$('.configurator_tab').find('a').attr("href", "configuratorpop.html?reference_code=" + reference_code + "&customer_id=" + customerID);
		$('.settings_tab').find('a').attr('href', 'settingspop.html?reference_code='+reference_code+'&customer_id='+customerID);
	
		//ajax request for the right section
		setLoadingDiv($('#filter_group_standard'));
		setLoadingDiv($('#filter_group_item'));
		
	
		$.ajax({
				dataType: "json",
				beforeSend: function (req) {
				req.setRequestHeader('no-realm', 'realm1');
				},
				 statusCode: {
						401: function (jqXHR, textStatus, errorThrown) {
							$.cookie('password', null);
							$.cookie('email', null);
							window.parent.location = "login.html";
						}
				},
				url: "ebl/v3/"+customerID+"/structure/get_filter_set/standard" + (reference_code == "" ? "" : "/"+reference_code),
				success: function(json){
					$('body').data('filters_standard', json);
					
					
					var excludeContextItems = json.standardFilterSet.excludeContextItems;
					//var maximalItemAge = json.standardFilterSet.maximalItemAge;
					var excludeCheaperItems = json.standardFilterSet.excludeCheaperItems;
					//var sameCategoryFilter = json.standardFilterSet.sameCategoryFilter;
					var excludeTopSellingResults = json.standardFilterSet.excludeTopSellingResults;
					var excludeEditorBlacklistResults = json.standardFilterSet.excludeEditorBlacklistResults;
					var minimalItemPrice = json.standardFilterSet.minimalItemPrice;
					
					if(excludeCheaperItems == "YES")
					{ 
						$('#no_cheaper_products').attr("checked", "checked");
					}
					
					if(excludeContextItems == true)
					{ 
						$('#currently_viewed').attr("checked", "checked");
					}
					
					
					if(excludeTopSellingResults == true)
					{
						$('#no_top_sellings').attr("checked", "checked");
					}
					
					if(excludeEditorBlacklistResults == true)
					{
						$('#no_black_list_items_editor').attr("checked", "checked");
					}
					var solution = $.cookie('mandatorVersionType');
					if(solution != null && solution != 'undefined' && solution != 'EXTENDED'){
						$('#no_cheaper_products').attr("disabled","disabled");
						$('#enable_min_price').attr("disabled", "disabled");
						$('#textcp').css("opacity",'0.33');
						$('#textmp').css("opacity",'0.33');
					}else{
						if(minimalItemPrice != null){
							$('#enable_min_price').attr("checked", "checked");
							$('#limit_min_price').removeAttr("disabled");
							$('#limit_min_price').val(minimalItemPrice);
							$('#textcp').css("opacity",'1');
							$('#textmp').css("opacity",'1');
						}
					}
				unsetLoadingDiv($('#filter_group_standard'));
				},
				error : function(jqXHR, textStatus, errorThrown)
				{
					if(jqXHR.status != null && jqXHR.status == 403)
					{
						setMessagePopUp("problem", "error_server_error_403");
					}
					else if(jqXHR.status != null && jqXHR.status == 401)
					{
						setMessagePopUp("problem", "error_server_error_401");
					}
					else if(jqXHR.status != null && jqXHR.status == 400)
					{
						setMessagePopUp("problem", "error_server_error_400");
					}
					else if(jqXHR.status != null && jqXHR.status == 404)
					{
						setMessagePopUp("problem", "error_server_error_404");
					}
					else if(jqXHR.status != null && jqXHR.status == 409)
					{
						setMessagePopUp("problem", "error_server_error_409");
					}
					else
					{
						setMessagePopUp("problem", "error_server_error");
					}
                }
		});
		
		$.ajax({
				dataType: "json",
				beforeSend: function (req) {
				req.setRequestHeader('no-realm', 'realm1');
				},
				 statusCode: {
						401: function (jqXHR, textStatus, errorThrown) {
							$.cookie('password', null);
							$.cookie('email', null);
							window.parent.location = "login.html";
						}
				},
				url: "ebl/v3/"+customerID+"/structure/get_filter_set/profile"+ (reference_code == "" ? "" : "/"+reference_code),
				success: function(json){
					$('body').data('filters_profile', json);
				
					var excludeAlreadyPurchased = json.profileFilterSet.excludeAlreadyPurchased;
					var excludeRepeatedRecommendations = json.profileFilterSet.excludeRepeatedRecommendations;
					
					if(excludeAlreadyPurchased == true)
					{
						$('#no_already_purchased').attr("checked", "checked");
					}
					
					
					if(excludeRepeatedRecommendations != null)
					{
						$('#enable_limit_max_recs_per_session').attr("checked", "checked");
						$('#limit_max_recs_per_session').removeAttr("disabled");
						$('#limit_max_recs_per_session').val(excludeRepeatedRecommendations);
					}
					
				unsetLoadingDiv($('#filter_group_item'));
				},
				error : function(jqXHR, textStatus, errorThrown)
				{
					if(jqXHR.status != null && jqXHR.status == 403)
					{
						setMessagePopUp("problem", "error_server_error_403");
					}
					else if(jqXHR.status != null && jqXHR.status == 401)
					{
						setMessagePopUp("problem", "error_server_error_401");
					}
					else if(jqXHR.status != null && jqXHR.status == 400)
					{
						setMessagePopUp("problem", "error_server_error_400");
					}
					else if(jqXHR.status != null && jqXHR.status == 404)
					{
						setMessagePopUp("problem", "error_server_error_404");
					}
					else if(jqXHR.status != null && jqXHR.status == 409)
					{
						setMessagePopUp("problem", "error_server_error_409");
					}
					else
					{
						setMessagePopUp("problem", "error_server_error");
					}
                }
		});
		
		$("input, textarea, select").change(function() {
			updateScenario();
			updateFilters();
		});
		
		$('#button_save').click(function() {
			saveForm();
		});
		
	});
	
	var updatef1;
	var updatef2;
	var updatese;
	var transferOk;
	function saveForm(){
		updatef1 = false;
		updatef2 = false;
		updatese = false;
		transferOk = true;
	
		saveSettingsForm();
		
		var timerStatus = setInterval(function () {
			if(updatef1 && updatef2 && updatese){
				clearInterval(timerStatus);
				unsetLoadingDiv($('#filter_group_standard'));
				unsetLoadingDiv($('#filter_group_item'));
				unsetLoadingDiv($('.scenario_settings'));
				unsetLoadingDiv($('.setting_list'));
				if(transferOk){
					setMessagePopUp("positive", "message_positive_data_saved_successfully");
					if(fromTemplate != ""){
						window.location = $('.configurator_tab').find('a').attr("href");
					}
				}
			}
		},50);
	}
	
	
	
	function saveFiltersForm()
	{
		//setLoadingDiv($('.filters_group').children().first());
		//setLoadingDiv($('.filters_group').children().last());
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
				//on success
				//unsetLoadingDiv($('.filters_group').children().first());
				
				if($.cookie('otherGroupSaved') == "true")
				{
					$.cookie('otherGroupSaved', 'false');
				}
				else
				{
					$.cookie('otherGroupSaved', 'true');
				}
				updatef1 = true;
				saveStandradFilters();
			},
			error : function(jqXHR, textStatus, errorThrown)
			{
				if(jqXHR.status != null && jqXHR.status == 403)
					{
						setMessagePopUp("problem", "error_server_error_403");
					}
					else if(jqXHR.status != null && jqXHR.status == 401)
					{
						setMessagePopUp("problem", "error_server_error_401");
					}
					else if(jqXHR.status != null && jqXHR.status == 400)
					{
						setMessagePopUp("problem", "error_server_error_400");
					}
					else if(jqXHR.status != null && jqXHR.status == 404)
					{
						setMessagePopUp("problem", "error_server_error_404");
					}
					else if(jqXHR.status != null && jqXHR.status == 409)
					{
						setMessagePopUp("problem", "error_server_error_409");
					}
					else
					{
						setMessagePopUp("problem", "error_server_error");
					}
				updatef1 = true;
				transferOk = false;
				saveStandradFilters();
			}
		});
		
		
	}
	
	
	function saveStandradFilters(){
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
				//unsetLoadingDiv($('.filters_group').children().last());
				
				if($.cookie('otherGroupSaved') == "true")
				{
					$.cookie('otherGroupSaved', 'false');
					//setMessagePopUp("positive", "message_data_saved_successfully");
				}
				else
				{
					$.cookie('otherGroupSaved', 'true');
				}
				updatef2 = true;
				
			},
			error : function(jqXHR, textStatus, errorThrown)
			{
				if(jqXHR.status != null && jqXHR.status == 403)
					{
						setMessagePopUp("problem", "error_server_error_403");
					}
					else if(jqXHR.status != null && jqXHR.status == 401)
					{
						setMessagePopUp("problem", "error_server_error_401");
					}
					else if(jqXHR.status != null && jqXHR.status == 400)
					{
						setMessagePopUp("problem", "error_server_error_400");
					}
					else if(jqXHR.status != null && jqXHR.status == 404)
					{
						setMessagePopUp("problem", "error_server_error_404");
					}
					else if(jqXHR.status != null && jqXHR.status == 409)
					{
						setMessagePopUp("problem", "error_server_error_409");
					}
					else
					{
						setMessagePopUp("problem", "error_server_error");
					}
				updatef2 = true;
				transferOk = false;
			}
		});
	}
	
	
	function updateFilters() {
		
		var jsonStandard = $('body').data('filters_standard');
		var jsonProfile = $('body').data('filters_profile');
		
		if($('#no_cheaper_products').attr("checked") == "checked")
		{ 
			jsonStandard.standardFilterSet.excludeCheaperItems = "YES";
		}
		else
		{
			jsonStandard.standardFilterSet.excludeCheaperItems = "NO";
		}
		
		if($('#no_top_sellings').attr("checked") == "checked")
		{
			jsonStandard.standardFilterSet.excludeTopSellingResults = true;
		}
		else
		{
			jsonStandard.standardFilterSet.excludeTopSellingResults = false;
		}
		
		if($('#currently_viewed').attr("checked") == "checked")
		{
			jsonStandard.standardFilterSet.excludeContextItems = true;
		}
		else
		{
			jsonStandard.standardFilterSet.excludeContextItems = false;
		}


		if($('#no_black_list_items_editor').attr("checked") == "checked")
		{
			jsonStandard.standardFilterSet.excludeEditorBlacklistResults = true;
		}
		else
		{
			jsonStandard.standardFilterSet.excludeEditorBlacklistResults = false;
		}
		
		if($('#no_already_purchased').attr("checked") == "checked")
		{
			jsonProfile.profileFilterSet.excludeAlreadyPurchased = true;
		}
		else
		{
			jsonProfile.profileFilterSet.excludeAlreadyPurchased = false;
		}
		
		if($('#enable_limit_max_recs_per_session').attr("checked") == "checked")
		{
			jsonProfile.profileFilterSet.excludeRepeatedRecommendations = $('#limit_max_recs_per_session').val();
			$('#limit_max_recs_per_session').removeAttr("disabled");
		}
		else
		{
			jsonProfile.profileFilterSet.excludeRepeatedRecommendations = null;
			$('#limit_max_recs_per_session').attr("disabled", "disabled");
		}
		
		if($('#enable_min_price').attr("checked") == "checked")
		{
			jsonStandard.standardFilterSet.minimalItemPrice = $('#limit_min_price').val();
			$('#limit_min_price').removeAttr("disabled");
		}
		else
		{
			jsonStandard.standardFilterSet.minimalItemPrice = null;
			$('#limit_min_price').attr("disabled", "disabled");
		}
					
		$('body').data('filters_standard', jsonStandard);
		$('body').data('filters_profile',jsonProfile);
	}
	
	

	//fromTemplate = 1 are copies of old scenarios
	//fromTemplate = 2 are copies of library
	//fromTemplate = 3 are new scenarios

	var showdelete = false;
	
	function scenarioReady() {
	
		var mandatorType = $.cookie('mandatorType');
		
		if(mandatorType == "SHOP")
		{
			$('#input_type').children('option').each(function(index){
				if(index > 0)
				{
				$(this).hide();
				}
			});
		
		$('.output_types').children('li').each(function(index){
				if(index > 0)
				{
				$(this).hide();
				}
			});
		
		}else{
			var solution = $.cookie('mandatorVersionType');
			if(solution != null && solution != 'undefined' && solution != 'EXTENDED'){
				$('#input_type').children('option').each(function(index){
					if(index != 1)
					{
						$(this).attr("disabled", "disabled");
					}else{
						$(this).attr("selected", "selected");
					}
				});
			
			$('.output_types').children('li').each(function(index){
					if(index != 1)
					{
						$(this).children('input').attr("disabled", "disabled");
						$(this).children('label').css("opacity",'0.33');
					}
				});
			}
			
		}
		if(reference_code == "")
		{

			var json = new Object();
			json.scenario = new Object();
			json.scenario.title = $('#scenario_title').val();
			json.scenario.referenceCode = $('#scenario_id').val();
			json.scenario.inputItemType = $('#input_type').val();
			json.scenario.description = $('#sc_description').val();
			
			json.scenario.outputItemTypes = new Array();
			$('input[id^="output_type"]').each(function() {
				if($(this).attr("checked") == "checked")
				{
					json.scenario.outputItemTypes.push(parseInt($(this).val()));
				}
			});
			
			$('body').data('scenario', json);
		}
		else
		{
		
		setLoadingDiv($('.scenario_settings'));
		setLoadingDiv($('.setting_list'));
		
		var url = "";
		if(fromTemplate == "2")
		{
			url = "ebl/v3/"+customerID+"/structure/get_library_scenario/" +reference_code + "?locale=" + in_to_language;
		}
		else
		{
			url = "ebl/v3/"+customerID+"/structure/get_scenario/"+reference_code;
		}
		
		$.ajax({
				dataType: "json",
				beforeSend: function (req) {
				req.setRequestHeader('no-realm', 'realm1');
				},
				 statusCode: {
						401: function (jqXHR, textStatus, errorThrown) {
							$.cookie('password', null);
							$.cookie('email', null);
							window.parent.location = "login.html";
						}
				},
				url: url,
				success: function(json){
				
					$('body').data('scenario', json);
				
					$('#scenario_title').val(json.scenario.title);
					$('#scenario_id').val(json.scenario.referenceCode);
					$('#input_type').val(json.scenario.inputItemType);
					
					$('input[id^="output_type"]').each(function() {
						
					if(json.scenario.outputItemTypes.length > 0)
					{
						for(var i = 0; i < json.scenario.outputItemTypes.length; i++)
						{
							if(json.scenario.outputItemTypes[i] == $(this).val())
							{
								$(this).attr("checked", "checked");
							}
						}
					}
					});
					var additionalParameter = "?reference_code=" + json.scenario.referenceCode + "&customer_id=" + customerID;
					$('#sc_description').val(json.scenario.description);
					$('.go_next').attr("href", "configuratorpop.html" + additionalParameter);
					unsetLoadingDiv($('.scenario_settings'));
					unsetLoadingDiv($('.setting_list'));
				
				},
				error : function(jqXHR, textStatus, errorThrown)
				{
				 if(jqXHR.status != null && jqXHR.status == 403)
					{
						setMessagePopUp("problem", "error_server_error_403");
					}
					else if(jqXHR.status != null && jqXHR.status == 401)
					{
						setMessagePopUp("problem", "error_server_error_401");
					}
					else if(jqXHR.status != null && jqXHR.status == 400)
					{
						setMessagePopUp("problem", "error_server_error_400");
					}
					else if(jqXHR.status != null && jqXHR.status == 404)
					{
						setMessagePopUp("problem", "error_server_error_404");
					}
					else if(jqXHR.status != null && jqXHR.status == 409)
					{
						setMessagePopUp("problem", "error_server_error_409");
					}
					else
					{
						setMessagePopUp("problem", "error_server_error");
					}
                }
			});
			
			
		}
		  window.parent.$("#contentFrame").height( '68%');
			if(fromTemplate == "")
			{
				$('#scenario_id').attr("disabled","disabled");
				$('.configurator_tab').find('a').attr("href", "configuratorpop.html?reference_code=" + reference_code + "&customer_id=" + customerID);
			}
			else
			{
				$('.configurator_tab').addClass("no_link").find('a').attr("href", "#").attr("style", "color: #000000; cursor:text;").find('span').attr("style", "text-decoration: none;");
				$('#button_save').attr('data-translate', 'settings_button_save_next_step');
				$('.delete').attr('data-translate', 'settings_cancel');
			}
			localizer();
			
			
			//$('.go_next').click(function(){
			//	saveForm(");
			//});
			
			$(document).click(function(e){
				var tid = event.target.id;
				if(tid != 'atoparrow' && tid !='toparrow' && showdelete){
					$('.item').hide();
					showdelete = false;
				}
			});
			
			$('.cancel').click(function (){
				cancelScenario();
			});
			
			$('#toparrow').click(function (){
				if(!showdelete){
					$('.item').show();
					showdelete = true;
				}else{
					$('.item').hide();
					showdelete = false;
				}
			});
			
			$('.delete').click(function () {
			
				if(fromTemplate == "")
				{
					deleteScenario();
				}
				else
				{
					cancelScenario();
				}
			});
			
		
			
	};
	
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
	
	function saveSettingsForm()
	{
		var url = "";
		if(fromTemplate == "")
		{
			url = "ebl/v3/"+customerID+"/structure/update_scenario";
		}
		else if(fromTemplate == "1")
		{
			url = "ebl/v3/"+customerID+"/structure/create_scenario";
		}
		else if(fromTemplate == "2")
		{
			url = "ebl/v3/"+customerID+"/structure/copy_library_scenario?source_reference_code=" + encodeURIComponent(reference_code) + "&destination_reference_code=" + encodeURIComponent($('#scenario_id').val());
		}
		else if(fromTemplate == "3")
		{
			url = "ebl/v3/"+customerID+"/structure/create_scenario";
		}
	
		var scenarioID = $('#scenario_id').val();
		var wrongId = false;
		if( (scenarioID.indexOf(" ") != 0) &&  (scenarioID.indexOf(" ") != scenarioID.length) && (scenarioID.indexOf(" ") != -1))
		{
			wrongId = true;
			transferOk = false;
			setMessagePopUp("problem", "error_wrong_characters_in_id");
		}
		else
		{
			if(scenarioID.indexOf(".") != -1 || scenarioID.indexOf(":") != -1 || scenarioID.indexOf(";") != -1 || scenarioID.indexOf("/") != -1 || scenarioID.indexOf("\\") != -1 || scenarioID.indexOf("'") != -1 || scenarioID.indexOf('"') != -1)
			{
				wrongId = true;
				transferOk = false;
				setMessagePopUp("problem", "error_wrong_characters_in_id");
			}
		}
		
		if(wrongId == false)
		{
			setLoadingDiv($('.scenario_settings'));
			setLoadingDiv($('.setting_list'));
			//filters load weel
			setLoadingDiv($('.filters_group').children().first());
			setLoadingDiv($('.filters_group').children().last());
		
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
							updatese = true;
							transferOk = false;
							}
					},
				mimeType: "application/json",
				contentType: "application/json",
				dataType: "json",
				data: JSON.stringify(json.scenario),
				url: url,
				success: function(json){
					//on success
					if(fromTemplate != "")
					{
						$('.configurator_tab').find('a').attr("href", "configuratorpop.html?reference_code=" + json.scenario.referenceCode + "&customer_id=" + customerID);
						reference_code = encodeURIComponent(json.scenario.referenceCode);
						addScenarioToParent();
					}
					
					updatese = true;
					saveFiltersForm();
				},
				error : function(jqXHR, textStatus, errorThrown)
				{
					if(jqXHR.status != null && jqXHR.status == 403)
						{
							setMessagePopUp("problem", "error_server_error_403");
						}
						else if(jqXHR.status != null && jqXHR.status == 401)
						{
							setMessagePopUp("problem", "error_server_error_401");
						}
						else if(jqXHR.status != null && jqXHR.status == 400)
						{
							setMessagePopUp("problem", "error_server_error_400");
						}
						else if(jqXHR.status != null && jqXHR.status == 404)
						{
							setMessagePopUp("problem", "error_server_error_404");
						}
						else
						{
							setMessagePopUp("problem", "error_server_error");
						}
					updatese = true;
					transferOk = false;
					saveFiltersForm();
				}
			});
		}
	}
	
	function updateScenario() {
		
		var json = $('body').data('scenario');
				
		json.scenario.title = $('#scenario_title').val();
		json.scenario.referenceCode = $.trim($('#scenario_id').val());
		json.scenario.inputItemType = $('#input_type').val();
		json.scenario.description = $('#sc_description').val();
		
		json.scenario.outputItemTypes = new Array();
		$('input[id^="output_type"]').each(function() {
			if($(this).attr("checked") == "checked")
			{
				json.scenario.outputItemTypes.push(parseInt($(this).val()));
			}
		});
		
		$('body').data('scenario', json);
		
	}
	
	function cancelScenario() {
		  window.parent.$("#settingsP").hide();
		  window.parent.$('#cover').hide();
	}
	
	function deleteScenario() {
		
		  var translationConfirm = translate[in_to_language]["message_want_delete_scenario"];
		  if (typeof translationConfirm == 'undefined')
		  {
			translationConfirm = 'missing_translation_for_message_want_delete_scenario';
		  }
		
		if(!confirm(translationConfirm))
		{
			//do nothing
		}
		else
		{
		
			url = "ebl/v3/"+customerID+"/structure/delete_scenario/";
		
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
				data: JSON.stringify(reference_code),
				url: url,
				success: function(json){
					//on success
					window.parent.location = "index.html";
				},
				error : function(jqXHR, textStatus, errorThrown)
				{
					if(jqXHR.status != null && jqXHR.status == 403)
					{
						setMessagePopUp("problem", "error_server_error_403");
					}
					else if(jqXHR.status != null && jqXHR.status == 401)
					{
						setMessagePopUp("problem", "error_server_error_401");
					}
					else if(jqXHR.status != null && jqXHR.status == 400)
					{
						setMessagePopUp("problem", "error_server_error_400");
					}
					else if(jqXHR.status != null && jqXHR.status == 404)
					{
						setMessagePopUp("problem", "error_server_error_404");
					}
					else if(jqXHR.status != null && jqXHR.status == 409)
					{
						setMessagePopUp("problem", "error_server_error_409");
					}
					else
					{
						setMessagePopUp("problem", "error_server_error");
					}
				}
			});
		}
	}
	
	
	
	
