import { afterEach, beforeEach, describe, expect, test } from '@jest/globals';

import Engine from '../../../engine/Engine';
import Registry from '../../../engine/ecs/Registry';
import Editor from '../../../editor/Editor';
import EntityEditor from '../../../editor/entity-editor/EntityEditor';
import EntityDragSystem from '../../../editor/systems/EntityDragSystem';
import SpriteComponent from '../../../game/components/SpriteComponent';
import TransformComponent from '../../../game/components/TransformComponent';

describe('EntityDragSystem grid snapping', () => {
    const originalDocument = globalThis.document;

    beforeEach(() => {
        Object.defineProperty(globalThis, 'document', {
            configurable: true,
            value: { getElementById: () => null },
        });

        Editor.editorSettings.snapToGrid = true;
        Editor.editorSettings.gridSquareSide = 32;
        Editor.entityDragStart = null;
        Editor.selectedEntities = [];
    });

    afterEach(() => {
        Object.defineProperty(globalThis, 'document', {
            configurable: true,
            value: originalDocument,
        });

        Editor.editorSettings.snapToGrid = false;
        Editor.editorSettings.gridSquareSide = 64;
        Editor.entityDragStart = null;
        Editor.selectedEntities = [];
    });

    test('snaps a scaled entity by the point where the drag started', () => {
        const registry = new Registry();
        const entity = registry.createEntity();
        entity.addComponent(TransformComponent, { x: 64, y: 96 }, { x: 2, y: 2 });
        entity.addComponent(SpriteComponent, 'sprite', 32, 32);

        Editor.selectedEntities = [entity];
        Editor.entityDragStart = { x: 64, y: 96 };
        Engine.mousePositionWorld = { x: 64, y: 96 };

        const system = new EntityDragSystem();
        system.onMouseMove({} as EntityEditor);
        expect(entity.getComponent(TransformComponent)?.position).toEqual({ x: 64, y: 96 });

        Engine.mousePositionWorld = { x: 96, y: 128 };
        system.onMouseMove({} as EntityEditor);
        expect(entity.getComponent(TransformComponent)?.position).toEqual({ x: 96, y: 128 });
    });

    test('keeps the grabbed point and relative entity positions when dragging a group', () => {
        const registry = new Registry();
        const firstEntity = registry.createEntity();
        firstEntity.addComponent(TransformComponent, { x: 48, y: 64 });
        firstEntity.addComponent(SpriteComponent, 'first-sprite', 32, 64);

        const grabbedEntity = registry.createEntity();
        grabbedEntity.addComponent(TransformComponent, { x: 120, y: 96 });
        grabbedEntity.addComponent(SpriteComponent, 'grabbed-sprite', 64, 32);

        Editor.selectedEntities = [firstEntity, grabbedEntity];
        Editor.entityDragStart = { x: 120, y: 96 };
        Engine.mousePositionWorld = { x: 120, y: 96 };

        const system = new EntityDragSystem();
        system.onMouseMove({} as EntityEditor);

        expect(firstEntity.getComponent(TransformComponent)?.position).toEqual({ x: 48, y: 64 });
        expect(grabbedEntity.getComponent(TransformComponent)?.position).toEqual({ x: 120, y: 96 });

        Engine.mousePositionWorld = { x: 152, y: 128 };
        system.onMouseMove({} as EntityEditor);

        expect(firstEntity.getComponent(TransformComponent)?.position).toEqual({ x: 80, y: 96 });
        expect(grabbedEntity.getComponent(TransformComponent)?.position).toEqual({ x: 152, y: 128 });
    });
});
