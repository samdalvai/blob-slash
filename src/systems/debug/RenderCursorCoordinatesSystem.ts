import System from '../../ecs/System';
import { Rectangle, Vector } from '../../types/utils';

export default class RenderCursorCoordinatesSystem extends System {
    constructor() {
        super();
    }

    update(ctx: CanvasRenderingContext2D, camera: Rectangle, mousePosition: Vector, zoom?: number) {
        ctx.strokeStyle = 'red';

        const zoomFactor = zoom ?? 1;

        const screenMouseX = (mousePosition.x - camera.x) * zoomFactor;
        const screenMouseY = (mousePosition.y - camera.y) * zoomFactor;

        const crossSize = 25;

        ctx.beginPath();
        ctx.moveTo(screenMouseX - crossSize, screenMouseY);
        ctx.lineTo(screenMouseX + crossSize, screenMouseY);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(screenMouseX, screenMouseY - crossSize);
        ctx.lineTo(screenMouseX, screenMouseY + crossSize);
        ctx.stroke();
    }
}
