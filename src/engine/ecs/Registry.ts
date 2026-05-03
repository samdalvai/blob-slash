import { cloneComponentProperty, getComponentConstructorParamNames } from '../serialization/deserialization';
import Component, { ComponentClass } from './Component';
import { ComponentCatalog } from './ComponentCatalog';
import Entity from './Entity';
import Pool, { IPool } from './Pool';
import Signature from './Signature';
import System, { SystemClass } from './System';

export default class Registry {
    private _numEntities: number;
    private _entities: Map<number, Entity>;

    // [Array index = component type id] - [Pool index = entity id]
    private _componentPools: IPool[];

    // [Array index = entity id]
    private _entityComponentSignatures: Signature[];

    // [Map key = system type id]
    private _systems: Map<number, System>;

    private _entitiesToBeAdded: Entity[];
    private _entitiesToBeKilled: Entity[];

    // Entity tags (one tag name per entity)
    private _entityPerTag: Map<string, Entity>;
    private _tagPerEntity: Map<number, string>;

    // Entity groups (a set of entities per group name)
    private _entitiesPerGroup: Map<string, Set<Entity>>;
    private _groupPerEntity: Map<number, string>;

    private _freeIds: number[];

    constructor() {
        this._numEntities = 0;
        this._entities = new Map();
        this._componentPools = [];
        this._entityComponentSignatures = [];
        this._systems = new Map();
        this._entitiesToBeAdded = [];
        this._entitiesToBeKilled = [];
        this._entityPerTag = new Map();
        this._tagPerEntity = new Map();
        this._entitiesPerGroup = new Map();
        this._groupPerEntity = new Map();
        this._freeIds = [];
    }

    get numEntities() {
        return this._numEntities;
    }

    get entities(): ReadonlyMap<number, Entity> {
        return this._entities;
    }

    get componentPools(): readonly IPool[] {
        return this._componentPools;
    }

    get entityComponentSignatures(): readonly Signature[] {
        return this._entityComponentSignatures;
    }

    get systems(): ReadonlyMap<number, System> {
        return this._systems;
    }

    get entitiesToBeAdded(): readonly Entity[] {
        return this._entitiesToBeAdded;
    }

    get entitiesToBeKilled(): readonly Entity[] {
        return this._entitiesToBeKilled;
    }

    get entityPerTag(): ReadonlyMap<string, Entity> {
        return this._entityPerTag;
    }

    get tagPerEntity(): ReadonlyMap<number, string> {
        return this._tagPerEntity;
    }

    get entitiesPerGroup(): ReadonlyMap<string, ReadonlySet<Entity>> {
        return this._entitiesPerGroup;
    }

    get groupPerEntity(): ReadonlyMap<number, string> {
        return this._groupPerEntity;
    }

    get freeIds(): readonly number[] {
        return this._freeIds;
    }

    entityCount() {
        return this._entities.size;
    }

    getAllocatedEntityCount() {
        return this._numEntities;
    }

    getPendingEntityCount() {
        return this._entitiesToBeAdded.length + this._entitiesToBeKilled.length;
    }

    getPendingEntityAddCount() {
        return this._entitiesToBeAdded.length;
    }

    getPendingEntityKillCount() {
        return this._entitiesToBeKilled.length;
    }

    getReusableEntityIdCount() {
        return this._freeIds.length;
    }

    getComponentPool<T extends ComponentClass>(ComponentClass: T): Pool<InstanceType<T>> | undefined {
        return this._componentPools[ComponentClass.getComponentId()] as Pool<InstanceType<T>> | undefined;
    }

    getComponentPoolCount() {
        return this._componentPools.length;
    }

    getEntitySignature(entity: Entity) {
        return this._entityComponentSignatures[entity.getId()]?.signature ?? 0;
    }

    getEntitySignatureCount() {
        return this._entityComponentSignatures.length;
    }

    getSystemCount() {
        return this._systems.size;
    }

