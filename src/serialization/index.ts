import TransformComponent from '../components/TransformComponent';
import Entity from '../ecs/Entity';
import { ComponentType } from '../types/components';
import { EntityMap } from '../types/map';

export const serializeEntity = (entity: Entity): EntityMap => {
    const components: ComponentType[] = [];

    if (entity.hasComponent(TransformComponent)) {
        const transform = entity.getComponent(TransformComponent);

        if (!transform) {
            throw new Error('Could not find some transform component of entity with id ' + entity.getId());
        }

        components.push({
            name: 'transform',
            properties: {
                position: transform.position,
                scale: transform.scale,
                rotation: transform.rotation,
            },
        });
    }

    return {
        components: components,
    };
};
