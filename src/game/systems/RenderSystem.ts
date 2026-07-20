import {
    AssetStore,
    Camera,
    Flip,
    System,
    WorldBounds,
    getCameraBounds,
    getSpriteBounds,
    worldBoundsOverlap,
} from '../../engine';
import Game from '../Game';
import HighlightComponent from '../components/HighlightComponent';
import ShadowComponent from '../components/ShadowComponent';
import SpriteComponent from '../components/SpriteComponent';
import TransformComponent from '../components/TransformComponent';

export default class RenderSystem extends System {
    private renderQueue: {
        sprite: SpriteComponent;
        transform: TransformComponent;
        shadow?: ShadowComponent;
        highlight?: HighlightComponent;
    }[] = [];

    constructor() {
        super();
        this.requireComponent(SpriteComponent);
        this.requireComponent(TransformComponent);
    }

    update(ctx: CanvasRenderingContext2D, assetStore: AssetStore, camera: Camera, isEditor = false) {
        const cameraBounds = getCameraBounds(camera);
        const mapBounds: WorldBounds = { left: 0, right: Game.mapWidth, bottom: 0, top: Game.mapHeight };

        for (const entity of this.getSystemEntities()) {
            const sprite = entity.getComponent(SpriteComponent);
            const transform = entity.getComponent(TransformComponent);

            if (!sprite || !transform) {
                throw new Error('Could not find some component(s) of entity with id ' + entity.getId());
            }

            const spriteBounds = getSpriteBounds(
                transform.position,
                { width: sprite.width, height: sprite.height },
                transform.scale,
            );

            // Fixed entities are screen-space and are rendered independently of world culling.
            if (
                !transform.isFixed &&
                (!worldBoundsOverlap(spriteBounds, cameraBounds) ||
                    (!isEditor && !worldBoundsOverlap(spriteBounds, mapBounds)))
            ) {
                continue;
            }

            const shadow = entity.hasComponent(ShadowComponent) ? entity.getComponent(ShadowComponent) : undefined;
            const highlight = entity.hasComponent(HighlightComponent)
                ? entity.getComponent(HighlightComponent)
                : undefined;

            this.renderQueue.push({ sprite, transform, shadow, highlight });
        }

        this.renderQueue.sort((entityA, entityB) => {
            if (entityA.sprite.zIndex === entityB.sprite.zIndex) {
                // Draw lower entities last so they appear in front in a top-down Y-up world.
                return entityB.transform.position.y - entityA.transform.position.y;
            }

            return entityA.sprite.zIndex - entityB.sprite.zIndex;
        });

        for (const entity of this.renderQueue) {
            this.drawEntity(ctx, assetStore, entity);
        }

        this.renderQueue.length = 0;
    }

    private drawEntity(
        ctx: CanvasRenderingContext2D,
        assetStore: AssetStore,
        entity: {
            sprite: SpriteComponent;
            transform: TransformComponent;
            shadow?: ShadowComponent;
            highlight?: HighlightComponent;
        },
    ) {
        const { sprite, transform, shadow, highlight } = entity;
        const width = sprite.width * transform.scale.x;
        const height = sprite.height * transform.scale.y;

        if (shadow) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
            ctx.beginPath();
            ctx.ellipse(
                transform.position.x + shadow.offsetX,
                // Shadows are anchored at the sprite's bottom edge
                transform.position.y - height / 2 + shadow.offsetY,
                shadow.width / 2,
                shadow.height / 2,
                0,
                0,
                2 * Math.PI,
            );
            ctx.fill();
        }

        if (highlight?.isHighlighted) {
            ctx.strokeStyle = 'rgb(255, 0, 0)';
            ctx.beginPath();
            ctx.ellipse(
                transform.position.x + highlight.offsetX,
                // Highlights are anchored at the sprite's bottom edge
                transform.position.y - height / 2 + highlight.offsetY,
                highlight.width / 2,
                highlight.height / 2,
                0,
                0,
                2 * Math.PI,
            );
            ctx.stroke();
        }

        ctx.save();

        if (transform.isFixed) {
            // Fixed transforms use screen coordinates and must not inherit the world transform.
            ctx.setTransform(1, 0, 0, 1, 0, 0);
        }

        ctx.translate(transform.position.x, transform.position.y);

        if (transform.rotation) {
            ctx.rotate((transform.rotation * Math.PI) / 180);
        }

        // The world pass flips Y; counter-flip bitmap pixels so sprites remain upright.
        ctx.scale(1, -1);

        switch (sprite.flip) {
            case Flip.HORIZONTAL:
                ctx.scale(-1, 1);
                break;
            case Flip.VERTICAL:
                ctx.scale(1, -1);
                break;
            case Flip.NONE:
                break;
        }

        if (sprite.transparency !== 1) {
            ctx.globalAlpha = sprite.transparency;
        }

        ctx.drawImage(
            assetStore.getTexture(sprite.assetId),
            sprite.width * sprite.column,
            sprite.height * sprite.row,
            sprite.width,
            sprite.height,
            -width / 2,
            -height / 2,
            width,
            height,
        );
        ctx.restore();
    }
}
