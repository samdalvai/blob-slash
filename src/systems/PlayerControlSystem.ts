import AnimationComponent from '../components/AnimationComponent';
import EntityDestinationComponent from '../components/EntityDestinationComponent';
import HighlightComponent from '../components/HighlightComponent';
import LifetimeComponent from '../components/LifetimeComponent';
import PlayerControlComponent from '../components/PlayerControlComponent';
import RangedAttackEmitterComponent from '../components/RangedAttackEmitterComponent';
import RigidBodyComponent from '../components/RigidBodyComponent';
import SlowTimeComponent from '../components/SlowTimeComponent';
import SpriteComponent from '../components/SpriteComponent';
import TransformComponent from '../components/TransformComponent';
import Registry from '../ecs/Registry';
import System from '../ecs/System';
import EventBus from '../event-bus/EventBus';
import KeyPressedEvent from '../events/KeyPressedEvent';
import KeyReleasedEvent from '../events/KeyReleasedEvent';
import MouseMoveEvent from '../events/MouseMoveEvent';
import MousePressedEvent from '../events/MousePressedEvent';
import RangedAttackEmitEvent from '../events/RangedAttackEmitEvent';
import { Flip, Vector } from '../types';
import EntityDestinationSystem from './EntityDestinationSystem';
import RenderEntityDestinationSystem from './debug/RenderEntityDestinationSystem';

export default class PlayerControlSystem extends System {
    eventBus: EventBus;
    registry: Registry;
    mousePosition: Vector = { x: 0, y: 0 };
    keysPressed: string[] = [];

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
                    throw new Error('Could not find some component(s) of entity with id ' + player.getId());
                }

                if (highlight.isHighlighted) {
                    enemyHighlighted = true;
                    break;
                }
            }
        }

        // Avoid moving if left shift is pressed
        if (this.keysPressed.includes('ShiftLeft') || enemyHighlighted) {
            if (player.hasComponent(RangedAttackEmitterComponent)) {
                this.eventBus.emitEvent(RangedAttackEmitEvent, { x, y });
            }

            rigidBody.velocity = { x: 0, y: 0 };
            return;
        }

        player.addComponent(EntityDestinationComponent, x, y, playerControl.velocity);
        player.addToSystem(RenderEntityDestinationSystem);
        player.addToSystem(EntityDestinationSystem);
    };

    onMouseMove = (event: MouseMoveEvent) => {
        this.mousePosition = event.coordinates;
    };

    onKeyPressed = (event: KeyPressedEvent) => {
        switch (event.keyCode) {
            case 'ShiftLeft':
                this.keysPressed.push(event.keyCode);
                break;
            case 'Digit1':
                this.emitMagicBubble(this.mousePosition);
                break;
        }
    };

    onKeyReleased = (event: KeyReleasedEvent) => {
        this.keysPressed = this.keysPressed.filter(key => key !== event.keyCode);
    };

    private emitMagicBubble = (coordinates: Vector) => {
        const scale = 1.0;

        const bubbleFloor = this.registry.createEntity();
        bubbleFloor.addComponent(
            TransformComponent,
            { x: coordinates.x - 64 * scale, y: coordinates.y - 64 * scale },
            { x: scale, y: scale },
            0,
        );
        bubbleFloor.addComponent(SpriteComponent, 'magic-bubble-texture', 128, 128, 1, 0, 128, Flip.NONE, false, 0.5);
        bubbleFloor.addComponent(AnimationComponent, 4, 10, false);
        bubbleFloor.addComponent(LifetimeComponent, 5000);

        const bubbleTop = this.registry.createEntity();
        bubbleTop.addComponent(
            TransformComponent,
            { x: coordinates.x - 64 * scale, y: coordinates.y - 64 * scale },
            { x: scale, y: scale },
            0,
        );
        bubbleTop.addComponent(SpriteComponent, 'magic-bubble-texture', 128, 128, 2, 0, 256, Flip.NONE, false, 0.3);
        bubbleTop.addComponent(AnimationComponent, 4, 10, false);
        bubbleTop.addComponent(SlowTimeComponent, 60 * scale, 0.2);
        bubbleTop.addComponent(LifetimeComponent, 5000);
        bubbleTop.group('slow-time');
    };
}
