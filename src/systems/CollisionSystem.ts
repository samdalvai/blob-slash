import BoxColliderComponent from '../components/BoxColliderComponent';
import TransformComponent from '../components/TransformComponent';
import System from '../ecs/System';
import EventBus from '../event-bus/EventBus';
import CollisionEvent from '../events/CollisionEvent';

export default class CollisionSystem extends System {
    constructor() {
        super();
        this.requireComponent(TransformComponent);
        this.requireComponent(BoxColliderComponent);
    }

    update(eventBus: EventBus) {
        const entities = this.getSystemEntities();

        // Loop all the entities that the system is interested in
        for (let i = 0; i < entities.length - 1; i++) {
            const a = entities[i];
            const aTransform = a.getComponent(TransformComponent);
            const aCollider = a.getComponent(BoxColliderComponent);

            if (!aTransform || !aCollider) {
                throw new Error('Could not find some component(s) of entity with id ' + a.getId());
            }

            // Loop all the entities that still need to be checked (to the right of i)
            for (let j = i; j < entities.length; j++) {
                const b = entities[j];

                // Bypass if we are trying to test the same entity
                if (a === b) {
                    continue;
                }

                const bTransform = b.getComponent(TransformComponent);
                const bCollider = b.getComponent(BoxColliderComponent);

                if (!bTransform || !bCollider) {
                    throw new Error('Could not find some component(s) of entity with id ' + b.getId());
                }

                // Perform the AABB collision check between entities a and b
                const collisionHappened = this.checkAABBCollision(
                    aTransform.position.x + aCollider.offset.x,
                    aTransform.position.y + aCollider.offset.y,
                    aCollider.width * aTransform.scale.x,
                    aCollider.height * aTransform.scale.y,
                    bTransform.position.x + bCollider.offset.x,
                    bTransform.position.y + bCollider.offset.y,
                    bCollider.width * bTransform.scale.x,
                    bCollider.height * bTransform.scale.y,
                );

                if (collisionHappened) {
                    eventBus.emitEvent(CollisionEvent, a, b);
                }
            }
        }
    }

    checkAABBCollision(aX: number, aY: number, aW: number, aH: number, bX: number, bY: number, bW: number, bH: number) {
        return aX < bX + bW && aX + aW > bX && aY < bY + bH && aY + aH > bY;
    }
}
