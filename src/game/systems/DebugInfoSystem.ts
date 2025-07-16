import Registry from '../../engine/ecs/Registry';
import System from '../../engine/ecs/System';
import { Rectangle } from '../../engine/types/utils';
import Engine from '../../engine/Engine';

export default class DebugInfoSystem extends System {
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
        const x = Engine.windowWidth - 350;
        const y = 50;

        ctx.font = '16px Arial';
        ctx.fillStyle = 'orange';
        ctx.fillText(`Current FPS: ${currentFPS.toFixed(2)} (${maxFPS.toFixed(2)} max)`, x, y);
        ctx.fillText(`Frame duration: ${frameDuration.toFixed(2)} ms`, x, y + 25);
        ctx.fillText(
            `Mouse screen: {x: ${Math.floor(Engine.mousePositionScreen.x)}, y: ${Math.floor(Engine.mousePositionScreen.y)}}`,
            x,
            y + 50,
        );
        ctx.fillText(
            `Mouse world: {x: ${Math.floor(Engine.mousePositionWorld.x)}, y: ${Math.floor(Engine.mousePositionWorld.y)}}`,
            x,
            y + 75,
        );
        ctx.fillText(
            `Camera: {x: ${Math.floor(camera.x)}, y: ${Math.floor(camera.y)}, w: ${Math.floor(camera.width)}, h: ${Math.floor(camera.height)}}`,
            x,
            y + 100,
        );
        ctx.fillText(`Number of entities: ${registry.numEntities - registry.freeIds.length}`, x, y + 125);

        if (zoom) {
            ctx.fillText(`Zoom level: ${zoom.toFixed(2)}`, x, y + 150);
        }
    }
}
