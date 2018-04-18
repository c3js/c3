var chart = c3.generate({
    data: {
        json: {
            data1: [30, 20, 50, 40, 60, 50],
            data2: [200, 130, 90, 240, 130, 220],
            data3: [300, 200, 160, 400, 250, 250]
        }
    }
});

setTimeout(function () {
    chart = c3.generate({
        data: {
            json: [
                {name: 'www.site1.com', upload: 200, download: 200, total: 400},
                {name: 'www.site2.com', upload: 100, download: 300, total: 400},
                {name: 'www.site3.com', upload: 300, download: 200, total: 500},
                {name: 'www.site4.com', upload: 400, download: 100, total: 500},
            ],
            keys: {
//                x: 'name', // it's possible to specify 'x' when category axis
                value: ['upload', 'download'],
            }
        },
        axis: {
            x: {
//                type: 'category'
            }
        }
    });
}, 1000);

setTimeout(function () {
    chart.load({
        json: [
            {name: 'www.site1.com', upload: 800, download: 500, total: 400},
            {name: 'www.site2.com', upload: 600, download: 600, total: 400},
            {name: 'www.site3.com', upload: 400, download: 800, total: 500},
            {name: 'www.site4.com', upload: 400, download: 700, total: 500},
        ],
        keys: {
            value: ['upload', 'download'],
        }
    });
}, 2000);
