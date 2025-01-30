import BoxColliderComponent from '../components/BoxColliderComponent';
import RigidBodyComponent from '../components/RigidBodyComponent';
import SpriteComponent from '../components/SpriteComponent';
import TransformComponent from '../components/TransformComponent';
import Entity from '../ecs/Entity';
import System from '../ecs/System';
import EventBus from '../event-bus/EventBus';
import CollisionEvent from '../events/CollisionEvent';
import Game from '../game/Game';

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

        if (a.belongsToGroup('enemies') && (b.belongsToGroup('obstacles') || b.hasTag('player'))) {
            this.onEnemyHitsObstacleOrPlayer(a);
        }
        if ((a.belongsToGroup('obstacles') || a.hasTag('player')) && b.belongsToGroup('enemies')) {
            this.onEnemyHitsObstacleOrPlayer(b);
        }

        if (a.hasTag('player') && (b.belongsToGroup('enemies') || b.belongsToGroup('obstacles'))) {
            this.onPlayerHitsEnemyOrObstacle(a, b);
        }
        if ((a.belongsToGroup('enemies') || a.belongsToGroup('obstacles')) && b.hasTag('player')) {
            this.onPlayerHitsEnemyOrObstacle(b, a);
        }
    }

    onEnemyHitsObstacleOrPlayer(enemy: Entity) {
        if (enemy.hasComponent(RigidBodyComponent) && enemy.hasComponent(SpriteComponent)) {
            const rigidbody = enemy.getComponent(RigidBodyComponent);
            const sprite = enemy.getComponent(SpriteComponent);

            if (!rigidbody || !sprite) {
                throw new Error('Could not find some component(s) of entity with id ' + enemy.getId());
            }

            if (rigidbody.velocity.x != 0) {
                rigidbody.velocity.x *= -1;
                rigidbody.direction.x *= -1;
            }

            if (rigidbody.velocity.y != 0) {
                rigidbody.velocity.y *= -1;
                rigidbody.direction.y *= -1;
            }
        }
    }

    onPlayerHitsEnemyOrObstacle(player: Entity, obstacle: Entity) {
        if (player.hasComponent(RigidBodyComponent) && player.hasComponent(TransformComponent)) {
            const playerRigidBody = player.getComponent(RigidBodyComponent);
            const playerTransform = player.getComponent(TransformComponent);
            const playerCollider = player.getComponent(BoxColliderComponent);

            const obstacleTransform = obstacle.getComponent(TransformComponent);
            const obstacleCollider = obstacle.getComponent(BoxColliderComponent);

            if (!playerRigidBody || !playerTransform || !playerCollider) {
                throw new Error('Could not find some component(s) of entity with id ' + player.getId());
            }

            if (!obstacleTransform || !obstacleCollider) {
                throw new Error('Could not find some component(s) of entity with id ' + player.getId());
            }

            // Shift player back based on the collider dimension and position of the two entities

            // Player is colliding from the right
            if (playerRigidBody.velocity.x > 0) {
                playerTransform.position.x =
                    obstacleTransform.position.x -
                    playerCollider.width * playerTransform.scale.x +
                    obstacleCollider.offset.x -
                    playerCollider.offset.x;
                playerRigidBody.velocity.x = 0;
            }

            // Player is colliding from the left
            if (playerRigidBody.velocity.x < 0) {
                playerTransform.position.x =
                    obstacleTransform.position.x +
                    obstacleCollider.width * obstacleTransform.scale.x +
                    obstacleCollider.offset.x -
                    playerCollider.offset.x;
                playerRigidBody.velocity.x = 0;
            }

            // Player is colliding from the top
            if (playerRigidBody.velocity.y > 0) {
                playerTransform.position.y =
                    obstacleTransform.position.y -
                    playerCollider.height * playerTransform.scale.y +
                    obstacleCollider.offset.y -
                    playerCollider.offset.y;
                playerRigidBody.velocity.y = 0;
            }

            // Player is colliding from the bottom
            if (playerRigidBody.velocity.y < 0) {
                playerTransform.position.y =
                    obstacleTransform.position.y +
                    obstacleCollider.height * obstacleTransform.scale.y +
                    obstacleCollider.offset.y -
                    playerCollider.offset.y;
                playerRigidBody.velocity.y = 0;
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

            transform.position.x += rigidBody.velocity.x * deltaTime;
            transform.position.y += rigidBody.velocity.y * deltaTime;

            if (entity.hasTag('player')) {
                const paddingLeft = 10;
                const paddingTop = 10;
                const paddingRight = 50;
                const paddingBottom = 50;
                transform.position.x = transform.position.x < paddingLeft ? paddingLeft : transform.position.x;
                transform.position.x =
                    transform.position.x > Game.mapWidth - paddingRight
                        ? Game.mapWidth - paddingRight
                        : transform.position.x;
                transform.position.y = transform.position.y < paddingTop ? paddingTop : transform.position.y;
                transform.position.y =
                    transform.position.y > Game.mapHeight - paddingBottom
                        ? Game.mapHeight - paddingBottom
                        : transform.position.y;
            }

            const cullingMargin = 100;

            const isEntityOutsideMap =
                transform.position.x < -cullingMargin ||
                transform.position.x > Game.mapWidth + cullingMargin ||
                transform.position.y < -cullingMargin ||
                transform.position.y > Game.mapHeight + cullingMargin;

            // Kill all entities that move outside the map boundaries
            if (isEntityOutsideMap && !entity.hasTag('player')) {
                entity.kill();
            }
        }
    }
}
