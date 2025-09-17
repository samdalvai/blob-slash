import System from '../../engine/ecs/System';
import { Rectangle } from '../../engine/types/utils';
import { DEFAULT_SPRITE } from '../../engine/utils/constants';
import { ParticleComponent } from '../../game/components';
import SpriteComponent from '../../game/components/SpriteComponent';
import TransformComponent from '../../game/components/TransformComponent';

export default class RenderInvisibleEntitiesSystem extends System {
    constructor() {
        super();
        this.requireComponent(TransformComponent);
    }

    update(ctx: CanvasRenderingContext2D, camera: Rectangle, zoom: number) {
        const renderableEntities: {
            entityId: number;
            sprite: SpriteComponent;
            transform: TransformComponent;
            hasSprite: boolean;
        }[] = [];

        for (const entity of this.getSystemEntities()) {
            if (entity.hasComponent(ParticleComponent)) {
                continue;
            }

            const transform = entity.getComponent(TransformComponent);

            if (!transform) {
                throw new Error('Could not find some component(s) of entity with id ' + entity.getId());
            }

            if (entity.hasComponent(SpriteComponent)) {
                const sprite = entity.getComponent(SpriteComponent);
                if (!sprite) {
                    throw new Error('Could not find some component(s) of entity with id ' + entity.getId());
                }

                renderableEntities.push({ entityId: entity.getId(), sprite, transform, hasSprite: true });
                continue;
            }

            const mockSprite = new SpriteComponent(DEFAULT_SPRITE, 32, 32, 0);
            renderableEntities.push({ entityId: entity.getId(), sprite: mockSprite, transform, hasSprite: false });
        }

        renderableEntities.sort((entityA, entityB) => {
            if (entityA.sprite.zIndex === entityB.sprite.zIndex) {
                return entityA.transform.position.y - entityB.transform.position.y;
            }

            return entityA.sprite.zIndex - entityB.sprite.zIndex;
        });

        for (let i = 0; i < renderableEntities.length; i++) {
            if (renderableEntities[i].hasSprite) {
                continue;
            }

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

            ctx.save();
            ctx.strokeStyle = 'darkgray';
            ctx.lineWidth = 2;
            ctx.strokeRect(spriteRect.x, spriteRect.y, spriteRect.width, spriteRect.height);
            ctx.restore();
        }
    }
}
