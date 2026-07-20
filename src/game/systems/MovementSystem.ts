import { Engine, Entity, EventBus, getColliderBounds, getSpriteBounds, System, Vector, WorldBounds } from '../../engine';
import BoxColliderComponent from '../components/BoxColliderComponent';
import EntityEffectComponent from '../components/EntityEffectComponent';
import RigidBodyComponent from '../components/RigidBodyComponent';
import SpriteComponent from '../components/SpriteComponent';
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

    // TODO: can we find a better way to handle unwalkable tiles instead of relying to colliders?
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

            const obstacleBounds = getColliderBounds(
                obstacleTransform.position,
                { width: obstacleCollider.width, height: obstacleCollider.height },
                obstacleCollider.offset,
                obstacleTransform.scale,
            );
            const entityHalfWidth = (entityCollider.width * entityTransform.scale.x) / 2;
            const entityHalfHeight = (entityCollider.height * entityTransform.scale.y) / 2;
            const entityOffsetX = entityCollider.offset.x * entityTransform.scale.x;
            const entityOffsetY = entityCollider.offset.y * entityTransform.scale.y;

            // Normal points from obstacle to entity. Negative Y is below in a Y-up world.
            if (collisionNormal.y < 0) {
                entityTransform.position.y = obstacleBounds.bottom - entityHalfHeight - entityOffsetY;
                entityRigidBody.velocity.y = 0;
            }

            if (collisionNormal.y > 0) {
                entityTransform.position.y = obstacleBounds.top + entityHalfHeight - entityOffsetY;
                entityRigidBody.velocity.y = 0;
            }

            if (collisionNormal.x < 0) {
                entityTransform.position.x = obstacleBounds.left - entityHalfWidth - entityOffsetX;
                entityRigidBody.velocity.x = 0;
            }

            if (collisionNormal.x > 0) {
                entityTransform.position.x = obstacleBounds.right + entityHalfWidth - entityOffsetX;
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

            transform.position.x += rigidBody.velocity.x * deltaTime * slowedPercentage;
            transform.position.y += rigidBody.velocity.y * deltaTime * slowedPercentage;

            const getEntityBounds = (): WorldBounds => {
                if (entity.hasComponent(SpriteComponent)) {
                    const sprite = entity.getComponent(SpriteComponent);
                    if (!sprite) {
                        throw new Error('Could not find sprite component of entity with id ' + entity.getId());
                    }

                    return getSpriteBounds(
                        transform.position,
                        { width: sprite.width, height: sprite.height },
                        transform.scale,
                    );
                }

                return {
                    left: transform.position.x,
                    right: transform.position.x,
                    bottom: transform.position.y,
                    top: transform.position.y,
                };
            };

            if (entity.hasTag('player')) {
                const paddingLeft = 10;
                const paddingTop = 10;
                const paddingRight = 50;
                const paddingBottom = 50;
                let bounds = getEntityBounds();
                if (bounds.left < paddingLeft) {
                    transform.position.x += paddingLeft - bounds.left;
                } else if (bounds.right > Engine.mapWidth - paddingRight) {
                    transform.position.x -= bounds.right - (Engine.mapWidth - paddingRight);
                }

                bounds = getEntityBounds();
                if (bounds.bottom < paddingBottom) {
                    transform.position.y += paddingBottom - bounds.bottom;
                } else if (bounds.top > Engine.mapHeight - paddingTop) {
                    transform.position.y -= bounds.top - (Engine.mapHeight - paddingTop);
                }
            }

            const cullingMargin = 100;
            const bounds = getEntityBounds();
            const isEntityOutsideMap =
                bounds.right < -cullingMargin ||
                bounds.left > Engine.mapWidth + cullingMargin ||
                bounds.top < -cullingMargin ||
                bounds.bottom > Engine.mapHeight + cullingMargin;

            // Kill all entities that move outside the map boundaries
            if (isEntityOutsideMap && !entity.hasTag('player')) {
                entity.kill();
            }
        }
    }
}
