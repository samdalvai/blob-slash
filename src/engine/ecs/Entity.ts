import Component, { ComponentClass } from './Component';
import { ComponentCatalog } from './ComponentCatalog';
import Registry from './Registry';
import System, { SystemClass } from './System';

export default class Entity {
    private id: number;
    private _registry: Registry;
    private _toBeKilled: boolean;

    constructor(id: number, registry: Registry) {
        this.id = id;
        this._registry = registry;
        this._toBeKilled = false;
    }

    getId() {
        return this.id;
    }

    get registry() {
        return this._registry;
    }

    getRegistry() {
        return this._registry;
    }

    get toBeKilled() {
        return this._toBeKilled;
    }

    isPendingKill() {
        return this._toBeKilled;
    }

    markAsKilled() {
        this._toBeKilled = true;
    }

    kill() {
        this._registry.killEntity(this);
    }

    duplicate(componentCatalog: ComponentCatalog) {
        return this._registry.duplicateEntity(this, componentCatalog);
    }

    tag(tag: string) {
        this._registry.tagEntity(this, tag);
    }

    getTag() {
        return this._registry.getEntityTag(this);
    }

    hasTag(tag: string) {
        return this._registry.entityHasTag(this, tag);
    }

    removeTag() {
        this._registry.removeEntityTag(this);
    }

    group(group: string) {
        this._registry.groupEntity(this, group);
    }

    getGroup() {
        return this._registry.getEntityGroup(this);
    }

    belongsToGroup(group: string) {
        return this._registry.entityBelongsToGroup(this, group);
    }

    removeGroup() {
        this._registry.removeEntityGroup(this);
    }

    addComponent<T extends ComponentClass>(
        ComponentClass: T,
        ...args: ConstructorParameters<T>
    ): void {
        this._registry.addComponent(this, ComponentClass, ...args);
    }

    // TODO: removing a component from an entity requires explicitely removing it 
    // also from related system, find a way to do it automatically and in an efficient way
    removeComponent<T extends ComponentClass>(ComponentClass: T): void {
        this._registry.removeComponent(this, ComponentClass);
    }

    hasComponent<T extends ComponentClass>(ComponentClass: T): boolean {
        return this._registry.hasComponent(this, ComponentClass);
    }

    getComponent<T extends ComponentClass>(ComponentClass: T): InstanceType<T> | undefined {
        return this._registry.getComponent(this, ComponentClass);
    }

    getComponents<T extends Component>(): T[] {
        return this._registry.getAllEntityComponents(this);
    }

    addToSystem<T extends System>(SystemClass: SystemClass<T>) {
        this._registry.addEntityToSystem(this, SystemClass);
    }

    removeFromSystem<T extends System>(SystemClass: SystemClass<T>) {
        this._registry.removeEntityFromSystem(this, SystemClass);
    }
}
