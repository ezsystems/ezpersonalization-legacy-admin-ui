 var reference_code = gup('reference_code');
 var customerID = gup('customer_id');
 var outputtypes = gup('outputtypes');
 var showdelete = false;
  
  $(document).ready(function() {
	  window.parent.$("#contentFrame").height( '100%');
	  $('.settings_tab').find('a').attr('href', 'settingspop.html?reference_code=' + reference_code + '&customer_id=' + customerID);
	  $('.configurator_tab').find('a').attr("href", "configuratorpop.html?reference_code=" + reference_code + "&customer_id=" + customerID);
	 

	  var outputArray = outputtypes.split(',');
	  $('#output_type').children('option').each(function(index){
		  if(index != 0){
				if( $.inArray($(this).val(), outputArray) == -1){
					$(this).hide();
				}
		  }
		});
	  
	  $(document).click(function(e){
			var tid = e.target.id;
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
			deleteScenario();
		});
	  

	  $("#button_save").click(function() {

		  call_recs();

	  });
	  
	  $('#addItem').click(function() {
		  addItem();
		  getCallId();
	  });
	  $('#user_id').val('someuser');
	  getCallId($('#user_id').val());
	  $('#user_id').change(function(){
		  getCallId();
	  });
	  $('#output_type').change(function(){
		  getCallId();
	  });
	  $('#top_n').change(function(){
		  getCallId();
	  });
	  initHelpBtn();
	  
	  $.ajax({
		  dataType: "json",
		  beforeSend: function(req) {
			  req.setRequestHeader('no-realm', 'realm1');
		  },
		  url: "ebl/v3/" + customerID + "/structure/get_scenario/" + reference_code,
		  success: function(json) {
			  if(json.scenario.title == null || json.scenario.title == "") {
				  $("#scenario_title").attr('placeholder',reference_code);
				 
			  }
			  else {
				 $("#scenario_title").attr('placeholder',json.scenario.title);
			  }
		  }
		  });
	 
  });
  
  
 
  
  function addItem(){
	  var id = $('#itemId').val();
	  if(! id.length) {
		  showError('editorial_list_error_empty_id_field');
		  return;
	  }
	  //test if the id contains just digits
	  if(/\D/.test(id)) {
		  //we have non digits in the field
		  showError('editorial_list_error_invalid_id');
		  return;
	  }
	  id = parseInt(id, 10);
	  if(id > 2147483647 || id < 0) {
		  showError('editorial_list_error_id_out_of_bounds');
		  return;
	  }
	  $('.validation_message').hide();
	  var items = $('#context_items');
	  if(items.val()!=null && items.val()!=''){
		  items.val(items.val()+','+id); 
	  }else{
		  items.val(id);  
	  }
	  $('#itemId').val('');
  }
  
  function showError(error){
	  $('.annotation').attr('data-translate', error);
	  $('.validation_message').show();
	  localizer();
  }
  
  function getCallId(){
		var url = getCallSrc().replace('jsonp','json');
		$('#urlid').text(url);
  }
  
  function getCallSrc(){
	  	var userId = $('#user_id').val();
	  	var outputtype = $('#output_type').val();
	  	var topn = $('#top_n').val();
		var customerID = $.cookie('customerID');
		var cur_host = window.location.host;
		var dev = 'cat.dev';
	    var test = '.test.';
	    var recoHost ='';
		if(cur_host.indexOf(dev)!=-1 ){
			recoHost = 'http://cat.development.yoochoose.com:8080/recocontroller';
		}else{
			if(cur_host.indexOf(test)!=-1 ){
				recoHost = 'https://reco.test.yoochoose.net';
			}else{
				recoHost = 'https://reco.yoochoose.net';
			}
		}
		var scriptSrc = recoHost+'/ebh/'+customerID+'/'+userId+'/'+reference_code+'.jsonp';
		var items = $('#context_items');
		
		if(items.val()!=null && items.val()!=''){
			scriptSrc += '?contextitems='+items.val()+'&numrecs='+topn; 
		}else{
			scriptSrc += '?numrecs='+topn; 
		}
		if(outputtype > 0){
			scriptSrc += '&outputtype='+outputtype;
		}
		return scriptSrc;
  }
  
  function call_recs(){
		
		
		var scriptSrc = getCallSrc();
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
  
function jsonpCallback(json){
	var strjs = JSON.stringify(json,null,'&nbsp;');
	strjs = strjs.replace(/,/g , ",<br/>");
	strjs = strjs.replace(/}/g , "<br/>}");
	strjs = strjs.replace(/{/g , "{<br/>");
	strjs = strjs.replace("[" , "[<br/>");
	strjs = strjs.replace("]" , "<br/>]");
	console.log("json="+JSON.stringify(strjs));
	$("#prettyprint").html(strjs);
	$("#prettyprint").removeClass("prettyprinted"); 
	prettyPrint();
	
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
  

  //ajax request for the right section



  function stdAjaxErrorHandler(jqXHR, textStatus, errorThrown) {
	  if(jqXHR.status != null && jqXHR.status == 403) {
		  setMessagePopUp("problem", "error_server_error_403");
	  }
	  else if(jqXHR.status != null && jqXHR.status == 401) {
		  setMessagePopUp("problem", "error_server_error_401");
	  }
	  else if(jqXHR.status != null && jqXHR.status == 400) {
		  setMessagePopUp("problem", "error_server_error_400");
	  }
	  else if(jqXHR.status != null && jqXHR.status == 404) {
		  setMessagePopUp("problem", "error_server_error_404");
	  }
	  else if(jqXHR.status != null && jqXHR.status == 409) {
		  setMessagePopUp("problem", "error_server_error_409");
	  }
	  else {
		  setMessagePopUp("problem", "error_server_error");
	  }
  }




 

