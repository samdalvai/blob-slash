import System from '../../core/ecs/System';
import Game from '../Game';

export default class DebugCursorCoordinatesSystem extends System {
    constructor() {
        super();
    }

    update(ctx: CanvasRenderingContext2D, offsetX = 0) {
        ctx.strokeStyle = 'red';

        const crossSize = 25;

        ctx.beginPath();
        ctx.moveTo(Game.mousePositionScreen.x - crossSize + offsetX, Game.mousePositionScreen.y);
        ctx.lineTo(Game.mousePositionScreen.x + crossSize + offsetX, Game.mousePositionScreen.y);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(Game.mousePositionScreen.x + offsetX, Game.mousePositionScreen.y - crossSize);
        ctx.lineTo(Game.mousePositionScreen.x + offsetX, Game.mousePositionScreen.y + crossSize);
        ctx.stroke();
    }
}
