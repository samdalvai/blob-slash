import { describe, expect, test } from '@jest/globals';

import {
    CURRENT_COORDINATE_SYSTEM_VERSION,
    migrateEntityMapsToCurrentCoordinates,
    migrateLevelMapToCurrentCoordinates,
} from '../../../engine/serialization/levelCoordinateMigration';
import { legacyLevelMapFixture } from '../../../test-fixtures/legacyLevelMap';

const findComponent = (entityIndex: number, name: string) => {
    const component = legacyLevelMapFixture.entities[entityIndex].components.find(candidate => candidate.name === name);

    if (!component) {
        throw new Error(`Fixture component ${name} is missing`);
    }

    return component;
};

describe('level coordinate migration', () => {
    test('converts an unversioned v1 level to centre-anchored Y-up coordinates without mutating it', () => {
        const migrated = migrateLevelMapToCurrentCoordinates(legacyLevelMapFixture);
        const entity = migrated.entities[0];
        const component = (name: string) => {
            const found = entity.components.find(candidate => candidate.name === name);
            if (!found) throw new Error(`Migrated component ${name} is missing`);
            return found;
        };

        expect(migrated).not.toBe(legacyLevelMapFixture);
        expect(migrated.coordinateSystemVersion).toBe(CURRENT_COORDINATE_SYSTEM_VERSION);
        expect(component('TransformComponent').properties).toMatchObject({
            position: { x: 132, y: 384 },
            scale: { x: 2, y: 1.5 },
            rotation: -30,
        });
        expect(component('BoxColliderComponent').properties.offset).toEqual({ x: -3.5, y: 22 / 3 });
        expect(component('RigidBodyComponent').properties).toMatchObject({
            velocity: { x: 12, y: 8 },
            direction: { x: -1, y: -1 },
        });
        expect(component('EntityDestinationComponent').properties).toMatchObject({ destinationX: 400, destinationY: 180 });
        expect(component('ParticleEmitComponent').properties).toMatchObject({
            offsetX: 6,
            offsetY: -9,
            particleVelocity: { x: 3, y: 5 },
        });
        expect(component('ShadowComponent').properties).toMatchObject({ offsetX: 2, offsetY: -10 });
        expect(component('HighlightComponent').properties).toMatchObject({ offsetX: 1, offsetY: -11 });
        expect(component('TextLabelComponent').properties.offset).toEqual({ x: 4, y: 6 });
        expect(component('ScriptComponent').properties.scripts).toEqual([{ movement: { x: 7, y: 3 }, duration: 250 }]);

        expect(findComponent(0, 'TransformComponent').properties).toMatchObject({
            position: { x: 100, y: 60 },
            rotation: 30,
        });
    });

    test('keeps fixed screen-space transforms and offsets unchanged', () => {
        const migrated = migrateLevelMapToCurrentCoordinates(legacyLevelMapFixture);
        const fixedEntity = migrated.entities[1];

        expect(fixedEntity.components.find(component => component.name === 'TransformComponent')?.properties).toMatchObject({
            position: { x: 24, y: 32 },
            rotation: 0,
            isFixed: true,
        });
        expect(fixedEntity.components.find(component => component.name === 'TextLabelComponent')?.properties.offset).toEqual({
            x: 0,
            y: 0,
        });
    });

    test('does not transform a v2 level twice', () => {
        const migrated = migrateLevelMapToCurrentCoordinates(legacyLevelMapFixture);

        expect(migrateLevelMapToCurrentCoordinates(migrated)).toBe(migrated);
    });

    test('converts standalone entity maps with an explicit source map height', () => {
        const migratedEntities = migrateEntityMapsToCurrentCoordinates(legacyLevelMapFixture.entities, 480);
        const transform = migratedEntities[0].components.find(component => component.name === 'TransformComponent');

        expect(transform?.properties.position).toEqual({ x: 132, y: 384 });
        expect(legacyLevelMapFixture.entities[0].components.find(component => component.name === 'TransformComponent')?.properties.position).toEqual({
            x: 100,
            y: 60,
        });
    });

    test('rejects an unknown future coordinate-system version', () => {
        expect(() =>
            migrateLevelMapToCurrentCoordinates({ ...legacyLevelMapFixture, coordinateSystemVersion: 3 }),
        ).toThrow('Unsupported coordinate-system version 3');
    });
});
