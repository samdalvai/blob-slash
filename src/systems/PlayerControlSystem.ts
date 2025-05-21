import AnimationComponent from '../components/AnimationComponent';
import DamageRadiusComponent from '../components/DamageRadiusComponent';
import EntityDestinationComponent from '../components/EntityDestinationComponent';
import EntityEffectComponent from '../components/EntityEffectComponent';
import HighlightComponent from '../components/HighlightComponent';
import LifetimeComponent from '../components/LifetimeComponent';
import LightEmitComponent from '../components/LightEmitComponent';
import ParticleEmitComponent from '../components/ParticleEmitComponent';
import PlayerControlComponent from '../components/PlayerControlComponent';
import RangedAttackEmitterComponent from '../components/RangedAttackEmitterComponent';
import RigidBodyComponent from '../components/RigidBodyComponent';
import SlowTimeComponent from '../components/SlowTimeComponent';
import SpriteComponent from '../components/SpriteComponent';
import TeleportComponent from '../components/TeleportComponent';
import TransformComponent from '../components/TransformComponent';
import Registry from '../ecs/Registry';
import System from '../ecs/System';
import EventBus from '../event-bus/EventBus';
import KeyPressedEvent from '../events/KeyPressedEvent';
import KeyReleasedEvent from '../events/KeyReleasedEvent';
import MouseMoveEvent from '../events/MouseMoveEvent';
import MousePressedEvent from '../events/MousePressedEvent';
import RangedAttackEmitEvent from '../events/RangedAttackEmitEvent';
import SoundEmitEvent from '../events/SoundEmitEvent';
import Game from '../game/Game';
import { Flip, Vector } from '../types/utils';
import CollisionSystem from './CollisionSystem';
import EntityDestinationSystem from './EntityDestinationSystem';
import MovementSystem from './MovementSystem';
import RenderEntityDestinationSystem from './debug/RenderEntityDestinationSystem';
import RenderSystem from './render/RenderSystem';

export default class PlayerControlSystem extends System {
    eventBus: EventBus;
    registry: Registry;
    mousePosition: Vector = { x: 0, y: 0 };

    constructor(eventBus: EventBus, registry: Registry) {
        super();
        this.eventBus = eventBus;
        this.registry = registry;
    }

    subscribeToEvents(eventBus: EventBus) {
        eventBus.subscribeToEvent(MousePressedEvent, this, this.onMousePressed);
        eventBus.subscribeToEvent(MouseMoveEvent, this, this.onMouseMove);
        eventBus.subscribeToEvent(KeyPressedEvent, this, this.onKeyPressed);
        eventBus.subscribeToEvent(KeyReleasedEvent, this, this.onKeyReleased);
    }

    onMousePressed = (event: MousePressedEvent) => {
        const x = event.coordinates.x;
        const y = event.coordinates.y;

        const player = this.registry.getEntityByTag('player');

        if (!player) {
            console.warn('Player entity not found');
            return;
        }

        const playerControl = player.getComponent(PlayerControlComponent);
        const rigidBody = player.getComponent(RigidBodyComponent);
        const transform = player.getComponent(TransformComponent);
        const sprite = player.getComponent(SpriteComponent);

        if (!playerControl || !rigidBody || !transform || !sprite) {
            throw new Error('Could not find some component(s) of entity with id ' + player.getId());
        }

        if (player.hasComponent(EntityDestinationComponent)) {
            player.removeComponent(EntityDestinationComponent);
            player.removeFromSystem(RenderEntityDestinationSystem);
            player.removeFromSystem(EntityDestinationSystem);
        }

        let enemyHighlighted = false;

        for (const enemy of player.registry.getEntitiesByGroup('enemies')) {
            if (enemy.hasComponent(HighlightComponent)) {
                const highlight = enemy.getComponent(HighlightComponent);

                if (!highlight) {
                    throw new Error('Could not find some component(s) of entity with id ' + enemy.getId());
                }

                if (highlight.isHighlighted) {
                    enemyHighlighted = true;
                    break;
                }
            }
        }

        // Avoid moving if left shift is pressed
        if (playerControl.keysPressed.includes('ShiftLeft') || enemyHighlighted) {
            if (player.hasComponent(RangedAttackEmitterComponent)) {
                this.eventBus.emitEvent(RangedAttackEmitEvent, { x, y });
            }

            rigidBody.velocity = { x: 0, y: 0 };
            return;
        }

        player.addComponent(EntityDestinationComponent, x, y, playerControl.velocity);
        player.addToSystem(RenderEntityDestinationSystem);
        player.addToSystem(EntityDestinationSystem);

        const currentDestination = this.registry.getEntityByTag('player-destination');

        if (currentDestination) {
            this.registry.removeEntityTag(currentDestination);
            currentDestination.kill();
        }

        const destinationAntimation = this.registry.createEntity();
        destinationAntimation.addComponent(SpriteComponent, 'destination-circle-texture', 32, 32, 1);
        destinationAntimation.addComponent(TransformComponent, { x: x - 16, y: y - 16 });
        destinationAntimation.addComponent(AnimationComponent, 8, 10);
        destinationAntimation.addComponent(LifetimeComponent, 1000);
        destinationAntimation.tag('player-destination');
    };

