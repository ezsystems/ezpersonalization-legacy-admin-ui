/* css({'border-top':'5px solid red'}) */

	var in_to_language = "en";
	function getCookieYC(c_name)
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
	
	function setCookieYC(c_name,value,exdays)
	{
		var exdate=new Date();
		exdate.setDate(exdate.getDate() + exdays);
		var c_value=escape(value) + ((exdays==null) ? "" : "; expires="+exdate.toUTCString());
		document.cookie=c_name + "=" + c_value;
	}
  
	function localizerEBL2() {
	
	var storedLanguage = getCookieYC('language');
	if(storedLanguage != null)
	{
		if(storedLanguage != "" && (storedLanguage == "de" || storedLanguage == "en" || storedLanguage == "fr" ))
		{
			in_to_language = storedLanguage;
		}
		else
		{
			in_to_language = "en";
		}
	}
	else
	{
		var userLang = (navigator.language) ? navigator.language : navigator.userLanguage; 
		if(userLang != null){
			userLang = userLang.substr(0, 2);
		}
		if(userLang == "de" || userLang == "en" || userLang == "fr")
		{
			in_to_language = userLang;
		}
		else
		{
			in_to_language = "en";
		}
		setCookieYC('language', userLang,null);
	}
	
	var freeEnvPrefix = '';
	if((window.location.origin+'').indexOf('free') == -1){
		freeEnvPrefix = '/ebl2';
	}
	translate = {
	"en": { "product_name": "Please click on the name of the product",
			"product_image":"Please click on the product's image",
			"product_price": "Please click on the product's price",
			"script": "<b>Thank You! <br/> Please copy the following script and place it in every product page you want to get the recommendations</b> "+
			"<input type='button' class='ebl2Button' id='destroy_messageYC4' onclick='window.location.href=window.location.origin+\""+freeEnvPrefix+"/main.html\";' value='EXIT' style=\"width: 20%; height: 3em;\" /><br/>" +
			"If you want to see how the recommendations will look like on your page, please click on OK and then on any position on your page ",
			"thank_you": "If you want to see how the recommendations will look like on your page, please click on OK and then on any position on your page<br/><br/>" +
					"<input type='button' class='ebl2Button' onclick='window.location.href=window.location.origin+\""+freeEnvPrefix+"/main.html\";' value='EXIT' style=\"width: 20%; height: 3em;\" />",
			},
	"de": { "product_name": "Bitte klicken Sie auf den Produktnamen",
			"product_image":"Bitte klicken Sie auf das Produktbild",
			"product_price": "Bitte klicken Sie auf den Produktpeis",
			"script": "<b>Vielen Dank! <br/> Kopieren Sie bitte das folgende Skript und platzieren Sie es auf jeder Produkt-Seite, die Empfehlungen enthalten soll</b> "+
			"<input type='button' class='ebl2Button' id='destroy_messageYC4' onclick='window.location.href=window.location.origin+\""+freeEnvPrefix+"/main.html\";' value='EXIT' style=\"width: 20%; height: 3em;\"/><br/>" +
			"Wenn Sie sehen m&ouml;chten, wie die Empfehlungenauf Ihrer Seite aussehen werden, klicken Sie bitte auf OK und eine beliebige Stelle auf Ihrer Seite",
			"thank_you": "Wenn Sie sehen m&ouml;chten, wie die Empfehlungenauf Ihrer Seite aussehen werden, klicken Sie bitte auf OK und eine beliebige Stelle auf Ihrer Seite<br/><br/>" +
					"<input type='button' class='ebl2Button' onclick='window.location.href=window.location.origin+\""+freeEnvPrefix+"/main.html\";' value='EXIT' style=\"width: 20%; height: 3em;\" />",
		},
	"fr": { "product_name": "S'il vous pla&icirc;t cliquer sur le nom du produit",
			"product_image":"S'il vous pla&icirc;t cliquer sur l'image du produit",
			"product_price": "S'il vous pla&icirc;t cliquer sur le prix du produit",
			"script": "<b>Merci! <br/> Veuillez copier le script suivant et le placer dans chaque produit-page que vous souhaitez obtenir des recommandations</b>"+
			"<input type='button' class='ebl2Button' id='destroy_messageYC4' onclick='window.location.href=window.location.origin+\""+freeEnvPrefix+"/main.html\";' value='EXIT'/ style=\"width: 20%; height: 3em;\"><br/>" +
			"Si vous voulez voir comment les recommandations vont ressembler sur votre page, s'il vous pla&icirc;t cliquez sur OK, puis sur n'importe quelle position sur votre page",
			"thank_you": "Si vous voulez voir comment les recommandations vont ressembler sur votre page, s'il vous pla&icirc;t cliquez sur OK, puis sur n'importe quelle position sur votre page<br/><br/>" +
					"<input type='button' class='ebl2Button' onclick='window.location.href=window.location.origin+\""+freeEnvPrefix+"/main.html\";' value='EXIT' style=\"width: 20%; height: 3em;\" />",
		}};
	
    var containers =  document.getElementById("message_text");
    var term = containers.getAttribute("data-translate");
      //var translation = translate[term][in_to_language];
    if(term != null){
		var translation = translate[in_to_language][term];
		if (typeof translation == 'undefined')
		{
			translation = 'missing_translation_for_'+term;
		}
		  
		containers.innerHTML = translation;
	}
    
  }
// just bla bla 
	//just bla bla
	// just bla bla
  
