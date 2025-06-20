export default abstract class Engine {
    protected isRunning: boolean;

    constructor() {
        this.isRunning = false;
    }

    protected setup = async (): Promise<void> => {
        throw new Error('Method setup must be implemented');
    };

    protected processInput = (): void => {
        throw new Error('Method processInput must be implemented');
    };

    protected update = (deltaTime: number): void => {
        throw new Error('Method update must be implemented');
    };

    protected render = (): void => {
        throw new Error('Method render must be implemented');
    };

    run = async () => {
        console.log('This: ', this);
        await this.setup();
        console.log('Running Engine');

        let lastTime = performance.now();

        const loop = () => {
            if (this.isRunning) {
                const currentTime = performance.now();
                const deltaTime = (currentTime - lastTime) / 1000.0;

                this.processInput();
                this.update(deltaTime);
                this.render();

                lastTime = currentTime;

                requestAnimationFrame(loop);
            }
        };

        requestAnimationFrame(loop);
    };
}
