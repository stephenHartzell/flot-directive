(function($) {

	function init(plot) {
		plot.hooks.processOptions.push(addLastDrawHook);
	}

	function addLastDrawHook(plot) {
		plot.hooks.draw.push(drawLegend);
	}

	// draws the legend on the canvas, using the HTML added by flot as a guide
	function drawLegend(plot, ctx) {
		var options = plot.getOptions();
		if(!options.legend.show) return;

		var placeholder = plot.getPlaceholder();
		var container = options.legend.container || placeholder.find('.legend');

		var f = {
			style: placeholder.css("font-style"),
			size: Math.round(0.8 * (+placeholder.css("font-size").replace("px", "") || 13)),
			variant: placeholder.css("font-variant"),
			weight: placeholder.css("font-weight"),
			family: placeholder.css("font-family")
		};

		ctx.font = f.style + " " + f.variant + " " + f.weight + " " + f.size + "px '" + f.family + "'";
		ctx.textAlign = "left";
		ctx.textBaseline = "bottom";

		function fontAscent() {
			return 12;
		}

		var series = plot.getData();
		var plotOffset = plot.getPlotOffset();
		var plotHeight = plot.height();
		var plotWidth = plot.width();
		var lf = options.legend.labelFormatter;
		var legendWidth = 0, legendHeight = 0;
		var num_labels = 0;
		var s, label;
		var labelArray = [];
		var labelColorArray = [];
		var labelWidthArray = [];
		var colWidthArray = [];
		var rowsArray = [];
		var noColumns;
		if(!options.legend.noColumns){
			noColumns = 1;
		}else{
			noColumns = options.legend.noColumns;
		}
		
		// get number of valid legend entries and store their width and value
		for(var i = 0; i < series.length; ++i) {
			s = series[i];
			label = s.label;
			if(!label) continue;
			num_labels++;
			if(lf) label = lf(label, s);
			labelArray.push(label);
			labelColorArray.push(s.color);
			labelWidthArray.push(ctx.measureText(label).width);
		}
		
		// This mimics behavior normally available in flot
		if(noColumns > num_labels){
			noColumns = num_labels;
		}
		
		// get the number of rows and columns
		var rows, cols;
		if(noColumns){
			if(noColumns >= num_labels){
				cols = noColumns;
				rows = 1;
				for(var i =0; i < cols; i++){
					rowsArray.push(1);
				}
			}else{
				cols = noColumns;
				rows = Math.ceil(num_labels/cols);
				var labelCnt = cols;	
				for(var i = 0; i < cols; i++){
					labelCnt = labelCnt+(rows-1);
					if(labelCnt <= num_labels){
						rowsArray.push(rows);
					}else{
						rowsArray.push(1);
					}	
				}
			}
		}else{
			cols = 1;
			rows = num_labels;
			rowsArray = [rowsArray]; 
		}
		
		// get the width of each column
		COLUMN_PADDING = 5;
		var LEGEND_BOX_WIDTH = 22;
		cnt = -1;
		for(var i = 0; i < cols; i++){
			maxValue = 0;
			colWidthArray.push(0);
			for(var j = 0; j < rowsArray[i]; j++){
				cnt++;
				if(labelWidthArray[cnt] > maxValue) maxValue = labelWidthArray[cnt];					
			}
			colWidthArray[i] = maxValue;
		}
		for(var i = 0; i < cols; i++){
			legendWidth = legendWidth + colWidthArray[i] + COLUMN_PADDING + LEGEND_BOX_WIDTH;
		}
		var LEGEND_BOX_LINE_HEIGHT = 18;
		legendHeight = rows * LEGEND_BOX_LINE_HEIGHT;
		
		// make legend box area
		var x, y;
		if(options.legend.container != null) {
			x = $(options.legend.container).offset().left;
			y = $(options.legend.container).offset().top;
		} else {
			var pos = "";
			var p = options.legend.position;
			var m = options.legend.margin;
			if(m[0] == null) m = [m, m];
			if(p.charAt(0) == "n")
				y = Math.round(plotOffset.top + options.grid.borderWidth + m[1]);
			else if(p.charAt(0) == "s")
				y = Math.round(plotOffset.top + options.grid.borderWidth + plotHeight - m[0] - legendHeight);
			if(p.charAt(1) == "e")
				x = Math.round(plotOffset.left + options.grid.borderWidth + plotWidth - m[0] - legendWidth);
			else if(p.charAt(1) == "w")
				x = Math.round(plotOffset.left + options.grid.borderWidth + m[0]);
			if(options.legend.backgroundOpacity != 0.0) {
				var c = options.legend.backgroundColor;
				if(c == null) c = options.grid.backgroundColor;
				if(c && typeof c == "string") {
					ctx.globalAlpha = options.legend.backgroundOpacity;
					ctx.fillStyle = c;
					ctx.fillRect(x, y, legendWidth, legendHeight);
					ctx.globalAlpha = 1.0;
				}
			}
		}
		
		var posx, posy, rowCnt, entryCnt, rowLabelWidths;
		var entryCnt = 0; 
		rowLabelWidths = 0;
		for(var colCnt = 0; colCnt < cols; ++colCnt){
			rowCnt = -1;
			while((entryCnt < num_labels) & (rowCnt < (rowsArray[colCnt]-1))){
				
				rowCnt++;
				label = labelArray[entryCnt];
				
				posy = y + (rowCnt * LEGEND_BOX_LINE_HEIGHT) + 2;
				posx = x + (colCnt * LEGEND_BOX_WIDTH) + rowLabelWidths;
				ctx.fillStyle = options.legend.labelBoxBorderColor;
				ctx.fillRect(posx, posy, 18, 14);
				ctx.fillStyle = "#FFF";
				ctx.fillRect(posx + 1, posy + 1, 16, 12);
				ctx.fillStyle = labelColorArray[entryCnt];
				ctx.fillRect(posx + 2, posy + 2, 14, 10);
				posx = posx + 22;
				posy = posy + f.size + 2;

				if(options.legend.labelColor){
					ctx.fillStyle = options.legend.labelColor;
				}else{
					ctx.fillStyle = options.grid.color;
				}
				ctx.fillText(label, posx, posy);
				entryCnt++;
			}
			rowLabelWidths = rowLabelWidths + colWidthArray[colCnt] + COLUMN_PADDING;
		} 
		container.remove(); // remove the HTML version
	}

	$.plot.plugins.push({
		init: init,
		options: {},
		name: 'legendoncanvas',
		version: '1.0'
	});
})(jQuery);