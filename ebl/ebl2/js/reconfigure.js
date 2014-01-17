var prevSize = null;
var prevType = null;
var alreadyStarted = false;
function startReconfigure(){
	prevType = $('#rec-content-type').val();
	prevSize = $('#recommendation_size').val();
	
	
	show_recommendationsPreview(prevSize,prevType);
	if(!alreadyStarted){
		$('#site').keypress(function (e) {
			if (e.which == 13) {
				$(this).blur();
				saveFormReconfigure("");
			}
		});
		$('#save_size_change').click(function(){
			saveSize();
			});
	}
	
	$('#change_size').hide();
	$('.overlay').hide();
	if(!alreadyStarted){
		$('#change_dom').click(function(){
			saveFormReconfigure("");
			});
		$('#show_more_conf_button').click(function(){
			$('#show_more_conf').hide();
			$('#more_conf').show();
		});
		$('#recommendation_size').change(function () {
				var newVal = $(this).val();
				if(recSize == newVal){
					$('#change_size').hide();
				}else{
					$('#change_size').show();
				}
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
		});
	}
	alreadyStarted = true;
	$('#more_conf').hide();
}


function saveFormReconfigure(nextPage)
{

	var showError = false;
	var urlStartsError = false;
	
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
		if(urlStartsError == true){
			setMessagePopUp("problem", "error_url_prefix");
		}else{
			loginReconfigure();
		}
	
	}
}

function saveSize(){
	recSize = $('#recommendation_size').val();
	setLoadingDivEbl2($('.actions2'));
	var myObj = new Object();
	myObj.mandator = customerID;
	myObj.recsize = recSize;
	 $.ajax({
	        type: "POST",
	        mimeType: "application/json",
	        contentType: "application/json; charset=UTF-8",
			dataType: "json",
	        data: JSON.stringify(myObj),
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
	        url: "/ebl/v3/ebl2/updateRecSize/",
	        success: function (json) {
	        	unsetLoadingDiv($('.actions2'));
	        	changeScript = true;
	        	$('#change_size').hide();
	        	setDialogs2('messageOverlay','messageBodyOverlay','destroyButtonOverlay');
	        	//setMessagePopUp("info", "rec_size_changed");

	        },
	        error: function (jqXHR, textStatus, errorThrown) {
	        	unsetLoadingDiv($('.actions2'));
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
var gettingPageEbl2 = false;
function loginReconfigure() {
		if(!gettingPageEbl2){
			gettingPageEbl2 = true;
	            var recType = $('#rec-content-type').val();
	            var recSize = $('#recommendation_size').val();
	        	var url = $('#site').val();
	        	var myObj = new Object();
	        	myObj.url = url;
	        	myObj.rectype = recType;
	        	myObj.recsize = recSize;
	        	setLoadingDivEbl2($('.actionsR'));
	    		$.ajax({
	    			type: "POST",
	    			beforeSend: function(x) {
						if (x && x.overrideMimeType) {
						  x.overrideMimeType("application/json;charset=UTF-8");
						}
					  },
					mimeType: "application/json",
					contentType: "application/json; charset=UTF-8",
					dataType: "json",
	    			url: "/ebl/v3/ebl2/getPage/",
	    			data: JSON.stringify(myObj),
	    			success: function (json) {
	    				var manInfo = json.mandatorInfo;
	    				if(manInfo != null){
	    					var html = manInfo.name;
	    					if(html != null && html != ''){
	    						if(crawlEnabled!='undefined' && timerStatus !='undefined' &&  !crawlEnabled){
	    							 clearInterval(timerStatus);
	    						}
	    						document.write(html);
	    					}else{
	    						gettingPageEbl2 = false;
	    						unsetLoadingDiv($('.actionsR'));
	    						setMessagePopUp("problem", "error_server_error");
	    					}
	    				}
	    			},
					error: function (jqXHR, textStatus, errorThrown) {
						gettingPageEbl2 = false;
						unsetLoadingDiv($('.actionsR'));
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
	var lineHeight = 14;
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
		if(jsonRecs != null && jsonRecs.length>i){
			if(jsonRecs[i].img != null){
				imgValue = jsonRecs[i].img;
			}
			if(jsonRecs[i].title != null){
				titleValue = jsonRecs[i].title;
			}
			if(jsonRecs[i].price != null){
				priceValue = jsonRecs[i].price;
			}
		}
		
		previewHtml+='<a  style="position: relative;  width:'+awidth+'px; height:'+aheight+'px; display: inline-block; margin: 0 10px '+amarginBottom+'px 0; padding: 0; float: left;'+
		'font-family: Arial,Verdana,Helvetica,sans-serif; vertical-align: baseline; background-color: #ebeff4; border: 1px solid #c9d4e3;text-decoration: none;" >';
		if(prtypeOfRecs > 1 ){
			previewHtml+='<img src ="'+imgValue+'"  style="border: 0px; margin: 0; max-height: '+imgwidth+'px; max-width: '+awidth+'px;" />';
			
		}else{
			fontSize = 17;
			lineHeight = 17;
		}	
		previewHtml+='<p style="overflow: hidden; max-height: 45px; clear: none; display: block; font-weight: bold; font-size: '+fontSize+'px; line-height: '+lineHeight+'px; margin: 0px 9px 0 9px;	padding: 0;	text-decoration: underline;" >'+titleValue+'</p><br/>';
		
		
		if(prtypeOfRecs == 3){
			previewHtml+='<p style=" max-height: 45px; clear: none; display: block; font-weight: bold; font-size: 13px; color: #b41e0a; padding: 0 0 0 10px; text-decoration:none; margin-top: -10px;" >'+priceValue+'</p>';
		}
		previewHtml+='	</a>';
	}
	previewHtml+='<a  style="position: relative;  width:'+addwidth+'px; height:'+aheight+'px; display: inline-block; margin: 0 10px '+amarginBottom+'px 0; padding: 0; float: left; vertical-align: baseline;text-decoration: none; overflow: hidden;" >';
	previewHtml+='<img src ="images/ad.jpg"  width="120px" style="border: 0px; margin: 0;" />';
	previewHtml+='	</a>';
	
	previewHtml+='<p style="text-align: left;  margin-top: -'+((positionOfRecs == 2)?'8':'10')+'px; font-style: italic;  font-size: 0.8em; float: left;  text-decoration: none;'+((positionOfRecs == 2)?'width: 159px;':'')+'">Recommendations powered by '+
    '<a href="http://yoochoose.com/" style="text-decoration: none;">YOOCHOOSE</a></p>	</div>';
	
   ;
	element.insertAdjacentHTML('beforeend', previewHtml);
		
	
}