describe('drag behavior', function () {
    'use strict';

    var chart, shapes, $$, totalshapes;

    var args = {
        data: {
            x: 'x',
            columns: [
                ['x', 10, 30, 45, 50, 70, 100],
                ['data1', 30, 200, 100, 400, 150, 250],
                ['data2', 20, 180, 240, 100, 190]
            ],
            selection: {
                enabled: true,
                grouped: true,
                multiple: true,
                draggable: true
            },
        }
    };

    beforeAll(function (done) {
        chart = window.initChart(chart, args, done);
        $$ = chart.internal;
        shapes = $$.main.selectAll('.' + $$.CLASS.shapes)
            .selectAll('.' + $$.CLASS.shape);
        totalshapes = shapes.size();
    });

    it('should contain 15 shapes', function () {

        expect(totalshapes).toBe(15);
    });

    it('should have no selected shapes', function () {

        var selected = shapes
            .filter(function () {
                return d3.select(this).classed($$.CLASS.SELECTED);
            }).size();

        expect(selected).toBe(0);
    });

    describe('Trigger drag events', function () {

        beforeAll(function () {
            var s = chart.internal.eventRect,
                coords1 = [(s.attr('width') - s.attr('x')) / 3, (s.attr('height') - s.attr('y')) / 3],
                coords2 = [2 * (s.attr('width') - s.attr('x')) / 3, 2 * (s.attr('height') - s.attr('y')) / 3];
            $$.dragstart(coords1);
            $$.drag(coords2);
            $$.dragend();
        });

        it('should select 6 shapes', function () {

            var selected = shapes
                .filter(function () {
                    return d3.select(this).classed($$.CLASS.SELECTED);
                }).size();

            expect(selected).toBe(6);
        });

        it('should select 9 unselected shapes', function () {

            var unselected = shapes
                .filter(function () {
                    return !d3.select(this).classed($$.CLASS.SELECTED);
                }).size();

            expect(unselected).toBe(9);
        });

		describe('Selected api', function(){
			it('should return 6 selected shapes', function () {

				var selected = chart.selected();
				expect(selected.length).toBe(6);
			});

			it('should return 3 selected shapes with targetId = data1', function () {

				var selected = chart.selected('data1');
				expect(selected.length).toBe(3);
			});

		});

    });

});
