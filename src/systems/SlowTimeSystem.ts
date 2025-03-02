import RigidBodyComponent from '../components/RigidBodyComponent';
import TransformComponent from '../components/TransformComponent';
import Registry from '../ecs/Registry';
import System from '../ecs/System';
import { Vector } from '../types';

export default class SlowTimeSystem extends System {
    previousEntitiesVelocity: Map<number, Vector>;

    constructor() {
        super();
        this.requireComponent(RigidBodyComponent);
        this.requireComponent(TransformComponent);

        this.previousEntitiesVelocity = new Map();
    }

    update(registry: Registry) {
        const slowTimeEntities = registry.getEntitiesByGroup('slow-time');

        if (slowTimeEntities.length === 0) {
            return;
        }

        for (const entity of this.getSystemEntities()) {
            const rigidBody = entity.getComponent(RigidBodyComponent);
            const transform = entity.getComponent(TransformComponent);

            if (!rigidBody || !transform) {
                throw new Error('Could not find some component(s) of entity with id ' + entity.getId());
            }

            
        }
    }
}
