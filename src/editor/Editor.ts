import AssetStore from '../asset-store/AssetStore';
import Registry from '../ecs/Registry';
import EventBus from '../event-bus/EventBus';
import KeyPressedEvent from '../events/KeyPressedEvent';
import KeyReleasedEvent from '../events/KeyReleasedEvent';
import MouseMoveEvent from '../events/MouseMoveEvent';
import MousePressedEvent from '../events/MousePressedEvent';
import MouseReleasedEvent from '../events/MouseReleasedEvent';
import ScrollEvent from '../events/ScrollEvent';
import Game from '../game/Game';
import InputManager from '../input-manager/InputManager';
import { saveLevelToJson, saveLevelToLocalStorage } from '../serialization/persistence';
import AnimationOnHitSystem from '../systems/AnimationOnHitSystem';
import AnimationSystem from '../systems/AnimationSystem';
import CameraMovementSystem from '../systems/CameraMovementSystem';
import CameraShakeSystem from '../systems/CameraShakeSystem';
import CollisionSystem from '../systems/CollisionSystem';
import DamageSystem from '../systems/DamageSystem';
import DeadBodyOnDeathSystem from '../systems/DeadBodyOnDeathSystem';
import EntityDestinationSystem from '../systems/EntityDestinationSystem';
import EntityEffectSystem from '../systems/EntityEffectSystem';
import EntityFollowSystem from '../systems/EntityFollowSystem';
import EntityHighlightSystem from '../systems/EntityHighlightSystem';
import LifetimeSystem from '../systems/LifeTimeSystem';
import MovementSystem from '../systems/MovementSystem';
import ParticleEmitSystem from '../systems/ParticleEmitSystem';
import PlayerControlSystem from '../systems/PlayerControlSystem';
import PlayerDetectionSystem from '../systems/PlayerDetectionSystem';
import RangedAttackEmitSystem from '../systems/RangedAttackEmitSystem';
import ScriptingSystem from '../systems/ScriptingSystem';
import SoundSystem from '../systems/SoundSystem';
import SpriteStateSystem from '../systems/SpriteStateSystem';
import RenderColliderSystem from '../systems/debug/RenderColliderSystem';
import RenderCursorCoordinatesSystem from '../systems/debug/RenderCursorCoordinatesSystem';
import RenderDebugInfoSystem from '../systems/debug/RenderDebugInfoSystem';
import RenderEntityDestinationSystem from '../systems/debug/RenderEntityDestinationSystem';
import RenderParticleSourceSystem from '../systems/debug/RenderParticleSourceSystem';
import RenderPlayerFollowRadiusSystem from '../systems/debug/RenderPlayerFollowRadiusSystem';
import RenderSlowTimeRadiusSystem from '../systems/debug/RenderSlowTimeRadiusSystem';
import EditorRenderSystem from '../systems/editor/EditorRenderSystem';
import RenderGameBorder from '../systems/editor/RenderGameBorder';
import RenderSidebarEntities from '../systems/editor/RenderSidebarEntities';
import RenderSpriteBoxSystem from '../systems/editor/RenderSpriteBoxSystem';
import RenderGUISystem from '../systems/render/RenderGUISystem';
import RenderHealthBarSystem from '../systems/render/RenderHealthBarSystem';
import RenderLightingSystem from '../systems/render/RenderLightingSystem';
import RenderParticleSystem from '../systems/render/RenderParticleSystem';
// import RenderSystem from '../systems/render/RenderSystem';
import RenderTextSystem from '../systems/render/RenderTextSystem';
import { GameStatus, Rectangle, Vector } from '../types/utils';
import EditorLevelLoader from './EditorLevelLoader';

// import LevelLoader from './LevelLoader';

export default class Editor {
    private isRunning: boolean;
    // private isDebug: boolean;
    private canvas: HTMLCanvasElement | null;
    private ctx: CanvasRenderingContext2D | null;
    private sidebar: HTMLElement | null;
    private camera: Rectangle;
    private millisecondsLastFPSUpdate = 0;
    private currentFPS = 0;
    private maxFPS = 0;
    private frameDuration = 0;
    private registry: Registry;
    private assetStore: AssetStore;
    private eventBus: EventBus;
    private inputManager: InputManager;

    private mousePressed: boolean;
    private commandButtonPressed: boolean;
    private zoom: number;
    private needSidebarUpdate: boolean;

    static mapWidth: number;
    static mapHeight: number;
    static gameStatus: GameStatus;

