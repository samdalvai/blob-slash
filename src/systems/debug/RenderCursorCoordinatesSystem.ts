import System from '../../ecs/System';
import { Vector } from '../../types/utils';

export default class RenderCursorCoordinatesSystem extends System {
    constructor() {
        super();
    }

    update(ctx: CanvasRenderingContext2D, mousePosition: Vector, zoom?: number) {
        ctx.strokeStyle = 'red';

        const zoomFactor = zoom ?? 1;

        ctx.beginPath();
        ctx.moveTo((mousePosition.x - 25 / zoomFactor) * zoomFactor, mousePosition.y * zoomFactor);
        ctx.lineTo((mousePosition.x + 25 / zoomFactor) * zoomFactor, mousePosition.y * zoomFactor);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(mousePosition.x * zoomFactor, (mousePosition.y - 25 / zoomFactor) * zoomFactor);
        ctx.lineTo(mousePosition.x * zoomFactor, (mousePosition.y + 25 / zoomFactor) * zoomFactor);
        ctx.stroke();
    }
}
