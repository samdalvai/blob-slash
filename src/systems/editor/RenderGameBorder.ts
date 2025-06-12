import System from '../../ecs/System';
import Game from '../../game/Game';

export default class RenderGameBorder extends System {
    constructor() {
        super();
    }

    update(ctx: CanvasRenderingContext2D, zoom: number) {
        ctx.strokeStyle = 'red';
        ctx.strokeRect(0, 0, Game.mapWidth * zoom, Game.mapHeight * zoom);
    }
}
