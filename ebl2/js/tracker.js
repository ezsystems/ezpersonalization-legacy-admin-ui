var recoHost;
var eventHost;
//var recoHost = 'http://localhost:8090/recocontroller';
//find the base path of a script

function setHost() {
	 	var protocol = ('https:' == document.location.protocol ? 'https://' : 'http://');
    	if(envYC == 'dev'){
    		recoHost = protocol+'cat.development.yoochoose.com:8080/recocontroller';
    		eventHost = protocol+'cat.development.yoochoose.com:8080/tracker/';
    		return;
    	}else{
    		if(envYC == 'test'){
    			recoHost =  protocol+'reco.test.yoochoose.net';
    			eventHost = protocol+'event.test.yoochoose.net/';
    			return;
    		}else{
    			recoHost =  protocol+'reco.yoochoose.net';
    			eventHost = protocol+'event.yoochoose.net/';
    			return;
    		}
    	}
   
}




var recSizeP = null;

function getCookieY()
{
	var c_name = 'YCID';
	var c_value = document.cookie;
	var c_start = c_value.indexOf(" " + c_name + "=");
	if (c_start == -1)
	  {
	  c_start = c_value.indexOf(c_name + "=");
	  }
	if (c_start == -1)
	  {
	  c_value = null;
	  }
	else
	  {
	  c_start = c_value.indexOf("=", c_start) + 1;
	  var c_end = c_value.indexOf(";", c_start);
	  if (c_end == -1)
	  {
	c_end = c_value.length;
	}
	c_value = unescape(c_value.substring(c_start,c_end));
	}
	return c_value;
}

function setCookieY()
{
	var exdate=new Date();
	var exdays = 30; // expired in 30 days
	exdate.setDate(exdate.getDate() + exdays);
	
	var cy_value = getCookieY();
	if(cy_value == null || cy_value == ""){
		cy_value = generateGuid(); 
	}
		
	var c_value=escape(cy_value) + ( "; expires="+exdate.toUTCString()+"; path=/");
	document.cookie='YCID' + "=" + c_value;
}

function generateGuid() {
	 var S4 = function() {
	  return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
	 };
	 return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
}

function et_yc_makeImage()
{
	if(arguments.length < 4)
		return;

	var params = '';
	for(var i=0; i<arguments.length; i++)
	{
		if(i){
			params += '/';
		}
		params += arguments[i];
	}

	var url = eventHost+params;

	var ycimg = new Object();
	ycimg.src = url;

	var ycanchor = document.createElement('img');
	ycanchor.border = 0;
	ycanchor.src = ycimg.src;
	ycanchor.style.display = 'none';

	if(typeof(document.readyState) == 'undefined' ||
		document.readyState == 'complete' ||
		document.readyState == 'loaded')
	{
		var body = document.getElementsByTagName('body')[0];
		body.insertBefore(ycanchor, body.lastChild);
	}
	else
	{
		var id = new Date().getMilliseconds();
		document.write('<p id="ycimg'+id+'" style="display:none;"></p>');
		document.getElementById('ycimg'+id).insertBefore(ycanchor, null);
	}
}


function hashCode() {
	//var value = document.URL.toString().split(window.location.host)[1].replace(/[?|&]recommended=true/,"");
	var value = document.URL.toString().replace(/[?|&]recommended=true/,"");
    var h = 0;
    if ( value.length > 0) {
    	var ii = 0;
        for (ii = 0; ii < value.length; ii++) {
            h = 31 * h + value.charCodeAt(ii);
            h = h & h;
        }
    }
    if(h < 0){
    	return -1*h;
    }else{
    	 return h;
    }
}

function et_yc_click(clientid,recSize2)
{
	setHost();
	recSizeP = recSize2;
	var pageid = hashCode();
	var atype = 1;
	setCookieY();
	var userid = getCookieY();
	var evtype = 'click';
	et_yc_makeImage("ebl", clientid, evtype , userid, atype, pageid);
	if(document.URL.toString().indexOf('recommended=true') != -1){
		evtype = 'clickrecommended';
		et_yc_makeImage("ebl", clientid, evtype , userid, atype, pageid);
	}
	
	call_recs(clientid, userid, pageid);
	
}

function call_recs(clientid,userid,pageid){
	var scriptSrc = recoHost+'/ebl2/'+clientid+'/'+userid+'/product_page.ebljs?contextitems='+pageid+'&numrecs=6';
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


function show_recommendations(json){
	if(json == null){
		return;
	}
	var recamount =  json.length;
	if(recamount >3){
		recamount = 3;
	}else{
		if(recamount == 0){
			return;
		}
	}
	var positionOfRecs = 1;
	if(recSizeP != null){
		positionOfRecs = recSizeP;
	}
	var element = document.getElementById("YCRecos");
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
		var imgValue = json[i].img;
		var titleValue = json[i].title;
		var priceValue = json[i].price;
		var url = json[i].url+'';
		if(url.indexOf("?") !=-1) {
			url = url+"&recommended=true";
		}else{
			url = url+"?recommended=true";
		}
		previewHtml+='<a href="'+url+'" style="position: relative;  width:'+awidth+'px; height:'+aheight+'px; display: inline-block; margin: 0 10px '+amarginBottom+'px 0; padding: 0; float: left; vertical-align: baseline; background-color: #ebeff4; border: 1px solid #c9d4e3;text-decoration: none;" >';
		if(imgValue != null){
			previewHtml+='<img src ="'+imgValue+'"  style="border: 0px; margin: 0; max-height: '+imgwidth+'px; max-width: '+awidth+'px;" />';
			
		}else{
			fontSize = 17;
			lineHeight = 17;
		}	
		if(titleValue != null){
			previewHtml+='<p style="overflow: hidden; max-height: 45px; clear: none; display: block; font-weight: bold; font-size: '+fontSize+'px; line-height: '+lineHeight+'px; margin: 7px 9px 0 9px;	padding: 0;	text-decoration: underline;" >'+titleValue+'</p><br/>';
		}
		
		if(priceValue != null){
			previewHtml+='<p style=" max-height: 45px; clear: none; display: block; font-weight: bold; font-size: 15px; color: #b41e0a; padding: 0 0 0 10px; text-decoration:none; margin-top: -10px;" >'+priceValue+'</p>';
		}
		previewHtml+='	</a>';
	}
	previewHtml+='	</div>'+
    '<br/><p style="text-align: left;  margin-top: -'+((positionOfRecs == 2)?'8':'10')+'px; font-style: italic;  font-size: 0.8em; float: left;  text-decoration: none; '+((positionOfRecs == 2)?'width: 159px;':'')+'">Recommendations powered by '+
    '<a href="https://yoochoose.com/" style="text-decoration: none;">YOOCHOOSE</a></p>';
	element.insertAdjacentHTML('beforeend', previewHtml);
	//window.google_ad_client = "ca-pub-2445550189113422";
	window.google_ad_client = "ca-pub-7508745585125819";
	//window.google_ad_slot = "3226188379";
	window.google_ad_slot = "4715274689";
	window.google_ad_width = addwidth;
	window.google_ad_height = aheight;
	// container is where you want the ad to be inserted
	var container = document.getElementById('previewRecos');
	var w = document.write;
	document.write = function (content) {
	    container.innerHTML = container.innerHTML+content;
	    document.write = w;
	};
	var protocol = ('https:' == document.location.protocol ? 'https://' : 'http://');
	var script = document.createElement('script');
	script.type = 'text/javascript';
	script.src = protocol+'pagead2.googlesyndication.com/pagead/show_ads.js';
	container.appendChild(script);
	
	
}




