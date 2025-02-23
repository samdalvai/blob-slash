import EntityFollowComponent from '../components/EntityFollowComponent';
import RigidBodyComponent from '../components/RigidBodyComponent';
import ScriptComponent from '../components/ScriptComponent';
import SpriteComponent from '../components/SpriteComponent';
import TransformComponent from '../components/TransformComponent';
import System from '../ecs/System';
import EventBus from '../event-bus/EventBus';
import EntityKilledEvent from '../events/EntityKilledEvent';
import { computeDirectionVector, computeDistanceBetweenPoints, computeUnitVector } from '../utils/vector';

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

            const entityX = transform.position.x + (sprite.width / 2) * transform.scale.x;
            const entityY = transform.position.y + (sprite.height / 2) * transform.scale.y;

            const followedEntityX =
                followedEntityTransform.position.x + (followedEntitySprite.width / 2) * followedEntityTransform.scale.x;
            const followedEntityY =
                followedEntityTransform.position.y +
                (followedEntitySprite.height / 2) * followedEntityTransform.scale.y;

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

            // const playerFollowX = transform.position.x + entityFollow.offset.x;
            // const playerFollowY = transform.position.y + entityFollow.offset.y;

            // const playerX =
            //     followedEntityTransform.position.x + (followedEntityTransform.scale.x * followedEntitySprite.width) / 2;
            // const playerY =
            //     followedEntityTransform.position.y +
            //     (followedEntityTransform.scale.y * followedEntitySprite.height) / 2;

            // const deltaX = Math.abs(playerX - playerFollowX);
            // const deltaY = Math.abs(playerY - playerFollowY);

            // // Handle player follow for entities not having a follow velocity
            // if (entityFollow.followVelocity === 0) {
            //     if (deltaX > deltaY) {
            //         rigidBody.direction = { x: playerX < playerFollowX ? -1 : 1, y: 0 };
            //     } else {
            //         rigidBody.direction = { x: 0, y: playerY < playerFollowY ? -1 : 1 };
            //     }

            //     continue;
            // }

            // // Handle player follow for entities having a follow velocity
            // if (playerX > playerFollowX + ALIGNMENT_THRESHOLD) {
            //     // Case 1: player is on the right of the entity
            //     if (
            //         (deltaY <= ALIGNMENT_THRESHOLD && deltaX > entityFollow.minFollowDistance) ||
            //         deltaY > FOLLOW_PADDING
            //     ) {
            //         // Case 1a: player is on the horizontal line, move right until entity is at min distance
            //         rigidBody.velocity = { x: entityFollow.followVelocity, y: 0 };
            //         rigidBody.direction = { x: 1, y: 0 };
            //     } else if (deltaY <= ALIGNMENT_THRESHOLD && deltaX <= entityFollow.minFollowDistance) {
            //         // Case 1b: player is on the horizontal line and already at min distance, stop
            //         rigidBody.velocity = { x: 0, y: 0 };
            //         rigidBody.direction = { x: 1, y: 0 };
            //     } else if (deltaY <= FOLLOW_PADDING) {
            //         // Case 1c: player is near the horizontal line, move vertically
            //         if (playerY < playerFollowY + ALIGNMENT_THRESHOLD) {
            //             rigidBody.velocity = { x: 0, y: -1 * entityFollow.followVelocity };
            //             rigidBody.direction = { x: 0, y: -1 };
            //         } else if (playerY > playerFollowY - ALIGNMENT_THRESHOLD) {
            //             rigidBody.velocity = { x: 0, y: entityFollow.followVelocity };
            //             rigidBody.direction = { x: 0, y: 1 };
            //         }
            //     }
            // } else if (playerX < playerFollowX - ALIGNMENT_THRESHOLD) {
            //     // Case 2: player is on the left of the entity
            //     if (
            //         (deltaY <= ALIGNMENT_THRESHOLD && deltaX > entityFollow.minFollowDistance) ||
            //         deltaY > FOLLOW_PADDING
            //     ) {
            //         // Case 1a: player is on the horizontal line, move left until entity is at min distance
            //         rigidBody.velocity = { x: -1 * entityFollow.followVelocity, y: 0 };
            //         rigidBody.direction = { x: -1, y: 0 };
            //     } else if (deltaY <= ALIGNMENT_THRESHOLD && deltaX <= entityFollow.minFollowDistance) {
            //         // Case 1b: player is on the horizontal line and already at min distance, stop
            //         rigidBody.velocity = { x: 0, y: 0 };
            //         rigidBody.direction = { x: -1, y: 0 };
            //     } else if (deltaY <= FOLLOW_PADDING) {
            //         // Case 1c: player is near the horizontal line, move vertically
            //         if (playerY < playerFollowY + ALIGNMENT_THRESHOLD) {
            //             rigidBody.velocity = { x: 0, y: -1 * entityFollow.followVelocity };
            //             rigidBody.direction = { x: 0, y: -1 };
            //         } else if (playerY > playerFollowY - ALIGNMENT_THRESHOLD) {
            //             rigidBody.velocity = { x: 0, y: entityFollow.followVelocity };
            //             rigidBody.direction = { x: 0, y: 1 };
            //         }
            //     }
            // } else if (playerY < playerFollowY - ALIGNMENT_THRESHOLD) {
            //     // Case 3: player is on the top of the entity
            //     if (deltaY > entityFollow.minFollowDistance) {
            //         rigidBody.velocity = { x: 0, y: -1 * entityFollow.followVelocity };
            //     } else {
            //         rigidBody.velocity = { x: 0, y: 0 };
            //     }
            //     rigidBody.direction = { x: 0, y: -1 };
            // } else if (playerY > playerFollowY + ALIGNMENT_THRESHOLD) {
            //     // Case 4: player is on the bottom of the entity
            //     if (deltaY > entityFollow.minFollowDistance) {
            //         rigidBody.velocity = { x: 0, y: entityFollow.followVelocity };
            //     } else {
            //         rigidBody.velocity = { x: 0, y: 0 };
            //     }
            //     rigidBody.direction = { x: 0, y: 1 };
            // } else {
            //     rigidBody.velocity = { x: 0, y: 0 };
            // }
        }
    }
}
