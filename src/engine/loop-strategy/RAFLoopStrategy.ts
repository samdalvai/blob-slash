import LoopStrategy from './LoopStrategy';

export default class RAFLoopStrategy extends LoopStrategy {
    async start() {
        let lastTime: number | undefined;

        const loop = (timestamp: number) => {
            if (!this.engine.running()) return;

            const deltaTime = lastTime === undefined ? 0 : (timestamp - lastTime) / 1000.0;
            lastTime = timestamp;

            this.engine.runFrame(deltaTime);

            requestAnimationFrame(loop);
        };

        requestAnimationFrame(loop);
    }
}
