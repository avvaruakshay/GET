'use strict';
const filterIds = {
  'size-slider': ['Size(Mb)', 0.1],
  'gc-slider': ['GC%', 0.1],
  'gene-slider': ['Genes', 1],
  'protein-slider': ['Proteins', 1]};



/*-- Stopping the default action for the tooltips ----------------------------*/
function sp( event ){ event.stopPropagation(); }

/*-- Making the tooltip as an input element ----------------------------------*/
function makeTT ( i, slider ) {
	let tooltip = document.createElement('div'),
		  input = document.createElement('input');

	// Add the input to the tooltip
  tooltip.className = 'noUi-tooltip';
  tooltip.appendChild(input);

  input.className = 'tooltip-input';

  // On change, set the slider
  input.addEventListener('change', function(){
  	let values = [null, null];
    values[i] = this.value;
    slider.noUiSlider.set(values);
    callbackFilters(values);
  });

  // Catch all selections and make sure they don't reach the handle
  input.addEventListener('mousedown', sp);
  input.addEventListener('touchstart', sp);
  input.addEventListener('pointerdown', sp);
  input.addEventListener('MSPointerDown', sp);

  // Find the lower/upper slider handle and insert the tooltip
  slider.querySelector(i ? '.noUi-handle-upper' : '.noUi-handle-lower').appendChild(tooltip);

  return input;
}


/* -- Function for Initialsing the filters ---------------------------------- */
const initialiseFilters = function(data){
  for (let a in filterIds){
    const filterElem = document.getElementById(a);
    console.log(data[0]["Size(Mb)"]);
    const vectorData = getMatchingColumn(data, filterIds[a][0]).map(function(d){return parseFloat(d)});
    const vectorMax = d3.max(vectorData);
    const vectorMin = d3.min(vectorData);
    noUiSlider.create(filterElem, {
      start:[vectorMin,vectorMax],
      range:{
        'min': [vectorMin],
        'max': [vectorMax]
      },
      connect: [false, true, false],
      tooltips: [true, true],
      step: filterIds[a][1],
    });
    filterElem.noUiSlider.on("end", callbackFilters);
    filterElem.noUiSlider.on("change", callbackFilters);
    // An 0/1 indexed array of input elements
    filterElem.tooltipInputs = [makeTT(0, filterElem), makeTT(1, filterElem)];
    // When the slider changes, update the tooltip
    filterElem.noUiSlider.on('update', function(values, handle) {
      filterElem.tooltipInputs[handle].value = values[handle];
    });

  }
}

/*-- Toggle currentData after filtering based on legend ----------------------*/
const toggleCurrentData = function(){
  let tempData = [];
  for (let l in toggleCheck){
    if (toggleCheck[l]) {
      tempData = tempData.concat(getMatchingRows(currentData, level, l));
    }
  }
  // console.log(tempData);
  currentData = tempData;
  tempData = [];
}



/*-- Callback for the Filters ------------------------------------------------*/
const callbackFilters = function(val){
    let vectorLimits = {};
    const filterIdsKeys = Object.keys(filterIds);
    for (let filter in filterIdsKeys){
      filter = filterIdsKeys[filter];
      let filterElement = document.getElementById(filter);
      const value = filterElement.noUiSlider.get();
      vectorLimits[filterIds[filter][0]] = value.map(parseFloat);
    }
    currentData = [];
    for (let d in preFilterData){
      d = preFilterData[d];
      if (d['Size(Mb)'] <= vectorLimits['Size(Mb)'][1] && d['Size(Mb)'] >= vectorLimits['Size(Mb)'][0] && d['GC%'] <= vectorLimits['GC%'][1] && d['GC%'] >= vectorLimits['GC%'][0] && d['Genes'] <= vectorLimits['Genes'][1] && d['Genes'] >= vectorLimits['Genes'][0] && d['Proteins'] <= vectorLimits['Proteins'][1] && d['Proteins'] >= vectorLimits['Proteins'][0]){
          currentData.push(d);
      }
    }
    toggleCurrentData();
    // console.log(currentData);
    updateGraph(currentData, level, plotType, yVector);
}


/* -- Function for updating Filters ----------------------------------------- */
const updateFilters = function(data){
    data = _.filter(data, function(d){return d['view'] == 1;})
    for (let a in filterIds){
        const filterElem = document.getElementById(a);
        const vectorData = getMatchingColumn(data, filterIds[a][0]).map(function(d){return parseFloat(d)});
        const vectorMax = d3.max(vectorData);
        const vectorMin = d3.min(vectorData);
        filterElem.noUiSlider.updateOptions({
          start:[vectorMin,vectorMax],
          range: {
            'min': [vectorMin],
            'max': [vectorMax]
          }
        });
    }
}


/* -- Function to Reset Filters --------------------------------------------- */
const resetFilters = function(){
    const sliderElements = document.getElementsByClassName('slider');
    console.log(typeof sliderElements);
    currentData = preFilterData;
    for (let a in _.range(sliderElements.length)){
        const sliderElem = sliderElements[a];
        console.log(sliderElem);
        sliderElem.noUiSlider.reset();
    };
    updateGraph(currentData, level, plotType, yVector);
}
