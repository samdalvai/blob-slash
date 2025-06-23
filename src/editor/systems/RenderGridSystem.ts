import System from '../../engine/ecs/System';
import { Rectangle } from '../../engine/types/utils';

export default class RenderGridSystem extends System {
    constructor() {
        super();
    }

    update = (ctx: CanvasRenderingContext2D, camera: Rectangle, zoom: number) => {
        ctx.save();

        ctx.strokeStyle = 'gray';
        ctx.lineWidth = 1;

        ctx.beginPath();
        ctx.moveTo((0 - camera.x) * zoom, (200 - camera.y) * zoom);
        ctx.lineTo((100 - camera.x) * zoom, (200 - camera.y) * zoom);
        ctx.stroke();

        ctx.restore();
    };
}
