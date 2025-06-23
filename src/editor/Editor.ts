import Engine from '../engine/Engine';
import { MouseButton } from '../engine/types/control';
import { Rectangle, Vector } from '../engine/types/utils';
import * as GameEvents from '../game/events';
import * as GameSystems from '../game/systems';
import ScrollEvent from './events/ScrollEvent';
import EditorLevelManager from './level-manager/EditorLevelManager';
import * as EditorSystems from './systems';

export default class Editor extends Engine {
    // Objects for rendering
    private sidebar: HTMLElement | null;

    // Editor status properties
    private mousePressed: boolean;
    private panEnabled: boolean;
    private zoom: number;
    private shouldSidebarUpdate: boolean;
    
    // Global Editor objects
    static selectedEntity: number | null;
    static entityDragOffset: Vector | null;
    static snapToGrid: boolean = false;
    static showGrid = true;
    static gridSquareSide = 32;

    constructor() {
        super();
        this.sidebar = null;

        this.mousePressed = false;
        this.panEnabled = false;
        this.zoom = 1;
        this.shouldSidebarUpdate = true;
    }

    resize = (canvas: HTMLCanvasElement, camera: Rectangle, sidebar: HTMLElement) => {
        canvas.width = window.innerWidth - sidebar.getBoundingClientRect().width;
        canvas.height = window.innerHeight;

        camera.width = window.innerWidth - sidebar.getBoundingClientRect().width;
        camera.height = window.innerHeight;

        Engine.windowWidth = window.innerWidth - sidebar.getBoundingClientRect().width;
        Engine.windowHeight = window.innerHeight;

        const ctx = canvas.getContext('2d');

        if (!ctx) {
            throw new Error('Failed to get 2D context for the canvas.');
        }

        // If this is not disabled the browser might use interpolation to smooth the scaling,
        // which can cause visible borders or artifacts, e.g. when rendering tiles
        ctx.imageSmoothingEnabled = false;
    };

