import { version } from 'process';

import { LevelMap } from '../../engine/types/map';
import Editor from '../Editor';
import { EditorSettings, LevelHistory, LevelVersion } from '../types';

const HISTORY_KEY = 'history';
const EDITOR_SETTINGS_KEY = 'editor-settings';
const LEVEL_KEY = 'level';

export const saveEditorSettingsToLocalStorage = () => {
    const settings: EditorSettings = Editor.editorSettings;
    const jsonString = JSON.stringify(settings, null, 2);
    localStorage.setItem(EDITOR_SETTINGS_KEY, jsonString);
};

export const deleteLevelInLocalStorage = (levelId: string) => {
    localStorage.removeItem(levelId);
};

export const loadEditorSettingsFromLocalStorage = (): EditorSettings | undefined => {
    const jsonString = localStorage.getItem(EDITOR_SETTINGS_KEY) as any;
    return jsonString ? (JSON.parse(jsonString) as EditorSettings) : undefined;
};

export const getAllLevelKeysFromLocalStorage = () => {
    const levelKeys: string[] = [];

    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);

        if (key && key.startsWith(LEVEL_KEY)) {
            levelKeys.push(key);
        }
    }

    return sortLevelKeys(levelKeys);
};

export const getNextLevelId = (levelKeys: string[]) => {
    let availableId = 0;

    const sortedLevelKeys = sortLevelKeys(levelKeys);

    for (const key of sortedLevelKeys) {
        const numberPart = key.replace(LEVEL_KEY + '-', '');
        const numberPartParsed = parseInt(numberPart);

        if (numberPartParsed !== availableId) {
            break;
        }

        availableId++;
    }

    return LEVEL_KEY + '-' + availableId;
};

export const sortLevelKeys = (levelKeys: string[]) => {
    const sortedKeys = levelKeys.sort((keyA, keyB) => {
        const numberPartA = keyA.replace(LEVEL_KEY + '-', '');
        const numberPartParsedA = parseInt(numberPartA);

        const numberPartB = keyB.replace(LEVEL_KEY + '-', '');
        const numberPartParsedB = parseInt(numberPartB);

        return numberPartParsedA - numberPartParsedB;
    });

    return sortedKeys;
};

export const getLevelVersions = (levelId: string) => {
    const jsonString = localStorage.getItem(HISTORY_KEY);

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

// TODO: use a diffing mechanism to reduce space occupied
// or use an in memory history system
export const saveLevelVersionToLocalStorage = (levelId: string, levelMap: LevelMap) => {
    const jsonString = localStorage.getItem(HISTORY_KEY);

    if (!jsonString) {
        const newLevelVersions: LevelVersion[] = [];
        newLevelVersions.push({
            date: new Date().toISOString(),
            snapShot: levelMap,
            current: true,
        });

        const levelHistory: LevelHistory = {};
        levelHistory[levelId] = newLevelVersions;
        localStorage.setItem(HISTORY_KEY, JSON.stringify(levelHistory, null, 2));
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
        localStorage.setItem(HISTORY_KEY, JSON.stringify(levelHistory, null, 2));
        return;
    }

    
    if (
        currentLevelVersions.length === 0 ||
        JSON.stringify(currentLevelVersions[currentLevelVersions.length - 1].snapShot) !== JSON.stringify(levelMap)
    ) {
        currentLevelVersions.forEach(version => (version.current = false));
        currentLevelVersions.push({
            date: new Date().toISOString(),
            snapShot: levelMap,
            current: true,
        });
    }

    if (currentLevelVersions.length > 20) {
        currentLevelVersions.shift();
    }

    localStorage.setItem(HISTORY_KEY, JSON.stringify(levelHistory, null, 2));
    // console.log(JSON.stringify(localStorage).length / 1024, 'KB');
};

export const saveLevelVersionsToLocalStorage = (levelId: string, levelVersions: LevelVersion[]) => {
    const jsonString = localStorage.getItem(HISTORY_KEY);

    if (jsonString) {
        const levelHistory = JSON.parse(jsonString) as LevelHistory;
        levelHistory[levelId] = levelVersions;

        localStorage.setItem(HISTORY_KEY, JSON.stringify(levelHistory, null, 2));
    }

    // console.log(JSON.stringify(localStorage).length / 1024, 'KB');
};
