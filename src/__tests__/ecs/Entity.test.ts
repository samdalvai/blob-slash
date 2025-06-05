import { expect } from '@jest/globals';

import Component, { IComponent } from '../../ecs/Component';
import Entity from '../../ecs/Entity';
import Pool from '../../ecs/Pool';
import Registry from '../../ecs/Registry';
import System, { ISystem } from '../../ecs/System';

describe('Testing Entity related functions', () => {
    beforeEach(() => {
        IComponent.resetIds();
        ISystem.resetIds();
    });

    test('Should return all entity components', () => {
        const registry = new Registry();

        class MyComponent1 extends Component {}
        class MyComponent2 extends Component {}

        const entity = registry.createEntity();
        entity.addComponent(MyComponent1);
        entity.addComponent(MyComponent2);

        const components = entity.getAllComponents();
        expect(components[0]).toEqual(entity.getComponent(MyComponent1));
        expect(components[1]).toEqual(entity.getComponent(MyComponent2));
        expect(components.length).toBe(2);
    });

    test('Should return no component if entity does not have any component', () => {
        const registry = new Registry();

        const entity = registry.createEntity();

        const components = entity.getAllComponents();

        expect(components.length).toBe(0);
    });

    test('Should return only the entity components, no other component', () => {
        const registry = new Registry();

        class MyComponent1 extends Component {}
        class MyComponent2 extends Component {}
        class MyComponent3 extends Component {}

        const entity1 = registry.createEntity();
        entity1.addComponent(MyComponent1);
        entity1.addComponent(MyComponent2);

        const entity2 = registry.createEntity();
        entity2.addComponent(MyComponent3);

        const components = entity1.getAllComponents();
        expect(components[0]).toEqual(entity1.getComponent(MyComponent1));
        expect(components[1]).toEqual(entity1.getComponent(MyComponent2));
        expect(components.length).toBe(2);
    });
});
