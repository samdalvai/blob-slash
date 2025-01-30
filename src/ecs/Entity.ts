import Component, { ComponentClass } from './Component';
import Registry from './Registry';

export default class Entity {
    private id: number;
    registry: Registry;

    constructor(id: number, registry: Registry) {
        this.id = id;
        this.registry = registry;
    }

    getId = () => {
        return this.id;
    };

    kill = () => {
        this.registry.killEntity(this);
    };

    tag(tag: string) {
        this.registry.tagEntity(this, tag);
    }

    hasTag(tag: string) {
        return this.registry.entityHasTag(this, tag);
    }

    group(group: string) {
        this.registry.groupEntity(this, group);
    }

    belongsToGroup(group: string) {
        return this.registry.entityBelongsToGroup(this, group);
    }

    addComponent<T extends Component>(
        ComponentClass: ComponentClass<T>,
        ...args: ConstructorParameters<{ new (...args: any[]): T }>
    ): void {
        this.registry.addComponent<T>(this, ComponentClass, ...args);
    }

    removeComponent<T extends Component>(ComponentClass: ComponentClass<T>): void {
        this.registry.removeComponent<T>(this, ComponentClass);
    }

    hasComponent<T extends Component>(ComponentClass: ComponentClass<T>): boolean {
        return this.registry.hasComponent<T>(this, ComponentClass);
    }

    getComponent<T extends Component>(ComponentClass: ComponentClass<T>): T | undefined {
        return this.registry.getComponent<T>(this, ComponentClass);
    }
}