    constructor() {
        this.isRunning = false;
        // this.isDebug = false;

        this.canvas = null;
        this.ctx = null;
        this.sidebar = null;

        this.camera = { x: 0, y: 0, width: window.innerWidth, height: window.innerHeight };
        this.registry = new Registry();
        this.assetStore = new AssetStore();
        this.eventBus = new EventBus();
        this.inputManager = new InputManager();
        this.mousePressed = false;
        this.commandButtonPressed = false;
        this.zoom = 1;
        this.needSidebarUpdate = true;

        Game.mousePositionScreen = { x: 0, y: 0 };
        Game.mousePositionWorld = { x: 0, y: 0 };
    }

    private resize = (canvas: HTMLCanvasElement, camera: Rectangle, sidebar: HTMLElement) => {
        canvas.width = window.innerWidth - sidebar.getBoundingClientRect().width;
        canvas.height = window.innerHeight;

        camera.width = window.innerWidth - sidebar.getBoundingClientRect().width;
        camera.height = window.innerHeight;

        //camera.x = sidebar.getBoundingClientRect().width

        Game.windowWidth = window.innerWidth - sidebar.getBoundingClientRect().width;
        Game.windowHeight = window.innerHeight;

        const ctx = canvas.getContext('2d');

        if (!ctx) {
            throw new Error('Failed to get 2D context for the canvas.');
        }

        // If this is not disabled the browser might use interpolation to smooth the scaling,
        // which can cause visible borders or artifacts, e.g. when rendering tiles
        ctx.imageSmoothingEnabled = false;
    };

    initialize = () => {
        console.log('Initializing game');
        const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
        const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
        const sidebar = document.getElementById('sidebar') as HTMLElement;

        if (!canvas) {
            throw new Error('Failed to get canvas.');
        }

        if (!ctx) {
            throw new Error('Failed to get 2D context for the canvas.');
        }

        if (!sidebar) {
            throw new Error('Failed to get sidebar element.');
        }

        this.canvas = canvas;
        this.ctx = ctx;
        this.sidebar = sidebar;

        this.resize(canvas, this.camera, this.sidebar);
        // canvas.style.cursor = 'none';

        this.isRunning = true;

        window.addEventListener('resize', () => {
            if (this.canvas && this.camera && this.sidebar) {
                this.resize(this.canvas, this.camera, this.sidebar);
            }
        });
    };

    private setup = async () => {
        // Rendering systems
        // this.registry.addSystem(RenderSystem);
        this.registry.addSystem(RenderTextSystem);
        this.registry.addSystem(RenderParticleSystem);
        this.registry.addSystem(RenderLightingSystem);
        this.registry.addSystem(RenderGUISystem);
        // this.registry.addSystem(RenderCursorSystem);

        // Other entities related systems
        this.registry.addSystem(MovementSystem);
        this.registry.addSystem(CameraMovementSystem);
        this.registry.addSystem(AnimationSystem);
        this.registry.addSystem(CollisionSystem);
        this.registry.addSystem(RangedAttackEmitSystem, this.registry);
        this.registry.addSystem(DamageSystem, this.eventBus);
        this.registry.addSystem(LifetimeSystem);
        this.registry.addSystem(CameraShakeSystem);
        this.registry.addSystem(SoundSystem, this.assetStore);
        this.registry.addSystem(RenderPlayerFollowRadiusSystem);
        this.registry.addSystem(EntityFollowSystem);
        this.registry.addSystem(PlayerDetectionSystem);
        this.registry.addSystem(SpriteStateSystem);
        this.registry.addSystem(ScriptingSystem);
        this.registry.addSystem(DeadBodyOnDeathSystem);
        this.registry.addSystem(ParticleEmitSystem);
        this.registry.addSystem(PlayerControlSystem, this.eventBus, this.registry);
        this.registry.addSystem(EntityDestinationSystem);
        this.registry.addSystem(EntityHighlightSystem);
        this.registry.addSystem(EntityEffectSystem);
        this.registry.addSystem(AnimationOnHitSystem);

        // Debug systems
        this.registry.addSystem(RenderColliderSystem);
        this.registry.addSystem(RenderHealthBarSystem);
        this.registry.addSystem(RenderEntityDestinationSystem);
        this.registry.addSystem(RenderParticleSourceSystem);
        this.registry.addSystem(RenderDebugInfoSystem);
        this.registry.addSystem(RenderSlowTimeRadiusSystem);
        this.registry.addSystem(RenderCursorCoordinatesSystem);

        // Editor related systems
        this.registry.addSystem(EditorRenderSystem);
        this.registry.addSystem(RenderSpriteBoxSystem);
        this.registry.addSystem(RenderGameBorder);
        this.registry.addSystem(RenderSidebarEntities);

        await EditorLevelLoader.loadLevel(this.registry, this.assetStore);
    };

