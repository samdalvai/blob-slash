import System from '../../ecs/System';

export default class RenderCanvasBorder extends System {
    constructor() {
        super();
    }

    update(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) {
        ctx.strokeStyle = 'red';
        ctx.strokeRect(0, 0, canvas.width, canvas.height);
    }
}
