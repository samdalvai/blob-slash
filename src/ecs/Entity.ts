import Component, { ComponentClass } from './Component';
import Registry from './Registry';
import System, { SystemClass } from './System';

export default class Entity {
    private id: number;
    registry: Registry;
    toBeKilled: boolean;

    constructor(id: number, registry: Registry) {
        this.id = id;
        this.registry = registry;
        this.toBeKilled = false;
    }

    getId = () => {
        return this.id;
    };

    kill = () => {
        this.registry.killEntity(this);
    };

    tag = (tag: string) => {
        this.registry.tagEntity(this, tag);
    };

    getTag = () => {
        return this.registry.getEntityTag(this);
    };

    hasTag = (tag: string) => {
        return this.registry.entityHasTag(this, tag);
    };

    group = (group: string) => {
        this.registry.groupEntity(this, group);
    };

    getGroup = () => {
        return this.registry.getEntityGroup(this);
    };

    belongsToGroup = (group: string) => {
        return this.registry.entityBelongsToGroup(this, group);
    };

    addComponent = <T extends Component>(
        ComponentClass: ComponentClass<T>,
        ...args: ConstructorParameters<{ new (...args: any[]): T }>
    ): void => {
        this.registry.addComponent<T>(this, ComponentClass, ...args);
    };

    removeComponent = <T extends Component>(ComponentClass: ComponentClass<T>): void => {
        this.registry.removeComponent<T>(this, ComponentClass);
    };

    hasComponent = <T extends Component>(ComponentClass: ComponentClass<T>): boolean => {
        return this.registry.hasComponent<T>(this, ComponentClass);
    };

    getComponent = <T extends Component>(ComponentClass: ComponentClass<T>): T | undefined => {
        return this.registry.getComponent<T>(this, ComponentClass);
    };

    getAllComponents = <T extends Component>(): T[] => {
        return this.registry.getAllEntityComponents(this);
    };

    addToSystem = <T extends System>(SystemClass: SystemClass<T>) => {
        this.registry.addEntityToSystem(this, SystemClass);
    };

    removeFromSystem = <T extends System>(SystemClass: SystemClass<T>) => {
        this.registry.removeEntityFromSystem(this, SystemClass);
    };
}
