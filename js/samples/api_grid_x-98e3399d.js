var chart = c3.generate({
    bindto: '#chart',
    data: {
        columns: [
            ['sample', 30, 200, 100, 400, 150, 250]
        ]
    }
});

setTimeout(function () {
    chart.xgrids([{value: 1, text:'Label 1'}, {value: 4, text: 'Label 4'}]);
}, 1000);

setTimeout(function () {
    chart.xgrids([{value: 2, text:'Label 2'}]);
}, 2000);

setTimeout(function () {
    chart.xgrids.add([{value: 3, text:'Label 3', class:'hoge'}]);
}, 3000);

setTimeout(function () {
    chart.xgrids.remove({value:2});
}, 4000);

setTimeout(function () {
    chart.xgrids.remove({class:'hoge'});
}, 5000);

setTimeout(function () {
    chart.xgrids([{value: 1, text:'Label 1'}, {value: 4, text: 'Label 4'}]);
}, 6000);

setTimeout(function () {
    chart.xgrids.remove();
}, 7000);
