import { Camera, Size, Vector, WorldBounds } from '../types/utils';

const assertPositiveZoom = (zoom: number) => {
    if (zoom <= 0) {
        throw new Error('Zoom must be greater than zero');
    }
};

const clamp = (value: number, min: number, max: number): number => Math.max(min, Math.min(value, max));

/** Returns the world-space viewport limits for a centre-based camera. */
export const getCameraBounds = (camera: Camera): WorldBounds => {
    const halfWidth = camera.viewportWidth / 2;
    const halfHeight = camera.viewportHeight / 2;

    return {
        left: camera.center.x - halfWidth,
        right: camera.center.x + halfWidth,
        bottom: camera.center.y - halfHeight,
        top: camera.center.y + halfHeight,
    };
};

/** Converts a Y-up world point to top-left/Y-down canvas coordinates. */
export const worldToScreen = (world: Vector, camera: Camera, zoom = 1): Vector => {
    assertPositiveZoom(zoom);

    const bounds = getCameraBounds(camera);

    return {
        x: (world.x - bounds.left) * zoom,
        y: (bounds.top - world.y) * zoom,
    };
};

/** Converts a top-left/Y-down canvas point to Y-up world coordinates. */
export const screenToWorld = (screen: Vector, camera: Camera, zoom = 1): Vector => {
    assertPositiveZoom(zoom);

    const bounds = getCameraBounds(camera);

    return {
        x: screen.x / zoom + bounds.left,
        y: bounds.top - screen.y / zoom,
    };
};

/**
 * Clamps a camera centre to a finite map. If a map dimension is smaller than
 * its viewport dimension, the camera is centred on that map dimension.
 */
export const clampCameraCenter = (camera: Camera, mapSize: Size): Vector => {
    if (mapSize.width < 0 || mapSize.height < 0) {
        throw new Error('Map dimensions cannot be negative');
    }

    const clampAxis = (center: number, mapLength: number, viewportLength: number): number => {
        if (mapLength <= viewportLength) {
            return mapLength / 2;
        }

        const halfViewport = viewportLength / 2;
        return clamp(center, halfViewport, mapLength - halfViewport);
    };

    return {
        x: clampAxis(camera.center.x, mapSize.width, camera.viewportWidth),
        y: clampAxis(camera.center.y, mapSize.height, camera.viewportHeight),
    };
};

/** Returns the world bounds of a centre-anchored scaled sprite. */
export const getSpriteBounds = (position: Vector, size: Size, scale: Vector): WorldBounds => {
    const halfWidth = (size.width * scale.x) / 2;
    const halfHeight = (size.height * scale.y) / 2;

    return {
        left: position.x - halfWidth,
        right: position.x + halfWidth,
        bottom: position.y - halfHeight,
        top: position.y + halfHeight,
    };
};

/**
 * Returns the world bounds of a centre-anchored collider. Collider offset is
 * local and therefore scales together with the transform.
 */
export const getColliderBounds = (
    position: Vector,
    size: Size,
    offset: Vector,
    scale: Vector,
): WorldBounds => {
    const center = {
        x: position.x + offset.x * scale.x,
        y: position.y + offset.y * scale.y,
    };

    return getSpriteBounds(center, size, scale);
};

/** Strict AABB overlap: bounds that only touch at an edge do not overlap. */
export const worldBoundsOverlap = (a: WorldBounds, b: WorldBounds): boolean => {
    return a.left < b.right && a.right > b.left && a.bottom < b.top && a.top > b.bottom;
};

/**
 * Begins a Y-up world render pass on a regular top-left/Y-down canvas. Call
 * `endWorldRender` before drawing screen-space UI.
 */
export const beginWorldRender = (ctx: CanvasRenderingContext2D, camera: Camera, zoom = 1): void => {
    assertPositiveZoom(zoom);

    const bounds = getCameraBounds(camera);

    ctx.save();
    ctx.scale(zoom, -zoom);
    ctx.translate(-bounds.left, -bounds.top);
};

/** Restores canvas coordinates after `beginWorldRender`. */
export const endWorldRender = (ctx: CanvasRenderingContext2D): void => {
    ctx.restore();
};
