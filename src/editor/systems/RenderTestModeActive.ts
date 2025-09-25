import System from '../../engine/ecs/System';
import Engine from '../../engine/Engine';

export default class RenderTestModeActive extends System {
    constructor() {
        super();
    }

    update(ctx: CanvasRenderingContext2D, testMode: boolean) {
        if (testMode) {
            ctx.fillStyle = 'red';
            ctx.font = '40px Arial';
            ctx.fillText('Test mode active, press F2 to disable', Engine.windowWidth - 750, Engine.windowHeight - 50);
        }
    }
}
