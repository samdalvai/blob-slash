import AnimationComponent from '../components/AnimationComponent';
import EntityControlComponent from '../components/EntityControlComponent';
import EntityDestinationComponent from '../components/EntityDestinationComponent';
import HighlightComponent from '../components/HighlightComponent';
import LifetimeComponent from '../components/LifetimeComponent';
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
import MouseClickEvent from '../events/MouseClickEvent';
import RangedAttackEmitEvent from '../events/RangedAttackEmitEvent';
import { Flip, Vector } from '../types';
import EntityDestinationSystem from './EntityDestinationSystem';
import RenderEntityDestinationSystem from './debug/RenderEntityDestinationSystem';

export default class EntityControlSystem extends System {
    eventBus: EventBus;
    registry: Registry;
    keysPressed: string[] = [];

    constructor(eventBus: EventBus, registry: Registry) {
        super();
        this.eventBus = eventBus;
        this.registry = registry;
        this.requireComponent(EntityControlComponent);
        this.requireComponent(RigidBodyComponent);
        this.requireComponent(TransformComponent);
        this.requireComponent(SpriteComponent);
    }

    subscribeToEvents(eventBus: EventBus, mousePosition: Vector) {
        eventBus.subscribeToEvent(MouseClickEvent, this, this.onMousePressed);
        eventBus.subscribeToEvent(KeyPressedEvent, this, event => this.onKeyPressed(event, mousePosition));
        eventBus.subscribeToEvent(KeyReleasedEvent, this, this.onKeyReleased);
    }

    onMousePressed = (event: MouseClickEvent) => {
        const x = event.coordinates.x;
        const y = event.coordinates.y;

        for (const entity of this.getSystemEntities()) {
            const entityControl = entity.getComponent(EntityControlComponent);
            const rigidBody = entity.getComponent(RigidBodyComponent);
            const transform = entity.getComponent(TransformComponent);
            const sprite = entity.getComponent(SpriteComponent);

            if (!entityControl || !rigidBody || !transform || !sprite) {
                throw new Error('Could not find some component(s) of entity with id ' + entity.getId());
            }

            if (entity.hasComponent(EntityDestinationComponent)) {
                entity.removeComponent(EntityDestinationComponent);
                entity.removeFromSystem(RenderEntityDestinationSystem);
                entity.removeFromSystem(EntityDestinationSystem);
            }

            let enemyHighlighted = false;

            for (const enemy of entity.registry.getEntitiesByGroup('enemies')) {
                if (enemy.hasComponent(HighlightComponent)) {
                    const highlight = enemy.getComponent(HighlightComponent);

                    if (!highlight) {
                        throw new Error('Could not find some component(s) of entity with id ' + entity.getId());
                    }

                    if (highlight.isHighlighted) {
                        enemyHighlighted = true;
                        break;
                    }
                }
            }

            // Avoid moving if left shift is pressed
            if (this.keysPressed.includes('ShiftLeft') || enemyHighlighted) {
                if (entity.hasComponent(RangedAttackEmitterComponent)) {
                    this.eventBus.emitEvent(RangedAttackEmitEvent, { x, y });
                }

                rigidBody.velocity = { x: 0, y: 0 };
                return;
            }

            entity.addComponent(EntityDestinationComponent, x, y, entityControl.velocity);
            entity.addToSystem(RenderEntityDestinationSystem);
            entity.addToSystem(EntityDestinationSystem);
        }
    };

    onKeyPressed = (event: KeyPressedEvent, mousePosition: Vector) => {
        switch (event.keyCode) {
            case 'ShiftLeft':
                this.keysPressed.push(event.keyCode);
                break;
            case 'Digit1':
                this.emitMagicBubble(mousePosition);
                break;
        }
    };

    onKeyReleased = (event: KeyReleasedEvent) => {
        this.keysPressed = this.keysPressed.filter(key => key !== event.keyCode);
    };

    private emitMagicBubble = (coordinates: Vector) => {
        const bubbleFloor = this.registry.createEntity();
        bubbleFloor.addComponent(
            TransformComponent,
            { x: coordinates.x - 64 * 1.5, y: coordinates.y - 64 * 1.5 },
            { x: 1.5, y: 1.5 },
            0,
        );
        bubbleFloor.addComponent(SpriteComponent, 'magic-bubble-texture', 128, 128, 1, 0, 128, Flip.NONE, false, 0.5);
        bubbleFloor.addComponent(AnimationComponent, 4, 10, false);
        bubbleFloor.addComponent(LifetimeComponent, 5000);

        const bubbleTop = this.registry.createEntity();
        bubbleTop.addComponent(
            TransformComponent,
            { x: coordinates.x - 64 * 1.5, y: coordinates.y - 64 * 1.5 },
            { x: 1.5, y: 1.5 },
            0,
        );
        bubbleTop.addComponent(SpriteComponent, 'magic-bubble-texture', 128, 128, 2, 0, 256, Flip.NONE, false, 0.3);
        bubbleTop.addComponent(AnimationComponent, 4, 10, false);
        bubbleTop.addComponent(SlowTimeComponent, 90, 0.2);
        bubbleTop.addComponent(LifetimeComponent, 5000);
        bubbleTop.group('slow-time');
    };
}
