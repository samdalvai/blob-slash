import System from '../../engine/ecs/System';
import { Rectangle } from '../../engine/types/utils';
import Game from '../Game';
import ParticleComponent from '../components/ParticleComponent';
import TransformComponent from '../components/TransformComponent';

export default class RenderParticleSystem extends System {
    constructor() {
        super();
        this.requireComponent(ParticleComponent);
        this.requireComponent(TransformComponent);
    }

    update(ctx: CanvasRenderingContext2D, camera: Rectangle, zoom = 1, isEditor = false) {
        for (const entity of this.getSystemEntities()) {
            const transform = entity.getComponent(TransformComponent);
            const particle = entity.getComponent(ParticleComponent);

            if (!particle || !transform) {
                throw new Error('Could not find some component(s) of entity with id ' + entity.getId());
            }

            // Bypass rendering if entities are outside the camera view
            const isOutsideCameraView =
                transform.position.x + transform.scale.x * particle.dimension < camera.x ||
                transform.position.x > camera.x + camera.width ||
                transform.position.y + transform.scale.y * particle.dimension < camera.y ||
                transform.position.y > camera.y + camera.height;

            const isOutsideOfMap = !isEditor && (
                transform.position.x + transform.scale.x * particle.dimension < 0 ||
                transform.position.x > Game.mapWidth ||
                transform.position.y + transform.scale.y * particle.dimension < 0 ||
                transform.position.y > Game.mapHeight);

            if (isOutsideCameraView || isOutsideOfMap) {
                continue;
            }

            const positionX = (transform.position.x - camera.x) * zoom;
            const positionY = (transform.position.y - camera.y) * zoom;

            ctx.fillStyle = particle.color;

            ctx.beginPath();
            ctx.fillRect(positionX, positionY, particle.dimension * zoom, particle.dimension * zoom);
        }
    }
}
