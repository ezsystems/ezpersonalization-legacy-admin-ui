(function($){

  placeBrowserData = function() {
  
    var pageBody = $("body");
    var browserEngine = "unknown_engine";
    var browserVersion = "vers_" + (($.browser.version).replace(/\./g,'_'));
  
    if ($.browser.webkit || $.browser.safari) {
      browserEngine = "webkit";
    }else if ($.browser.mozilla) {
      browserEngine = "mozilla";
    }else if ($.browser.msie) {
      browserEngine = "msie";
    }
    
    if ($.browser.mozilla && browserVersion.match(/^vers_1_9_1/) ){
      browserVersion = "vers_1_9_1";
    }

    pageBody.addClass(browserEngine);
    pageBody.addClass(browserVersion);
    
  };

  $(document).ready(function () {
    placeBrowserData();
  });
  
})(jQuery);