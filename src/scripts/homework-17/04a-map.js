import * as d3 from 'd3'
import * as topojson from 'topojson'

const margin = { top: 350, left: 800, right: 20, bottom: 0 }

const height = 400 - margin.top - margin.bottom

const width = 700 - margin.left - margin.right

const svg = d3
  .select('#chart-4a')
  .append('svg')
  .attr('height', height + margin.top + margin.bottom)
  .attr('width', width + margin.left + margin.right)
  .append('g')
  .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

const colorScale = d3.scaleSequential(d3.interpolatePiYG).domain([0, 2])

const projection = d3.geoMercator().scale(560)
const path = d3.geoPath().projection(projection)

d3.json(require('/data/counties_with_election_data.topojson'))
  .then(ready)
  .catch(err => console.log('Failed on', err))

function ready(json) {
  console.log(json)

  const counties = topojson.feature(json, json.objects.us_counties)

  svg
    .selectAll('path')
    .data(counties.features)
    .enter()
    .append('path')
    .attr('class', 'county')
    .attr('d', path)
    .attr('fill', d => {
      if (d.properties.state === 'Maine') {
        return 'red'
      } else {
        return colorScale(d.properties.trump / d.properties.clinton)
      }
    })
    .attr('opacity', function(d) {
      return (d.properties.trump + d.properties.clinton) / 100000
    })
}
