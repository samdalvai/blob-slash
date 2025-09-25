import Engine from '../engine/Engine';
import Entity from '../engine/ecs/Entity';
import { saveLevelToLocalStorage } from '../engine/serialization/persistence';
import { serializeEntity } from '../engine/serialization/serialization';
import { MouseButton } from '../engine/types/control';
import { EntityMap } from '../engine/types/map';
import { Rectangle, Vector } from '../engine/types/utils';
import * as GameEvents from '../game/events';
import * as GameSystems from '../game/systems';
import EntityEditor from './entity-editor/EntityEditor';
import EntityDeleteEvent from './events/EntityDeleteEvent';
import EntityPasteEvent from './events/EntityPasteEvent';
import ScrollEvent from './events/ScrollEvent';
import { closeAlert } from './gui';
import {
    getAllLevelKeysFromLocalStorage,
    loadEditorSettingsFromLocalStorage,
    saveEditorSettingsToLocalStorage,
} from './persistence/persistence';
import * as EditorSystems from './systems';
import { EditorSettings } from './types';
import VersionManager from './version-manager/VersionManager';

declare global {
    interface Window {
        closeAlert: () => void;
    }
}

// TODO: add logic to test level immediately without needing to export level to game
export default class Editor extends Engine {
    // Object for Editor
    private versionManager: VersionManager;
    private entityEditor: EntityEditor;

    // Objects for rendering
    private leftSidebar: HTMLElement | null;
    private rightSidebar: HTMLElement | null;
    private bottomBar: HTMLElement | null;

    // Editor status properties
    private mousePressed: boolean;
    private commandPressed: boolean;
    private shiftPressed: boolean;
    private zoom: number;
    private shouldSidebarUpdate: boolean;
    private testMode = false;

    // Global Editor objects
    static selectedEntities: Entity[] = [];
    static copiedEntities: EntityMap[] = [];
    static isDragging: boolean;
    static entityDragStart: Vector | null = null;
    static multipleSelectStart: Vector | null = null;
    static alertShown = false;
    static loadingLevel = false;

    static editorSettings: EditorSettings = {
        activeSystems: {} as Record<keyof typeof GameSystems, boolean>,
        snapToGrid: false,
        showGrid: false,
        gridSquareSide: 64,
        selectedLevel: null,
    };

    constructor() {
        super();
        this.versionManager = new VersionManager();
        this.entityEditor = new EntityEditor(
            this.registry,
            this.assetStore,
            this.eventBus,
            this.levelManager,
            this.versionManager,
        );

        this.leftSidebar = null;
        this.rightSidebar = null;
        this.bottomBar = null;

        this.mousePressed = false;
        this.commandPressed = false;
        this.shiftPressed = false;
        this.zoom = 1;
        this.shouldSidebarUpdate = true;

        this.isDebug = true;
    }

    resize = (
        canvas: HTMLCanvasElement,
        camera: Rectangle,
        leftSidebar: HTMLElement,
        rightSidebar: HTMLElement,
        bottomBar: HTMLElement,
    ) => {
        canvas.width =
            window.innerWidth - leftSidebar.getBoundingClientRect().width - rightSidebar.getBoundingClientRect().width;
        canvas.height = window.innerHeight - bottomBar.getBoundingClientRect().height;

        camera.width =
            window.innerWidth - leftSidebar.getBoundingClientRect().width - rightSidebar.getBoundingClientRect().width;
        camera.height = window.innerHeight - bottomBar.getBoundingClientRect().height;

        Engine.windowWidth =
            window.innerWidth - leftSidebar.getBoundingClientRect().width - rightSidebar.getBoundingClientRect().width;
        Engine.windowHeight = window.innerHeight - bottomBar.getBoundingClientRect().height;

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
        const leftSidebar = document.getElementById('leftSidebar') as HTMLElement;
        const rightSidebar = document.getElementById('rightSidebar') as HTMLElement;
        const bottomBar = document.getElementById('bottomBar') as HTMLElement;

        if (!canvas) {
            throw new Error('Failed to get canvas.');
        }

        if (!ctx) {
            throw new Error('Failed to get 2D context for the canvas.');
        }

        if (!leftSidebar) {
            throw new Error('Failed to get leftSidebar element.');
        }

        if (!rightSidebar) {
            throw new Error('Failed to get leftSidebar element.');
        }

        if (!bottomBar) {
            throw new Error('Failed to get bottomBar element.');
        }

        this.canvas = canvas;
        this.ctx = ctx;
        this.leftSidebar = leftSidebar;
        this.rightSidebar = rightSidebar;
        this.bottomBar = bottomBar;

        this.resize(canvas, this.camera, this.leftSidebar, this.rightSidebar, this.bottomBar);
        // canvas.style.cursor = 'none';

        this.isRunning = true;

        window.addEventListener('resize', () => {
            if (this.canvas && this.camera && this.leftSidebar && this.rightSidebar && this.bottomBar) {
                this.resize(this.canvas, this.camera, this.leftSidebar, this.rightSidebar, this.bottomBar);
            }
        });

        window.closeAlert = closeAlert;

        for (const systemKey in GameSystems) {
            Editor.editorSettings.activeSystems[systemKey as keyof typeof GameSystems] = false;
        }

        const localEditorSettings = loadEditorSettingsFromLocalStorage();

        if (localEditorSettings !== undefined) {
            Editor.editorSettings.activeSystems = localEditorSettings.activeSystems;
            Editor.editorSettings.snapToGrid = localEditorSettings.snapToGrid;
            Editor.editorSettings.showGrid = localEditorSettings.showGrid;
            Editor.editorSettings.gridSquareSide = localEditorSettings.gridSquareSide;
            Editor.editorSettings.selectedLevel = localEditorSettings.selectedLevel;
        }
    };

