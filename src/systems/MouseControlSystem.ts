import MouseControlComponent from '../components/MouseControlComponent';
import RigidBodyComponent from '../components/RigidBodyComponent';
import SpriteComponent from '../components/SpriteComponent';
import TransformComponent from '../components/TransformComponent';
import System from '../ecs/System';
import EventBus from '../event-bus/EventBus';
import MouseClickEvent from '../events/MouseClickEvent';
import { Rectangle, Vector } from '../types';

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

        console.log(coordinatesX);
        console.log(coordinatesY);

        for (const entity of this.getSystemEntities()) {
            const mouseControl = entity.getComponent(MouseControlComponent);
            const rigidBody = entity.getComponent(RigidBodyComponent);
            const transform = entity.getComponent(TransformComponent);
            const sprite = entity.getComponent(SpriteComponent);

            if (!mouseControl || !rigidBody || !transform || !sprite) {
                throw new Error('Could not find some component(s) of entity with id ' + entity.getId());
            }

            // const directionVector = this.computeDirectionVector(
            //     transform.position.x + (sprite.width / 2) * transform.scale.x,
            //     transform.position.y + (sprite.height / 2) * transform.scale.y,
            //     coordinatesX + camera.x,
            //     coordinatesY + camera.y,
            //     mouseControl.velocity,
            // );

            // rigidBody.velocity = directionVector;
        }
    }

    private computeDirectionVector = (x1: number, y1: number, x2: number, y2: number, length: number): Vector => {
        const dx = x2 - x1;
        const dy = y2 - y1;

        const distance = Math.sqrt(dx * dx + dy * dy);

        const unitDx = dx / distance;
        const unitDy = dy / distance;

        return { x: unitDx * length, y: unitDy * length };
    };
}
