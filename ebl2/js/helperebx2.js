


var sitePrefix = null;

function setMessagePopUpJs(type, message) {
	var messeageYC=document.getElementById("messageYC");
	var bgelement = document.getElementById('backgrounBlockerYC');
	messeageYC.className = "message "+type;
	bgelement.className = "backgrounBlockerYC";
	document.getElementById("message_text").setAttribute("data-translate", message);
	localizer();
	bgelement.removeAttribute('style');
    messeageYC.removeAttribute('style');
   

}

function setCookie(c_name,value,exdays)
{
	var exdate=new Date();
	exdate.setDate(exdate.getDate() + exdays);
	var c_value=escape(value) + ((exdays==null) ? "" : "; expires="+exdate.toUTCString());
	document.cookie=c_name + "=" + c_value;
}

function getCookie(c_name)
{
	var c_value = document.cookie;
	var c_start = c_value.indexOf(" " + c_name + "=");
	if (c_start == -1){
		c_start = c_value.indexOf(c_name + "=");
	}
	if (c_start == -1){
		c_value = null;
	}
	else{
		c_start = c_value.indexOf("=", c_start) + 1;
		var c_end = c_value.indexOf(";", c_start);
		if (c_end == -1){
			c_end = c_value.length;
		}
		c_value = unescape(c_value.substring(c_start,c_end));
	}
	return c_value;
}
var codePass =  getCookie('password');;
var username = getCookie('email');
var mandator = getCookie('mandator');
var customerID = "";
var lang = getCookie('language');
var recType  = 0;
var requestDone = false;
var prevSize = 1;
var prevType = 3;


var code = gup('code');


function changePassword()
{

	var password = $('#new_password').val();
	var passwordConfirm = $('#new_password_confirm').val();
	if(password == null || password.length < 8 ){
		$('.new_password').addClass('problem');
		$('#validation_message2').attr('data-translate', "edit_contact_data_password_length" );
		localizer();
		$('.validation_message').show();
		
	}else if(password != passwordConfirm){
		$('.new_password_confirm').addClass('problem');
		$('#validation_message2').attr('data-translate', "edit_contact_data_confirmation_does_not_match" );
		localizer();
		$('.validation_message').show();
	}
	else {
		setLoadingDiv($('.actions'));
		$.ajax({
			type:"POST",
			beforeSend: function(x) {
				if (x && x.overrideMimeType) {
				  x.overrideMimeType("application/json;charset=UTF-8");
				}
			  },
			mimeType: "application/json",
			contentType: "application/x-www-form-urlencoded",
			dataType: "json",
			data: {password: password},
			url: "/ebl/v3/profile/change_password",
			success: function(json){
				//on success
				$.cookie('password', password);
				$.cookie('email', username);
				$.cookie('customerID', null);
				
				loginAgain();
				
			},
			error : function(jqXHR, textStatus, errorThrown)
			{
				if(jqXHR.status != null && jqXHR.status == 403)
				{
					$('#validation_message').attr('data-translate', "error_server_error_403" );
					localizer();
					$('.validation_message').show();
				}
				else if(jqXHR.status != null && jqXHR.status == 401)
				{
					$('#validation_message').attr('data-translate', "error_server_error_401" );
					localizer();
					$('.validation_message').show();
				}
				else if(jqXHR.status != null && jqXHR.status == 400)
				{
					$('#validation_message').attr('data-translate', "error_server_error_400" );
					localizer();
					$('.validation_message').show();
				}
				else if(jqXHR.status != null && jqXHR.status == 404)
				{
					$('#validation_message').attr('data-translate', "error_server_error_404" );
					localizer();
					$('.validation_message').show();
				}
				else if(jqXHR.status != null && jqXHR.status == 409)
				{
					$('#validation_message').attr('data-translate', "error_server_error_409" );
					localizer();
					$('.validation_message').show();
				}
				else
				{
					$('#validation_message').attr('data-translate', "error_server_error" );
					localizer();
					$('.validation_message').show();
				}
			unsetLoadingDiv($('.actions'));
						}
		});
	}

}

