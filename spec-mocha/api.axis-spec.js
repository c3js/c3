import d3 from 'd3';
import { expect } from 'chai';
import { initChart } from './c3-helper';

describe('c3 api axis', function () {
    var chart, args;

    beforeEach(function (done) {
        chart = initChart(chart, args, done);
    });

    describe('axis.labels', function () {
        it('should update args', function () {
            args = {
                data: {
                    columns: [
                        ['data1', 30, 200, 100],
                        ['data2', 50, 20, 10]
                    ],
                    axes: {
                        data1: 'y',
                        data2: 'y2'
                    }
                },
                axis: {
                    y: {
                        label: 'Y Axis Label'
                    },
                    y2: {
                        show: true,
                        label: 'Y2 Axis Label'
                    }
                }
            };
        });

        it('should update y axis label', function () {
            chart.axis.labels({ y: 'New Y Axis Label' });
            var label = d3.select('.c3-axis-y-label');
            expect(label.text()).to.equal('New Y Axis Label');
            expect(label.attr('dx')).to.equal('-0.5em');
            expect(label.attr('dy')).to.equal('1.2em');
        });

        it('should update y axis label', function () {
            chart.axis.labels({y2: 'New Y2 Axis Label'});
            var label = d3.select('.c3-axis-y2-label');
            expect(label.text()).to.equal('New Y2 Axis Label');
            expect(label.attr('dx')).to.equal('-0.5em');
            expect(label.attr('dy')).to.equal('-0.5em');
        });

    });
});
