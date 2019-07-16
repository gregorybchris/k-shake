function clearCanvas(canvas) {
  var ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function drawQuake(canvas, x,y,mag) {
  var ctx = canvas.getContext("2d");
  ctx.fillStyle = "#ff2626"; // Red color
  ctx.beginPath(); //Start path
  // Draw a point using the arc function of the canvas with a point structure.
  ctx.arc(x, y, Math.sqrt(10**mag / 100000), 0, Math.PI * 2, true);
  ctx.fill(); // Close the path and fill.
}

async function downloadPoints(url) {
  var json = await fetch(url).then(response => response.json());
  var features = json.features;
  var quakes = features.map(feature => {
    var coords = feature.geometry.coordinates;
    return {x: coords[0], y: coords[1], mag: feature.properties.mag};
  });
  // Flip the image
  quakes.forEach(quake => {
    quake.y = -quake.y;
  });

  // Adjust the points to fit in the canvas (0, 0) at center => (0, 0) at top
  // left
  var adjust_x = quakes[0].x;
  var adjust_y = quakes[0].y;
  var scale = 10;
  quakes.forEach(quake => {
    if (quake.x < adjust_x) adjust_x = quake.x;
    if (quake.y < adjust_y) adjust_y = quake.y;
  });
  adjust_x = Math.abs(adjust_x);
  adjust_y = Math.abs(adjust_y);
  quakes.forEach(quake => {
    quake.x += adjust_x;
    quake.y += adjust_y;
  });
  return quakes;
}

function renderQuakes(canvas, quakes) {
  clearCanvas(canvas);
  quakes.forEach(quake => {
    drawQuake(canvas, quake.x*2, quake.y*2, quake.mag);
  });
}

(async () => {
  var canvas = document.getElementById("canvas");
  var url = "data/earthquakes.geojson";
  var quakes = await downloadPoints(url);
  var num_iterations = 10;
  var t = performance.now();
  for (var i = 0; i < num_iterations; i++) {
    renderQuakes(canvas, quakes);
  }
  var ms_per_iteration = (performance.now() - t)/num_iterations;
  console.log(1000/ms_per_iteration, "fps");
})();
