import AssetStore from './asset-store/AssetStore';
import Registry from './ecs/Registry';
import EventBus from './event-bus/EventBus';
import InputManager from './input-manager/InputManager';
import LevelManager from './level-manager/LevelManager';
import { GameStatus, Rectangle, Vector } from './types/utils';

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
    protected levelManager: LevelManager;

    // Game status properties
    protected isRunning: boolean;
    protected isDebug: boolean;
    protected gameStatus: GameStatus;

    // Debug info
    protected currentFPS: number;
    protected maxFPS: number;
    protected frameDuration: number;
    protected millisecondsLastFPSUpdate: number;

    // Global engine objects
    static mousePositionScreen: Vector;
    static mousePositionWorld: Vector;
    static mapWidth: number;
    static mapHeight: number;
    static windowWidth: number;
    static windowHeight: number;

    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.camera = { x: 0, y: 0, width: window.innerWidth, height: window.innerHeight };

        this.registry = new Registry();
        this.assetStore = new AssetStore();
        this.eventBus = new EventBus();
        this.inputManager = new InputManager();
        this.levelManager = new LevelManager(this.registry, this.assetStore);

        this.isRunning = false;
        this.isDebug = false;
        this.gameStatus = GameStatus.IDLE;

        this.currentFPS = 0;
        this.maxFPS = 0;
        this.frameDuration = 0;
        this.millisecondsLastFPSUpdate = 0;

        Engine.mousePositionScreen = { x: 0, y: 0 };
        Engine.mousePositionWorld = { x: 0, y: 0 };
    }

    protected initialize = () => {
        const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
            throw new Error('Failed to get 2D context for the canvas.');
        }

        this.resize(canvas, this.camera);
        canvas.style.cursor = 'none';

        this.canvas = canvas;
        this.ctx = ctx;
        this.isRunning = true;

        window.addEventListener('resize', () => {
            if (this.canvas && this.camera) {
                this.resize(this.canvas, this.camera);
            }
        });
    };

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    protected resize = (canvas: HTMLCanvasElement, camera: Rectangle, ...args: any[]) => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        camera.width = window.innerWidth;
        camera.height = window.innerHeight;

        Engine.windowWidth = window.innerWidth;
        Engine.windowHeight = window.innerHeight;

        const ctx = canvas.getContext('2d');

        if (!ctx) {
            throw new Error('Failed to get 2D context for the canvas.');
        }

        // If this is not disabled the browser might use interpolation to smooth the scaling,
        // which can cause visible borders or artifacts, e.g. when rendering tiles
        ctx.imageSmoothingEnabled = false;
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

    protected abstract setup(): Promise<void>;

    protected abstract processInput(): void;

    protected abstract update(deltaTime: number): void;

    protected abstract render(): void;

    run = async () => {
        console.log('Initializing Engine');
        this.initialize();

        console.log('Setting up systems');
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
