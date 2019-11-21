import * as d3 from 'd3'

let margin = { top: 0, left: 0, right: 0, bottom: 0 }
let height = 500 - margin.top - margin.bottom
let width = 700 - margin.left - margin.right

let svg = d3
  .select('#chart-3')
  .append('svg')
  .attr('height', height + margin.top + margin.bottom)
  .attr('width', width + margin.left + margin.right)
  .append('g')
  .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

const colorScale = d3
  .scaleLinear()
  .domain([0, 100])
  .range(['purple', 'green'])

function ready([hexFile, datapoints]) {}
