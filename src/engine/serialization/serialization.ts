import Entity from '../ecs/Entity';
import Registry from '../ecs/Registry';
import Game from '../../game/Game';
import { ComponentMap, EntityMap, LevelMap } from '../types/map';

export const serializeEntity = (entity: Entity): EntityMap => {
    const components: ComponentMap[] = [];

    const entityComponents = entity.getComponents();

    for (const component of entityComponents) {
        components.push({
            name: component.constructor.name.toLowerCase().replace('component', ''),
            properties: {
                ...component,
                ...('startTime' in component ? { startTime: 0 } : {}),
                ...('followedEntity' in component ? { followedEntity: null } : {}),
            },
        } as ComponentMap);
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
    const entitiesIds = registry.getAllEntitiesIds();
    const entities: Entity[] = [];

    for (let i = 0; i < entitiesIds.length; i++) {
        entities.push(new Entity(entitiesIds[i], registry));
    }

    return { mapWidth: Game.mapWidth, mapHeight: Game.mapHeight, entities: serializeEntities(entities) };
};
