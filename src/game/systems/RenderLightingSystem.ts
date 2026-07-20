import { Camera, Engine, getCameraBounds, getSpriteBounds, System, worldBoundsOverlap, worldToScreen } from '../../engine';
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

    /** Lighting is composited in screen space after the world pass. */
    update(ctx: CanvasRenderingContext2D, camera: Camera, isEditor = false) {
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = camera.viewportWidth;
        tempCanvas.height = camera.viewportHeight;

        const tempCtx = tempCanvas.getContext('2d');
        if (!tempCtx) {
            return;
        }

        tempCtx.fillStyle = 'rgba(0,0,0,0.5)';
        tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
        tempCtx.globalCompositeOperation = 'destination-out';
        tempCtx.shadowColor = 'black';
        tempCtx.shadowBlur = 15;

        const cameraBounds = getCameraBounds(camera);
        const mapBounds = { left: 0, right: Engine.mapWidth, bottom: 0, top: Engine.mapHeight };

        for (const entity of this.getSystemEntities()) {
            const lightEmit = entity.getComponent(LightEmitComponent);
            const transform = entity.getComponent(TransformComponent);
            const sprite = entity.getComponent(SpriteComponent);

            if (!lightEmit || !transform || !sprite) {
                throw new Error('Could not find some component(s) of entity with id ' + entity.getId());
            }

            const spriteBounds = getSpriteBounds(
                transform.position,
                { width: sprite.width, height: sprite.height },
                transform.scale,
            );
            if (!worldBoundsOverlap(spriteBounds, cameraBounds) || (!isEditor && !worldBoundsOverlap(spriteBounds, mapBounds))) {
                continue;
            }

            const screenPosition = worldToScreen(transform.position, camera);
            tempCtx.beginPath();
            tempCtx.arc(screenPosition.x, screenPosition.y, lightEmit.lightRadius, 0, Math.PI * 2);
            tempCtx.fill();
        }

        ctx.drawImage(tempCanvas, 0, 0);
    }
}
