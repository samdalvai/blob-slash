import { Camera, DEFAULT_SPRITE, getCameraBounds, getSpriteBounds, System, worldBoundsOverlap } from '../../engine';
import { ParticleComponent } from '../../game/components';
import SpriteComponent from '../../game/components/SpriteComponent';
import TransformComponent from '../../game/components/TransformComponent';

export default class RenderInvisibleEntitiesSystem extends System {
    constructor() {
        super();
        this.requireComponent(TransformComponent);
    }

    update(ctx: CanvasRenderingContext2D, camera: Camera, zoom: number) {
        const cameraBounds = getCameraBounds(camera);

        for (const entity of this.getSystemEntities()) {
            if (entity.hasComponent(ParticleComponent) || entity.hasComponent(SpriteComponent)) {
                continue;
            }

            const transform = entity.getComponent(TransformComponent);
            if (!transform) {
                throw new Error('Could not find transform component of entity with id ' + entity.getId());
            }

            const mockSprite = new SpriteComponent(DEFAULT_SPRITE, 32, 32, 0);
            const bounds = getSpriteBounds(
                transform.position,
                { width: mockSprite.width, height: mockSprite.height },
                transform.scale,
            );
            if (!worldBoundsOverlap(bounds, cameraBounds)) {
                continue;
            }

            ctx.save();
            ctx.strokeStyle = 'rgba(0,0,0,0.5)';
            ctx.lineWidth = 2 / zoom;
            ctx.strokeRect(bounds.left, bounds.bottom, bounds.right - bounds.left, bounds.top - bounds.bottom);
            ctx.restore();
        }
    }
}
