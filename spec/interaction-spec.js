const { setMouseEvent } = window;

describe('c3 chart interaction', function () {
    'use strict';

    var chart, args;

    const moveMouseOut = () =>
        setMouseEvent(chart, 'mouseout', 0, 0, d3.select('.c3-event-rect').node());

    const moveMouse = (x = 0, y = 0) =>
        setMouseEvent(chart, 'mousemove', x, y, d3.select('.c3-event-rect').node());

    const clickMouse = (x = 0, y = 0) =>
        setMouseEvent(chart, 'click', x, y, d3.select('.c3-event-rect').node());

    beforeEach(function (done) {
        chart = window.initChart(chart, args, done);
    });

    describe('generate event rects', function () {

        describe('custom x', function () {

            beforeAll(function () {
                args = {
                    data: {
                        x: 'x',
                        columns: [
                            ['x', 0, 1000, 3000, 10000],
                            ['data', 10, 10, 10, 10]
                        ],
                        type: 'bar'
                    }
                };
            });

            it('should have only 1 event rect properly', function () {
                var eventRects = d3.selectAll('.c3-event-rect');
                expect(eventRects.size()).toBe(1);
                eventRects.each(function () {
                    var box = d3.select(this).node().getBoundingClientRect();
                    expect(box.left).toBeCloseTo(40.5, -2);
                    expect(box.width).toBeCloseTo(598, -2);
                });
            });

            describe('mouseover', function () {
                let mouseoutCounter = 0;
                let mouseoverCounter = 0;

                beforeAll(function () {
                    args = {
                        data: {
                            columns: [
                                ['data1', 30, 200, 100, 400, -150, 250],
                                ['data2', 50, 20, 10, 40, 15, 25],
                                ['data3', -150, 120, 110, 140, 115, 125]
                            ],
                            type: 'bar',
                            onmouseout: function() {
                                mouseoutCounter += 1;
                            },
                            onmouseover: function() {
                                mouseoverCounter += 1;
                            }
                        },
                        axis: {
                            rotated: false
                        }
                    };
                });

                beforeEach(function() {
                    mouseoverCounter = 0;
                    mouseoutCounter = 0;
                });

                it('should be undefined when not within bar', function () {
                    moveMouseOut();

                    expect(mouseoutCounter).toEqual(0);
                    expect(mouseoverCounter).toEqual(0);
                    expect(chart.internal.mouseover).toBeUndefined();
                });

                it('should be data value when within bar', function () {
                    moveMouse(31, 280);

                    expect(mouseoutCounter).toEqual(0);
                    expect(mouseoverCounter).toEqual(1);
                    expect(chart.internal.mouseover).toEqual({
                        x: 0,
                        value: 30,
                        index: 0,
                        id: 'data1',
                        name: 'data1'
                    });
                });

                it('should be undefined after leaving chart', function () {
                    moveMouse(31, 280);
                    moveMouseOut();

                    expect(mouseoutCounter).toEqual(1);
                    expect(mouseoverCounter).toEqual(1);
                    expect(chart.internal.mouseover).toBeUndefined();
                });

                it('should retrigger mouseover event when returning to same value', function () {
                    moveMouse(31, 280);
                    moveMouseOut();
                    moveMouse(31, 280);

                    expect(mouseoutCounter).toEqual(1);
                    expect(mouseoverCounter).toEqual(2);
                    expect(chart.internal.mouseover).toEqual({
                        x: 0,
                        value: 30,
                        index: 0,
                        id: 'data1',
                        name: 'data1'
                    });
                });
            });

            describe('should generate bar chart with only one data', function () {
                beforeAll(function(){
                    args = {
                        data: {
                            x: 'x',
                            columns: [
                                ['x', 0],
                                ['data', 10]
                            ],
                            type: 'bar'
                        }
                    };
                });

                it('should have 1 event rects properly', function () {
                    var eventRects = d3.selectAll('.c3-event-rect');
                    expect(eventRects.size()).toBe(1);
                    eventRects.each(function () {
                        var box = d3.select(this).node().getBoundingClientRect();
                        expect(box.left).toBeCloseTo(40.5, -2);
                        expect(box.width).toBeCloseTo(598, -2);
                    });
                });
            });
        });

        describe('timeseries', function () {
            beforeAll(function () {
                args = {
                    data: {
                        x: 'x',
                        columns: [
                            ['x', '20140101', '20140201', '20140210',  '20140301'],
                            ['data', 10, 10, 10, 10]
                        ]
                    }
                };
            });

            it('should have only 1 event rect properly', function () {
                var eventRects = d3.selectAll('.c3-event-rect');
                expect(eventRects.size()).toBe(1);
                eventRects.each(function () {
                    var box = d3.select(this).node().getBoundingClientRect();
                    expect(box.left).toBeCloseTo(40.5, -2);
                    expect(box.width).toBeCloseTo(598, -2);
                });
            });

            describe('should generate line chart with only 1 data timeseries', function () {
                beforeAll(function(){
                    args = {
                        data: {
                            x: 'x',
                            columns: [
                                ['x', '20140101'],
                                ['data', 10]
                            ]
                        }
                    };
                });

                it('should have 1 event rects properly', function () {
                    var eventRects = d3.selectAll('.c3-event-rect');
                    expect(eventRects.size()).toBe(1);
                    eventRects.each(function () {
                        var box = d3.select(this).node().getBoundingClientRect();
                        expect(box.left).toBeCloseTo(40.5, -2);
                        expect(box.width).toBeCloseTo(598, -2);
                    });
                });
            });
        });
    });

    describe('bar chart', function() {
        describe('tooltip_grouped=true', function() {
            beforeAll(() => {
                args = {
                    data: {
                        columns: [
                            [ 'data1', 30, 200, 200, 400, 150, -250 ],
                            [ 'data2', 130, -100, 100, 200, 150, 50 ],
                            [ 'data3', 230, -200, 200, 0, 250, 250 ]
                        ],
                        type: 'bar',
                        groups: [
                            [ 'data1', 'data2' ]
                        ],
                        hide: [
                            'data1'
                        ]
                    },
                    tooltip: {
                        grouped: true
                    },
                    axis: {
                        x: {
                            type: 'category'
                        },
                        rotated: true
                    },
                    interaction: {
                        enabled: true
                    }
                };
            });

            it('generate a single rect', () => {
                const eventRectList = d3.selectAll('.c3-event-rect');

                expect(eventRectList.size()).toBe(1);
                expect(eventRectList.attr('x')).toEqual('0');
                expect(eventRectList.attr('y')).toEqual('0');
                expect(eventRectList.attr('height')).toEqual('' + chart.internal.height);
                expect(eventRectList.attr('width')).toEqual('' + chart.internal.width);
            });

            it('shows tooltip with visible data of currently hovered category', () => {
                moveMouse(20, 20);

                expect(document.querySelector('.c3-tooltip-container').style.display).toEqual('block');

                const tooltipData = [...document.querySelectorAll('.c3-tooltip tr')];

                expect(tooltipData.length).toBe(3); // header + data[123]

                expect(tooltipData[1].querySelector('.name').textContent).toBe('data3');
                expect(tooltipData[2].querySelector('.name').textContent).toBe('data2');
            });

            it('shows cursor:pointer only if hovering bar', () => {
                const eventRect = d3.select('.c3-event-rect');

                moveMouse(1, 1);

                expect(eventRect.style('cursor')).toEqual('auto');

                moveMouse(360, 48);

                expect(eventRect.style('cursor')).toEqual('pointer');

                moveMouse(1, 1);

                expect(eventRect.style('cursor')).toEqual('auto');
            });

            it('expands all bars of currently hovered category', () => {
                moveMouse(20, 20);

                const barList = d3.selectAll('.c3-bar');

                expect(barList.size()).toBeGreaterThan(0);

                barList.each(function() {
                    if (this.classList.contains('c3-bar-0') && !this.parentElement.classList.contains('c3-bars-data1')) {
                        expect(this.classList.contains('_expanded_')).toBeTruthy();
                    } else {
                        expect(this.classList.contains('_expanded_')).toBeFalsy();
                    }
                });

                moveMouse(20, 170);

                barList.each(function() {
                    if (this.classList.contains('c3-bar-2') && !this.parentElement.classList.contains('c3-bars-data1')) {
                        expect(this.classList.contains('_expanded_')).toBeTruthy();
                    } else {
                        expect(this.classList.contains('_expanded_')).toBeFalsy();
                    }
                });
            });
        });

        describe('tooltip_grouped=false', function() {
            beforeAll(() => {
                args = {
                    data: {
                        columns: [
                            [ 'data1', 30, 200, 200, 400, 150, -250 ],
                            [ 'data2', 130, -100, 100, 200, 150, 50 ],
                            [ 'data3', 230, -200, 200, 0, 250, 250 ]
                        ],
                        type: 'bar',
                        groups: [
                            [ 'data1', 'data2' ]
                        ]
                    },
                    tooltip: {
                        grouped: false
                    },
                    axis: {
                        x: {
                            type: 'category'
                        }
                    },
                    interaction: {
                        enabled: true
                    }
                };
            });

            it('generate a single rect', () => {
                const eventRectList = d3.selectAll('.c3-event-rect');

                expect(eventRectList.size()).toBe(1);
                expect(eventRectList.attr('x')).toEqual('0');
                expect(eventRectList.attr('y')).toEqual('0');
                expect(eventRectList.attr('height')).toEqual('' + chart.internal.height);
                expect(eventRectList.attr('width')).toEqual('' + chart.internal.width);
            });

            it('shows tooltip with only hovered data', () => {
                moveMouse(1, 1);

                expect(document.querySelector('.c3-tooltip-container').style.display).toEqual('none');

                moveMouse(35, 268);

                expect(document.querySelector('.c3-tooltip-container').style.display).toEqual('block');

                const tooltipData = [...document.querySelectorAll('.c3-tooltip tr')];

                expect(tooltipData.length).toBe(2); // header + data2

                expect(tooltipData[1].querySelector('.name').textContent).toBe('data2');
                expect(tooltipData[1].querySelector('.value').textContent).toBe('130');
            });

            it('expands only hovered bar', () => {
                moveMouse(20, 20);

                const barList = d3.selectAll('.c3-bar');

                expect(barList.size()).toBeGreaterThan(0);

                // nothing expanded
                barList.each(function() {
                    expect(this.classList.contains('_expanded_')).toBeFalsy();
                });

                moveMouse(38, 258);

                barList.each(function() {
                    if (this.classList.contains('c3-bar-0') && this.parentElement.classList.contains('c3-bars-data2')) {
                        expect(this.classList.contains('_expanded_')).toBeTruthy();
                    } else {
                        expect(this.classList.contains('_expanded_')).toBeFalsy();
                    }
                });
            });
        });
    });

    describe('line chart', function() {
        describe('tooltip_grouped=false', function() {
            let clickedData = [];

            beforeAll(() => {
                args = {
                    data: {
                        columns: [
                            [ 'data1', 30, 200, 200, 400, 150, -250 ],
                            [ 'data2', 130, -100, 100, 200, 150, 50 ],
                            [ 'data3', 230, -200, 200, 0, 250, 250 ]
                        ],
                        type: 'line',
                        groups: [
                            [ 'data1', 'data2' ]
                        ],
                        onclick: function(d) {
                            clickedData.push(d);
                        }
                    },
                    tooltip: {
                        grouped: false
                    },
                    axis: {
                        x: {
                            type: 'category'
                        }
                    },
                    interaction: {
                        enabled: true
                    },
                    point: {
                        r: 2,
                        sensitivity: 10,
                        focus: {
                            expand: {
                                enabled: true,
                                r: 8
                            }
                        }
                    }
                };
            });

            beforeEach(function() {
                clickedData = [];
            });

            it('shows tooltip with only hovered data', () => {
                moveMouse(1, 1);

                expect(document.querySelector('.c3-tooltip-container').style.display).toEqual('none');

                moveMouse(48, 184);

                expect(document.querySelector('.c3-tooltip-container').style.display).toEqual('block');

                const tooltipData = [...document.querySelectorAll('.c3-tooltip tr')];

                expect(tooltipData.length).toBe(2); // header + data3

                expect(tooltipData[1].querySelector('.name').textContent).toBe('data3');
                expect(tooltipData[1].querySelector('.value').textContent).toBe('230');
            });

            it('expands only hovered point', () => {
                moveMouse(1, 1);

                const circleList = d3.selectAll('.c3-circle');

                expect(circleList.size()).toBeGreaterThan(0);

                // nothing expanded
                circleList.each(function() {
                    expect(this.classList.contains('_expanded_')).toBeFalsy();
                });

                moveMouse(45, 233);

                circleList.each(function() {
                    expect(this.classList.contains('_expanded_')).toEqual(
                        this.classList.contains('c3-circle-0') && this.parentElement.classList.contains('c3-circles-data2')
                    );
                });
            });

            it('shows cursor:pointer only if hovering point', () => {
                const eventRect = d3.select('.c3-event-rect');

                moveMouse(1, 1);

                expect(eventRect.style('cursor')).toEqual('auto');

                moveMouse(49, 219);

                expect(eventRect.style('cursor')).toEqual('pointer');

                moveMouse(1, 1);

                expect(eventRect.style('cursor')).toEqual('auto');
            });

            it('clicks only on hovered point', () => {
                clickMouse(144, 201);

                expect(clickedData).toEqual([{
                    x: 1,
                    index: 1,
                    value: 200,
                    id: 'data1',
                    name: 'data1'
                }]);
            });

            describe('with selection enabled', () => {

                beforeAll(() => {
                    args.data.selection = {
                        enabled: true,
                        isselectable: function(d) {
                            return d.id !== 'data3';
                        }
                    };
                });

                it('can toggle selection', () => {
                    expect(d3.selectAll('.c3-circle _selected_').size()).toEqual(0);

                    clickMouse(144, 201); // index 1 @ data1

                    expect(d3.selectAll('.c3-circle._selected_').size()).toEqual(1);
                    expect(d3.select('.c3-circles-data1 .c3-circle-1._selected_').size()).toEqual(1);

                    // data3 is not selectable
                    clickMouse(391, 283); // index 3 @ data3

                    expect(d3.selectAll('.c3-circle._selected_').size()).toEqual(1);
                    expect(d3.select('.c3-circles-data3 .c3-circle-3._selected_').size()).toEqual(0);
                    expect(d3.select('.c3-circles-data1 .c3-circle-1._selected_').size()).toEqual(1);


                    clickMouse(343, 204); // index 3 @ data2

                    expect(d3.selectAll('.c3-circle._selected_').size()).toEqual(2);
                    expect(d3.select('.c3-circles-data2 .c3-circle-3._selected_').size()).toEqual(1);
                    expect(d3.select('.c3-circles-data1 .c3-circle-1._selected_').size()).toEqual(1);

                    clickMouse(144, 201); // index 1 @ data1

                    expect(d3.selectAll('.c3-circle._selected_').size()).toEqual(1);
                    expect(d3.select('.c3-circles-data2 .c3-circle-3._selected_').size()).toEqual(1);
                });
            });

            describe('with tooltip_horizontal=true', () => {
                beforeAll(() => {
                    args.tooltip.horizontal = true;
                });

                it('can clicks on points', () => {
                    // out of point sensitivity
                    clickMouse(146, 46);
                    clickMouse(343, 263);

                    // click 3 data point
                    clickMouse(147, 370);
                    clickMouse(340, 203);
                    clickMouse(537, 386);

                    expect(clickedData).toEqual([
                        {x: 1, value: -200, id: 'data3', index: 1, name: 'data3'},
                        {x: 3, value: 200, id: 'data2', index: 3, name: 'data2'},
                        {x: 5, value: -250, id: 'data1', index: 5, name: 'data1'}
                    ]);
                });

                it('shows tooltip with only closest data', () => {
                    moveMouse(1, 1);

                    expect(document.querySelector('.c3-tooltip-container').style.display).toEqual('none');

                    moveMouse(146, 46);

                    expect(document.querySelector('.c3-tooltip-container').style.display).toEqual('block');

                    let tooltipData = [...document.querySelectorAll('.c3-tooltip tr')];

                    expect(tooltipData.length).toBe(2); // header + data1

                    expect(tooltipData[1].querySelector('.name').textContent).toBe('data1');
                    expect(tooltipData[1].querySelector('.value').textContent).toBe('200');

                    moveMouse(343, 263);

                    expect(document.querySelector('.c3-tooltip-container').style.display).toEqual('block');

                    tooltipData = [...document.querySelectorAll('.c3-tooltip tr')];

                    expect(tooltipData.length).toBe(2); // header + data3

                    expect(tooltipData[1].querySelector('.name').textContent).toBe('data3');
                    expect(tooltipData[1].querySelector('.value').textContent).toBe('0');
                });
            });
        });

        describe('tooltip_grouped=true', function() {
            let clickedData = [];

            beforeAll(() => {
                args = {
                    data: {
                        columns: [
                            [ 'data1', 30, 200, 200, 400, 150, -250 ],
                            [ 'data2', 130, -100, 100, 200, 150, 50 ],
                            [ 'data3', 230, -200, 200, 0, 250, 250 ]
                        ],
                        type: 'line',
                        groups: [
                            [ 'data1', 'data2' ]
                        ],
                        onclick: function(d) {
                            clickedData.push(d);
                        }
                    },
                    tooltip: {
                        grouped: true
                    },
                    axis: {
                        x: {
                            type: 'category'
                        }
                    },
                    interaction: {
                        enabled: true
                    },
                    point: {
                        r: 2,
                        sensitivity: 10,
                        focus: {
                            expand: {
                                enabled: true,
                                r: 8
                            }
                        }
                    }
                };
            });

            beforeEach(function() {
                clickedData = [];
            });

            describe('with tooltip_horizontal=true', () => {
                beforeAll(() => {
                    args.tooltip.horizontal = true;
                });

                it('can clicks on points', () => {
                    // out of point sensitivity
                    clickMouse(146, 46);
                    clickMouse(343, 263);

                    // click 3 data point
                    clickMouse(147, 370);
                    clickMouse(340, 203);
                    clickMouse(537, 386);

                    expect(clickedData).toEqual([
                        {x: 1, value: -200, id: 'data3', index: 1, name: 'data3'},
                        {x: 3, value: 200, id: 'data2', index: 3, name: 'data2'},
                        {x: 5, value: -250, id: 'data1', index: 5, name: 'data1'}
                    ]);
                });

                it('shows tooltip with all data', () => {
                    moveMouse(1, 1);

                    expect(document.querySelector('.c3-tooltip-container').style.display).toEqual('block');

                    let tooltipData = [...document.querySelectorAll('.c3-tooltip tr')];

                    expect(tooltipData.length).toBe(4); // header + data[123]

                    expect(tooltipData[1].querySelector('.name').textContent).toBe('data1');
                    expect(tooltipData[1].querySelector('.value').textContent).toBe('30');

                    expect(tooltipData[2].querySelector('.name').textContent).toBe('data3');
                    expect(tooltipData[2].querySelector('.value').textContent).toBe('230');

                    expect(tooltipData[3].querySelector('.name').textContent).toBe('data2');
                    expect(tooltipData[3].querySelector('.value').textContent).toBe('130');

                    moveMouse(146, 46);

                    expect(document.querySelector('.c3-tooltip-container').style.display).toEqual('block');

                    tooltipData = [...document.querySelectorAll('.c3-tooltip tr')];

                    expect(tooltipData.length).toBe(4); // header + data[123]

                    expect(tooltipData[1].querySelector('.name').textContent).toBe('data1');
                    expect(tooltipData[1].querySelector('.value').textContent).toBe('200');

                    expect(tooltipData[2].querySelector('.name').textContent).toBe('data3');
                    expect(tooltipData[2].querySelector('.value').textContent).toBe('-200');

                    expect(tooltipData[3].querySelector('.name').textContent).toBe('data2');
                    expect(tooltipData[3].querySelector('.value').textContent).toBe('-100');
                });
            });
        });
    });

    describe('line chart (multiple xs)', function() {
        let clickedData = [];

        beforeAll(() => {
            args = {
                data: {
                    xs: {
                        'data1': 'x1',
                        'data2': 'x2',
                    },
                    columns: [
                        ['x1', 10, 30, 45, 50, 70, 100],
                        ['x2', 30, 50, 75, 100, 120],
                        ['data1', 30, 200, 100, 400, 150, 250],
                        ['data2', 20, 180, 240, 100, 190]
                    ],
                    type: 'line',
                    onclick: function(d) {
                        clickedData.push(d);
                    }
                },
                tooltip: {
                    grouped: true,
                    horizontal: true
                },
                interaction: {
                    enabled: true
                }
            };
        });

        beforeEach(function() {
            clickedData = [];
        });

        it('shows tooltip with all data', () => {
            moveMouse(1, 1);

            expect(document.querySelector('.c3-tooltip-container').style.display).toEqual('block');

            let tooltipData = [...document.querySelectorAll('.c3-tooltip tr')];

            expect(tooltipData.length).toBe(2); // header + data[1]

            expect(tooltipData[1].querySelector('.name').textContent).toBe('data1');
            expect(tooltipData[1].querySelector('.value').textContent).toBe('30');

            moveMouse(107, 95);

            expect(document.querySelector('.c3-tooltip-container').style.display).toEqual('block');

            tooltipData = [...document.querySelectorAll('.c3-tooltip tr')];

            expect(tooltipData.length).toBe(3); // header + data[12]

            expect(tooltipData[1].querySelector('.name').textContent).toBe('data1');
            expect(tooltipData[1].querySelector('.value').textContent).toBe('200');

            expect(tooltipData[2].querySelector('.name').textContent).toBe('data2');
            expect(tooltipData[2].querySelector('.value').textContent).toBe('20');

            moveMouse(430, 140);

            expect(document.querySelector('.c3-tooltip-container').style.display).toEqual('block');

            tooltipData = [...document.querySelectorAll('.c3-tooltip tr')];

            expect(tooltipData.length).toBe(3); // header + data[12]

            expect(tooltipData[1].querySelector('.name').textContent).toBe('data1');
            expect(tooltipData[1].querySelector('.value').textContent).toBe('250');

            expect(tooltipData[2].querySelector('.name').textContent).toBe('data2');
            expect(tooltipData[2].querySelector('.value').textContent).toBe('100');
        });
    });

    describe('scatter chart', function() {
       describe('tooltip_grouped=true', function() {
           beforeAll(() => {
                args = {
                    data: {
                        columns: [
                            ['data1', 30, null, 100, 400, -150, 250],
                            ['data2', 50, 20, 10, 40, 15, 25],
                            ['data3', -150, 120, 110, 140, 115, 125]
                        ],
                        type: 'scatter'
                    },
                    tooltip: {
                        grouped: true
                    },
                    interaction: {
                        enabled: true
                    }
                };
           });

           it('shows tooltip with visible data of currently hovered category', () => {
               moveMouse(20, 20);

               let tooltipData = [...document.querySelectorAll('.c3-tooltip tr')];

               expect(tooltipData.length).toBe(4); // header + data[123]

               expect(tooltipData[1].querySelector('.name').textContent).toBe('data2');
               expect(tooltipData[1].querySelector('.value').textContent).toBe('50');
               expect(tooltipData[2].querySelector('.name').textContent).toBe('data1');
               expect(tooltipData[2].querySelector('.value').textContent).toBe('30');
               expect(tooltipData[3].querySelector('.name').textContent).toBe('data3');
               expect(tooltipData[3].querySelector('.value').textContent).toBe('-150');

               moveMouse(350, 354);

               tooltipData = [...document.querySelectorAll('.c3-tooltip tr')];

               expect(tooltipData.length).toBe(4); // header + data[123]

               expect(tooltipData[1].querySelector('.name').textContent).toBe('data1');
               expect(tooltipData[1].querySelector('.value').textContent).toBe('400');
               expect(tooltipData[2].querySelector('.name').textContent).toBe('data3');
               expect(tooltipData[2].querySelector('.value').textContent).toBe('140');
               expect(tooltipData[3].querySelector('.name').textContent).toBe('data2');
               expect(tooltipData[3].querySelector('.value').textContent).toBe('40');
           });

           it('shows x grid', () => {
               moveMouse(20, 20);

               expect(d3.select('.c3-xgrid-focus').style('visibility')).toBe('visible');
           });
       });
    });

    describe('area chart (timeseries)', function() {
        describe('tooltip_grouped=true', function() {
            beforeAll(() => {
                args = {
                    data: {
                        x: 'x',
                        columns: [
                            [ 'x', '2018-01-01', '2018-01-02', '2018-01-03', '2018-01-04', '2018-01-05', '2018-01-06'],
                            [ 'data1', 30, 200, 200, 400, 150, 250 ],
                            [ 'data2', 130, 100, 100, 200, 150, 50 ],
                            [ 'data3', 230, 200, 200, 0, 250, 250 ]
                        ],
                        type: 'area',
                        groups: [
                            [ 'data1', 'data2', 'data3' ]
                        ]
                    },
                    tooltip: {
                        grouped: true
                    },
                    axis: {
                        x: {
                            type: 'timeseries'
                        }
                    },
                    interaction: {
                        enabled: true
                    }
                };
            });

            it('shows tooltip with visible data of currently hovered category', () => {
                moveMouse(20, 20);

                expect(document.querySelector('.c3-tooltip-container').style.display).toEqual('block');

                const tooltipData = [...document.querySelectorAll('.c3-tooltip tr')];

                expect(tooltipData.length).toBe(4); // header + data[123]

                expect(tooltipData[1].querySelector('.name').textContent).toBe('data1');
                expect(tooltipData[2].querySelector('.name').textContent).toBe('data3');
                expect(tooltipData[3].querySelector('.name').textContent).toBe('data2');
            });

            it('shows cursor:pointer only if hovering area', () => {
                const eventRect = d3.select('.c3-event-rect');

                moveMouse(1, 1);

                expect(eventRect.style('cursor')).toEqual('auto');

                moveMouse(360, 48);

                expect(eventRect.style('cursor')).toEqual('pointer');

                moveMouse(1, 1);

                expect(eventRect.style('cursor')).toEqual('auto');
            });
        });

        describe('tooltip_grouped=false', function() {
            beforeAll(() => {
                args = {
                    data: {
                        x: 'x',
                        columns: [
                            [ 'x', '2018-01-01', '2018-01-02', '2018-01-03', '2018-01-04', '2018-01-05', '2018-01-06'],
                            [ 'data1', 30, 200, 200, 400, 150, 250 ],
                            [ 'data2', 130, 100, 100, 200, 150, 50 ],
                            [ 'data3', 230, 200, 200, 0, 250, 250 ]
                        ],
                        type: 'area',
                        groups: [
                            [ 'data1', 'data2', 'data3' ]
                        ]
                    },
                    tooltip: {
                        grouped: false
                    },
                    axis: {
                        x: {
                            type: 'timeseries'
                        },
                        rotated: false
                    },
                    interaction: {
                        enabled: true
                    }
                };
            });

            it('shows tooltip with only hovered data', () => {
                moveMouse(1, 1);

                expect(document.querySelector('.c3-tooltip-container').style.display).toEqual('none');

                moveMouse(5, 174);

                expect(document.querySelector('.c3-tooltip-container').style.display).toEqual('block');

                const tooltipData = [...document.querySelectorAll('.c3-tooltip tr')];

                expect(tooltipData.length).toBe(2); // header + data1

                expect(tooltipData[1].querySelector('.name').textContent).toBe('data1');
                expect(tooltipData[1].querySelector('.value').textContent).toBe('30');
            });
        });
    });

    describe('disabled', function() {
        beforeAll(() => {
            args = {
                data: {
                    columns: [
                        [ 'data1', 30, 200, 200, 400, 150, -250 ],
                        [ 'data2', 130, -100, 100, 200, 150, 50 ],
                        [ 'data3', 230, -200, 200, 0, 250, 250 ]
                    ],
                    type: 'bar',
                    groups: [
                        [ 'data1', 'data2' ]
                    ]
                },
                axis: {
                    x: {
                        type: 'category'
                    }
                },
                interaction: {
                    enabled: false
                }
            };
        });

        it('generate a single rect', () => {
            const eventRectList = d3.selectAll('.c3-event-rect');

            expect(eventRectList.size()).toBe(1);
            expect(eventRectList.attr('x')).toEqual('0');
            expect(eventRectList.attr('y')).toEqual('0');
            expect(eventRectList.attr('height')).toEqual('' + chart.internal.height);
            expect(eventRectList.attr('width')).toEqual('' + chart.internal.width);
        });

        it('does not show tooltip when hovering data', () => {
            moveMouse(40, 260);

            expect(document.querySelector('.c3-tooltip-container').style.display).toEqual('none');

        });

        it('does not show cursor:pointer when hovering data', () => {
            moveMouse(40, 260);

            expect(d3.select('.c3-event-rect').style('cursor')).toEqual('auto');
        });
    });
});
