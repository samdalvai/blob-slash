import EntityFollowComponent from '../components/EntityFollowComponent';
import RigidBodyComponent from '../components/RigidBodyComponent';
import SpriteComponent from '../components/SpriteComponent';
import TransformComponent from '../components/TransformComponent';
import Registry from '../../core/ecs/Registry';
import System from '../../core/ecs/System';
import EventBus from '../../core/event-bus/EventBus';
import EntityHitEvent from '../events/EntityHitEvent';
import { isPointInsideCircle } from '../../core/utils/circle';

export default class PlayerDetectionSystem extends System {
    constructor() {
        super();
        this.requireComponent(TransformComponent);
        this.requireComponent(EntityFollowComponent);
        this.requireComponent(RigidBodyComponent);
        this.requireComponent(SpriteComponent);
    }

    subscribeToEvents(eventBus: EventBus) {
        eventBus.subscribeToEvent(EntityHitEvent, this, this.onEntityHitByPlayer);
    }

    onEntityHitByPlayer = (event: EntityHitEvent) => {
        const entity = event.entity;

        if (!entity.hasTag('player') && entity.hasComponent(EntityFollowComponent)) {
            const player = entity.registry.getEntityByTag('player');

            if (!player) {
                // Avoid throwing error, player might have been killed after launching attack
                console.warn('Player entity not found');
                return;
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
            return;
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
            const sprite = entity.getComponent(SpriteComponent);

            if (!rigidBody || !transform || !entityFollow || !sprite) {
                throw new Error('Could not find some component(s) of entity with id ' + entity.getId());
            }

            const entityX = transform.position.x + (sprite.width / 2) * transform.scale.x;
            const entityY = transform.position.y + (sprite.height / 2) * transform.scale.y;

            const playerX = playerTransform.position.x + (playerTransform.scale.x * playerSprite.width) / 2;
            const playerY = playerTransform.position.y + (playerTransform.scale.y * playerSprite.height) / 2;

            const isPlayerInsideCircle = isPointInsideCircle(
                playerX,
                playerY,
                entityX,
                entityY,
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
}