    setup = async () => {
        // Rendering systems
        this.registry.addSystem(GameSystems.RenderSystem);
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
        this.registry.addSystem(EditorSystems.RenderSpriteBoxSystem);
        this.registry.addSystem(EditorSystems.RenderGameBorderSystem);
        this.registry.addSystem(EditorSystems.RenderSidebarSystem, this.entityEditor);
        this.registry.addSystem(EditorSystems.EntityDragSystem);
        this.registry.addSystem(EditorSystems.RenderGridSystem);
        this.registry.addSystem(EditorSystems.RenderMultipleSelectSystem);
        this.registry.addSystem(EditorSystems.RenderInvisibleEntitiesSystem);
        this.registry.addSystem(EditorSystems.RenderTestModeActive);

        const levelKeys = getAllLevelKeysFromLocalStorage();

        if (levelKeys.length > 0) {
            if (Editor.editorSettings.selectedLevel) {
                const level = await this.levelManager.loadLevelFromLocalStorage(Editor.editorSettings.selectedLevel);
                this.versionManager.addLevelVersion(Editor.editorSettings.selectedLevel, level);
            } else {
                const level = await this.levelManager.loadLevelFromLocalStorage(levelKeys[0]);
                this.versionManager.addLevelVersion(levelKeys[0], level);
            }
        } else {
            console.log('No level available, loading default empty level');
            const { levelId, level } = this.levelManager.getDefaultLevel('level-0');
            saveLevelToLocalStorage(levelId, level);
            await this.levelManager.loadLevelFromLocalStorage(levelId);
            Editor.editorSettings.selectedLevel = levelId;
            saveEditorSettingsToLocalStorage();
            this.versionManager.addLevelVersion(Editor.editorSettings.selectedLevel, level);
        }
    };

