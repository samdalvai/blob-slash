import { describe, expect, test } from '@jest/globals';

import { Camera } from '../../../engine/types/utils';
import {
    beginWorldRender,
    clampCameraCenter,
    endWorldRender,
    getCameraBounds,
    getColliderBounds,
    getSpriteBounds,
    screenToWorld,
    worldBoundsOverlap,
    worldToScreen,
} from '../../../engine/utils/coordinates';

const camera: Camera = {
    center: { x: 100, y: 75 },
    viewportWidth: 200,
    viewportHeight: 150,
};

describe('standard coordinate helpers', () => {
    test('derives Y-up camera bounds from its centre and viewport', () => {
        expect(getCameraBounds(camera)).toEqual({ left: 0, right: 200, bottom: 0, top: 150 });
    });

    test('maps each viewport corner between Y-up world and Y-down screen coordinates', () => {
        expect(worldToScreen({ x: 0, y: 150 }, camera)).toEqual({ x: 0, y: 0 });
        expect(worldToScreen({ x: 200, y: 0 }, camera)).toEqual({ x: 200, y: 150 });
        expect(screenToWorld({ x: 0, y: 0 }, camera)).toEqual({ x: 0, y: 150 });
        expect(screenToWorld({ x: 200, y: 150 }, camera)).toEqual({ x: 200, y: 0 });
    });

    test('round-trips world and screen points with a non-unit zoom', () => {
        const world = { x: 125.5, y: 42.25 };
        const screen = worldToScreen(world, camera, 2.5);

        expect(screen).toEqual({ x: 313.75, y: 269.375 });
        expect(screenToWorld(screen, camera, 2.5)).toEqual(world);
    });

    test('rejects a non-positive zoom', () => {
        expect(() => worldToScreen({ x: 0, y: 0 }, camera, 0)).toThrow('Zoom must be greater than zero');
        expect(() => screenToWorld({ x: 0, y: 0 }, camera, -1)).toThrow('Zoom must be greater than zero');
    });

    test('clamps a camera to map edges and centres it when the map is smaller', () => {
        expect(clampCameraCenter({ ...camera, center: { x: -10, y: 900 } }, { width: 1000, height: 500 })).toEqual({
            x: 100,
            y: 425,
        });
        expect(clampCameraCenter(camera, { width: 100, height: 100 })).toEqual({ x: 50, y: 50 });
    });

    test('calculates centre-anchored sprite and collider bounds', () => {
        expect(getSpriteBounds({ x: 10, y: 20 }, { width: 8, height: 4 }, { x: 2, y: 3 })).toEqual({
            left: 2,
            right: 18,
            bottom: 14,
            top: 26,
        });
        expect(
            getColliderBounds({ x: 10, y: 20 }, { width: 4, height: 6 }, { x: 2, y: -1 }, { x: 2, y: 3 }),
        ).toEqual({ left: 10, right: 18, bottom: 8, top: 26 });
    });

    test('uses strict AABB overlap so touching bounds do not collide', () => {
        const bounds = { left: 0, right: 10, bottom: 0, top: 10 };

        expect(worldBoundsOverlap(bounds, { left: 5, right: 15, bottom: 5, top: 15 })).toBe(true);
        expect(worldBoundsOverlap(bounds, { left: 10, right: 20, bottom: 0, top: 10 })).toBe(false);
    });

    test('sets and restores the canvas world transform', () => {
        const calls: string[] = [];
        const ctx = {
            save: () => calls.push('save'),
            scale: (x: number, y: number) => calls.push(`scale:${x},${y}`),
            translate: (x: number, y: number) => calls.push(`translate:${x},${y}`),
            restore: () => calls.push('restore'),
        } as unknown as CanvasRenderingContext2D;

        beginWorldRender(ctx, camera, 2);
        endWorldRender(ctx);

        expect(calls).toEqual(['save', 'scale:2,-2', 'translate:0,-150', 'restore']);
    });
});
