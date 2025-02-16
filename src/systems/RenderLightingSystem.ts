import ParticleComponent from '../components/ParticleComponent';
import TransformComponent from '../components/TransformComponent';
import System from '../ecs/System';
import { Rectangle } from '../types';

export default class RenderLightingSystem extends System {
    constructor() {
        super();
    }

    update(ctx: CanvasRenderingContext2D, camera: Rectangle) {
        ctx.fillStyle = 'black';
        ctx.fillRect(camera.x, camera.y, camera.width, camera.height);

        ctx.globalCompositeOperation = 'destination-out';

        // Draw the transparent circle
        ctx.beginPath();
        ctx.arc(200, 200, 100, 0, Math.PI * 2);
        ctx.fill();

        // Reset composite operation for further drawing
        ctx.globalCompositeOperation = 'source-over';
    }
}
