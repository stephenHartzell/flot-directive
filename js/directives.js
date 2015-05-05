'use strict';

/* Directives */
angular.module('flotTest.directives', [])

  .directive('flot', [function() {
    return {
      restrict: 'E',
      replace: true,
      template: '<div class="flot-wrapper unselectable">\
      				<div class="loading-banner text-center" ng-if="loading" ng-show="!minimized">Loading</div>\
      				<div id="flot-container" class="hoverable flot-container ui-resizable" ng-show="!minimized">\
      					<span class="dropdown" dropdown>\
      						<i class="flotIcon dropdown-toggle glyphicon glyphicon-menu-hamburger" dropdown-toggle></i>\
      						<ul class="dropdown-menu">\
      							<li role="presentation" class="dropdown-header">Export</li>\
      							<li ng-repeat="opt in exportOptions">\
      								<a class="pointer-item" download="{{opt.filename}}" ng-click="dlCanvas($event,opt.type,opt.filename,plotData)">{{opt.name}}</a></li>\
      							<li class="divider"></li>\
      							<li role="presentation" class="dropdown-header">Figure Options</li>\
      							<li>\
      								<a class="pointer-item" ng-click="toggleBanner()">Toggle banner</a></li>\
      							<li>\
      							<li class="dropdown-submenu">\
      								<a class="pointer-item">Select Series</a>\
    								<ul class="dropdown-menu">\
      									<li ng-repeat="s in series">\
      										<div ng-if="s.selected" class="series-submenu" style="background-color: {{s.color}};"></div>\
      										<div ng-if="!s.selected" class="series-submenu" style="border: 2px solid {{s.color}};"></div>\
      										<a class="pointer-item" ng-click="s.selected = !s.selected; changeSeriesSelection()"> {{s.label}}</a>\
      									</li>\
    								</ul>\
  								</li>\
      						</ul>\
      					</span>\
      					<i class="flotIcon glyphicon glyphicon-refresh" style="float:right;margin-right:10px" ng-click="refreshOnClick(plotData)"></i>\
      					<i class="flotIcon glyphicon glyphicon-minus" style="float:right;margin-right:5px" ng-if="minimizable" ng-click="toggleMinimize()"></i>\
      					<i class="flotIcon glyphicon glyphicon-resize-full" style="float:right;margin-right:5px" ng-if="maximizable && !maximized" ng-click="toggleMaximize()"></i>\
      					<i class="flotIcon glyphicon glyphicon-resize-small" style="float:right;margin-right:5px" ng-if="maximizable && maximized" ng-click="toggleMaximize()"></i>\
      					<div class="flot"></div>\
      				</div>\
      			</div>',
      scope: {
        draggable: '=',
        loading: '=',
        maximizable: '=',
        minimizable: '=',
        minimized: '=',
        onHover: '&',       // Can get data out of tooltip to interact with other DOM elements
        options: '=',
        plotData: '=',
        resizable: '='
      },
      link: function(scope, elem, attrs) {
  		
  		//-----------------------------------------------------------------------------------------------------//
      	// Default Behavior and Menu Options                                                                   //
      	//-----------------------------------------------------------------------------------------------------//
      	var flot;
      	scope.shwBanner = true;
      	scope.maximized = false;
      	scope.lastOffsetLeft;
      	scope.lastOffsetTop;
      	
      	scope.exportOptions = [{name:'Save to png',filename:'plot.png',type:'png'},
							   {name:'Save to jpg',filename:'plot.jpg',type:'jpg'},
							   {name:'Save to json',filename:'plot.json',type:'json'}];
      	
      	//-----------------------------------------------------------------------------------------------------//
      	// Functions activated by user interactions (e.g. minimizing, saving, etc)                             //
      	//-----------------------------------------------------------------------------------------------------//
      	scope.toggleMinimize = function(){
      		scope.minimized = !scope.minimized;		     
      	};
      	
      	scope.toggleMaximize = function(){
      		scope.maximized = !scope.maximized;		
      		var windowHeight = ($(window).height()-200) + 'px';
      		var windowWidth = ($(window).width()-200) + 'px';
      		var flotContainer = $(elem).find('#flot-container');
      		if(scope.maximized){
      			scope.lastOffsetLeft = $(elem).offset().left+ 'px';
      			scope.lastOffsetTop = $(elem).offset().top+ 'px';
      			scope.draggable = false;
      			scope.resizable = false;
      			$(elem).css({left:'100px',top:'100px','z-index':9999});
      			$(flotContainer).css({height:windowHeight,width:windowWidth});	
      		}else{
      			scope.draggable = true;
      			scope.resizable = true;
      			$(elem).css({left:scope.lastOffsetLeft,top:scope.lastOffsetTop,'z-index':1});	
      			$(flotContainer).css({height:'',width:''});
      		}	     
      	};
      	
      	scope.toggleBanner = function(){
      		scope.shwBanner = !scope.shwBanner;
      		scope.plot = buildPlot(elem,scope.plotData,scope.options);
      	};
      	
		scope.dlCanvas = function($event, type, filename, data) {
			var  browser = [get_browser(), get_browser_version()];
			var canvas = $(elem).find('.flot-base')[0];
			var dt;
			
			// If output is an image, convert the data to a URL. If its JSON, then stringify it and save it
			if(type =='png'){
				dt = canvas.toDataURL('image/png');
			}else if(type =='jpg'){
				dt = canvas.toDataURL('image/jpg');
			}else if(type == 'json'){
				if(browser[0] == "MSIE"){  // If using IE
					// IE 9 simply cannot output text as .json, it is always .txt. However, IE > 9 can. 
					// TODO: let IE > 9 download as a .json and use this as a special case just for IE 9
    				saveTextAs(JSON.stringify(data,undefined,2), filename);
				}else{  				   // If using any other browser
					var jsonData = JSON.stringify(data,undefined,2);
          			var blob = new Blob([jsonData], {type: "text/plain;charset=utf-8"});
          			saveAs(blob, filename);
          		}
			}
			
			// Creates a new tab with the image for IE, otherwise instigates a download other browsers
			if((type == 'png') | (type == 'jpg')){
				if (browser[0] == "MSIE"){  // If using IE
	    			var html="<p>Right-click on image below and Save-Picture-As</p>";
        			html+="<img src='"+canvas.toDataURL()+"' alt='from canvas'/>";
        			var tab=window.open();
        			tab.document.write(html);
	   			}else{                          // If using any other browser
	    			$event.target.href = dt;	
	    		}
			}
    	};
    	
    	function buildSeriesSubMenu(){
			var series = scope.plot.getData();
			for(var i=0;i < series.length; i++){
				scope.series[i].color = series[i].color;
				if(series[i].label) scope.series[i].label = series[i].label;  
			} 
		}
		
		scope.changeSeriesSelection = function(){
			scope.plot = buildPlot(elem,scope.plotData,scope.options);
		}

        scope.refreshOnClick = function() {
          var axes = scope.plot.getAxes();
          for(var axis in axes){
          	if(axes[axis].options.log){
          		axes[axis].options.min = axes[axis].options.seriesMin;
          	}else{
          		axes[axis].options.min = null;
          	}
            axes[axis].options.max = null;
          }
          scope.plot.setupGrid();
          scope.plot.draw();
        };
		
		//-----------------------------------------------------------------------------------------------------//
      	// The watchers - These functions execute any time that the variable in the argument change            //
      	//-----------------------------------------------------------------------------------------------------//
		scope.$watch('draggable',function(draggable) {
          if(draggable){
            $(function() {
    	    	$(elem).draggable({cursor: "move"});
    	    	$(elem).draggable('enable');
    	    });
    	  }else{
    	  	$(function() {
				$(elem).draggable({cursor: "move"});
    	    	$(elem).draggable('disable');
    	    });
    	  }
        });
        
        scope.$watch('resizable',function(resizable) {
          var flotContainer = $(elem).find('#flot-container');
          if(resizable){  
          	$(function() {
              // Limit how small the flot container size
              $(flotContainer).resizable({minWidth: 300, minHeight: 250});
           });
          }else{
          	$(function() {
			  $(flotContainer).resizable({minWidth: 300, minHeight: 250});
          	  $(flotContainer).resizable('destroy');
          	});
          }
        });

        scope.$watch('plotData', function(data) {
          if (angular.isUndefinedOrNull(data)) {
            return;
          }
          flot = $(elem).find('.flot');
		  scope.series = [];
		  for(var i = 0; i < scope.plotData.length; i++){
			scope.series.push({color:'',label:'Series '+i, selected:true});
		  }
		
          scope.plot = buildPlot(elem,data,scope.options);
          buildSeriesSubMenu();
        });

		//-----------------------------------------------------------------------------------------------------//
      	// Handy functions used by this directive 										                       //
      	//-----------------------------------------------------------------------------------------------------//
		
		// Generic function for cloning an object, not just copying a link to the same object. This is 
		// used for duplicating axes.
        function clone(obj) {
          if (null == obj || "object" != typeof obj) return obj;
          var copy = obj.constructor();
          for (var attr in obj) {
              if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
          }
          return copy;
        }

        //-----------------------------------------------------------------------------------------------------//
      	// Build the plot. This is the core of this directive. Each time one of the watchers detects a change  //
      	// in the options or the data this function is run to rebuild the plot.                                //
      	//-----------------------------------------------------------------------------------------------------//
        function buildPlot(elem,allData,options){
		  
		  var data = [];
		  if(allData){
			for(var i=0; i<allData.length; i++){
		  	  if(scope.series[i].selected) data.push(allData[i]);
		    }
		  }
		  
		  // Default options
          var defaultOpts = {
              grid: {hoverable:true,clickable:true},
              canvas: true,
              zoom: {
                interactive: true,
                amount: 1.1
              },
              pan: {
                interactive: true
              },
              axisLabels:{
                show: true
              },
              hooks:{}
          };

          if(options == undefined){
          	if(scope.shwBanner){
              defaultOpts.hooks = {
                processOffset: function(plot, offset) {
                  offset = angular.extend(offset, { top: 34, bottom: 34, left: 4, right: 4 });
                },
                drawBackground: function(plot, ctx) {

                  ctx.save();
                  ctx.font = '14px Arial';
                  ctx.textBaseline = "top";
                  ctx.textAlign = 'center';

                  ctx.fillStyle = '#00A000';
                  ctx.fillRect(0, 0, plot.getCanvas().width, 24);
                  ctx.fillRect(0, plot.getCanvas().height-24, plot.getCanvas().width, 24);

                  ctx.font = 'bold 14px Arial';
                  ctx.textAlign = 'left';
                  ctx.fillStyle = '#FFF';
                  ctx.fillText('UNCLASSIFIED', 5, 4);
                  ctx.textAlign = 'right';
                  ctx.fillText('UNCLASSIFIED', plot.getCanvas().width-5, plot.getCanvas().height-20);

                  ctx.restore();
                }
              };
            }
          }else{
			// Make sure that hoverable is still on even if other grid options have been selected
			if(options.grid){
				if(options.grid.hoverable == undefined){
					options.grid.hoverable = true;
				}
				if(options.grid.clickable == undefined){
					options.grid.clickable = true;
				}
			}
			
            // Produce duplicate axes if present
            var dupAxis;
            if(options['xaxis']){
              if(options['xaxis']['duplicate']){
                dupAxis = clone(options['xaxis']);
                if(dupAxis['position'] == 'top'){
                  dupAxis['position'] = 'bottom';
                }else{
                  dupAxis['position'] = 'top';
                }
                defaultOpts.xaxes = [{}, dupAxis];
              }
            }
            if(options['yaxis']){
              if(options['yaxis']['duplicate']){
                dupAxis = clone(options['yaxis']);
                if(dupAxis['position'] == 'right'){
                  dupAxis['position'] = 'left';
                }else{
                  dupAxis['position'] = 'right';
                }
                defaultOpts.yaxes = [{}, dupAxis];
              }
            }
			
			// Add code into the flot hooks needed to duplicate the axes and build the banners and title
			var bannerHeight = 0;
			if(scope.shwBanner) bannerHeight = 22;
			var titleHeight = 0;
			if(options.title) titleHeight = 16;
            defaultOpts.hooks.processOffset =  function(plot, offset) {
              offset = angular.extend(offset, { top: 12+bannerHeight+titleHeight, bottom: bannerHeight, left: 4, right: 4 });

              if(options['yaxis']){
                if(options['yaxis']['duplicate']){
                  plot.getYAxes()[1].used = true;
                  plot.getYAxes()[1].datamin = plot.getYAxes()[0].datamin;
                  plot.getYAxes()[1].datamax = plot.getYAxes()[0].datamax;
                }
              }
              if(options['xaxis']){
                if(options['xaxis']['duplicate']){
                  plot.getXAxes()[1].used = true;
                  plot.getXAxes()[1].datamin = plot.getXAxes()[0].datamin;
                  plot.getXAxes()[1].datamax = plot.getXAxes()[0].datamax;
                }
              }
            };
            
            defaultOpts.hooks.drawBackground = [];
            if(options.title){
              defaultOpts.hooks.drawBackground.push(function(plot, ctx){
              	ctx.save();
                ctx.font = '14px Arial';
                ctx.textBaseline = "top";
                ctx.textAlign = 'center';
				  
				ctx.fillStyle = 'rgb(0,0,0)';
				if(options.titleColor) ctx.fillStyle = options.titleColor;
                ctx.fillText(options.title, plot.getCanvas().width/2+20, bannerHeight+titleHeight/2);  
              });
            }
            
			if(scope.shwBanner){
			  defaultOpts.hooks.drawBackground.push(function(plot, ctx){	
				  ctx.save();
                  ctx.font = '14px Arial';
                  ctx.textBaseline = "top";
                  ctx.textAlign = 'center';
				  
                  if((options.classification == "UNCLASSIFIED") | (options.classification == "FOUO") | (options.classification == "UNCLASS")){
                    ctx.fillStyle = '#00A000';
                  }else{
                    ctx.fillStyle = '#FF33CC';
                  }
				  
                  ctx.fillRect(0, 0, plot.getCanvas().width, 24);
                  ctx.fillRect(0, plot.getCanvas().height-24, plot.getCanvas().width, 24);

                  ctx.font = 'bold 14px Arial';
                  ctx.textAlign = 'left';
                  ctx.fillStyle = '#FFF';
                  ctx.fillText(options.classification, 5, 4);            
                  ctx.textAlign = 'right';
                  ctx.fillText(options.classification, plot.getCanvas().width-5, plot.getCanvas().height-20);
			  });
            }

            // Set zoom limits & get error bars
            var xmax = -Infinity;
            var xmin = Infinity;
            var ymax = -Infinity;
            var ymin = Infinity;
            var thisData;

            for(var i=0; i<data.length; i++){
              thisData = data[i]["data"];
              if(thisData != null){
                // Check for error bars - assumes that if there are more than three elments in each elment of the data array
                // that error bars are present. Error bars are always given a "mushroom cap"
                if(thisData[0].length > 2 & data[i].hasOwnProperty('points')){
                  data[i].points.errorbars = 'y';
                  data[i].points.yerr = {show:true, upperCap: "-", lowerCap: "-", radius: 5};
                }else if(thisData[0].length > 2 & !data[i].hasOwnProperty('points')){
                  data[i].points = {errorbars:'y',yerr:{show:true, upperCap: "-", lowerCap: "-", radius: 5}};
                }
              }
            }
          }

          var opts = angular.extend({}, defaultOpts, options); // Take the union of the default options and the user-defined options
          buildToolTip(scope);								   // Build the tooltip
          return $.plot(flot, data, opts);					   // Finally, create the flot chart
        }

		// Create the flot tooltip
        function buildToolTip(scope){        
          $("<div id='flotToolTip' style='z-index:9999'></div>").appendTo("body");   
          if(scope.options.xaxis.mode == "time"){ // The UTC date and time are displayed in the tooltip if the x-axis is time
			$(elem).bind("plothover", function (event, pos, item) {
                var pt;
                if (item) {
                  var x = Number(item.datapoint[0].toFixed(2));

                  var Y = new Date(x).getFullYear();
                  var Mo = new Date(x).getMonth()+1;
                  Mo = ('0' + Mo).slice(-2);
                  var D = new Date(x).getDate();
                  D = ('0' + D).slice(-2);
                  var H = new Date(x).getHours();
                  H = ('0' + H).slice(-2);
                  var M = new Date(x).getMinutes();
                  M = ('0' + M).slice(-2);
                  var S = new Date(x).getSeconds();
                  S = ('0' + S).slice(-2);
                  pt = Y + "-" + Mo + "-" + D + " " + H + ":" + M + ":" + S +" Z";

                  $("#flotToolTip").html( pt )
                  .css({top: item.pageY+5, left: item.pageX+5})
                  .fadeIn(300);
                } else {
                  $("#flotToolTip").stop();
                  $("#flotToolTip").hide();
                }
                scope.$apply(function(){
                  scope.onHover({
                    point:pt
                  });
                });
              });
          }else{
          	$(elem).bind("plothover", function (event, pos, item) {
            	if (item) {
                	var x = item.datapoint[0].toFixed(2);
                  	var y = item.datapoint[1].toFixed(2);
    
                  	$("#flotToolTip").html( "(" + x + " , " + y + ")")
                  		.css({top: item.pageY+5, left: item.pageX+5})
                  		.fadeIn(300);
                } else {
                 	$("#flotToolTip").stop();
                  	$("#flotToolTip").hide();
                };
          	});
          }
          
          // This function executes when the user clicks on a line
          $(elem).bind("plotclick", function (event, pos, item) {
          var re = re = /\(([0-9]+,[0-9]+,[0-9]+)/;
    	  var opacity = 1;
    	  var seriesIdx = -1;
          if (item) {
          	seriesIdx = item.seriesIndex;
        	opacity = 0.1;
				  
			var modSeries = 
    		$.map(scope.plot.getData(),function(series,idx){
    		var color = $.parseColor(series.color);
    		color = 'rgba(' + color[0] + ',' + color[1] + ',' + color[2] + ',' + color[3] + ')';
        	if (idx == seriesIdx){
           		series.color = 'rgba(' + re.exec(color)[1] + ',' + 1 + ')';
        	} else {
           		series.color = 'rgba(' + re.exec(color)[1] + ',' + opacity + ')';
        	}
       		return series;
    		});
    		scope.plot.setData(modSeries);
    		scope.plot.draw();
    
          } else {
          	var modSeries = 
    		$.map(scope.plot.getData(),function(series,idx){
    		var color = $.parseColor(series.color);
    		color = 'rgba(' + color[0] + ',' + color[1] + ',' + color[2] + ',' + color[3] + ')';
           	series.color = 'rgba(' + re.exec(color)[1] + ',' + 1 + ')';
       		return series;
    		});
    		scope.plot.setData(modSeries);
    		scope.plot.draw();
          };
          });
        }
      }
    };
  }])
;
