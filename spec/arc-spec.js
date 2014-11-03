var describe = window.describe,
    expect = window.expect,
    it = window.it,
    beforeEach = window.beforeEach;

describe('c3 chart axis', function () {
    'use strict';

    var chart, d3, args;

    beforeEach(function (done) {
        if (typeof chart === 'undefined') {
            window.initDom();
        }
        chart = window.c3.generate(args);
        d3 = chart.internal.d3;
        chart.internal.d3.select('.jasmine_html-reporter')
            .style('position', 'absolute')
            .style('right', 0);

        window.setTimeout(function () {
            done();
        }, 50);
    });

    describe('show pie chart', function () {

        args = {
            data: {
                columns: [
                    ['data1', 30],
                    ['data2', 150],
                    ['data3', 120]
                ],
                type: 'pie'
            }
        };

        it('should have correct classes', function () {
            var chartArc = d3.select('.c3-chart-arcs'),
            arcs = {
                data1: chartArc.select('.c3-chart-arc.c3-target.c3-target-data1')
                    .select('g.c3-shapes.c3-shapes-data1.c3-arcs.c3-arcs-data1')
                    .select('path.c3-shape.c3-shape.c3-arc.c3-arc-data1'),
                data2: chartArc.select('.c3-chart-arc.c3-target.c3-target-data2')
                    .select('g.c3-shapes.c3-shapes-data2.c3-arcs.c3-arcs-data2')
                    .select('path.c3-shape.c3-shape.c3-arc.c3-arc-data2'),
                data3: chartArc.select('.c3-chart-arc.c3-target.c3-target-data3')
                    .select('g.c3-shapes.c3-shapes-data3.c3-arcs.c3-arcs-data3')
                    .select('path.c3-shape.c3-shape.c3-arc.c3-arc-data3')
            };
            expect(arcs.data1.size()).toBe(1);
            expect(arcs.data2.size()).toBe(1);
            expect(arcs.data3.size()).toBe(1);
        });

        it('should have correct d', function () {
            expect(d3.select('.c3-arc-data1').attr('d')).toMatch(/M-124\..+,-171\..+A211\..+,211\..+ 0 0,1 -3\..+,-211\..+L0,0Z/);
            expect(d3.select('.c3-arc-data2').attr('d')).toMatch(/M1\..+,-211\..+A211\..+,211\..+ 0 0,1 1\..+,211\..+L0,0Z/);
            expect(d3.select('.c3-arc-data3').attr('d')).toMatch(/M1\..+,211\..+A211\..+,211\..+ 0 0,1 -124\..+,-171\..+L0,0Z/);
        });

        it('should set args with data id that can be converted to a color', function () {
            args.data.columns = [
                ['black', 30],
                ['data2', 150],
                ['data3', 120]
            ];
            expect(true).toBeTruthy();
        });

        it('should have correct d even if data id can be converted to a color', function () {
            expect(d3.select('.c3-arc-black').attr('d')).toMatch(/M-124\..+,-171\..+A211\..+,211\..+ 0 0,1 -3\..+,-211\..+L0,0Z/);
        });

    });

});