    getSystemEntities<T extends System>(SystemClass: SystemClass<T>): readonly Entity[] {
        return this.getSystem(SystemClass)?.getSystemEntities() ?? [];
    }

    getTagCount() {
        return this._entityPerTag.size;
    }

    getTaggedEntityCount() {
        return this._tagPerEntity.size;
    }

    getGroupCount() {
        return this._entitiesPerGroup.size;
    }

    getGroupedEntityCount() {
        return this._groupPerEntity.size;
    }

    update<T extends Component>() {
        for (const entity of this._entitiesToBeAdded) {
            this.addEntityToSystems(entity);
        }

        this._entitiesToBeAdded = [];

        for (const entity of this._entitiesToBeKilled) {
            this.removeEntityFromSystems(entity);
            this._entityComponentSignatures[entity.getId()].reset();

            for (let i = 0; i < this._componentPools.length; i++) {
                const pool = this._componentPools[i] as Pool<T>;
                if (pool) {
                    pool.removeEntityFromPool(entity.getId());
                }
            }

            this._freeIds.push(entity.getId());

            if (this._tagPerEntity.get(entity.getId()) !== undefined) {
                this.removeEntityTag(entity);
            }

            if (this._groupPerEntity.get(entity.getId()) !== undefined) {
                this.removeEntityGroup(entity);
            }

            this._entities.delete(entity.getId());
        }

        this._entitiesToBeKilled = [];
    }

    ////////////////////////////////////////////////////////////////////////////////
    // Entity management
    ////////////////////////////////////////////////////////////////////////////////

    createEntity(): Entity {
        let entityId;

        if (this._freeIds.length === 0) {
            entityId = this._numEntities++;
            if (entityId >= this._entityComponentSignatures.length) {
                this._entityComponentSignatures[entityId] = new Signature();
            }
        } else {
            entityId = this._freeIds.pop() as number;
        }

        const entity = new Entity(entityId, this);
        this._entitiesToBeAdded.push(entity);
        this._entities.set(entity.getId(), entity);

        return entity;
    }

    killEntity(entity: Entity) {
        if (entity.isPendingKill()) {
            console.log(`Entity ${entity.getId()} already scheduled for killing, skipping`);
            return;
        }

        entity.markAsKilled();
        this._entitiesToBeKilled.push(entity);
    }

    duplicateEntity(entity: Entity, componentCatalog: ComponentCatalog) {
        const entityCopy = this.createEntity();
        const originalEntityComponents = entity.getComponents();

        for (const component of originalEntityComponents) {
            const componentDefinition = componentCatalog.getByConstructor(component);

            if (!componentDefinition) {
                throw new Error(`Could not find component definition for ${component.constructor.name}`);
            }

            const ComponentClass = componentDefinition.constructor;
            const parameterValues =
                componentDefinition.clone?.(component) ??
                getComponentConstructorParamNames(ComponentClass).map(param =>
                    cloneComponentProperty(component[param as keyof Component]),
                );

            entityCopy.addComponent(ComponentClass, ...parameterValues);
        }

        const group = entity.getGroup();
        if (group !== undefined) {
            entityCopy.group(group);
        }

        return entityCopy;
    }

    getAllEntities() {
        return this._entities.values();
    }

    getEntityById(entityId: number) {
        return this._entities.get(entityId);
    }

    ////////////////////////////////////////////////////////////////////////////////
    // Tag management
    ////////////////////////////////////////////////////////////////////////////////

    tagEntity(entity: Entity, tag: string) {
        const existingEntity = this._entityPerTag.get(tag);

        if (existingEntity !== undefined) {
            throw new Error('An entity with tag ' + tag + ' already exists with id ' + existingEntity.getId());
        }

        this._entityPerTag.set(tag, entity);
        this._tagPerEntity.set(entity.getId(), tag);
    }

    getEntityTag(entity: Entity) {
        return this._tagPerEntity.get(entity.getId());
    }

