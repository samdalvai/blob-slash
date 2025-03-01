import EntityControlComponent from '../components/EntityControlComponent';
import EntityDestinationComponent from '../components/EntityDestinationComponent';
import RigidBodyComponent from '../components/RigidBodyComponent';
import SpriteComponent from '../components/SpriteComponent';
import TransformComponent from '../components/TransformComponent';
import System from '../ecs/System';
import EventBus from '../event-bus/EventBus';
import KeyPressedEvent from '../events/KeyPressedEvent';
import KeyReleasedEvent from '../events/KeyReleasedEvent';
import MouseClickEvent from '../events/MouseClickEvent';
import EntityDestinationSystem from './EntityDestinationSystem';
import RenderEntityDestinationSystem from './debug/RenderEntityDestinationSystem';

export default class EntityControlSystem extends System {
    keysPressed: string[] = [];

    constructor() {
        super();
        this.requireComponent(EntityControlComponent);
        this.requireComponent(RigidBodyComponent);
        this.requireComponent(TransformComponent);
        this.requireComponent(SpriteComponent);
    }

    subscribeToEvents(eventBus: EventBus) {
        eventBus.subscribeToEvent(MouseClickEvent, this, this.onMousePressed);
        eventBus.subscribeToEvent(KeyPressedEvent, this, this.onKeyPressed);
        eventBus.subscribeToEvent(KeyReleasedEvent, this, this.onKeyReleased);
    }

    onMousePressed = (event: MouseClickEvent) => {
        // Avoid moving if left shift is pressed
        if (this.keysPressed.includes('ShiftLeft')) return;

        const coordinatesX = event.coordinates.x;
        const coordinatesY = event.coordinates.y;

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

            entity.addComponent(EntityDestinationComponent, coordinatesX, coordinatesY, entityControl.velocity);
            entity.addToSystem(RenderEntityDestinationSystem);
            entity.addToSystem(EntityDestinationSystem);
        }
    };

    onKeyPressed = (event: KeyPressedEvent) => {
        const validKeys = ['ShiftLeft'];
        if (validKeys.includes(event.keyCode) && !this.keysPressed.includes(event.keyCode)) {
            this.keysPressed.push(event.keyCode);
        }
    };

    onKeyReleased = (event: KeyReleasedEvent) => {
        this.keysPressed = this.keysPressed.filter(key => key !== event.keyCode);
    };
}
