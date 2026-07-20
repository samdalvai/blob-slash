import {
    Camera,
    Engine,
    Entity,
    EntityMap,
    MouseButton,
    Vector,
    beginWorldRender,
    endWorldRender,
    screenToWorld,
    serializeEntity,
} from '../engine';
import { gameComponentCatalog } from '../game/components/componentCatalog';
import * as GameEvents from '../game/events';
import * as GameSystems from '../game/systems';
import EntityEditor from './entity-editor/EntityEditor';
import EntityDeleteEvent from './events/EntityDeleteEvent';
import EntityPasteEvent from './events/EntityPasteEvent';
import ScrollEvent from './events/ScrollEvent';
import { closeAlert } from './gui';
import { loadLevelFromLocalStorage, saveLevelToLocalStorage } from './persistence/levelPersistence';
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
        this.levelManager.setComponentCatalog(gameComponentCatalog);

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

    protected createCamera(): Camera {
        return {
            center: { x: 0, y: 0 },
            viewportWidth: window.innerWidth,
            viewportHeight: window.innerHeight,
        };
    }

    resize = (
        canvas: HTMLCanvasElement,
        camera: Camera,
        leftSidebar: HTMLElement,
        rightSidebar: HTMLElement,
        bottomBar: HTMLElement,
    ) => {
        canvas.width =
            window.innerWidth - leftSidebar.getBoundingClientRect().width - rightSidebar.getBoundingClientRect().width;
        canvas.height = window.innerHeight - bottomBar.getBoundingClientRect().height;

        camera.viewportWidth = canvas.width / this.zoom;
        camera.viewportHeight = canvas.height / this.zoom;

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

    initialize = async () => {
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
        // Start with the world origin at the bottom-left of the editor viewport.
        this.camera.center = {
            x: this.camera.viewportWidth / 2,
            y: this.camera.viewportHeight / 2,
        };
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
        this.registry.addSystem(GameSystems.DropItemSystem);
        this.registry.addSystem(GameSystems.PickItemSystem);

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

        const levelKeys = getAllLevelKeysFromLocalStorage();

        if (levelKeys.length > 0) {
            if (Editor.editorSettings.selectedLevel) {
                const level = loadLevelFromLocalStorage(Editor.editorSettings.selectedLevel);
                if (!level) {
                    throw new Error('Could not read level from local storage');
                }

                await this.levelManager.loadLevelFromLevelMap(level);
                this.versionManager.addLevelVersion(Editor.editorSettings.selectedLevel, level);
            } else {
                const level = loadLevelFromLocalStorage(levelKeys[0]);
                if (!level) {
                    throw new Error('Could not read level from local storage');
                }

                await this.levelManager.loadLevelFromLevelMap(level);
                this.versionManager.addLevelVersion(levelKeys[0], level);
            }
        } else {
            console.log('No level available, loading default empty level');
            const { levelId, levelMap } = this.levelManager.getDefaultLevel('level-0');
            saveLevelToLocalStorage(levelId, levelMap);
            await this.levelManager.loadLevelFromLevelMap(levelMap);
            Editor.editorSettings.selectedLevel = levelId;
            saveEditorSettingsToLocalStorage();
            this.versionManager.addLevelVersion(Editor.editorSettings.selectedLevel, levelMap);
        }

        await this.assetStore.initialize();
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
                        if (!this.leftSidebar || !this.rightSidebar || !this.bottomBar || !this.canvas) {
                            throw new Error('Failed to get sidebar element(s)');
                        }

                        this.leftSidebar.style.display = this.testMode ? 'flex' : 'none';
                        this.rightSidebar.style.display = this.testMode ? 'flex' : 'none';
                        this.bottomBar.style.display = this.testMode ? 'flex' : 'none';

                        if (this.testMode) {
                            this.entityEditor.resetLevelChanges();
                        }

                        this.resize(this.canvas, this.camera, this.leftSidebar, this.rightSidebar, this.bottomBar);

                        this.testMode = !this.testMode;
                        this.zoom = 1;
                    }

                    if (inputEvent.code === 'Delete' && Editor.selectedEntities.length > 0) {
                        if (this.leftSidebar && Editor.mousePositionScreen.x > 0) {
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

            if (!this.leftSidebar) {
                throw new Error('Failed to get leftSidebar element.');
            }

            const screenPosition = {
                x: inputEvent.x - this.leftSidebar.getBoundingClientRect().width,
                y: inputEvent.y,
            };

            switch (inputEvent.type) {
                case 'mousemove': {
                    // Dragging the canvas follows the pointer in screen space.
                    if (this.mousePressed && this.commandPressed) {
                        const previousX = Engine.mousePositionScreen.x;
                        const previousY = Engine.mousePositionScreen.y;
                        const diffX = (screenPosition.x - previousX) / this.zoom;
                        const diffY = (screenPosition.y - previousY) / this.zoom;

                        this.camera.center.x -= diffX;
                        this.camera.center.y += diffY;
                    }

                    Engine.mousePositionScreen = screenPosition;
                    Engine.mousePositionWorld = screenToWorld(screenPosition, this.camera, this.zoom);
                    this.eventBus.emitEvent(GameEvents.MouseMoveEvent, Engine.mousePositionWorld);
                    break;
                }
                case 'mousedown':
                    if (!this.canvas) {
                        throw new Error('Failed to get canvas element.');
                    }

                    Engine.mousePositionScreen = screenPosition;
                    Engine.mousePositionWorld = screenToWorld(screenPosition, this.camera, this.zoom);

                    this.mousePressed = true;

                    if (this.testMode) {
                        if (
                            screenPosition.x < 0 ||
                            screenPosition.x > this.canvas.width ||
                            screenPosition.y < 0 ||
                            screenPosition.y > this.canvas.height
                        ) {
                            return;
                        }
                    }

                    this.eventBus.emitEvent(GameEvents.MousePressedEvent, Engine.mousePositionWorld, inputEvent.button);

                    if (inputEvent.button === MouseButton.MIDDLE) {
                        this.commandPressed = true;
                    }

                    break;
                case 'mouseup':
                    if (!this.canvas) {
                        throw new Error('Failed to get canvas element.');
                    }

                    Engine.mousePositionScreen = screenPosition;
                    Engine.mousePositionWorld = screenToWorld(screenPosition, this.camera, this.zoom);

                    this.mousePressed = false;

                    if (this.testMode) {
                        if (
                            screenPosition.x < 0 ||
                            screenPosition.x > this.canvas.width ||
                            screenPosition.y < 0 ||
                            screenPosition.y > this.canvas.height
                        ) {
                            return;
                        }
                    }

                    this.eventBus.emitEvent(
                        GameEvents.MouseReleasedEvent,
                        Engine.mousePositionWorld,
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
                Engine.mousePositionScreen.x < 0 ||
                Engine.mousePositionScreen.x > this.canvas.width ||
                Engine.mousePositionScreen.y < 0 ||
                Engine.mousePositionScreen.y > this.canvas.height
            ) {
                return;
            }

            const mouseWorldBefore = screenToWorld(Engine.mousePositionScreen, this.camera, this.zoom);

            if (wheelEvent.deltaY < 0) {
                this.zoom *= 1 + 0.1;
                this.eventBus.emitEvent(ScrollEvent, 'up');
            }
            if (wheelEvent.deltaY > 0) {
                this.zoom *= 1 - 0.1;
                this.eventBus.emitEvent(ScrollEvent, 'down');
            }

            this.zoom = Math.max(0.05, this.zoom);

            this.camera.viewportWidth = this.canvas.width / this.zoom;
            this.camera.viewportHeight = this.canvas.height / this.zoom;

            const mouseWorldAfter = screenToWorld(Engine.mousePositionScreen, this.camera, this.zoom);
            this.camera.center.x += mouseWorldBefore.x - mouseWorldAfter.x;
            this.camera.center.y += mouseWorldBefore.y - mouseWorldAfter.y;
            Engine.mousePositionWorld = mouseWorldBefore;
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
        this.isSystemActive('PlayerDetectionSystem') &&
            this.registry.getSystem(GameSystems.PlayerDetectionSystem)?.subscribeToEvents(this.eventBus);
        this.isSystemActive('EntityFollowSystem') &&
            this.registry.getSystem(GameSystems.EntityFollowSystem)?.subscribeToEvents(this.eventBus);
        this.isSystemActive('MovementSystem') &&
            this.registry.getSystem(GameSystems.MovementSystem)?.subscribeToEvents(this.eventBus);
        this.isSystemActive('RangedAttackEmitSystem') &&
            this.registry.getSystem(GameSystems.RangedAttackEmitSystem)?.subscribeToEvents(this.eventBus);
        this.isSystemActive('DamageSystem') &&
            this.registry.getSystem(GameSystems.DamageSystem)?.subscribeToEvents(this.eventBus);
        this.isSystemActive('CameraShakeSystem') &&
            this.registry.getSystem(GameSystems.CameraShakeSystem)?.subscribeToEvents(this.eventBus);
        this.isSystemActive('SoundSystem') &&
            this.registry.getSystem(GameSystems.SoundSystem)?.subscribeToEvents(this.eventBus);
        this.isSystemActive('DeadBodyOnDeathSystem') &&
            this.registry.getSystem(GameSystems.DeadBodyOnDeathSystem)?.subscribeToEvents(this.eventBus);
        this.isSystemActive('PlayerControlSystem') &&
            this.registry.getSystem(GameSystems.PlayerControlSystem)?.subscribeToEvents(this.eventBus);
        this.isSystemActive('AnimationOnHitSystem') &&
            this.registry.getSystem(GameSystems.AnimationOnHitSystem)?.subscribeToEvents(this.eventBus);
        this.isSystemActive('DropItemSystem') &&
            this.registry.getSystem(GameSystems.DropItemSystem)?.subscribeToEvents(this.eventBus);
        this.isSystemActive('PickItemSystem') &&
            this.registry.getSystem(GameSystems.PickItemSystem)?.subscribeToEvents(this.eventBus);

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
        this.isSystemActive('MovementSystem') && this.registry.getSystem(GameSystems.MovementSystem)?.update(deltaTime);
        this.isSystemActive('LifetimeSystem') &&
            this.registry.getSystem(GameSystems.LifetimeSystem)?.update(this.eventBus);
        this.isSystemActive('PlayerDetectionSystem') &&
            this.registry.getSystem(GameSystems.PlayerDetectionSystem)?.update(this.registry);
        this.isSystemActive('ScriptingSystem') && this.registry.getSystem(GameSystems.ScriptingSystem)?.update();
        this.isSystemActive('EntityFollowSystem') && this.registry.getSystem(GameSystems.EntityFollowSystem)?.update();
        this.isSystemActive('ParticleEmitSystem') && this.registry.getSystem(GameSystems.ParticleEmitSystem)?.update();
        this.isSystemActive('CameraMovementSystem') &&
            this.registry.getSystem(GameSystems.CameraMovementSystem)?.update(this.camera);
        this.isSystemActive('CollisionSystem') &&
            this.registry.getSystem(GameSystems.CollisionSystem)?.update(this.eventBus);
        this.isSystemActive('RangedAttackEmitSystem') &&
            this.registry.getSystem(GameSystems.RangedAttackEmitSystem)?.update();
        this.isSystemActive('EntityDestinationSystem') &&
            this.registry.getSystem(GameSystems.EntityDestinationSystem)?.update();
        this.isSystemActive('EntityEffectSystem') &&
            this.registry.getSystem(GameSystems.EntityEffectSystem)?.update(this.registry);
        this.isSystemActive('EntityHighlightSystem') &&
            this.registry.getSystem(GameSystems.EntityHighlightSystem)?.update();
        this.isSystemActive('DamageSystem') && this.registry.getSystem(GameSystems.DamageSystem)?.update();
        this.isSystemActive('AnimationSystem') && this.registry.getSystem(GameSystems.AnimationSystem)?.update();
        this.isSystemActive('SpriteStateSystem') && this.registry.getSystem(GameSystems.SpriteStateSystem)?.update();
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

        this.isSystemActive('CameraShakeSystem') &&
            this.registry.getSystem(GameSystems.CameraShakeSystem)?.update(this.ctx);

        beginWorldRender(this.ctx, this.camera, this.zoom);

        // Render editor-world systems
        !this.testMode &&
            this.registry.getSystem(EditorSystems.RenderGridSystem)?.update(this.ctx, this.camera, this.zoom);

        // Render game-world systems
        this.isSystemActive('RenderSystem') &&
            this.registry.getSystem(GameSystems.RenderSystem)?.update(this.ctx, this.assetStore, this.camera, true);
        this.isSystemActive('RenderHealthBarSystem') &&
            this.registry.getSystem(GameSystems.RenderHealthBarSystem)?.update(this.ctx, this.camera);
        this.isSystemActive('RenderTextSystem') &&
            this.registry.getSystem(GameSystems.RenderTextSystem)?.update(this.ctx);
        this.isSystemActive('RenderParticleSystem') &&
            this.registry.getSystem(GameSystems.RenderParticleSystem)?.update(this.ctx, this.camera, true);

        // Render editor-world overlays
        !this.testMode &&
            this.registry
                .getSystem(EditorSystems.RenderInvisibleEntitiesSystem)
                ?.update(this.ctx, this.camera, this.zoom);

        this.isSystemActive('DebugColliderSystem') &&
            this.registry.getSystem(GameSystems.DebugColliderSystem)?.update(this.ctx, this.camera);
        this.isSystemActive('DebugPlayerFollowRadiusSystem') &&
            this.registry.getSystem(GameSystems.DebugPlayerFollowRadiusSystem)?.update(this.ctx, this.camera);
        this.isSystemActive('DebugParticleSourceSystem') &&
            this.registry.getSystem(GameSystems.DebugParticleSourceSystem)?.update(this.ctx, this.camera);
        this.isSystemActive('DebugEntityDestinationSystem') &&
            this.registry.getSystem(GameSystems.DebugEntityDestinationSystem)?.update(this.ctx, this.camera);
        this.isSystemActive('DebugSlowTimeRadiusSystem') &&
            this.registry.getSystem(GameSystems.DebugSlowTimeRadiusSystem)?.update(this.ctx, this.camera);

        !this.testMode &&
            this.registry.getSystem(EditorSystems.RenderMultipleSelectSystem)?.update(this.ctx, this.zoom);
        !this.testMode &&
            this.registry.getSystem(EditorSystems.RenderSpriteBoxSystem)?.update(this.ctx, this.camera, this.zoom);
        !this.testMode && this.registry.getSystem(EditorSystems.RenderGameBorderSystem)?.update(this.ctx, this.zoom);

        endWorldRender(this.ctx);

        // Render screen-space systems
        this.isSystemActive('RenderLightingSystem') &&
            this.registry.getSystem(GameSystems.RenderLightingSystem)?.update(this.ctx, this.camera, true);
        this.isSystemActive('RenderGUISystem') &&
            this.registry.getSystem(GameSystems.RenderGUISystem)?.update(this.ctx, this.assetStore);
        this.isSystemActive('RenderCursorSystem') &&
            this.registry.getSystem(GameSystems.RenderCursorSystem)?.update(this.ctx, this.assetStore, this.registry);

        this.isSystemActive('DebugInfoSystem') &&
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
                    this.testMode,
                );
        this.isSystemActive('DebugCursorCoordinatesSystem') &&
            this.registry.getSystem(GameSystems.DebugCursorCoordinatesSystem)?.update(this.ctx);

        if (this.shouldSidebarUpdate && !this.testMode) {
            this.registry
                .getSystem(EditorSystems.RenderSidebarSystem)
                ?.update(this.leftSidebar, this.rightSidebar, this.registry, this.assetStore, this.levelManager);

            this.shouldSidebarUpdate = false;
        }
    };

    isSystemActive(systemKey: keyof typeof GameSystems) {
        return this.testMode || Editor.editorSettings.activeSystems[systemKey];
    }
}
