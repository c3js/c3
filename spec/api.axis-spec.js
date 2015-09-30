describe('c3 api axis', function () {
    'use strict';

    var chart, args;

    beforeEach(function (done) {
        chart = window.initChart(chart, args, done);
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
            expect(true).toBeTruthy();
        });

        it('should update y axis label', function () {
            chart.axis.labels({y: 'New Y Axis Label'});
            var label = d3.select('.c3-axis-y-label');
            expect(label.text()).toBe('New Y Axis Label');
            expect(label.attr('dx')).toBe('-0.5em');
            expect(label.attr('dy')).toBe('1.2em');
        });

        it('should update y axis label', function () {
            chart.axis.labels({y2: 'New Y2 Axis Label'});
            var label = d3.select('.c3-axis-y2-label');
            expect(label.text()).toBe('New Y2 Axis Label');
            expect(label.attr('dx')).toBe('-0.5em');
            expect(label.attr('dy')).toBe('-0.5em');
        });

    });

	describe('axis.cullingMax',function(){
		it('should set max culling',function(){

			chart.axis.cullingMax(2);
			var tickCount = 0;
			var ticks = document.querySelector('.c3-axis').querySelectorAll('.c3-axis-x .tick ');
			
			for(var i=0;i<ticks.length;i++){
				var tickText = ticks[i].querySelector('text');
				if(tickText && tickText.style){
					if(tickText.style.display === 'block'){
						tickCount++;
					}
				}
			}
			expect(tickCount).toBe(2);
		});

		it('should return max culling',function(){
			chart.axis.cullingMax(1);
			expect(chart.axis.cullingMax()).toBe(1);
		});
	});
});
