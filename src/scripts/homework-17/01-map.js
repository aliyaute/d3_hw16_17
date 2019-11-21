import * as d3 from 'd3'
import * as topojson from 'topojson'

const margin = { top: 0, left: 0, right: 0, bottom: 0 }

const height = 500 - margin.top - margin.bottom

const width = 900 - margin.left - margin.right

const svg = d3
  .select('#chart-1')
  .append('svg')
  .attr('height', height + margin.top + margin.bottom)
  .attr('width', width + margin.left + margin.right)
  .style('background-color', 'black')
  .append('g')
  .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

const colorScale = d3
  .scaleOrdinal()
  .range([
    '#f1eef6',
    '#d4b9da',
    '#c994c7',
    '#df65b0',
    '#e7298a',
    '#ce1256',
    '#91003f'
  ])

const projection = d3.geoMercator()
const graticule = d3.geoGraticule()
const path = d3.geoPath().projection(projection)

Promise.all([
  d3.json(require('/data/world.topojson')),
  d3.csv(require('/data/world-cities.csv'))
])
  .then(ready)
  .catch(err => console.log('Failed on', err))

function ready([json, datapoints]) {
  console.log('What is our data?')
  const countries = topojson.feature(json, json.objects.countries)
  console.log(json)
  console.log(countries)

  svg
    .append('path')
    .datum(graticule())
    .attr('d', path)
    .attr('stroke', 'grey')
    .attr('fill', 'none')

  svg
    .selectAll('path')
    .data(countries.features)
    .enter()
    .append('path')
    .attr('class', 'country')
    .attr('d', path)
    .attr('fill', '#333')

  console.log(graticule())

  svg
    .selectAll('circle')
    .data(datapoints)
    .enter()
    .append('circle')
    .attr('r', 0.7)
    .attr('opacity', 5)
    .attr('transform', function(d) {
      const coords = [d.lng, d.lat]
      return `translate(${projection(coords)})`
    })
    .attr('fill', function(d) {
      return colorScale(d.city)
    })
  // .on('mouseover', function() {
  //   const sel = d3.select(this)
  //   sel.moveToFront()
  // })
}
