import { Camera, getCameraBounds, getSpriteBounds, System, worldBoundsOverlap } from '../../engine';
import HealthComponent from '../components/HealthComponent';
import SpriteComponent from '../components/SpriteComponent';
import TransformComponent from '../components/TransformComponent';

export default class RenderHealthBarSystem extends System {
    constructor() {
        super();
        this.requireComponent(HealthComponent);
        this.requireComponent(TransformComponent);
        this.requireComponent(SpriteComponent);
    }

    update(ctx: CanvasRenderingContext2D, camera: Camera) {
        const cameraBounds = getCameraBounds(camera);

        for (const entity of this.getSystemEntities()) {
            const transform = entity.getComponent(TransformComponent);
            const sprite = entity.getComponent(SpriteComponent);
            const health = entity.getComponent(HealthComponent);

            if (!sprite || !transform || !health) {
                throw new Error('Could not find some component(s) of entity with id ' + entity.getId());
            }

            const spriteBounds = getSpriteBounds(
                transform.position,
                { width: sprite.width, height: sprite.height },
                transform.scale,
            );

            if (
                !worldBoundsOverlap(spriteBounds, cameraBounds) ||
                health.lastDamageTime === 0 ||
                performance.now() - health.lastDamageTime >= 5000
            ) {
                continue;
            }

            let color = { r: 255, g: 255, b: 255 };
            if (health.healthPercentage <= 35) {
                color = { r: 255, g: 0, b: 0 };
            } else if (health.healthPercentage <= 75) {
                color = { r: 255, g: 255, b: 0 };
            }

            const topPadding = 5;
            const healthBarHeight = 5;
            const width = spriteBounds.right - spriteBounds.left;
            const barBottom = spriteBounds.top + topPadding;

            ctx.fillStyle = `rgb(${color.r},${color.g},${color.b})`;
            ctx.fillRect(spriteBounds.left, barBottom, (width * health.healthPercentage) / 100, healthBarHeight);

            ctx.save();
            ctx.translate(transform.position.x, barBottom + healthBarHeight + topPadding);
            ctx.scale(1, -1);
            ctx.font = '14px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(health.healthPercentage + '%', 0, 0);
            ctx.restore();
        }
    }
}
