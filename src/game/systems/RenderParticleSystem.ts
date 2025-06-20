import ParticleComponent from '../components/ParticleComponent';
import TransformComponent from '../components/TransformComponent';
import System from '../../engine/ecs/System';
import { Rectangle } from '../../engine/types/utils';

export default class RenderParticleSystem extends System {
    constructor() {
        super();
        this.requireComponent(ParticleComponent);
        this.requireComponent(TransformComponent);
    }

    update(ctx: CanvasRenderingContext2D, camera: Rectangle) {
        for (const entity of this.getSystemEntities()) {
            const transform = entity.getComponent(TransformComponent);
            const particle = entity.getComponent(ParticleComponent);

            if (!particle || !transform) {
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

            const positionX = transform.position.x - camera.x;
            const positionY = transform.position.y - camera.y;

            ctx.fillStyle = particle.color;

            ctx.beginPath();
            ctx.fillRect(positionX, positionY, particle.dimension, particle.dimension);
        }
    }
}