function loginAgain()
{
	var password = $.cookie('password');
	var username = $.cookie('email');
	
	$.ajax({
			type:"GET",
			password: password,
			username: username,
			url: "/ebl/v3/registration/get_me/",
			beforeSend : function(req) {
						req.setRequestHeader('no-realm', 'realm1');
			},
			success: function(json){
				$.cookie('password', password);
				$.cookie('mandator', mandator);
				window.location.replace("registration_step_3.html");
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
					unsetLoadingDiv($('.actions'));
			}
	});
	
}

$(document).ready(function () {
	
	if(code != null && code!=''){
		mandator = gup('mandator');
		username = decodeURIComponent(gup('username'));
		lang = gup('lang');
		
		$.cookie('language', lang);
		$.cookie('email',username);
		
		$.ajax({
			type: "POST",
			beforeSend: function (req) {
				req.setRequestHeader('no-realm', 'realm1');
			},
			url: "/ebl/v3/registration/create_access_token",
			data: {
				login: username,
				password: code,
				set_cookie: true
			},
		
			success: function(){
				setDialogsContact("messagePassword","messageBodyPassword",'destroy_dialog');
				$('#new_password_confirm').keypress(function (e) {
					if (e.which == 13) {
						$(this).blur();
						changePassword();
					}
				});
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
					$('body').data('mandator', new Object());
					requestDone = true;
			    }
		});
		
	}else{
		starter();
	}
});

function starter() {
	$.ajax({
		type: "POST",
		beforeSend: function (req) {
			req.setRequestHeader('no-realm', 'realm1');
		},
		url: "/ebl/v3/registration/create_access_token",
		data: {
			login: username,
			password: codePass,
			set_cookie: true
		},
		success: function(){
			$.ajax({
			    dataType: "json",
				type:"GET",
				beforeSend: function (req) {
						req.setRequestHeader('Authorization', make_base_auth(username, codePass));
						req.setRequestHeader('no-realm', 'realm1');
					},
			    url: "/ebl/v3/profile/get_profile_pack/" + mandator,
			    success: function (json) {
			
			        var mandator = json.profilePack.mandator;
			        var customer = json.profilePack.customer;
			        $('body').data('mandator', mandator);
			        sitePrefix = mandator.website;
					customerID = customer.id;
			        $('body').data('customer', customer);
					$('body').data('mandator', mandator);
					var prevSiteVal = $('#site').val();
					if(prevSiteVal == null || prevSiteVal == ''){
						if(mandator.website != null){
							$('#site').val(mandator.website);
						}
					}
					var prevSiteDomVal = $('#site_dom').val();
					if(prevSiteDomVal == null || prevSiteDomVal == ''){
						if(mandator.website != null){
							$('#site_dom').val(mandator.website);
						}
					}
					setCookie('mandatorwebsite', mandator.website, null);
					$(function() {
						$( document ).tooltip();
					});
					requestDone = true;
					show_recommendationsPreview(prevSize,prevType);
					
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
					$('body').data('mandator', new Object());
					requestDone = true;
			    }
			});
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
				$('body').data('mandator', new Object());
				requestDone = true;
		    }	
});
	
	$('#site').keypress(function (e) {
		if (e.which == 13) {
			$(this).blur();
			saveForm("");
		}
	});


	$('.login').click(function(){
			saveForm("");
		});
	
	$('#recommendation_size').change(function () {
			var newVal = $(this).val();
			if(prevSize != newVal){
				prevSize = newVal;
				show_recommendationsPreview(prevSize,prevType);
			}
		}
	);
	$('#rec-content-type').change(function () {
		var newVal = $(this).val();
		if(prevType != newVal){
			prevType = newVal;
			show_recommendationsPreview(prevSize,prevType);
		}
	}
);
}



