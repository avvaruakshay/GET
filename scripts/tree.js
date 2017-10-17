"use strict";

var range = function(start, end, step, offset) {
  var len = (Math.abs(end - start) + ((offset || 0) * 2)) / (step || 1) + 1;
  var direction = start < end ? 1 : -1;
  var startingPoint = start - (direction * (offset || 0));
  var stepSize = direction * (step || 1);

  return Array(len).fill(0).map(function(_, index) {
    return startingPoint + (stepSize * index);
  });
}

var expandChange = function(obj){
  var thisId = obj.parentElement.id;
  for (var i in range(1, leaves.length)){
    var childId = thisId+":"+(parseInt(i)+1);
    if (document.getElementById(childId)){
      var parentLi = document.getElementById(childId).parentElement;
      parentLi.style.display = (parentLi.style.display == "none") ? "list-item" : "none";
    }
    else {break;}
  }
}

var addChange = function(obj){
  if (obj.className.split(" ")[2] == 0){
    obj.className = "glyphicon glyphicon-ok-sign 1";
    obj.style.color = "green";
  }
  else{
    obj.className = "glyphicon glyphicon-plus-sign 0";
    obj.style.color = "#1565C0";
  }
}

console.log(document.documentElement.clientHeight);
console.log(document.documentElement.clientWidth);

for (var l in leaves){
  var leaf = leaves[l];
  var thisId = leaf.idName;
  var parentId = leaf.idName.split(":").slice(0,-1).join(":");
  var branchList = document.getElementById(parentId + "-ul");
  var stemLi = document.createElement("LI");
  if (leaf.idName.split(":").length > 2){stemLi.style.display = "none";}
  var stemDiv = document.createElement("div")
  stemDiv.id = thisId;
  var leafDiv = document.createElement("div")
  leafDiv.onclick = function() {expandChange(this)};
  leafDiv.className = "leaf";
  var leafSpan = document.createElement("span");
  leafSpan.className ="glyphicon glyphicon-plus-sign 0";
  leafSpan.id = "addIcon";
  leafSpan.onclick = function() {addChange(this)};
  var leafP = document.createElement("p");
  leafP.innerHTML = leaf.name
  var subleaf = document.createElement("ul");
  subleaf.id = thisId + "-ul";
  leafDiv.appendChild(leafSpan)
  leafDiv.appendChild(leafP)
  stemDiv.appendChild(leafDiv)
  stemDiv.appendChild(subleaf)
  stemLi.appendChild(stemDiv)
  branchList.appendChild(stemLi);
}
