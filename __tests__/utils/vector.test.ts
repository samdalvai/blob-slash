import { expect } from '@jest/globals';

import { computeDirectionVector, computeUnitVector } from '../../src/utils/vector';

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
});
