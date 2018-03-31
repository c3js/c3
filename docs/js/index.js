var chart = c3.generate({
    data: {
        columns: [
            ['data1', 30, 200, 100, 400, 150, 250, 50, 100, 250]
        ],
        selection: {
            enabled: true
        }
    }
});

var defaultMessage = $('#message').html(), currentIndex = 0, timer, duration = 1500, demos = [
    function () {
        chart.load({
            columns: [['data2', 100, 30, 200, 320, 50, 150, 230, 80, 150]]
        })
        setMessage('Load data2');
    },
    function () {
        chart.load({
            columns: [['data3', 70, 90, 170, 220, 100, 110, 130, 40, 50]]
        })
        setMessage('Load data3');
    },
    function () {
        chart.select(['data1'], [2]);
        setMessage('Select point for index 2 of data1');
    },
    function () {
        chart.select(['data1'], [4,6]);
        setMessage('Select point for index 4,6 of data1');
    },
    function () {
        chart.unselect();
        setMessage('Unselect points');
    },
    function () {
        chart.focus('data2');
        setMessage('Focus on data2');
    },
    function () {
        chart.focus('data3');
        setMessage('Focus on data3');
    },
    function () {
        chart.revert();
        setMessage('Defocus');
    },
    function () {
        chart.load({
            columns: [['data1', 300, 230, 400, 520, 230, 250, 330, 280, 250]]
        })
        setMessage('Update data1');
    },
    function () {
        chart.load({
            columns: [['data2', 30, 50, 90, 120, 40, 50, 80, 70, 50]]
        })
        setMessage('Update data2');
    },
    function () {
        chart.regions([{start:1,end:3}]);
        setMessage('Add region from 1 to 3');
        },
    function () {
        chart.regions.add([{start:6}]);
        setMessage('Add region from 6 to end');
    },
    function () {
        chart.regions([]);
        setMessage('Clear regions');
    },
    function () {
        chart.xgrids([{value: 1, text:'Label 1'}, {value: 4, text: 'Label 4'}]);
        setMessage('Add x grid lines for 1, 4');
    },
    function () {
        chart.ygrids.add([{value: 450, text:'Label 450'}]);
        setMessage('Add y grid lines for 450');
    },
    function () {
        chart.xgrids.remove({value: 1});
        chart.xgrids.remove({value: 4});
        setMessage('Remove grid lines for 1, 4');
    },
    function () {
        chart.ygrids.remove({value: 450});
        setMessage('Remove grid line for 450');
    },
    function () {
        chart.transform('bar');
        setMessage('Show as bar chart');
    },
    function () {
        chart.groups([['data2','data3']]);
        setMessage('Grouping data2 and data3');
    },
    function () {
        chart.groups([['data1', 'data2', 'data3']]);
        setMessage('Grouping data1, data2 and data3');
    },
    function () {
        chart.groups([['data2', 'data3']]);
        chart.transform('line', 'data1');
        setMessage('Show data1 as line');
    },
    function () {
        chart.unload({
            ids: 'data3'
        });
        setMessage('Unload data3');
    },
    function () {
        chart.unload({
            ids: 'data2'
        });
        setMessage('Unload data2');
    },
    function () {
        chart.flow({
            columns: [
                ['data1', 390, 400, 200, 500]
            ],
            duration: 1000,
        });
        setMessage('Flow 4 data');
    },
    function () {
        // wait for end of transition for flow
    },
    function () {
        chart.flow({
            columns: [
                ['data1', 190, 230]
            ],
        });
        setMessage('Flow 2 data');
    },
    function () {
        // wait for end of transition for flow
    },
    function () {
        chart.transform('line', ['data1', 'data2', 'data3']);
        chart.groups([['data1'], ['data2'], ['data3']]);
        chart.load({
            columns: [['data1', 30, 200, 100, 400, 150, 250, 50, 100, 250]]
        })
        setMessage('Starting Demo..');
    }
];

function setMessage(message) {
    document.getElementById('message').innerHTML = '<a id="demoMessage" class="button small secondary" onclick="stopDemo();" title="Stop Demo" onclick="stopDemo();">'+message+'</button>';
//        $('#demoMessage').tooltip('toggle');
}

function startDemo() {
    setMessage('Starting Demo..');
    timer = setInterval(function(){
        if (currentIndex == demos.length) currentIndex = 0;
        demos[currentIndex++]();
    }, duration);
}

function stopDemo() {
    clearInterval(timer);
    document.getElementById('message').innerHTML = defaultMessage;
}