    initialize = () => {
        const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
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

    setup = async () => {
        // Rendering systems
        // this.registry.addSystem(GameSystems.RenderSystem);
        this.registry.addSystem(GameSystems.RenderTextSystem);
        this.registry.addSystem(GameSystems.RenderParticleSystem);
        this.registry.addSystem(GameSystems.RenderLightingSystem);
        this.registry.addSystem(GameSystems.RenderGUISystem);
        // this.registry.addSystem(GameSystems.RenderCursorSystem);

        // Other entities related systems
        this.registry.addSystem(GameSystems.MovementSystem);
        this.registry.addSystem(GameSystems.CameraMovementSystem);
        this.registry.addSystem(GameSystems.AnimationSystem);
        this.registry.addSystem(GameSystems.CollisionSystem);
        this.registry.addSystem(GameSystems.RangedAttackEmitSystem, this.registry);
        this.registry.addSystem(GameSystems.DamageSystem, this.eventBus);
        this.registry.addSystem(GameSystems.LifetimeSystem);
        this.registry.addSystem(GameSystems.CameraShakeSystem);
        this.registry.addSystem(GameSystems.SoundSystem, this.assetStore);
        this.registry.addSystem(GameSystems.DebugPlayerFollowRadiusSystem);
        this.registry.addSystem(GameSystems.EntityFollowSystem);
        this.registry.addSystem(GameSystems.PlayerDetectionSystem);
        this.registry.addSystem(GameSystems.SpriteStateSystem);
        this.registry.addSystem(GameSystems.ScriptingSystem);
        this.registry.addSystem(GameSystems.DeadBodyOnDeathSystem);
        this.registry.addSystem(GameSystems.ParticleEmitSystem);
        this.registry.addSystem(GameSystems.PlayerControlSystem, this.eventBus, this.registry);
        this.registry.addSystem(GameSystems.EntityDestinationSystem);
        this.registry.addSystem(GameSystems.EntityHighlightSystem);
        this.registry.addSystem(GameSystems.EntityEffectSystem);
        this.registry.addSystem(GameSystems.AnimationOnHitSystem);

        // Debug systems
        this.registry.addSystem(GameSystems.DebugColliderSystem);
        this.registry.addSystem(GameSystems.RenderHealthBarSystem);
        this.registry.addSystem(GameSystems.DebugEntityDestinationSystem);
        this.registry.addSystem(GameSystems.DebugParticleSourceSystem);
        this.registry.addSystem(GameSystems.DebugInfoSystem);
        this.registry.addSystem(GameSystems.DebugSlowTimeRadiusSystem);
        this.registry.addSystem(GameSystems.DebugCursorCoordinatesSystem);

        // Editor related systems
        this.registry.addSystem(EditorSystems.EditorRenderSystem);
        this.registry.addSystem(EditorSystems.RenderSpriteBoxSystem);
        this.registry.addSystem(EditorSystems.RenderGameBorder);
        this.registry.addSystem(EditorSystems.RenderSidebarEntities);
        this.registry.addSystem(EditorSystems.RenderSidebarLevelSettings);
        this.registry.addSystem(EditorSystems.RenderSidebarSaveButtons);
        this.registry.addSystem(EditorSystems.EntityDragSystem);
        this.registry.addSystem(EditorSystems.RenderGridSystem);

        await EditorLevelManager.loadLevel(this.registry, this.assetStore);
    };

    processInput = () => {
        // Hanlde keyboard events
        while (this.inputManager.keyboardInputBuffer.length > 0) {
            const inputEvent = this.inputManager.keyboardInputBuffer.shift();

            if (!inputEvent) {
                return;
            }

            switch (inputEvent.type) {
                case 'keydown':
                    if (inputEvent.code === 'MetaLeft') {
                        this.panEnabled = true;
                    }

                    this.eventBus.emitEvent(GameEvents.KeyPressedEvent, inputEvent.code);
                    break;
                case 'keyup':
                    if (inputEvent.code === 'MetaLeft') {
                        this.panEnabled = false;
                    }

                    this.eventBus.emitEvent(GameEvents.KeyReleasedEvent, inputEvent.code);
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

                    Engine.mousePositionScreen = {
                        x: inputEvent.x,
                        y: inputEvent.y,
                    };

                    // Handles mouse pad pan
                    if (this.mousePressed && this.panEnabled) {
                        const dx = mouseX - Engine.mousePositionWorld.x;
                        const dy = mouseY - Engine.mousePositionWorld.y;

                        this.camera.x -= dx;
                        this.camera.y -= dy;
                    }

                    Engine.mousePositionWorld = {
                        x: mouseX,
                        y: mouseY,
                    };

                    this.eventBus.emitEvent(GameEvents.MouseMoveEvent, {
                        x: mouseX,
                        y: mouseY,
                    });
                    break;
                }
                case 'mousedown':
                    if (!this.sidebar) {
                        throw new Error('Failed to get sidebar element.');
                    }

                    this.mousePressed = true;
                    this.eventBus.emitEvent(
                        GameEvents.MousePressedEvent,
                        {
                            x: (inputEvent.x - this.sidebar.getBoundingClientRect().width) / this.zoom + this.camera.x,
                            y: inputEvent.y / this.zoom + this.camera.y,
                        },
                        inputEvent.button,
                    );

                    if (inputEvent.button === MouseButton.MIDDLE) {
                        this.panEnabled = true;
                    }

                    break;
                case 'mouseup':
                    if (!this.sidebar) {
                        throw new Error('Failed to get sidebar element.');
                    }

                    this.mousePressed = false;
                    this.eventBus.emitEvent(
                        GameEvents.MouseReleasedEvent,
                        {
                            x: (inputEvent.x - this.sidebar.getBoundingClientRect().width) / this.zoom + this.camera.x,
                            y: inputEvent.y / this.zoom + this.camera.y,
                        },
                        inputEvent.button === 0 ? 'left' : 'right',
                    );

                    if (inputEvent.button === MouseButton.MIDDLE) {
                        this.panEnabled = false;
                    }
                    break;
            }
        }

        while (this.inputManager.wheelInputBuffer.length > 0) {
            const wheelEvent = this.inputManager.wheelInputBuffer.shift();

            if (!wheelEvent) {
                return;
            }

            if (!this.sidebar) {
                throw new Error('Sidebar is not defined');
            }

            if (Engine.mousePositionScreen.x <= this.sidebar.getBoundingClientRect().width) {
                return;
            }

            const mouseXOnCanvas = Engine.mousePositionScreen.x - this.sidebar.getBoundingClientRect().width;
            const mouseYOnCanvas = Engine.mousePositionScreen.y;

            const mouseWorldXBefore = this.camera.x + mouseXOnCanvas / this.zoom;
            const mouseWorldYBefore = this.camera.y + mouseYOnCanvas / this.zoom;

            if (wheelEvent.deltaY < 0) {
                this.zoom *= 1 + 0.01;
                this.eventBus.emitEvent(ScrollEvent, 'up');
            }
            if (wheelEvent.deltaY > 0) {
                this.zoom *= 1 - 0.01;
                this.eventBus.emitEvent(ScrollEvent, 'down');
            }

            const mouseWorldXAfter = this.camera.x + mouseXOnCanvas / this.zoom;
            const mouseWorldYAfter = this.camera.y + mouseYOnCanvas / this.zoom;

            this.camera.x += mouseWorldXBefore - mouseWorldXAfter;
            this.camera.y += mouseWorldYBefore - mouseWorldYAfter;
        }
    };

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    update = (deltaTime: number) => {
        // Reset all event handlers for the current frame
        this.eventBus.reset();

        // Update entities to be created/killed
        this.registry.update();

        // Perform the subscription of the events for all systems
        // this.registry.getSystem(GameSystems.MovementSystem)?.subscribeToEvents(this.eventBus);
        // this.registry.getSystem(GameSystems.RangedAttackEmitSystem)?.subscribeToEvents(this.eventBus);
        // this.registry.getSystem(GameSystems.DamageSystem)?.subscribeToEvents(this.eventBus);
        // this.registry.getSystem(GameSystems.CameraShakeSystem)?.subscribeToEvents(this.eventBus);
        // this.registry.getSystem(GameSystems.SoundSystem)?.subscribeToEvents(this.eventBus);
        // this.registry.getSystem(GameSystems.PlayerDetectionSystem)?.subscribeToEvents(this.eventBus);
        // this.registry.getSystem(GameSystems.DeadBodyOnDeathSystem)?.subscribeToEvents(this.eventBus);
        // this.registry.getSystem(GameSystems.EntityFollowSystem)?.subscribeToEvents(this.eventBus);
        // this.registry.getSystem(GameSystems.PlayerControlSystem)?.subscribeToEvents(this.eventBus);
        // this.registry.getSystem(GameSystems.AnimationOnHitSystem)?.subscribeToEvents(this.eventBus);
        this.registry.getSystem(EditorSystems.EntityDragSystem)?.subscribeToEvents(this.eventBus);
        this.registry.getSystem(EditorSystems.RenderSidebarEntities)?.subscribeToEvents(this.eventBus, this.sidebar);

        // Invoke all the systems that need to update
        // this.registry.getSystem(GameSystems.PlayerDetectionSystem)?.update(this.registry);
        // this.registry.getSystem(GameSystems.ScriptingSystem)?.update();
        // this.registry.getSystem(GameSystems.EntityFollowSystem)?.update();
        // this.registry.getSystem(GameSystems.MovementSystem)?.update(deltaTime);
        // this.registry.getSystem(GameSystems.CameraMovementSystem)?.update(this.camera);
        this.registry.getSystem(GameSystems.CollisionSystem)?.update(this.eventBus);
        this.registry.getSystem(GameSystems.RangedAttackEmitSystem)?.update();
        this.registry.getSystem(GameSystems.LifetimeSystem)?.update();
        this.registry.getSystem(GameSystems.ParticleEmitSystem)?.update();
        this.registry.getSystem(GameSystems.EntityDestinationSystem)?.update();
        this.registry.getSystem(GameSystems.EntityEffectSystem)?.update(this.registry);
        // this.registry.getSystem(GameSystems.EntityHighlightSystem)?.update();
        this.registry.getSystem(GameSystems.DamageSystem)?.update();
        this.registry.getSystem(GameSystems.AnimationSystem)?.update();
        this.registry.getSystem(GameSystems.SpriteStateSystem)?.update();

        this.registry.getSystem(EditorSystems.EntityDragSystem)?.update();
    };

