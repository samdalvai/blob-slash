import LoopStrategy from './LoopStrategy';

export default class RAFLoopStrategy extends LoopStrategy {
    async start() {
        let lastTime = performance.now();

        const loop = () => {
            if (!this.engine.isRunning) return;

            const currentTime = performance.now();
            const deltaTime = (currentTime - lastTime) / 1000.0;
            lastTime = currentTime;

            this.engine.runFrame(deltaTime);
            requestAnimationFrame(loop);
        };

        requestAnimationFrame(loop);
    }
}
