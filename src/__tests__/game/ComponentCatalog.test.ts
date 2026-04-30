import { describe, expect, test } from '@jest/globals';

import Registry from '../../engine/ecs/Registry';
import { gameComponentCatalog } from '../../game/componentCatalog';
import TransformComponent from '../../game/components/TransformComponent';

describe('Testing game component catalog', () => {
    test('Should duplicate an entity with game components', () => {
        const registry = new Registry();
        const entity = registry.createEntity();

        entity.addComponent(TransformComponent, { x: 100, y: 100 }, { x: 2, y: 2 });

        const entityCopy = entity.duplicate(gameComponentCatalog);

        expect(entityCopy.getComponent(TransformComponent)).toEqual(entity.getComponent(TransformComponent));

        const originalTransform = entity.getComponent(TransformComponent);
        originalTransform!.position.x = 200;
        originalTransform!.position.y = 200;

        expect(entityCopy.getComponent(TransformComponent)!.position.x).toEqual(100);
        expect(entityCopy.getComponent(TransformComponent)!.position.y).toEqual(100);
    });
});
