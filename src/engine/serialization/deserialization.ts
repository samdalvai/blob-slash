import * as GameComponents from '../../game/components';
import Component from '../ecs/Component';
import Entity from '../ecs/Entity';
import Registry from '../ecs/Registry';
import { EntityMap } from '../types/map';

export const deserializeEntity = (entityMap: EntityMap, registry: Registry): Entity => {
    const entity = registry.createEntity();

    for (const component of entityMap.components) {
        const ComponentClass = GameComponents[component.name as keyof typeof GameComponents];
        const parameters = getComponentConstructorParamNames(ComponentClass);
        const parameterValues = [];

        for (const param of parameters) {
            parameterValues.push(component.properties[param as keyof Component]);
        }

        entity.addComponent(ComponentClass, ...parameterValues);
    }

    if (entityMap.tag) {
        entity.tag(entityMap.tag);
    }

    if (entityMap.group) {
        entity.group(entityMap.group);
    }

    return entity;
};

export const deserializeEntities = (entities: EntityMap[], registry: Registry): Entity[] => {
    const entitiesList: Entity[] = [];

    for (const entity of entities) {
        entitiesList.push(deserializeEntity(entity, registry));
    }

    return entitiesList;
};

export const getComponentConstructorParamNames = <T extends Component>(component: T): string[] => {
    const constructorStr = component.toString();
    const constructorMatch = constructorStr.match(/constructor\(([\s\S]*?)\)/g);

    if (!constructorMatch || !constructorMatch[0]) {
        throw new Error(`'Error, could not parse constructor for component class ${component}`);
    }

    const paramNames = constructorMatch[0]
        .replace('constructor', '')
        .replace('= false', '')
        .replace('= true', '')
        .replace(/\{([\s\S]*?)\}/g, '')
        .replace(/'(.*?)'/g, '')
        .replace(/"(.*?)"/g, '')
        .replace(/[()=,]/g, ' ')
        .split(' ')
        .filter(param => param !== '')
        .filter(param => !isNumeric(param));

    return paramNames;
};

const isNumeric = (str: string) => {
    return !isNaN(parseFloat(str));
};