function saveForm(nextPage)
{

	var showError = false;
	var urlStartsError = false;
	var urlDomStartsError = false;
	if($('#site_dom').val() == "")
	{
		$('label[for="site_dom"]').parent().addClass("problem");
		showError = true;
	}
	else
	{
		sitePrefix = $('#site_dom').val();
		if(sitePrefix.indexOf('http') == -1){
			$('label[for="site_dom"]').parent().addClass("problem");
			urlDomStartsError = true;
		}else{
			$('label[for="site_dom"]').parent().removeClass("problem");
		}
		
	}
	
	if($('#site').val() == "")
	{
		$('label[for="site"]').parent().addClass("problem");
		showError = true;
	}
	else
	{
		if(sitePrefix!=null && $('#site').val().indexOf(sitePrefix) == -1 ){
			$('label[for="site"]').parent().addClass("problem");
			urlStartsError = true;
		}else{
			$('label[for="site"]').parent().removeClass("problem");
		}
	}
	if($('#recommendation_size').val() == "")
	{
		$('label[for="recommendation_size"]').parent().addClass("problem");
		showError = true;
	}
	else
	{
		$('label[for="recommendation_size"]').parent().removeClass("problem");
	}
	if($('#rec-content-type').val() == "")
	{
		$('label[for="rec-content-type"]').parent().addClass("problem");
		showError = true;
	}
	else
	{
		$('label[for="rec-content-type"]').parent().removeClass("problem");
	}

	
	if(showError == true )
	{
		
		setMessagePopUp("problem", "error_fill_required_fields");
	}
	else
	{
		if(urlDomStartsError == true){
			setMessagePopUp("problem", "error_url_protocol");
		}else{
			if(urlStartsError == true){
				setMessagePopUp("problem", "error_url_prefix");
			}else{
				saveMandator();
			}
		}
	
	}
}
	

function saveMandator()
{
	var mandator = $('body').data('mandator');
	mandator.website = $('#site_dom').val() ; 
	setCookie('mandatorwebsite', mandator.website, null);
	$.ajax({
		username: username,
		password: codePass,
		type:"POST",
		beforeSend: function(x) {
			if (x && x.overrideMimeType) {
			  x.overrideMimeType("application/json;charset=UTF-8");
			}
		  },
		mimeType: "application/json",
		contentType: "application/json;charset=UTF-8",		
		dataType: "json",
		data: JSON.stringify(mandator),
		url: "/ebl/v3/profile/update_mandator",
		success: function(json){
			//on success
			login();
			
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
		unsetLoadingDiv($('.actions'));
					}
	});
}

