import Engine from '../../engine/Engine';
import Entity from '../../engine/ecs/Entity';
import System from '../../engine/ecs/System';
import EventBus from '../../engine/event-bus/EventBus';
import { Vector } from '../../engine/types/utils';
import BoxColliderComponent from '../components/BoxColliderComponent';
import EntityEffectComponent from '../components/EntityEffectComponent';
import RigidBodyComponent from '../components/RigidBodyComponent';
import TransformComponent from '../components/TransformComponent';
import CollisionEvent from '../events/CollisionEvent';

export default class MovementSystem extends System {
    constructor() {
        super();
        this.requireComponent(TransformComponent);
        this.requireComponent(RigidBodyComponent);
    }

    subscribeToEvents(eventBus: EventBus) {
        eventBus.subscribeToEvent(CollisionEvent, this, this.onCollision);
    }

    onCollision(event: CollisionEvent) {
        const a = event.a;
        const b = event.b;
        const collisionNormal = event.collisionNormal;

        if (
            (a.hasTag('player') || a.belongsToGroup('enemies')) &&
            (b.belongsToGroup('obstacles') || (!b.getTag() && !b.getGroup()))
        ) {
            this.onEntityHitsObstacle(a, b, collisionNormal);
        }

        if (
            (a.belongsToGroup('obstacles') || (!a.getTag() && !a.getGroup())) &&
            (b.hasTag('player') || b.belongsToGroup('enemies'))
        ) {
            this.invertCollisionNormal(collisionNormal);
            this.onEntityHitsObstacle(b, a, collisionNormal);
        }

        // TODO: avoid same entity being killed twice (is this called twice?)
        if (a.belongsToGroup('projectiles') && b.belongsToGroup('obstacles')) {
            a.kill();
        }

        // TODO: avoid same entity being killed twice (is this called twice?)
        if (a.belongsToGroup('obstacles') && b.belongsToGroup('projectiles')) {
            b.kill();
        }

        if (a.hasTag('player') && b.belongsToGroup('enemies')) {
            this.onEntityHitsObstacle(a, b, collisionNormal);
        }

        if (a.belongsToGroup('enemies') && b.hasTag('player')) {
            this.invertCollisionNormal(collisionNormal);
            this.onEntityHitsObstacle(b, a, collisionNormal);
        }
    }

    // Invert collision to ensure that the vector direction is always related to the "non obstacle" entity
    invertCollisionNormal(collisionNormal: Vector) {
        collisionNormal.x *= -1;
        collisionNormal.y *= -1;
    }

    onEntityHitsObstacle(entity: Entity, obstacle: Entity, collisionNormal: Vector) {
        if (entity.hasComponent(RigidBodyComponent) && entity.hasComponent(TransformComponent)) {
            const entityRigidBody = entity.getComponent(RigidBodyComponent);
            const entityTransform = entity.getComponent(TransformComponent);
            const entityCollider = entity.getComponent(BoxColliderComponent);

            const obstacleTransform = obstacle.getComponent(TransformComponent);
            const obstacleCollider = obstacle.getComponent(BoxColliderComponent);

            if (!entityRigidBody || !entityTransform || !entityCollider) {
                throw new Error('Could not find some component(s) of entity with id ' + entity.getId());
            }

            if (!obstacleTransform || !obstacleCollider) {
                throw new Error('Could not find some component(s) of entity with id ' + obstacle.getId());
            }

            // Entity is colliding downwards, shift up by the height of the player entityCollider
            if (collisionNormal.y < 0) {
                entityTransform.position.y =
                    obstacleTransform.position.y -
                    entityCollider.height * entityTransform.scale.y +
                    obstacleCollider.offset.y -
                    entityCollider.offset.y;
                entityRigidBody.velocity.y = 0;
            }

            // Entity is colliding upwards, shift down by the height of the ground entityCollider
            if (collisionNormal.y > 0) {
                entityTransform.position.y =
                    obstacleTransform.position.y +
                    obstacleCollider.height * obstacleTransform.scale.y +
                    obstacleCollider.offset.y -
                    entityCollider.offset.y;
                entityRigidBody.velocity.y = 0;
            }

            // Entity is colliding on the right, shift left by width of player entityCollider
            if (collisionNormal.x < 0) {
                entityTransform.position.x =
                    obstacleTransform.position.x -
                    entityCollider.width * entityTransform.scale.x +
                    obstacleCollider.offset.x -
                    entityCollider.offset.x;
                entityRigidBody.velocity.x = 0;
            }

            // Entity is colliding on the left, shift right by width of ground entityCollider
            if (collisionNormal.x > 0) {
                entityTransform.position.x =
                    obstacleTransform.position.x +
                    obstacleCollider.width * obstacleTransform.scale.x +
                    obstacleCollider.offset.x -
                    entityCollider.offset.x;
                entityRigidBody.velocity.x = 0;
            }
        }
    }

    update(deltaTime: number) {
        for (const entity of this.getSystemEntities()) {
            const transform = entity.getComponent(TransformComponent);
            const rigidBody = entity.getComponent(RigidBodyComponent);

            if (!rigidBody || !transform) {
                console.error('Could not find some component(s) of entity: ', entity);
                throw new Error('Could not find some component(s) of entity with id ' + entity.getId());
            }

            let slowedPercentage = 1;

            if (entity.hasComponent(EntityEffectComponent)) {
                const entityEffect = entity.getComponent(EntityEffectComponent);

                if (!entityEffect) {
                    throw new Error('Could not find some component(s) of entity with id ' + entity.getId());
                }

                if (entityEffect.slowed) {
                    slowedPercentage = entityEffect.slowedPercentage;
                }
            }

            transform.position.x += Math.floor(rigidBody.velocity.x * deltaTime * slowedPercentage);
            transform.position.y += Math.floor(rigidBody.velocity.y * deltaTime * slowedPercentage);

            if (entity.hasTag('player')) {
                const paddingLeft = 10;
                const paddingTop = 10;
                const paddingRight = 50;
                const paddingBottom = 50;
                transform.position.x = transform.position.x < paddingLeft ? paddingLeft : transform.position.x;
                transform.position.x =
                    transform.position.x > Engine.mapWidth - paddingRight
                        ? Engine.mapWidth - paddingRight
                        : transform.position.x;
                transform.position.y = transform.position.y < paddingTop ? paddingTop : transform.position.y;
                transform.position.y =
                    transform.position.y > Engine.mapHeight - paddingBottom
                        ? Engine.mapHeight - paddingBottom
                        : transform.position.y;
            }

            const cullingMargin = 100;

            const isEntityOutsideMap =
                transform.position.x < -cullingMargin ||
                transform.position.x > Engine.mapWidth + cullingMargin ||
                transform.position.y < -cullingMargin ||
                transform.position.y > Engine.mapHeight + cullingMargin;

            // Kill all entities that move outside the map boundaries
            if (isEntityOutsideMap && !entity.hasTag('player')) {
                entity.kill();
            }
        }
    }
}
