import AssetStore from '../asset-store/AssetStore';
import Entity from '../ecs/Entity';
import Registry from '../ecs/Registry';
import { LevelMap } from '../types/map';
import { serializeEntities, serializeLevel } from './serialization';

export const saveLevelToJson = (registry: Registry, assetStore: AssetStore): void => {
    const jsonString = JSON.stringify(serializeLevel(registry, assetStore), null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'snapshot.json';
    a.click();

    URL.revokeObjectURL(url);

    console.log('Level snapshot saved to json');
};

export const saveEntitiesToJson = (entities: Entity[]): void => {
    const jsonString = JSON.stringify(serializeEntities(entities), null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'entities.json';
    a.click();

    URL.revokeObjectURL(url);

    console.log('Entity snapshot saved to json');
};

export const saveCurrentLevelToLocalStorage = (levelId: string | null, registry: Registry, assetStore: AssetStore) => {
    if (!levelId) {
        throw new Error('Could not determine currently selected level');
    }

    const currentLevelMap = serializeLevel(registry, assetStore);
    const jsonString = JSON.stringify(currentLevelMap, null, 2);
    localStorage.setItem(levelId, jsonString);
    console.log('Level snapshot saved to local storage');
    return currentLevelMap;
};

export const saveLevelToLocalStorage = (levelId: string, levelMap: LevelMap) => {
    const jsonString = JSON.stringify(levelMap, null, 2);
    localStorage.setItem(levelId, jsonString);
    console.log('Level snapshot saved to local storage');
};

export const loadLevelFromLocalStorage = (levelId: string): LevelMap | undefined => {
    const jsonString = localStorage.getItem(levelId) as any;
    return jsonString ? (JSON.parse(jsonString) as LevelMap) : undefined;
};
