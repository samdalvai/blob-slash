import EntityDestinationComponent from '../components/EntityDestinationComponent';
import RigidBodyComponent from '../components/RigidBodyComponent';
import TransformComponent from '../components/TransformComponent';
import { System, computeDirectionVector, computeUnitVector } from '../../engine';
import DebugEntityDestinationSystem from './DebugEntityDestinationSystem';

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

            if (
                Math.abs(entityDestination.destinationX - transform.position.x) <= 5 &&
                Math.abs(entityDestination.destinationY - transform.position.y) <= 5
            ) {
                entity.removeComponent(EntityDestinationComponent);
                entity.removeFromSystem(DebugEntityDestinationSystem);
                entity.removeFromSystem(EntityDestinationSystem);
                rigidBody.velocity = { x: 0, y: 0 };
                continue;
            }

            const directionVector = computeDirectionVector(
                transform.position.x,
                transform.position.y,
                entityDestination.destinationX,
                entityDestination.destinationY,
                entityDestination.velocity,
            );

            rigidBody.velocity = directionVector;
            this.updateRigidBodyDirection(rigidBody.velocity.x, rigidBody.velocity.y, rigidBody);
        }
    }

    updateRigidBodyDirection = (x: number, y: number, rigidBody: RigidBodyComponent) => {
        rigidBody.direction = computeUnitVector(x, y);
    };
}
