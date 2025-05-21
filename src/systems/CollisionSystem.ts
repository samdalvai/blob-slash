import BoxColliderComponent from '../components/BoxColliderComponent';
import TransformComponent from '../components/TransformComponent';
import System from '../ecs/System';
import EventBus from '../event-bus/EventBus';
import CollisionEvent from '../events/CollisionEvent';
import { Vector } from '../types/utils';

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
                    const boxAMin = {
                        x: aTransform.position.x + aCollider.offset.x,
                        y: aTransform.position.y + aCollider.offset.y,
                    };
                    const boxAMax = {
                        x: aTransform.position.x + aCollider.width * aTransform.scale.x + aCollider.offset.x,
                        y: aTransform.position.y + aCollider.height * aTransform.scale.y + aCollider.offset.y,
                    };

                    const boxBMin = {
                        x: bTransform.position.x + bCollider.offset.x,
                        y: bTransform.position.y + bCollider.offset.y,
                    };
                    const boxBMax = {
                        x: bTransform.position.x + bCollider.width * bTransform.scale.x + bCollider.offset.x,
                        y: bTransform.position.y + bCollider.height * bTransform.scale.y + bCollider.offset.y,
                    };

                    const collisionNormal = this.computeCollisionNormal(boxAMin, boxAMax, boxBMin, boxBMax);
                    eventBus.emitEvent(CollisionEvent, a, b, collisionNormal);
                }
            }
        }
    }

    checkAABBCollision(aX: number, aY: number, aW: number, aH: number, bX: number, bY: number, bW: number, bH: number) {
        return aX < bX + bW && aX + aW > bX && aY < bY + bH && aY + aH > bY;
    }

    computeCollisionNormal(boxAMin: Vector, boxAMax: Vector, boxBMin: Vector, boxBMax: Vector) {
        // Calculate the overlap between the boxes on each axis
        const xOverlap = Math.min(boxAMax.x, boxBMax.x) - Math.max(boxAMin.x, boxBMin.x);
        const yOverlap = Math.min(boxAMax.y, boxBMax.y) - Math.max(boxAMin.y, boxBMin.y);

        // Determine which axis has the smallest overlap (direction of collision)
        if (xOverlap < yOverlap) {
            // Colliding on the x-axis
            if (boxAMin.x < boxBMin.x) {
                return { x: -1, y: 0 }; // Collision normal pointing towards the left
            } else {
                return { x: 1, y: 0 }; // Collision normal pointing towards the right
            }
        } else {
            // Colliding on the y-axis
            if (boxAMin.y < boxBMin.y) {
                return { x: 0, y: -1 }; // Collision normal pointing upwards
            } else {
                return { x: 0, y: 1 }; // Collision normal pointing downwards
            }
        }
    }
}
