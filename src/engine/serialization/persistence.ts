import AssetStore from '../asset-store/AssetStore';
import Registry from '../ecs/Registry';
import { LevelMap } from '../types/map';
import { serializeLevel } from './serialization';

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

export const saveLevelToLocalStorage = (levelId: string, registry: Registry, assetStore: AssetStore) => {
    const jsonString = JSON.stringify(serializeLevel(registry, assetStore), null, 2);
    localStorage.setItem(levelId, jsonString);
    console.log('Level snapshot saved to local storage');
};

export const loadLevelFromLocalStorage = (levelId: string): LevelMap | undefined => {
    const jsonString = localStorage.getItem(levelId) as any;
    return jsonString ? (JSON.parse(jsonString) as LevelMap) : undefined;
};
