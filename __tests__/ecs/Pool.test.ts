import { expect } from '@jest/globals';

import Component, { IComponent } from '../../src/ecs/Component';
import Pool from '../../src/ecs/Pool';

describe('Testing Pool related functions', () => {
    beforeEach(() => {
        IComponent.resetIds();
    });

    test('An empty pool should have size 0', () => {
        const pool = new Pool();

        expect(pool.isEmpty()).toBe(true);
        expect(pool.getSize()).toBe(0);
    });

    test('Should correctly set component pool for one entity and one component', () => {
        class MyComponent extends Component {}
        const pool = new Pool<MyComponent>();

        const component = new MyComponent();

        pool.set(0, component);

        expect(pool.data[0]).toEqual(component);
        expect(pool.entityIdToIndex.get(0)).toBe(0);
        expect(pool.indexToEntityId.get(0)).toBe(0);
    });

    test('Should correctly set component pool for two entities and two components', () => {
        class MyComponent extends Component {}
        const pool = new Pool<MyComponent>();

        const component1 = new MyComponent();
        const component2 = new MyComponent();

        pool.set(0, component1);
        pool.set(1, component2);

        expect(pool.data[0]).toEqual(component1);
        expect(pool.data[1]).toEqual(component2);
        expect(pool.entityIdToIndex.get(0)).toBe(0);
        expect(pool.indexToEntityId.get(0)).toBe(0);
        expect(pool.entityIdToIndex.get(1)).toBe(1);
        expect(pool.indexToEntityId.get(1)).toBe(1);
    });

    test('Should remove entity and component from component pool', () => {
        class MyComponent extends Component {}
        const pool = new Pool<MyComponent>();

        const component = new MyComponent();

        pool.set(0, component);
        pool.remove(0);

        expect(pool.isEmpty()).toBe(true);
        expect(pool.getSize()).toBe(0);
        expect(pool.entityIdToIndex.get(0)).toBe(undefined);
        expect(pool.indexToEntityId.get(0)).toBe(undefined);
    });

    test('Should remove two entities and components from component pool', () => {
        class MyComponent extends Component {}
        const pool = new Pool<MyComponent>();

        const component1 = new MyComponent();
        const component2 = new MyComponent();

        pool.set(0, component1);
        pool.set(1, component2);

        pool.remove(0);
        pool.remove(1);

        expect(pool.isEmpty()).toBe(true);
        expect(pool.getSize()).toBe(0);
        expect(pool.entityIdToIndex.get(0)).toBe(undefined);
        expect(pool.indexToEntityId.get(0)).toBe(undefined);
        expect(pool.entityIdToIndex.get(1)).toBe(undefined);
        expect(pool.indexToEntityId.get(1)).toBe(undefined);
    });

    test('When removing entity from component pool, the last component should occupy the freed up space', () => {
        class MyComponent extends Component {}
        const pool = new Pool<MyComponent>();

        const component1 = new MyComponent();
        const component2 = new MyComponent();

        pool.set(0, component1);
        pool.set(1, component2);

        pool.remove(0);

        expect(pool.data[0]).toEqual(component1);
        expect(pool.data[1]).toEqual(undefined);
        expect(pool.entityIdToIndex.get(1)).toBe(0);
        expect(pool.indexToEntityId.get(0)).toBe(1);
    });

    test('Should remove entity and component from component pool if entity id exists', () => {
        class MyComponent extends Component {}
        const pool = new Pool<MyComponent>();

        const component = new MyComponent();

        pool.set(0, component);
        pool.removeEntityFromPool(0);

        expect(pool.isEmpty()).toBe(true);
        expect(pool.getSize()).toBe(0);
        expect(pool.entityIdToIndex.get(0)).toBe(undefined);
        expect(pool.indexToEntityId.get(0)).toBe(undefined);
    });

    test('Should not remove entity and component from component pool if entity id does not exists', () => {
        class MyComponent extends Component {}
        const pool = new Pool<MyComponent>();

        const component = new MyComponent();

        pool.set(0, component);
        pool.removeEntityFromPool(1);

        expect(pool.data[0]).toEqual(component);
        expect(pool.entityIdToIndex.get(0)).toBe(0);
        expect(pool.indexToEntityId.get(0)).toBe(0);
    });

    test('Should retrieve component of entity when having one entity', () => {
        class MyComponent extends Component {}
        const pool = new Pool<MyComponent>();

        const component = new MyComponent();

        pool.set(0, component);

        const retrieved = pool.get(0);

        expect(retrieved).toEqual(component);
    });

    test('Should retrieve component of entity when having more entities', () => {
        class MyComponent extends Component {}
        const pool = new Pool<MyComponent>();

        const component1 = new MyComponent();
        const component2 = new MyComponent();
        const component3 = new MyComponent();

        pool.set(0, component1);
        pool.set(1, component2);
        pool.set(2, component3);

        const retrieved = pool.get(0);

        expect(retrieved).toEqual(component1);
    });

    test('Should return undefined when getting component of entity not found', () => {
        class MyComponent extends Component {}
        const pool = new Pool<MyComponent>();

        const component = new MyComponent();

        pool.set(0, component);

        const retrieved = pool.get(1);

        expect(retrieved).toEqual(undefined);
    });
});
