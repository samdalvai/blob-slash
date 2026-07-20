import { getCameraBounds, getSpriteBounds, System, WorldBounds, worldBoundsOverlap } from '../../engine';
import Game from '../Game';
import ParticleComponent from '../components/ParticleComponent';
import TransformComponent from '../components/TransformComponent';
import { Camera } from '../../engine';

export default class RenderParticleSystem extends System {
    constructor() {
        super();
        this.requireComponent(ParticleComponent);
        this.requireComponent(TransformComponent);
    }

    update(ctx: CanvasRenderingContext2D, camera: Camera, isEditor = false) {
        const cameraBounds = getCameraBounds(camera);
        const mapBounds: WorldBounds = { left: 0, right: Game.mapWidth, bottom: 0, top: Game.mapHeight };

        for (const entity of this.getSystemEntities()) {
            const transform = entity.getComponent(TransformComponent);
            const particle = entity.getComponent(ParticleComponent);

            if (!particle || !transform) {
                throw new Error('Could not find some component(s) of entity with id ' + entity.getId());
            }

            const bounds = getSpriteBounds(
                transform.position,
                { width: particle.dimension, height: particle.dimension },
                transform.scale,
            );

            if (!worldBoundsOverlap(bounds, cameraBounds) || (!isEditor && !worldBoundsOverlap(bounds, mapBounds))) {
                continue;
            }

            ctx.fillStyle = particle.color;
            ctx.fillRect(bounds.left, bounds.bottom, bounds.right - bounds.left, bounds.top - bounds.bottom);
        }
    }
}
