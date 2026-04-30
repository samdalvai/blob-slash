import Editor from '../Editor';
import { EditorSettings } from '../types';

const EDITOR_SETTINGS_KEY = 'editor-settings';
const LEVEL_KEY = 'level';

export const saveEditorSettingsToLocalStorage = () => {
    const settings: EditorSettings = Editor.editorSettings;
    const jsonString = JSON.stringify(settings, null, 2);
    localStorage.setItem(EDITOR_SETTINGS_KEY, jsonString);
};

export const loadEditorSettingsFromLocalStorage = (): EditorSettings | undefined => {
    const jsonString = localStorage.getItem(EDITOR_SETTINGS_KEY) as any;
    return jsonString ? (JSON.parse(jsonString) as EditorSettings) : undefined;
};

export const deleteLevelFromLocalStorage = (levelId: string) => {
    localStorage.removeItem(levelId);
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
