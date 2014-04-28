


function createXMLHttpRequest() {
   try { return new XMLHttpRequest(); } catch(e) {}
   try { return new ActiveXObject("Msxml2.XMLHTTP"); } catch (e) {}
   alert("XMLHttpRequest not supported");
   return null;
 }

 var http = createXMLHttpRequest();

 function saveCrowlData(){
	 var myObj = new Object();
	 myObj.title = titlePath;
	 myObj.url = mandatorwebsite;
	 if(mandator == null){
		 mandator = getCookie('customerID');
	 }
	 myObj.mandator = mandator;
	 

	 if(pricePath!=null){
		 myObj.price = pricePath;
	 }
	 if(imgPath != null){
		 myObj.img = imgPath;
	 }
	 myObj.recsize = recSize;
	 var jsonStr = JSON.stringify(myObj);
	 http.open("POST", window.location.origin+'/ebl/v3/ebl2/storeCrowl/', true);
	 http.setRequestHeader("Content-type", "application/json;charset=UTF-8");
	 http.setRequestHeader("Content-length", jsonStr.length);
	 http.setRequestHeader("Connection", "close");
	 http.send(jsonStr);
 }
 

function setMessagePopUpJs(type, message) {
	var messeageYC=document.getElementById("messageYC");
	var bgelement = document.getElementById('backgrounBlockerYC');
	messeageYC.className = "message "+type;
	bgelement.className = "backgrounBlockerYC";
	document.getElementById("message_text").setAttribute("data-translate", message);
	localizerEBL2();
	bgelement.removeAttribute('style');
    messeageYC.removeAttribute('style');
    bgelement.style.height = getHeight()+"px";

}

function getHeight(){
	var body = document.body,
    html = document.documentElement;

	return Math.max( body.scrollHeight, body.offsetHeight, 
                       html.clientHeight, html.scrollHeight, html.offsetHeight );
}


var wasPreview = false;