    processInput = () => {
        if (Editor.loadingLevel) {
            return;
        }

        if (Editor.alertShown) {
            this.inputManager.mouseInputBuffer = [];
            this.inputManager.keyboardInputBuffer = [];
            this.inputManager.wheelInputBuffer = [];
            return;
        }

        // Hanlde keyboard events
        while (this.inputManager.keyboardInputBuffer.length > 0) {
            const inputEvent = this.inputManager.keyboardInputBuffer.shift();

            if (!inputEvent) {
                return;
            }

            switch (inputEvent.type) {
                case 'keydown':
                    if (inputEvent.code === 'MetaLeft') {
                        this.commandPressed = true;
                    }

                    if (inputEvent.code === 'ShiftLeft') {
                        this.shiftPressed = true;
                    }

                    if (inputEvent.code === 'F2') {
                        this.testMode = !this.testMode;
                        this.zoom = 1;
                    }

                    if (inputEvent.code === 'Delete' && Editor.selectedEntities.length > 0) {
                        if (
                            this.leftSidebar &&
                            Editor.mousePositionScreen.x > this.leftSidebar?.getBoundingClientRect().width
                        ) {
                            for (const entity of Editor.selectedEntities) {
                                this.eventBus.emitEvent(EntityDeleteEvent, entity);
                            }

                            Editor.selectedEntities.length = 0;
                        }
                    }

                    if (this.commandPressed) {
                        switch (inputEvent.code) {
                            case 'KeyZ':
                                // TODO: provide compatibility for non MacOS keyboards
                                if (this.shiftPressed) {
                                    this.entityEditor.redoLevelChange();
                                } else {
                                    this.entityEditor.undoLevelChange();
                                }
                                break;
                            case 'KeyC':
                                if (Editor.selectedEntities.length > 0) {
                                    const entityMaps: EntityMap[] = [];
                                    for (const entity of Editor.selectedEntities) {
                                        const entityMap = serializeEntity(entity);
                                        entityMaps.push(entityMap);
                                    }

                                    Editor.copiedEntities = entityMaps;
                                }
                                break;
                            case 'KeyV':
                                if (Editor.copiedEntities.length > 0) {
                                    this.eventBus.emitEvent(EntityPasteEvent, Editor.copiedEntities);
                                }
                                break;
                            case 'KeyX':
                                if (Editor.selectedEntities.length > 0) {
                                    const entityMaps: EntityMap[] = [];
                                    for (const entity of Editor.selectedEntities) {
                                        const entityMap = serializeEntity(entity);
                                        entityMaps.push(entityMap);
                                    }

                                    Editor.copiedEntities = entityMaps;
                                    for (const entity of Editor.selectedEntities) {
                                        this.eventBus.emitEvent(EntityDeleteEvent, entity);
                                    }
                                    Editor.selectedEntities.length = 0;
                                }
                                break;
                        }
                    }

                    this.eventBus.emitEvent(GameEvents.KeyPressedEvent, inputEvent.code);
                    break;
                case 'keyup':
                    if (inputEvent.code === 'MetaLeft') {
                        this.commandPressed = false;
                    }

                    if (inputEvent.code === 'ShiftLeft') {
                        this.shiftPressed = false;
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
                    if (!this.leftSidebar) {
                        throw new Error('Failed to get leftSidebar element.');
                    }

                    // Handles screen pan
                    if (this.mousePressed && this.commandPressed) {
                        const previousX = Engine.mousePositionScreen.x;
                        const previousY = Engine.mousePositionScreen.y;

                        const diffX = (inputEvent.x - previousX) / this.zoom;
                        const diffY = (inputEvent.y - previousY) / this.zoom;

                        this.camera.x -= diffX;
                        this.camera.y -= diffY;
                    }

                    Engine.mousePositionScreen = {
                        x: inputEvent.x,
                        y: inputEvent.y,
                    };

                    const mouseX =
                        (inputEvent.x - this.leftSidebar.getBoundingClientRect().width) / this.zoom + this.camera.x;
                    const mouseY = inputEvent.y / this.zoom + this.camera.y;

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
                    if (!this.leftSidebar) {
                        throw new Error('Failed to get leftSidebar element.');
                    }

                    if (!this.canvas) {
                        throw new Error('Failed to get canvas element.');
                    }

                    this.mousePressed = true;

                    if (this.testMode) {
                        const leftSidebarWidth = this.leftSidebar.getBoundingClientRect().width;
                        const canvasWidth = this.canvas?.getBoundingClientRect().width;
                        const canvasHeight = this.canvas?.getBoundingClientRect().height;

                        if (
                            inputEvent.x < leftSidebarWidth ||
                            inputEvent.x > leftSidebarWidth + canvasWidth ||
                            inputEvent.y > canvasHeight
                        ) {
                            return;
                        }
                    }

                    this.eventBus.emitEvent(
                        GameEvents.MousePressedEvent,
                        {
                            x:
                                (inputEvent.x - this.leftSidebar.getBoundingClientRect().width) / this.zoom +
                                this.camera.x,
                            y: inputEvent.y / this.zoom + this.camera.y,
                        },
                        inputEvent.button,
                    );

                    if (inputEvent.button === MouseButton.MIDDLE) {
                        this.commandPressed = true;
                    }

                    break;
                case 'mouseup':
                    if (!this.leftSidebar) {
                        throw new Error('Failed to get leftSidebar element.');
                    }

                    if (!this.canvas) {
                        throw new Error('Failed to get canvas element.');
                    }

                    this.mousePressed = false;

                    if (this.testMode) {
                        const leftSidebarWidth = this.leftSidebar.getBoundingClientRect().width;
                        const canvasWidth = this.canvas?.getBoundingClientRect().width;
                        const canvasHeight = this.canvas?.getBoundingClientRect().height;

                        if (
                            inputEvent.x < leftSidebarWidth ||
                            inputEvent.x > leftSidebarWidth + canvasWidth ||
                            inputEvent.y > canvasHeight
                        ) {
                            return;
                        }
                    }

                    this.eventBus.emitEvent(
                        GameEvents.MouseReleasedEvent,
                        {
                            x:
                                (inputEvent.x - this.leftSidebar.getBoundingClientRect().width) / this.zoom +
                                this.camera.x,
                            y: inputEvent.y / this.zoom + this.camera.y,
                        },
                        // button 0 = left, button 1 = middle, button 2 = right
                        // this is mapped directly to MouseButton enum
                        inputEvent.button,
                    );

                    if (inputEvent.button === MouseButton.MIDDLE) {
                        this.commandPressed = false;
                    }
                    break;
            }
        }

        while (this.inputManager.wheelInputBuffer.length > 0) {
            const wheelEvent = this.inputManager.wheelInputBuffer.shift();

            if (this.testMode) {
                return;
            }

            if (!wheelEvent) {
                return;
            }

            if (!this.leftSidebar || !this.canvas) {
                throw new Error('leftSidebar or canvas is not defined');
            }

            if (
                Engine.mousePositionScreen.x < this.leftSidebar.getBoundingClientRect().width ||
                Engine.mousePositionScreen.x >
                    this.leftSidebar.getBoundingClientRect().width + this.canvas.getBoundingClientRect().width
            ) {
                return;
            }

            const mouseXOnCanvas = Engine.mousePositionScreen.x - this.leftSidebar.getBoundingClientRect().width;
            const mouseYOnCanvas = Engine.mousePositionScreen.y;

            const mouseWorldXBefore = this.camera.x + mouseXOnCanvas / this.zoom;
            const mouseWorldYBefore = this.camera.y + mouseYOnCanvas / this.zoom;

            if (wheelEvent.deltaY < 0) {
                this.zoom *= 1 + 0.1;
                this.eventBus.emitEvent(ScrollEvent, 'up');
            }
            if (wheelEvent.deltaY > 0) {
                this.zoom *= 1 - 0.1;
                this.eventBus.emitEvent(ScrollEvent, 'down');
            }

            const mouseWorldXAfter = this.camera.x + mouseXOnCanvas / this.zoom;
            const mouseWorldYAfter = this.camera.y + mouseYOnCanvas / this.zoom;

            this.camera.x += mouseWorldXBefore - mouseWorldXAfter;
            this.camera.y += mouseWorldYBefore - mouseWorldYAfter;

            if (!this.canvas) {
                throw new Error('Canvas is not defined');
            }

            this.camera.width = this.canvas.width / this.zoom;
            this.camera.height = this.canvas.height / this.zoom;
        }
    };

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    update = (deltaTime: number) => {
        if (Editor.loadingLevel) {
            return;
        }

        if (!this.leftSidebar || !this.canvas) {
            throw new Error('Failed to get leftSidebar or canvas element.');
        }

        // Reset all event handlers for the current frame
        this.eventBus.reset();

        // Update entities to be created/killed
        this.registry.update();

        // Perform the subscription of the events for all game systems
        if (this.testMode) {
            Editor.editorSettings.activeSystems['PlayerDetectionSystem'] &&
            this.registry.getSystem(GameSystems.PlayerDetectionSystem)?.subscribeToEvents(this.eventBus);
            Editor.editorSettings.activeSystems['EntityFollowSystem'] &&
            this.registry.getSystem(GameSystems.EntityFollowSystem)?.subscribeToEvents(this.eventBus);
            Editor.editorSettings.activeSystems['MovementSystem'] &&
            this.registry.getSystem(GameSystems.MovementSystem)?.subscribeToEvents(this.eventBus);
            Editor.editorSettings.activeSystems['RangedAttackEmitSystem'] &&
            this.registry.getSystem(GameSystems.RangedAttackEmitSystem)?.subscribeToEvents(this.eventBus);
            Editor.editorSettings.activeSystems['DamageSystem'] &&
            this.registry.getSystem(GameSystems.DamageSystem)?.subscribeToEvents(this.eventBus);
            Editor.editorSettings.activeSystems['CameraShakeSystem'] &&
            this.registry.getSystem(GameSystems.CameraShakeSystem)?.subscribeToEvents(this.eventBus);
            Editor.editorSettings.activeSystems['SoundSystem'] &&
            this.registry.getSystem(GameSystems.SoundSystem)?.subscribeToEvents(this.eventBus);
            Editor.editorSettings.activeSystems['DeadBodyOnDeathSystem'] &&
            this.registry.getSystem(GameSystems.DeadBodyOnDeathSystem)?.subscribeToEvents(this.eventBus);
            Editor.editorSettings.activeSystems['PlayerControlSystem'] &&
            this.registry.getSystem(GameSystems.PlayerControlSystem)?.subscribeToEvents(this.eventBus);
            Editor.editorSettings.activeSystems['AnimationOnHitSystem'] &&
            this.registry.getSystem(GameSystems.AnimationOnHitSystem)?.subscribeToEvents(this.eventBus);
        }

        if ((!this.commandPressed || Editor.isDragging) && !this.testMode) {
            this.registry
                .getSystem(EditorSystems.EntityDragSystem)
                ?.subscribeToEvents(
                    this.eventBus,
                    this.canvas,
                    this.entityEditor,
                    this.shiftPressed,
                    this.commandPressed,
                );
        }

        !this.testMode &&
            this.registry
                .getSystem(EditorSystems.RenderSidebarSystem)
                ?.subscribeToEvents(this.eventBus, this.registry, this.leftSidebar);

        // Invoke all the systems that need to update
        Editor.editorSettings.activeSystems['MovementSystem'] &&
            this.registry.getSystem(GameSystems.MovementSystem)?.update(deltaTime);
        Editor.editorSettings.activeSystems['LifetimeSystem'] &&
            this.registry.getSystem(GameSystems.LifetimeSystem)?.update(this.eventBus);
        Editor.editorSettings.activeSystems['PlayerDetectionSystem'] &&
            this.registry.getSystem(GameSystems.PlayerDetectionSystem)?.update(this.registry);
        Editor.editorSettings.activeSystems['ScriptingSystem'] &&
            this.registry.getSystem(GameSystems.ScriptingSystem)?.update();
        Editor.editorSettings.activeSystems['EntityFollowSystem'] &&
            this.registry.getSystem(GameSystems.EntityFollowSystem)?.update();
        Editor.editorSettings.activeSystems['ParticleEmitSystem'] &&
            this.registry.getSystem(GameSystems.ParticleEmitSystem)?.update();
        Editor.editorSettings.activeSystems['CameraMovementSystem'] &&
            this.registry.getSystem(GameSystems.CameraMovementSystem)?.update(this.camera);
        Editor.editorSettings.activeSystems['CollisionSystem'] &&
            this.registry.getSystem(GameSystems.CollisionSystem)?.update(this.eventBus);
        Editor.editorSettings.activeSystems['RangedAttackEmitSystem'] &&
            this.registry.getSystem(GameSystems.RangedAttackEmitSystem)?.update();
        Editor.editorSettings.activeSystems['EntityDestinationSystem'] &&
            this.registry.getSystem(GameSystems.EntityDestinationSystem)?.update();
        Editor.editorSettings.activeSystems['EntityEffectSystem'] &&
            this.registry.getSystem(GameSystems.EntityEffectSystem)?.update(this.registry);
        Editor.editorSettings.activeSystems['EntityHighlightSystem'] &&
            this.registry.getSystem(GameSystems.EntityHighlightSystem)?.update();
        Editor.editorSettings.activeSystems['DamageSystem'] &&
            this.registry.getSystem(GameSystems.DamageSystem)?.update();
        Editor.editorSettings.activeSystems['AnimationSystem'] &&
            this.registry.getSystem(GameSystems.AnimationSystem)?.update();
        Editor.editorSettings.activeSystems['SpriteStateSystem'] &&
            this.registry.getSystem(GameSystems.SpriteStateSystem)?.update();
    };

    render = () => {
        if (Editor.loadingLevel) {
            return;
        }

        if (!this.canvas || !this.ctx || !this.leftSidebar || !this.rightSidebar) {
            throw new Error('Failed to get 2D context for the canvas.');
        }

        // Clear the whole canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Render Editor systems
        this.registry.getSystem(EditorSystems.RenderGridSystem)?.update(this.ctx, this.camera, this.zoom);

        // Render game related systems
        Editor.editorSettings.activeSystems['RenderSystem'] &&
            this.registry
                .getSystem(GameSystems.RenderSystem)
                ?.update(this.ctx, this.assetStore, this.camera, this.zoom, true);
        Editor.editorSettings.activeSystems['RenderHealthBarSystem'] &&
            this.registry.getSystem(GameSystems.RenderHealthBarSystem)?.update(this.ctx, this.camera);
        Editor.editorSettings.activeSystems['CameraShakeSystem'] &&
            this.registry.getSystem(GameSystems.CameraShakeSystem)?.update(this.ctx);
        Editor.editorSettings.activeSystems['RenderTextSystem'] &&
            this.registry.getSystem(GameSystems.RenderTextSystem)?.update(this.ctx, this.camera, this.zoom);
        Editor.editorSettings.activeSystems['RenderParticleSystem'] &&
            this.registry.getSystem(GameSystems.RenderParticleSystem)?.update(this.ctx, this.camera, this.zoom, true);
        Editor.editorSettings.activeSystems['RenderLightingSystem'] &&
            this.registry.getSystem(GameSystems.RenderLightingSystem)?.update(this.ctx, this.camera, this.zoom, true);
        Editor.editorSettings.activeSystems['RenderGUISystem'] &&
            this.registry.getSystem(GameSystems.RenderGUISystem)?.update(this.ctx, this.assetStore);
        Editor.editorSettings.activeSystems['RenderCursorSystem'] &&
            this.registry
                .getSystem(GameSystems.RenderCursorSystem)
                ?.update(this.ctx, this.camera, this.assetStore, this.registry);

        // Render Editor systems
        this.registry.getSystem(EditorSystems.RenderInvisibleEntitiesSystem)?.update(this.ctx, this.camera, this.zoom);

        // Render debug systems
        Editor.editorSettings.activeSystems['DebugInfoSystem'] &&
            this.registry
                .getSystem(GameSystems.DebugInfoSystem)
                ?.update(
                    this.ctx,
                    this.currentFPS,
                    this.maxFPS,
                    this.frameDuration,
                    this.registry,
                    this.camera,
                    this.zoom,
                );
        Editor.editorSettings.activeSystems['DebugColliderSystem'] &&
            this.registry.getSystem(GameSystems.DebugColliderSystem)?.update(this.ctx, this.camera, this.zoom);
        Editor.editorSettings.activeSystems['DebugPlayerFollowRadiusSystem'] &&
            this.registry
                .getSystem(GameSystems.DebugPlayerFollowRadiusSystem)
                ?.update(this.ctx, this.camera, this.zoom);
        Editor.editorSettings.activeSystems['DebugParticleSourceSystem'] &&
            this.registry.getSystem(GameSystems.DebugParticleSourceSystem)?.update(this.ctx, this.camera, this.zoom);
        Editor.editorSettings.activeSystems['DebugEntityDestinationSystem'] &&
            this.registry.getSystem(GameSystems.DebugEntityDestinationSystem)?.update(this.ctx, this.camera);
        Editor.editorSettings.activeSystems['DebugSlowTimeRadiusSystem'] &&
            this.registry.getSystem(GameSystems.DebugSlowTimeRadiusSystem)?.update(this.ctx, this.camera);
        Editor.editorSettings.activeSystems['DebugCursorCoordinatesSystem'] &&
            this.registry
                .getSystem(GameSystems.DebugCursorCoordinatesSystem)
                ?.update(this.ctx, this.leftSidebar ? -1 * this.leftSidebar?.getBoundingClientRect().width : 0);

        // Render Editor systems needing overlay
        !this.testMode &&
            this.registry.getSystem(EditorSystems.RenderMultipleSelectSystem)?.update(this.ctx, this.camera, this.zoom);
        !this.testMode &&
            this.registry.getSystem(EditorSystems.RenderSpriteBoxSystem)?.update(this.ctx, this.camera, this.zoom);
        this.registry.getSystem(EditorSystems.RenderGameBorderSystem)?.update(this.ctx, this.camera, this.zoom);
        this.registry.getSystem(EditorSystems.RenderTestModeActive)?.update(this.ctx, this.testMode);

        if (this.shouldSidebarUpdate) {
            this.registry
                .getSystem(EditorSystems.RenderSidebarSystem)
                ?.update(this.leftSidebar, this.rightSidebar, this.registry, this.assetStore, this.levelManager);

            this.shouldSidebarUpdate = false;
        }
    };
}
