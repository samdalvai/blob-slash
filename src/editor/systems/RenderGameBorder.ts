import System from '../../engine/ecs/System';
import { Rectangle } from '../../engine/types/utils';
import Engine from '../../engine/Engine';

export default class RenderGameBorder extends System {
    constructor() {
        super();
    }

    update(ctx: CanvasRenderingContext2D, camera: Rectangle, zoom: number) {
        ctx.fillStyle = 'red';
        ctx.font = '18px Arial';
        ctx.fillText('Game border', 0 - camera.x * zoom, 0 - camera.y * zoom - 10);

        ctx.strokeStyle = 'red';
        ctx.lineWidth = 2;
        ctx.strokeRect(0 - camera.x * zoom, 0 - camera.y * zoom, Engine.mapWidth * zoom, Engine.mapHeight * zoom);
    }
}
