import EntityDestinationComponent from '../components/EntityDestinationComponent';
import RigidBodyComponent from '../components/RigidBodyComponent';
import TransformComponent from '../components/TransformComponent';
import System from '../ecs/System';
import { Vector } from '../types';

export default class EntityDestinationSystem extends System {
    constructor() {
        super();
        this.requireComponent(TransformComponent);
        this.requireComponent(RigidBodyComponent);
        this.requireComponent(EntityDestinationComponent);
    }

    update() {
        for (const entity of this.getSystemEntities()) {
            const transform = entity.getComponent(TransformComponent);
            const rigidBody = entity.getComponent(RigidBodyComponent);
            const entityDestination = entity.getComponent(EntityDestinationComponent);

            if (!transform || !rigidBody || !entityDestination) {
                throw new Error('Could not find some component(s) of entity with id ' + entity.getId());
            }

            const directionVector = this.computeDirectionVector(
                transform.position.x,
                transform.position.y,
                entityDestination.destinationX,
                entityDestination.destinationY,
                entityDestination.velocity,
            );

            rigidBody.velocity = directionVector;
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
