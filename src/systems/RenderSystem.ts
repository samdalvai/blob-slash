import AssetStore from '../asset-store/AssetStore';
import ShadowComponent from '../components/ShadowComponent';
import SpriteComponent from '../components/SpriteComponent';
import TransformComponent from '../components/TransformComponent';
import System from '../ecs/System';
import { Flip, Rectangle } from '../types';

export default class RenderSystem extends System {
    constructor() {
        super();
        this.requireComponent(SpriteComponent);
        this.requireComponent(TransformComponent);
    }

    update(ctx: CanvasRenderingContext2D, assetStore: AssetStore, camera: Rectangle) {
        const renderableEntities: {
            sprite: SpriteComponent;
            transform: TransformComponent;
            shadow?: ShadowComponent;
        }[] = [];

        for (const entity of this.getSystemEntities()) {
            const sprite = entity.getComponent(SpriteComponent);
            const transform = entity.getComponent(TransformComponent);

            if (!sprite || !transform) {
                throw new Error('Could not find some component(s) of entity with id ' + entity.getId());
            }

            // Check if the entity sprite is outside the camera view
            const isOutsideCameraView =
                transform.position.x + transform.scale.x * sprite.width < camera.x ||
                transform.position.x > camera.x + camera.width ||
                transform.position.y + transform.scale.y * sprite.height < camera.y ||
                transform.position.y > camera.y + camera.height;

            // Cull sprites that are outside the camera viww (and are not fixed)
            if (isOutsideCameraView && !sprite.isFixed) {
                continue;
            }

            const shadow = entity.hasComponent(ShadowComponent) ? entity.getComponent(ShadowComponent) : undefined;

            renderableEntities.push({ sprite, transform, shadow });
        }

        renderableEntities.sort((entityA, entityB) => {
            return entityA.sprite.zIndex - entityB.sprite.zIndex;
        });

        for (const entity of renderableEntities) {
            const sprite = entity.sprite;
            const transform = entity.transform;

            if (entity.shadow) {
                ctx.save();

                ctx.fillStyle = 'rgba(0, 0, 0, 0.35)'; // Semi-transparent black

                // Position the shadow below the entity
                const shadowX =
                    transform.position.x + entity.shadow.offsetX + (sprite.width * transform.scale.x) / 2 - camera.x;
                const shadowY =
                    transform.position.y + entity.shadow.offsetY + sprite.height * transform.scale.y - camera.y;

                // Draw an ellipse as the shadow
                ctx.beginPath();
                ctx.ellipse(shadowX, shadowY, entity.shadow.width / 2, entity.shadow.height / 2, 0, 0, 2 * Math.PI);
                ctx.fill();

                // Restore the canvas state
                ctx.restore();
            }

            const srcRect: Rectangle = sprite.srcRect;

            const dstRect: Rectangle = {
                x: transform.position.x - (sprite.isFixed ? 0 : camera.x),
                y: transform.position.y - (sprite.isFixed ? 0 : camera.y),
                width: sprite.width * transform.scale.x,
                height: sprite.height * transform.scale.y,
            };

            ctx.save();

            // Calculate the center of the destination rectangle
            const centerX = dstRect.x + dstRect.width / 2;
            const centerY = dstRect.y + dstRect.height / 2;

            // Move the origin of the canvas to the center of the sprite
            ctx.translate(centerX, centerY);

            // Apply flipping
            switch (sprite.flip) {
                case Flip.NONE:
                    break;
                case Flip.HORIZONTAL:
                    ctx.scale(-1, 1);
                    break;
                case Flip.VERTICAL:
                    ctx.scale(1, -1);
                    break;
            }

            // Optionally, apply rotation (in radians)
            if (transform.rotation) {
                const rotationAngle = transform.rotation * (Math.PI / 180);
                ctx.rotate(rotationAngle);
            }

            ctx.drawImage(
                assetStore.getTexture(sprite.assetId),
                srcRect.x,
                srcRect.y,
                srcRect.width,
                srcRect.height,
                -dstRect.width / 2, // Adjust to draw from the center
                -dstRect.height / 2,
                dstRect.width,
                dstRect.height,
            );

            ctx.restore();
        }
    }
}
