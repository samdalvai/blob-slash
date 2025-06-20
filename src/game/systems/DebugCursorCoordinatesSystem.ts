import System from '../../engine/ecs/System';
import Game from '../Game';

export default class DebugCursorCoordinatesSystem extends System {
    constructor() {
        super();
    }

    update(ctx: CanvasRenderingContext2D, offsetX = 0) {
        ctx.strokeStyle = 'red';

        const crossSize = 25;

        ctx.beginPath();
        ctx.moveTo(Engine.mousePositionScreen.x - crossSize + offsetX, Engine.mousePositionScreen.y);
        ctx.lineTo(Engine.mousePositionScreen.x + crossSize + offsetX, Engine.mousePositionScreen.y);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(Engine.mousePositionScreen.x + offsetX, Engine.mousePositionScreen.y - crossSize);
        ctx.lineTo(Engine.mousePositionScreen.x + offsetX, Engine.mousePositionScreen.y + crossSize);
        ctx.stroke();
    }
}
