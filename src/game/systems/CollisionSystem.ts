import { getColliderBounds, System, Vector, WorldBounds, worldBoundsOverlap } from '../../engine';
import BoxColliderComponent from '../components/BoxColliderComponent';
import TransformComponent from '../components/TransformComponent';
import CollisionEvent from '../events/CollisionEvent';
import { EventBus } from '../../engine';

export default class CollisionSystem extends System {
    constructor() {
        super();
        this.requireComponent(TransformComponent);
        this.requireComponent(BoxColliderComponent);
    }

    update(eventBus: EventBus) {
        const entities = this.getSystemEntities();

        for (let i = 0; i < entities.length - 1; i++) {
            const a = entities[i];
            const aTransform = a.getComponent(TransformComponent);
            const aCollider = a.getComponent(BoxColliderComponent);

            if (!aTransform || !aCollider) {
                throw new Error('Could not find some component(s) of entity with id ' + a.getId());
            }

            const aBounds = this.getBounds(aTransform, aCollider);

            for (let j = i + 1; j < entities.length; j++) {
                const b = entities[j];
                if (a.belongsToGroup('obstacles') && b.belongsToGroup('obstacles')) {
                    continue;
                }

                const bTransform = b.getComponent(TransformComponent);
                const bCollider = b.getComponent(BoxColliderComponent);
                if (!bTransform || !bCollider) {
                    throw new Error('Could not find some component(s) of entity with id ' + b.getId());
                }

                const bBounds = this.getBounds(bTransform, bCollider);
                if (!worldBoundsOverlap(aBounds, bBounds)) {
                    continue;
                }

                const collisionNormal = this.computeCollisionNormal(aBounds, bBounds);
                aCollider.lastCollision = performance.now();
                bCollider.lastCollision = performance.now();
                eventBus.emitEvent(CollisionEvent, a, b, collisionNormal);
            }
        }
    }

    private getBounds(transform: TransformComponent, collider: BoxColliderComponent): WorldBounds {
        return getColliderBounds(
            transform.position,
            { width: collider.width, height: collider.height },
            collider.offset,
            transform.scale,
        );
    }

    /** Returns the normal from B toward A in standard Y-up world coordinates. */
    computeCollisionNormal(boxA: WorldBounds, boxB: WorldBounds): Vector {
        const xOverlap = Math.min(boxA.right, boxB.right) - Math.max(boxA.left, boxB.left);
        const yOverlap = Math.min(boxA.top, boxB.top) - Math.max(boxA.bottom, boxB.bottom);

        if (xOverlap < yOverlap) {
            const aCenterX = (boxA.left + boxA.right) / 2;
            const bCenterX = (boxB.left + boxB.right) / 2;
            return { x: aCenterX < bCenterX ? -1 : 1, y: 0 };
        }

        const aCenterY = (boxA.bottom + boxA.top) / 2;
        const bCenterY = (boxB.bottom + boxB.top) / 2;
        return { x: 0, y: aCenterY < bCenterY ? -1 : 1 };
    }
}
