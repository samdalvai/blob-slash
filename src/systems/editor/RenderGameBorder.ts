import System from '../../ecs/System';
import Game from '../../game/Game';
import { Rectangle } from '../../types/utils';

export default class RenderGameBorder extends System {
    constructor() {
        super();
    }

    update(ctx: CanvasRenderingContext2D, camera: Rectangle, zoom: number) {
        ctx.strokeStyle = 'red';
        ctx.strokeRect(0 - camera.x * zoom, 0 - camera.y * zoom, Game.mapWidth * zoom, Game.mapHeight * zoom);
    }
}
