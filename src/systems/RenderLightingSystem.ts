import ParticleComponent from '../components/ParticleComponent';
import TransformComponent from '../components/TransformComponent';
import System from '../ecs/System';
import { Rectangle } from '../types';

export default class RenderLightingSystem extends System {
    constructor() {
        super();
    }

    update(ctx: CanvasRenderingContext2D, camera: Rectangle) {
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');

        if (!tempCtx) {
            return;
        }

        tempCtx.fillStyle = 'black';
        tempCtx.fillRect(0, 0, camera.width, camera.height);

        tempCtx.globalCompositeOperation = 'destination-out';

        // Draw the transparent circle
        tempCtx.beginPath();
        tempCtx.arc(200, 200, 100, 0, Math.PI * 2);
        tempCtx.fill();

        // Reset composite operation for further drawing
        tempCtx.globalCompositeOperation = 'source-over';

        const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
    }
}
