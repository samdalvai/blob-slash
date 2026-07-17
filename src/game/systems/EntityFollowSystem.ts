import EntityFollowComponent from '../components/EntityFollowComponent';
import RigidBodyComponent from '../components/RigidBodyComponent';
import ScriptComponent from '../components/ScriptComponent';
import SpriteComponent from '../components/SpriteComponent';
import TransformComponent from '../components/TransformComponent';
import { System, EventBus, computeDirectionVector, computeDistanceBetweenPoints, computeUnitVector } from '../../engine';
import EntityKilledEvent from '../events/EntityKilledEvent';

export default class EntityFollowSystem extends System {
    constructor() {
        super();
        this.requireComponent(TransformComponent);
        this.requireComponent(EntityFollowComponent);
        this.requireComponent(RigidBodyComponent);
        this.requireComponent(SpriteComponent);
    }

    subscribeToEvents(eventBus: EventBus) {
        eventBus.subscribeToEvent(EntityKilledEvent, this, this.onEntityDeath);
    }

    onEntityDeath = (event: EntityKilledEvent) => {
        for (const entity of this.getSystemEntities()) {
            const entityFollow = entity.getComponent(EntityFollowComponent);

            if (!entityFollow) {
                throw new Error('Could not find some component(s) of entity with id ' + entity.getId());
            }

            if (entityFollow.followedEntity?.getId() === event.entity.getId()) {
                entityFollow.followedEntity = null;
            }
        }
    };

    update() {
        for (const entity of this.getSystemEntities()) {
            const transform = entity.getComponent(TransformComponent);
            const rigidBody = entity.getComponent(RigidBodyComponent);
            const entityFollow = entity.getComponent(EntityFollowComponent);
            const sprite = entity.getComponent(SpriteComponent);

            if (!rigidBody || !transform || !entityFollow || !sprite) {
                throw new Error('Could not find some component(s) of entity with id ' + entity.getId());
            }

            const followedEntity = entityFollow.followedEntity;

            if (!followedEntity) {
                if (!entity.hasComponent(ScriptComponent)) {
                    rigidBody.velocity = { x: 0, y: 0 };
                }
                continue;
            }

            const followedEntityTransform = followedEntity.getComponent(TransformComponent);
            const followedEntitySprite = followedEntity.getComponent(SpriteComponent);

            if (!followedEntityTransform || !followedEntitySprite) {
                throw new Error('Could not find player transform and/or sprite component');
            }

            const entityX = transform.position.x;
            const entityY = transform.position.y;
            const followedEntityX = followedEntityTransform.position.x;
            const followedEntityY = followedEntityTransform.position.y;

            const distance = computeDistanceBetweenPoints(entityX, entityY, followedEntityX, followedEntityY);
            const directionVector = computeDirectionVector(
                entityX,
                entityY,
                followedEntityX,
                followedEntityY,
                entityFollow.followVelocity,
            );

            if (distance > entityFollow.minFollowDistance) {
                rigidBody.velocity = directionVector;
            } else {
                rigidBody.velocity = { x: 0, y: 0 };
            }

            rigidBody.direction = computeUnitVector(directionVector.x, directionVector.y);
        }
    }
}
