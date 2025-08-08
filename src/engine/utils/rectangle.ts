type Rectangle = {
    x: number;
    y: number;
    width: number;
    height: number;
};

export const rectanglesOverlap = (rectA: Rectangle, rectB: Rectangle): boolean => {
    return !(
        rectA.x + rectA.width <= rectB.x || // A is to the left of B
        rectB.x + rectB.width <= rectA.x || // B is to the left of A
        rectA.y + rectA.height <= rectB.y || // A is above B
        rectB.y + rectB.height <= rectA.y // B is above A
    );
};
