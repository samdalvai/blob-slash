import Registry from '../../ecs/Registry';
import System from '../../ecs/System';
import Game from '../../game/Game';
import { Rectangle } from '../../types/utils';

export default class RenderDebugInfoSystem extends System {
    constructor() {
        super();
    }

    update(
        ctx: CanvasRenderingContext2D,
        currentFPS: number,
        maxFPS: number,
        frameDuration: number,
        registry: Registry,
        camera: Rectangle,
        zoom?: number,
    ) {
        const x = Game.windowWidth - 300;
        const y = 50;

        ctx.save();

        ctx.font = '16px Arial';
        ctx.fillStyle = 'white';
        ctx.fillText(`Current FPS: ${currentFPS.toFixed(2)} (${maxFPS.toFixed(2)} max)`, x, y);
        ctx.fillText(`Frame duration: ${frameDuration.toFixed(2)} ms`, x, y + 25);
        ctx.fillText(
            `Mouse screen: {x: ${Math.floor(Game.mousePositionScreen.x)}, y: ${Math.floor(Game.mousePositionScreen.y)}}`,
            x,
            y + 50,
        );
        ctx.fillText(
            `Mouse world: {x: ${Math.floor(Game.mousePositionWorld.x)}, y: ${Math.floor(Game.mousePositionWorld.y)}}`,
            x,
            y + 75,
        );
        ctx.fillText(
            `Camera: {x: ${Math.floor(camera.x)}, y: ${Math.floor(camera.y)}, w: ${Math.floor(camera.width)}, h: ${Math.floor(camera.height)}}`,
            x,
            y + 100,
        );
        ctx.fillText(`Number of entities: ${registry.numEntities - registry.freeIds.length}`, x, y + 125);
        ctx.fillText('F3: save level to local storage', x, y + 150);
        ctx.fillText('F4: save level to json', x, y + 175);

        if (zoom) {
            ctx.fillText(`Zoom level: ${zoom.toFixed(2)}`, x, y + 200);
        }

        ctx.restore();
    }
}
