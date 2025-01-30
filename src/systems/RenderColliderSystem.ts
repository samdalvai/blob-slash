import BoxColliderComponent from '../components/BoxColliderComponent';
import TransformComponent from '../components/TransformComponent';
import System from '../ecs/System';
import { Rectangle } from '../types';

export default class RenderColliderSystem extends System {
    constructor() {
        super();
        this.requireComponent(TransformComponent);
        this.requireComponent(BoxColliderComponent);
    }

    update(ctx: CanvasRenderingContext2D, camera: Rectangle) {
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
                x: transform.position.x + collider.offset.x - camera.x,
                y: transform.position.y + collider.offset.y - camera.y,
                width: collider.width * transform.scale.x,
                height: collider.height * transform.scale.y,
            };

            ctx.strokeStyle = 'red';
            ctx.strokeRect(colliderRect.x, colliderRect.y, colliderRect.width, colliderRect.height);
        }
    }
}
