import { Vector } from '../types';

/**
 * Computes the direction vector between two points, normalized over the lenght
 * @param x1 Source x
 * @param y1 Source y
 * @param x2 Destination x
 * @param y2 Destination y
 * @param length The lenght of the vector
 * @returns
 */
export const computeDirectionVector = (x1: number, y1: number, x2: number, y2: number, length: number): Vector => {
    const dx = x2 - x1;
    const dy = y2 - y1;

    const distance = Math.sqrt(dx * dx + dy * dy);

    const unitDx = dx / distance;
    const unitDy = dy / distance;

    return { x: unitDx * length, y: unitDy * length };
};
