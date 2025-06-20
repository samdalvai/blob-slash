import { Rectangle, Vector } from '../types/utils';

/**
 * Computes the direction vector between two points, normalized over the lenght
 */
export const computeDirectionVector = (x1: number, y1: number, x2: number, y2: number, length: number): Vector => {
    const dx = x2 - x1;
    const dy = y2 - y1;

    const distance = Math.sqrt(dx * dx + dy * dy);

    const unitDx = dx / distance;
    const unitDy = dy / distance;

    return { x: unitDx * length, y: unitDy * length };
};

export const computeDistanceBetweenPoints = (x1: number, y1: number, x2: number, y2: number): number => {
    const dx = x2 - x1;
    const dy = y2 - y1;

    return Math.sqrt(dx * dx + dy * dy);
};

/**
 * Computes the direction vector on horizontal/vertical axis normalized to length 1
 */
export const computeUnitVector = (x: number, y: number): Vector => {
    /**
     * Case 1
     * x > 0 && y > 0
     * --------------
     * abs
     * x > y -> move right
     * x < y -> move down
     *
     * Case 2
     * x > 0 && y < 0
     * --------------
     * abs
     * x > y -> move right
     * x < y -> move up
     *
     * Case 3
     * x < 0 && y > 0
     * --------------
     * abs
     * x > y -> move left
     * x < y -> move down
     *
     * Case 4
     * x < 0 && y < 0
     * --------------
     * abs
     * x > y -> move left
     * x < y -> move up
     *
     */

    if (Math.abs(x) > Math.abs(y)) {
        return x > 0 ? { x: 1, y: 0 } : { x: -1, y: 0 };
    } else {
        return y > 0 ? { x: 0, y: 1 } : { x: 0, y: -1 };
    }
};

export const isVector = (obj: any): obj is Vector => {
    const propeties = Object.keys(obj);

    if (propeties.length > 2) {
        return false;
    }

    return obj && typeof obj.x === 'number' && typeof obj.y === 'number';
};

export const isRectangle = (obj: any): obj is Rectangle => {
    const propeties = Object.keys(obj);

    if (propeties.length > 4) {
        return false;
    }

    return (
        obj &&
        typeof obj.x === 'number' &&
        typeof obj.y === 'number' &&
        typeof obj.width === 'number' &&
        typeof obj.height === 'number'
    );
};
