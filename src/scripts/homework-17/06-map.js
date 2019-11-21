import * as d3 from 'd3'
import * as topojson from 'topojson'

const margin = { top: 0, left: 0, right: 0, bottom: 0 }

const height = 300 - margin.top - margin.bottom
const width = 330 - margin.left - margin.right

const container = d3.select('#chart-6')

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
  const nested = d3
    .nest()
    .key(function(d) {
      return d.PrimSource
    })
    .entries(datapoints)
  console.log(nested)

  const states = topojson.feature(json, json.objects.us_states)

  const powerExtent = d3.extent(datapoints, d => d.Total_MW)

  radiusScale.domain(powerExtent)

  projection.fitSize([width, height], states)

  container
    .selectAll('svg')
    .data(nested)
    .enter()
    .append('svg')
    .attr('height', height + margin.top + margin.bottom)
    .attr('width', width + margin.left + margin.right)
    .append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
    .each(function(d) {
      const datapoints = d.values
      const svg = d3.select(this)

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
          return `translate(${projection(coords)})`
        })
        .attr('fill', function(d) {
          return colorScale(d.PrimSource)
        })

      svg
        .selectAll('text')
        .data(nested)
        .enter()
        .append('text')
        .text(d.key)
        .attr('x', 150)
        .attr('y', 150)
        .attr('text-anchor', 'middle')
        .style('alignment-baseline', 'middle')
        .attr('font-size', 12)
        .style(
          'text-shadow',
          '-1px -1px 0 #fff, 1px -1px 0 #fff, -1px 1px 0 #fff, 1px 1px 0 #fff'
        )
    })
}
