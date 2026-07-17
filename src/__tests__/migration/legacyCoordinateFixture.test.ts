import { describe, expect, test } from '@jest/globals';

import { ComponentMap } from '../../engine/types/map';
import { isValidLevelMap } from '../../engine/utils/validation';
import { legacyLevelMapFixture } from '../../test-fixtures/legacyLevelMap';

const findComponent = (name: string): ComponentMap => {
    const component = legacyLevelMapFixture.entities[0].components.find(candidate => candidate.name === name);

    if (!component) {
        throw new Error(`Fixture component ${name} is missing`);
    }

    return component;
};

describe('legacy coordinate-system level fixture', () => {
    test('is a valid unversioned v1 level map', () => {
        expect(isValidLevelMap(legacyLevelMapFixture)).toBe(true);
        expect('coordinateSystemVersion' in legacyLevelMapFixture).toBe(false);
    });

    test('covers every serialized vector and offset that the v1-to-v2 migration must convert', () => {
        expect(findComponent('TransformComponent').properties).toMatchObject({
            position: { x: 100, y: 60 },
            scale: { x: 2, y: 1.5 },
            rotation: 30,
        });
        expect(findComponent('BoxColliderComponent').properties).toMatchObject({ offset: { x: 5, y: 7 } });
        expect(findComponent('RigidBodyComponent').properties).toMatchObject({
            velocity: { x: 12, y: -8 },
            direction: { x: -1, y: 1 },
        });
        expect(findComponent('EntityDestinationComponent').properties).toMatchObject({
            destinationX: 400,
            destinationY: 300,
        });
        expect(findComponent('ParticleEmitComponent').properties).toMatchObject({
            offsetX: 6,
            offsetY: 9,
            particleVelocity: { x: 3, y: -5 },
        });
        expect(findComponent('ShadowComponent').properties).toMatchObject({ offsetX: 2, offsetY: 10 });
        expect(findComponent('HighlightComponent').properties).toMatchObject({ offsetX: 1, offsetY: 11 });
        expect(findComponent('TextLabelComponent').properties).toMatchObject({ offset: { x: 4, y: -6 } });
        expect(findComponent('LightEmitComponent').properties).toMatchObject({ lightRadius: 40 });
        expect(findComponent('ScriptComponent').properties).toMatchObject({
            scripts: [{ movement: { x: 7, y: -3 } }],
        });
    });
});
