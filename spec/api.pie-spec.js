describe('c3 api pie', function () {
    'use strict';

    var chart, args;

    args = {
        data: {
            columns: [
                ['data1', 60],
                ['data2', 40]
            ],
            type: 'pie'
        },
        pie: {
            padAngle: 0.5
        }
    };

    beforeEach(function (done) {
        chart = window.initChart(chart, args, done);
    });

    describe('padAngle', function() {

        it('can configure padAngle', function (done) {
            expect(chart.pie.padAngle()).toBe(0.5);

            const path = chart.internal.main.select('.c3-arc-data1').attr('d');

            chart.pie.padAngle(0.2);

            setTimeout(function () {
                expect(chart.pie.padAngle()).toBe(0.2);
                expect(chart.internal.main.select('.c3-arc-data1').attr('d')).not.toBe(path);
                done();
            }, 500);
        });
    });

    describe('load data', function() {
        beforeAll(() => {
            args = {
                data: {
                    columns: [
                        'r',
                        'l',
                        'd',
                    ],
                    type: 'pie',
                    colors: {
                        'r': 'red',
                        'l': 'green',
                        'd': 'blue',
                    },
                }
            };
        });

        it('can add data point to existing data', () => {
            chart.load({
                columns: [
                    ['r', 75],
                    ['l', 20],
                    ['d', 5]
                ]
            });

            expect(chart.internal.getTotalDataSum()).toEqual(100);
            expect(chart.internal.main.selectAll('.c3-arc').size()).toEqual(3);
        });
    });

});
