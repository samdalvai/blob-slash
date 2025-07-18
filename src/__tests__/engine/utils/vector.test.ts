import { expect } from '@jest/globals';

import { Rectangle, Vector } from '../../../engine/types/utils';
import { computeDirectionVector, computeUnitVector, isRectangle, isVector } from '../../../engine/utils/vector';

describe('Testing vector utils related functions', () => {
    test('Should correctly compute direction vector normalized to length on vertical axis', () => {
        let directionVector = computeDirectionVector(100, 100, 100, 200, 10);
        expect(directionVector).toEqual({ x: 0, y: 10 });

        directionVector = computeDirectionVector(100, 100, 100, 0, 10);
        expect(directionVector).toEqual({ x: 0, y: -10 });
    });

    test('Should correctly compute direction vector normalized to length on horizontal axis', () => {
        let directionVector = computeDirectionVector(100, 100, 200, 100, 10);
        expect(directionVector).toEqual({ x: 10, y: 0 });

        directionVector = computeDirectionVector(100, 100, 0, 100, 10);
        expect(directionVector).toEqual({ x: -10, y: 0 });
    });

    test('Should correctly compute direction vector normalized to length on diagonal axis', () => {
        let directionVector = computeDirectionVector(100, 100, 200, 200, 10);
        expect(directionVector.x - 7).toBeLessThan(0.1);
        expect(directionVector.y - 7).toBeLessThan(0.1);

        directionVector = computeDirectionVector(200, 200, 100, 100, 10);
        expect(directionVector.x + 7).toBeLessThan(0.1);
        expect(directionVector.y + 7).toBeLessThan(0.1);
    });

    test('Should correctly compute unit vector based on x and y', () => {
        /**
         * Case 1
         * x > 0 && y > 0
         * --------------
         * abs
         * x > y -> move right
         * x < y -> move down
         *
         */
        let vector = computeUnitVector(100, 50);
        expect(vector).toEqual({ x: 1, y: 0 });
        vector = computeUnitVector(50, 100);
        expect(vector).toEqual({ x: 0, y: 1 });

        /*
         * Case 2
         * x > 0 && y < 0
         * --------------
         * abs
         * x > y -> move right
         * x < y -> move up
         */
        vector = computeUnitVector(100, -50);
        expect(vector).toEqual({ x: 1, y: 0 });
        vector = computeUnitVector(50, -100);
        expect(vector).toEqual({ x: 0, y: -1 });

        /*
         * Case 3
         * x < 0 && y > 0
         * --------------
         * abs
         * x > y -> move left
         * x < y -> move down
         */
        vector = computeUnitVector(-100, 50);
        expect(vector).toEqual({ x: -1, y: 0 });
        vector = computeUnitVector(-50, 100);
        expect(vector).toEqual({ x: 0, y: 1 });

        /*
         * Case 4
         * x < 0 && y < 0
         * --------------
         * abs
         * x > y -> move left
         * x < y -> move up
         */
        vector = computeUnitVector(-100, -50);
        expect(vector).toEqual({ x: -1, y: 0 });
        vector = computeUnitVector(-50, -100);
        expect(vector).toEqual({ x: 0, y: -1 });
    });

    test('Should return true if object is of type Vector', () => {
        const vec: Vector = { x: 0, y: 0 };
        expect(isVector(vec)).toBe(true);
    });

    test('Should return false if object is not of type Vector', () => {
        const another = { x: 0, y: 0, other: 0 };
        expect(isVector(another)).toBe(false);
    });

    test('Should return false if object is type Rectangle', () => {
        const rect: Rectangle = {
            x: 0,
            y: 0,
            width: 0,
            height: 0,
        };
        expect(isVector(rect)).toBe(false);
    });

    test('Should return true if object is of type Rectangle', () => {
        const rect: Rectangle = {
            x: 0,
            y: 0,
            width: 0,
            height: 0,
        };
        expect(isRectangle(rect)).toBe(true);
    });

    test('Should return false if object is not of type Vector', () => {
        const another = {
            x: 0,
            y: 0,
            width: 0,
            height: 0,
            other: 0,
        };
        expect(isRectangle(another)).toBe(false);
    });

    test('Should return false if object is type Vector', () => {
        const vec: Vector = {
            x: 0,
            y: 0,
        };
        expect(isRectangle(vec)).toBe(false);
    });
});
