import Engine from '../Engine';
import { sleep } from '../utils/time';
import LoopStrategy from './LoopStrategy';

export default class FixedFPSLoopStrategy extends LoopStrategy {
    private fps: number;

    constructor(engine: Engine, fps = 60) {
        super(engine);
        this.fps = fps;
    }

    async start() {
        const MILLISECS_PER_FRAME = 1000 / this.fps;
        let lastTime = performance.now();

        while (this.engine.isRunning) {
            const timeToWait = MILLISECS_PER_FRAME - (performance.now() - lastTime);
            if (timeToWait > 0 && timeToWait <= MILLISECS_PER_FRAME) {
                await sleep(timeToWait);
            }

            const currentTime = performance.now();
            const deltaTime = (currentTime - lastTime) / 1000.0;
            lastTime = currentTime;

            this.engine.runFrame(deltaTime);
        }
    }
}
