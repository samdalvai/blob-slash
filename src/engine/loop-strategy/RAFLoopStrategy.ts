import LoopStrategy from './LoopStrategy';

export default class RAFLoopStrategy extends LoopStrategy {
    async start() {
        let lastTime = performance.now();

        const loop = () => {
            if (!this.engine.running()) return;

            const deltaTime = (performance.now() - lastTime) / 1000.0;
            this.engine.runFrame(deltaTime);
            lastTime = performance.now();

            requestAnimationFrame(loop);
        };

        requestAnimationFrame(loop);
    }
}