    entityHasTag(entity: Entity, tag: string) {
        const currentTag = this._tagPerEntity.get(entity.getId());

        if (currentTag === undefined) {
            return false;
        }

        return currentTag === tag;
    }

    getEntityByTag(tag: string) {
        return this._entityPerTag.get(tag);
    }

    removeEntityTag(entity: Entity) {
        const currentTag = this._tagPerEntity.get(entity.getId());

        if (currentTag === undefined) {
            console.warn('Could not find tag for entity with id ' + entity.getId());
            return;
        }

        this._tagPerEntity.delete(entity.getId());
        this._entityPerTag.delete(currentTag);
    }

    ////////////////////////////////////////////////////////////////////////////////
    // Group management
    ////////////////////////////////////////////////////////////////////////////////

    groupEntity(entity: Entity, group: string) {
        const currentEntities = this._entitiesPerGroup.get(group);

        if (currentEntities === undefined) {
            this._entitiesPerGroup.set(group, new Set([entity]));
        } else {
            currentEntities.add(entity);
        }

        this._groupPerEntity.set(entity.getId(), group);
    }

    getEntityGroup(entity: Entity) {
        return this._groupPerEntity.get(entity.getId());
    }

    entityBelongsToGroup(entity: Entity, group: string) {
        const currentGroup = this._groupPerEntity.get(entity.getId());

        if (currentGroup === undefined) {
            return false;
        }

        return currentGroup === group;
    }

    getEntitiesByGroup(group: string) {
        const currentEntities = this._entitiesPerGroup.get(group);

        if (currentEntities === undefined) {
            return [];
        }

        return [...currentEntities];
    }

    removeEntityGroup(entity: Entity) {
        const currentGroup = this._groupPerEntity.get(entity.getId());

        if (currentGroup === undefined) {
            console.warn('Could not remove entity groups for entity with id ' + entity.getId());
            return;
        }

        this._groupPerEntity.delete(entity.getId());

        const currentEntities = this._entitiesPerGroup.get(currentGroup);

        if (currentEntities !== undefined) {
            currentEntities.delete(entity);

            if (currentEntities.size === 0) {
                this._entitiesPerGroup.delete(currentGroup);
            }
        }
    }

    ////////////////////////////////////////////////////////////////////////////////
    // Component management
    ////////////////////////////////////////////////////////////////////////////////

    addComponent<T extends ComponentClass>(
        entity: Entity,
        ComponentClass: T,
        ...args: ConstructorParameters<T>
    ) {
        const componentId = ComponentClass.getComponentId();
        const entityId = entity.getId();

        if (this._componentPools[componentId] === undefined) {
            const newComponentPool = new Pool<InstanceType<T>>();
            this._componentPools[componentId] = newComponentPool;
        }

        const newComponent = new ComponentClass(...args) as InstanceType<T>;
        (this._componentPools[componentId] as Pool<InstanceType<T>>).set(entityId, newComponent);

        this._entityComponentSignatures[entityId].set(componentId);
        // console.log('Component with id ' + componentId + ' was added to entity with id ' + entityId);
    }

    removeComponent<T extends ComponentClass>(entity: Entity, ComponentClass: T) {
        const componentId = ComponentClass.getComponentId();
        const entityId = entity.getId();

        // Remove the component from the component list for that entity
        const componentPool = this._componentPools[componentId] as Pool<InstanceType<T>>;
        componentPool?.remove(entityId);

        // Set this component signature for that entity to false
        this._entityComponentSignatures[entityId].remove(componentId);
    }

    hasComponent<T extends ComponentClass>(entity: Entity, ComponentClass: T): boolean {
        return this._entityComponentSignatures[entity.getId()].test(ComponentClass.getComponentId());
    }

    getComponent<T extends ComponentClass>(entity: Entity, ComponentClass: T): InstanceType<T> | undefined {
        return (this._componentPools[ComponentClass.getComponentId()] as Pool<InstanceType<T>>)?.get(entity.getId());
    }

