import System from '../ecs/System';
import Game from '../game/Game';
import InputManager from '../input-manager/InputManager';

export default class RenderDebugInfoSystem extends System {
    constructor() {
        super();
    }

    update(ctx: CanvasRenderingContext2D, currentFPS: number, inputManager: InputManager) {
        const x = Game.windowWidth - 400;
        const y = 50;

        ctx.save();

        ctx.font = '24px Arial';
        ctx.fillStyle = 'white';
        ctx.fillText(`Current FPS: (${currentFPS.toFixed(2)})`, x, y);

        ctx.fillText(
            `Mouse coordinates: (x: ${inputManager.mousePosition.x}, y: ${inputManager.mousePosition.y})`,
            x,
            y + 50,
        );

        ctx.restore();
    }
}
