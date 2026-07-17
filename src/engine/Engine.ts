import AssetStore from './asset-store/AssetStore';
import Registry from './ecs/Registry';
import EventBus from './event-bus/EventBus';
import InputManager from './input-manager/InputManager';
import LevelManager from './level-manager/LevelManager';
import LoopStrategy from './loop-strategy/LoopStrategy';
import { Camera, GameStatus, Vector } from './types/utils';

export default abstract class Engine {
    // Objects for rendering
    protected canvas: HTMLCanvasElement | null;
    protected ctx: CanvasRenderingContext2D | null;
    /** Standard-coordinate world camera. */
    protected camera: Camera;

    // Ecs related objects
    protected registry: Registry;
    protected assetStore: AssetStore;
    protected eventBus: EventBus;
    protected inputManager: InputManager;
    protected levelManager: LevelManager;

    // Game status properties
    protected isRunning: boolean;
    protected isDebug: boolean;
    private loopStrategy: LoopStrategy | null;

    // Debug info
    protected currentFPS: number;
    protected maxFPS: number;
    protected frameDuration: number;
    protected millisecondsLastFPSUpdate: number;

    // Global engine objects
    /** Canvas-relative input position; the canvas origin is always top-left. */
    static mousePositionScreen: Vector;
    /** World-space pointer position in the standard Y-up coordinate system. */
    static mousePositionWorld: Vector;
    /** Map extents in world pixels with a bottom-left `(0, 0)` origin. */
    static mapWidth: number;
    static mapHeight: number;
    static windowWidth: number;
    static windowHeight: number;
    static gameStatus: GameStatus;

    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.camera = this.createCamera();

        this.registry = new Registry();
        this.assetStore = new AssetStore();
        this.eventBus = new EventBus();
        this.inputManager = new InputManager();
        this.levelManager = new LevelManager(this.registry, this.assetStore);

        this.isRunning = false;
        this.isDebug = false;
        this.loopStrategy = null;

        this.currentFPS = 0;
        this.maxFPS = 0;
        this.frameDuration = 0;
        this.millisecondsLastFPSUpdate = 0;

        Engine.gameStatus = GameStatus.IDLE;
        Engine.mousePositionScreen = { x: 0, y: 0 };
        Engine.mousePositionWorld = { x: 0, y: 0 };
    }

    protected initialize = async () => {
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

        await this.assetStore.initializeDefaultTexture();
    };

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    protected resize = (canvas: HTMLCanvasElement, camera: Camera, ...args: any[]) => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        camera.viewportWidth = window.innerWidth;
        camera.viewportHeight = window.innerHeight;

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

    /** Creates the camera representation used by this engine surface. */
    protected abstract createCamera(): Camera;

    protected abstract processInput(): void;

    protected abstract update(deltaTime: number): void;

    protected abstract render(): void;

    public running = () => this.isRunning;

    public setLoopStrategy = (loopStrategy: LoopStrategy) => {
        this.loopStrategy = loopStrategy;
    };

    public runFrame = (deltaTime: number) => {
        if (this.isDebug) {
            this.updateDebugInfo(deltaTime);
        }

        this.processInput();
        this.update(deltaTime);
        this.render();
    };

    public run = async () => {
        console.log('Initializing Engine');
        await this.initialize();

        console.log('Setting up systems');
        await this.setup();

        console.log('Running Engine');
        if (!this.loopStrategy) {
            throw new Error('No loop strategy defined for the engine');
        }

        await this.loopStrategy.start();
    };
}
