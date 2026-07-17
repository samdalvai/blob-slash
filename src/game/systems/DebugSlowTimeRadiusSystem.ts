import { Camera, getCameraBounds, getSpriteBounds, System, worldBoundsOverlap } from '../../engine';
import SlowTimeComponent from '../components/SlowTimeComponent';
import SpriteComponent from '../components/SpriteComponent';
import TransformComponent from '../components/TransformComponent';

export default class DebugSlowTimeRadiusSystem extends System {
    constructor() {
        super();
        this.requireComponent(TransformComponent);
        this.requireComponent(SlowTimeComponent);
        this.requireComponent(SpriteComponent);
    }

    update(ctx: CanvasRenderingContext2D, camera: Camera) {
        const cameraBounds = getCameraBounds(camera);

        for (const entity of this.getSystemEntities()) {
            const transform = entity.getComponent(TransformComponent);
            const slowtime = entity.getComponent(SlowTimeComponent);
            const sprite = entity.getComponent(SpriteComponent);

            if (!slowtime || !transform || !sprite) {
                throw new Error('Could not find some component(s) of entity with id ' + entity.getId());
            }

            if (
                !worldBoundsOverlap(
                    getSpriteBounds(transform.position, { width: sprite.width, height: sprite.height }, transform.scale),
                    cameraBounds,
                )
            ) {
                continue;
            }

            ctx.beginPath();
            ctx.arc(transform.position.x, transform.position.y, slowtime.radius, 0, Math.PI * 2);
            ctx.strokeStyle = 'red';
            ctx.stroke();
        }
    }
}
