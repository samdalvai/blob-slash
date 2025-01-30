import HealthComponent from '../components/HealthComponent';
import SpriteComponent from '../components/SpriteComponent';
import TransformComponent from '../components/TransformComponent';
import System from '../ecs/System';
import { Rectangle } from '../types';

export default class RenderHealthBarSystem extends System {
    constructor() {
        super();
        this.requireComponent(HealthComponent);
        this.requireComponent(TransformComponent);
        this.requireComponent(SpriteComponent);
    }

    update(ctx: CanvasRenderingContext2D, camera: Rectangle) {
        for (const entity of this.getSystemEntities()) {
            const transform = entity.getComponent(TransformComponent);
            const sprite = entity.getComponent(SpriteComponent);
            const health = entity.getComponent(HealthComponent);

            if (!sprite || !transform || !health) {
                throw new Error('Could not find some component(s) of entity with id ' + entity.getId());
            }

            const isOutsideCameraView =
                transform.position.x + transform.scale.x * sprite.width < camera.x ||
                transform.position.x > camera.x + camera.width ||
                transform.position.y + transform.scale.y * sprite.height < camera.y ||
                transform.position.y > camera.y + camera.height;

            if (isOutsideCameraView) {
                continue;
            }

            let color = { r: 255, g: 255, b: 255 }; // white

            if (health.healthPercentage <= 35) {
                color = { r: 255, g: 0, b: 0 }; // red
            } else if (health.healthPercentage <= 75) {
                color = { r: 255, g: 255, b: 0 }; // yellow
            }

            ctx.fillStyle = `rgb(${color.r},${color.g},${color.b})`;

            const topPadding = 5;
            const healthBarHeight = 5;

            const healthBarRect: Rectangle = {
                x: transform.position.x - camera.x,
                y: transform.position.y - healthBarHeight - topPadding * transform.scale.y - camera.y,
                width: (sprite.width * transform.scale.x * health.healthPercentage) / 100,
                height: healthBarHeight,
            };

            ctx.fillRect(healthBarRect.x, healthBarRect.y, healthBarRect.width, healthBarRect.height);

            ctx.save();
            const text = health.healthPercentage + '%';
            ctx.font = '14px Arial';

            // Render the text centered within the rectangle
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            const textX = healthBarRect.x + (sprite.width * transform.scale.x) / 2;
            const textY = healthBarRect.y - topPadding * 2;

            ctx.fillText(text, textX, textY);
            ctx.restore();
        }
    }
}
