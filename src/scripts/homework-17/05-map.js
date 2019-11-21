import * as d3 from 'd3'
import * as topojson from 'topojson'

const margin = { top: 0, left: 150, right: 0, bottom: 0 }

const height = 600 - margin.top - margin.bottom

const width = 1000 - margin.left - margin.right

const svg = d3
  .select('#chart-5')
  .append('svg')
  .attr('height', height + margin.top + margin.bottom)
  .attr('width', width + margin.left + margin.right)
  .append('g')
  .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

const colorScale = d3
  .scaleOrdinal()
  .range([
    '#a6cee3',
    '#1f78b4',
    '#b2df8a',
    '#33a02c',
    '#fb9a99',
    '#e31a1c',
    '#fdbf6f',
    '#ff7f00',
    '#cab2d6',
    '#6a3d9a',
    '#ffff99'
  ])
const projection = d3.geoAlbersUsa().scale(900)
const path = d3.geoPath().projection(projection)
const radiusScale = d3.scaleSqrt().range([0, 7])

// colorScale//

Promise.all([
  d3.json(require('/data/us_states.topojson')),
  d3.csv(require('/data/powerplants.csv'))
])
  .then(ready)
  .catch(err => console.log('Failed on', err))

function ready([json, datapoints]) {
  console.log(json)

  const states = topojson.feature(json, json.objects.us_states)

  const powerExtent = d3.extent(datapoints, d => d.Total_MW)

  radiusScale.domain(powerExtent)

  svg
    .selectAll('path')
    .data(states.features)
    .enter()
    .append('path')
    .attr('class', 'state')
    .attr('d', path)
    .attr('fill', 'lightgrey')

  svg
    .selectAll('circle')
    .data(datapoints)
    .enter()
    .append('circle')
    .attr('class', 'circle')
    .attr('r', function(d) {
      return radiusScale(d.Total_MW)
    })
    .attr('opacity', 0.5)
    .attr('transform', function(d) {
      const coords = [d.Longitude, d.Latitude]
      console.log(projection(coords))
      return `translate(${projection(coords)})`
    })
    .attr('fill', function(d) {
      return colorScale(d.PrimSource)
    })

  svg
    .selectAll('text')
    .data(states.features)
    .enter()
    .append('text')
    .text(function(d) {
      return d.properties.abbrev
    })
    .attr('transform', function(d) {
      console.log(path.centroid(d))
      return `translate(${path.centroid(d)})`
    })
    .attr('text-anchor', 'middle')
    .attr('text-alignment', 'middle')
    .attr('alignment-baseline', 'middle')
    .attr('font-size', 12)
    .attr('dy', function(d) {
      if (d.properties.abbrev === 'Alaska') {
        return 10
      } else {
        return 0
      }
    })
    .attr('dx', function(d) {
      if (d.properties.postal === 'Alaska') {
        return 10
      } else if (d.properties.postal === 'Ohio') {
        return 10
      } else {
        return 0
      }
    })

  const keys = [
    'Hydroelectric',
    'Coal',
    'Natural Gas',
    'Nuclear',
    'Petroleum',
    'Pumped Storage',
    'Geothermal',
    'Biomass',
    'Wind',
    'Other',
    'Solar'
  ]
  svg
    .selectAll('dots')
    .data(keys)
    .enter()
    .append('circle')
    .attr('cx', 5)
    .attr('cy', function(d, i) {
      return 80 + i * 35
    })
    .attr('r', 10)
    .style('fill', function(d) {
      return colorScale(d)
    })
  svg
    .selectAll('labels')
    .data(keys)
    .enter()
    .append('text')
    .attr('x', 25)
    .attr('y', function(d, i) {
      return 80 + i * 35
    })
    .style('fill', 'black')
    .text(function(d) {
      return d
    })
    .attr('text-anchor', 'left')
    .style('alignment-baseline', 'middle')
    .attr('font-size', 12)
    .style(
      'text-shadow',
      '-1px -1px 0 #fff, 1px -1px 0 #fff, -1px 1px 0 #fff, 1px 1px 0 #fff'
    )
}
