import Engine from '../../engine/Engine';
import System from '../../engine/ecs/System';
import { Rectangle } from '../../engine/types/utils';
import LightEmitComponent from '../components/LightEmitComponent';
import SpriteComponent from '../components/SpriteComponent';
import TransformComponent from '../components/TransformComponent';

export default class RenderLightingSystem extends System {
    constructor() {
        super();
        this.requireComponent(LightEmitComponent);
        this.requireComponent(TransformComponent);
        this.requireComponent(SpriteComponent);
    }

    update(ctx: CanvasRenderingContext2D, camera: Rectangle, zoom = 1) {
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = camera.width * zoom;
        tempCanvas.height = camera.height * zoom;

        const tempCtx = tempCanvas.getContext('2d');

        if (!tempCtx) {
            return;
        }

        tempCtx.fillStyle = 'rgba(0,0,0,0.5)';
        tempCtx.fillRect(0, 0, camera.width * zoom, camera.height * zoom);

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

        const skillsMenuScale = 2.0;
        const skillsMenuWidth = 32 * 3;
        const skillsMenuHeight = 32;

        // Render light where we have the skills menu
        const padding = 25;
        tempCtx.fillRect(
            padding,
            Engine.windowHeight - 64 - padding,
            skillsMenuWidth * skillsMenuScale,
            skillsMenuHeight * skillsMenuScale,
        );

        const mouseMenuScale = 2.0;
        const mouseMenuWidth = 32 * 2;
        const mouseMenuHeight = 32;

        // Render light where we have the mouse menu
        tempCtx.fillRect(
            2 * padding + skillsMenuWidth * skillsMenuScale,
            Engine.windowHeight - 64 - padding,
            mouseMenuWidth * mouseMenuScale,
            mouseMenuHeight * mouseMenuScale,
        );

        tempCtx.globalCompositeOperation = 'source-over';
        ctx.drawImage(tempCanvas, 0, 0);
    }
}
