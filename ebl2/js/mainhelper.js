var customerID = $.cookie('customerID');
var recSize = 1;
var recCT = 3;
var changeScript = false;
var productPageUrlFromRecs = null;
var jsonRecs = null;
var currentbg = "#ebeff4";


$(document).ready(function () {
	
	
    var loginName = $.cookie('email');
   // var password =  $.cookie('password');

		$('.account_data').children('li').first().find('strong').text(loginName);

		setLoadingDiv($('section.mandant > header'));
		setLoadingDiv($('#conversion_rate'));
		setLoadingDiv($('#collected_events'));
		setLoadingDiv($('#delivered_recommendations'));
		setMessages();
		activateDialog();
		$.ajax({
			dataType: "json",
			beforeSend: function (req) {
            	req.setRequestHeader('no-realm', 'realm1');
			},
			 statusCode: {
                    401: function (jqXHR, textStatus, errorThrown) {
						$.cookie('password', null);
						$.cookie('email', null);
						window.location = "login.html";
                    }
            },
			url: "/ebl/v3/registration/get_accesible_mandator_list/",
			success: function (json) {


				var isInList = false;
				var mandatorListSize = json.mandatorInfoList.length;
				if(mandatorListSize != 0)
				{
					if (mandatorListSize > 1) {
						$('.switch').show();
						for (var i = 0; i < mandatorListSize; i++) {
							var mandatorInfo = json.mandatorInfoList[i];
							$('#choose_mandant').append('<option value="' + mandatorInfo.name + '">' + mandatorInfo.name + ': ' + mandatorInfo.website + '</option>');
							$('body').data('mandatorInfoList', json);
							if ($.cookie('customerID') != null) {
								if ($.cookie('customerID') == mandatorInfo.name) {
									isInList = true;
								}
							}
						}
						if (isInList == false) {
							$.cookie('customerID', null);
						}
						
					} else if (mandatorListSize == 1) {
						$('.switch').hide();
						for (var i = 0; i < mandatorListSize; i++) {
							var mandatorInfo = json.mandatorInfoList[i];
							$('#choose_mandant').append('<option value="' + mandatorInfo.name + '">' + mandatorInfo.name + ': ' + mandatorInfo.website + '</option>');
							$('body').data('mandatorInfoList', json);
							$.cookie('customerID', mandatorInfo.name, { expires: 365 });
						}
					}
					var customerID = $.cookie('customerID');
					if (customerID == null) {
						setDialogs2('changeMandatorOverlay','changeMandatorBodyOverlay','destroy_dialog');
					} else {

						//$('.edit_contact_data').attr('href', 'edit_contact_data.html?customer_id=' + customerID);
						call_recs();
						setTabs();
						//setLicenceKey(customerID);
						setMandantData();
						setScript();
						$("#Inline").spectrum({
						    showInput: true,
						    showAlpha: true,
						    color: currentbg,
						    move: function(color) {
						        var bgcolorPrev = color.toRgbString(); 
						        $('.recUnit').css("background-color",bgcolorPrev);
						    },
						    change: function(color) {
						    	var bgcolorPrev = color.toRgbString(); 
						    	currentbg = bgcolorPrev;
						    },
						    hide: function(color) {
						    	$('.recUnit').css("background-color",currentbg);
						    }
							
						});
						setStatus();
						
					}
				unsetLoadingDiv($('section.mandant > header'));
				}
				else{
					setMessagePopUp("problem", "error_no_mandators_in_list");
				}
			},
			error: function (jqXHR, textStatus, errorThrown) {
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
		
		
	
});

function call_recs(){
	var customerID = $.cookie('customerID');
	var cur_host = window.location.host;
	var dev = 'cat.dev';
    var test = '.test.';
    var recoHost ='';
	if(cur_host.indexOf(dev)!=-1 ){
		recoHost = 'http://cat.development.yoochoose.com:8080/recocontroller';
	}else{
		if(cur_host.indexOf(test)!=-1 ){
			recoHost = 'http://reco.test.yoochoose.net';
		}else{
			recoHost = 'http://reco.yoochoose.net';
		}
	}
	
	var scriptSrc = recoHost+'/ebl2/'+customerID+'/Alex/product_page.ebljs?contextitems=1&numrecs=5';
	var heads = document.getElementsByTagName('head');
	var head = null;
	if(heads != null){
		head = heads[0];
	}
	
	var script = document.createElement('script');
	script.type = 'text/javascript';
	script.src = scriptSrc;
	if(head != null){
		head.appendChild(script);
	}else{
		if(typeof(document.readyState) == 'undefined' ||
				document.readyState == 'complete' ||
				document.readyState == 'loaded')
		{
			var body = document.getElementsByTagName('body')[0];
			body.insertBefore(script, body.lastChild);
		}
		else
		{
			var id = new Date().getMilliseconds();
			document.write('<p id="ycscrp'+id+'" style="display:none;"></p>');
			document.getElementById('ycscrp'+id).insertBefore(script, null);
		}
	}
}

function saveMandatorChoose() {
	if($('#choose_mandant').val() != "")
	{
		$.cookie('customerID', $('#choose_mandant').val(), { expires: 365 });
		//$('.edit_contact_data').attr('href', 'edit_contact_data.html?customer_id=' + $.cookie('customerID'));
		$('.overlay').hide();
		$('.dialog_body').hide();
		call_recs();
		setTabs();
		//setLicenceKey(customerID);
		setMandantData();
		setScript();
		setStatus();
		$('.available_view_options').children('li').removeClass('current');
		$('.available_view_options').children('li').first().addClass('current');
	}
	else
	{
		setMessagePopUp("problem", "error_no_customer_select");
	}
}

function setScript(){
	customerID = $.cookie('customerID');
	var request = $.ajax({
		type: "GET",
		url: "/ebl/v3/ebl2/getRecSize?mandator="+customerID,
		//async: false,
		dataType: "json"
	});
	request.done(function( json ) {
			var manInfo = json.mandatorInfo;
			if(manInfo != null){
				typeAndSize  = manInfo.name;
				var backgroundBGTemp = manInfo.website;
				if(backgroundBGTemp != null && backgroundBGTemp != 'null'){
					currentbg = backgroundBGTemp;
				}
				$.cookie('backgroundBG', currentbg);
				
				typeAndSizeSplited = typeAndSize.split('a');
				recSize = typeAndSizeSplited[1];
				recCT = typeAndSizeSplited[0];
				
				var envYC = 'prod';
				if((window.location.origin+'').indexOf('dev') != -1){
					envYC = 'dev';
				}else if((window.location.origin+'').indexOf('test') != -1){
					envYC = 'test';
				}
				$('#scriptaria').val('<div id="YCRecos" style="display: none;"></div>\n'+
			 			'<script src="https://cdn.yoochoose.net/tracker.js"></script>\n'+
			 			'<script type="text/javascript">\n'+
			 			'	var manddatorId = "'+customerID+'";\n'+
			 			'	var envYC = "'+envYC+'";\n'+
			 			'	var recSize = "'+recSize+'"; var bgColor="'+currentbg+'"; \n'+
			 			'	et_yc_click(manddatorId,recSize);\n'+
			 			'</script>');
			}
	});
	request.fail(function(jqXHR, textStatus) {
		
	  alert( "Request failed: " + textStatus+" "+jqXHR.status );
	});
}
var crawlEnabled = false;
var requestOperating = false;
var dateFinishedStatus = null;
var enabledStatus = false;
var amountStatus = null;
function updateStatus(){
	if(enabledStatus){
		crawlEnabled = true;
		$('#crawler_status').text("Active");
		$('#crawler_status').css('color', 'green');
		$('#crawler_dates').show();
		$('#crawler_date').show();
		$('#crawler_date').text(dateFinishedStatus);
		$('#crawler_itemss').show();
		$('#crawler_items').show();
		$('#crawler_items').text(amountStatus);
	}else{
		$('#crawler_status').text("New");
		$('#crawler_status').css('color', 'red');
		$('#crawler_date').hide();
		$('#crawler_items').hide();
		$('#crawler_dates').hide();
		$('#crawler_itemss').hide();
	}
}
function setStatusInside(isSync){
	requestOperating = true;
	customerID = $.cookie('customerID');
	var request = $.ajax({
		type: "GET",
		url: "/ebl/v3/ebl2/getStatus?mandator="+customerID,
		async: isSync,
		dataType: "json"
	});
	request.done(function( json ) {
		requestOperating = false;
			var manInfo = json.mandatorInfo;
			if(manInfo != null){
				dateFinishedStatus = manInfo.name;
				enabledStatus = manInfo.enabled;
				amountStatus = manInfo.website;
				if(currentTab == 0){
					updateStatus();
					call_recs();
				}
			}
	});
	request.fail(function(jqXHR, textStatus) {
		requestOperating = false;
		alert( "Request failed: " + textStatus+" "+jqXHR.status );
	});
}
var timerStatus;
function setStatus(){
	setStatusInside(false);
	if(!crawlEnabled){
		 timerStatus = setInterval(function () {
			if(!crawlEnabled){
				setStatusInside(true);
			}else{
				clearInterval(timerStatus);
			}
		}, 60000);
	}
}
//var mandatorDataWasSet = false;
var currentTab = 0;
var firstVisitStatistics = true;

$(window).resize(function() {
	if(currentTab == 1) {
		setChartsDimensions();
	    
	}
	if ( $('.overlay').is(":visible") ){
	      layerSizing($('.overlay'));
	    }
  });
function setTabs(){
	$(function() {
		$( "#tabs" ).tabs({
			activate: function(event, ui) {
				currentTab = ui.newTab.index();
				if(currentTab == 0){
					updateStatus();
					if(changeScript) {
						customerID = $.cookie('customerID');
						
						var envYC = 'prod';
						if((window.location.origin+'').indexOf('dev') != -1){
							envYC = 'dev';
						}else if((window.location.origin+'').indexOf('test') != -1){
							envYC = 'test';
						}
						
						$('#scriptaria').val('<div id="YCRecos" style="display: none;"></div>\n'+
					 			'<script src="https://cdn.yoochoose.net/tracker.js"></script>\n'+
					 			'<script type="text/javascript">\n'+
					 			'	var manddatorId = "'+customerID+'";\n'+
					 			'	var envYC = "'+envYC+'";\n'+
					 			'	var recSize = "'+recSize+'";\n'+
					 			'	et_yc_click(manddatorId,recSize);\n'+
					 			'</script>');
					}
				}
				if(currentTab == 1) {
					if(firstVisitStatistics){
						firstVisitStatistics = false;
						initialLoadData();
					}
				}else{
					if(currentTab == 2){
						$('#recommendation_size').val(recSize);
						$('#rec-content-type').val(recCT);
						
						if(productPageUrlFromRecs !=null){
							$('#site').val(productPageUrlFromRecs);
						}
						$('#show_more_conf').show();
						startReconfigure();
					}
				}
			}
		}).css({'min-height': '470px'});
	});	
}




var sitePrefix = null;
function setMandantData() {
    var json = $('body').data('mandatorInfoList');
    var customerID = $.cookie('customerID');
    for (var i = 0; i < json.mandatorInfoList.length; i++) {
        if (json.mandatorInfoList[i].name == customerID) {
            $('.info').children('strong').text(json.mandatorInfoList[i].website);
            sitePrefix = json.mandatorInfoList[i].website;
            $.cookie('mandatorwebsite', sitePrefix);
            $('.info').children('span').children('.codeid').text(json.mandatorInfoList[i].name);
            $.cookie('mandator', json.mandatorInfoList[i].name);
			$.cookie('mandatorType', json.mandatorInfoList[i].type);
        }
    }

}

var setMessages = function() {
    
    	var destroyMessageTrigger = $('.message .destroy_message, .message .close');
    	destroyMessageTrigger.on("click", function(event){
    		$(this).closest('.message').fadeOut('fast');
    	});
    };
    

var activateDialog = function() {
        var openButton = $(".switch > a");
        openButton.on("click", function(event){
          var modelID = $(this).closest("li.model").find("h5").text();
          setDialogs(modelID);
    	  if(modelID != "")
    	  {
    		fillSubModels(modelID);
    	  }
        });
        
        var editData =$("#edit_contact_data");
        editData.on("click", function(event){
        	$('.validation_message').hide();
        	getCostumer();
        	setDialogs2('editDataOverlay','editDataBodyOverlay','destroy_dialog');
        });
};
function getCostumer(){
	var customerID = $.cookie('customerID');
	$.ajax({
	    dataType: "json",
	    async: false,
		beforeSend: function (req) {
				req.setRequestHeader('no-realm', 'realm1');
				},
				 statusCode: {
						401: function (jqXHR, textStatus, errorThrown) {
							$.cookie('password', null);
							$.cookie('email', null);
							window.location = "login.html";
						}
				},
	    url: "/ebl/v3/profile/get_profile_pack/" + customerID,
	    success: function (json) {
	        var customer = json.profilePack.customer;
	        var mandator = json.profilePack.mandator;
	        $('body').data('costumerData', customer);
	        $('body').data('mandatorData', mandator);
			if(customer.email == null)
			{
				$('#edit_email').val("");
			}
			else
			{
				$('#edit_email').val(customer.email);
			}
			if(customer.firstName == null)
			{
				$('#fname').val("");
			}
			else
			{
				$('#fname').val(customer.firstName);
			}
			if(customer.lastName == null)
			{
				$('#lname').val("");
			}
			else
			{
				$('#lname').val(customer.lastName);
			}
			if(mandator.website == null)
			{
				$('#wurl').val("");
			}
			else
			{
				$('#wurl').val(mandator.website);
			}
			
	        
	    },
	    error: function (jqXHR, textStatus, errorThrown) {
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


function changeEditdata() {

	var showError = false;
	var urlDomStartsError = false;
	if($('#fname').val() == "")
	{
		$('label[for="fname"]').parent().addClass("problem");
		showError = true;
	}
	else
	{
		$('label[for="fname"]').parent().removeClass("problem");
	}
	if($('#lname').val() == "")
	{
		$('label[for="lname"]').parent().addClass("problem");
		showError = true;
	}
	else
	{
		$('label[for="lname"]').parent().removeClass("problem");
	}
	if($('#wurl').val() == "")
	{
		$('label[for="wurl"]').parent().addClass("problem");
		showError = true;
	}
	else
	{
		var sitePrefix = $('#wurl').val();
		if(sitePrefix.indexOf('http') == -1){
			$('label[for="wurl"]').parent().addClass("problem");
			urlDomStartsError = true;
			showError = true;
		}else{
			$('label[for="wurl"]').parent().removeClass("problem");
		}
	}
	
	if(showError == true)
	{
		if(urlDomStartsError){
			$('#validation_message').attr('data-translate', "error_url_protocol");
		}else{
			$('#validation_message').attr('data-translate', "error_fill_required_fields" );
		}
		localizer();
		$('.validation_message').show();
	}
	else
	{
		var customer = $('body').data('costumerData');
		var mandator = $('body').data('mandatorData');
	    customer.firstName = $('#fname').val();
	    customer.lastName = $('#lname').val();
	    mandator.website = $('#wurl').val();
		$.ajax({
			type: "POST",
			beforeSend: function (x) {
				if (x && x.overrideMimeType) {
					x.overrideMimeType("application/json;charset=UTF-8");
				}
				x.setRequestHeader('no-realm', 'realm1');
			},
			mimeType: "application/json",
			contentType: "application/json; charset=UTF-8",
			dataType: "json",
			data: JSON.stringify(customer),
			url: "/ebl/v3/profile/update_customer",
			success: function (json) {
				//on success
				updateMandator(mandator);
				
			},
			error: function (jqXHR, textStatus, errorThrown) {
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

function updateMandator(mandator){
	
	$.ajax({
		type: "POST",
		beforeSend: function (x) {
			if (x && x.overrideMimeType) {
				x.overrideMimeType("application/json;charset=UTF-8");
			}
			x.setRequestHeader('no-realm', 'realm1');
		},
		mimeType: "application/json",
		contentType: "application/json; charset=UTF-8",
		dataType: "json",
		data: JSON.stringify(mandator),
		url: "/ebl/v3/profile/update_mandator",
		success: function (json) {
			//on success
			$.cookie('mandatorwebsite', mandator.website);
			$('#validation_message').attr('data-translate', "message_data_saved_successfully" );
			localizer();
			$('.validation_message').show();
			
		},
		error: function (jqXHR, textStatus, errorThrown) {
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

      
var openLayer = function(overlay, layer, layerBody) {
	layer.remove();
	$(layer).appendTo(overlay);
	overlay.show();
	layerBody.css({'overflow':'auto'});
	layer.fadeIn('slow', function(){
		var scrollTop = $(window).scrollTop();
		layer.css({'top':scrollTop + 'px'});
	});
};
    	  
var closeLayer = function(layerBody, layer, overlay){
	layerBody.css({'overflow':'auto'});
	layer.fadeOut('fast');
	overlay.hide();
};
    	  
var layerSizing = function(overlay){
	var fullWidth = $('body').outerWidth(true);
	var fullHeight = $('body').outerHeight(true);
	overlay.css({'height':fullHeight + 'px', 'width':fullWidth + 'px'});
};

function setDialogs(modelID) {
    
    var overlay = $('#changeMandatorOverlay');
    var layer = $('#changeMandatorBodyOverlay');
    var layerBody = layer.parent('body');
    var closeButton = $('.dialog_body .destroy_dialog');
    
    if ( modelID.length ){
      layer.find("h2 > strong").text(modelID);
    }
    
    openLayer(overlay, layer, layerBody);
    layerSizing(overlay);
    
	
    closeButton.click(function() {
       closeLayer(layerBody, layer, overlay);
    });
    
    $(document).bind('keydown', function(e) { 
      if (e.which == 27) {
        closeLayer(layerBody, layer, overlay);
      }
    });
	
  }

function setDialogs2(overlayId,dialogBodyId,closeButtonId ) {
    
    var overlay = $('#'+overlayId);
    var layer = $('#'+dialogBodyId);
    var closeButtonOk = $('#'+closeButtonId);
    var layerBody = $('#'+overlayId).parent('body');
    var closeButton = $('.dialog_body .destroy_dialog');
    
    openLayer(overlay, layer, layerBody);
    layerSizing(overlay);
    
    
    closeButton.click(function() {
       closeLayer2(layerBody, layer, overlay);
    });
    
    closeButtonOk.click(function() {
       closeLayer2(layerBody, layer, overlay);
    });
    
    $(document).bind('keydown', function(e) { 
      if (e.which == 27) {
        closeLayer2(layerBody, layer, overlay);
      }
    });
	
  }

var closeLayer2 = function(layerBody, layer, overlay){
    layerBody.css({'overflow':'auto'});
    layer.fadeOut('fast');
    overlay.hide();
  };


function show_recommendations(json){
	if(json == null){
		return;
	}
	jsonRecs = json;
	var recamount =  json.length;
	if(recamount == 0){
		return;
	}
	productPageUrlFromRecs = json[0].url+'';
}


