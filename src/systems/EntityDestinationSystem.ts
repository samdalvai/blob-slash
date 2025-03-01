import EntityDestinationComponent from '../components/EntityDestinationComponent';
import RigidBodyComponent from '../components/RigidBodyComponent';
import SpriteComponent from '../components/SpriteComponent';
import TransformComponent from '../components/TransformComponent';
import System from '../ecs/System';
import { computeDirectionVector, computeUnitVector } from '../utils/vector';
import RenderEntityDestinationSystem from './debug/RenderEntityDestinationSystem';

export default class EntityDestinationSystem extends System {
    constructor() {
        super();
        this.requireComponent(TransformComponent);
        this.requireComponent(RigidBodyComponent);
        this.requireComponent(SpriteComponent);
        this.requireComponent(EntityDestinationComponent);
    }

    update() {
        for (const entity of this.getSystemEntities()) {
            const transform = entity.getComponent(TransformComponent);
            const rigidBody = entity.getComponent(RigidBodyComponent);
            const sprite = entity.getComponent(SpriteComponent);
            const entityDestination = entity.getComponent(EntityDestinationComponent);

            if (!transform || !sprite || !rigidBody || !entityDestination) {
                throw new Error('Could not find some component(s) of entity with id ' + entity.getId());
            }

            if (
                Math.abs(
                    entityDestination.destinationX - (transform.position.x + (sprite.width / 2) * transform.scale.x),
                ) <= 10 &&
                Math.abs(
                    entityDestination.destinationY - (transform.position.y + (sprite.height / 2) * transform.scale.y),
                ) <= 10
            ) {
                entity.removeComponent(EntityDestinationComponent);
                entity.removeFromSystem(RenderEntityDestinationSystem);
                entity.removeFromSystem(EntityDestinationSystem);
                rigidBody.velocity = { x: 0, y: 0 };
                continue;
            }

            const directionVector = computeDirectionVector(
                transform.position.x + (sprite.width / 2) * transform.scale.x,
                transform.position.y + (sprite.height / 2) * transform.scale.y,
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
