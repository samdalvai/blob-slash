import Registry from '../../ecs/Registry';
import System from '../../ecs/System';
import Game from '../../game/Game';
import { Vector } from '../../types/utils';

export default class RenderDebugInfoSystem extends System {
    constructor() {
        super();
    }

    update(
        ctx: CanvasRenderingContext2D,
        currentFPS: number,
        maxFPS: number,
        frameDuration: number,
        mousePosition: Vector,
        registry: Registry,
        zoom?: number,
    ) {
        const x = Game.windowWidth - 275;
        const y = 50;

        ctx.save();

        ctx.font = '16px Arial';
        ctx.fillStyle = 'white';
        ctx.fillText(`Current FPS: ${currentFPS.toFixed(2)} (${maxFPS.toFixed(2)} max)`, x, y);
        ctx.fillText(`Frame duration: ${frameDuration.toFixed(2)} ms`, x, y + 25);
        ctx.fillText(
            `Mouse coordinates: {x: ${(zoom ? mousePosition.x / zoom : mousePosition.x).toFixed(2)}, y: ${(zoom ? mousePosition.y / zoom : mousePosition.y).toFixed(2)}}`,
            x,
            y + 50,
        );
        ctx.fillText(`Number of entities: ${registry.numEntities - registry.freeIds.length}`, x, y + 75);
        ctx.fillText('F3: save level to local storage', x, y + 100);
        ctx.fillText('F4: save level to json', x, y + 125);

        if (zoom) {
            ctx.fillText(`Zoom level: ${zoom.toFixed(2)}`, x, y + 150);
        }

        ctx.restore();
    }
}
