import System from '../../ecs/System';
import Game from '../../game/Game';
import { Rectangle } from '../../types/utils';

export default class RenderCursorCoordinatesSystem extends System {
    constructor() {
        super();
    }

    update(ctx: CanvasRenderingContext2D, camera: Rectangle, zoom?: number) {
        ctx.strokeStyle = 'red';

        const zoomFactor = zoom ?? 1;

        const screenMouseX = Game.mousePositionScreen.x * zoomFactor;
        const screenMouseY = Game.mousePositionScreen.y * zoomFactor;

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
