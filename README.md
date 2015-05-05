# flot-directive

## About ##

Flot is an open-source Javascript plotting library for jQuery.  
Read more at the website: <http://www.flotcharts.org/>.
There are examples of flot in action on the flotcharts website.

This repository makes flot a little easier to integrate into a website.
Using AngularJS, this repo uses a flot directive so that a flot chart can
be inserted into a web page easily by just using the <flot> HTML tag. 
This repository adds some features that are not currently available in 
flotJS or other repositories based on flot. Flot charts created with this
directive are in a contained with several new features:

*	Draggability: by setting <flot draggable="true" ...> the chart can be dragged (uses jqueryUI)
*	Resizability: by setting <flot resizable="true" ...> the chart can be resized (uses jqueryUI and flot resizable plugin)
*	Minimizable: by settings <flot minimizable="true" ...> the chart can be minimized (uses AngularJS and custom functionality)
*	Maximizable: by settings <flot maximizable="true" ...> the chart can be maximized (uses AngularJS and custom functionality)
*	A Menu: From here, individual lines can be turned off or on as desired, the classification banner can be toggled, etc.
*	A tooltip that automatically works with time-series data.
*	When a line is clicked, all other lines are dimmed. Can be modified for hovering on lines as well.
*	Native support for plot titles, logarithmic axes, and reversed axis directions by setting log:true, or reverse:true in the xaxis settings.

## Installation ##
Just download as a zip or clone and open the index.html file!

## Basic Usage ## 
To use simply include the directives.js file in your AngularJS app and include it in your Angular app! 
All the hooks are there, and its easy to modify!