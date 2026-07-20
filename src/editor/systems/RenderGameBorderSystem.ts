import { Engine, System } from '../../engine';

export default class RenderGameBorderSystem extends System {
    update(ctx: CanvasRenderingContext2D, zoom: number) {
        ctx.strokeStyle = 'red';
        ctx.lineWidth = 2 / zoom;
        ctx.strokeRect(0, 0, Engine.mapWidth, Engine.mapHeight);

        ctx.save();
        ctx.translate(0, Engine.mapHeight + 10 / zoom);
        ctx.scale(1, -1);
        ctx.fillStyle = 'red';
        ctx.font = `${18 / zoom}px Arial`;
        ctx.fillText('Game border', 0, 0);
        ctx.restore();
    }
}
