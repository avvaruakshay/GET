"use strict";

var svgNS = "http://www.w3.org/2000/svg";
var vH = document.documentElement.clientHeight;
var vW = document.documentElement.clientWidth;

var theCanvas = document.getElementById("theCanvas");

var mainCircle = document.getElementById("main");
mainCircle.setAttributeNS(null, "cx", vW/2);
mainCircle.setAttributeNS(null, "cy", 20);
mainCircle.setAttributeNS(null, "r", 20);
mainCircle.setAttributeNS(null, "fill", "yellow");

var stem1 = document.createElementNS(svgNS, "line")
stem1.setAttributeNS(null, "x1", vW/2);
stem1.setAttributeNS(null, "y1", 20);
stem1.setAttributeNS(null, "x2", vW/2);
stem1.setAttributeNS(null, "y2", 100);
stem1.setAttributeNS(null, "stroke", "black");

var stemAnimate = document.createElementNS(svgNS, "animate");
stemAnimate.setAttributeNS(null, "id", "line");
stemAnimate.setAttributeNS(null, "attributeName", "y2");
stemAnimate.setAttributeNS(null, "from", "20");
stemAnimate.setAttributeNS(null, "to", "100");
stemAnimate.setAttributeNS(null, "dur", "5s");

stem1.appendChild(stemAnimate);
theCanvas.insertBefore(stem1, mainCircle);
