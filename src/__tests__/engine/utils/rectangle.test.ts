import { expect } from '@jest/globals';

import { Rectangle } from '../../../engine/types/utils';
import { rectanglesOverlap } from '../../../engine/utils/rectangle';

describe('rectanglesOverlap', () => {
    const rectA: Rectangle = { x: 0, y: 0, width: 10, height: 10 };

    test('Should return true when rectangles overlap', () => {
        const rectB: Rectangle = { x: 5, y: 5, width: 10, height: 10 };
        expect(rectanglesOverlap(rectA, rectB)).toBe(true);
    });

    test('Should return false when rectangles do not overlap', () => {
        const rectB: Rectangle = { x: 20, y: 20, width: 5, height: 5 };
        expect(rectanglesOverlap(rectA, rectB)).toBe(false);
    });

    test('Should return false when rectangles just touch edges horizontally', () => {
        const rectB: Rectangle = { x: 10, y: 0, width: 5, height: 5 };
        expect(rectanglesOverlap(rectA, rectB)).toBe(false);
    });

    test('Should return false when rectangles just touch edges vertically', () => {
        const rectB: Rectangle = { x: 0, y: 10, width: 5, height: 5 };
        expect(rectanglesOverlap(rectA, rectB)).toBe(false);
    });

    test('Should return true when one rectangle is completely inside the other', () => {
        const rectB: Rectangle = { x: 2, y: 2, width: 5, height: 5 };
        expect(rectanglesOverlap(rectA, rectB)).toBe(true);
    });
});