    onMouseMove = (event: MouseMoveEvent) => {
        this.mousePosition = event.coordinates;
    };

    onKeyPressed = (event: KeyPressedEvent) => {
        const player = this.registry.getEntityByTag('player');

        if (!player) {
            console.warn('Player entity not found');
            return;
        }

        const playerControl = player.getComponent(PlayerControlComponent);

        if (!playerControl) {
            throw new Error('Could not find some component(s) of entity with id ' + player.getId());
        }

        switch (event.keyCode) {
            case 'ShiftLeft':
                playerControl.keysPressed.push(event.keyCode);
                break;
            case 'Digit1':
                this.emitMagicBubble(this.mousePosition, playerControl);
                break;
            case 'Digit2':
                this.teleportPlayer(this.mousePosition, playerControl);
                break;
            case 'Digit3':
                this.emitFireCircle(this.mousePosition, playerControl);
                break;
        }
    };

    onKeyReleased = (event: KeyReleasedEvent) => {
        const player = this.registry.getEntityByTag('player');

        if (!player) {
            console.warn('Player entity not found');
            return;
        }

        const playerControl = player.getComponent(PlayerControlComponent);

        if (!playerControl) {
            throw new Error('Could not find some component(s) of entity with id ' + player.getId());
        }

        playerControl.keysPressed = playerControl.keysPressed.filter(key => key !== event.keyCode);
    };

    private emitMagicBubble = (mousePosition: Vector, playerControl: PlayerControlComponent) => {
        if (
            playerControl.magicBubbleLastEmissionTime !== 0 &&
            performance.now() - playerControl.magicBubbleLastEmissionTime < playerControl.magicBubbleCooldown
        ) {
            return;
        }

        const scale = 1.0;

        const bubbleFloor = this.registry.createEntity();
        bubbleFloor.addComponent(
            TransformComponent,
            { x: mousePosition.x - 64 * scale, y: mousePosition.y - 64 * scale },
            { x: scale, y: scale },
            0,
        );
        bubbleFloor.addComponent(SpriteComponent, 'magic-bubble-texture', 128, 128, 1, 0, 128, Flip.NONE, false, 0.5);
        bubbleFloor.addComponent(AnimationComponent, 4, 20, false);
        bubbleFloor.addComponent(LifetimeComponent, 5000);

        const bubbleTop = this.registry.createEntity();
        bubbleTop.addComponent(
            TransformComponent,
            { x: mousePosition.x - 64 * scale, y: mousePosition.y - 64 * scale },
            { x: scale, y: scale },
            0,
        );
        bubbleTop.addComponent(SpriteComponent, 'magic-bubble-texture', 128, 128, 3, 0, 256, Flip.NONE, false, 0.3);
        bubbleTop.addComponent(AnimationComponent, 4, 20, false);
        bubbleTop.addComponent(SlowTimeComponent, 60 * scale, 0.2, true);
        bubbleTop.addComponent(LifetimeComponent, 5000);
        bubbleTop.group('slow-time');

        playerControl.magicBubbleLastEmissionTime = performance.now();

        this.emitCooldownAnimation(playerControl.magicBubbleCooldown, 0);
    };

