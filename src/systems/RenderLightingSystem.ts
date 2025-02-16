import ParticleComponent from '../components/ParticleComponent';
import TransformComponent from '../components/TransformComponent';
import System from '../ecs/System';
import { Rectangle } from '../types';

export default class RenderLightingSystem extends System {
    constructor() {
        super();
    }

    update(ctx: CanvasRenderingContext2D, camera: Rectangle) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)'; // Semi-transparent black
        ctx.fillRect(0, 0, camera.width, camera.height);

        // Use destination-out to create a transparent circle (visibility area)
        ctx.globalCompositeOperation = 'destination-out';
        ctx.fillStyle = 'rgba(255, 255, 255, 1.0)';
        ctx.beginPath();
        ctx.arc(200, 150, 50, 0, Math.PI * 2); // Circle at (200, 150) with radius 50
        ctx.fill();

        // Reset the composite operation to default
        ctx.globalCompositeOperation = 'source-over';
    }
}
