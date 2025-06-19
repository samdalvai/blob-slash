import LightEmitComponent from '../components/LightEmitComponent';
import SpriteComponent from '../components/SpriteComponent';
import TransformComponent from '../components/TransformComponent';
import System from '../../core/ecs/System';
import { Rectangle } from '../../core/types/utils';

export default class RenderLightingSystem extends System {
    constructor() {
        super();
        this.requireComponent(LightEmitComponent);
        this.requireComponent(TransformComponent);
        this.requireComponent(SpriteComponent);
    }

    update(ctx: CanvasRenderingContext2D, camera: Rectangle, zoom = 1) {
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = camera.width;
        tempCanvas.height = camera.height;

        const tempCtx = tempCanvas.getContext('2d');

        if (!tempCtx) {
            return;
        }

        tempCtx.fillStyle = 'rgba(0,0,0,0.5)';
        tempCtx.fillRect(0, 0, camera.width, camera.height);

        tempCtx.globalCompositeOperation = 'destination-out';
        tempCtx.shadowColor = 'black';
        tempCtx.shadowBlur = 15;

        for (const entity of this.getSystemEntities()) {
            const lightEmit = entity.getComponent(LightEmitComponent);
            const transform = entity.getComponent(TransformComponent);
            const sprite = entity.getComponent(SpriteComponent);

            if (!lightEmit || !transform || !sprite) {
                throw new Error('Could not find some component(s) of entity with id ' + entity.getId());
            }

            tempCtx.beginPath();
            tempCtx.arc(
                (transform.position.x - camera.x + (sprite.width / 2) * transform.scale.x) * zoom,
                (transform.position.y - camera.y + (sprite.height / 2) * transform.scale.y) * zoom,
                lightEmit.lightRadius * zoom,
                0,
                Math.PI * 2,
            );
            tempCtx.fill();
        }

        // Render light where we have the skills menu
        // const padding = 25;
        // tempCtx.fillRect(padding, Game.windowHeight - 64 - padding, 192, 64);

        tempCtx.globalCompositeOperation = 'source-over';
        ctx.drawImage(tempCanvas, 0, 0);
    }
}
