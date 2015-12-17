var eventHost ='https://event.yoochoose.net/';

function getCookieY()
{
	var c_name = 'YCID';
	var c_value = document.cookie;
	var c_start = c_value.indexOf(" " + c_name + "=");
	if (c_start == -1){
	  c_start = c_value.indexOf(c_name + "=");
	}if (c_start == -1){
	  c_value = null;
	}else{
	  c_start = c_value.indexOf("=", c_start) + 1;
	  var c_end = c_value.indexOf(";", c_start);
	  if (c_end == -1){
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
	if(arguments.length < 4){
		return;
	}

	var params = '';
	for(var i=0; i<arguments.length; i++){
		if(i){
			params += '/';
		}
		params += arguments[i];
	}

	var url = eventHost+params;

	var ycimg = new Object();
	ycimg.src = url;

	var ycimg=new Image(1,1);
	ycimg.src=url;
}
var yc_clientid='';

function pushyc(){
	if(arguments.length < 1)
		return;
	var eventType = arguments[0];
	if(eventType == '_setAccount'&& arguments.length == 2){
		yc_clientid = arguments[1];
		return;
	}
	var userid = null;
	if(eventType == '_trackPageview'){
		var pageid;
		if(arguments.length == 2){
			pageid = encodeURIComponent(arguments[1]);
		}else{
			if(arguments.length == 3){
				pageid = encodeURIComponent(arguments[1]);
				userid = encodeURIComponent(arguments[2]);
			}else{
				var title = document.title;
				pageid =  encodeURIComponent(title);
			}
		}
		
		if(yc_clientid != ''){
			et_yc_eventu(yc_clientid,pageid,'click','1',userid);
		}
		return;
	}
	if(eventType =='_trackEvent'){
		if(arguments.length < 4 ){
			return;
		}
		var item_type = arguments[1];
		var event_type = arguments[2];
		var pageid =  encodeURIComponent(arguments[3]);
		if(arguments.length == 5 ){
			userid = encodeURIComponent(arguments[4]);
		}
		if(yc_clientid != ''){
			et_yc_eventu(yc_clientid,pageid,event_type,item_type,userid);
		}
	}
	if(eventType =='_trackTimedEvent'){
		if(arguments.length < 5 ){
			return;
		}
		var item_type = arguments[1];
		var event_type = arguments[2];
		var pageid =  encodeURIComponent(arguments[3]);
		var timeout = parseInt(arguments[4]);
		if(arguments.length == 6 ){
			userid = encodeURIComponent(arguments[5]);
		}
		if(yc_clientid != ''){
			setTimeout(function(){
				et_yc_eventu(yc_clientid,pageid,event_type,item_type,userid);
			},timeout);
		}
	}
}

function et_yc_event(clientid,pageid,evtype,atype){
	setCookieY();
	var userid = getCookieY();
	et_yc_makeImage("ebl", clientid, evtype , userid, atype, pageid);
}

function et_yc_eventu(clientid,pageid,evtype,atype,userid){
	if(userid == null || userid == 'undefined'){
		et_yc_event(clientid, pageid, evtype, atype);
	}else{
		et_yc_makeImage("ebl", clientid, evtype , userid, atype, pageid);
	}
	
}

(function(){
	if(_ycq&& _ycq instanceof Array){
		if(document.URL.toString().indexOf('ycreco=true') != -1){
			evtype = 'clickrecommended';
			_ycq.push(['_trackEvent','1','clickrecommended',document.title]);
		}
		var elementToApplay = _ycq.shift();
		var tempYcArray = [];
		while(elementToApplay && elementToApplay !='undefined'){
			pushyc.apply(this, elementToApplay || []);
			if(yc_clientid == ''){
				tempYcArray.push(elementToApplay);
			}
			elementToApplay = _ycq.shift();
		}
		elementToApplay = tempYcArray.shift();
		while(elementToApplay && elementToApplay !='undefined'){
			pushyc.apply(this, elementToApplay || []);
			elementToApplay = tempYcArray.shift();
		}
		
	}
	
	_ycq = new Object();
	_ycq.push = function(){
		if(arguments.length < 1)
			return;
		var elementToApplay = arguments[0];
		if(elementToApplay && elementToApplay !='undefined'){
			pushyc.apply(this, elementToApplay || []); 
		}
		
	};
})();