    private processInput = () => {
        // Hanlde keyboard events
        while (this.inputManager.keyboardInputBuffer.length > 0) {
            const inputEvent = this.inputManager.keyboardInputBuffer.shift();

            if (!inputEvent) {
                return;
            }

            switch (inputEvent.type) {
                case 'keydown':
                    if (inputEvent.code === 'MetaLeft') {
                        this.commandButtonPressed = true;
                    }

                    if (inputEvent.code === 'F3') {
                        saveLevelToLocalStorage(this.registry);
                    }

                    if (inputEvent.code === 'F4') {
                        saveLevelToJson(this.registry);
                    }

                    this.eventBus.emitEvent(KeyPressedEvent, inputEvent.code);
                    break;
                case 'keyup':
                    if (inputEvent.code === 'MetaLeft') {
                        this.commandButtonPressed = false;
                    }

                    this.eventBus.emitEvent(KeyReleasedEvent, inputEvent.code);
                    break;
            }
        }

        // Handle mouse events
        while (this.inputManager.mouseInputBuffer.length > 0) {
            const inputEvent = this.inputManager.mouseInputBuffer.shift();

            if (!inputEvent) {
                return;
            }

            switch (inputEvent.type) {
                case 'mousemove': {
                    if (!this.sidebar) {
                        throw new Error('Failed to get sidebar element.');
                    }

                    const mouseX =
                        (inputEvent.x - this.sidebar.getBoundingClientRect().width) / this.zoom + this.camera.x;
                    const mouseY = inputEvent.y / this.zoom + this.camera.y;

                    Game.mousePositionScreen = {
                        x: inputEvent.x,
                        y: inputEvent.y,
                    };

                    // Handles mouse pad pan
                    if (this.mousePressed && this.commandButtonPressed) {
                        const dx = mouseX - Game.mousePositionWorld.x;
                        const dy = mouseY - Game.mousePositionWorld.y;

                        this.camera.x -= dx;
                        this.camera.y -= dy;
                    }

                    Game.mousePositionWorld = {
                        x: mouseX,
                        y: mouseY,
                    };

                    this.eventBus.emitEvent(MouseMoveEvent, {
                        x: mouseX,
                        y: mouseY,
                    });
                    break;
                }
                case 'mousedown':
                    this.mousePressed = true;
                    this.eventBus.emitEvent(
                        MousePressedEvent,
                        {
                            x: inputEvent.x / this.zoom + this.camera.x,
                            y: inputEvent.y / this.zoom + this.camera.y,
                        },
                        inputEvent.button === 0 ? 'left' : 'right',
                    );
                    break;
                case 'mouseup':
                    this.mousePressed = false;
                    this.eventBus.emitEvent(
                        MouseReleasedEvent,
                        {
                            x: inputEvent.x / this.zoom + this.camera.x,
                            y: inputEvent.y / this.zoom + this.camera.y,
                        },
                        inputEvent.button === 0 ? 'left' : 'right',
                    );
                    break;
            }
        }

        while (this.inputManager.wheelInputBuffer.length > 0) {
            const wheelEvent = this.inputManager.wheelInputBuffer.shift();

            if (!wheelEvent) {
                return;
            }

            if (wheelEvent.deltaY < 0) {
                if (this.commandButtonPressed) {
                    this.zoom *= 1 + 0.01;
                }
                this.eventBus.emitEvent(ScrollEvent, 'up');
            }

            if (wheelEvent.deltaY > 0) {
                if (this.commandButtonPressed) {
                    this.zoom *= 1 - 0.01;
                }
                this.eventBus.emitEvent(ScrollEvent, 'down');
            }
        }
    };

