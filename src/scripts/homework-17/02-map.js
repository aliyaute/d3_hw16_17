import * as d3 from 'd3'
import * as topojson from 'topojson'

const margin = { top: 0, left: 20, right: 20, bottom: 0 }

const height = 400 - margin.top - margin.bottom

const width = 700 - margin.left - margin.right

const svg = d3
  .select('#chart-2')
  .append('svg')
  .attr('height', height + margin.top + margin.bottom)
  .attr('width', width + margin.left + margin.right)
  .append('g')
  .style('background-color', 'blue')
  .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

const projection = d3.geoEqualEarth().scale(90)
const path = d3.geoPath().projection(projection)

Promise.all([
  d3.json(require('/data/world.topojson')),
  d3.csv(require('/data/airport-codes-subset.csv')),
  d3.csv(require('/data/flights.csv'))
])
  .then(ready)
  .catch(err => console.log('Failed on', err))

const coordinateStore = d3.map()

function ready([json, datapoints, flights]) {
  console.log('What is our data?')
  const countries = topojson.feature(json, json.objects.countries)
  console.log(json)
  console.log(countries)
  console.log(flights)

  datapoints.forEach(d => {
    const name = d.ident
    const coords = [d.longitude, d.latitude]
    coordinateStore.set(name, coords)
  })

  projection.fitSize([width, height], countries)

  svg
    .append('path')
    .datum({ type: 'Sphere' })
    .attr('d', path)
    .attr('fill', 'lightblue')
    .attr('stroke', 'black')

  svg
    .selectAll('path')
    .data(countries.features)
    .enter()
    .append('path')
    .attr('class', 'country')
    .attr('d', path)
    .attr('fill', 'lightgrey')
    .attr('stroke', 'black')

  svg
    .selectAll('circle')
    .data(datapoints)
    .enter()
    .append('circle')
    .attr('r', 0.9)
    .attr('opacity', 5)
    .attr('transform', function(d) {
      const coords = [d.longitude, d.latitude]
      return `translate(${projection(coords)})`
    })
    .attr('fill', 'white')

  svg
    .selectAll('.line_flights')
    .data(flights)
    .enter()
    .append('path')
    .attr('d', d => {
      const fromCoords = coordinateStore.get(d.from)
      const toCoords = coordinateStore.get(d.to)

      // Build a GeoJSON LineString
      const geoLine = {
        type: 'LineString',
        coordinates: [fromCoords, toCoords]
      }

      // Feed that to our d3.geoPath()
      return path(geoLine)
    })
    .attr('fill', 'none')
    .attr('stroke', 'white')
    .attr('stroke-width', 1.5)
    .attr('opacity', 0.5)
    .attr('stroke-linecap', 'round')
}
