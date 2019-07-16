document.getElementById("canvas").onclick = function (e) {
  getPosition(e); 
};

var pointSize = 3;

function getPosition(event){
  var rect = canvas.getBoundingClientRect();
  // x == the location of the click in the document - the location (relative to
  // the left) of the canvas in the document
  var x = event.clientX - rect.left;
  // y == the location of the click in the document - the location (relative to
  // the top) of the canvas in the document
  var y = event.clientY - rect.top;
  // This method will handle the coordinates and will draw them in the canvas.
  drawPoint(x,y);
}

function clearCanvas() {
  var canvas = document.getElementById("canvas");
  var ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function drawPoint(x,y) {
  var ctx = document.getElementById("canvas").getContext("2d");
  ctx.fillStyle = "#ff2626"; // Red color
  ctx.beginPath(); //Start path
  // Draw a point using the arc function of the canvas with a point structure.
  ctx.arc(x, y, pointSize, 0, Math.PI * 2, true);
  ctx.fill(); // Close the path and fill.
}

function setPointSize(size) {
  pointSize = size;
}

setPointSize(1);
clearCanvas();

var url = "data/earthquakes-medium.geojson";
fetch(url).then(function(response) {
  return response.json();
}).then(function(response) {
  var features = response.features;
  return features.map(feature => {
    return feature.geometry.coordinates;
  });
}).then(function(coords) {
  coords.forEach(coord => {
    coord[1] = -coord[1];
  });
  return coords;
}).then(function(coords) {
  var adjust_x = coords[0][0];
  var adjust_y = coords[0][1];
  coords.forEach(coord => {
    if (coord[0] < adjust_x) adjust_x = coord[0];
    if (coord[1] < adjust_y) adjust_y = coord[1];
  });
  adjust_x = Math.abs(adjust_x);
  adjust_y = Math.abs(adjust_y);
  coords.forEach(coord => {
    coord[0] += adjust_x;
    coord[1] += adjust_y;
  });
  return coords;
}).then(function(coords) {
  console.log(coords);
  coords.forEach(coord => {
    drawPoint(coord[0]*2, coord[1]*2);
  });
});
