import { expect } from '@jest/globals';

import Component, { IComponent } from '../../../engine/ecs/Component';
import Registry from '../../../engine/ecs/Registry';
import { ISystem } from '../../../engine/ecs/System';
import { TransformComponent } from '../../../game/components';

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

        const components = entity.getComponents();
        expect(components[0]).toEqual(entity.getComponent(MyComponent1));
        expect(components[1]).toEqual(entity.getComponent(MyComponent2));
        expect(components.length).toBe(2);
    });

    test('Should return no component if entity does not have any component', () => {
        const registry = new Registry();

        const entity = registry.createEntity();

        const components = entity.getComponents();

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

        const components = entity1.getComponents();
        expect(components[0]).toEqual(entity1.getComponent(MyComponent1));
        expect(components[1]).toEqual(entity1.getComponent(MyComponent2));
        expect(components.length).toBe(2);
    });

    test('Should duplicate entity with its components', () => {
        const registry = new Registry();

        const entity = registry.createEntity();
        entity.addComponent(TransformComponent, { x: 100, y: 100 }, { x: 2, y: 2 });

        const entityCopy = entity.duplicate();
        const components = entityCopy.getComponents();
        expect(components[0]).toEqual(entity.getComponent(TransformComponent));
        expect(components.length).toBe(1);
    });

    test('Should duplicate entity with its components and change them independently', () => {
        const registry = new Registry();

        const entity = registry.createEntity();
        entity.addComponent(TransformComponent, { x: 100, y: 100 }, { x: 2, y: 2 });

        const entityCopy = entity.duplicate();

        const originalTransform = entity.getComponent(TransformComponent);
        originalTransform!.position.x = 200;
        originalTransform!.position.y = 200;

        const components = entityCopy.getComponents();
        expect(100).toEqual(entityCopy.getComponent(TransformComponent)!.position.x);
        expect(100).toEqual(entityCopy.getComponent(TransformComponent)!.position.y);
        expect(components.length).toBe(1);
    });

    test('Should duplicate entity group', () => {
        const registry = new Registry();

        const entity = registry.createEntity();
        entity.tag('test-tag');
        entity.group('test-group');

        const entityCopy = entity.duplicate();
        expect(entityCopy.getTag()).toEqual(undefined);
        expect(entityCopy.getGroup()).toEqual('test-group');
    });

    test('Duplicated entity coming from a duplicate should be copied from the copied entity and have his components', () => {
        const registry = new Registry();

        const entity = registry.createEntity();
        entity.addComponent(TransformComponent, { x: 100, y: 100 }, { x: 2, y: 2 });

        const entityCopy1 = entity.duplicate();
        registry.update();

        const entityCopyTransform1 = entityCopy1.getComponent(TransformComponent);
        entityCopyTransform1!.position.x = 200;
        entityCopyTransform1!.position.y = 200;
        registry.update();

        const entityCopy2 = entityCopy1.duplicate();
        const components = entityCopy2.getComponents();

        expect(entityCopy2.getComponent(TransformComponent)!.position.x).toEqual(200);
        expect(entityCopy2.getComponent(TransformComponent)!.position.y).toEqual(200);
        expect(components.length).toBe(1);
    });
});
