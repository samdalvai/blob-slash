import System from '../../engine/ecs/System';

export default class RenderTestModeActive extends System {
    constructor() {
        super();
    }

    update(ctx: CanvasRenderingContext2D, testMode: boolean) {
        if (testMode) {
            ctx.fillStyle = 'red';
            ctx.font = '50px Arial';
            ctx.fillText('Test mode active', 100, 100);
        }
    }
}
