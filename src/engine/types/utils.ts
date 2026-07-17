export type Vector = {
    x: number;
    y: number;
};

/** Width and height expressed in world units. */
export type Size = {
    width: number;
    height: number;
};

/**
 * A world-space camera. Its centre and viewport use the standard coordinate
 * convention: X increases rightward and Y increases upward.
 */
export type Camera = {
    center: Vector;
    viewportWidth: number;
    viewportHeight: number;
};

/** Axis-aligned world bounds in the standard Y-up coordinate system. */
export type WorldBounds = {
    left: number;
    right: number;
    bottom: number;
    top: number;
};

export type Rectangle = {
    x: number;
    y: number;
    width: number;
    height: number;
};

export enum Flip {
    NONE,
    HORIZONTAL,
    VERTICAL,
}

export enum Direction {
    UP,
    RIGHT,
    DOWN,
    LEFT,
}

export enum GameStatus {
    IDLE,
    PLAYING,
    WON,
    LOST,
}
