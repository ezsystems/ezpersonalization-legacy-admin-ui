 var reference_code = gup('reference_code');
 var customerID = gup('customer_id');
 var outputtypes = gup('outputtypes');
 var inputtype = gup('inputtype');
 
 
 $(document).ready(function() {
	 
	  setLoadingDiv($('body'));
	  	  
	  $.when(
		  initialize_configurator_header(null, "preview_send"),
		  include(["/js/dao/scenario.js"]).then(function() {
			  return scenarioDao.init(customerID, reference_code);
	  	  })
      ).done(function() {
    	  unsetLoadingDiv($('body'));
		  initialize();  
	  });
 });
 
	
 var initialize = function() {

	  var outputArray = scenarioDao.scenario.outputItemTypes;
	  
	  
	  $('#output_type').children('option').each(function(index){
		  if(index != 0){
				if( $.inArray(parseInt($(this).val()), outputArray) == -1){
					$(this).hide();
				}
		  }
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
		  if(changeTop()){
			  getCallId();
		  }
	  });
	  initHelpBtn();
	  
	  $("#scenario_title").attr('value', scenarioDao.scenario.title ? scenarioDao.scenario.title : reference_code);
  };
  
  
  /**
   * retrieves a item from server with given Id
   * @param id
   * @returns {*}
   */
  function getItems(type, ids,jsonToshow) {
	  $.ajax({
		  dataType: "json",
		  beforeSend: function(req) {
			  req.setRequestHeader('no-realm', 'realm1');
		  },
		  url: "ebl/v4/" + customerID + "/elist/get_list_items/" + encodeURIComponent(type) + '/' + ids,
		  success: function(json) {
			var list = jsonToshow.recommendationResponseList;
			for(var i in list){
				var id = list[i].itemId;
				for(var j in json){
					var id2 = json[j].id;
					if(id == id2){
						console.log("found id ="+id);
						var title = json[j].title;
						if(title !=null){
							list[i].title = title;
						}
						var price = json[j].price;
						if(price !=null){
							var amount = price.value;
							if(amount != null){
								list[i].price = amount+" "+price.currency;
							}
						}
					 }
				}	
			}
			console.log("json="+JSON.stringify(jsonToshow));
			showJson(jsonToshow);
		  }
	 });
  };
 
  function showWithTitles(json){
		var list = json.recommendationResponseList;
		var it = inputtype;
		if(it == null || it == ''){
			it = 1;
		}
		var ids ='';
		for(var i in list){
			var id = list[i].itemId;
			ids += id+",";
		}
		if(ids.length > 0){
			ids = ids.substring(0, ids.length-1);
		}
		getItems(it, ids, json);
	}
  
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
	  $('.error').attr('data-translate', error);
	  $('.validation_message').show();
	  localizer();
  }
  
  function getCallId(){
		var url = getCallSrc().replace('jsonp','json');
		$('#urlid').text(url);
  }
  
  function changeTop(){
	  var topn = $('#top_n').val();
	  if(! topn.length) {
		  showError('editorial_list_error_empty_id_field');
		  return false;
	  }
	  //test if the id contains just digits
	  if(/\D/.test(topn)) {
		  //we have non digits in the field
		  showError('editorial_list_error_invalid_id');
		  return false;
	  }
	  topn = parseInt(topn, 10);
	  if(topn > 50 || id < 1) {
		  showError('editorial_list_error_id_out_of_bounds');
		  return false;
	  }
	  
	  return true;
  }
  
  
  function getCallSrc(){
	  	var userId = $('#user_id').val();
	  	var outputtype = $('#output_type').val();
	  	var topn = $('#top_n').val();
		var customerID = $.cookie('customerID');
		var cur_host = window.location.host;
		var dev = 'cat.dev';
		var dev2 = 'development';
	    var test = '.test.';
	    var recoHost ='';
	    console.log(cur_host);
		if(cur_host.indexOf(dev)!=-1 ){
			recoHost = 'http://cat.development.yoochoose.com:8080/recocontroller';
		}else{
			if(cur_host.indexOf(dev2)!=-1 ){
				recoHost = 'http://admin.development.yoochoose.com:8080/recocontroller';
			}else{
				if(cur_host.indexOf(test)!=-1 ){
					recoHost = 'https://reco.test.yoochoose.net';
				}else{
					recoHost = 'https://reco.yoochoose.net';
				}
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
		if(!changeTop()){
			return;
		}
		
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
	showJson(json);
	showWithTitles(json);
	
}



function showJson(json){
	var strjs = JSON.stringify(json,null,'&nbsp;');
	strjs = strjs.replace(/,/g , ",<br/>");
	strjs = strjs.replace(/}/g , "<br/>}");
	strjs = strjs.replace(/{/g , "{<br/>");
	strjs = strjs.replace("[" , "[<br/>");
	strjs = strjs.replace("]" , "<br/>]");
	
	$("#prettyprint").html(strjs);
	$("#prettyprint").removeClass("prettyprinted"); 
	prettyPrint();
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




 

