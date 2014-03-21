// css({'border-top':'5px solid red'})
// Equalizer by Jurij Burkanov

(function($) {
  
  var dimensions = function(applicant) {
    
    appDims = new Object();
      appDims.padTop = [ applicant.css("padding-top").replace("px", "") ];
      appDims.padBot = [ applicant.css("padding-bottom").replace("px", "") ];
      appDims.borTop = [ applicant.css("border-top-width").replace("px", "") ];
      appDims.borBot = [ applicant.css("border-bottom-width").replace("px", "") ];
      appDims.clearHeight = [ applicant.innerHeight() ];
    
    return appDims;
    
  };
  
  
  var equalizationProcess = function(obj, options) {
    
    var eqItems = options.eqItems;
    var exclItems = options.exclItems;
    var segmentSize = options.segmentSize;
    var applicantSelector = options.applicantSelector;
    
    var fullGroup = obj.find(eqItems).not(exclItems);
    var numberOfGroups = (fullGroup.length) / segmentSize;
    
    for (var i=0; i < numberOfGroups; i++){
      var subGroup = fullGroup.slice((segmentSize*i),(segmentSize*(i+1))); // selecting equalized items
      var groupHeights = []; // massive of heights to compare inside of segment
      subGroup.each(function() {
        var applicant = $(this).find(applicantSelector);
        applicant.css({'height':'auto', 'minHeight':'0'});
        dimensions(applicant);
        groupHeights.push(parseInt(appDims.clearHeight) + parseInt(appDims.borBot) + parseInt(appDims.borTop));
      });

      var maxHeight = Math.max.apply(null, groupHeights);

      subGroup.each(function() {
        var applicant = $(this).find(applicantSelector);
        dimensions(applicant);
        applicant.css({'minHeight':(maxHeight - parseInt(appDims.borBot) - parseInt(appDims.borTop) - parseInt(appDims.padTop) - parseInt(appDims.padBot)) + 'px'});
      });
    }
    
  };
  
  
  $.fn.extend({
    equalize: function(options) {
      
      var defaults = {
        eqItems: " > li",
        exclItems: "",
        segmentSize: 2,
        applicantSelector: "> div"
      };
      
      var options = $.extend(defaults, options);
      
      return this.each(function() {
        
        equalizationProcess( $(this), options );
        
        
      });
      
    }
  });
})(jQuery);