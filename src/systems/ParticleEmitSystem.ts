import LifetimeComponent from '../components/LifetimeComponent';
import ParticleComponent from '../components/ParticleComponent';
import ParticleEmitComponent from '../components/ParticleEmitComponent';
import TransformComponent from '../components/TransformComponent';
import System from '../ecs/System';
import { Vector } from '../types';

export default class ParticleEmitSystem extends System {
    constructor() {
        super();
        this.requireComponent(ParticleEmitComponent);
        this.requireComponent(TransformComponent);
    }

    update() {
        for (const entity of this.getSystemEntities()) {
            const particleEmit = entity.getComponent(ParticleEmitComponent);
            const transform = entity.getComponent(TransformComponent);

            if (!particleEmit || !transform) {
                throw new Error('Could not find some component(s) of entity with id ' + entity.getId());
            }

            const particlePosition = this.getRandomPointInCircle(
                transform.position.x + particleEmit.offsetX,
                transform.position.y + particleEmit.offsetY,
                particleEmit.emitRadius,
            );

            if (performance.now() - particleEmit.lastEmission < particleEmit.emitFrequency) {
                continue;
            }

            const particle = entity.registry.createEntity();
            particle.addComponent(ParticleComponent, particleEmit.dimension, particleEmit.color);
            particle.addComponent(TransformComponent, particlePosition);
            particle.addComponent(LifetimeComponent, particleEmit.duration);

            particleEmit.lastEmission = performance.now();
        }
    }

    private getRandomPointInCircle = (cx: number, cy: number, r: number): Vector => {
        const angle = Math.random() * 2 * Math.PI;
        const radius = Math.sqrt(Math.random()) * r;

        const x = cx + radius * Math.cos(angle);
        const y = cy + radius * Math.sin(angle);

        return { x, y };
    };
}
