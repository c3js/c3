describe('c3 api chart', function () {
    'use strict';

    var chart, args;

    beforeEach(function (done) {
        chart = window.initChart(chart, args, done);
    });

    describe('width', function(){
        it('should update args', function () {
            args = {
                data: {
                    columns: [
                        ['data1', 30, 200, 100],
                        ['data2', 50, 20, 10]
                    ],
                },
                size: {
                    width: 1600,
                    height: 900
                }
            };
            expect(true).toBeTruthy();
        });

        it('should get width', function(){
            expect(chart.width()).toBe(1600);

            chart.resize({
                width: 400,
                height: 300
            });

            expect(chart.width()).toBe(400);
        });

        it('should set width', function(){
            chart.width(500);

            expect(chart.width()).toBe(500);
            expect(chart.internal.config.size_width).toBe(500);
        });
    });

    describe('height', function(){
        it('should update args', function () {
            args = {
                data: {
                    columns: [
                        ['data1', 30, 200, 100],
                        ['data2', 50, 20, 10]
                    ],
                },
                size: {
                    width: 1600,
                    height: 900
                }
            };
            expect(true).toBeTruthy();
        });

        it('should get height', function(){
            expect(chart.height()).toBe(900);

            chart.resize({
                width: 400,
                height: 300
            });

            expect(chart.height()).toBe(300);
        });

        it('should set height', function(){
            chart.height(500);

            expect(chart.height()).toBe(500);
            expect(chart.internal.config.size_height).toBe(500);
        });
    });



});
