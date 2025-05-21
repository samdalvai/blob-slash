import SlowTimeComponent from '../../components/SlowTimeComponent';
import SpriteComponent from '../../components/SpriteComponent';
import TransformComponent from '../../components/TransformComponent';
import System from '../../ecs/System';
import { Rectangle } from '../../types/utils';

export default class RenderSlowTimeRadiusSystem extends System {
    constructor() {
        super();
        this.requireComponent(TransformComponent);
        this.requireComponent(SlowTimeComponent);
        this.requireComponent(SpriteComponent);
    }

    update(ctx: CanvasRenderingContext2D, camera: Rectangle) {
        for (const entity of this.getSystemEntities()) {
            const transform = entity.getComponent(TransformComponent);
            const slowtime = entity.getComponent(SlowTimeComponent);
            const sprite = entity.getComponent(SpriteComponent);

            if (!slowtime || !transform || !sprite) {
                throw new Error('Could not find some component(s) of entity with id ' + entity.getId());
            }

            // Bypass rendering if entities are outside the camera view
            const isOutsideCameraView =
                transform.position.x + transform.scale.x < camera.x ||
                transform.position.x > camera.x + camera.width ||
                transform.position.y + transform.scale.y < camera.y ||
                transform.position.y > camera.y + camera.height;

            if (isOutsideCameraView) {
                continue;
            }

            const circleX = transform.position.x + (sprite.width / 2) * transform.scale.x - camera.x;
            const circleY = transform.position.y + (sprite.height / 2) * transform.scale.y - camera.y;

            ctx.beginPath();
            ctx.arc(circleX, circleY, slowtime.radius, 0, Math.PI * 2);
            ctx.strokeStyle = 'red';
            ctx.stroke();
        }
    }
}
