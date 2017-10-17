'use strict';

/* -- Setting the SVG Height ------------------------------------------------ */
let svgHeight = ((100 - Math.round((100/document.getElementById('plot-area').clientHeight)*100)) + '%');
document.getElementById('graph-area').style.height = svgHeight;

/*-- Initialsing variables ---------------------------------------------------*/
let allData;
let currentData;
let preFilterData;
let kingdomSelected;
let kingdomData;
let groupSelected;
let groupData;
let subgroupSelected;
let subgroupData;
let level = 'Kingdom';
let sublevel = 'Group';
let plotType = 'bar';
let yVector = "Size(Mb)";
let xVector;
let histBins;
let labels;
let plotData;
let tipNames = {'Size(Mb)': 'Genome Size(MB)', 'GC%': 'GC%', 'Genes': 'Genes', 'Proteins': 'Proteins'};

let currentPalette;
let barPalette;
let scatterPalette;


/*-- Dynamically Updating the DropDowns --------------------------------------*/
const setDynamicOptions = function(selector, options, callback) {
  var att = "data-dinamic-opt";
  $(selector).find('[' + att + ']').remove();
  var html = $(selector + ' .menu').html();
  for(let key in options) {
    html += '<div class="item" data-value="' + options[key] + '" ' + att + '>' + options[key] + '</div>';
  }
  $(selector + ' .menu').html(html);
  $(selector).dropdown({
    onChange: callback,
  });
}

/* -- Updating the Graph ---------------------------------------------------- */
const updateGraph = function(data, level, type, yvector){
    let graphData = _.filter(data, function(d){ return d['view'] == 1;});
    if (type === 'bar'){
        plotData = barDatum(graphData, level, yvector);
        barChart(plotData);
    }

    else if (type === 'box'){
        plotData = boxDatum(data, level, yvector);
        boxChart(plotData);
    }

    else if (type === 'histogram') {
        histBins = parseInt(document.querySelector("#histogram-bins").value);
        plotData = histogramDatum(data, yvector, histBins);
        histogramChart(plotData);
    }

    else if (type === 'scatter') {
        // console.log(document.querySelector("#scatter-xaxis-select .menu .selected"));
        // let xvector = document.querySelector("#scatter-xaxis-select .menu .selected").getAttribute("data-value");
        plotData = scatterDatum(data, xVector, yvector, level);
        scatterChart(plotData);
    }
}


/*-- Callback for Bins Chnage ----------------------------------------------*/
const histBinsElement = document.getElementById('histogram-bins');
histBinsElement.addEventListener("input" ,function(){
  histBins = parseInt(this.value);
  updateGraph(currentData, level, plotType, yVector);
});

/*-- Callback for Thresholds input -----------------------------------------*/
const histThresholdsElement = document.getElementById('histogram-thresholds');
histThresholdsElement.addEventListener('keypress', function(event){
    if (event.key === 'Enter'){
      let thresholdsString = this.value;
      thresholdsString = thresholdsString.replace(/^,{1,}/g,'');
      thresholdsString = thresholdsString.replace(/,{1,}$/g,'');
      const thresholds = (thresholdsString.split(',')).map(parseFloat);
      plotData = histogramDatum(currentData, yVector, thresholds);
      histogramChart(plotData);
    }
});


      /* -- Callback for SubGroup Selection ------------------------------------- */
      const subgroupSelectCallback = function(val){
        level = 'SubGroup';
        subgroupSelected = val;
        subgroupData = (subgroupSelected === 'all') ? groupData : getMatchingRows(groupData, level, subgroupSelected);
        currentData= subgroupData;
        preFilterData = subgroupData;
        level = 'Organism';
        currentPalette = setCurrentPalette(currentData, subgroupSelected, level);
        barPalette = currentPalette[0];
        scatterPalette = currentPalette[1];
        updateGraph(currentData, level, plotType, yVector);
        updateFilters(currentData);
        populateLegend(currentData, level, plotType);
      };

      /* -- Callback for Group Selection ---------------------------------------- */
      const groupSelectCallback = function(val){
        level = 'Group'
        groupSelected = val;
        groupData = (groupSelected === 'all') ? kingdomData : getMatchingRows(kingdomData, level, groupSelected);
        currentData = groupData;
        preFilterData = groupData;
        level = 'SubGroup';
        currentPalette = setCurrentPalette(currentData, groupSelected, level);
        barPalette = currentPalette[0];
        scatterPalette = currentPalette[1];
        const subgroups = getUniqueElements(groupData, level).sort();
        currentPalette = setCurrentPalette(subgroups);
        setDynamicOptions('#subgroup-select', subgroups, subgroupSelectCallback);
        updateGraph(currentData, level, plotType, yVector);
        updateFilters(currentData);
        populateLegend(currentData, level, plotType);
      };

      /* -- Callback for Kingdom Selection -------------------------------------- */
      const kingdomSelectCallback = function(val){
        level = 'Kingdom';
        kingdomSelected = val;
        kingdomData = (kingdomSelected === 'all') ? allData : getMatchingRows(allData, level, kingdomSelected);
        // currentData = kingdomData;
        currentData.map(function(d){
          if (d['Kingdom'] == kingdomSelected) {d['view'] = 1;}
          else {d['view'] = 0;}
        });
        preFilterData = kingdomData;
        level = 'Group';
        currentPalette = setCurrentPalette(currentData, kingdomSelected, level);
        barPalette = currentPalette[0];
        scatterPalette = currentPalette[1];
        const groups = getUniqueElements(kingdomData, level).sort();
        setDynamicOptions('#group-select', groups, groupSelectCallback);
        updateGraph(currentData, level, plotType, yVector);
        updateFilters(currentData);
        populateLegend(currentData, level, plotType);

      };

      const searchCallback = function(category, value){
        if (category === 'Kingdom'){
          $('#kingdom-select').dropdown('set selected', value);
          $('#group-select').dropdown('set text', 'All Groups');
          $('#subgroup-select').dropdown('set text', 'All SubGroups');
        }
        else if (category === 'Group'){
          const kingdom = getMatchingRows(allData, category, value)[0]['Kingdom'];
          $('#kingdom-select').dropdown('set selected', kingdom);
          $('#group-select').dropdown('set selected', value);
          $('#subgroup-select').dropdown('set text', 'All SubGroups');
        }
        else if (category === 'SubGroup' || category === 'Organism'){
          const kingdom = getMatchingRows(allData, category, value)[0]['Kingdom'];
          const group = getMatchingRows(allData, category, value)[0]['Group'];
          const subgroup = getMatchingRows(allData, category, value)[0]['SubGroup'];
          $('#kingdom-select').dropdown('set selected', kingdom);
          $('#group-select').dropdown('set selected', group);
          $('#subgroup-select').dropdown('set selected', subgroup);
        }
      };


