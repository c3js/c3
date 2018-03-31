var chart = c3.generate({
    data: {
        columns: [
            ['data1', 100],
            ['data2', 300],
            ['data3', 200]
        ],
        type: 'pie'
    },
    legend: {
        show: false
    }
});

function toggle(id) {
    chart.toggle(id);
}

d3.select('.container').insert('div', '.chart').attr('class', 'legend').selectAll('span')
    .data(['data1', 'data2', 'data3'])
  .enter().append('span')
    .attr('data-id', function (id) { return id; })
    .html(function (id) { return id; })
    .each(function (id) {
        d3.select(this).style('background-color', chart.color(id));
    })
    .on('mouseover', function (id) {
        chart.focus(id);
    })
    .on('mouseout', function (id) {
        chart.revert();
    })
    .on('click', function (id) {
        chart.toggle(id);
    });
