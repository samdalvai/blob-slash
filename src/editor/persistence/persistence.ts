import Editor from '../Editor';
import { EditorSettings } from '../types';

export const saveEditorSettingsToLocalStorage = () => {
    const settings: EditorSettings = Editor.editorSettings;
    const jsonString = JSON.stringify(settings, null, 2);
    localStorage.setItem('editor-settings', jsonString);
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