/*-- Semantic UI initialisers ------------------------------------------------*/
$(document).ready(function(){

    $(".unchecked").checkbox('uncheck');
    $(".checked").checkbox('check');
    document.getElementById('box-zeros').onchange = function(){
        updateGraph(currentData, level, plotType, yVector);
    }
    document.getElementById('hist-zeros').onchange = function(){
        updateGraph(currentData, level, plotType, yVector);
    }
    document.getElementById('bar-zeros').onchange = function(){
        updateGraph(currentData, level, plotType, yVector);
    }
    document.getElementById('reset-filters').onclick = resetFilters;

    document.getElementById('show-table').onclick = function(){
      $('body').dimmer('show');
      setTimeout(function() {
        populateDataTable(preFilterData);
        $('body').dimmer('hide');
        $('.ui.modal').modal('show');
      }, 0);
      $('.checkbox').checkbox('uncheck');
    };

    const currentToggleElem = document.getElementById('current');
    currentToggleElem.addEventListener('change', function(){
        if (this.checked){ populateDataTable(currentData);}
        else { populateDataTable(preFilterData);}
    });

    /*-- Making svg Resizable --*/
    $("#graph-svg").draggable({ handle: 'rect' })
                    .resizable({ aspectRatio: 1.0 });

    $('.yaxis-select').dropdown({
      onChange: function(val){
        yVector = val;
        updateGraph(currentData, level, plotType, yVector);
      }
    });

    $('.xaxis-select').dropdown({
      onChange: function(val){
        xVector = val;
        updateGraph(currentData, level, plotType, yVector);
      }
    });

    $('.item, .search, .toggle-cell, .button').popup({
      delay: {
          show: 500,
          hide: 0,
      },
      boundary: window,
    });


    /* -- Callback for Graph type selection ----------------------------------- */
    $('#graph-tab .item').tab({
      history:false,
      'onVisible' : function(tab){
          plotType = tab;
          yVector = document.querySelector("#"+plotType+"-yaxis-select .menu .selected").getAttribute("data-value");
          if (tab === 'scatter') {
              xVector = document.querySelector("#"+plotType+"-xaxis-select .menu .selected").getAttribute("data-value");
          }
          const selected = document.querySelector("#"+getParent(level).toLowerCase()+"-select .menu .selected").getAttribute("data-value");
          populateLegend(preFilterData, level, plotType);
          updateGraph(currentData, level, plotType, yVector);
        }
    });


      /* -- Callback for Control tab -------------------------------------------- */
      $('#controls-tab .item').tab({
        history: false,
      });

      /* -- Search in Selection ----------------------------------------------- */
      $("#selection-search").search({
        source : searchSource,
        searchFullText : false,
        searchFields: ['value'],
        fields: {
          title: 'value',
          description: 'category',
        },
        onSelect: function(result, response){
          searchCallback(result.category, result.value);
        },
      });

      const Window = document.getElementsByTagName('body')[0];
      Window.onresize = function(){
          svgHeight = ((100 - Math.round((100/document.getElementById('plot-area').clientHeight)*100)) + '%');
          document.getElementById('graph-area').style.height = svgHeight;
          updateGraph(currentData, level, plotType, yVector);
      };

      // const closeModal = document.getElementById('closeModal');
      // closeModal.addEventListener('click', function(){
      //
      // });


});

d3.tsv('data/all.tsv', function(data){
  allData = data;
  // Adding a boolen value for the data to be displayed in the plot.
  allData.map(function(d){d['view'] = 1;});
  currentData = allData;
  preFilterData = allData;
  console.log(currentData);
  initialiseFilters(currentData);
  const kingdoms = getUniqueElements(currentData, level).sort();
  currentPalette = setCurrentPalette(currentData, 'GOD', 'Kingdom');
  barPalette = currentPalette[0];
  scatterPalette = currentPalette[1];
  updateGraph(currentData, level, plotType, yVector);
  populateLegend(currentData, level, plotType);


  /* -- Initialising the Kingdom Select DropDown ---------------------------- */
  $('#kingdom-select').dropdown({
    onChange: kingdomSelectCallback,
  });

});
