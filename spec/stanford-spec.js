import {
    getRegionArea,
    compareEpochs,
    pointInRegion
} from "../src/stanford";

describe('c3 stanford tests', function () {
    'use strict';

    var chart, args;

    beforeEach(function (done) {
        chart = window.initChart(chart, args, done);
    });

    describe('count epochs in region', function () {
        beforeAll(function () {
            args = {
                data: {
                    x: 'x',
                    y: 'y',
                    epochs: 'epochs',
                    columns: [
                        ['x', 25, 35],
                        ['y', 25, 33],
                        ['epochs', 30, 35]
                    ],
                    type: 'stanford',
                }
            };
        });

        it('should return 0 if the region has no epochs', function () {
            var region = [
                {x: 0, y: 0},
                {x: 20, y: 0},
                {x: 20, y: 20},
                {x: 0, y: 20}
            ];

            var result = chart.internal.countEpochsInRegion(region);

            expect(result.percentage).toBe(0);
            expect(result.value).toBe(0);
        });

        it('should return 100% if the region has all the epochs', function () {
            var region = [
                {x: 0, y: 0},
                {x: 60, y: 0},
                {x: 60, y: 60},
                {x: 0, y: 60}
            ];

            var result = chart.internal.countEpochsInRegion(region);

            expect(Number(result.percentage)).toBe(100);
            expect(result.value).toBe(65);
        });
    });

    describe('get centroid of region', function() {
        beforeAll(function () {
            args = {
                data: {
                    x: 'x',
                    y: 'y',
                    epochs: 'epochs',
                    columns: [
                        ['x', 25, 35],
                        ['y', 25, 33],
                        ['epochs', 30, 35]
                    ],
                    type: 'stanford',
                }
            };
        });

        var region = [ // a 20 x 20 square
            {x: 0, y: 0},
            {x: 20, y: 0},
            {x: 20, y: 20},
            {x: 0, y: 20}
        ];

        it('should return the centroid of a polygon', function () {
            var result = chart.internal.getCentroid(region);

            expect(result.x).toBe(10);
            expect(result.y).toBe(10);
        });
    });

    describe('get region area', function () {
        var square = [ // a 20 x 20 square
            {x: 0, y: 0},
            {x: 20, y: 0},
            {x: 20, y: 20},
            {x: 0, y: 20}
        ];

        var squareArea = 400;

        var triangle = [ // A = b * h / 2
            {x: 0, y: 0},
            {x: 20, y: 20},
            {x: 0, y: 20},
        ];

        var triangleArea = 200;

        it('should return the correct area for a square', function () {
            expect(Math.abs(getRegionArea(square))).toBe(squareArea);
        });

        it('should return the correct area for a triangle', function () {
            expect(Math.abs(getRegionArea(triangle))).toBe(triangleArea);
        });
    });

    describe('compare epochs', function () {
        var dataBigger = {epochs: 2};
        var dataLower = {epochs: 1};

        it('should return -1 if epochs are lower', function () {
            expect(compareEpochs(dataLower, dataBigger)).toBe(-1);
        });

        it('should return 1 if epochs are bigger', function () {
            expect(compareEpochs(dataBigger, dataLower)).toBe(1);
        });

        it('should return 0 if epochs are equal', function () {
            expect(compareEpochs(dataLower, dataLower)).toBe(0);
        });
    });

    describe('check if point is in region', function () {
        var region = [
            {x: 0, y: 0},
            {x: 20, y: 0},
            {x: 20, y: 20},
            {x: 20, y: 20}
        ];

        var pointInside = {x: 0, value: 0};
        var pointOutInside = {x: 21, value: 0};

        it('should return true if point is inside region', function () {
            expect(pointInRegion(pointInside, region)).toBeTruthy();
        });

        it('should return false if point is outside region', function () {
            expect(pointInRegion(pointOutInside, region)).toBeFalsy();
        });
    });
});
