(function($) {

	function init(plot) {
		
		toUnicode = function(num){
          var tenthRoot = Math.round(Math.log(num)/ Math.LN10);
          var str;
          if(tenthRoot >= 0){
            str = '10';
          }else{
            str = '10\u207B';
          }

          var tenthRootStr = tenthRoot.toString();
          for(var i=0; i < tenthRootStr.length; i++){
            switch(tenthRootStr[i]){
              case "0":
                str = str+'\u2070';
                break;
              case "1":
                str = str+'\u00B9';
                break;
              case "2":
                str = str+'\u00B2';
                break;
              case "3":
                str = str+'\u00B3';
                break;
              case "4":
                str = str+'\u2074';
                break;
              case "5":
                str = str+'\u2075';
                break;
              case "6":
                str = str+'\u2076';
                break;
              case "7":
                str = str+'\u2077';
                break;
              case "8":
                str = str+'\u2078';
                break;
              case "9":
                str = str+'\u2079';
                break;
            }
          }
          return str;
        };
        
        // Genrates the ticks for logarithmic plots
        logTickGenerator = function(axis){
          var res = [];
          var min, max, value, noTicks;
          if(axis.options.noTicks){
          	noTicks = axis.options.noTicks;
          }else{
          	noTicks = 5;
          }
          
          if(axis.min == 0){
          	if(axis.datamin > 0){
          	  axis.min = axis.datamin;
        	  min = Math.floor(Math.log(axis.datamin)/Math.LN10);
        	}else{
        	  min = .1;
        	  axis.min = .1;
        	  alert('Logarithmic data must be greater than zero!');
        	}
          }else{
        	min = Math.floor(Math.log(axis.min)/Math.LN10);
          }
          max = Math.ceil(Math.log(axis.max)/Math.LN10);
		  
		  var diff = max - min;
		  var M;
		  if(diff > noTicks){
		  	M = Math.round(diff/noTicks);
		  }else{
		  	M = 1;
		  }

          for(var i=min;i<=max;i=i+M){
          	value = Math.pow(10,i);
            res.push([value,toUnicode(value)]);
          }
          return res;
        };
        
		plot.hooks.processOptions.push(function (plot, options) {
		  $.each(plot.getAxes(), function(axisName, axis) {	
		  	var opts = axis.options;
		  	if(opts.ticks) axis.options.noTicks = opts.ticks;
		  	
		  	if((opts.reverse == true) & (opts.log == true)){		// Reverse axis and log
              axis.options.transform = Function("v","return v == 0 ? null : -Math.log(v);");
              axis.options.inverseTransform = function(v) { return Math.exp(-v);};
              axis.options.ticks = logTickGenerator;
            }else if((opts.reverse == true) & !opts.log){  // Reverse axis
              axis.options.transform = function(v) { return -v; };
              axis.options.inverseTransform = function(v) { return -v;};
            }else if(!opts.reverse & opts.log){   // log
              axis.options.transform = Function("v","return v == 0 ? null : Math.log(v);");
              axis.options.inverseTransform = function(v) { return Math.exp(v);};
              axis.options.ticks = logTickGenerator;
            }
		  });
		});
	}

	$.plot.plugins.push({
		init: init,
		options: {},
		name: 'extend',
		version: '1.0'
	});
})(jQuery);