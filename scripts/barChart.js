'use strict';

/* -- Convert data readable for the bar chart function
      Format is array of Objects with "key" and "value" elements ------------ */
const barDatum = function(data, key, yVector) {
    let dataOut = [];
    let yLabel;
    let colorKey;

    const uniqueKeys = getUniqueElements(data, key).sort();

    for (let a in uniqueKeys) {
        let valueObj = {}
        a = uniqueKeys[a];
        valueObj.key = a;
        valueObj.colorKey = a;
        if (key === 'Organism'){
            valueObj.value = parseFloat(getMatchingRows(data, key, a)[0][yVector]);
            yLabel = tipNames[yVector];
        }
        else {
            valueObj.value = getMatchingRows(data, key, a).length;
            yLabel = 'Genomes';
        }
        dataOut.push(valueObj);
    }

    const barZeros = document.getElementById('bar-zeros');
    if (key === 'Organism' && !(barZeros.checked)){
        dataOut = dataOut.filter(function(d){ return d.value > 0;})
    }

    const barsort = document.getElementById('bar-sort');
    if (barsort.checked) {
        dataOut = _.sortBy(dataOut, function(d){ return 1/d.value;})
    }

    let rotateXtick;
    let maxStringLength;
    if (uniqueKeys.length < 9){
        rotateXtick = 0;
        maxStringLength = 0;
    }
    else {
        rotateXtick= 45;
        maxStringLength = d3.max(uniqueKeys.map(function(d){return d.length;}));
    }

    const barObj = {
        data: dataOut,
        xLabel: key,
        yLabel: yLabel,
        svgid: "graph-svg",
        margin: { top: 20, right: 10, bottom: 50 + (2.5)*maxStringLength, left: 70},
        rotateXtick: rotateXtick
    }

    return barObj;
}


/*-- The BAR CHART FUNCTION

    --*/
