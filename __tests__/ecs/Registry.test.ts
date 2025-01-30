import { expect } from '@jest/globals';

import Component, { IComponent } from '../../src/ecs/Component';
import Entity from '../../src/ecs/Entity';
import Pool from '../../src/ecs/Pool';
import Registry from '../../src/ecs/Registry';
import System, { ISystem } from '../../src/ecs/System';

describe('Testing Registry related functions', () => {
    beforeEach(() => {
        IComponent.resetIds();
        ISystem.resetIds();
    });

    ////////////////////////////////////////////////////////////////////////////////
    // Entities creation
    ////////////////////////////////////////////////////////////////////////////////

    test('Should add entity to registry entities to be added', () => {
        const registry = new Registry();
        const entity = registry.createEntity();

        expect(entity.getId()).toBe(0);
        expect(entity.registry).toEqual(registry);
        expect(registry.entitiesToBeAdded.length).toBe(1);
    });

    test('Should add entity to registry entities to be killed', () => {
        const registry = new Registry();
        const entity = new Entity(1, registry);
        registry.killEntity(entity);

        expect(registry.entitiesToBeKilled.length).toBe(1);
    });

    test('Should create entity with id from the free ids', () => {
        const registry = new Registry();
        registry.freeIds = [999];

        const entity = registry.createEntity();

        expect(entity.getId()).toBe(999);
        expect(entity.registry).toEqual(registry);
        expect(registry.entitiesToBeAdded.length).toBe(1);
        expect(registry.freeIds.length).toBe(0);
    });

    ////////////////////////////////////////////////////////////////////////////////
    // Entities signature
    ////////////////////////////////////////////////////////////////////////////////

    test('Should set entity component signature at bit 0 for one entity and one component', () => {
        const registry = new Registry();
        const entity = registry.createEntity();

        class MyComponent extends Component {
            param: number;

            constructor(param: number) {
                super();
                this.param = param;
            }
        }

        entity.addComponent(MyComponent, 1);

        expect(registry.entityComponentSignatures[0].test(0)).toBe(true);
    });

    test('Should set entity component signature at bit 0 and 1 for one entity and multiple components', () => {
        const registry = new Registry();
        const entity = registry.createEntity();

        class MyComponent1 extends Component {}
        class MyComponent2 extends Component {}

        entity.addComponent(MyComponent1);
        entity.addComponent(MyComponent2);

        console.log(registry.entityComponentSignatures);

        expect(registry.entityComponentSignatures[0].test(0)).toBe(true);
        expect(registry.entityComponentSignatures[0].test(1)).toBe(true);
    });

    test('Should set entity component signature at bit 0 for more entities and one component', () => {
        const registry = new Registry();
        const entity1 = registry.createEntity();
        const entity2 = registry.createEntity();
        const entity3 = registry.createEntity();

        class MyComponent extends Component {}

        entity1.addComponent(MyComponent);
        entity2.addComponent(MyComponent);
        entity3.addComponent(MyComponent);

        expect(registry.entityComponentSignatures[0].test(0)).toBe(true);
        expect(registry.entityComponentSignatures[1].test(0)).toBe(true);
        expect(registry.entityComponentSignatures[2].test(0)).toBe(true);
    });

    ////////////////////////////////////////////////////////////////////////////////
    // Entities components
    ////////////////////////////////////////////////////////////////////////////////

    test('Should add entity and component to component pools when adding component', () => {
        const registry = new Registry();
        const entity = registry.createEntity();

        class MyComponent extends Component {}

        entity.addComponent(MyComponent);

        const pool = registry.componentPools[0] as Pool<MyComponent>;

        expect(registry.componentPools.length).toBe(1);
        expect(pool.data[0]).toEqual(new MyComponent());
        expect(pool.entityIdToIndex.get(0)).toBe(0);
        expect(pool.indexToEntityId.get(0)).toBe(0);
    });

    test('Should add entities and components to component pools when adding component for more entities', () => {
        const registry = new Registry();
        const entity1 = registry.createEntity();
        const entity2 = registry.createEntity();

        class MyComponent extends Component {}

        entity1.addComponent(MyComponent);
        entity2.addComponent(MyComponent);

        const pool = registry.componentPools[0] as Pool<MyComponent>;

        expect(registry.componentPools.length).toBe(1);
        expect(pool.data[0]).toEqual(new MyComponent());
        expect(pool.entityIdToIndex.get(0)).toBe(0);
        expect(pool.indexToEntityId.get(0)).toBe(0);
        expect(pool.data[1]).toEqual(new MyComponent());
        expect(pool.entityIdToIndex.get(1)).toBe(1);
        expect(pool.indexToEntityId.get(1)).toBe(1);
    });

    test('Should add entity and components to component pools when adding different components for same entity', () => {
        const registry = new Registry();
        const entity = registry.createEntity();

        class MyComponent1 extends Component {}
        class MyComponent2 extends Component {}

        entity.addComponent(MyComponent1);
        entity.addComponent(MyComponent2);

        const pool1 = registry.componentPools[0] as Pool<MyComponent1>;
        const pool2 = registry.componentPools[1] as Pool<MyComponent1>;

        expect(registry.componentPools.length).toBe(2);
        expect(pool1.data[0]).toEqual(new MyComponent1());
        expect(pool1.entityIdToIndex.get(0)).toBe(0);
        expect(pool1.indexToEntityId.get(0)).toBe(0);
        expect(pool2.data[0]).toEqual(new MyComponent2());
        expect(pool2.entityIdToIndex.get(0)).toBe(0);
        expect(pool2.indexToEntityId.get(0)).toBe(0);
    });

    test('Should remove entity and component from component pools when removing component', () => {
        const registry = new Registry();
        const entity = registry.createEntity();

        class MyComponent extends Component {}

        entity.addComponent(MyComponent);
        entity.removeComponent(MyComponent);

        const pool = registry.componentPools[0] as Pool<MyComponent>;

        expect(registry.componentPools.length).toBe(1);
        expect(pool.data[0]).toBe(undefined);
        expect(pool.entityIdToIndex.get(0)).toBe(undefined);
        expect(pool.indexToEntityId.get(0)).toBe(undefined);
    });

    test('Should remove entity and component from component pools when removing component with more entities', () => {
        const registry = new Registry();
        const entity1 = registry.createEntity();
        const entity2 = registry.createEntity();

        class MyComponent extends Component {}

        entity1.addComponent(MyComponent);
        entity2.addComponent(MyComponent);
        entity1.removeComponent(MyComponent);

        const pool = registry.componentPools[0] as Pool<MyComponent>;

        expect(registry.componentPools.length).toBe(1);
        expect(pool.data[0]).toEqual(new MyComponent());
        expect(pool.entityIdToIndex.get(0)).toBe(undefined);
        expect(pool.indexToEntityId.get(1)).toBe(undefined);
        expect(pool.data[1]).toEqual(undefined);
        expect(pool.entityIdToIndex.get(1)).toBe(0);
        expect(pool.indexToEntityId.get(0)).toBe(1);
    });

    test('Should remove entity and component from component pools when removing component with more entities when adding different components for same entity', () => {
        const registry = new Registry();
        const entity = registry.createEntity();

        class MyComponent1 extends Component {}
        class MyComponent2 extends Component {}

        entity.addComponent(MyComponent1);
        entity.addComponent(MyComponent2);

        entity.removeComponent(MyComponent1);

        const pool1 = registry.componentPools[0] as Pool<MyComponent1>;
        const pool2 = registry.componentPools[1] as Pool<MyComponent1>;

        expect(registry.componentPools.length).toBe(2);
        expect(pool1.data[0]).toEqual(undefined);
        expect(pool1.entityIdToIndex.get(0)).toBe(undefined);
        expect(pool1.indexToEntityId.get(0)).toBe(undefined);
        expect(pool2.data[0]).toEqual(new MyComponent2());
        expect(pool2.entityIdToIndex.get(0)).toBe(0);
        expect(pool2.indexToEntityId.get(0)).toBe(0);
    });

    test('Should return true for entity having component', () => {
        const registry = new Registry();
        const entity = registry.createEntity();

        class MyComponent extends Component {}

        entity.addComponent(MyComponent);

        expect(entity.hasComponent(MyComponent)).toBe(true);
    });

    test('Should return true for entity having component with multiple components', () => {
        const registry = new Registry();
        const entity = registry.createEntity();

        class MyComponent1 extends Component {}
        class MyComponent2 extends Component {}

        entity.addComponent(MyComponent1);
        entity.addComponent(MyComponent2);

        expect(entity.hasComponent(MyComponent1)).toBe(true);
        expect(entity.hasComponent(MyComponent2)).toBe(true);
    });

    test('Should return false for entity not having component', () => {
        const registry = new Registry();
        const entity = registry.createEntity();

        class MyComponent1 extends Component {}
        class MyComponent2 extends Component {}

        entity.addComponent(MyComponent1);

        expect(entity.hasComponent(MyComponent2)).toBe(false);
    });

    test('Should get entity component from registry', () => {
        const registry = new Registry();
        const entity = registry.createEntity();

        class MyComponent extends Component {
            param: number;

            constructor(param: number) {
                super();
                this.param = param;
            }
        }

        entity.addComponent(MyComponent, 1);

        expect(entity.getComponent(MyComponent)).toEqual(new MyComponent(1));
    });

    test('Should get entity component from registry, when having multiple components', () => {
        const registry = new Registry();
        const entity = registry.createEntity();

        class MyComponent1 extends Component {}
        class MyComponent2 extends Component {}

        entity.addComponent(MyComponent1);
        entity.addComponent(MyComponent2);

        expect(entity.getComponent(MyComponent1)).toEqual(new MyComponent1());
        expect(entity.getComponent(MyComponent2)).toEqual(new MyComponent2());
    });

    test('Should get an undefined component if entity does not have it', () => {
        const registry = new Registry();
        const entity = registry.createEntity();

        class MyComponent1 extends Component {}
        class MyComponent2 extends Component {}

        entity.addComponent(MyComponent1);

        expect(entity.getComponent(MyComponent2)).toEqual(undefined);
    });

    ////////////////////////////////////////////////////////////////////////////////
    // Entities systems
    ////////////////////////////////////////////////////////////////////////////////

    test('Should add system to registry', () => {
        const registry = new Registry();

        class MySystem extends System {}

        registry.addSystem(MySystem);

        expect(registry.systems.get(0)).toBeInstanceOf(MySystem);
    });

    test('Should add multiple systems to registry', () => {
        const registry = new Registry();

        class MySystem1 extends System {}
        class MySystem2 extends System {}

        registry.addSystem(MySystem1);
        registry.addSystem(MySystem2);

        expect(registry.systems.get(0)).toBeInstanceOf(MySystem1);
        expect(registry.systems.get(1)).toBeInstanceOf(MySystem2);
    });

    test('Should remove system from registry', () => {
        const registry = new Registry();

        class MySystem extends System {}

        registry.addSystem(MySystem);
        registry.removeSystem(MySystem);

        expect(registry.systems.get(0)).toBe(undefined);
    });

    test('Should remove system from registry with multiple systems existing', () => {
        const registry = new Registry();

        class MySystem1 extends System {}
        class MySystem2 extends System {}

        registry.addSystem(MySystem1);
        registry.addSystem(MySystem2);
        registry.removeSystem(MySystem1);

        expect(registry.systems.get(0)).toBe(undefined);
    });

    test('Should return true when checking if system exists in registry', () => {
        const registry = new Registry();

        class MySystem extends System {}

        registry.addSystem(MySystem);

        expect(registry.hasSystem(MySystem)).toBe(true);
    });

    test('Should return true when checking if system exists in registry with multiple systems existing', () => {
        const registry = new Registry();

        class MySystem1 extends System {}
        class MySystem2 extends System {}

        registry.addSystem(MySystem1);
        registry.addSystem(MySystem2);

        expect(registry.hasSystem(MySystem1)).toBe(true);
    });

    test('Should return false if system does not exist', () => {
        const registry = new Registry();

        class MySystem1 extends System {}
        class MySystem2 extends System {}

        registry.addSystem(MySystem1);

        expect(registry.hasSystem(MySystem2)).toBe(false);
    });

    test('Should return system if it exists in registry', () => {
        const registry = new Registry();

        class MySystem extends System {}

        registry.addSystem(MySystem);

        expect(registry.getSystem(MySystem)).toBeInstanceOf(MySystem);
    });

    test('Should return system if it exists in registry with multiple systems existing', () => {
        const registry = new Registry();

        class MySystem1 extends System {}
        class MySystem2 extends System {}

        registry.addSystem(MySystem1);
        registry.addSystem(MySystem2);

        expect(registry.getSystem(MySystem1)).toBeInstanceOf(MySystem1);
    });

    test('Should return undefined if system does not exist', () => {
        const registry = new Registry();

        class MySystem1 extends System {}
        class MySystem2 extends System {}

        registry.addSystem(MySystem1);

        expect(registry.getSystem(MySystem2)).toBe(undefined);
    });

    test('Should add entity to system, when entity has component to which system is interested to', () => {
        const registry = new Registry();

        class MyComponent extends Component {}

        class MySystem extends System {
            constructor() {
                super();
                this.requireComponent(MyComponent);
            }
        }

        const entity = registry.createEntity();
        entity.addComponent(MyComponent);

        registry.addSystem(MySystem);
        registry.addEntityToSystems(entity);

        const system = registry.getSystem(MySystem);

        expect(system?.getSystemEntities()[0]).toEqual(entity);
    });

    test('Should add entity to mutliple systems, when entity has component to which systems are interested to', () => {
        const registry = new Registry();

        class MyComponent extends Component {}

        class MySystem1 extends System {
            constructor() {
                super();
                this.requireComponent(MyComponent);
            }
        }

        class MySystem2 extends System {
            constructor() {
                super();
                this.requireComponent(MyComponent);
            }
        }

        const entity = registry.createEntity();
        entity.addComponent(MyComponent);

        registry.addSystem(MySystem1);
        registry.addSystem(MySystem2);
        registry.addEntityToSystems(entity);

        const system1 = registry.getSystem(MySystem1);
        const system2 = registry.getSystem(MySystem2);

        expect(system1?.getSystemEntities()[0]).toEqual(entity);
        expect(system2?.getSystemEntities()[0]).toEqual(entity);
    });

    test('Should add multiple entities to system, when entities have component to which system is interested to', () => {
        const registry = new Registry();

        class MyComponent extends Component {}

        class MySystem extends System {
            constructor() {
                super();
                this.requireComponent(MyComponent);
            }
        }

        const entity1 = registry.createEntity();
        const entity2 = registry.createEntity();
        entity1.addComponent(MyComponent);
        entity2.addComponent(MyComponent);

        registry.addSystem(MySystem);
        registry.addEntityToSystems(entity1);
        registry.addEntityToSystems(entity2);

        const system = registry.getSystem(MySystem);

        expect(system?.getSystemEntities()[0]).toEqual(entity1);
        expect(system?.getSystemEntities()[1]).toEqual(entity2);
    });

    test('Should add entity to system, when entity has multiple components to which system is interested to', () => {
        const registry = new Registry();

        class MyComponent1 extends Component {}
        class MyComponent2 extends Component {}

        class MySystem extends System {
            constructor() {
                super();
                this.requireComponent(MyComponent1);
                this.requireComponent(MyComponent2);
            }
        }

        const entity = registry.createEntity();
        entity.addComponent(MyComponent1);
        entity.addComponent(MyComponent2);

        registry.addSystem(MySystem);
        registry.addEntityToSystems(entity);

        const system = registry.getSystem(MySystem);

        expect(system?.getSystemEntities()[0]).toEqual(entity);
    });

    test('Should not add entity to system, when entity has only some of the components the entity is interested to', () => {
        const registry = new Registry();

        class MyComponent1 extends Component {}
        class MyComponent2 extends Component {}

        class MySystem extends System {
            constructor() {
                super();
                this.requireComponent(MyComponent1);
                this.requireComponent(MyComponent2);
            }
        }

        const entity = registry.createEntity();
        entity.addComponent(MyComponent1);

        registry.addSystem(MySystem);
        registry.addEntityToSystems(entity);

        const system = registry.getSystem(MySystem);

        expect(system?.getSystemEntities().length).toBe(0);
    });

    test('Should remove entity from system', () => {
        const registry = new Registry();

        class MyComponent extends Component {}

        class MySystem extends System {
            constructor() {
                super();
                this.requireComponent(MyComponent);
            }
        }

        const entity = registry.createEntity();
        entity.addComponent(MyComponent);

        registry.addSystem(MySystem);
        registry.addEntityToSystems(entity);
        registry.removeEntityFromSystems(entity);

        const system = registry.getSystem(MySystem);

        expect(system?.getSystemEntities().length).toEqual(0);
    });

    test('Should remove entities from system with multiple entities', () => {
        const registry = new Registry();

        class MyComponent extends Component {}

        class MySystem extends System {
            constructor() {
                super();
                this.requireComponent(MyComponent);
            }
        }

        const entity1 = registry.createEntity();
        const entity2 = registry.createEntity();
        entity1.addComponent(MyComponent);
        entity2.addComponent(MyComponent);

        registry.addSystem(MySystem);
        registry.addEntityToSystems(entity1);
        registry.addEntityToSystems(entity2);
        registry.removeEntityFromSystems(entity1);

        const system = registry.getSystem(MySystem);

        expect(system?.getSystemEntities().length).toEqual(1);
        expect(system?.getSystemEntities()[0]).toEqual(entity2);
    });

    test('Should remove entities from system', () => {
        const registry = new Registry();

        class MyComponent extends Component {}

        class MySystem extends System {
            constructor() {
                super();
                this.requireComponent(MyComponent);
            }
        }

        const entity1 = registry.createEntity();
        const entity2 = registry.createEntity();
        entity1.addComponent(MyComponent);
        entity2.addComponent(MyComponent);

        registry.addSystem(MySystem);
        registry.addEntityToSystems(entity1);
        registry.addEntityToSystems(entity2);
        registry.removeEntityFromSystems(entity1);
        registry.removeEntityFromSystems(entity2);

        const system = registry.getSystem(MySystem);

        expect(system?.getSystemEntities().length).toEqual(0);
    });

    test('Should remove entity from multiple systems', () => {
        const registry = new Registry();

        class MyComponent extends Component {}

        class MySystem1 extends System {
            constructor() {
                super();
                this.requireComponent(MyComponent);
            }
        }

        class MySystem2 extends System {
            constructor() {
                super();
                this.requireComponent(MyComponent);
            }
        }

        const entity = registry.createEntity();
        entity.addComponent(MyComponent);

        registry.addSystem(MySystem1);
        registry.addSystem(MySystem2);
        registry.addEntityToSystems(entity);
        registry.removeEntityFromSystems(entity);

        const system1 = registry.getSystem(MySystem1);
        const system2 = registry.getSystem(MySystem2);

        expect(system1?.getSystemEntities().length).toEqual(0);
        expect(system2?.getSystemEntities().length).toEqual(0);
    });

    test('Should add entity to system, when entity has component to which system is interested to, when updating registry', () => {
        const registry = new Registry();

        class MyComponent extends Component {}

        class MySystem extends System {
            constructor() {
                super();
                this.requireComponent(MyComponent);
            }
        }

        const entity = registry.createEntity();
        entity.addComponent(MyComponent);

        registry.addSystem(MySystem);

        registry.update();

        const system = registry.getSystem(MySystem);

        expect(system?.getSystemEntities()[0]).toEqual(entity);
    });

    test('Should add entity to mutliple systems, when entity has component to which systems are interested to, when updating registry', () => {
        const registry = new Registry();

        class MyComponent extends Component {}

        class MySystem1 extends System {
            constructor() {
                super();
                this.requireComponent(MyComponent);
            }
        }

        class MySystem2 extends System {
            constructor() {
                super();
                this.requireComponent(MyComponent);
            }
        }

        const entity = registry.createEntity();
        entity.addComponent(MyComponent);

        registry.addSystem(MySystem1);
        registry.addSystem(MySystem2);

        registry.update();

        const system1 = registry.getSystem(MySystem1);
        const system2 = registry.getSystem(MySystem2);

        expect(system1?.getSystemEntities()[0]).toEqual(entity);
        expect(system2?.getSystemEntities()[0]).toEqual(entity);
    });

    test('Should add multiple entities to system, when entities have component to which system is interested to, when updating registry', () => {
        const registry = new Registry();

        class MyComponent extends Component {}

        class MySystem extends System {
            constructor() {
                super();
                this.requireComponent(MyComponent);
            }
        }

        const entity1 = registry.createEntity();
        const entity2 = registry.createEntity();
        entity1.addComponent(MyComponent);
        entity2.addComponent(MyComponent);

        registry.addSystem(MySystem);

        registry.update();

        const system = registry.getSystem(MySystem);

        expect(system?.getSystemEntities()[0]).toEqual(entity1);
        expect(system?.getSystemEntities()[1]).toEqual(entity2);
    });

    test('Should add entity to system, when entity has multiple components to which system is interested to, when updating registry', () => {
        const registry = new Registry();

        class MyComponent1 extends Component {}
        class MyComponent2 extends Component {}

        class MySystem extends System {
            constructor() {
                super();
                this.requireComponent(MyComponent1);
                this.requireComponent(MyComponent2);
            }
        }

        const entity = registry.createEntity();
        entity.addComponent(MyComponent1);
        entity.addComponent(MyComponent2);

        registry.addSystem(MySystem);

        registry.update();

        const system = registry.getSystem(MySystem);

        expect(system?.getSystemEntities()[0]).toEqual(entity);
    });

    test('Should not add entity to system, when entity has only some of the components the entity is interested to, when updating registry', () => {
        const registry = new Registry();

        class MyComponent1 extends Component {}
        class MyComponent2 extends Component {}

        class MySystem extends System {
            constructor() {
                super();
                this.requireComponent(MyComponent1);
                this.requireComponent(MyComponent2);
            }
        }

        const entity = registry.createEntity();
        entity.addComponent(MyComponent1);

        registry.addSystem(MySystem);

        registry.update();

        const system = registry.getSystem(MySystem);

        expect(system?.getSystemEntities().length).toBe(0);
    });

    test('Should remove entity from system, when updating registry', () => {
        const registry = new Registry();

        class MyComponent extends Component {}

        class MySystem extends System {
            constructor() {
                super();
                this.requireComponent(MyComponent);
            }
        }

        const entity = registry.createEntity();
        entity.addComponent(MyComponent);

        registry.addSystem(MySystem);

        entity.kill();
        registry.update();

        const system = registry.getSystem(MySystem);

        expect(system?.getSystemEntities().length).toEqual(0);
    });

    test('Should remove entities from system with multiple entities, when updating registry', () => {
        const registry = new Registry();

        class MyComponent extends Component {}

        class MySystem extends System {
            constructor() {
                super();
                this.requireComponent(MyComponent);
            }
        }

        const entity1 = registry.createEntity();
        const entity2 = registry.createEntity();
        entity1.addComponent(MyComponent);
        entity2.addComponent(MyComponent);

        registry.addSystem(MySystem);

        entity1.kill();
        registry.update();

        const system = registry.getSystem(MySystem);

        expect(system?.getSystemEntities().length).toEqual(1);
        expect(system?.getSystemEntities()[0]).toEqual(entity2);
    });

    test('Should remove entities from system with multiple entities, when updating registry and entity removed is the last one', () => {
        const registry = new Registry();

        class MyComponent extends Component {}

        class MySystem extends System {
            constructor() {
                super();
                this.requireComponent(MyComponent);
            }
        }

        const entity1 = registry.createEntity();
        const entity2 = registry.createEntity();
        entity1.addComponent(MyComponent);
        entity2.addComponent(MyComponent);

        registry.addSystem(MySystem);

        entity2.kill();
        registry.update();

        const system = registry.getSystem(MySystem);

        expect(system?.getSystemEntities().length).toEqual(1);
        expect(system?.getSystemEntities()[0]).toEqual(entity1);
    });

    test('Should remove entities from system, when updating registry', () => {
        const registry = new Registry();

        class MyComponent extends Component {}

        class MySystem extends System {
            constructor() {
                super();
                this.requireComponent(MyComponent);
            }
        }

        const entity1 = registry.createEntity();
        const entity2 = registry.createEntity();
        entity1.addComponent(MyComponent);
        entity2.addComponent(MyComponent);

        registry.addSystem(MySystem);

        entity1.kill();
        entity2.kill();
        registry.update();

        const system = registry.getSystem(MySystem);

        expect(system?.getSystemEntities().length).toEqual(0);
    });

    test('Should remove entity from multiple systems, when updating registry', () => {
        const registry = new Registry();

        class MyComponent extends Component {}

        class MySystem1 extends System {
            constructor() {
                super();
                this.requireComponent(MyComponent);
            }
        }

        class MySystem2 extends System {
            constructor() {
                super();
                this.requireComponent(MyComponent);
            }
        }

        const entity = registry.createEntity();
        entity.addComponent(MyComponent);

        registry.addSystem(MySystem1);
        registry.addSystem(MySystem2);

        entity.kill();
        registry.update();

        const system1 = registry.getSystem(MySystem1);
        const system2 = registry.getSystem(MySystem2);

        expect(system1?.getSystemEntities().length).toEqual(0);
        expect(system2?.getSystemEntities().length).toEqual(0);
    });

    test('Should remove entity from system and leave the other systems entities intact if entity does not appear there', () => {
        const registry = new Registry();

        class MyComponent1 extends Component {}
        class MyComponent2 extends Component {}

        class MySystem1 extends System {
            constructor() {
                super();
                this.requireComponent(MyComponent1);
            }
        }

        class MySystem2 extends System {
            constructor() {
                super();
                this.requireComponent(MyComponent2);
            }
        }

        const entity1 = registry.createEntity();
        entity1.addComponent(MyComponent1);

        const entity2 = registry.createEntity();
        entity2.addComponent(MyComponent2);

        registry.addSystem(MySystem1);
        registry.addSystem(MySystem2);

        entity1.kill();
        registry.update();

        const system1 = registry.getSystem(MySystem1);
        const system2 = registry.getSystem(MySystem2);

        expect(system1?.getSystemEntities().length).toEqual(0);
        expect(system2?.getSystemEntities().length).toEqual(1);
    });

    ////////////////////////////////////////////////////////////////////////////////
    // Entities tags and groups
    ////////////////////////////////////////////////////////////////////////////////

    test('Should add tag to entity and get entity by tag', () => {
        const registry = new Registry();

        const entity = registry.createEntity();
        entity.tag('test');

        expect(registry.getEntityByTag('test')).toEqual(entity);
        expect(entity.hasTag('test')).toBe(true);
    });

    test('Should remove tag from entity after adding it', () => {
        const registry = new Registry();

        const entity = registry.createEntity();
        entity.tag('test');

        registry.removeEntityTag(entity);

        expect(registry.getEntityByTag('test')).toBe(undefined);
        expect(entity.hasTag('test')).toBe(false);
    });

    test('Should remove tag with entity when entity is killed', () => {
        const registry = new Registry();

        const entity = registry.createEntity();
        entity.tag('test');
        entity.kill();

        registry.update();

        expect(registry.getEntityByTag('test')).toBe(undefined);
    });

    test('Should throw an error when attempting to tag another entity with the same tag', () => {
        const registry = new Registry();

        const entity1 = registry.createEntity();
        entity1.tag('test');

        const entity2 = registry.createEntity();
        expect(() => entity2.tag('test')).toThrowError();
    });

    test('Should add group to entity and get entity by group', () => {
        const registry = new Registry();

        const entity = registry.createEntity();
        entity.group('test');

        expect(registry.getEntitiesByGroup('test')).toEqual([entity]);
        expect(entity.belongsToGroup('test')).toBe(true);
    });

    test('Should remove group from entity after adding it', () => {
        const registry = new Registry();

        const entity = registry.createEntity();
        entity.group('test');

        registry.removeEntityGroup(entity);

        expect(registry.getEntitiesByGroup('test')).toEqual([]);
        expect(entity.belongsToGroup('test')).toBe(false);
    });

    test('Should remove entity from group when entity is killed', () => {
        const registry = new Registry();

        const entity = registry.createEntity();
        entity.group('test');
        entity.kill();

        registry.update();

        expect(registry.getEntitiesByGroup('test')).toEqual([]);
    });

    test('Should remove entity from group when entity is killed, but some entity remains in the group', () => {
        const registry = new Registry();

        const entity1 = registry.createEntity();
        entity1.group('test');
        const entity2 = registry.createEntity();
        entity2.group('test');

        entity1.kill();

        registry.update();

        expect(registry.getEntitiesByGroup('test')).toEqual([entity2]);
    });

    ////////////////////////////////////////////////////////////////////////////////
    // Registry resetting
    ////////////////////////////////////////////////////////////////////////////////

    test('Should remove all entities, components, tags, and clear systems entities when clearing registry', () => {
        const registry = new Registry();

        class MyComponent1 extends Component {}
        class MyComponent2 extends Component {}

        class MySystem1 extends System {
            constructor() {
                super();
                this.requireComponent(MyComponent1);
            }
        }

        class MySystem2 extends System {
            constructor() {
                super();
                this.requireComponent(MyComponent2);
            }
        }

        const entity1 = registry.createEntity();
        entity1.addComponent(MyComponent1);
        entity1.tag('test1');
        entity1.group('entities');

        const entity2 = registry.createEntity();
        entity2.addComponent(MyComponent2);
        entity2.tag('test2');
        entity2.group('entities');

        registry.addSystem(MySystem1);
        registry.addSystem(MySystem2);

        registry.update();

        const system1 = registry.getSystem(MySystem1);
        const system2 = registry.getSystem(MySystem2);

        expect(registry.numEntities).toBe(2);
        expect(registry.componentPools.length).toBe(2);
        expect(registry.entityComponentSignatures.length).toBe(2);

        expect(registry.entityPerTag.size).toBe(2);
        expect(registry.tagPerEntity.size).toBe(2);

        expect(registry.entitiesPerGroup.size).toBe(1);
        expect(registry.groupPerEntity.size).toBe(2);

        expect(registry.freeIds.length).toBe(0);

        expect(system1?.getSystemEntities().length).toEqual(1);
        expect(system2?.getSystemEntities().length).toEqual(1);

        registry.clear();
        
        expect(registry.numEntities).toBe(0);
        expect(registry.componentPools.length).toBe(0);
        expect(registry.entityComponentSignatures.length).toBe(0);

        expect(registry.entityPerTag.size).toBe(0);
        expect(registry.tagPerEntity.size).toBe(0);

        expect(registry.entitiesPerGroup.size).toBe(0);
        expect(registry.groupPerEntity.size).toBe(0);

        expect(registry.freeIds.length).toBe(0);

        expect(system1?.getSystemEntities().length).toEqual(0);
        expect(system2?.getSystemEntities().length).toEqual(0);
    });
});
