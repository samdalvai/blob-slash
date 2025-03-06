import AssetStore from '../../asset-store/AssetStore';
import System from '../../ecs/System';
import { Vector } from '../../types';

export default class RenderCursorCoordinatesSystem extends System {
    constructor() {
        super();
    }

    update(ctx: CanvasRenderingContext2D, mousePosition: Vector) {
        ctx.strokeStyle = 'red';

        ctx.beginPath();
        ctx.moveTo(mousePosition.x - 25, mousePosition.y);
        ctx.lineTo(mousePosition.x + 25, mousePosition.y);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(mousePosition.x, mousePosition.y - 25);
        ctx.lineTo(mousePosition.x, mousePosition.y + 25);
        ctx.stroke();
    }
}
