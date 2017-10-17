"use strict";

let toggleCheck = {};

const populateLegend = function(data, level, type){
    const legendHead = document.getElementById('legend-head');
    legendHead.innerHTML = level;

    const labels = getUniqueElements(data, level).sort();

    toggleCheck = {};
    for (let l in labels){
      toggleCheck[labels[l]] = 1;
    }

    d3.select('#legend-table')
      .select('tbody')
      .selectAll('tr')
      .remove();

    const legendRow = d3.select('#legend-table')
                        .select('tbody')
                        .selectAll('tr')
                        .data(labels)
                        .enter()
                        .append('tr');

    legendRow.append('td')
             .attr('class', 'toggle-cell')
             .append('i')
             .attr('class', 'unhide icon')
             .attr('data-content', 'Toggle Hide/Unhide in plot.')
             .on('click', toggleLegend)
             .style('font-size', '20px')
             .style('cursor', 'pointer');

    const legendLabel = legendRow.append('td')
                                 .attr('class', 'single line');

    legendLabel.append('i')
               .attr('class', 'circle icon')
               .style('color', function(d){
                   let color = (type === 'scatter') ? scatterPalette[d] : barPalette[d];
                   return color;
               });

    legendLabel.append('text')
               .text(function(d){return d;});

    if (level != 'Kingdom'){
        legendLabel.append('div')
                   .append('text')
                   .style('font-size', '10px')
                   .style('font-style', 'italic')
                   .style('margin-left', '20px')
                   .text(function(d){
                      return (getParent(level) + ': ' + getMatchingRows(data, level, d)[0][getParent(level)]);
                   });
   }

}

/*-- Callback for the Filters ------------------------------------------------*/
const toggleLegend = function(d){
   //  console.log(d);
    if (this.className == 'unhide icon'){
        this.className = 'hide icon';
        toggleCheck[d] = 0;
        console.log(toggleCheck);
        let tempData = [];
        const labels = getUniqueElements(currentData, level);
        for (let l in labels){
            l = labels[l];
            if (l != d) {
                tempData = tempData.concat(getMatchingRows(currentData, level, l));
            }
        }
        currentData = tempData;
    }

    else if (this.className == 'hide icon'){
        this.className = 'unhide icon';
        toggleCheck[d] = 1;
        let addData = getMatchingRows(preFilterData, level, d);
        currentData = currentData.concat(addData);
        callbackFilters();
    }
    updateGraph(currentData, level, plotType, yVector);
}