    getAllEntityComponents<T extends Component>(entity: Entity): T[] {
        const components: T[] = [];

        for (let i = 0; i < this._componentPools.length; i++) {
            if (this._entityComponentSignatures[entity.getId()].test(i)) {
                const currentComponent = (this._componentPools[i] as Pool<T>)?.get(entity.getId());
                if (currentComponent !== undefined) {
                    components.push(currentComponent);
                }
            }
        }

        return components;
    }

    ////////////////////////////////////////////////////////////////////////////////
    // System management
    ////////////////////////////////////////////////////////////////////////////////

    addSystem<T extends System>(SystemClass: SystemClass<T>, ...args: ConstructorParameters<typeof SystemClass>) {
        const newSystem = new SystemClass(...args);
        this._systems.set(SystemClass.getSystemId(), newSystem);
    }

    removeSystem<T extends System>(SystemClass: SystemClass<T>) {
        this._systems.delete(SystemClass.getSystemId());
    }

    hasSystem<T extends System>(SystemClass: SystemClass<T>): boolean {
        return this._systems.get(SystemClass.getSystemId()) !== undefined;
    }

    getSystem<T extends System>(SystemClass: SystemClass<T>): T | undefined {
        const system = this._systems.get(SystemClass.getSystemId());

        if (system === undefined) {
            return undefined;
        }

        return system as T;
    }

    addEntityToSystem<T extends System>(entity: Entity, SystemClass: SystemClass<T>) {
        const entityId = entity.getId();
        const entityComponentSignature = this._entityComponentSignatures[entityId];

        const system = this._systems.get(SystemClass.getSystemId());

        if (!system) {
            throw new Error('System with id ' + SystemClass.getSystemId() + ' does not exist');
        }

        const systemComponentSignature = system.getComponentSignature();

        if (systemComponentSignature === 0) {
            throw new Error('System with id ' + SystemClass.getSystemId() + ' has signature 0, no entity can be added');
        }

        const isInterested = system.isInterestedIn(entityComponentSignature.signature);

        if (!isInterested) {
            throw new Error(
                'Entity with id ' + entityId + ' cannot be added to system with id ' + SystemClass.getSystemId(),
            );
        }

        if (system.hasEntity(entity)) {
            throw new Error(
                'Entity with id ' + entityId + ' is already present in system with id ' + SystemClass.getSystemId(),
            );
        }

        system.addEntityToSystem(entity);
    }

    removeEntityFromSystem<T extends System>(entity: Entity, SystemClass: SystemClass<T>) {
        const system = this._systems.get(SystemClass.getSystemId());

        if (!system) {
            throw new Error('System with id ' + SystemClass.getSystemId() + ' does not exist');
        }

        system.removeEntityFromSystem(entity);
    }

    addEntityToSystems(entity: Entity) {
        const entityId = entity.getId();

        const entityComponentSignature = this._entityComponentSignatures[entityId];

        for (const system of this._systems.values()) {
            if (system.isInterestedIn(entityComponentSignature.signature)) {
                system.addEntityToSystem(entity);
            }
        }
    }

    removeEntityFromSystems(entity: Entity) {
        for (const system of this._systems.values()) {
            system.removeEntityFromSystem(entity);
        }
    }

    ////////////////////////////////////////////////////////////////////////////////
    // Registry resetting
    ////////////////////////////////////////////////////////////////////////////////

    clear() {
        this._entities.clear();
        this._numEntities = 0;
        this._componentPools = [];
        this._entityComponentSignatures = [];
        this._entitiesToBeAdded = [];
        this._entitiesToBeKilled = [];
        this._entityPerTag = new Map();
        this._tagPerEntity = new Map();
        this._entitiesPerGroup = new Map();
        this._groupPerEntity = new Map();
        this._freeIds = [];

        for (const system of this._systems.values()) {
            system.removeAllEntities();
        }
    }
}
