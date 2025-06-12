import SpriteComponent from '../../components/SpriteComponent';
import TransformComponent from '../../components/TransformComponent';
import System from '../../ecs/System';
import Game from '../../game/Game';
import { Rectangle } from '../../types/utils';

export default class RenderSpriteBoxSystem extends System {
    constructor() {
        super();
        this.requireComponent(SpriteComponent);
        this.requireComponent(TransformComponent);
    }

    update(ctx: CanvasRenderingContext2D, camera: Rectangle, zoom: number) {
        for (const entity of this.getSystemEntities()) {
            const sprite = entity.getComponent(SpriteComponent);
            const transform = entity.getComponent(TransformComponent);

            if (!sprite || !transform) {
                throw new Error('Could not find some component(s) of entity with id ' + entity.getId());
            }

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

            if (
                Game.mousePositionWorld.x >= transform.position.x &&
                Game.mousePositionWorld.x <= transform.position.x + sprite.width * transform.scale.x &&
                Game.mousePositionWorld.y >= transform.position.y &&
                Game.mousePositionWorld.y <= transform.position.y + sprite.height * transform.scale.y
            ) {
                ctx.strokeStyle = 'white';
                ctx.lineWidth = 2;
                ctx.strokeRect(spriteRect.x, spriteRect.y, spriteRect.width, spriteRect.height);
            }
        }
    }
}
