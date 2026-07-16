import { Engine, GameStatus } from '../engine';
import {
    AnimationComponent,
    CameraFollowComponent,
    PlayerControlComponent,
    RigidBodyComponent,
    SpriteComponent,
    SpriteStateComponent,
    TransformComponent,
} from './components';
import { gameComponentCatalog } from './components/componentCatalog';
import * as GameEvents from './events';
import * as Systems from './systems';
import GameEndSystem from './systems/GameEndSystem';
import RenderMenuSystem from './systems/RenderMenuSystem';

export default class Game extends Engine {
    constructor() {
        super();
        this.levelManager.setComponentCatalog(gameComponentCatalog);
    }

    setup = async () => {
        // Rendering systems
        this.registry.addSystem(Systems.RenderSystem);
        // this.registry.addSystem(Systems.RenderTextSystem);
        // this.registry.addSystem(Systems.RenderParticleSystem);
        // this.registry.addSystem(Systems.RenderLightingSystem);
        // this.registry.addSystem(Systems.RenderGUISystem);
        this.registry.addSystem(Systems.RenderCursorSystem);
        // this.registry.addSystem(Systems.RenderMenuSystem, this.registry, this.assetStore, this.levelManager);

        // Other entities related systems
        this.registry.addSystem(Systems.MovementSystem);
        this.registry.addSystem(Systems.CameraMovementSystem);
        this.registry.addSystem(Systems.AnimationSystem);
        // this.registry.addSystem(Systems.CollisionSystem);
        // this.registry.addSystem(Systems.RangedAttackEmitSystem, this.registry);
        // this.registry.addSystem(Systems.DamageSystem, this.eventBus);
        // this.registry.addSystem(Systems.LifetimeSystem);
        // this.registry.addSystem(Systems.CameraShakeSystem);
        // this.registry.addSystem(Systems.SoundSystem, this.assetStore);
        // this.registry.addSystem(Systems.DebugPlayerFollowRadiusSystem);
        // this.registry.addSystem(Systems.EntityFollowSystem);
        // this.registry.addSystem(Systems.PlayerDetectionSystem);
        this.registry.addSystem(Systems.SpriteStateSystem);
        // this.registry.addSystem(Systems.ScriptingSystem);
        // this.registry.addSystem(Systems.DeadBodyOnDeathSystem);
        // this.registry.addSystem(Systems.ParticleEmitSystem);
        this.registry.addSystem(Systems.PlayerControlSystem, this.eventBus, this.registry);
        this.registry.addSystem(Systems.EntityDestinationSystem);
        // this.registry.addSystem(Systems.EntityHighlightSystem);
        // this.registry.addSystem(Systems.EntityEffectSystem);
        // this.registry.addSystem(Systems.AnimationOnHitSystem);
        // this.registry.addSystem(Systems.GameEndSystem);
        // this.registry.addSystem(Systems.DropItemSystem);
        // this.registry.addSystem(Systems.PickItemSystem);

        // Debug systems
        // this.registry.addSystem(Systems.DebugColliderSystem);
        // this.registry.addSystem(Systems.RenderHealthBarSystem);
        this.registry.addSystem(Systems.DebugEntityDestinationSystem);
        // this.registry.addSystem(Systems.DebugParticleSourceSystem);
        this.registry.addSystem(Systems.DebugInfoSystem);
        // this.registry.addSystem(Systems.DebugSlowTimeRadiusSystem);
        // this.registry.addSystem(Systems.DebugCursorCoordinatesSystem);

        // await this.levelManager.addLevelToAssets('grass', 'assets/levels/grass.json');
        // await this.levelManager.loadLevelFromAssets('grass');
        await this.assetStore.addTexture('player', 'assets/sprites/player_full.png');
        await this.assetStore.addTexture('cursor', 'assets/sprites/cursor.png');
        await this.assetStore.addTexture('destination_circle', 'assets/sprites/destination_circle.png');

        // Game.mapHeight = 1000;
        // Game.mapWidth = 2000;
        Engine.mapWidth = 1000;
        Engine.mapHeight = 2000;

        const player = this.registry.createEntity();
        player.addComponent(SpriteComponent, 'player', 32, 32, 0, 0, 0);
        player.addComponent(TransformComponent, { x: 100, y: 100 }, { x: 1, y: 1 });
        player.addComponent(RigidBodyComponent, { x: 0, y: 0 });
        player.addComponent(PlayerControlComponent, 100);
        player.addComponent(AnimationComponent, 4, 10);
        player.addComponent(SpriteStateComponent);
        player.addComponent(CameraFollowComponent);
        player.tag('player');

        Game.gameStatus = GameStatus.PLAYING;
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
                    if (inputEvent.code === 'F2') {
                        this.isDebug = !this.isDebug;
                    }

                    this.eventBus.emitEvent(GameEvents.KeyPressedEvent, inputEvent.code);
                    break;
                case 'keyup':
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
                case 'mousemove':
                    Engine.mousePositionScreen = {
                        x: inputEvent.x,
                        y: inputEvent.y,
                    };

                    Engine.mousePositionWorld = {
                        x: inputEvent.x + this.camera.x,
                        y: inputEvent.y + this.camera.y,
                    };

                    this.eventBus.emitEvent(GameEvents.MouseMoveEvent, {
                        x: inputEvent.x + this.camera.x,
                        y: inputEvent.y + this.camera.y,
                    });
                    break;
                case 'mousedown':
                    this.eventBus.emitEvent(
                        GameEvents.MousePressedEvent,
                        {
                            x: inputEvent.x + this.camera.x,
                            y: inputEvent.y + this.camera.y,
                        },
                        inputEvent.button,
                    );
                    break;
                case 'mouseup':
                    this.eventBus.emitEvent(
                        GameEvents.MouseReleasedEvent,
                        {
                            x: inputEvent.x + this.camera.x,
                            y: inputEvent.y + this.camera.y,
                        },
                        inputEvent.button,
                    );
                    break;
            }
        }
    };

    update = (deltaTime: number) => {
        // Reset all event handlers for the current frame
        this.eventBus.reset();

        // Update entities to be created/killed
        this.registry.update();

        this.registry.getSystem(GameEndSystem)?.update();

        if (Game.gameStatus !== GameStatus.PLAYING) {
            this.registry.getSystem(RenderMenuSystem)?.subscribeToEvents(this.eventBus);
            return;
        }

        // Perform the subscription of the events for all systems
        this.registry.getSystem(Systems.MovementSystem)?.subscribeToEvents(this.eventBus);
        this.registry.getSystem(Systems.RangedAttackEmitSystem)?.subscribeToEvents(this.eventBus);
        this.registry.getSystem(Systems.DamageSystem)?.subscribeToEvents(this.eventBus);
        this.registry.getSystem(Systems.CameraShakeSystem)?.subscribeToEvents(this.eventBus);
        this.registry.getSystem(Systems.SoundSystem)?.subscribeToEvents(this.eventBus);
        this.registry.getSystem(Systems.PlayerDetectionSystem)?.subscribeToEvents(this.eventBus);
        this.registry.getSystem(Systems.DeadBodyOnDeathSystem)?.subscribeToEvents(this.eventBus);
        this.registry.getSystem(Systems.EntityFollowSystem)?.subscribeToEvents(this.eventBus);
        this.registry.getSystem(Systems.PlayerControlSystem)?.subscribeToEvents(this.eventBus);
        this.registry.getSystem(Systems.AnimationOnHitSystem)?.subscribeToEvents(this.eventBus);
        this.registry.getSystem(Systems.DropItemSystem)?.subscribeToEvents(this.eventBus);
        this.registry.getSystem(Systems.PickItemSystem)?.subscribeToEvents(this.eventBus);

        // Invoke all the systems that need to update
        this.registry.getSystem(Systems.PlayerDetectionSystem)?.update(this.registry);
        this.registry.getSystem(Systems.ScriptingSystem)?.update();
        this.registry.getSystem(Systems.EntityFollowSystem)?.update();
        this.registry.getSystem(Systems.MovementSystem)?.update(deltaTime);
        this.registry.getSystem(Systems.CameraMovementSystem)?.update(this.camera);
        this.registry.getSystem(Systems.CollisionSystem)?.update(this.eventBus);
        this.registry.getSystem(Systems.RangedAttackEmitSystem)?.update();
        this.registry.getSystem(Systems.LifetimeSystem)?.update(this.eventBus);
        this.registry.getSystem(Systems.ParticleEmitSystem)?.update();
        this.registry.getSystem(Systems.EntityDestinationSystem)?.update();
        this.registry.getSystem(Systems.EntityEffectSystem)?.update(this.registry);
        this.registry.getSystem(Systems.EntityHighlightSystem)?.update();
        this.registry.getSystem(Systems.DamageSystem)?.update();
        this.registry.getSystem(Systems.AnimationSystem)?.update();
        this.registry.getSystem(Systems.SpriteStateSystem)?.update();
    };

    render = () => {
        if (!this.canvas || !this.ctx) {
            throw new Error('Failed to get 2D context for the canvas.');
        }

        // Clear the whole canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.registry.getSystem(Systems.RenderSystem)?.update(this.ctx, this.assetStore, this.camera);
        this.registry.getSystem(Systems.RenderHealthBarSystem)?.update(this.ctx, this.camera);
        this.registry.getSystem(Systems.CameraShakeSystem)?.update(this.ctx);
        this.registry.getSystem(Systems.RenderTextSystem)?.update(this.ctx, this.camera);
        this.registry.getSystem(Systems.RenderParticleSystem)?.update(this.ctx, this.camera);
        this.registry.getSystem(Systems.RenderLightingSystem)?.update(this.ctx, this.camera);
        this.registry.getSystem(Systems.RenderGUISystem)?.update(this.ctx, this.assetStore);

        if (Game.gameStatus !== GameStatus.PLAYING) {
            this.registry.getSystem(RenderMenuSystem)?.update(this.ctx);
        }

        this.registry
            .getSystem(Systems.RenderCursorSystem)
            ?.update(this.ctx, this.camera, this.assetStore, this.registry);

        if (this.isDebug) {
            this.registry
                .getSystem(Systems.DebugInfoSystem)
                ?.update(this.ctx, this.currentFPS, this.maxFPS, this.frameDuration, this.registry, this.camera);
            this.registry.getSystem(Systems.DebugColliderSystem)?.update(this.ctx, this.camera);
            this.registry.getSystem(Systems.DebugPlayerFollowRadiusSystem)?.update(this.ctx, this.camera);
            this.registry.getSystem(Systems.DebugParticleSourceSystem)?.update(this.ctx, this.camera);
            this.registry.getSystem(Systems.DebugEntityDestinationSystem)?.update(this.ctx, this.camera);
            this.registry.getSystem(Systems.DebugSlowTimeRadiusSystem)?.update(this.ctx, this.camera);
            this.registry.getSystem(Systems.DebugCursorCoordinatesSystem)?.update(this.ctx);
        }
    };
}
