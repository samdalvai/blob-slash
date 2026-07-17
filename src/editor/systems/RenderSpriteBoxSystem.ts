import {
    Camera,
    DEFAULT_SPRITE,
    Engine,
    getCameraBounds,
    getSpriteBounds,
    System,
    WorldBounds,
    worldBoundsOverlap,
} from '../../engine';
import SpriteComponent from '../../game/components/SpriteComponent';
import TransformComponent from '../../game/components/TransformComponent';
import Editor from '../Editor';

type RenderableEntity = {
    entityId: number;
    sprite: SpriteComponent;
    transform: TransformComponent;
};

const getSelectionBounds = (): WorldBounds | null => {
    if (!Editor.multipleSelectStart) {
        return null;
    }

    return {
        left: Math.min(Editor.multipleSelectStart.x, Editor.mousePositionWorld.x),
        right: Math.max(Editor.multipleSelectStart.x, Editor.mousePositionWorld.x),
        bottom: Math.min(Editor.multipleSelectStart.y, Editor.mousePositionWorld.y),
        top: Math.max(Editor.multipleSelectStart.y, Editor.mousePositionWorld.y),
    };
};

export default class RenderSpriteBoxSystem extends System {
    constructor() {
        super();
        this.requireComponent(TransformComponent);
    }

    update(ctx: CanvasRenderingContext2D, camera: Camera, zoom: number) {
        const cameraBounds = getCameraBounds(camera);
        const selectionBounds = getSelectionBounds();
        const renderableEntities: RenderableEntity[] = [];

        for (const entity of this.getSystemEntities()) {
            const transform = entity.getComponent(TransformComponent);
            if (!transform) {
                throw new Error('Could not find transform component of entity with id ' + entity.getId());
            }

            const sprite = entity.hasComponent(SpriteComponent)
                ? entity.getComponent(SpriteComponent)
                : new SpriteComponent(DEFAULT_SPRITE, 32, 32, 0);
            if (!sprite) {
                throw new Error('Could not find sprite component of entity with id ' + entity.getId());
            }

            renderableEntities.push({ entityId: entity.getId(), sprite, transform });
        }

        renderableEntities.sort((a, b) => {
            if (a.sprite.zIndex === b.sprite.zIndex) {
                return b.transform.position.y - a.transform.position.y;
            }
            return a.sprite.zIndex - b.sprite.zIndex;
        });

        let spriteBoxHighlighted = false;
        for (let i = renderableEntities.length - 1; i >= 0; i--) {
            const { entityId, sprite, transform } = renderableEntities[i];
            const bounds = getSpriteBounds(
                transform.position,
                { width: sprite.width, height: sprite.height },
                transform.scale,
            );
            if (!worldBoundsOverlap(bounds, cameraBounds)) {
                continue;
            }

            const isSelected = Editor.selectedEntities.some(entity => entity.getId() === entityId);
            if (isSelected) {
                this.drawBounds(ctx, bounds, 'green', 4 / zoom);
            }

            if (Editor.entityDragStart !== null) {
                continue;
            }

            const isPointerInside =
                Engine.mousePositionWorld.x >= bounds.left &&
                Engine.mousePositionWorld.x <= bounds.right &&
                Engine.mousePositionWorld.y >= bounds.bottom &&
                Engine.mousePositionWorld.y <= bounds.top;
            const isMarqueeSelected = selectionBounds !== null && worldBoundsOverlap(selectionBounds, bounds);

            if ((isPointerInside || isMarqueeSelected) && !spriteBoxHighlighted) {
                this.drawBounds(ctx, bounds, 'orange', 2 / zoom);
                spriteBoxHighlighted = true;
            }
        }
    }

    private drawBounds(ctx: CanvasRenderingContext2D, bounds: WorldBounds, color: string, lineWidth: number) {
        ctx.save();
        ctx.strokeStyle = color;
        ctx.lineWidth = lineWidth;
        ctx.strokeRect(bounds.left, bounds.bottom, bounds.right - bounds.left, bounds.top - bounds.bottom);
        ctx.restore();
    }
}
