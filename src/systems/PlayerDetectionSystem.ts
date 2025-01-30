import EntityFollowComponent from '../components/EntityFollowComponent';
import RigidBodyComponent from '../components/RigidBodyComponent';
import SpriteComponent from '../components/SpriteComponent';
import TransformComponent from '../components/TransformComponent';
import Registry from '../ecs/Registry';
import System from '../ecs/System';
import EventBus from '../event-bus/EventBus';
import EntityHitEvent from '../events/EntityHitEvent';

export default class PlayerDetectionSystem extends System {
    constructor() {
        super();
        this.requireComponent(TransformComponent);
        this.requireComponent(EntityFollowComponent);
        this.requireComponent(RigidBodyComponent);
    }

    subscribeToEvents(eventBus: EventBus) {
        eventBus.subscribeToEvent(EntityHitEvent, this, this.onEntityHitByPlayer);
    }

    onEntityHitByPlayer = (event: EntityHitEvent) => {
        const entity = event.entity;

        if (!entity.hasTag('player') && entity.hasComponent(EntityFollowComponent)) {
            const player = entity.registry.getEntityByTag('player');

            if (!player) {
                throw new Error('Player entity not found');
            }

            const entityFollow = entity.getComponent(EntityFollowComponent);

            if (!entityFollow) {
                throw new Error('Could not find some component(s) of entity with id ' + entity.getId());
            }

            entityFollow.followedEntity = player;
            entityFollow.startFollowTime = performance.now();
        }
    };

    update(registry: Registry) {
        const player = registry.getEntityByTag('player');

        if (!player) {
            throw new Error('Player entity not found');
        }

        const playerTransform = player.getComponent(TransformComponent);
        const playerSprite = player.getComponent(SpriteComponent);

        if (!playerTransform || !playerSprite) {
            throw new Error('Could not find player transform and/or sprite component');
        }

        for (const entity of this.getSystemEntities()) {
            const transform = entity.getComponent(TransformComponent);
            const rigidBody = entity.getComponent(RigidBodyComponent);
            const entityFollow = entity.getComponent(EntityFollowComponent);

            if (!rigidBody || !transform || !entityFollow) {
                throw new Error('Could not find some component(s) of entity with id ' + entity.getId());
            }

            const playerFollowX = transform.position.x + entityFollow.offset.x;
            const playerFollowY = transform.position.y + entityFollow.offset.y;

            const playerX = playerTransform.position.x + (playerTransform.scale.x * playerSprite.width) / 2;
            const playerY = playerTransform.position.y + (playerTransform.scale.y * playerSprite.height) / 2;

            const isPlayerInsideCircle = this.isEntityInsideCircle(
                playerX,
                playerY,
                playerFollowX,
                playerFollowY,
                entityFollow.detectionRadius,
            );

            if (isPlayerInsideCircle) {
                entityFollow.followedEntity = player;
                entityFollow.startFollowTime = performance.now();
            } else if (
                entityFollow.followedEntity &&
                performance.now() - entityFollow.startFollowTime > entityFollow.followDuration
            ) {
                entityFollow.followedEntity = null;
            }
        }
    }

    private isEntityInsideCircle(
        entityX: number,
        entityY: number,
        circleX: number,
        circleY: number,
        circleRadius: number,
    ) {
        return Math.pow(entityX - circleX, 2) + Math.pow(entityY - circleY, 2) <= circleRadius * circleRadius;
    }
}