    render = () => {
        if (!this.canvas || !this.ctx || !this.sidebar) {
            throw new Error('Failed to get 2D context for the canvas.');
        }

        // Clear the whole canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Render Editor systems
        this.registry
            .getSystem(EditorSystems.RenderGridSystem)
            ?.update(this.ctx, this.camera, this.zoom);
        this.registry.getSystem(EditorSystems.RenderGameBorder)?.update(this.ctx, this.camera, this.zoom);
        this.registry
            .getSystem(EditorSystems.EditorRenderSystem)
            ?.update(this.ctx, this.assetStore, this.camera, this.zoom);

        // Render game related systems
        // this.registry.getSystem(GameSystems.RenderSystem)?.update(this.ctx, this.assetStore, this.camera);
        this.registry.getSystem(GameSystems.RenderHealthBarSystem)?.update(this.ctx, this.camera);
        // this.registry.getSystem(GameSystems.CameraShakeSystem)?.update(this.ctx);
        this.registry.getSystem(GameSystems.RenderTextSystem)?.update(this.ctx, this.camera);
        this.registry.getSystem(GameSystems.RenderParticleSystem)?.update(this.ctx, this.camera);
        this.registry.getSystem(GameSystems.RenderLightingSystem)?.update(this.ctx, this.camera, this.zoom);
        // TODO: to be removed
        // this.registry.getSystem(GameSystems.RenderGUISystem)?.update(this.ctx, this.assetStore);
        // this.registry
        //     .getSystem(GameSystems.RenderCursorSystem)
        //     ?.update(this.ctx, this.assetStore, this.registry, this.mousePosition);

        // Render debug systems
        this.registry
            .getSystem(GameSystems.DebugInfoSystem)
            ?.update(this.ctx, this.currentFPS, this.maxFPS, this.frameDuration, this.registry, this.camera, this.zoom);
        this.registry.getSystem(GameSystems.DebugColliderSystem)?.update(this.ctx, this.camera, this.zoom);
        this.registry.getSystem(GameSystems.DebugPlayerFollowRadiusSystem)?.update(this.ctx, this.camera);
        this.registry.getSystem(GameSystems.DebugParticleSourceSystem)?.update(this.ctx, this.camera);
        this.registry.getSystem(GameSystems.DebugEntityDestinationSystem)?.update(this.ctx, this.camera);
        this.registry.getSystem(GameSystems.DebugSlowTimeRadiusSystem)?.update(this.ctx, this.camera);

        this.registry.getSystem(EditorSystems.RenderSpriteBoxSystem)?.update(this.ctx, this.camera, this.zoom);

        this.registry
            .getSystem(GameSystems.DebugCursorCoordinatesSystem)
            ?.update(this.ctx, this.sidebar ? -1 * this.sidebar?.getBoundingClientRect().width : 0);

        if (this.shouldSidebarUpdate) {
            this.registry
                .getSystem(EditorSystems.RenderSidebarEntities)
                ?.update(this.sidebar, this.registry, this.assetStore);
            this.registry.getSystem(EditorSystems.RenderSidebarLevelSettings)?.update(this.sidebar);
            this.registry.getSystem(EditorSystems.RenderSidebarSaveButtons)?.update(this.sidebar, this.registry);
            this.shouldSidebarUpdate = false;
        }
    };
}
