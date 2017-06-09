
/** INCLUDE ME AS
 *
 *  $.getScript("/js/switch_mandator.js");
 */




/** Opens a dialog for switching the mandator
 *
 *  @param canBeClosed
 *  	if true, the dialog can be closed without selecting a mandator.
 *      Default value - true.
 * */
var showSwitchMandatorPopup = function(canBeClosed) {

	canBeClosed = (typeof canBeClosed !== 'undefined') ? canBeClosed : true;

	$('#switch_mandator_popup').show();

	var closeButton = $('#switch_mandator_popup .destroy_dialog');
	if (canBeClosed) {
		closeButton.show();
	} else {
		closeButton.hide();
	}
	autocompleteOnSelect();
};

function autocompleteOnSelect(){
	(function( $ ) {
	    $.widget( "custom.combobox", {
	      _create: function() {
	        this.wrapper = $( "<span>" )
	          .addClass( "custom-combobox" )
	          .insertAfter( this.element );

	        this.element.hide();
	        this._createAutocomplete();
	        this._createShowAllButton();
	      },

	      _createAutocomplete: function() {
	        var selected = this.element.children( ":selected" ),
	          value = selected.val() ? selected.text() : "";

	        this.input = $( "<input>" )
	          .appendTo( this.wrapper )
	          .val( value )
	          .attr( "title", "" )
	          .addClass( "custom-combobox-input ui-widget ui-widget-content ui-state-default ui-corner-left" )
	          .autocomplete({
	            delay: 0,
	            minLength: 0,
	            source: $.proxy( this, "_source" )
	          })
	          .tooltip({
	            tooltipClass: "ui-state-highlight"
	          });

	        this._on( this.input, {
	          autocompleteselect: function( event, ui ) {
	            ui.item.option.selected = true;
	            this._trigger( "select", event, {
	              item: ui.item.option
	            });
	          },

	          autocompletechange: "_removeIfInvalid"
	        });
	      },

	      _createShowAllButton: function() {
	        var input = this.input,
	          wasOpen = false;

	        $( "<a>" )
	          .attr( "tabIndex", -1 )
	          .attr( "title", "Show All Items" )
	          .tooltip()
	          .appendTo( this.wrapper )
	          .button({
	            icons: {
	              primary: "ui-icon-triangle-1-s"
	            },
	            text: false
	          })
	          .removeClass( "ui-corner-all" )
	          .addClass( "custom-combobox-toggle ui-corner-right" )
	          .mousedown(function() {
	            wasOpen = input.autocomplete( "widget" ).is( ":visible" );
	          })
	          .click(function() {
	            input.focus();

	            // Close if already visible
	            if ( wasOpen ) {
	              return;
	            }

	            // Pass empty string as value to search for, displaying all results
	            input.autocomplete( "search", "" );
	          });
	      },

	      _source: function( request, response ) {
	        var matcher = new RegExp( $.ui.autocomplete.escapeRegex(request.term), "i" );
	        response( this.element.children( "option" ).map(function() {
	          var text = $( this ).text();
	          if ( this.value && ( !request.term || matcher.test(text) ) )
	            return {
	              label: text,
	              value: text,
	              option: this
	            };
	        }) );
	      },

	      _removeIfInvalid: function( event, ui ) {

	        // Selected an item, nothing to do
	        if ( ui.item ) {
	          return;
	        }

	        // Search for a match (case-insensitive)
	        var value = this.input.val(),
	          valueLowerCase = value.toLowerCase(),
	          valid = false;
	        this.element.children( "option" ).each(function() {
	          if ( $( this ).text().toLowerCase() === valueLowerCase ) {
	            this.selected = valid = true;
	            return false;
	          }
	        });

	        // Found a match, nothing to do
	        if ( valid ) {
	          return;
	        }

	        // Remove invalid value
	        this.input
	          .val( "" )
	          .attr( "title", value + " didn't match any item" )
	          .tooltip( "open" );
	        this.element.val( "" );
	        this._delay(function() {
	          this.input.tooltip( "close" ).attr( "title", "" );
	        }, 2500 );
	        this.input.data( "ui-autocomplete" ).term = "";
	      },

	      _destroy: function() {
	        this.wrapper.remove();
	        this.element.show();
	      }
	    });
	  })( jQuery );

	  $(function() {
	    $( "#choose_mandant" ).combobox();
	  });
}

var showNoAvailableMandatorPopup = function() {
	$('#no_mandator_available').show();

	getCurrentUser(function(user) {
		$('#no_mandator_available .fullname').text((user.firstName ? user.firstName : "") + " " + (user.lastName ? user.lastName : ""));
		if (user.provider) {
			$('#no_mandator_available .logo').attr("src", "/img/auth-providers/250-" + user.provider + ".png");
			$('#no_mandator_available .logo').attr("alt", user.provider);
			$('#no_mandator_available .logo').show();
		} else {
			$('#no_mandator_available .logo').hide();
		}

	    // updating interface language
	    if (user.lang && in_to_language != user.lang) { // "in_to_language" is a global variable defined in "i18n.js"
	    	changeLang(user.lang, false);
	    }
	});

};


var initSwitchMandator = function() {

	// Mandator switch click event
	$('.switch > a').click(showSwitchMandatorPopup);

	var closeSwitchMandatorPopup = function(e) {
	    if (e.which == 1 || e.which == 27) { // left click or Esc
	    	if ($('#switch_mandator_popup .destroy_dialog').is(':visible')) {
	    		$('#switch_mandator_popup').hide();
	    	}
	    }
	};

	$('#switch_mandator_popup .destroy_dialog').on("click", closeSwitchMandatorPopup);

	$(document).bind('keydown', closeSwitchMandatorPopup);

	$("#saveMandatorChange").on("click", function (event) {
		if($('#choose_mandant').val() !== "") {

			customerID = $('#choose_mandant').val();              // setting global variable.
			$.cookie('customerID', customerID, { expires: 365 }); // setting cookie.

			$.when(
				mandatorDao.init(customerID),
				ajaxScenarioList('24H')
		    ).done(function() {
				initialLoadData();
				setMandantData(mandatorDao.mandator);

				$('.available_view_options').children('li').removeClass('current');
				$('.available_view_options').children('li').first().addClass('current');

				$(document).trigger('mandatorChanged');
//				var event = new $.Event('mandatorChanged');
//				document.dispatchEvent(event);

				$('#switch_mandator_popup').hide();
		    });

		} else {
			setMessagePopUp("problem", "error_no_customer_select");
		}
	});
};


$(document).ready(function () {
	// calling initialization function
	initSwitchMandator();
});
