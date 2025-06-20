import BoxColliderComponent from '../components/BoxColliderComponent';
import TransformComponent from '../components/TransformComponent';
import System from '../../engine/ecs/System';
import { Rectangle } from '../../engine/types/utils';

export default class DebugColliderSystem extends System {
    constructor() {
        super();
        this.requireComponent(TransformComponent);
        this.requireComponent(BoxColliderComponent);
    }

    update(ctx: CanvasRenderingContext2D, camera: Rectangle, zoom = 1) {
        for (const entity of this.getSystemEntities()) {
            const transform = entity.getComponent(TransformComponent);
            const collider = entity.getComponent(BoxColliderComponent);

            if (!collider || !transform) {
                throw new Error('Could not find some component(s) of entity with id ' + entity.getId());
            }

            // Bypass rendering if entities are outside the camera view
            const isOutsideCameraView =
                transform.position.x + transform.scale.x * collider.width < camera.x ||
                transform.position.x > camera.x + camera.width ||
                transform.position.y + transform.scale.y * collider.height < camera.y ||
                transform.position.y > camera.y + camera.height;

            if (isOutsideCameraView) {
                continue;
            }

            const colliderRect: Rectangle = {
                x: (transform.position.x + collider.offset.x - camera.x) * zoom,
                y: (transform.position.y + collider.offset.y - camera.y) * zoom,
                width: collider.width * transform.scale.x * zoom,
                height: collider.height * transform.scale.y * zoom,
            };

            ctx.strokeStyle = performance.now() - collider.lastCollision <= 100 ? 'orange' : 'red';
            ctx.strokeRect(colliderRect.x, colliderRect.y, colliderRect.width, colliderRect.height);
        }
    }
}
