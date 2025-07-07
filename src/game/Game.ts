import Engine from '../engine/Engine';
import { GameStatus } from '../engine/types/utils';
import * as GameEvents from './events';
import * as Systems from './systems';

export default class Game extends Engine {
    constructor() {
        super();
    }

    setup = async () => {
        // Rendering systems
        this.registry.addSystem(Systems.RenderSystem);
        this.registry.addSystem(Systems.RenderTextSystem);
        this.registry.addSystem(Systems.RenderParticleSystem);
        this.registry.addSystem(Systems.RenderLightingSystem);
        this.registry.addSystem(Systems.RenderGUISystem);
        this.registry.addSystem(Systems.RenderCursorSystem);

        // Other entities related systems
        this.registry.addSystem(Systems.MovementSystem);
        this.registry.addSystem(Systems.CameraMovementSystem);
        this.registry.addSystem(Systems.AnimationSystem);
        this.registry.addSystem(Systems.CollisionSystem);
        this.registry.addSystem(Systems.RangedAttackEmitSystem, this.registry);
        this.registry.addSystem(Systems.DamageSystem, this.eventBus);
        this.registry.addSystem(Systems.LifetimeSystem);
        this.registry.addSystem(Systems.CameraShakeSystem);
        this.registry.addSystem(Systems.SoundSystem, this.assetStore);
        this.registry.addSystem(Systems.DebugPlayerFollowRadiusSystem);
        this.registry.addSystem(Systems.EntityFollowSystem);
        this.registry.addSystem(Systems.PlayerDetectionSystem);
        this.registry.addSystem(Systems.SpriteStateSystem);
        this.registry.addSystem(Systems.ScriptingSystem);
        this.registry.addSystem(Systems.DeadBodyOnDeathSystem);
        this.registry.addSystem(Systems.ParticleEmitSystem);
        this.registry.addSystem(Systems.PlayerControlSystem, this.eventBus, this.registry);
        this.registry.addSystem(Systems.EntityDestinationSystem);
        this.registry.addSystem(Systems.EntityHighlightSystem);
        this.registry.addSystem(Systems.EntityEffectSystem);
        this.registry.addSystem(Systems.AnimationOnHitSystem);

        // Debug systems
        this.registry.addSystem(Systems.DebugColliderSystem);
        this.registry.addSystem(Systems.RenderHealthBarSystem);
        this.registry.addSystem(Systems.DebugEntityDestinationSystem);
        this.registry.addSystem(Systems.DebugParticleSourceSystem);
        this.registry.addSystem(Systems.DebugInfoSystem);
        this.registry.addSystem(Systems.DebugSlowTimeRadiusSystem);
        this.registry.addSystem(Systems.DebugCursorCoordinatesSystem);

        await this.levelManager.addLevel('snapshot', '/assets/levels/snapshot.json');
        await this.levelManager.loadLevel(this.registry, 'snapshot');
        this.gameStatus = GameStatus.PLAYING;
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

        // Invoke all the systems that need to update
        this.registry.getSystem(Systems.PlayerDetectionSystem)?.update(this.registry);
        this.registry.getSystem(Systems.ScriptingSystem)?.update();
        this.registry.getSystem(Systems.EntityFollowSystem)?.update();
        this.registry.getSystem(Systems.MovementSystem)?.update(deltaTime);
        this.registry.getSystem(Systems.CameraMovementSystem)?.update(this.camera);
        this.registry.getSystem(Systems.CollisionSystem)?.update(this.eventBus);
        this.registry.getSystem(Systems.RangedAttackEmitSystem)?.update();
        this.registry.getSystem(Systems.LifetimeSystem)?.update();
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
