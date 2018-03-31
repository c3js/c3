var chart = c3.generate({
    data: {
        columns: [
            ['data', 91.4]
        ],
        type: 'gauge',
        onclick: function (d, i) { console.log("onclick", d, i); },
        onmouseover: function (d, i) { console.log("onmouseover", d, i); },
        onmouseout: function (d, i) { console.log("onmouseout", d, i); }
    },
    gauge: {
//        label: {
//            format: function(value, ratio) {
//                return value;
//            },
//            show: false // to turn off the min/max labels.
//        },
//    min: 0, // 0 is default, //can handle negative min e.g. vacuum / voltage / current flow / rate of change
//    max: 100, // 100 is default
//    units: ' %',
//    width: 39 // for adjusting arc thickness
    },
    color: {
        pattern: ['#FF0000', '#F97600', '#F6C600', '#60B044'], // the three color levels for the percentage values.
        threshold: {
//            unit: 'value', // percentage is default
//            max: 200, // 100 is default
            values: [30, 60, 90, 100]
        }
    },
    size: {
        height: 180
    }
});

setTimeout(function () {
    chart.load({
        columns: [['data', 10]]
    });
}, 1000);

setTimeout(function () {
    chart.load({
        columns: [['data', 50]]
    });
}, 2000);

setTimeout(function () {
    chart.load({
        columns: [['data', 70]]
    });
}, 3000);

setTimeout(function () {
    chart.load({
        columns: [['data', 0]]
    });
}, 4000);

setTimeout(function () {
    chart.load({
        columns: [['data', 100]]
    });
}, 5000);
