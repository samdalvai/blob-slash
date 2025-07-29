import { LevelMap } from '../../engine/types/map';
import Editor from '../Editor';
import { EditorSettings, LevelHistory, LevelVersion } from '../types';

export const saveEditorSettingsToLocalStorage = () => {
    const settings: EditorSettings = Editor.editorSettings;
    const jsonString = JSON.stringify(settings, null, 2);
    localStorage.setItem('editor-settings', jsonString);
};

export const deleteLevelInLocalStorage = (levelId: string) => {
    localStorage.removeItem(levelId);
};

export const loadEditorSettingsFromLocalStorage = (): EditorSettings | undefined => {
    const jsonString = localStorage.getItem('editor-settings') as any;
    return jsonString ? (JSON.parse(jsonString) as EditorSettings) : undefined;
};

export const getAllLevelKeysFromLocalStorage = () => {
    const levelKeys: string[] = [];

    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);

        if (key && key.startsWith('level')) {
            levelKeys.push(key);
        }
    }

    return sortLevelKeys(levelKeys);
};

export const getNextLevelId = (levelKeys: string[]) => {
    let availableId = 0;

    const sortedLevelKeys = sortLevelKeys(levelKeys);

    for (const key of sortedLevelKeys) {
        const numberPart = key.replace('level-', '');
        const numberPartParsed = parseInt(numberPart);

        if (numberPartParsed !== availableId) {
            break;
        }

        availableId++;
    }

    return 'level-' + availableId;
};

export const sortLevelKeys = (levelKeys: string[]) => {
    const sortedKeys = levelKeys.sort((keyA, keyB) => {
        const numberPartA = keyA.replace('level-', '');
        const numberPartParsedA = parseInt(numberPartA);

        const numberPartB = keyB.replace('level-', '');
        const numberPartParsedB = parseInt(numberPartB);

        return numberPartParsedA - numberPartParsedB;
    });

    return sortedKeys;
};

export const getLevelVersions = (levelId: string) => {
    const jsonString = localStorage.getItem('history');

    if (!jsonString) {
        return null;
    }

    const levelHistory = JSON.parse(jsonString) as LevelHistory;
    const currentLevelVersions = levelHistory[levelId];

    if (!currentLevelVersions) {
        return null;
    }

    return currentLevelVersions;
};

export const saveLevelVersionToLocalStorage = (levelId: string, levelMap: LevelMap) => {
    const jsonString = localStorage.getItem('history');

    if (!jsonString) {
        const newLevelVersions: LevelVersion[] = [];
        newLevelVersions.push({
            date: new Date().toISOString(),
            snapShot: levelMap,
            current: true,
        });

        const levelHistory: LevelHistory = {};
        levelHistory[levelId] = newLevelVersions;
        localStorage.setItem('history', JSON.stringify(levelHistory, null, 2));
        return;
    }

    const levelHistory = JSON.parse(jsonString) as LevelHistory;
    const currentLevelVersions = levelHistory[levelId];

    if (!currentLevelVersions) {
        const newLevelVersions: LevelVersion[] = [];
        newLevelVersions.push({
            date: new Date().toISOString(),
            snapShot: levelMap,
            current: true,
        });
        levelHistory[levelId] = newLevelVersions;
        localStorage.setItem('history', JSON.stringify(levelHistory, null, 2));
        return;
    }

    currentLevelVersions.forEach(version => (version.current = false));
    currentLevelVersions.push({
        date: new Date().toISOString(),
        snapShot: levelMap,
        current: true,
    });

    if (currentLevelVersions.length > 20) {
        currentLevelVersions.shift();
    }

    localStorage.setItem('history', JSON.stringify(levelHistory, null, 2));
};

export const saveLevelVersionsToLocalStorage = (levelId: string, levelVersions: LevelVersion[]) => {
    const jsonString = localStorage.getItem('history');

    if (jsonString) {
        const levelHistory = JSON.parse(jsonString) as LevelHistory;
        levelHistory[levelId] = levelVersions;

        localStorage.setItem('history', JSON.stringify(levelHistory, null, 2));
    }
};
