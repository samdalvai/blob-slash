import ParticleEmitComponent from '../components/ParticleEmitComponent';
import TransformComponent from '../components/TransformComponent';
import System from '../../core/ecs/System';
import { Rectangle } from '../../core/types/utils';

export default class DebugParticleSourceSystem extends System {
    constructor() {
        super();
        this.requireComponent(ParticleEmitComponent);
        this.requireComponent(TransformComponent);
    }

    update(ctx: CanvasRenderingContext2D, camera: Rectangle) {
        for (const entity of this.getSystemEntities()) {
            const transform = entity.getComponent(TransformComponent);
            const particleEmit = entity.getComponent(ParticleEmitComponent);

            if (!transform || !particleEmit) {
                throw new Error('Could not find some component(s) of entity with id ' + entity.getId());
            }

            // Bypass rendering if entities are outside the camera view
            const isOutsideCameraView =
                transform.position.x + transform.scale.x < camera.x ||
                transform.position.x > camera.x + camera.width ||
                transform.position.y + transform.scale.y < camera.y ||
                transform.position.y > camera.y + camera.height;

            if (isOutsideCameraView) {
                continue;
            }

            const circleX = transform.position.x - camera.x + particleEmit.offsetX;
            const circleY = transform.position.y - camera.y + particleEmit.offsetY;

            ctx.beginPath();
            ctx.arc(circleX, circleY, particleEmit.emitRadius, 0, Math.PI * 2);
            ctx.strokeStyle = 'blue';
            ctx.stroke();
        }
    }
}