var gettingPageEbl2 = false;
function login() {
	
	 var timerL = setInterval(function () {
	        if (requestDone && !gettingPageEbl2){
	        	gettingPageEbl2 = true;
	            clearInterval(timerL);
	            var recType = $('#rec-content-type').val();
	            var recSize = $('#recommendation_size').val();
	        	var url = $('#site').val();
	    		setLoadingDiv($('.actions'));
	    		var myObj = new Object();
	    		myObj.url = url;
	        	myObj.rectype = recType;
	        	myObj.recsize = recSize;
	    		$.ajax({
	    			type: "POST",
	    			url: "/ebl/v3/ebl2/getPage/",
	    			mimeType: "application/json",
	    			contentType: "application/json; charset=UTF-8",
	    			data: JSON.stringify(myObj),		
	    			dataType: "json",
	    			success: function (json) {
	    				var manInfo = json.mandatorInfo;
	    				if(manInfo != null){
	    					var html = manInfo.name;
	    					if(html != null && html != ''){
	    						document.write(html);
	    					}else{
	    						gettingPageEbl2 = false;
	    						unsetLoadingDiv($('.actions'));
	    						setMessagePopUp("problem", "error_server_error");
	    					}
	    				}
	    			},
	    			error: function (jqXHR, textStatus, errorThrown) {
	    				gettingPageEbl2 = false;
	    				unsetLoadingDiv($('.actions'));
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
	    }, 50);
	 	
	
}
var IEBR = document.all?true:false;
var prevTarget = null;
var prevBackground = null;

function fadeOutYC(elementId) {
	var element = document.getElementById(elementId);
	var bgelement = document.getElementById('backgrounBlockerYC');
    var op = 1;  // initial opacity
    var timer = setInterval(function () {
        if (op <= 0.1){
            clearInterval(timer);
            element.style.display = 'none';
            bgelement.style.display = 'none';
        }
        element.style.opacity = op;
        element.style.filter = 'alpha(opacity=' + op * 100 + ")";
        op -= op * 0.1;
    }, 50);
}

var googleScript = null;
var prevWrite;
function show_recommendationsPreview(positionOfRecs,prtypeOfRecs){
	
	var recamount =  3;
	var element2 = document.getElementById("previewRecos");
	if(element2 != null){
		var scripts = element2.getElementsByTagName("script");
		if(scripts != null && scripts.length >0){
			element2.removeChild(scripts[0]);
		}
		
		element2.parentNode.removeChild(element2);
	}
	var element = document.getElementById("recoPreview");
	element.removeAttribute('style');
	var previewHtml = '<div style="position: relative;  width:728px; height:240px;  " id="previewRecos">';
	var awidth = 182;
	var imgwidth = 182;
	var aheight = 240;
	var addwidth = 120;
	var amarginBottom = 10;
	var fontSize = 11;
	if(positionOfRecs == 2){
		previewHtml = '<div style="position: relative;  width:160px; height:600px;  " id="previewRecos">';
		awidth = 159;
		aheight = 149;
		imgwidth = 90;
		addwidth = 159;
		amarginBottom = 2;
	}
	for(var i = 0;i<recamount;i++){
		var imgValue = "images/preview.jpg";
		var titleValue = 'Sample title';
		var priceValue = '2,69 EUR';
		
		previewHtml+='<a  style="position: relative;  width:'+awidth+'px; height:'+aheight+'px; display: inline-block; margin: 0 10px '+amarginBottom+'px 0; padding: 0; float: left; vertical-align: baseline; background-color: #ebeff4; border: 1px solid #c9d4e3;text-decoration: none;" >';
		if(prtypeOfRecs > 1 ){
			previewHtml+='<img src ="'+imgValue+'"  width="'+imgwidth+'px" style="border: 0px; margin: 0;" />';
			
		}else{
			fontSize = 17;
		}	
		previewHtml+='<p style="overflow: hidden; max-height: 45px; clear: none; display: block; font-weight: bold; font-size: '+fontSize+'px; line-height: 14px; margin: 7px 9px 0 9px;	padding: 0;	text-decoration: underline;" >'+titleValue+'</p><br/>';
		
		
		if(prtypeOfRecs == 3){
			previewHtml+='<p style=" max-height: 45px; clear: none; display: block; font-weight: bold; font-size: 15px; color: #b41e0a; padding: 0 0 0 10px; text-decoration:none; margin-top: -10px;" >'+priceValue+'</p>';
		}
		previewHtml+='	</a>';
	}
	previewHtml+='<a  style="position: relative;  width:'+addwidth+'px; height:'+aheight+'px; display: inline-block; margin: 0 10px '+amarginBottom+'px 0; padding: 0; float: left; vertical-align: baseline;text-decoration: none; overflow: hidden;" >';
	previewHtml+='<img src ="images/ad.jpg"  width="120px" style="border: 0px; margin: 0;" />';
	previewHtml+='	</a>';
	
	previewHtml+='	</div>';
	
	element.insertAdjacentHTML('beforeend', previewHtml);
	
	
		
	
}



