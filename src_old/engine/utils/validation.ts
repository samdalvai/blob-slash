import { EntityMap, LevelMap } from '../types/map';

export const isValidLevelMap = (obj: any): obj is LevelMap => {
    return (
        typeof obj === 'object' &&
        obj !== null &&
        obj.textures !== undefined &&
        obj.sounds !== undefined &&
        obj.mapWidth !== undefined &&
        typeof obj.mapWidth === 'number' &&
        obj.mapHeight !== undefined &&
        typeof obj.mapHeight === 'number' &&
        obj.entities !== undefined
    );
};

export const isValidEntityMap = (obj: any): obj is EntityMap => {
    return typeof obj === 'object' && obj.components !== null && typeof obj.components === 'object';
};
