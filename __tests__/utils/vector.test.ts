import { expect } from '@jest/globals';

import { computeUnitVector } from '../../src/utils/vector';

describe('Testing vector utils related functions', () => {
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
