import System from '../../engine/ecs/System';
import { Rectangle } from '../../engine/types/utils';
import Game from '../../game/Game';
import Editor from '../Editor';

export default class RenderGridSystem extends System {
    constructor() {
        super();
    }

    update = (ctx: CanvasRenderingContext2D, camera: Rectangle, zoom: number) => {
        if (!Editor.showGrid) {
            return;
        }

        ctx.save();

        ctx.strokeStyle = 'lightgray';
        ctx.lineWidth = 1;

        let offset = 0;

        while (offset <= Game.mapHeight) {
            ctx.beginPath();
            ctx.moveTo((0 - camera.x) * zoom, (offset - camera.y) * zoom);
            ctx.lineTo((Game.mapWidth - camera.x) * zoom, (offset - camera.y) * zoom);
            ctx.stroke();

            offset += Editor.gridSquareSide;
        }

        offset = 0;

        while (offset <= Game.mapWidth) {
            ctx.beginPath();
            ctx.moveTo((offset - camera.x) * zoom, (0 - camera.y) * zoom);
            ctx.lineTo((offset - camera.x) * zoom, (Game.mapHeight - camera.y) * zoom);
            ctx.stroke();

            offset += Editor.gridSquareSide;
        }

        ctx.restore();
    };
}