function showPreview2(element){
	var element2 = document.getElementById("previewRecos");
	if(element2 != null){
		element2.parentNode.removeChild(element2);
	}
	var awidth = 182;
	var imgwidth = 182;
	var aheight = 240;
	var addwidth = 120;
	var amarginBottom = 10;
	var fontSize = 11;
	var lineHeight = 14;
	var previewHtml = '<div style="position: relative;  width:728px; height:240px;  " id="previewRecos">';
	if(recSize == 2){
		previewHtml = '<div style="position: relative;  width:160px; height:600px;  " id="previewRecos">';
		awidth = 159;
		aheight = 149;
		imgwidth = 90;
		addwidth = 159;
		amarginBottom = 2;
	}
	
	for(var i = 0;i<3;i++){
		previewHtml+='<a href="#" style="position: relative;  width:'+awidth+'px; height:'+aheight+'px; display: inline-block; margin: 0 10px '+amarginBottom+'px 0; padding: 0; float: left; vertical-align: baseline; background-color: #ebeff4; border: 1px solid #c9d4e3;text-decoration: none;" >';
		if(imgValue != null){
			previewHtml+='<img src ="'+imgValue+'"   style="border: 0px;margin: 0; max-height: '+imgwidth+'px; max-width: '+awidth+'px;" />';
			
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
	previewHtml+='	<p style="text-align: left;  margin-top: -'+((recSize == 2)?'8':'10')+'px; font-style: italic;  font-size: 0.8em; float: left; text-decoration: none; '+((recSize == 2)?'width: 159px;':'')+'">Recommendations powered by '+
    '<a href="http://yoochoose.com/" style="text-decoration: none;">YOOCHOOSE</a></p></div>';
	element.insertAdjacentHTML('beforeend', previewHtml);
		
	window.google_ad_client = "ca-pub-2445550189113422";
	window.google_ad_slot = "3226188379";
	window.google_ad_width = addwidth;
	window.google_ad_height = aheight;
	// container is where you want the ad to be inserted
	var container = document.getElementById('previewRecos');
	var w = document.write;
	document.write = function (content) {
	    container.innerHTML = container.innerHTML+content;
	    document.write = w;
	};
	var script = document.createElement('script');
	script.type = 'text/javascript';
	script.src = 'http://pagead2.googlesyndication.com/pagead/show_ads.js';
	container.appendChild(script);
	wasPreview = true;
	
	
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

var mandator = getCookie('mandator');
var mandatorwebsite =  getCookie('mandatorwebsite');
var lang = getCookie('language');
var imgPath = null;
var pricePath = null;
var titlePath = null;
var imgValue = null;
var priceValue = null;
var titleValue = null;
var beginpage = true; 
var initialRecType = -1;

var tYC = 0;
var readyStateCheckIntervalYCN = setInterval(function() {
	tYC = tYC+10;
	if (document.readyState === "complete") {
		readyMessageYC();
		clearInterval(readyStateCheckIntervalYCN);
	}else{
		if(tYC == 500){
			readyMessageYC();
			clearInterval(readyStateCheckIntervalYCN);
		}
	}
}, 10);



var IEBR = document.all?true:false;
var prevTarget = null;
var prevBackground = null;
var prevOpasity = null;
var prevFilter = null;

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

function backMessage(elementId) {
	if(beginpage || initialRecType == recType){
		var ie = navigator.userAgent.indexOf('MSIE') !=-1;
		if(ie){
			window.location.replace(window.location.href);
		}else{
			location.reload(true);
		}
	}else{
		recType = recType+1;
		showInfMessage();
		if(recType == 0){
			setMessageOnZero();
		}
	}
}

function setMessageOnZero(){
	var htmlEl =  document.getElementById("message_text").innerHTML;
	var indexToCut = htmlEl.indexOf('<input type');
	
	htmlEl = htmlEl.substring(0,indexToCut)+'<br/>\n'+getrecommendationScript()+
	htmlEl.substring(indexToCut);
	document.getElementById("message_text").innerHTML = htmlEl;
}

function readyMessageYC(){
	var destroyMessageYC = document.getElementById("destroy_messageYC2"); 
	var readyStateCheckIntervalYC= setInterval(function() {
		 if (destroyMessageYC != null && destroyMessageYC != '') {
			 afterLoadProductYC();
			 clearInterval(readyStateCheckIntervalYC);	 
		 }else{
			 destroyMessageYC=document.getElementById("destroy_messageYC2"); 
		 }
	}, 10);
}

function afterLoadProductYC(){
	var IEBR = document.all?true:false;
	var destroyMessageYC=document.getElementById("destroy_messageYC");
	var destroyMessageYC2=document.getElementById("destroy_messageYC2");
	var destroyMessageYC3=document.getElementById("destroy_messageYC3");
	
	var buttonCSS = "{height: 2em;" +
	"	width: 20%;	padding: 0 15px;	border: 1px solid rgba(216, 216, 216, 1);" +
	"	-moz-border-radius: 5px;	-webkit-border-radius: 5px; 	border-radius: 5px;" +
	"	font-weight: bold;	text-shadow: 0px -1px 0px rgba(0, 0, 0, 1);	-webkit-transition: all linear 0.2s;" +
	"	-moz-transition: all linear 0.2s;	-ms-transition: all linear 0.2s;	-o-transition: all linear 0.2s;" +
	"	transition: all linear 0.2s;	background-color: rgba(72, 80, 68, 1);" +
	"	background-image: -moz-linear-gradient(top, rgba(139, 149, 137, 1), rgba(72, 80, 68, 1));" +
	"	background-image: -webkit-gradient(linear, center top, center bottom, from(rgba(139, 149, 137, 1)), to(rgba(72, 80, 68, 1)));" +
	"	background-image: -o-linear-gradient(top, rgba(139, 149, 137, 1), rgba(72, 80, 68, 1));" +
	"	line-height: 30px;	color: rgba(146, 202, 255, 1);	font-size: 16px} " ;
	var buttonHover = "{  color: rgba(161, 238, 242, 1); background-color: rgba(0, 0, 0, 1); background-image: -moz-linear-gradient(top, rgba(139, 149, 137, 1), rgba(0, 0, 0, 1));" +
	" background-image: -webkit-gradient(linear, center top, center bottom, from(rgba(139, 149, 137, 1)), to(rgba(0, 0, 0, 1)));" +
	" background-image: -o-linear-gradient(top, rgba(139, 149, 137, 1), rgba(0, 0, 0, 1));}";
	var css = document.createElement("style");
	css.type = "text/css";
	css.innerHTML = "#destroy_messageYC2, #destroy_messageYC3, #destroy_messageYC4 "+buttonCSS+ 
					"td.destroy_message2 { text-align: center; }" +
					"#destroy_messageYC2:HOVER, #destroy_messageYC3:HOVER, #destroy_messageYC4:HOVER"+buttonHover;
	document.body.appendChild(css);
	
	
    if (!IEBR) {
    	document.addEventListener("mousemove",  getMouseXY, false);
    	document.addEventListener("mousedown",  getMouseDown, false);
    	destroyMessageYC.addEventListener("mousedown", function(event){
	    	fadeOutYC('messageYC');
	    });
    	destroyMessageYC2.addEventListener("mousedown", function(event){
	    	fadeOutYC('messageYC');
	    });
    	destroyMessageYC3.addEventListener("mousedown", function(event){
	    	backMessage('messageYC');
	    });
    	
    }else if (document.attachEvent){
    	document.attachEvent('onmousemove', getMouseXY);
    	document.attachEvent('onmousedown', getMouseDown);
    	destroyMessageYC.attachEvent("onmousedown", function(event){
    	    	fadeOutYC('messageYC');
    	    });
    	destroyMessageYC2.attachEvent("onmousedown", function(event){
	    	fadeOutYC('messageYC');
	    });
    	destroyMessageYC3.attachEvent("onmousedown", function(event){
    		backMessage('messageYC');
	    });
    }
   
   
   
    localizerEBL2();
	showInfMessage();
    
}

function getStringMessage(){
	if(recType == '1'){
		return "product_name";
	}else if(recType == '2'){
		return "product_image";
	}else if(recType == '3'){
		return  "product_price";
	}else if(recType == '0'){
		return  "script";
	}else{
		return  "thank_you";
	}
}

function updateValues(str,target){
	if(recType == '1'){
		titlePath = str;
		titleValue = target.innerHTML;
	}else if(recType == '2'){
		imgPath  = str;
		imgValue = target.src;
	}else if(recType == '3'){
		pricePath = str;
		priceValue = target.innerHTML;
	}
}

function showInfMessage(){
	setMessagePopUpJs("registration",getStringMessage());
}
var timerYC;
function blink(element) {
	var multOp = -0.05;
    var op = 1;  // initial opacity
   timerYC = setInterval(function () {
        if (op <= 0.1 || op > 1){
      
            multOp = multOp*(-1);
            
        }
        element.style.opacity = op;
        element.style.filter = 'alpha(opacity=' + op * 100 + ")";
        op = op + multOp;
    }, 50);
}


function getMouseDown(e) {
	var target;
	if (IEBR) { //if browser is IE
		target = e.srcElement;
		
	}
	else {  // if browser is NS
		target = e.target;
	}
	if(target == null || target.className == 'destroy_message' ||  target.className.indexOf('destroy_message2') != -1
		|| target.className == 'backgrounBlockerYC' || target.className == 'message registration'
			|| (target.parentNode != null && (target.parentNode.className == 'message registration'
			|| target.parentNode.parentNode!= null && (target.parentNode.parentNode.className == 'message registration'
				|| (target.parentNode.parentNode.parentNode!= null && target.parentNode.parentNode.parentNode.className == 'message registration'))))){
		return false;
	}
	if(recType<1){
		recType = -1;
		e.preventDefault();
		e.stopPropagation() ;
		e.cancelBubble = true;
		showPreview2(target);
		showInfMessage();
		
		//showInfMessage();
		return false;
	}else{
		beginpage = false;
		if(prevTarget == target){
			var parent = target.parentNode;
			var current = target;
			var str ='';
			while(parent != null){
				str=str+' '+ current.tagName;
				var chl = parent.childNodes;
				var j = 0;
				var i;
				for(i=0;i<chl.length;i++){
					if(chl[i] == current){
						str=str+':'+j;
					}else{
						if(chl[i].tagName == current.tagName){
							j=j+1;
						}
					}
				}
				current = parent;
				parent = parent.parentNode;
			}
			updateValues(str, target);
			//alert( str);
			if(initialRecType == -1){
				initialRecType = recType;
			}
			recType = recType -1;
			if(recType == 0){
				saveCrowlData();
			}
			showInfMessage();
			if(recType == 0){
				setMessageOnZero();
			}
			
	    }
	}
	
	return true;
}

function getrecommendationScript(){
	var freeEnvPrefix = '';
	if((window.location.origin+'').indexOf('free') == -1){
		freeEnvPrefix = '/ebl2';
	}
	var envYC = 'prod';
	if((window.location.origin+'').indexOf('dev') == -1){
		envYC = 'dev';
	}else if((window.location.origin+'').indexOf('test') == -1){
		envYC = 'test';
	}
	var ret = '<br/><textarea readonly dir="ltr" cols="65" rows="7" style="color: black; font-family:\'Courier New\'; font-size: 14px;'+
		'unicode-bidi: embed; resize: auto; cursor: auto; width: 80%; min-height: 120px;" >&lt;div id="YCRecos" style="display: none;"&gt;&lt;/div&gt;\n'+
			'&lt;script src="https://cdn.yoochoose.net/tracker.js">&lt;/script&gt;\n'+
			'&lt;script type="text/javascript"&gt;\n'+
			'	var manddatorId = "'+mandator+'";\n'+
			'	var envYC = "'+envYC+'";\n'+
			'	var recSize = "'+recSize+'";\n'+
			'	et_yc_click(manddatorId,recSize);\n'+
			'&lt;/script&gt;</textarea><br/><br/>';
	return ret;
}

function getMouseXY(e) {
	var target;
	if (IEBR) { // grab the x-y pos.s if browser is IE
		target = e.srcElement;
		
	}
	else {  // grab the x-y pos.s if browser is NS
		target = e.target;
	}
	if(target == null || target.className=='destroy_message' || target.className.indexOf('destroy_message2') != -1
		|| target.className == 'backgrounBlockerYC' || target.className == 'message registration'
			|| (target.parentNode != null && (target.parentNode.className == 'message registration'
			|| target.parentNode.parentNode!= null && target.parentNode.parentNode.className == 'message registration'))){
		return;
	}
	if(recType<1){
		if(prevBackground != null){
			//prevTarget.style.backgroundColor = prevBackground;
			prevTarget.style.outline = prevBackground;
			clearInterval(timerYC);
			prevTarget.style.opacity = prevOpasity;
			prevTarget.style.filter = prevFilter;
		}
		prevBackground = null;
	}else{
		if(prevTarget != target){
			if(prevBackground != null){
				//prevTarget.style.backgroundColor = prevBackground;
				prevTarget.style.outline = prevBackground;
				clearInterval(timerYC);
				prevTarget.style.opacity = prevOpasity;
				prevTarget.style.filter = prevFilter;
			}
			prevTarget = target;
			//prevBackground = target.style.backgroundColor;
			//target.style.backgroundColor = "#FDFF47";
			prevBackground = target.style.outline;
			prevOpasity = target.style.opacity;
			prevFilter = prevTarget.style.filter;
			target.style.outline = '#f00 solid 2px';
			blink(target);
			
			//highlight(target);
	     }
	}
	
	return true;
}