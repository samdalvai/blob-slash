import Entity from '../ecs/Entity';
import Registry from '../ecs/Registry';
import { ComponentType } from '../types/components';
import { EntityMap, LevelMap } from '../types/map';

export const serializeEntity = (entity: Entity): EntityMap => {
    const components: ComponentType[] = [];

    const entityComponents = entity.getAllComponents();

    for (const component of entityComponents) {
        components.push({
            name: component.constructor.name.toLowerCase().replace('component', ''),
            properties: {
                ...component,
                ...('startTime' in component ? { startTime: 0 } : {}),
                ...('followedEntity' in component ? { followedEntity: null } : {}),
            },
        } as ComponentType);
    }

    const tag = entity.getTag();
    const group = entity.getGroup();

    return {
        tag,
        group,
        components,
    };
};

export const serializeEntities = (entities: Entity[]): EntityMap[] => {
    const entitiesMap: EntityMap[] = [];

    for (const entity of entities) {
        entitiesMap.push(serializeEntity(entity));
    }

    return entitiesMap;
};

export const serializeLevel = (registry: Registry): LevelMap => {
    const entitiesIds = registry.numEntities;
    const entities: Entity[] = [];

    for (let i = 0; i < entitiesIds; i++) {
        if (registry.freeIds.includes(i)) {
            continue;
        }

        entities.push(new Entity(i, registry));
    }

    return { entities: serializeEntities(entities) };
};
