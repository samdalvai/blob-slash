import ParticleComponent from '../components/ParticleComponent';
import TransformComponent from '../components/TransformComponent';
import System from '../ecs/System';

export default class ParticleEmitSystem extends System {
    constructor() {
        super();
        this.requireComponent(ParticleComponent);
        this.requireComponent(TransformComponent);
    }

    update() {
        for (const entity of this.getSystemEntities()) {
            const particleEmit = entity.getComponent(ParticleComponent);
            const transform = entity.getComponent(TransformComponent);

            if (!particleEmit || !transform) {
                throw new Error('Could not find some component(s) of entity with id ' + entity.getId());
            }
        }
    }
}