const barChart = function(Obj) {

    let svgId;
    /*     Error handling for invalid SVGID
    Checks if the id exists
    And if yes Checks if it is attributed to SVG tag      */
    if (!(Obj.hasOwnProperty("svgid") && document.getElementById(Obj.svgid).tagName === "svg")) {
        try {
            const svgIdError = new UnImplementedError("SvgIdError", "Invalid SVG id given!");
            throw svgIdError;
        } catch (svgIdError) {
            console.log(svgIdError.name, ":", svgIdError.message);
        }
    } else {
        svgId = Obj.svgid;
    }

    /* Defining defaults for different plotting parameters. */

    const data = Obj.data; // Data for the plot
    const color = (Obj.color) ? Obj.color : "Teal"; // Default color of the bar set to "Teal"
    const svgH = (Obj.height) ? Obj.height : document.getElementById(svgId).getBoundingClientRect().height; // Getting height of the svg
    const svgW = (Obj.width) ? Obj.width : document.getElementById(svgId).getBoundingClientRect().width; // Getting width of the svg
    const margin = (Obj.margin) ? Obj.margin : { top: 40, right: 20, bottom: 40, left: 40}; // Margins for the plot
    const rotateXtick = (Obj.rotateXtick) ? Obj.rotateXtick : 0; // Rotating the X-ticks
    const xLabel = (Obj.xLabel) ? Obj.xLabel : 'X-Axis'; // X-label value
    const yLabel = (Obj.yLabel) ? Obj.yLabel : 'Y-Axis'; // Y-label value
    const plotH = svgH - margin.top - margin.bottom; // Calculating the actual width of the plot
    const plotW = svgW - margin.left - margin.right; // Calculating the actual height of the plot
    const plotStartx = margin.left; // X-coordinate of the start of the plot
    const plotStarty = margin.top; // Y-coordinate of the start of the plot
    const xticks = getUniqueElements(data, 'key'); // The x-axis ticks
    const yMax = get_maxcod(d3.max(getUniqueElements(data, 'value'))); // Max value of the y-axis


    /* -- Svg node selection ------------------------------------------------ */
    const svg = d3.select("#" + svgId);

    /* -- Clearing previous elements inside the svg ------------------------- */
    svg.selectAll('g').remove();

    /* --  Defining the scale for X-axis ------------------------------------ */
    const xScale = scale({
        domain: xticks,
        range: [plotStartx, plotStartx + plotW],
        scaleType: 'band',
    });

    let barWidth;
    if (xScale.bandwidth() <= 100){
        barWidth = xScale.bandwidth();
    }
    else{ barWidth = 100;}

    /* -- Defining and Callling X-axis -------------------------------------- */
    const xAxis = axis({
        scale: xScale,
        orient: 'bottom'
    });
    const xAxisElement = svg.append('g')
        .attr('class', 'x axis')
        .attr('transform', 'translate(0,' + (plotStarty + plotH) + ')')
        .call(xAxis);

    /* -- Defining scale for Y-axis ----------------------------------------- */
    const yScale = scale({
        domain: [0, yMax],
        range: [plotH + plotStarty, plotStarty],
        scaleType: 'linear',
    });

    /* -- Defining and Calling Y-axis --------------------------------------- */
    const yAxis = axis({
        scale: yScale,
        ticks: 6
    });
    const yAxisElement = svg.append('g')
        .attr('class', 'y axis')
        .attr('transform', 'translate(' + margin.left + ', 0)')
        .call(yAxis);

    /* -- Defining tooltip -------------------------------------------------- */
    const tip = d3.tip()
        .attr('class', 'd3-tip')
        .offset([-10, 0])
        .html(function(d) {
            return "<center style='font-size: 10px'><b>" + d.key + "</b></center><strong  style='font-size: 10px'>" + yLabel + "</strong> <span style='color:yellow; font-size: 10px'><b>" + d.value + "</b></span>";
        })


    /* -- Plotting the BARS ------------------------------------------------- */
    const plotCanvas = svg.append('g').attr('id', 'plotCanvas');
    svg.call(tip);

    plotCanvas.selectAll('rect .bar')
            .data(data)
            .enter()
            .append('rect')
            .attr('class', 'bar')
            .attr('width', barWidth)
            .attr('x', function(d) {
                return xScale(d.key) + xScale.bandwidth()/2 - barWidth/2;
            })
            .attr('y', function(d) {
                return yScale(0);
            })
            .attr('fill', function(d){ return barPalette[d.colorKey];})
            .on('mouseover', tip.show)
            .on('mouseout', tip.hide)
            .transition()
            .duration(1000)
            .attr('y', function(d) {
                return yScale(d.value);
            })
            .attr('height', function(d) {
                return yScale(0) - yScale(d.value);
            });

    /* -- Adding X-axis label ----------------------------------------------- */
    axislabel({
        selector: '.x.axis',
        orient: 'bottom',
        fontweight: 'bold',
        size: 16,
        distance: margin.bottom - 30,
        text: xLabel,
    });

    /* -- Adding Y-axis label ----------------------------------------------- */
    axislabel({
        selector: '.y.axis',
        orient: 'left',
        fontweight: 'bold',
        size: 16,
        distance: 10,
        text: yLabel,
    });

    /* -- Rotating labels X-label ------------------------------------------- */
    rotateXticks({
        axisSelector: '.x',
        angle: rotateXtick
    });


    /* -- Defining Sort Bar Function --------------------------------------- */
    const sortChange = function(time = 1000) {

        console.log('sortChange called!')
        // Copy-on-write since tweens are evaluated after a delay.
        const barsort = document.getElementById('bar-sort');
        var x0 = xScale.domain(data.sort(barsort.checked
            ? function(a, b) { return b.value - a.value; }
            : function(a, b) { return d3.ascending(a.key, b.key); })
            .map(function(d) { return d.key; }))
            .copy();

        svg.selectAll(".bar")
            .sort(function(a, b) { return x0(a.key) - x0(b.key); });

        let transition = svg.transition().duration(750);
        let delay = function(d, i) { return i * (time/data.length); };

        transition.selectAll(".bar")
                  .delay(delay)
                  .attr("x", function(d) { return x0(d.key) + x0.bandwidth()/2 - barWidth/2 ; });

        transition.select(".x.axis")
                  .call(xAxis)
                  .selectAll("g")
                  .delay(delay);
    }

    /*-- Assinging callback to Sort ------------------------------------------*/
    d3.select("#bar-sort").on("change", sortChange);

    /* -- End of barChart() function -----------------------------------------*/
};
