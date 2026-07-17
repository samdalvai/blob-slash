import { LevelMap } from '../engine/types/map';

/**
 * A coordinate-system version 1 level used to verify the later v1-to-v2
 * migration. Its values intentionally use the current top-left/Y-down model.
 */
export const legacyLevelMapFixture: LevelMap = {
    textures: [{ assetId: 'fixture-sprite', filePath: 'assets/sprites/default.png' }],
    sounds: [],
    mapWidth: 640,
    mapHeight: 480,
    entities: [
        {
            tag: 'fixture-entity',
            components: [
                {
                    name: 'SpriteComponent',
                    properties: {
                        assetId: 'fixture-sprite',
                        width: 32,
                        height: 48,
                        zIndex: 1,
                        row: 0,
                        column: 0,
                        flip: 0,
                        transparency: 1,
                    },
                },
                {
                    name: 'TransformComponent',
                    properties: {
                        position: { x: 100, y: 60 },
                        scale: { x: 2, y: 1.5 },
                        rotation: 30,
                        isFixed: false,
                    },
                },
                {
                    name: 'BoxColliderComponent',
                    properties: { width: 20, height: 24, offset: { x: 5, y: 7 } },
                },
                {
                    name: 'RigidBodyComponent',
                    properties: { velocity: { x: 12, y: -8 }, direction: { x: -1, y: 1 } },
                },
                {
                    name: 'EntityDestinationComponent',
                    properties: { destinationX: 400, destinationY: 300, velocity: 120 },
                },
                {
                    name: 'ParticleEmitComponent',
                    properties: {
                        dimension: 4,
                        duration: 500,
                        color: 'orange',
                        emitFrequency: 100,
                        emitRadius: 12,
                        offsetX: 6,
                        offsetY: 9,
                        particleVelocity: { x: 3, y: -5 },
                    },
                },
                {
                    name: 'ShadowComponent',
                    properties: { width: 20, height: 8, offsetX: 2, offsetY: 10 },
                },
                {
                    name: 'HighlightComponent',
                    properties: { width: 28, height: 12, offsetX: 1, offsetY: 11 },
                },
                {
                    name: 'TextLabelComponent',
                    properties: {
                        offset: { x: 4, y: -6 },
                        text: 'fixture',
                        color: { r: 255, g: 255, b: 255 },
                        fontSize: 14,
                        fontFamily: 'Arial',
                    },
                },
                {
                    name: 'LightEmitComponent',
                    properties: { lightRadius: 40 },
                },
                {
                    name: 'ScriptComponent',
                    properties: { scripts: [{ movement: { x: 7, y: -3 }, duration: 250 }] },
                },
            ],
        },
        {
            tag: 'fixed-fixture',
            components: [
                {
                    name: 'TransformComponent',
                    properties: {
                        position: { x: 24, y: 32 },
                        scale: { x: 1, y: 1 },
                        rotation: 0,
                        isFixed: true,
                    },
                },
                {
                    name: 'TextLabelComponent',
                    properties: {
                        offset: { x: 0, y: 0 },
                        text: 'UI fixture',
                        color: { r: 0, g: 0, b: 0 },
                        fontSize: 12,
                        fontFamily: 'Arial',
                    },
                },
            ],
        },
    ],
};
