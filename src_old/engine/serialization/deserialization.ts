import Component, { ComponentClass } from '../ecs/Component';
import { ComponentCatalog } from '../ecs/ComponentCatalog';
import Entity from '../ecs/Entity';
import Registry from '../ecs/Registry';
import { EntityMap } from '../types/map';

export const deserializeEntity = (
    entityMap: EntityMap,
    registry: Registry,
    componentCatalog: ComponentCatalog,
): Entity => {
    const entity = registry.createEntity();

    // TODO: this logic fails on prod environments where code is minified/obfuscated
    // to test this locally run: npx parcel build game.html && mv dist/game.html dist/index.html && npx serve dist
    // current fix for prod is to add the flag --no-optimize to the build command
    // npx parcel build game.html --no-optimize && mv dist/game.html dist/index.html && npx serve dist
    // TODO: Check if this comment is still relevant
    for (const component of entityMap.components) {
        const componentDefinition = componentCatalog.get(component.name);

        if (!componentDefinition) {
            throw new Error(`Could not find component definition for ${component.name}`);
        }

        const ComponentClass = componentDefinition.constructor;
        const parameterValues =
            componentDefinition.deserialize?.(component.properties) ??
            getComponentConstructorParamNames(ComponentClass).map(param => component.properties[param]);

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

export const deserializeEntities = (
    entities: EntityMap[],
    registry: Registry,
    componentCatalog: ComponentCatalog,
): Entity[] => {
    const entitiesList: Entity[] = [];

    for (const entity of entities) {
        entitiesList.push(deserializeEntity(entity, registry, componentCatalog));
    }

    return entitiesList;
};

export const parseConstructorString = (componentString: string): string => {
    const indexOfConstructor = componentString.indexOf('constructor');

    if (indexOfConstructor === -1) {
        throw new Error(`'Error, no constructor defined for component ${componentString}`);
    }

    const afterConstructor = componentString.substring(indexOfConstructor + 'constructor'.length);
    let openParenthesis = 0;

    for (let i = 0; i < afterConstructor.length; i++) {
        const char = afterConstructor[i];

        if (char === '(') {
            openParenthesis++;
        }

        if (char === ')') {
            openParenthesis--;

            if (openParenthesis === 0) {
                return afterConstructor.substring(1, i);
            }
        }
    }

    throw new Error(`'Error, could not parse constructor for component ${componentString}`);
};

export const parseConstructorParameters = (constructorStr: string): string[] => {
    const paramNames = constructorStr
        .replace(/= (true|false)/g, '') // Removes "= true" or "= false"
        .replace('= []', '') // Removes literal "= []"
        .replace(/\([^)]*\)/g, '') // Removes anything inside parentheses (e.g., function params or groupings)
        .replace(/\{([\s\S]*?)\}/g, '') // Removes content inside curly braces (non-greedy)
        .replace(/'(.*?)'/g, '') // Removes anything inside single quotes, including the quotes
        .replace(/"(.*?)"/g, '') // Removes anything inside double quotes, including the quotes
        .replace(/= [^,]+/g, '') // Removes default values (e.g., "= 5", "= 'abc'") until `,`
        .replace(/[()=,]/g, '') // Removes parentheses, equal signs, and commas
        .split(' ')
        .filter(param => param !== '')
        .filter(param => !isNumeric(param));

    return paramNames;
};

export const getComponentConstructorParamNames = <T extends Component>(component: ComponentClass<T>): string[] => {
    const componentString = component.toString();
    const constructorString = parseConstructorString(componentString);
    return parseConstructorParameters(constructorString);
};

export const cloneComponentProperty = (property: any) => {
    if (Array.isArray(property)) {
        return [...property];
    }

    if (property !== null && typeof property === 'object') {
        return { ...property };
    }

    return property;
};

const isNumeric = (str: string) => {
    return !isNaN(parseFloat(str));
};
