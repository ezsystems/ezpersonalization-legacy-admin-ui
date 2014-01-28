
var mandatorInfo;
	  
function initialize_configurator_header(callback, i18n_save_button) {
	
	var s = encodeURIComponent(reference_code);
	var m = encodeURIComponent(customerID);
	
    $('.settings_tab').find('a').attr('href', 'settingspop.html?reference_code=' + s + '&customer_id=' + m);
    $('.configurator_tab').find('a').attr("href", 'configuratorpop.html?reference_code=' + s + '&customer_id=' + m);
    $('.preview_tab').find('a').attr("href", "previewpop.html?reference_code=" + s + "&customer_id=" + m);    

	var result = $.when(
		$.get("/includes/configurator_header.html", '', function(data) {
	
			$(".scenario_settings").html(data);
	
			if (i18n_save_button) {
				$("#button_save").attr("data-translate", i18n_save_button);
			}
	
			i18n($(".scenario_settings")); // internationalize just loaded
													// file
	
			$('.extended-config .delete').click(function() {
				deleteScenario();
			});
	
			$('.extended-config .cancel').click(function() {
				cancelScenario();
			});
	
			$('#toparrow').click(function() {
				if ($(".extended-config").is(":visible")) {
					$('.extended-config').hide();
				} else {
					$('.extended-config').show();
				}
			});
		}), 
		loadMandatorInfo(function(json) {
			mandatorInfo = json;
		})
	).done(function(json) {
		if (callback) {
			callback();
		}
	});
	return result;
}


function loadMandatorInfo(callback) {
	
	var result = $.ajax({
			dataType: "json",
			beforeSend: function (req) {
			req.setRequestHeader('no-realm', 'realm1');
		},
		url: "/api/v4/base/get_mandator/" + encodeURIComponent(customerID) + "?advancedOptions&itemTypeConfiguration",
		success: callback,
		error : function(jqXHR, textStatus, errorThrown) {
			settingsDefaultErrorHandler(jqXHR, textStatus, errorThrown);
        }
	});
	return result;
}
		

function cancelScenario() {
	  window.parent.$("#settingsP").hide();
	  window.parent.$('#cover').hide();
}


function getItemTypeDescriptions(ids) {
	var result = [];
	for (var i in ids) {
		result.push(getItemTypeDescription(ids[i]));
	}
	return result;
}


function getItemTypeDescription(id) {
	for (var i in mandatorInfo.itemTypeConfiguration.types) {
		var t = mandatorInfo.itemTypeConfiguration.types[i];
		if (id == t.id) {
			return  t.description + ' (' + t.id + ')';
		}
	}
	return 'Unknown (' + t.id + ')';
}


function deleteScenario() {
	
	var fromTemplate = gup('from_template');
	
	if(fromTemplate) {
		cancelScenario();
		return;
	}
	  
	var  translationConfirm = jQuery.i18n.prop("message_want_delete_scenario");
	
	if(!confirm(translationConfirm)) {
		//do nothing
	} else {
	
		url = "ebl/v3/"+customerID+"/structure/delete_scenario/";
	
		$.ajax({
			type:"POST",
			contentType: "application/json;charset=UTF-8",
			data: JSON.stringify(reference_code),
			url: url,
			success: function(json){
				//on success
				window.parent.location = "index.html";
			},
			error : function(jqXHR, textStatus, errorThrown) {
				if(jqXHR.status != null && jqXHR.status == 403) {
					setMessagePopUp("problem", "error_server_error_403");
				} else if(jqXHR.status != null && jqXHR.status == 401) {
					setMessagePopUp("problem", "error_server_error_401");
				} else if(jqXHR.status != null && jqXHR.status == 400) {
					setMessagePopUp("problem", "error_server_error_400");
				} else if(jqXHR.status != null && jqXHR.status == 404) {
					setMessagePopUp("problem", "error_server_error_404");
				} else if(jqXHR.status != null && jqXHR.status == 409) {
					setMessagePopUp("problem", "error_server_error_409");
				} else {
					setMessagePopUp("problem", "error_server_error", jqXHR.status);
				}
			}
		});
	}
}