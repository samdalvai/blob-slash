export type Vector = {
    x: number;
    y: number;
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
