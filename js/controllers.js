'use strict';

/* Controllers */
angular.module('flotTest.controllers', ['ui.bootstrap'])
  .controller('flotTestCtrl', ['$scope', function($scope) {
	
	var browser = [get_browser(), get_browser_version()];
	
	function randomWalk(T, tmax){
		var n = Math.floor(tmax/T);
		var data=[];
		var i = -1;
		
		while (data.length < n) {
			i++;
			
			var prev = data.length > 0 ? data[data.length - 1][1] : 50,
			y = prev + Math.random() * 10 - 5;

			if (y < 0) {
				y = 0;
			} else if (y > 100) {
				y = 100;
			}
			data.push([i*T,y+.01]);
		}
		return data;
	}
	
  	$scope.loading = true;
  	$scope.draggable = true;
  	
  	
  	var T = 0.3;
	var tmax = 32;
  	$scope.series = [{label: 'series0',shadowSize:5,
  					  data: randomWalk(T,tmax)},
  					 {data: randomWalk(T,tmax),color:'#AAAAAA'},
  					 {label: 'ser3',lines:{show:true},points:{show:true,fillColor:'cyan'},
  					  data: randomWalk(T,tmax),color:'cyan'},
  					 {label: 'SERIES4',
  					  data: randomWalk(T,tmax),color:'rgba(80,255,20,.5)'},
  					];
	
    $scope.options = {xaxis:{axisLabel:'x-label',axisLabelUseCanvas:true, axisLabelColor:'#0000A0'},
    				  yaxis:{axisLabel:'y-label',axisLabelUseCanvas:true,log:true,reverse:true},
    				  title:'Figure Title', titleColor:'#00A000',
    				  grid:{show:true,backgroundColor: 'rgba(255,255,255,0.5)'},
    				  legend:{noColumns:3,position:'nw',labelColor:'#00A'},
    				  classification:'UNCLASSIFIED'};
    
  	$scope.resizable = true;
  	$scope.loading = false;
  	$scope.minimized = false;
  	$scope.minimizable = true;
  	$scope.maximizable = true;
  }])
;