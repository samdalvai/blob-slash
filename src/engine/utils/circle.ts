export const isPointInsideCircle = (
    pointX: number,
    pointY: number,
    circleX: number,
    circleY: number,
    circleRadius: number,
) => {
    return Math.pow(pointX - circleX, 2) + Math.pow(pointY - circleY, 2) <= circleRadius * circleRadius;
};
