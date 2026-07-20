import { Camera, getCameraBounds, System, worldBoundsOverlap } from '../../engine';
import ParticleEmitComponent from '../components/ParticleEmitComponent';
import TransformComponent from '../components/TransformComponent';

export default class DebugParticleSourceSystem extends System {
    constructor() {
        super();
        this.requireComponent(ParticleEmitComponent);
        this.requireComponent(TransformComponent);
    }

    update(ctx: CanvasRenderingContext2D, camera: Camera) {
        const cameraBounds = getCameraBounds(camera);

        for (const entity of this.getSystemEntities()) {
            const transform = entity.getComponent(TransformComponent);
            const particleEmit = entity.getComponent(ParticleEmitComponent);

            if (!transform || !particleEmit) {
                throw new Error('Could not find some component(s) of entity with id ' + entity.getId());
            }

            const source = {
                x: transform.position.x + particleEmit.offsetX,
                y: transform.position.y + particleEmit.offsetY,
            };
            const sourceBounds = {
                left: source.x - particleEmit.emitRadius,
                right: source.x + particleEmit.emitRadius,
                bottom: source.y - particleEmit.emitRadius,
                top: source.y + particleEmit.emitRadius,
            };
            if (!worldBoundsOverlap(sourceBounds, cameraBounds)) {
                continue;
            }

            ctx.beginPath();
            ctx.arc(source.x, source.y, particleEmit.emitRadius, 0, Math.PI * 2);
            ctx.strokeStyle = 'blue';
            ctx.stroke();
        }
    }
}
