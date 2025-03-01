import Registry from '../../ecs/Registry';
import System from '../../ecs/System';
import Game from '../../game/Game';
import InputManager from '../../input-manager/InputManager';

export default class RenderDebugInfoSystem extends System {
    constructor() {
        super();
    }

    update(
        ctx: CanvasRenderingContext2D,
        currentFPS: number,
        maxFPS: number,
        currentTickTime: number,
        inputManager: InputManager,
        registry: Registry,
    ) {
        const x = Game.windowWidth - 400;
        const y = 50;

        ctx.save();

        ctx.font = '24px Arial';
        ctx.fillStyle = 'white';
        ctx.fillText(`Current FPS: ${currentFPS.toFixed(2)} (${maxFPS.toFixed(2)} max)`, x, y);
        ctx.fillText(`Tick time: ${currentTickTime.toFixed(2)} ms`, x, y + 50);
        ctx.fillText(
            `Mouse coordinates: {x: ${inputManager.mousePosition.x}, y: ${inputManager.mousePosition.y}}`,
            x,
            y + 100,
        );
        ctx.fillText(`Number of entities: ${registry.numEntities}`, x, y + 150);

        ctx.restore();
    }
}