    private update = (deltaTime: number) => {
        const millisecsCurrentFrame = performance.now();
        if (millisecsCurrentFrame - this.millisecondsLastFPSUpdate >= 1000) {
            this.frameDuration = deltaTime * 1000;
            this.currentFPS = 1000 / this.frameDuration;
            this.millisecondsLastFPSUpdate = millisecsCurrentFrame;

            if (this.maxFPS < this.currentFPS) {
                this.maxFPS = this.currentFPS;
            }
        }

        // Reset all event handlers for the current frame
        this.eventBus.reset();

        this.registry.update();

        // Perform the subscription of the events for all systems
        // this.registry.getSystem(MovementSystem)?.subscribeToEvents(this.eventBus);
        // this.registry.getSystem(RangedAttackEmitSystem)?.subscribeToEvents(this.eventBus);
        // this.registry.getSystem(DamageSystem)?.subscribeToEvents(this.eventBus);
        // this.registry.getSystem(CameraShakeSystem)?.subscribeToEvents(this.eventBus);
        // this.registry.getSystem(SoundSystem)?.subscribeToEvents(this.eventBus);
        // this.registry.getSystem(PlayerDetectionSystem)?.subscribeToEvents(this.eventBus);
        // this.registry.getSystem(DeadBodyOnDeathSystem)?.subscribeToEvents(this.eventBus);
        // this.registry.getSystem(EntityFollowSystem)?.subscribeToEvents(this.eventBus);
        // this.registry.getSystem(PlayerControlSystem)?.subscribeToEvents(this.eventBus);
        // this.registry.getSystem(AnimationOnHitSystem)?.subscribeToEvents(this.eventBus);

        // Invoke all the systems that need to update
        this.registry.getSystem(PlayerDetectionSystem)?.update(this.registry);
        this.registry.getSystem(ScriptingSystem)?.update();
        this.registry.getSystem(EntityFollowSystem)?.update();
        this.registry.getSystem(MovementSystem)?.update(deltaTime);
        this.registry.getSystem(CameraMovementSystem)?.update(this.camera);
        this.registry.getSystem(CollisionSystem)?.update(this.eventBus);
        this.registry.getSystem(RangedAttackEmitSystem)?.update();
        this.registry.getSystem(LifetimeSystem)?.update();
        this.registry.getSystem(ParticleEmitSystem)?.update();
        this.registry.getSystem(EntityDestinationSystem)?.update();
        this.registry.getSystem(EntityEffectSystem)?.update(this.registry);
        // this.registry.getSystem(EntityHighlightSystem)?.update();
        this.registry.getSystem(DamageSystem)?.update();
        this.registry.getSystem(AnimationSystem)?.update();
        this.registry.getSystem(SpriteStateSystem)?.update();
    };

    private render = () => {
        if (!this.canvas || !this.ctx || !this.sidebar) {
            throw new Error('Failed to get 2D context for the canvas.');
        }

        // Clear the whole canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Render Editor systems
        this.registry.getSystem(EditorRenderSystem)?.update(this.ctx, this.assetStore, this.camera, this.zoom);

        // Render game related systems
        // this.registry.getSystem(RenderSystem)?.update(this.ctx, this.assetStore, this.camera);
        this.registry.getSystem(RenderHealthBarSystem)?.update(this.ctx, this.camera);
        // this.registry.getSystem(CameraShakeSystem)?.update(this.ctx);
        this.registry.getSystem(RenderTextSystem)?.update(this.ctx, this.camera);
        this.registry.getSystem(RenderParticleSystem)?.update(this.ctx, this.camera);
        this.registry.getSystem(RenderLightingSystem)?.update(this.ctx, this.camera);
        // TODO: to be removed
        // this.registry.getSystem(RenderGUISystem)?.update(this.ctx, this.assetStore);
        // this.registry
        //     .getSystem(RenderCursorSystem)
        //     ?.update(this.ctx, this.assetStore, this.registry, this.mousePosition);

        // Render debug systems
        this.registry
            .getSystem(RenderDebugInfoSystem)
            ?.update(this.ctx, this.currentFPS, this.maxFPS, this.frameDuration, this.registry, this.camera, this.zoom);
        this.registry.getSystem(RenderColliderSystem)?.update(this.ctx, this.camera);
        this.registry.getSystem(RenderPlayerFollowRadiusSystem)?.update(this.ctx, this.camera);
        this.registry.getSystem(RenderParticleSourceSystem)?.update(this.ctx, this.camera);
        this.registry.getSystem(RenderEntityDestinationSystem)?.update(this.ctx, this.camera);
        this.registry.getSystem(RenderSlowTimeRadiusSystem)?.update(this.ctx, this.camera);
        this.registry
            .getSystem(RenderCursorCoordinatesSystem)
            ?.update(this.ctx, this.sidebar ? -1 * this.sidebar?.getBoundingClientRect().width : 0);

        // Render editor systems
        this.registry.getSystem(RenderSpriteBoxSystem)?.update(this.ctx, this.camera, this.zoom);
        this.registry.getSystem(RenderGameBorder)?.update(this.ctx, this.camera, this.zoom);

        if (this.needSidebarUpdate) {
            this.registry.getSystem(RenderSidebarEntities)?.update(this.sidebar);
            this.needSidebarUpdate = false;
        }
    };

    run = async () => {
        await this.setup();
        console.log('Running game');

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
