import System from '../../core/ecs/System';
import Game from '../../game/Game';
import { Rectangle } from '../../core/types/utils';

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
        ctx.strokeRect(0 - camera.x * zoom, 0 - camera.y * zoom, Game.mapWidth * zoom, Game.mapHeight * zoom);
    }
}
