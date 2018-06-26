c3.generate({
    bindto: '#chart2_1',
    data: {
        columns: [
            ['data1', 30, 200, 100, 400, 150, 250],
            ['data2', 50, 20, 10, 40, 15, 25]
        ]
    }
});

c3.generate({
    bindto: '#chart3_1',
    data: {
        columns: [
            ['data1', 30, 200, 100, 400, 150, 250],
            ['data2', 50, 20, 10, 40, 15, 25]
        ],
        axes: {
            data2: 'y2'
        }
    },
    axis: {
        y2: {
            show: true
        }
    }
});

c3.generate({
    bindto: '#chart3_2',
    data: {
        columns: [
            ['data1', 30, 200, 100, 400, 150, 250],
            ['data2', 50, 20, 10, 40, 15, 25]
        ],
        axes: {
            data2: 'y2'
        }
    },
    axis: {
        y: {
            label: {
                text: 'Y Label',
                position: 'outer-middle'
            }
        },
        y2: {
            show: true,
            label: {
                text: 'Y2 Label',
                position: 'outer-middle'
            }
        }
    }
});

c3.generate({
    bindto: '#chart3_3',
    data: {
        columns: [
            ['data1', 30, 200, 100, 400, 150, 250],
            ['data2', 50, 20, 10, 40, 15, 25]
        ],
        axes: {
            data2: 'y2'
        },
        types: {
            data2: 'bar'
        }
    },
    axis: {
        y: {
            label: {
                text: 'Y Label',
                position: 'outer-middle'
            }
        },
        y2: {
            show: true,
            label: {
                text: 'Y2 Label',
                position: 'outer-middle'
            }
        }
    }
});

c3.generate({
    bindto: '#chart3_4',
    data: {
        columns: [
            ['data1', 30, 200, 100, 400, 150, 250],
            ['data2', 50, 20, 10, 40, 15, 25]
        ],
        axes: {
            data2: 'y2'
        },
        types: {
            data2: 'bar'
        }
    },
    axis: {
        y: {
            label: {
                text: 'Y Label',
                position: 'outer-middle'
            },
            tick: {
                format: d3.format("$,")
            }
        },
        y2: {
            show: true,
            label: {
                text: 'Y2 Label',
                position: 'outer-middle'
            }
        }
    }
});

var chart4_1 = c3.generate({
    bindto: '#chart4_1',
    data: {
        columns: [
            ['data1', 30, 200, 100, 400, 150, 250],
            ['data2', 50, 20, 10, 40, 15, 25]
        ]
    }
});

function example4_1() {
    chart4_1.load({
        columns: [
            ['data1', 300, 100, 250, 150, 300, 150, 500],
            ['data2', 100, 200, 150, 50, 100, 250],
            ['data3', 600, 700, 350, 450, 800, 550]
        ]
    });
}

var chart4_2 = c3.generate({
    bindto: '#chart4_2',
    data: {
        columns: [
            ['data1', 30, 200, 100, 400, 150, 250],
            ['data2', 50, 20, 10, 40, 15, 25],
            ['data3', 600, 700, 350, 450, 800, 550]
        ]
    }
});

function example4_2() {
    chart4_2.unload({
        ids: ['data2', 'data3']
    });
}

var chart4_3 = c3.generate({
    bindto: '#chart4_3',
    data: {
        columns: [
            ['data1', 30, 200, 100, 400, 150, 250],
            ['data2', 50, 20, 10, 40, 15, 25],
            ['data3', 600, 700, 350, 450, 800, 550]
        ]
    }
});

function example4_3_1() {
    chart4_3.show(['data2', 'data3']);
}
function example4_3_2() {
    chart4_3.hide(['data2', 'data3']);
}

c3.generate({
    bindto: '#chart5_1',
    data: {
        columns: [
            ['data1', 30, 200, 100, 400, 150, 250],
            ['data2', 50, 20, 10, 40, 15, 25],
            ['data3', 600, 700, 350, 450, 800, 550]
        ]
    }
});
