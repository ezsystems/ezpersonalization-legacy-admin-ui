angular
  .module('bookingApp', ['ui.bootstrap', 'ngResource', 'ui.mask', 'angularPayments'])
.controller('bookingCtrl', ['$scope',  '$resource', function($scope, $resource){
  var self = this;
  //$scope.countries = [{"name":"Afghanistan","alpha-2":"AF","country-code":"004"},{"name":"Åland Islands","alpha-2":"AX","country-code":"248"},{"name":"Albania","alpha-2":"AL","country-code":"008"},{"name":"Algeria","alpha-2":"DZ","country-code":"012"},{"name":"American Samoa","alpha-2":"AS","country-code":"016"},{"name":"Andorra","alpha-2":"AD","country-code":"020"},{"name":"Angola","alpha-2":"AO","country-code":"024"},{"name":"Anguilla","alpha-2":"AI","country-code":"660"},{"name":"Antarctica","alpha-2":"AQ","country-code":"010"},{"name":"Antigua and Barbuda","alpha-2":"AG","country-code":"028"},{"name":"Argentina","alpha-2":"AR","country-code":"032"},{"name":"Armenia","alpha-2":"AM","country-code":"051"},{"name":"Aruba","alpha-2":"AW","country-code":"533"},{"name":"Australia","alpha-2":"AU","country-code":"036"},{"name":"Austria","alpha-2":"AT","country-code":"040"},{"name":"Azerbaijan","alpha-2":"AZ","country-code":"031"},{"name":"Bahamas","alpha-2":"BS","country-code":"044"},{"name":"Bahrain","alpha-2":"BH","country-code":"048"},{"name":"Bangladesh","alpha-2":"BD","country-code":"050"},{"name":"Barbados","alpha-2":"BB","country-code":"052"},{"name":"Belarus","alpha-2":"BY","country-code":"112"},{"name":"Belgium","alpha-2":"BE","country-code":"056"},{"name":"Belize","alpha-2":"BZ","country-code":"084"},{"name":"Benin","alpha-2":"BJ","country-code":"204"},{"name":"Bermuda","alpha-2":"BM","country-code":"060"},{"name":"Bhutan","alpha-2":"BT","country-code":"064"},{"name":"Bolivia, Plurinational State of","alpha-2":"BO","country-code":"068"},{"name":"Bonaire, Sint Eustatius and Saba","alpha-2":"BQ","country-code":"535"},{"name":"Bosnia and Herzegovina","alpha-2":"BA","country-code":"070"},{"name":"Botswana","alpha-2":"BW","country-code":"072"},{"name":"Bouvet Island","alpha-2":"BV","country-code":"074"},{"name":"Brazil","alpha-2":"BR","country-code":"076"},{"name":"British Indian Ocean Territory","alpha-2":"IO","country-code":"086"},{"name":"Brunei Darussalam","alpha-2":"BN","country-code":"096"},{"name":"Bulgaria","alpha-2":"BG","country-code":"100"},{"name":"Burkina Faso","alpha-2":"BF","country-code":"854"},{"name":"Burundi","alpha-2":"BI","country-code":"108"},{"name":"Cambodia","alpha-2":"KH","country-code":"116"},{"name":"Cameroon","alpha-2":"CM","country-code":"120"},{"name":"Canada","alpha-2":"CA","country-code":"124"},{"name":"Cape Verde","alpha-2":"CV","country-code":"132"},{"name":"Cayman Islands","alpha-2":"KY","country-code":"136"},{"name":"Central African Republic","alpha-2":"CF","country-code":"140"},{"name":"Chad","alpha-2":"TD","country-code":"148"},{"name":"Chile","alpha-2":"CL","country-code":"152"},{"name":"China","alpha-2":"CN","country-code":"156"},{"name":"Christmas Island","alpha-2":"CX","country-code":"162"},{"name":"Cocos (Keeling) Islands","alpha-2":"CC","country-code":"166"},{"name":"Colombia","alpha-2":"CO","country-code":"170"},{"name":"Comoros","alpha-2":"KM","country-code":"174"},{"name":"Congo","alpha-2":"CG","country-code":"178"},{"name":"Congo, the Democratic Republic of the","alpha-2":"CD","country-code":"180"},{"name":"Cook Islands","alpha-2":"CK","country-code":"184"},{"name":"Costa Rica","alpha-2":"CR","country-code":"188"},{"name":"Côte d'Ivoire","alpha-2":"CI","country-code":"384"},{"name":"Croatia","alpha-2":"HR","country-code":"191"},{"name":"Cuba","alpha-2":"CU","country-code":"192"},{"name":"Curaçao","alpha-2":"CW","country-code":"531"},{"name":"Cyprus","alpha-2":"CY","country-code":"196"},{"name":"Czech Republic","alpha-2":"CZ","country-code":"203"},{"name":"Denmark","alpha-2":"DK","country-code":"208"},{"name":"Djibouti","alpha-2":"DJ","country-code":"262"},{"name":"Dominica","alpha-2":"DM","country-code":"212"},{"name":"Dominican Republic","alpha-2":"DO","country-code":"214"},{"name":"Ecuador","alpha-2":"EC","country-code":"218"},{"name":"Egypt","alpha-2":"EG","country-code":"818"},{"name":"El Salvador","alpha-2":"SV","country-code":"222"},{"name":"Equatorial Guinea","alpha-2":"GQ","country-code":"226"},{"name":"Eritrea","alpha-2":"ER","country-code":"232"},{"name":"Estonia","alpha-2":"EE","country-code":"233"},{"name":"Ethiopia","alpha-2":"ET","country-code":"231"},{"name":"Falkland Islands (Malvinas)","alpha-2":"FK","country-code":"238"},{"name":"Faroe Islands","alpha-2":"FO","country-code":"234"},{"name":"Fiji","alpha-2":"FJ","country-code":"242"},{"name":"Finland","alpha-2":"FI","country-code":"246"},{"name":"France","alpha-2":"FR","country-code":"250"},{"name":"French Guiana","alpha-2":"GF","country-code":"254"},{"name":"French Polynesia","alpha-2":"PF","country-code":"258"},{"name":"French Southern Territories","alpha-2":"TF","country-code":"260"},{"name":"Gabon","alpha-2":"GA","country-code":"266"},{"name":"Gambia","alpha-2":"GM","country-code":"270"},{"name":"Georgia","alpha-2":"GE","country-code":"268"},{"name":"Germany","alpha-2":"DE","country-code":"276"},{"name":"Ghana","alpha-2":"GH","country-code":"288"},{"name":"Gibraltar","alpha-2":"GI","country-code":"292"},{"name":"Greece","alpha-2":"GR","country-code":"300"},{"name":"Greenland","alpha-2":"GL","country-code":"304"},{"name":"Grenada","alpha-2":"GD","country-code":"308"},{"name":"Guadeloupe","alpha-2":"GP","country-code":"312"},{"name":"Guam","alpha-2":"GU","country-code":"316"},{"name":"Guatemala","alpha-2":"GT","country-code":"320"},{"name":"Guernsey","alpha-2":"GG","country-code":"831"},{"name":"Guinea","alpha-2":"GN","country-code":"324"},{"name":"Guinea-Bissau","alpha-2":"GW","country-code":"624"},{"name":"Guyana","alpha-2":"GY","country-code":"328"},{"name":"Haiti","alpha-2":"HT","country-code":"332"},{"name":"Heard Island and McDonald Islands","alpha-2":"HM","country-code":"334"},{"name":"Holy See (Vatican City State)","alpha-2":"VA","country-code":"336"},{"name":"Honduras","alpha-2":"HN","country-code":"340"},{"name":"Hong Kong","alpha-2":"HK","country-code":"344"},{"name":"Hungary","alpha-2":"HU","country-code":"348"},{"name":"Iceland","alpha-2":"IS","country-code":"352"},{"name":"India","alpha-2":"IN","country-code":"356"},{"name":"Indonesia","alpha-2":"ID","country-code":"360"},{"name":"Iran, Islamic Republic of","alpha-2":"IR","country-code":"364"},{"name":"Iraq","alpha-2":"IQ","country-code":"368"},{"name":"Ireland","alpha-2":"IE","country-code":"372"},{"name":"Isle of Man","alpha-2":"IM","country-code":"833"},{"name":"Israel","alpha-2":"IL","country-code":"376"},{"name":"Italy","alpha-2":"IT","country-code":"380"},{"name":"Jamaica","alpha-2":"JM","country-code":"388"},{"name":"Japan","alpha-2":"JP","country-code":"392"},{"name":"Jersey","alpha-2":"JE","country-code":"832"},{"name":"Jordan","alpha-2":"JO","country-code":"400"},{"name":"Kazakhstan","alpha-2":"KZ","country-code":"398"},{"name":"Kenya","alpha-2":"KE","country-code":"404"},{"name":"Kiribati","alpha-2":"KI","country-code":"296"},{"name":"Korea, Democratic People's Republic of","alpha-2":"KP","country-code":"408"},{"name":"Korea, Republic of","alpha-2":"KR","country-code":"410"},{"name":"Kuwait","alpha-2":"KW","country-code":"414"},{"name":"Kyrgyzstan","alpha-2":"KG","country-code":"417"},{"name":"Lao People's Democratic Republic","alpha-2":"LA","country-code":"418"},{"name":"Latvia","alpha-2":"LV","country-code":"428"},{"name":"Lebanon","alpha-2":"LB","country-code":"422"},{"name":"Lesotho","alpha-2":"LS","country-code":"426"},{"name":"Liberia","alpha-2":"LR","country-code":"430"},{"name":"Libya","alpha-2":"LY","country-code":"434"},{"name":"Liechtenstein","alpha-2":"LI","country-code":"438"},{"name":"Lithuania","alpha-2":"LT","country-code":"440"},{"name":"Luxembourg","alpha-2":"LU","country-code":"442"},{"name":"Macao","alpha-2":"MO","country-code":"446"},{"name":"Macedonia, the former Yugoslav Republic of","alpha-2":"MK","country-code":"807"},{"name":"Madagascar","alpha-2":"MG","country-code":"450"},{"name":"Malawi","alpha-2":"MW","country-code":"454"},{"name":"Malaysia","alpha-2":"MY","country-code":"458"},{"name":"Maldives","alpha-2":"MV","country-code":"462"},{"name":"Mali","alpha-2":"ML","country-code":"466"},{"name":"Malta","alpha-2":"MT","country-code":"470"},{"name":"Marshall Islands","alpha-2":"MH","country-code":"584"},{"name":"Martinique","alpha-2":"MQ","country-code":"474"},{"name":"Mauritania","alpha-2":"MR","country-code":"478"},{"name":"Mauritius","alpha-2":"MU","country-code":"480"},{"name":"Mayotte","alpha-2":"YT","country-code":"175"},{"name":"Mexico","alpha-2":"MX","country-code":"484"},{"name":"Micronesia, Federated States of","alpha-2":"FM","country-code":"583"},{"name":"Moldova, Republic of","alpha-2":"MD","country-code":"498"},{"name":"Monaco","alpha-2":"MC","country-code":"492"},{"name":"Mongolia","alpha-2":"MN","country-code":"496"},{"name":"Montenegro","alpha-2":"ME","country-code":"499"},{"name":"Montserrat","alpha-2":"MS","country-code":"500"},{"name":"Morocco","alpha-2":"MA","country-code":"504"},{"name":"Mozambique","alpha-2":"MZ","country-code":"508"},{"name":"Myanmar","alpha-2":"MM","country-code":"104"},{"name":"Namibia","alpha-2":"NA","country-code":"516"},{"name":"Nauru","alpha-2":"NR","country-code":"520"},{"name":"Nepal","alpha-2":"NP","country-code":"524"},{"name":"Netherlands","alpha-2":"NL","country-code":"528"},{"name":"New Caledonia","alpha-2":"NC","country-code":"540"},{"name":"New Zealand","alpha-2":"NZ","country-code":"554"},{"name":"Nicaragua","alpha-2":"NI","country-code":"558"},{"name":"Niger","alpha-2":"NE","country-code":"562"},{"name":"Nigeria","alpha-2":"NG","country-code":"566"},{"name":"Niue","alpha-2":"NU","country-code":"570"},{"name":"Norfolk Island","alpha-2":"NF","country-code":"574"},{"name":"Northern Mariana Islands","alpha-2":"MP","country-code":"580"},{"name":"Norway","alpha-2":"NO","country-code":"578"},{"name":"Oman","alpha-2":"OM","country-code":"512"},{"name":"Pakistan","alpha-2":"PK","country-code":"586"},{"name":"Palau","alpha-2":"PW","country-code":"585"},{"name":"Palestine, State of","alpha-2":"PS","country-code":"275"},{"name":"Panama","alpha-2":"PA","country-code":"591"},{"name":"Papua New Guinea","alpha-2":"PG","country-code":"598"},{"name":"Paraguay","alpha-2":"PY","country-code":"600"},{"name":"Peru","alpha-2":"PE","country-code":"604"},{"name":"Philippines","alpha-2":"PH","country-code":"608"},{"name":"Pitcairn","alpha-2":"PN","country-code":"612"},{"name":"Poland","alpha-2":"PL","country-code":"616"},{"name":"Portugal","alpha-2":"PT","country-code":"620"},{"name":"Puerto Rico","alpha-2":"PR","country-code":"630"},{"name":"Qatar","alpha-2":"QA","country-code":"634"},{"name":"Réunion","alpha-2":"RE","country-code":"638"},{"name":"Romania","alpha-2":"RO","country-code":"642"},{"name":"Russian Federation","alpha-2":"RU","country-code":"643"},{"name":"Rwanda","alpha-2":"RW","country-code":"646"},{"name":"Saint Barthélemy","alpha-2":"BL","country-code":"652"},{"name":"Saint Helena, Ascension and Tristan da Cunha","alpha-2":"SH","country-code":"654"},{"name":"Saint Kitts and Nevis","alpha-2":"KN","country-code":"659"},{"name":"Saint Lucia","alpha-2":"LC","country-code":"662"},{"name":"Saint Martin (French part)","alpha-2":"MF","country-code":"663"},{"name":"Saint Pierre and Miquelon","alpha-2":"PM","country-code":"666"},{"name":"Saint Vincent and the Grenadines","alpha-2":"VC","country-code":"670"},{"name":"Samoa","alpha-2":"WS","country-code":"882"},{"name":"San Marino","alpha-2":"SM","country-code":"674"},{"name":"Sao Tome and Principe","alpha-2":"ST","country-code":"678"},{"name":"Saudi Arabia","alpha-2":"SA","country-code":"682"},{"name":"Senegal","alpha-2":"SN","country-code":"686"},{"name":"Serbia","alpha-2":"RS","country-code":"688"},{"name":"Seychelles","alpha-2":"SC","country-code":"690"},{"name":"Sierra Leone","alpha-2":"SL","country-code":"694"},{"name":"Singapore","alpha-2":"SG","country-code":"702"},{"name":"Sint Maarten (Dutch part)","alpha-2":"SX","country-code":"534"},{"name":"Slovakia","alpha-2":"SK","country-code":"703"},{"name":"Slovenia","alpha-2":"SI","country-code":"705"},{"name":"Solomon Islands","alpha-2":"SB","country-code":"090"},{"name":"Somalia","alpha-2":"SO","country-code":"706"},{"name":"South Africa","alpha-2":"ZA","country-code":"710"},{"name":"South Georgia and the South Sandwich Islands","alpha-2":"GS","country-code":"239"},{"name":"South Sudan","alpha-2":"SS","country-code":"728"},{"name":"Spain","alpha-2":"ES","country-code":"724"},{"name":"Sri Lanka","alpha-2":"LK","country-code":"144"},{"name":"Sudan","alpha-2":"SD","country-code":"729"},{"name":"Suriname","alpha-2":"SR","country-code":"740"},{"name":"Svalbard and Jan Mayen","alpha-2":"SJ","country-code":"744"},{"name":"Swaziland","alpha-2":"SZ","country-code":"748"},{"name":"Sweden","alpha-2":"SE","country-code":"752"},{"name":"Switzerland","alpha-2":"CH","country-code":"756"},{"name":"Syrian Arab Republic","alpha-2":"SY","country-code":"760"},{"name":"Taiwan, Province of China","alpha-2":"TW","country-code":"158"},{"name":"Tajikistan","alpha-2":"TJ","country-code":"762"},{"name":"Tanzania, United Republic of","alpha-2":"TZ","country-code":"834"},{"name":"Thailand","alpha-2":"TH","country-code":"764"},{"name":"Timor-Leste","alpha-2":"TL","country-code":"626"},{"name":"Togo","alpha-2":"TG","country-code":"768"},{"name":"Tokelau","alpha-2":"TK","country-code":"772"},{"name":"Tonga","alpha-2":"TO","country-code":"776"},{"name":"Trinidad and Tobago","alpha-2":"TT","country-code":"780"},{"name":"Tunisia","alpha-2":"TN","country-code":"788"},{"name":"Turkey","alpha-2":"TR","country-code":"792"},{"name":"Turkmenistan","alpha-2":"TM","country-code":"795"},{"name":"Turks and Caicos Islands","alpha-2":"TC","country-code":"796"},{"name":"Tuvalu","alpha-2":"TV","country-code":"798"},{"name":"Uganda","alpha-2":"UG","country-code":"800"},{"name":"Ukraine","alpha-2":"UA","country-code":"804"},{"name":"United Arab Emirates","alpha-2":"AE","country-code":"784"},{"name":"United Kingdom","alpha-2":"GB","country-code":"826"},{"name":"United States","alpha-2":"US","country-code":"840"},{"name":"United States Minor Outlying Islands","alpha-2":"UM","country-code":"581"},{"name":"Uruguay","alpha-2":"UY","country-code":"858"},{"name":"Uzbekistan","alpha-2":"UZ","country-code":"860"},{"name":"Vanuatu","alpha-2":"VU","country-code":"548"},{"name":"Venezuela, Bolivarian Republic of","alpha-2":"VE","country-code":"862"},{"name":"Viet Nam","alpha-2":"VN","country-code":"704"},{"name":"Virgin Islands, British","alpha-2":"VG","country-code":"092"},{"name":"Virgin Islands, U.S.","alpha-2":"VI","country-code":"850"},{"name":"Wallis and Futuna","alpha-2":"WF","country-code":"876"},{"name":"Western Sahara","alpha-2":"EH","country-code":"732"},{"name":"Yemen","alpha-2":"YE","country-code":"887"},{"name":"Zambia","alpha-2":"ZM","country-code":"894"},{"name":"Zimbabwe","alpha-2":"ZW","country-code":"716"}];
  $scope.countries = [{"name":"Afghanistan","a2":"AF","country-code":"004"},{"name":"Åland Islands","a2":"AX","country-code":"248"},{"name":"Albania","a2":"AL","country-code":"008"},{"name":"Algeria","a2":"DZ","country-code":"012"},{"name":"American Samoa","a2":"AS","country-code":"016"},{"name":"Andorra","a2":"AD","country-code":"020"},{"name":"Angola","a2":"AO","country-code":"024"},{"name":"Anguilla","a2":"AI","country-code":"660"},{"name":"Antarctica","a2":"AQ","country-code":"010"},{"name":"Antigua and Barbuda","a2":"AG","country-code":"028"},{"name":"Argentina","a2":"AR","country-code":"032"},{"name":"Armenia","a2":"AM","country-code":"051"},{"name":"Aruba","a2":"AW","country-code":"533"},{"name":"Australia","a2":"AU","country-code":"036"},{"name":"Austria","a2":"AT","country-code":"040"},{"name":"Azerbaijan","a2":"AZ","country-code":"031"},{"name":"Bahamas","a2":"BS","country-code":"044"},{"name":"Bahrain","a2":"BH","country-code":"048"},{"name":"Bangladesh","a2":"BD","country-code":"050"},{"name":"Barbados","a2":"BB","country-code":"052"},{"name":"Belarus","a2":"BY","country-code":"112"},{"name":"Belgium","a2":"BE","country-code":"056"},{"name":"Belize","a2":"BZ","country-code":"084"},{"name":"Benin","a2":"BJ","country-code":"204"},{"name":"Bermuda","a2":"BM","country-code":"060"},{"name":"Bhutan","a2":"BT","country-code":"064"},{"name":"Bolivia, Plurinational State of","a2":"BO","country-code":"068"},{"name":"Bonaire, Sint Eustatius and Saba","a2":"BQ","country-code":"535"},{"name":"Bosnia and Herzegovina","a2":"BA","country-code":"070"},{"name":"Botswana","a2":"BW","country-code":"072"},{"name":"Bouvet Island","a2":"BV","country-code":"074"},{"name":"Brazil","a2":"BR","country-code":"076"},{"name":"British Indian Ocean Territory","a2":"IO","country-code":"086"},{"name":"Brunei Darussalam","a2":"BN","country-code":"096"},{"name":"Bulgaria","a2":"BG","country-code":"100"},{"name":"Burkina Faso","a2":"BF","country-code":"854"},{"name":"Burundi","a2":"BI","country-code":"108"},{"name":"Cambodia","a2":"KH","country-code":"116"},{"name":"Cameroon","a2":"CM","country-code":"120"},{"name":"Canada","a2":"CA","country-code":"124"},{"name":"Cape Verde","a2":"CV","country-code":"132"},{"name":"Cayman Islands","a2":"KY","country-code":"136"},{"name":"Central African Republic","a2":"CF","country-code":"140"},{"name":"Chad","a2":"TD","country-code":"148"},{"name":"Chile","a2":"CL","country-code":"152"},{"name":"China","a2":"CN","country-code":"156"},{"name":"Christmas Island","a2":"CX","country-code":"162"},{"name":"Cocos (Keeling) Islands","a2":"CC","country-code":"166"},{"name":"Colombia","a2":"CO","country-code":"170"},{"name":"Comoros","a2":"KM","country-code":"174"},{"name":"Congo","a2":"CG","country-code":"178"},{"name":"Congo, the Democratic Republic of the","a2":"CD","country-code":"180"},{"name":"Cook Islands","a2":"CK","country-code":"184"},{"name":"Costa Rica","a2":"CR","country-code":"188"},{"name":"Côte d'Ivoire","a2":"CI","country-code":"384"},{"name":"Croatia","a2":"HR","country-code":"191"},{"name":"Cuba","a2":"CU","country-code":"192"},{"name":"Curaçao","a2":"CW","country-code":"531"},{"name":"Cyprus","a2":"CY","country-code":"196"},{"name":"Czech Republic","a2":"CZ","country-code":"203"},{"name":"Denmark","a2":"DK","country-code":"208"},{"name":"Djibouti","a2":"DJ","country-code":"262"},{"name":"Dominica","a2":"DM","country-code":"212"},{"name":"Dominican Republic","a2":"DO","country-code":"214"},{"name":"Ecuador","a2":"EC","country-code":"218"},{"name":"Egypt","a2":"EG","country-code":"818"},{"name":"El Salvador","a2":"SV","country-code":"222"},{"name":"Equatorial Guinea","a2":"GQ","country-code":"226"},{"name":"Eritrea","a2":"ER","country-code":"232"},{"name":"Estonia","a2":"EE","country-code":"233"},{"name":"Ethiopia","a2":"ET","country-code":"231"},{"name":"Falkland Islands (Malvinas)","a2":"FK","country-code":"238"},{"name":"Faroe Islands","a2":"FO","country-code":"234"},{"name":"Fiji","a2":"FJ","country-code":"242"},{"name":"Finland","a2":"FI","country-code":"246"},{"name":"France","a2":"FR","country-code":"250"},{"name":"French Guiana","a2":"GF","country-code":"254"},{"name":"French Polynesia","a2":"PF","country-code":"258"},{"name":"French Southern Territories","a2":"TF","country-code":"260"},{"name":"Gabon","a2":"GA","country-code":"266"},{"name":"Gambia","a2":"GM","country-code":"270"},{"name":"Georgia","a2":"GE","country-code":"268"},{"name":"Germany","a2":"DE","country-code":"276"},{"name":"Ghana","a2":"GH","country-code":"288"},{"name":"Gibraltar","a2":"GI","country-code":"292"},{"name":"Greece","a2":"GR","country-code":"300"},{"name":"Greenland","a2":"GL","country-code":"304"},{"name":"Grenada","a2":"GD","country-code":"308"},{"name":"Guadeloupe","a2":"GP","country-code":"312"},{"name":"Guam","a2":"GU","country-code":"316"},{"name":"Guatemala","a2":"GT","country-code":"320"},{"name":"Guernsey","a2":"GG","country-code":"831"},{"name":"Guinea","a2":"GN","country-code":"324"},{"name":"Guinea-Bissau","a2":"GW","country-code":"624"},{"name":"Guyana","a2":"GY","country-code":"328"},{"name":"Haiti","a2":"HT","country-code":"332"},{"name":"Heard Island and McDonald Islands","a2":"HM","country-code":"334"},{"name":"Holy See (Vatican City State)","a2":"VA","country-code":"336"},{"name":"Honduras","a2":"HN","country-code":"340"},{"name":"Hong Kong","a2":"HK","country-code":"344"},{"name":"Hungary","a2":"HU","country-code":"348"},{"name":"Iceland","a2":"IS","country-code":"352"},{"name":"India","a2":"IN","country-code":"356"},{"name":"Indonesia","a2":"ID","country-code":"360"},{"name":"Iran, Islamic Republic of","a2":"IR","country-code":"364"},{"name":"Iraq","a2":"IQ","country-code":"368"},{"name":"Ireland","a2":"IE","country-code":"372"},{"name":"Isle of Man","a2":"IM","country-code":"833"},{"name":"Israel","a2":"IL","country-code":"376"},{"name":"Italy","a2":"IT","country-code":"380"},{"name":"Jamaica","a2":"JM","country-code":"388"},{"name":"Japan","a2":"JP","country-code":"392"},{"name":"Jersey","a2":"JE","country-code":"832"},{"name":"Jordan","a2":"JO","country-code":"400"},{"name":"Kazakhstan","a2":"KZ","country-code":"398"},{"name":"Kenya","a2":"KE","country-code":"404"},{"name":"Kiribati","a2":"KI","country-code":"296"},{"name":"Korea, Democratic People's Republic of","a2":"KP","country-code":"408"},{"name":"Korea, Republic of","a2":"KR","country-code":"410"},{"name":"Kuwait","a2":"KW","country-code":"414"},{"name":"Kyrgyzstan","a2":"KG","country-code":"417"},{"name":"Lao People's Democratic Republic","a2":"LA","country-code":"418"},{"name":"Latvia","a2":"LV","country-code":"428"},{"name":"Lebanon","a2":"LB","country-code":"422"},{"name":"Lesotho","a2":"LS","country-code":"426"},{"name":"Liberia","a2":"LR","country-code":"430"},{"name":"Libya","a2":"LY","country-code":"434"},{"name":"Liechtenstein","a2":"LI","country-code":"438"},{"name":"Lithuania","a2":"LT","country-code":"440"},{"name":"Luxembourg","a2":"LU","country-code":"442"},{"name":"Macao","a2":"MO","country-code":"446"},{"name":"Macedonia, the former Yugoslav Republic of","a2":"MK","country-code":"807"},{"name":"Madagascar","a2":"MG","country-code":"450"},{"name":"Malawi","a2":"MW","country-code":"454"},{"name":"Malaysia","a2":"MY","country-code":"458"},{"name":"Maldives","a2":"MV","country-code":"462"},{"name":"Mali","a2":"ML","country-code":"466"},{"name":"Malta","a2":"MT","country-code":"470"},{"name":"Marshall Islands","a2":"MH","country-code":"584"},{"name":"Martinique","a2":"MQ","country-code":"474"},{"name":"Mauritania","a2":"MR","country-code":"478"},{"name":"Mauritius","a2":"MU","country-code":"480"},{"name":"Mayotte","a2":"YT","country-code":"175"},{"name":"Mexico","a2":"MX","country-code":"484"},{"name":"Micronesia, Federated States of","a2":"FM","country-code":"583"},{"name":"Moldova, Republic of","a2":"MD","country-code":"498"},{"name":"Monaco","a2":"MC","country-code":"492"},{"name":"Mongolia","a2":"MN","country-code":"496"},{"name":"Montenegro","a2":"ME","country-code":"499"},{"name":"Montserrat","a2":"MS","country-code":"500"},{"name":"Morocco","a2":"MA","country-code":"504"},{"name":"Mozambique","a2":"MZ","country-code":"508"},{"name":"Myanmar","a2":"MM","country-code":"104"},{"name":"Namibia","a2":"NA","country-code":"516"},{"name":"Nauru","a2":"NR","country-code":"520"},{"name":"Nepal","a2":"NP","country-code":"524"},{"name":"Netherlands","a2":"NL","country-code":"528"},{"name":"New Caledonia","a2":"NC","country-code":"540"},{"name":"New Zealand","a2":"NZ","country-code":"554"},{"name":"Nicaragua","a2":"NI","country-code":"558"},{"name":"Niger","a2":"NE","country-code":"562"},{"name":"Nigeria","a2":"NG","country-code":"566"},{"name":"Niue","a2":"NU","country-code":"570"},{"name":"Norfolk Island","a2":"NF","country-code":"574"},{"name":"Northern Mariana Islands","a2":"MP","country-code":"580"},{"name":"Norway","a2":"NO","country-code":"578"},{"name":"Oman","a2":"OM","country-code":"512"},{"name":"Pakistan","a2":"PK","country-code":"586"},{"name":"Palau","a2":"PW","country-code":"585"},{"name":"Palestine, State of","a2":"PS","country-code":"275"},{"name":"Panama","a2":"PA","country-code":"591"},{"name":"Papua New Guinea","a2":"PG","country-code":"598"},{"name":"Paraguay","a2":"PY","country-code":"600"},{"name":"Peru","a2":"PE","country-code":"604"},{"name":"Philippines","a2":"PH","country-code":"608"},{"name":"Pitcairn","a2":"PN","country-code":"612"},{"name":"Poland","a2":"PL","country-code":"616"},{"name":"Portugal","a2":"PT","country-code":"620"},{"name":"Puerto Rico","a2":"PR","country-code":"630"},{"name":"Qatar","a2":"QA","country-code":"634"},{"name":"Réunion","a2":"RE","country-code":"638"},{"name":"Romania","a2":"RO","country-code":"642"},{"name":"Russian Federation","a2":"RU","country-code":"643"},{"name":"Rwanda","a2":"RW","country-code":"646"},{"name":"Saint Barthélemy","a2":"BL","country-code":"652"},{"name":"Saint Helena, Ascension and Tristan da Cunha","a2":"SH","country-code":"654"},{"name":"Saint Kitts and Nevis","a2":"KN","country-code":"659"},{"name":"Saint Lucia","a2":"LC","country-code":"662"},{"name":"Saint Martin (French part)","a2":"MF","country-code":"663"},{"name":"Saint Pierre and Miquelon","a2":"PM","country-code":"666"},{"name":"Saint Vincent and the Grenadines","a2":"VC","country-code":"670"},{"name":"Samoa","a2":"WS","country-code":"882"},{"name":"San Marino","a2":"SM","country-code":"674"},{"name":"Sao Tome and Principe","a2":"ST","country-code":"678"},{"name":"Saudi Arabia","a2":"SA","country-code":"682"},{"name":"Senegal","a2":"SN","country-code":"686"},{"name":"Serbia","a2":"RS","country-code":"688"},{"name":"Seychelles","a2":"SC","country-code":"690"},{"name":"Sierra Leone","a2":"SL","country-code":"694"},{"name":"Singapore","a2":"SG","country-code":"702"},{"name":"Sint Maarten (Dutch part)","a2":"SX","country-code":"534"},{"name":"Slovakia","a2":"SK","country-code":"703"},{"name":"Slovenia","a2":"SI","country-code":"705"},{"name":"Solomon Islands","a2":"SB","country-code":"090"},{"name":"Somalia","a2":"SO","country-code":"706"},{"name":"South Africa","a2":"ZA","country-code":"710"},{"name":"South Georgia and the South Sandwich Islands","a2":"GS","country-code":"239"},{"name":"South Sudan","a2":"SS","country-code":"728"},{"name":"Spain","a2":"ES","country-code":"724"},{"name":"Sri Lanka","a2":"LK","country-code":"144"},{"name":"Sudan","a2":"SD","country-code":"729"},{"name":"Suriname","a2":"SR","country-code":"740"},{"name":"Svalbard and Jan Mayen","a2":"SJ","country-code":"744"},{"name":"Swaziland","a2":"SZ","country-code":"748"},{"name":"Sweden","a2":"SE","country-code":"752"},{"name":"Switzerland","a2":"CH","country-code":"756"},{"name":"Syrian Arab Republic","a2":"SY","country-code":"760"},{"name":"Taiwan, Province of China","a2":"TW","country-code":"158"},{"name":"Tajikistan","a2":"TJ","country-code":"762"},{"name":"Tanzania, United Republic of","a2":"TZ","country-code":"834"},{"name":"Thailand","a2":"TH","country-code":"764"},{"name":"Timor-Leste","a2":"TL","country-code":"626"},{"name":"Togo","a2":"TG","country-code":"768"},{"name":"Tokelau","a2":"TK","country-code":"772"},{"name":"Tonga","a2":"TO","country-code":"776"},{"name":"Trinidad and Tobago","a2":"TT","country-code":"780"},{"name":"Tunisia","a2":"TN","country-code":"788"},{"name":"Turkey","a2":"TR","country-code":"792"},{"name":"Turkmenistan","a2":"TM","country-code":"795"},{"name":"Turks and Caicos Islands","a2":"TC","country-code":"796"},{"name":"Tuvalu","a2":"TV","country-code":"798"},{"name":"Uganda","a2":"UG","country-code":"800"},{"name":"Ukraine","a2":"UA","country-code":"804"},{"name":"United Arab Emirates","a2":"AE","country-code":"784"},{"name":"United Kingdom","a2":"GB","country-code":"826"},{"name":"United States","a2":"US","country-code":"840"},{"name":"United States Minor Outlying Islands","a2":"UM","country-code":"581"},{"name":"Uruguay","a2":"UY","country-code":"858"},{"name":"Uzbekistan","a2":"UZ","country-code":"860"},{"name":"Vanuatu","a2":"VU","country-code":"548"},{"name":"Venezuela, Bolivarian Republic of","a2":"VE","country-code":"862"},{"name":"Viet Nam","a2":"VN","country-code":"704"},{"name":"Virgin Islands, British","a2":"VG","country-code":"092"},{"name":"Virgin Islands, U.S.","a2":"VI","country-code":"850"},{"name":"Wallis and Futuna","a2":"WF","country-code":"876"},{"name":"Western Sahara","a2":"EH","country-code":"732"},{"name":"Yemen","a2":"YE","country-code":"887"},{"name":"Zambia","a2":"ZM","country-code":"894"},{"name":"Zimbabwe","a2":"ZW","country-code":"716"}];

  //$scope.isSuccess = false;
    
  var paymentConfig = {
    // REQUIRED. The initial order to be displayed. This will be requested immediately upon load
    publicApiKey: "53f1f9371d8dd00714634bf0",
    // REQUIRED. After payment user will be redirected to this URL.
    providerReturnUrl: "https://admin.yoochoose.com",
  };
  self.iteroJSPayment = new IteroJS.Payment(paymentConfig, function () {
    $scope.$apply(function () {
      // When IteroJS is ready, copy the payment methods and initial order
      $scope.payment.ready = true;
      $scope.payment.methods = self.iteroJSPayment.getAvailablePaymentMethods();
      $scope.payment.methodEnum = self.iteroJSPayment.getAvailablePaymentMethodEnum();
      $scope.payment.data.bearer = $scope.payment.methodEnum[0];
    });
  }, function (errorData) {
    alert("error initializing payment!");
    console.log(errorData);
  });

  $scope.product= {
    plans: {'Gambio performance': '53f219b61d8dd00714635000'},
  
    done: function(valid){
      this.showErrors = true;
      $scope.tabs[1].disabled = !valid;
      $scope.tabs[1].active = valid;
    },
    select: function(){
      $scope.tabs[1].disabled = true;
      $scope.tabs[2].disabled = true;
      $scope.tabs[3].disabled = true;
    }
    
  };
  $scope.account = {
    email: 'yc-pactas@byom.de',
    done: function(valid){

      this.showErrors = true;
      $scope.tabs[2].disabled = !valid;
      $scope.tabs[2].active = valid;
    },
    select: function(){
      $scope.tabs[2].disabled = true;
      $scope.tabs[3].disabled = true;
    }
  };
  $scope.billing = {
    countries: $scope.countries,
    done: function(valid){

      this.showErrors = true;
      $scope.tabs[3].disabled = !valid;
      $scope.tabs[3].active = valid;
      
    },
    select: function(){
      $scope.tabs[3].disabled = true;
    }

  };
  $scope.payment = {
    opendatepicker: false,
    done: function(valid){
      console.log($scope.payment);

      this.showErrors = true;
      if (valid) {
        $scope.signupRunning = true;
        // pass the order, customerData and payment data to IteroJS
        // DTO: PaymentData
        cart = {planVariantId: $scope.product.selected};
        customerData = {
          emailAddress : $scope.account.email,
          firstName : $scope.account.firstname,
          lastName :$scope. account.lastname,
          tag : $scope.account.tag,
          companyName :$scope. billing.company,
          vatId : $scope.billing.vatid,
          address : {
          "addressLine1": $scope.billing.company,
          "addressLine2": $scope.billing.addressline2,
          "street": $scope.billing.street,
          "houseNumber": $scope.billing.number,
          "postalCode": $scope.billing.postalcode,
          "city": $scope.billing.city,
          "country": $scope.billing.country },
        };
        if (this.validto !== undefined){
          this.data.expiryMonth = this.validto.getMonth();
          this.data.expiryYear = this.validto.getFullYear();
        }
        console.log(cart);
        console.log(customerData);
        console.log(this.data);
        new IteroJS.Signup().subscribe(self.iteroJSPayment, cart, customerData, this.data, function (data) {
        // This callback will be invoked when the signup succeeded (or failed)
        // Note that the callback must use $apply, otherwise angularjs won't notice we changed something:
        $scope.$apply(function () {
          $scope.signupdata = data;
          this.signupRunning = false;
          if (!data.Url){
            $scope.isSuccess = true; //done
          } else {
            window.location = data.Url; // redirect required, e.g. paypal, skrill
          }});
        }, function (error) { alert("an error occurred during signup!"); console.log(error); });
      }
    },
    ready:false,
    methods: {},
    methodEnum: [],
    data: {
      bearer: ''
    },
    pickdate:  function($event) {
      $event.preventDefault();
      $event.stopPropagation();
  
      this.opendatepicker = !this.opendatepicker;
    },
    dateOptions: {
      minMode: 'month',
      maxMode: 'month',
      formatMonth: 'MMM',
    },
    today: new Date(),

    select: function(){
    }
    
    
  };
  
   $scope.tabs = [
      { title:'Configure Product', icon:"shopping-cart", template: 'product.html', disabled: false, select: $scope.product.select},
      { title:'Finalize Account', icon:"user", template: 'finalizeAccount.html', disabled: true, select: $scope.account.select},
      { title:'Billing', icon: "envelope", template: 'billing.html', disabled: true, select: $scope.billing.select},
      { title:'Payment', icon: "credit-card", template: 'payment.html', disabled: true, select: $scope.payment.select},
    ];
 
  
  /*****  
  $scope.planResource = $resource(pactas_URL+'/PlanVariants',{},{
    'getPlanVariants':{
      method: 'GET',
      cache:true
    },
  });
  *******/
}])

.directive('match', function () {
  return {
    require: 'ngModel',
    restrict: 'A',
    scope: {
      match: '='
    },
    link: function(scope, elem, attrs, ctrl) {
      scope.$watch(function() {
        modelValue = ctrl.$modelValue || ctrl.$$invalidModelValue;
        return (ctrl.$pristine && angular.isUndefined(modelValue)) || scope.match === modelValue;
      }, function(currentValue) {
        ctrl.$setValidity('match', currentValue);
      });
    }
  };
})
;



;