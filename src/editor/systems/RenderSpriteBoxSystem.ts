import Engine from '../../engine/Engine';
import System from '../../engine/ecs/System';
import { Rectangle } from '../../engine/types/utils';
import { DEFAULT_SPRITE } from '../../engine/utils/constants';
import { rectanglesOverlap } from '../../engine/utils/rectangle';
import SpriteComponent from '../../game/components/SpriteComponent';
import TransformComponent from '../../game/components/TransformComponent';
import Editor from '../Editor';

export default class RenderSpriteBoxSystem extends System {
    constructor() {
        super();
        this.requireComponent(TransformComponent);
    }

    update(ctx: CanvasRenderingContext2D, camera: Rectangle, zoom: number) {
        const renderableEntities: {
            entityId: number;
            sprite: SpriteComponent;
            transform: TransformComponent;
        }[] = [];

        for (const entity of this.getSystemEntities()) {
            const transform = entity.getComponent(TransformComponent);

            if (!transform) {
                throw new Error('Could not find some component(s) of entity with id ' + entity.getId());
            }

            if (entity.hasComponent(SpriteComponent)) {
                const sprite = entity.getComponent(SpriteComponent);
                if (!sprite) {
                    throw new Error('Could not find some component(s) of entity with id ' + entity.getId());
                }

                renderableEntities.push({ entityId: entity.getId(), sprite, transform });
                continue;
            }

            const mockSprite = new SpriteComponent(DEFAULT_SPRITE, 32, 32, 0);
            renderableEntities.push({ entityId: entity.getId(), sprite: mockSprite, transform });
        }

        renderableEntities.sort((entityA, entityB) => {
            if (entityA.sprite.zIndex === entityB.sprite.zIndex) {
                return entityA.transform.position.y - entityB.transform.position.y;
            }

            return entityA.sprite.zIndex - entityB.sprite.zIndex;
        });

        let spriteBoxHighlighted = false;

        // Traverse entities backwards to highlight the ones in front
        for (let i = renderableEntities.length - 1; i >= 0; i--) {
            const sprite = renderableEntities[i].sprite;
            const transform = renderableEntities[i].transform;

            // Bypass rendering if entities are outside the camera view
            const isOutsideCameraView =
                transform.position.x + transform.scale.x * sprite.width < camera.x ||
                transform.position.x > camera.x + camera.width ||
                transform.position.y + transform.scale.y * sprite.height < camera.y ||
                transform.position.y > camera.y + camera.height;

            if (isOutsideCameraView) {
                continue;
            }

            const spriteRect: Rectangle = {
                x: (transform.position.x - camera.x) * zoom,
                y: (transform.position.y - camera.y) * zoom,
                width: sprite.width * transform.scale.x * zoom,
                height: sprite.height * transform.scale.y * zoom,
            };

            if (Editor.selectedEntities.length !== 0) {
                for (const entity of Editor.selectedEntities) {
                    if (entity.getId() === renderableEntities[i].entityId) {
                        ctx.save();
                        ctx.strokeStyle = 'green';
                        ctx.lineWidth = 4;
                        ctx.strokeRect(spriteRect.x, spriteRect.y, spriteRect.width, spriteRect.height);
                        ctx.restore();
                    }
                }
            }

            if (Editor.entityDragStart !== null) {
                continue;
            }

            if (
                Engine.mousePositionWorld.x >= transform.position.x &&
                Engine.mousePositionWorld.x <= transform.position.x + sprite.width * transform.scale.x &&
                Engine.mousePositionWorld.y >= transform.position.y &&
                Engine.mousePositionWorld.y <= transform.position.y + sprite.height * transform.scale.y &&
                !spriteBoxHighlighted &&
                !Editor.multipleSelectStart
            ) {
                ctx.save();
                ctx.strokeStyle = 'blue';
                ctx.lineWidth = 2;
                ctx.strokeRect(spriteRect.x, spriteRect.y, spriteRect.width, spriteRect.height);
                ctx.restore();
                spriteBoxHighlighted = true;
            }

            if (Editor.multipleSelectStart) {
                //console.log("checkign");
                const selectionXStart = (Editor.multipleSelectStart.x - camera.x) * zoom;
                const selectionYStart = (Editor.multipleSelectStart.y - camera.y) * zoom;
                const selectionXEnd = (Editor.mousePositionWorld.x - camera.x) * zoom;
                const selectionYEnd = (Editor.mousePositionWorld.y - camera.y) * zoom;

                const rectSelection: Rectangle = {
                    x: selectionXStart < selectionXEnd ? selectionXStart : selectionXEnd,
                    y: selectionYStart < selectionYEnd ? selectionYStart : selectionYEnd,
                    width: Math.abs(selectionXEnd - selectionXStart),
                    height: Math.abs(selectionYEnd - selectionYStart),
                };

                if (rectanglesOverlap(rectSelection, spriteRect)) {
                    ctx.save();
                    ctx.strokeStyle = 'blue';
                    ctx.lineWidth = 2;
                    ctx.strokeRect(spriteRect.x, spriteRect.y, spriteRect.width, spriteRect.height);
                    ctx.restore();
                    spriteBoxHighlighted = true;
                }
            }
        }
    }
}
