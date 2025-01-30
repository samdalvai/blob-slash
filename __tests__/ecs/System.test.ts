import { expect } from '@jest/globals';

import Component, { IComponent } from '../../src/ecs/Component';
import Registry from '../../src/ecs/Registry';
import System, { ISystem } from '../../src/ecs/System';

describe('Testing System related functions', () => {
    beforeEach(() => {
        ISystem.resetIds();
        IComponent.resetIds();
    });

    test('The first System created should have id 0', () => {
        class MySystem extends System {}

        expect(MySystem.getSystemId()).toBe(0);
        expect(MySystem.getSystemId()).toBe(0);
    });

    test('The second System created should have id 1', () => {
        class MySystem1 extends System {}
        class MySystem2 extends System {}

        expect(MySystem1.getSystemId()).toBe(0);
        expect(MySystem2.getSystemId()).toBe(1);
    });

    test('A system requiring a component should add entity to his system entitites', () => {
        class MyComponent extends Component {}
        class MySystem extends System {
            constructor() {
                super();
                this.requireComponent(MyComponent);
            }
        }

        const registry = new Registry();
        registry.addSystem(MySystem);

        const entity = registry.createEntity();
        entity.addComponent(MyComponent);

        registry.update();

        const system = registry.getSystem(MySystem);
        expect(system?.getSystemEntities().length).toBe(1);
        expect(system?.getSystemEntities()[0]).toEqual(entity);
    });

    test('A system requiring a component should add multiple entities to his system entitites', () => {
        class MyComponent extends Component {}
        class MySystem extends System {
            constructor() {
                super();
                this.requireComponent(MyComponent);
            }
        }

        const registry = new Registry();
        registry.addSystem(MySystem);

        const entity1 = registry.createEntity();
        entity1.addComponent(MyComponent);
        const entity2 = registry.createEntity();
        entity2.addComponent(MyComponent);

        registry.update();

        const system = registry.getSystem(MySystem);
        expect(system?.getSystemEntities().length).toBe(2);
        expect(system?.getSystemEntities()[0]).toEqual(entity1);
        expect(system?.getSystemEntities()[1]).toEqual(entity2);
    });

    test('A system with no required component should not add any entity to his system entitites', () => {
        class MyComponent extends Component {}
        class MySystem extends System {
            constructor() {
                super();
            }
        }

        const registry = new Registry();
        registry.addSystem(MySystem);

        const entity = registry.createEntity();
        entity.addComponent(MyComponent);

        registry.update();

        const system = registry.getSystem(MySystem);
        expect(system?.getSystemEntities().length).toBe(0);
    });
});
