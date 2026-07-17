import { Camera, getCameraBounds, getSpriteBounds, System, worldBoundsOverlap } from '../../engine';
import EntityFollowComponent from '../components/EntityFollowComponent';
import SpriteComponent from '../components/SpriteComponent';
import TransformComponent from '../components/TransformComponent';

export default class DebugPlayerFollowRadiusSystem extends System {
    constructor() {
        super();
        this.requireComponent(TransformComponent);
        this.requireComponent(EntityFollowComponent);
        this.requireComponent(SpriteComponent);
    }

    update(ctx: CanvasRenderingContext2D, camera: Camera) {
        const cameraBounds = getCameraBounds(camera);

        for (const entity of this.getSystemEntities()) {
            const transform = entity.getComponent(TransformComponent);
            const entityFollow = entity.getComponent(EntityFollowComponent);
            const sprite = entity.getComponent(SpriteComponent);

            if (!entityFollow || !transform || !sprite) {
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
            ctx.arc(transform.position.x, transform.position.y, entityFollow.detectionRadius, 0, Math.PI * 2);
            ctx.strokeStyle = 'red';
            ctx.stroke();

            ctx.beginPath();
            ctx.arc(transform.position.x, transform.position.y, entityFollow.minFollowDistance, 0, Math.PI * 2);
            ctx.strokeStyle = 'red';
            ctx.stroke();
        }
    }
}
