import AssetStore from './asset-store/AssetStore';
import Registry from './ecs/Registry';
import EventBus from './event-bus/EventBus';
import InputManager from './input-manager/InputManager';
import { Rectangle } from './types/utils';

export default abstract class Engine {
    // Objects for rendering
    protected canvas: HTMLCanvasElement | null;
    protected ctx: CanvasRenderingContext2D | null;
    protected camera: Rectangle;

    // Ecs related objects
    protected registry: Registry;
    protected assetStore: AssetStore;
    protected eventBus: EventBus;
    protected inputManager: InputManager;

    // Game status properties
    protected isRunning: boolean;
    protected isDebug: boolean;

    // Debug info
    protected currentFPS: number;
    protected maxFPS: number;
    protected frameDuration: number;
    protected millisecondsLastFPSUpdate: number;

    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.camera = { x: 0, y: 0, width: window.innerWidth, height: window.innerHeight };

        this.registry = new Registry();
        this.assetStore = new AssetStore();
        this.eventBus = new EventBus();
        this.inputManager = new InputManager();

        this.isRunning = false;
        this.isDebug = false;

        this.currentFPS = 0;
        this.maxFPS = 0;
        this.frameDuration = 0;
        this.millisecondsLastFPSUpdate = 0;
    }

    protected initialize = (): void => {
        throw new Error('Method initialize must be implemented by subclass');
    };

    protected setup = async (): Promise<void> => {
        throw new Error('Method setup must be implemented by subclass');
    };

    protected processInput = (): void => {
        throw new Error('Method processInput must be implemented by subclass');
    };

    protected update = (deltaTime: number): void => {
        throw new Error('Method update must be implemented by subclass');
    };

    protected render = (): void => {
        throw new Error('Method render must be implemented by subclass');
    };

    private updateDebugInfo = (deltaTime: number) => {
        const millisecsCurrentFrame = performance.now();
        if (millisecsCurrentFrame - this.millisecondsLastFPSUpdate >= 1000) {
            this.frameDuration = deltaTime * 1000;
            this.currentFPS = 1000 / this.frameDuration;
            this.millisecondsLastFPSUpdate = millisecsCurrentFrame;

            if (this.maxFPS < this.currentFPS) {
                this.maxFPS = this.currentFPS;
            }
        }
    };

    run = async () => {
        await this.setup();
        console.log('Running Engine');

        let lastTime = performance.now();

        const loop = () => {
            if (this.isRunning) {
                const currentTime = performance.now();
                const deltaTime = (currentTime - lastTime) / 1000.0;

                if (this.isDebug) {
                    this.updateDebugInfo(deltaTime);
                }

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
