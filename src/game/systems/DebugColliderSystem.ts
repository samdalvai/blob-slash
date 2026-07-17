import { Camera, getCameraBounds, getColliderBounds, System, worldBoundsOverlap } from '../../engine';
import BoxColliderComponent from '../components/BoxColliderComponent';
import TransformComponent from '../components/TransformComponent';

export default class DebugColliderSystem extends System {
    constructor() {
        super();
        this.requireComponent(TransformComponent);
        this.requireComponent(BoxColliderComponent);
    }

    update(ctx: CanvasRenderingContext2D, camera: Camera) {
        const cameraBounds = getCameraBounds(camera);

        for (const entity of this.getSystemEntities()) {
            const transform = entity.getComponent(TransformComponent);
            const collider = entity.getComponent(BoxColliderComponent);

            if (!collider || !transform) {
                throw new Error('Could not find some component(s) of entity with id ' + entity.getId());
            }

            const colliderBounds = getColliderBounds(
                transform.position,
                { width: collider.width, height: collider.height },
                collider.offset,
                transform.scale,
            );
            if (!worldBoundsOverlap(colliderBounds, cameraBounds)) {
                continue;
            }

            ctx.strokeStyle = performance.now() - collider.lastCollision <= 100 ? 'orange' : 'red';
            ctx.strokeRect(
                colliderBounds.left,
                colliderBounds.bottom,
                colliderBounds.right - colliderBounds.left,
                colliderBounds.top - colliderBounds.bottom,
            );
        }
    }
}
