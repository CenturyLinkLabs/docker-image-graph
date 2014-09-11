var graph = docker_image_graph
  .stack('.container')
  .canvas({
    barHeight: 50,
    margin: {top: 30, right: 0},
    barWidth: 500,
    width: 960
  })
  .data("/images.json")
  .on('bar', 'mouseover', function(d, bar) {
    bar.attr('class', 'hover');
  });
