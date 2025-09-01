import Registry from '../../engine/ecs/Registry';
import System from '../../engine/ecs/System';
import Engine from '../../engine/Engine';
import EventBus from '../../engine/event-bus/EventBus';
import { MouseButton } from '../../engine/types/control';
import { Flip, Vector } from '../../engine/types/utils';
import { computeDirectionVector, computeUnitVector } from '../../engine/utils/vector';
import AnimationComponent from '../components/AnimationComponent';
import BoxColliderComponent from '../components/BoxColliderComponent';
import DamageRadiusComponent from '../components/DamageRadiusComponent';
import EntityDestinationComponent from '../components/EntityDestinationComponent';
import EntityEffectComponent from '../components/EntityEffectComponent';
import HighlightComponent from '../components/HighlightComponent';
import LifetimeComponent from '../components/LifetimeComponent';
import LightEmitComponent from '../components/LightEmitComponent';
import MeleeAttackComponent from '../components/MeleeAttackComponent';
import ParticleEmitComponent from '../components/ParticleEmitComponent';
import PlayerControlComponent from '../components/PlayerControlComponent';
import RangedAttackEmitterComponent from '../components/RangedAttackEmitterComponent';
import RigidBodyComponent from '../components/RigidBodyComponent';
import SlowTimeComponent from '../components/SlowTimeComponent';
import SpriteComponent from '../components/SpriteComponent';
import TeleportComponent from '../components/TeleportComponent';
import TransformComponent from '../components/TransformComponent';
import KeyPressedEvent from '../events/KeyPressedEvent';
import KeyReleasedEvent from '../events/KeyReleasedEvent';
import MouseMoveEvent from '../events/MouseMoveEvent';
import MousePressedEvent from '../events/MousePressedEvent';
import RangedAttackEmitEvent from '../events/RangedAttackEmitEvent';
import SoundEmitEvent from '../events/SoundEmitEvent';
import CollisionSystem from './CollisionSystem';
import DebugEntityDestinationSystem from './DebugEntityDestinationSystem';
import EntityDestinationSystem from './EntityDestinationSystem';
import MovementSystem from './MovementSystem';
import RenderSystem from './RenderSystem';

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
        eventBus.subscribeToEvent(MousePressedEvent, this, this.handleClickAction);
        eventBus.subscribeToEvent(MouseMoveEvent, this, this.onMouseMove);
        eventBus.subscribeToEvent(KeyPressedEvent, this, this.onKeyPressed);
        eventBus.subscribeToEvent(KeyReleasedEvent, this, this.onKeyReleased);
    }

    private handleClickAction = (event: MousePressedEvent) => {
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
            player.removeFromSystem(DebugEntityDestinationSystem);
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
            switch (event.button) {
                case MouseButton.LEFT:
                    if (player.hasComponent(RangedAttackEmitterComponent)) {
                        this.eventBus.emitEvent(RangedAttackEmitEvent, { x, y });
                    }
                    break;
                case MouseButton.RIGHT:
                    {
                        const playerPositionX = transform.position.x + (sprite.width / 2) * transform.scale.x;
                        const playerPositionY = transform.position.y + (sprite.height / 2) * transform.scale.y;

                        const directionVector = computeDirectionVector(playerPositionX, playerPositionY, x, y, 1);

                        const unitVector = computeUnitVector(directionVector.x, directionVector.y);
                        rigidBody.direction.x = unitVector.x;
                        rigidBody.direction.y = unitVector.y;

                        // TODO: Handle positioning of animation based on unit vector
                        let xOffset = 0;
                        let yOffset = 0;
                        let spriteRow = 0;

                        if (unitVector.x > 0) {
                            xOffset += 10;
                            spriteRow = 1;
                        } else if (unitVector.x < 0) {
                            xOffset -= 10;
                            spriteRow = 3;
                        } else if (unitVector.y > 0) {
                            yOffset += 10;
                            spriteRow = 2;
                        } else if (unitVector.y < 0) {
                            yOffset -= 10;
                            spriteRow = 0;
                        }

                        const meleeAttack = this.registry.createEntity();
                        meleeAttack.addComponent(
                            TransformComponent,
                            { x: playerPositionX - 32 + xOffset, y: playerPositionY - 32 + yOffset },
                            { x: 1, y: 1 },
                            0,
                        );
                        meleeAttack.addComponent(SpriteComponent, 'smear64', 64, 64, 3, spriteRow, 0);
                        meleeAttack.addComponent(AnimationComponent, 5, 10, false);
                        meleeAttack.addComponent(MeleeAttackComponent, true, 10);
                        meleeAttack.addComponent(LifetimeComponent, 400);
                        if (unitVector.x > 0) {
                            meleeAttack.addComponent(BoxColliderComponent, 32, 64, { x: 32, y: 0 });
                        } else if (unitVector.x < 0) {
                            meleeAttack.addComponent(BoxColliderComponent, 32, 64, { x: 0, y: 0 });
                        } else if (unitVector.y > 0) {
                            meleeAttack.addComponent(BoxColliderComponent, 64, 32, { x: 0, y: 32 });
                        } else if (unitVector.y < 0) {
                            meleeAttack.addComponent(BoxColliderComponent, 64, 32, { x: 0, y: 0 });
                        }
                        meleeAttack.group('melee-attack');

                        this.eventBus.emitEvent(SoundEmitEvent, 'melee_attack');
                    }
                    break;
                default:
                    break;
            }

            rigidBody.velocity = { x: 0, y: 0 };
            return;
        }

        player.addComponent(EntityDestinationComponent, x, y, playerControl.velocity);
        player.addToSystem(DebugEntityDestinationSystem);
        player.addToSystem(EntityDestinationSystem);

        const currentDestination = this.registry.getEntityByTag('player-destination');

        if (currentDestination) {
            this.registry.removeEntityTag(currentDestination);
            currentDestination.kill();
        }

        const destinationAntimation = this.registry.createEntity();
        destinationAntimation.addComponent(SpriteComponent, 'destination_circle', 32, 32, 1);
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
        );
        bubbleFloor.addComponent(
            SpriteComponent,
            'magic_bubble',
            128,
            128,
            1,
            { x: 0, y: 128 },
            Flip.NONE,
            0.5,
        );
        bubbleFloor.addComponent(AnimationComponent, 4, 20, false);
        bubbleFloor.addComponent(LifetimeComponent, 5000);

        const bubbleTop = this.registry.createEntity();
        bubbleTop.addComponent(
            TransformComponent,
            { x: mousePosition.x - 64 * scale, y: mousePosition.y - 64 * scale },
            { x: scale, y: scale },
        );
        bubbleTop.addComponent(
            SpriteComponent,
            'magic_bubble',
            128,
            128,
            3,
            { x: 0, y: 256 },
            Flip.NONE,
            0.3,
        );
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
        teleportStart.addComponent(SpriteComponent, 'teleport', teleportSpriteWidth, teleportSpriteHeight, 3);
        teleportStart.addComponent(AnimationComponent, 4, 8, false);
        teleportStart.addComponent(LifetimeComponent, 500);

        this.eventBus.emitEvent(SoundEmitEvent, 'teleport');

        playerRigidBody.velocity = { x: 0, y: 0 };

        if (player.hasComponent(EntityDestinationComponent)) {
            player.removeComponent(EntityDestinationComponent);
            player.removeFromSystem(DebugEntityDestinationSystem);
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
                'teleport',
                teleportSpriteWidth,
                teleportSpriteHeight,
                3,
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
        fireCircleFloor.addComponent(
            SpriteComponent,
            'fire_circle',
            128,
            128,
            1,
            { x: 0, y: 0 },
            Flip.NONE,
            0.5,
        );
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
                'fire_circle',
                128,
                128,
                2,
                { x: 0, y: 128 },
                Flip.NONE,
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
        cooldownAnimation.addComponent(
            SpriteComponent,
            'cooldown_skill',
            32,
            32,
            2,
            { x: 0, y: 0 },
            Flip.NONE,
        );
        cooldownAnimation.addComponent(AnimationComponent, 8, framesPerSecond, false);
        cooldownAnimation.addComponent(
            TransformComponent,
            { x: 25 + skillPosition * 64, y: Engine.windowHeight - 64 - 25 },
            { x: 2, y: 2 },
            0,
            true
        );
        cooldownAnimation.addComponent(LifetimeComponent, cooldown);
    };
}
