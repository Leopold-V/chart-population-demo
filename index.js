const API_URL = 'https://restcountries.eu/rest/v2/all';

const getData = async () => {
  const reponse = await fetch(API_URL);
  const result = await reponse.json();
  // Sort by population
  const dataSort = result.sort((a, b) => b.population - a.population);
  // only keep the top 20 population
  dataSort.length = 10;
  // We only need name + population
  const dataReady = dataSort.map((country, index) => ({
    rank: index + 1,
    name: country.name,
    population: Math.floor(country.population / 1000000),
  }));
  console.log(dataReady);
  return dataReady;
};

const generateChart = (popData) => {
  const margin = {
    top: 20,
    right: 40,
    bottom: 60,
    left: 80,
  };
  const width = 1000 - margin.left - margin.right;
  const height = 500 - margin.top - margin.bottom;

  // Create svg
  const svgElement = d3
    .select('#chart')
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

  // Add X axis
  const xScale = d3
    .scaleBand()
    .range([0, width])
    .domain(popData.map((s) => s.name))
    .padding(0.2);
  svgElement
    .append('g')
    .attr('transform', `translate(0, ${height})`)
    .call(d3.axisBottom(xScale));

  // Add Y axis
  const yScale = d3
    .scaleLinear()
    .domain([popData[0].population, popData[9].population])
    .range([0, height]);
  svgElement.append('g').call(d3.axisLeft(yScale));

  // Add grid

  svgElement
    .append('g')
    .call(d3.axisLeft(yScale).ticks().tickSize(-width).tickFormat(''));

  // Draw the bars
  svgElement
    .append('g')
    .selectAll('.bar')
    .data(popData)
    .enter()
    .append('rect')
    .attr('class', 'bar')
    .attr('x', (d) => xScale(d.name))
    .attr('width', xScale.bandwidth())
    .attr('y', (d) => yScale(d.population))
    .attr('height', 0)
    .style('fill', '#00FA9A')
    .transition()
    .duration(750)
    .attr('height', (d) => height - yScale(d.population));

  // create a tooltip
  const tooltip = d3.select('#tooltip');
  const tooltip_name = d3.select('#country_name');
  const tooltip_pop = d3.select('#country_population');

  // Add mouse event to show the tooltip when hovering bars
  d3.selectAll('.bar')
    .on('mouseover', function () {
      d3.select(this).style('fill', '#59ffb2');
      tooltip.style('visibility', 'visible');
    })
    .on('mousemove', function (e, d) {
      tooltip
        .style('top', event.pageY - 10 + 'px')
        .style('left', event.pageX + 10 + 'px');
      tooltip_name.text(d.name);
      tooltip_pop.text(`Population: ${d.population} Millions`);
    })
    .on('mouseout', function () {
      d3.select(this).style('fill', '#00FA9A');
      tooltip.style('visibility', 'hidden');
    });

  // text label for the y axis
  svgElement
    .append('text')
    .attr('transform', 'rotate(-90)')
    .attr('y', 0 - margin.left)
    .attr('x', 0 - height / 2)
    .attr('dy', '1em')
    .style('text-anchor', 'middle')
    .style('fill', 'white')
    .text('Population (in millions)');

  // text label for the y axis
  svgElement
    .append('text')
    .attr('y', height + 30)
    .attr('x', 0 + width / 2)
    .attr('dy', '1em')
    .style('text-anchor', 'middle')
    .style('fill', 'white')
    .text('Country name');
};

getData().then(generateChart);
