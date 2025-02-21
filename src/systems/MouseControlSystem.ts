import EntityDestinationComponent from '../components/EntityDestinationComponent';
import MouseControlComponent from '../components/MouseControlComponent';
import RigidBodyComponent from '../components/RigidBodyComponent';
import SpriteComponent from '../components/SpriteComponent';
import TransformComponent from '../components/TransformComponent';
import System from '../ecs/System';
import EventBus from '../event-bus/EventBus';
import MouseClickEvent from '../events/MouseClickEvent';
import { Rectangle, Vector } from '../types';
import EntityDestinationSystem from './EntityDestinationSystem';
import RenderEntityDestinationSystem from './RenderEntityDestinationSystem';

export default class MouseControlSystem extends System {
    constructor() {
        super();
        this.requireComponent(MouseControlComponent);
        this.requireComponent(RigidBodyComponent);
        this.requireComponent(TransformComponent);
        this.requireComponent(SpriteComponent);
    }

    subscribeToEvents(eventBus: EventBus, camera: Rectangle) {
        eventBus.subscribeToEvent(MouseClickEvent, this, event => this.onMousePressed(event, camera));
    }

    onMousePressed(event: MouseClickEvent, camera: Rectangle) {
        const coordinatesX = event.coordinates.x;
        const coordinatesY = event.coordinates.y;

        for (const entity of this.getSystemEntities()) {
            const mouseControl = entity.getComponent(MouseControlComponent);
            const rigidBody = entity.getComponent(RigidBodyComponent);
            const transform = entity.getComponent(TransformComponent);
            const sprite = entity.getComponent(SpriteComponent);

            if (!mouseControl || !rigidBody || !transform || !sprite) {
                throw new Error('Could not find some component(s) of entity with id ' + entity.getId());
            }

            if (entity.hasComponent(EntityDestinationComponent)) {
                entity.removeComponent(EntityDestinationComponent);
                entity.removeFromSystem(RenderEntityDestinationSystem);
                entity.removeFromSystem(EntityDestinationSystem);
            }

            entity.addComponent(
                EntityDestinationComponent,
                coordinatesX + camera.x,
                coordinatesY + camera.y,
                mouseControl.velocity,
            );
            entity.addToSystem(RenderEntityDestinationSystem);
            entity.addToSystem(EntityDestinationSystem);
        }
    }
}
