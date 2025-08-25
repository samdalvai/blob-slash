import { expect } from '@jest/globals';

import { isPointInsideCircle } from '../../../engine/utils/circle';

describe('isPointInsideCircle', () => {
    test('Should return true when point is inside the circle', () => {
        expect(isPointInsideCircle(3, 4, 0, 0, 5)).toBe(true);
    });

    test('Should return true when point is exactly on the circle boundary', () => {
        expect(isPointInsideCircle(5, 0, 0, 0, 5)).toBe(true);
    });

    test('Should return false when point is outside the circle', () => {
        expect(isPointInsideCircle(6, 0, 0, 0, 5)).toBe(false);
    });

    test('Should return true when circle radius is zero and point equals center', () => {
        expect(isPointInsideCircle(0, 0, 0, 0, 0)).toBe(true);
    });

    test('Should return false when circle radius is zero and point differs from center', () => {
        expect(isPointInsideCircle(1, 1, 0, 0, 0)).toBe(false);
    });
});