    teleportPlayer(mousePosition: Vector, playerControl: PlayerControlComponent) {
        if (
            playerControl.teleportLastEmissionTime !== 0 &&
            performance.now() - playerControl.teleportLastEmissionTime < playerControl.teleportCooldown
        ) {
            return;
        }

        const player = this.registry.getEntityByTag('player');

        if (!player) {
            console.warn('Player entity not found');
            return;
        }

        const playerTeleport = player.getComponent(TeleportComponent);

        if (!playerTeleport) {
            throw new Error('Could not find some component(s) of entity with id ' + player.getId());
        }

        if (playerTeleport.isTeleporting) {
            return;
        }

        playerTeleport.isTeleporting = true;

        const playerTransform = player.getComponent(TransformComponent);
        const playerSprite = player.getComponent(SpriteComponent);
        const playerRigidBody = player.getComponent(RigidBodyComponent);

        if (!playerTransform || !playerSprite || !playerRigidBody) {
            throw new Error('Could not find some component(s) of entity with id ' + player.getId());
        }

        player.removeFromSystem(RenderSystem);
        player.removeFromSystem(CollisionSystem);
        player.removeFromSystem(MovementSystem);

        const teleportSpriteWidth = 32;
        const teleportSpriteHeight = 64;

        const teleportStart = this.registry.createEntity();
        teleportStart.addComponent(TransformComponent, {
            x:
                playerTransform.position.x +
                (playerSprite.width * playerTransform.scale.x) / 2 -
                teleportSpriteWidth +
                16,
            y: playerTransform.position.y + playerSprite.height * playerTransform.scale.y - teleportSpriteHeight + 10,
        });
        teleportStart.addComponent(
            SpriteComponent,
            'teleport-texture',
            teleportSpriteWidth,
            teleportSpriteHeight,
            3,
            0,
            0,
        );
        teleportStart.addComponent(AnimationComponent, 4, 8, false);
        teleportStart.addComponent(LifetimeComponent, 500);

        this.eventBus.emitEvent(SoundEmitEvent, 'teleport-sound');

        playerRigidBody.velocity = { x: 0, y: 0 };

        if (player.hasComponent(EntityDestinationComponent)) {
            player.removeComponent(EntityDestinationComponent);
            player.removeFromSystem(RenderEntityDestinationSystem);
            player.removeFromSystem(EntityDestinationSystem);
        }

        playerControl.teleportLastEmissionTime = performance.now();
        this.emitCooldownAnimation(playerControl.teleportCooldown, 1);

        setTimeout(() => {
            playerTransform.position.x = mousePosition.x - (playerSprite.width * playerTransform.scale.x) / 2;
            playerTransform.position.y = mousePosition.y - playerSprite.height * playerTransform.scale.y;
            playerTeleport.isTeleporting = false;

            player.addToSystem(RenderSystem);
            player.addToSystem(CollisionSystem);
            player.addToSystem(MovementSystem);

            const teleportDestination = this.registry.createEntity();
            teleportDestination.addComponent(TransformComponent, {
                x: mousePosition.x - teleportSpriteWidth + 16,
                y: mousePosition.y - teleportSpriteHeight + 10,
            });
            teleportDestination.addComponent(
                SpriteComponent,
                'teleport-texture',
                teleportSpriteWidth,
                teleportSpriteHeight,
                3,
                0,
                0,
            );
            teleportDestination.addComponent(AnimationComponent, 4, 8, false);
            teleportDestination.addComponent(LifetimeComponent, 500);
        }, playerTeleport.teleportDelay);
    }

    emitFireCircle(mousePosition: Vector, playerControl: PlayerControlComponent) {
        if (
            playerControl.fireCircleLastEmissionTime !== 0 &&
            performance.now() - playerControl.fireCircleLastEmissionTime < playerControl.fireCircleCooldown
        ) {
            return;
        }

        const scale = 1.0;

        const fireCircleFloor = this.registry.createEntity();
        fireCircleFloor.addComponent(
            TransformComponent,
            { x: mousePosition.x - 64 * scale, y: mousePosition.y - 64 * scale },
            { x: scale, y: scale },
            0,
        );
        fireCircleFloor.addComponent(SpriteComponent, 'fire-circle-texture', 128, 128, 1, 0, 0, Flip.NONE, false, 0.5);
        fireCircleFloor.addComponent(AnimationComponent, 4, 20, false);
        fireCircleFloor.addComponent(LifetimeComponent, 250);
        fireCircleFloor.addComponent(LightEmitComponent, 100);

        playerControl.fireCircleLastEmissionTime = performance.now();
        this.emitCooldownAnimation(playerControl.fireCircleCooldown, 2);

        setTimeout(() => {
            const fireCircleFlames = this.registry.createEntity();
            fireCircleFlames.addComponent(
                TransformComponent,
                { x: mousePosition.x - 64 * scale, y: mousePosition.y - 64 * scale },
                { x: scale, y: scale },
                0,
            );
            fireCircleFlames.addComponent(
                SpriteComponent,
                'fire-circle-texture',
                128,
                128,
                2,
                0,
                128,
                Flip.NONE,
                false,
                1,
            );
            fireCircleFlames.addComponent(AnimationComponent, 4, 10, true);
            fireCircleFlames.addComponent(LifetimeComponent, 5000);
            fireCircleFlames.addComponent(DamageRadiusComponent, 60 * scale, 10, true);

            fireCircleFlames.addComponent(LightEmitComponent, 150);
            fireCircleFlames.addComponent(ParticleEmitComponent, 3, 1000, 'rgba(255,0,0,1)', 50, 50, 64, 64, {
                x: 0,
                y: -50,
            });
            fireCircleFlames.addComponent(EntityEffectComponent);

            fireCircleFlames.group('damage-radius');
        }, 250);
    }

    private emitCooldownAnimation = (cooldown: number, skillPosition: number) => {
        const framesPerSecond = 8 / (cooldown / 1000);
        const cooldownAnimation = this.registry.createEntity();
        cooldownAnimation.addComponent(SpriteComponent, 'cooldown-skill-texture', 32, 32, 2, 0, 0, Flip.NONE, true);
        cooldownAnimation.addComponent(AnimationComponent, 8, framesPerSecond, false);
        cooldownAnimation.addComponent(
            TransformComponent,
            { x: 25 + skillPosition * 64, y: Game.windowHeight - 64 - 25 },
            { x: 2, y: 2 },
        );
        cooldownAnimation.addComponent(LifetimeComponent, cooldown);
    };
}
