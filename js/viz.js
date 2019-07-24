import { KMeans } from "./kmeans.js";

function clearCanvas(canvas) {
  var ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function drawColoredQuake(canvas,color, x,y,mag) {
  var ctx = canvas.getContext("2d");
  ctx.fillStyle = color;
  // To draw rectangles (faster):
  // var width = Math.sqrt(10**mag / 100000);
  // ctx.fillRect(x, y, width, width);
  ctx.beginPath(); //Start path
  // Weighted by sqrt(magnitude) -- so the area scales linearly with magnitude.
  // ctx.arc(x, y, Math.sqrt(10**mag / 100000), 0, Math.PI * 2, true);
  ctx.arc(x, y, 1, 0, Math.PI * 2, true);
  ctx.fill();
}

function drawQuake(canvas, x,y,mag) {
  // Red color
  drawColoredQuake(canvas, "#ff2626", x, y, mag);
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
  var url = "./data/earthquakes.geojson";
  var quakes = await downloadPoints(url);

  // TODO(emacs): Iterate and show the results as they go. We want a generator
  // that yields current assignments at each step.
  var kmeans = new KMeans();
  // d3 d10 color map
  let colors = [
    '#1f77b4',
    '#ff7f0e',
    '#2ca02c',
    '#d62728',
    '#9467bd',
    '#8c564b',
    '#e377c2',
    '#7f7f7f',
    '#bcbd22',
    '#17becf'
  ];

  const urlParams = new URLSearchParams(window.location.search);
  let k = +urlParams.get('k');
  if (k === null || k < 2)
    k = 5;
  if (k > colors.length)
    k = colors.length;

  const labels = kmeans.cluster(quakes, k);
  clearCanvas(canvas);

  for (let i = 0; i < quakes.length; i++) {
    let quake = quakes[i];
    let color = colors[labels[i]]
    drawColoredQuake(canvas, color,
                     quake.x * 2, quake.y * 2,
                     quake.mag);
  }
})();
