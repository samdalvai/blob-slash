import Editor from '../Editor';
import { EditorSettings } from '../types';

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

    return levelKeys;
};

export const getNextLevelId = (levelKeys: string[]) => {
    let availableId = 0;

    const sortedLevelKeys = levelKeys.sort((keyA, keyB) => {
        const numberPartA = keyA.replace('level-', '');
        const numberPartParsedA = parseInt(numberPartA);

        const numberPartB = keyB.replace('level-', '');
        const numberPartParsedB = parseInt(numberPartB);

        return numberPartParsedA - numberPartParsedB;
    });

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
