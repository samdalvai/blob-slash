import { ComponentMap, EntityMap, LevelMap } from '../types/map';

export const CURRENT_COORDINATE_SYSTEM_VERSION = 2;

const getComponent = (entity: EntityMap, name: string): ComponentMap | undefined =>
    entity.components.find(component => component.name === name);

const getNumber = (value: unknown, fallback = 0): number => (typeof value === 'number' ? value : fallback);

const getVector = (value: unknown, fallback = { x: 0, y: 0 }) => {
    if (!value || typeof value !== 'object') {
        return { ...fallback };
    }

    const vector = value as { x?: unknown; y?: unknown };
    return {
        x: getNumber(vector.x, fallback.x),
        y: getNumber(vector.y, fallback.y),
    };
};

const cloneComponent = (component: ComponentMap): ComponentMap => ({
    ...component,
    properties: { ...component.properties },
});

const convertLocalOffset = (offset: { x: number; y: number }) => ({
    x: offset.x,
    y: -offset.y,
});

const convertEntity = (entity: EntityMap, mapHeight: number): EntityMap => {
    const transform = getComponent(entity, 'TransformComponent');
    const sprite = getComponent(entity, 'SpriteComponent');
    const transformProperties = transform?.properties;
    const isFixed = transformProperties?.isFixed === true;
    const scale = getVector(transformProperties?.scale, { x: 1, y: 1 });
    const spriteWidth = getNumber(sprite?.properties.width) * scale.x;
    const spriteHeight = getNumber(sprite?.properties.height) * scale.y;

    if (!isFixed && (scale.x === 0 || scale.y === 0)) {
        throw new Error('Cannot migrate a world transform with a zero scale');
    }

    return {
        ...entity,
        components: entity.components.map(component => {
            const migrated = cloneComponent(component);
            const properties = migrated.properties;

            // Fixed transforms and their local offsets remain in screen space.
            if (isFixed) {
                return migrated;
            }

            switch (component.name) {
                case 'TransformComponent': {
                    const position = getVector(properties.position);
                    properties.position = {
                        x: position.x + spriteWidth / 2,
                        y: mapHeight - (position.y + spriteHeight / 2),
                    };
                    // v1 canvas rotation was clockwise; v2 world rotation is counter-clockwise.
                    properties.rotation = -getNumber(properties.rotation);
                    break;
                }
                case 'BoxColliderComponent': {
                    const offset = getVector(properties.offset);
                    const colliderWidth = getNumber(properties.width) * scale.x;
                    const colliderHeight = getNumber(properties.height) * scale.y;

                    properties.offset = {
                        x: (offset.x + colliderWidth / 2 - spriteWidth / 2) / scale.x,
                        y: (spriteHeight / 2 - offset.y - colliderHeight / 2) / scale.y,
                    };
                    break;
                }
                case 'RigidBodyComponent': {
                    properties.velocity = convertLocalOffset(getVector(properties.velocity));
                    properties.direction = convertLocalOffset(getVector(properties.direction));
                    break;
                }
                case 'EntityDestinationComponent':
                    properties.destinationY = mapHeight - getNumber(properties.destinationY);
                    break;
                case 'ParticleEmitComponent':
                    properties.offsetY = -getNumber(properties.offsetY);
                    properties.particleVelocity = convertLocalOffset(getVector(properties.particleVelocity));
                    break;
                case 'ShadowComponent':
                case 'HighlightComponent':
                    properties.offsetY = -getNumber(properties.offsetY);
                    break;
                case 'TextLabelComponent':
                    properties.offset = convertLocalOffset(getVector(properties.offset));
                    break;
                case 'ScriptComponent':
                    if (Array.isArray(properties.scripts)) {
                        properties.scripts = properties.scripts.map(script => {
                            if (!script || typeof script !== 'object') {
                                return script;
                            }

                            const action = script as Record<string, unknown>;
                            return {
                                ...action,
                                ...(action.movement
                                    ? { movement: convertLocalOffset(getVector(action.movement)) }
                                    : {}),
                            };
                        });
                    }
                    break;
            }

            return migrated;
        }),
    };
};

/**
 * Converts a serialized level to the current centre-anchored Y-up model.
 * v1 maps are copied and converted; v2 maps are returned unchanged so the
 * operation is idempotent.
 */
export const migrateLevelMapToCurrentCoordinates = (level: LevelMap): LevelMap => {
    const version = level.coordinateSystemVersion ?? 1;

    if (!Number.isInteger(version) || version < 1) {
        throw new Error(`Invalid coordinate-system version: ${version}`);
    }

    if (version > CURRENT_COORDINATE_SYSTEM_VERSION) {
        throw new Error(
            `Unsupported coordinate-system version ${version}; this engine supports up to ${CURRENT_COORDINATE_SYSTEM_VERSION}`,
        );
    }

    if (version === CURRENT_COORDINATE_SYSTEM_VERSION) {
        return level;
    }

    return {
        ...level,
        coordinateSystemVersion: CURRENT_COORDINATE_SYSTEM_VERSION,
        textures: level.textures.map(texture => ({ ...texture })),
        sounds: level.sounds.map(sound => ({ ...sound })),
        entities: level.entities.map(entity => convertEntity(entity, level.mapHeight)),
    };
};

/**
 * Converts standalone legacy entity maps using the height of their source
 * level. Entity-map files do not contain map metadata, so callers must supply
 * that height explicitly.
 */
export const migrateEntityMapsToCurrentCoordinates = (entities: EntityMap[], sourceMapHeight: number): EntityMap[] => {
    if (!Number.isFinite(sourceMapHeight) || sourceMapHeight < 0) {
        throw new Error(`Invalid source map height: ${sourceMapHeight}`);
    }

    return entities.map(entity => convertEntity(entity, sourceMapHeight));
};
